const hub=require('./planning-hub.cjs'),isp=require('./isp-review.cjs'),imp=require('./implementation-review.cjs');
const base='research-library.html?view=planning';
const interview=require('./interview-plan.cjs');
const survey=require('./survey-design.cjs');
const entry=(id,title,anchor,keywords=[])=>({id:'planning-search-'+id,title,route:base+'#'+anchor,type:'planning',breadcrumb:['2027 사업기획','최신 기획 검토'],keywords});
module.exports=[
 entry('isp','2027년 ISP 준비·환경·현황 검토','isp-start',['ISP','현황','문제','대안','보안','윤리','통제']),
 entry('cost','2027년 실행조건·대가·가격 적정성 검토','cost-review',['가격','비용','단가','대가산정','예산','공수','묶음','RFP']),
 entry('implementation','2027년 실현가능성·제품·자료·현업 확인','implementation-review',['구현','피드백','기준선','현업','설치본','로컬 LLM']),
 entry('rfp','묶음형 RFP 요구사항·인수기준','cost-rfp',[...new Set(hub.projects.flatMap(p=>p.rfpCandidates)),'요구사항','RFP','묶음']),
 ...hub.bundles.map(b=>entry(b.id,b.id+' · '+b.title,'cost-bundle-'+b.id,[b.entry,b.acceptance,b.boundary,'묶음'])),
 ...isp.controls.map(c=>entry(c.id,c.id+' · '+c.category+' 통제 · '+c.title,'isp-control-'+c.id,[c.control,c.test,c.owner])),
 ...hub.projects.map(p=>({...entry(p.id,p.id+' · '+p.department+' · '+p.title,'implementation-mapping-'+p.id,[hub.projectSearchText(p),...p.rfpCandidates]),organization:p.code})),
 ...imp.metrics.map(m=>entry(m.id,m.id+' · 측정방법 · '+m.name,'implementation-metrics',[m.formula,m.method,m.boundary])),
 ...imp.questions.map(q=>entry(q.id,q.id+' · 현업 확인 · '+q.question,'implementation-feedback',[q.owner,q.evidence,'질문서','피드백'])),
 entry('interview-master','51처 인터뷰지 세분화 계획·공통 질문·전문 보충','implementation-interview-plan',['인터뷰','설문','질문지','수요조사','회신','사건카드','처별 준비','공통12','기술 보충','2027']),
 ...interview.departments.map(r=>({...entry('interview-'+r.id,r.name+' · 처별 인터뷰 준비·질문지',r.anchor,[r.mode,r.parent,...r.roles,...r.topics.flatMap(t=>[t.id,t.decision,...t.questions.map(q=>q.question)]),'인터뷰','질문지','서베이','현업']),organization:r.id})),
 entry('survey-master','NOA·현재 프로젝트 설명과 처별 병목 검토·추가 의견 설문 v0.2','implementation-survey-design',['설문','리서치베이','ResearchBay','NOA','정합성','타당성','현업 불편','대국민서비스','추가 의견']),
 ...survey.departments.map(r=>({...entry('survey-'+r.id,r.name+' · 병목 정합성·타당성·AX 확대 의견 설문 v0.2',r.anchor,[r.mode,r.parent,...r.topics.flatMap(t=>[t.id,t.title,t.gap||'업무 발견',t.how||'현행 확인']),'설문','NOA','추가 의견','대국민서비스','서두 설명']),organization:r.id}))
];
