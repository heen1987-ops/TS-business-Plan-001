# 처별 탐색·상세 본문 QA · 2026-10-07

## 판정

- 독립 사용자 대표 UI 검토: 합격. 필수 보완 잔여 없음.
- 실제 현업 사용성 조사·스크린리더 전면 검증 미실시.
- 출처·원장 재구성 및 정적 사이트 검증. 실제 NOA·ERP 실행·모델 성능·효과 실증과 구분.

## 실행 결과

- npm ci: 성공. 감사 취약점 0건. esbuild 기존 설치스크립트 승인 설정 관련 npm 안내 유지.
- npm test: 빌드·73개 경로·41개 검증 스크립트 통과.
- check:department-reader-browser: 292항목 통과. 51개 조직 클릭·55개 상세 주제 구조·검색·복수 과제·추가 주제·기존 해시·반응형·문서 응답 확인.
- check:integrated-browser: 384항목 통과. 51처·단일 제목·중복ID·본문앵커·이미지 실패/재시도·한글·모바일 확인.
- check:reader-ui-browser: 200항목 통과. 상단 맥락·목록·검색·뒤로가기·폭4종·다운로드 확인.
- check:intent-browser: 359항목 통과. 42개 목적·목표·수단·업무 변화·산출물 연결 확인.
- check:mandate-browser: 465항목 통과. 42과제 법령·현행 업무·국내외 사례·미확인 범위 보존.
- check:diagrams-browser: 626항목 통과. 42과제·168개 이미지 실제 로딩·직접주소·확대·실패복구 확인.
- 기존 한글 156개·510,623,675바이트, 최신 도식 168개 고유 해시 보존 확인.

- 처별 상세 표시 모델 762항목·전체 UI 탐색 모델 288항목 통과.

## 독립 브라우저 검토

- 51개 조직과 복수과제3개, 총54개 주소 순회.
- 처·과제·상세 설명 식별자·처리단계 일치.
- 중복 HTML ID·페이지 JavaScript 오류 0건.
- 390·768·1280·1600px 가로 넘침 0건.
- 모바일 검색·처 클릭·메뉴 닫힘·Escape 포커스 복귀 확인.
- 미래차연구처 본문 약131,203px → 약5,114px. 1600×900px의 비교값으로, 모든 기기 동일 높이 보장과 구분.
- 현재 처 목록의 가시영역 노출 및 불필요한 프로그램 포커스 테두리 제거 확인.

## 회귀 결함과 보완

- 기존 자동검사의 보조 선택폼이 기본 접힘으로 변경: 실제 펼침 절차 추가.
- 빈 결과 안내가 본문 폼에서 좌측 탐색으로 이동: 새 상태 표시 위치와 React 상태 반영 대기 확인.
- 문단→불릿 표시 분리로 원문 전체 문자열 단일 포함 검사가 부적합: 원문 문장별 보존 대조로 변경.
- 기존 조사 설명 해시: 선택 주제의 실제 상세 절로 변환. 다른 처·다른 주제 임의 연결 제외.
- 프로그램 초점의 큰 검은 박스: 상세 제목 강조로 대체. 입력·링크 키보드 초점 유지.

## 증거·운영

- qa-output/department-reader/results.json 및 viewport-*.png, future-first-viewport.png, MR-how-desktop.png.
- qa-output/integrated/browser-results.json, reader-ui/results.json, purpose-intent/browser-results.json.
- qa-output/mandate-workflows-browser.json, proposal-diagrams-browser.json.
- 위 로컬 산출물은 gitignore 적용 QA 증거. 공개 배포 파일·사이트 근거로 자동 승격하지 않음.
- 릴리즈 뒤 Actions 결론·공개 version.json의 커밋 일치·공개 선택 처 화면·직접 다운로드 확인 예정.
