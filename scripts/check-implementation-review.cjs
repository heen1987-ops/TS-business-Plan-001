const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),d=require('../src/implementation-review.cjs'),manifest=require('../src/department-documents.json');
let checks=0;const check=(v,m)=>{assert(v,m);checks++};
check(d.date==='2026-10-03'&&d.year===2027,'조사일·2027 범위');check(d.feedback.received===false,'실제 피드백 미수령 보존');
const expected=manifest.departments.flatMap(v=>v.projects.map(p=>({id:p.id,code:v.code,name:v.name,title:p.title})));
assert.deepEqual(d.mappings.map(r=>r.id).sort(),expected.map(r=>r.id).sort());checks++;check(new Set(d.mappings.map(r=>r.code)).size===39&&d.mappings.length===42,'39처·42항목 누락·중복 없음');
for(const r of d.mappings){const p=expected.find(p=>p.id===r.id);check(p.code===r.code&&p.name===r.department&&p.title===r.title,'처·기획 귀속 '+r.id);check(Object.hasOwn(d.statuses,r.status)&&['CORE','M1','M2','M3','M4'].includes(r.module),'분류·모듈 '+r.id);check(r.scope.length>35,'구현경계 구체성 '+r.id);check([r.baseline,r.target,r.personMonths,r.cost].every(v=>v===null),'미확정은 0 아닌 null '+r.id);check(r.refs.every(id=>d.sources.some(s=>s.id===id)),'재열람 출처 연결 '+r.id);}
assert.deepEqual(Object.keys(d.statuses).map(k=>d.mappings.filter(r=>r.status===k).length),[4,16,18,4]);checks++;
check(d.candidates.length===5&&d.metrics.length===5&&d.questions.length===14,'5검증후보·5측정범주·14질문');
for(const c of d.candidates){check(c.codes.every(code=>manifest.departments.some(v=>v.code===code)),'후보 처등록 '+c.id);check(c.flow.length===5&&['why','input','reuse','newWork','output','test','stop'].every(k=>typeof c[k]==='string'&&c[k].length>20),'후보 기술·실패·중단 정의 '+c.id);}
for(const c of d.candidates)check([...c.binding.primary,...c.binding.reuse].every(id=>expected.some(p=>p.id===id)),'후보와 기획ID 추적 '+c.id);
check(d.mappings.filter(r=>r.status==='candidate').every(r=>d.candidates.some(c=>[...c.binding.primary,...c.binding.reuse].includes(r.id))),'검증 우선 4항목과 5후보 연결');
assert.deepEqual(d.candidates.find(c=>c.id==='V04').codes,['EX26']);checks++;check(d.candidates.find(c=>c.id==='V05').reuse.includes('계약·인수·API 가용을 확인'),'계획 기능을 구현완료로 승격 금지');check(d.sources.find(s=>s.id==='F02').limit.includes('2029-12-31')&&d.sources.find(s=>s.id==='F02').limit.includes('2027-12-31'),'계약기간 불일치 보존');check(d.drtDifference.some(r=>r.join(' ').includes('SFR-014'))&&d.drtDifference.some(r=>r.join(' ').includes('DB-LINK 불가')),'상담·예외·인터페이스 중복 경계');
check(d.research100.sample.length===8&&d.research100.urlCount===0&&d.research100.limit.includes('나머지 92개'),'100단계 표본·검토 범위');
for(const q of d.questions)check([q.response,q.respondent,q.receivedAt,q.decision].every(v=>v===null)&&q.status==='미회신·미요청','회신 조작 없음 '+q.id);
check(Object.values(d.estimates).every(v=>v===null),'대가·일정·효과 수치 임의 편성 없음');
const root=path.resolve(__dirname,'../dist/downloads');const json=JSON.parse(fs.readFileSync(path.join(root,'implementation-review-20261003.json'),'utf8'));assert.deepEqual(json,d);checks++;const md=fs.readFileSync(path.join(root,'implementation-review-20261003.md'),'utf8');assert.equal(md,require('./export-implementation-review.cjs').markdown());checks++;for(const r of d.mappings)check(md.includes(r.id+' · '+r.department+' · '+r.title),'MD 42기획 정합 '+r.id);for(const s of d.sources)check(md.includes(s.url)&&s.checkedAt===d.date,'공식 근거·확인일 '+s.id);
for(const filename of ['implementation-mapping-20261003.csv','implementation-feedback-20261003.csv']){const text=fs.readFileSync(path.join(root,filename),'utf8');check(text.startsWith('\uFEFF')&&text.includes('\r\n'),'한글 CSV BOM '+filename);check(!/(?:[CG]:[\\/]|file:\/\/|github_pat_|ghp_)/.test(text),'개인 PC·비밀 경로 없음 '+filename);}
const readCsv=file=>fs.readFileSync(path.join(root,file),'utf8').replace(/^\uFEFF/,'').trimEnd().split('\r\n').slice(1).map(line=>Array.from(line.matchAll(/"((?:[^"]|"")*)"(?:,|$)/g),m=>m[1].replaceAll('""','"')));
const mappingCsv=readCsv('implementation-mapping-20261003.csv'),feedbackCsv=readCsv('implementation-feedback-20261003.csv');
assert.deepEqual(mappingCsv,d.mappings.map(r=>[r.id,r.code,r.department,r.title,d.statuses[r.status],r.module,r.scope,r.externalRefresh,'','','','']));checks++;
assert.deepEqual(feedbackCsv,d.questions.map(q=>[q.id,q.owner,q.question,q.evidence,'','','','',q.status]));checks++;
console.log(JSON.stringify({result:'통과',checks,departments:39,projects:42,real_feedback_received:false}));
