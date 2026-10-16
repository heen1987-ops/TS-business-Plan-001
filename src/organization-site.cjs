'use strict';
const rules=require('./ts-organization-rules.cjs');
const mapping=require('./ts-department-mapping.cjs');
const strategies=require('./strategy-solutions-2027.cjs');
const nav=[['index.html?view=portfolio','제안·관계부처'],['index.html','전략과제'],['index.html?view=law','법령·업무'],['organization.html','조직·직무'],['proposal-2027.html','구축·검수'],['index.html?view=archive','자료실']];
const roles=[
 ['1010100','전략·정책','AI 전환 전략·서비스 발굴·제도·윤리 기준','기관 전략과 1차 구축 목표의 정합성 검토'],
 ['1019600','사업 조정','AI 서비스 구축 지원·성과관리·데이터 표준화','부서별 원천·도입 범위·평가 기준 조정'],
 ['1019700','플랫폼 구현','AI 공통플랫폼 구축·운영·모델 고도화·품질관리·PoC','조직 인식·업무 맥락·정책 적용 기능 구현'],
 ['1016050','조직·분장 원천','조직·정원·위임전결 규정·업무분장 관리','조직 구조·업무분장·승인 기준의 원천 확인'],
 ['1018037','인사 원천','임용·전보·보직·인사정보 관리','직원 식별·소속·직무 배정·발령 효력일 확인'],
 ['1019300','정보화·연계','정보화 계획·인프라·연계 지원·데이터 품질 관리','기존 로그인·ETL·플랫폼 재사용 및 연계 품질 확인'],
 ['1019500','보안·개인정보','정보보안·개인정보보호 총괄','자료별 접근정책·최소 수집·회수·감사 기준 검토']
].map(([code,role,official,project])=>({code,role,official,project,name:rules.bindings.find(n=>n.code===code).name}));
const packages=[
 ['조직·직무 기준선','공식 조직·직무·업무·역할 사전 구축','공개 코드·내부 조직키·로그인 ID 대응','세칙 판본·인사 효력일·원천 책임 기록'],
 ['사용자·변경 연결','로그인 시 소속·담당업무 자동 매핑','이동·겸직·대행·조직 승계 이력 반영','순서 역전·중복·누락·회수 지연 대사'],
 ['역할·권한 검증','수행·검토·승인·협업 역할 분리','문서·행위·업무건별 접근정책 집행','권한 회수 후 검색·캐시·반출·대기 작업 재검증'],
 ['업무 맥락 분류','부서·직무·업무 목적별 지식·절차·서식 선택','동일 요청에 대한 역할별 결과 차등화','모호한 인물·업무건의 확인·보류 처리'],
 ['협업·운영 통합','업무건별 인계·수락·보완·반려 추적','승인된 파일·API 연계 결과 대사','정책·모델·구성판본의 감사·복구 관리'],
 ['독립 평가·인수','조직·역할별 독립 평가와 필수 거부 시험','결함 조치·교육·운영 책임·사용권 확인','조직 기반 인수 후 후속 서비스 범위 확정']
].map(([title,...bullets],i)=>({...mapping.packages[i],title,bullets}));
const acceptance=[
 '식별 가능한 정답셋의 ID·조직 일치 검증 · 동명이인·외부인 자동 확정 금지',
 '세칙 판본·발령일 전후의 소속·업무 일치 검증 · AI서비스개발팀 발령 증빙 없을 시 시행 확정 보류',
 '이동·종료·중복·누락·순서 역전 대사 · 합의 지연·복구시간 충족 여부 확인',
 '필수 거부셋의 비인가 노출·실행 0건 충족 · 협업·상위조직 관계에 따른 자동 권한 부여 금지',
 '동일 요청의 부서별 지식·절차·서식 정답 대조 · 지역본부 유형·관할·해당 사무 반영',
 '원문·판본·근거 위치 추적 · 생성물 재열람·내보내기 시 권한 재검증',
 '업무건 ID·담당·기한·수락·보완·반려 이력 대사 · 인계 중 인사이동 반영',
 '전결·위임 미확인 승인 거부 · 대행 만료 차단 · 승인대상 판본 변경 시 재승인',
 '파일·API 요청키·결과 ID·원천 상태 일치 확인 · 중복 처리 차단',
 '부서별 구성판본 변경·롤백·격리 검증 · 타 기관 실제 도입 검수의 별도 범위 설정',
 '판정 경로·변경·복구 이력 재현 · 불필요한 인사정보·민감 원문 로그 제외',
 '필수 시험 통과·중대 결함 해소·기관 지정 검수자 인수 · 미실행·분모 0·목표 미합의의 통과 제외'
].map((criterion,i)=>({...mapping.tests[i],criterion}));
const timeline=[
 ['M1–M2','원천·범위 합의','세칙·인사·전결·재사용 진단 / 대상·물량·평가셋·목표 확정'],
 ['M3','조직·사용자 연결','코드 대응·발령 이력·변경 대사 기준선 확정'],
 ['M4–M5','역할·권한 구현','정책 집행·회수·거부 시험 / 조직별 업무 맥락 분류'],
 ['M6–M7','협업·통합 검증','대표 부서 적용 / 동일 요청·인사이동·인계·복구 검증'],
 ['M8–M9','독립 평가·운영 인수','결함 조치·교육·운영 이관 / 후속 적용 준비 판단']
];
const reuse=[
 ['재사용 후보','NOA 대화·검색·요약·서식 / 개인 프로필 설정 / 기존 로그인·ETL','설치본·계약·인터페이스 확인 후 재사용 확정'],
 ['원천 연계','인사·조직 정보 / 세칙·업무분장 / 전결·자료별 권한','제공 협의와 실제 수신·품질·사용권의 별도 검증'],
 ['추가 개발','조직 인식 / 효력일 처리 / 업무 맥락 / 역할·권한 / 협업·운영','확인된 부족분의 C27-COM·ON27-BASE 단일 산정'],
 ['후속 확장','W27-A~D 업무효율화 / 국민서비스 / 병원·타 기관','조직 기반 인수 후 전용 기능·예산·검수 별도 확정']
];
const roleRules=[['수행','업무건별 담당자 배정 및 결과 작성'],['검토','소관 전문 검토자의 기준·근거·판본 확인'],['승인','전결규정·유효 위임에 따른 승인자 확정'],['협업','허용된 입력·결과의 전달 및 인계 수락']];
const archives=[
 {title:'제안서·기준 자료',links:[['organization.html?view=work-map&org=all','전 부서 업무표 열람'],['downloads/ts-all-department-work.csv','전 부서 업무·전략·AI·개발·검수 CSV'],['downloads/ts-all-department-work.json','전 부서 구조화 원장 JSON'],['downloads/ts-all-department-coverage.csv','전 조직 자료 범위 CSV'],['downloads/ts-detailed-work-processes.md','세부 업무 수행단계 전문'],['downloads/ts-detailed-work-register.csv','직제·공개 담당업무 원장 CSV'],['downloads/ts-detailed-work-processes.csv','입력·결과물·역할·완료조건 CSV'],['downloads/ts-strategy-solutions-2027.md','12대 전략·솔루션 구성안'],['downloads/ts-strategy-solutions-2027.csv','전략·업무·개발·검수 CSV'],['downloads/ts-law-work-chain.md','부처·법령·업무 연결표'],['downloads/ts-2027-organization-proposal.md','조직 중심 제안서 요약'],['downloads/ts-2027-proposal.html','상세 제안서 전문'],['downloads/ts-organization-rules.md','직제·업무 매핑 전문'],['downloads/ts-organization-rules.csv','조직·업무 매핑 CSV'],['downloads/ts-organization-rules.json','세칙 근거·매핑 JSON']]},
 {title:'기존 업무 기획',links:[['index.html?view=legacy','기존 통합 기획 열람'],['index.html?view=workbench','기존 기획 작업대'],['planning-documents.html','처별 계획서·기술설계'],['solutions.html','기존 처별 제안 목록'],['legal/mapping.html','법령·업무 연결자료']]},
 {title:'공통 구조·확장',links:[['growth-ai.html','GROWTH AI 공통 구조'],['skill-pms.html','공통 스킬·사업관리'],['research-library.html','조사·기획 자료실'],['registry.html','전체 자료 원장']]}
];
const labels={brand:'TS 조직 네이티브 AI',tag:'2027 AI 플랫폼 고도화 · 검토안',title:'TS 조직 네이티브 AI 플랫폼',intro:['직제·업무분장 기반의 부서·직무·역할 연결','조직 기반 인수 이후 업무효율화·국민서비스 확장'],edition:'직제시행세칙 2026.06.30 개정본 적용',responsibility:'세칙상 소관과 사업 역할',roleNote:'별표4 업무 요약 · 사업 역할안',conditional:'AI서비스개발팀: 최초 팀장 발령일부터 시행 · 발령일 확인 대기 · 시행 전 AI혁신처 담당',authority:'조직·협업 관계와 데이터 접근권한의 분리',scope:'1차 범위: 조직 네이티브 AI 기반 구축·운영 인수',schedule:'착수 기준 9개월 일정 제안 · 계약 전 범위·물량 확정',acceptance:'12개 요구사항 → 12개 검수 시나리오',criteria:'평가셋·분모·목표·허용 지연의 M2 합의 · 실제 플랫폼 검수 미실행',sourceNote:'공식 규정 원문 유지 · 화면 요약의 명사종결형 개조식 적용',footer:'CCK 사업제안 검토자료 · 한국교통안전공단 공식 홈페이지와 구분'};
function markdown(){return '# TS 2027 조직 네이티브 AI 플랫폼 고도화 제안서\n\n- 업무 도출 순서: 부처·기관 → 관계법령 → 법정·위탁업무 → 담당 조직·직무 → 12대 전략과제 → AI 지원\n- 상태: 사업 제안 초안 · 실제 구현·연계·기관 검수 미검증\n- 기준: '+rules.source.amendment+'\n- 원본: '+rules.source.title+'\n- SHA-256: '+rules.source.sha256+'\n- 일정: '+labels.schedule+'\n\n## 1. 추진 방향\n\n'+labels.intro.map(s=>'- '+s).join('\n')+'\n\n### 12대 전략과제 기반 솔루션 구성\n\n- ST-04 조직 네이티브 AI 공통 기반의 선행 구축·단일 산정\n- 나머지 과제의 공통 기반 재사용 및 대표 업무 검증 후 단계별 적용\n\n'+strategies.rows.map(r=>'- **'+r.id+' '+r.strategy+'**: '+r.solution+' / '+r.phase).join('\n')+'\n\n- [전략·법령·업무·조직·솔루션·검수 상세 매핑](ts-strategy-solutions-2027.md)\n\n## 2. 조직·역할·업무 기반\n\n'+roles.map(r=>'### '+r.name+' · '+r.role+'\n\n- 세칙상 소관: '+r.official+'\n- 사업 역할 제안: '+r.project+'\n- 근거: '+rules.bindings.find(n=>n.code===r.code).locator+'\n').join('\n')+'\n'+rules.notes.map(s=>'- '+s).join('\n')+'\n\n## 3. 재사용·추가 개발·후속 확장\n\n'+reuse.map(([a,b,c])=>'- **'+a+'**: '+b+' / '+c).join('\n')+'\n\n## 4. 1차 구축·산출물\n\n'+packages.map(p=>'### '+p.id+' '+p.title+' · '+p.period+'\n\n'+p.bullets.map(s=>'- '+s).join('\n')+'\n- 책임 제안: '+p.lead+'\n- 납품 증빙: '+p.output+'\n- 요구·검수: '+p.requirements.map(r=>r+' → '+r.replace('-R','-T')).join(' / ')+'\n').join('\n')+'\n## 5. 추진 일정\n\n'+timeline.map(([a,b,c])=>'- **'+a+' · '+b+'**: '+c).join('\n')+'\n\n## 6. 검수 기준\n\n- '+labels.criteria+'\n\n'+acceptance.map(t=>'### '+t.requirement+' → '+t.id+' · '+t.name+'\n\n- 입력: '+t.input+'\n- 기준 제안: '+t.criterion+'\n- 증빙: '+t.proof+'\n').join('\n')+'\n## 7. 기존 기획·상세 근거 연결\n\n- [전 부서 업무·전략·AI·재사용·개발·검수 매핑](ts-all-department-work.csv)\n- [전 조직 자료 범위](ts-all-department-coverage.csv)\n- [부서별 세부 업무·입력·결과물·역할·완료조건](ts-detailed-work-processes.md)\n- [직제·공개 담당업무 전체 원장](ts-detailed-work-register.csv)\n- [전체 조직·업무 매핑](ts-organization-rules.md)\n- [76개 부서별 역할·협업 설계](ts-department-mapping.md)\n- [기존 13장 상세 제안서와 요구·검수 추적](ts-2027-proposal.html)\n- [GROWTH AI 공통 구조](growth-ai.md)\n';}
module.exports={rules,mapping,nav,roles,packages,acceptance,timeline,reuse,roleRules,archives,labels,markdown};
