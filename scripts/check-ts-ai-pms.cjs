const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),d=require('../src/ts-ai-pms.cjs'),exporter=require('./export-ts-ai-pms.cjs');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist');let count=0;const check=(ok,msg)=>{assert(ok,msg);count++;};
check(d.date==='2026-10-10'&&d.version==='v0.3','NOA 공통 가이딩·선정·지급·업체 아카이브 설계 기준일');
check(d.reportingProfiles.length===3&&d.reportingProfiles.every(p=>p.guiding),'보고 적용 여부와 관계없는 NOA 공통 가이딩');
check(d.reportingProfiles.find(p=>p.id==='not-required').requiresRealPms===false&&d.reportingProfiles.find(p=>p.id==='not-required').externalSubmission==='미생성','보고 불필요 과업의 외부 의존성 제외');
check(d.reportingProfiles.find(p=>p.id==='required').requiresRealPms===true&&d.reportingProfiles.find(p=>p.id==='required').completion.includes('각각'),'필수 외부 보고 완료조건 분리');
check(d.reportingProfiles.find(p=>p.id==='pending').requiresRealPms===null&&d.reportingProfiles.find(p=>p.id==='pending').externalSubmission.includes('차단'),'확인 중을 보고 불필요로 치환 금지');
check(d.requirements.find(r=>r.id==='PMS-F05').test.includes('혼합 사업')&&d.requirements.find(r=>r.id==='PMS-F05').test.includes('별도 제출 권한'),'과업별 혼합 적용·권한의 인수시험');
check(d.metrics.find(m=>m.id==='K1').quality.includes('0분')&&d.metrics.find(m=>m.id==='K1').method.includes('대상 과업만'),'보고 비대상 0분 평균 혼입 방지');
check(d.constraints.includes('국토부 확대는 별도 사업·권한·비용 검토'),'향후 기관 확대와 현재 사업 경계');
check(d.sections.length===16,'목적부터 근거까지 16개 연속 절');check(d.requirements.length===12&&d.research.length===4&&d.metrics.length===5,'12개 요구·4개 연구·5개 지표');
check(Object.keys(d.sources).length===20&&d.downloads.length===8,'기존17개+신규3개 근거·8개 배포 자료');
const sectionText=id=>JSON.stringify(d.sections.find(s=>s.id===id));
check(sectionText('procurement').includes('협상에 의한 계약의 예시')&&sectionText('procurement').includes('가상 업체')&&sectionText('procurement').includes('공동수급'),'절차 조건부 적용·가상 업체 배제·참가단위');
check(sectionText('procurement').includes('실제 부여한 0점')&&sectionText('procurement').includes('임의 가감점')&&sectionText('procurement').includes('채택 제안'),'점수 미입력/0 분리·자동 평가 배제·채택 조건');
check(sectionText('payments').includes('신규 지급액에 더하지')&&sectionText('payments').includes('단순 합산')&&sectionText('payments').includes('순지급'),'선금정산·대가·현금 중복 합산 방지 설계');
check(sectionText('payments').includes('원거래 조회')&&sectionText('payments').includes('재확인')&&sectionText('payments').includes('송금 쓰기'),'지급 승인 판본·중복·조회 우선 경계');
check(d.sections.find(s=>s.id==='procurement').blocks.find(b=>b.type==='figure').caption.includes('선금이 검사 이후에만 지급된다는 순서도가 아님'),'선정·지급 연결도의 지급유형별 순서 설명');
check(sectionText('vendor-archive').includes('캐시')&&sectionText('vendor-archive').includes('학습')&&sectionText('vendor-archive').includes('헤더만'),'파생자료·학습·빈 양식의 공개 경계');
check(d.acceptanceTests.length===12&&new Set(d.acceptanceTests.map(t=>t.id)).size===12,'신규 인수시험 명세 12개 고유');
for(const t of d.acceptanceTests){check(t.executionStatus.includes('미실행')&&!!t.scenario&&!!t.expected,'제품 시험 미실행 표기·합격조건 '+t.id);for(const r of t.requirements)check(d.requirements.some(x=>x.id===r),'시험 요구 연결 '+t.id+' / '+r);}
check(d.templates.length===3,'공고/평가·지급·아카이브 빈 입력양식 3종');
for(const t of d.templates){check(t.rows.length===0&&new Set(t.headers).size===t.headers.length&&t.headers.length>=15,'실제 자료 없는 고유 헤더 '+t.id);const b=fs.readFileSync(path.join(out,'downloads',t.file));check(b.subarray(0,3).equals(Buffer.from([239,187,191])),'빈 양식 한글 BOM '+t.id);check(b.toString('utf8').trim().split(/\r?\n/).length===1,'빈 양식 실제 데이터 행 없음 '+t.id);}
check(new Set(d.sections.map(s=>s.id)).size===d.sections.length,'절 ID 고유');
for(const s of d.sections)for(const b of s.blocks){check(['note','table','figure','requirements','research','metrics','sources'].includes(b.type),'렌더 유형 '+s.id);for(const ref of b.refs||[])check(!!d.sources[ref],'근거 연결 '+ref);if(b.type==='table')for(const r of b.rows)check(r.length===b.headers.length,'표 열 일치 '+s.id);if(b.type==='figure'){const f=path.join(out,b.path);check(fs.existsSync(f),'실제 이미지 '+b.path);const buf=fs.readFileSync(f);check(buf.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'PNG 형식 '+b.path);const w=buf.readUInt32BE(16),h=buf.readUInt32BE(20);check(w/h>1.7&&w/h<1.85,'16:9 도식 '+b.path);}}
for(const r of d.requirements){check(!!r.acceptance&&!!r.test&&!!r.wbs,'인수·시험·편성 '+r.id);for(const ref of r.refs)check(!!d.sources[ref],'요구 근거 '+r.id);}
for(const m of d.metrics){check(m.baseline===null&&m.target===null,'미측정 수치를 0으로 쓰지 않음 '+m.id);check(!!m.scope&&!!m.formula&&!!m.method&&!!m.quality&&!!m.owner,'운영·연구 측정명세 '+m.id);}
check(d.costInputs.length===8,'구축·연구·감리·운영 8개 산정 묶음');
for(const c of d.costInputs){check(c.fp===null&&c.personMonths===null&&c.unitCost===null&&c.amount===null,'미산정 비용 '+c.bundle);check(!!c.includedBoundary&&!!c.incrementalBoundary&&!!c.reuseEvidence&&!!c.overlapWbs,'대가 포함·증분·재사용·중복 경계 '+c.bundle);}
for(const [id,s]of Object.entries(d.sources)){check(s.id===id&&s.checkedAt===(Number(id.slice(1))<=17?'2026-10-08':'2026-10-10')&&!!s.location&&!!s.fact&&!!s.limit,'근거 상태 '+id);if(s.url)check(/^https:\/\//.test(s.url),'외부 원문 HTTPS '+id);}
for(const [,file]of d.downloads)check(fs.existsSync(path.join(out,file)),'배포 다운로드 '+file);
check(fs.readFileSync(path.join(out,'downloads/ts-ai-pms-2027-plan.md'),'utf8')===exporter.markdown(),'본문·기획서 동일');
check(JSON.stringify(JSON.parse(fs.readFileSync(path.join(out,'downloads/ts-ai-pms-design.json'),'utf8')))===JSON.stringify(d),'원장 내보내기 동일');
for(const p of ['ts-ai-pms-requirements.csv','ts-ai-pms-cost-inputs.csv'])check(fs.readFileSync(path.join(out,'downloads',p)).subarray(0,3).equals(Buffer.from([239,187,191])),'Excel 한글 BOM '+p);
check(fs.readFileSync(path.join(root,'src/IntegratedReader.jsx'),'utf8').includes('<TsAiPmsPlan/>'),'통합 본문 PMS 연결');check(fs.readFileSync(path.join(root,'src/SkillPms.jsx'),'utf8').includes('<TsAiPmsPlan/>'),'기존 PMS 경로 연결');
check(sectionText('realpms').includes('국토교통EA시스템')&&sectionText('realpms').includes('동일성은 별도 확인')&&sectionText('realpms').includes('적용 가능'),'법령 적용과 RealPMS 제품 구현·권한 구분');
check(sectionText('realpms').includes('제33조')&&sectionText('realpms').includes('제47조')&&sectionText('realpms').includes('포괄 사전협의로 확대하지'),'재사용 권한·서식코드 협의의 범위');
check(sectionText('procurement').includes('대응 후보')&&sectionText('procurement').includes('자동 병합 금지'),'제목만의 공고평가 대응은 후보');
check(sectionText('procurement').includes('사업예산 이하')&&sectionText('procurement').includes('80×85%=68')&&sectionText('procurement').includes('다른 사업의 기본값으로 사용하지'),'실제 공고 가격·기술 조건의 사례 한정');
check(sectionText('payments').includes('물품/용역')&&sectionText('payments').includes('선금 일반 절차에 일괄 적용하지'),'계약종류·지급유형 혼입 방지');
for(const [id,token]of [['T11','공고번호 없는'],['T13','기술 기준 미달'],['T16','물품/용역']])check(d.acceptanceTests.find(t=>t.id===id).scenario.includes(token),'새 근거의 시험명세 연결 '+id);
const renderedTests=d.sections.find(s=>s.id==='requirements').blocks.find(b=>b.type==='table'&&b.title==='업체 선정·지급·아카이브의 인수시험');
check(renderedTests.rows.every((r,i)=>r[1]===d.acceptanceTests[i].scenario&&r[2]===d.acceptanceTests[i].expected),'화면·원장 시험명세 동기화');
for(const id of ['P18','P19','P20'])check(/^[a-f0-9]{64}$/.test(d.sources[id].sha256),'새 원문 해시 '+id);
check(d.templates.find(t=>t.id==='bidder-evaluation').headers.includes('기술적격조건·결과참조')&&d.templates.find(t=>t.id==='payment-ledger').headers.includes('계약종류·적용조건참조'),'빈 양식에 적용조건·적격결과 연결');
console.log('TS 자체 AI PMS 설계 '+count+'항목 통과');
