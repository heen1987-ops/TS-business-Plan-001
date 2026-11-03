# 사업기회 컨셉 원장과 2030 로드맵

2026-11-03 · v1.1 · 기획 제안, 현장 검증 전

## 진입과 편집

- 홈페이지 상단 요약에서 `index.html?view=opportunities`로 진입.
- `src/concepts/컨셉명.md`가 개별 컨셉의 편집 원장. 파일명과 frontmatter의 title이 일치해야 함.
- 파일 첫 부분은 `---`로 감싼 JSON 메타데이터. id, slug, title, summary, primary_area, areas, stage, strategy_ids, task_ids, date, status, sources를 사용.
- sources는 확인한 공개 출처와 확인 범위를 기재. checkedAt 또는 publishedAt으로 시점 명시. 검토일과 원문 직접 열람일의 의미를 note로 구분.
- 화면의 3영역 비교와 연차 로드맵은 `src/opportunity-plan.cjs`에서 관리.
- `scripts/lib/load-concepts.cjs`가 메타데이터·분류·공개 경계를 검사하고 제한된 Markdown을 HTML로 변환. 원시 HTML은 이스케이프.
- `scripts/export-opportunities.cjs`가 빌드 시 MD 원문과 목록을 `dist/downloads/concepts/`에 생성. 같은 파일을 `public/`에 중복 저장하지 않음.
- query view는 `site-routes.json`의 queryViews에 등록. 기존 75개 HTML 경로와 12전략·13처 자료 유지.

## 검토 상태

38개는 확정 사업 수가 아니라 공통 기반·업무 적용·조건부 확산·연구·선행조건 확인을 구분한 검토 단위. 과거 세부 활동이나 사례를 독립 사업으로 단순 합산하지 않음.

카카오톡 대화와 알림톡·문자 수신을 구분하고, 공식 신청·예약·실제 조치 확인으로 연결. 공공 마이데이터 정보보유기관 등재와 개별 이용업무의 수신·가동은 구분. AI 브라우저는 권한과 공식 결과 대사를 전제로 하며, 야간 평가는 실시간 통제를 대신하지 않음. 신규 모델은 현행 기준선과 동일 조건 비교 후 승인·복구 절차로 적용.

## 검증

`npm ci && npm test`는 기존 검사와 사업기회 전용 검사를 함께 수행. 원문-다운로드 SHA-256, 16개 과제/12전략 연결, 3영역/5개년, 공개 경계, 원시 HTML 처리와 중복 ID를 검사. 브라우저에서는 진입·필터·검색·빈 결과·초기화·상세·뒤로/앞으로·직접 URL·다운로드·모바일을 별도로 확인.

이 문서는 작성·검증 계약이며 수행 결과는 배포 기록과 QA 결과로 확인. 실제 운영 서비스 구축이나 기관 승인으로 표현하지 않음.
