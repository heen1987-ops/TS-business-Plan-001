'use strict';
// Import only public framework metadata from a committed upstream snapshot.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const sourceRoot=process.argv[2];
if(!sourceRoot)throw new Error('Usage: node scripts/sync-growth-framework.cjs <CCK-Public-basic checkout>');
const git=(...args)=>execFileSync('git',['-C',path.resolve(sourceRoot),...args],{encoding:'utf8'}).trim();
const commit=git('rev-parse','HEAD');
if(!/^[0-9a-f]{40}$/.test(commit))throw new Error('Upstream commit is required');
const base='CCK-GROWTH-Skills';
if(git('status','--porcelain','--',base))throw new Error('Commit the upstream framework before importing');
function read(file){const text=execFileSync('git',['-C',path.resolve(sourceRoot),'show',commit+':'+base+'/'+file],{encoding:'utf8'});return {data:JSON.parse(text),sha256:crypto.createHash('sha256').update(text).digest('hex')};}
const manifest=read('manifest.json');
if(manifest.data.schemaVersion!=='cck-growth-skills/1')throw new Error('Unsupported upstream manifest');
const profiles=read(manifest.data.agencyProfilesPath);
const repo='heen1987-ops/CCK-Public-basic',prefix='https://github.com/'+repo+'/blob/'+commit+'/'+base+'/';
const snapshot={
 packageId:manifest.data.packageId,version:manifest.data.version,asOf:manifest.data.asOf,
 source:{repo,commit,path:base,url:prefix+'README.md',manifestSha256:manifest.sha256,profilesSha256:profiles.sha256},
 skills:manifest.data.skills.map(s=>({id:s.id,name:s.name,role:s.role,purpose:s.purpose,branch:s.branch,url:prefix+s.path})),
 branches:manifest.data.branches,
 agencies:profiles.data.profiles.map(p=>({id:p.id,name:p.name,status:p.status,businessTypes:p.businessTypes,unknowns:p.unknowns})),
 execution:'not_run'
};
fs.writeFileSync(path.join(__dirname,'../src/growth-framework.json'),JSON.stringify(snapshot,null,2)+'\n');
console.log('GROWTH framework metadata pinned to '+commit+'; '+snapshot.skills.length+' skills / '+snapshot.agencies.length+' profiles.');
