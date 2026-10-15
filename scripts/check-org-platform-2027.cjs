'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const o=require('../src/org-platform-2027.cjs'),g=require('../src/growth-ai.cjs'),p=require('../src/proposal-2027.cjs'),a=require('../src/annual-work-2027.cjs'),official=require('../src/official-duty-research.cjs');
// Every common requirement and its acceptance test must belong to a foundation stage.
assert.deepEqual(o.stages.flatMap(x=>x.requirements).sort(),g.requirements.map(x=>x.id).sort());
assert.deepEqual(o.stages.flatMap(x=>x.tests).sort(),g.tests.map(x=>x.id).sort());
for(const s of o.stages){assert.equal(s.tests.length,s.requirements.length);for(const [i,id] of s.requirements.entries())assert.equal(g.requirements.find(r=>r.id===id).testId,s.tests[i]);}
assert.equal(a.common,o.common);assert.equal(g.cost.ownership,o.common);assert.equal(a.independence,o.independence);
assert.deepEqual(p.timeline,o.timeline);
assert.ok(p.source.blocks.includes(o.common+' '+o.independence));
assert.deepEqual(g.organizationPlatform.stages,o.stages);
assert.ok(a.bundles.every(b=>b.gate.startsWith('조직 기반 인수와 후속 적용 범위 확정 후:')));
for(const id of o.evidence.ids)assert.ok(official.byOrg['1019600'].units.some(x=>x.id===id),'공식 관측에 존재하는 근거 ID');
assert.match(o.evidence.note,/재확인하지 못했/);
const body=p.source.blocks.join('\n');
for(const item of [...o.profiles.map(x=>x.mapping),...o.roles.map(x=>x.boundary)])assert.ok(body.includes(item),'제안서의 조직 특성·책임 경계 누락: '+item);
assert.ok(body.indexOf('## 3.3')<body.indexOf('## 3.4'));
assert.doesNotMatch(body,/우선 W27-A를 제안하되|선택 사업 중 하나에만 귀속/);
for(const f of ['IntegratedReader.jsx','Proposal2027.jsx','GrowthAi.jsx'])assert.ok(fs.readFileSync('src/'+f,'utf8').includes('<OrganizationPlatform'),'주요 화면의 공통 사업 구조: '+f);
const exported=JSON.parse(fs.readFileSync('dist/downloads/growth-ai.json','utf8'));
assert.deepEqual(exported.organizationPlatform.stages,o.stages,'구조화 다운로드의 사업 단계');
assert.ok(fs.readFileSync('dist/downloads/growth-ai.md','utf8').includes(o.gate));
assert.ok(fs.readFileSync('dist/downloads/ts-2027-proposal.md','utf8').includes(o.common));
console.log('조직 기반 우선 검증 통과: 12개 요구·검수 단계 배정, 비용 단일 귀속, 일정·원문·화면·다운로드 일치, 책임 근거 및 후속 적용 조건.');
