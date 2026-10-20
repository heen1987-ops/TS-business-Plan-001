'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const d=require('../src/delivery-plan.cjs'),p=require('../src/proposal-2027.cjs'),m=require('../src/ts-org-module-design.cjs'),e=require('./export-proposal-2027.cjs');
assert.equal(d.rows.length,6);assert.equal(d.followups.length,11);assert.equal(new Set(d.followups.map(x=>x.strategy)).size,11);
assert.ok(!d.followups.some(x=>x.strategy==='ST-04'));assert.equal(d.followups.filter(x=>x.strategy==='ST-08').length,1);
assert.deepEqual(d.rows.flatMap(r=>r.requirements).sort(),p.requirements.map(r=>r.id).sort());
assert.deepEqual(d.rows.flatMap(r=>r.tests.map(t=>t.id)).sort(),p.tests.map(t=>t.id).sort());
for(const x of m.core)assert.ok(d.rows.some(r=>r.modules.includes(x.id)),'공통 실행 모듈 연결 '+x.id);
for(const r of d.rows)for(const k of ['reuse','delta','deliverable','pass','effect','period','lead'])assert.ok(r[k],r.id+' '+k);
for(const x of d.followups){assert.ok(m.contracts.some(c=>c.strategy===x.strategy));for(const k of ['problem','reuse','delta','acceptance','effect','metric','reason','done','requirement'])assert.ok(x[k],x.strategy+' '+k);}
assert.equal(p.source.version,d.version);assert.equal(p.source.date,d.date);assert.deepEqual(d.timeline,p.timeline);
for(const block of Object.values(d.tables).map(fn=>fn()))assert.ok(p.source.blocks.includes(block),'전문·화면 원장 일치');
assert.match(d.followupSchedule,/인수 이후 별도 착수/);assert.match(d.cost,/1회 산정/);assert.match(d.drtReuse,/SFR-004·008·012·014/);assert.match(d.pilot,/57개.*설계 목록/);
assert.equal(fs.readFileSync('dist/downloads/ts-2027-phase-plan.csv','utf8'),e.phaseCsv());
assert.equal(fs.readFileSync('dist/downloads/ts-delivery-plan.md','utf8'),d.markdown());
assert.equal(e.phaseCsv().trim().split('\r\n').length,24,'6 구축+11 모듈+6 DRT 검수와 머리글');
assert.doesNotMatch(d.markdown()+e.phaseCsv(),/undefined|\[object Object\]|[A-Z]:[\\/]|sandbox:|chatgpt-conversation:/);
assert.ok(e.html().includes('font-family:Pretendard'));
console.log('TS 2027 단계 제안 검증: 공통 6묶음·12요구/검수·실행 6모듈, 후속 11전략·DRT 6시험, 판본·전문·CSV 일치');
