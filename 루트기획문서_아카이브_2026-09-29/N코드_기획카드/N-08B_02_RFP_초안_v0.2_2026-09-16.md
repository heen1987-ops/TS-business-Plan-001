# 02. RFP 초안
## NoA 기반 공공 정보화사업 AI-PMS 및 Continuous Assurance 플랫폼 기술개발

- 버전: v0.2
- 작성일: 2026-09-16
- 성격: 기획용 초안

## 1. 사업명

**NoA 기반 공공 정보화사업 AI-PMS 및 Continuous Public Assurance 플랫폼 기술개발**

## 2. 사업목적

1. NoA 내 공공 정보화사업용 영속적·공유형 Project Layer 구축
2. 계약·지침·RFP·수행계획 기반 사업 Baseline 구조화
3. 기관·수행기업 공동 일정·과업·산출물·Issue 관리
4. Continuous Evidence 자동축적
5. AI 상시검사 + 사람 감리 투트랙 감리엔진 개발
6. 수행기업 Reference·만족도·Risk·차기 RFP 환류

## 3. 개발범위

### 1차년도 — NoA Project / AI-PMS
- Project Object
- Role/Permission
- Baseline Builder
- WBS/Schedule
- Task/Issue/Risk
- Deliverable Lifecycle
- AI Pre-Check
- Evidence Collector
- Project Assistant
- Handover/Lifecycle 기초

### 2차년도 — NoA Assurance
- Audit Scope Resolver
- Standard & Audit Domain Pack
- Audit Baseline / Plan Builder
- Evidence Mapper
- Inspection Orchestrator
- AI Finding Engine
- Auditor Workspace
- AI-Human Cross Validation
- Remediation / Retest
- Continuous Assurance

### 3차년도 — NoA Intelligence
- Multi-Stakeholder Evaluation
- Satisfaction
- Vendor Reference
- Reference Confidence
- Risk Intelligence
- Improvement Recommendation
- Evidence-based RFP Builder
- 다기관 Configuration

## 4. 핵심 기능요건

### Project
- 기관·업체·관련부서가 동일 공식 상태를 공유
- 최초/승인/예상/실제 일정 구분
- 기관대기/업체대기/변경승인대기 구분
- 산출물 제출·검토·보완·승인 상태관리

### Baseline
- Requirement / Deliverable / Responsibility / Evidence Requirement 구조화
- 원문·버전·위치 추적
- AI 추출결과 사람 확인
- 버전·변경이력 보존

### Evidence
- Document / System / Test / Communication / Decision 유형
- 원본위치·버전·주체·시간·확인상태 저장
- 감리 시 재사용

### Assurance
- 완전성·적합성·정합성·Traceability·Evidence Sufficiency 검사
- AI 결과는 Finding Candidate
- 감리사 독립검증
- Cross Validation
- Remediation / Retest

### Reference
- 기업×사업×실제역할×평가시점 단위
- System Evidence / Assurance Evidence / Stakeholder Evaluation / User Experience
- 이력 부재는 저성과로 처리 금지
- AI Finding만으로 자동 감점 금지

## 5. 비기능요건

- Role/Project/Document Scope 기반 접근통제
- AI 검색단계 권한 적용
- 공식 Workflow와 AI 장애 분리
- 감사로그
- 모델·Rule·Baseline 버전 기록
- SSO·전자결재·DMS·계약·알림 연계
- 개인정보·영업비밀·평가정보 분리
- Domain Pack 확장

## 6. 주요 산출물

| 연차 | 산출물 |
|---|---|
| 1차 | AI-PMS MVP, Project Data Model, Baseline Builder, Evidence Repository, 실증결과 |
| 2차 | CCK Assurance Engine, 감리 Domain Pack, Auditor Workspace, Cross Validation 결과 |
| 3차 | Vendor Reference, Risk Intelligence, RFP Builder, 다기관 적용모델 |

## 7. 제외범위

- ERP·인사·급여·구매·회계 시스템 대체
- 범용 메신저
- AI 자동 계약위반·귀책·제재 확정
- AI의 법정 감리 대체
- 기업 자동 입찰배제

## 8. 검증

1차: 시간절감·Evidence 생성  
2차: Precision/Recall·조기탐지·감리시간  
3차: Reference Coverage·다면평가·RFP Traceability

## 공통 근거자료

- **[S1] NoA AI 사용자 가이드 v1.0**, 주식회사 씨씨케이솔루션, 2026.09.08.
  - NoA는 AI와 함께 업무를 처리하는 플랫폼으로 설명됨.
  - 워크스페이스는 개인 소유의 AI 작업공간으로 정의됨.
  - 드라이브의 파일은 AI가 자동 참조하지 않으며 AI 컨텍스트에 포함해야 작업근거로 사용됨.
  - 스킬은 AI가 따르는 업무 절차로 정의됨.
  - AI 생성 결과는 사용자 검토를 전제로 하며 최종 판단은 사람이 수행함.
- **[S2] 전자정부법 제57조**, 시행 2026.08.28.
  - 대통령령상 기준에 해당하는 정보시스템은 등록 감리법인의 감리를 받도록 규정.
- **[S3] 전자정부법 시행령 제71조·제72조**, 시행 2026.08.28.
  - 감리대상 기준과 감리법인의 업무범위를 규정.
  - 제72조는 사업수행계획의 계약내용 반영, 일정·산출물 작성계획, 요구사항 설계 반영, 과업 이행, 관련 법령·규정·지침 준수 등을 감리업무 범위로 규정.
- **[S4] 정보시스템 감리기준**, 행정안전부고시 제2024-53호, 시행 2024.06.27.
  - 감리 업무범위, 절차, 감리원 배치·자격·교육 등 규정.
- **[S5] 전자정부사업관리 위탁(PMO) 도입·운영가이드 2.1**, NIA, 2021.04.05.
  - 발주기관과 PMO의 역할을 구분하고 PMO와 상주감리 개념을 구체화.
- **[S6] 소프트웨어사업 계약 및 관리감독에 관한 지침**, 과학기술정보통신부 고시.
  - 소프트웨어사업 발주·계약·과업관리·관리감독 관련 기준.

> **적용 유의:** 본 문서세트는 기획·연구개발 초안이다. 실제 사업 적용 시 최신 법령·고시·계약조건·기관 내부규정·보안정책 및 감리대상 여부를 재확인해야 한다.