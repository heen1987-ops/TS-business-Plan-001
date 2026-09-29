---
title: "N-08B_12 — 1차년도(내년) NoA Project 기술개발 실행계획"
version: v0.1
date: 2026-09-16
status: "4클러스터 독립설계(10모듈) + 통합검증 완료. 통합 스키마 충돌 9건 해소안 반영"
근거문서: |
  N-08B_02_RFP_초안 / N-08B_03_요구사항분석서 / N-08B_04_요구사항정의서 / N-08B_05_서비스기능정의서
  N-08B_06_정보시스템_AI감리엔진_상세설계 (참고 포맷) / N-08B_07_아키텍처 / N-08B_08_3개년_RnD_고도화계획
  15_정보화사업_생애주기_표준정보구조_v0.1_2026-09-16.md
  N-08_NoA기반_구현설계_v0.1_2026-09-15.md
사실상태_태그: "문서 근거가 있는 항목과 '설계 제안(신규)'을 각 항목에 명시 — CLAUDE.md 규약"
작성: Claude Code 세션 4-agent 병렬설계 + 1-agent 통합검증 Workflow + 종합
---

# 0. 이 문서의 역할

N-08B_08(3개년 RnD 고도화계획)의 1차년도(NoA Project/AI-PMS)는 "무엇을 만드는가"(요구사항)까지만 있고, N-08B_06(AI 감리엔진, 2차년도)이 갖춘 "어떻게 만드는가"(알고리즘·데이터모델·API) 수준의 기술설계가 없었다. 이 문서가 그 공백을 채운다 — **"내년 R&D 과업 = 추가 기술을 어떻게 개발할지"**에 대한 실행계획이다.

**작업 방식**: 1차년도 10개 모듈을 4개 클러스터(A 거버넌스, B Baseline Builder, C 워크플로우엔진, D AI기능모듈)로 나눠 독립 병렬설계한 뒤, 통합검증 단계에서 클러스터 간 스키마 충돌 9건을 발견했다 — **독립설계이므로 발생이 예상된 정상적인 결과이며, 아래 §1에서 전부 해소안을 확정한다.**

---

# 1. 통합 데이터모델 — 클러스터 간 충돌 9건과 해소안

| # | 충돌 | 해소안(canonical) |
|---|---|---|
| 1 | PreCheck 결과가 C(Submission 하위 `PreCheckResult`)와 D(`PreCheckRun`, deliverable_id 기준)로 이중정의 | **D의 `PreCheckRun`을 canonical로 채택.** PreCheck는 Draft 단계(제출 전)에 실행되므로 아직 존재하지 않는 Submission에 종속시킬 수 없다 — C 설계가 논리적으로 부정확했다. `Submission.precheck_run_id`로 역참조만 유지 |
| 2 | Deliverable 스키마가 B(단순, candidate 참조)와 C(풍부한 라이프사이클 스키마)로 이중정의 | **C의 풍부한 스키마를 canonical로, B는 그 생성 소스로 위계화.** B(BB02/BB03)는 `DeliverableCandidate`만 생성하고, 사람 확인(BB03) 시 C의 canonical `Deliverable` 레코드를 인스턴스화한다 |
| 3 | `Finding` 엔티티가 어디에도 정식 정의되어 있지 않음(Issue.Source, Handover.finding_asof, PreCheckRun.Findings[]에서 참조만 됨) | **`Finding` 신규 엔티티 확정**: `Finding{finding_id, project_id, source_type(PreCheck/Inspection/Manual), source_ref_id, related_requirement_id, related_deliverable_id, status, created_at}`. PreCheckRun 결과·Issue·Handover가 전부 이 ID를 참조 |
| 4 | Evidence의 FK가 Deliverable 단수 참조뿐, 어느 Submission 버전·어느 EvidenceRequirement에 대응하는지 연결 안 됨 | **Evidence에 `submission_id`(nullable)·`evidence_requirement_id`(FK→B의 EvidenceRequirement) 필드 추가** — 재감리 시 "몇 번째 제출본의 어떤 요구증거인지" 추적 가능하게 함 |
| 5 | Task 개념이 C 내부에서 `ScheduleTask`(Baseline 파생, 4종 일정)와 `ProjectTask`(Ad-hoc)로 분리돼 있는데 참조측(Evidence·Issue)에 구분자 없음 | **모든 `related_task_id` 참조에 `task_kind(schedule/adhoc)` 동반 필드 추가** — 두 Task 테이블은 유지, 참조 시 구분만 명시 |
| 6 | BaselineVersion 참조 필드명이 클러스터마다 제각각(`version_id`/`current_baseline_version`/`BaselineVersionRef`/`BaselineRef`) | **전부 `baseline_version_id`로 통일** |
| 7 | Role/Permission이 A에 정식 마스터로 있으나 C의 Task 담당주체는 자유문자열(OwnerType)로 우회, `policy:evaluate` 호출점이 C·D API에 없음 | **`OwnerType`을 `Role.role_code` FK로 교체, Deliverable Review/Approve·Task 조회 API 전부에 `policy:evaluate` 사전호출을 명시적 미들웨어로 삽입** |
| 8 | Asset 확장이 클러스터마다 개별 제안(`.baseline-source.asset`, `.deliverable.asset` 등) | **단일 신규 asset 패밀리 `.project-record.asset`로 통일하고 `record_kind`(baseline-source/deliverable/handover)로 서브타입 구분** — NoA Core의 asset 타입 레지스트리에 1개 패밀리만 추가 |
| 9 | 명명 규약 불일치(A/B/D=snake_case, C=PascalCase) | **snake_case로 통일**(3/4 클러스터가 이미 사용) |

부수 확정: `BaselineChanged`/`ScheduleChanged`/`SubmissionCreated` 등 이벤트의 `payload` 스키마를 명시 — 예: `ScheduleChanged.payload = {task_id, task_kind, change_type, delay_impact_id?}`.

---

# 2. 빌드 순서 (의존성 기준, 통합검증 결과)

```
1. PM01 Project Object          (Project/Contract/ServiceSystem/Membership/Event — 전체 FK 루트)
2. PM02 Role/Permission          (Membership 위, C·D가 의존하는 접근통제)
3. BB01 Document Structure Extractor  (문서→원문 anchor)
4. BB02 Requirement/Deliverable/Responsibility/EvidenceRequirement 추출
5. BB03 Human Confirmation Workspace  (BAS-005 게이트, 공식 Baseline 승격)
6. BB04 Baseline Version/Change Control  (Baseline v1.x 확정)
7. Deliverable Lifecycle 코어    (Draft~Submitted, D의 전제)
8. WBS/Schedule 엔진             (Baseline Requirement/Deliverable→Task 매핑)
9. Task/Issue/Risk 관리          (Schedule Task 파생 + Finding 소스 통합)
10. Evidence Collector           (Deliverable Submission을 최초 Capture 지점으로)
11. AI Pre-Check                 (Deliverable Draft→PreCheck 전이 + Evidence 존재확인 소비)
12. Project Assistant            (Evidence·Baseline·Schedule 최소셋 완성 후)
13. Handover                     (Evidence Collector·Schedule 선행, 기존 공문서생성 스킬 재사용 비중 최대)
```

**가장 중요한 구조적 리스크(통합검증 agent의 공통 지적)**: 13개 전부가 예외 없이 "여러 주체가 동일 공식 상태를 공유"하는 멀티유저 모델을 요구하는데, NoA Core는 "워크스페이스=개인소유·비공유, asset=정적 스냅샷"이 전제다. 이건 개별 모듈 버그가 아니라 **NoA Core 자체를 얼마나 확장해야 하는가**(CCK 플랫폼팀 결정사항)의 문제이며, 이 판정이 1차년도 예산·일정 추정 전체를 좌우한다. 특히 RAG 검색단 권한필터의 완전성(임베딩 인덱스에 권한 메타데이터를 얼마나 세밀히 태깅할 수 있는지)이 가장 먼저 검증돼야 한다.

---

# 3. 모듈별 요약 (10모듈 — 전체 필드/API/파이프라인은 journal.jsonl 및 하단 §6 참조)

| 모듈 | 정의 한줄 | NoA 통합방식 | 리스크 1개 |
|---|---|---|---|
| PM01 Project Object | 개인 워크스페이스와 별도로 사업 단위 공식상태를 공유하는 영속 레코드 계층 | **신규 최상위 객체**(asset 확장 아님). asset 포맷만 제출(promote) 시점에 재사용 | 워크스페이스 "삭제 시 복구불가" 정책이 제출된 공식 레코드에 그대로 적용되면 안 됨 — 예외보존 규칙 미설계 |
| PM02 Role/Permission | 소속조직×업무역할로 Project 단위 접근범위 통제 + RAG 검색단 동일 필터 | **완전 신규 접근통제 서브시스템**. RAG 필터 훅만 기존 AI Service에 삽입 | 임베딩 인덱스에 권한 메타데이터를 세밀히 태깅하는 방법론이 문서에 없음 |
| BB01 문서구조추출 | RFP·계약·지침을 조항 단위 노드+원문앵커로 분할 | Drive 원본은 그대로, 구조 인덱스만 Baseline DB 신규 | HWPX 표·별첨의 비정형 구조로 파싱 정확도 저하 |
| BB02 요구사항추출엔진 | 15개 분류(15번 문서 §3)+별지6 7필드로 Requirement/Deliverable/Responsibility/EvidenceRequirement 후보 생성 | RAG+LLM 신규 파이프라인, 출력은 전부 Candidate | 비법정 관행 필드(우선순위 등)를 법정 필드로 오표기할 위험 |
| BB03 사람확인 워크스페이스 | Candidate를 적용/수정/제외/확인필요로 처리해 공식 Baseline 승격 | PM01 Project 신규객체 위에서만 구현 가능(Workspace 밖) | 대량 후보 발생 시 검토자 과부하 |
| BB04 버전·변경관리 | Baseline v1.x 동결 + 변경 diff 이력 | Drive 파일버전과 별개인 레코드 버전(신규) | 계약변경 vs 단순 재해석 구분 모호 |
| Deliverable Lifecycle | Draft→PreCheck→Submitted→Review→Remediation→Approved 상태기계 | 산출물 실체는 asset 재사용, 상태·이력은 Project DB 신규 (하이브리드) | 워크스페이스 종속 asset을 다자간 Submission으로 확장할 때 NoA Core 변경범위 불명확 |
| WBS/Schedule 엔진 | 최초/승인/예상/실제 4종 일정 + 선후행 지연전파 | 완전 신규 공유객체(Rule Engine 중심) | 지연전파 알고리즘(선형 vs CPM vs PERT) 미확정 |
| Task/Issue/Risk | Ad-hoc Task·Issue·Risk 통합관리 + 역할별 Inbox | 신규 3테이블, Ad-hoc 구조화만 기존 Skill 패턴 재사용 | Task/Issue/Risk/Finding 경계가 문서상 느슨 |
| Evidence Collector | 5종 Evidence(Document/System/Test/Communication/Decision) 자동축적·재사용 | asset 스냅샷으로 불가 — 참조계층(메타데이터 DB) 신규, 원본은 기존 저장소 유지 | 원본이 외부시스템에 있을 때 원본 삭제·이동 시 무결성 붕괴 |
| AI Pre-Check | 제출 전 수행기업 내부 품질검사(필수항목/대응/불일치/Evidence누락) | 검사로직은 기존 "문서대조" 스킬 확장으로 즉시가능, 결과 귀속(PreCheckRun)은 신규 상태DB 필요 | 결과를 감리 공식자료로 오인해 제출할 위험 — 라벨링 필수 |
| Project Assistant | Project 범위 한정 RAG 질의응답 어시스턴트 | 기존 "워크스페이스=AI컨텍스트+대화" UX 재사용, 다자간 권한필터는 신규 | Retrieval 이후 필터링하면 이미 유출 — 반드시 Retrieval 전 필터 |
| Handover | 인수인계/주간Brief 자동 초안 | **문서세트 중 재사용비율 최고** — 최종 변환은 기존 "공문서생성" 스킬 그대로, 신규는 구조화 데이터 수집 부분뿐 | Project DB(Evidence·Schedule) 완성이 늦어지면 개인워크스페이스 의존으로 후퇴 |

---

# 4. 마일스톤 통합 타임라인 (제안, 주차는 병렬설계 결과의 종합 — 실제 조율 필요)

| 구간 | 내용 |
|---|---|
| 1~8주 | PM01/PM02 데이터모델·API MVP, BB01 문서파서 PoC |
| 9~18주 | BB02~BB04(추출→확인→버전관리) End-to-End, Deliverable Lifecycle 코어 착수 |
| 19~26주 | WBS/Schedule, Task/Issue/Risk, Evidence Collector 병행 구현 |
| 27~34주 | AI Pre-Check, Deliverable~Evidence 연계 완성, 1개 사업 파일럿 실증 |
| 35~40주 | Project Assistant, Handover, 전체 통합 실증 및 KPI 측정(N-08B_09 1차년도 KPI) |

**주의**: 이 표는 4개 클러스터가 각자 산정한 주차를 build_order에 맞춰 재배열한 것이며, 실제 팀 규모·병렬가능 인력에 따라 재산정이 필요하다(설계 제안, 확정 일정 아님).

---

# 5. NoA Core 변경 필요 범위 총괄 — 사용자(CCK) 결정 필요

| 신규 개념 | 관련 모듈 | 변경 규모 |
|---|---|---|
| 공유형 Project 계층(개인워크스페이스 밖) | PM01, BB03 | 플랫폼 아키텍처 신규 레이어 |
| Role/Permission(RBAC+ABAC) + RAG 권한필터 | PM02 | 플랫폼 접근통제 신규 서브시스템 |
| 상태를 갖는 레코드(Requirement/Deliverable/Task/Evidence/Finding) | BB02~04, Deliverable Lifecycle, Schedule, Evidence Collector | asset(정적 스냅샷) 밖의 신규 DB 레이어 |
| asset 패밀리 확장(`.project-record.asset`) | 여러 모듈 | asset 타입 레지스트리에 1개 패밀리 추가(상대적으로 작은 변경) |

이 표는 [N-08_NoA기반_구현설계](N-08_NoA기반_구현설계_v0.1_2026-09-15.md) §3의 "5개 신개념"과 동일 결론에 독립적으로 재도달한 것이다 — 두 번째 확인.

---

# 6. 다음 행동

1. §1의 9개 스키마 해소안을 N-08B_04(요구사항정의서)·N-08B_07(아키텍처)에 반영해 원본 문서세트 자체를 업데이트할지 여부.
2. §4 타임라인·팀 규모를 실제 CCK 개발 리소스 기준으로 재산정.
3. §5의 NoA Core 변경 범위를 CCK 플랫폼팀에 공식 요청사항으로 전달할지 여부 — 이 판정 없이는 1차년도 전체 일정·예산이 확정되지 않는다.
