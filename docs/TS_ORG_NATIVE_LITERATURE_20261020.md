# TS 조직 네이티브 AI · 문헌 설계 반영

기준일: 2026-10-20 / 기획 설계·검수 명세

## 반영 내용

- 사용자 제공 The Enterprise Brain 한국어본으로 검토 대상 교체. 앞서 전달한 세무질의응답 논문은 이번 설계 근거에서 제외.
- 첨부 서적 1종, 공개 서적 3종, 논문 1종, 표준·가이드 4종의 선택 장·절 검토.
- 기관 공통·부서 정의·업무건 계층의 조직화. 직위·역할·배정·업무유형·업무건·증거·권한·위임·협업·실행·이력 등 14개 객체.
- 7개 아키텍처 구성요소, 8개 조직 이해 질문, 4개 연계 인터페이스 계약안.
- 미제출·접근불가·수집지연·판본불일치·규칙상충 분리. 같은 업무건의 보완·재검토·협업 수락·실제 종결 연결.
- OT01~12 세부 시험을 GAI-T01~12의 실제 명칭·시나리오와 대조. 승인→T08, 결과/복구→T09, 기관/분야→T10, 악성입력/민감정보→T11 매핑.
- 기존 ON-W01~06·M1~M9 일정과 ST-10 예산·성과 검토, ST-12 인계 실증 연결. 기존 기능 재사용·추가 개발 경계와 단일 공통 산정 유지.

## 정본·노출

- 정본: `src/org-native-literature.json`
- 표시: `src/OrgNativeDesign.jsx` / `src/org-native-literature.css`
- 기존 ST-04 공통 설계 안에 한 번 렌더링. 전략 홈·조직 이해 요약에서 같은 위치 연결.
- 좌측 접이식 메뉴·본문 전환·Pretendard 및 공통 크기 유지. 신규 전역 메뉴·별도 페이지 없음.
- 기본 아키텍처만 펼침, 모델·흐름·검수·문헌은 선택 펼침.
- `scripts/export-org-native-literature.cjs`가 동일 원장의 설계 MD·JSON 생성. 공개 도서 원문·첨부 PDF·원그림 복사 없음.
- 첨부 그림 17.1은 PDF 138쪽(인쇄 132쪽) 시각 검토. 화면 도식은 원그림 복제가 아닌 CCK의 TS 적용 설계.

## 핵심 근거

- [The Enterprise Brain 공식 소개](https://theenterprisebrain.ai/): 첨부 한국어본 제15~18·20~22장 선택 검토. 80/20 재사용, 모델 신뢰도 임계치, 자동 학습 예시를 TS 실측·정책으로 전용하지 않음.
- [OpenStax Organizational Behavior 16.1](https://openstax.org/books/organizational-behavior/pages/16-1-organizational-structures-and-design): 공식 구조·책임·협업.
- [Keet, Ontology Engineering v1.5](https://people.cs.uct.ac.za/~mkeet/files/OEbook.pdf): 조직 이해 질문을 모델·평가 범위로 전환. 2020 v1.5 / CC BY 4.0 판본 확인.
- [Process Mining Handbook 원문 장](https://link.springer.com/chapter/10.1007/978-3-031-08848-3_6): 업무건·활동·시간과 로그 품질.
- [MOISE+ 원논문](https://moise.sourceforge.net/doc/publications/Hubner-sbia2002.pdf): 구조·기능·의무 모델. TS 권한은 별도 정책 집행.
- [W3C ORG](https://www.w3.org/TR/2014/REC-vocab-org-20140116/), [NIST ABAC](https://csrc.nist.gov/pubs/sp/800/162/upd2/final), [W3C PROV-O](https://www.w3.org/TR/2013/REC-prov-o-20130430/), [SHACL](https://www.w3.org/TR/2017/REC-shacl-20170720/): 조직·기간, 접근판정, 증거계보, 자료 제약 검증.

## 검증

- `npm ci` / `npm test`: 기존 사이트 전체 검사·추가 데이터 추적 검사.
- `scripts/check-org-native-literature-browser.cjs`: 홈→설계, 구성요소 7개 선택, 상세 5개 펼침, 근거·다운로드, 실증 서비스 왕복, 좌측 메뉴 DOM 유지, 모바일, 업무 API 미호출.
- 기존 `scripts/check-ts-ax-portfolio-browser.cjs`: 12개 전략·사례집 회귀.
- 배포 후 Actions·version.json·공개 화면 재검증.

검사는 기획 홈페이지와 설계 데이터의 품질 확인. TS 실제 업무 API 구현·운영 성능 시험·기관 인수와 구분.
