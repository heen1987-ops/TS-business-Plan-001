'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const synthesis=require('../src/casebook-synthesis.cjs');
const exporter=require('./export-casebook-synthesis.cjs');
const ax=require('../src/ax-casebook.cjs'),platform=require('../src/platform-casebook.cjs');
const audit=require('../src/case-bottleneck-audit.cjs'),capability=require('../src/cck-ax-capability-plan.cjs');
const architectureEvidence=require('../src/case-architecture-evidence.cjs');
const sourceFigures=require('../src/case-source-figures.json');
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
assert.equal(audit.rows.length,11);
assert.equal(new Set(audit.rows.map(r=>r.id)).size,audit.rows.length);
assert.equal(audit.byKind.platform.length+audit.byKind.ax.length,audit.rows.length);
assert.deepEqual(new Set(audit.rows.flatMap(r=>r.strategies)),new Set(Array.from({length:12},(_,i)=>'ST-'+String(i+1).padStart(2,'0'))));
for(const r of audit.rows){
 assert.ok(synthesis.allCases.some(c=>c.id===r.caseId),r.id+' 사례 없음');
 assert.match(r.source,/^https:\/\//,r.id+' 원문 URL');
 assert.ok(r.architecture&&r.seam&&r.bottleneck&&r.status&&r.check&&r.cck,r.id+' 세부 분석 누락');
 if(r.figure){assert.ok(fs.existsSync('public/'+r.figure),r.id+' 원문 도식 없음');assert.ok(sourceFigures.some(f=>f.path===r.figure),r.id+' 원문 도식 출처 없음');}
}
assert.equal(capability.assets.length,4);
const evidenceCounts=synthesis.allCases.reduce((counts,c)=>{const type=architectureEvidence.forCase(c.id).type;counts[type]=(counts[type]||0)+1;return counts;},{});
assert.deepEqual(evidenceCounts,{'원문 도식':10,'자료 기반 이미지 재구성':3,'출처 설명 기반 논리 재구성':43,'공식 API 문서 기반 논리 재구성':1});
for(const r of capability.assets)assert.ok(r.basis&&r.level&&r.reuse&&r.verify);
for(const id of Array.from({length:12},(_,i)=>'ST-'+String(i+1).padStart(2,'0'))){
 assert.ok(capability.strategyAssets[id]?.length,id+' 기술 매핑 누락');
 for(const asset of capability.strategyAssets[id])assert.ok(capability.byId[asset],id+' 기술 근거 누락');
}
for(const [name,body] of Object.entries(exporter.files()))assert.equal(fs.readFileSync('dist/downloads/'+name,'utf8'),body);
assert.ok(exporter.markdown().includes('B02 PF-R02'));
assert.ok(exporter.markdown().includes('감사에서 확인한 품질 문제'));
const platformUi=fs.readFileSync('src/PlatformCasebook.jsx','utf8'),axUi=fs.readFileSync('src/AxCasebook.jsx','utf8');
assert.ok(platformUi.includes('<CasebookSynthesis kind="platform"/>'));
assert.ok(axUi.includes('<CasebookSynthesis kind="ax"/>'));
assert.ok(fs.readFileSync('dist/downloads/ts-casebook-synthesis.md','utf8').includes('PF-A03'));
console.log('사례집 종합 분석 검증 통과: 심층 57건·출처 57건·전략 12개·CCK 방향 4개.');
