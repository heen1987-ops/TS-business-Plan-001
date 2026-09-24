const mandates=require('./law-mapping.cjs');
const data=require('./data.json'),architecture=require('./architecture-v2.json'),impact=require('./impact.json'),katri=require('./katri.json'),ars=require('./ars.json'),updates=require('./updates.json'),discovery=require('./discovery.json');
const depts=data.departments.map(d=>{const u=architecture.units.find(u=>u.code===d.code);return {...d,action:d.action||u?.action||'인계 경로 상세 협의 필요',entities:d.entities||u?.entities||[],replan:d.replan||[d.change,'세부 재계획·승인 조건의 현업 확인 필요']}}),legal=data.legal;
const {targetLabel}=require('./impact-math.cjs');
const measurement=require('./measurement-data.cjs');
const chunks=(a,n)=>Array.from({length:Math.ceil(a.length/n)},(_,i)=>a.slice(i*n,i*n+n));
const card=(title,...bullets)=>({title,bullets:bullets.flat().filter(Boolean)});
const slide=(id,title,message,cards=[],extra={})=>({id,title,message,cards,...extra});
const doc=(label,to)=>({label,to});
const deptPath=(d,n=0)=>d.folder+'/'+['01_사업정의','02_UI시제품','03_아키텍처_흐름'][n]+'.html';
const planning='기획 제안 · 현업 협의·제품 적용·효과 실증 전';
const goals=[
 ['교통안전','교통안전 Global TOP10 진입','무결점 교통안전체계 조성',['사고취약 수단·계층 정밀 안전망 구축','자동차 안전관리 및 소비자 권익 강화','중대사고 예방 능동적 안전관리체계 구축'],'미해결 위험의 해소와 예방 가능한 사고의 감소',['SA','DF','DV','PK']],
 ['미래 모빌리티','차세대 모빌리티 준비지수 세계 5위','지능형 미래 모빌리티 혁신',['교통안전체계 인공지능 대전환','K-AI 기반 안전한 미래 모빌리티 실현','기후위기 대응 친환경 전환 가속화'],'안전한 기술 검증과 모빌리티 서비스의 실현',['MR','RI','AD','RD']],
 ['국민체감 서비스','공공기관 고객만족도 최고등급','균형있는 국민체감 서비스 실현',['교통데이터 개방·연계 기반 서비스 편익 증대','생활 밀착형 이동 서비스 확대','민간·지역·산업 균형 성장 역동성 지원'],'이동·이용 불편의 감소와 정당한 절차의 완료',['PS','IP','QE']],
 ['책임경영','지속가능경영지수 최고등급','지속가능 책임경영 이행',['실용·성과·효율 지향 경영체계 구축','지속가능 ESG 경영성과 실현','자율·참여·소통·공정 조직문화 조성'],'근거 있는 판단·집행·결과에 대한 설명책임',['CL','SI']]
];
const orgs=[
 ['기획본부','경영방향·자원 배분·성과와 디지털 기반',['경영기획처','예산처','혁신성과처','ESG경영처','디지털기획처','AI혁신처','정보보안처','자동차정보처']],
 ['경영지원본부','인력·계약·재정·시설 운영',['운영지원처','인재개발처','재정회계처','자산인프라처']],
 ['모빌리티교통안전본부','운수·도로안전·이동서비스와 정책 실행',depts.slice(0,8).map(d=>d.name)],
 ['자동차검사본부','운행차·특수검사·튜닝과 검사기술',[...depts.slice(8).map(d=>d.name),'AI검사인프라처','기술안전처','시험인증처','기술승인처']],
 ['항공철도안전본부','항공·드론·철도의 안전과 자격·기술 검토',['항공안전처','항공자격처','드론관리처','도심항공정책처','철도안전처','철도승인처','철도검사처','철도기술처']],
 ['연구원·현장','자동차 안전 연구·시험과 지역의 검사·교육·점검',['자동차안전연구원','지역본부','자동차검사소','교통안전 체험교육센터','드론교육·자격센터']]
];
const technical=[
 card('aRDa · 조직지식','원문·판본·접근권한과 검토 근거의 연결','검증된 업무결과·수정 이유·처리이력의 재사용','실제 TS 배포본의 기능·연계 범위 확인 필요'),
 card('NOA · 업무 수행','상황 이해 → 계획 → 도구 실행 → 결과 검증 → 재계획','사건별 목표·담당자·기한·완료조건의 연결','Agentic OS: 현 계약에 포함되지 않은 추가 개발 검토 범위'),
 card('기존 시스템 · 공식 처리','승인된 조회·등록·결과 확인의 업무도구 연결','ERP 등 기존 원장의 확정 기록과 AI 초안 구분','안전판정·발급·처분 등 최종 권한의 담당자 유지')
];
function institution(){
 const links=[doc('법정·수탁업무 상세','legal.html'),doc('기관 유형 공식 근거',legal.institution_type_source),doc('설립법 원문',legal.sources.find(x=>x.id==='foundation').url)];
 return [
 slide('purpose','TS는 왜 존재하는가','교통사고 예방과 교통체계 운영·관리 지원을 통한 국민의 생명·재산 보호',[
 card('설립 목적','교통사고 예방사업 수행','교통체계 운영·관리의 전문 지원','안전하고 편리한 교통환경 조성을 통한 국민 편익 증진'),
 card('기관의 위치','국토교통부 소관 한국교통안전공단','위탁집행형 준정부기관 분류','기관 유형과 개별 사무의 위탁·대행 권한은 별도 확인'),
 card('국민과 만나는 업무','검사·시험·안전관리·조사·교육·정보 제공','육상·항공·철도 등 교통 분야의 전문업무','현장 위험의 확인과 적정한 개선·후속조치의 연결')],{links,status:'기존 공식근거 정리 · 조사 기준 '+legal.date}),
 slide('mandate','설립법에서 실제 업무까지','기관명만으로 권한을 추정하지 않고 개별 사무의 근거·수행조직·결과를 연결',[
 card('① 설립 근거','한국교통안전공단법의 목적·사업 범위 확인','기관 전체 임무의 이해를 위한 출발점','모든 개별 업무의 자동 위임 근거로 사용하지 않는 구분'),
 card('② 개별 법령·위탁','교통안전·자동차관리·여객운송·철도·항공 등 분야별 근거','위탁·대행·지정·조사 의뢰의 구별','법령 판본·시행일·지정서·위탁 범위의 확인'),
 card('③ 수행업무·책임','접수 → 검토·검사 → 보완 → 공식 처리 → 후속 확인','본사·처·지역·현장의 실제 수행관계 파악','행정처분·발급·안전판정 주체와 AI 지원역할의 구분')],{links}),
 slide('benefit','AX가 달성해야 할 결과','기관의 임무를 더 잘 수행하고 국민·기업의 실제 부담을 줄이는 전환',[
 card('국민·기업 편익','정당한 절차의 적기 완료','불필요한 재문의·재제출·재방문 감소','위험·정보격차·서비스 접근성 문제의 해소'),
 card('기관의 업무 변화','자료를 모두 읽은 뒤 시작하는 검토의 부담 완화','조건 변경에 따른 확인과업·담당 협업의 재구성','실행 결과·미해결 사항·편익 평가의 연속 관리'),
 card('검증 방식','현재 방식·동일 SI 개선·AI 추가안의 비교','사건 난이도·분모·검수 부담을 포함한 정량 평가','기능 설치·문서 생성과 업무 성과의 구분')],{status:planning}),
 slide('technology','CCK 기술을 활용하는 방법','조직지식·계획과 실행·공식 처리결과의 연결',technical,{status:planning,links:[doc('공통 조직운영 설계','updates.html')]})
 ];}
function home(){return {title:'TS AX 사업기획',slides:[
 slide('overview','기관의 목적에서 AX 실행계획까지','TS의 임무 → 2030 전략 → 조직의 실제 업무 → 목적 중심 AX 제안',[
 card('01 · 기관 이해','존재 의의·기관 유형·설립 근거 확인','개별 법령에 따른 위탁·대행·지정 사무 구분','국민·기업이 얻어야 할 공공적 결과의 정의'),
 card('02 · 중장기 방향','2026–2030 경영목표 4개·전략과제 12개 검토','공식 목표와 제안 과업의 연결관계 설명','확정 계획·예산과 기획 가설의 구분'),
 card('03 · 조직과 업무','부서 → 수행업무 → 입력자료 → 판단·처리 → 결과','본사·현장·연구원·외부기관의 책임 경계','기존 시스템과 기구축 기능의 활용'),
 card('04 · 실행과 검증','처별 컨셉·서비스 흐름·전체 아키텍처','근거·요구사항·검수·투입공수·정량 편익','공통 기능 재사용과 업무별 추가범위 분리')
 ],{layout:'grid',links:[doc('기관 이해','about.html'),doc('2026–2030 계획','vision.html'),doc('조직·업무','organization.html'),doc('처별 AX 제안','solutions.html')]}),
 ...institution(),
 slide('reading','자료 탐색과 상세 확인','화면별 핵심 구조와 상세 설명을 순서대로 확인',[
 card('폴더 목차','왼쪽에서 기관·전략·조직·처별 제안 선택','제목·폴더명 검색으로 대상 문서 탐색','동일 문서의 도식·흐름·요구사항 경로 유지'),
 card('슬라이드 탐색','하단 이전·다음 또는 방향키로 페이지 전환','페이지 목차에서 필요한 주제 바로 이동','집중 보기로 화면 폭 확대 · 주소로 현재 페이지 공유'),
 card('상세 원문','전체 문서 버튼으로 기존 검색·표·상세 기능 사용','원문 링크와 산정표에서 조건·근거 추가 확인','정량 수치는 목표안·기준선·실측 결과를 구별하여 해석')])
]};}
function vision(){return {title:'2026–2030 계획',slides:[
 slide('vision','모두의 일상을 지키는 안전한 모빌리티 파트너','TS 2026–2030 경영목표와 조직별 AX 제안의 연결',goals.map(g=>card(g[0],g[1],g[2])),{layout:'grid',status:'공식 목표 · 과업 연결은 기획 제안',links:[doc('TS 경영목표·전략체계','https://main.kotsa.or.kr/portal/contents.do?menuCode=06020100')]}),
 ...goals.map((g,i)=>slide('goal-'+i,g[2],g[1],[card('공식 전략과제',g[3]),card('제안의 편익 방향',g[4],'지표 산식·현재값·연차 목표·확정 예산은 별도 확인','과업 수행 전후의 실제 성과와 AI 추가 기여를 구분')],{links:g[5].map(c=>{const d=depts.find(d=>d.code===c);return doc(d.name,deptPath(d))}),status:'공식 전략과제 + 기획상 연결'}))
]};}
function organization(){return {title:'조직·수행업무',slides:[
 slide('org-map','조직·업무·자료·결과의 연결','본부 계통을 이해한 뒤 실제 처 단위 업무와 AX 과업으로 구체화',orgs.map(o=>card(o[0],o[1])),{layout:'grid',status:'기존 업무지도 요약 · 현행 직제·전결 전체 확정과 구분'}),
 ...orgs.map((o,i)=>slide('org-'+i,o[0],o[1],[
 card('확인할 조직',o[2]),card('업무 분석 항목','법정·수탁 근거와 공식 결과','입력 문서·시스템·판단기준·예외','자료 소유·최종 승인·현장 이행의 주체','기구축 기능과 새로 필요한 처리범위')],{links:depts.filter(d=>o[2].includes(d.name)).map(d=>doc(d.name,deptPath(d))),status:'조직 명칭에 따른 임의 권한 배정 금지 · 실제 업무분장 확인 필요'}))
]};}
function mandateSlide(d){const p=mandates.forDepartment(d.code),b=p.primary;return slide('mandate','이 컨셉의 주관 검토 처 · '+d.name,d.title,[card('법령 → 실제 업무',b.law.law,b.task,b.law.mode),card('담당 관계 → 제안 이유',b.ownerRole,p.rationale,b.ownerStatus),card('협업·책임의 경계',p.collaboration,b.note,p.assignmentStatus)],{status:'법령 원장·공식 업무안내와 제안상 배정을 구분 · '+mandates.date,links:[doc('처·컨셉 매핑 상세',mandates.mappingPath(d.code)),...b.sourceIds.map(id=>doc(mandates.sources[id].title,mandates.sources[id].url))]});}
function bindingSlides(d){const p=mandates.forDepartment(d.code);return p.bindings.map(b=>{const c=b.concepts.find(c=>c.code===d.code);return slide('binding-'+b.id,b.task,c.label+' · '+b.owner,[card('법령·원 권한자',b.law.law,b.law.principal,b.law.mode),card('담당 관계·적용 이유',b.ownerRole,c.reason,b.ownerStatus),card('범위·확인사항',b.note,b.law.boundary)],{status:'법정업무 원장 인용 · 공식 과업 편성 아님',links:[doc('하위 업무별 전체 매핑','legal/mapping.html?mode=law&law='+b.lawId),...b.sourceIds.slice(0,2).map(id=>doc(mandates.sources[id].title,mandates.sources[id].url))]})});}
function legalDeck(group){const g=legal.groups.find(g=>g.id===group),rows=legal.rows.filter(r=>!g||r.group===g.id);
return {title:g?g.title:'법정·수탁업무',slides:[
 ...(!g?[slide('mandate-entry','법령에서 담당 처와 AX 컨셉까지','업무 특성이 다르면 같은 법령에서도 제안할 처와 컨셉이 달라짐',[
 card('앱미터 검정 → 모빌리티연구처','자동차관리법 제47조','기능증빙·주행결과 검정','대표 컨셉: 제품 변경에 대응하는 앱미터 검증계획'),
 card('운행정보 분석 → 데이터융복합처','교통안전법 제52조·제55조','TMACS·ETAS 정보관리·운행기록 분석','대표 컨셉: 교통위험 해석에서 예방조치까지 연결'),
 card('자동차검사 → 역할에 따른 분리','검사기획처·검사소: 검사 운영·재검사 연결','첨단검사전략처: KADIS 진단기술 지원','첨단연구개발처: 검사방법 연구·검증')],{status:'기획상 컨셉 배정 · 내부 전결·최종 권한과 구분',links:[doc('처별 법령·컨셉 매핑 열기','legal/mapping.html'),doc('법령·업무에서 처 찾기','legal/mapping.html?mode=law')]})]:[]),
 slide('law-map',g?g.title:'TS 법정·수탁업무 지도',g?g.laws:'업무별 수행 근거·권한자·TS 역할의 구분',g?[card('분야 설명',g.desc),card('검토 범위',rows.length+'개 대표 업무','위탁·대행·지정·조사 의뢰의 구분','현행 전결·개별 지정·지역별 고시 추가 확인')]:legal.groups.map(x=>card(x.title,x.laws,x.desc)),{layout:'grid',status:'대표 27개 업무 매핑 · 전체 위탁사무 목록과 구분',links:[doc('처·컨셉 매핑','legal/mapping.html'),doc('법령 원문·확인 범위','legal/sources.html')]}),
 ...rows.flatMap(r=>[slide(r.id,r.title,r.law,[card('수행 근거·기관',r.mode,r.principal,r.org),card('TS 처리내용',r.work),card('권한 경계·AX 연결',r.boundary,r.proposal)],{links:[doc('하위 업무·처·컨셉 매핑','legal/mapping.html?mode=law&law='+r.id),...(r.official?[doc('TS 공식 업무안내',r.official)]:[]),...r.refs.map(id=>legal.sources.find(s=>s.id===id)).filter(Boolean).map(s=>doc(s.name,s.url))],status:r.status+' · '+legal.date})])
]};}
function sources(){return {title:'근거·확인 범위',slides:chunks(legal.sources,3).map((list,i)=>slide('sources-'+i,'법령 원문과 적용 판본 '+(i+1),'출처·시행일·수행 권한의 함께 확인',list.map(s=>card(s.name,s.effective)),{links:list.map(s=>doc(s.name,s.url)),status:'기존 근거 원장 기준 '+legal.date}))};}
function requirements(d){return chunks(d.requirements_detail||[],2).map((list,i)=>slide('requirements-'+i,'요구사항·검수 기준 '+(i+1),'기능ID → 입력·연계 → 인수조건 → 시험 → 공수의 추적',list.map(r=>card(r.id+' · '+r.name,'기능: '+r.requirement,'인수조건: '+r.acceptance,'데이터·연계: '+(r.data||'입력자료 명세 확인 필요')+' / '+(r.interface||'연계 협의 필요'),'검증·공수: '+(r.test||'검수항목 협의')+' / '+(r.wbs||r.proposed_wbs||'미연결'))),{status:planning,links:[doc('RFP 상세 명세',d.folder+'/04_RFP_요구검수.html')]}));}
function costs(d){return [
 slide('cost',d.name+' · 사전 공수·대가','대표 상세설계 업무의 증분 공수이며 전체 사업비와 구분',[
 card('기준 시나리오','증분 공수: '+(d.mm_total==null?'미산정':d.mm_total+' MM'),'직접인건비: '+(d.labor==null?'미산정':Number(d.labor).toLocaleString('ko-KR')+'원'),'원장에 명시한 문서·규칙·화면·연계·검증 범위 가정'),
 card('산정 해석','공통 엔진·제경비·기술료·세금·유지관리의 별도 확인','기존 기능의 재사용 증거 확인 후 업무별 증분 산정','기존 서버 활용 · 신규 인프라 구매 0원','확정 예산·견적·계약금액과 구분')
 ],{status:'설계자 공수 가정 · 실적 미검증',links:[doc('인력·대가 상세 산정',d.folder+'/05_인력_대가.html')]}),
 ...chunks(d.wbs||[],2).map((rows,i)=>slide('wbs-'+i,'투입 작업과 산정 범위 '+(i+1),'수량·역할별 인월·결과의 연결',rows.map(w=>card(w.id+' · '+w.description,'물량: '+w.quantities,'투입: '+w.mm+' MM / '+Object.entries(w.role_mm).map(([k,v])=>k+' '+v+' MM').join(' · '),'직접인건비: '+w.direct_labor_won.toLocaleString('ko-KR')+'원',w.estimate_status)),{status:'대표 업무의 증분 WBS · 총사업비 아님'}))
];}
function effects(d){const v=impact.departments[d.code];if(!v)return [];
return [
 slide('why','왜 이 과업이 필요한가',v.why,[card('검증할 현재 한계',v.gap),card('CCK 적용방법',v.method),card('현장 확인',v.records,'확인 주체: '+v.owner)],{status:planning,links:(v.sourceIds||[]).map(id=>impact.sources.find(s=>s.id===id)).filter(Boolean).map(s=>doc(s.title,s.url))}),
 ...v.metrics.flatMap(m=>[slide(m.id,m.title,'정량 목표안과 효과가 발생하는 경로의 함께 확인',[
 card('목표안',targetLabel(m)+' 목표안',m.baselineStatus,m.targetStatus,m.comparison),
 card('측정·산식',m.formula,m.statistic,m.measure),
 card('개선 경로·해석',m.mechanism,m.model,m.value)
 ],{status:m.evidenceLevel,links:[doc('이 지표 측정방법',deptPath(d)+'?view=impact&metric='+m.id+'&slide='+m.id+'-method-1')]}),
 ...measurement.sections(m.id).map((section,i)=>slide(m.id+'-method-'+(i+1),m.title+' · 측정 '+(i+1)+'/4',section.title,
 chunks(section.rows,3).map((rs,j)=>card(j===0?'측정 정의·수집':'검토·판정',...rs.map(([k,v])=>k+': '+v))),
 {status:'측정 설계안 · 기준선·실측값·표본 수·기관 승인 미확정',links:[doc('39개 지표 측정명세','downloads/TS_정량평가_측정명세.md'),doc('빈 결과 기록표','downloads/TS_정량평가_결과기록표.csv')]}))
 ]),
 ...chunks(measurement.common,2).map((rs,i)=>slide('measurement-common-'+i,'공통 평가기준 '+(i+1),'자료 수집부터 효과 판정·증빙 확정까지',rs.map(([k,v])=>card(k,v)),{status:'기관 협의용 측정 기준 · 법정 의무기준과 구분',links:measurement.sources.map(s=>doc(s.title,s.url))})),

 slide('effect-boundary','성과 검증과 적용 조건','기준선·동일 SI 개선안·AI 추가효과를 구분한 판단',[card('적용 조건',v.conditions),card('품질·안전 기준',v.guard),card('평가 기록',v.records,'단축시간을 감축 인원으로 환산하지 않는 원칙')],{status:'목표 달성·인수 전 검증 필요'})
];}
function flow(d){return [
 slide('flow-map','서비스 흐름 · '+d.name,'대상·기준 확인부터 실제 결과·잔여과제 인계까지',[card('흐름 요약',d.plan),card('사용자·실행',d.user,'인계: '+d.action,'완료: '+d.done)],{image:'assets/'+d.code+'_서비스흐름도.svg',alt:d.name+' 서비스 흐름도',status:planning}),
 slide('replan','상황 변화에 따른 재계획','새 증거가 들어오면 확인 범위와 후속 실행계획의 조정',[card('변경 상황',d.change),card('재계획 내용',d.replan),card('결과·책임',d.done,d.exception,d.excluded)],{status:planning}),
 slide('flow-data','업무 데이터와 처리조건','같은 사건·대상·판본에 대한 자료인지 확인한 후 업무 수행',[card('처리 대상',d.object,d.entities),card('핵심 식별·근거 항목',d.fields),card('연계 선행조건',d.system,d.prerequisites,d.partner)],{status:planning})
];}
function archSlides(code,section){const u=architecture.units.find(u=>u.code===code)||architecture.units[0];
const blocks={
 diagram:[slide('architecture','전체 아키텍처 · '+u.name,'사용자·공통 기능·업무 모듈·데이터·원시스템의 책임 경계',[],{image:'assets/architecture-v2/'+u.code+'_전체아키텍처.svg',alt:u.name+' 전체 아키텍처',wideImage:true,status:architecture.status,links:[doc('상세 아키텍처 명세','downloads/architecture-v2/'+u.code+'_상세아키텍처.md')]}),slide('arch-summary','구조를 읽는 세 가지 기준',u.goal,[card('업무 단위',u.object,'사용자: '+u.user,'기존 기반: '+u.system),card('업무 완료',u.action,u.done),card('권한과 예외',u.exception,u.excluded)],{status:planning})],
 modules:[...u.modules.map(m=>slide(m.id,m.id+' · '+m.name,m.responsibility,[card('입력·참조',m.input,'저장소: '+m.stores.join(' · ')),card('처리결과',m.output,'연계: '+m.connections.map(c=>c.id+' '+c.route).join(' / ')),card('검수·재사용',m.acceptance,m.reuse,'요구사항: '+m.requirement_refs.join(' · '))],{status:m.status})),...chunks(architecture.common,3).map((list,i)=>slide('common-'+i,'공통 플랫폼 구성요소 '+(i+1),'처별 업무 모듈에서 공유하는 기능·책임·검수 기준',list.map(m=>card(m.id+' · '+m.name,m.responsibility,'입력: '+m.input,'출력: '+m.output,'검수: '+m.acceptance)),{status:'공통 12개 기능 · 실제 재사용 범위 검증 전'}))],
 interfaces:architecture.interfaces.map(c=>slide(c.id,c.id+' · '+c.name,c.from+' → '+c.to+' / '+c.mode,[card('요청·응답','입력: '+c.input,'출력: '+c.output),card('권한·실패 처리',c.permission,c.failure),card('구현 협의',c.status,architecture.interface_notice)],{status:'제안된 논리 계약 · 실제 API 명세와 구분'})),
 data:chunks(architecture.stores,2).map((list,i)=>slide('data-'+i,'데이터·공식 원장 경계 '+(i+1),'저장소별 필드·관리 주체·보존·정정 책임의 구분',list.map(s=>card(s.id+' · '+s.name,'필드: '+s.fields,'관리: '+s.owner,s.authority,s.lifecycle)),{status:'논리 저장구조 · 신규 DB 장비 수량 아님'})),
 runtime:[...chunks(architecture.runtime,2).map((list,i)=>slide('runtime-'+i,'기존 서버 내 실행구조 '+(i+1),'구매 없이 기존 자원의 가용량·격리·복구 조건을 확인',list.map(r=>card(r[0]+' · '+r[1],r[2],r[3])),{status:architecture.deployment_notice})),...chunks(architecture.failures,2).map((list,i)=>slide('failures-'+i,'실패·중단·복구 경로 '+(i+1),'실패한 실행을 완료로 처리하지 않는 상태 관리',list.map(f=>card(f[0],'처리 구성요소: '+f[1],f[2],'재개: '+f[3])),{status:planning}))],
 trace:chunks(u.requirements||[],2).map((list,i)=>slide('trace-'+i,'요구사항·RFP 추적 '+(i+1),'구성요소 설명과 실제 인수조건의 연결',list.map(r=>card(r.id+' · '+r.name,r.acceptance,'데이터: '+(r.data||'입력자료 명세 확인 필요')+' / 연계: '+(r.interface||'연계 협의 필요'),'검증: '+(r.test||'검수항목 협의')+' / WBS: '+(r.wbs||r.proposed_wbs||'미연결'))),{status:planning}))
};
if(!blocks.trace.length)blocks.trace=[slide('trace-pending','RFP 요구사항 확정 전','업무 모듈의 검수 후보를 현업과 요구사항으로 구체화',u.modules.map(m=>card(m.id+' · '+m.name,m.acceptance,m.status)),{layout:'grid',status:'KATRI 모듈 검수 후보 · 기존 처별 104개 요구에 합산하지 않음'})];const keys=section&&blocks[section]?[section]:Object.keys(blocks);return keys.flatMap(k=>blocks[k]);}
function department(d,view,q){let slides=[];
if(q.get('view')==='impact')slides=effects(d);
else if(q.get('view')==='requirements')slides=[...requirements(d),...costs(d),...chunks(d.annual||[],3).map((a,i)=>slide('annual-'+i,'2027년 과업 후보 '+(i+1),'대표 상세설계와 확장·계속업무의 산정 범위 구분',a.map(x=>card(x.id+' · '+x.title,x.classification,x.cost_scope)),{status:'확정 과업·예산과 구분'}))];
else if(q.get('view')==='evidence')slides=[mandateSlide(d),slide('evidence','문제·수행 근거',d.problem,[card('현행 업무',d.asis,d.system),card('전환 제안',d.ax,d.prerequisites),card('책임·검증',d.excluded,d.metric,d.denominator)],{status:planning}),...bindingSlides(d)];
else if(view===2)slides=archSlides(d.code,q.get('arch'));
else if(view===1)slides=flow(d);
else slides=[
 slide('purpose',d.title,d.goal,[card('대상·수혜자','사용자: '+d.user,'수혜자: '+d.beneficiary,'업무 대상: '+d.object),card('문제·기존 기반',d.problem,'현행: '+d.asis,'활용: '+d.system),card('전환 후 결과',d.ax,d.done)],{status:planning,links:[doc('담당 처·법령·컨셉 연결',mandates.mappingPath(d.code))]}),
 mandateSlide(d),
 slide('concept','서비스 컨셉 · '+d.name,'서비스 이용 장면과 달라지는 업무·편익',[card('기대하는 업무 변화',d.ax,d.action),card('적용조건·성과',d.prerequisites,d.metric,d.denominator)],{image:'assets/isometric-v1/'+d.code+'_컨셉도.png',alt:d.name+' 2.5D 서비스 컨셉',status:'서비스 이용 장면 예시 · 시스템 아키텍처와 구분'}),
 ...flow(d),
 ...effects(d),
 slide('implementation','기술·책임·완료조건','목표를 수행하는 AI와 공식 판단·실행 권한의 결합',[...technical.slice(0,2),card('업무별 책임',d.excluded,d.exception,d.done)],{status:planning,links:[doc('전체 아키텍처',deptPath(d,2)),doc('요구사항·산정',deptPath(d)+'?view=requirements')]})
];
return {title:d.name,slides};}
function catalog(inspection){const list=inspection?depts.slice(8):depts;return {title:'처별 AX 전환 제안',slides:[
 slide('catalog','처별 목적과 전환과업','같은 공통 플랫폼 위에서 업무별 판단·실행·편익의 차이를 구체화',[
 card('공통 기반','NOA의 목표 기반 업무 수행','aRDa 조직지식·로컬 LLM·기존 서버 활용','신규 인프라 구매 0원 · 비전 제외'),
 card('부서별 추가범위','각 업무의 자료·기준·예외·연계·검수','이미 계약된 동일 납품분과 증분 개발의 구분','업무별 실제 API·권한·원문 자료 확보'),
 card('도입 판단','국민·기업 편익과 기관의 임무성과 중심','현행·동일 SI 개선·AI 추가안의 비교','정량 목표는 실측 전 협의용 가설로 관리')],{status:planning}),
 ...list.map(d=>slide(d.code,d.name,d.title,[card('목적·편익',d.goal,d.beneficiary),card('전환 내용',d.ax,d.system),card('완료·검증',d.done,d.metric)],{links:[doc('사업 정의·컨셉',deptPath(d)),doc('서비스 흐름',deptPath(d,1)),doc('전체 아키텍처',deptPath(d,2)),doc('요구사항·대가',deptPath(d)+'?view=requirements')],status:planning}))
]};}
function katriDeck(q){const selected=katri.cards.find(c=>c.id===q.get('case')),cards=selected?[selected]:katri.cards;return {title:'KATRI 문서 1차 검토',slides:[
 slide('katri-purpose','담당자 검토 이전의 자료 준비 강화',katri.why,[card('검토 범위','조건별 자료 수집·누락·불일치 후보 확인','원문 위치·기준판본·보완회차의 연결','정형 텍스트·표를 우선 적용'),card('후속 업무','담당자의 쟁점 확인·보완 요청·재검토','실차 검사·시험·안전판정의 전문 책임 유지','실제 자료·권한 확보 후 대표 유형 실증')],{status:planning}),
 ...cards.flatMap(c=>[
 slide(c.id,c.name,c.goal,[card('확인된 업무',c.fact,'연결 부서: '+c.org),card('AX 추가가치',c.delta,c.reuse),card('결과·책임',c.output,c.human)],{links:c.refs.map(id=>katri.sources.find(s=>s.id===id)).filter(Boolean).map(s=>doc(s.title,s.url)),status:'공식업무 근거 + 기획 제안'}),
 slide(c.id+'-check',c.name+' · 입력과 검토항목','업무 조건과 제출 자료를 대조한 1차 검토',[card('입력자료',c.input),card('확인할 항목',c.check)],{links:[doc('상세 아키텍처','architecture.html?unit='+c.id)],status:planning})
 ]),
 slide('katri-flow','수집부터 보완 해소까지','문서 제출 완료와 전문검토 완료를 구분',katri.flow.map(x=>card(x[0],x[1])),{layout:'grid',status:planning}),
 ...chunks(katri.example.items,2).map((a,i)=>slide('katri-example-'+i,'담당자가 확인할 쟁점 예시 '+(i+1),katri.example.label,a.map(x=>card(x[0],x[1],'AI 표시: '+x[2],'후속 확인: '+x[3])),{status:'가상 사례 · 실제 TS 사건 또는 AI 실행 결과 아님'})),
 slide('katri-quality','누락 방지 효과의 검증',katri.validation,katri.metrics.map(m=>card(m[0],m[1],m[2])),{layout:'grid',status:'기준선·실측 개선율 미확보'})
]};}
function arsDeck(){return {title:'대국민 ARS 업무지도',slides:[
 slide('ars-purpose','안내 이후의 실제 업무 완료 지원','기존 메뉴·SMS 경로를 활용하여 국민의 다음 행동까지 연결',[card('기존 접점','자동차검사·적성검사·도로자격·교통물류·위치안내·기타업무','고정 메뉴 선택·SMS·상담원 연결 경로','메뉴 존재와 실제 예약·신청 완료의 구분'),card('공통 적용범위',ars.scope,ars.source.basis)],{links:[doc(ars.source.title,ars.source.url)],status:ars.status}),
 ...ars.groups.map(g=>slide('ars-'+g.key,g.title,g.goal,[card('기존 경로',g.routes.map(r=>r.path+' / '+r.label+' → '+r.action)),card('업무 전환',g.after,g.organization,g.mapping)],{status:planning})),
 ...chunks(ars.flow,3).map((a,i)=>slide('ars-flow-'+i,'목적 확인·실행·상담 인계 '+(i+1),'메뉴 이동 횟수보다 정당한 업무 완료 여부의 확인',a.map(x=>card(x[0],x[1])),{status:planning}))
]};}
function updateDeck(){return {title:'공통 설계·추가 내용',slides:[
 slide('common-platform','aRDa·NOA·ERP의 조직업무 연결','근거 확인 → 업무 계획·수행 → 승인 → 시스템 반영 → 결과 검증',technical,{status:planning}),
 ...chunks(updates.stages,2).map((a,i)=>slide('platform-'+i,'조직운영 설계 단계 '+(i+1),'연구개발·제품 확장·기관 적용 범위의 분리',a.map(x=>card(x.n+' · '+x.title,x.goal,'산출물: '+x.output,'수락: '+x.accept,x.limit)),{status:'참조 대화의 설계안 · 실제 구현과 구분'})),
 ...chunks(updates.concepts,2).map((a,i)=>slide('preparation-'+i,'적용 준비항목 '+(i+1),'기준·자료·권한·상태를 실제 업무 조건과 연결',a.map(x=>card(x.id+' · '+x.title,x.goal,'입력: '+x.input,'산출물: '+x.output,'검수: '+x.accept)),{status:planning}))
]};}
function discoveryDeck(){return {title:'업무 전환 후보·근거',slides:[
 ...discovery.cases.map(c=>slide(c.id,c.org+' · '+c.name,c.label,[card('사례에서 확인한 변화','기존: '+c.before,'전환: '+c.after,c.facts),card('TS 적용 검토',c.question,c.fit),card('한계',c.limits,c.hypothesis)],{links:c.refs.map(id=>discovery.sources.find(s=>s.id===id)).filter(Boolean).map(s=>doc(s.title,s.url)),status:c.stage+' · '+c.at})),
 ...discovery.candidates.flatMap(c=>[slide(c.id,c.title,c.benefit,[card('현재 문제·주체',c.problem,c.actor),card('전환 구조','기존: '+c.before,'전환: '+c.after,c.delta),card('기술·검증',c.cck,c.metric,c.baseline)],{status:planning}),...chunks(c.steps,2).map((a,i)=>slide(c.id+'-'+i,c.title+' · 흐름 '+(i+1),c.trigger,a.map(s=>card(s.who+' · '+s.title,s.detail)),{status:planning}))])
]};}
function getDeck(route){const url=new URL(route,'https://local/'),q=url.searchParams;let p=decodeURI(url.pathname).replace(/^\//,'');const aliases={'10_세대화_통합검토.html':'about.html','11_중장기목표_처별성과.html':'vision.html','16_조직도_수행업무_분석.html':'organization.html','17_조직별_AX_전환제안.html':'solutions.html'};p=aliases[p]||p;
if(p.startsWith('처별/')){const d=depts.find(d=>p.startsWith(d.folder+'/'));if(d)return department(d,p.includes('/03_')?2:p.includes('/02_')?1:0,q);}
if(p==='architecture.html'){const u=architecture.units.find(u=>u.code===q.get('unit'))||architecture.units.find(u=>u.code==='DF');return {title:u.name+' · 아키텍처',slides:archSlides(u.code,q.get('arch'))};}
if(p==='about.html')return {title:'TS 기관 이해',slides:institution()};
if(p==='vision.html')return vision();if(p==='organization.html')return organization();
if(p==='solutions.html'||p==='inspection.html')return catalog(p==='inspection.html');
if(p==='legal/sources.html')return sources();if(p==='legal.html'||p.startsWith('legal/'))return legalDeck(p.split('/')[1]?.replace('.html',''));
if(p==='katri.html')return katriDeck(q);if(p==='ars.html')return arsDeck();
if(p==='updates.html')return updateDeck();if(p==='discovery.html')return discoveryDeck();
return home();}
function paginate(deck){return {...deck,slides:deck.slides.flatMap(s=>s.cards.length>3?chunks(s.cards,2).map((cards,i)=>({...s,id:i===0?s.id:s.id+'-part-'+(i+1),title:s.title+' · '+(i+1)+'/'+Math.ceil(s.cards.length/2),cards,layout:undefined})):s)}}
const proposals=require('./proposal-design.cjs');
const expanded=route=>proposals.enrich(route,getDeck(route));
module.exports={getDeck:route=>paginate(expanded(route)),getRawDeck:expanded};

