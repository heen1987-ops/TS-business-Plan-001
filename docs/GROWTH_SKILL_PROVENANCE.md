# GROWTH AI 공통 스킬 — 출처와 프로젝트 적용

기준일: 2026-10-15. 공통 정본은 CCK-Public-basic이며 TS 저장소는 아래 고정 판본을 적용한다.

- 정본: [CCK-GROWTH-Skills](https://github.com/heen1987-ops/CCK-Public-basic/blob/b6dc23772d3847bcb9ef2ebe7927fb3a3e2dd5c0/CCK-GROWTH-Skills/README.md)
- 고정 커밋: `b6dc23772d3847bcb9ef2ebe7927fb3a3e2dd5c0` · 패키지 버전: `0.1.0`
- 적용 경로: [`.agents/skills`](../.agents/skills/cck-public-business/SKILL.md)
- 설치 기록: [cck-growth-install-lock.json](../.agents/skills/cck-growth-install-lock.json)
- 화면용 적용 메타데이터: [growth-framework.json](../src/growth-framework.json)
- 상위 플랫폼: [조직 네이티브 AI 설계](https://github.com/heen1987-ops/CCK-Public-basic/blob/b6dc23772d3847bcb9ef2ebe7927fb3a3e2dd5c0/CCK-GROWTH-Skills/ORGANIZATION_NATIVE.md)

## 적용 범위

통합 진입·근거 확인·제안서 작성·사업관리·기관 확장 5개 스킬과 공통 파일 6개를 원본 바이트 그대로 설치했다. 고정 커밋의 Git blob과 설치본 SHA-256을 대조했다. 개인 절대경로는 설치 lock에 저장하지 않는다.

기존 c991e399의 TS 7업무·2진입점은 [재사용 원장](GROWTH_SKILLS.md)으로 계속 연결한다. 작업 중 임시 배치했던 이전 portable 패키지는 새 공통 패키지로 정리했으며 기존 정본 브랜치의 자산은 수정하지 않았다. 실제 TS 카탈로그·WBS·인사·내부 양식·기관 문서·인증정보는 복제하지 않았다.

## 검증 상태

| 항목 | 결과 | 범위 |
| --- | --- | --- |
| 정본 구조 검사 | pass | 합성 입력·기관/사업/공고/판본 격리·실적 인용·기준선·CLI·설치 102건 |
| pinned 설치 | pass | 11파일의 원본 커밋·설치 바이트·해시 검증 |
| 설치된 입력 검사 | pass | 합성 제안 입력을 cck-proposal로 분기; 실제 AI 호출 없음 |
| 스킬 문서 기본 구조 | pass | 5개 SKILL.md frontmatter·이름·구조 검사 |
| 앱 스킬 발견·선택 | not_run | 새 앱 세션의 발견·선택 검증 별도 |
| 모델 산출물 품질 | not_run | 실제 제안서 생성·기관 전문가 평가 별도 |
| 조직·인사·권한 연계 | not_run | 설계 대상. 실제 원천 접근·ETL·정책 엔진 구현 없음 |

원천의 존재·구조 검사는 법령 전문의 정확성, 해당 공고 적용, 실제 승인 진위나 제출 준비 완료를 증명하지 않는다. 공식 출처별 열람수준·판본·미확인은 설치본 source-registry.json에서 보존한다.

## 파일별 SHA-256

| 파일 | 바이트 | SHA-256 |
| --- | ---: | --- |
| `cck-public-business/SKILL.md` | 2343 | `041904aaa4338eb7ab9b80dd2cf1bae8cf32699edb05ad94574ba997ad57cf52` |
| `cck-public-evidence/SKILL.md` | 2316 | `6608445aabe7d2e0a3a54a4514fba6fa34c29907dd44a6d8203880ef5b094bf9` |
| `cck-proposal/SKILL.md` | 3146 | `961e1218b6d44684f2435c90c4092aee928bbf9c08eec263410af1241ac3ef4d` |
| `cck-project-management/SKILL.md` | 3158 | `abf6160c8c2199b8464cea529d0eddda0af075c690cdf16c1f1f7b74587d01f0` |
| `cck-agency-onboarding/SKILL.md` | 2687 | `0e4c877634e74fccfad30bc920560d0d8cf64cdfd1d489b039c7cd5627431725` |
| `_shared/contract.md` | 5467 | `e627991397fb818f32d9133ba97c20525b4971b9e2436cea0da571662768fc12` |
| `_shared/evidence-rules.md` | 3208 | `296978036090cb2f49ab989300d3eb0f786d91adc8ae8c9742ce2103108c1c22` |
| `_shared/agency-profiles.json` | 5151 | `c353bf881b9f286c3c419a9cf7d3edd67dcb27832685647573a7155948e3d7fa` |
| `_shared/source-registry.json` | 8410 | `b17cc4902c938b34478416b4ed2f0dceb30ba76db64c1f09f3b7e7bf8a3048a8` |
| `_shared/request.schema.json` | 8703 | `1d462dfd460c0ea38e645a0e8d97095fd8284b8a4096d3611de6693b138cf5ea` |
| `_shared/inspect-request.cjs` | 16324 | `c6a7d6f5ac17da04e9158cc1b0fadc39e17473eef21e27dae33b2ab99c8c4160` |

갱신은 CCK 정본 검증·커밋 → 새 검토 경로에 pinned 설치 → 기존판과 비교 → TS 적용 snapshot 갱신 → 회귀검증 순서로 진행한다. 설치기는 기존 스킬을 자동 덮어쓰지 않는다. 공통 규칙을 TS에서 따로 고치지 않는다.
