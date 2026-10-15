'use strict';
const assert=require('node:assert/strict');
const d=require('../src/growth-org-rollout.cjs'),m=require('../src/growth-ministry-map.cjs'),g=require('../src/growth-ai.cjs'),annual=require('../src/annual-work-2027.cjs'),official=require('../src/official-duty-research.cjs');
assert.equal(d.userNeeds.length,4);
assert.deepEqual(d.priorityStages.map(s=>s.order),[1,2,3,4]);
assert.equal(d.mappingContract.length,8);
assert.equal(d.acceptance.length,8);
assert.deepEqual(d.ministryMappings,m.rows);
for(const item of [...d.userNeeds,...d.priorityStages,...d.pilotWorkflows,...d.acceptance]){
 assert.deepEqual(item.testIds,item.requirementIds.map(id=>id.replace('GAI-R','GAI-T')));
 for(const id of item.requirementIds)assert.ok(g.requirements.some(r=>r.id===id),item.id+' '+id);
}
for(const p of d.pilotWorkflows){
 const b=annual.bundles.find(b=>b.id===p.id);
 for(const key of ['name','scope','workflow','lead','partners','costParent'])assert.deepEqual(p[key],b[key],p.id+' '+key);
 assert.equal(p.annualCriterion,b.test);
 assert.equal(p.annualExclusions,b.exclude);
 assert.equal(p.annualGate,b.gate);
 assert.equal(p.annualTestId,b.id+'-T');
 assert.deepEqual(p.organizations.map(o=>o.orgCode),b.codes);
 for(const o of p.organizations){
  const original=official.byOrg[o.orgCode];
  assert.equal(o.path,original.path);
  assert.equal(o.sourceUrl,original.sourceUrl);
  assert.equal(o.observedAt,official.date);
  for(const duty of o.dutyCandidates)assert.ok(original.units.some(x=>x.id===duty.id&&x.text===duty.text&&!x.placement&&!x.scopeReview));
 }
}
assert.deepEqual(m.rows.map(x=>x.id),['TS','IITP','KEIT','EDU','HOSPITAL']);
assert.equal(m.rows.find(x=>x.id==='EDU').relationType,'LOCAL_EDUCATION_AUTONOMY');
assert.equal(m.rows.find(x=>x.id==='HOSPITAL').relationType,'POLICY_DOMAIN_LINK');
for(const row of m.rows){
 assert.ok(row.confirmed.length&&row.unknowns.length&&row.sources.length);
 assert.ok(row.workExamples.every(x=>x.startsWith('설계제안:')));
 for(const source of row.sources){assert.match(source.url,/^https:\/\//);assert.ok(source.readLevel&&source.checkedAt&&source.publishedOrEffective);}
}
const md=g.toMarkdown();
for(const row of d.mappingContract){assert.ok(md.includes(row.rule));for(const field of row.fields)assert.ok(md.includes(field));}
for(const text of Object.values(d.identityDifference))assert.ok(md.includes(text));
for(const item of [...d.userNeeds,...d.priorityStages,...d.acceptance])assert.ok(md.includes(item.title));
for(const row of m.rows)for(const source of row.sources){assert.ok(md.includes(source.url));assert.ok(md.includes(source.publishedOrEffective));assert.ok(md.includes(source.checkedAt));}
console.log('Organization-native design verified: four user needs, four stages, ministry relationship types, TS department/duty source fidelity, W27 scope and GAI acceptance links. Runtime tests remain not_run.');
