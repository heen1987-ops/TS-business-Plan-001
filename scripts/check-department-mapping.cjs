'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const d=require('../src/ts-department-mapping.cjs'),e=d.evidence,p=require('../src/proposal-2027.cjs'),old=require('../src/enterprise-work-ax.cjs');
assert.equal(e.nodes.length,227);assert.equal(d.rows.length,76);assert.equal(new Set(d.rows.map(x=>x.code)).size,76);
assert.equal(e.observations.length,294);assert.equal(d.relations.length,12);assert.equal(d.packages.length,6);
assert.ok(old.records.every(x=>d.rows.some(r=>r.code===x.code&&r.legacy===x.id)),'기존 74개 부서 기획 연결');
assert.deepEqual(d.packages.flatMap(x=>x.requirements).sort(),p.requirements.map(x=>x.id).sort(),'12개 요구의 6개 작업 배정');
assert.deepEqual(d.tests.map(x=>x.id),p.tests.map(x=>x.id));
const node=code=>e.nodes.find(x=>x.code===code);
assert.equal(node('1019700').parentCode,'1019600');
assert.ok(e.observations.some(x=>x.orgCode==='1019700'&&x.text.includes('TS AI GPT')));
assert.ok(!e.observations.some(x=>x.orgCode==='1019600'&&x.text.includes('TS AI GPT')),'하위 팀 업무를 상위 부서에 중복 귀속하지 않음');
const body=p.source.blocks.join('\n');
for(const r of d.rows){
 assert.ok(node(r.code));assert.equal(r.path,node(r.code).path);
 assert.ok(r.evidenceIds.length>0);for(const id of r.evidenceIds){const o=e.observations.find(x=>x.id===id);assert.equal(o?.orgCode,r.code);const page=e.pages.find(x=>x.id===o.pageId);assert.equal(page.orgCode,r.code);assert.ok(o.row>0&&o.row<=page.rows);}
 for(const peer of r.peers)assert.ok(d.rows.some(x=>x.code===peer),'협업 상대 존재 '+peer);
 for(const id of r.workPackages)assert.ok(d.packages.some(x=>x.id===id));
 for(const id of r.tests)assert.ok(d.tests.some(x=>x.id===id));
 assert.match(r.roles.approve,/미확정/);assert.ok(body.includes(r.path+' / '+r.code),'제안서 부서 매핑 포함');
}
for(const r of d.relations){for(const code of [r.from,r.to])assert.ok(d.rows.some(x=>x.code===code));for(const id of r.tests)assert.ok(d.tests.some(x=>x.id===id));assert.match(r.status,/제안.*미확정/);}
assert.ok(d.tests.every(x=>x.status.includes('미실행')));
assert.match(d.tests.find(x=>x.id==='GAI-T04').criterion,/0건.*제안/);
for(const [file,content] of Object.entries(require('./export-department-mapping.cjs').files()))assert.equal(fs.readFileSync('dist/downloads/'+file,'utf8'),content,'Single source download '+file);
const publicText=JSON.stringify(d);
assert.doesNotMatch(publicText,/\b01[016789][- ]?\d{3,4}[- ]?\d{4}\b|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}|[A-Z]:[\\/]|file:\/\//,'개인 연락처·로컬 경로 제외');
assert.ok(e.unresolved.some(x=>x.includes('SSO')));assert.ok(e.unresolved.some(x=>x.includes('전결')));
assert.ok(fs.readFileSync('src/Proposal2027.jsx','utf8').includes('<DepartmentMapping/>'));
console.log('부서 매핑 검증 통과: 227개 조직 색인·76개 매핑·294개 근거·12개 협업·6개 구축·12개 검수, 기존 74개 기획 연결, 다운로드·제안서 일치·개인 연락처 제외. 실제 플랫폼 검수는 미실행.');
