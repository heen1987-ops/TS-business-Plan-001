const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const d=require('../src/enterprise-work-ax.cjs'),o=require('../src/official-duty-research.cjs'),axes=require('../src/ax-portfolio.json'),exp=require('./export-enterprise-work-ax.cjs');
const original=o.records.filter(x=>x.kind==='처');
assert.equal(d.records.length,74);assert.equal(new Set(d.records.map(r=>r.id)).size,74);
assert.deepEqual(d.records.map(r=>r.code).sort(),original.map(r=>r.code).sort());
for(const r of d.records){const source=original.find(x=>x.code===r.code);assert.equal(r.name,source.name);assert.equal(r.path,source.path);assert(r.observations.length>0);assert(d.packs.some(p=>p.id===r.pack));assert(d.priorities.some(p=>p.id===r.priority));assert.equal(r.cost.amount,null);assert.equal(r.cost.status,'미산정');assert(r.skill&&r.additional&&r.priorityReason&&r.gate&&r.owner&&r.acceptance);assert.equal(r.reuse.length,2);assert.equal(r.workflow.length,4);assert.equal(r.years.length,3);assert(r.years[0].includes('운영 인수 완료'));assert(r.years.every((x,i)=>x.includes(String(2027+i))));for(const e of r.observations){const observed=source.observations.find(x=>x.id===e.id);assert(observed);assert.equal(observed.text,e.text);assert.deepEqual(observed.refs,e.refs);}}
assert(!d.records.find(r=>r.code==='3402041').fieldPacks.includes('F2'),'서울 안전사업2처 주차장 정밀검사를 운전적성으로 오분류 금지');
assert(d.records.filter(r=>r.priority==='P0').length===4);assert.equal(d.acceptance.rows.length,6);
assert(axes.axes[0].audience.includes('전 처'));assert(axes.axes[0].items.length>3);assert.equal(axes.services.length,10);assert(axes.services.every(s=>s.axis==='public'&&!/PMS|감리/.test(s.name)));
const out=path.join(__dirname,'../dist/downloads');assert.equal(fs.readFileSync(path.join(out,'enterprise-work-ax-2027-2029.md'),'utf8'),exp.markdown());assert.equal(fs.readFileSync(path.join(out,'enterprise-work-ax-2027-2029.csv'),'utf8'),exp.csv());assert.deepEqual(JSON.parse(fs.readFileSync(path.join(out,'enterprise-work-ax-2027-2029.json'),'utf8')),d);
assert(!/[A-Z]:[\\/]|OneDrive|file:\/\/\//.test(JSON.stringify(d)),'로컬 경로 공개 금지');
console.log('전사 AX: 74개 처 원장 일치·관측 원문/위치·우선순위·연차·중복경계·미산정·3종 내려받기 동기화·국민 10군 분리 통과');
