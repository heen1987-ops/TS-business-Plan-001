'use strict';
const strategies=require('./strategy-solutions-2027.cjs');
const checked='2026-10-16';
const sources=[
 ['S01','서울시 · 올빼미버스 빅데이터 정책','https://english.seoul.go.kr/smg-taps-big-data-customized-policy/','2014-04-28','운영기관 발표'],
 ['S02','NAVER · CareCall 이해관계자 연구','https://clova.ai/tech-blog/ko-clova-%EC%BC%80%EC%96%B4%EC%BD%9C-%EC%97%B0%EA%B5%AC-%EB%85%BC%EB%AC%B8-%EC%86%8C%EA%B0%9C-%EC%B4%88%EA%B1%B0%EB%8C%80-%EC%9D%B8%EA%B3%B5%EC%A7%80%EB%8A%A5-%EA%B8%B0%EB%B0%98-%EC%B1%97%EB%B4%87','2024-08-07','개발사 연구 요약 / CHI 2023'],
 ['S03','개인정보보호위원회 · 이루다 조사 결과','https://www.korea.kr/news/policyNewsView.do?newsId=156449232','2021-04-28','감독기관 조사'],
 ['S04','영국 정부 · M365 Copilot 실험 보고서','https://www.gov.uk/government/publications/microsoft-365-copilot-experiment-cross-government-findings-report/microsoft-365-copilot-experiment-cross-government-findings-report-html','2025-06-02','정부 실험 / 이용자 자기보고'],
 ['S05','Google DeepMind · 데이터센터 냉각 제어','https://deepmind.google/blog/safety-first-ai-for-autonomous-data-centre-cooling-and-industrial-control/','2018-08-17','운영·개발사 발표'],
 ['S06','GDS · GOV.UK Chat 이용자 실증','https://insidegovuk.blog.gov.uk/2026/03/16/5-things-we-learned-testing-gov-uk-chat-an-ai-assistant-for-government/','2026-03-16','정부 실증 보고'],
 ['S07','DSIT · GOV.UK Chat 알고리즘 공개 기록','https://www.gov.uk/algorithmic-transparency-records/dsit-gov-dot-uk-chat','2025-10-07','정부 기술·책임 공개'],
 ['S08','호주 왕립위원회 · Robodebt 최종 보고서','https://robodebt.royalcommission.gov.au/publications/report','2023-07-07','독립 조사 / 2023-07-11 정정본 안내'],
 ['S09','NHTSA · Cruise 사고보고 시정 명령','https://www.nhtsa.gov/press-releases/consent-order-cruise-crash-reporting','2024-09-30','감독기관 시정 명령'],
 ['S10','OpenAI · Morgan Stanley 평가·도입 사례','https://openai.com/index/morgan-stanley/','게시일 미표시','공급사 고객사례']
].map(([id,title,url,published,level])=>({id,title,url,published,level,checked}));
const assets=[
 {id:'CCK-01',name:'NOA 업무 도구',basis:'기존 사용자 가이드',state:'문서 확인 · 설치본 시험 필요',reuse:'대화·자료 검색·요약·서식·스킬',delta:'조직별 검색 범위·권한 정책·업무 분류 연결'},
 {id:'CCK-02',name:'Audin·Foundry·JET·Torus',basis:'PG24 Epic 명세 색인',state:'명세 확인 · 재사용 후보',reuse:'증빙 기반 검토·절차 실행·스킬 로그·구조화 입력 설계',delta:'TS 규정·서식·근거 위치·검토 규칙·승인 단계 현지화'},
 {id:'CCK-03',name:'에이전트 개발·운영 경계',basis:'PG31 Connor 개발·운영 명세',state:'명세 확인 · 실행 검증 필요',reuse:'에이전트 개발·시험·로그와 운영 실행 경계',delta:'기관별 실행 정책·멱등성·감사·롤백·인수 시험'}
];
const cases=[
 {id:'AX01',title:'서울 올빼미버스',region:'국내',country:'대한민국',result:'성공',kind:'빅데이터 정책 적용',period:'2013–2014',sources:['S01'],keywords:['이동 수요','교통약자','지역','데이터 연계'],fact:'통신 데이터 분석의 심야버스 노선 반영 및 2개 노선에서 9개 노선으로 운영 확대',limit:'운영기관 발표 · 생성형 AI 사례 아님 · 사고 감소·지역경제 인과효과 별도',flow:['통신 이동 수요','시간·지역 분석','노선 선정','심야버스 운영'],flowBasis:'공개 업무 흐름 요약 · 시스템 배치도 재현 아님',lesson:'현장 수요와 데이터 분석의 정책 결정 연결',local:'TS 관할·교통약자·이동 수요를 지역별 업무 사전으로 연결',assets:['CCK-01','CCK-02'],delta:'지역·시간·관할 코드 정규화 / 집계 통계와 현장 근거 대조',test:'동일 지역·기간의 원천 집계 재현 및 담당 부서 매핑 대조',metric:'수요 검토 소요시간 / 근거 누락률'},
 {id:'AX02',title:'CLOVA CareCall',region:'국내',country:'대한민국',result:'혼합',kind:'음성·LLM 돌봄 서비스',period:'CHI 2023 / 2024 소개',sources:['S02'],keywords:['음성','정보약자','맞춤 서비스','인간 개입'],fact:'안부전화와 복지 담당자 후속 대응의 결합; 인터뷰에서 업무 부담 완화와 사용자 이해의 이점 보고',limit:'소규모 질적 연구 · 부적절 발화 통제와 지자체별 요구 반영의 난점 · 임상 효과 근거 아님',flow:['안부전화','LLM 대화','내역 열람·분석','복지 담당자 대응'],flowBasis:'개발사 공개 서비스 구조 요약',lesson:'자유 발화와 필수 업무 항목의 분리 및 사람에게 연결되는 경로',local:'TS 민원 발화를 요약한 뒤 신청 목적·대상·지역의 사용자 확인',assets:['CCK-01','CCK-02'],delta:'한국어 음성 연계 / 발화 정리 / 필수 항목 검증 / 상담 전환',test:'고령·소음·방언 표본의 필수 항목 정확도 및 상담 전환 성공률',metric:'서비스 도달률 / 발화 재입력률 / 집단별 완료시간'},
 {id:'AX03',title:'이루다 개인정보 처리',region:'국내',country:'대한민국',result:'실패',kind:'학습·응답 데이터 통제',period:'2021 조사',sources:['S03'],keywords:['개인정보','목적 제한','데이터 재사용','책임'],fact:'다른 서비스에서 수집한 대화의 목적 외 학습·운영 이용 등에 대한 개인정보보호위원회 제재',limit:'2021년 조사 대상 행위 기준 · 후속 서비스 전체에 대한 평가 아님',flow:['원 서비스 대화','목적 외 재사용','학습·응답 DB','이루다 발화'],flowBasis:'조사에서 확인된 처리 관계 요약 · 내부 구현 상세 미공개',lesson:'데이터 보유와 AI 활용 권한의 분리',local:'인사·민원 데이터의 목적·보유기간·접근정책을 별도 속성으로 관리',assets:['CCK-02','CCK-03'],delta:'수집 목적 태그 / 학습·검색·출력별 정책 / 삭제·회수 전파',test:'목적 외 입력 거부·권한 회수 후 검색 및 캐시 노출 차단',metric:'필수 거부셋 노출 건수 / 삭제 전파 지연'},
 {id:'AX04',title:'영국 정부 M365 Copilot',region:'해외',country:'영국',result:'혼합',kind:'직원 업무 생산성 실험',period:'2024.09–12 실험',sources:['S04'],keywords:['업무효율','직원','권한','성과 측정'],fact:'2만 명 규모 실험; 설문 응답자 7,115명의 자기보고 시간 절약 평균 약 26분/일',limit:'실측 인과효과 아님 · 복잡한 맥락·데이터 업무 한계 · 기존 자료 과다공유 위험',flow:['직원 요청','기존 접근권한','업무 자료 검색','초안·직원 검토'],flowBasis:'보고서의 기능·권한 설명 기반 재구성',lesson:'사용 빈도와 실측 성과의 분리 / 기존 권한의 사전 정비',local:'같은 요청을 부서·직무별로 분류하고 원천 접근권한을 검색 전 집행',assets:['CCK-01','CCK-03'],delta:'로그인 ID–조직 연결 / 직무별 검색·서식 / 검토시간 포함 계측',test:'권한 교차 시험과 동일 난도 업무의 전후·비교군 평가',metric:'검토·재작업 포함 완료시간 / 오류율'},
 {id:'AX05',title:'Google 데이터센터 냉각',region:'해외',country:'미국',result:'성공',kind:'AI 기반 운영 최적화',period:'2018 운영 발표',sources:['S05'],keywords:['에너지','친환경','안전 제약','운영'],fact:'운영사 보고 기준 냉각 효율 지표(kW/ton)의 과거 기준 대비 약 30% 개선',limit:'데이터센터 냉각 한정 · 총 전력·탄소·TS 절감률과 구분',flow:['센서 상태','소비 예측','안전 제약 확인','현장 재검증·제어'],flowBasis:'공개 기술 구조 요약 · 운영자 수동 전환 포함',lesson:'추천과 실행 사이의 이중 검증 및 운영자 통제',local:'TS 탄소·에너지 근거 검증과 운행 개선 권고부터 적용',assets:['CCK-02','CCK-03'],delta:'원천·배출계수 판본 대사 / 계산 검증 / 권고 승인 / 계측',test:'계수·단위·경계조건별 재계산 및 이상 입력 시 권고 보류',metric:'검증된 활동량당 에너지 / 산식 오류율'},
 {id:'AX06',title:'GOV.UK Chat',region:'해외',country:'영국',result:'혼합',kind:'정부 안내 RAG 실증',period:'2025 기술 기록 / 2026 실증',sources:['S06','S07'],keywords:['민원','공공정보','자연어 탐색','서비스 접근'],fact:'iOS 실증 641명·4주·2,670개 질문; 안내 편의와 응답속도·업무 범위의 개선 과제 확인',limit:'공개 안내 검색 범위 · 개인 업무 처리와 담당자 인계는 당시 지원·개선 범위 구분',flow:['질문 분류','GOV.UK 자료 검색','근거 기반 응답','공식 안내 확인'],flowBasis:'공개 RAG 구조와 실증 결과의 요약',lesson:'공식 서비스 목록·정확도·수행 경계의 명시',local:'TS 공개 서비스 카탈로그와 소관 부서 연결 / 메뉴를 유지한 프롬프트·음성 진입',assets:['CCK-01','CCK-02'],delta:'공개·내부 지식 분리 / 서비스 라우터 / 필수 입력 확인 / 인증·전송 연계',test:'실제 메뉴 대비 업무 도달률·완료시간 및 잘못된 기관 안내 검증',metric:'정확한 서비스 도달률 / 포기율 / 응답 p95'},
 {id:'AX07',title:'호주 Robodebt',region:'해외',country:'호주',result:'실패',kind:'행정 자동화·책임 통제',period:'2023 최종 조사',sources:['S08'],keywords:['행정 판단','적법성','이의제기','공정성'],fact:'왕립위원회 최종 조사에서 자동 결정의 법적 틀·재심 경로·데이터 교환 통제·취약계층 대응 개선 권고',limit:'규칙 기반 행정 자동화의 실패 교훈 · 생성형 AI 사례 아님',flow:['기관 간 자료','자동 산정·결정','대상자 통지','이의제기·재심'],flowBasis:'조사 권고의 대상 업무를 설명하기 위한 재구성',lesson:'자동화 이전의 법적 근거·증빙 검증과 재심 경로',local:'검사·지원·자격 업무의 근거 조문·증빙·전결 확인 후 담당자 판단',assets:['CCK-02','CCK-03'],delta:'근거·입력 검증 / 자동 확정 제한 / 이의제기·재검토 연결',test:'누락·기간 불일치·권한 부재 시 보류 및 재심 처리 추적',metric:'근거 누락률 / 오판 보완률 / 이의처리 시간'},
 {id:'AX08',title:'Cruise 사고보고',region:'해외',country:'미국',result:'실패',kind:'자율주행 안전·사고보고',period:'2023 사고 / 2024 시정',sources:['S09'],keywords:['미래 모빌리티','사고','실증','안전보고'],fact:'충돌 후 상황을 빠뜨린 사고보고에 대한 NHTSA 시정 명령 및 강화된 보고·감독',limit:'보고 완전성·안전 거버넌스 문제 · 사고 원인을 LLM 오류로 단정 불가',flow:['사고 원시 증거','사건 타임라인','보고서 작성','감독기관 보고'],flowBasis:'공개 시정 내용 기반 보고 흐름 재구성',lesson:'요약 결과와 원시 증거의 대사 / 보고 책임의 분리',local:'TS 실증·사고·점검 자료의 사건 ID와 원문 시점별 근거 연결',assets:['CCK-02','CCK-03'],delta:'증거 무결성 / 필수 사건 체크 / 누락 경고 / 검토·승인 이력',test:'누락 사건·충돌 시각 주입 후 탐지 및 승인 없이 전송 차단',metric:'필수 사건 재현율 / 검토 누락률'},
 {id:'AX09',title:'Morgan Stanley 지식지원',region:'해외',country:'미국',result:'성공',kind:'전문가 업무·평가셋',period:'출처 열람 2026.10',sources:['S10'],keywords:['전문지식','문서검색','평가','업무 품질'],fact:'공급사 고객사례에서 자문팀의 98% 초과 활용과 전문가 평가 기반 개선 체계 보고',limit:'자문팀 기준 공급사 발표 · 생산성 인과효과·TS 정확도 근거와 구분',flow:['전문가 질문','사내 지식 검색','근거 응답','전문가 평가·개선'],flowBasis:'고객사례의 검색·평가 설명 기반 재구성',lesson:'업무 전문가 정답셋과 변경 시 회귀 평가',local:'부서별 규정·기술 기준·서식에 근거 위치와 판본을 연결',assets:['CCK-01','CCK-02'],delta:'직무별 평가셋 / 근거 위치 / 답변 보류 / 변경 영향 재평가',test:'숨긴 평가셋의 근거 일치·판본 일치·거부율 평가',metric:'근거 정확도 / 재작업률 / 지식 탐색시간'}
];
// Each mapping is a TS proposal; case evidence does not prove TS outcomes.
const extra=require('./ax-cases-expanded.cjs');cases.push(...extra.cases);sources.push(...extra.sources);
const mappingInputs=[
 ['ST-01',[['AX01','직접 업무 유사'],['AX02','방법론 참조'],['AX08','실패 통제 참조']],'지역·취약계층 안전조치 근거 지원','관할·대상·현장 증거 연결','위험 검토시간 / 조치 이행률','지역·기간별 원천 대조, 미조치 건 추적'],
 ['ST-02',[['AX09','방법론 참조'],['AX07','실패 통제 참조']],'검사·소비자 권익 검토 지원','검사 기준 판본·차량·증빙 대조','검토 누락률 / 보완 소요시간','불완전 증빙의 자동 확정 차단'],
 ['ST-03',[['AX08','직접 업무 유사'],['AX07','실패 통제 참조']],'중대사고 예방·보고 완전성','사건 타임라인·필수 보고항목 검사','필수 사건 재현율 / 보고 누락률','사고 증거 누락·시점 충돌 주입 시험'],
 ['ST-04',[['AX04','직접 업무 유사'],['AX09','방법론 참조'],['AX03','실패 통제 참조']],'조직 네이티브 공통 기반','공식 ID·효력일·역할·업무 분류·권한 집행','직무 분류 정확도 / 비인가 노출 건수','인사이동·동명이인·권한 회수·동일 요청 교차 시험'],
 ['ST-05',[['AX08','직접 업무 유사'],['AX05','방법론 참조']],'모빌리티 실증 증거·안전 검증','실증 데이터·시험조건·사건 보고의 근거 연결','시험 증거 누락률 / 재현 성공률','실증 조건·원시 로그·보고서 불일치 탐지'],
 ['ST-06',[['AX05','방법론 참조']],'친환경 운행·탄소 검증 지원','활동량·계수·산식 검증과 개선 권고','활동량당 에너지 / 산식 오류율','같은 계절·운행 조건 비교 및 계수 판본 재계산'],
 ['ST-07',[['AX01','직접 업무 유사'],['AX06','방법론 참조'],['AX03','실패 통제 참조']],'교통데이터 제공·연계 지원','공개 가능 필드·데이터 사전·API 요청 연결','연계 성공률 / 목적 외 노출 건수','공개·내부 필드 혼합과 재식별 위험 입력 검증'],
 ['ST-08',[['AX01','직접 업무 유사'],['AX02','방법론 참조'],['AX06','방법론 참조']],'자연어·음성 이동 서비스 접점','발화 정리·필수 항목 확인·소관 서비스 연결','정보약자 도달률 / 포기율','기존 메뉴와 사용자군별 과업 비교·상담 전환'],
 ['ST-09',[['AX01','방법론 참조'],['AX07','실패 통제 참조']],'지역·산업 지원 검토 근거','지역 수요·지원 조건·실증 증빙 매핑','검토시간 / 근거 누락률','지역별 기준·지원조건 차이와 보류 처리 검증'],
 ['ST-10',[['AX04','직접 업무 유사'],['AX09','방법론 참조']],'성과·경영 문서 검토 지원','근거 자료·산식·업무 수행시간 계측','완료시간 / 재작업률 / 업무당 비용','동일 난도 비교군·검토시간 포함 평가'],
 ['ST-11',[['AX05','방법론 참조'],['AX08','실패 통제 참조']],'ESG 증빙·공시 검토 지원','지표별 산식·원천·검토자·변경 이력 연결','증빙 누락률 / 공시 검토시간','산식·원문 불일치와 보고 누락 주입 시험'],
 ['ST-12',[['AX04','방법론 참조'],['AX02','방법론 참조'],['AX03','실패 통제 참조'],['AX07','실패 통제 참조']],'조직 협업·참여·공정성 지원','역할별 인계·평가 피드백·이의제기 보호','인계 완료시간 / 부서별 오류율 편차','겸직·대행·전보·접근 회수·의견 보호 시험']
];
const mappings=mappingInputs.map(([id,refs,plan,delta,kpi,validation])=>{const s=strategies.rows.find(r=>r.id===id);return {...s,caseRefs:refs.map(([caseId,type])=>({caseId,type})),plan,delta,kpi,validation,requirement:'BM-'+id+'-R01',test:'BM-'+id+'-T01',phase:id==='ST-04'?'1차 공통 기반':'공통 기반 인수 후 부서별 적용',effectStatus:'기대 방향 · TS 실측 전',effect:id==='ST-09'?'지원 검토 품질·시간 개선; 지역경제 성장의 인과효과 별도 평가':plan+'의 처리시간·누락 감소',reuse:'ON27-BASE / C27-COM + CCK 재사용 판정 기능'};});
for(const c of extra.cases)for(const id of c.strategies){const m=mappings.find(m=>m.id===id);m.caseRefs.push({caseId:c.id,type:c.result==='실패'?'실패 통제 참조':c.region==='국내'&&['AX19','AX24','AX25','AX26','AX15'].includes(c.id)?'방법론 참조':'직접 업무 유사'});}
const architectures=[
 {id:'system',title:'TS 조직 네이티브 AI 전체 구조',note:'CCK 적용 제안 · 조직·권한 공통 기반의 선행 구축',nodes:['공식 조직·인사·세칙','ID·효력일·직무 매핑','정책 집행·업무 분류','NOA·검토 스킬·연계','부서 검토·승인·감사'],details:['원천 책임·판본·변경 이벤트','소속·겸직·역할 / 불명확 매핑 보류','문서·행위·업무건별 정책','재사용 후보 + 업무별 전용 개발','권한 재검증·원문 추적·복구'],sources:['AX04','AX09','AX03']},
 {id:'service',title:'국민서비스 접점 구조',note:'CCK 적용 제안 · 기존 메뉴·상담 경로 유지',nodes:['텍스트·음성 / 기존 메뉴','발화 정리·사용자 확인','공개 서비스·소관 매핑','공식 페이지·인증 연계','전송 확인·담당자 인계'],details:['음성·텍스트 대체 입력','의도·대상·지역·필수 항목','공개 지식과 내부 지식 분리','조회·신청·처리 권한 별도 검증','실행 전 확인 / 실패 시 메뉴·상담'],sources:['AX02','AX06','AX07']},
 {id:'data',title:'원천부터 결과물까지의 데이터 흐름',note:'CCK 적용 제안 · 학습·검색·실행 목적의 분리',nodes:['원천 수신·품질 대사','목적·권한·판본 태깅','허용 자료 검색·계산','근거 응답·사람 검토','결과·감사·회수 전파'],details:['데이터 계약·필드 최소화','변경 이력·보유기간·삭제 이벤트','거부 우선 / 수치 계산 검증','공식 원문 위치·승인 판본','원문 대신 식별자 중심 로그'],sources:['AX03','AX05','AX08']}
];
const metrics=[
 ['처리시간','입력부터 최종 검토 완료까지의 중앙값·p95','기존 방식과 AI 방식의 동일 난도 과업 비교 / 재작업 포함'],
 ['업무 정확도','전문가 정답과 일치한 건수 ÷ 유효 평가 건수','부서·역할·업무 유형별 숨긴 평가셋 / 보류·오답 별도 집계'],
 ['서비스 도달률','정확한 서비스에 도달한 이용자 ÷ 전체 시도 이용자','기존 메뉴 대비 평가 / 고령·장애·방언 등 사용자군 구분'],
 ['보안·안전','비인가 노출·실행 건수 / 필수 증거 누락 건수','공격·회수·오매핑·중복 실행 주입 / 필수 거부셋 0건 기준안'],
 ['운영 비용','모델·인프라·검토·재작업 비용 ÷ 완료 업무 건수','동일 기간·품질 조건 / 성공 건수와 실패 비용 함께 집계']
];
module.exports={checked,sources,assets,cases,mappings,architectures,metrics,labels:{title:'전략과제 AX 사례집',subtitle:'사례 근거 → 12대 전략 → CCK 적용 → 개발·검수 → 기대효과',boundary:'사례 결과는 해당 출처·시점 기준 / TS 성과는 별도 평가',metricNote:'기준선 확보 → 비교 평가 → 목표 합의 · 외부 절감률의 TS 전용 금지',assetNote:'CCK 문서·명세 기준 재사용 후보 / 설치본·사용권·품질 시험 후 확정'},getCase:id=>cases.find(c=>c.id===id)};
