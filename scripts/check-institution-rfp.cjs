const assert=require('node:assert/strict'),fs=require('node:fs');
const model=require('../src/planning-workbench.cjs'),d=model.mandate,r=require('../src/alio-rfp-learning.json');
const checks=[];function check(name,value){assert(value,name);checks.push(name)}
check('12法定·14정관·12연구원 임무 전체 접근',d.primaryDutyIds.length===12&&d.charterDutyIds.length===14&&d.katriDutyIds.length===12);
check('삭제 호 유지',!d.primaryDutyIds.includes('DUTY-TS-07')&&!d.primaryDutyIds.includes('DUTY-TS-08')&&d.copy.deleted.includes('제7호·제8호'));
check('그룹은 법정 분장이 아닌 탐색분류',d.groups.flatMap(g=>g.dutyIds).length===12&&new Set(d.groups.flatMap(g=>g.dutyIds)).size===12);
for(const e of d.items){assert(model.byId[e.id],e.id);for(const id of [...e.connectedIds,...e.basisIds||[]])assert(model.byId[id],e.id+' → '+id);for(const k of e.sourceKeys)assert(d.sources.some(s=>s.key===k),e.id+' source');assert(e.checkedAt===d.date,e.id+' 조사일');assert(e.subject&&e.target&&e.condition&&e.limit,e.id+' 적용 맥락');}
check('개별 근거·연결·출처·조사일 무결성',true);
check('승인·기한·의결 출처 완전성',['act','decree','charter'].every(k=>model.byId['TS-REL-APPROVAL'].sourceKeys.includes(k)));
check('기관 정관과 국가법령의 구분',d.sources.find(s=>s.key==='charter').type==='공공기관 정관·규정');
check('기관 분류 확인범위 보존',model.byId['TS-TYPE'].verification==='부분 확인'&&model.byId['TS-TYPE'].limit.includes('변경 고시'));
check('법 제6조 단서 보존',model.byId['DUTY-TS-01'].condition.includes('자동차운송사업')&&model.byId['DUTY-TS-02'].condition.includes('성능 및 안전'));
check('외국기술 도입 누락 방지',model.byId['DUTY-TS-02'].title.includes('외국기술 도입'));
check('부대사업의 상이한 범위',model.byId['DUTY-TS-14'].condition.includes('제1호부터 제12호')&&model.byId['DUTY-CH-14'].condition.includes('제13호'));
check('자료 협조의 포괄 제공권한 승격 방지',model.byId['TS-A24-2'].condition.includes('포괄 개인정보 연계 권한이 아님'));
check('3단계 조직·실업무 확인 인계',d.handoffs.length===14&&d.handoffs.every(h=>h.organizations&&h.question&&model.byId[h.dutyId]));
check('5건 선정과 전수조사 구분',r.samples.length===5&&r.scope.inspectedRows===200&&r.scope.totalRows===1820&&r.scope.limit.includes('전수 분석 아님'));
for(const s of r.samples){assert(s.institutionCode==='C0019'&&s.published&&s.seq);assert(Object.values(s.categories).reduce((a,b)=>a+b,0)===s.count,s.id+' 합계');assert(s.files.length===2,s.id+' 공고/RFP');for(const f of s.files){assert(/^[0-9a-f]{64}$/.test(f.sha256));assert(f.bytes>100000);assert(f.url.startsWith('https://www.g2b.go.kr/'));}assert(s.application&&s.boundary&&s.locator&&s.countMethod,s.id+' 판단 한계');}
check('공식 샘플·첨부 무결성·요구 유형 합계',true);
check('72개 분석자 계산의 출처 구분',r.samples.find(s=>s.id==='COMMON').countMethod.includes('분석자 계산'));
check('기간·조직·분류 상충 보존',['DRT','EXAM','CONSULT'].every(id=>r.samples.find(s=>s.id===id).conflicts.length));
check('RFP 요구의 감사권한·성능실적 승격 방지',r.samples.find(s=>s.id==='DRT').boundary.includes('권한을 입증하지 않음')&&r.samples.find(s=>s.id==='EXAM').boundary.includes('실제 성과'));
check('신규 요구 예시의 성격 명시',r.example.status.includes('가상 요구사항')&&r.example.status.includes('미확정'));
check('공개 자료 로컬 경로·연락처 제외',!/(file:\/\/|[A-Z]:\\|\\Users\\|[\w.+-]+@kotsa\.or\.kr|054-\d{3}-\d{4})/i.test(JSON.stringify(r)));
const jsx=fs.readFileSync('src/InstitutionMandate.jsx','utf8'),app=fs.readFileSync('src/PlanningWorkbench.jsx','utf8');
check('기관 3보기·공통 근거패널',jsx.includes('기관의 역할')&&jsx.includes('법적 근거')&&jsx.includes('소관·감독 관계')&&app.includes('InstitutionEvidence'));
check('RFP는 별도 주메뉴 아닌 공통 패널',model.screens.length===8&&app.includes("open({kind:'rfp'})")&&app.includes('<RfpLearning/>'));
console.log('기관 책무·ALIO RFP '+checks.length+'개 검증군 통과');
