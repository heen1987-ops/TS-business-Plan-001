const documents=require('./department-documents.json');
const coverage=require('./department-coverage.cjs');
const layoutLabels={layerHeaders:['논리 계층','확인 상태','주요 구성','연결·책임'],flowLabel:'요청부터 결과 대사·재계획까지의 목표 서비스 흐름',formula:'산식·단위',method:'측정방법',quality:'품질 조건·실패 판정',countDepartments:'개 처 레코드',countProjects:'개 기획항목',countFiles:'개 기준파일'};
const sources={
 G01:{title:'Noa AI 사용자 가이드 V1.0',published:'2026-09-08',checkedAt:'2026-10-01',url:null,location:'원본 PDF 19쪽. p5–10 Workspace·Drive, p11–13 Skills, p17–19 산출물·검토',fact:'개인 Workspace, 자료 선택, Drive 검색·필터, 제공 스킬 호출·그룹·프리셋과 문서작업 사용방법 확인.',limit:'원본 PDF 핵심쪽 재대조. 실제 설치 build·공동 PMS·API·스킬 배포 SDK의 실행검증과 구분. p5 개인 소유·비공유, p10 Drive 자동 읽기 없음.'},
 G02:{title:'CCK 공식 Noa 제품 소개',published:'게시일 미표시',checkedAt:'2026-10-01',url:'https://www.ccksolution.com/noa',location:'공식 제품 페이지',fact:'폐쇄망 기업 AI 워크스페이스와 문서·업무·정책·승인·감사 방향의 공급사 소개.',limit:'제품 소개이며 TS 설치본의 기능·API·성능·사용권을 입증하는 인수자료와 구분.'},
 G03:{title:'Agent Skills 공식 명세',published:'온라인 명세·별도 판본 미확인',checkedAt:'2026-10-01',url:'https://agentskills.io/specification',location:'SKILL.md·scripts·references·assets·Progressive disclosure',fact:'SKILL.md의 메타데이터·지침과 선택적 스크립트·참고자료·자산 구성, 필요한 시점의 자료 로딩 방식 확인.',limit:'스킬 패키지 설계 참고. NOA의 해당 표준 지원은 미확인. 아래 입출력 스키마·승인·도구계약은 TS 확장 설계이며 표준 필수항목으로 주장하지 않음.'},
 G04:{title:'CCK 제품 설명·코드 분석 보존자료',published:'Argus 2026-04-23 / Keeper·Nexus·Mothership 2026-04-20',checkedAt:'2026-10-01',url:null,location:'보존 ZIP의 제품문서 3종·Mochi 분석 노트 원문 멤버 재열람',fact:'Argus 계획·실행, Keeper Task 상태·원자적 claim, Nexus 모델 호출, Mothership SSO·역할·회사 구분 설명 확인.',limit:'소스 commit·실제 build·NOA 결합 관계·TS 적용은 미확인. 저자의 운영·성능 서술을 이번 실행 결과로 승격하지 않음.'},
 G05:{title:'처별 한글 문서 공개 목록',published:documents.version,checkedAt:'2026-10-01',url:null,to:'planning-documents.html',location:'department-documents.json',fact:'처 레코드·기획 프로젝트·개별 파일·판본·해시·상세제안 경로의 연결 확인.',limit:'기획원장의 범위. 공식 조직 전수 확인·실제 착수사업·수행 진척을 의미하지 않음.'},
 G06:{title:'사용자 확인·기존 계약 경계',published:'본 대화',checkedAt:'2026-10-01',url:null,location:'사용자 확인 및 기존 사업 맥락',fact:'Agentic OS는 현재 계약·기술협상 범위에 포함되지 않았다는 사용자 답변. 로컬 LLM·기존 서버·신규 인프라 투자 0원·비전 제외 조건.',limit:'미포함은 기술 부재 판정과 구분. 상세 납품·사용권·미포함 공수는 계약 원문 및 설치본과 추가 대조 필요.'}
};
const skills=[
 {id:'SK01',name:'권한·판본 기반 자료찾기',input:'사용자·project_id·질문·기준일·자료유형',how:'자료 접근정책으로 검색 범위 제한 → 메타데이터/내용 검색 → 원문 위치·판본 대조 → 필요한 자료만 Workspace 문맥에 연결',tools:['evidence.search','document.read'],output:'근거 목록·원문 위치·판본·해시·확인 범위·미확인 항목',gate:'조회 권한 재확인. 검색 실패·판독불가는 자료 보완 상태 유지. 자동 판본 확정 금지.'},
 {id:'SK02',name:'근거 기반 문제정의',input:'SK01 근거 묶음·대상자·업무 목적·현장 의견',how:'육하원칙으로 현상·영향·원인 가설 분해 → 반대 근거 확인 → 공식 업무와 개입 범위 연결 → 조사 질문 생성',tools:['evidence.search','project.read','artifact.draft'],output:'문제정의·확인 사실/가설·원인 검증계획·국민 편익·대안 비교',gate:'기사 사례를 발생률로 확대 금지. 공식 담당·재원·원인이 미확인이면 가설로 보존.'},
 {id:'SK03',name:'처·법령·기존사업 매핑',input:'문제정의·대상 업무·처 레코드·적용 기준일',how:'설립 근거/개별 업무 근거/수행조직 구분 → 기존 계약과 기능 대조 → 공통 재사용·처별 추가범위 분해',tools:['mandate.read','contract.scope.read','artifact.draft'],output:'업무–법령–담당–기존 시스템–추가 작업 추적표',gate:'조직명으로 권한 추정 금지. 계약 자료 접근 권한 적용. 동일 납품분 중복 산정 금지.'},
 {id:'SK04',name:'요구사항·RFP 초안',input:'사업목적·현행 흐름·추가범위·기관 양식·검수조건',how:'업무 결과에서 기능/비기능 요구 도출 → 화면·도구·자료·시험 ID 연결 → RFP 양식 항목에 배치 → 누락 규칙검사',tools:['template.read','requirements.validate','artifact.draft'],output:'요구사항 정의/명세·RFP 초안·검수/인수표·미결 질문',gate:'기능 생성과 공식 발주 문서 확정 구분. 확정 제출본은 기관 검토·승인 경로 적용.'},
 {id:'SK05',name:'차분 공수·대가 검토',input:'기준계획/신규계획 판본·계약 범위·승인 단가/산정 방식',how:'추가 범위를 WBS로 분해 → 공통·처별·연계·검증 작업 대조 → 검증된 계산 도구로 산정 → 출처·단위·차분 보존',tools:['contract.scope.read','estimate.calculate','artifact.draft'],output:'재사용/추가 작업·역할별 공수·대가 초안·단가/산식/미산정 근거',gate:'단가·생산성·사용권 미확정은 null. LLM 자유 계산·임의 감액·시간 절감의 감원 환산 금지.'},
 {id:'SK06',name:'과업·의존관계 점검',input:'승인 WBS·담당·기한·선행과업·검토/실행 증거',how:'코어의 최신 상태 조회 → 선행조건/미결 원인 분석 → 다음 행동·변경영향 제안 → 허용된 변경만 저장',tools:['task.read','dependency.read','task.change.propose'],output:'미결 과업·책임자·선행조건·보완 요청·변경계획 후보',gate:'파일 존재로 완료·문서 문구로 진행률 추정 금지. 일정·담당 변경은 실제 변경정책 적용.'},
 {id:'SK07',name:'승인·실행·결과 대사',input:'승인된 행위·대상·인자·기준판본·결과 확인조건',how:'권한/승인 유효성 재확인 → 멱등 요청 → 접수·반영 결과 조회 → 계획과 대조 → 완료조건 검사 또는 재계획',tools:['approval.validate','action.execute','action.reconcile'],output:'run_id·요청/접수/공식 결과 참조·불일치·결과 미확인 상태',gate:'원시스템 API 확보 전 실행 불가. 응답 유실 시 재등록보다 대사 우선. 변경된 인자에 기존 승인 재사용 금지.'},
 {id:'SK08',name:'인수·운영이관·지식 축적',input:'요구사항·시험/결함·인수결정·운영문서·확정 산출물',how:'수용기준별 실제 증거 대조 → 필수 미결 확인 → 인수권자 결정 연결 → 운영 인계와 재사용 근거 등록',tools:['acceptance.read','artifact.draft','knowledge.publish.propose'],output:'인수 검토안·잔여 결함·인계 목록·확정 지식 참조',gate:'스킬의 보고서 생성으로 인수 완료 처리 금지. 개인 Workspace 삭제와 공식 제출본 보존 분리.'}
];
const layers=[
 {id:'L01',name:'기존 AI 플랫폼 진입',status:'재사용 후보·설치본 대조',items:['기존 로그인·홈·검색/자료찾기','NOA Workspace·Drive·Skills','사업 선택·자료/과업/검토 결과 보기'],detail:'하나의 접속점에서 처·사업 선택. 개인 작업 문맥과 공동 사업 기록의 연결.',refs:['G01','G02']},
 {id:'L02',name:'업무 스킬·계획 수행',status:'추가 설정·미포함 실행기 검증',items:['자료찾기·문제정의·RFP','공수 검토·미결 과업·인수','구조화 계획·도구 선택·재계획'],detail:'공통 스킬과 처별 지식·양식·규칙. 각 실행의 입력판본·결과·오류 기록.',refs:['G03','G04','G06']},
 {id:'L03',name:'PMS 공통 업무 코어',status:'기존 기능 대조 후 증분 개발',items:['사업·과업·담당·일정·의존관계','자료 판본·기준계획·변경 이벤트','권한·승인·실행·완료증거'],detail:'대화 종료·담당자 변경·동시 수정 후에도 유지되는 사업 상태. 문서·실행·인수 상태 구분.',refs:['G01','G05']},
 {id:'L04',name:'CCK 기반·검증 도구',status:'제품 설명 확인·build 미확인',items:['aRDa/기존 저장소·검색 후보','Argus·Keeper 계획/Task 후보','Nexus·기존 로컬 LLM / SSO 후보'],detail:'기존 백엔드와 도구 재사용 적합성 확인. 형식·계산·상태·권한은 서버측 검증.',refs:['G02','G04']},
 {id:'L05',name:'자료·원시스템 연결',status:'실제 API·행위별 권한 확보 전',items:['원문·HWPX·근거·양식·해시','계약 범위·결재·ERP·공식 업무 원장','조회 → 승인된 쓰기 → 결과 대사'],detail:'공식 판단과 거래는 지정 원시스템 기준. 자료 저장 위치를 모두 이전할 필요 없이 허용된 연계.',refs:['G05','G06']}
];
const flow=[
 ['F01','사용자 요청·사업 식별','처·사업·목표·행위와 요청자 권한 확인. 대상이 모호하면 후보 제시.','project_id·사용자 세션·기준일'],
 ['F02','스킬 선택·필요 근거 조회','스킬 목적·버전 선택. 검색 전에 자료 ACL 제한, 반환 전에 재확인.','skill_id/version·원문 위치·판본·해시'],
 ['F03','구조화 계획·초안·차이 생성','확인 사실·가설·미결을 구분. 필요한 도구·입출력·완료조건 구성.','plan_version·task_id·근거 참조'],
 ['F04','서버측 규칙 검증','필수항목·단위·기간·상태 전이·권한·선행조건 검증. 계산은 전용 도구 수행.','검증결과·오류·미산정'],
 ['F05','행위별 승인·변경 결속','조회/초안은 허용정책 안에서 수행. 기준계획 변경·대외 전송·공식 쓰기는 지정 승인.','approval_id·승인 대상/인자/판본 해시'],
 ['F06','실행·지속 상태 기록','실행 직전 권한·승인 재확인. 과업 판본 검사와 멱등키로 중복/덮어쓰기 방지.','run_id·action_id·idempotency_key'],
 ['F07','결과 대사·완료조건 검사','접수 성공과 실제 반영 구분. 응답 유실은 결과 미확인 유지 후 원천 조회.','접수참조·result_ref·수락 증거'],
 ['F08','후속 과업·재계획·축적','새 근거·실패·변경이 영향을 준 과업만 재계획. 확정 기록과 개인 대화 분리.','변경 이벤트·새 기준계획·확정 지식']
];
const metrics=[
 {id:'E01',name:'근거 찾기 성공률·탐색시간',formula:'권한·적용판본·원문 위치가 모두 맞는 검색 과업 / 전체 평가 검색 과업 × 100; 요청~필요 근거 확보 소요시간의 중앙값·P90',method:'현행 A / 검색·필터 SI B / B+스킬 AI C에 동일 질문·권한·자료판본 적용. 담당자가 원문 기준으로 성공 판정, 이벤트 시각으로 시간 측정.',baseline:null,target:null,quality:'잘못된 판본·권한 밖 원문·미검증 인용을 별도 실패로 집계. 빠르지만 틀린 결과는 성공 제외.'},
 {id:'E02',name:'요구사항–검수 근거 연결률',formula:'근거·요구사항·설계·시험·판정의 필수 연결을 갖춘 요구 / 평가 대상 요구 × 100',method:'동일 RFP 작성 사례를 A/B/C로 비교. 독립 현업 검토자가 필수 요구 모집단과 링크 유효성 확인. 무의미한 링크는 불인정.',baseline:null,target:null,quality:'중요 요구 누락 수·근거 없는 신규 요구·검수자 보완 시간을 함께 기록.'},
 {id:'E03',name:'재검토·반복 보완 비율',formula:'동일 확인 가능한 사유로 다시 보완한 건 / 검토 완료 건 × 100',method:'보완 사유 코드·대상 문서 판본·검토 이력으로 재발 구분. 신규 요구·정당한 예외와 오류 반복을 분리하여 A/B/C 비교.',baseline:null,target:null,quality:'보완 감소가 필수 안전·법정 검토 생략에서 발생했는지 독립 확인.'},
 {id:'E04',name:'미결 과업 원인·다음 조치 확인률',formula:'책임자·선행조건·현재 근거·다음 조치가 확인된 미결 과업 / 평가 미결 과업 × 100',method:'승인 WBS와 실제 상태·증거를 현업이 정답셋으로 고정. 자료 결손·API 미확인·승인 대기·시험 실패 사례별 조회 결과 비교.',baseline:null,target:null,quality:'담당·기한·진행률의 AI 임의 생성 금지. 미확정값을 명확히 반환한 경우를 규칙에 따라 판정.'},
 {id:'E05',name:'검증된 업무 반영률·중복 반영 건수',formula:'승인내용·원시스템 결과·완료증거가 일치한 처리 / 승인 실행 요청 × 100; 동일 행위 중복 반영 건수 별도 집계',method:'정상·중복·응답 유실·권한 회수·승인 후 인자 변경·재기동 시나리오 수행. 원시스템 기록과 run/action 이력 대조.',baseline:null,target:null,quality:'중복 반영·권한 밖 실행은 필수 반례 시험에서 발생 금지. 실제 성능 목표는 기준선·표본·기관 수용기준 합의 후 설정.'}
];
const tables={
 reuse:{headers:['기반','확인한 것','HOW·추가 범위','재사용 확인 조건'],rows:[
 ['NOA Workspace·Drive·Skills','사용방법 명세. 개인 Workspace·자료 선택·스킬 호출. G01 p5–13','기존 화면에서 project_id 연결. 공동 과업·판본·담당·검토 결과를 기존 플랫폼에 확장.','설치 build·확장 SDK·스킬 배포·자료 ACL·사용권 대조'],
 ['aRDa·기존 문서/검색','조직지식·문서처리 활용 후보. API·검색 정확도 미확인.','원문–추출값–색인–산출물에 문서 ID/판본/위치 연결. 검색 범위 ACL 적용.','변환 누락·원문 좌표·권한 전파·판본 반환·스캔 예외 시험'],
 ['Argus·Keeper','계획/실행 분리·Task/claim 설명. 실제 build와 NOA 관계 미확인.','추론 결과를 typed plan으로 검증. 지속 run 기록·중단/재개·결과 대사 추가.','업무쓰기 멱등성·승인 유효성·재기동·unknown 복구 시험'],
 ['Nexus·기존 로컬 모델','모델 게이트·호출 관리 설명. TS 모델별 기능 미확인.','구조화 응답 검증·문맥 최소화·작업 대기열·동시실행 한도.','로컬 tool calling·스키마 정확도·지연·메모리·중단 시험'],
 ['기존 인증·Mothership 후보','역할·SSO·회사/부서 구분 설명. TS 사업별 ACL 미확인.','처·사업·문서·행위·기간·위임을 함께 검사. 담당자 교체 후 재확인.','권한 회수·검색/요약/내보내기/캐시 차단·전보 승계 시험']
 ]},
 skillContract:{headers:['스킬 패키지/계약','등록 내용','집행 책임'],rows:[
 ['SKILL.md','이름·설명·목적·절차·근거 읽기 지침','스킬 메타데이터와 실행지침. 자체 승인권 부여 불가.'],
 ['references/·assets/','처별 법령·업무규칙·양식·원문 참조. 권한 있는 자료만 호출 시 선택.','자료 원문·유효기간·ACL은 저장소/자료 서비스 기준.'],
 ['scripts/ 또는 등록 도구','검증·계산·변환 도구. 서명/버전·허용 도구목록·실행한도.','임의 스크립트 등록 금지. 검증된 로컬 실행환경에서 제한.'],
 ['TS 확장 manifest','입출력 JSON Schema·선행조건·허용 tool·승인정책·완료조건·평가셋','PMS 코어와 도구 게이트의 서버측 집행. NOA 지원 형식은 fit-gap 후 확정.'],
 ['스킬 생명주기','작성 → 검토 → 시험 → 승인된 배포 → 사용/평가 → 변경/회수','운영 중 실행의 스킬·모델·프롬프트 판본 보존. 재평가 후 배포.']
 ]},
 tools:{headers:['도구 제안명','요청·반환 계약','실행 통제·한계'],rows:[
 ['evidence.search / document.read','project_id·질문·기준일 → document_id/version·위치·해시·허용 원문','검색 전 ACL·반환 전 권한 재확인. API/검색 엔진 실제 확보 전 명세 단계.'],
 ['mandate.read / contract.scope.read','업무/처·적용시점·계약 ID → 법령/위탁 근거·담당 확인상태·납품/추가범위와 원문 참조','현행 법령·기관 담당·계약 범위의 권한/판본 구분. 내부 계약 원문을 일반 검색·공개 내보내기로 노출 금지.'],
 ['template.read / dependency.read','양식 ID/version·project_id/task_id → 양식 필드/규칙·선행과업/기한/증거 참조','공식 양식과 작업 예시 구분. 미승인 기준계획의 날짜·의존관계를 확정값으로 반환 금지.'],
 ['acceptance.read / knowledge.publish.propose','요구/시험/판정 ID·문서판본·공개범위 → 인수증거 또는 지식 등록 제안','실제 인수권자 판정 기준. 지식 등록은 제안 상태, 자료등급·공개범위·승인 책임 확인 후 허용 범위 반영.'],
 ['project.read / task.read','project_id·record_version → 담당·상태·일정·의존관계·증거참조','조회시각·원장 판본 반환. 승인 WBS가 없으면 기한/진행률 null.'],
 ['requirements.validate / estimate.calculate','적용 양식·규칙/단가 판본·구조화 항목 → 오류·계산/추적 결과','단위·필수항목·정확한 산식은 프로그램 처리. 미확정 단가로 총액 생성 금지.'],
 ['artifact.draft / task.change.propose','입력판본·근거·변경안 → 초안 ID·비교표·검토 대기','생성물 초안 상태 유지. 기준계획 덮어쓰기 금지.'],
 ['approval.validate / action.execute','approval_id·action_hash·expected_version·멱등키 → run/접수참조','대상/행위/인자/수신자/판본 승인 결속. 실행 직전 재검사.'],
 ['action.reconcile','run_id·원천 요청키/접수참조 → 실제 반영결과·일치/불일치/미확인','응답 유실은 unknown. 대사 후 재실행 결정. 접수 성공과 공식 반영 구분.']
 ]},
 entities:{headers:['엔터티','필수 식별·필드','책임 경계'],rows:[
 ['Project / Task','project_id·department_ref·proposal_id·owner / task_id·담당·기한·선행과업·state·record_version','기획항목과 실제 착수 구분. 승인 기준계획이 생긴 뒤 일정/진척 등록.'],
 ['Document / Evidence','document_id·version·sha256·원문 위치·소유처·ACL·유효기간·project/task 연결','개인 Drive 파일과 공식 제출본 구분. 신규 등록본이 과거 참조를 덮어쓰지 않음.'],
 ['Skill / Plan / Run','skill_id/version·schema_version·plan_version·run_id·모델/프롬프트판본·입출력 참조','LLM 출력은 검증 전 후보. 작업 큐 상태와 실제 업무 결과 상태 구분.'],
 ['Approval / Action','approval_id·승인자·유효기간·대상/인자/판본 해시·action_id·멱등키·result_ref','실행조건 변경 시 승인 재검토. 원천 결과로 반영 여부 확정.'],
 ['Change / Acceptance','전후 판본·변경자·사유·시각 / 요구·시험·수락자·판정·잔여 결함','동시 수정 CAS 충돌 보존. 인수권자 결정 없이 완료 확정 금지.'],
 ['Case / DRT request','case_id·request_id·원시스템 참조·최소 연결정보','실제 배차/운행/정산 사건과 플랫폼 구축 project/task의 상태 구분. 원시스템 개인정보 복제 최소화.']
 ]},
 privacy:{headers:['구간','처리 정책 제안','구현·예외 처리'],rows:[
 ['로그인·사업 선택','기관 세션과 처·사업 소속·행위 권한 확인','직급/플랫폼 관리자라는 이유로 전체 자료 열람 허용 금지. 위임·전보·권한 회수 재검사.'],
 ['원문·색인·LLM 문맥','허용 자료만 검색. 필요한 문단/표만 로컬 모델에 제공. 민감 식별값은 업무 필요성 확인.','원문·추출값·요약·캐시·다운로드 동일 권한. 개인정보 목적/항목/보유기간·처리 근거는 자료별 확정 전 미확인.'],
 ['생성·공동 제출·삭제','개인 대화 전체보다 선택한 제출물·결정·근거만 공동 사업 기록으로 연결','공식 보존본과 개인 Workspace 삭제 분리. 보존/파기·회수·정정 경로를 기관 정책에 맞게 설정.'],
 ['도구 실행·감사','허용 도구·승인범위의 행위만 수행. 요청/결과 기록에 비밀값·불필요한 원문 저장 금지.','외부 자료 명령문을 권한으로 해석 금지. 개인정보를 테스트 정답셋/로그로 무단 전환 금지.'],
 ['모델 중단·용량 부족','기존 서버의 처리한도 안에서 대기·축소·수동 처리','외부 모델 자동 우회 없음. 비전 없이 판독할 수 없는 문서는 보완/담당자 인계. 실제 보안·개인정보 영향 검토는 도입 전 수행.']
 ]},
 states:{headers:['상태','진입 조건·저장 증거','다음 단계 조건'],rows:[
 ['proposed / review_pending','AI/담당자 제안·입력판본·근거·계획안 저장','검토조건 통과·행위별 승인 필요 여부 확인'],
 ['approved / running','유효 승인과 권한·판본·선행조건 재확인. run_id 저장','실행 응답과 원천 결과 조회'],
 ['result_unknown','응답 유실·원천 결과 확인 실패. 요청키/접수참조 보존','대사 전 중복 쓰기 금지. 재조회·수동 확인 경로'],
 ['reconciled / acceptance_pending','승인내용과 원천 반영 일치 또는 불일치 증거 저장','불일치 보완·완료조건·해당 인수권자 수락'],
 ['complete / failed / cancelled','실제 완료증거·수락 또는 실패/취소 사유 저장','종결 후 변경은 새 판본·재개 이유와 권한 확인. 파일 생성만으로 complete 금지']
 ]},
 cost:{headers:['산정 묶음','추가 작업 단위·투입 역할','중복·대가 처리'],rows:[
 ['공통 확장 1회분','업무분석·DB/API·NOA 화면 연계·스킬 레지스트리·권한/승인·큐/대사. PM/BA·백엔드·프런트·AI·QA/보안.','기납품 동일 기능은 재사용 대조. Agentic OS 미포함 범위는 별도 차분 산정.'],
 ['공통 어댑터별','문서/검색·조직/결재·기존 PMS·계약/ERP별 조회와 허용 쓰기·결과 대사. 연계개발·업무 담당·QA.','같은 API/도구를 여러 처에서 쓰면 공통 1회. 기관별 인증·스키마 차이만 증분.'],
 ['처별 스킬·설정','지식/양식·업무규칙·예외·담당/전결·검수셋·화면 증분. 현업·BA·AI/스킬 개발·QA.','처 수만큼 공통 엔진 반복 산정 금지. 데이터/규칙/도구/시험의 차이로 공수 설명.'],
 ['통합·운영 전환','로컬 모델/용량·회귀·개인정보·복구·현업 검증·교육·운영이관','신규 인프라 투자 0원. 통합·설정·검증 인건비 및 확인된 사용료는 별도.'],
 ['확정 전 입력','설치 기능·사용권·API·업무 규모·역할별 작업량·단가/산식·기관 검수조건','인월·추가 대가 미산정(null). 기존 문서 대가를 PMS 확장 확정견적으로 재사용 금지.']
 ]},
 phases:{headers:['도입 단계','구현·인수할 내용','진입/종료 조건'],rows:[
 ['1. 기준선·조회 연결','기존 build/계약/사용권·API fit-gap. 현행 기획자료를 사업 ID와 연결. SK01 조회와 SK04 초안으로 시범.','권한·판본·원문 위치와 미확인값 보존 시험. 실제 사업 담당·자료 이용권 확인.'],
 ['2. 공동 과업·검토 전환','승인 WBS·담당·일정·의존관계·공동 제출·변경판본. SK05 차분 산정, SK06 미결 점검.','동시 수정·권한 회수·담당자 교체·공식 보존/개인 삭제 시험.'],
 ['3. 승인된 업무 실행','허용 API 행위 1종부터 SK07 적용. 승인결속·멱등·unknown 대사·재기동 복구.','실제 시스템 연계·운영정책·완료증거 확보. 지급/배차/행정판정 일괄 자동화로 확대 금지.'],
 ['4. 처별 확산·효과 검증','검증된 공통 기능 재사용. SK02/03/08과 처별 규칙·양식·평가셋 추가.','A/B/C 품질·시간·재작업 비교, 현업 수용·운영 책임 확인 후 범위 확대.']
 ]},
 acceptance:{headers:['필수 인수조건','반례 시험·확인 증거'],rows:[
 ['자료·등록 관계 일치','처/기획항목/파일을 구분. 사업–파일–판본–해시 연결 및 권한별 결과 수 확인.'],
 ['권한·자료 지시문 통제','검색/요약/직접주소/내보내기/캐시/도구에서 동일 ACL. 자료 속 자동승인·외부전송 지시의 호출 차단.'],
 ['승인–실행 일치','승인 후 대상·인자·수신자·판본 변경 시 영향 행위 차단. 실행 직전 회수/만료 재검사.'],
 ['동시 변경·중복·복구','CAS 충돌, 중복 요청, 응답 유실, 모델/프로세스 중단 사례. unknown 유지·대사·재개 기록.'],
 ['완료증거·결손 보존','파일 생성/접수만으로 업무 종결 금지. 판독불가·미산정·미확인을 정상/0/완료로 대입 금지.'],
 ['현업·운영 검수','기관 WBS/전결/보존정책·서버 처리한도·스킬 배포/회수·수동 복구와 운영 인계 확인.']
 ]}
};
const scenarioRows=[
 ['“모빌리티연구처 DRT 근거와 최신 계획서 찾아줘.”','SK01·SK03: MR-02를 특정하고 허용 원문·계획 판본·관련 법정업무 근거 반환.','근거별 출처/시점/판본과 미확인 사항. 실제 연락/배차/정산은 수행하지 않는 조회.'],
 ['“계획서는 v0.5, 대가산정은 v0.3인데 추가범위 정리해줘.”','SK04·SK05: 기준/신규 판본과 계약 범위 대조. 추가 지식·규칙·연계·화면·시험 WBS 생성.','차분 작업 목록·기준 단가/산식·미산정 입력. 담당자 검토 후 새 산정 판본 연결.'],
 ['“자료나 API 확인 때문에 막힌 과업과 다음 조치 보여줘.”','SK06: 승인 WBS·최신 상태·선행조건·실제 확인기록 조회. 없으면 자료 부족 반환.','책임자·근거·보완 대상·변경안. 문서로 진행률을 추측하거나 기한을 만들어내지 않음.'],
 ['“승인된 수정안을 등록하고 반영 확인해줘.”','SK07·SK08: 승인/권한/판본 재검사 → 멱등 등록 → 원천 대사 → 인수조건 대조.','접수·반영·수락 상태 분리. 결과 미확인 시 보류와 재조회 경로. 연계 확보 후 가능한 목표 시나리오.']
];
const section=(id,title,intro,blocks)=>({id,title,intro,blocks});
const table=(key,refs=[])=>({type:'table',...tables[key],refs});
const note=(title,items,refs=[])=>({type:'note',title,items,refs});
const detailedSections=[['사업 정의·근거','section-r47-context'],['서비스 흐름','section-r47-service'],['전체 아키텍처','section-r47-block-overall'],['데이터 흐름','section-r47-block-data'],['세부 실행 설계','section-r47-block-runtime'],['개인정보 처리','section-r47-block-privacy'],['요구사항·RFP','section-r47-block-requirements'],['효과·측정방법','section-r47-block-metrics'],['대가산정 입력','r47-spec-sizing']];
const supplementSections=[['사업 정의·근거','why'],['기술적 해결방법','how'],['서비스 흐름','flow'],['공통 구현 구조','architecture'],['데이터·개인정보','privacy'],['효과·측정방법','metrics'],['요구사항·대가 조건','requirements']];
const drtSections=[['문제·근거','why'],['기술적 해결방법','solution'],['서비스·배차 흐름','flow'],['아키텍처·데이터','architecture'],['개인정보·권리','rights'],['요구사항·측정·대가','delivery']];
const portfolio=documents.departments.flatMap(d=>d.projects.map((p,i)=>{
 const profileId=d.profileIds[i]||null,proposalRoute=p.id==='MR-02'?'drt-assurance.html':profileId?'proposal-links.html?unit='+profileId:d.proposalRoute;
 const sections=p.id==='MR-02'?drtSections:profileId?supplementSections:detailedSections;
 return {...p,department:d.name,code:d.code,profileId,proposalRoute,anchor:'pms-project-'+p.id,documentsRoute:'planning-documents.html#documents-'+d.code,documentVersions:d.documents.map(f=>f.label+' '+f.version).join(' / '),designLinks:sections.map(([label,id])=>({label,to:proposalRoute+'#'+(p.id==='MR-02'?'drt-':profileId?'proposal-'+profileId+'-':'')+id})),designScope:p.id==='MR-02'?'DRT 전화 접수·예외 배차·운영계획의 전용 설계':profileId?'업무별 검토안·공통 구현 구조. 해당 처의 기술 HOW 상세는 아래 한글 계획서 참조.':'사업별 상세설계. 전체·실행 아키텍처부터 요구사항·측정·산정 입력까지 연결.',sharedDocuments:d.projects.length>1,operationalState:null};
}));
const documentGroups=documents.departments.map(d=>({code:d.code,name:d.name,anchor:'pms-department-'+d.code,projects:portfolio.filter(p=>p.code===d.code),documents:d.documents,sharedDocuments:d.projects.length>1}));
const sections=[
 section('direction','하나의 AI 플랫폼에서 사업을 찾고 수행하는 방향','자료실·처별 계획서·개인 AI 작업을 사업 식별자로 연결하는 기구축 플랫폼 확장. 추가 구현·협의용 제안이며 실제 NOA/PMS 운영과 구분.',[
  note('필요성·목표·사용 대상',[
   'WHY: 현재 기획자료의 문서·버전·근거와 추가 요구사항을 사업 단위로 연결하여 찾고, 후속 검토·실행에 재사용하는 목적. 실제 조직의 반복 작업 규모는 현업 사례로 기준선 확보 필요.',
   'WHO: 현업 처의 사업담당·검토자·인수권자, 기획/예산/정보화 협업자, CCK 수행 PM·개발·QA와 운영자. 자료 소유·최종 전결은 기관 기준 유지.',
   'WHAT: AI 플랫폼의 기존 로그인·검색·자료·스킬을 출발점으로 사업/과업·판본·담당·승인·결과를 지속 관리하는 PMS 확장.',
   'WHERE: 기존 로컬 서버와 기관 AI 플랫폼 내부. 논리 모듈별 신규 서버 구매를 전제하지 않으며 처리 용량은 실측 후 범위·동시실행량 조정.',
   'WHEN: 먼저 자료찾기·계획/RFP 초안과 사업 연결을 검증하고, 공동 검토·상태관리·허용된 도구 실행 순서로 확대.',
   'HOW: 업무 스킬이 근거를 찾고 계획/변경안을 제안, 공통 코어가 권한·판본·상태·승인·실행을 집행, 원시스템 결과로 완료 여부 확인.'
  ],['G01','G05','G06']),
  note('한곳으로 모으는 기준',[
   '사용자의 접속점·사업 선택·검색·스킬 호출·결과 조회를 기존 AI 플랫폼으로 통합. 자료는 원래 저장소에서 허용 연계 가능.',
   '사업별 Workspace 문맥과 자료 접근권한 유지. 개인 대화 전체를 공동 원장으로 공개하거나 모든 처 자료를 하나의 프롬프트에 적재하지 않음.',
   '공통 엔진·권한·원장·도구는 1회 확장, 처별 지식·양식·검수·연계 차이는 스킬/설정으로 증분 구현.',
   '현재 가이드의 개인 공간·제공 스킬과 목표 공동 PMS의 차이 확인. “이미 공동 PMS가 구현됐다”거나 “스킬 등록만으로 완성된다”는 판단 유보.'
  ],['G01','G04','G06'])
 ]),
 section('architecture','전체 아키텍처와 CCK 기술의 실제 역할','기구축 UI·서버·모델 재사용 후보에 공통 업무 코어와 처별 스킬을 확장하는 논리 설계. 설치본 기능·사용권·API fit-gap 후 상세 물리 배치 확정.',[
  {type:'architecture',refs:['G01','G02','G04','G06']},table('reuse',['G01','G02','G04']),
  note('기존 공통 상세설계와 연결',[
   'C01·C04: 사용자/사건 권한과 근거 조회·판본 → 사업/문서 ACL·출처 검색.',
   'C05·C06·C07: 계획·작업 큐·로컬 모델 → 스킬의 구조화 계획·지속 실행 기록·출력 검증.',
   '기존 승인·규칙·대사·감사·UI 설계 → 공통 PMS의 변경·승인·완료증거·조회 화면에 적용. 기존 논리 설계를 실제 설치 기능으로 승격하지 않음.'
  ],['G04']),{type:'links',items:[{title:'기존 공통 모듈·상세 아키텍처 확인',to:'architecture.html'},{title:'TS-AI 조직운영 제안과 처별 적용',to:'solutions.html'},{title:'조사자료실·근거 입력',to:'research-library.html'}]}
 ]),
 section('skills','공통 PMS 스킬과 처별 업무 확장','스킬은 업무 목적·근거·계획·도구 사용·검수 지침을 담는 실행 단위. 지속 상태·권한·승인의 집행은 PMS 코어와 도구 서비스 담당.',[
  {type:'skills',refs:['G01','G03']},table('skillContract',['G03']),{type:'contract',refs:['G03']},table('tools'),
  note('적용 경계',[
   '도구 이름·JSON 계약은 목표 명세. 현재 NOA에 이 API가 존재하거나 호출 시험을 통과했다는 의미와 구분.',
   '원문 링크와 적용 기준의 판본을 필요한 순간 검색. 스킬 내부에 모든 법령·개인정보·문서 본문을 고정 저장하지 않음.',
   '처별 업무 입력·규칙·양식·전결·예외·평가셋만 교체. DRT 운영 최적화 등 도메인 엔진의 구축/성능은 해당 사업에서 별도 명세·검증.'
  ],['G01','G03','G06'])
 ]),
 section('flow','서비스·데이터·개인정보 처리 흐름','조회·초안 생성에서 실제 변경·대사·인수까지 연결하되 행위별 정책 적용. 자료실 원문과 과업 현재 상태, 실제 배차/정산 사건의 책임 경계 유지.',[
  {type:'flow'}, {type:'table',headers:['목표 요청 예시','스킬·코어의 처리','화면에 돌아오는 결과·한계'],rows:scenarioRows},table('entities'),table('states'),table('privacy'),
  note('예외·복구',[
   '자료 미제공: 소유자·요청범위·보완 필요시점·대체수단을 기록. 확인 불가능한 요구는 실증 범위 조정.',
   '동시 수정: expected_version과 현재 판본이 다르면 충돌 표시. 기존 변경 보존 후 재대조·새 변경안 작성.',
   '승인 이후 변경/권한 회수: 실행 직전 승인 대상·인자·판본·기간·행위 권한 재검증. 영향 행위 차단.',
   '외부 응답 유실: 접수키·멱등키로 원천 결과 조회. 결과 미확인 유지, 자동 재등록 금지.',
   '모델 오류·재계획 반복: 스키마 오류·회수·시간/횟수 한도 초과 시 중단/수동 검토. 외부 클라우드 모델 우회 없음.'
  ])
 ]),
 section('portfolio','처별 정보화사업계획서와 사업별 상세설계','처별 한글 계획서·대가산정서·도식집의 직접 다운로드와 사업별 설계 절 연결. 실제 운영 진척 미확인. 공개 기획자료의 매핑이며 PMS 등록·착수 확인과 구분.',[
  {type:'coverage'}, {type:'portfolio',refs:['G05']},
  note('등록·이관 규칙',[
   '기존 제안 ID 유지. 구축 시 기관 project_id와 원래 proposal_id를 대응 등록하고 원장과 파일 해시·판본 대조.',
   '기관의 공식 조직코드·담당자·착수결정·승인 WBS·자료권한은 별도 확인. 기획 처 레코드가 공식 조직 모집단과 완전히 일치한다고 단정하지 않음.',
   '계획서 v0.5와 대가/도식 v0.3의 상태 별도 유지. 최신 계획서를 연결했다고 추가 대가·계약 변경이 확정되지 않음.',
   '뉴스·민원 원문은 자료실에 보관하고 사업에 필요한 근거 참조만 연결. 사용자 현장 의견과 검증된 기관 사실 구분.'
  ],['G05'])
 ]),
 section('delivery','개발범위·투입 역할·대가·도입 순서','기구축 기능 대조 후 부족한 공통 기능과 처별 증분 작업만 산정. 기존 계약 동일 납품분·신규 추가 기능·미포함 Agentic OS 경계 유지.',[
  table('cost',['G06']),note('사전 대가 평가식',[
   '총 증분 = 미포함 공통 코어 + 공통 연계 어댑터 + Σ(처별 지식·규칙·스킬·화면 증분·검수) + 확인된 증분 사용료·운영·교육.',
   '역할별 인월 = 확인된 작업량 × 합의된 작업당 공수. 적용 산정 방식/단가/기준일을 원문과 연결한 뒤 금액 계산.',
   '현재 추가 인월·개발비·사용료·유지관리비는 미산정. 신규 서버/장비 구매 투자 0원 조건만 고정. 성능·가용용량 확인 전 처리량 보증 금지.'
  ],['G06']),table('phases'),table('acceptance')
 ]),
 section('evaluation','정량 기대효과와 측정방법','추상적인 시간 절감 대신 검색·근거 연결·반복 보완·미결 조치·업무 반영의 품질을 측정하는 5개 지표. 기준선과 목표값은 실측·현업 합의 전 미설정.',[
  {type:'metrics'},note('비교·판정 원칙',[
   'A 현행 방식, B 규칙/SI 개선, C B+AI 스킬을 동일 과업·권한·판본·난이도·업무량으로 비교. AI 추가 가치를 B 대비 차이로 확인.',
   '시간 평균만 비교하지 않고 중앙값/P90·오류·누락·보완·현업 검수 부담 함께 기록. 담당자·정답셋·표본·관측기간·판정 규칙을 시험계획에 확정.',
   '미확정 기준선/목표/표본을 예시 수치로 채우지 않음. 절감시간의 감축 인원 환산 금지. 국민서비스 효과는 해당 처의 실제 서비스 성과와 후속 검증.'
  ])
 ]),
 section('evidence','근거·확인 수준·남은 결정','사용자 가이드·공식 제품 소개·기술 설명·현행 기획자료를 교차 확인한 설계. 실제 제품 실행시험·TS 현업 수요·원시스템 연계·효과 검증은 후속 단계.',[
  {type:'sources'},
  {type:'table',caption:'P01~P07 기획 기준·적용 판단·보완 체크리스트',headers:['기준','이번 공통 확장안의 적용','확인·보완 경로'],rows:[
   ['P01 국민 안전·편익 우선','독립 R&D 제외. 직접 적용은 사업기획·수행관리이며, 처별 안전/서비스 과업의 근거·미결·인수 품질을 지원.','PMS 내부 효과와 최종 국민 편익 구분. 서비스 성과는 해당 처 사업에서 후속 검증.'],
   ['P02 현업·인력 영향','반복 탐색·보완·미결 조정 부담 완화와 전문 검토 집중. 절감시간의 감축 인원 환산 금지.','현업 수용·검수 부담·역할 변화·담당자 교체/승계 사례 확보.'],
   ['P03 AX+SI 추가 가치','SI 코어와 AI 스킬 결합. 목적 기반 계획·도구 수행·검증·재계획을 기존 정보조회에 추가.','A 현행 / B 규칙·SI / C B+AI 비교. 단순 자료실·상태 화면만으로 AX 판정 금지.'],
   ['P04 실제 업무·사회문제 연결','고령 이동/DRT 등 처별 도메인 기획의 근거·문제·구현·검증을 사업 ID로 연결.','실제 반복 작업 규모·현업 사건·법정 수행업무 확인. 기획자료 수를 문제 발생률로 대체 금지.'],
   ['P05 재사용·확산','공통 코어·스킬 구조·도구 재사용, 처/기관별 법령·규칙·자료·전결·평가셋 분리.','확산 대상마다 자료 이용권·원시스템 연계·운영 책임 확인. 기관 간 데이터 통합권한 추정 금지.'],
   ['P06 기관·업무·조직·권한 구분','현재 처 레코드는 기획 범위. 제도 소관·위탁 근거·현행 조직·사업 책임·공식 원장 구분.','기관/업무별 법령·시행일·수탁관계·실제 담당/전결 자료 추가 확보.'],
   ['P07 WHY·책임·재정·검증','근거 기반 기획·안전한 변경·추적 가능한 완료를 목표로 증분 산정·5개 측정지표 구성.','재원·유형·규모·시점에 따른 심의/협의 대상 확인. 모든 사업 동일 절차 단정 금지.']
  ]},note('착수 전 확보할 최소 근거',[
   'TS AI 플랫폼 설치 build·NOA 대응 버전·사용권·실제 납품 및 Agentic OS 제외 범위.',
   '자료/사업/권한/스킬 확장 API·입출력 Schema·지원 포맷·스킬 배포/회수 방식.',
   '사업담당·검토/인수권자·기존 공식 원장·전결·보존정책과 정상/보완/변경 실제 사례.',
   '기존 서버의 모델·동시실행량·대기열·복구·접근통제 시험 및 현행 기준선.',
   '초기 실증 한 업무의 원문→검토→승인→반영→인수 증거와 단계별 수락 합의.'
  ])
 ])
];
const contract={skill_id:'TS-PMS-SK01',version:'0.1-design',purpose:'허용된 사업 자료의 원문·판본·위치 검색',input:{project_id:'기관 ID 대응 전',query:'검색 요청',as_of:'적용 기준일',actor_context:'서버 세션에서 결속'},allowed_tools:['evidence.search','document.read'],output:{evidence_refs:['document_id/version/location/sha256'],unknowns:[]},write_policy:'read_only',completion_rule:'허용범위·적용판본·원문위치 반환 또는 미확인 명시',evaluation:'정답 근거·권한 밖 자료·오래된 판본·판독불가 반례',status:'제안 계약·설치본 실행 미검증'};
const analysis=require('./analysis-review.cjs');
const core=layers.find(l=>l.id==='L03');Object.assign(core,{name:'초기 근거·업무 상태 코어',items:['사건 식별·근거판본·검토이력','담당자 결정·공식 결과 참조','권한·상태·실행 수락검증'],detail:analysis.platform.scope+' '+analysis.platform.state});
sections.find(s=>s.id==='direction').blocks.unshift(note('2026-10-01 · 실제 편성 검토 범위',[analysis.platform.lead,analysis.platform.scope,analysis.platform.contract]),{type:'table',caption:'공통 근거검토 모듈과 처별 적용',headers:['모듈','우선 적용/선택 재사용','기술 처리','산출·검증'],rows:analysis.modules.map(m=>[m.id+' · '+m.title,m.codes.join('·')+' / 선택 '+m.optional.join('·'),m.how,m.deliverables+' / '+m.metrics])},note('DRT는 별도 조건부 운영 실증',[analysis.drt.purpose,analysis.drt.how,analysis.drt.exclude]),{type:'links',items:[{title:'편성 검토·추가 문제 후보·공식 출처',to:'research-library.html?view=planning'},{title:'DRT 운영 실증 상세',to:'drt-assurance.html'}]});
sections.find(s=>s.id==='delivery').blocks.unshift(note('초기 납품과 검증 범위',[analysis.platform.quality,analysis.platform.cost,analysis.documentNote]));
module.exports={id:'TS-PMS-EXT-01',version:'v0.3',date:'2026-10-01',title:'기구축 AI 플랫폼 확장형 스킬 PMS',lead:'한 플랫폼에서 사업을 선택하고, 근거·계획서·과업·검토·실행 결과를 스킬로 연결하는 TS 사업기획·수행관리 확장안.',status:'협의용 확장 설계 · 실제 PMS 구축/NOA 연계 실행 미검증',constraints:'CCK 주관 · 로컬 LLM · 기존 서버 · 신규 인프라 투자 0원 · 비전 제외',catalogueLink:'처별 문서를 AI 플랫폼의 사업·스킬로 연결하는 공통 확장 설계',catalogueDescription:'기존 AI 화면·검색·Drive·Skills를 출발점으로 공동 사업 원장과 안전한 업무도구 확장. 처별 기능은 지식·양식·규칙·검수의 증분으로 구성.',sections,skills,layers,flow,metrics,portfolio,documentGroups,coverage,sources,contract,cost:{additional_mm:null,development_amount:null,license_amount:null,infrastructure_purchase:0,infra_basis:'사용자의 기존 서버·신규 인프라 투자 0원 조건'},counts:{departments:documents.departments.length,projects:portfolio.length,files:documents.departments.reduce((n,d)=>n+d.documents.length,0)},downloads:[{title:'확장 설계서 · MD',to:'downloads/skill-pms-design.md'},{title:'요구·도구·스킬 명세 · JSON',to:'downloads/skill-pms-design.json'},{title:'전체 논리 아키텍처 · SVG',to:'assets/skill-pms/architecture.svg'}],labels:{...layoutLabels,primaryMapping:'처별 계획서·상세설계 바로 보기',commonDesign:'공통 PMS 설계 보기',uniqueFiles:'고유 한글 파일',departmentIndex:'처별 계획서·설계 위치',mappingGuide:'처별 문서 3종은 바로 다운로드. 아래 사업명별 버튼은 해당 제안의 실제 설계 절로 이동. 검색 결과의 파일 수는 공유 문서를 중복 집계하지 않는 고유 파일 기준.',sharedDocuments:'처별 통합 계획서 공유 · 2개 기획항목을 한 계획서에 수록. 문서 3종은 처 단위로 1회 표시.',singleDocuments:'처별 계획서 1종 + 대가산정서·도식집 2종. 아래 사업의 본문 설계와 연결.',latestPlan:'최신 계획서·협의용 초안',referenceFile:'참조 첨부',embeddedImages:'내장 그림',documentActions:{plan:'정보화사업계획서 한글 다운로드',cost:'대가산정서 한글 다운로드',diagrams:'컨셉·아키텍처·흐름 도식집 한글 다운로드'},versionNote:analysis.documentNote,documentMetadata:'문서 목록·파일 무결성 확인',designLinks:'사업별 설계 바로가기',fullProposal:'사업제안 전체 본문',projectPermalink:'이 사업 위치 링크',backToSearch:'처별 검색·목차',toc:'공통 확장 설계 목차',references:'근거',tableRegion:'설계 표',diagramAlt:'기구축 AI 플랫폼 안에 PMS 공통 코어와 업무 스킬을 확장하고 원시스템을 연결하는 논리 아키텍처. 구현 상태는 본문 참조.',diagramCaption:'논리 구성도 · 서버 배치 확정과 구분 · 그림 아래 역할/입출력 표에서 상세 확인',skillsTitle:'8개 공통 스킬 · 모두 추가 적용/검증 대상',input:'입력',how:'처리 방법',tools:'허용 도구 제안',output:'산출',gate:'검증·예외',contract:'자료찾기 스킬의 실행계약 예시',metricsBaseline:'기준선·목표: 실측/합의 전 미설정',portfolioSearch:'처명·코드·기획항목 검색',searchPlaceholder:'예: MR-02, DRT, 철도',reset:'검색 초기화',portfolioCaption:'사업 기준자료 이관 후보 · 실제 운영 진척 미확인',portfolioHeaders:['기존 기획 ID·처','사업 목적·제안 본문','기준 문서·판본'],proposalLink:'상세제안',documentsLink:'해당 처 한글 문서',empty:'검색 결과 없음. 처명·코드·사업명 확인 후 검색 초기화.',coverageLink:coverage.labels.reviewLink,countNote:coverage.labels.summary+' · 한글 3종 연결은 39처, KATRI 12처 미작성. 실제 착수·완성 설계와 구분',sourceDate:'게시·판본 / 재확인',sourceFact:'확인 사실',sourceLimit:'확인 한계',internalSource:'자료명·원문 위치 참조 · 공개 원문 링크 없음'}};
