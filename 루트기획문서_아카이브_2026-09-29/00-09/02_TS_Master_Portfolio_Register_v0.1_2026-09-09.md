---
title: "TS Master Opportunity Portfolio Register — 초안 v0.1"
version: "v0.1 (초안)"
date: "2026-09-09"
status: "초안. 사용자(Solution Coordinator)·PM 검토 전. project_context.js에 반영하려면 병행작업 Lock 필요(00_TS_신규사업_기획지침 §8.3 item 4). 2026-09-09 저녁 갱신: N-05~09 최종 병합/정정 결과 반영 완료"
근거: "26_TS_Opportunity_Portfolio·Domain_Expansion·Investment_Prioritization지침.md §4 필수필드 + 00_TS_신규사업_기획지침_v0.1 §3(OPP-01~15 재심사)·§4(N-01~N-08) + project_context.js OPP-01~15 원본(읽기전용, 566~804행)"
last_updated: "2026-09-10"
---

# TS Master Opportunity Portfolio Register — 초안 v0.1

## 0. 문서 통제

이 문서는 26단계 지침 §4(Master Opportunity Portfolio) 필수필드에 따라 OPP-01~15(project_context.js)와 N-01~N-08(00_TS_신규사업_기획지침)을 하나의 Register로 통합한 **초안**이다.

**중요한 한계**: 26단계 지침은 이 Register가 `Master`로서 project_context.js와 통합되어야 한다고 규정하지만(§17 "16~25단계 ID와 Maturity가 하나의 Master에 연결됐다"), 00_TS_신규사업_기획지침 §8.3 item 4가 이미 명시한 대로 **project_context.js 직접 수정은 병행작업 보드 Lock이 필요**해 이번 초안에서는 하지 않았다. 이 파일은 별도 참조 문서이며, project_context.js에 실제 반영할지·어떻게 반영할지는 사용자·PM이 결정한다.

**Maturity(P0~P10) 판정에 대한 주의**: 아래 Maturity 값은 project_context.js의 `stage`(S1~S5, 별도 체계) 필드를 그대로 옮긴 것이 아니라, 각 항목의 `stageBasis`·`status`·`decisions` 텍스트를 근거로 **Claude Code가 26단계의 P0~P10 Funnel에 맞춰 독립적으로 재판정**한 것이다. 26단계 지침(§15 Portfolio Review)이 요구하는 정식 Gate Review를 거친 것이 아니므로 전부 **PENDING_CONFIRMATION**이며, Solution Coordinator 확인 전까지 참고용이다.

**Sponsor·Budget·Procurement·Resource·Aging(날짜)·누적 공수**: 이번 초안에서는 근거 자료가 없어 전부 **UNKNOWN**으로 남겼다. §5에 별도 정리했다 — PM이 채워야 완결된다. **2026-09-14 확인(CONFIRMED)**: project_context.js의 OPP-01~15 전 항목을 전수 확인한 결과, 이 5개 필드는 "확인 못해서 UNKNOWN"이 아니라 **원본 스키마 자체에 해당 key가 존재하지 않는다**(OPP 객체는 id/name/lane/stage/stageBasis/track/problem/proposal/deliveryBoundary/gates/decisions/status/sources 12개 필드로 고정). 즉 UNKNOWN 처리 자체는 정확했으나, PM이 이 필드들을 채우려면 기존 project_context.js를 조회하는 것이 아니라 **신규 필드를 추가**해야 한다는 뜻이다.

**문서 최신성(2026-09-10 최종 갱신)**: §1~7 전체가 N-10~14와 T2 트랙(06번 문서)까지 반영 완료됐다 — N-10~14는 §1(표)·§2(Dashboard)·§3(AX Alignment)·§4(Pattern Matrix)·§6(Investment Priority, SHAPE 이상인 N-11·N-13만)·§7(Wave)에 편입됐고, T2 3건(자동차검사 cyberts.kr·국가자격시험 통합·TMACS 위험예측 AI — 셋 다 아직 착수대상 아님, 1군·2군 실적 선행 필요)은 이 Register의 P0~P10 개별심사 체계와 스케일이 달라(예타급) §7 Wave 6(신규)로 별도 배치했다. 07번(PAT-ADJUDICATE 4대 심판기관+5클러스터)·08/09번(컨셉카드 INVEST-tier 19건 심층검증) 문서는 이 Register의 OPP/N 체계 밖(컨셉카드 카탈로그 트랙)이라 편입 대상이 아니다 — 컨셉카드 카탈로그(`C_컨셉카드_전체목록`, C-001~1115)는 이 Register와 별도 트랙으로 유지, INVEST 등급 19건만 심층검증 완료·나머지 1096건은 미검증 1차 판정 수준임을 참고할 것.

---

## 1. Master Opportunity Portfolio

| ID | 이름 | Lane | Track | Maturity(P, 잠정) | Decision | TS AX Alignment | Evidence 상태 |
|---|---|---|---|:-:|---|:-:|---|
| OPP-01 | 상담콜 품질 전수검사 AI | OPPORTUNITY | MINWON | P4(SOLUTION FIT), 다음 Gate P5는 PoC 시험데이터 수급 후 | SHAPE(재구성 — 태도평가 요소 분리) | AX-P(④업무혁신·효율화 가능성 높음) | PENDING_CONFIRMATION |
| OPP-02 | 상담 Knowledge Hub | OPPORTUNITY | MINWON | P2(QUALIFIED OPP) | INCUBATE | AX-P(③대국민 서비스 고도화) | PENDING_CONFIRMATION |
| OPP-03 | 법령 Ontology·KG 근거추론 | OPPORTUNITY | COMMON | P4(SOLUTION FIT), 착수 BLOCKED(세팅주체 미확정) | R&D(상향 후보) | AX-P(①거버넌스+③대국민 서비스) | PENDING_CONFIRMATION |
| OPP-04 | 특수검사(튜닝승인) 도면대사 | (별도사업) | 별도사업 | 별도 트랙 — 제안 마감(2026-09-02) 완료, Portfolio Funnel 부적합 가능 | INCUBATE(프레임 전환, PM이 본 Portfolio 편입 여부 재확인) | AX-P(②국민안전) | PM 확인 필요 |
| OPP-05 | 직무특화 어시스턴트 수평전개 | OPPORTUNITY | COMMON | P1(PROBLEM) | HOLD | AX-U | PENDING_CONFIRMATION |
| OPP-06 | 전세버스 공시 Rule Engine 수평전개 | OPPORTUNITY | BUS | P1~P2(Readiness R1) | INVEST(후보, 상향) | AX-P(③) | N-03 기획카드로 일부 보강됨 |
| OPP-07 | Domain Pack·Skill/Tool Catalog | INTERNAL | CCK | N/A(Capability/Product 트랙, P-Funnel 부적합) | PRODUCTIZE | — (CCK Internal) | — |
| OPP-08 | 실시간 상담지원 AI | OPPORTUNITY | MINWON | P1(PROBLEM, 의도적 보류) | HOLD | AX-U | — |
| OPP-09 | 질의표현 편차 회귀검증 | OPPORTUNITY | MINWON | P2(QUALIFIED OPP) | INCUBATE(상향) | AX-P(③) | PENDING_CONFIRMATION |
| OPP-10 | 망분리 반입 절차 표준화 | OPPORTUNITY | COMMON | P1~P2, 보안정책 종속 | ARCHIVE(Opportunity에서 제외, 인프라 Backlog로 이관) | AX-N | — |
| OPP-11 | 상담사 평가문항 자동출제 | OPPORTUNITY | MINWON | P1(PROBLEM) | ARCHIVE(자산은 파이프라인 국가자격시험 AI로 이전) | AX-U | Hard Gate 후보(G2) |
| OPP-12 | 조직 지식자산화 | OPPORTUNITY | COMMON | N/A(운영정책 과제, 기술과제 아님) | ARCHIVE(신규사업 후보 제외) | — | — |
| OPP-13 | 상담이력 기재 정확성 점검 | OPPORTUNITY | MINWON | P1~P2 | HOLD | AX-U | — |
| OPP-14 | 후처리시간 이상탐지 | OPPORTUNITY | MINWON | P1 | HOLD | AX-N | — |
| OPP-15 | 콜 모수·지표 표준정의 | OPPORTUNITY | MINWON | N/A(선행과제 트랙, Use Case 계수 여부 PM 판정) | (해당없음 — 타 OPP의 전제조건) | — | — |
| N-01 | 고령운전자 안전 AI | OPPORTUNITY | 신규(메가이슈발) | P1(PROBLEM, 기획카드 완료) | INCUBATE 후보 | AX-C(②국민안전 직접) | 법령·통계 CONFIRMED, 확장경로(G5) 하향 — 국토부 자체 개편안과 중복 정리 필요 |
| N-02 | 이륜차·배달 안전 AI | OPPORTUNITY | 신규 | P1(PROBLEM, 기획카드 완료) | INCUBATE 후보 | AX-C(②) | 검사업무 CONFIRMED, 배달안전교육은 비법정(시범사업), 확장경로(G5) 하향 |
| N-03 | 사업용 차량 안전공시 국민공개 | OPPORTUNITY | BUS(Delivery 자산 위) | **P1(PROBLEM, 기획카드 v0.1 완료) → 기획서·근거패키지 v0.1 완료(2026-09-15)** | SHAPE(INVEST 승격은 기획서 §8-2 Phase 0 (a)(b) 해소 후) | AX-C(②③) | 기획카드로 상세 근거 확보, 통계 일부 PENDING_CONFIRMATION. 기획서: `N-03_사업용차량_안전공시_국민공개_기획서_v0.1_2026-09-15.md` — 1군 중 INVEST 승격에 가장 가까움 |
| N-04 | 전기차·배터리 안전 이력 AI | OPPORTUNITY | 신규(정부합동대책 참여) | **P2(QUALIFIED OPP, N-01~04 중 최상)** | **SHAPE(상향)** | AX-C(②) | 법령·확장기관(소방청·산업통상부·기후에너지환경부) 전부 CONFIRMED — 2024.9.6 정부합동대책에 TS 명시 포함 |
| N-05 | 대국민 교통민원 통합 AI 창구 | OPPORTUNITY | MINWON(Delivery 자산 위) | P1(PROBLEM, 기획카드 완료·병합) → 기획서·근거패키지 v0.1 완료(2026-09-15, `N-05_대국민교통민원통합AI창구_기획서_v0.1_2026-09-15.md`; 공단법 §6 근거 호 확정이 선결과제, 미해소 시 권익위 공통기반 편입 대안) | **SHAPE(범위 한정)** | AX-C(③, TS AX 26과제 3개 중 1개와 정합) | 두 세션 리서치 병합 완료. "TS가 범정부 통합 주체가 된다"는 프레이밍은 국민권익위 110·AI신문고와 경쟁하므로 금지 — 범위를 "TS 콜센터·신문고 자체 AX 고도화(Delivery SFR-006/007 확장)"로 한정하는 조건부 SHAPE |
| N-06 | 국가자격시험 AI 출제·검정 공통기반 | OPPORTUNITY(→파이프라인 INVEST 진행중) | 신규 | P1(PROBLEM, 기획카드 완료·3세션 병합) → 확장후속 기획서 v0.1 완료(2026-09-15, `N-06_국가자격시험AI출제검정_확장후속_기획서_v0.1_2026-09-15.md`) | ~~SHAPE 후보(파이프라인과 통합 확인 필요)~~ → 2층 분리: 기반사업(2.5억)=PRESALES 트랙 / 확장후속=**INCUBATE**(기반사업 완료 2026-12-20 후 실적 근거로 재상정; 기획서 §8-2(b) 실적지표 사전합의가 핵심 요청) | AX-C(TS AX 26과제 3개 중 1개와 정합) | **긴급**: 사전규격이 아니라 이미 정식 입찰공고(2026-09-07 게시, 입찰 09-16~18, 개찰 09-23) — 일정 확인 시급. 위탁근거 CONFIRMED, RFP 자체가 "타기관 공동활용 계획 없음" 명시(G5 하향), 확장기관 5곳 모두 메커니즘은 확인되나 AI도입 실적은 산업인력공단 외 미확정 |
| N-07 | 인허가·심사 서류 AI 심사 공통기반 | OPPORTUNITY(→파이프라인 INVEST 진행중) | 신규 | P1(PROBLEM, 기획카드 완료) | **INCUBATE(하향, SHAPE→)** | AX-C | 삭도·궤도 근거 "안전관리계획"→"안전검사 §19"로 정정 완료. **NIA 범정부 Agent(18억)는 재검증 결과 대상이 취업심사·재해보상심사(인사행정)로 TS의 물건·시설 검사 4개 업무와 무관함이 확인돼 G5·시급성 논리 소멸** — 남은 확장근거는 식약처·지식재산처·조달청·KFI 4곳(메커니즘만, 실적 약함) |
| N-08 | 공공 AI PMS(이행관리·산출물검토) | OPPORTUNITY / CCK Internal | 신규(TS 내부+범정부 갈림) | P0(SIGNAL, 기획카드 완료) | **(A)내부활용안 INCUBATE(즉시 착수) / (B)범정부제안안 R&D — KEEP SEPARATE(§8.1, 2026-09-10 1차 검토)** | AX-P(①④) | 2갈래 분리 확정. (A)는 Delivery RFP 72건 실증데이터로 즉시 착수 가능, MERGE 논의와 무관. (B)는 카드 단위 병합은 기각, 엔진(구현) 층위 공유 가능성만 별도 기술검토로 이관(§8.1). **[각주, 2026-09-16]** (B)는 이후 N-08B(NoA Public AI-PMS/Continuous Public Assurance, CCK 제품 R&D·3개년 로드맵, TS 1차 실증기관)로 구체화됨 — 상세·G1~G7 재판정은 `N-08B_00_종합평가_G1-G7_정합성_v0.1_2026-09-16.md` 참조 |
| N-09 | 법령-위탁업무 정합성 자동진단 AI(가칭) | OPPORTUNITY / CCK Internal | 신규(TS·CCK 자체기획 인프라) | P0(SIGNAL, 기획카드 완료) | R&D 후보 — KEEP SEPARATE(§8.1), 독립 SHAPE 승격은 OPP-03 검토 후 재논의 | AX-P(①거버넌스) | 오늘 세션 자체가 실증사례(N-01~07에서 4건 오류 직접 발견). **오늘 만든 항목 중 G1(대외우선) 최약** — 1차 사용자가 TS·CCK 자신을 포함한 내부 기획담당자. 반대로 G5·G6은 최상급(기관 데이터 의존 없이 재사용). N-08과의 2자 MERGE 프레이밍은 부정확 확인됨 — 카드 본문상 OPP-03 포함 3자 구도가 맞음(§8.1) |
| N-10 | 철도안전관리체계 정기검사 문서심사 지원 AI | OPPORTUNITY | 신규(철도) | P1(PROBLEM, 기획카드 완료) | INCUBATE | AX-C(②국민안전) | 철도안전법§7·8+시행령§77 CONFIRMED, 사고·장애 866건·사망100명(2021~2025.6). TS가 업무·데이터는 이미 보유하나 문서심사 SI가 없는 그린필드 |
| N-11 | 삭도(케이블카) 와이어로프·구동계 실시간 이상감지 AI | OPPORTUNITY | 신규(삭도) | P1(PROBLEM, 기획카드 완료) | SHAPE | AX-C(②) | 궤도운송법§19·20 INFERRED. **경북도·KIRO가 유사 로봇검사시스템을 2025-11 완성**(TS 검사결과와 100%일치 검증) — 중복성 리스크, 역할분담 재설계 필요 |
| N-12 | 운수종사자 근로시간·과로/졸음운전 AI 조기경보 | OPPORTUNITY | 신규(운수종사자) | P1(PROBLEM, 기획카드 완료) | INCUBATE | AX-C(②) | 교통안전법§55 DTG위탁 CONFIRMED. 기존 ETAS+AI관제 시범사업(사고율 55.5%↓ 실증) 위 고도화 — 착수준비도 높음 |
| N-13 | 스쿨존 사고데이터 연계 맞춤형 체험교육 설계 AI | OPPORTUNITY | 신규(교육) | P1(PROBLEM, 기획카드 완료) | ~~SHAPE~~ → **HOLD(2026-09-15 재검증, 하향)** | AX-C(②③) | **#59(04번, TS✗)와의 상충 해소**: 교통안전법§56① 원문 재확인 결과 "운전·운행하는 자"로 명시 한정, TS 화성센터 실제 운영대상도 전부 운전자(어린이 프로그램 미확인) — G6 CONFIRMED로 실패. "어린이 교통안전체험관"은 KoROAD 별도 운영. 메가이슈(76.2%↑)는 강하나 현 스코프로는 착수 불가 — KoROAD 협력모델로 재구성해야 재개 가능 |
| N-14 | TS 데이터개방센터 AI 데이터 큐레이터 | OPPORTUNITY / CCK Internal | 신규(데이터) | P1(PROBLEM, 기획카드 완료) | INCUBATE | AX-P(①④) | 공단법§6⑩+공공데이터법 CONFIRMED. 기존 데이터개방센터+AI디지털본부 자산 위 고도화. 감사원 2025-08 1.6조 AI학습데이터 부실 감사가 반면교사 근거 |

## 2. Maturity·Decision·Aging Dashboard

| Decision | 해당 항목 | 개수 |
|---|---|:-:|
| INVEST(후보) | OPP-06 | 1 |
| SHAPE / SHAPE 후보 | OPP-01, N-03, N-04, N-05, N-11 (~~N-06, N-13~~ — 2026-09-15: N-06 확장후속은 INCUBATE로, N-13은 HOLD로 이동) | 5 |
| INCUBATE / INCUBATE 후보 | OPP-02, OPP-04, OPP-09, N-01, N-02, N-06(확장후속), N-07, N-08(A), N-10, N-12, N-14 | 11 |
| R&D / R&D 후보 | OPP-03, N-08(B), N-09 | 3(N-08(B)·N-09 카드 병합은 §8.1에서 기각 — KEEP SEPARATE, OPP-03은 §8.2에서 별개 레이어로 확인돼 MERGE 검토 대상에서 제외) |
| PRODUCTIZE | OPP-07 | 1 |
| HOLD | OPP-05, OPP-08, OPP-13, OPP-14, N-13(2026-09-15 SHAPE→HOLD, #59 상충 판정) | 5 |
| ARCHIVE | OPP-10, OPP-11, OPP-12 | 3 |
| 해당없음(선행과제) | OPP-15 | 1 |

**2026-09-09 저녁 갱신**: N-05는 병합 리서치로 SHAPE(범위 한정) 복귀, N-06은 이미 정식 입찰공고 단계임이 확인돼 시급성 상향(단 G5는 RFP 원문상 하향), N-07은 NIA 근거 소멸로 SHAPE→INCUBATE 하향, N-08은 내부/범정부 2갈래로 분리(전자 INCUBATE·후자 R&D), N-09 신규 추가(R&D 후보, N-08과 MERGE 검토).

**2026-09-10 갱신**: N-08·N-09 MERGE 검토 1차 완료(§8.1) — 카드 단위 KEEP SEPARATE, N-08(A) 즉시 INCUBATE 착수 확정, N-08(B)·N-09 엔진 공유는 별도 기술검토로 이관. 기존 "N-08·N-09 2자 MERGE" 프레이밍은 N-09 카드 원문상 부정확함이 확인돼 "OPP-03·N-08(B)·N-09 3자"로 정정 — OPP-03 원문 확보가 후속 선결과제. 컨셉카드 배치4(5차) 완료로 C_컨셉카드_전체목록이 C-001~C-1115로 최종 확정(3차 배치 실패 8개 클러스터 전량 회수).

**2026-09-10 갱신(§2~7 전면 반영)**: N-10~14를 §2~4·§7에 편입했다(§1은 이미 반영됨). §8.2에서 OPP-03을 3자 MERGE 구도에서 제외 확정 — R&D 행의 "3건" 표기는 이제 "N-08(B)·N-09 KEEP SEPARATE + OPP-03은 별개 레이어"로 읽을 것(사용자 에스컬레이션 대상은 §8.2 참조). T2(대형전환) 트랙 3건은 이 Register의 P0~P10/OPP·N 체계와 스케일이 달라(예타급) §7 Wave에만 배치하고 §1·§6 개별표에는 넣지 않았다 — 상세는 [06_T2_대형전환_후보_프로파일](06_T2_대형전환_후보_프로파일_v0.1_2026-09-09.md) 참조.

Aging(NORMAL/AGING/STALLED/DORMANT)은 각 항목의 "다음 결정일"이 없어 판정 불가 — **전부 UNKNOWN**. project_context.js에 `status` 갱신일 필드가 없어 계산 기준을 잡을 수 없었다. PM이 각 항목의 최종 갱신일과 다음 검토 예정일을 지정하면 이후 세션에서 자동 산정 가능하다.

## 3. TS AX Alignment 현황

00_TS_신규사업_기획지침 §1.2(P0 리서치 반영)에 따라 4대 전략방향은 CONFIRMED됐으나, 세부 26개 과제 중 3개만 실명 확인된 상태다. 따라서 이 표의 `AX-C`(직접확인)는 **"4대 전략방향 중 하나와 명백히 부합"**을 뜻하며, 26개 세부 과제 목록과 1:1 매핑된 것은 아니다(26단계 §5 원칙 "AX Task = TBD" 유지).

- AX-C(직접확인): N-01, N-02, N-03, N-04, N-05, N-06, N-07, N-10, N-11, N-12, N-13
- AX-P(높은 가능성): OPP-01, OPP-02, OPP-03, OPP-06, OPP-09, N-08, N-09, N-14
- AX-U(미확인): OPP-05, OPP-08, OPP-11, OPP-13
- AX-N(직접연계 낮음): OPP-10, OPP-14

## 4. Domain × Problem Pattern Matrix

| Pattern | 해당 항목 |
|---|---|
| PAT-SEARCH | OPP-03(법령 근거검색), N-14(데이터 카탈로그·메타데이터 큐레이션) |
| PAT-REVIEW | OPP-01(콜 품질검토), OPP-13(상담이력 대조), N-03(공시 제출자료 검토), N-07(인허가 서류 심사), N-10(철도안전관리체계 정기검사 문서심사) |
| PAT-JUDGE | N-07(적부 판정), OPP-04(도면-재원표 정합판정) |
| PAT-QA | OPP-09(답변 일관성 회귀검증), N-06(자격시험 문항 품질관리) |
| PAT-MONITOR | OPP-14(후처리시간 이상탐지), N-01(고령운전자 자격유지 모니터링 가설), N-11(삭도 와이어로프·구동계 상시 이상감지), N-12(운수종사자 근로시간·졸음운전 조기경보) |
| PAT-REPORT | OPP-02(지식 현행화), N-03(공시 분석보고서, SFR-009) |
| PAT-AGENT | N-05(통합 민원창구), N-08(PMS 조치요청 추적) |
| PAT-MANDATE(신규, 가칭) | N-09(법령-위탁업무 정합성 진단) — 01번·02번 문서의 8개 Skill Catalog에 없던 9번째 패턴 후보. PAT-SEARCH(법령 근거검색)+PAT-MONITOR(상시 이상탐지)의 결합형 |
| 미분류(교육형) | N-13(스쿨존 맞춤형 체험교육 설계) — 기존 9개 패턴 어디에도 정확히 맞지 않음. 사고데이터 분석(PAT-MONITOR 인접)+교육콘텐츠 설계(신규 영역)의 결합이라 컨셉카드 카탈로그의 "교육형(비-IT프로젝트)" AX유형과 정합 |

**Hotspot 관찰**: PAT-REVIEW가 5건(OPP-01·13, N-03·07·10)으로 가장 밀집 — "제출·기록된 자료를 규칙+AI로 대조해 이상을 찾는다"는 동일 구조가 콜 품질·상담이력·공시서류·인허가서류·철도문서심사 5개 도메인에서 반복된다. 26단계 §6 원칙("개별 시스템 수보다 공통 Skill·Tool로 MERGE 가능성 우선")에 따라 **PAT-REVIEW 공통 엔진 후보**로 별도 검토할 가치가 있다. N-08·N-09는 둘 다 "문서/조항 대조로 이상·공백을 찾는다"는 점에서 PAT-REVIEW·PAT-MANDATE 계열과 유사 구조 — MERGE 검토 시 이 관찰도 함께 고려할 것. **N-10~14 편입 후 신규 관찰**: PAT-MONITOR가 2건→4건(N-11·N-12 추가)으로 급증 — 둘 다 "센서·운행기록 등 구조화 데이터의 실시간 임계치 이상탐지"라는 동일 구조이고, C-1 제약(비전AI 배제)을 둘 다 준수하도록 설계돼 있어 **PAT-MONITOR 공통 엔진(구조화데이터 이상탐지 Rule/AI 하이브리드)** 후보로도 검토할 가치가 있다.

## 5. Capability Investment 후보 (Hotspot)

| Capability | 필요로 하는 항목 | 재사용 관찰 |
|---|---|---|
| CAP-OCR | OPP-04(도면), N-03(전세버스 증빙서류), N-07(인허가 서류) | 3건 — 비정형 문서 항목추출 공통 수요 |
| CAP-STT | OPP-01, OPP-08, OPP-13 | 3건 — 이미 OPP-01에서 Stack B(faster-whisper 등) 검증 중, 재사용 가능 |
| CAP-ONTOLOGY | OPP-03 | 1건, 단 N-06·N-08의 법령 매핑에도 잠재 수요 |
| CAP-HITL | 거의 모든 OPP·N (예외 없음) | 26단계 §4 필수 원칙과 정합 — 별도 신규 투자라기보다 전사 표준 패턴 |
| CAP-EVAL | OPP-09(회귀검증), N-06(자격시험 품질관리) | 2건 |
| CAP-REPORT | OPP-02, N-03(SFR-009) | 2건 |
| CAP-MCP/AGENT | N-05, N-08 | 2건, 아직 초기 |

**Capability Card는 이번 초안에서 생략** — CAP별 Current A-Level·Gap·Owner·Resource는 CCK 기술/AI PL의 판단이 필요해 Claude Code가 임의로 채우지 않았다(26단계 §13). 필요 시 후속 세션에서 기술 PL 인터뷰 후 작성 권고.

## 6. Investment Priority Profile (정성 프로파일, I1~I7)

100점 Screening 대신 §9 원칙에 따라 **정성 프로파일(높음/중간/낮음)**만 제공한다. 대상은 Decision이 SHAPE 이상인 항목(INVEST·SHAPE·R&D)으로 한정했다 — HOLD·ARCHIVE·미확정 항목까지 스코어링하는 것은 실익이 낮다고 판단했다.

| ID | I1 TS Value | I2 Evidence | I3 AX정합 | I4 CCK Reuse | I5 Scale | I6 Sponsor/조달 | I7 Feasibility |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| OPP-01 | 높음 | 중간(설계완료·PoC데이터 대기) | 높음 | 높음(STT Stack 재사용) | 중간 | 낮음(RFP 무근거) | 중간 |
| OPP-03 | 중간 | 높음(5종 설계문서) | 높음 | 매우높음(전사 근거엔진) | 높음 | 낮음(세팅주체 미확정) | 낮음(BLOCKED) |
| OPP-06 | 중간 | 낮음(R1) | 중간 | 높음(Rule 이력관리 재사용) | 높음 | 중간(SFR-008 위) | 중간 |
| N-03 | 높음(사고통계 확보) | 중간(기획카드 완료, 통계 일부 미확정) | 높음 | 높음(OPP-06과 결합) | 중간(메커니즘 확장만 확인) | 중간(Delivery 자산 위) | 높음(SFR-008 이미 개발중) |
| N-04 | 높음(등록·리콜 급증) | 높음(법령·확장기관 전부 CONFIRMED) | 높음 | 높음(KADIS 재사용) | 높음(2024.9.6 정부합동대책 참여) | 중간(공식 지정고시만 미확보) | 높음(KADIS 기존자산) |
| N-06 | 중간(응시자 한정) | 높음(입찰공고 원문 직접 파싱 — CONFIRMED 상향) | 높음(AX26과제 정합) | 중간(문제은행+CBT 기존자산) | 낮음(RFP상 "타기관 공동활용 계획 없음" 명시 — G5 재하향) | 높음(9/16~18 입찰, 9/23 개찰 — 일정 확정) | 중간 |
| N-07 | 낮음(하향 — NIA 무관 확인으로 확장근거 약화) | 중간(3개업무 CONFIRMED, 삭도궤도 §19로 정정 완료) | 높음 | 중간 | 낮음(NIA 제외 후 4곳 메커니즘만) | 높음(8억 제안 진행중) | 중간 |
| N-08(A 내부) | 중간(TS 자체) | 높음(Delivery RFP 72건 실증데이터 존재) | — (내부활용, AX 정합 무관) | 높음 | — (내부활용, 확장 무관) | 높음(Sponsor=TS 자신) | 높음(즉시 착수 가능) |
| N-05 | 높음(국민 직접 접점, 범위 한정 조건부) | 중간(병합 리서치로 상향, 법령근거는 여전히 약함) | 높음(AX26과제 정합) | 높음(SFR-006/007 재사용) | 낮음(권익위 110·AI신문고와 중복위험, 참여자 편입 여부 미확인) | 중간(Delivery 자산 위) | 높음(기존 Delivery 인프라) |
| N-11 | 높음(탑승객 안전 직결) | 낮음(궤도운송법 위탁조항 INFERRED, 국내 삭도사고 공식통계 미확보) | 중간(②국민안전) | 낮음(경북도·KIRO 로봇 자산과 역할분담 재설계 필요 — 기존 CCK 자산 재사용 아님) | 중간(전국 삭도 시설 대상이나 모수 자체가 크지 않음) | 낮음(스폰서·예산 채널 미확인) | 낮음(KIRO 컨소시엄과의 중복성 리스크가 착수 전 선결과제) |
| N-13 | 높음(스쿨존 어린이 안전, 최상급 메가이슈) | 중간(공단법§6① CONFIRMED이나 스쿨존 특화 조항은 없어 해석 확장) | 높음(②③) | 낮음(TS 자체 사고데이터 자산 없음 — KoROAD·경찰청 신규 연계 필요) | 높음(전국 스쿨존 대상) | 낮음(스폰서·예산 채널 미확인, 기관간 MOU 선행) | 낮음(데이터 확보방안이 착수 전 선결과제) |

*N-08(B 범정부)·N-09는 R&D/MERGE 검토 단계라 이 표(SHAPE 이상 대상)에서 제외했다 — §9 원칙. N-10·N-12·N-14(INCUBATE)도 같은 기준으로 제외 — §2 참조.*

## 7. Domain Expansion Wave 배치 (초안)

| Wave | 항목 |
|---|---|
| 1 Proven Reuse | OPP-01의 STT Stack(faster-whisper 등) → N-03·N-05 등 타 도메인에 즉시 재사용 후보. N-12는 기존 ETAS+AI관제 시범사업(사고율 55.5%↓ 실증완료) 위 고도화라 이 Wave에 해당 |
| 2 Adjacent Domain | OPP-06 Rule Engine → N-03(전세버스 공시) — 이미 결합 설계됨(00_TS_문서 §4.2 N-03 행). N-10(철도문서심사)도 TS가 이미 검사업무·이력데이터를 보유한 인접 그린필드 |
| 3 Shared Capability | PAT-REVIEW 공통 엔진(§4 Hotspot, N-10 포함 5건), PAT-MONITOR 공통 엔진(N-11·N-12, §4 신규 관찰), CAP-OCR 공통화(OPP-04·N-03·N-07) |
| 4 Enterprise Scale | N-08(공공 AI PMS)의 TS 내부 활용 — TS 전체 정보화사업 이행관리로 확대 시. N-14(데이터 큐레이터)도 기존 데이터개방센터+AI디지털본부 자산 위 전사 확대형 |
| 5 External Product | N-06(범정부 자격시험 공통기반, 단 이번 RFP는 확장 계획 없음 명시), N-07(식약처·지식재산처·조달청·KFI 패턴 — NIA는 제외), N-08(B)(범정부 제안안), N-09(MERGE 검토 후 결정). N-11(삭도)은 경북도·KIRO와 역할분담 재설계 후 이 Wave 재검토 후보, N-13(스쿨존)은 KoROAD·경찰청·교육부 3개 기관 연계 확보가 선행조건 |
| 6 T2 Large Transformation(신규, 예타급) | [06_T2_대형전환_후보_프로파일](06_T2_대형전환_후보_프로파일_v0.1_2026-09-09.md) 3건(자동차검사 cyberts.kr 전면전환·국가자격시험 도로+철도+항공 통합·TMACS 위험예측 AI 내재화) — 이 Register의 P0~P10 개별심사 대상이 아니라 03번 문서 §4.2의 3군(T2) 배치규칙을 그대로 따른다. 셋 다 1군·2군 실적이 먼저 나와야 착수 가능(§0 참조) |

**03번 문서(§5.2 착수 사다리) 연동**: 1군(효율 최고) = N-06·N-03·N-05, 2군(파급력 상향) = 검사본부 8억→N-07·N-04, 3군(대형전환·R&D) = N-04 중심 TS관점 R&D·OPP-03 + Wave 6의 T2 후보 3건. N-08(A)·N-09는 내부 트랙(G2 통과가 착수 조건, 순위 사다리와 별도). N-10~14는 사다리 배치 전 단계 — 각각 착수준비도(N-10·N-12·N-14 높음, N-11·N-13 선행조건 있음)에 따라 다음 사다리 갱신 시 1~2군 후보로 편입 검토. **[각주, 2026-09-16]** N-08(B)가 구체화된 N-08B는 3군에 **3-4(신설 슬롯)**로 추가 제안됨 — TS 실적 축적이 선행조건인 3-1~3-3과 달리 AX실증밸리 관계 확인이 선행조건이었으나 신청 보류로 정리됨(03번 문서 §5.2, N-08B_00 §4~§5 참조).

## 8. 다음 행동 — 이 Register를 완결하기 위해 필요한 것

| 순서 | 행동 | 담당 | 비고 |
|:-:|---|---|---|
| 1 | 위 Maturity(P) 판정을 정식 Gate Review로 검증 | Solution Coordinator | 26단계 §15 Portfolio Review 절차 |
| 2 | Sponsor·Budget·Procurement·Resource·Aging 필드 입력 | PM | 이번 초안은 전부 UNKNOWN |
| 3 | project_context.js에 반영할지, 반영한다면 어떤 필드부터 할지 결정 | 사용자·PM | 병행작업 Lock 필요(00_TS_문서 §8.3 item 4) |
| 4 | Capability Card(CAP별 A-Level·Gap·Owner) 작성 | CCK 기술/AI PL | §5에서 Hotspot만 제시, Card는 생략 |
| 5 | OPP-04·N-06·N-07이 이미 진행 중인 파이프라인(검사본부 AI 8억, 자격시험 AI 2.5억)과 이 Portfolio의 중복 여부 정리 | PM | 같은 항목이 두 체계에 따로 존재할 위험 |
| 6 | N-06 입찰(09-16~18)·개찰(09-23) 결과 확인 및 CCK 참여 여부 파악 | 사용자 | **긴급** — 03_R&D기반_사업기획_기조_재정립 §6.3 |
| 7 | ~~N-08·N-09 통합(MERGE) 여부 결정~~ → **2026-09-10 2차 검토(§8.2)까지 완료** | 사용자(최종 승인·에스컬레이션 대기) | N-08(B)·N-09는 신규사업 카드 레벨 KEEP SEPARATE. OPP-03은 애초에 다른 레이어(Delivery 품질보조 Capability)로 확인돼 병합검토 대상에서 제외 — 대신 **세팅 주체 결정(TS-AI-ISS-019, CCK세팅 vs TS DB직접구축)을 사용자에게 별도 에스컬레이션**해야 SFR-003·007 근거제시 품질 개선이 풀림 |

## 8.1 N-08·N-09 MERGE 결정 (2026-09-10 재검토)

**방법**: 병합 찬성/반대 논증을 각각 독립적으로 생성한 뒤(어느 쪽도 상대 논증을 보지 못한 상태), 제3의 검증 에이전트가 두 논증을 N-08·N-09·02번 Register 원문과 대조해 사실관계를 재확인하고 종합했다(어느 논증도 그대로 채택하지 않고 각각의 오류를 확인).

**검증 과정에서 발견된 사실관계 정정**: 기존 §1(대시보드)·§8(N-08·N-09 통합) 표기는 "N-08·N-09 2자 MERGE 검토"로 되어 있었으나, 이는 부정확하다. N-09 카드 자신의 decision·owner_due_next §1(L94-96, L131)은 명시적으로 **"OPP-03·N-08·N-09" 3자** 통합 여부를 요구하고 있다. OPP-03 카드를 함께 검토하지 않은 채 N-08×N-09 2자만으로는 최종 결론을 내릴 수 없다.

> **N-08/N-09 MERGE 결정 (2026-09-10 재검토)**: KEEP SEPARATE을 원칙으로 하되 검토 범위를 정정한다. N-08(A) 내부활용안은 이 판단과 무관하게 즉시 INCUBATE 진행 — decision 필드 자체가 MERGE 대상에서 제외하고 있으며 Delivery RFP 72건 실증데이터를 갖춘 독립 트랙이다. "N-08·N-09 통합"이라는 기존 프레이밍은 부정확하므로 정정 필요 — N-09의 decision·다음행동 §1은 스스로 **OPP-03·N-08(B)·N-09 3자** 통합 여부를 요구하고 있어, OPP-03 카드를 함께 읽지 않은 채 N-08×N-09만으로 결론 내릴 수 없다. N-08(B)·N-09는 owner(외부 카운터파트 존재 여부: N-08 수행사 有/N-09 순수내부, G1○ vs G1△), 증거등급(N-08 CONFIRMED 다수/N-09 UNKNOWN 다수, 외부 시장·경쟁·법적 근거 미조사 자인), 예산채널(N-08(B) NIA 기발주 18억 사업 결합 가능/N-09 미확정이며 스스로 대외 R&D 프레이밍을 경계) 3개 축에서 구조적으로 갈라진다. 서로 다른 증거등급의 항목을 하나의 판정 단위로 합치면 어느 한쪽의 상태가 은폐·왜곡될 위험이 있어(RESEARCH-PRINCIPLES.md 원칙6), 사업기획 카드(owner·예산·decision)는 **별도 유지**한다.
>
> 단, `{규범 텍스트, 실태 텍스트}→불일치 판정`이라는 하부 구조가 형식적으로 동형이라는 관찰(N-08 ax_si_split/hitl_points vs N-09 ax_si_split/hitl_points)은 유효하므로, 이를 **카드 병합이 아니라 구현/Skill-Catalog 층위의 별도 기술 검토**로 낮춰 진행한다. N-09가 자체 제안한 PAT-MANDATE(SKILL-MND-001)는 카드 본문 근거만으로 등재 검토하고, N-08과의 PAT-REVIEW 계보 연결은 01·02번 문서의 PAT-REVIEW 정의 원문 재확인 전까지 확정하지 않는다(현재 PENDING). Next Action: ① OPP-03 카드 원문 확보 후 3자 구도로 범위 재설정, ② N-09 외부 시장·경쟁·법적 근거 리서치 착수, ③ 양쪽 감사원 8/12 원문 1차 재대조 — 이 세 가지가 완료된 후 KEEP SEPARATE/부분병합 최종 확정.

**남은 것**: 위 결론은 이번 세션의 1차 검토이며 사용자 최종 승인이 필요하다. 특히 OPP-03 카드를 아직 이 검토에 포함하지 못했다는 것이 가장 큰 공백이다.

## 8.2 OPP-03 원문 확보 및 3자 구도 재분석 (2026-09-10, §8.1 Next Action ① 이행)

§8.1이 지목한 공백을 메운다 — `project_context.js`(566~804행 범위 밖, 실제 596~610행)에서 OPP-03 원문을 직접 읽었다.

**OPP-03 원문 요약**: "법령 Ontology·Knowledge Graph 기반 근거추론". Stage S5(잠정) — Wording Taxonomy→Ontology→KG Schema→Graph Reasoning Rulebook→LLM Graph Retrieval 5단 설계서·PoC 검증계획서까지 **문서 5종이 이미 완비**됐으나, "법령 Ontology 데이터 세팅 주체"(CCK가 세팅 후 API 제공 vs TS가 DB 직접 세팅, 이슈 TS-AI-ISS-019)가 미확정이라 **착수 자체가 BLOCKED**. RFP 전문에 "온톨로지" 언급 0회 — Delivery 계약범위 완전 밖이며, SFR-003(직무특화 어시스턴트)·SFR-007(민원 근거제시)의 품질을 높이는 **수단(Capability)**으로만 제안된 상태다.

**§8.1과 동일한 3축으로 3자 비교**:

| 축 | N-08(B) 범정부제안안 | N-09 법령정합성진단 | OPP-03 법령Ontology·KG |
|---|---|---|---|
| Owner/외부 카운터파트 | 有(수행사 존재, NIA 결합 가능) | 無(순수내부, G1△) | **無(순수내부, G1은 N-09보다도 약함 — 외부 "사용자" 개념 자체가 없고 SFR-003/007을 위한 내부 인프라 부품)** |
| 증거등급 | CONFIRMED 다수 | UNKNOWN 다수(스스로 자인) | **설계 성숙도는 최고(S5, 문서 5종 완비)이나 "세팅 주체" 결정이라는 조직적 의사결정 하나에 전면 BLOCKED — 기술 증거와 착수 가능성이 괴리된 독특한 패턴** |
| 예산채널 | NIA 기발주 18억 사업 결합 가능 | 미확정, 스스로 대외 R&D 프레이밍 경계 | **없음 — RFP 범위 밖 확인(0회 언급)이라 Delivery 예산과 무관하고, CCK 자체투자 vs TS DB구축비 중 어느 쪽도 확정되지 않음** |

**결론**: OPP-03은 N-08·N-09와 "병합 여부"를 논할 성격이 아니다 — N-08·N-09는 **신규 사업 후보**(대외 mandate·예산을 확보해야 하는 카드)인 반면, OPP-03은 **기존 Delivery(SFR-003·007)의 품질을 높이는 내부 Capability 부품**이다. §1 대시보드가 이를 "3자 MERGE 구도"로 표기한 것 자체가 재구성이 필요하다 — 정확히는 "N-08(B)·N-09는 신규사업 카드 레벨에서 KEEP SEPARATE, OPP-03은 애초에 다른 레이어(Capability)이므로 병합 검토 대상에서 제외하고 **세팅 주체 결정(TS-AI-ISS-019)만 별도로 사용자에게 에스컬레이션**"하는 것이 맞다. §8.1의 "엔진(구현) 층위 공유 가능성" 기술검토와 OPP-03의 KG 구조가 실제로 재사용 가능한지는 확인되지 않았다 — 후속 기술검토 시 OPP-03의 5종 설계서를 입력으로 포함할 것을 권고한다.

## 9. §17 완료조건 자가점검

| 26단계 §17 조건 | 상태 |
|---|:-:|
| 16~25단계 ID와 Maturity가 하나의 Master에 연결됐다 | 부분 — 이 문서에서 연결, project_context.js 자체는 미반영 |
| Maturity와 Decision·Aging이 분리됐다 | 완료(Aging은 UNKNOWN으로 분리는 됐으나 값 없음) |
| 모든 OPP에 TS AX Area와 확인수준이 있다 | 완료 |
| Domain×Pattern, Opportunity×Capability Matrix가 있다 | 완료(§4·§5) |
| 공통 Capability Hotspot과 Domain Pack 후보가 식별됐다 | 완료(§5 Hotspot, §7 Wave) |
| Hard Gate·Value/Readiness·Risk·Capacity가 함께 판정됐다 | 부분 — Hard Gate(OPP-11만 명시), Capacity Map은 미작성 |
| 투자·병합·R&D·제품화·보류 결정과 승인자가 있다 | 부분 — Decision은 있으나 승인자(공식 서명권자)는 없음 |
| Delivery 자원보호와 TS/CCK 자산·보안경계가 유지된다 | 완료(N-08·모든 항목에 HITL·자산경계 명시) |

**미완료 항목(Capacity Map, Capability Card, 공식 승인자)은 의도적으로 비워뒀다** — 근거 없이 채우면 26단계 §1의 원칙("CCK 내부 운영설계이며 공식 평가체계가 아니다")을 벗어나 잘못된 확신을 줄 위험이 있다고 판단했다.
