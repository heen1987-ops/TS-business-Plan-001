'use strict';
const assert=require('node:assert/strict');
const work=require('../src/all-department-work.cjs'),detail=require('../src/detailed-work.cjs'),rules=require('../src/ts-organization-rules.cjs'),official=require('../src/official-duty-research.cjs'),strategy=require('../src/strategy-solutions-2027.cjs'),planning=require('../src/organization-site.cjs'),portfolio=require('../src/proposal-portfolio.cjs');
const origins=Object.values(detail.byOrg).flatMap(o=>[...o.ruleItems,...o.publicItems]);
assert.equal(work.records.length,origins.length);
assert.equal(new Set(work.records.map(r=>r.id)).size,4484);
assert.equal(work.counts.rule,2484);assert.equal(work.counts.public,2000);
assert.equal(work.organizations.length,227);assert.equal(work.counts.withWork,190);assert.equal(work.counts.withoutWork,37);
const reqs=new Set(),tests=new Set();
for(const r of work.records){
 const origin=origins.find(o=>o.id===r.id),org=rules.bindings.find(o=>o.code===r.code);
 assert.equal(r.text,origin.text);assert.equal(r.department,org.name);assert.equal(r.execution,'미실행');
 if(r.sourceKind==='직제시행세칙'){assert.equal(r.entryId,org.entryId);assert.ok(org.duties.includes(r.text));}
 else for(const s of r.sourceSpans){const observation=official.observations.find(o=>o.id===s.observationId);assert.equal(observation.orgCode,r.code);assert.equal(observation.text.slice(s.start,s.end),r.text);}
 for(const l of r.strategyLinks){assert.ok(strategy.rows.some(s=>s.id===l.id));assert.ok(l.method&&l.evidence);}
 if(r.state==='원문 범위 확인'){assert.equal(r.profileId,null);assert.equal(r.strategyLinks.length,0);assert.equal(r.requirements.length,0);assert.equal(r.packages.length,0);continue;}
 assert.ok(work.profiles[r.profileId]);assert.ok(r.strategyLinks.length);assert.equal(r.requirements.length,3);assert.ok(r.packages.includes('ON-W03'));
 const allowed=new Set(r.packages.flatMap(id=>planning.packages.find(p=>p.id===id).requirements));
 assert.deepEqual(r.commonTests.map(id=>planning.acceptance.find(t=>t.id===id).requirement).sort(),[...allowed].sort());
 if(r.phase==='1차 공통 기반'){assert.ok(planning.roles.some(p=>p.code===r.code));assert.ok(r.strategyLinks.some(s=>s.id==='ST-04'));}
 for(const x of r.requirements){assert.ok(x.id.startsWith(r.id+'-R'));assert.ok(x.testId.startsWith(r.id+'-T'));assert.ok(x.development&&x.criterion&&x.output);assert.ok(!reqs.has(x.id));assert.ok(!tests.has(x.testId));reqs.add(x.id);tests.add(x.testId);}
}
for(const o of work.organizations){assert.equal(o.count,work.records.filter(r=>r.code===o.code).length);for(const code of o.children)assert.equal(work.organizations.find(n=>n.code===code).parentCode,o.code);}
assert.equal(work.counts.review,16);assert.ok(Object.values(work.strategyCounts).every(n=>n>0));
assert.equal(work.byId['RULEWORK-1019600-2'].phase,'부서별 후속 적용');
const classify=(text,name='AI혁신처')=>work.classify(text,{code:'1019600',name}).profileId;
for(const [text,expected] of [['AI 정부과제 공모사업 관리','project'],['조직개편 업무분장','org'],['계약 예산 회계','finance'],['직원 채용','hr'],['DRT 운영관리','drt'],['철도안전 점검','rail'],['자동차 정밀검사','vehicle'],['환경미화','facility'],['인공지능 서비스 개발','ai']])assert.equal(classify(text),expected,text);
assert.equal(portfolio.tracks.length,4);assert.equal(portfolio.institutions.length,6);
assert.match(portfolio.tracks[0].audience,/민간기업/);assert.equal(portfolio.tracks[1].phase,'TS 2027 1차');assert.equal(portfolio.tracks[2].tag,'메뉴 유지');assert.match(portfolio.tracks[2].boundary,/인증·사용자 확인/);
assert.deepEqual(portfolio.tracks[3].strategyIds,strategy.rows.map(s=>s.id));
for(const t of portfolio.tracks){assert.ok(t.development.length&&t.acceptance.length);for(const id of t.ministries)assert.ok(portfolio.institutions.some(m=>m.id===id));}
for(const m of portfolio.institutions){assert.equal(m.cells.length,4);for(const id of m.sources)assert.ok(portfolio.sources.some(s=>s.id===id));}
assert.match(portfolio.markdown(),/전체메뉴/);assert.match(portfolio.markdown(),/실제 시험 미실행/);
console.log('전 부서 업무 검증 통과: 227개 조직·4,484개 원문, 전략/기능/요구/검수 참조, 16개 범위 대조, 4개 제안·6개 관계기관 매핑.');
