// 과거 원장은 보존하고, 근거 재검증 이후 유효한 표시값만 투영.
const original=require('./impact.json'),revised=require('./solutions-47.json');
const data=JSON.parse(JSON.stringify(original));
for(const [code,d] of Object.entries(data.departments))for(const m of d.metrics){
 m.target=null;m.exampleBaseline=null;m.baselineStatus=revised.departments[code].baseline;
 m.targetStatus='기준선 확보 전 목표 미설정';
 m.model='과거 가정 비중·성공률로 계산한 목표는 현재 제안에 적용하지 않음. 기준선과 최소 의미 개선폭을 별도 합의.';
 m.evidenceLevel='이전 지표 정의 참고 · 목표 수치 철회 · 최신 과제 측정설계 우선';
}
module.exports=data;
