// 1/10 기본 탐색용 해석층. 기존 조사 원장은 수정하지 않음.
const mapping=require('./law-department-connections.cjs');
const intent=require('./proposal-intent.cjs');
const workflows=require('./mandate-workflows.cjs');
const katri=require('./katri-solution-expansion.cjs');
const legal=require('./data.json').legal;
const date='2026-10-08';
const screens=[
 ['overview','사업 한눈에','왜 이 후속사업을 검토해야 하는가?'],
 ['institution','기관·법적 책무','기관은 어떤 근거로 무엇을 수행하는가?'],
 ['organization','부처·부서·업무','누가 어떤 업무를 어떤 근거로 수행하는가?'],
 ['problems','현행 업무·문제','현재 어떻게 일하며, 무엇을 더 확인해야 하는가?'],
 ['solutions','개선대안·솔루션','어떤 요구를 어떤 방식으로 해결하는가?'],
 ['architecture','전체아키텍처','기존 기반과 추가 구성요소는 어떻게 연결되는가?'],
 ['service','서비스 흐름','누가 시작하고, 어떤 확인을 거쳐 완료하는가?'],
 ['plan','후속사업 추진계획','무엇부터 추진하고 어떤 성과를 검증하는가?']
].map(([id,name,question],index)=>({id,name,question,screenId:'UI-'+String(index+1).padStart(2,'0')}));
const entities=[],relations=[],sources=[],projects=[],departments=[];
const byId={},sourceById={};
function add(e){if(byId[e.id])return byId[e.id];const row={nature:'기획 제안',verification:'확인 필요',sourceIds:[],summary:'',details:[],...e};entities.push(row);byId[row.id]=row;return row;}
function hash(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return(h>>>0).toString(16);}
function source(s){
 if(!s)return null;
 const id='SRC-'+hash((s.url||'')+'|'+(s.title||s.name||'')+'|'+(s.locator||''));
 if(!sourceById[id]){
  const secondary=s.source_level==='2차'||['언론','국감'].includes(s.type);
  const calculation=/분석자 계산|직접 집계/.test((s.publisher||'')+' '+(s.title||''));
  const paper=s.type==='논문';
  const nature=s.nature||(calculation?'분석자 계산':paper?'연구논문':secondary?'보도 인용':s.url?'공식 근거':'내부 운영자료');
  const verification=s.verification||(['CONFIRMED','PARTIAL'].includes(s.grade)||s.accessed?'부분 확인':'확인 필요');
  const row={id,type:'source',originalId:s.id||null,sourceType:s.type||null,publisher:s.publisher||null,grade:s.grade||null,sourceLevel:s.source_level||null,verificationScope:s.verification_scope||null,title:s.title||s.name||'출처 제목 확인 필요',url:s.url||null,nature,verification,published:s.published||'게시일 미표시',checkedAt:s.checkedAt||s.accessed||null,effective:s.effective||null,locator:s.locator||null,summary:s.fact||s.claim||s.value||s.description||'기존 조사에 등록된 출처. 해당 항목의 주장과 확인범위 대조 필요',limit:s.limit||s.verification_scope||s.note||'기존 원장의 출처 정보 재사용. 이번 단계에서 모든 원문을 재열람한 결과와 구분',sourceIds:[],details:[]};
  sources.push(row);sourceById[id]=row;add(row);
 }return id;
}
function connect(from,to,type,reason,refs=[],verification='부분 확인'){if(!byId[from]||!byId[to])throw Error('연결 대상 없음: '+from+' / '+to);const id='REL-'+hash([from,to,type].join('|'));if(!relations.some(r=>r.id===id))relations.push({id,from,to,type,reason,sourceIds:refs.filter(Boolean),verification});}
const purposeSource=source({title:'TS 설립목적 및 연혁',url:'https://main.kotsa.or.kr/portal/contents.do?menuCode=06020200',checkedAt:date,verification:'확인됨',fact:'교통사고 예방, 교통체계 운영·관리 지원, 안전한 교통환경과 국민의 생명·신체·재산 보호를 설립목적으로 안내. 한국교통안전공단법 제1조 인용.',limit:'기관의 현행 공개 안내 확인. 법률 원문의 최신 시행일 및 업무별 위임·위탁 조문은 2단계에서 대조.'});
const businessSource=source({title:'TS 주요사업',url:'https://main.kotsa.or.kr/portal/contents.do?menuCode=06020300',checkedAt:date,verification:'확인됨',fact:'도로·자동차·항공·철도 안전, 검사·자격·교육·연구·교통정보 등 주요 업무 안내.',limit:'기관 단위 업무 안내. 처별 전결·독점 소관·내부 처리 실적을 의미하지 않음.'});
const productSource=source({title:'NOA 기반 TS 적용구상 · 기존 기획 조건',nature:'내부 운영자료',verification:'부분 확인',checkedAt:date,fact:'NOA를 기반 플랫폼으로 두고 조직지식·스킬·기존 업무시스템 연계를 확장하는 기획 조건.',limit:'현재 설치본의 버전·실제 지원 기능·사용권·계약 납품범위를 확인한 증거와 구분. 추가 개발의 성능과 효과는 실증 전.'});
add({id:'ORG-TS',type:'institution',title:'한국교통안전공단',nature:'공식 근거',verification:'확인됨',sourceIds:[purposeSource,businessSource],summary:'교통사고 예방과 교통체계 운영·관리 지원을 통해 국민의 생명·신체·재산 보호에 기여하는 기관',details:['설립목적: 안전한 교통환경 조성과 교통안전 관리의 효율화','업무범위: 검사·자격·교육·조사·시험·안전관리·교통정보 등 개별 근거에 따른 수행','후속사업의 판단: 필요한 국민 편익과 실제 업무 병목을 확인한 뒤 추가 개발범위 결정']});
add({id:'MIN-MOLIT',type:'ministry',title:'국토교통부',nature:'공식 근거',verification:'부분 확인',sourceIds:[businessSource],summary:'교통 분야 제도·정책과 원 권한을 검토할 외부 소관 부처',details:['TS 내부 본부·처와 구분되는 외부 정부부처','업무별 원 권한·위임·위탁·수탁 관계는 해당 조문과 협약으로 대조']});
add({id:'ORG-LOCAL',type:'external',title:'지방자치단체·현장 운영기관',nature:'공식 근거',verification:'부분 확인',sourceIds:[],summary:'지역 사업조건·운행·예산·현장 수행의 업무별 책임 주체',details:['DRT 지역 운행조건과 지원정책은 조례·협약·면허 기준 확인','TS의 플랫폼 지원과 지역의 사업 집행·기사 수행을 구분']});
const foundation=legal.sources.find(s=>s.id==='foundation');
const foundationSource=source({...foundation,title:foundation.name,checkedAt:null,type:'법령',limit:'기존 보관본은 2018년 시행 판본. 현재 시행 조문·개정 이력의 전수 재검증은 이번 단계에서 미수행.'});
add({id:'LAW-FOUNDATION',type:'law',title:'한국교통안전공단법',lawName:'한국교통안전공단법',clause:'제1조 설립목적 · 사업 조문 추가 대조',effective:foundation.effective,checkedAt:null,nature:'공식 근거',verification:'부분 확인',sourceIds:[foundationSource,purposeSource],summary:'설립목적의 근거. 현재 업무별 수권·위탁 조문은 추가 검토',details:['공단 홈페이지의 현행 설립목적 안내와 연결','보관한 법령 판본의 시행일과 현재 적용할 법령 판본은 별도 확인']});
connect('LAW-FOUNDATION','ORG-TS','설립목적의 근거','현행 기관 안내에 한국교통안전공단법 제1조 인용',[purposeSource,foundationSource]);
connect('MIN-MOLIT','ORG-TS','업무별 소관 검토','주요 교통업무의 제도 소관·원 권한을 업무별로 대조',[businessSource]);
const lawById={};
for(const row of legal.rows){const refs=(row.refs||[]).map(id=>source({...legal.sources.find(s=>s.id===id),type:'법령',limit:'기존 법령 정리의 보관 판본. 최신 시행·개정·위탁범위는 2단계 재대조 대상.'})).filter(Boolean);const id='LAW-'+row.id;lawById[row.id]=id;add({id,type:'law',title:row.title,lawName:row.law.split(/ 제| \/ /)[0],clause:row.law,effective:null,checkedAt:null,nature:'공식 근거',verification:'부분 확인',sourceIds:refs,summary:row.work,details:['수행형태(기존 정리): '+row.mode,'원 권한·관계기관(기존 정리): '+row.principal,'범위·판단 경계: '+row.boundary,'현행 조문·시행일·개별 지정 여부는 2단계에서 검증']});}
function reviewText(unit){return [unit.scopeReview?.reason,unit.scopeReview?.note,unit.placement].filter(Boolean).join(' · ')}
for(const d of mapping.departments){
 const observations=d.records.flatMap(r=>r.observations.map(o=>({id:o.id,text:o.text,reviewNotes:o.reviewNotes||[]})));
 const warnings=d.records.flatMap(r=>(r.units||[]).map(reviewText).filter(Boolean));
 const refs=[...new Set(d.records.map(r=>source({title:r.root+' 공개 직원안내 · '+d.name,url:r.sourceUrl,checkedAt:mapping.date,verification:'부분 확인',fact:'공개 담당업무 문구: '+r.observations.slice(0,6).map(o=>o.text).join(' / '),limit:'직원명·연락처 제외. 공개 담당업무만 확인하며 전체 업무분장·전결·실제 처리실적과 구분.'+(warnings.length?' 대조 주의: '+warnings.join(' / '):'')})))];
 const id='DEPT-'+d.key;
 add({id,type:'department',key:d.key,title:d.name,nature:'공식 근거',verification:warnings.length?'부분 확인':'확인됨',sourceIds:refs,summary:d.path.replaceAll('>',' › '),observations,details:observations.map(o=>o.text+(o.reviewNotes.length?' — 대조 필요: '+o.reviewNotes.map(n=>n.note||[n.scopeReview?.reason,n.scopeReview?.note,n.placement].filter(Boolean).join(' · ')).join(' / '):''))});
 departments.push({id,key:d.key,title:d.name,path:d.path,group:d.path.split('>').slice(0,-1).join(' › '),sourceIds:refs,workIds:[],projectIds:d.proposals.map(p=>'PROJECT-'+p.id)});
 connect('ORG-TS',id,'조직 소속','공개 조직·직원업무에 따른 소속 확인',refs,'확인됨');
 for(const record of d.records){for(const unit of record.units||[]){
  const wid='WORK-'+unit.id,warning=reviewText(unit);
  add({id:wid,type:'work',title:unit.text,nature:'공식 근거',verification:warning?'확인 필요':'부분 확인',sourceIds:refs,summary:warning||'공개 담당업무를 분해한 처리단위. 실제 절차·자료·전결은 현업 대조 대상',departmentId:id,scopeReview:unit.scopeReview||null,placement:unit.placement||null,reviewNote:warning,steps:[],details:['공개 역할: '+unit.role,'분해분류: '+unit.category,'과제 연결: '+unit.mappingMethod,...(warning?['대조 필요: '+warning]:[])]});
  departments.at(-1).workIds.push(wid);
  connect(id,wid,'공개 담당업무',warning||'해당 처의 공개 문구를 분석한 업무 단위',refs,warning?'확인 필요':'부분 확인');
 }}
}
const bindingById={};
for(const b of mapping.matrix){const refs=(b.sourceIds||[]).map(id=>source(workflows.sourceById[id])).filter(Boolean);const id='WORK-'+b.id;bindingById[b.id]=id;add({id,type:'work',title:b.task,summary:b.ownerRole||'공식 업무안내의 대표 업무',nature:'공식 근거',verification:'부분 확인',sourceIds:refs,steps:[],details:['안내 담당: '+b.owner,'담당 확인범위: '+b.ownerStatus,'대표 업무 매핑. 처의 전체 분장과 구분']});connect(lawById[b.lawId],id,'업무 근거 후보','기존 조문–대표 업무 정리. 현행 위탁범위 재확인',refs,'부분 확인');const owner=departments.find(d=>d.title===b.owner);if(owner){connect(owner.id,id,'업무안내 담당','공식 안내의 담당부서 표시. 내부 독점 소관과 구분',refs,'부분 확인');owner.workIds.push(id);}}
for(const w of workflows.works){const refs=w.sourceIds.map(id=>source(workflows.sourceById[id])).filter(Boolean);add({id:'PROCESS-'+w.id,type:'process',title:w.title,nature:'공식 근거',verification:'부분 확인',sourceIds:refs,summary:w.existing,steps:w.steps,authority:w.authority,inputs:w.inputs,details:['근거: '+w.basis,'수행주체: '+w.actors,'예외: '+w.exception,'추가 확인: '+w.question]});}
const systemRows=[
 ['SYS-PLATFORM','기구축 TS AI 플랫폼','기관 인증·모델·검색·로그 등 기존 기능의 재사용 검토','실제 설치 기능·연계규격·사용권 확인 후 재사용 범위 확정'],
 ['SYS-NOA','NOA · 업무공간·스킬','조건 이해 → 과업 계획 → 도구 조회 → 결과 검토의 기반','업무별 스킬·실행권한·재확인 흐름은 추가 개발 검토'],
 ['SYS-ARDA','aRDa · 조직지식','문서·기준·판본·원문 위치·접근조건의 지식 기반','TS 적용·설치·권한 연결은 확인 필요'],
 ['SYS-TOOLS','기존 업무시스템·계산도구','공식 원장 조회·정확한 계산·확정 처리·결과 기록','프로젝트별 접수·배차·TIMS·ERP의 인터페이스 추가 확인'],
 ['SYS-AUDIT','Grantee 대사·감리 연구기능','근거·요구·변경·검수의 일치 검토 후보','기존 제품에 이식 완료된 기능과 구분. 후속 연구범위로 별도 검토']
];
for(const[id,title,summary,limit]of systemRows)add({id,type:'system',title,summary,details:[limit],nature:'기획 제안',verification:'확인 필요',sourceIds:[productSource],capability:'제품·기반 설명 / 기관 적용 검증 전'});
const archRows=[
 ['ARCH-CHANNEL','이용·업무 접점','주민·기업·기관 담당자의 기존 접수 채널','허용된 접수기록·증빙만 사용. 신규 전화망은 별도 범위'],
 ['ARCH-PLATFORM','기구축 AI 플랫폼','기관의 인증·접근범위·모델·공통 검색과 NOA 연결','연계방식·기관 배포판·보안정책 확인 필요'],
 ['ARCH-NOA','NOA 업무수행','선택 업무의 질문·계획·스킬·검토결과 관리','업무별 추가 스킬·도구 실행 조건·담당자 검토 설계'],
 ['ARCH-KNOWLEDGE','aRDa 지식·기준','문서·판본·원문 위치·공식 근거 연결','원문 접근권한 유지. 파생 추출·요약에도 같은 접근범위 적용'],
 ['ARCH-ADAPTER','업무 연계','배차·TIMS·ERP 등 승인된 시스템의 조회·처리 연결','조회와 변경 권한 분리. 중복 처리 방지와 결과 대조 설계'],
 ['ARCH-RESULT','담당자 판단·결과','담당자 확인·공식 기록·실제 이용/처리결과 연결','AI의 제안과 기관의 공식 판단을 구분. 오류 시 기존 처리로 인계']
];
for(const[id,title,summary,limit]of archRows)add({id,type:'architecture',title,summary,details:[limit],sourceIds:[productSource],nature:'기획 제안',verification:'확인 필요'});
for(const[from,to,type]of [['ARCH-CHANNEL','ARCH-PLATFORM','허용된 입력 전달'],['ARCH-PLATFORM','ARCH-NOA','인증·공통기능 활용'],['ARCH-KNOWLEDGE','ARCH-NOA','근거 조회'],['ARCH-NOA','ARCH-ADAPTER','확인된 도구 요청'],['ARCH-ADAPTER','ARCH-RESULT','결과 대조·담당자 확인'],['ARCH-RESULT','ARCH-KNOWLEDGE','확정 기록의 재사용']])connect(from,to,type,'추가 개발 검토용 연결. 실제 API·배포 완료를 의미하지 않음',[productSource],'확인 필요');
for(const[a,s]of [['ARCH-PLATFORM','SYS-PLATFORM'],['ARCH-NOA','SYS-NOA'],['ARCH-KNOWLEDGE','SYS-ARDA'],['ARCH-ADAPTER','SYS-TOOLS']])connect(a,s,'구성요소 적용','기관 환경·사용권을 확인한 뒤 적용범위 결정',[productSource],'확인 필요');
const representativeIds=['MR-02','MR-01','KT-RS-01'];
const overrides={
 'MR-02':{shortTitle:'전화 DRT 접수·배차 지원',problemTitle:'전화 요청의 재확인·기사 연락 부담',observed:'2026년 RFP에서 모바일웹의 콜센터 수동 배차를 명시. 지역 조합의 구체적 처리시간·미배차 원인은 현장 확인 전',cause:'전화 표현·운행조건·차량 가용정보의 연결 차이가 재확인과 재배정 부담을 만드는지 검증할 가설',workTitle:'DRT 접수·배차·운영 지원',solutionTitle:'NOA 전화조건 이해·예외 대응',existing:'콜센터·기사 앱·예약·통계·정산. 2026 RFP는 규칙 자동배차·거절 후 재배차·운영표를 요구하고 배차 AI·콜센터 CTI/IVR 구축은 제외. 실제 구현은 별도 확인',extra:'허용된 상담 기록의 이동조건 추출·확인질문, 기존 배차도구의 후보·실패 사유 설명, 조건 변경 대안과 구역·시간대 운영계획 비교. 기존 자동 재배차 기능과 추가 AI의 차분 검증',boundary:'정산 감사·환수·전국 예산배분은 이번 후보 범위에서 제외. 지역 지원정책의 집행권한과 TS 플랫폼 지원을 구분',steps:[['지역 운영자','전화 이동조건 확인','출발·도착·시간·도움 필요조건 확인'],['NOA·연계 도구','가용 차량 후보 비교','허용된 가용정보·기존 배차 도구 조회'],['운영자·기사','수락 후 배차 확정','기사 수락·운영자 확인 후 원 시스템 반영'],['운영자','실제 승차·예외 확인','취소·거절·지연 시 다른 차량·시간 재검토'],['TS·지역 운영기관','운영계획 비교','구역·시간대 미충족 수요의 원인 검토']],branch:'기존 규칙 재배차 실패·상담원 큐 전환 → 실패 사유·이동조건 확인 → 허용된 다른 차량·시간 대안 비교 → 운영자 재확정',approval:'운영자의 배차 확인·기사 수락·원 시스템 반영·실제 승차를 각각 구분',data:['상담 기록의 이동조건','차량·기사 가용·운행 제약','수락·확정·승차 시각','취소·거절·미배차 사유'],privacy:'연락처·위치·도움 필요조건의 최소 수집. 초기에는 허용된 상담 기록 사용. 원음·질병정보 통합을 기본범위에 포함하지 않음'},
 'MR-01':{shortTitle:'앱미터 변경 검정 준비',problemTitle:'변경 기능·기준·시험범위의 대조 부담',observed:'공식 검정 절차는 존재. 2023·2024년 보도는 당시 변경·보완 사례의 참고 근거이며 현재 반복률은 미확인',cause:'변경 전후 기능·기준 판본·기존 시험의 연결 누락이 반복 보완의 원인인지 검증할 가설',workTitle:'앱미터 제작·수리검정',solutionTitle:'NOA 변경영향·검정 준비 지원',existing:'TIMS의 접수·시험자료·요금 적합성 계산·확인서 발급',extra:'제품 버전 식별, 변경–기준–시험 대응, 누락 질문, 보완과 재시험 경로 구분',boundary:'공식 검정판정·공학시험·정밀 요금 계산은 기존 담당자와 시스템 수행. 기준의 최신 판본은 적용 전 대조',steps:[['신청기업','변경자료 제출','제품 버전·기능·배포 범위·시험 증빙'],['NOA·aRDa','변경 영향 대조','기준 판본·과거 시험·변경항목 연결'],['검정 담당자','보완·검정경로 결정','제안 근거 확인 및 공식 검정 범위 확정'],['기업·검정 담당자','보완자료·시험 수행','서류 보완과 재시험의 별도 처리'],['담당자·TIMS','확정 결과 기록','시험결과·확인서·변경제품의 대응 확인']],branch:'자료 보완 → 같은 제품 버전의 자료 재대조 / 시험 부적합 → 재시험 / 새 기능 변경 → 검정범위 재검토',approval:'담당자 경로 결정·공식 시험·확인서 발급의 구분',data:['제품·배포판·변경 전후 기능','적용 기준·기존 시험회차','보완 항목·사유·차수','접수·회신·결정 시각'],privacy:'기업 기밀·시험자료의 사건별 접근범위 유지. 운행 원자료는 검정에 필요한 범위로 제한'},
 'KT-RS-01':{shortTitle:'연구지원 계약·검수 PMS',problemTitle:'시설·계약·검수·지급 증빙의 연결 확인',observed:'공개 업무·PG 사용/정산 안내·계약 공표 담당은 확인. 실제 증빙 재요청·업무 중단의 빈도와 원인은 내부 사례 확인 전',cause:'일정·계약조건·검수 결과·회계기록의 변경 시점 차이가 준비 판단의 불일치를 만드는지 검증할 가설',workTitle:'연구지원 시설·계약·검수·정산 관련 업무',solutionTitle:'NOA 기반 연구지원 PMS 확장',existing:'기존 시설 사용·정산 기능과 공식 계약·회계 처리체계. 실제 ERP·자료 권한 확인 필요',extra:'업체 제안·평가자료 보관, 계약조건–산출물–검수–선금/중도금/잔금 증빙 연결, 변경영향과 인계질문 구성',boundary:'선정평가 점수·업체 선정·계약 승인·지급의 공식 결정은 권한자 수행. RealPMS 보고는 요구된 과제만 적용. 감리엔진 이식은 별도 검증 후속안',steps:[['사업 담당자','업체·계약자료 준비','제안서·평가배점·계약조건·지급조건 보관'],['NOA·aRDa','조건·산출물 대조','납품·검수·지급의 필요 증빙과 변경 영향 구성'],['검수·승인 담당자','검수·지급 검토','공식 검수결과·지급요건·예외 확인'],['기존 회계시스템','승인된 처리 기록','초기 조회·검토안 중심. 등록은 승인된 연계범위에서 수행'],['사업·회계 담당자','처리결과·후속 인계','검토안과 공식 처리결과 대조·남은 일정 인계']],branch:'검수 보완 → 계약조건·수정 산출물 재대조 / 지급조건 변경 → 계약·회계 담당자의 재검토',approval:'검토안·검수 승인·전표 등록·실제 지급을 각각 구분',data:['업체·제안·평가자료','계약조건·변경협의·시설 일정','납품·검수·지급 증빙','공식 회계 조회결과'],privacy:'업체 기밀·평가위원 자료·계약정보의 역할별 접근범위 설정. 회계 원장 변경권한과 조회권한 분리'}
};
for(const p of mapping.proposals){const i=intent.byId[p.id],k=katri.byId[p.id],o=overrides[p.id]||{};const refs=(p.sourceRefs||[]).map(source).filter(Boolean);const dept=departments.find(d=>d.key===p.departmentKey);const pid='PROJECT-'+p.id;const wid='SCOPE-'+p.id;const process=workflows.works.find(w=>w.projectIds.includes(p.id));const linked=(p.relations||[]).map(r=>bindingById[r.bindingId]).filter(Boolean);const unitWorks=dept.workIds.filter(id=>{const suffix=id.slice(5);return mapping.departments.find(d=>d.key===dept.key)?.records.some(r=>r.units?.some(u=>u.id===suffix&&u.projectIds.includes(p.id)))});const workRefs=process?byId['PROCESS-'+process.id].sourceIds:refs;
 add({id:wid,type:'work',title:o.workTitle||process?.title||(k?.name?k.name+' 관련 공개 업무':p.department+' 관련 업무'),nature:'기획 제안',verification:process?'부분 확인':'확인 필요',sourceIds:workRefs,summary:process?.existing||k?.existing||'공개 담당업무와 제안범위의 연결 검토. 전체 절차·분장·실적은 추가 확인',details:process?[process.basis,process.authority,process.exception]:['처의 공개 담당업무와 후보 적용범위 대조 필요','내부 업무분장·전결·현행 사건자료는 현업 확인 전'],steps:process?.steps||[],departmentId:dept.id});
 connect(dept.id,wid,'후보 업무범위','공개 업무와 제안 범위의 적용관계. 단독 소관·전결 확정과 구분',workRefs,'부분 확인');
 if(process)connect(wid,'PROCESS-'+process.id,'공개 절차 참조','공식 서비스 안내의 현행 단계. 현장의 모든 처리 변형과 구분',workRefs,'부분 확인');
 for(const r of p.relations||[]){const w=bindingById[r.bindingId];if(w)connect(w,wid,r.type,r.reason,refs,'부분 확인');}
 for(const w of unitWorks)connect(w,wid,'세부 업무 연결 후보','공개 담당업무 분해의 키워드·소속 연결. 실제 자료와 처리범위 추가 대조',refs,'부분 확인');
 const problemId='PROBLEM-'+p.id;add({id:problemId,type:'problem',title:o.problemTitle||'검증할 개선 필요: '+(i?.gap?k?.title||p.title:p.title),nature:'분석 가설',verification:'부분 확인',sourceIds:refs,summary:o.observed||i?.gap||k?.problem||'현재 제안의 필요성을 뒷받침할 실제 사례·발생범위·기존 지원기능의 차이 추가 확인',details:['실제 문제 규모·반복 빈도·처리시간은 미측정','원인 추정과 현재 업무의 실패·법령 위반 판단을 구분'],projectId:pid});
 connect(wid,problemId,'업무에서 검증할 문제','문제 발생범위·원인·잔여 미지원은 현장 검증 대상',refs,'부분 확인');
 const reqId='REQUIREMENT-'+p.id;add({id:reqId,type:'requirement',title:'개선 요구: '+(o.solutionTitle||p.title),nature:'기획 제안',verification:'확인 필요',sourceIds:refs,summary:o.extra||i?.newWork||k?.extension||p.how||'현업 수요와 구현범위 추가 정의',details:[o.boundary||i?.qualification||k?.boundary||'공식 판단·승인·대외 처리 권한은 업무별로 확인']});connect(problemId,reqId,'개선 요구 도출','가설이 확인된 범위에서 필요한 추가기능을 검토',refs,'확인 필요');
 if(o.cause){add({id:'CAUSE-'+p.id,type:'cause',title:'원인 검증 질문',nature:'분석 가설',verification:'확인 필요',sourceIds:refs,summary:o.cause,details:['담당자 설명·적용기준·실기록의 교차 대조']});connect('CAUSE-'+p.id,problemId,'원인 가설','현재 원인 확정 전. 정상·보완·예외 사건의 비교로 검증',refs,'확인 필요');}
 const sid='SOLUTION-'+p.id;add({id:sid,type:'solution',title:o.solutionTitle||p.title,nature:'기획 제안',verification:'확인 필요',sourceIds:[...refs,productSource],summary:o.extra||p.how||k?.extension||'기술 적용 범위의 상세 협의 필요',details:[i?.means?.noa||'NOA의 업무별 계획·검토·스킬 확장 후보',i?.means?.knowledge||'aRDa의 문서·판본·근거 관계 활용 검토',o.boundary||k?.boundary||i?.qualification||'업무별 공식 판단과 시스템 처리 권한 확인'],existing:o.existing||i?.means?.rules||k?.existing||'현행 시스템·실제 기능 범위 조사',extra:o.extra||i?.newWork||k?.extension||p.how||'추가 개발범위 조사',boundary:o.boundary||k?.boundary||i?.qualification||'공식 전결·자료 이용·연계조건 확인'});
 connect(reqId,sid,'요구 대응 기능','추가 적용할 기능과 비AI 대안을 같은 사건으로 비교',[...refs,productSource],'확인 필요');connect(problemId,sid,'개선방향 검토','개선 요구를 경유한 문제–솔루션 연결. 실제 개선효과 확정 전',refs,'확인 필요');connect(sid,'SYS-NOA','기반 플랫폼 활용','업무공간·스킬·연계 검토. 기관 설치본의 지원범위 확인',[productSource],'확인 필요');connect(sid,'SYS-ARDA','지식 기반 검토','문서·판본·원문 위치·권한의 업무 적용',[productSource],'확인 필요');
 const metrics=(i?.goals||k?.metrics||[]).slice(0,5).map((g,index)=>{const m=g.metric||g;const id='METRIC-'+p.id+'-'+(index+1);add({id,type:'metric',title:m.name||m.title||g.change||'성과지표 상세 확인',nature:'기획 제안',verification:'확인 필요',sourceIds:refs,summary:m.formula||k?.formula||'산식·분모·관측조건의 현업 확정 필요',details:[m.records||'원기록·측정환경 확인 필요',m.note||'기존 처리·규칙/SI·AI 추가기능의 동일 조건 비교'],baseline:null,target:null});connect(sid,id,'검증할 성과','기대방향과 측정계획. 현재 실측 효과를 의미하지 않음',refs,'확인 필요');return id;});
 const lawLinks=(p.relations||[]).map(r=>({id:relations.find(v=>v.to===bindingById[r.bindingId]&&v.from.startsWith('LAW-'))?.from,type:r.type,reason:r.reason,verification:'부분 확인'})).filter(r=>r.id);
 const inputData=o.data||i?.inputs||k?.fields||[];
 const dataIds=inputData.map((title,index)=>{const id='DATA-'+p.id+'-'+(index+1);add({id,type:'data',title,nature:'기획 제안',verification:'확인 필요',sourceIds:refs,summary:'업무에 필요한 입력 종류. 실제 필드·보유·제공·접근권한의 확인 전',details:[o.privacy||k?.privacy||'사건·역할별 접근, 최소수집·보유기간·파생정보 제공의 조건 확인']});connect(id,wid,'업무 입력 확인 후보','원자료가 실제 존재하고 사용 가능한지 현업에서 확인',refs,'확인 필요');connect(id,sid,'허용된 입력 활용','원자료·판본·권한을 보존한 검토 입력',[...refs,productSource],'확인 필요');return id;});
 const entry={id:pid,type:'project',code:p.id,title:o.shortTitle||p.title,fullTitle:p.title,departmentId:dept.id,departmentKey:dept.key,purpose:i?.purpose||k?.purpose||p.purpose,goal:i?.completion||k?.goal||'업무별 달성 상태·인수조건의 현업 합의 필요',means:o.extra||p.how||k?.extension||'기술 적용범위 추가 협의',summary:i?.scope||k?.scope||'공개 담당업무와 실제 병목의 차분을 확인한 뒤 초기 적용범위 정의',nature:'기획 제안',verification:'확인 필요',sourceIds:refs,problemId,requirementId:reqId,solutionId:sid,workId:wid,lawIds:lawLinks.map(r=>r.id),lawLinks,processId:process?'PROCESS-'+process.id:null,metricIds:metrics,status:p.status,legacy:p.to,documents:p.documentsTo,steps:o.steps||i?.change?.steps?.map(step=>['담당자·NOA',step,'처리자료·결정·결과의 대응 확인'])||k?.stages?.map(s=>Array.isArray(s)?['업무 담당자·CCK 지원',s[0],['입력: '+s[1],'처리: '+s[2],'결과: '+s[3]].join(' / ')]:['업무 담당자',typeof s==='string'?s:s.title||s.name,'업무별 입력·결과 추가 정의'])||[],branch:o.branch||'자료·기준·해석 차이 발생 시 담당자 보완 및 계획 재검토',approval:o.approval||'담당자 검토·공식 시스템 처리·후속 결과의 구분',data:inputData,dataIds,privacy:o.privacy||k?.privacy||'사건·역할별 자료 접근범위, 최소수집·보유·제공조건의 별도 정의',boundary:o.boundary||k?.boundary||i?.qualification||'내부 분장·전결·현행 계약범위 확인 전',details:['현재 편성 상태: '+p.status,'예산·일정·기준선·수치 목표는 이번 단계에서 확정하지 않음']};
 add(entry);projects.push(entry);connect(sid,pid,'사업범위로 검토','ISP·기능 차분·데이터·권한·실증범위 확정 후 편성',refs,'확인 필요');connect(pid,problemId,'추진 필요성 검증','사업 후보의 출발점. 필요성 확정 전',refs,'부분 확인');connect(pid,wid,'대상 업무','현재 제안의 적용 업무범위. 전사 업무 전체와 구분',refs,'부분 확인');
}
for(const p of projects){for(const id of [p.id,p.workId,p.problemId,p.requirementId,p.solutionId,'CAUSE-'+p.code,...p.metricIds,...p.dataIds]){if(byId[id])byId[id].projectId=p.id;}}
// 표시·동작 문구도 데이터층에 보관.
const copy={title:'2027년 TS 후속사업 기획',subtitle:'기관의 책무에서 실제 업무·문제·개선·사업까지 연결하는 검토 화면',direction:'NOA를 기반으로 기존 시스템을 활용하고, 실제 병목과 추가 AI 가치를 검증한 범위에서 후속사업 편성',overviewNote:'비교 검토 중 · 아래 세 후보는 다른 업무 유형의 탐색용 대표 후보이며 순위 아님',noSelection:'사업후보를 선택하면 같은 업무·문제·근거를 8개 화면에서 이어서 확인 가능',invalidSelection:'주소의 사업 또는 화면 정보를 찾을 수 없음. 다른 후보로 자동 대체하지 않고 선택 화면 유지',orgScope:'기존 기획에 연결된 본사·자동차안전연구원 51개 처의 공개 조직·업무. 지역·검사소·센터·TF 전체 전수 및 내부 전결의 확정과 구분',lawNote:'기관 안내·기존 법령 보관본을 연결한 1차 구조. 최신 시행일·위탁 조문·지정·협약은 다음 단계에서 검증',sourceNote:'공식 업무 안내는 업무 존재의 근거. 기사·공고 요구·현장 의견·분석 가설은 현재 구현·기관 전체 문제·도입효과와 구분',architectureNote:'1단계 연결 검토안 · 실제 서버·API·기관 배포판·제품 지원기능은 확정 전',flowNote:'목표 서비스 검토안 · 현행 공개 절차와 구분. 역할·분기·승인·결과의 확인경로 제시',emptyLaw:'대표 법령 연결 추가 확인. 공개 업무와 제안은 존재하며 최신 수권·위탁·협약 자료의 추가 대조 필요',emptyMetric:'기준선·산식·관측환경의 현업 정의 필요. 임의 목표값 표시 없음',notMeasured:'실측 전 · 기준선·수치 목표 미설정',sourceTitle:'근거·출처',detailTitle:'선택 항목 상세',footer:'CCK 기반 기획 검토용 · TS 공식 서비스와 구분 · 제작 10단계 중 1단계',judgments:[{title:'기존 기반의 활용',text:'기구축 AI·업무시스템의 지원 기능과 새 스킬·연계·검증 범위의 분리',state:'기획 조건'},{title:'병목의 현장 검증',text:'공개 절차·담당업무와 실제 반복·대기·오류 사례의 대조',state:'부분 확인'},{title:'효과와 비용의 검증',text:'현행·규칙/SI·AI 추가기능의 같은 조건 비교 후 편성 판단',state:'실측 전'}],alternatives:[{id:'A',title:'현행 운영 개선',method:'서식·안내·업무분장·인계기준 개선',condition:'주된 원인이 절차·규칙의 불명확성일 때',cost:'기존 운영 개선범위 확인',test:'같은 사건의 누락·재보완·대기 비교'},{id:'B',title:'규칙·SI 연계',method:'필수항목 검증·키 매칭·정확한 계산·상태 연계',condition:'명확한 규칙과 정형 데이터로 처리가 가능한 구간',cost:'필드·인터페이스·시험 범위로 산정',test:'규칙의 오류·예외·중복처리 시험'},{id:'C',title:'NOA 기반 AX+SI',method:'문맥·변경 영향·확인질문·예외 재계획 + 승인된 도구',condition:'A/B 이후에도 의미 해석과 상황별 조정이 필요한 구간',cost:'기존 기능 재사용과 업무별 추가 공수의 분리',test:'A/B 대비 추가 편익과 오판·검수 부담의 동시 평가'}],gates:[{title:'업무·법령 대조',deliverable:'정상·보완·변경 사례, 수권·위탁·협약·전결',criterion:'업무 주체·문제의 실제 발생범위 확인'},{title:'기능 차분·환경 확인',deliverable:'기존 계약·제품 기능, 원자료·API·접근권한',criterion:'재사용 기능과 신규 납품범위 구분'},{title:'초기 범위·대가 산정',deliverable:'요구사항·인수기준·FP/MM 증분 WBS·비용 근거',criterion:'범위·인력·시험·운영비의 산출근거 확보'},{title:'비교 실증·편성 판단',deliverable:'현행/규칙/AI 비교, 오류·개인정보·운영·성과 검증',criterion:'편익·비용·위험을 근거로 채택·보완·보류'}],next:['설립법·공공기관 지정 유형의 현행 원문 대조','업무별 원 권한·위임·위탁·수탁·협약·지정 구분','최신 조문·시행일·개정 이력·실제 수행부서 연결','공개 직원업무와 내부 분장·전결·실기록의 차이 확인']};
byId['ORG-LOCAL'].sourceIds=byId['PROJECT-MR-02'].sourceIds.slice(0,1);
connect('ORG-LOCAL','SCOPE-MR-02','지역 운영조건·수행','지자체의 참여·협약과 현장 운영기관의 수행. 개별 책임은 협약·조례로 추가 대조',byId['ORG-LOCAL'].sourceIds,'부분 확인');
// 2단계: 기관 법적 모델은 한 정본을 공통 엔터티·출처·관계에 연결.
const mandate=require('./institution-mandate.json');
const mandateSources=Object.fromEntries(mandate.sources.map(s=>[s.key,source(s)]));
for(const e of mandate.items){const row={...e,sourceIds:e.sourceKeys.map(k=>mandateSources[k])};if(byId[e.id])Object.assign(byId[e.id],row);else add(row);}
for(const e of mandate.items){for(const id of e.basisIds||[])connect(id,e.id,e.type==='governance'?'관계 규정':'책무 근거',e.reason||e.condition,byId[e.id].sourceIds,e.verification);}
connect('TS-A01','ORG-TS','설립 목적','공단법 제1조의 목적 규정',[mandateSources.act],'확인됨');
connect('TS-A02','ORG-TS','법인격','공단법 제2조의 법인 규정',[mandateSources.act],'확인됨');
connect('TS-C02','ORG-TS','명칭·비영리법인','정관 제2조의 명칭·성격',[mandateSources.charter],'확인됨');
connect('TS-TYPE','ORG-TS','공식 유형·소관 설명','2026년6월 공식 보고서의 TS 행. 지정 고시 전체는 추가 대조',[mandateSources.type],'부분 확인');
connect('MIN-MOLIT','ORG-TS','지도·감독','공단법 제28조 열거 범위의 지도·감독',[mandateSources.act],'확인됨');
Object.assign(byId['ORG-TS'],{summary:mandate.copy.purpose,sourceIds:[mandateSources.act,mandateSources.charter,mandateSources.type,mandateSources.strategy],details:[mandate.copy.role,'공단법 제2조 법인 · 정관 제2조 비영리법인 · 2026년6월 공식 보고서의 위탁집행형 준정부기관 분류','개별 위탁·대행·지정의 조건은 해당 업무법령에 따라 별도 확인']});
Object.assign(byId['MIN-MOLIT'],{summary:'공단법 제24조·제28조에 따른 사업계획·예산 승인 및 규정 범위의 지도·감독',verification:'확인됨',sourceIds:[mandateSources.act,mandateSources.decree],details:['기관 내부 본부·처와 구분되는 중앙행정기관','개별 업무의 원 권한·수탁기관·위탁조건은 업무별 법령으로 확인']});
copy.lawNote=mandate.copy.scopeShort;
copy.footer='CCK 기반 기획 검토용 · TS 공식 서비스와 구분 · 제작 10단계 중 2단계';
copy.next=mandate.pending;
const rfpLearning=require('./alio-rfp-learning.json');
const drtRfp=rfpLearning.samples.find(s=>s.id==='DRT');
const drtSource=source({title:drtRfp.title,url:drtRfp.url,type:'공식 입찰공고·제안요청서',nature:'공식 근거',verification:'확인됨',published:drtRfp.published,checkedAt:rfpLearning.date,fact:'공고 당시 수동 배차와 금회 규칙 자동배차·운영계획 요구, 배차 AI·콜센터 기반시설 제외의 구분 확인',locator:'PDF 6·8쪽 제외범위 / 13쪽 현행 수동 배차 / 28·30·32~35·39쪽 SFR-001·004·008·012·014',limit:drtRfp.boundary+' / '+drtRfp.conflicts[0]});
for(const id of ['PROJECT-MR-02','PROBLEM-MR-02','SOLUTION-MR-02'])if(byId[id])byId[id].sourceIds.push(drtSource);
byId['SOLUTION-MR-02'].details.push('2026-10-09 재대조: 규칙 자동배차·거절 후 재배차·운영표 자동화는 기존 발주 요구. 배차 AI와 콜센터 기반시설은 금회 제외. 상담조건 이해·확인질문·운영대안 비교의 추가 범위와 실제 구현 여부 확인');
module.exports={date:mandate.date,stage:2,mandate,screens,entities,byId,relations,sources,sourceById,projects,departments,representativeIds,copy,architectureIds:archRows.map(x=>x[0]),institutionIds:['ORG-TS','LAW-FOUNDATION','MIN-MOLIT','ORG-LOCAL'],counts:{departments:departments.length,projects:projects.length}};
