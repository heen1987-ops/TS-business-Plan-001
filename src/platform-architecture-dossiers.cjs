'use strict';

// 공개 원문·저장소 사례 원장의 관찰 범위와 CCK 설계 추론을 분리한 플랫폼 사례 전수 원장.
// flow는 공개된 물리 배치도가 아니라 사례별 핵심 업무·자료 경로이다.
// 병목은 `bottleneckStatus`가 관찰로 표시된 경우 외에는 측정된 장애가 아니다.
const cases = require('./platform-casebook-expanded.json');
const { sourceOverrides } = require('./casebook-synthesis.cjs');
const sourceById = new Map(cases.map(item => [item.id, item.url || sourceOverrides[item.id]?.url || '']));

const rows = [
  {
    caseId: 'PF-R01', architectureBasis: 'HUG RFP 목표 구성도와 SFR-006~008; 실제 배치 미확인', sourceStage: 'RFP 목표',
    flow: ['전세보증 사건·서류 접수', '원본 보존·OCR/VLM 추출', '사건 ID별 항목·원문 좌표 연결', '필수서류·규정 비교', '담당자 판정·민원 초안', '승인 결과·판본 기록'],
    dataBoundary: '사건별 비공개 서류와 승인된 사내 지식의 색인 분리; 추출값은 원본 좌표·문서판본에 귀속',
    decisionBoundary: '모델의 누락·상충 표시는 보류 사유이며 보증 심사 확정은 담당자 권한',
    bottleneck: '저화질·복합 서류에서 추출값과 원본 위치의 연결이 끊기면 규칙 검토 결과도 재현 불가', bottleneckStatus: '설계상 병목 후보',
    validation: '저화질·타 사건·누락 서류를 섞어 추출값·좌표·사건 ID·사람 판정의 일치율과 보류율 측정',
    unknowns: '운영 중 OCR 정확도, HUG 원장 연결 방식, GPU 구성도 목표안의 실제 설치 여부',
    cckImplication: 'TS 서류심사 업무팩 후보에 원본 좌표형 증거, 사건 식별자와 보류 규칙을 추가 설계'
  },
  {
    caseId: 'PF-R02', architectureBasis: 'NIA 원문 RFP의 목표시스템·RAG·데이터 처리 도식; 서비스 개시는 별도 공식 발표', sourceStage: 'RFP 목표 + 서비스 개시',
    flow: ['국민신문고·시범기관 민원 수집', 'OCR·메타데이터·유형 정제', '키워드·벡터 검색 병렬 호출', '재정렬·유사 민원 군집', '근거형 추천답변 생성', '담당자 수정·처리 이력 환류'],
    dataBoundary: '원문 민원·기관 매뉴얼에서 전처리 데이터와 검색 색인으로 이동할 때 사건·기관·공개등급 보존',
    decisionBoundary: '검색 유사도와 답변 추천은 참고값; 동일 사건 병합·공식 회신은 소관 담당자 결정',
    bottleneck: '재정렬 점수나 유사도 문턱값이 실제 동일 사건·답변 적법성을 보증하지 못해 오병합·오답 위험', bottleneckStatus: 'RFP 설계상 병목 후보',
    validation: '표현만 유사한 별개 사건과 반대 취지 민원으로 검색·병합·추천답변을 분리 평가',
    unknowns: '가동 시스템의 실제 모델·색인 배치, 운영 정확도와 민원 처리 전체시간',
    cckImplication: 'TS 민원 후보에는 검색 근거 검증과 사건 동일성 판단을 분리하고 현업 수정 이력·오병합 반례셋을 설계'
  },
  {
    caseId: 'PF-R03', architectureBasis: '후속 RFP SFR-007~012와 기존 정보시스템 현황도; 고도화 설치 미확인', sourceStage: '후속 RFP 목표',
    flow: ['직원 SSO·소속·직무 확인', '연구행정·경영정보 문서 권한 조회', '직무·검색이력 기반 재정렬', '도메인 에이전트·정형문서 생성', '양식·근거·권한 검사', '현업 확인·문서시스템 반영'],
    dataBoundary: '기존 포털·행정 DB와 검색 색인 사이의 문서 권한·검색이력 사용범위',
    decisionBoundary: '개인화된 순위는 자료 접근권한을 넓히지 않으며 최종 연구행정 문서는 담당자 승인',
    bottleneck: '검색이력을 재정렬 신호로 쓰면서 조직 이동 뒤 구직무 지식이나 비인가 문서가 상위에 남을 가능성', bottleneckStatus: 'RFP 설계상 병목 후보',
    validation: '동일 질의를 부서·직무별로 비교하고 전보·겸직·퇴직 후 순위·본문·캐시 노출 검사',
    unknowns: '실제 권한 필터 집행 위치, 모델 롤백 자동화, GPU 이중화와 비용 관측 결과',
    cckImplication: '조직 네이티브 검색 후보에 직무 유효기간과 권한 필터 선집행을 넣고 이동 후 순위 회귀시험을 설계'
  },
  {
    caseId: 'PF-R04', architectureBasis: '안전 LLM 과업내용서 H/W·S/W 예시 구성도와 SFR-005~008; 공급사 계약 발표', sourceStage: 'RFP 목표 + 계약 발표',
    flow: ['안전 규정·부서 문서 수집', '개정판·폴더 권한 갱신', 'DMZ AI 서치·내부 RAG 검색', '규정 상충·검토 의견 생성', '안전 담당자 원문 대조', '피드백·지식공간 재색인'],
    dataBoundary: 'DMZ 검색 접점과 내부 안전 문서·LLM/DB 영역, 개인·부서 지식공간의 폴더 접근정책',
    decisionBoundary: '안전 규정 해석·검토 확정은 안전 담당자; 자동 최신화가 폐지판본 차단을 보증하지 않음',
    bottleneck: '문서 갱신과 색인·권한 갱신 시점이 어긋나면 폐지 규정 또는 타부서 폴더가 답변에 남음', bottleneckStatus: 'RFP 설계상 병목 후보',
    validation: '개정·폐지·상충 문서와 권한 회수 이벤트 후 검색 결과·근거·캐시를 전 구간 대사',
    unknowns: '예시 구성도와 실제 망 배치의 일치, 운영 지연·오노출·판본 오류 실측',
    cckImplication: 'TS 안전 지식팩 후보에 조문 효력일·소유부서·권한 변경 이벤트를 묶는 선택적 재색인·회귀검증 설계'
  },
  {
    caseId: 'PF-R05', architectureBasis: '경기도 RFP 목표기능·서비스 아키텍처 도식; 착수 발표와 운영 성과 구분', sourceStage: 'RFP 목표 + 착수',
    flow: ['도 홈페이지 공고·정책 RDB', '수집·정제·갱신 파이프라인', '공공클라우드 벡터 DB', '외부 LLM의 조건형 답변', '지역·자격·마감일 검사', '원문·공식 신청 경로 안내'],
    dataBoundary: '홈페이지 원장→클라우드 색인→외부 모델 호출의 전송 범위 및 갱신 시각',
    decisionBoundary: '챗봇의 정책 추천은 신청 자격 확정이나 접수 완료가 아니며 이용자가 원문·신청 화면 확인',
    bottleneck: '공고가 바뀐 뒤 벡터 색인·비교 조건이 늦게 갱신되면 마감·자격·지역 안내가 엇갈림', bottleneckStatus: 'RFP 설계상 병목 후보',
    validation: '마감 당일·수정 공고·유사 정책을 주입하고 원문 판본과 답변·링크·재색인 지연 측정',
    unknowns: '실제 서비스 개시, 외부 LLM 전송 필터 구현, 공식 신청 전환율·오안내율',
    cckImplication: 'TS 국민서비스 후보에 서비스 카탈로그 원장, 갱신 SLA와 마감·자격 조건 검증기를 설계'
  },
  {
    caseId: 'PF-R06', architectureBasis: '철도기술연구원 RFP 기존 시스템 구성도 및 FUR-001~009·TER-005', sourceStage: 'RFP 목표',
    flow: ['직원 음성·텍스트 요청', 'STT·휴가/출장 의도 분류', '날짜·목적지·서식 필드 추출', '사용자 수정·최종 확인', '신규 MIS API로 기안 생성', '전자결재 상신·원천 상태 대사'],
    dataBoundary: '대화 입력에서 인사·근태 원장 및 협업 포털·전자결재로 넘어가는 개인 정보와 필드 계약',
    decisionBoundary: 'AI가 신청 초안을 만들 수 있으나 상신·취소는 사용자 확인 및 원천시스템 권한에 종속',
    bottleneck: '의도 인식 뒤 원장 쓰기·결재선 생성 사이에 재시도 또는 취소가 끼면 중복 기안·잘못된 상신 위험', bottleneckStatus: 'RFP 설계상 병목 후보',
    validation: '날짜 오류, 반복 클릭, 네트워크 재시도, 상신 전 취소를 재현해 멱등키·결재선·접수 상태 대사',
    unknowns: 'MIS API 실제 제공 범위, 운영시 중복률과 결재선 변경 전파시간',
    cckImplication: 'TS 업무 실행 후보에 발화 확인, 읽기/쓰기 권한 분리, 멱등 요청키와 원장 상태 대사를 필수 설계'
  },
  {
    caseId: 'PF-R07', architectureBasis: 'KISA 최종 본공고 SFR-001~006·QUR-001; 공개 구조도 부재로 CCK 논리 재구성', sourceStage: '본공고 RFP 목표',
    flow: ['홈페이지·앱 스팸 민원 질문', '민감 발화 정리·법령 판본 조회', '외부 생성형 AI API·RAG 호출', '출처·최신성·답변불가 판정', '민원인 안내 또는 전문가 연결', '자동·전문가 평가셋 갱신'],
    dataBoundary: '민원 입력·법령 지식의 외부 모델 전송 범위와 공개용 답변 로그 보존 정책',
    decisionBoundary: '출처 불명·개정 충돌에서는 답변 보류 후 전문가 확인; AI 응답은 법적 유권해석 아님',
    bottleneck: '외부 API 지연·불능과 개정 법령 색인 지연이 겹치면 응답 품질과 동시요청 성능을 함께 악화', bottleneckStatus: 'RFP 설계상 병목 후보',
    validation: '공격 발화·근거 없음·개정일 경계·100명 동시 접속에서 보류율·지연·정답률 분리 측정',
    unknowns: '낙찰 후 모델·배치, 전문가 평가 결과, 실제 사용자 부하',
    cckImplication: 'TS 대민 지식 후보에 외부 API 실패 격리와 최신 조문 검사, 답변 보류·전문가 인계 경로를 설계'
  },
  {
    caseId: 'PF-R08', architectureBasis: '예금보험공사 사전공개 RFP의 목표 구성·데이터 도식; 공급사 계약 발표, 최종본 미확인', sourceStage: '사전규격 RFP + 계약 발표',
    flow: ['공개 웹자료 수동 업로드·사내 ECM 연계', '대민·임직원 DB 및 망 분리', 'SSO/EAM·DRM·메타데이터 검사', '안건 검색·LLM 요약 또는 금융 산식 처리', '단위·근거·권한 교차검증', '담당자 승인·운영 평가'],
    dataBoundary: '대민 공개자료 수동 업로드와 사내 ECM·DRM 자료가 별도 DB·보안 영역을 통과하는 경계',
    decisionBoundary: '검색·계산 결과는 제안이며 내부 안건 해석과 금융 산식 확정은 권한 있는 담당자',
    bottleneck: '공개자료 수동 갱신 지연 및 대민/사내 망·권한 경계 간 데이터 혼합 위험', bottleneckStatus: '사전규격 설계상 병목 후보',
    validation: '외부 계정의 내부 문서명·본문 요청, DRM 차단, 공개자료 변경 후 색인 지연, 산식 독립 재계산',
    unknowns: '최종 RFP 변경점, 실제 서브넷/DB 배치, 공개자료 자동화 여부와 준공 품질',
    cckImplication: 'TS 공개·내부 서비스 후보를 분리하고 공개자료 갱신 원장·권한 교차시험·수치 독립검산을 설계'
  },
  {
    caseId: 'PF-R09', architectureBasis: '석유공사 정정 RFP SER-001~004·FUR-001~006; 공개 물리도 부재로 CCK 논리 재구성', sourceStage: '정정 RFP 목표',
    flow: ['사번·소속·직무 확인', '인사·안전·시추·지질·비축·시장 업무 분류', '영역별 문서·정형자료 RAG', '에이전트·보고서/ERP 조회', '근거·자료권한·도메인 검사', '현업 승인·업무결과 저장'],
    dataBoundary: '여섯 전문 업무의 서로 다른 원천·문서 권한과 ERP 조회/실행 경계',
    decisionBoundary: '범용 챗봇의 영역 선택은 자동 분류 후보; 실제 ERP 쓰기와 사업 판단은 해당 직무 승인',
    bottleneck: '범용 대화창이 특화업무를 잘못 라우팅하면 다른 도메인 근거·권한·평가 기준이 혼입', bottleneckStatus: 'RFP 설계상 병목 후보',
    validation: '겸직·전보 및 여러 도메인을 함께 묻는 질의에서 라우팅·접근허용·근거·원천 결과 시험',
    unknowns: '도메인별 운영 모델·연계 API, 원천 ERP 쓰기 제공, 특화업무 실제 인수 기준',
    cckImplication: 'TS 12대 과제 업무 라우터 후보에 공식 직무·소관·업무 목적의 우선순위와 교차도메인 보류 규칙을 설계'
  },
  {
    caseId: 'PF01', architectureBasis: '행정안전부 공식 공통기반·법령비서 시범 발표; 배치도 비공개, CCK 논리 재구성', sourceStage: '공통기반 운영 + 업무앱 시범',
    flow: ['정부 공통 AI 이용환경', '법령·판례 지식 수집·효력일 정리', '직원 질의·소관 확인', '공통 검색·모델을 통한 답변', '조문·판례 근거 확인', '담당자 업무 검토·오답 환류'],
    dataBoundary: '범정부 공통 서비스와 법령비서용 지식·기관별 직원권한의 경계',
    decisionBoundary: '법령비서가 조문 근거를 제시해도 적용 판단·결재는 소관 공무원',
    bottleneck: '공통 모델의 법령 답변이 조직별 소관·시행일·업무 예외와 연결되지 않으면 현업 재검토 부담', bottleneckStatus: '논리 구조의 검증 질문',
    validation: '같은 법령 질문을 소관·기준일·직무별로 바꾸어 유효 조문, 예외, 책임부서 일치 확인',
    unknowns: '시범 앱의 내부 아키텍처와 정확도, 범정부 배포·업무시간 절감 실측',
    cckImplication: 'TS 법령·규정 스킬 후보에 소관부서·효력일·업무분장표를 공통 검색 위에 얹는 구조 설계'
  },
  {
    caseId: 'PF02', architectureBasis: '한전 기관 사보의 사내표준 AI 운영 설명; 서버 구조 비공개, CCK 논리 재구성', sourceStage: '기관 발표·운영',
    flow: ['사내표준·개정 이력 정비', '문서번호·유효 조문 색인', '직원 표준 질의', '근거 응답·개정 영향 후보', '소관부서 오류·개정 검토', '전자결재·승인판 재배포'],
    dataBoundary: '표준 원문/구판과 AI 색인, 승인 전 개정안과 효력 있는 승인본의 구분',
    decisionBoundary: 'AI의 개정 제안은 표준 변경이 아니며 소관부서 검토·전자결재 후 효력 발생',
    bottleneck: '문서번호·개정일 정합성이 낮으면 올바른 조문을 찾더라도 구판 근거가 답변에 섞임', bottleneckStatus: '기관 발표에서 정비 부담 설명·설계 추론',
    validation: '개정 전후 동일 질의의 인용 조문·효력일 및 승인판 배포 후 색인 지연 대사',
    unknowns: '실제 검색·전자결재 연계 API, 구판 인용 오류율, 절감 기대치의 실측 여부',
    cckImplication: 'TS 사규·업무지침팩 후보에 조문 ID·효력일·승인상태와 개정 영향 업무 회귀평가 설계'
  },
  {
    caseId: 'PF-A03', architectureBasis: 'KIND 공식 RFP 사업범위와 로컬 원문 확인; 원문 물리 배치 부재로 CCK 논리 재구성', sourceStage: '본공고 RFP 목표',
    flow: ['해외사업 산출물·암호문서 수집', '사업·부서·문서 메타데이터 부착', '동적 권한 필터를 거친 하이브리드 검색', 'RAG 답변·내부 API 에이전트', '원문·도구결과 대조', '사업부서 검토·업무 초안'],
    dataBoundary: '원문·청크·검색결과마다 사업별 문서권한과 암호화 상태를 일관되게 전파',
    decisionBoundary: '권한 필터 통과는 읽기 조건일 뿐 내부 API의 실행·승인 권한과 별도',
    bottleneck: '권한이 철회된 뒤 검색 색인·캐시에 이전 청크가 남거나 메타데이터가 빠지면 비인가 노출', bottleneckStatus: 'RFP 설계상 병목 후보',
    validation: '전보·권한 회수·메타데이터 누락·암호문서를 넣어 제목·본문·요약·캐시의 노출 검사',
    unknowns: '실제 동적 필터 위치, 암호문서 처리 구현, 계약·검수·운영 성과',
    cckImplication: 'TS 공통 조직·권한 계층 후보에 원문-청크-결과의 동일 정책 ID와 회수 후 재검증을 설계'
  },
  {
    caseId: 'PF03', architectureBasis: '고용노동부 공개 데이터 MCP 서비스 개시 발표; 서버 내부 구성 미공개', sourceStage: '공식 서비스 개시',
    flow: ['외부 AI가 사용자 질문 해석', '공개 MCP 도구 목록 조회', '도구·인자 스키마 선택', '기존 공식 공공 API 호출', '응답 코드·기준일 확인', 'AI가 출처와 최신 데이터 안내'],
    dataBoundary: '외부 AI 도구 호출과 원천 공공 API 사이의 인증·호출량·공개 데이터 범위',
    decisionBoundary: 'MCP의 공식 데이터 조회와 민원 접수·자료 수정 실행은 별도 권한·거래',
    bottleneck: '도구 스키마·원천 API 버전이 달라지면 모델이 올바른 의도를 선택해도 빈 값·오해석 응답', bottleneckStatus: '공개 설명 기반 검증 질문',
    validation: '필수 인자 누락, API 오류·스키마 변경, 쓰기 요청을 주입하여 차단·출처·재시도 검사',
    unknowns: '도구 서버 구현체, 실제 장애율·API 버전 전파시간, 내부 행정 실행 지원 여부',
    cckImplication: 'TS 기존 API 재사용 후보에 읽기 도구 계약·버전시험을 우선 정의하고 쓰기는 별도 승인 게이트 설계'
  },
  {
    caseId: 'PF04', architectureBasis: '삼성SDS 자사 플랫폼·사내 운영 설명; 테넌트 배치·권한 상세 비공개', sourceStage: '공급사 발표·사내 운영',
    flow: ['직원 직무용 AI 접점', '사내 지식·문서 검색', 'FabriX의 모델·도구 조정', '사내 시스템 API 실행 후보', '직원 결과 검토', '업무 완료·피드백 기록'],
    dataBoundary: '공통 AI 플랫폼과 업무별 시스템 API·협업도구 사이의 계정 위임 및 문맥 전달',
    decisionBoundary: '도구 추천·초안과 실제 시스템 변경/발송 권한을 분리해야 하며 세부 구현은 미공개',
    bottleneck: '공통 플랫폼 접점만으로는 직무별 API 권한·업무 상태를 자동으로 일치시키기 어려움', bottleneckStatus: '공급사 설명 기반 설계 추론',
    validation: '직무별 하나의 업무를 접수부터 원천 완료까지 추적해 오실행·재작업·소요시간 측정',
    unknowns: 'FabriX 내부 오케스트레이터·API 인증 구조, 전사 업무 완료율·품질 독립 평가',
    cckImplication: 'TS 업무팩 후보는 모델 공유보다 업무별 API 계약·승인·완료상태 대사를 중심으로 설계'
  },
  {
    caseId: 'PF-A06', architectureBasis: '삼성 공식 Gauss 2·Portal·code.i 발표; 모델 서빙 배치 미공개', sourceStage: '기업 발표·사내 운영',
    flow: ['일반 직원 Portal·개발자 code.i 접점', '문서 또는 코드 문맥 준비', '공통 Gauss 모델군 호출', '일반 작성·개발 코드 제안 분기', '문서 사실·코드 보안 검사', '직원·개발자 최종 반영'],
    dataBoundary: '일반 업무자료와 소스코드·저장소 권한을 서로 다른 도구 문맥으로 전달',
    decisionBoundary: '모델 코드 제안의 병합·배포와 일반 문서 발송은 별도 사람 검토 책임',
    bottleneck: '일반 업무와 개발 업무를 단일 성능·품질 지표로 측정하면 오류 비용과 검토 부담이 가려짐', bottleneckStatus: '공식 발표 기반 설계 추론',
    validation: '포털 작성과 code.i 개발 과업을 분리해 정확도·보안 결함·수정 공수 측정',
    unknowns: '모델 선택·문맥 정책의 내부 구현, 실제 비용·절감량·개발 결함률',
    cckImplication: 'TS 공통 모델 사용 후보에도 부서별 입력등급·출력검증·품질지표를 업무팩 단위로 분리 설계'
  },
  {
    caseId: 'PF05', architectureBasis: '일본 디지털청 源内 공식 서비스·정책 설명; 내부 배치도 미공개', sourceStage: '청내 운영 + 범정부 실증',
    flow: ['공무원 정부 인증', '업무 앱·템플릿 선택', '기관 문서·규정 문맥 입력', '源内 공통 AI 환경 처리', '공무원 근거·용도 검토', '앱별 활용·피드백 관측'],
    dataBoundary: '범정부 공통 환경과 각 기관 지식·설정·사용기록의 분리',
    decisionBoundary: '공통기반 접근 허용과 기관 업무별 답변·행정 결정의 책임 분리',
    bottleneck: '기관별 지식·업무 스킬의 소유자와 판본이 없으면 공통 앱 확산 과정에서 설정 복제·오래된 지식 확산', bottleneckStatus: '공식 설명 기반 설계 추론',
    validation: '첫 부서와 두 번째 부서 도입의 설정 변경량·격리·품질 회귀·추가 공수 비교',
    unknowns: '실제 테넌트 격리 기술, 실증 기관별 이용·품질·생산성 수치',
    cckImplication: 'TS에서 다른 부처로 확장할 공통기반 후보에 기관 설정·업무 스킬의 소유·승인·배포판본 체계를 설계'
  },
  {
    caseId: 'PF-A08', architectureBasis: 'GovTech AIBots 제품 문서와 Desk 카탈로그; 두 제품의 현재 관계를 구분', sourceStage: 'AIBots 이용 사례 + Desk 통합·POV',
    flow: ['담당팀 문서 업로드', '봇별 지시·문서 RAG 구성', '팀 공유범위·정보등급 설정', '직원 질문·봇 응답', '출처·업무시스템 연결 검토', '봇 갱신·회수'],
    dataBoundary: '업로드 문서 소유팀·보안등급과 봇 공유범위, Desk 업무시스템 접근 경계',
    decisionBoundary: '문서 답변용 봇 공유와 실제 업무시스템 실행은 별도 기능·고위험 승인 범위',
    bottleneck: '셀프서비스 봇이 늘수록 중복 지식·구버전 문서·퇴사한 소유자의 봇이 남을 위험', bottleneckStatus: '제품 설명 기반 설계 추론',
    validation: '동일 문서 다중 봇, 소유자 변경, 문서 삭제 후 응답·공유·회수까지 시간 측정',
    unknowns: 'Desk의 실제 실행 범위와 AIBots 이전 완료, 봇 수 대비 업무성과',
    cckImplication: 'TS 부서 스킬 제작 후보에 소유자·승인판본·공유범위·폐기일과 중복 탐지 체계 설계'
  },
  {
    caseId: 'PF-A09', architectureBasis: 'GovTech Pair 공식 제품 문서; 백엔드·성능 상세 미공개', sourceStage: '정부 공통도구 운영',
    flow: ['정부 기기·직원 접속', '업무 질문·작성 자료 입력', '허용 범위·이용정책 적용', 'Pair 공통 LLM 처리', '초안·조사 결과 제공', '공무원 사실·민감정보 검토'],
    dataBoundary: '정부 기기·공통 LLM 이용 환경에 투입되는 기관 문서와 보관조건',
    decisionBoundary: '초안 제시는 행정 결정·공문 발송이 아니며 공무원 검토 필요',
    bottleneck: '범용 작성 도구의 이용량만으로 직무별 완료시간·오류·업무성과를 판별할 수 없음', bottleneckStatus: '제품 설명 기반 평가 한계',
    validation: '동일 난도 과업에서 AI 사용·미사용군의 완료시간·오류·사람 수정량 측정',
    unknowns: '내부 모델 라우팅·자료 보관 구현, 현재 사용 규모와 독립 정량 업무효과',
    cckImplication: 'TS 공통도구 확산 후보는 업무 시작·완료·수정 로그를 연결한 직무별 평가 설계와 함께 제안'
  },
  {
    caseId: 'PF06', architectureBasis: '프랑스 DINUM Albert API 서비스 목록·공식 API 참조; 호출 계층 공개, 내부 물리 배치 미공개', sourceStage: '공통 API 운영',
    flow: ['기관 앱 Bearer 인증', '모델·검색·OCR·음성전사 엔드포인트 선택', '파일·질의 인자 검증', '공통 AI API 처리', '구조화 결과·오류 코드 반환', '앱 후처리·사용량 관측'],
    dataBoundary: '기관 앱의 파일·음성·질의가 공통 API로 넘어가는 인증·용량·보관 경계',
    decisionBoundary: 'API 처리 결과는 업무 앱의 중간 산출물; 기관별 검수·발송·결재 책임은 호출 앱',
    bottleneck: '공통 API 오류·지연·쿼터를 업무 앱이 동일하게 취급하면 핵심 업무와 비핵심 기능이 함께 중단', bottleneckStatus: '공식 API 기반 설계 추론',
    validation: '엔드포인트별 타임아웃·429·입력 오류·재시도·비용을 업무 앱별로 분리 시험',
    unknowns: '실제 내부 모델 배치·운영 SLA와 기관별 장기 품질',
    cckImplication: 'TS 공통 AI 서비스 후보에 API 계약·용량 정책과 부서별 실패 격리·사용량 계측을 설계'
  },
  {
    caseId: 'PF07', architectureBasis: 'Bürokratt Common-Knowledge 공식 저장소 ARCHITECTURE.md의 공개 구성·시퀀스와 RIA 서비스 소개', sourceStage: '공개 소스 아키텍처 + 다기관 안내 운영',
    flow: ['기관 웹·API 출처 설정', 'Scrapper·Scheduler 수집', 'Cleaning·File Processing 정제', 'S3 원본/정제본·PostgreSQL 메타데이터 저장', 'Ruuter 외부/내부 API→Resql 질의', '국민 대화·미해결 상담 연결'],
    dataBoundary: '기관별 출처·수집본과 공동 지식 저장소, Ruuter 외부/내부 API 및 Vault 자격증명 경계',
    decisionBoundary: '공동 지식 조회와 소관 기관의 공식 답변·상담 접수 수락은 별도 업무 단계',
    bottleneck: '수집·정제 완료 상태가 기관별 소관·원문 효력과 연결되지 않으면 공동 답변이 낡거나 이관 실패', bottleneckStatus: '공개 소스 구조에서 도출한 설계상 병목 후보',
    validation: '출처 삭제·수집 실패·정제 실패·관할 변경을 재현해 지식 상태·상담 수락·원문 이동 추적',
    unknowns: '공개 저장소와 각 기관 운영 배포 형상 일치, 상담 전환 완료율·실제 병목 측정',
    cckImplication: 'TS 국민서비스 후보에 수집 상태·기관 소관·대화 인계 수락을 하나의 추적 ID로 묶는 설계'
  },
  {
    caseId: 'PF-A12', architectureBasis: '영국 DSIT 알고리즘 투명성 기록·GOV.UK 실증 평가; RAG 구성 공개, 물리 구성 일부만 공개', sourceStage: '공식 기술 공개 + 웹·앱 실증',
    flow: ['GOV.UK 공개 콘텐츠 선별', '문서 청킹·벡터화·OpenSearch 저장', '앱의 범위내 질문 판정', 'Rails 조정·Bedrock Claude 답변', '근거 링크·가드레일 확인', '이용자 원문 이동·평가 로그 분석'],
    dataBoundary: '공개 GOV.UK 자료만 검색 색인으로 공급하며 이용자 대화와 관리자·BigQuery 분석 기록 분리',
    decisionBoundary: '챗봇은 공개 지침 안내에 한정; 개인 사례 판정·거래 처리·민원 접수는 기존 공식 서비스',
    bottleneck: '공개 문서에 근거가 있어도 개인 조건이 모호하면 추가 질문과 서비스 인계 없이는 유효한 안내가 어려움', bottleneckStatus: '공식 실증 관찰 + 설계 추론',
    validation: '모호한 발화·개인정보 포함 질문에 대한 확인 질문, 원문 링크, 공식 서비스 도달률과 포기율 평가',
    unknowns: '운영 트래픽의 최신 응답 품질, 서비스 전환 후 실제 행정처리 완료율',
    cckImplication: 'TS 대국민 접점 후보에 발화 확인·공식 서비스 카탈로그·안내와 접수 완료의 분리 계측 설계'
  },
  {
    caseId: 'PF-A13', architectureBasis: '영국 정부 M365 Copilot 범정부 실험 보고서; M365 제품 내부 아키텍처 미공개', sourceStage: '실험·정부 평가',
    flow: ['기관별 참가자·라이선스 배포', '기존 M365 권한의 업무 자료 접근', 'Copilot 작성·검색 지원', '직원 사실·공유범위 확인', '사용 로그·설문 수집', '기관·직무별 업무효과 분석'],
    dataBoundary: '기존 M365 문서 공유권한과 Copilot에 투입되는 과업 문맥·평가 설문',
    decisionBoundary: 'Copilot 초안·요약과 직원의 실제 업무 반영·발송을 분리',
    bottleneck: '자기보고 절감시간과 사용량을 실제 완료시간·예산 절감으로 환산하면 평가가 과대해짐', bottleneckStatus: '공식 평가의 측정 한계',
    validation: '동일 직무·난도 기준선과 AI 사용군의 객관 완료시간·오류·라이선스 총비용 비교',
    unknowns: 'M365 내부 모델·검색 경로, 기관별 장기 효과와 보고서 모집단 중복 보정',
    cckImplication: 'TS 도입평가 후보에 사용 로그, 사람 수정량, 완료시간·오류·비용을 같은 업무 단위로 연결'
  },
  {
    caseId: 'PF-A14', architectureBasis: '영국 정부 Consult 최초 실증 발표; 모델·서버 배치 비공개', sourceStage: '업무 앱 최초 실증',
    flow: ['정책 협의 응답·문항 수집', '개인정보·문항 범위 정리', 'AI 주제 분류·요약', '소수·반대 의견 대조', '공무원 원문 수정·검토', '정책 분석 자료 작성'],
    dataBoundary: '다수 시민 원문 응답과 집계·요약 결과 사이의 주제·근거·개인정보 연결',
    decisionBoundary: '주제 분류는 조사 보조; 의견 해석·정책 채택은 공무원 판단',
    bottleneck: '빈도가 낮은 반대·예외 의견이 자동 요약에서 사라지면 정책 검토가 편향', bottleneckStatus: '첫 실증 구조의 검증 질문',
    validation: '소수 의견·복수 주제·상충 응답의 원문 회수율과 수작업 대조·수정 공수 비교',
    unknowns: '상세 분류 모델·평가 데이터, 정부 전반 확산 및 추정 절감의 실제 실현',
    cckImplication: 'TS 국민 의견 분석 후보에 소수·상충 의견 보존과 원문 역추적·현업 수정 기록 설계'
  },
  {
    caseId: 'PF-A15', architectureBasis: '호주 디지털전환청 APS Copilot 실험·평가 보고서; Microsoft 내부 배치 비공개', sourceStage: '정부 실험·외부 평가',
    flow: ['기관 지명 참가자·라이선스 배정', 'M365 협업 문맥 사용', 'Copilot 업무 지원', '기관별 교육·활용 안내', '직원 결과 검토', '설문·기관 평가·사례 분석'],
    dataBoundary: '기존 기관 협업 문서와 AI 이용 로그·참여자 설문 자료의 분리',
    decisionBoundary: 'AI가 만든 문서는 직원 검토 후 반영하며 실험 참여 경험은 전 기관 성과 아님',
    bottleneck: '기관 지명 참가자와 주관적 시간절감은 선택편향이 있어 전체 직원 실측 효과로 일반화 불가', bottleneckStatus: '공식 평가 방법상 한계',
    validation: '부서·숙련도·과업 난도를 짝지어 완료시간·오류·수정률과 교육 투입량 비교',
    unknowns: '제품 내부 처리 경로, 무작위 대조 결과, 장기 유지비와 생산성',
    cckImplication: 'TS 확산 후보는 교육·숙련도·직무를 교차 분류한 측정 계획을 구축 범위와 같이 설계'
  },
  {
    caseId: 'PF-A16', architectureBasis: 'BBVA·OpenAI 공식 제휴 발표; 기업 내부 도구 연결·물리도 미공개', sourceStage: '기업 활용 발표 + 확대 계획',
    flow: ['초기 직원 기업 AI 계정', '전문화 GPT·업무 지시 설계', '현업 지식·과업 문맥 입력', '기업 AI 응답·초안', '담당자 검토·업무 반영', 'Global AI Adoption 조직의 사례 확산'],
    dataBoundary: '기업 AI 환경과 은행별 민감정보·전문화 GPT 지식의 접근 범위',
    decisionBoundary: '직원용 GPT 활용과 금융 의사결정·거래 집행은 다른 검토·통제 단계',
    bottleneck: '전문화 GPT의 수와 계정 확산 속도가 업무 완료·오류·규정 준수의 개선을 보증하지 않음', bottleneckStatus: '기업 발표 기반 평가 한계',
    validation: '초기 사용자와 확대 대상의 유사 과업을 비교해 검토시간·재작업·규정 오류·비용 계측',
    unknowns: '내부 데이터 연결 방식, 계획된 전사 확대의 완료·ROI, 독립 감사 결과',
    cckImplication: 'TS 현업 스킬 확산 후보에 승인된 지식판본·직무별 결과 품질·채택 조직의 운영책임 설계'
  },
  {
    caseId: 'PF08', architectureBasis: 'Morgan Stanley 공식 Assistant·Debrief 출시 설명; 내부 모델·CRM 연계 상세 비공개', sourceStage: '기업 발표·업무 도구 운영',
    flow: ['자문가·고객의 회의 녹취 동의', '회의 발언·참석자 문맥 수집', 'Debrief 요약·할일·후속 메일 초안', '자문가 사실·수신자 확인', 'CRM 기록·이메일 후속 처리', '후속조치 이력 확인'],
    dataBoundary: '고객 동의 회의 기록에서 자문가 도구, CRM, 이메일로 이어지는 개인정보·수신자 경계',
    decisionBoundary: 'AI 후속 메일·CRM 초안은 자문가 편집·확인 후 반영; 자동 발송 여부는 공식 설명 범위에 한정',
    bottleneck: '동의·수신자·회의 사실을 대조하지 않고 후속 작업을 자동화하면 잘못된 CRM 기록·외부 발송', bottleneckStatus: '공식 서비스 설명 기반 설계 추론',
    validation: '동의 철회·잘못된 참석자·담당 변경·판본 변경 후 CRM·메일 반영 전 확인 게이트 시험',
    unknowns: '내부 저장·승인 구현, Assistant와 Debrief 각각의 실제 사용·절감 효과',
    cckImplication: 'TS 내부 업무 후속조치 후보에 동의·원문 근거·담당자 확인·원천 반영 상태를 묶는 설계'
  },
  {
    caseId: 'PF-A18', architectureBasis: 'JPMorganChase 공식 기술 발표·연차보고의 LLM Suite 설명; 세부 처리 경로 비공개', sourceStage: '전사 공통도구 운영·기업 발표',
    flow: ['전사 공통 데이터·클라우드 기반', '직원 LLM Suite 접근', '직무별 문맥·도구 선택', '사업부 AI 업무 적용', '직원 결과 검토', '사업부별 이용·위험·비용 관측'],
    dataBoundary: '전사 공통 도구와 각 사업부 자료·업무시스템 권한의 분리',
    decisionBoundary: '전사 접근 가능과 사업부의 거래·심사 의사결정 권한은 별도',
    bottleneck: '접근 가능 인원과 실제 활성 사용·사업성과의 분모를 섞으면 투자 효과가 과대해짐', bottleneckStatus: '공식 발표 수치의 해석 경계',
    validation: '사업부별 활성 사용자·완료과업·오류·비용을 도구 사용과 별도로 계측',
    unknowns: 'LLM Suite의 구체 모델·권한·도구 연계 구현, 다른 AI 심사 사례의 성과 귀속',
    cckImplication: 'TS 공통기반 후보의 사용량과 12개 전략 업무성과를 별도 계층으로 관측·평가하도록 설계'
  },
  {
    caseId: 'PF-C01', architectureBasis: 'Microsoft 365 People relationships 공식 관리자 문서; 제품 기능 비교, TS 도입 아님', sourceStage: '제품 기능 문서',
    flow: ['직원 디렉터리·사용자 ID', '관계 커넥터 설정', '상사·보좌·점선 보고·맞춤 관계 동기화', '조직 관계 질의', '관계 유형·동명이인 확인', '허용된 관계 정보 반환'],
    dataBoundary: '인사 원천의 직원 관계값과 M365 검색·응답 표면 사이의 ID·동기화·공개범위',
    decisionBoundary: '조직 관계를 안다는 사실과 문서 열람·결재·업무 실행 권한은 독립',
    bottleneck: '동명이인·겸직·전보 후 관계 데이터가 오래 남으면 잘못된 책임자 식별', bottleneckStatus: '제품 문서 기반 설계 추론',
    validation: '동명이인, 점선 보고, 겸직, 전보의 ID·효력일·업무 책임자를 원천 인사자료와 대사',
    unknowns: 'TS 공식 조직원천과 커넥터 적합성, 업무분장 정보·권한 집행의 제공 범위',
    cckImplication: 'TS 조직 온톨로지 후보에서 사람 관계와 직무 책임·접근정책을 각각 다른 원장으로 연결 설계'
  },
  {
    caseId: 'PF-C02', architectureBasis: 'Glean People connector 공식 동기화·필드 문서; 고객 실제 운영 효과 미확인', sourceStage: '제품 기능 문서',
    flow: ['직원 디렉터리 또는 지정 CSV', '사람·부서·직책 필드 변환', 'People connector 동기화', '인물 검색 색인·권한 적용', '업무 질문에 사람 문맥 제공', '인사 변경·삭제 반영'],
    dataBoundary: 'HR 디렉터리/CSV 원천과 Glean 인물 색인·검색 결과의 필드·권한·삭제 전파',
    decisionBoundary: '인물 검색 개인화는 담당업무·문서 열람·결재 승인권의 자동 위임이 아님',
    bottleneck: 'CSV 재업로드 또는 동기화 지연 중 전보·퇴직자가 옛 부서로 검색·권한 문맥에 남을 위험', bottleneckStatus: '제품 문서 기반 설계 추론',
    validation: '전보·퇴직·겸직 이벤트 뒤 원천→인물 색인→검색·캐시의 반영 지연과 오노출 건수 측정',
    unknowns: 'TS 원천 시스템의 자동 커넥터 지원, 부서 업무분장 필드와 쓰기 권한 처리',
    cckImplication: 'TS 조직 인식 후보의 차별점을 단순 디렉터리 동기화가 아닌 효력일·업무분장·권한 회수 검증으로 설계'
  },
  {
    caseId: 'PF-C03', architectureBasis: '더존 ONE AI·Amaranth 10 공급사 제안서와 로컬 공개 정리; 고객 배치·성과 아님', sourceStage: '제품 제안서',
    flow: ['ERP·그룹웨어 직원 접점', '인사·근태·결재 자료 권한조회', 'ONE AI 문서·업무 지식 처리', '휴가 등 신청 필드 구성', '사용자 확인·결재선 확인', '원천 ERP·전자결재 처리'],
    dataBoundary: '제품 내 ERP·문서·그룹웨어 연계와 TS의 이기종 기존 시스템 사이의 API·데이터 계약',
    decisionBoundary: '업무 초안 작성과 실제 근태 신청·전자결재 상신은 사용자 확인 및 원천 권한에 종속',
    bottleneck: '통합 제품의 자체 업무 흐름을 이기종 TS 기간계에 그대로 옮기면 필드·승인·취소 상태가 불일치', bottleneckStatus: '공급사 제안서 기반 설계 추론',
    validation: 'TS 원천 API의 필수값·결재선·취소·중복요청 계약을 제품 시나리오와 차분 비교',
    unknowns: '고객 설치본 실제 기능·성과, TS 기간계와의 어댑터 공수 및 제품별 권리',
    cckImplication: 'TS 실행형 스킬 후보는 특정 ERP 기능 모방보다 기관별 원천 API·승인 상태 계약을 먼저 설계'
  },
  {
    caseId: 'PF31', architectureBasis: '뉴욕시 감사관 MyCity 감사의 질의·관리 통제 관찰; 내부 챗봇 설계도 미공개', sourceStage: '공식 감사 관찰',
    flow: ['사업자 행정 질문', 'MyCity 공개 안내 콘텐츠 접근', 'AI 챗봇 응답 생성', '이용자 자격·규정 안내 수신', '오답·비일관 응답 신고', '감사 샘플·관리 통제 검토'],
    dataBoundary: '공식 정책·허가 안내 원천과 생성 답변·이용자에게 전달된 문구의 판본 연결',
    decisionBoundary: '챗봇 안내를 허가·신청 완료나 법적 승인으로 오인하지 않도록 공식 서비스 책임 분리',
    bottleneck: '감사에서 부정확·비일관 답변과 시험·성과관리 증빙의 취약성이 지적됨', bottleneckStatus: '공식 감사에서 관찰',
    validation: '감사 반례를 포함해 상충 규정·적용조건·응답 반복성·오안내 신고·소관 인계 시험',
    unknowns: '비공개 모델·검색·가드레일 내부 구조, 개선 조치 후 재감사 성과',
    cckImplication: 'TS 국민서비스 후보에 출시 전 반례 정답셋과 배포 후 오안내 신고·원문판본·책임부서 추적 설계'
  }
].map(row => ({ ...row, sourceUrl: sourceById.get(row.caseId) || '' }));

const ids = cases.map(item => item.id);
if (rows.length !== ids.length || new Set(rows.map(row => row.caseId)).size !== rows.length ||
    rows.some(row => !ids.includes(row.caseId) || !row.sourceUrl || row.flow.length < 5 || row.flow.length > 7)) {
  throw new Error('플랫폼 사례 구조 원장의 건수·출처·흐름 검증 실패');
}

module.exports = { rows };
