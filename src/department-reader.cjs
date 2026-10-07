// 표시용 문장 분리·미작성 처 확인계획. 설문 질문 원본·근거 원장은 불변.
const discoveryOperations={
 'katri-research-planning':['연구기획·과제편성·조정·성과 이관의 실제 담당 범위 및 최근 편성·변경 사례 확인','다른 연구처·본사 기획·예산 조직의 판단 책임 및 기존 관리 기능 확인','반복 재검토의 자료·판단 원인과 정형 개선으로 충분한 사례 확인'],
 'katri-research-support':['자원·계약·시험 지원 업무 한 건의 요청·배정·완료 과정 확인','실험부서·계약·자산 부서·시설 운영자의 역할 및 기존 도구 처리범위 확인','지원 지연의 자료 이해 문제와 자원·재원·공급 부족 원인의 구분 근거 확인'],
 'katri-defect-policy':['결함정보 접수·분류·정책·리콜의 실제 담당 단계와 조사처 인계 사례 확인','안전결함 신고와 개별 수리·교환·환불 요구의 구분 및 관계기관 책임 확인','맥락·사실관계 구성의 문제와 단순 필드 개선으로 해결되는 문제 확인'],
 'katri-defect-investigation1':['조사1처·조사2처의 사건·차량·분야 구분 기준과 조사 증거·시험·결과의 연결 확인','공동 사건·외부 판단의 인계 기준 및 기존 조사 관리 지원범위 확인','반복 요청의 추가 공학시험·자료 부족·증거 해석 원인 구분'],
 'katri-defect-investigation2':['조사2처 사건 범위 및 조사1처·외부기관 공동 처리의 자료 교환 확인','자료 중복·누락의 실제 발생 여부와 사건 관리·식별키 정비로 충분한 사례 확인','공식 조사·전문시험 책임을 유지한 추가 문서 검토 필요 지점 확인'],
 'katri-future-research':['담당 연구분야·성과 이관 한 건의 적용조건·한계 확인','미완료 연구·추가 공학시험과 기존 성과 정보화 적용의 구분 기준 확인','자료·검증과업 조정의 실제 부담과 정형 관리만으로 충분한 사례 확인'],
 'katri-parts-research':['부품 자기인증·조사·시험·사후관리의 실제 담당 업무 및 제품·시험회차 결과 확인','본사 시험인증처·센터·외부 인증기관 역할과 기존 정보관리 경계 확인','제품 판본·조건·증빙 대조의 어려움과 추가 성능시험 문제의 구분'],
 'katri-autonomous-research':['연구·평가·제도지원의 실제 담당 범위 및 시나리오·조건 변경 사례의 시험·결과 확인','실증처·시험시설·외부 전문기관의 판단 책임 및 기존 시나리오 관리범위 확인','추가 검증질문 필요 지점과 단순 판본·식별자 관리로 충분한 지점 확인'],
 'katri-connected-research':['현재 연구·검증 대상 및 소프트웨어·통신·보안 판본을 맞춘 처리 사례 확인','기술시험·보안 전문검증과 문서·업무지원의 경계 및 기존 관리 기능 확인','조건·증거 연결 문제와 실제 기술성능 문제의 구분 및 추가 검토 가능성 확인'],
 'katri-autonomous-demonstration':['현재 자율주행실증처·과거 K-City연구처 표기의 관계 및 시설운영·시험·실증 분장 확인','다른 연구처·기업·시설 운영자의 역할과 현행 예약·시험 지원 기능 확인','준비 부족·조건 변경·결과 해석 부담과 시설·공급 제약의 구분'],
 'katri-vehicle-certification':['기술검토·안전검사·제원통보의 실제 담당 및 신청·보완·검사·결과 사례 확인','기존 자동화 프로그램 지원항목과 제작사·타기관의 공식 책임 확인','추가 문서 1차 검토와 실차검사·전문 판단이 필요한 항목의 구분'],
 'katri-construction-certification':['형식·시험·검사·인증의 실제 수행범위·법정 위탁·판정 주체 및 신청결과 확인','현행 신청·검토·시험 관리와 관계기관 담당 단계 확인','반복 보완의 조건·자료 해석 원인과 추가 시험·설비 제약의 구분']
};
function displayLines(value){return(Array.isArray(value)?value:String(value||'').split('\n')).flatMap(line=>String(line).split(/(?<=[가-힣)\]])\.\s+(?=[가-힣‘“「〈])/u)).filter(Boolean);}
function forTopic(topic,key){const b=topic?.briefing;if(!b)return null;const operations=topic.discovery&&discoveryOperations[key];if(!operations)return b;return{...b,why:['처 명칭만으로 반복 보완·누락·AI 수요를 배정하는 오류 예방. 실제 처리 한 건에 근거한 업무·문제 확인',...operations.slice(0,2)],steps:b.steps.map((step,i)=>({...step,operation:operations[i]})),...(key==='katri-future-research'?{known:['공식 조직명·상위 조직 확인','실제 세부 업무분장 미확인','요구자료·담당자 설명을 통한 처리 단계·기존 기능·불편 유무 확인']}:{} )};}
function aliasFor(id,topic){if(!topic)return null;const prefix='survey-topic-'+topic.id+'-';if(!id.startsWith(prefix))return null;const suffix=id.slice(prefix.length),key=({purpose:'basis',process:'inputs',technology:'how',conditions:'conditions',effects:'metrics'})[suffix]||(/^work-\d+$/.test(suffix)?'how':null);return key?'department-detail-'+topic.id+'-'+key:null;}
module.exports={aliasFor,date:'2026-10-07',discoveryOperations,displayLines,forTopic};
