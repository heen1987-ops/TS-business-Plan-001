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
const news=d.news_research,orgs=new Set(d.items.map(x=>x.id));
check(news.cases.length===6&&new Set(news.cases.map(x=>x.id)).size===6,'뉴스 대조사례6·고유ID');
check(new Set(news.cases.map(x=>x.dedupe_key)).size===6,'동일 사건 보도 중복 합산 방지');
for(const c of news.cases){
 check(c.novelty_confirmed===false&&c.current_failure_confirmed===false,'기사→현재 기능부재 비약 금지 '+c.id);
 check(c.proposal_ids.every(id=>plans.has(id))&&c.org_ids.every(id=>orgs.has(id)),'뉴스 후보·조직 참조 '+c.id);
 check(c.article.date<=news.date&&/^\d{4}-\d{2}-\d{2}$/.test(c.article.date),'기사발행일 확인 '+c.id);
 check(c.search.checked_at===news.date&&c.search.matched_url&&c.search.status==='네이버뉴스 검색 노출 직접 확인','검색과 기사열람 분리 '+c.id);
 check(c.article.read_status&&c.official_sources.length>0&&c.official_sources.every(s=>s.title&&s.url&&s.date&&s.fact&&s.limit&&s.read_status),'공식 반증·확인범위 '+c.id);
 check(['fact','event_period','existing','remaining','ts_boundary','llm','rules','stop'].every(k=>typeof c[k]==='string'&&c[k].length>20),'문제·기존대응·가설·책임·중단조건 '+c.id);
 check(c.counterevidence.length>=2&&c.needed_data.length>0&&c.workflow.length>0,'반증·자료·흐름 '+c.id);
 check(c.metrics.length>=3&&c.metrics.length<=5&&c.metrics.every(m=>m.name&&m.formula&&m.method&&m.baseline===null&&m.target===null),'측정지표 산식·기준선·목표 미확정 '+c.id);
 const observed=new URL(c.search.matched_url),article=new URL(c.article.naver_url||c.article.url);
 const original=new URL(c.article.url);
 check([article,original].some(u=>u.hostname.replace(/^www\./,'')===observed.hostname.replace(/^www\./,'')&&u.pathname===observed.pathname&&['idxno','ncd'].every(k=>!u.searchParams.has(k)||u.searchParams.get(k)===observed.searchParams.get(k))),'실제 검색결과·선정 기사 일치 '+c.id);
}
check(news.cases.find(c=>c.id==='N06').official_sources[0].date.includes('2026-09-15'),'최종 대조 법령 시행일 보존');
function urls(x){if(Array.isArray(x))return x.forEach(urls);if(x&&typeof x==='object')for(const [key,v]of Object.entries(x)){if((key==='url'||key.endsWith('_url'))&&v){let u;try{u=new URL(v)}catch{throw Error('URL 형식 '+v)}check(['http:','https:'].includes(u.protocol),'안전한 원문URL')}urls(v);}}
urls(d);
const exported=JSON.parse(fs.readFileSync('dist/downloads/association-research.json','utf8'));
assert.deepEqual(exported,d);checks++;
check(routes.includes('associations.html')&&nav.locate('associations.html').menuId==='resources','자료실 메뉴와 경로');
check(fs.existsSync('dist/associations.html'),'배포경로 실재');
check(fs.readFileSync('dist/downloads/association-research.md','utf8').includes('신규성 미확정'),'MD 판정 포함');
check(news.cases.every(c=>fs.readFileSync('dist/downloads/association-research.md','utf8').includes(c.title)),'뉴스 상세 내려받기 포함');
const corpus=JSON.stringify(d)+fs.readFileSync('dist/downloads/association-research.md','utf8');
check(!/(?:^|[\s("<])(?:[A-Z]:[\\/]|file:\/\/)|OneDrive|github_pat_|-----BEGIN .*PRIVATE KEY/i.test(corpus),'공개 원문 경로·인증정보 제외');
check(!Object.hasOwn(d.gap_review.sources[0],'path'),'문서 근거는 제목·쪽수만 공개');
check(d.publication.source_sha256.length===64,'원자료 해시 추적');
console.log(JSON.stringify({result:'통과',checks,records:d.items.length,issues:d.issues.length,proposals:d.proposals.length,new_features_confirmed:0}));
