'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const ax=require('../src/ax-casebook.cjs'),platform=require('../src/platform-casebook.cjs'),insights=require('../src/case-insights.cjs'),followup=require('../src/strategy-followup.cjs'),work=require('../src/all-department-work.cjs'),storage=require('../src/strategy-prompt-storage.cjs');
const cases=[...ax.cases,...platform.cases];
const designs=require('../src/case-designs.cjs');
assert.equal(Object.keys(designs.byId).length,57);
assert.equal(Object.values(designs.byId).filter(d=>d.rfp).length,10);
for(const d of Object.values(designs.byId)){
 assert.equal(d.narrative.length,3);for(const s of d.narrative)assert.ok(s.length>60,d.id+' narrative');
 if(d.rfp)assert.ok(d.requirements.length>=3);
 for(const r of d.requirements){assert.ok(r.id&&r.locator&&r.summary&&r.data&&r.acceptance);for(const id of r.components)assert.ok(d.service.components.some(n=>n.id===id));}
 for(const f of d.service.figures){assert.ok(f.explanation.read.length>50&&f.explanation.connection.length>40);for(const id of f.explanation.requirements)assert.ok(d.requirements.some(r=>r.id===id));}
 const a=d.service;assert.equal(a.components.length,12);assert.equal(a.interfaces.length,6);
 for(const [s,t] of a.edges)assert.ok(a.components[s]&&a.components[t]);
 for(const f of a.figures){assert.ok(fs.existsSync('public/'+f.path));assert.equal(require('node:crypto').createHash('sha256').update(fs.readFileSync('public/'+f.path)).digest('hex'),f.sha256);}
 assert.equal(fs.readFileSync('dist/assets/casebook-designs/'+d.id+'.svg','utf8'),require('./export-case-architecture.cjs').svg(d));
}
assert.equal(require('../src/case-source-figures.json').length,13);
assert.equal(Object.values(designs.byId).reduce((n,d)=>n+d.requirements.length,0),61);
for(const c of cases){const d=designs.byId[c.id];assert.equal(d.nodes.length,6);assert.equal(d.sequence.length,4);assert.equal(d.benchmark.functions.length,5);assert.ok(d.benchmark.normal&&d.benchmark.exception&&d.benchmark.evidence);assert.ok(d.status.includes(d.rfp?'RFP':'추론'));for(const [a,b] of d.edges)assert.ok(d.nodes.some(n=>n.id===a)&&d.nodes.some(n=>n.id===b));}
for(const p of followup.plans){const related=designs.relatedCases(p);assert.equal(new Set(related.map(c=>designs.canonical(c.id))).size,related.length);}
for(const c of platform.cases)assert.notEqual(c.apply,c.delta,c.id+' 시사점·개발 문장 중복');
assert.equal(cases.length,57);assert.equal(Object.keys(insights.byId).length,57);
for(const c of cases){const s=insights.byId[c.id];assert.ok(s,c.id);assert.equal(s.success.length,2);assert.equal(s.risks.length,2);assert.equal(s.architecture.length,4);assert.equal(s.transfers.length,4);assert.ok(s.control&&s.analysis&&s.diagramBasis);}
for(const c of platform.cases){assert.ok(insights.platformStrategies[c.id].length);for(const id of insights.platformStrategies[c.id])assert.ok(followup.byId[id]);}
assert.equal(followup.plans.length,12);
for(const p of followup.plans){
 assert.equal(p.phase,p.id==='ST-04'?'1차 공통 기반':'공통 기반 인수 후 부서별 적용');
 assert.equal(p.requirement,ax.mappings.find(m=>m.id===p.id).requirement);assert.equal(p.steps.length,4);
 for(const b of p.departments)for(const w of b.workItems){const original=work.byId[w.id];assert.ok(original);assert.equal(original.code,b.code);assert.equal(original.text,w.text);assert.equal(original.locator,w.locator);assert.deepEqual(original.requirements,w.requirements);}
 for(const r of p.reuseItems)assert.ok(ax.assets.some(a=>a.id===r.assetId));
 assert.ok(p.acceptancePlan.sample&&p.acceptancePlan.criterion&&p.acceptancePlan.evidence);assert.equal(p.acceptancePlan.execution,'미실행');
 const prompt=followup.prompt(p.id);assert.ok(prompt.includes(p.requirement)&&prompt.includes(p.test));assert.ok(prompt.includes('공식 ID·효력일'));assert.ok(prompt.includes('재사용 후보'));assert.ok(prompt.length<50000);
}
// 저장 격리·빈 편집본·손상 저장본·용량/권한 오류·정책 버전 처리.
const entries=new Map(),memory={getItem:k=>entries.get(k)??null,setItem:(k,v)=>entries.set(k,v)};
assert.equal(storage.read(memory,'ST-01','기본').text,'기본');
assert.ok(storage.write(memory,'ST-01','사용자 편집').ok);assert.equal(storage.read(memory,'ST-01','기본').text,'사용자 편집');assert.equal(storage.read(memory,'ST-02','다른 전략').text,'다른 전략');
assert.ok(storage.write(memory,'ST-01','').ok);assert.equal(storage.read(memory,'ST-01','기본').text,'');
memory.setItem(storage.key('ST-03'),'broken');assert.ok(storage.read(memory,'ST-03','기본').error);assert.equal(memory.getItem(storage.key('ST-03')),'broken');
memory.setItem(storage.key('ST-03'),JSON.stringify({version:99,text:'미래 버전'}));assert.ok(storage.read(memory,'ST-03','기본').error);
assert.equal(storage.write({setItem(){throw new Error('quota');}},'ST-01','내용').ok,false);assert.ok(storage.read({getItem(){throw new Error('blocked');}},'ST-01','기본').error);
assert.equal(storage.write(memory,'ST-01','x'.repeat(50001)).ok,false);
const app=fs.readFileSync('src/App.jsx','utf8');assert.ok(app.includes('||isPromptBoard;'));assert.ok(app.includes('<StrategyPromptBoard key={route}/>'));
console.log('사례 심층 분석 57건·공식 업무 연결 12개 전략·프롬프트 격리 저장/오류 처리 검증 통과.');
