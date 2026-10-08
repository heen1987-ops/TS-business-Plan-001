// 정본의 사실·가격을 변경하지 않는 통합 읽기·주소 연결 모델.
const ux=require('./ux-content.cjs'),hub=require('./planning-hub.cjs'),survey=require('./survey-design.cjs');
const sections=[
 ['institution','TS의 역할·법령','기관의 존재 의의, 법에 따른 책임, 공식 전략과 조직의 수행업무'],
 ['planning','2027년 기획 방향','기관 임무와 실제 문제에서 출발하는 ISP·범위·보안·개인정보·AI 윤리 검토'],
 ['department','처별 상세 제안','선택한 처의 목적·근거·현행 한계부터 기술·도식·효과·요구사항까지 연속 열람'],
 ['platform','공통 기술·구현','기구축 NOA 기반의 지식·스킬·연계·실행·검증·운영 설계'],
 ['delivery','RFP·대가·추진조건','공통 기능과 선택 업무 묶음, 실제 구현 선행조건, 원문 대가·편성·검수 검토'],
 ['opinion','현업 의견·문서','선택한 처의 확인 질문, 추가 의견, 최신 계획서·대가산정서·도식집·설문지']
].map(([id,title,intro])=>({id:'integrated-'+id,title,intro}));
const katri=require('./katri-solution-expansion.cjs');
const rows=ux.rows.map(r=>{const key=r.code||r.id,candidate=katri.byDepartment[key];return {...r,key,surveyId:key,projects:candidate?[...r.projects,{id:candidate.id,title:candidate.title,to:candidate.to,kind:candidate.kind}]:r.projects};});
function selection(search=''){
 const q=new URLSearchParams(search),requested=q.get('dept')||'MR',row=rows.find(r=>r.key===requested||r.id===requested),department=row||rows.find(r=>r.code==='MR'),topics=survey.departments.find(r=>r.id===department.surveyId)?.topics||[],requestedProject=q.get('project'),project=department.projects.find(p=>p.id===requestedProject)||department.projects[0]||null,requestedTopic=q.get('topic')||requestedProject,topicId=topics.find(t=>t.id===requestedTopic)?.id||topics.find(t=>t.id===project?.id)?.id||topics[0]?.id;
 return{department,project,topicId,invalid:!!q.get('dept')&&!row,invalidProject:!!requestedProject&&!department.projects.some(p=>p.id===requestedProject)&&!topics.some(t=>t.id===requestedProject)};
}
function projectTo(to){let u;try{u=new URL(to,'https://reader/')}catch{return null}return hub.projects.find(p=>{const v=new URL(p.proposalRoute,'https://reader/');return v.pathname===u.pathname&&v.searchParams.get('unit')===u.searchParams.get('unit')})||null;}
function resolve(to,current){
 if(/^[a-z][a-z0-9+.-]*:/i.test(to)||to.startsWith('downloads/')||to.startsWith('assets/')||to.includes('history='))return to;
 const u=new URL(to,'https://reader/'),path=decodeURI(u.pathname.slice(1)),params=new URLSearchParams();let hash=u.hash;
 const setDept=(key,project,topic)=>{const row=rows.find(r=>r.key===key||r.id===key);if(!row)return false;params.set('dept',row.key);const selected=project||(current?.department.key===row.key?current.project?.id:null);if(selected)params.set('project',selected);const selectedTopic=topic||(project&&survey.departments.find(d=>d.id===row.surveyId)?.topics.some(t=>t.id===project)?project:current?.department.key===row.key?current.topicId:null);if(selectedTopic)params.set('topic',selectedTopic);return true},p=projectTo(to);
 if(p){
  // 이전 지표·도식과 최신 제안의 정확한 대응이 없으면 원래 문서 주소 보존.
  if(['slide','metric','contract','arch','store'].some(k=>u.searchParams.has(k)))return to;
  if(hash&&!/^#(?:section-r47-|r47-|heading-r47-|section-qe-|drt-|proposal-)/.test(hash))return to;
  setDept(p.code,p.id);hash=hash||({impact:'#section-r47-outcomes',requirements:'#section-r47-block-requirements',evidence:'#section-r47-block-evidence'}[u.searchParams.get('view')])||(/\/03_/.test(path)?'#section-r47-design':/\/02_/.test(path)?'#section-r47-service':'#integrated-department');
 }
 else if(path.startsWith('처별/'))return to;
 else if(['about.html','vision.html','organization.html'].includes(path)){hash=path==='vision.html'?'#section-strategy':path==='organization.html'?'#section-organization':hash||'#section-purpose';}
 else if(path==='legal.html'||path.startsWith('legal/'))return to;
 else if(path==='solutions.html'||path==='inspection.html')hash='#integrated-department';
 else if(path==='planning-documents.html'){const key=/documents-([^#]+)/.exec(hash)?.[1];if(key&&!setDept(key))return to;hash='#integrated-documents';}
 else if(path==='skill-pms.html'){
  const key=/pms-(?:department|review)-([^#]+)/.exec(hash)?.[1],id=/pms-project-([^#]+)/.exec(hash)?.[1],candidate=hub.projects.find(p=>p.id===id);
  if(candidate){setDept(candidate.code,candidate.id);hash='#integrated-department';}
  else if(key){if(!setDept(key))return to;hash='#integrated-department';}
  else if(/^#pms-(?:portfolio|department-review)/.test(hash)||u.searchParams.has('view'))hash='#integrated-department';
  else hash=hash||'#integrated-platform';
 }
 else if(path==='research-library.html'&&u.searchParams.get('view')==='survey'){
  const dep=survey.departments.find(r=>hash==='#'+r.anchor),tdep=survey.departments.find(r=>r.topics.some(t=>hash.startsWith('#survey-topic-'+t.id+'-'))),t=tdep?.topics.find(t=>hash.startsWith('#survey-topic-'+t.id+'-'));
  if(t){setDept(tdep.id,hub.projects.some(p=>p.id===t.id)?t.id:undefined,t.id);if(!hash.endsWith('-opinion')){const suffix=hash.slice(('#survey-topic-'+t.id+'-').length);hash=t.id==='QE-H01'?'#section-qe-health-review':t.discovery?hash:({purpose:'#section-r47-context',work:'#section-r47-context',evidence:'#section-r47-block-evidence',solution:'#section-r47-service',conditions:'#integrated-feasibility',effects:'#section-r47-outcomes'}[suffix]||'#integrated-department');}}
  else if(dep)setDept(dep.id);
  else hash=hash==='#survey-intro'||hash==='#implementation-survey-intro'?'#integrated-planning':/^#survey-(additional|resources)$/.test(hash)?hash:'#integrated-opinion';
 }
 else if(path==='research-library.html'&&u.searchParams.get('view')==='planning'){hash=/^#(isp-|cost-)/.test(hash)?hash:hash.startsWith('#implementation-')?'#integrated-feasibility':'#integrated-planning';}
 else if(path==='index.html'||path==='react/index.html'){
  if(['map','overview','guide'].includes(u.searchParams.get('view'))||u.searchParams.has('node'))return to;
  if(u.searchParams.has('dept'))setDept(u.searchParams.get('dept'),u.searchParams.get('project'),u.searchParams.get('topic'));
  if(hash.startsWith('#planning-project-')){const id=hash.slice('#planning-project-'.length),candidate=hub.projects.find(p=>p.id===id);if(candidate)setDept(candidate.code,id);hash='#integrated-department';}else hash=hash||'#integrated-start';
 }else return to;
 if(!params.has('dept')&&current)setDept(current.department.key,current.project?.id,current.topicId);
 return 'index.html'+(params.size?'?'+params:'')+hash;
}
const labels={title:'2027년 TS 후속사업기획 · 통합 본문',lead:'기관의 역할과 법령에서 출발해, 담당 처의 문제·근거·CCK 해결방법·설계·효과·추진조건을 한 흐름으로 읽는 검토 자료.',status:'CCK 제안·조사 초안. TS 확정 과업·실제 제품 구현·최종 가격·실측 효과와 구분.',pick:'담당 처 선택',project:'검토 과제',note:'같은 본문에서 처·과제만 변경. 이전 페이지를 찾아 이동할 필요 없이 설명·도식·질문·문서 연결.',missing:'현재 연결된 사업계획서 없음. 업무·자료·대상자·병목을 먼저 확인하는 수요 탐색 대상이며, 미작성을 업무 부재 또는 개선효과 0으로 해석하지 않음.',unknown:'지정한 처를 찾지 못해 모빌리티연구처를 표시했습니다. 아래에서 담당 처를 다시 선택해 주세요.'};
module.exports={sections,rows,selection,resolve,labels,date:'2026-10-08'};
