const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const d=require('../src/proposal-e2e-diagrams.cjs'),m=require('../src/proposal-diagram-assets.json'),intent=require('../src/proposal-intent.cjs');
const copy=require('../src/diagram-copy-corrections.json');
let checks=0;function check(ok,label){checks++;assert(ok,label)}
check(d.projects.length===42,'42개 현재 조사 과제');check(m.assets.length===168,'과제별 4종 원본 이미지 168개');
check(copy.assets.length===4&&copy.project==='MR-01','한글 교정 4종 범위 고정');
check(copy.font==='Malgun Gothic'&&copy.method.includes('SVG'),'정확한 한글 글꼴·텍스트 레이어');
for(const c of copy.assets){const a=m.assets.find(a=>a.id===copy.project&&a.type===c.type);check(((a?.path===c.corrected&&a.revision===2)||(a?.platformCorrectionPath===c.corrected&&a.revision===3)),'교정본 연결·캐시 구분 '+c.type);check(a.originalPath===c.original&&a.originalSha256===c.originalSha256,'이전 이미지 보존 이력 '+c.type);check(a.correctionDate===copy.date&&a.correctionMethod===copy.method,'교정 방법·시점 '+c.type);const original=fs.readFileSync('public/'+c.original);check(crypto.createHash('sha256').update(original).digest('hex')===c.originalSha256,'교정 이전 바이트 보존 '+c.type);check(a.sha256!==c.originalSha256,'기존 오류본 재연결 방지 '+c.type);for(const label of c.labels){check(label.text.includes('플랫폼')&&!/플랫픔|플랫품|플렛폼|플랬폼/.test(label.text),'교정 라벨 정확한 플랫폼 표기 '+c.type+'/'+label.key);check(label.box.length===4&&label.box.every(v=>Number.isInteger(v)&&v>=0)&&label.box[0]+label.box[2]<=1672&&label.box[1]+label.box[3]<=941,'교정 영역·슬라이드 치수 '+c.type+'/'+label.key);}}
const hashes=new Set(),keys=new Set();
for(const p of d.projects){
 check(p.e2e.length===9,p.id+' E2E 9단계');check(p.inputs===intent.byId[p.id].inputs,p.id+' 최신 입력자료 참조');
 check(p.completion===intent.byId[p.id].completion,p.id+' 공식 완료 조건');
 const ids=p.overall.nodes.map(n=>n.id);check(ids.length===14&&new Set(ids).size===14,p.id+' 고유 node');
 check(['platform','noa','knowledge','grantee','task','model','human','official','reconcile'].every(id=>ids.includes(id)),p.id+' 제품·판단·결과 노드');
 check(p.overall.edges.length>=20&&p.overall.edges.every(e=>ids.includes(e.from)&&ids.includes(e.to)&&e.label),p.id+' 연결 참조 무결성');
 for(const target of ['knowledge','grantee','tool','task','model','log'])check(p.overall.edges.some(e=>e.from==='noa'&&e.to===target)&&p.overall.edges.some(e=>e.from===target&&e.to==='noa'),p.id+' NOA 요청·반환 '+target);
 check(!p.overall.edges.some(e=>['noa','grantee','tool','task'].includes(e.from)&&e.to==='official'),p.id+' 공식 판단 우회 금지');
 check(p.e2e[3].join(' ').includes('Grantee')&&p.e2e[4].join(' ').includes('전문'),p.id+' 대사·전문계산 분리');
 check(p.key&&p.privacy&&p.exception&&p.precondition&&p.authority,p.id+' 자료·권한·예외·선행조건');
 for(const type of d.types){const a=m.assets.find(a=>a.id===p.id&&a.type===type);check(a,p.id+'/'+type+' 자산');
  const key=a.id+'/'+a.type;check(!keys.has(key),'과제·유형 중복 '+key);keys.add(key);
  check(!/file:|localhost|[A-Z]:[\\/]/i.test(a.path),'공개 asset PC 주소 금지 '+key);
  const bytes=fs.readFileSync('public/'+a.path),sha=crypto.createHash('sha256').update(bytes).digest('hex');
  check(bytes.subarray(0,8).toString('hex')==='89504e470d0a1a0a','실제 PNG '+key);
  check(a.width===bytes.readUInt32BE(16)&&a.height===bytes.readUInt32BE(20),'실제 해상도 '+key);
  check(Math.min(Math.abs(a.width/a.height-16/9),Math.abs(a.width/a.height-1))<.02,'슬라이드 비율 '+key);
  check(sha===a.sha256&&!hashes.has(sha),'원본 hash·고유 이미지 '+key);hashes.add(sha);
  check(fs.readFileSync('dist/'+a.path).equals(bytes),'배포본 원본 일치 '+key);
 }
}
const pub=JSON.parse(fs.readFileSync('public/downloads/proposal-diagrams/design.json','utf8'));
check(!d.byId['QE-01'].authority.includes('수검자')&&d.byId['QE-01'].authority.includes('검사요원'),'QE 공식 확정 권한과 수검자 참여 구분');
for(const p of d.projects)check(JSON.stringify(pub.projects.find(q=>q.id===p.id)?.overall.edges)===JSON.stringify(p.overall.edges),p.id+' 공개 명세와 원장 연결 일치');
check(pub.projects.length===42&&pub.productSources.length===d.productSources.length&&pub.productSources.every(s=>d.productSources.some(x=>x.id===s.id)),'공개 설계·제품 근거');
check(m.generator==='built-in image_gen'&&m.assets.every(a=>a.generator==='built-in image_gen'),'이미지 모델 원본 생성 기록');
for(const id of ['MR-02','EX05-01','EX11-01'])check(d.byId[id].resultMode.includes('실행'),'조건부 실행 '+id);
check(d.projects.filter(p=>p.resultMode.includes('실행')).length===3,'실행 후보와 인계·참조 구별');
fs.mkdirSync('qa-output',{recursive:true});fs.writeFileSync('qa-output/proposal-diagrams-static.json',JSON.stringify({checks,projects:42,images:168,uniqueHashes:hashes.size},null,2));
console.log(JSON.stringify({checks,projects:42,images:168,uniqueHashes:hashes.size}));
