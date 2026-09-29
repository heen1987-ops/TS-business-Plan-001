const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const sourceDir=process.argv[2];
if(!sourceDir)throw Error('조사 산출물 폴더를 인수로 지정');
const input=path.join(sourceDir,'협회_정의_민원_사업기획.json');
const text=fs.readFileSync(input,'utf8'),data=JSON.parse(text);
function publicCopy(value){
 if(Array.isArray(value))return value.map(publicCopy);
 if(value&&typeof value==='object'){
   const out={};
   for(const [k,v] of Object.entries(value)){
     if(['local_file','sha256','path'].includes(k))continue;
     out[k]=publicCopy(v);
   }
   return out;
 }
 if(typeof value==='string'&&/(?:^|[\s("<])(?:[A-Z]:[\\/]|file:\/\/)|OneDrive|\\Users\\/i.test(value))return '보존 문서 검토 근거. 공개본은 개인 파일 경로 생략. 제품 실행·기관 적용 검증 전.';
 return value;
}
const out=publicCopy(data);
for(let i=0;i<data.sources.length;i++)if(out.sources[i].url!==data.sources[i].url)throw Error('출처 URL 보존 실패: '+data.sources[i].id);
out.publication={date:'2026-09-29',title:'협회·민원 조사와 미제공 기능 재검토',source_name:path.basename(input),source_sha256:crypto.createHash('sha256').update(text).digest('hex'),scope:'공개 조사내용과 확인 한계를 반영한 홈페이지 열람본. 원문은 출처 링크로 연결하며 개인 파일 경로·기관 접근정보는 포함하지 않음.',status:'사업 선정·기능 부재·실제 효과 미확정'};
out.gap_review.sources=out.gap_review.sources.map(s=>({...s,availability:s.url?'공식 웹 원문':'보존 요구·제안·검토 문서. 제목·위치만 제공; 웹 원문 링크 미확보.'}));
fs.writeFileSync(path.join(root,'src/association-research.json'),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({records:out.items.length,issues:out.issues.length,proposals:out.proposals.length,sources:out.sources.length,sha256:out.publication.source_sha256}));
