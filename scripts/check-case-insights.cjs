'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const ax=require('../src/ax-casebook.cjs'),platform=require('../src/platform-casebook.cjs'),insights=require('../src/case-insights.cjs'),followup=require('../src/strategy-followup.cjs'),work=require('../src/all-department-work.cjs'),storage=require('../src/strategy-prompt-storage.cjs');
const cases=[...ax.cases,...platform.cases];
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
