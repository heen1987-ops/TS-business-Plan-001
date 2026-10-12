const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),d=require('../src/ts-ai-pms.cjs'),exporter=require('./export-ts-ai-pms.cjs');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist');let count=0;const check=(ok,msg)=>{assert(ok,msg);count++;};
check(d.date==='2026-10-12'&&d.version==='v0.3','NOA 공통 가이딩·선정·지급·업체 아카이브 설계 기준일');
check(d.reportingProfiles.length===3&&d.reportingProfiles.every(p=>p.guiding),'보고 적용 여부와 관계없는 NOA 공통 가이딩');
check(d.reportingProfiles.find(p=>p.id==='not-required').requiresRealPms===false&&d.reportingProfiles.find(p=>p.id==='not-required').externalSubmission==='미생성','보고 불필요 과업의 외부 의존성 제외');
check(d.reportingProfiles.find(p=>p.id==='required').requiresRealPms===true&&d.reportingProfiles.find(p=>p.id==='required').completion.includes('각각'),'필수 외부 보고 완료조건 분리');
check(d.reportingProfiles.find(p=>p.id==='pending').requiresRealPms===null&&d.reportingProfiles.find(p=>p.id==='pending').externalSubmission.includes('차단'),'확인 중을 보고 불필요로 치환 금지');
check(d.requirements.find(r=>r.id==='PMS-F05').test.includes('혼합 사업')&&d.requirements.find(r=>r.id==='PMS-F05').test.includes('별도 제출 권한'),'과업별 혼합 적용·권한의 인수시험');
check(d.metrics.find(m=>m.id==='K1').quality.includes('0분')&&d.metrics.find(m=>m.id==='K1').method.includes('대상 과업만'),'보고 비대상 0분 평균 혼입 방지');
check(d.constraints.includes('국토부 확대는 별도 사업·권한·비용 검토'),'향후 기관 확대와 현재 사업 경계');
check(d.sections.length===16,'목적부터 근거까지 16개 연속 절');check(d.requirements.length===12&&d.research.length===4&&d.metrics.length===5,'12개 요구·4개 연구·5개 지표');
check(Object.keys(d.sources).length===37&&d.downloads.length===15,'기존33개+검사근거2개·기존15개 자료');
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
for(const [id,s]of Object.entries(d.sources)){check(s.id===id&&s.checkedAt===(Number(id.slice(1))<=17?'2026-10-08':Number(id.slice(1))<=26?'2026-10-10':Number(id.slice(1))<=29?'2026-10-11':Number(id.slice(1))<=33?'2026-10-12':'2026-10-13')&&!!s.location&&!!s.fact&&!!s.limit,'근거 상태 '+id);if(s.url)check(/^https:\/\//.test(s.url),'외부 원문 HTTPS '+id);}
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

check(sectionText('vendor-archive').includes('ECR-001')&&sectionText('vendor-archive').includes('공식 이관 완료 판정 금지'),'기존 기록관리 기반과 공식 이관 경계');
check(sectionText('vendor-archive').includes('원격 회수는 보장하지')&&sectionText('vendor-archive').includes('권한을 재확인할 수 없는'),'파생자료 권한 회수 한계·실패 시 제공 보류');
check(sectionText('architecture').includes('원본ID')&&sectionText('architecture').includes('수신 실패'),'원본 참조·부분 이관 실패의 실행 설계');
check(d.requirements.find(r=>r.id==='PMS-F10').refs.includes('P21')&&d.acceptanceTests.find(t=>t.id==='T20').scenario.includes('색인 갱신 실패'),'기록물 근거의 요구·인수시험 연결');
check(d.costInputs[2].method.includes('중복 제외')&&d.costInputs[2].reuseEvidence.includes('P21'),'기존 기록관리와 증분 공수 산정 경계');
check(d.templates.find(t=>t.id==='vendor-archive').headers.includes('공식이관접수·검증결과참조'),'아카이브 입력양식에 공식 수신 근거 연결');
check(d.sources.P21.sha256==='6c734ed7b67408dd8c5af2576aefbe653baba104efaab5f10371626cd6987658','기록물 RFP 원본 해시');

check(sectionText('architecture').includes('SFR-004')&&sectionText('architecture').includes('명세 등록만으로')&&d.costInputs[2].method.includes('SIR-002'),'공통 AI 기반과 PMS 어댑터의 증분 경계');
check(d.sources.P22.sha256==='fedda42b47b47bfb94a1d1e8a8f738acc400c1ca94349d822947658b94615280','공식 공통플랫폼 RFP 해시');

check(sectionText('purpose').includes('2025년 구축 계약')&&sectionText('purpose').includes('기관 활용현황 공시')&&sectionText('purpose').includes('이행 완료를 판정하지'),'구축 계약·기관 활용·2026 요구·2027 설계의 구분');
check(d.sources.P23.limit.includes('구축 중')&&d.sources.P24.limit.includes('2026년'),'활용목록과 과거 계약의 현재 완료 오인 방지');
check(sectionText('cost').includes('FP 또는 투입공수')&&sectionText('cost').includes('무료 처리 금지')&&sectionText('cost').includes('동시 합산하지'),'AI 이용료·커스터마이징·구축비 중복 방지');
check(sectionText('cost').includes('2027년')&&d.sources.P26.limit.includes('수식 검산 미실시'),'산정 양식 예제와 다음 연도 확정 견적 구분');
check(d.costInputs[2].method.includes('P25')&&d.costInputs[2].reuseEvidence.includes('P23')&&d.costInputs[3].reuseEvidence.includes('빈 표준서식'),'비용 다운로드의 신규 근거·실행 증거 확인 연결');
for(const id of ['P23','P24','P25','P26'])check(/^[a-f0-9]{64}$/.test(d.sources[id].sha256),'공식 원본 해시 '+id);


check(sectionText('cost').includes('양쪽에 포함되지 않은')&&sectionText('cost').includes('직접경비 재가산 금지')&&sectionText('cost').includes('부가세'),'AI 소계와 별도 개발비의 총액 경계');
check(sectionText('cost').includes('필수 입력이 빠지면 계산값이 있어도 미산정')&&sectionText('cost').includes('시간 단위'),'공수 입력 누락과 단위 검토');
check(sectionText('cost').includes('수정 없는 대상 기능')&&sectionText('cost').includes('플랫폼 전체 할인율 적용 금지')&&sectionText('cost').includes('통합·시험이 모두 불필요')&&sectionText('cost').includes('데이터 기능'),'재사용 시험비율 적용 대상 제한');
check(sectionText('cost').includes('FP 또는 공수')&&sectionText('cost').includes('선택·승인 근거'),'가이드와 양식의 산정 방식 구분');
check(sectionText('cost').includes('250122')&&sectionText('cost').includes('2024 가이드'),'배포 ZIP 연도와 내부 양식 판본 구분');
check(d.costInputs[1].method.includes('수정 없는 재사용')&&d.costInputs[2].method.includes('별도 구축개발비')&&d.costInputs[3].overlapWbs.includes('시험비율'),'비용표의 재사용·총액·시험 중복 검토 연결');
check(d.sources.P26.location.includes('I36')&&d.sources.P26.limit.includes('XLSM 3종'),'선택 수식 검토와 미검토 범위 명시');

check(d.sources.P27.sha256==='3533850237bc7d5a0cfa89efef73013778a70424ef03b31abcf8aeeb9bb8447b','공공 AX 공식 원본 해시');
check(d.sources.P28.published.includes('2026-09-11')&&d.sources.P29.published.includes('2026-09-11'),'현행법·시행령 시행일');
check(sectionText('data').includes('승인 버튼만')&&sectionText('data').includes('수정/반려'),'형식 결재와 실질적 검토 구분');
check(sectionText('data').includes('기존 평가 파일')&&sectionText('data').includes('면제 판정 금지'),'영향평가 변경 조건 누락 방지');
check(sectionText('data').includes('법인 업체 평가')&&sectionText('data').includes('거부권 예외'),'정보주체·권리 예외의 조건부 적용');
check(d.acceptanceTests.find(t=>t.id==='T17').expected.includes('실질적 검토')&&d.acceptanceTests.find(t=>t.id==='T20').expected.includes('실제 미실행'),'추가 검수 조건과 실제 시험 구분');
check(d.requirements.find(r=>r.id==='PMS-N01').refs.includes('P29')&&d.requirements.find(r=>r.id==='PMS-F03').refs.includes('P28'),'법령→요구→검수 연결');

check(sectionText('purpose').includes('AI PMS는 사업관리 적용 사례')&&sectionText('purpose').includes('공고 미매핑'),'공통 업무흐름과 PMS 사례·기획 상태 구분');
check(sectionText('workflow').includes('후속 질의 추천')&&sectionText('workflow').includes('업무 후속조치 구분'),'대화 추천과 업무 처리 구분');
check(sectionText('workflow').includes('실제 미지원 범위는 확인 필요')&&sectionText('workflow').includes('최종 계약'),'기존 기능 부재 단정 방지');
check(sectionText('workflow').includes('기존 허브 재구축 제외')&&sectionText('workflow').includes('증분'),'기존 연계와 추가 개발 범위');
check(sectionText('workflow').includes('중요 입력 변경 시 재승인')&&sectionText('workflow').includes('실행 직전 권한'),'승인 판본·실행 권한 확인');
check(sectionText('workflow').includes('원거래 조회')&&sectionText('workflow').includes('전체 완료 차단'),'응답 유실·부분 성공의 결과 확인');
const wf=d.sections.find(s=>s.id==='workflow').blocks.find(b=>b.title==='업무 실행의 구체 검수 후보 · 제품 시험 미실행');
check(wf.rows.length===6&&new Set(wf.rows.map(r=>r[0])).size===6&&wf.rows.every(r=>r[2]),'6개 검수 후보의 재현·결과 연결');
check(d.sources.P30.sha256===d.sources.P22.sha256&&d.sources.P31.limit.includes('실제 동작 미검증'),'원문 동일성·제품 소개 한계');
const workflowDoc=fs.readFileSync(path.join(out,'downloads/ts-public-workflow-2027-plan.md'),'utf8');
check(workflowDoc.includes('v0.4')&&workflowDoc.includes('WF-R15')&&workflowDoc.includes('A15')&&!/C:\\Users|file:\/\//.test(workflowDoc),'공개 초안 버전·요구·검수·PC 경로 제외');


check(d.sources.P32.published.includes('2026-05-06')&&/^[a-f0-9]{64}$/.test(d.sources.P32.sha256),'민원 시행령 판본·원문 해시');
check(sectionText('workflow').includes('업무과중·담당자 지정 지연/부재만으로 연장 금지'),'금지된 사유만의 자동 연장 방지 설계');
check(sectionText('workflow').includes('NOA 응답 지연만으로 자동 제외 금지')&&sectionText('workflow').includes('처리 불가 근거'),'AI 지연과 법정 산입 제외의 구분');
check(sectionText('workflow').includes('TS 일괄 적용')&&sectionText('workflow').includes('법정기한 자동 중지'),'업무별 적용·내부 보류의 경계');
const limits=d.sections.find(s=>s.id==='workflow').blocks.find(b=>b.title==='민원 기한관리의 추가 검수 후보 · 제품 시험 미실행');
check(limits.rows.length===3&&limits.rows.every(r=>r[2])&&limits.refs.includes('P32'),'기한관리 3개 검수 후보와 근거 연결');
check(sectionText('cost').includes('같은 기한 엔진·로그 기능 중복 산정 금지'),'기존 기능·증분 비용 경계');


const enterprise=JSON.parse(fs.readFileSync(path.join(out,'downloads/ts-enterprise-workflow-design.json'),'utf8'));
check(enterprise.version==='v0.4'&&enterprise.departments.length===74&&enterprise.organizations.length===227,'全사 74처·227조직의 제안범위'.replace('全','전'));
check(new Set(enterprise.departments.map(p=>p.orgCode)).size===74&&new Set(enterprise.organizations.map(p=>p.code)).size===227,'조직 코드 중복 금지');
check(Object.keys(enterprise.packages).length===7&&enterprise.requirements.length===15&&enterprise.tests.length===15,'공통1회+6업무팩·15요구·15검수');
for(const p of enterprise.departments){
 check(p.facts.length>0&&p.refs.length>0&&p.flow&&p.delta&&p.gate,'처별 실제 원문·추가개발·검수 '+p.orgCode);
 check(p.costAmount===null&&p.costQuantity===null,'처별 미산정 보존 '+p.orgCode);
 check(p.requirements.every(id=>enterprise.requirements.some(r=>r[0]===id))&&p.tests.every(id=>enterprise.tests.some(t=>t[0]===id)),'처별 요구·검수 연결 '+p.orgCode);
 check(enterprise.organizations.some(o=>o.code===p.orgCode&&o.linked===p.id),'상세처의 전체조직 연결 '+p.orgCode);
}
check(enterprise.organizations.find(o=>o.code==='1019700').decision.includes('담당업무 미확인'),'새 AI서비스개발팀 확인 한계');
check(sectionText('workflow').includes('SFR-008/009')&&sectionText('workflow').includes('선택반영')&&sectionText('workflow').includes('허브·표준 도구 변환 재구축 제외'),'기존 공시·MCP·사람검토 중복제외');
check(sectionText('cost').includes('처수×같은 개발비')&&sectionText('cost').includes('FP/MM 중복 가산 금지'),'전사 원가 중복방지');
check(d.sources.P33.limit.includes('전결')&&d.sources.P33.limit.includes('전체 담당업무 최신 재수집'),'조직/법정권한·최신조사 구분');
const fullHtml=fs.readFileSync(path.join(out,'downloads/ts-enterprise-workflow-2027.html'),'utf8');
check((fullHtml.match(/<article id="WF-/g)||[]).length===74&&fullHtml.includes('lang="ko"'),'74처 연속 HTML·한글');
check(!/C:\\Users|file:\/\//.test(fullHtml+JSON.stringify(enterprise)),'公開 산출물 PC경로 제외'.replace('公開','공개'));


check(['PMS-A01','PMS-A02','PMS-A03'].every(id=>sectionText('boundary').includes(id)),'감리·검사 추가 시나리오 3개');
check(sectionText('boundary').includes('시험 미실행')&&sectionText('boundary').includes('기한 경과')&&sectionText('boundary').includes('기술적용계획표'),'검수 제안 상태·기간 자동합격 금지·기술표');
check(d.requirements.find(r=>r.id==='PMS-F06').acceptance.includes('감리 확인·검사 합격·필요한 인수 완료')&&d.requirements.find(r=>r.id==='PMS-F06').refs.includes('P35'),'검사·인수 독립 상태와 공고첨부 연결');
check(d.sources.P04.additionalRead.checkedAt==='2026-10-13'&&d.sources.P04.checkedAt==='2026-10-08','감리기준 선택 재검증과 기존 법령 확인일 분리');
check(d.sources.P35.limit.includes('최종 체결 계약이 아님')&&d.sources.P34.limit.includes('별도 P36에서 확인')&&d.sources.P36.limit.includes('TS 작성 완료본·최종계약 서식 아님')&&d.sources.P36.sha256==='f489c277136b568e168e5105842a6bf575ee6460c656d3fac1d4034b2c7a547d'&&d.sources.P37.location.includes('COR-007'),'출처 적용·부분 판독 한계 보존');

check(d.sources.P04.location.includes('2026-10-13 추가 판독')&&d.sources.P04.limit.includes('기존 법·시행령 전체 재검증 아님')&&d.sources.P04.links.some(x=>x[1]===d.sources.P04.additionalRead.url),'화면에 표시되는 선택 판독 위치·범위·원문 링크');
console.log('TS 자체 AI PMS 설계 '+count+'항목 통과');

// 공식 서식의 적용상태·미확인 및 기존 과업의 중복 경계
for(const t of ["PMS-A04","공란은 미확인","기본 문서추출","최신 빈서식","COR-007"]){if(!JSON.stringify(require("../src/ts-ai-pms.cjs")).includes(t))throw Error("서식 검수 경계 누락 "+t);}
