'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const p=require('../src/followup-plan.cjs'),c=require('../src/followup-comparison.json'),cases=require('../src/followup-cases.json');
assert.equal(p.sections.length,8);assert.equal(p.layers.length,3);assert.equal(p.layers.flatMap(l=>l.groups).length,9);assert.equal(p.projects.length,10);assert.equal(c.rows.length,17);assert.equal(cases.length,12);
const all=(rows,key)=>new Set(rows.map(r=>r[key])).size===rows.length;
assert.ok(all(p.projects,'id'));assert.ok(all(c.rows,'id'));assert.ok(all(cases,'id'));assert.ok(all(c.sources,'id'));assert.ok(all(c.sources,'url'));
const groups=p.layers.flatMap(l=>l.groups.map(g=>g.id));
for(const project of p.projects){
 for(const field of ['current','delta','inputs','output','owner','exceptions','gate','purpose','status'])assert.ok(project[field]?.length,project.id+' '+field);
 assert.ok(groups.includes(project.group));assert.ok(project.modules.includes(project.group));assert.ok(project.modules.every(id=>groups.includes(id)));
 assert.ok(project.flow.length>=5);assert.ok(project.metrics.length>=3);assert.ok(project.comparisons.length>0);assert.ok(project.comparisons.every(id=>c.rows.some(r=>r.id===id)));
}
for(const row of c.rows){for(const key of ['ts','chatgpt','claude','gemini','implication','condition'])assert.ok(row[key]);assert.ok(row.sourceIds.length);assert.ok(row.sourceIds.every(id=>c.sources.some(s=>s.id===id)));}
for(const x of cases){assert.ok(p.layers.some(l=>l.id===x.layer));assert.ok(x.observed&&x.application&&x.boundary&&x.validation&&x.stage);assert.ok(x.projectIds.every(id=>p.projects.some(p=>p.id===id)));assert.ok(new URL(x.source.url).protocol==='https:');assert.equal(x.source.checkedAt,'2026-11-04');}
assert.match(c.rows.find(r=>r.id==='C04').ts,/HWPX/);assert.match(c.rows.find(r=>r.id==='C06').ts,/민원.*코드/);assert.match(c.rows.find(r=>r.id==='C14').claude,/Team\/Enterprise.*미제공/);assert.match(c.rows.find(r=>r.id==='C15').gemini,/구독 없이/);assert.match(c.rows.find(r=>r.id==='C16').ts,/계획/);
assert.ok(p.baseline.some(b=>b.known.includes('민원')));assert.ok(p.basics.some(b=>b.to==='about.html'));assert.ok(p.basics.some(b=>b.to.includes('view=law')));assert.ok(p.basics.some(b=>b.to.includes('view=organization')));
assert.equal(p.roadmap.length,5);for(const year of p.roadmap)for(const k of ['infra','knowledge','service','owner','output','gate'])assert.ok(year[k]);
const routes=require('../site-routes.json');for(const s of p.sections)assert.ok(routes.queryViews.some(v=>v.view===s.id));
const published=JSON.stringify({p,c,cases});assert.doesNotMatch(published,/(?:^|[^a-z])[A-Z]:[\\/]|file:\/\/|\\\\100\.|192\.168\.|\b10\.\d+\.\d+\.\d+\b|api[_-]?key["\s]*[:=]|JWT|수주액|계약금액/i);
for(const [name,text] of Object.entries(require('./export-followup.cjs').files())){assert.equal(fs.readFileSync('dist/downloads/'+name,'utf8'),text);assert.doesNotMatch(text,/undefined|\[object Object\]/);}
const ui=fs.readFileSync('src/FollowupWorkspace.jsx','utf8'),app=fs.readFileSync('src/App.jsx','utf8');assert.ok(app.includes('if(isFollowup)'));assert.ok(app.indexOf('if(isFollowup)')>app.indexOf('if(isStrategyWorkspace)'));assert.ok(ui.includes('PageFrame'));assert.ok(ui.includes('role="status"'));assert.ok(ui.includes('등록되지 않은 사업 후보'));assert.ok(ui.includes('조건에 맞는 항목이 없습니다'));
console.log('후속기획 v2 통과: 8개 탐색·3영역·9역량·4깊이·10사업·17기능·12사례, 참조 무결성·현행 상태·공개경계·내려받기 일치');
