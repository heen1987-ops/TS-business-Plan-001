# 사례집 아키텍처 원문 대조

확인일: 2026-10-16

## 표시 원칙

1. RFP·과업내용서와 운영기관의 공식 도면을 우선 표시.
2. 공식 Mermaid 원문은 구성요소와 연결을 바꾸지 않고 렌더링하며 원문 링크 제공.
3. 원문에 없는 연결은 `CCK 사례별 재구성`으로 분리. 실제 설치·운영 구성으로 표시 금지.
4. 이미지 모델 재구성은 RFP의 삽입 이미지를 점검하고 서비스 도면을 확인하지 못한 사례에만 표시. 원문 도면과 다른 영역에 배치.

## 확인 결과

| 사례 | 확인한 자료 | 원문 도면 상태 | 홈페이지 처리 |
| --- | --- | --- | --- |
| PF-R01 | HUG 본공고 RFP | 목표 인프라·업무시스템 구성도 1개 | 기존 원문 유지 |
| PF-R02 | NIA 본공고 RFP | 목표시스템·RAG·데이터 흐름 등 4개 | 기존 원문 유지 |
| PF-R03 | 생산기술연구원 RFP | 기존 정보시스템 현황 1개 | 기존 원문 유지, 목표 AI 배치로 오인 금지 |
| PF-R04 | 안전 AI 과업내용서 | H/W·S/W 구성 예시 2개 | 기존 원문 유지 |
| PF-R05 | 홈페이지 AI RFP | 목표기능·서비스 아키텍처 2개 | 기존 원문 유지 |
| PF-R06 | 철도기술연구원 RFP | 기존 업무시스템 구성 1개 | 기존 원문 유지, 신규 음성 AI 배치와 구분 |
| PF-R07 | KISA 최종 RFP | 삽입 이미지 4개 점검, 서비스 구성도 미확인 | RFP 근거 이미지 모델 재구성·CCK 논리 설계 구분 |
| PF-R08 | 사전공개 RFP | 목표 구성·데이터 구성 2개 | 기존 원문 유지 |
| PF-R09 | 석유공사 정정 RFP | 삽입 이미지 2개 점검, 서비스 구성도 미확인 | RFP 근거 이미지 모델 재구성·CCK 논리 설계 구분 |
| PF-A03 | KIND [공식 사전규격 RFP](https://www.kindkorea.or.kr/pages/72?id=11374&menuMode=READ&q=) | 첨부 HWPX의 삽입 이미지 4개 점검, 서비스 구성도 미확인 | RFP 근거 이미지 모델 재구성·CCK 논리 설계 구분 |
| AX05 | [DeepMind 공식 설명](https://deepmind.google/blog/safety-first-ai-for-autonomous-data-centre-cooling-and-industrial-control/) | 센서→예측→안전 제약→현장 검증 단계 그림 4개 | 원문 단계 그림 추가 |
| AX06·PF-A12 | [영국 정부 ATRS](https://www.gov.uk/algorithmic-transparency-records/dsit-gov-dot-uk-chat), [GOV.UK 개발 ADR](https://docs.publishing.service.gov.uk/repos/govuk-chat/adr/0001-pilot-technical-architecture.html) | 2025년 베타 C4 도면 1개, 초기 파일럿 도면 1개 | 시점 구분해 원문 추가 |
| PF07 | [Bürokratt 공식 아키텍처](https://github.com/buerokratt/Common-Knowledge/blob/main/ARCHITECTURE.md) | 전체 구조·DB 질의·콘텐츠 수집·파일 업로드 Mermaid 4개 | 원문 Mermaid 렌더 추가 |

PF-R07·PF-R09·PF-A03의 미확인은 검토한 RFP의 삽입 이미지에 대한 결과. 도면이 세상에 없다는 단정은 아님. 재구성 도면은 해당 RFP의 요구사항 ID·업무 흐름을 명시하고 원문 도면과 섞지 않음.

원문 파일·해시·위치는 [`src/case-source-figures.json`](../src/case-source-figures.json)에, 이미지 모델 재구성 3건의 근거·해시는 [`src/case-reconstruction-images.json`](../src/case-reconstruction-images.json)에 기록.
