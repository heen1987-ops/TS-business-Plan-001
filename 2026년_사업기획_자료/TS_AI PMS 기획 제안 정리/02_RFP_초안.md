# 02. 제안요청서(RFP) 초안
## NoA 기반 공공 정보화사업 AI-PMS 및 Continuous Assurance 플랫폼 기술개발

- 버전: v0.1
- 작성일: 2026-09-16
- 문서 성격: **기획용 RFP 초안**
- 유의사항: 실제 발주 시 예산, 계약조건, 제안평가 기준, 보안요건, 지식재산권, 하자·유지관리, 사업기간은 발주기관 기준으로 확정 필요

---

## 1. 사업명

**NoA 기반 공공 정보화사업 AI-PMS 및 Continuous Public Assurance 플랫폼 기술개발**

---

## 2. 사업 배경

공공 정보화사업은 계약 이후에도 일정·품질·위험·산출물·과업 이행을 지속적으로 관리하고, 사업조건에 따라 정보시스템 감리·검수 등 검증절차를 수행한다. [S2][S3][S4]

현행 NoA는 개인 Workspace, Drive, Skill, AI Context를 활용한 AI 업무지원 플랫폼으로서 문서처리와 지식활용에 강점을 가진다. [S1]  
다만 기관 담당자·수행기업·관련부서가 동일 Project의 공식 상태를 공동 관리하고, 그 과정의 Evidence를 후속 검사·감리에 활용하기 위한 공유형 Project 객체는 별도 확장이 필요하다.

---

## 3. 사업 목적

1. NoA 내 공공 정보화사업용 영속적·공유형 Project Layer 구축
2. RFP·계약·지침·수행계획 기반 사업 Baseline 자동구성
3. 기관·수행기업 공동 일정·Task·산출물·이슈 관리
4. 수행과정의 Continuous Evidence 자동축적
5. 2차년도 AI 상시검사 및 사람 감리 투트랙을 위한 기술기반 확보
6. 3차년도 수행기업 Reference·만족도·Risk·RFP Intelligence 확장기반 마련

---

## 4. 개발 범위

### 4.1 1차년도: NoA Project / AI-PMS

- Project Object 및 역할기반 접근권한
- Baseline Builder
- WBS·일정·Task·Issue
- 산출물 Lifecycle
- 수행기업 AI Pre-Check
- Continuous Evidence Collector
- Project AI Assistant
- Handover·Lifecycle 기초기능

### 4.2 2차년도: NoA Assurance / CCK Assurance Engine

- AI Inspection Engine
- Information System Audit Domain Pack
- Completeness / Compliance / Consistency / Traceability / Evidence 검사항목
- Finding Engine
- 감리사 Workspace
- AI-Human Cross Validation
- Remediation·Retest
- Event-driven Continuous Assurance

### 4.3 3차년도: NoA Intelligence

- 다면평가
- 사용자 만족도
- Vendor Reference
- Reference Confidence
- Risk Intelligence
- Improvement Recommendation
- Evidence-based RFP Builder
- 타 기관 적용 Configuration

---

## 5. 목표 서비스 구조

```text
NoA Core
  ├ Workspace
  ├ Drive
  ├ Skill
  ├ AI / RAG
  └ Document Processing
        ↓
NoA Project
  ├ Project
  ├ Schedule / WBS
  ├ Task / Issue
  ├ Deliverable
  ├ Review / Approval
  └ Continuous Evidence
        ↓
CCK Assurance Engine
  ├ Baseline
  ├ Inspection
  ├ Finding
  ├ Human Audit
  ├ Remediation
  └ Retest
        ↓
NoA Intelligence
  ├ Multi-Stakeholder Evaluation
  ├ Satisfaction
  ├ Vendor Reference
  ├ Risk
  └ RFP Intelligence
```

---

## 6. 주요 기능 요구사항

### 6.1 Project 관리

- 사업정보와 관련 시스템·서비스를 연결할 수 있어야 한다.
- 기관·수행기업·감리사·관련부서의 역할과 접근권한을 구분할 수 있어야 한다.
- 최초계획일, 승인일정, 예상일정, 실제일정을 분리 관리해야 한다.
- Task·Issue·Risk·자료요청·회의 Action Item을 담당자와 기한에 연결해야 한다.
- 기관 대기와 수행기업 대기상태를 구분해야 한다.

### 6.2 Baseline

- RFP·계약·수행계획·지침을 분석하여 Requirement, Deliverable, Schedule, Responsibility, Evidence Requirement 후보를 생성해야 한다.
- AI가 생성한 후보는 담당자 확인 전 공식기준으로 사용하지 않아야 한다.
- Baseline의 버전과 변경사유를 유지해야 한다.

### 6.3 산출물

- 산출물은 관련 Requirement와 연결되어야 한다.
- 공식 제출본은 버전·제출자·제출시각을 보존해야 한다.
- 수행기업은 제출 전 AI Pre-Check를 사용할 수 있어야 한다.
- 제출·검토·보완·재제출·승인을 상태로 관리해야 한다.

### 6.4 Evidence

- Document / System / Test / Communication / Decision Evidence를 구분해야 한다.
- Evidence의 원본위치·버전·생성주체·확인상태를 저장해야 한다.
- 감리·검사 시 기존 Evidence를 다시 수집하지 않고 재사용할 수 있어야 한다.

### 6.5 AI Inspection

- AI는 Baseline 대비 완전성·적합성·정합성·추적성·증빙성 검사를 수행해야 한다.
- AI 검사는 공식 판정이 아닌 Finding Candidate를 생성해야 한다.
- Finding에는 기준·대상·Evidence·관측내용·추가확인사항을 제시해야 한다.
- AI 오탐·미탐을 사람 검토결과와 비교할 수 있어야 한다.

### 6.6 Human Audit

- 감리사는 AI 결과와 독립적으로 Finding을 등록할 수 있어야 한다.
- AI와 감리사의 판단 차이는 별도 검토상태로 관리해야 한다.
- 감리의 법적·전문적 최종 판단권한을 시스템이 침해하지 않아야 한다.

### 6.7 수행기업 Reference

- 기업 단일 총점보다 `기업 × 사업 × 실제 역할 × 평가시점`을 기본단위로 해야 한다.
- System Evidence, Assurance Evidence, Stakeholder Evaluation, User Experience를 분리 저장해야 한다.
- 신규기업의 Reference 부재를 부정평가로 처리하지 않아야 한다.
- AI Finding만으로 감점하지 않고 사람 검토·소명·재검증 후 확정된 결과만 활용해야 한다.

---

## 7. 비기능 요구사항

### 보안·권한
- 사업·역할·문서 공개범위 기준 접근통제
- AI 검색·RAG 단계에서도 동일 권한 적용
- 감사로그와 주요 변경이력 보존

### 안정성
- AI 서비스 장애와 공식 제출·승인 Workflow 분리
- 공식 제출·승인은 AI 결과와 무관하게 처리 가능

### 설명가능성
- AI 판단은 근거문서·원문위치·적용 Baseline 버전을 제시

### 확장성
- 정보시스템 감리 외 회계검사·내부감사 Domain Pack 확장 가능 구조

### 상호운용성
- SSO·전자결재·DMS·계약·메일·알림 시스템 연계 가능

---

## 8. 주요 산출물

| 연차 | 필수 산출물 |
|---|---|
| 1차 | 요구사항정의서, 서비스 설계서, Project 데이터모델, Baseline Builder, AI-PMS MVP, Evidence Repository, 실증결과서 |
| 2차 | AI Inspection Engine, 감리 Domain Pack, Finding 모델, Auditor Workspace, Cross-Validation 결과, 감리실증 결과 |
| 3차 | Vendor Reference 모델, 다면평가, Risk Intelligence, RFP Builder, 다기관 적용결과, 최종 성과보고서 |

---

## 9. 검증 요구사항

### 1차년도
- 사업현황 취합시간
- 자료 탐색시간
- 산출물 제출·보완 Cycle
- Requirement 추출 정확도
- Evidence 연결률

### 2차년도
- Finding Precision / Recall
- Evidence Matching Accuracy
- 중요문제 조기탐지율
- AI-감리사 판단 비교
- 감리 Evidence 탐색시간

### 3차년도
- Reference Evidence Coverage
- 다면평가 참여율
- 신규기업 Reference 획득사례
- 반복 Finding 감소
- 개선과제-RFP Traceability

---

## 10. 제외범위

초기 범위에는 다음을 포함하지 않는다.

- ERP 전체기능
- 급여·인사·구매·회계 시스템 대체
- 범용 협업메신저
- 전사 포트폴리오 관리
- AI의 자동 계약위반·귀책·제재 확정
- AI의 법정 감리 대체
- 기업 자동 입찰배제

---

## 11. 제도·운영 전제

1. 감리대상 여부는 [S2][S3] 및 해당 사업의 최신 법령·조건에 따라 판단한다.
2. AI 검사는 법정 감리를 대체하지 않는다.
3. Vendor Reference를 공식 입찰 가감점으로 활용하려면 사전 공개된 평가기준과 별도 제도근거가 필요하다.
4. 법령·지침·계약·기관 내부규정 중 상충이 있을 경우 시스템은 자동 결론보다 `확인 필요` 상태를 제공해야 한다.

## 공통 근거자료

- **[S1] NoA AI 사용자 가이드 v1.0**, 주식회사 씨씨케이솔루션, 2026.09.08.
  - NoA는 AI와 함께 업무를 처리하는 업무 플랫폼으로 정의됨.
  - 워크스페이스는 개인 소유의 AI 작업공간으로 정의됨.
  - 드라이브 파일은 AI 컨텍스트에 담아야 AI 작업의 근거로 활용됨.
  - 스킬은 AI가 따르는 업무 절차로 정의됨.
  - AI 생성 결과는 사용자의 검토를 전제로 하며 최종 판단은 사람이 수행함.
- **[S2] 전자정부법 제57조**, 시행 2026.08.28.
  - 일정 요건의 정보시스템에 대한 감리, 감리 독립성, 감리결과 반영 등 규정.
- **[S3] 전자정부법 시행령 제71조·제72조**, 시행 2026.08.28.
  - 정보시스템 감리대상과 감리법인의 업무범위 규정.
  - 제72조는 사업수행계획의 계약내용 반영, 일정·산출물 작성계획, 요구사항 설계 반영, 과업 이행, 관련 법령·지침 준수 등을 감리범위로 규정.
- **[S4] 소프트웨어사업 계약 및 관리감독에 관한 지침**, 과학기술정보통신부 고시.
  - 소프트웨어사업의 발주·계약·과업관리·관리감독 관련 기준.
- **[S5] 전자정부사업관리 위탁에 관한 규정**, 행정안전부 고시.
  - 전자정부사업관리자의 업무, 독립성, 위탁관리 관련 기준.
- **[S6] 전자정부사업관리 위탁(PMO) 도입·운영가이드 2.0**, NIA.
  - 발주기관과 PMO의 사업관리 업무를 단계별로 제시.

> **적용 원칙**: 위 근거는 서비스 방향과 업무요건을 정의하기 위한 기준이다. 실제 사업 적용 시 해당 사업의 최신 법령·고시·계약·기관 내부규정·보안정책을 다시 확인해야 한다.