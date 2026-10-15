'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),base=path.join(root,'.agents/skills');
const f=require('../src/growth-framework.json');
const lock=JSON.parse(fs.readFileSync(path.join(base,'cck-growth-install-lock.json'),'utf8'));
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const ids=['cck-public-business','cck-public-evidence','cck-proposal','cck-project-management','cck-agency-onboarding'];
assert.match(f.source.commit,/^[a-f0-9]{40}$/);
assert.equal(lock.sourceCommit,f.source.commit);
assert.equal(lock.sourceRepo,f.source.repo);
assert.equal(lock.sourceState,'pinned_files_verified');
assert.equal(lock.installation,'copied_and_hash_verified');
assert.equal(lock.destination,'.');
assert.equal(lock.operation,'not_run');
assert.equal(lock.invocation,'not_run');
assert.equal(lock.registration,'not_run');
assert.equal(f.execution,'not_run');
assert.deepEqual(f.skills.map(s=>s.id),ids);
assert.equal(lock.files.length,11);
for(const item of lock.files){
 assert.ok(!item.path.includes('..')&&!path.isAbsolute(item.path));
 const p=path.join(base,item.path),bytes=fs.readFileSync(p);
 assert.equal(hash(bytes),item.sha256,item.path+' installed hash drift');
 assert.equal(bytes.length,item.bytes);
 if(p.endsWith('.md'))for(const link of bytes.toString('utf8').matchAll(/\]\(([^)]+)\)/g)){
  if(!/^(https?:|#)/.test(link[1]))assert.ok(fs.existsSync(path.resolve(path.dirname(p),link[1].split('#')[0])),item.path+' missing link '+link[1]);
 }
}
assert.equal(hash(fs.readFileSync(path.join(base,'_shared/agency-profiles.json'))),f.source.profilesSha256);
const profiles=JSON.parse(fs.readFileSync(path.join(base,'_shared/agency-profiles.json'),'utf8'));
assert.deepEqual(f.agencies,profiles.profiles.map(p=>({id:p.id,name:p.name,status:p.status,businessTypes:p.businessTypes,unknowns:p.unknowns})));
assert.deepEqual(f.branches.map(b=>b.id),['PROPOSAL','PROJECT_MANAGEMENT']);
for(const s of f.skills)assert.equal(s.url,`https://github.com/${f.source.repo}/blob/${f.source.commit}/${f.source.path}/skills/${s.id}/SKILL.md`);
assert.equal(f.agencies.find(a=>a.id==='EDU').status,'TEMPLATE');
assert.equal(f.agencies.find(a=>a.id==='HOSPITAL').status,'FUTURE');
assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root,'dist/downloads/growth-framework.json'),'utf8')),f);
console.log('GROWTH common skills: pinned commit, 11 file hashes, relative references, agency profiles and exported snapshot verified. App discovery and real execution remain not_run.');
