const fs=require('node:fs'),assert=require('node:assert/strict'),d=require('../src/three-concepts.cjs');
const p='dist/downloads/three-concepts-2027.';const actual=JSON.parse(fs.readFileSync(p+'json','utf8'));assert.deepEqual(actual,d);
assert.deepEqual(d.concepts.map(x=>x.id),['PMS','INS','DRT']);assert.equal(d.sources.length,15);
const keys=['summary','owners','flow','excluded','increments','cost','acceptance','benefit','unknown','refs'];
const ids=new Set(d.sources.map(x=>x.id));assert.equal(ids.size,d.sources.length);
for(const x of d.concepts){for(const k of keys)assert(x[k]?.length,'빈 비교항목 '+x.id+'/'+k);assert.equal(x.amount,null);assert.equal(x.baseline,null);assert.equal(x.productTestStatus,'제안·미실행');for(const ref of x.refs)assert(ids.has(ref),ref);}
const byId=Object.fromEntries(d.concepts.map(x=>[x.id,JSON.stringify(x)]));
for(const term of ['상충 분석','통합권한','2단계','상주감리','선금/기성/잔금'])assert(byId.PMS.includes(term),term);
for(const term of ['후불','공단/민간/출장','예약상태와 결제상태','INR-005','취소 후 재예약'])assert(byId.INS.includes(term),term);
for(const term of ['SFR-012','미충족','총 실제 제공률','(A+U)/N','0분모'])assert(byId.DRT.includes(term),term);
assert(d.costRule.join(' ').includes('2027'));assert(d.shared.includes('한 번만'));
const h=fs.readFileSync(p+'html','utf8'),md=fs.readFileSync(p+'md','utf8'),csv=fs.readFileSync(p+'csv','utf8');
for(const id of ids){assert(h.includes('id="source-'+id+'"'));assert(md.includes(id));}
assert(h.includes('noindex,nofollow'));assert(h.includes('scope="row"'));assert(h.includes('tabindex="0"'));assert(h.includes('@media(max-width:700px)'));
for(const x of d.concepts)assert(h.includes('id="'+x.id+'"')&&csv.includes(x.title));
const privateContent=/C:[\\/]|OneDrive|file:\/\/|(?<![A-Za-z0-9])\d[\d,]*(?:\.\d+)?\s*(?:억\s*원|만\s*원|원)(?=$|[\s"'.,)])/;
assert(!privateContent.test(', 원문 근거'),'쉼표·원문은 금액이 아님');
assert(privateContent.test('금액 1,000원 확정'),'실제 금액 탐지');
assert(!privateContent.test(JSON.stringify(d)),'공개 경계');
for(const file of ['src/UserHome.jsx','src/IntegratedReader.jsx','src/SkillPms.jsx','src/DrtAssurance.jsx'])assert(fs.readFileSync(file,'utf8').includes('downloads/three-concepts-2027.html'),'진입 연결 '+file);
console.log(JSON.stringify({result:'passed',concepts:3,comparisonFields:10,sources:15,publicFiles:4,scope:'문서 연결·근거·범위·공개 경계 검사; 제품 인수시험 아님'}));

assert(d.concepts[1].increments.find(x=>x.startsWith('I03:')).includes('예약'));
assert(d.concepts[1].increments.find(x=>x.startsWith('I04:')).includes('검사결과'));
assert(d.concepts[2].increments.find(x=>x.startsWith('D02:')).includes('실패'));
assert(d.concepts[2].increments.find(x=>x.startsWith('D03:')).includes('운영계획'));

// 통합 유지관리 RFP 1건 추가: 기존 요금·감면·회계 연계 요구와 적용 한계를 함께 보존.
const mr=d.sources.find(s=>s.id==='M-R01');assert(mr&&mr.url.includes('R26BK01378737'));
assert(d.concepts[1].excluded.join(' ').includes('수수료 변경에 따른'));
assert(d.concepts[1].excluded.join(' ').includes('실제 납품 미확인'));
assert(d.concepts[1].cost.join(' ').includes('2026년 첫해'));
assert(d.concepts[1].cost.join(' ').includes('2027년 Agent'));
assert(mr.limit.includes('취소')&&mr.limit.includes('API 권리 미확인'));


// 연차 분할은 독립 인수·유지 운영·차분 원가를 유지해야 하며 신규 제품 실적으로 승격하지 않는다.
assert(d.annualPlan.status.includes('미확정'));
assert(d.annualPlan.completion.includes('운영예산'));
assert(d.annualPlan.choice.includes('착수·유지·보류'));
assert(d.annualPlan.decision.includes('자동 확정하지'));
for(const term of ['3등분','이중 합산','계속 운영비'])assert(d.annualPlan.budget.join(' ').includes(term),term);
assert(d.annualPlan.schedule.join(' ').includes('중간 운영자료'));
for(const c of d.concepts){
 assert.deepEqual(c.annualStages.map(s=>s.year),[2027,2028,2029]);
 for(const s of c.annualStages){
  assert.equal(s.amount,null);assert.equal(s.status,'제안·미실행');
  for(const k of ['name','value','scope','deliverables','acceptance','cost','next']){
   assert(s[k].length>10,c.id+'/'+s.year+'/'+k);
   assert(h.includes(s[k]),'HTML 연차 누락 '+k);assert(md.includes(s[k]),'MD 연차 누락 '+k);assert(csv.includes(s[k]),'CSV 연차 누락 '+k);
  }
  assert(h.includes('id="annual-'+c.id+'-'+s.year+'"'));
 }
}
assert(d.concepts[1].annualStages[0].scope.includes('발주 전에'));
assert(d.concepts[1].annualStages[0].acceptance.includes('인계 완료만'));
assert(d.concepts[2].annualStages[0].scope.includes('배차·기사앱 재구축 제외'));
assert(d.concepts[0].annualStages[0].scope.includes('P01 최소'));
assert(h.includes('id="roadmap"')&&h.includes('revealAnnual'));
for(const [,id]of h.matchAll(/href="#([^"]+)"/g))assert(h.includes('id="'+id+'"'),'앵커 누락 '+id);
console.log(JSON.stringify({annualStages:9,status:'passed',productTestsExecuted:false}));
