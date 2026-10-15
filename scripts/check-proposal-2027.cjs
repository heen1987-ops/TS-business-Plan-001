'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const d=require('../src/proposal-2027.cjs'),g=require('../src/growth-ai.cjs'),a=require('../src/annual-work-2027.cjs'),e=require('./export-proposal-2027.cjs');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist');
assert.equal(d.chapters.length,13,'제안서 전문 13개 절');
assert.equal(d.requirements.length,12);
assert.equal(d.tests.length,12);
assert.equal(d.timeline.length,7);
assert.equal(d.gates.length,4);
assert.deepEqual(d.timeline.map(t=>t.period),['M1','M2','M3','M4','M5','M6~M7','M8~M9']);
assert.deepEqual(d.requirements.map(r=>r.id),g.requirements.map(r=>r.id));
assert.deepEqual(d.tests.map(t=>t.id),g.tests.map(t=>t.id));
for(const r of d.requirements){
 const old=g.requirements.find(x=>x.id===r.id);
 assert.equal(r.testId,old.testId);
 assert.deepEqual(r.legacyIds,old.legacyIds);
 assert.ok(d.tests.some(t=>t.id===r.testId));
}
for(const b of d.bundles){
 const old=a.bundles.find(x=>x.id===b.id);
 for(const key of ['name','scope','gate','lead'])assert.equal(b[key],old[key],b.id+' 기존 기획 보존: '+key);
}
const artifacts={'ts-2027-proposal.md':e.markdown(),'ts-2027-proposal.html':e.html(),'ts-2027-proposal-trace.csv':e.csv()};
for(const [name,value] of Object.entries(artifacts))assert.equal(fs.readFileSync(path.join(out,'downloads',name),'utf8'),value,'원문과 다운로드 일치: '+name);
const md=artifacts['ts-2027-proposal.md'],html=artifacts['ts-2027-proposal.html'];
for(const block of d.source.blocks)assert.ok(md.includes(block.replace(/^(#+) /gm,'#$1 ')),'전문 내용 누락');
assert.equal((md.match(/^## \d+ /gm)||[]).length,13);
assert.equal((html.match(/<h2 id="chapter-/g)||[]).length,13);
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,ids.length,'인쇄용 문서의 중복 ID');
for(const link of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.includes(link[1]),'전문 목차 실제 대상');
assert.doesNotMatch(html,/<script|<link|<img[^>]+src="http/i,'전문 오프라인 열람');
assert.match(html,/<svg/,'구성도 렌더링');
assert.match(html,/@page\{size:A4/,'인쇄 규격');
assert.match(html,/onclick="window.print\(\)"/,'인쇄 기능');
const sourceDiagram=d.source.blocks.find(b=>b.includes('flowchart TD'));
assert.equal((e.diagram(sourceDiagram).match(/<li>/g)||[]).length,11,'구성도 모든 연결의 텍스트 대안');
for(const m of sourceDiagram.matchAll(/\["([^"]+)"\]/g))assert.ok(html.includes(m[1]),'구성도 노드 보존');

// Parse the actual download, including escaped quotes, rather than count commas.
function parseCsv(value){
 const rows=[];let row=[],field='',quoted=false;
 for(let i=0;i<value.length;i++){
  const c=value[i];
  if(c==='"'){if(quoted&&value[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}
  else if(c===','&&!quoted){row.push(field);field='';}
  else if((c==='\r'||c==='\n')&&!quoted){if(c==='\r'&&value[i+1]==='\n')i++;row.push(field);rows.push(row);row=[];field='';}
  else field+=c;
 }
 assert.equal(quoted,false);
 if(row.length||field){row.push(field);rows.push(row);}
 return rows;
}
const csv=artifacts['ts-2027-proposal-trace.csv'];
assert.equal(csv.charCodeAt(0),0xfeff);
const rows=parseCsv(csv.slice(1));
assert.equal(rows.length,13);
assert.ok(rows.every(r=>r.length===10));
for(const [i,row] of rows.slice(1).entries()){
 const r=d.requirements[i],t=d.tests.find(t=>t.id===r.testId);
 assert.deepEqual(row.slice(0,8),[r.id,r.name,r.scope,r.evidence,r.legacyIds.join(' · '),r.testId,t.scenario,t.criterion]);
}
assert.ok(require('../site-routes.json').routes.includes('proposal-2027.html'));
assert.ok(require('../src/navigation.cjs').records.some(r=>r.route==='proposal-2027.html'));
assert.equal(require('../src/ux-navigation.cjs').sectionFor('proposal-2027.html').id,'strategy');
for(const x of d.downloads)assert.ok(fs.existsSync(path.join(out,x.to)));
const jsx=fs.readFileSync(path.join(root,'src/Proposal2027.jsx'),'utf8');
for(const [id] of d.sections)assert.ok(jsx.includes('id="'+id+'"'));
const home=fs.readFileSync(path.join(root,'src/GrowthAi.jsx'),'utf8').split('export function GrowthAi(){')[0];
assert.ok(home.includes('to="proposal-2027.html"')&&home.includes('to="downloads/ts-2027-proposal.md" download'));
const publicText=Object.values(artifacts).join('\n');
assert.doesNotMatch(publicText,/[A-Z]:[\\/]|file:\/\/\/|sandbox:|OneDrive|chatgpt-conversation:|slack\.com|owner_workspace_id|creator_account_user_id/,'공개 문서 경계');
assert.doesNotMatch(publicText,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\bgh[pousr]_[A-Za-z0-9_]{20,}|\bsk-[A-Za-z0-9]{20,}/,'자격증명');
assert.doesNotMatch(publicText,/\bundefined\b|\[object Object\]/);
for(const text of ['미산정','미검증','미확인','합의','0건','병원 전용 개발은 제외'])assert.ok(md.includes(text),'제안 상태·검수 경계: '+text);
assert.ok(d.tests.find(t=>t.id==='GAI-T10').criterion.includes('실제 병원 도입 검수는 제외'));
assert.ok(d.tests.find(t=>t.id==='GAI-T12').criterion.includes('미실행·분모 0·미합의 목표'));
console.log('TS 2027 제안서 검증 통과: 13절·12개 개발/검수·4개 기존 업무·9개월 일정·전문/인쇄/CSV 일치·공개 경계. 실제 기관 구현·AI 품질 검수와 구분.');
