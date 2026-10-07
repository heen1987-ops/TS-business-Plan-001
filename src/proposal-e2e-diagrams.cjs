const intent=require('./proposal-intent.cjs');
// 짧은 도식 라벨. 기능·연계의 실제 구현을 확인한 명세가 아닌 2027년 논리 설계안.
const rows=[
['MR-01','앱미터 변경·검정','변경자료·시험결과','변경영향·입증질문','제품판본·시험 대조','검정 담당자','제품×판본×변경항목','기업 기술자료·연락정보','문서보완 / 공식 시험','기준판본·시험회차·변경사례'],
['MR-02','전화 DRT 접수·배차','상담기록·차량 가용','이동조건·예외 재계획','배차 조회·제약 최적화','운영자·기사','요청ID×상태판본','전화·주소 분리 / 최소 제공','공급부족·거절 → 재계획','한 생활권·조합 / 기존 계약 차분'],
['DF-01','운행 분석·안전조치','운행분석·조치 회신','원인·반대근거 검토','노출량·시행상태 대사','조치 담당기관','사업자×기간×조치','운전자·상세경로 분리','수신 / 실제 시행 구분','지표사전·노출량·기관 인계권한'],
['SA-01','점검 지적·해소','점검지적·조치증거','계획·실시·결과 대조','지적·종결조건 규칙','점검 담당자','점검ID×지적ID','회사·종사자 접근 분리','증거부족 → 현장 재확인','한 지적유형·공식 종결기준'],
 ['QE-01','검사소견·교정활동','공식 소견·활동일지','쉬운 설명·활동 보완','검사회차·활동 규칙','지정 검사요원·기관 권한자','대체키×회차×활동','상세 소견 / 이행정보 분리','이해곤란·미이행 → 지원','현업 수요·처리근거·요원 평가'],
['CL-01','안전운임 신고 처리','계약·운송·지급 증빙','거래관계·상충 검토','고시판본·운임 계산','조사 담당자·관할관청','신고×거래×고시판본','신고자·계좌·제3자 분리','조건 미확정 → 계산 대기','현행 고시·위탁범위·공식 산식'],
['PS-01','이동취약지역 정책','공간·노선·수요 집계','판정차이·대안 설명','GIS·통계 정합','정책 담당자·권한기관','공간판본×연도×기준','집계 사용 / 개인 위치 제외','경계 불일치 → 비교 보류','동일 연도·지역 합의·재원'],
['RI-01','실증조건·개시 준비','확인서·보험·운영계획','조건·변경영향 검토','기간·구역·주체 대조','담당자·관계기관','실증ID×판본×조건','공개 고지 / 제한 문서 분리','조건 미충족 → 준비 대기','원 확인서·보험·실제 개시자료'],
['DV-01','단지내도로 개선','사고·단지·권고 자료','권고·실행공백 검토','경계·시행증거 대사','전문가·관리주체','사고×경계판본×권고','경찰자료 제한 / 공개 집계','권한·재원 미확보 → 보류','시범현장·개선권한·관측 협약'],
['IP-01','민간검사소 점검 선정','검사결과·차량 구성','다른 원인·확인계획','통계 보정·불확실성','선정권자·현장 점검자','검사소×주기×차량군','차량 대체키 / 후보 비공개','소표본 → 분석 범위 축소','검증된 통계·독립 현장결론'],
['SI-01','검사기기 후속 확인','기기·재검·폐기 기록','동일기기·사유 후보','식별·순서·상태 규칙','검사 담당자','기기키×검사×부적합','설치장소·연락정보 분리','공란 → 미확인 유지','원 기기대장·재검·보고 연결'],
['PK-01','기계식주차장 후속','장치·명령·보수·재검','회신 주장·모순 검토','장치·시점·상태 대사','관할기관·검사자','시설×장치×검사회차','관리자 연락·위험후보 제한','보수만 완료 → 재검 대기','한 지자체·공식 명령·송달'],
['AD-01','진단 공백·확인과업','진단로그·제작사 자료','원인후보·확인질문','시도·응답·판본 대조','전문가·제작사','차량×항목×판본','차량번호·차대번호 분리','무응답 → 원인 미확인','로그 완전성·지원목록·재시험'],
['RD-01','검사연구·기준 이관','연구·시험·국제기준','적용조건·공백 검토','조문·판본·근거요건','연구자·기준 전문가','성과ID×조문×근거요건','공개 성과 / 제한 실험 분리','근거 미충족 → 채택 보류','한 성과·허용 시험·기관 회신'],
['EX01-01','전략변경·후속조치','계획·변경·이행증거','영향과제·책임 연결','과제ID·기한·상태','부서 검토자·승인자','변경판본×과제×부서','비공개 전략자료 제한','부서 이견 → 추가 협의','변경 전후 계획·승인 절차'],
['EX02-01','사업범위·예산요구','계획·단가·산출내역','범위·비용항목 대조','산술·중복·총계 검증','예산 담당자','사업ID×판본×항목','금액·내부 단가 접근 통제','근거부족 → 요구안 보완','실제 산출내역·예산 원장'],
['EX03-01','성과지표·실적 증거','지표정의·원천집계','정의·실적 의미 대조','기간필터·재집계','실적 확정 담당자','지표×정의×기간×분모','원자료·제출본 접근 분리','결측 → 미산정 유지','정의 변경·집계식·정정 사례'],
['EX04-01','고객경험·ESG 개선','의견·개선·운영기록','원인가설·대안·반례','설문·처리량 집계','개선 담당자','서비스×기간×개선과제','응답자 식별정보 분리','비교 불가 → 관측 보완','동일 서비스·비교조건·책임자'],
['EX05-01','시스템 변경·복구','변경요청·구성·장애','의존조건·시험질문','ITSM·설정 비교','운영 승인자','변경ID×구성×시험회차','구성·장애 상세 접근 제한','복구 미검증 → 시험 보완','기존 도구·시험환경·복구 증거'],
['EX06-01','AI 품질회귀 검증','모델·지식·오류사례','평가계획·실패 재계획','평가 실행기·점수','현업 수락·배포권자','모델×지식×평가셋×회차','오류사례 개인정보 최소화','수락 실패 → 재평가','실제 build·사용권·평가도구'],
['EX07-01','보안조건·조치증거','보안의견·구성·보완','조건·증거 충족 대조','보안점검·티켓 상태','보안 담당자','검토ID×환경×재점검','취약점·구성정보 제한','다른 판본 → 재점검','사건 이용권·종료 필수근거'],
['EX08-01','차량정보 정정','오류사건·공식 조회','원장차이·정정주체','차량키·공식 상태 대사','등록관청·담당자','차량키×원장×기준시점','소유자·등록 식별 분리','정정 뒤 상충 → 재조회','정정 경로·원장 이용권한'],
['EX09-01','정보공개·기록 검토','청구·기록·공개결정','청구범위·누락 기록','기록검색·기한·발송','공개 결정권자','청구ID×기록×판본','비공개 원문 / 공개본 분리','보호정보 → 부분공개 검토','기록 이용범위·공개 절차'],
['EX10-01','직무역량·학습 보완','절차·사례·실습 평가','연습·다음 학습계획','LMS·일정·정형 채점','전문가·학습자','직무×절차×과제×조건','개인 피드백 접근 제한','이수 후 미흡 → 보완 연습','실제 수행사례·전문가 기준'],
['EX11-01','계약·회계 증빙','계약·검수·청구·ERP','조건·이행증거 대조','산술·중복·ERP 조회','회계 검토·승인자','거래×계약×검수×초안','계좌·지급·계약정보 제한','상충 → 보완·수동 대기','조회권한 / 초안 등록 별도 확인'],
['EX12-01','시설변경·인수 조건','협의·변경·작업·시험','선행조건·잔여 과업','공정표·기한·인수상태','전문가·인수 담당자','시설×변경×조건×인수','설계·시설자료 이용 제한','작업 완료 → 인수증거 확인','협의자료·시험·인수 책임'],
['EX13-01','감사 지적·반론','관찰·답변·시정 증거','반론·추가 확인질문','이상거래 규칙·기한','감사자','감사사건×관찰×재점검','사건권한·개인정보 분리','반론 미확인 → 사실 보완','감사기준·사건 이용권·종결조건'],
['EX14-01','검사데이터 이용','요청·사전·품질기록','목적·해석조건 연결','품질검사·집계·추출','데이터 제공 책임자','데이터셋×사전×추출조건','식별정보 / 제공본 분리','권한·품질 미확인 → 대기','실제 추출기능·제공조건'],
['EX15-01','안전단속·기관조치','단속·기준·기관회신','지적·해소 증거 대조','차량·사건·기한·배정','권한기관·검사자','차량×사건×기준×회신','식별·단속자료 제한','대상 불일치 → 재확인','기관별 권한·해소 기준'],
['EX16-01','튜닝부품 시험 준비','사양·시험목적·시편','검증질문·준비과업','장비가용·일정·수수료','시험기관 전문가','부품×판본×시편×시험군','기업 기술자료 보호','시편 변경 → 준비 보완','한 시험군·공식 조건·전문 정답'],
['EX17-01','튜닝 조건 사전검토','차량·부품·장착 증빙','경로·변경영향 검토','규격·서류·신청상태','승인 담당자','차량군×부품×조건×판본','신청인·차량·기업자료 제한','작업조건 변경 → 재검토','한 유형·편람·보완기록'],
['EX18-01','항공장애물 시정','시설·설비·보수 기록','변경·완료증빙 대조','시설ID·기한·상태','검사자·지방항공청','시설×설비×판본×점검','시설·운영 상세 제한','완료문서 → 작동 확인','한 시설유형·현장 확인자'],
['EX19-01','항공자격 응시 준비','자격·경력·교육 증빙','요건경로·상충 검토','기간·시간·공식 조회','자격 심사 담당자','자격×한정×경로×회차','개인 자격·경력 최소조회','중복기간 → 인정범위 확인','한 경로·현행 규칙·실제 증빙'],
['EX20-01','드론 변경조건','신고·사업·보험 증빙','신청경로·변경조건','기체·기간·원스톱 상태','경로별 담당자','기체×사업×시점×보험','개인·사업·보험자료 제한','신고 / 사용사업 별도 분기','한 경로·담당 원장·보완사례'],
['EX21-01','UAM 준비도 검토','운용모델·기준·협의','역할·역량·입증질문','판본·합의상태·기한','관계기관 해석·확정','운용모델×역할×기준','협의자료 이용범위 제한','국내 요건 미확보 → 대기','hold / 국내 요건·수요·협의주체'],
['EX22-01','철도 자율보고','승인 비식별 보고본','위험·유사사건 검토','비식별본·기관조회','공유 승인자·담당기관','비식별 사건×조치×회신','신고자 원본은 NOA 밖','보호 검수 미승인 → 입력 대기','hold / 원문·공유 이용권·재식별 검수'],
['EX22-02','철도 면허·관제','경력·교육·갱신 증빙','경로별 증거 대조','기간·중복 제외·조회','자격 인정 담당자','경로×기간×교육×회차','건강 상세 제외 / 공식 상태','기간 상충 → 추가 보완','한 갱신경로·공식 인정규칙'],
['EX23-01','철도체계 승인 준비','기준·절차·현장 증거','실제 수행 가능성 대조','사건·판본·검사 상태','TS 검사자·승인권자','신청범위×책임×검사차수','기관 운영자료 제한','서류·현장 불일치 → 재검사','특정 범위·전문검사·승인 역할'],
['EX23-02','철도차량 변경 입증','설계·시험체·성적서','증거 유효범위 검토','구성판본·단위·서명','전문가 재입증 결정','차량×구성×시험체×회차','기업 설계·시험자료 보호','판본 불일치 → 재입증 검토','한 구성품·기준선·재사용 판단'],
['EX24-01','철도 지적·시정','지적·계획·후속검사','원인·효과증빙 대조','기관·기한·검사차수','철도 검사자','기관×지적×차수×시정','운영·검사자료 접근 제한','시정안만 제출 → 재확인','한 지적유형·실제 운영 증거'],
['EX25-01','철도 종합시험운행','구간·계획·단계 결과','변경·선행조건 검토','구간·차수·판본·값','시험 전문가·운영자','구간×구성×단계×차수','시험·구성자료 이용 제한','선행조건 미해결 → 재시험','한 단계·실제 설정·시험책임'],
['EX26-01','KNCAP 입증·공표','차종·방법·시험·공표','누락·혼용·변경 검토','계측·점수·판본 대조','평가 전문가·공표권자','차종×방법×회차×결과','원시험·기업자료 보호','방법·회차 혼용 → 정정','한 평가항목·공식 성적자료']
];
const types=['overall','service','data','environment'];
const labels={overall:'전체 아키텍처',service:'서비스 흐름도',data:'데이터 흐름도',environment:'요구환경 정의'};
const common={date:'2026-10-06',status:'2027년 논리 설계안 · 실제 API·제품 구현·자료권한·서버 여력 확인 전',environment:[['단말·접근','기관이 허용한 업무 단말·역할/사건별 접근. 외부 신청·전화 연결은 업무별 승인 범위만 사용.'],['기존 로컬 실행','기존 서버·로컬 LLM 사용 제약. 실제 CPU/GPU/RAM·동시성·제품 build·사용권 확인. 신규 인프라 비용 0원 제약의 수용 가능성 검증.'],['지식·상태 저장','원문·판본·원문 위치·접근등급을 유지하는 근거 저장소와 사건 상태·실행기록 분리. aRDa 재사용은 설치본·권한 확인 후 확정.'],['원천·도구 연계','조회부터 승인 파일 반입과 수기 결과 대조로 검증. endpoint·인증·schema·쓰기권한·멱등키 확인 전 실제 변경 차단.'],['운영·복구','시험/운영 분리 가능성, 모델·스킬·기준 판본, 보존/삭제·백업·수동 복귀·복구시험 확인. timeout·동시수·재시도·RTO/RPO는 실측·기관 합의 후 확정.']]};
const projects=rows.map(([id,shortTitle,source,ai,tool,authority,key,privacy,exception,precondition])=>{
 const p=intent.byId[id];if(!p)throw Error('도식 원장 누락 '+id);
 const complete=p.completion;
 const official=id==='MR-02'?'기사 수락·공식 배차·실제 승차':id==='EX11-01'?'승인 초안 인계·ERP 결과 대사':'공식 결과·회신·이행 증거';
 return {id,department:p.department,title:p.title,shortTitle,source,ai,tool,authority,key,privacy,exception,precondition,steps:p.change.steps,inputs:p.inputs,output:p.change.prepared,completion:complete,scope:p.scope,boundary:p.qualification,
 overall:{nodes:['허용 원천: '+source,'역할별 업무 화면','사건·판본 상태','NOA: '+ai,'규칙·조회: '+tool,'근거·판본: aRDa 연계 후보','담당 확정: '+authority,official,'실행기록·결과 대사'],edges:[['허용 원천','근거·판본','승인 조회/파일 반입'],['업무 화면','사건 상태','접수·검토'],['사건 상태','NOA','업무 조건'],['근거·판본','NOA','권한 내 근거 조회'],['NOA','규칙·조회','허용 도구 요청'],['규칙·조회','NOA','계산·조회 결과'],['NOA','담당 확정','근거·불확실성·제안'],['담당 확정','공식 처리','별도 권한·연계 확인'],['공식 처리','결과 대사','실제 결과 재조회'],['결과 대사','사건 상태','상태 갱신·재계획']]},
 service:{actors:[id==='MR-02'?'주민·상담원':'제출·협력 주체','NOA·허용 도구',authority,'공식 원천·협력기관'],normal:p.change.steps,decision:'근거·조건·권한 충족 여부',exception,waiting:'확인 불가·권한 미확보 → 보완/대기',finish:official},
 data:{source,key,transforms:['원문·판본·처리근거 고정','개인 식별 분리·필요항목 추출','조건·증거·원문 위치 연결','검토안·수정이유·확정 기록','공식 결과 참조·대사','비식별 집계·측정'],privacy,output:p.change.prepared,stores:['제한 원문·식별 보호영역','권한 내 검토·근거 영역','공식 원천 / 승인된 결과 참조'],retention:'목적별 보존·삭제 조건은 기관 규정·처리근거 확인 후 확정. 삭제/정정은 검색·추출·백업 범위를 함께 검토.'},
 environment:{precondition,groups:common.environment,unconfirmed:['실제 제품 build·사용권','서버 여력·동시성','원천 API·조회/쓰기 권한','보존기간·복구목표·통신비'],fallback:id==='MR-02'?'기존 전화·수기 배정 복귀 후 요청ID 대사':'승인 파일·수기 검토 복귀 후 사건ID 대사'}};
});
const productSources=[
 {id:'CCK-NOA',title:'CCK 공식 Noa 제품 소개',url:'https://www.ccksolution.com/noa',date:'게시일 미표시',checked:'2026-10-06',locator:'문서 이해·업무 수행·정책/승인/이력 소개',level:'공급사 공개 설명',limit:'TS 설치 build·SDK·실제 연계·성능은 별도 검증 대상.'},
 {id:'CCK-GRANTEE',title:'CCK Grantee v1.0 제품 설명자료',url:null,date:'원문 발행일 미표시',checked:'2026-10-06',locator:'2쪽: Noa 위 연동·대사·검증조서 / 3쪽: 수집·추출·대사·보고와 비정산 업무 확장',level:'공급사 원문 도판 2·3쪽 육안 대조',limit:'범용 대사엔진의 TS 업무별 재사용은 설계 후보. 홍보 성능·전수·즉시알림을 TS 실적으로 전이하지 않음.'},
 {id:'CCK-BACKEND',title:'Argus·Keeper·Nexus·Mothership 제품 설명·코드 분석 보존자료',url:null,date:'Argus 2026-04-23 / 기타 2026-04-20',checked:'기존 2026-10-01 판독기록 참조',locator:'skill-pms G04·제품 재사용 표',level:'기존 제품문서 판독 기록',limit:'이번 작업에서 실제 source commit·build를 실행한 결과가 아님. NOA 결합·TS 납품·사용권 미확인.'},
 {id:'CCK-CONTRACT',title:'현재 계약·Agentic OS 경계',url:null,date:'사용자 확인',checked:'본 대화',locator:'Agentic OS는 현재 계약·기술협상 범위 미포함이라는 사용자 답변',level:'사용자 확인',limit:'기술 부재 판정이 아닌 계약 경계. 계약 원문·인수 범위 대조 필요.'}
];
const products=[
 ['기구축 TS AI 공통플랫폼','공통 진입·인증·기존 모델/자료·서비스 연결 재사용 후보','설치 build·계약·인수·권한을 대조. 처별 별도 플랫폼 신설을 전제하지 않는 확장.'],
 ['NOA','Workspace·Skills와 사건별 계획·도구 요청·결과 검증·재계획의 중심','Workspace/Skills는 제품 설명. 조직 Case·승인·원천 연계·Agentic OS 추가범위는 검증·개발 대상.'],
 ['aRDa','허용 원문·판본·조직지식·문서권한 공급 후보','원문과 추출값·색인의 lineage/ACL 유지. API·판본 반환·검색 범위·사용권 확인.'],
 ['Grantee','수집·추출·대사·근거 보고 엔진의 업무별 재사용 후보','NOA가 검증 과업을 넘기고 대사결과·원문 근거를 반환받는 설계. 업무기준·필드·정답셋·규칙 추가. DRT에서는 이동조건·기록 대사에 한정하며 보조금 감사 제외.'],
 ['Argus·Keeper','계획/실행·Task 상태·중단/재개 구현 후보','기존 설명자료의 기능을 참조. NOA 내부 결합·지속 실행·멱등·승인 유효성은 build 시험 후 확정.'],
 ['Nexus·기존 로컬 LLM','모델 호출·배포판 연결 후보','기존 모델 Gateway 재사용 여부부터 확인. 별도 Gateway 구매·신규 모델학습 선결 금지.'],
 ['기존 인증·Mothership','SSO·역할·기관/사건 권한 연계 후보','TS 기존 인증을 기준으로 자료/검색/요약/실행/내보내기 권한 적용. 제품 별도 설치는 미확정.'],
 ['기존 업무시스템·ERP/전문도구','공식 원장 조회·정형 계산·권한 있는 실제 처리','공식 결과의 기준 원천. ERP는 필요한 과제에만 적용. 쓰기는 별도 권한·승인·멱등·read-back 확인 후 허용.']
];
for(const p of projects){
 p.products=products;
 p.resultMode=['MR-02','EX05-01'].includes(p.id)?'승인된 실행·결과 재조회 후보':p.id==='EX11-01'?'초기 ERP 조회·검토안 인계 / 쓰기 실행은 별도 후속 후보':'검토 확정·기존 절차 인계·결과 참조';
 p.overall.nodes=[
 {id:'source',label:p.source,role:'허용 원천'},
 {id:'platform',label:'기구축 TS AI 공통플랫폼',role:'기존 진입·서비스 재사용'},
 {id:'identity',label:'기존 인증·사건별 권한',role:'권한 통제'},
 {id:'case',label:'사건·판본·완료조건',role:'추가 상태 관리'},
 {id:'noa',label:'NOA · '+p.ai,role:'계획·검증·재계획'},
 {id:'knowledge',label:'aRDa·기존 원문 저장소 후보',role:'원문·판본·ACL'},
 {id:'grantee',label:'Grantee 근거 대사 후보',role:'조건–증거–결과 대응 검증'},
 {id:'tool',label:p.tool,role:'既存 규칙·전문도구'.replace('既存','기존')},
 {id:'task',label:'Argus·Keeper 후보',role:'과업 실행·지속 상태'},
 {id:'model',label:'Nexus·기존 로컬 LLM 후보',role:'모델 호출'},
 {id:'human',label:p.authority,role:'공식 판단·확정'},
 {id:'official',label:p.resultMode,role:'기존 절차·원장·기관'},
 {id:'reconcile',label:'공식 결과·완료 증거 대사',role:'실제 결과 확인'},
 {id:'log',label:'실행기록·수정이유·잔여과업',role:'추적·복구'}
 ];
 p.overall.edges=[
 ['identity','platform','사용자·업무 권한'],['platform','case','과제·사건 선택'],['source','knowledge','허용 조회·반입'],['knowledge','noa','권한 내 근거·판본'],['noa','knowledge','허용 근거·판본 조회 요청'],['case','noa','목적·조건·Task'],['noa','task','유효 계획·허용도구'],['task','noa','실행 상태·결과·복구정보'],['noa','grantee','과업의 근거 대사 요청'],['knowledge','grantee','최소화된 업무 증거'],['grantee','noa','대사결과·근거·미확인'],['noa','tool','조회·전문 계산 요청'],['tool','noa','검증된 결과·한계'],['noa','model','허용 문맥의 모델 요청'],['model','noa','추론결과'],['noa','human','제안·보완·불확실성'],['human','official','판정/인계 또는 별도 승인된 실행'],['official','reconcile','공식 결과·회신·실제 증거 참조'],['reconcile','noa','완료조건 대사·재계획'],['reconcile','case','확정 상태·잔여과업'],['case','log','사건/계획 변경이력'],['noa','log','허용 계획·근거·검증 기록'],['log','noa','사건별 허용 기록 조회'],['reconcile','knowledge','허용 확정 근거 재축적']
 ].map(([from,to,label])=>({from,to,label,conditional:from==='human'&&to==='official'}));
 p.e2e=[['진입·업무 선택','기구축 TS AI 공통플랫폼',p.id+'·사건ID·사용자 역할·업무 목적 확인'],['근거 구성','aRDa·기존 원문 저장소',p.source+'의 판본·원문 위치·ACL·처리근거 연결'],['과업 편성','NOA / Argus·Keeper 후보',p.ai+'에 필요한 질문·Task·완료조건·허용도구 계획'],['근거 대사','Grantee 재사용 후보','업무조건–제출증거–공식기록의 대응·누락·상충 및 원문 근거 반환. 계산·최적화 담당 제외.'],['정형 처리·전문 계산','기존 규칙·전문도구',p.tool+'. Grantee 대사와 독립된 도구 결과를 NOA가 함께 검토.'],['검토·확정',p.authority,'미확인·반론·보완과업 검토. 공식 권한자가 결정'],['기존 절차 연결','기존 원천 Adapter',p.resultMode+'. 쓰기가 필요한 경우에만 승인·권한·입력판본·중복·결과조회 확인. 미확보 시 인계/수기 검토.'],['결과 대사','공식 원문·업무원장 / NOA','목표 결과: '+p.completion+'. 검토 결정·회신·실제 처리와 대조'],['축적·재계획','aRDa·사건 상태·실행기록','확정 근거·수정이유·잔여과업 재사용. 실패/변경은 NOA 다음 계획으로 환류']];
}
const byId=Object.fromEntries(projects.map(p=>[p.id,p]));
byId['EX06-01'].boundary='배포 권한자는 별도. 실제 설치·사용권·인수 범위와 추가 수행범위를 대조한 뒤 적용범위 확정.';
function prompt(p,type){
 const style=`ONE finished 16:9 landscape PPT technical diagram, white, navy/teal blue, crisp flat boxes and orthogonal arrows, large legible Korean sans-serif. No decorative illustration, tiny text, fake logo, invented APIs/specifications or actual implementation claim. Title "${p.id} ${p.shortTitle} — ${labels[type]}". Top context "기구축 TS AI 공통플랫폼 확장안". Footer "설계안 · 제품·연계·권한 확인 전". Use ONLY this project's labels, never other project IDs. Products are reuse/integration candidates. Existing platform is reused; separate new platforms or purchased servers are not proposed. Human official authority required. 10–12 major blocks maximum.`;
 const optional=p.id==='MR-02'?'DRT: initial staff record or approved transcript only; first scope query/proposal. Driver acceptance and actual pickup distinct. No subsidy audit or fraud detection.':p.id==='EX11-01'?'INITIAL scope: ERP read-only query, evidence comparison and staff review proposal hand-off. ERP draft registration is a SEPARATE FUTURE SCOPE, excluded initially, even if a connector is available. No payment/closing/cancellation.':p.id==='EX21-01'||p.id==='EX22-01'?'This project currently HOLD: show "자료·범위 확정 대기" before service.':'';
 if(type==='overall')return style+` Spatial FUNCTIONAL ARCHITECTURE, not sequence. Left source "${p.source}". Large central existing-platform enclosure with 3 layers: top "업무 화면·사건 상태" and "NOA 계획·검증" (subtitle "${p.ai}"); middle "Grantee 대사 후보", "규칙·조회 도구" (subtitle "${p.tool}"), "Argus·Keeper Task 후보"; bottom "aRDa 원문·판본 후보", "Nexus·로컬 LLM 후보", "실행기록". Right "${p.authority}" human gate then separate "공식 결과 원천". Arrows source→aRDa→NOA; UI→NOA; NOA↔Grantee and rules; NOA→human gate; human→official source dashed "권한 확인 후 인계"; official→NOA "결과 재조회" then NOA→aRDa/Case "대사·재계획". No direct tool-to-official write bypassing human. Bottom cross-layer "기존 인증·사건별 권한". Add ${optional}`;
 if(type==='service')return style+` FOUR horizontal swimlanes and time left→right: "${p.service.actors.join('", "')}". Across stages ${p.steps.map((s,i)=>`${i+1}. ${s}`).join(' → ')}. Products integrated where relevant: platform input, aRDa evidence, NOA plan, Grantee/규칙도구 comparison. Explicit diamond "조건·근거 충족?": YES arrow only→"${p.authority} 확정"→"공식 결과 확인". NO arrow→"보완·재계획"→earlier review. A SEPARATE branch from any unavailable authority/query→"권한 미확보·확인불가 대기"; never make YES point to waiting. Exception label "${p.exception}". Last stage "${p.service.finish}" feeds NOA replan if incomplete. No system-layer boxes. ${optional}`;
 if(type==='data')return style+` DATA LINEAGE, not workflow or product stack. Left input "${p.source}"; protected cylinder below "제한 원문·식별정보". Main top path: "aRDa 원문·판본 후보"→"최소화·대체키"→"조건·증거 연결"→"NOA 검토안"→"담당 확정 기록"→"공식 결과 대사"→"비식별 측정". Separate Grantee candidate under evidence link with two-way evidence/findings arrows. Official source cylinder above result reconciliation supplies "재조회"; it does not come from AI draft. Key banner "${p.key}". Privacy banner "${p.privacy}". Protected cylinder connects only to authorized minimization; no raw identity into NOA. Lifecycle right "보존·정정·삭제". Minimal readable labels only. ${optional}`;
 return style+` DEPLOYMENT/REQUIREMENTS diagram, not process. Precondition top "${p.precondition}". Left one "허용 업무 단말" through "기존 인증·사건 권한" into institutional network boundary "기관 업무망·기존 로컬 환경". Inside 3 runtime blocks "NOA / Argus·Keeper 후보", "Grantee·규칙 Adapter 후보", "Nexus·로컬 LLM 후보"; 2 cylinders "aRDa 원문·판본 후보", "사건·실행기록". External right existing source "${p.source}" line "승인 조회 / 쓰기 별도 확인". Bottom three boxes "시험·운영 구분", "판본·배포 통제", "백업·수동 복귀". Right checklist "확인 필요: build·사용권 / 서버 여력 / API·자료권한 / 보존·복구목표". Do not add CPU/RAM/GPU counts, ports, OS/DB products or zero-cost performance claims.${p.id==='MR-02'?' Dashed optional block "전화·STT·지도·문자 / 선택·요금 확인".':''} ${optional}`;
}
module.exports={common,productSources,products,types,labels,projects,byId,prompt};
