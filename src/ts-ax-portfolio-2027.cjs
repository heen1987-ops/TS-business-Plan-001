'use strict';
const data=require('./ts-ax-portfolio-2027.json');
const strategies=require('./strategy-solutions-2027.cjs');
const benchmark=require('./benchmark-100.cjs');
const org=require('./organization-site.cjs');
const rules=require('./ts-organization-rules.cjs');
const priorityById=Object.fromEntries(data.priorities.map(r=>[r.id,r]));
const technologyById=Object.fromEntries(data.technology.map(r=>[r.id,r]));
const common=data.common.map(r=>({...org.packages.find(p=>p.id===r.id),...r}));
const plans=data.plans.map(r=>{
 const strategy=strategies.rows.find(s=>s.id===r.id);
 return {...r,strategy:strategy.strategy,direction:strategy.direction,
  leader:rules.bindings.find(o=>o.code===r.lead),
  departments:[r.lead,...r.collaborators].map(code=>rules.bindings.find(o=>o.code===code)),
  dutyBindings:strategy.dutyBindings,lawIds:strategy.lawIds,basisNote:strategy.basisNote,
  foundation:data.foundationId,packages:strategy.packages,commonTests:strategy.tests,
  requirement:r.id==='ST-04'?'GAI-R01~R12':'AX27-'+r.id+'-R01',
  test:r.id==='ST-04'?'GAI-T01~T12':'AX27-'+r.id+'-T01',
  allCaseIds:benchmark.cases.filter(c=>c.strategies.includes(r.id)).map(c=>c.id)
 };
});
const byId=Object.fromEntries(plans.map(r=>[r.id,r]));
const counts=benchmark.cases.reduce((a,c)=>(a[c.verdict]=(a[c.verdict]||0)+1,a),{});
const caseCoverage=benchmark.cases.map(c=>({id:c.id,title:c.title,verdict:c.verdict,strategies:c.strategies,contribution:c.implication,source:c.sources[0].url}));
const caseLink=id=>'index.html?view='+ (benchmark.byId[id].kind==='platform'?'platform-cases':'casebook')+'&case='+id;
module.exports={...data,common,plans,byId,priorityById,technologyById,counts,caseCoverage,caseById:benchmark.byId,caseLink,strategySource:strategies.source};
