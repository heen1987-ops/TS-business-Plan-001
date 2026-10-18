'use strict';
// 네트워크 접근성 점검만 수행. HTTP 성공을 본문 대조나 구현 확인으로 해석하지 않는다.
const fs=require('node:fs'),path=require('node:path');
const data=require('../src/casebook-synthesis.cjs');
const destination=process.argv[2];
if(!destination)throw new Error('로컬 결과 폴더 경로 필요');
const entries=data.allCases.flatMap(c=>data.caseSource(c.id).map(s=>({id:c.id,title:c.title,source:s.title,url:s.url})));
const urls=[...new Set(entries.map(e=>e.url))];
async function check(url){try{const response=await fetch(url,{method:'GET',signal:AbortSignal.timeout(12000),headers:{'User-Agent':'Mozilla/5.0 (research link audit)'}});const result={url,status:response.status,contentType:response.headers.get('content-type')||'',finalUrl:response.url};await response.body?.cancel();return result;}catch(e){return {url,status:'접근 실패',reason:e.name+': '+e.message};}}
(async()=>{const checked=[];for(let i=0;i<urls.length;i+=8)checked.push(...await Promise.all(urls.slice(i,i+8).map(check)));
 const byUrl=Object.fromEntries(checked.map(r=>[r.url,r]));const rows=entries.map(e=>({...e,...byUrl[e.url]}));
 const report={checkedAt:new Date().toISOString(),meaning:'HTTP 접근성만 확인. 본문·판본·구축·효과 검증과 별개',cases:data.allCases.length,sourceLinks:entries.length,uniqueUrls:urls.length,ok:checked.filter(r=>Number(r.status)>=200&&Number(r.status)<400).length,restrictedOrFailed:checked.filter(r=>!(Number(r.status)>=200&&Number(r.status)<400)).length,rows};
 fs.mkdirSync(destination,{recursive:true});fs.writeFileSync(path.join(destination,'casebook-link-audit.json'),JSON.stringify(report,null,2)+'\n');
 const q=s=>'"'+String(s??'').replaceAll('"','""')+'"';const csv=[['사례ID','사례명','출처명','원문URL','HTTP상태','내용형식','최종URL','실패사유'],...rows.map(r=>[r.id,r.title,r.source,r.url,r.status,r.contentType,r.finalUrl,r.reason])].map(r=>r.map(q).join(',')).join('\r\n');fs.writeFileSync(path.join(destination,'casebook-link-audit.csv'),'\uFEFF'+csv+'\r\n');
 console.log(JSON.stringify({cases:report.cases,sourceLinks:report.sourceLinks,uniqueUrls:report.uniqueUrls,ok:report.ok,restrictedOrFailed:report.restrictedOrFailed,destination},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
