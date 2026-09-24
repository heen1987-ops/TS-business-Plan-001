const {departments}=require('./data.json');
const architecture=require('./architecture-v2.json');
const impact=require('./impact.json');
const law=require('./law-mapping.cjs');
const profiles=require('./proposal-profiles.json');
const evidence=require('./proposal-evidence.json');
const status=profiles.status;
const card=(title,...bullets)=>({title,bullets:bullets.flat().filter(Boolean)});
const link=(label,to)=>({label,to});
const table=(title,headers,rows)=>({title,headers,rows});
const section=(id,title,message,cards=[],extra={})=>({id:'detail-'+id,title,message,cards,status,links:[],detail:true,...extra});
const strip=text=>String(text||'').split(' / case_id')[0];
function context(code){const d=departments.find(x=>x.code===code);if(!d)return null;return {d,p:profiles.profiles[code],u:architecture.units.find(x=>x.code===code),v:impact.departments[code],mandate:law.forDepartment(code),sources:evidence.sources.filter(s=>s.code===code)}}
function stages(c){const {d,p,u}=c;return [
 ['S01','제출자·업무담당자','사건 생성·범위 확정',p.event,'case_id·대상키·자료목록·사용목적','처리근거·업무권한 미확정 시 반입 보류'],
 ['S02','aRDa 연계·수신/변환기','원문 수신·구조화',strip(u.modules[0].input),'해시·판본·문단/표 위치·결손목록','판독불가·대상 불일치 → 보완 대기'],
 ['S03','NOA·로컬 LLM·규칙도구','근거 검토·계획 구성',d.plan.join(' / '),'계획판본·질문·필요자료·선행조건·완료증거','근거 없는 추정 → 미확인 유지·전문가 확인'],
 ['S04','현업 검토자·권한자','전문 검토·실행 승인','대상·근거·도구·인자·수신자·계획판본 확인','승인참조·plan_hash·argument_hash','변경된 계획·권한 회수 → 기존 승인 재사용 차단'],
 ['S05','NOA 실행기·연계 어댑터','승인 범위 수행',d.action||u.action,'action_id·멱등키·요청/접수기록','응답 유실 → 결과 미확인·조회 대사 후 재시도 판단'],
 ['S06','기존 시스템·현장 담당','공식 결과·실행 증거 수신',p.closure,'공식 결과참조·판본·시각·해소/미해결 항목','AI 초안·요청 성공을 공식 완료로 계산하지 않음'],
 ['S07','NOA·담당 검토자','대사·재계획',d.change,'기존/변경 계획·사유·잔여과업','영향받는 승인 보류 → S03 재검토; 원 이력 보존'],
 ['S08','업무책임자·평가자','종결·성과 확인',d.done,'종결 근거·인수 담당·후속관측·평가 기록','미완료·중도종료·관측누락을 성과 분모에서 숨기지 않음']
 ]}
const privacyStages=[
 ['P01','목적·근거 등록','자료별 목적·처리주체·법적근거·허용행위·보유기준 확인','미확정 자료 반입 보류 → 현업·개인정보 담당 확인','C01·C02 / DS1'],
 ['P02','수신·격리','출처·판본·해시·사건 소속·제출항목 확인','과다 제출·판독불가·제3자 정보는 격리·보완','C02 / DS1'],
 ['P03','최소화·식별 분리','분석에 필요한 필드와 연락·직접식별정보의 분리','정보가 없는 자료에 별도 식별 DB 생성 불필요','C03 / 제한 원천·DS1'],
 ['P04','권한 검색','문서 ACL·사건 소속·목적·자료등급으로 조회 전/반환 전 통제','권한 회수 후 인용·요약·내보내기까지 차단','C01·C04 / DS2'],
 ['P05','로컬 추론','필요한 문단·필드와 근거참조만 모델 입력','외부 모델 자동 우회·업무자료 자동 학습 이용 차단','C07 / DS3·DS4'],
 ['P06','산출물 검수','식별정보·다른 사건 정보·희소 집계 재식별 위험 검토','노출 후보는 범위 축소·수정 후 담당자 확인','C09·C12'],
 ['P07','연계·제공','수신자·목적·항목·위탁/제3자 제공 관계·승인판본 확인','수신자 변경·권한 불일치·미확인 응답 시 전송 재검토','C10 / DS5'],
 ['P08','권리행사·정정','본인확인 → 공식 원천 확인 → 파생자료 영향 확인 → 회신','제한·보존 필요 시 근거와 구제 경로를 담당자가 설명','C12·C10 / DS1~DS6'],
 ['P09','보관·파기','업무별 보존근거·기간·기산점·종료조건에 따른 정리','법적 보존 필요 자료는 제한보관; 이용차단과 파기완료 구분','DS1~DS6·원천 관리주체'],
 ['P10','복원·잔존 확인','삭제·정정·권한회수 목록 재적용 후 재노출 점검','백업 복원으로 파기·회수 상태가 되돌아가지 않도록 통제','운영·복구 담당']
];
function build(code){const c=context(code);if(!c)return [];const {d,p,u,v,mandate,sources}=c,base=d.folder+'/01_사업정의.html';const sourceLinks=sources.map(s=>link(s.title,s.url));const reqs=d.requirements_detail||[];
 const six=section('sixw','육하원칙 · 사업을 이해하는 여섯 질문',p.mission,[
 card('누가 · 수행주체와 수혜자','직접 사용자: '+d.user,'최종 수혜자: '+d.beneficiary,'주관 검토 처: '+d.name+' / 공식 업무안내의 담당 표시와 내부 전결·결재권은 구분'),
 card('무엇을 · 업무 한 건의 범위','처리단위: '+d.object,'제안: '+d.title,'완료조건: '+p.closure),
 card('언제 · 시작과 변경 조건',p.event,'신규 접수뿐 아니라 자료·기준·결과 변경 시 영향받는 과업 재검토','2027년 적용 검토안. 착수·실증 일정은 자료·권한·환경 확보 후 확정'),
 card('어디서 · 업무·시스템 경계','기존 기반: '+d.system,'기관 내부 NOA 업무공간과 기존 로컬 추론환경에서 처리. 공식 업무 원장은 원시스템에 유지','외부 참여자는 허용된 제출·확인 채널 이용. 기관별 접근권한이 자동 통합되는 구조 아님'),
 card('왜 · 공공적 목적',p.why,'현행 기능의 존재와 잔여 문제의 발생규모를 구분. 규모·비용·효과는 현장 기준선으로 입증'),
 card('어떻게 · CCK 기반 전환',p.increment,'aRDa 문서·판본 → NOA 과업·근거 → 로컬 LLM 의미 해석 → 승인 도구 실행 → 공식 결과 대사','제품 재사용·업무별 연계·추가 Agentic OS 개발·현업 검수를 각각 구분')],{links:sourceLinks});
 const why=section('why','왜 필요한가 · 공공목적에서 추가과업까지',p.why,[
 card('왜 TS인가',mandate.primary.task,'법령·제도 관계: '+mandate.primary.law.law,mandate.primary.ownerRole,mandate.primary.concepts.find(x=>x.code===code)?.reason,mandate.primary.note,'이번 컨셉의 배정 이유: '+mandate.rationale),
 card('왜 지금 검토하는가',p.event+' 시 필요한 판단·증거의 연결','기준·자료·프로그램 변경에 따라 검토범위가 달라지는 업무구조에 대응','현재 미흡 규모를 단정하지 않고 '+v.records+'를 확보하여 추진 타당성 확인'),
 card('왜 AI가 추가로 필요한가',p.increment,'비AI 비교안: '+p.baseline,'AI 적용으로 추가되는 검수·오류수정·운영 부담까지 포함하여 순편익 확인'),
 card('무엇이 달라져야 하는가','현재: '+d.asis,'목표 운영: '+d.ax,'국민·기업 편익: '+v.metrics.map(m=>m.value).join(' / '),'문서 생성량이 아닌 '+p.closure+'를 업무결과로 관리')],{links:[...sourceLinks,link('법령·업무·처 매핑',law.mappingPath(code))]});
 const gap=section('limits','현행 기반·한계 가설·원인 경로','기존 기능을 활용하면서 어디에서 판단·인계·결과 확인이 어려운지 검증',[card('공개 확인된 현행 기반',...sources.map(s=>s.fact)),card('현장 검증할 한계',d.problem,v.gap,'발생률·원인·담당자 실제 작업은 기준선 조사 전. 공개 업무안내만으로 현행 운영의 결함을 단정하지 않음'),card('문제가 생길 수 있는 경로',p.chain),card('반대 근거와 채택 조건','현행 시스템이 이미 같은 근거연결·재계획·대사를 수행하면 해당 범위 재사용','체크리스트·필드 검증으로 충분하면 비AI 개선 채택','동일 SI 조건 대비 AI의 효과가 없거나 중요 오류·현업 부담이 증가하면 적용범위 축소')]);
 const proof=section('evidence','필요성 근거와 확인 수준','업무 존재의 근거·기획 해석·실제 효과를 나누어 판단',[],{tables:[table('공식 근거 대조',['근거','확인 내용','이 자료로 확정할 수 없는 사항'],sources.map(s=>[s.title+' / '+s.date+' / 열람 '+evidence.date,s.fact,s.limit]))],links:sourceLinks,status:evidence.status});
 const method=section('method','해결 방법 · 역할과 추가 개발범위','의미 해석·정확한 계산·전문 판단·실행권한을 각 처리주체에 배분',[
 card('AI가 수행할 검토',p.increment,'근거를 제시하지 못하는 항목은 미확인으로 유지. 새 자료가 들어오면 기존 계획과의 차이·변경 이유 기록'),
 card('기존 프로그램·전문 도구',p.baseline,'정형 식별키·필수항목·기간·단위·계산은 검증된 규칙 사용. 모델 답변으로 공식 값을 덮어쓰지 않음'),
 card('사람의 실제 판단',d.user+'의 근거 확인·예외 해석·조치 승인','승인 전 대상·계획·도구인자·수신자 확인. 계획이 바뀌면 해당 승인 재확인','공식 권한 유지: '+d.excluded),
 card('CCK 주관 납품 범위','재사용 후보: NOA 업무공간, aRDa 문서·지식, 기존 로컬 추론·인증·로그','추가 개발 후보: 사건별 계획·도구 실행·결과검증·재계획, 처별 모듈·연계 어댑터·검수셋','Agentic OS의 계획·실행·검증·재계획은 추가 개발 후보. 제품 재사용·기관 적용·검증 범위는 협의 후 확정','서버 가용량·사용권·제품판본 대조 후 재사용 범위 확정. 신규 인프라·비전·장비 제어 제외')]);
 const scenario=section('scenario','업무 사례 · 정상 처리와 상황 변화',p.scenario[0],[card('상황과 판단',p.scenario.slice(1)),card('상황이 바뀌면',d.change,'예외: '+d.exception,'재계획: '+(d.replan||d.plan).join(' → '))],{tables:[table('처리 단계별 상세 명세',['단계','수행주체','처리','입력·판단','결과','예외·중단'],stages(c))],status:'가상 업무 사례·설계 예시 / 실제 TS 사건·결과와 구분'});
 const concept=section('concept','컨셉도 · 대상·기관 역할·공공 편익','누구의 어떤 어려움을 어떤 결과로 바꿀 것인가',[card('서비스의 중심',d.object,p.why),card('제공하는 결과',d.ax,p.closure),card('설계의 성립조건',p.pilot,'편익 측정: '+v.metrics.map(m=>m.title).join(' / '))],{diagram:{type:'concept',code},links:[link('정량효과·측정명세',base+'?view=impact')]});
 const overall=section('overall','전체 아키텍처 · 구성요소와 책임 경계','기존 원천·사용자·기관 내부 실행·저장·통제의 전체 배치',[card('배치 전제','기존 서버 내 논리 프로세스·저장영역 구분. 그림의 박스 수가 신규 서버 수를 의미하지 않음','반입·연계는 승인된 접점만 사용. 실제 망구성과 주소·계정·제품판본은 기관 설계 시 확정'),card('권한 관문','C01 권한 → C09 승인 → C10 연계 대사. 모델이 원시스템 DB에 직접 쓰는 경로 제외','외부 시스템 조회·등록 권한, 승인 토큰 유효기간, 감사 책임의 분리')],{diagram:{type:'overall',code},tables:[table('처별 핵심 모듈',['ID·모듈','책임','입력','출력','검수'],u.modules.map(m=>[m.id+' '+m.name,m.responsibility,strip(m.input),strip(m.output),m.acceptance])),table('공통 플랫폼 세부 구성',['ID·기능','책임','입력 → 출력','재사용·적용 상태'],architecture.common.map(m=>[m.id+' '+m.name,m.responsibility,m.input+' → '+m.output,m.reuse+' / '+m.status]))]});
 const service=section('service','서비스 아키텍처 · 역할·승인·예외·재계획','담당자 요청부터 공식 결과 대사까지 하나의 사건으로 연결',[card('상태 전이','자료 준비 → 검토 구성 → 담당자 검토 → 실행 승인 → 수행 → 결과 대사 → 종결 검토','보완 대기·권한 거부·처리결과 미확인은 완료와 별도 상태'),card('재계획 조건',d.change,'계획판본·입력 근거가 달라지면 영향받는 승인 보류. 무한 재시도 없이 과업별 시도·시간 상한과 사람 인계'),card('완료 판정',p.closure,'원문 작성·파일 내보내기·요청 성공·공식 접수·업무 종결의 상태를 각각 관리')],{diagram:{type:'service',code},tables:[table('서비스 내부 모듈 연결',['업무모듈','호출 공통기능','연계 계약','요구사항'],u.modules.map(m=>[m.id+' '+m.name,m.common.join(' · '),m.connections.map(x=>x.id+' '+x.route).join(' / '),m.requirement_refs.join(' · ')]))]});
 const data=section('data','데이터 흐름도 · 입력·변환·저장·대사','공식 원천과 AI 검토자료를 구분하고 모든 파생자료의 계보 유지',[card('업무별 연결키',d.fields,'한 사건의 대상·기간·판본이 다른 자료는 자동 병합하지 않고 불일치 표시'),card('원천과 파생의 구분','공식 판단은 '+d.system+'의 권한 있는 기록을 참조','NOA 계획·검토 상태는 DS3, 승인·실행 대사는 DS5에 저장. AI 검토 완료가 공식 원장 변경을 의미하지 않음'),card('자료 계보','source_id → source_version·hash → 문단/표 위치 → case_id → plan_version → approval_ref → action_id → receipt_id','수집시점·효력시점·업무 적용시점을 구분. 최신 수집본이 모든 사건의 적용기준은 아님')],{diagram:{type:'data',code},tables:[table('논리 저장소와 수명주기',['저장소','필드','관리·공식성','정정·보관·파기'],architecture.stores.map(s=>[s.id+' '+s.name,s.fields,s.owner+' / '+s.authority,s.lifecycle]))]});
 const contracts=section('interfaces','연계 계약 · 요청·응답·실패 처리','실제 API 확보 전의 논리 계약. 내보내기·수동 인계도 검증 가능한 완료증거 필요',[],{tables:[table('인터페이스별 처리',['계약·경로','입력','출력','권한','실패·복구'],architecture.interfaces.map(i=>[i.id+' '+i.name+' / '+i.from+' → '+i.to,i.input,i.output,i.permission,i.failure]))],links:[link('상세 연계 검토','architecture.html?unit='+code+'&arch=interfaces')]});
 const privacy=section('privacy','개인정보 처리도 · 목적에서 정정·파기까지','로컬 LLM 사용과 처리의 적법성·제공 권한·보유기준을 별도로 확인',[
 card('이 업무에서 필요한 최소자료',p.minimum,p.identity),
 card('처별 주의 정보와 경계',p.sensitive,p.share,'개인정보와 기업 영업비밀의 보호목적을 구분하고 모두 접근통제 적용'),
 card('처리근거·전제','실제 처리항목·목적·위탁/제공 관계·보유기준은 TS 개인정보파일·처리방침·기록관리·계약 대조 후 확정','가명처리·온프레미스·사람 승인만으로 적법성이 자동 확보되는 것은 아님','개인정보가 없는 집계·기기자료는 불필요한 식별정보 연결을 새로 만들지 않음')],{diagram:{type:'privacy',code},links:evidence.privacy.map(s=>link(s.title,s.url)),status:'제안된 개인정보 처리 설계 / 실제 TS 처리현황·법적 적용 판단 확정 전'});
 const life=section('privacy-lifecycle','개인정보 전주기 · 보존·권리행사·복원','파기 대상과 보존 근거가 있는 기록을 나누고 파생물까지 추적',[],{tables:[table('법령 원문 확인 수준',['법령·조문','시행·열람','확인 내용','적용·확인 한계'],evidence.privacy.map(s=>[s.title,s.effective+' / 열람 '+evidence.date,s.fact,s.limit])),table('전주기 처리·예외',['단계','행위','확인·처리','예외 경로','구성요소'],privacyStages),table('파생자료별 추가 통제',['대상','관리 기준','정정·파기 전파'],[
 ['원문·첨부 / DS1','purpose_id·legal_basis_ref·retention_rule_ref·source_owner·자료등급','공식 원천의 보존근거 확인 후 제한보관 또는 파기. 원문 없이 필요증거를 삭제하는 처리 방지'],
 ['추출문·색인·임베딩 / DS2','source_version·acl_version·purpose_scope·derived_artifact_ids','원천 권한 회수 즉시 검색 차단. 재색인·삭제 작업의 잔존 확인'],
 ['프롬프트·응답·캐시 / DS3·운영 캐시','최소 문맥·사건 경계·모델판본·보유기준','원문 개인정보의 불필요한 전문 저장 금지. 정정·종료 대상의 캐시 무효화'],
 ['승인·인계 / DS5','수신자·목적·항목·승인해시·제공/위탁 관계','정정·철회 필요 시 수신기관 처리경로 확인. 기술 전송기록과 공식 결과 구분'],
 ['감사·평가 / DS6','접근·권한·실행·정정·파기 이벤트 중심','일반 로그에 원문·비밀값 제외. 정당한 보존이 필요한 감사자료는 제한 접근'],
 ['백업·복원','백업 범위·복원절차·삭제/회수 목록·복구 책임','복원 후 정정·파기·권한 회수를 재적용하고 재노출 검사. 종료 전까지 파기 미완료 상태 관리']
 ])],links:evidence.privacy.map(s=>link(s.title,s.url)),status:evidence.privacyLimit});
 const access=section('access','역할별 접근·승인·외부 제공','조회 가능한 범위와 실행·공개 권한을 별도 부여',[],{tables:[table('권한 정책 초안',['역할','조회 범위','변경·실행','제한'],[
 ['자료 제출자·참여자','본인·자기 기업·자기 사건의 허용 자료','보완자료 제출·본인 정보 정정 요청','타 사건 검색·승인·공식 판정 변경 불가'],
 ['현업 검토자','배정 사건·필요 기준·제한 원문','질문·초안 수정·전문 검토·범위 내 인계 요청','역할명만으로 전체 부서자료 접근 허용 금지'],
 ['공식 권한자·승인자','판단에 필요한 원문·차이·예외·이력','유효한 범위·계획·대상의 승인/반려','서로 다른 사건의 승인 복사·변경 후 승인 재사용 금지'],
 ['AI·실행 서비스 계정','현재 과업의 목적·사건·필드 허용목록','검증된 도구의 제한 실행·결과 수신','직접 식별 원장·타 사건·비허용 외부전송·자기 권한 변경 차단'],
 ['CCK 운영·기술지원','장애 진단에 필요한 제한 로그·승인된 지원 범위','설정 변경은 배포 승인·접근기록·회귀검사 후 수행','운영자라는 이유로 원문·개인정보 포괄 열람 금지'],
 ['평가·감사 담당','승인된 가명 평가자료·접근 및 실행 이력','독립 평가·오류 분류·정정 요청','평가 정답의 계획 생성·모델 튜닝 목적 유출 방지']
 ])]});
 const exceptions=section('exceptions','예외·중단·복구 · 업무를 잘못 끝내지 않는 조건',d.exception,[],{tables:[table('실패 경로와 인수시험',['조건','시스템 동작','복구·완료증거'],[
 ['대상·판본 불일치',d.change,'영향받는 계획·승인만 보류하고 올바른 대상과 근거로 재검토'],
 ['자료 부족·판독 불가','누락 위치·변환 실패·미확인 질문을 분리','제출자 보완 또는 담당자 구조화 입력. 추정값으로 채우지 않음'],
 ['권한 없음·회수','원문·검색·요약·인용·내보내기·캐시 반환 차단','재승인 또는 업무 인계. LLM 프롬프트로 우회 불가'],
 ['출력 오류·근거 불충분','스키마·근거 검증 실패를 명시하고 대외 인계 중단','담당자 검토·범위 축소·정해진 상한 내 재계획'],
 ['연계 타임아웃·응답 유실','처리결과 미확인으로 유지. 동일 요청 무조건 재전송 금지','멱등키·접수번호로 조회 대사 후 재실행 여부 결정'],
 ['API 미확보','허용된 공식 양식·인계 묶음 출력 후 사람 처리','접수증·공식 조회결과 확인 전 업무 완료 표시 금지'],
 ['서버 자원 부족·모델 중단','대기열 제한·우선순위·취소·중단 사유 표시','승인된 모델 재개 또는 기존 수동 처리 경로. 외부 LLM 자동 전송 금지'],
 ['긴급 위험·중대한 오류','기존 긴급 대응·전문 판단 경로로 우선 인계','AI 검토 완료를 기다리지 않는 운영절차. 원인·조치·재개 조건 기록']
 ])]});
 const delivery=section('delivery','단계별 적용 · 재사용·검증·운영 전환',p.pilot,[
 card('1. 현장 기준선·데이터 진단',v.records,'정상·보완·변경·미완료 사례의 존재와 제공범위 확인. 미확보를 실제 미보유로 단정하지 않음','담당 역할·법적 근거·원문판본·API·서버 여력·기존 계약 기능 대조'),
 card('2. 과거 자료·시험환경 검증','같은 사건·자료·완료조건으로 현행 A / SI·규칙 개선 B / AI 결합 C 비교','처별 도식의 입력·출력·권한·예외를 합성·허용된 재현사례로 시험. 실데이터와 합성사례 표시'),
 card('3. 제한된 현업 적용','허용행위·실제 인적검토·수신자·중단·복구·문의창구 확정 후 적용','실행과 결과 대사의 불일치·검수 부담·대국민 안내 오류를 함께 관측'),
 card('4. 인수·확대 판단','업무효과와 중요 오류·접근통제·재현성·서버 용량을 함께 확인','목표 미달 원인을 자료·규칙·모델·운영으로 구분하고 범위 보완','단축시간을 감원 인원으로 환산하지 않고 안전·품질·서비스 편익으로 평가')]);
 const trace=section('trace','요구사항·설계·시험의 연결','기존 요구ID를 유지하고 도식의 책임과 실제 인수조건을 연결',[],{tables:[table('요구사항 추적',['요구ID·명칭','연결 모듈','인수조건','데이터·연계','시험'],reqs.map(r=>[r.id+' '+r.name,u.requirements_mapping.find(m=>m.id===r.id)?.module||u.modules.filter(m=>m.requirement_refs.includes(r.id)).map(m=>m.id).join(' · ')||'연결 모듈 확인 필요',r.acceptance,(r.data||'확정 필요')+' / '+(r.interface||'연계 협의 전'),r.test||'시험ID 확정 필요']))],links:[link('기존 RFP·요구사항 전체',base+'?view=requirements')]});
 const outcomes=section('outcomes','기대효과 · 무엇으로 개선을 입증할 것인가','기존 협의용 목표와 실측값을 구분하고 AI의 추가 가치까지 비교',v.metrics.map(m=>card(m.id+' · '+m.title,'목표: '+m.target+({down:'% 상대감소',pp:'%p 향상',point:'점 향상'}[m.mode]||m.unit+' 개선')+' / '+m.targetStatus,'산식: '+m.formula,'효과 경로: '+m.mechanism,'측정: '+m.measure,'기준선: '+m.baselineStatus)),{links:[link('정량평가·측정방법 상세',base+'?view=impact')],status:'개선 목표는 기존 impact 원장의 가정 / 이번 근거 조사로 효과를 실증한 것이 아님'});
 const open=section('decisions','착수 전 확정할 사항 · 자료·권한·재원·수락','기획 완성도와 실제 사업 착수 가능성을 별도 관리',[
 card('현업·조직 확인','대표 컨셉의 실제 수요·처별 업무분장·전결·자료 소유자·현장 수락 확인',code==='PS'?'정책지원처의 정책평가, 모빌리티연구처의 TS-DRT 운영, 지자체의 집행권한 구분':mandate.collaboration,'공식 업무 담당 표시는 내부 독점 권한·최종 승인권의 증거 아님'),
 card('데이터·보안 확인',p.minimum,'처리근거·위탁/제공·보존기간·권리행사 담당·실제 접근정책 확정','민감정보·위치정보·영업비밀·비공개 평가자료의 처리조건별 확인'),
 card('기술·범위 확인','NOA·aRDa 실제 설치판본·재사용 기능·라이선스·서버 부하·연계 계약 대조','기존 납품분과 새 Agentic OS·처별 지식·UI·연계·검증의 증분 구분','새 금액 산정은 이번 공개 상세화 범위에 포함하지 않음'),
 card('성과·수락 확인',v.guard,'사건 분모·비교조건·분류기준·수집기간·기준선·책임자 합의','품질·법정 절차를 낮춰 달성한 단축을 편익으로 계산하지 않음')],{links:[link('상세기획 Markdown 내려받기','downloads/proposals/'+code+'_상세기획.md'),link('상세기획 JSON 내려받기','downloads/proposals/'+code+'_상세기획.json')]});
 return [six,why,gap,proof,method,scenario,concept,overall,service,data,contracts,privacy,life,access,exceptions,delivery,trace,outcomes,open];
}
function routeCode(route){const u=new URL(route,'https://local/');let path;try{path=decodeURI(u.pathname)}catch{return null}return path.endsWith('/architecture.html')?(u.searchParams.get('unit')||'DF'):departments.find(d=>path.includes('/'+d.folder+'/'))?.code}
function enrich(route,deck){const code=routeCode(route);if(!profiles.profiles[code])return deck;const u=new URL(route,'https://local/'),q=u.searchParams,path=u.pathname;let list=build(code);const view=q.get('view'),arch=q.get('arch');if(view==='requirements')list=[];else if(view==='impact'||view==='evidence')list=list.filter(s=>['sixw','why','limits','evidence','method'].some(k=>s.id==='detail-'+k));else if(arch)list=[];else if(path.endsWith('architecture.html')||decodeURI(path).includes('/03_'))list=list.filter(s=>['concept','overall','service','data','interfaces','privacy','privacy-lifecycle','access','exceptions','trace'].some(k=>s.id==='detail-'+k));else if(decodeURI(path).includes('/02_'))list=list.filter(s=>['scenario','service','data','privacy','exceptions'].some(k=>s.id==='detail-'+k));return {...deck,slides:[...list,...deck.slides]}}
module.exports={context,build,enrich,routeCode,stages,privacyStages,date:profiles.date,status};
