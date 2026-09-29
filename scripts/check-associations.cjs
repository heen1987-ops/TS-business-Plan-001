const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const d=require('../src/association-research.json'),nav=require('../src/navigation.cjs'),routes=require('../site-routes.json').routes;
let checks=0;const check=(v,m)=>{assert(v,m);checks++};
check(d.items.length===378,'단체·지역조직·공제·교육기관378개 기록');
check(d.issues.length===32&&d.proposals.length===10&&d.gap_review.probes.length===3,'쟁점32·후보10·출발점3');
check(d.summary.nationwide_complete===false,'전수조사 미완료');
check(d.gap_review.confirmed_new_count===0&&d.gap_review.reviews.every(x=>!x.absence_confirmed),'기능 부재 미확인 보존');
const issues=new Set(d.issues.map(x=>x.id)),plans=new Set(d.proposals.map(x=>x.id)),sources=new Set(d.sources.map(x=>x.id));
check(new Set(d.items.map(x=>x.id)).size===d.items.length,'단체ID 고유');
for(const x of d.items){
 check(x.complaint_volume===null,'개별 민원건수 미확인 '+x.id);
 check([...x.direct_issue_ids,...x.sector_issue_ids].every(id=>issues.has(id)),'쟁점참조 '+x.id);
 check(x.proposal_ids.every(id=>plans.has(id)),'후보참조 '+x.id);
 check(sources.has(x.role_source_id),'역할근거 '+x.id);
}
for(const x of d.issues){check(sources.has(x.source_id)&&plans.has(x.proposal_hint),'문제근거·후보 연결 '+x.id);}
for(const p of d.proposals){check(p.status.includes('신규성 미확정')&&p.baseline===null&&p.effect_target===null,'판정·정량목표 미확정 '+p.id);check(p.enhancement.requirements.length>0&&p.enhancement.data.length>0,'설계이력 보존 '+p.id);}
function urls(x){if(Array.isArray(x))return x.forEach(urls);if(x&&typeof x==='object')for(const [key,v]of Object.entries(x)){if((key==='url'||key.endsWith('_url'))&&v){let u;try{u=new URL(v)}catch{throw Error('URL 형식 '+v)}check(['http:','https:'].includes(u.protocol),'안전한 원문URL')}urls(v);}}
urls(d);
const exported=JSON.parse(fs.readFileSync('dist/downloads/association-research.json','utf8'));
assert.deepEqual(exported,d);checks++;
check(routes.includes('associations.html')&&nav.locate('associations.html').menuId==='resources','자료실 메뉴와 경로');
check(fs.existsSync('dist/associations.html'),'배포경로 실재');
check(fs.readFileSync('dist/downloads/association-research.md','utf8').includes('신규성 미확정'),'MD 판정 포함');
const corpus=JSON.stringify(d)+fs.readFileSync('dist/downloads/association-research.md','utf8');
check(!/(?:^|[\s("<])(?:[A-Z]:[\\/]|file:\/\/)|OneDrive|github_pat_|-----BEGIN .*PRIVATE KEY/i.test(corpus),'공개 원문 경로·인증정보 제외');
check(!Object.hasOwn(d.gap_review.sources[0],'path'),'문서 근거는 제목·쪽수만 공개');
check(d.publication.source_sha256.length===64,'원자료 해시 추적');
console.log(JSON.stringify({result:'통과',checks,records:d.items.length,issues:d.issues.length,proposals:d.proposals.length,new_features_confirmed:0}));
