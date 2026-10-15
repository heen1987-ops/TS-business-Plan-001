'use strict';

// Public design data only. No login, HR access, policy engine, or skill execution.
const annual = require('./annual-work-2027.cjs');
const official = require('./official-duty-research.cjs');
const proposed = '설계 제안 · 실제 연계·권한·AI 실행 및 검수 미수행';
const ids = numbers => ({
  requirementIds: numbers.map(n => 'GAI-R' + String(n).padStart(2, '0')),
  testIds: numbers.map(n => 'GAI-T' + String(n).padStart(2, '0'))
});

const pilotDesigns = {
  'W27-A': {
    request: '이번 주 이 사업에서 확인하고 조치할 내용을 정리해줘.',
    jobRoles: ['발주사업 담당: 계약 기준선과 미이행·변경 쟁점 확인', '수행 담당: 배정된 과업의 증빙 보완', '검토 담당: 제출 증빙과 승인 이력 대조'],
    neededEvidence: ['선정 사업의 승인 계약·요구사항 기준본과 판본', '주간보고·시험·회의 증빙의 위치와 제출 상태', '참여기관·사업별 역할 및 자료 이용 범위', '기준선·변경 승인자의 공식 위임 근거'],
    organizationUse: '같은 처 소속 여부만으로 사업 참여나 승인권을 부여하지 않는다. 발주기관·수행기관·사업 참여관계를 구분하고 역할별로 볼 수 있는 쟁점과 보완 목록을 구성한다.',
    additionalFunctions: ['사업 참여자와 공식 조직·직무 관계 연결', '직무별 요구사항·증빙·쟁점 목록 선택', '완료 주장과 실제 증빙 상태 분리', '기준선 변경의 검토·승인 근거 및 담당 인계 추적'],
    supportResult: '발주 담당에게 미이행·변경 검토표, 수행 담당에게 허용된 보완 과업표, 검토 담당에게 근거 대조표를 제시한다. 일정 확정·발송은 기존 승인 절차를 따른다.',
    dutyPattern: /정보화기획|정보시스템.*운영|감리|AI 및 데이터 기획|정보보호 기획/,
    ...ids([1, 2, 4, 5, 6, 7, 8, 9, 11, 12])
  },
  'W27-B': {
    request: '이 과제의 변경 내용을 반영해서 보고자료를 준비해줘.',
    jobRoles: ['계획 담당: 전략과제와 계획 변경 사유 확인', '예산 담당: 회계기간·요구액·재원 근거 대조', '성과 담당: 지표 정의·산식·증빙 충족 검토'],
    neededEvidence: ['선정 전략과제의 승인 계획 및 변경본', '예산 요구서의 기간·수치·산식·출처', '성과지표 정의와 제출 증빙', '부서별 소관 확인 및 제출본 승인 기록'],
    organizationUse: '기관·과제·회계기간을 고정하고 계획·예산·성과 직무를 분리한다. 소속에서 추론한 관심 분야는 제출권이나 수치 확정권의 근거가 될 수 없다.',
    additionalFunctions: ['과제와 소관 조직·직무 매핑', '직무별 수치·기간·지표 검토 규칙 선택', '제출본 잠금·판본 충돌·반려와 재제출 관리', '출처가 없는 수치 및 서로 다른 기간의 집계 보류'],
    supportResult: '계획 담당에게 변경영향표, 예산 담당에게 수치 대사표, 성과 담당에게 증빙 충족표를 구성한다. 예산 배정·평가점수·공시 제출을 자동 확정하지 않는다.',
    dutyPattern: /경영전략|경영기획|예산관리|정부평가|내부경영평가|성과/,
    ...ids([1, 2, 3, 4, 5, 6, 7, 9, 10, 12])
  },
  'W27-C': {
    request: '이 계약 건을 처리할 수 있도록 필요한 자료를 준비해줘.',
    jobRoles: ['발주 담당: 계약 의무와 납품 내역 확인', '검사 담당: 납품 결과와 검사 증빙 검토', '회계 담당: 지출 증빙과 별도 승인 요건 확인'],
    neededEvidence: ['선정 용역 유형의 승인 계약·변경합의', '납품·검사·지출 증빙과 적용일', '업무 단계별 전결·대행·역할분리 규칙', '검사 확인과 회계 승인 각각의 공식 기록'],
    organizationUse: '검사 담당과 회계 담당을 업무 건 단위로 구분한다. 동일 부서·겸직·상위 직책이라는 이유로 검사 확인을 지급 승인으로 승격하지 않는다.',
    additionalFunctions: ['계약 건·단계·담당 직무와 권한 연결', '직무별 증빙 체크리스트 및 보완 목록', '검사 확인·회계 확인의 별도 상태 관리', '승인 후 계약·금액·판본·대행기간 변경 시 재검토'],
    supportResult: '발주 담당에게 의무 대조표, 검사 담당에게 검사 준비표, 회계 담당에게 지출 증빙 준비표를 제공하고 기존 결재·회계 절차에 반출한다.',
    dutyPattern: /계약|지출|회계|기록물|자산 및 인프라/,
    ...ids([1, 2, 4, 5, 6, 8, 9, 11, 12])
  },
  'W27-D': {
    request: '이 점검 건의 남은 조치와 다음 할 일을 정리해줘.',
    jobRoles: ['점검 담당: 지적 사실과 근거 확인', '조치 담당: 보완 자료와 이행 내역 준비', '재확인 담당: 해소 여부와 종결 근거 검토'],
    neededEvidence: ['선정 점검 유형의 공식 절차·표준양식', '허가된 점검표·지적·조치 증빙', '선정 지역 및 업무별 실제 배정·인계 기록', '기한 변경·재보완·재확인 및 종결 기록'],
    organizationUse: '본사 소관업무와 지역 수행업무를 구분한다. 공식 담당업무의 키워드 일치만으로 지역 수행주체를 지정하지 않고 선정 지역·배정 기간을 확인한다.',
    additionalFunctions: ['본사·지역·점검 건의 담당 관계 매핑', '지적·보완·재확인별 직무 맥락 선택', '발령·담당 변경 시 미완료 조치 인계', '재확인 증거가 없는 종결 및 미선정 지역의 업무 분류 보류'],
    supportResult: '점검 담당에게 지적 근거표, 조치 담당에게 보완 목록, 재확인 담당에게 미해소·기한초과 검토표를 제공한다. 안전 판정·행정처분은 담당자의 공식 절차를 따른다.',
    dutyPattern: /교통수단안전점검|교통안전정책|교통안전업무/,
    ...ids([1, 2, 3, 4, 5, 6, 7, 9, 10, 12])
  }
};


const pilotWorkflows = annual.bundles.map(bundle => {
  const { dutyPattern, ...design } = pilotDesigns[bundle.id];
  const organizations = bundle.codes.map(code => {
    const record = official.byOrg[code];
    if (!record) throw new Error('조직 기준선 연결 누락: ' + code);
    return {
      orgCode: code, name: record.name, path: record.path,
      sourceUrl: record.sourceUrl, observedAt: official.date,
      dutyCandidates: record.units.filter(unit => !unit.placement && !unit.scopeReview && dutyPattern.test(unit.text)).map(unit => ({ id: unit.id, text: unit.text })),
      status: '공개 담당업무 관측 재사용 · 실제 직무·권한·현재 배정은 별도 확인'
    };
  });
  return {
    id: bundle.id, name: bundle.name, lead: bundle.lead, partners: bundle.partners,
    scope: bundle.scope, workflow: [...bundle.workflow], organizations,
    additionalOrganizationNeed: bundle.id === 'W27-D' ? '지역 안전사업처 1곳 미선정. 공식 업무·배정·기간 확인 전 코드나 담당자를 만들지 않는다.' : '선정 업무 건의 실제 참여 조직·담당·검토자·승인자와 위임 범위 확인 필요',
    ...design,
    annualDevelopment: bundle.development, annualExclusions: bundle.exclude,
    annualGate: bundle.gate, annualTestId: bundle.id + '-T', annualCriterion: bundle.test,
    annualTestIds: ['Y27-T01', 'Y27-T02', 'Y27-T03', 'Y27-T04', 'Y27-T05'],
    costParent: bundle.costParent, status: proposed
  };
});

module.exports = {
  version: '0.1', date: '2026-10-15',
  title: '1차 고도화 우선순위 · 공식 조직을 이해하는 업무 지원',
  intro: 'GROWTH AI의 첫 단계는 공식 조직·직무·업무 기준선을 만들고, 로그인 사용자와 대화의 인물·조직·업무를 그 기준선에 연결하는 것입니다. 확인된 관계와 권한 안에서 필요한 정보·절차·스킬을 구성하고 담당자의 검토를 돕는 범위로 TS 2027 사업에 적용합니다.',
  status: proposed,
  boundary: '정적 설계 자료입니다. 로그인·인사카드 조회·조직정보 ETL·정책 판정·업무 API·스킬 실행은 구현하거나 시험한 상태가 아닙니다. 자동 매핑은 공식 키와 사용 허가가 확보된 경우의 목표이며, 이름이나 대화만으로 소속·권한을 확정하지 않습니다.',
  identityDifference: {
    title: '이름 기억에서 공식 관계와 책임의 이해로',
    personalization: '이름·직책·선호를 기억하면 호칭과 답변 형식을 맞출 수 있습니다. 사용자가 입력한 프로필이나 과거 대화만으로 현재 소속·담당업무·권한을 확인할 수는 없습니다.',
    organizationNative: '조직형 AI는 공식 ID, 유효기간이 있는 소속·직무·업무분장, 업무 건의 참여관계, 별도 접근정책을 연결합니다. 답변에 적용한 조직·업무 맥락과 근거를 보여주고 불명확한 연결은 확인하거나 보류합니다.',
    limit: '공식 조직도도 업무 건별 참여·전결·자료 열람권 전체를 증명하지는 않습니다. 관계의 식별과 권한 검증을 분리하고, 확인된 정보만 업무 지원에 사용합니다.'
  },
  userNeeds: [
    { id: 'ORG-N01', title: '조직 중심 사용자 인식체계 필요', detail: '사용자와 대화에 등장하는 인물·부서·직무를 공식 조직체계에 연결합니다. 이름과 직책을 문자열로 기억하는 데서 나아가 소속·협업·담당 관계를 식별하고 부서와 직무에 맞는 지식·지원·결과물을 구성합니다.', ...ids([1, 2, 5]) },
    { id: 'ORG-N02', title: '인사카드·조직도·업무분장표 기반 조직정보 매핑', detail: '허가된 로그인 식별자와 공식 인사 ID를 대조하여 소속·직책·담당업무를 연결하고 권한은 별도 원천에서 검증합니다. 인사이동·조직개편·직무변경의 효력일을 반영하며 대화 이력보다 검증된 공식 정보를 우선합니다.', ...ids([1, 2, 3, 4]) },
    { id: 'ORG-N03', title: '조직직무별 응답·업무지원 차별화', detail: '같은 요청도 소속·직무·업무 목적에 따라 허용된 자료·규정·과거 이력·서식을 선택합니다. 매번 소속 업무를 반복 설명하지 않도록 확인된 맥락을 사용하되, 대화 속 인물·조직·업무 용어의 모호한 연결은 확인하거나 보류합니다.', ...ids([4, 5, 6, 10]) },
    { id: 'ORG-N04', title: 'Organization-Native AI 지향점', detail: '사용자가 하고 싶은 업무의 목적을 말하면 확인된 조직적 위치와 책임에 맞춰 정보·절차·스킬을 구성하는 것을 지향합니다. 정보가 부족한 경우 필요한 맥락을 확인하고, 승인·대외 제출·업무시스템 처리는 해당 기관의 공식 절차를 따릅니다.', ...ids([5, 7, 8, 9, 11, 12]) }
  ],
  priorityStages: [
    { id: 'ORG-S01', order: 1, title: '공식 기준선과 부처·기관·부서·직무·업무 매핑', action: '공식 직제·조직도·업무분장·공개 담당업무의 출처와 판본을 등록하고 관계 유형·효력일·확인 상태를 구분합니다. 부처와 기관의 관계, 기관 내부 부서의 상하관계, 직무와 업무 배정을 서로 다른 관계로 저장합니다.', output: '조직·직무·업무 사전, 코드 대응표, 출처 원장, 불일치·미확인 목록', gate: '기관 담당자가 대상 범위·원천 책임·최신성·공개 가능 필드를 확인. 관측 키워드를 확정 직무나 권한으로 승격하지 않음', ...ids([1, 2, 3, 10]) },
    { id: 'ORG-S02', order: 2, title: '공식 ID·로그인과 대화의 인물·조직 대조', action: '기관 경계와 IdP 발급자·subject를 계정 및 인사 ID에 연결합니다. 대화의 별칭·직책·부서명을 공식 후보와 대조하고 하나로 확정할 근거가 없으면 허용된 최소 후보로 확인합니다.', output: '사용자 업무 맥락, 개체 연결 결과·근거·보류 상태, 유효기간과 조직 판본', gate: '사번은 기관 범위에서 관리. 이름·이메일·사용자 주장만으로 자동 확정하거나 권한을 생성하지 않음', ...ids([1, 2, 3, 4]) },
    { id: 'ORG-S03', order: 3, title: '업무 맥락 분류와 정책 검증', action: '사용자 목적을 업무 건·직무·절차 단계·기간에 연결하고 문서·규정·서식 후보를 선택합니다. 권한 정책은 검색 전과 출력·반출 전에 별도로 적용합니다. 겸직의 활성 맥락과 업무 건을 확인하고 불명확한 분류는 보류합니다.', output: '선택된 업무·직무·근거·절차와 정책 판정 이유, 추가 확인 항목', gate: 'LLM 분류가 접근권한·전결권을 부여하지 않음. 회수·유효기간·정책판본이 확인되지 않으면 보호 자료 제공 보류', ...ids([4, 5, 6, 8, 11]) },
    { id: 'ORG-S04', order: 4, title: '대표 사례 검증과 조직 기반 인수', action: '허용된 목적·입력·출처·역할·판본을 스킬 입력 계약에 전달하여 검토표·보완 목록·보고 초안을 구성합니다. 결과의 근거와 담당자 확인을 기록하고 승인된 파일 반입·반출로 업무를 완주합니다.', output: '직무별 지원 결과, 보완·인계 기록, 요구사항과 시험에 연결한 검수 증빙', gate: '1차는 조직 기반 자체의 검수·인수가 중심. 업무효율화·국민서비스 확대는 그 이후 별도 결정. 기관 API나 자동 실행을 연간 인수의 필수조건으로 추가하지 않으며 미실행 결과를 완료·승인으로 표시하지 않음', ...ids([5, 6, 7, 8, 9, 12]) }
  ].map(stage => ({ ...stage, status: proposed })),
  mappingContract: [
    { key: 'ministry', title: '부처', fields: ['authorityId', 'officialName', 'relationshipType', 'validFrom', 'validTo', 'sourceId'], rule: '소관·감독·수요·사업관리 관계를 구별하고 단일 parent 필드로 합치지 않습니다. 부처와 기관 관계가 문서 열람권을 상속시키지 않습니다.' },
    { key: 'agency', title: '기관', fields: ['tenantId', 'agencyId', 'officialName', 'officialCodeSystem', 'sourceId'], rule: '공식 기관 ID와 테넌트 경계를 구분하며 기관별 이름·코드 체계·자료 사용권을 확인합니다. 공식 코드가 미확인인 기관에 임의의 공식 코드를 만들지 않습니다.' },
    { key: 'department', title: '내부부서', fields: ['agencyId', 'orgCode', 'parentOrgCode', 'officialPath', 'orgVersion', 'validFrom', 'validTo'], rule: '동일 부서명은 기관·상위경로·코드·시점으로 구분합니다. 폐지·분할·통합은 승계관계로 남기고 과거 원문을 덮어쓰지 않습니다.' },
    { key: 'job', title: '직무', fields: ['assignmentId', 'personId', 'employmentId', 'orgCode', 'positionId', 'jobRoleId', 'validFrom', 'validTo'], rule: '인사카드·발령·업무분장에 근거하여 소속·직책·직무·겸직·대행을 구분합니다. 실제 개인정보는 허가된 운영 환경에서만 연결하며 이 공개 설계에는 넣지 않습니다.' },
    { key: 'work', title: '업무', fields: ['workTypeId', 'caseId', 'stage', 'purpose', 'participantAssignmentIds', 'dutySourceId', 'baselineVersion'], rule: '공식 담당업무 관측과 실제 업무 건 배정을 구분합니다. 업무별 절차·지식·서식·스킬의 연결은 검토된 규칙으로 관리하고 분류 후보에는 확정 권한을 부여하지 않습니다.' },
    { key: 'permission', title: '권한', fields: ['grantId', 'subjectId', 'resourceScope', 'action', 'purpose', 'caseScope', 'policyVersion', 'validFrom', 'validTo'], rule: '조직·직무 정보와 별도로 열람·생성·반출·검토·승인 권한을 판정합니다. 위임 만료·회수·역할분리·업무 건 범위를 검사하고 확인 불가한 보호 접근은 보류합니다.' },
    { key: 'evidence', title: '근거', fields: ['sourceId', 'sourceType', 'location', 'version', 'observedAt', 'recordedAt', 'validFrom', 'validTo', 'verificationStatus', 'owner'], rule: '공식 원문·관측·추론 후보·담당자 확인을 분리합니다. 효력 시점과 수신·정정 시점을 함께 보존하며 해시나 URL 존재만으로 내용의 사실성·현행성을 확인했다고 표시하지 않습니다.' },
    { key: 'acceptance', title: '검수', fields: ['requirementId', 'testId', 'fixtureVersion', 'asOf', 'expectedDecision', 'actualDecision', 'evidenceIds', 'reviewStatus'], rule: '정답·보류 기준과 시험 시점·분모를 먼저 잠급니다. 실제 결과·로그·판본·불일치 조정을 남기며 시험 미실행이나 근거 부족을 합격으로 처리하지 않습니다.' }
  ],
  ministryMappings: require('./growth-ministry-map.cjs').rows,
  ministryMappingStatus: '공식 공개자료의 확인 범위별 관계 매핑 · 내부 직무·권한은 별도 검증',
  pilotWorkflows,
  acceptance: [
    { id: 'ORG-A01', title: '동명이인', scenario: '같은 이름이 두 부서 또는 외부 참여기관에 존재하는 대화', expected: '로그인 공식 ID와 언급 대상을 분리하고 하나로 확정할 근거가 없으면 보류. 허가되지 않은 인물의 상세 정보를 후보에 노출하지 않음', evidence: '비식별 정답표·후보 범위·확정/보류 기록', ...ids([1, 4, 12]) },
    { id: 'ORG-A02', title: '별칭과 이전 부서명', scenario: '대화에 약칭·옛 조직명·직책 호칭이 등장하는 경우', expected: '별칭의 기관·유효기간·공식 원문을 대조. 복수 후보 및 기한이 지난 연결을 현재 조직으로 자동 확정하지 않음', evidence: '별칭 사전·판본·시점별 기대 연결과 보류 사유', ...ids([1, 2, 6, 12]) },
    { id: 'ORG-A03', title: '동일 요청의 직무별 차이', scenario: 'W27-C의 동일 계약 준비 요청을 발주·검사·회계 직무가 각각 입력', expected: '계약 건은 같아도 허용 자료·점검 항목·결과물이 직무별 정답과 일치. 선택 이유를 표시하고 승인 결과를 생성하지 않음', evidence: '직무별 지식·절차·서식 정답표·독립 평가셋·선택 이력', ...ids([4, 5, 6, 12]) },
    { id: 'ORG-A04', title: '권한과 역할의 분리', scenario: '상위 직책·동일 부서·대화상 승인 주장으로 보호 자료나 지급 승인 요청', expected: '공식 grant와 업무 건·목적·정책판본을 별도 검증. 검색·출력·반출 경로에서 무권한 노출과 승인 승격을 차단', evidence: '허용/거부 결정표·검색/생성/반출 로그·역할분리 시험', ...ids([4, 6, 8, 11, 12]) },
    { id: 'ORG-A05', title: '인사발령과 직무변경', scenario: '예정 발령 직전·직후·소급정정 및 원천 수신 지연', expected: '효력일과 수신 시점을 구분하여 공식 배정을 선택. 권한 회수는 승인 원천에 따라 적용하고 과거 대화로 복구하지 않음. 최신성 불명은 보류', evidence: '발령 판본·대사·회수/지연 기록·미완료 업무 인계표', ...ids([2, 3, 4, 7, 12]) },
    { id: 'ORG-A06', title: '조직개편', scenario: '부서 통합·분할·폐지 후 기존 업무 건과 과거 문서를 조회', expected: '과거 조직과 근거를 보존하고 새 조직의 승계·배정·권한을 별도로 확인. 조직코드 변경만으로 담당·권한·업무 완료를 승격하지 않음', evidence: '승계관계·시점별 조직판본·인계 수락·권한 재판정 기록', ...ids([2, 3, 4, 7, 10, 12]) },
    { id: 'ORG-A07', title: '겸직과 대행', scenario: '한 사용자의 겸직 두 업무가 같은 문서를 요구하거나 대행기간이 만료', expected: '업무 건별 활성 직무·목적을 확인하고 필요한 정책만 적용. 겸직을 이유로 권한을 무조건 합산하지 않으며 자기승인·대행 만료를 검사', evidence: '겸직/대행 효력표·활성 맥락 선택·충돌 및 역할분리 결정표', ...ids([2, 4, 5, 8, 12]) },
    { id: 'ORG-A08', title: '업무 분류 보류', scenario: '업무 용어가 모호하거나 분장 누락·소속과 기재내용 충돌·출처 판본 불일치', expected: '확정되지 않은 담당이나 절차를 생성하지 않고 필요한 기관·사업·업무 목적을 확인. 근거가 부족한 상태에서 스킬에 보호 자료를 전달하거나 실행 완료를 표시하지 않음', evidence: '모호성 평가셋·보류 사유·추가 확인 항목·스킬 입력 및 상태 기록', ...ids([1, 5, 6, 9, 11, 12]) }
  ].map(test => ({ ...test, status: '협의용 검수 시나리오 · 실제 시험 미수행' })),
  acceptanceRule: '통제 시나리오는 합의된 정답·거부·보류 기준으로 전수 대조합니다. 의미 분류·근거 정확성·직무별 결과 품질은 개발셋과 분리된 평가셋에서 측정하고 표본·목표·실패 허용을 M2까지 합의합니다. 시험에서 관측한 결과를 운영 전체의 무오류 보장으로 확대하지 않습니다.',
  costBoundary: '공식 조직 매핑·식별·정책·맥락 선택의 공통 추가분은 C27-COM에서 한 번만 계상합니다. 기존 납품·인사조직 연계·인증·검색·로그·스킬의 설치 및 사용권을 대조한 뒤 설정과 신규 개발 차분을 구분합니다. W27-A~D에는 업무별 규칙·양식·평가 사례와 전용 차분만 연결하며 비용은 미산정입니다. 병원·타기관 확대의 추가 데이터·규정·정책 검증은 별도 범위입니다.',
  sources: [
    { id: 'ORG-BASELINE', title: 'TS 공식 담당업무 관측 기반', url: 'https://main.kotsa.or.kr/portal/contents.do?menuCode=06020400', date: official.date, note: '저장소의 공식 담당업무 관측 재사용. 원문 분해와 기획 연결은 조사 후보이며 최신 직제·직무·권한의 실시간 확인이 아님.' },
    { id: 'ORG-ANNUAL', title: annual.title, path: 'src/annual-work-2027.cjs', date: annual.date, note: 'W27-A~D 범위·제외·진입조건·검수 원문을 파생하여 사용. 새 사업 선정이나 계약 확정이 아님.' },
    { id: 'ORG-GAI', title: 'GROWTH AI 요구사항·시험', path: 'src/growth-ai.cjs', date: '2026-10-15', note: 'GAI-R01~R12 및 GAI-T01~T12 연결. 실제 구현·시험 상태는 미검증 유지.' }
  ]
};

module.exports.labels={department:'연결 부서',checkedAt:'확인일',output:'산출물',ministries:'부처·기관별 관계와 업무 후보',candidate:'우선 검토할 업무 · 설계 제안',unknowns:'적용 전에 확인할 사항',pilots:'TS 부서·직무별 선도업무 매핑',request:'동일 업무 요청',organizationEvidence:'공식 부서·업무 관측과 추가 개발 근거',official:'공식 담당업무 원문',neededEvidence:'필요한 공식 근거',delta:'추가 개발',annual:'기존 TS 2027 기획·검수',mappingContract:'부처부터 검수까지 연결하는 매핑 필드',acceptance:'조직 네이티브 기능의 우선 검수'};
