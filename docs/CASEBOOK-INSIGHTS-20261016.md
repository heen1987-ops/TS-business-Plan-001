# 사례 심층 분석·전략 후속계획·프롬프트 게시판

- 작성: 2026-10-16
- 범위: 기존 AX 26개·플랫폼 31개 상세 항목의 분석 확장, 12개 전략 후속계획, 브라우저 저장형 프롬프트 편집
- 기존 2,637건 조사원장은 탐색 색인으로 보존. 57개 상세 항목과 검증 수준 구분
- 기존 PPT는 개요 자료로 유지. 상세 분석·업무 연결은 웹·MD·CSV에 반영

## 근거와 설계 경계

- 사실·결과·한계: 기존 사례별 원문·기준일 유지
- 요인: 공개 사실에서 도출한 CCK 분석. 성공 조건·위험·재발 방지 조건과 입증된 인과관계 구분
- 도식: 공개 기술 설명이 있는 사례는 출처 연결. 나머지는 업무 설명 기반 논리구조 재구성으로 표시
- GOV.UK Chat: [기술 공개 기록](https://www.gov.uk/algorithmic-transparency-records/dsit-gov-dot-uk-chat), 2025-10-07. Rails·Claude/Bedrock·OpenSearch 구조와 2026 실증 결과의 시점 구분
- 냉각 제어: [DeepMind 안전 제어 구조](https://deepmind.google/blog/safety-first-ai-for-autonomous-data-centre-cooling-and-industrial-control/), 2018-08-17. 현장 독립 검증·수동 전환 반영
- 사고보고: [NHTSA Cruise 시정 명령](https://www.nhtsa.gov/press-releases/consent-order-cruise-crash-reporting), 2024-09-30. 사고 후 사건 누락·보고 완전성 검수 연결
- MyCity: [감사 원문](https://comptroller.nyc.gov/reports/audit-report-on-the-new-york-city-office-of-technology-and-innovations-mycity-system/). 감사 지적과 운영기관 반론 구분 유지
- CCK 재사용: NOA 사용자 가이드, PG24 Epic 명세, PG31 Connor 개발·운영 명세와 대조. 설치본·계약·사용권·품질 검증을 구현 완료로 간주하지 않음
- 공식 업무: `all-department-work.cjs`의 직제시행세칙 원문·조직코드·업무 ID·근거 좌표를 직접 참조. 사업 역할·협업은 적용 제안
- ST-04 공통 기반 단일 구축. 기존 SSO·RAG·권한·로그·연계의 계약 범위를 제외한 관계·효력일·업무 매핑 차분 산정

## 화면·저장 계약

- 부서 바로찾기 제거 → 주 메뉴 `조직·직무` 통합
- 제안서 다운로드 바로가기 → `전략 프롬프트 게시판` 전환
- `index.html?view=strategy-prompts&strategy=ST-04`: 기존 SPA의 본문 전환, 좌측 사이드바 유지
- 전략별 기본 프롬프트, 검색·편집·복사·기본값 복원·되돌리기
- `ts-strategy-prompt:v1:<전략ID>`: 전략별 독립 저장. 사용자 편집 내용의 브라우저별 보존, 사이트 데이터 삭제 시 초기화
- 손상·미지원 버전 저장본의 자동 덮어쓰기 금지. 저장 실패 시 현재 편집 내용 유지와 복사 안내
- 복사 성공 확인·시간 초과 시 선택 복사 대안 제공

## 검증

- `npm ci` 및 `npm test` 통과
- 원문 업무 ID·조직코드·업무 텍스트·근거 좌표·개별 요구/검수 참조 일치
- 57개 상세 항목의 요인·아키텍처 4요소·전달자료 4단계·후속 전략 연결 검사
- 브라우저에서 AX 26개·플랫폼 31개 상세 화면 전수 선택: 도식·후속 전략 표시, 콘솔 오류 없음
- 프롬프트 편집 후 새로고침 복원, 전략별 분리, 복사 결과와 편집값 일치, 기본값 복원·되돌리기 확인
- 저장 용량/권한 오류·손상 JSON·미지원 버전·빈 편집본 보존 검사
- 모바일 사례·게시판: 가로 넘침 없음, Pretendard, 제목 26px·본문 여백 18px 확인
- 기존 12개 공통 인수 검수·6개 구축 범위 보존
- 본 검증은 사이트·데이터 연결 검사. TS 실제 시스템 연계·AI 성능·기관 인수 검수는 미실행

## 변경 위치

- 분석: `src/case-insights.cjs`
- 후속계획·프롬프트 정본: `src/strategy-followup.cjs`
- 화면: `src/CaseInsight.jsx`, `src/StrategyPromptBoard.jsx`
- 저장: `src/strategy-prompt-storage.cjs`
- 내보내기: `scripts/export-case-insights.cjs`, `scripts/export-casebooks.cjs`
- 검증: `scripts/check-case-insights.cjs`
