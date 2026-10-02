const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const manifest=require('../src/department-documents.json'),site=require('../src/data.json'),profiles=require('../src/proposal-links.cjs'),nav=require('../src/navigation.cjs');
const publication=require('../src/document-publication.cjs'),{execFileSync}=require('node:child_process');
const tracked=new Set(execFileSync('git',['ls-files','--','public/downloads/departments'],{encoding:'utf8'}).trim().split(/\r?\n/));
let checks=0;const check=(value,message)=>{assert(value,message);checks++};
function archive(buffer){
 let end=-1;for(let i=buffer.length-22;i>=Math.max(0,buffer.length-65557);i--)if(buffer.readUInt32LE(i)===0x06054b50){end=i;break}
 check(end>=0,'ZIP 종료 레코드');check(buffer.readUInt16LE(end+4)===0&&buffer.readUInt16LE(end+6)===0,'단일 ZIP 디스크');
 const n=buffer.readUInt16LE(end+10),files=new Map();let p=buffer.readUInt32LE(end+16);
 for(let i=0;i<n;i++){
  check(buffer.readUInt32LE(p)===0x02014b50,'ZIP 중앙 디렉터리');const flags=buffer.readUInt16LE(p+8),method=buffer.readUInt16LE(p+10),size=buffer.readUInt32LE(p+20),rawSize=buffer.readUInt32LE(p+24),nl=buffer.readUInt16LE(p+28),el=buffer.readUInt16LE(p+30),cl=buffer.readUInt16LE(p+32),offset=buffer.readUInt32LE(p+42),name=buffer.subarray(p+46,p+46+nl).toString('utf8');
  check(!(flags&1)&&[0,8].includes(method),'암호화 없는 HWPX ZIP');check(!name.includes('..')&&!name.startsWith('/'),'압축 경로 안전');check(!files.has(name),'ZIP 중복 항목 없음');
  check(buffer.readUInt32LE(offset)===0x04034b50,'ZIP 로컬 헤더');const start=offset+30+buffer.readUInt16LE(offset+26)+buffer.readUInt16LE(offset+28);check(start+size<=buffer.length,'ZIP 데이터 경계');
  files.set(name,()=>{const data=buffer.subarray(start,start+size),raw=method===8?zlib.inflateRawSync(data):data;check(raw.length===rawSize,'ZIP 해제 길이 일치');return raw});p+=46+nl+el+cl;
 }
 return files;
}
const local=/(?<![A-Za-z0-9])[A-Za-z]:[\\/]|file:\/\/\/|OneDrive[\\/]/i;
const secrets=/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|gh[pousr]_[A-Za-z0-9]{30,}|(?:sk-proj-|sk-live-)[A-Za-z0-9_-]{20,}/;
check(manifest.departments.length===39,'공개 대상 39처');check(new Set(manifest.departments.map(d=>d.code)).size===39,'처 코드 중복 없음');
check(manifest.departments.reduce((n,d)=>n+d.documents.length,0)===117,'한글 117개');
const paths=[];let bytes=0,redactions=0,parts=0;
for(const d of manifest.departments){
 check(d.name&&d.proposalRoute,'처별 이름·제안 링크');check(fs.existsSync(path.join('dist',d.proposalRoute.split(/[?#]/)[0])),'처별 제안 경로 '+d.code);
 if(d.code.startsWith('EX')){
  check(d.profileIds.length>0,'추가처 카드 연결 '+d.code);for(const id of d.profileIds)check(profiles.profileById[id]?.name===d.name,'동일 처 카드 '+id);
 }else check(site.departments.some(s=>s.code===d.code&&s.name===d.name),'기존 처 연결 '+d.code);
 check(d.documents.map(f=>f.kind).join(',')==='plan,cost,diagrams','처별 문서 3종 '+d.code);
 check(d.history?.length===1&&d.history[0].kind==='plan'&&d.history[0].version==='v0.4_r01','이전 계획서 보존 '+d.code);
 for(const f of [...d.documents,...d.history]){
  check(tracked.has('public/'+f.path),'Git에 포함된 한글파일 '+f.path);
  check(publication.fileUrl(f)==='https://heen1987-ops.github.io/TS-business-Plan-001/'+f.path,'공개 Pages 파일 경로');
  check(publication.sourceUrl(f)==='https://github.com/heen1987-ops/TS-business-Plan-001/blob/main/public/'+f.path,'GitHub 실제 파일 경로');
  check(publication.rawUrl(f)==='https://github.com/heen1987-ops/TS-business-Plan-001/raw/refs/heads/main/public/'+f.path,'GitHub 직접 다운로드 경로');
  check(f.path.startsWith('downloads/departments/'+d.code+'/')&&!f.path.includes('..'),'다운로드 경로 '+d.code);paths.push(f.path);check(f.path.endsWith('.hwpx')&&f.nativeFormat==='HWPX','한글 형식');
  check(f.version===(d.history.includes(f)?'v0.4_r01':f.kind==='plan'?'v0.5_r01':'v0.3_r01'),'판본 정직한 구분 '+d.code);
  check(f.status.includes(f.kind==='plan'?'초안':'참조본'),'문서 상태 표기');check(f.kind==='plan'||f.status.includes('미확정')||f.status.includes('최신 기술 상세'),'v0.3 범위 한계');
  const source=fs.readFileSync(path.join('public',f.path)),deployed=fs.readFileSync(path.join('dist',f.path));check(source.equals(deployed),'빌드에서 원문 바이트 보존');
  check(source.length===f.bytes,'다운로드 크기');check(crypto.createHash('sha256').update(source).digest('hex')===f.sha256,'게시본 SHA '+d.code+'/'+f.kind);check(f.bytes<100*1024*1024,'일반 Git 단일파일 한도');
  const files=archive(source);check(files.get('mimetype')?.().toString()==='application/hwp+zip','HWPX MIME');check(files.has('Contents/section0.xml')&&files.has('Contents/content.hpf'),'한글 본문·패키지');
  const body=files.get('Contents/section0.xml')().toString('utf8');check(body.includes(d.name),'본문 처명');check(body.includes(f.version.split('_')[0]),'본문 버전');
  if(f.version==='v0.5_r01'){
   for(const text of ['2027년','차분 총사업비 미산정','목표 수치 미확정','신규 인프라 구매 0원'])check(body.includes(text),'v0.5 범위·측정·대가 '+d.code+'/'+text);
   const current=require('../src/analysis-review.cjs').departments[d.code];if(current)check(body.includes(current.purpose)&&body.includes(current.status),'웹 최신 판단과 한글 본문 일치 '+d.code);
   if(d.code==='MR')check(body.includes(require('../src/analysis-review.cjs').drt.purpose),'DRT 독립 사업 식별 매핑');
  }
  if(f.kind==='plan')for(const project of d.projects)check(body.includes(project.title),'정보화사업계획서의 기획항목 제목 매핑 '+project.id);
  check([...files.keys()].filter(n=>n.startsWith('BinData/')).length===f.embeddedImages,'내장 그림 개수');
  for(const[name,read]of files)if(/\.(xml|hpf|txt)$/.test(name)){const text=read().toString('utf8');check(!local.test(text),'개인 경로 없음 '+d.code+'/'+name);check(!secrets.test(text),'비밀키 패턴 없음 '+d.code+'/'+name);parts++}
  bytes+=f.bytes;redactions+=f.pathRedactions;
 }
}
check(new Set(paths).size===156,'현재 117개·이전 계획서 39개 고유 경로');
check(fs.readdirSync('public/downloads/departments',{recursive:true}).filter(p=>p.endsWith('.hwpx')).length===156,'현재·이전판 외 미등록 파일 없음');
check(nav.locate('planning-documents.html')?.id==='planning-documents','자료실·검색·현재 위치 연결');
for(const f of ['src/Revision47.jsx','src/ProposalLinks.jsx'])check(fs.readFileSync(f,'utf8').includes('<DepartmentDocuments'),'실제 처별 렌더러 연결');
check(!local.test(JSON.stringify(manifest)),'공개 원장 개인 경로 없음');check(!secrets.test(JSON.stringify(manifest)),'공개 원장 비밀키 없음');
check(manifest.limitations.some(t=>t.includes('미확정')),'대가 미확정 한계 보존');
check(fs.readFileSync('docs/HWPX_DOWNLOADS.md','utf8')===require('./native-document-index.cjs')(),'GitHub 한글 목록과 정본 일치');
check(fs.readFileSync('README.md','utf8').includes('(docs/HWPX_DOWNLOADS.md)'),'저장소 첫 화면에서 한글 목록 연결');
const review=fs.readFileSync('src/AnalysisReview.jsx','utf8');
check(review.includes('<DepartmentDownloadLinks code={r.code}/>')&&review.includes('data-planning-download-entry'),'검토서에서 처별 한글과 전체 목록 연결');
check(fs.readFileSync('src/DepartmentDocuments.jsx','utf8').includes('<DocumentSourceLinks file={f}/>'),'파일별 GitHub 원본 연결');
console.log(JSON.stringify({result:'통과',checks,departments:39,currentFiles:117,historyFiles:39,files:156,bytes,redactions,textParts:parts}));
