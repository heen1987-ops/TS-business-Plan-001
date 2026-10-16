'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),d=require('../src/ax-casebook.cjs'),p=require('../src/platform-casebook.cjs'),plan=require('../src/delivery-plan.cjs'),org=require('../src/organization-site.cjs');
assert.equal(d.cases.length,26);assert.equal(d.mappings.length,12);assert.equal(p.cases.length,31);assert.equal(p.elements.length,12);
for(const c of d.cases){assert.ok(c.fact&&c.limit&&c.flowBasis&&c.local&&c.delta&&c.test&&c.metric);assert.equal(c.flow.length,4);for(const id of c.sources)assert.ok(d.sources.some(s=>s.id===id));for(const id of c.assets)assert.ok(d.assets.some(a=>a.id===id));}
for(const region of ['국내','해외']){assert.ok(d.cases.some(c=>c.region===region&&c.result==='성공'));assert.ok(d.cases.some(c=>c.region===region&&c.result==='실패'));}
for(const m of d.mappings){assert.ok(m.caseRefs.length);for(const r of m.caseRefs){assert.ok(d.getCase(r.caseId));assert.ok(['직접 업무 유사','방법론 참조','실패 통제 참조'].includes(r.type));}for(const t of m.tests)assert.ok(org.acceptance.some(a=>a.id===t));assert.equal(m.effectStatus,'기대 방향 · TS 실측 전');assert.equal(m.test,m.requirement.replace('-R','-T'));}
for(const c of p.cases){assert.ok(c.url?/^https?:\/\//.test(c.url):c.basis); assert.ok(c.diagramBasis&&c.limit&&c.apply);assert.equal(c.nodes.length,4);}
for(const e of p.elements)for(const id of e.caseIds)assert.ok(p.cases.some(c=>c.id===id));
assert.deepEqual(plan.rows.flatMap(r=>r.tests.map(t=>t.id)).sort(),org.acceptance.map(t=>t.id).sort());assert.equal(plan.rows.length,6);
for(const [name,body] of Object.entries(require('./export-casebooks.cjs').files()))assert.equal(fs.readFileSync('dist/downloads/'+name,'utf8'),body);
for(const file of ['ts-ax-casebook.pptx','ts-platform-casebook.pptx'])assert.ok(fs.statSync('dist/downloads/'+file).size>10000);
const header=fs.readFileSync('src/OrganizationSite.jsx','utf8');assert.ok(!header.includes('on-workmap-link'));assert.ok(header.includes("to={'index.html?view=strategy&strategy='+s.id}"));
assert.ok(!header.includes('OrganizationQuickFind'));assert.ok(header.includes('index.html?view=strategy-prompts'));assert.ok(!header.includes('제안서 내려받기'));
require('./check-case-insights.cjs');
const workspace=fs.readFileSync('src/OrganizationWorkspace.jsx','utf8');assert.ok(workspace.includes('<OrganizationExplorer route={route} navigation={navigation}/>'));assert.ok(workspace.includes('<WorkMapWorkspace route={route} navigation={navigation}/>'));
console.log('사례집·통합 UI 검증 통과: 전략 12개, AX 사례 26개, 플랫폼 사례 31개, 구성요소 12개, 구축 6개/검수 12개 보존.');

const catalog=require('../src/case-catalog.json');assert.equal(catalog.records.length,2637);assert.equal(new Set(catalog.records.map(r=>r.id)).size,2637);assert.equal(catalog.records.filter(r=>r.country==='대한민국').length,110);assert.equal(catalog.records.filter(r=>r.platform).length,276);
