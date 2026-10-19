'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const atlas=require('../src/case-architecture-atlas.cjs');
const exporter=require('./export-case-architecture-atlas.cjs');
assert.equal(atlas.rows.length,57);
assert.equal(atlas.byKind.platform.length,31);
assert.equal(atlas.byKind.ax.length,26);
assert.equal(atlas.pairGroups.length,4);
assert.equal(new Set(atlas.rows.map(r=>r.caseId)).size,57);
assert.equal(new Set(atlas.rows.map(r=>r.flow.join('|'))).size,57,'사례별 흐름의 고유성');
assert.equal(new Set(atlas.rows.map(r=>r.pattern)).size,7);
for(const row of atlas.rows){
 assert.match(row.sourceUrl,/^https?:\/\//,row.caseId+' 출처');
 assert.ok(row.sourceDetail.length&&row.sourceStage&&row.architectureBasis,row.caseId+' 원문·단계');
 assert.ok(row.flow.length>=5&&row.flow.length<=7,row.caseId+' 흐름');
 for(const key of ['dataBoundary','decisionBoundary','bottleneck','bottleneckStatus','validation','unknowns','cckImplication'])assert.ok(row[key],row.caseId+' '+key);
 assert.ok(row.strategies.length,row.caseId+' 전략');
 for(const figure of row.originalFigures){assert.ok(fs.existsSync('public/'+figure.path),figure.path);assert.ok(figure.status&&figure.role&&figure.locator);}
}
assert.equal(atlas.byId['PF-A12'].originalFigures.length,2);
assert.ok(atlas.byId['PF-A12'].originalFigures.every(f=>f.sharedFrom==='AX06'));
assert.equal(atlas.byId['PF-R03'].originalFigures[0].role,'기존 시스템 현황');
assert.equal(atlas.byId['PF-R06'].originalFigures[0].role,'기존 시스템 현황');
assert.ok(atlas.byId['PF-R04'].originalFigures.every(f=>f.role==='RFP 예시 구성'));
assert.ok(fs.existsSync('public/assets/ts-organization-native-reference-architecture.svg'));
for(const [name,body] of Object.entries(exporter.files()))assert.equal(fs.readFileSync('dist/downloads/'+name,'utf8'),body);
assert.equal((exporter.markdown().match(/^### (?:PF|AX)/gm)||[]).length,57);
assert.ok(exporter.markdown().includes('ev_12c3ff9423094baaa31b0caf84abc98a28c21f551b0bc523c395daeb3926c8c6'));
assert.ok(fs.readFileSync('src/CasebookSynthesis.jsx','utf8').includes('<CaseArchitectureAtlas'));
console.log('사례 구조 전수 검증 통과: 57개 고유 흐름·7개 구조 유형·4개 교차 관점·원문 그림 단계 구분.');
