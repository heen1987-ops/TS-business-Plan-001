const assert=require('node:assert/strict'),fs=require('node:fs'),model=require('../src/planning-workbench.cjs');
const checks=[];function check(name,value){assert(value,name);checks.push(name)}
check('제작 단계와 8개 화면의 분리',model.stage===2&&model.screens.length===8);
check('기존 51처·54기획 보존',model.departments.length===51&&model.projects.length===54);
check('비교 후보 최대3개·순위 없음',model.representativeIds.length===3&&model.copy.overviewNote.includes('순위 아님'));
check('모든 항목 ID 고유',new Set(model.entities.map(e=>e.id)).size===model.entities.length);
check('모든 관계 ID 고유',new Set(model.relations.map(e=>e.id)).size===model.relations.length);
for(const type of ['institution','ministry','external','department','law','work','process','system','data','problem','cause','requirement','solution','architecture','project','metric','source'])check(type+' 개별 데이터',model.entities.some(e=>e.type===type));
for(const e of model.entities){assert(['공식 근거','내부 운영자료','분석 가설','기획 제안','화면 검증용 예시','보도 인용','연구논문','분석자 계산'].includes(e.nature),e.id+' 성격');assert(['확인됨','부분 확인','확인 필요'].includes(e.verification),e.id+' 상태');assert(Array.isArray(e.sourceIds),e.id+' 출처');for(const id of e.sourceIds)assert(model.sourceById[id],e.id+' 출처 무결성');if(e.type==='metric')assert(e.baseline===null&&e.target===null,e.id+' 실측 전');if(e.type==='law')assert('clause'in e&&'effective'in e&&'checkedAt'in e,e.id+' 법령 시점');}
check('항목의 성격·상태·출처·미측정 보존',true);
for(const r of model.relations){assert(model.byId[r.from]&&model.byId[r.to],r.id+' 연결 대상');assert(r.type&&r.reason&&r.verification,r.id+' 의미·확인상태');for(const id of r.sourceIds)assert(model.sourceById[id],r.id+' 출처 참조');}
check('관계의 대상·유형·이유·출처·상태 무결성',true);
for(const p of model.projects){for(const id of [p.workId,p.departmentId,p.problemId,p.requirementId,p.solutionId,...p.metricIds,...p.lawIds,...p.dataIds])assert(model.byId[id],p.id+' 관련 항목');assert(p.purpose&&p.goal&&p.means,p.id+' 목적·목표·수단');assert(p.legacy&&p.documents,p.id+' 기존 자료 링크');}
check('54개 후보의 목적·업무·문제·해결·성과·기존자료 연결',true);
check('법령 시행일과 현재 확인일 분리',model.byId['LAW-FOUNDATION'].verification==='확인됨'&&model.byId['LAW-FOUNDATION'].effective==='2018-01-01'&&model.byId['LAW-FOUNDATION'].checkedAt==='2026-10-09');
check('DRT 조사 맥락을 운영예산 권한으로 확대 금지',model.byId['PROJECT-MR-02'].lawLinks.some(l=>l.type==='정책·조사 맥락'&&l.reason.includes('권한을 확정하지 않음')));
check('연구지원처 법령 미연결은 업무 부재가 아님',model.byId['PROJECT-KT-RS-01'].lawIds.length===0&&model.byId['PROJECT-KT-RS-01'].metricIds.length===3);
check('기존 NOA 적용·추가 개발 구분',model.byId['SYS-NOA'].verification==='확인 필요'&&model.byId['SOLUTION-MR-02'].existing.includes('2026'));
const app=fs.readFileSync('src/App.jsx','utf8'),jsx=fs.readFileSync('src/PlanningWorkbench.jsx','utf8');
check('기존 지도 node 조건에서 새화면 제외',app.includes('isHome&&!isWorkbench'));
check('새 화면 진입 구현',app.includes('if(isWorkbench)return <PlanningWorkbench/>'));
check('URL 기반 화면·후보·항목 보존',jsx.includes('history.pushState')&&jsx.includes("addEventListener('popstate'")&&jsx.includes('entity:q.get'));
check('native dialog·닫기·초점 복귀',jsx.includes('showModal')&&jsx.includes('onCancel')&&jsx.includes('opener.current?.focus'));
check('화면의 낯선 언어 혼입 없음',!/[ぁ-んァ-ヶ一-龥]/.test(jsx));
check('기존 경로 73개 유지',require('../site-routes.json').routes.length===73);
const katri=require('../src/katri-solution-expansion.cjs'),mapping=require('../src/law-department-connections.cjs');
for(const p of model.projects){assert(p.steps.length>0,p.id+' 목표 단계 존재');for(const step of p.steps)assert(step.every(x=>typeof x==='string'&&x.trim()),p.id+' 단계 제목·설명 공란 금지');for(const id of [p.workId,p.problemId,p.requirementId,p.solutionId,...p.dataIds,...p.metricIds])assert(model.byId[id].projectId===p.id,id+' 후보 맥락');}
check('54개 후보 단계 공란·후보 소속 누락 방지',true);
for(const k of katri.records.filter(x=>x.id!=='KT-RS-01')){const p=model.byId['PROJECT-'+k.id];for(const [index,original]of k.stages.entries()){assert(p.steps[index][1]===original[0],k.id+' 단계 제목 보존');for(const text of original.slice(1))assert(p.steps[index][2].includes(text),k.id+' 입력·처리·산출물 보존');}}
check('KATRI 11개 후보 55단계 원내용 보존',true);
for(const d of mapping.departments){for(const r of d.records){for(const u of r.units.filter(x=>x.scopeReview||x.placement)){const e=model.byId['WORK-'+u.id];assert(e.scopeReview===u.scopeReview&&e.placement===u.placement&&e.verification==='확인 필요',u.id+' 경고 보존');assert(model.byId['DEPT-'+d.key].details.some(t=>t.includes(u.text)&&t.includes('대조 필요')),d.key+' 관찰 주의표시');}}}
check('소속 불일치·파견 6개 업무 경고 보존',true);
for(const id of ['RIS-15','RIS-65','RIS-17']){const s=model.sources.find(x=>x.originalId===id);assert(s&&s.nature==='분석자 계산'&&s.publisher.includes('분석자 계산')&&s.grade==='CONFIRMED'&&s.verification!=='확인됨',id+' 계산 근거 구분');}
check('분석자 계산을 공식 발표로 승격 금지',true);
check('논문을 공식 발표로 승격 금지',model.sources.find(x=>x.originalId==='PS-E27')?.nature==='연구논문');
for(const p of model.projects){for(const pair of [[p.workId,p.problemId],[p.problemId,p.solutionId],[p.solutionId,p.id],[p.problemId,p.requirementId],[p.requirementId,p.solutionId]])assert(model.relations.some(r=>r.from===pair[0]&&r.to===pair[1]),p.id+' 지도 실제 방향');}
check('요약·개선지도 직접 관계와 방향 보존',true);
const research=require('../src/antigravity-research.json');
check('연계자료도 8개 주 메뉴 유지',model.screens.length===8);
check('100단계 번호·그룹·기획 상태의 구분',research.groups.length===10&&research.groups.flatMap(g=>g.topics).length===100&&new Set(research.groups.flatMap(g=>g.topics.map(t=>t.id))).size===100&&research.groups.flatMap(g=>g.topics).every(t=>t.verification==='기획자료 · 법령·민원·수치 원문 대조 전'));
check('파일 보유·해시 중복·자체기획 구분',research.stats.pdfFiles===98&&research.stats.pdfUniqueHashes===95&&research.stats.pdfHeadersValid===98&&research.pdfCategories.reduce((n,g)=>n+g.files,0)===98&&research.stats.pdfGeneratedPlans===6);
check('연계 사이트 오명칭 회귀 방지',research.sites.find(s=>s.id==='SITE-11').name==='운수종사자관리시스템'&&research.sites.find(s=>s.id==='SITE-29').name==='교통안전체험교육센터'&&research.sites.find(s=>s.id==='SITE-26').name==='드론 정보통합시스템');
check('등록 주소의 HTTP/HTTPS 변형과 접근 이력 분리',research.sites.filter(s=>s.inCatalog).length===24&&['SITE-10','SITE-14','SITE-18'].every(id=>{const s=research.sites.find(r=>r.id===id);return s.inCatalog&&s.catalogueUrl.startsWith('http:')&&s.sourceUrl;})&&research.sites.find(s=>s.id==='SITE-10').storedAccess==='public-html-collected'&&research.sites.find(s=>s.id==='SITE-10').catalogueAccess==='network-error');
check('보조자료를 신규사업·전수완료로 승격 금지',research.stats.newVerifiedServices===0&&research.stats.knownRootLinks===32&&research.stats.knownHosts===33&&research.stats.indexLegalBlank===88&&research.stats.topicBodiesWithLinks===2);
check('공개 보조자료의 로컬 경로·원 민원 인용 제외',!/\b[A-Z]:[\\/]|file:\/\/|\\Users\\|\.gemini[\\/]/i.test(JSON.stringify(research))&&!JSON.stringify(research).includes('원문 요약'));
check('연계 검증질문의 후보 참조 무결성',research.nextChecks.every(c=>model.byId['PROJECT-'+c.project]&&c.steps.every(n=>research.groups.some(g=>g.topics.some(t=>t.stage===n)))));
console.log('기획 기본 탐색 '+checks.length+'항목 통과 / '+model.entities.length+'항목·'+model.relations.length+'관계·'+model.sources.length+'출처');
