'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const d=require('../src/ts-org-scenario-catalog.cjs'),rules=require('../src/ts-organization-rules.cjs'),p=require('../src/ts-ax-portfolio-2027.cjs'),lit=require('../src/org-native-literature.json'),exp=require('./export-ts-org-scenarios.cjs');
assert.equal(d.scenarios.length,rules.entries.length);assert.equal(new Set(d.scenarios.map(s=>s.id)).size,57);assert.equal(d.basis.sha256,rules.source.sha256);
const packages=new Set(p.common.map(x=>x.id)),testIds=new Set(lit.tests.flatMap(t=>t.existingTests)),arch=new Set(lit.architecture.map(a=>a.id));
for(const s of d.scenarios){assert.equal(s.serviceFlow.length,6);assert.equal(s.returnFlows.length,3);assert.equal(s.steps.length,8);assert.equal(s.tests.length,3);assert.equal(s.requirements.length,5);assert.ok(p.byId[s.strategy]);assert.ok(s.strategyReason);assert.equal(rules.bindings.find(n=>n.code===s.lead).entryId,s.entryId);assert.ok(s.costRule.includes('C27-COM'));
 for(const r of s.dutyRefs){const org=rules.bindings.find(o=>o.code===r.code);assert.equal(r.name,org.name);assert.equal(r.entryId,org.entryId);assert.equal(r.locator,org.locator);assert.ok(r.quotes.length);for(const q of r.quotes)assert.ok(org.duties.includes(q),s.id+' source mismatch '+q);}
 const nodes=s.lanes.flatMap(l=>l.nodes),ids=new Set(nodes.map(n=>n.id));assert.equal(ids.size,nodes.length);for(const [a,b,v] of s.edges){assert.ok(ids.has(a)&&ids.has(b));assert.ok(v);}
 for(const x of s.steps){for(const k of ['actor','input','action','output','response','state','delta','exception'])assert.ok(x[k],s.id+' '+x.id+' '+k);x.technology.forEach(i=>assert.ok(p.technologyById[i]));x.packages.forEach(i=>assert.ok(packages.has(i)));x.tests.forEach(i=>assert.ok(testIds.has(i)));x.architecture.forEach(i=>assert.ok(arch.has(i)));}
 s.tests.forEach(t=>{assert.ok(t.input&&t.expected);t.existing.forEach(i=>assert.ok(testIds.has(i)))});
}
assert.equal(new Set(d.scenarios.map(s=>JSON.stringify(s.edges))).size,57,'업무별 데이터 흐름 차이');
assert.equal(d.coverage.length,rules.bindings.length);assert.equal(d.coverage.filter(n=>n.scenarioId).length,132);assert.equal(d.coverage.filter(n=>!n.scenarioId).length,95);assert.deepEqual(d.scenarios.map(s=>s.entryId).sort(),rules.entries.map(e=>e.id).sort());
for(const n of rules.bindings){const c=d.coverage.find(x=>x.code===n.code);assert.ok(c);if(n.entryId){const s=d.scenarios.find(x=>x.id===c.scenarioId);assert.equal(s.entryId,n.entryId);assert.ok(s.applicableOrgs.some(o=>o.code===n.code));assert.equal(c.restriction,n.restriction);}else assert.equal(c.scenarioId,null);}
for(const x of d.strategyIndex)assert.ok(x.scenarioIds.length,x.id);

assert.deepEqual([...new Set(d.scenarios.flatMap(s=>s.steps.flatMap(x=>x.packages)))].sort(),[...packages].sort());
const hr=d.scenarios.find(s=>s.id==='handover');assert.ok(hr.requirements.find(x=>x.id==='HR-D5').action.includes('최초 미제출 오류'));assert.ok(hr.steps.find(x=>x.id==='05').exception.includes('이전 담당의 만료 권한 복원 금지'));
assert.ok(d.scenarios.find(s=>s.id==='budget').close.includes('지출·분개 승인과 분리'));
assert.ok(d.reuseBoundary.find(r=>r.id==='R1').verify.includes('개인 대화공간'));
const str=JSON.stringify(d);for(const re of [/C:\\Users/i,/G:\\/,/file:\/\//,/sk-[A-Za-z0-9]{20}/])assert.ok(!re.test(str),'private data');
for(const [name,v] of Object.entries(exp.files()))assert.equal(fs.readFileSync(path.join(__dirname,'../dist/downloads',name),'utf8'),v);
const ui=fs.readFileSync(path.join(__dirname,'../src/OrgNativeDesign.jsx'),'utf8');assert.equal((ui.match(/<OrgWorkScenarios\/>/g)||[]).length,1);assert.ok(!ui.includes('d.examples.map'),'구 예시 중복 제거');
console.log('TS 업무 시나리오 통과: 57업무·456단계·285자료·171시험·132조직·직제 원문·고유 데이터흐름·재사용/추가분·기존6과업·단일본문·다운로드 정합');