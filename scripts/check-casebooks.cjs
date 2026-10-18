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
const crypto=require('node:crypto'),deckManifest=require('../src/casebook-decks.json'),designs=require('../src/case-designs.cjs'),insights=require('../src/case-insights.cjs'),followup=require('../src/strategy-followup.cjs');
const fingerprint=crypto.createHash('sha256').update(JSON.stringify({ax:d,pf:p,designs,insights,followup:followup.plans})).digest('hex');
assert.equal(deckManifest.fingerprint,fingerprint,'사례집 PPT와 웹 데이터 불일치: PPT 재생성 필요');
for(const deck of deckManifest.decks){assert.equal(crypto.createHash('sha256').update(fs.readFileSync('dist/downloads/'+deck.file)).digest('hex'),deck.sha256);assert.deepEqual(deck.cases.map(c=>c.id),(deck.kind==='platform'?p:d).cases.map(c=>c.id));assert.ok(deck.slides>=deck.cases.length*3+1);}

const header=fs.readFileSync('src/OrganizationSite.jsx','utf8');assert.ok(!header.includes('on-workmap-link'));assert.ok(header.includes("to={'index.html?view=strategy&strategy='+s.id}"));
assert.ok(!header.includes('OrganizationQuickFind'));assert.ok(header.includes('index.html?view=strategy-prompts'));assert.ok(!header.includes('제안서 내려받기'));
require('./check-case-insights.cjs');
require('./check-casebook-synthesis.cjs');
const workspace=fs.readFileSync('src/OrganizationWorkspace.jsx','utf8');assert.ok(workspace.includes('<OrganizationExplorer route={route} navigation={navigation}/>'));assert.ok(workspace.includes('<WorkMapWorkspace route={route} navigation={navigation}/>'));
console.log('사례집·통합 UI 검증 통과: 전략 12개, AX 사례 26개, 플랫폼 사례 31개, 구성요소 12개, 구축 6개/검수 12개 보존.');

const catalog=require('../src/case-catalog.json');assert.equal(catalog.records.length,2637);assert.equal(new Set(catalog.records.map(r=>r.id)).size,2637);assert.equal(catalog.records.filter(r=>r.country==='대한민국').length,110);assert.equal(catalog.records.filter(r=>r.platform).length,276);
const candidates=require('../src/strategy-solution-candidates.cjs'),candidateExport=require('./export-strategy-solution-candidates.cjs');
assert.deepEqual(candidates.rows.map(r=>r.id),Array.from({length:12},(_,i)=>'ST-'+String(i+1).padStart(2,'0')));
for(const c of candidates.rows){assert.ok(c.name&&c.focus&&c.flow.length===4&&c.gate&&c.transfer);assert.ok(candidateExport.caseSource(c.benchmark).url,c.id+' 대표 사례 원문');if(c.caution)assert.ok(candidateExport.caseSource(c.caution).url,c.id+' 위험 사례 원문');assert.ok(require('../src/strategy-followup.cjs').byId[c.id]);}
assert.equal(fs.readFileSync('dist/downloads/ts-strategy-solution-candidates.md','utf8'),candidateExport.markdown());
assert.ok(fs.readFileSync('src/StrategyWorkspace.jsx','utf8').includes('candidates.byId[r.id].name'));
