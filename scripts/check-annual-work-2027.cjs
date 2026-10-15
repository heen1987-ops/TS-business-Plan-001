const assert=require('node:assert/strict'),fs=require('node:fs'),d=require('../src/annual-work-2027.cjs'),e=require('../src/enterprise-work-ax.cjs'),exp=require('./export-annual-work-2027.cjs');
assert.deepEqual(d.bundles.map(b=>b.id),['W27-A','W27-B','W27-C','W27-D']);
assert.equal(new Set(d.tests.map(t=>t[0])).size,9);
for(const b of d.bundles){assert.equal(b.workflow.length,5);for(const key of ['scope','skills','development','exclude','unit','test','gate','after','costParent'])assert.ok(b[key].length>10);for(const r of b.departments){const original=e.records.find(x=>x.code===r.code);assert.equal(original.name,r.name);assert.deepEqual(original.observations,r.observations);}}
assert.match(d.reuse,/SFR-003/);assert.match(d.reuse,/SFR-008/);assert.match(d.common,/단 하나/);assert.match(d.independence,/발주 불가/);assert.match(d.bundles[1].scope,/분기/);assert.match(d.bundles[3].gate,/발주 제외/);
assert.equal(fs.readFileSync('dist/downloads/annual-work-2027.md','utf8'),exp.markdown());assert.equal(fs.readFileSync('dist/downloads/annual-work-2027.csv','utf8'),exp.csv());assert.deepEqual(JSON.parse(fs.readFileSync('dist/downloads/annual-work-2027.json','utf8')),d);
assert.equal(require('../src/ax-portfolio.json').services.length,10);
console.log('2027 선도 발주 검증 통과: 4묶음·9검수·처별 원문관측·중복/연간범위·내려받기 정합');
