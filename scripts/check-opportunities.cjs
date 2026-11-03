const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {loadConcepts,parseConcept,renderMarkdown}=require('./lib/load-concepts.cjs');
const plan=require('../src/opportunity-plan.cjs');
const rows=loadConcepts(),routes=require('../site-routes.json');
assert.equal(rows.length,38,'v1.1 검토대상 38개 컨셉 보존');
assert.deepEqual(plan.areas.map(a=>a.id),['infrastructure','knowledge','services']);
assert.deepEqual(plan.roadmap.map(r=>r.year),['2026','2027','2028','2029','2030']);
assert.equal(plan.topics.length,5);
for(const area of plan.areas)for(const type of plan.workTypes)assert.ok(area[type.id].length>0);
const ids=plan.areas.flatMap(a=>a.tasks);
assert.equal(new Set(ids).size,16);
assert.deepEqual(new Set(rows.flatMap(r=>r.task_ids)),new Set(ids));
assert.equal(new Set(rows.flatMap(r=>r.strategy_ids)).size,12);
assert.equal(routes.routes.length,75,'기존 HTML 경로 유지');
assert.ok(routes.queryViews.some(r=>r.path==='index.html'&&r.view==='opportunities'));
const index='dist/downloads/concepts/00_사업기회_목록.md';
const indexText=fs.readFileSync(index,'utf8');
for(const r of rows){
 const downloaded=fs.readFileSync(path.join('dist/downloads/concepts',r.filename));
 assert.equal(crypto.createHash('sha256').update(downloaded).digest('hex'),r.sha256,'MD 원문 무결성: '+r.id);
 assert.ok(indexText.includes(encodeURIComponent(r.filename)),'목록 연결: '+r.id);
 assert.ok(r.sources.every(s=>s.checkedAt||s.publishedAt),'출처 시점: '+r.id);
 assert.doesNotMatch(r.markdown,/수주액|계약금액|JWT|API[_-]?KEY\s*[:=]/i);
}
for(const r of plan.roadmap)for(const field of ['infrastructure','knowledge','services','gate'])assert.ok(r[field]);
assert.ok(plan.sources.every(s=>s.checkedAt||s.publishedAt));
assert.match(plan.topics[1].condition,/정보보유기관 등재는 확인/);
assert.match(plan.topics[3].condition,/평가 점수만으로 오류 확정 금지/);
const hostile=renderMarkdown('<img src=x onerror=alert(1)>\n\n[실행](javascript:alert)\n\n[참고](https://example.org/a?q="x")');
assert.doesNotMatch(hostile,/<img|onerror="|href="javascript:/i);
assert.match(hostile,/&lt;img/);
assert.match(hostile,/&quot;/);
assert.throws(()=>parseConcept(rows[0].markdown,'../wrong.md'),/filename/);
assert.throws(()=>parseConcept(rows[0].markdown+'\nC:/Users/private',rows[0].filename),/Local\/private/);
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'ts-concepts-check-'));
try{
 fs.writeFileSync(path.join(temp,rows[0].filename),rows[0].markdown);
 const meta={...rows[0],title:'중복 검증',slug:rows[0].slug+'-duplicate'};
 fs.writeFileSync(path.join(temp,'중복 검증.md'),'---\n'+JSON.stringify(meta)+'\n---\n'+rows[0].markdown.slice(rows[0].markdown.indexOf('\n#')));
 assert.throws(()=>loadConcepts(temp),/Duplicate concept id/);
}finally{for(const name of fs.readdirSync(temp))fs.unlinkSync(path.join(temp,name));fs.rmdirSync(temp);}
assert.ok(!fs.existsSync('dist/downloads/concepts/coverage.local.json'));
assert.equal(fs.readdirSync('dist/downloads/concepts').length,rows.length+1);
console.log(`사업기회 v1.1 통과: ${rows.length}개 MD 원문·출처시점·12전략·16과제·3영역·5개년·다운로드 무결성·공개경계`);
