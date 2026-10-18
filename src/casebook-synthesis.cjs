'use strict';
// 57개 심층 사례를 비교한 CCK 설계 판단. 각 사례의 원문·구축 단계와 TS 적용안은 별개다.
const ax=require('./ax-casebook.cjs');
const platform=require('./platform-casebook.cjs');
const candidates=require('./strategy-solution-candidates.cjs');
const insights=require('./case-insights.cjs');

const reviewedAt='2026-10-19';
const sourceOverrides={
 'PF-A03':{title:'KIND 대내 생성형 AI 서비스 구축 본공고·제안요청서',url:'https://www.kindkorea.or.kr/pages/72?id=11391&menuMode=READ&q=page%3D1',level:'본공고 RFP · 운영 성과 아님'},
 'PF-C03':{title:'Amaranth 10·ONE AI 제안서 게시',url:'https://idouzone.com/customer/solutionroom.php?boardid=data&idx=39&mNum=3&mode=view&sNum=3',level:'공급사 제품 제안서 · 고객 운영 성과 아님'}
};
const platformFindings=[
 {id:'P1',title:'공식 조직 관계와 실행 권한의 분리',finding:'직원·부서 관계, 문서 접근권한, 결재·업무 실행권한의 원천과 효력일 구분',boundary:'조직 관계 커넥터나 RFP 요구를 운영 권한 집행으로 간주 불가',cck:'공식 ID·겸직·전보 이벤트를 업무사전과 연결하고 검색 전 정책 판정',acceptance:'동명이인·겸직·전보·회수 뒤 문서명·본문·실행의 비인가 노출 검사',cases:['PF-C01','PF-C02','PF-A03','PF-R09','PF04','PF-C03'],strategies:['ST-04','ST-12']},
 {id:'P2',title:'공통 AI 기능과 직무별 업무팩의 분리',finding:'모델·검색·문서·API 공통기반 위에 소관, 규정, 입력, 승인, 결과 상태를 업무별로 구성',boundary:'공통 플랫폼 도입을 모든 부서 업무 완결이나 AI 품질의 증거로 확대 불가',cck:'기존 NOA·검색·도구의 사용권·형상을 먼저 대조하고 전략별 어댑터만 추가 산정',acceptance:'동일 요청의 부서·직무별 근거 선택, 다른 도메인 자료 혼입, API 실패·재시도 비교',cases:['PF01','PF03','PF04','PF05','PF06','PF-A06','PF-A18','PF-R03','PF-R04','PF-R09','PF-C03'],strategies:['ST-03','ST-04','ST-07','ST-10']},
 {id:'P3',title:'원문·판본·목적·권한이 연결된 지식 관리',finding:'OCR 추출값, 규정 판본, 검색 허용 범위, 수정·삭제·회수의 추적 필요',boundary:'문서 적재 성공과 정확한 답변·목적 적합성·승인 완료는 별도',cck:'근거 위치·효력기간·소유부서·허용 목적을 검색 색인과 결과에 유지',acceptance:'구판 인용·OCR 오독·목적 외 검색·권한 회수 후 캐시 재노출 검사',cases:['PF02','PF-R01','PF-R06','PF-R07','PF-R08','PF-A08','PF08','PF-C02'],strategies:['ST-02','ST-04','ST-07','ST-10','ST-11']},
 {id:'P4',title:'대국민 안내와 공식 처리 상태의 분리',finding:'자연어·음성 질문은 소관 서비스와 기존 메뉴·상담으로 연결하고 공식 접수 결과까지 추적',boundary:'답변·링크 제공과 신청 접수·행정 처리 완료의 혼동 금지',cck:'공개 서비스 카탈로그, 발화 확인, 접근성 대체 경로, 인증·인계 상태를 별도 단계로 설계',acceptance:'범위 밖 질문·잘못된 소관·중복 신청·미접수 완료표시·상담 인계 누락 검사',cases:['PF07','PF-A12','PF-R02','PF-R05','PF31'],strategies:['ST-07','ST-08','ST-09']},
 {id:'P5',title:'입찰·실증·운영·효과 증거의 단계 구분',finding:'공고·RFP, 시범, 서비스 개시, 사용량, 업무 효과의 근거 수준 분리',boundary:'제안서의 요구사항이나 공급사 활용 수치를 TS의 구현·절감 실적으로 전용 불가',cck:'업무 완료시간·정확도·재작업·비용을 같은 난도와 권한 조건의 비교군으로 계측',acceptance:'숨긴 평가셋·동일 질문 반복·부서별 편차·사람 검토 및 실패비용 포함',cases:['PF-A09','PF-A13','PF-A14','PF-A15','PF-A16','PF-A18','PF-R03','PF-R04','PF31'],strategies:['ST-04','ST-10','ST-12']}
];
const strategyFindings=[
 {id:'A1',title:'위험 점수보다 현장 조치의 완결성',finding:'이동·설비·영상 자료의 위험 후보를 관할·현장점검·책임자·재점검 사건에 연결',boundary:'위험 예측 성능과 사고 감소·정비 완료는 다른 지표',cck:'위험 근거 묶음, 미조치 목록, 원시증거–보고서 대사, 사람의 종결 승인',acceptance:'누락·가림·기간 불일치·미조치 완료 입력 시 보류와 재점검 유지',cases:['AX01','AX10','AX14','AX16','AX17','AX18','AX20','AX23'],strategies:['ST-01','ST-03','ST-05']},
 {id:'A2',title:'업무 판단의 법령·기준·원문 연결',finding:'업무 유형·적용 기간·학교급·사업별 기준과 문서 원문 위치의 동시 대조',boundary:'RFP 초안이나 검색 답변을 공식 검사·집행·지원 판정으로 사용 불가',cck:'업무·관할·판본 선택, 증빙 누락 표시, 검토자 보완·승인 이력',acceptance:'구법·다른 사업 기준·OCR 오독·중요 근거 누락을 포함한 전문가 정답셋',cases:['AX07','AX09','AX21','AX22','AX24','AX25','AX26'],strategies:['ST-02','ST-09','ST-10','ST-11']},
 {id:'A3',title:'데이터 목적과 사람 책임의 선행 통제',finding:'개인정보 재사용, 자동 행정 결정, 사고보고 누락, 안내 오류의 통제 지점 확인',boundary:'동의·법적 근거·이의제기·보고 책임을 모델 응답 품질만으로 대체 불가',cck:'목적별 데이터 정책, 자동 확정 제한, 재심·시정·상담 인계 경로',acceptance:'목적 외 학습·검색, 기간 불일치, 사고 후 사건 누락, 동일 질문 상충 응답 검사',cases:['AX03','AX07','AX08','AX13','AX16'],strategies:['ST-03','ST-04','ST-05','ST-08','ST-12']},
 {id:'A4',title:'효과 측정의 기준선·분모·현장 조건',finding:'자기보고 생산성, 모델 정확도, 교통 흐름, 에너지·재난 결과의 측정 범위 분리',boundary:'해외 발표 수치의 TS 적용이나 추천의 실행·성과 자동 환산 불가',cck:'동일 난도 과업, 지역·기간 분리 평가, 검토·재작업·인프라 비용을 함께 계측',acceptance:'기준선·정답셋·숨긴 표본·계절·지역·실행 여부를 고정한 비교',cases:['AX04','AX05','AX09','AX11','AX12','AX23'],strategies:['ST-06','ST-10','ST-11']},
 {id:'A5',title:'국민 접점의 목적 확인과 대체 경로',finding:'음성·텍스트 의도를 필수 항목으로 정리하고 공식 서비스·전문 상담에 연결',boundary:'안내의 정확성, 서비스 도달, 실제 접수와 이용자군별 완료는 각각 평가',cck:'기존 메뉴 유지, 발화 원문·사용자 확인, 소관 라우팅, 상담 수신 확인',acceptance:'고령·방언·소음·범위 밖 요청에서 재입력률·오인계·도달률 측정',cases:['AX02','AX06','AX15','AX19','AX20'],strategies:['ST-07','ST-08','ST-09']}
];
const cckDirections=[
 {id:'C1',title:'1차 제품 축 · 조직 네이티브 공통 기반',scope:'ST-04 단일 공통 구축. 공식 직원·부서·직무·업무·효력일 매핑과 기존 IAM 정책의 검색 전 집행',reuse:'기존 로그인·NOA 검색·문서·스킬 기능은 설치본과 계약 권리 확인 후 재사용',delta:'동명이인·겸직·전보 영향, 직무별 업무 분류, 권한 변경 뒤 작업 인계·선택적 재검증',gate:'인사·조직 원천과 기존 SSO·권한·RAG·로그 요구의 계약 범위 대조',cases:['PF-C01','PF-C02','PF-A03','AX03','AX04','AX09'],strategies:['ST-04','ST-12']},
 {id:'C2',title:'2차 제품 축 · 12대 전략 업무팩',scope:'안전·차량·실증·데이터·경영 업무별 규정·서식·증빙·조치와 담당 부서의 검토 흐름',reuse:'공통 검색·문서 검토·구조화 입력·도구 호출은 확인된 기능만 재사용',delta:'업무별 사건·판본·원천 증빙·승인 경로와 예외 시험셋',gate:'ST-01·07·10·12 대표 업무에서 공통 기반 인수 후 순증 기능·검수 분리',cases:['PF-R01','PF-R09','AX18','AX21','AX24'],strategies:candidates.rows.map(r=>r.id).filter(id=>id!=='ST-04'&&id!=='ST-08')},
 {id:'C3',title:'3차 제품 축 · 목적 기반 국민서비스',scope:'ST-08 공개 정보의 텍스트·음성 탐색, 기존 메뉴·공식 서비스·상담 연결',reuse:'공개 지식 검색·요약과 기존 홈페이지·신청 시스템 경로',delta:'서비스 카탈로그·소관 라우터·발화 확인·접수 상태 대사·접근성 시험',gate:'안내·초안·인증 후 조회·실제 접수의 경계와 원시스템 수신 확인',cases:['PF07','PF-A12','PF31','AX02','AX06','AX13'],strategies:['ST-08']},
 {id:'C4',title:'공통 경쟁력 · 근거와 변경 영향의 재검증',scope:'조직·권한·문서·규정 변경이 진행 중 사건과 결과물에 주는 영향 목록',reuse:'기존 증빙 검토·로그·승인·법령 갱신의 계약상 기능',delta:'사건–증거–판단 의존관계와 영향 대상만 재검토하는 선택 기능',gate:'전체 재검토·단순 규칙 대비 중요 누락·정확도·사람 비용 평가. 신규 IP·중복 과업 확인',cases:['PF02','PF-R01','AX07','AX08','AX09'],strategies:['ST-02','ST-03','ST-04','ST-10','ST-11']}
];
function caseSource(id){
 if(id.startsWith('AX')){const c=ax.getCase(id);if(!c)throw new Error('AX 사례 없음: '+id);const sources=c.sources.map(sid=>ax.sources.find(s=>s.id===sid));if(sources.some(s=>!s))throw new Error('AX 출처 없음: '+id);return sources.map(s=>({title:s.title,url:s.url,level:s.level,published:s.published}));}
 const c=platform.cases.find(c=>c.id===id);if(!c)throw new Error('플랫폼 사례 없음: '+id);
 if(sourceOverrides[id])return [sourceOverrides[id]];
 return [...new Set([c.url,...(c.urls||[])].filter(Boolean))].map(url=>({title:c.basis,url,level:c.state,published:c.period}));
}
const allCases=[...platform.cases,...ax.cases];
function strategiesFor(id){return id.startsWith('AX')?ax.mappings.filter(m=>m.caseRefs.some(r=>r.caseId===id)).map(m=>m.id):insights.platformStrategies[id];}
module.exports={reviewedAt,platformFindings,strategyFindings,cckDirections,caseSource,strategiesFor,allCases,sourceOverrides};
