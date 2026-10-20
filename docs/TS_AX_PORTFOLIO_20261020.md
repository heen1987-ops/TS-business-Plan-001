# TS AX 12대 전략과제 포트폴리오

기준일: 2026-10-20 · 서비스 기획·검수 설계안

## 변경

- 100건 사례를 조직 네이티브 공통 기반과 11개 부서별 후속 서비스로 종합.
- P0 ST-04 / P1 ST-01·07·10·12 / P2 ST-02·03·06·09·11 / P3 ST-05·08.
- 기존 전략명·법령·직제 업무분장·ON-W01~06·GAI-T01~12 유지. 주관·협업·우선순위는 CCK 기획 제안.
- 기관 전체·해당 부서·업무건 3계층, 필수서류 보완 요청·재개, 변경 영향·인계 설계.
- CCK 기술별 확인 단계·재사용 범위·TS 추가분, 업무별 산출물·시험 입력·판정·효과 측정 연결.
- 전략 메뉴의 단일 기획 원장 사용. 두 사례집 종합 시사점·전략 매핑과 개별 사례에서 양방향 연결.
- 기존 57건 설계·도면·PPT 유지, 종합 시사점의 별도 접힘 영역에 보존. PPT 신규 갱신 범위 없음.
- MD·CSV·JSON 다운로드는 빌드 시 같은 원장에서 생성. 좌측 메뉴·SPA·Pretendard 유지.

## 근거

- src/benchmark-100.json: 기존 100건의 AS-IS·TO-BE·관찰 결과·병목·시사점 전수 대조. 34개 플랫폼·66개 업무 사례. 복수 전략 연결은 중복 사례로 집계하지 않음.
- src/ts-organization-rules.cjs / strategy-duty-map.cjs: 2026.06.30 직제시행세칙 원문·위치 유지. 자동차안전연구원 별도 분장과 AI서비스개발팀 조건부 시행 상태 유지.
- CCK 아카이브: 사업·기술 근거서, current_corrections, E09 NoA 재편집 사용자 매뉴얼 추출문, PG18 카탈로그, PG24 Epic 명세, PG31 개발환경 개요, PG34 스킬 로드맵의 관련 대목 대조. 설치·배포·고객 수락을 새로 확인한 결과 아님.
- 기술 원문·계약·고객 원본·금액·직원 개인정보의 신규 공개 제외. 홈페이지에는 재사용 판단에 필요한 기술 범위·근거 ID·확인 단계만 반영.
- 2026.10.20 공식 원문 재열람: [TS 전략체계](https://main.kotsa.or.kr/portal/contents.do?menuCode=06020100), [OneService 개발 소개](https://www.tech.gov.sg/technews/developing-the-one-service-chatbot/), [CAT 평가](https://www.gov.uk/government/publications/ai-consultation-analysis-tool-evaluation), [MyCity 감사](https://comptroller.nyc.gov/reports/audit-report-on-the-new-york-city-office-of-technology-and-innovations-mycity-system/).

## 범위·측정

기존 인증·권한·ETL·RAG·문서 처리·로그·기본 승인·계약 시험은 재사용/기존 이행 대조. 새 비용은 추가 관계·사전·어댑터·평가의 차이 확인 후 산정. 공통 산정 ID ON27-BASE / C27-COM 유지.

평가셋은 개발과 분리하고 AI 결과 확인 전 정답 동결. 비인가 노출·중요 누락·잘못된 완료 표시는 선행 관문. 효율은 검토·보완·재시도를 포함한 총시간으로 측정. 외부 절감률과 목표치를 TS 실측 또는 계약 기준으로 전용하지 않음. 상대 일정 M1~M9는 기존 공통 기반 기획을 잇는 계획.

## 검증 명령

- npm ci && npm test: 기존 검사 전체 및 새 12전략·100근거 연결 검사.
- node scripts/check-ts-ax-portfolio-browser.cjs: 12개 과제 전수, 우선순위 필터, 검색, 사례 왕복, 단일 본문, 좌측 메뉴 DOM, 다운로드, 모바일.
- node scripts/check-benchmark-100-browser.cjs: 기존 100건 전수 표시·원문 도면·사례 검색 회귀.
- 브라우저 검사 환경변수: SITE_BASE, PLAYWRIGHT_MODULE, QA_OUTPUT. 로컬·공개 배포 각각 검사.

검증은 기획 홈페이지의 데이터·표시·연결·배포에 한정. TS AI 실행 성능·기관 인수·후속 사업 승인과 구분.
