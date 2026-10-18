'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const synthesis=require('../src/casebook-synthesis.cjs');
const exporter=require('./export-casebook-synthesis.cjs');
const ax=require('../src/ax-casebook.cjs'),platform=require('../src/platform-casebook.cjs');
assert.equal(synthesis.allCases.length,57);
assert.equal(ax.cases.length,26);assert.equal(platform.cases.length,31);
const findings=[...synthesis.platformFindings,...synthesis.strategyFindings];
assert.equal(new Set(findings.map(f=>f.id)).size,findings.length);
for(const item of synthesis.allCases){
 assert.ok(findings.some(f=>f.cases.includes(item.id)),item.id+' 종합 분석 누락');
 assert.ok(synthesis.strategiesFor(item.id).length,item.id+' 전략 매핑 누락');
 const sources=synthesis.caseSource(item.id);assert.ok(sources.length,item.id+' 출처 누락');
 for(const s of sources)assert.match(s.url,/^https?:\/\//,item.id+' 출처 URL');
}
assert.deepEqual(synthesis.cckDirections.map(d=>d.id),['C1','C2','C3','C4']);
assert.deepEqual(new Set(synthesis.cckDirections.flatMap(d=>d.strategies)),new Set(Array.from({length:12},(_,i)=>'ST-'+String(i+1).padStart(2,'0'))));
for(const [name,body] of Object.entries(exporter.files()))assert.equal(fs.readFileSync('dist/downloads/'+name,'utf8'),body);
const platformUi=fs.readFileSync('src/PlatformCasebook.jsx','utf8'),axUi=fs.readFileSync('src/AxCasebook.jsx','utf8');
assert.ok(platformUi.includes('<CasebookSynthesis kind="platform"/>'));
assert.ok(axUi.includes('<CasebookSynthesis kind="ax"/>'));
assert.ok(fs.readFileSync('dist/downloads/ts-casebook-synthesis.md','utf8').includes('PF-A03'));
console.log('사례집 종합 분석 검증 통과: 심층 57건·출처 57건·전략 12개·CCK 방향 4개.');
