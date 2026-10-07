const intent=require('./proposal-intent.cjs'),diagram=require('./proposal-e2e-diagrams.cjs'),business=require('./proposal-business-language.cjs'),cost=require('./cost-review.cjs');
const date='2026-10-07';
const status='2027년 기획 요구사항 초안 · 공고·RFP 미매핑 · 범위·자료·제품·인수조건 협의 전';
const precedents=[
 {id:'PRE-01',title:'국토연구원 LLM 기반 데이터 지능형 연구지식정보시스템 구축 RFP',date:'2025-10-29',locator:'HWP BodyText/Section0 · FUN-003·004·005 / DAR-003·005 / TER-001~005',verified:'로컬 원본 HWP 본문 직접 판독 · 보관 원본 SHA256 대조 · 공식 공고 재열람(2026-10-07) · 인쇄 쪽수 미확인',url:'https://www.krihs.re.kr/board.es?act=view&bid=0012&list_no=397968&mid=a10602000000&tag=',originalSha256:'de43d645cf33a1daea42ba71c82549c1df5a4ed80e8243d15392a843e5c02ab0',lesson:'허용 도구·데이터 권한, 정답셋, 단계별 실행·오류 시험을 기능 요구사항과 연결',limit:'신규 GPU 2대 조건·사업 금액·성능 목표의 TS 전용 제외. 이번 공식 공고 재열람과 보관 원본 해시 대조이며 첨부 재다운로드 해시 대조 아님'},
 {id:'PRE-02',title:'한국산업안전보건공단 AI 기반 MSDS DB 구축 ISP RFP',date:'2026',locator:'PDF 13~15쪽 · 인쇄 23~28쪽 · CSR-010~013 / DAR-001~003',verified:'로컬 원본 PDF 관련 페이지 텍스트 판독 · 시각 렌더링 미수행',url:'https://www.g2b.go.kr/pn/pnp/pnpe/UntyAtchFile/downloadFile.do?bidPbancNo=R26BK01441086&bidPbancOrd=000&fileType=&fileSeq=1&prcmBsneSeCd=03',lesson:'기관 샘플로 PoC·시연 평가 → 예산 내 범위 확정 → FP·비목·운영비 산정',limit:'OCR·비전·인프라 전환 제외. 원본 첨부 URL은 수집 기록 참조이며 이번 재다운로드·해시 대조 미수행'},
 {id:'PRE-03',title:'한국직업능력연구원 AI 진로·진학 ISP 및 PoC 정정 RFP',date:'2026',locator:'HWPX Contents/section0.xml · CNR-ISP-TOB-05·06 / CNR-PRT-VAL-01 / SER-SEC-AI-01',verified:'로컬 원본 HWPX 요구사항 표 직접 판독 · 인쇄 쪽수·변경이력 표시 미확인',url:'https://www.g2b.go.kr/pn/pnp/pnpe/UntyAtchFile/downloadFile.do?bidPbancNo=R26BK01584972&bidPbancOrd=001&fileType=&fileSeq=3&prcmBsneSeCd=03',lesson:'API·배치·파일별 오류·재처리·권한·부하와 전문가 개입 시점 명세. PoC 한계를 본사업 범위에 환류',limit:'상용 클라우드·고정 정확도·환각률 목표 전용 제외. 타 기관 RFP 조건을 TS 법적 의무로 일반화 금지'}
];
const guides=[
 {id:'GUIDE-01',title:'KOSA 2025년 개정 SW사업 대가산정 가이드',url:'https://www.swai.or.kr/site/sw/ex/board/View.do?bcIdx=63607&cbIdx=276&searchExt1=',date:'2025-08-11',locator:'공식 게시문 · AI 사업 대가체계 157~169쪽 안내',fact:'AI 커스터마이징과 SW 개발·운영 산정체계의 구분 안내',limit:'2027년 계약 적용 판본·단가·예산 편성 조건은 산정 시 재확인. 이번 작업은 안내 게시문 확인이며 첨부 전문 신규 판독 아님'},
 {id:'GUIDE-02',title:'NIA ISP·ISMP 수립 공통가이드 제9판',url:'https://www.nia.or.kr/site/nia_kor/ex/bbs/View.do?bcIdx=28088&cbIdx=99835',date:'2025년 제9판 · 2025-12 개정 안내',locator:'공식 게시문',fact:'현행 분석·목표모델·이행계획을 연결하는 ISP·ISMP 지침',limit:'중앙행정기관 예산 안내를 TS 전체 과제의 의무로 확대 금지. 재원·사업유형·기관 심의 경로별 적용 판단 필요'}
];
const productChecks=[
 ['NOA','CCK-NOA','문서·업무공간·도구 수행에 관한 공급사 설명 확인','사건별 질문·검토안·도구 요청 스킬과 담당자 결정의 연결','TS 설치 build·스킬 배포·SDK·사용권·성능 확인 후 재사용 범위 확정'],
 ['aRDa / 기존 저장소','CCK-ARDA','aRDa 독립 제품 원문·실행 검증 미확인','허용 원문·판본·원문 위치·권한의 검색 반환','기존 저장소 우선 대조. aRDa 동일성·API·사용권 확인 전 필수 설치 전제 금지'],
 ['Grantee','CCK-GRANTEE','v1.0 설명자료 2·3쪽의 수집·추출·대사·보고 구조 확인','업무조건·증빙·처리기록 대사 규칙과 원문 근거 반환','분야별 필드·정답·누락·오대조 시험 필요. 계산·최적화·감사 권한 대체 금지'],
 ['Argus','CCK-BACKEND','2026-04-23 draft 제품 설명 판독 · 실제 소스 실행 미확인','NOA의 허용 계획·도구 요청·단계 결과 연결 후보','엔진 계층·로컬 provider·plan schema·도구 허용목록 확인. 설명상의 환각 제로 주장 채택 금지'],
 ['Keeper','CCK-BACKEND','2026-04-20 설명의 Task·claim·callback 구조 확인','승인 대기·취소·중단 후 복구·결과 조회의 구현 후보','Task claim과 원천 거래 멱등성 구분. 승인 대기·재개 기능의 기보유 단정 금지'],
 ['Nexus / 기존 Gateway','CCK-BACKEND','모델 호출 중앙화·사용량·TPM 제어 설명 확인','기존 로컬 모델 호출·timeout·동시성·문맥 크기 시험','상용 모델 경로가 로컬 대응 증거는 아님. 외부 provider 우회 차단·기존 서비스 부하 시험'],
 ['기존 인증 / Mothership 후보','CCK-BACKEND','기존 제품 설명·분석 기록 참조 · 이번 설치 검증 미수행','TS 기존 인증·업무 소속·문서별 권한을 우선 연계','검색·요약·내보내기의 동일 접근 경계 시험. 별도 인증제품 구매 전제 금지']
];
const commonRequirements=[
 {id:'COM-SER-01',title:'자료·도구의 최소권한',work:'기존 인증과 기관·역할·담당 업무·자료등급·행위를 대조하여 원문·추출·검색·요약·내보내기·도구 요청에 동일 권한 적용',acceptance:'권한 밖 업무·자료·행위 시도와 권한 철회 후 재접근의 차단 기록 확인',testId:'COM-T-01',costId:'CORE-02'},
 {id:'COM-SER-02',title:'문서 지시와 업무 지시의 분리',work:'외부 원문 안의 지시문을 데이터로 처리. 도구 허용목록·schema 검증·출력 검증을 모델 추론과 분리',acceptance:'원문에 삽입한 권한 확대·외부 전송·데이터 변경 지시가 실제 행위로 이어지지 않음을 시험',testId:'COM-T-02',costId:'CORE-01'},
 {id:'COM-PER-01',title:'기존 서버의 가용 범위',work:'모델·문맥 길이·파일 크기·동시 사용자·업무시간 조건을 고정해 응답 P50/P95, 실패율, 메모리·CPU/GPU, 기존 서비스 영향 측정',acceptance:'TS 합의 임계값 이내 시험결과와 처리 가능한 범위 제출. 여력 부족 시 동시성·범위 축소 후 재시험',testId:'COM-T-03',costId:'CORE-03'},
 {id:'COM-QUR-01',title:'판본 변경과 수동 복귀',work:'모델·스킬·규칙·자료 판본을 묶어 배포. 이전 판본 복귀와 담당자 수기 처리 후 같은 업무의 결과 연결',acceptance:'재기동·배포 취소·복구 시 확정 기록 보존 및 미처리·중복 처리 구분. 기관 합의 RTO/RPO 시험',testId:'COM-T-04',costId:'CORE-03'},
 {id:'COM-PMR-01',title:'요구사항·시험·변경의 연결',work:'요구 ID → 화면·스킬·연계·자료 → 시험 → 결함 → 수정 판본의 대응 유지. 변경 시 영향·산정 차분·인수조건 갱신',acceptance:'미충족 요구와 시험되지 않은 경로를 완료 처리하지 않는 최종 대응표 제출',testId:'COM-T-05',costId:'CORE-02'}
];
function build(p){const d=diagram.byId[p.id],b=business.byId[p.id],readId=p.id+'-INR-01',handoffId=p.id+'-INR-02';
 const recordsFor=g=>g.metric.records||'수집 제안·현업 확정 전: '+d.key+' 식별, '+p.inputs.join(' / ')+'의 참조·판본, 검토·수정·인계·처리 시각, 사유·차수, 담당자 확인결과. '+g.metric.name+'의 분자·분모와 연결하는 기록표 작성';
 const templates=[
  ['DAR','원자료·업무 연결',p.inputs.join(' / '),'허용된 텍스트·구조화 자료를 '+d.key+' 기준으로 연결. 원문 식별자·위치·판본·확보시점·이용범위 유지. 연결되지 않은 자료의 임의 보충 금지','입력 필드·원문 대응표 / 연결·누락 목록','aRDa 또는 기존 저장소 + 자료 담당자','다른 대상·기간·판본 자료가 같은 업무로 합쳐지는 반례를 구별하고 필수항목별 원문 위치 확인','UNIT-02'],
  ['SFR','기준·증빙 대사',d.source+' / 유효 기준 / 처리기록','Grantee 후보로 '+d.key+'의 조건·증빙·결과 대응을 구성. 정형 값은 규칙으로 비교하고 의미 차이는 NOA와 담당자의 확인으로 연결',p.change.prepared,'Grantee·NOA + '+d.authority,'누락·상충·개정 전후·잘못된 대상 자료를 분리하고 확인된 차이마다 근거 위치 제시','UNIT-01'],
  ['SFR','질문·다음 업무 구성',p.change.entry+' / 대사결과',p.means.noa+' 허용된 질문·도구·확인 담당자·후속 작업을 구성. 근거가 바뀌면 이전 안과 차이를 제시','담당자 검토안 / 확인질문 / 변경 이유','NOA·Argus·Keeper 적용 검토','새 자료로 변경되는 질문과 그대로 유지되는 판단을 구분. 참조 없는 사실 생성·무단 도구 호출을 반례로 시험','UNIT-03'],
  ['INR','전문도구·원천 조회',d.key+' / 검토 대상 조건',d.tool+'을 담당자의 검증된 규칙·전문도구 또는 승인 파일로 수행. NOA에는 도구 결과·적용조건·시점을 함께 반환','조회·계산 결과 / 적용조건 / 원천 참조','기존 업무시스템·전문 담당자','동일 입력의 원천 결과와 반환값 대조. timeout·오류 응답을 정상 결과로 취급하지 않는 시험','UNIT-04'],
  ['SFR','담당자 판단·후속 확인',p.change.prepared,d.authority+'가 근거·수정 이유를 검토하고 기존 절차로 인계. '+b.action,p.completion,d.authority+' + 기존 업무 절차','초안·담당자 결정·접수·실제 처리의 구분. '+b.when+' 상황에서 '+b.queryLabel+'와 후속 확인이 남는지 대조','UNIT-05'],
  ['SER','개인정보·기업자료 보호',d.privacy+' / 자료 이용근거','처리목적·최소필드·보존 조건별 원자료와 업무 검토자료를 구분. 검색·요약·내보내기·로그·정정·삭제에 같은 경계 적용','필드별 이용근거·접근·보존표 / 보호 시험 기록','정보보호·자료 담당자 + CCK','권한 밖 자료 검색·요약·내보내기 차단과 정정·삭제 후 파생본 처리 확인. 민감자료 없는 대체 시험도 기록','UNIT-02'],
  ['TER','성과·정답·반례 평가',p.goals.map(recordsFor).join(' / '),'정상·보완·변경·실패 사례를 난도·자료 완전성별 분리. 현행 A / 규칙·SI B / B+NOA C를 동일 자료와 완료조건으로 비교','전문가 정답·반례 / 지표별 분모·기간 / 오류·재작업 기록','현업 검토자 + 독립 검토자 + QA','안전·권리·서비스 품질 악화 여부를 먼저 확인. AI 추가 편익이 없는 범위는 규칙·SI 적용 또는 범위 재검토','UNIT-06'],
  ['PSR','병행운영·인수',p.completion+' / 운영·복구 조건','시험환경 → 기존 업무와 병행 → 제한 운영 순서로 적용. 실제 판단·대외 처리 권한은 원 담당자 유지','인수 대응표 / 매뉴얼 / 문의·장애·수동 복귀 기록','TS 업무·정보화 운영자 + CCK','미처리·거절·취소·자료 갱신·시스템 중단 후 기존 절차로 처리 가능한지 확인. 설치와 업무 인수 구분','UNIT-07']
 ];
 const requirements=templates.map((r,i)=>({id:p.id+'-'+r[0]+'-'+String(i+1).padStart(2,'0'),category:r[0],title:r[1],input:r[2],work:r[3],output:r[4],owner:r[5],acceptance:r[6],testId:p.id+'-T-'+String(i+1).padStart(2,'0'),costId:r[7],status:'업무자료·미지원 범위 확인 후 포함 여부 확정할 설계 후보',sourceIds:p.evidence.map(e=>e.id),goalIds:p.goals.map(g=>g.id)}));
 const interfaces=[
  {id:readId,title:'허용 원자료·전문 결과 조회',requirementIds:[requirements[0].id,requirements[3].id,requirements[5].id],testIds:[requirements[0].testId,requirements[3].testId,requirements[5].testId],stage:'초기 읽기·승인 파일 후보',direction:d.source+' → 기존 플랫폼·NOA',mode:'초기 승인 파일·읽기 조회. 실제 API·인증·endpoint·schema 미확정',request:['업무 연결키: '+d.key,'requestId·요청자 역할·조회 목적','원문/기준 판본·필요 필드·허용 범위'],response:['값·단위·대상·기준 시점','sourceId·원문 위치·조회 시각','정상·일부 반환·없음·오류의 구분'],failure:'응답 유실·일부 누락 시 정상값 생성 금지. 담당자 원문 확인·재조회로 전환',acceptance:'다른 대상·기간 반환, 권한 거부, timeout, 판본 갱신, 호출량 증가에서 원천 결과와 대조'},
  {id:handoffId,title:'담당자 검토안 인계·처리결과 확인',requirementIds:[requirements[4].id,requirements[7].id],testIds:[requirements[4].testId,requirements[7].testId],stage:'초기 검토안 인계 / 쓰기 확장은 별도 후속',direction:'NOA 검토안 → '+d.authority+' → 기존 절차 → 결과 참조',mode:'초기 검토안·승인 파일 인계. 실제 변경은 별도 권한·승인·원천 결과조회 시험 후 검토',request:['동일 업무ID·검토안 판본·근거 참조','결정자·검토/승인 범위·시각'],optionalWrite:{included:false,fields:['approvalId','approvedInputHash','expectedSourceVersion','idempotencyKey','resultRef'],condition:'별도 범위 합의·쓰기권한·승인된 인자/판본 대조·원천 결과조회 시험 후에만 사용. 초기 조회·파일 인계 필수 필드 아님'},response:['접수번호·회신·처리 참조','인계·접수·실제 처리 시각의 구분','기존 원천에서 확인한 결과·잔여 사항'],failure:'재전송 전에 원천 결과 조회. 처리 여부를 확인할 수 없으면 담당자 확인 대상으로 유지',acceptance:'중복·지연 회신·승인 후 입력·원문 변경·취소 경합에서 무단 확정과 중복 처리 방지'}
 ];
 const special=p.id==='MR-02'?[
  {id:p.id+'-T-D01',case:'기사가 거절하거나 응답하지 않는 요청',expected:'기사 요청·수락 확인 전 주민에게 배차 확정 안내 금지. 상담원과 다른 차량·시간 조율'},
  {id:p.id+'-T-D02',case:'가용 차량 조회 도구가 없는 수동 운영',expected:'상담원 가용목록·운영조건 비교로 처리. 계약·인수·API 가용 확인 후 도구 연계'},
  {id:p.id+'-T-D03',case:'기사 수락 후 취소 또는 실제 미탑승',expected:'기사 수락·운영자 확정·실제 승차를 분리 기록. 공급 부족과 시스템 오류를 구별'},
  {id:p.id+'-T-D04',case:'전화번호·주소 불일치와 승하차 도움이 필요한 요청',expected:'등록번호만으로 자격·현재위치 확정 금지. 주민·허용기관 확인과 도움 조건을 후보 비교에 반영'}
 ]:p.id==='EX11-01'?[
  {id:p.id+'-T-D01',stage:'초기 읽기·검토',case:'ERP 조회값과 계약·검수·청구 또는 검토안의 대상·기간 불일치',expected:'원장 읽기 결과와 증빙의 거래·판본을 재대조하고 담당자 확인. 실제 전표 등록과 분리'},
  {id:p.id+'-T-D02',stage:'후속 쓰기 확장 조건부 · 초기 개발 제외',case:'ERP 초안 등록 후 응답 유실 또는 승인 후 증빙·금액·대상 변경',expected:'승인 범위·입력판본·중복 방지키와 원천 결과조회 대조. 무조건 재등록 금지. 지급·마감·취소 자동실행 제외'}
 ]:[
  {id:p.id+'-T-D01',case:d.key+'가 다른 자료 또는 적용판본 변경',expected:'다른 업무와의 혼합 차단. 기준·증빙·검토안의 변경 범위와 담당자 확인 항목 제시'},
  {id:p.id+'-T-D02',case:b.when,expected:b.action},
  {id:p.id+'-T-D03',case:'처리기록은 있으나 결과가 '+p.completion+'에 못 미치는 경우',expected:'문서 생성·인계만으로 업무 종료 금지. 실제 결과와 남은 일을 담당자가 구별'}
 ];
 const stages=[
  {id:'S1',title:'ISP 수준의 현행·범위 확정',work:'실제 정상·보완·변경 업무 기록, 현행 계약·제품·원천·자료 이용범위 대조',outputs:['현행 처리·병목 근거','입력·기준·책임·추가범위 합의','기존 기능과 추가 작업 차분'],exit:'실제 미지원 범위와 기관 담당자·이용 자료를 확인한 업무만 다음 단계',owner:p.department+'·정보화·CCK',stop:'현업 수요·자료·법정 역할이 연결되지 않으면 개발 편성 보류'},
  {id:'S2',title:'샘플 검증·설계 확정',work:p.scope+' 범위에서 규칙·SI와 NOA의 추가 가치를 비교',outputs:['전문가 정답·반례','판본·규칙·스킬 초안','기존 서버 부하·제품 결합 시험','요구사항·산정 단위'],exit:'품질·편익·서버 여력과 실제 연계 수단을 확인한 범위만 개발 확정',owner:'현업 전문가·CCK·QA',stop:'AI 추가 가치가 없거나 필수 오류가 해소되지 않으면 규칙·SI 대안 검토'},
  {id:'S3',title:'공통 기반·처별 증분 개발',work:p.newWork,outputs:['업무별 스킬·규칙·양식','자료 연결·Adapter','공통 기반 재사용 기록','단위·연계·보호 시험'],exit:'요구 ID별 산출물·시험 결과와 제품/자료/원천 판본 일치',owner:'CCK 개발·QA / TS 원천 담당자',stop:'미확보 API·쓰기 권한은 승인 파일·검토안 인계 범위로 제한'},
  {id:'S4',title:'기존 업무와 병행 검증',work:'기존 절차를 유지하면서 검토안과 실제 처리·결과를 대조',outputs:['지표별 분모·기간','오류·재작업·담당자 수정','취소·중단·수동 복귀 기록'],exit:'기관이 합의한 안전·권리·품질·성능 기준 충족과 운영 수락',owner:'TS 업무·운영 담당자 / CCK 지원',stop:'권한 밖 자료·잘못된 확정·필수 안전사항 누락 발생 시 해당 기능 중단·원인 수정'},
  {id:'S5',title:'인수·운영·확장 판단',work:'확정 범위의 인수, 교육, 운영책임·모니터링·갱신 절차 이관',outputs:['요구·시험·인수 대응표','운영·복귀 매뉴얼','제품·자료·스킬 판본','유상 운영·라이선스 항목'],exit:'실제 미결 요구·잔여 위험·운영비와 책임을 인수자가 확인',owner:'TS 인수·운영자 / CCK',stop:'미측정 효과·미확보 권한·미해결 필수 결함을 확산 근거로 사용 금지'}
 ];
 const units={
  'UNIT-01':'적용 기준·판본·규칙·서식의 종류와 난도',
  'UNIT-02':d.source+'의 서식·필드·기간·결손량과 '+d.key+' 연결 난도',
  'UNIT-03':p.change.steps.join(' / ')+'의 스킬·예외·전문도구 호출 종류',
  'UNIT-04':'실제 원천·전문도구별 조회/인계 접점 수, schema·인증·오류·시험환경',
  'UNIT-05':'공통 화면과 '+p.change.prepared+'의 추가 입력·검토·확정 동작 차분',
  'UNIT-06':'정상·변경·보완·실패 사례의 난도, 전문가 검토·오류 수정·재시험량',
  'UNIT-07':'대상 팀·병행 업무·교육·문의·복귀시험 범위와 실제 지원시간'
 };
 const workPackages=cost.costItems.filter(x=>units[x.id]).map(x=>({...x,quantityBasis:units[x.id],requirementIds:requirements.filter(r=>r.costId===x.id).map(r=>r.id)}));
 const measurement=p.goals.map(g=>({id:g.id,title:g.metric.name,formula:g.metric.formula,records:recordsFor(g),recordsStatus:g.metric.records?'기존 측정안 · 실제 수령·현업 확인 전':'신규 수집 제안 · 현업 확인 전',condition:g.metric.note,baseline:null,target:null,owner:p.department+'·평가 담당자',comparison:'동일 완료조건·자료·난도·기간의 A/B/C 비교. 처리자 학습효과와 제출자 대기를 구분. 결측·미완료와 측정불가 수를 함께 보고',decision:'기준선 확보 후 목표·품질 하한·표본 범위 합의. 정량 편익과 안전·권리·서비스 품질을 함께 판단'}));
 return {id:p.id,department:p.department,title:p.title,date,status,reviewStatus:p.reviewStatus,selection:'미선정 · 개발·발주 범위 미확정',purpose:p.purpose,scope:p.scope,gap:p.gap,inputs:p.inputs,key:d.key,authority:d.authority,completion:p.completion,prepared:p.change.prepared,newWork:p.newWork,privacy:d.privacy,boundary:p.qualification,productPlan:[['NOA',p.means.noa],['원문·판본 기반',p.means.knowledge],['Grantee 후보',d.key+'의 조건·증빙·처리기록 대사 규칙 구성'],['전문도구·기존 시스템',p.means.rules],['담당자 판단',d.authority+'의 결정과 기존 처리결과 확인']],requirements,interfaces,special,stages,workPackages,measurement,evidence:p.evidence,commonRequirementIds:commonRequirements.map(r=>r.id),downloads:{md:'downloads/engineering-2027/'+p.id+'/design.md',json:'downloads/engineering-2027/'+p.id+'/design.json'}};
}
const projects=intent.projects.map(build),byId=Object.fromEntries(projects.map(p=>[p.id,p]));
module.exports={date,status,precedents,guides,productChecks,commonRequirements,projects,byId,pricing:cost.pricing,commonCosts:cost.costItems.filter(x=>x.id.startsWith('CORE-')),conditionalCosts:cost.costItems.filter(x=>!x.id.startsWith('CORE-')&&!x.id.startsWith('UNIT-')),staff:[
 ['업무분석·설계','실제 처리·법정 책임·자료·기준·예외·요구 ID 정의','현업 인터뷰·사례·규칙·연계 합의 범위로 작업량 산정'],
 ['AI·스킬 개발','NOA 검토·도구 요청·판본 변경·근거 반환 구성','질문·예외·정답·로컬 모델 결합 시험량으로 산정'],
 ['자료·연계·화면 개발','원문/구조화 자료·Adapter·업무별 검토 동작','필드·자료량·접점·공통 대비 화면 차분으로 산정'],
 ['전문 검증·QA·보안','정답·반례·실패/권한·부하·인수시험','사례 난도·위험·교차 검토·재시험량으로 산정'],
 ['PM·운영 이관','범위/변경·품질·인수·교육·복귀','단계·팀·현장·지원시간으로 내부 자원계획 산정']
],costRule:'현행 계약·제품·공통 기능 공제 후 추가 기능량·독립 활동량·사용권·경비·운영비 구분. 동일 산출물의 FP와 MM 중복 합산 금지. 프롬프트·요구사항 개수를 FP 또는 인월로 환산 금지. 실제 기능 목록·난도·자료량·연계·견적 확보 후 금액 산정.',scheduleRule:'2027년 단년도 편성 검토. 착수일·월별 일정·투입 인원·인월·총액 미확정. 선행조건 충족과 기관 사업·계약 일정에 따라 단계별 기간 확정.',legalRule:'사업유형·재원·규모·시점에 따라 ISP/ISMP·기관 심의·영향평가·보안성 검토·감리·개인정보·AI 윤리 적용 판단. 특정 선행 RFP의 의무·기한을 모든 TS 과제에 적용하지 않는 기준.',environmentRule:'기존 로컬 LLM·기존 서버 활용, 신규 하드웨어 구매 제외, 비전·센서·차량 제어·독립 R&D 제외. 사용권·운영·통신·검증 비용은 별도 확인. 기존 서버 여력 미충족 시 범위·동시성 축소 또는 편성 보류.'};
