'use strict';
const rules=require('./ts-organization-rules.cjs'),official=require('./official-duty-research.cjs'),detail=require('./detailed-work.cjs'),planning=require('./organization-site.cjs'),strategies=require('./strategy-solutions-2027.cjs');
const {profiles}=require('./work-capabilities.cjs');
const date='2026-10-16',foundationCodes=new Set(planning.roles.map(r=>r.code));
const manualProfiles={'TASK-AI-01':'ai','TASK-AI-02':'org','TASK-AI-03':'data','TASK-AI-04':'ai','TASK-ORG-01':'org','TASK-ORG-02':'org','TASK-HR-01':'org','TASK-IT-01':'integration','TASK-SEC-01':'security','TASK-MR-01':'vehicle','TASK-MR-02':'drt','TASK-MR-03':'survey','TASK-SAFE-01':'safety','TASK-FIN-01':'finance','TASK-DATA-01':'data','TASK-TUNE-01':'vehicle'};
// 분류는 설계 후보의 재현 가능한 도출 규칙. 원문이 증명하는 기관의 승인·현재 기능과 구분.
const tests=[
 ['project',/공모사업|정부과제|국가연구.*사업|연구과제.*관리|연구개발.*기획|과제.*협약|연구.*협약/],
 ['industrial',/위험성\s*평가|안전실태|보건관리|건설.*안전|도급.*안전|중처법|작업중지|재난.*안전/],
 ['facility',/환경미화|환경정리|환경\s*관리|시설관리|시설.*유지|환경직|^환경$|실무직.*환경|시설\(|건설\(|^전기$|청소/],
 ['org',/조직개편|조직 및 정원|조직관리|업무분장|위임전결|인사정보|전보|발령|겸직|보직/],
 ['hr',/채용|인사|노사|노무|복무|급여|보수|복지|직무교육|직원.*교육|역량강화|기업문화|내부.*소통|조직문화|단체협약/],
 ['finance',/예산|회계|결산|계약|구매|지출|수입금|세무|전표|검수|자금|급부|채권|국유재산|자산|청사|시설.*유지|공사.*관리/],
 ['security',/정보보안|정보보호|개인정보|보안성|사이버|접근권한|취약점/],
 ['ai',/인공지능|AI\b|AI혁신|AI분야|GPT|모델.*고도화|모델.*품질|데이터 스페이스/i],
 ['esg',/ESG|사회공헌|윤리|청렴|반부패|동반성장|상생|사회적.*책임|지속가능|인권/i],
 ['climate',/탄소|온실가스|기후|배출권|에너지|친환경.*전환|녹색|감축/],
 ['industrial',/중대재해|중대사고|산업안전|안전보건|위험성평가|안전경영|산업재해|사업장.*안전|근로자.*안전/],
 ['drt',/DRT|수요응답|배차|대중교통.*시스템/i],
 ['industry',/규제.*특례|샌드박스|실증특례|모빌리티.*산업|지역.*성장|특화도시|기업.*지원|중소기업|산업.*지원|사업화|기술마켓|사내벤처|기업성장/],
 ['vehicle',/자동차.*정밀검사|종합.*검사|차량.*검사/],
 ['qualification',/자격|면허|운전적성|정밀검사|시험.*출제|교육|이수|종사자.*시험/],
 ['integration',/정보시스템.*유지|정보시스템.*운영|인프라.*관리|통합회원|백업|복구|네트워크|클라우드|홈페이지|전산|정보화체계|정보자원/],
 ['data',/공공데이터|메타|데이터.*(표준|품질|개방|제공|공유|연계|결합)|데이터기반행정|정보.*제공|정보.*공유|교통카드|운행기록|빅데이터|자동차.*정보|자료.*관리|데이터.*분석|정보시스템|정보화/i],
 ['climate',/물류|안전운임|화물운송실적/],
 ['survey',/실태조사|현황조사|통계|정책.*연구|정책.*분석|수요.*분석/],
 ['vehicle',/앱미터|튜닝|자동차.*검사|자동차.*안전검사|제작결함|자기인증|리콜|자동차.*인증|건설기계|기계식주차|주차장|정도검사|검사장비|정밀도|검사기기|민간검사|차대번호|이륜|출장검사장|이동검사소|실측확인|자동차.*결함|불법자동차|자동차.*단속|내압용기|검사접수|통합접수/],
 ['rail',/철도|궤도|철도차량/],
 ['aviation',/항공|드론|초경량|비행|UAM|도심항공/i],
 ['research',/자율주행|미래차|연구개발|기술.*연구|안전도.*평가|KNCAP|시험.*평가|성능.*평가|기술.*개발/i],
 ['safety',/교통안전|운수회사|운수업체|운수종사자|교통사고|교통수단.*점검|사고.*예방|위험.*운전|통학|피해자.*지원/],
 ['service',/민원|고객|국민|상담|문의|정보공개|안내|대중교통|교통약자|이동편의|교통비|K-패스/i],
 ['management',/기획|계획|성과|경영|감사|법무|법령|규정|국회|보고|서무|행정|문서|기록물|업무.*지원|위원회|홍보|협력|지시사항|정책|전략|내부통제|회의|일정|공시|보도자료|언론|인터뷰|기고|인쇄매체|사무보조|총괄/]
];
const domainTests=[['vehicle',/검사소|자동차인증|결함|주차|튜닝|기술승인|검사기획|특수검사|기술안전|시험인증/],['rail',/철도/],['aviation',/항공|드론/],['research',/연구|미래차|커넥티드|첨단/],['climate',/기후|탄소|물류/],['industry',/규제혁신|실증사업|모빌리티지원/],['safety',/안전관리처|안전사업|교통안전/],['qualification',/교육|자격/],['finance',/재정|회계|예산|자산/],['hr',/인재|운영지원/],['data',/데이터|자동차정보/],['security',/정보보안/],['ai',/AI혁신|AI서비스|AI미래/],['integration',/디지털/],['esg',/ESG/]];
const primaryStrategy={org:'ST-04',ai:'ST-04',security:'ST-04',integration:'ST-10',data:'ST-07',drt:'ST-08',survey:'ST-08',vehicle:'ST-02',rail:'ST-03',aviation:'ST-03',safety:'ST-01',industrial:'ST-03',qualification:'ST-08',research:'ST-05',climate:'ST-06',industry:'ST-09',finance:'ST-10',hr:'ST-12',esg:'ST-11',service:'ST-08',management:'ST-10',facility:'ST-10'};
function classify(text,node,manual){
 if(manual)return {profileId:manualProfiles[manual.id],method:'대표 수행단계 연결',evidence:manual.title};
 const hit=tests.find(([,re])=>re.test(text));
 if(hit)return {profileId:hit[0],method:'업무 원문·유형 대조',evidence:text.match(hit[1])[0]};
 const domain=domainTests.find(([,re])=>re.test(node.name));
 return {profileId:domain?.[0]||'management',method:'조직 소관 기반 검토 후보',evidence:node.name};
}
function strategyFor(profile,text,node){
 if(profile==='project')return /AI|인공지능/.test(text)?'ST-04':/연구/.test(text)?'ST-05':'ST-10';
 if(profile==='org'&&!foundationCodes.has(node.code))return 'ST-12';
 if(profile==='security'&&/자동차|커넥티드/.test(text+' '+node.name))return 'ST-05';
 if(['security','integration'].includes(profile)&&!foundationCodes.has(node.code))return profile==='security'?'ST-10':'ST-07';
 if(profile==='integration'&&foundationCodes.has(node.code))return 'ST-04';
 if(profile==='aviation'&&/드론|도심항공|UAM/i.test(text+' '+node.name))return 'ST-05';
 if(profile==='research'&&/정책|경영/.test(text))return 'ST-10';
 if(profile==='survey'&&/교통약자|취약|어린이/.test(text))return 'ST-01';
 if(profile==='qualification'&&/인재개발처/.test(node.name))return 'ST-12';
 if(profile==='qualification'&&/철도|항공/.test(text+' '+node.name))return 'ST-03';
 return primaryStrategy[profile];
}
function make(node,item,kind){
 const text=item.text,sourceKind=kind==='rule'?'직제시행세칙':'공개 담당업무';
 const manuals=detail.processes.filter(p=>p.code===node.code&&(kind==='rule'?p.basis.some(b=>b.text===text):p.unitIds.includes(item.id)));
 const stateOnly=kind==='public'&&(item.placement||item.scopeReview||item.role==='조직명·축약 기재'||item.role==='파견·휴직 등 표시'||/^(이사장|수석위원|단장|본부장)$/.test(text));
 const type=classify(text,node,manuals[0]),profile=profiles[type.profileId];
 const explicit=strategies.rows.filter(s=>s.dutyBindings.some(b=>b.code===node.code&&b.duties.includes(text)));
 const links=new Map();
 const add=(id,method,evidence)=>{if(!links.has(id))links.set(id,{id,method,evidence});};
 if(!stateOnly){
  for(const p of manuals)for(const id of p.strategyIds)add(id,'대표 수행단계 연결',p.id+' · '+p.title);
  for(const s of explicit)add(s.id,'기존 전략·세칙 항목 연결',node.locator+' · '+text);
  if(!links.size)add(strategyFor(type.profileId,text,node),type.method,type.evidence+' → '+profile.title);
 }
 const foundationWork=manuals.some(p=>p.phase==='1차 공통 기반')||['org','ai','security','integration'].includes(type.profileId);
 const id=item.id,phase=links.has('ST-04')&&foundationCodes.has(node.code)&&foundationWork?'1차 공통 기반':'부서별 후속 적용';
 const packages=stateOnly?[]:[...new Set(['ON-W03',...(manuals.length?manuals.flatMap(p=>p.packages):profile.packages)])];
 const commonTests=[...new Set(packages.flatMap(id=>planning.packages.find(p=>p.id===id).requirements.map(r=>planning.acceptance.find(t=>t.requirement===r).id)))];
 const requirements=stateOnly?[]:[
  {id:id+'-R01',title:'업무 맥락·전용 지식 구성',development:profile.configuration,output:profile.output,testId:id+'-T01',criterion:profile.quality},
  {id:id+'-R02',title:'업무건·역할·시스템 연결',development:profile.integration,output:'업무건·원천·역할·변경 연결 명세',testId:id+'-T02',criterion:profile.control},
  {id:id+'-R03',title:'현업 평가셋·운영 인수',development:'해당 업무의 정상·예외·거부 사례와 판정 근거 구성',output:'업무별 정답셋·결과·결함·재검증 기록',testId:id+'-T03',criterion:'평가셋·분모·목표의 착수 분석 단계 합의, 필수 거부셋 비인가 노출·실행 0건, 중대 결함 해소'}
 ];
 return {id,code:node.code,department:node.name,path:node.path,text,sourceKind,sourceDate:kind==='rule'?rules.source.effectiveDate:official.date,locator:kind==='rule'?item.locator:item.sourceSpans.map(s=>s.observationId+':'+s.start+'–'+s.end).join(' / '),entryId:kind==='rule'?item.entryId:null,sourceSpans:kind==='public'?item.sourceSpans:[],sourceUrl:kind==='public'?official.byOrg[node.code]?.sourceUrl:null,restriction:[node.restriction,item.placement,item.scopeReview?.reason].filter(Boolean).join(' / '),state:stateOnly?'원문 범위 확인':type.method==='조직 소관 기반 검토 후보'?'소관 기반 후보':'업무별 적용설계',strategyLinks:[...links.values()],profileId:stateOnly?null:profile.id,classification:type,phase:stateOnly?'범위 확인':phase,manualIds:manuals.map(p=>p.id),packages,commonTests,requirements,execution:'미실행',reuseStatus:'설치본·계약·기능시험 대조 전 재사용 후보'};
}
const records=Object.values(detail.byOrg).flatMap(org=>{const node=rules.bindings.find(n=>n.code===org.code);return [...org.ruleItems.map(i=>make(node,i,'rule')),...org.publicItems.map(i=>make(node,i,'public'))];});
const byId=Object.fromEntries(records.map(r=>[r.id,r]));
const organizations=rules.bindings.map(n=>({code:n.code,name:n.name,path:n.path,parentCode:n.parentCode,inRule:n.inRule,restriction:n.restriction,count:records.filter(r=>r.code===n.code).length,children:rules.bindings.filter(c=>c.parentCode===n.code).map(c=>c.code)}));
const counts={organizations:organizations.length,withWork:organizations.filter(o=>o.count).length,withoutWork:organizations.filter(o=>!o.count).length,records:records.length,rule:records.filter(r=>r.sourceKind==='직제시행세칙').length,public:records.filter(r=>r.sourceKind==='공개 담당업무').length,mapped:records.filter(r=>r.strategyLinks.length).length,review:records.filter(r=>!r.strategyLinks.length).length,contextCandidates:records.filter(r=>r.state==='소관 기반 후보').length};
const strategyCounts=Object.fromEntries(strategies.rows.map(s=>[s.id,records.filter(r=>r.strategyLinks.some(l=>l.id===s.id)).length]));
const notes=['직제 2026.06.30·공개 담당업무 2026.10.08 판본의 조직별 원문 항목. 동일 업무의 여러 조직·출처 기재 포함','전략·AI 기능·재사용·추가 개발·검수는 적용 설계안. 기관 승인·현행 기능 구현·실제 시험과 구분','기존 전략·세칙 연결 및 대표 수행단계 우선, 나머지는 업무 원문·유형 대조 또는 소관 기반 후보. 원문 범위 불일치는 기능 매핑 보류','공통 기반 ON27-BASE / C27-COM의 1회 산정. 업무별 개발 항목은 차분 검토 목록이며 항목 수를 개발 물량·견적 합계로 환산하지 않는 기준','판본·업무 범위·전결·사용권·재사용 기능 확인 후 부서별 상세 요구와 검수 기준 확정'];
module.exports={date,records,byId,organizations,profiles,counts,strategyCounts,notes,classify};
