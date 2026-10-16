'use strict';
const d=require('../src/all-department-work.cjs');
const csv=rows=>'\ufeff'+rows.map(r=>r.map(v=>'"'+String(v??'').replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"').join(',')).join('\r\n')+'\r\n';
module.exports=()=>({
 'ts-all-department-work.csv':csv([['업무 ID','부서코드','부서','조직경로','업무 원문','출처','출처판본','근거좌표','전략 연결안','연결 방식·근거','추진 구분','AI 기능안','입력자료안','결과물안','기존 기능 재사용 후보','재사용 확인','추가 개발안','요구·검수 ID','검수 기준안','공통 구축','공통 검수','매핑 상태','실행 상태','적용 조건','설계일'],...d.records.map(r=>{const p=d.profiles[r.profileId];return[r.id,r.code,r.department,r.path,r.text,r.sourceKind,r.sourceDate,r.locator,r.strategyLinks.map(s=>s.id).join(' / '),r.strategyLinks.map(s=>s.id+': '+s.method+' / '+s.evidence).join(' ; '),r.phase,p?.ai,p?.input,p?.output,p?.reuse.map(x=>x.feature+': '+x.use).join(' / '),p?.reuse.map(x=>x.check).join(' / '),r.requirements.map(x=>x.development).join(' / '),r.requirements.map(x=>x.id+' → '+x.testId).join(' / '),r.requirements.map(x=>x.testId+': '+x.criterion).join(' / '),r.packages.join(' / '),r.commonTests.join(' / '),r.state,r.execution,r.restriction,d.date];})]),
 'ts-all-department-work.json':JSON.stringify({date:d.date,counts:d.counts,notes:d.notes,strategyCounts:d.strategyCounts,profiles:d.profiles,organizations:d.organizations,records:d.records},null,2)+'\n',
 'ts-all-department-coverage.csv':csv([['조직코드','조직','상위경로','원문 항목 수','자료 범위','하위 조직','적용 조건'],...d.organizations.map(o=>[o.code,o.name,o.path,o.count,o.count?'직제·공개 담당업무 기재':'직접 기재 없음 · 하위 조직 또는 별도 업무분장 연결',o.children.join(' / '),o.restriction])])
});
