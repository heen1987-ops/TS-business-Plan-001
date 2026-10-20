'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),d=require('../src/ts-ax-portfolio-2027.cjs'),benchmark=require('../src/benchmark-100.cjs'),org=require('../src/organization-site.cjs'),rules=require('../src/ts-organization-rules.cjs'),e=require('./export-ts-ax-portfolio.cjs');
assert.equal(d.plans.length,12);assert.equal(d.caseCoverage.length,100);assert.equal(new Set(d.caseCoverage.map(c=>c.id)).size,100);
assert.deepEqual(d.priorities.flatMap(p=>p.strategies).sort(),d.plans.map(p=>p.id).sort());
assert.deepEqual(d.plans.filter(p=>p.priority==='P0').map(p=>p.id),['ST-04']);
assert.deepEqual(d.plans.filter(p=>p.priority==='P1').map(p=>p.id),['ST-01','ST-07','ST-10','ST-12']);
assert.equal(Object.values(d.counts).reduce((a,b)=>a+b,0),100);
assert.equal(d.common.length,6);assert.deepEqual(d.common.flatMap(c=>c.tests).sort(),org.acceptance.map(t=>t.id).sort());
for(const c of d.common){assert.ok(c.add&&c.reuse&&c.deliverable&&c.sample&&c.criterion);assert.ok(org.packages.some(p=>p.id===c.id));}
for(const p of d.plans){
 assert.ok(p.leader,p.id+' 주관');assert.ok(p.departments.every(Boolean));assert.ok(p.dutyBindings.some(b=>b.code===p.lead));assert.ok(p.collaborators.every(c=>p.dutyBindings.some(b=>b.code===c)));
 assert.equal(p.foundation,'ON27-BASE / C27-COM');assert.ok(p.scope&&p.reason&&p.delta.length>=3&&p.output&&p.test&&p.requirement&&p.pass&&p.metric&&p.boundary);
 assert.ok(p.cases.length>=3);assert.equal(new Set(p.cases.map(r=>r.id)).size,p.cases.length);
 for(const ref of p.cases){assert.ok(benchmark.byId[ref.id],ref.id);assert.ok(ref.role);}
 for(const [id,use] of p.assets){assert.ok(d.technologyById[id]&&use);assert.ok(d.technologyById[id].evidence&&d.technologyById[id].stage&&d.technologyById[id].boundary);}
 assert.ok(p.allCaseIds.length);for(const id of p.allCaseIds)assert.ok(benchmark.byId[id].strategies.includes(p.id));
 for(const t of p.commonTests)assert.ok(org.acceptance.some(x=>x.id===t));
}
for(const c of d.caseCoverage){assert.deepEqual(c.strategies,benchmark.byId[c.id].strategies);assert.ok(c.strategies.every(id=>d.byId[id]));assert.match(c.source,/^https:\/\//);}
for(const f of d.findings){assert.ok(f.decision&&f.check&&f.finding);for(const id of f.cases)assert.ok(benchmark.byId[id]);}
assert.equal(benchmark.byId['BM-065'].verdict,'통제 확인');assert.equal(benchmark.byId['BM-069'].verdict,'종료·원인 미공개');
assert.match(d.technologyById.T2.boundary,/JET.*회계/);assert.match(d.technologyById.T4.boundary,/운영/);assert.match(d.boundary,/기존 과업/);
assert.match(d.evaluation.truth,/AI 결과 확인 전/);assert.match(d.evaluation.rules,/분모 0/);assert.match(d.evaluation.stop,/기존 절차 복귀/);
for(const [name,body] of Object.entries(e.files())){assert.equal(fs.readFileSync('dist/downloads/'+name,'utf8'),body);assert.doesNotMatch(body,/[A-Z]:[\\/]|file:\/\/|undefined|NaN/);}
const ui=fs.readFileSync('src/StrategyWorkspace.jsx','utf8');assert.ok(ui.includes('<PortfolioDetail id={r.id} showContext={false}/>'));assert.ok(!ui.includes('<CaseLinks strategy={r.id}/>'));assert.ok(ui.includes('<PortfolioOverview/>')&&ui.includes('<PortfolioMethod/>'));
const ax=fs.readFileSync('src/AxCasebook.jsx','utf8');assert.ok(ax.includes('<PortfolioDetail key={id} id={id}/>'));assert.ok(!ax.includes('<FollowupPlan key={id} id={id}/>'));
console.log('TS AX 기획 통과: 100건 연결 · 12개 전략 · P0 단일 공통 기반 · P1 4개 · 6개 공통 과업/12개 기존 검수 · 기술/업무/순증/효과 추적');
