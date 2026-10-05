const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const d=require('../src/isp-review.cjs'),cost=require('../src/cost-review.cjs'),previous=require('../src/implementation-review.cjs'),nav=require('../src/ux-navigation.cjs');
let checks=0;const check=(v,n)=>{assert(v,n);checks++};
const local=/(?:file:\/\/|(?<![A-Za-z0-9])[A-Za-z]:[\\/]|OneDrive[\\/])/i;
check(d.year===2027&&d.date==='2026-10-05'&&d.version==='v0.1','연도·조사일·ISP 누적 판본');
check(d.amount===null&&d.period===null&&d.feedback.includes('없음')&&d.feedback.includes('미수행'),'가격·기간·현업·시험 미확정');
check(d.guideCommit==='da3e003e7584c06511dfbc059d1facfc5895d733','사용자 지정 가이드 확인 커밋');
check(d.phases.map(p=>p.title).join('|')==='환경분석|현황분석|정보화 비전·전략 수립|목표모델 설계|통합 이행계획','원본 ISP5단계 구조');
check(d.phases[3].outputs.length===5&&d.phases[2].outputs.length===1,'독립 비전 단계·To-Be5활동');
check(d.notices.threshold.includes('20억원 미만')&&d.notices.threshold.includes('VAT')&&d.notices.threshold.includes('미확인'),'미만 경계·VAT 미확인');
check(d.notices.basis.includes('정식')&&d.notices.basis.includes('표시하지 않음')&&d.notices.mapping.includes('공식 전체 조직 전수'),'준비·공식완료·모집단 구분');
check(d.readinessQuestions.length===4&&d.notices.route.includes('모두 예')&&d.notices.route.includes('근거 없음'),'ISMP4문항실수요 미확보');
check(d.departments.length===39&&new Set(d.departments.map(x=>x.code)).size===39&&d.mappings.length===42&&new Set(d.mappings.map(x=>x.id)).size===42,'39처42항목 고유');
assert.deepEqual(d.mappings.map(r=>[r.id,r.code,r.bundle]),cost.assignments.map(r=>[r.id,r.code,r.bundle]));check(true,'기존 묶음 이력 유지');
assert.deepEqual(d.mappings.map(r=>r.id).sort(),previous.mappings.map(r=>r.id).sort());check(true,'기존 전체 기획 유지');
const sourceIDs=new Set(d.sources.map(s=>s.id)),controlIDs=new Set(d.controls.map(c=>c.id)),bundleIDs=new Set(cost.bundles.map(b=>b.id));
check(d.sources.length===14&&sourceIDs.size===14,'14개 고유 근거');
for(const s of d.sources){check(s.title&&s.kind&&s.locator&&s.fact&&s.limit&&s.checkedAt===d.date,'출처 메타데이터 '+s.id);check(/^https:\/\//.test(s.url),'공식/지정 근거 HTTPS '+s.id);}
check(d.sources.find(s=>s.id==='I09').url.includes('129926')&&d.sources.find(s=>s.id==='I09').limit.includes('전수')&&d.sources.find(s=>s.id==='I09').fact.includes('68'),'최종 윤리기준·전문열람 한계');
check(d.sources.find(s=>s.id==='I08').effective==='2026-09-11'&&d.sources.find(s=>s.id==='I04').effective==='2026-08-20','최신 법령 판본');
check(d.legal.length===10&&d.ethicsValues.length===6&&d.notices.lawRefresh.includes('시행예정'),'법 적용10·윤리6·2027재점검');
check(d.controls.find(c=>c.id==='PRV05').control.includes('검색체계 등 운용체계 변경')&&!d.controls.find(c=>c.id==='PRV05').control.includes('중요 변경'),'PIA 변경조건 축소 금지');
check(d.controls.find(c=>c.id==='PRV06').control.includes('행정기본법 제20조')&&d.legal.find(r=>r[0].startsWith('LAW07'))[2].includes('설명 요구의 별도'),'자동적처분 적용제외·권리조건 분리');
check(d.controls.length===22&&controlIDs.size===22,'통제22개고유');
for(const [category,count]of [['보안',10],['개인정보',6],['AI 윤리',6]])check(d.controls.filter(c=>c.category===category).length===count,'통제영역 '+category);
for(const c of d.controls){check([c.title,c.nature,c.risk,c.control,c.output,c.test,c.owner].every(Boolean),'기술·역할·증빙·시험 '+c.id);check(c.status.includes('미수행'),'실제 시험으로 승격 금지 '+c.id);check(c.refs.length>0&&c.refs.every(id=>sourceIDs.has(id))&&c.bundles.every(b=>bundleIDs.has(b)),'출처·묶음 추적 '+c.id);}
for(const p of d.phases){check(p.outputs.length>0&&p.input&&p.work&&p.gate&&p.owner&&p.status,'단계 입출력·관문 '+p.id);check(p.refs.every(id=>sourceIDs.has(id))&&p.controls.every(id=>controlIDs.has(id)),'단계 출처·통제 추적 '+p.id);}
check([...controlIDs].every(id=>d.phases.some(p=>p.controls.includes(id))),'22통제의 ISP단계 연결 누락 없음');
for(const r of d.departments)check(r.officialOrgConfirmed===false&&r.owner===null&&r.confirmedAt===null&&r.projects.every(id=>d.mappings.some(m=>m.id===id&&m.code===r.code)),'처별 공식배정·회신 오인 방지 '+r.code);
for(const m of d.mappings){check(m.selected===false&&m.status.includes('미확정'),'기획 확정 오인 방지 '+m.id);check(m.controls.length>0&&m.controls.every(id=>controlIDs.has(id)),'기획별 위험검토 추적 '+m.id);check(m.rfpCandidates.every(id=>cost.rfp.some(r=>r[0]===id))&&cost.rfp.filter(r=>r[1]==='B00').every(r=>m.rfpCandidates.includes(r[0])),'공통·업무 요구 누락 없음 '+m.id);}
check(d.followupRfp.length===22&&new Set(d.followupRfp.map(r=>r.id)).size===22,'후속 요구22개 고유');
for(const r of d.followupRfp)check(r.selected===false&&controlIDs.has(r.controlId)&&r.requirement&&r.deliverable&&r.acceptance&&r.owner,'후속 요구·증빙·인수 '+r.id);
check(d.intake.length===14&&new Set(d.intake.map(q=>q.id)).size===14,'확인질문14');
for(const q of d.intake)check(q.status==='확인 요청 준비'&&['sentAt','response','respondent','receivedAt','decision'].every(k=>q[k]===null),'미발송·미회신 구분 '+q.id);
check(d.caseFields.length===9&&d.readiness.length===8&&d.staffing.length===5,'조사/착수/역할 입력');
for(const r of d.staffing)check(r.people===null&&r.days===null&&r.cost===null,'인원·공수·대가 미산정 '+r.role);
assert.deepEqual(d.metrics,previous.metrics);check(true,'기존측정산식·해석 경계 유지');
check(d.alternatives.map(a=>a.id).join('')==='ABC'&&d.alternatives[1].how.includes('C에도')&&d.alternatives[2].how.includes('B 위에'),'공통데이터정비 조건 A/B/C');
check(d.architecture.length===6&&d.lifecycle.length===6&&d.architecture.some(r=>r.join('').includes('독립'))&&d.lifecycle[5].join('').includes('백업'),'실행통제·전체데이터수명주기');
const model=JSON.parse(fs.readFileSync('dist/downloads/isp-2027-20261005.json','utf8'));assert.deepEqual(model,d);check(true,'JSON정본일치');
const values=require('./export-isp-review.cjs').exportsList();check(values.length===9&&d.downloads.length===9,'다운로드9개');
for(const [name,value]of values){const file=path.join('dist/downloads',name);check(fs.existsSync(file)&&fs.readFileSync(file,'utf8')===value,'산출물실제바이트 '+name);check(!local.test(value),'PC경로 없음 '+name);check(!/gh[pousr]_[A-Za-z0-9]{30,}|-----BEGIN .*PRIVATE KEY/.test(value),'비밀패턴 없음 '+name);}
for(const [name,lines]of [['mapping',43],['controls',23],['intake',15],['case',10]])check(fs.readFileSync('dist/downloads/isp-2027-'+name+'-20261005.csv','utf8').trim().split(/\r?\n/).length===lines,'CSV행수 '+name);
const protection=fs.readFileSync('dist/downloads/isp-2027-assurance-20261005.md','utf8');for(const s of d.sources)check(protection.includes(s.url)&&protection.includes(s.locator)&&protection.includes(s.limit),'문서출처·열람한계 '+s.id);
for(const c of d.controls)check(protection.includes(c.control)&&protection.includes(c.test)&&protection.includes('ISP-'+c.id),'문서HOW·검사추적 '+c.id);
check(!fs.existsSync('dist/내부참조')&&!fs.existsSync('dist/guide-source-register.json'),'비공개 가이드 원문 공개 복제 없음');
const component=fs.readFileSync('src/AnalysisReview.jsx','utf8');check(component.includes('<IspReview/>')&&component.indexOf('<IspReview/>')<component.indexOf('<CostReview/>'),'ISP선행 연속문서');
const context=nav.contextLinks('research-library.html?view=planning');for(const [id,title]of d.navigation)check(context.links.some(n=>n.id===id&&n.title===title&&n.to.endsWith('#'+id)),'사이드목차 '+id);
check(context.links.filter(x=>x.id.startsWith('analysis-')).length===6,'이전6장 링크 보존');
console.log(JSON.stringify({result:'통과',checks,phases:5,departments:39,projects:42,controls:22,downloads:9}));
