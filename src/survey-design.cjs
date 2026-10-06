const hub=require('./planning-hub.cjs'),interview=require('./interview-plan.cjs'),senior=require('./senior-assessment.cjs');
const briefing=require('./survey-briefing.cjs');
const date='2026-10-06',version='v0.3',root='downloads/surveys-20261006-v03';
const field=(id,group,title,question,type='long_text',options=[],help='',displayIf=null)=>({id,group,title,question,type,options:options.map(([code,label])=>({code,label})),help,displayIf,required:false,answer:null,answerStatus:'UNANSWERED',evidenceRef:null,receivedAt:null,planningDecision:null});
const profile=[
 field('ROLE','응답 배경','응답 역할','이번 의견을 작성하는 업무 역할은 무엇입니까?','single_choice',[['WORK','업무 담당'],['REVIEW','검토·승인'],['PLANNING','기획·성과'],['TECH','정보화·제품·운영'],['SECURITY','자료·보안'],['OTHER','그 밖의 역할'],['UNKNOWN','역할 설명 보완 필요']],'실명·연락처 대신 역할만 작성. 담당 처는 해당 양식에서 지정.'),
 field('POSITION','응답 배경','의견의 범위','이 응답은 어떤 범위의 의견입니까?','single_choice',[['INDIVIDUAL','개인의 업무 경험·의견'],['CONSULTED','부서 내 확인을 거친 의견'],['OFFICIAL','권한자가 확인한 공식 회신'],['UNKNOWN','범위 미확인']],'공식 회신 선택만으로 도입·예산·자료 이용승인이 생기는 것은 아님. 확인 근거는 별도 검토.'),
 field('CURRENT_USE','응답 배경','현재 플랫폼 활용','현재 NOA 또는 AI 공통플랫폼을 어떤 업무에 사용하거나 확인하고 있습니까? 사용하지 않거나 기능을 모르는 경우도 작성해 주십시오.','long_text',[],'실제 사용 기능·업무·남는 어려움 중심. 제공된 제품 소개를 실제 설치본 기능으로 옮겨 적지 않음.')
];
const topicFields=[
 field('SCOPE_MATCH','병목 검토','업무 정합성','제시한 업무·대상·처리단계가 귀 처의 실제 담당 범위와 일치합니까?','single_choice',[['MATCH','일치'],['PARTIAL','일부 수정 필요'],['MISMATCH','현재 업무와 불일치'],['OTHER_OWNER','다른 부서·기관 소관'],['UNKNOWN','판단자료 부족']],'조직명 일치와 실제 수행·결정권한은 구분. 다른 소관이면 수정 의견만 선택 작성.'),
 field('CURRENT_STATE','병목 검토','현재 발생 상태','제시한 병목이 현재 발생하는지 어떤 상태로 확인하고 있습니까?','single_choice',[['OBSERVED','현재 발생 확인'],['CONDITIONAL','특정 조건에서 발생 확인'],['RESOLVED','과거 발생했으나 해결됨'],['NO_PROBLEM_OBSERVED','확인한 범위에서 발생하지 않음'],['NO_DIRECT_EXPERIENCE','직접 확인한 경험 없음'],['UNKNOWN','확인 불가']],'미관찰을 전체 문제 없음으로 확대하지 않음. 해결됨이면 해결 기능·시점·범위를 기록.'),
 field('BOTTLENECK_VALIDITY','병목 검토','설명·원인 타당성','제시한 병목 설명과 원인 가설이 실제 상황을 설명하는 데 타당합니까?','single_choice',[['VALID','타당'],['CONDITIONAL','조건부 타당'],['INVALID','타당하지 않음'],['UNKNOWN','판단자료 부족']],'업무 담당 여부·현재 발생 상태·우선순위와 별도 판단. 제안 제품의 도입 찬반 질문이 아님.'),
 field('VALIDITY_REASON','병목 검토','판단 이유·수정문','정합성·발생 상태·타당성 판단의 이유와 고쳐야 할 내용을 작성해 주십시오.','long_text',[],'맞는 부분 / 다른 부분 / 다른 원인 / 수정할 병목 문장 / 추가 확인 순서로 작성. 불일치·자료 부족도 유효한 응답.'),
 field('EVIDENCE_BASIS','병목 검토','판단 근거 유형','판단에 사용한 근거는 무엇입니까?','multiple_choice',[['EXPERIENCE','직접 처리 경험'],['RECORD','기록·로그·문서'],['EXPLANATION','다른 담당자의 설명'],['PUBLIC','공개자료'],['INFERENCE','추정·개인 의견'],['NONE','별도 근거 미확보']],'경험과 기록은 함께 선택 가능. NONE은 다른 근거와 동시 선택하지 않음. 유형 선택만으로 검증 완료 처리하지 않음.'),
 field('ACTUAL_CASE','병목 검토','사례·영향·범위','공유 가능한 사례가 있다면 언제·어느 단계·누구에게 어떤 결과나 부담이 발생했는지 작성해 주십시오.','long_text',[],'가명 사건 유형·기간·빈도 근거·영향·현재 대응만 작성. 이름·차량번호·연락처·질병정보·원문 민원은 입력하지 않음. 수치는 실측/집계/추정을 구분.',{field:'CURRENT_STATE',in:['OBSERVED','CONDITIONAL']}),
 field('COUNTER_EVIDENCE','병목 검토','반대 사례·추가 원인','문제 없이 완료했거나 제시한 설명과 다른 사례, 다른 원인이 있습니까?','long_text',[],'없음·직접 확인 못함도 작성 가능. 반대 사례와 소수 의견은 유지.'),
 field('EXISTING_RESPONSE','해결 방법','현재 대응·이미 해결된 부분','현재 시스템·AI·서식·규칙·협의절차로 해결하는 부분과 남는 문제는 무엇입니까?','long_text',[],'이미 충분히 해결된다면 해당 기능·조건·해결 시점을 작성. 기존 계약·추진 중인 사업과 겹치는 범위도 설명.'),
 field('IMPROVEMENT_METHOD','해결 방법','적절한 개선 방식','개선이 필요하다면 어떤 방식이 적절하다고 봅니까?','multiple_choice',[['EXISTING','기존 기능·운영 개선'],['DATA','자료·서식·식별키 정비'],['RULE_API','정형 규칙·시스템 연계'],['AI','NOA 등 AI 추가 적용'],['INSTITUTION','인력·공급·재원·제도 개선'],['NO_NEED','추가 개선 필요 없음'],['UNKNOWN','판단자료 부족']],'여러 개선 방식의 결합 가능. NO_NEED·UNKNOWN은 다른 방식과 동시에 선택하지 않음. AI 미선택 시 AI 세부 질문을 건너뜀.'),
 field('AI_ADDED_VALUE','AX 확대','AI의 추가 가치','NOA 등 AI를 추가하면 기존 도구·정형 개선으로 달성하기 어려운 어떤 결과를 얻을 수 있습니까?','long_text',[],'기능 이름보다 달라질 판단·수행·국민/기업 결과를 작성. 기대와 실제 입증을 구분.',{field:'IMPROVEMENT_METHOD',includes:'AI'}),
 field('FEASIBILITY_CONDITIONS','AX 확대','실행 선행조건','추가 AI 적용을 위해 어떤 자료·연계·권한·전문 검수·운영조건을 확보해야 합니까?','long_text',[],'실제 설치본·사용권·기존 서버·조회/실행 경계·오류 복구·인수 역할 확인. 새로운 인프라 구매 없는 검토 전제.',{field:'IMPROVEMENT_METHOD',includes:'AI'}),
 field('RISK_AND_CONCERN','해결 방법','우려·부작용','제안 방식이 오판·과다 보완·정보 노출·추가 업무·이용자 배제 등을 일으킬 조건은 무엇입니까?','long_text',[],'문제 없다고 단정하지 않고 예상·관찰·미확인을 구분. AI 이외 개선의 우려도 작성.'),
 field('EFFECT_AND_MEASUREMENT','해결 방법','기대 결과·측정 가능성','제시한 효과 지표가 적절합니까? 실제 기록으로 확인할 결과와 측정하기 어려운 부분을 작성해 주십시오.','long_text',[],'분모·관측기간·비교조건·중요 오류·과잉처리·대기/활동시간을 구분. 개선율·목표값을 임의로 만들지 않음.'),
 field('ALTERNATIVE_PROPOSAL','해결 방법','별도 해결 의견','제안된 CCK 적용 방법을 수정·축소·제외하거나 다른 방법으로 해결할 의견이 있습니까?','long_text',[],'기존 기능으로 충분 / 정형 개선 우선 / 책임·권한 문제 / 대안과 필요한 조건 등 자유 작성.'),
 field('PRIORITY_REASON','편성 의견','중요도·편성 의견','이 문제를 다른 업무와 비교하여 왜 먼저 검토하거나 뒤로 미루어야 합니까?','long_text',[],'안전·국민/기업 편익·빈도·심각도·가용 자료·실행조건을 근거로 설명. 개선 필요 없음도 가능. 자동 점수 합산으로 사업 선정하지 않음.')
];
const general=[
 field('OTHER_WORK_DIFFICULTY','추가 의견','현업 불편','제시된 병목 외에 업무처리나 정확한 판단을 어렵게 만드는 지점은 무엇입니까?','long_text',[],'업무 / 발생 단계 / 대상 / 현재 대응 / 남는 문제 / 근거를 작성. 없음·담당 아님·미확인도 명시 가능.'),
 field('PUBLIC_SERVICE_ISSUE','추가 의견','대국민·기업 서비스','국민·기업이 안전·검사·자격·교통 서비스를 이용할 때 추가로 겪는 불편이나 권익 문제는 무엇입니까?','long_text',[],'대상자 / 원하는 결과 / 현재 경로 / 반복 설명·보완·방문·접근성 / 확인 근거. 현업의 추정과 이용자의 직접 의견을 구분.'),
 field('NEW_PROBLEM','추가 의견','누락된 문제·다른 원인','이번 조사에서 빠진 문제나 다른 원인 설명이 있다면 작성해 주십시오.','long_text',[],'기존 병목의 수정인지 별도 문제인지, 소관 후보·현재 대응·우선 이유를 설명. 없으면 없음으로 작성.'),
 field('AX_EXPANSION_OPINION','추가 의견','플랫폼 확대 방안','현재 플랫폼을 확대한다면 어떤 업무의 어떤 결과를 우선 개선해야 합니까?','long_text',[],'현재 기능 → 남는 어려움 → 필요한 새 능력 → 업무·역할 변화 → 기관/국민 편익. 확대 불필요·비AI 대안도 가능.'),
 field('EXPANSION_LIMIT','추가 의견','확대하지 않을 범위','별도 전문시스템이나 권한자의 판단에 남겨야 할 범위와 확대 제약은 무엇입니까?','long_text',[],'공식 안전·자격·의료·처분·승인/지급 책임, 자료 이용·운영·비용 조건을 설명. 실제 설치본·API·권한·복구는 제품 담당자에게 확인.')
];
const discovery=[
 field('DISCOVERY_SCOPE','업무 발견','실제 담당 업무','현재 담당하는 개별 업무·대상자·입력자료·결과·권한은 무엇입니까?','long_text',[],'조직명만으로 업무를 확정하지 않음. 제시된 부서명이 현행과 다르면 정정.'),
 field('DISCOVERY_CURRENT','업무 발견','현행 처리·기존 대응','어떤 순서와 기준으로 처리하며 현재 시스템·서식·AI가 어디까지 지원합니까?','long_text',[],'정상 사례와 실제 역할·공식 완료 결과부터 설명. 다른 처·센터·기관의 단계는 분리.'),
 field('DISCOVERY_PROBLEM','업무 발견','문제 유무·근거','남는 어려움이 있습니까? 있다면 사례·영향·현재 대응·다른 원인을, 없다면 확인 범위를 설명해 주십시오.','long_text',[],'병목 가설이 아직 없는 처. AI·신규사업 필요를 미리 배정하지 않고 자유롭게 발견.')
];
const intro=[
 {id:'purpose',title:'조사 목적·응답 범위',status:'2027년 편성 의견 수렴 준비안',text:'본 조사는 처별 실제 업무와 대국민서비스에서 개선이 필요한 지점을 확인하고, 2027년 후속사업의 범위와 우선순위를 검토하기 위한 의견 수렴입니다. 먼저 현재 프로젝트와 CCK 솔루션의 역할을 설명하고, 조사된 병목의 정합성·타당성 및 별도 의견을 받습니다.',note:'병목과 확대안은 검토 가설. 수정·반대·문제 없음·기존 기능으로 충분·추가 적용 불필요도 동일하게 검토. 응답은 기관의 도입·예산·발주·자료 이용승인이 아님.'},
 {id:'current-project',title:'현재 TS 프로젝트·NOA 적용 배경',status:'기존 프로젝트 자료의 설명 · 현행 적용 상태 확인 필요',text:'현재 NOA 적용·AX 플랫폼 구축을 배경으로 후속 확대를 검토합니다. 기존 프로젝트 맥락 자료는 AI 공통플랫폼 고도화, 민원 업무 및 전세버스 공시 AI 구축을 주요 범위로 설명합니다. 공통 기반을 활용하면서 처별로 추가 필요한 업무 전환을 확인하는 것이 이번 조사의 목적입니다.',note:'기존 자료는 2026-09-09 파생 문서 분석. 최종 계약·검수·설치본·처별 실사용 완료를 직접 입증한 자료가 아님. 현재 실제 사용하는 기능과 남은 어려움을 응답 역할·현재 사용 질문과 실제 설치본 대조에서 확인.',source:'CTX-01'},
 {id:'cck',title:'NOA·CCK 솔루션의 업무 역할',status:'공급사 소개와 재사용 후보 · TS 실행 검증과 구분',text:'NOA는 기관 문서와 업무 근거를 연결하고 AI가 자료 확인·작업 수행을 지원하며, 담당자가 검토하는 조직 업무공간으로 소개됩니다. 이번 검토에서는 로컬 LLM과 기존 서버를 활용해 필요한 자료·규칙·도구를 하나의 업무 흐름에서 연결하는 방식을 고려합니다.',note:'공식 제품 소개는 TS 적용 기능·품질·보안 인증·효과 실측의 증거가 아님. 스캔·비전 기능은 이번 범위에서 제외. 제품·사용권·연계·권한·성능은 실제 설치본 대조 필요.',source:'CCK-NOA'},
 {id:'expansion',title:'기존 플랫폼에서 처별 AX로 확대하는 방향',status:'후속 제안 · 현재 계약과 차분 확인',text:'AX 확대는 AI 기능을 각 처에 배치하는 데 그치지 않고, 필요한 결과에 맞춰 자료 확인·검증질문·실행과업을 구성하고 처리결과에 따라 다음 작업을 조정하는 방식을 검토하는 것입니다. 공통 기반은 재사용하고 처별 법령·규칙·지식·연계·검증의 추가 작업을 구분합니다.',note:'계획·도구 실행·결과 검증·재계획을 묶는 Agentic OS 추가제안은 기존 계약/기술협상에 포함되지 않았다는 2026-09-22 사용자 확인. 최종 계약 원문 직접 대조는 미완료. 안전·자격·의료·처분·승인·지급의 공식 판단과 정형 계산은 권한자·기존 시스템에 유지.',source:'BOUNDARY-01'}
];
const products=[
 ['NOA','문서·근거·업무를 연결하는 작업공간. 목표와 조건에 맞는 확인·작업 지원 및 담당자 검토.','공식 공급사 소개 · TS 실제 기능/성능 별도 검증'],
 ['aRDa','문서·조직지식·원문 판본을 NOA 업무의 근거로 연결하는 후보.','기존 제품·분석자료의 역할안 · TS 색인/권한/정정 전파 미확인'],
 ['Argus·Keeper 등','계획·Task 상태·실행관리·모델호출·인증의 재사용 후보. 현업 서두에서는 업무 역할만 설명.','제품/분석자료 대조 수준 · 실제 설치 버전·API·권한·복구 성능은 제품 담당자에게 별도 확인'],
 ['기존 시스템·담당자','공식 기록·조회·정형 계산·검토·승인·실행·정정. NOA와 연결할 실제 경계 확인.','권한·인터페이스·원장 책임은 업무별 확정 필요']
];
const introSources=[
 {id:'CCK-NOA',title:'CCK 공식 NOA 소개',url:'https://www.ccksolution.com/noa',published:'게시일 미표시',checkedAt:date,locator:'문서 이해·근거 연결·작업 수행·폐쇄망/자체 LLM·사람 검토 설명',limit:'공급사 제품 설명. TS 설치·성능·법적 적합성 검증과 구분.'},
 {id:'CTX-01',title:'기존 TS 프로젝트 맥락과 신규 기획의 연결',published:'2026-09-09 분석본',locator:'확인된 문서 설명과 적용 판단 / SRC-005·010·011',limit:'파생 문서 분석. 최종 계약·현재 구현·활성 이슈 원문 재검증 아님.',route:'research-library.html?view=planning#implementation-technology'},
 {id:'BOUNDARY-01',title:'Agentic OS 추가제안 계약범위 확인',published:'2026-09-22 사용자 확인',locator:'계약/기술협상 미포함이라는 사용자 회신',limit:'계약 원문·제품 실행본 검증 완료를 뜻하지 않음.',route:'research-library.html?view=planning#implementation-technology'}
];
const seniorCard={id:senior.id,title:senior.title,purpose:senior.purpose,gap:'현행 강화 검사와 허용 의료 기능 결과로도 중요한 확인 누락·과잉의뢰가 남는지, 추가 정보가 실제 변별력을 개선하는지 미확인. 연령·질병만으로 위험이나 부적격을 확정하는 가설은 제외.',how:'허용된 기존 기능검사·의료 결과의 대상/시점/근거 연결 → 전문가가 정한 추가 확인질문 → NOA 검토안·원문 대조 → 전문 판단과 오류/집단별 부담 비교.',inputs:['현행 기능검사 결과와 판본','허용된 의료 기능 결과·필요 최소 필드','전문 참조평가·검수 기록'],decisionBoundary:'NHIS 질병 원자료 연계는 초기 전제 아님. 별도 제공근거·추가가치 확보 전 제외. AI의 의료/자격 합불 결정 제외.',metrics:senior.metrics,sources:senior.sources,descriptionDate:senior.date};
const departments=interview.departments.map(r=>({...r,anchor:'implementation-survey-'+r.id,mode:r.projectIds.length?'병목 가설·개선 방법 검토':'업무·추가 문제 발견',topics:r.topics.map(t=>{const p=hub.projects.find(p=>p.id===t.id)||(t.id===senior.id?seniorCard:null);return {id:t.id,title:p?.title||r.name+' 실제 업무와 문제 첫 확인',discovery:!p,status:p?'조사·기획 가설 · 현업 정합성/타당성 미확인':'병목 가설 미제시 · 분장·문제 유무 확인부터',purpose:p?.purpose||'실제 수행업무·현행 대응·추가 문제의 존재와 근거 확인',gap:p?.gap||null,how:p?.how||null,inputs:p?.inputs||[],boundary:p?.decisionBoundary||t.decision,metrics:p?.metrics||[],sources:p?.sources||r.sources,sourceDate:p?.descriptionDate||null,probeQuestions:t.questions,fieldIds:(p?topicFields:discovery).map(f=>f.id),response:null,planningDecision:null};}),downloads:[['처별 상세 설명·설문 v0.3 MD',root+'/'+r.id+'/questionnaire.md'],['처별 문항·분기 정의 CSV',root+'/'+r.id+'/definition.csv'],['처별 빈 회신 CSV',root+'/'+r.id+'/response-blank.csv']]}));
for(const r of departments)for(const t of r.topics){const project=hub.projects.find(p=>p.id===t.id);t.briefing=briefing.build(t,project,r);t.sources=t.briefing.sources;t.metrics=t.briefing.metrics;t.boundary=t.briefing.boundary;}
const presentation={title:'처별 병목 검토와 AX 확대 의견',lead:'업무의 목적·현행 처리·근거·병목 가설부터 CCK의 기술적 해결 과정과 효과 측정까지 읽고, 담당 처의 실제 상황과 다른 의견을 확인하는 2027년 조사 준비안.',navigation:[['survey-intro','프로젝트·NOA 설명'],['survey-departments','내 처의 병목·질문'],['survey-additional','별도 의견'],['survey-resources','최신 설문지']],questionGroups:[
 {id:'judgment',title:'1. 업무와 병목이 맞는지 확인',fields:['SCOPE_MATCH','CURRENT_STATE','BOTTLENECK_VALIDITY']},
 {id:'evidence',title:'2. 판단 이유와 실제 근거',fields:['VALIDITY_REASON','EVIDENCE_BASIS','ACTUAL_CASE','COUNTER_EVIDENCE']},
 {id:'method',title:'3. 현재 대응과 개선 방법',fields:['EXISTING_RESPONSE','IMPROVEMENT_METHOD','AI_ADDED_VALUE','FEASIBILITY_CONDITIONS']},
 {id:'outcome',title:'4. 우려·효과·별도 대안',fields:['RISK_AND_CONCERN','EFFECT_AND_MEASUREMENT','ALTERNATIVE_PROPOSAL','PRIORITY_REASON']}
 ],previewNote:'문항과 빈 양식을 확인하는 화면. 이 홈페이지에서 실제 응답을 저장하거나 제출하지 않음.',selectionNote:'본인 처를 선택하면 해당 병목과 질문만 표시. 다른 처는 선택을 바꾸어 확인. 처를 선택하지 않아도 별도 의견 문항 열람 가능.',scopeNote:'51처는 조사 준비 범위. 기존 43개 기획 가설의 정합성·타당성을 검토하며, 병목이 미매핑된 12처는 실제 업무와 문제 유무부터 확인. 확정 사업 수가 아님.',resourcesNote:'선택한 처의 최신 상세 설명·질문과 빈 회신 양식. 이전 계획서·구버전·도구 정의 자료를 현재 화면과 섞지 않음.',groupsNote:'아래 질문을 병목 설명과 함께 검토. 담당 아님·이미 해결됨·판단자료 부족·AI 추가 적용 불필요도 유효한 의견.'};
const branchRules=[
 ['담당 아님·불일치','다른 소관·수정 의견은 선택 작성. 상세 사례·효과·구현 질문은 건너뛰고 추가 의견 유지.'],
 ['자료 부족·직접 경험 없음','필요한 자료·확인 역할은 선택 작성. 타당/비타당·문제 없음으로 자동 변환하지 않음.'],
 ['이미 해결됨','해결 기능·시점·범위·반대 사례를 확인. 새로운 구축 수요로 자동 전환하지 않음.'],
 ['현재 발생 확인','실제 사례·영향·빈도 근거·현재 대응·다른 원인을 확인.'],
 ['AI 추가 적용 미선택','AI_ADDED_VALUE·FEASIBILITY_CONDITIONS는 건너뜀. 다른 대안·우려·추가 의견은 유지.'],
 ['미매핑 12처','정합성·타당성 동의 질문을 제시하지 않음. 실제 업무·현재 대응·문제 발견 3문항 적용.'],
 ['모든 경우','별도 현업 불편·대국민서비스·누락 문제·AX 확대/제외 의견은 선택 작성 가능. 빈 값은 UNANSWERED 보존.']
];
module.exports={date,version,presentation,title:'설명부터 병목 검토·추가 의견까지 · 처별 설문 설계',status:'ResearchBay 등 조사도구 전환용 초안 · 도구 등록/발송/회신 미실시',tool:'사용자가 언급한 리서치베이 양식을 염두에 둔 도구 중립 정의서. 정확한 서비스·공식 가져오기 규격·보관/권한 설정은 미검증. CSV를 실제 도구에 자동 등록했다고 주장하지 않음.',intro,products,introSources,profile,topicFields,general,discovery,departments,branchRules,
 responseStates:['UNANSWERED','ANSWERED','NOT_APPLICABLE','OTHER_OWNER','UNKNOWN','NO_PROBLEM_OBSERVED','RESOLVED','OBSERVED'],
 exclusivity:[{field:'EVIDENCE_BASIS',codes:['NONE']},{field:'IMPROVEMENT_METHOD',codes:['NO_NEED','UNKNOWN']}],
 flow:['현재 프로젝트·NOA/CCK·AX 확대 설명','담당 처·응답 역할·현재 사용 확인','조사된 병목의 정합성·현재 상태·타당성 검토','기존 대응·반대 근거·해결 방법·실행조건 의견','별도 현업 불편·대국민서비스·누락 문제·확대 의견'],
 privacy:interview.privacy,sourceNote:interview.sourceNote,
 interpretation:'의견·실제 경험·기록·추정을 구분하여 대조. 미응답/담당 아님/자료 부족/미관찰/해결됨을 분리. 동의 비율이나 척도 합계만으로 병목 규모·효과·기관 수요·발주를 확정하지 않음. 상충·반대·소수 의견을 유지하고 원문/사례 확인 뒤 유지·수정·통합·정형 개선·보류·제외 판단.',
 downloads:[['공통 서두·응답 안내 MD',root+'/intro.md'],['전체 설문 문항·분기 정의 CSV',root+'/definition.csv'],['전체 빈 회신 CSV',root+'/response-blank.csv'],['51처 설문 매핑 CSV',root+'/departments.csv'],['구조화 설문 JSON',root+'/questionnaire.json']],
 counts:{departments:departments.length,hypotheses:42+1,discovery:12,topics:departments.reduce((n,r)=>n+r.topics.length,0),fieldTypes:profile.length+topicFields.length+general.length+discovery.length,downloads:5+departments.length*3},
 handoff:'검토 결과 → 병목 문장·근거·원인 수정 → 기존 대응과 차분 → 필요한 결과·기능/자료/권한/연계 → 검증·인수기준 → 공통/처별 증분 WBS → 적합 대가산정. 설문 회신만으로 FP·MM·가격·개선율 확정 불가.'};
