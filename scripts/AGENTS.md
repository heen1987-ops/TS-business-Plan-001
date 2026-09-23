# scripts/AGENTS.md — 빌드·검증 스크립트 규칙

루트 `AGENTS.md` §4를 먼저 적용한다.

- `build.cjs`: `public/` 전체 복사 → `site-routes.json` 경로마다 React shell 생성 → `react/app.js` 번들 → `version.json`. 빌드 입력은 `src/`·`public/`·`site-routes.json`뿐이다. 저장소 루트의 `01_~03_` 내부검토 폴더를 빌드에 넣지 않는다.
- `check.cjs`: 경로 64·처 13·아키텍처 16·자산 존재·내부 링크·로컬경로·자격증명 패턴 검사. `check-slides.cjs`: 슬라이드 경로 108·요구사항 104 보존 검사.
- 검사를 느슨하게 만들지 않는다. 항목 수를 바꿀 때는 데이터 변경과 같은 커밋에 넣고 사유를 적는다.
- 추가하면 좋은 검사: ① `public/`·`dist/` HTML의 금액 패턴(`[0-9,.]+ ?(억|만 ?원|원)`) 발견 시 경고 목록 출력, ② `<title>`에 같은 구절이 두 번 들어간 페이지 검사, ③ `legacy/`에 `public/` 직속과 동일 내용 파일이 생기면 실패.
- 로컬 전용 스크립트는 `*.local.cjs`로 두면 `.gitignore`에 걸린다. 임시 스크립트를 커밋하지 않는다.
- Actions(`.github/workflows/pages.yml`)의 action 참조는 commit SHA 고정을 유지하고, `deploy` 잡 외에 `pages: write` 권한을 주지 않는다.
