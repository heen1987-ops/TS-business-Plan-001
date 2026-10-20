'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const d=require('../src/org-native-literature.json'),p=require('../src/ts-ax-portfolio-2027.cjs'),exp=require('./export-org-native-literature.cjs');
const ids=new Set(d.sources.map(s=>s.id)),packages=new Set(p.common.map(x=>x.id)),tests=new Set(p.common.flatMap(x=>x.tests));
assert.equal(ids.size,9);assert.equal(d.entities.length,14);assert.equal(d.architecture.length,7);assert.equal(d.tests.length,12);
for(const s of d.sources){for(const k of ['title','author','access','readScope','insight','application','limit','checked'])assert.ok(s[k],s.id+' '+k);assert.equal(new URL(s.url).protocol,'https:');if(s.fullTextUrl)assert.equal(new URL(s.fullTextUrl).protocol,'https:');}
assert.equal(d.sources.find(s=>s.id==='L01').fullTextUrl,null,'첨부 도서 전문 재배포 금지');assert.equal(d.sources.filter(s=>s.kind==='공개 서적').length,3);
const entities=new Set(d.entities.map(e=>e.id));for(const [a,b,relation] of d.relations){assert.ok(entities.has(a)&&entities.has(b));assert.ok(relation);}
for(const list of [d.entities,d.architecture,d.tests,d.decisions])for(const r of list){assert.ok(r.sourceIds.length);for(const id of r.sourceIds)assert.ok(ids.has(id),r.id+' unknown source '+id);if(r.package)assert.ok(packages.has(r.package));if(r.packages)for(const id of r.packages)assert.ok(packages.has(id));}
for(const t of d.tests)for(const id of t.existingTests)assert.ok(tests.has(id),t.id+' '+id);
assert.deepEqual([...new Set(d.tests.flatMap(t=>t.existingTests))].sort(),[...tests].sort(),'기존 GAI-T01~12 전부 연결');
assert.deepEqual([...new Set(d.tests.map(t=>t.package))].sort(),[...packages].sort(),'공통 6개 과업 연결');
for(const e of d.examples){assert.ok(p.byId[e.strategy]);assert.equal(p.byId[e.strategy].leader.name,e.department);assert.ok(e.setup.includes('합성 예시'));}
for(const q of d.questions)assert.ok(tests.has(q[4]));assert.equal(d.contracts.length,4);
const body=JSON.stringify(d);for(const rule of [/file:\/\//,/C:\\Users/i,/G:\\/,/sk-[a-zA-Z0-9]{20}/])assert.ok(!rule.test(body),'공개 경계');
const component=fs.readFileSync(path.join(__dirname,'../src/TsAxPortfolio.jsx'),'utf8');assert.equal((component.match(/<OrgNativeDesign\/>/g)||[]).length,1);
for(const [name,value] of Object.entries(exp.files()))assert.equal(fs.readFileSync(path.join(__dirname,'../dist/downloads',name),'utf8'),value,'내려받기 정본 '+name);
console.log('조직 문헌 설계 통과: 근거9·객체14·아키텍처7·시험12·기존과업6·GAI12 전수 연결·단일 본문·공개 경계');
