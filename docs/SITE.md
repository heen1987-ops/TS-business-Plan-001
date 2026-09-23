# TS AX 사업기획 사이트

한국교통안전공단의 임무·법정업무·2030 전략·조직별 AX 전환 제안을 탐색하는 React 기반 검토 사이트.

- 기관 이해·전략·조직별 제안·공식 사이트·등록 원장: 67개 진입 경로
- 처별 사업 정의·요구사항·아키텍처·서비스 흐름·예산 검토
- KATRI 문서 검토 제안과 상세 아키텍처
- 폴더형 탐색·검색 및 연결 근거자료

기획·검토용 자료이며 확정된 기관 업무계획, 실제 AI 운영시스템 또는 사업 승인 결과를 의미하지 않음.

## 로컬 실행

Node.js 24 권장. 잠금파일 기반 설치.

```sh
npm ci
npm test
npm run preview
```

검토 주소: http://127.0.0.1:8769/TS-business-Plan-001/

검토 서버는 GitHub Pages와 동일한 프로젝트 하위 경로를 사용. 외부 API·서버·LLM 연결 없이 정적 산출물로 동작.

## 파일 구조

| 경로 | 용도 |
|---|---|
| src/ | React 화면·탐색·구조화된 기획 데이터 |
| public/ | 연결 정적 문서·다운로드·그림 원본 |
| site-routes.json | 정적 진입점을 생성하는 경로 원장 |
| scripts/build.cjs | 독립 빌드·상대경로 HTML 생성 |
| scripts/check.cjs | 화면·자산·명세·내부 링크·로컬경로 노출 검증 |
| scripts/preview.cjs | 프로젝트 경로 검토 서버 |
| .github/workflows/pages.yml | GitHub Actions 빌드·Pages 배포 |
| dist/ | 빌드 결과, Git 관리 제외 |

원래 작업폴더나 개인 드라이브에 의존하지 않는 빌드. 새 자료의 경우 src 데이터와 public 파일을 함께 갱신한 뒤 검증 필요. 빌드는 이 저장소 내부 dist 폴더만 다시 생성.

## GitHub Actions

main 변경 시 의존성 설치 → 사이트 빌드 → 내부 링크·자산 검증 → Pages 산출물 업로드 → 배포 순서 실행.

Pull request에서는 빌드·검증만 실행. Actions 참조는 검토한 commit SHA로 고정. 배포 권한은 deploy 작업에만 부여. 별도 PAT 저장 불필요.

GitHub 설정의 Pages → Source는 **GitHub Actions** 사용.

배포 주소: https://heen1987-ops.github.io/TS-business-Plan-001/

**설정 상태:** GitHub Pro 업그레이드 확인 후 비공개 저장소의 Pages 활성화 완료. 저장소는 비공개 유지, 빌드된 사이트는 공개 URL로 제공. 저장소 루트의 기존 내부문서 6종은 public 디렉터리에 복사하거나 사이트 빌드에 포함하지 않음. 실제 배포 결과는 Actions에서 확인.

## 검증·운영

- npm test: 67개 진입 경로, 13개 처, 16개 아키텍처 및 연결 자산 검증
- HTML 내부 링크의 실제 대상 존재 여부 검증
- 사용자 로컬 경로·대표적인 인증정보 패턴의 배포본 포함 여부 검사
- version.json: 배포 commit과 빌드 시각 확인
- 장애 시 이전 정상 commit으로 변경을 되돌리고 main에 push하여 재배포
- 사이트 내용의 법령·수치·제안 상태는 각 문서 근거와 기준일에 따라 별도 검토 필요

연구 원본 전체, 개인 드라이브, 비밀키, 인증 보조도구 및 node_modules는 저장소 배포 범위에 포함하지 않음.


정량평가 보강: [측정명세 및 검증기록](MEASUREMENT.md). 처별 정량효과·측정방법 목차에서 접근. MD·JSON·빈 CSV 결과표 다운로드 제공.


TS 홈페이지 탐색 방식 반영: [내비게이션·메뉴·자료 등록 구조](TS_NAVIGATION.md). 상단 6개 메뉴, 문맥별 폴더 메뉴, 검색·사이트맵·등록 원장을 같은 분류 원장으로 구성.

법령·담당 처·컨셉 연결: [매핑 설계·근거·검증기록](LAW_CONCEPT_MAPPING.md). 처와 법정업무 양방향 탐색, 조직 지도·처별 제안 연결, MD·JSON 내려받기 제공.
