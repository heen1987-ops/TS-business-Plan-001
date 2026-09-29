// 2026-09-24의 읽기 구조에 최신 근거·설계 정본을 배치. 과거 가설·목표 수치 재사용 금지.
const {definitions}=require('./reading-structure.cjs');
const chapters=definitions.map(({id,title,intro})=>({id,title,intro}));
const blocks=[
 ['definition','context','사업 정의와 추진 목적','담당 업무·수혜자·처리 단위·적용 장소·시점의 연결'],
 ['evidence','change','현행 기반과 확인된 근거','공식 자료가 말하는 범위와 아직 검증할 문제의 분리'],
 ['concept','change','해결 컨셉과 도입 범위','문제·해결 능력·기관과 국민의 편익 연결'],
 ['products','change','제품·추가 개발·기존 시스템 역할','CCK 활용 범위와 일반 SI·규칙 처리의 구분'],
 ['journey','service','서비스 흐름과 업무 사례','사용자 요청부터 담당자 판단·결과 확인까지의 진행'],
 ['process','service','단계별 처리 명세','업무별 입력·처리·완료 산출물 확인'],
 ['state','service','상태·보완·예외 처리','완료 조건과 변경·실패 발생 시 다음 행동 확인'],
 ['overall','design','전체 아키텍처','화면·업무수행·지식·도구·원천 시스템의 연결'],
 ['data','design','데이터 흐름과 원장 책임','원자료부터 공식 결과까지 식별·판본·정합성 확인'],
 ['runtime','design','세부 모듈·인터페이스·실행 설계','논리 구성요소, 상태 전이, 배치·복구 설계의 구체화'],
 ['privacy','responsibility','개인정보 처리와 권한','수집·이용·제공·정정·보존 단계별 통제'],
 ['delivery','outcomes','도입·납품·검수 범위','적용 과업, 실제 연계 조건, 운영 인수 결과의 정의'],
 ['requirements','outcomes','요구사항·RFP·수용시험','기능·화면·데이터·검수와 대가 산정 입력의 연결'],
 ['metrics','outcomes','정량 기대효과와 측정','기준선 확보 후 세 지표의 개선폭과 AI 추가 기여 검증']
].map(([id,chapter,title,lead])=>({id,chapter,title,lead}));
const blockById=Object.fromEntries(blocks.map(b=>[b.id,b]));
const aliases={
 'detail-sixw':'context',purpose:'context',mandate:'context',
 'detail-why':'context',why:'context','detail-evidence':'block-evidence','detail-limits':'block-evidence',
 'detail-method':'block-products','detail-concept':'block-concept',concept:'block-concept',
 'detail-scenario':'block-journey','detail-service':'service','flow-map':'service',replan:'block-state',
 'detail-overall':'block-overall','detail-data':'block-data','detail-interfaces':'block-runtime','flow-data':'block-data',
 'detail-privacy':'responsibility','detail-privacy-lifecycle':'responsibility','detail-access':'responsibility',
 'detail-exceptions':'block-state',implementation:'block-runtime',
 'detail-delivery':'block-delivery','detail-trace':'block-requirements','detail-outcomes':'block-metrics',
 'detail-decisions':'block-delivery','effect-boundary':'block-metrics','measurement-common-0':'block-metrics'
};
function currentTarget(id){if(!id)return null;if(id.startsWith('r47-'))return id;if(aliases[id])return 'r47-'+aliases[id];if(id.startsWith('chapter-')&&chapters.some(c=>c.id===id.slice(8)))return 'r47-'+id.slice(8);if(/-E0[123]/.test(id))return 'r47-block-metrics';return id}
module.exports={chapters,blocks,blockById,currentTarget};
