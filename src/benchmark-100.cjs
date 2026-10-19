'use strict';
const data=require('./benchmark-100.json');
const rules=require('./ts-organization-rules.cjs');
const strategies=require('./ax-casebook.cjs').mappings;
const byId=Object.fromEntries(data.cases.map(r=>[r.id,r]));
const aliases=Object.fromEntries(data.cases.filter(r=>r.legacyId).map(r=>[r.legacyId,r.id]));
Object.assign(aliases,{AX04:'BM-021',AX06:'BM-020',AX09:'BM-024',AX13:'BM-025'});
const org=code=>rules.bindings.find(r=>r.code===code);
const resolve=id=>byId[id]||byId[aliases[id]];
const coverage=strategies.map(s=>({id:s.id,title:s.strategy,ids:data.cases.filter(r=>r.strategies.includes(s.id)).map(r=>r.id)}));
const counts={all:data.cases.length,platform:data.cases.filter(r=>r.kind==='platform').length,ax:data.cases.filter(r=>r.kind==='ax').length};
const foundation=[
 {title:'조직·업무 사전',body:'공식 직원·조직·직무·업무 ID와 효력일, 겸직·협업·인계 관계',check:'동명이인·전보·조직개편 전후 매핑과 미수락 인계 확인',cases:['BM-101','BM-086','BM-096']},
 {title:'업무 상태·보완 요청',body:'목적 → 필수 입력 → 누락자료 요청 → 보완 → 검토 → 담당자 승인',check:'자료 없는 확답·접수와 승인 혼동·중복 실행 차단',cases:['BM-001','BM-067','BM-089']},
 {title:'권한·근거·판본',body:'검색 전 접근검증, 원문 위치·자료 이용목적·적용 규정·결과 판본',check:'권한 회수·타 사건 자료·옛 규정·목적 외 이용 차단',cases:['BM-028','BM-074','BM-095']},
 {title:'업무효과·중지 기준',body:'생성·검토·수정·인계의 총시간과 실제 업무완료·오류·재작업 측정',check:'블라인드 비교·저신뢰 보류·수동 복귀·운영 책임 확인',cases:['BM-060','BM-069','BM-092']}
];
module.exports={...data,byId,resolve,aliases,org,coverage,counts,foundation};
