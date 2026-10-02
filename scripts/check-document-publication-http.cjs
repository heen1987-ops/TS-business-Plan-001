// 공개 배포 후 실행. HTTP 압축 전송 길이 대신 실제 수신·해제된 파일의 SHA-256 검증.
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const manifest=require('../src/department-documents.json'),publication=require('../src/document-publication.cjs');
async function verify(file,url){
 const attempts=[];
 for(let attempt=1;attempt<=2;attempt++)try{
  const response=await fetch(url,{signal:AbortSignal.timeout(60000)});
  const bytes=Buffer.from(await response.arrayBuffer()),hash=crypto.createHash('sha256').update(bytes).digest('hex');
  attempts.push({attempt,status:response.status});
  return{path:file.path,url,status:response.status,bytes:bytes.length,sha256:hash,attempts,pass:response.status===200&&bytes.length===file.bytes&&hash===file.sha256};
 }catch(e){attempts.push({attempt,error:e.message})}
 return{path:file.path,url,pass:false,attempts};
}
(async()=>{
 const files=manifest.departments.flatMap(d=>[...d.documents,...(d.history||[])]),results=[];let cursor=0;
 await Promise.all(Array.from({length:4},async()=>{while(cursor<files.length){const file=files[cursor++];results.push(await verify(file,publication.fileUrl(file)))}}));
 const github=[];for(const file of manifest.departments.find(d=>d.code==='MR').documents)github.push(await verify(file,publication.rawUrl(file)));
 fs.mkdirSync('qa-output',{recursive:true});fs.writeFileSync('qa-output/document-publication-http.json',JSON.stringify({checkedAt:new Date().toISOString(),base:publication.pages,results,github},null,2));
 const failed=[...results,...github].filter(r=>!r.pass);console.log(JSON.stringify({result:failed.length?'실패':'통과',files:results.length,matched:results.filter(r=>r.pass).length,githubSamples:github.filter(r=>r.pass).length,bytes:results.reduce((n,r)=>n+(r.bytes||0),0),retried:[...results,...github].filter(r=>r.attempts.length>1).map(r=>({path:r.path,attempts:r.attempts})),failed}));
 assert.equal(results.length,files.length);assert.equal(failed.length,0,'공개 한글파일과 저장소 원본 불일치');
})().catch(e=>{console.error(e);process.exitCode=1});
