const assert=require('node:assert/strict'),fs=require('node:fs'),d=require('../src/katri-solution-expansion.cjs'),w=require('../src/department-work-research.cjs'),reading=require('../src/integrated-reading.cjs');let n=0;const check=(v,t)=>{assert(v,t);n++};
check(d.records.length===12,'미연결 12처 후보');check(new Set(d.records.map(r=>r.key)).size===12,'처 중복 없음');check(new Set(d.records.map(r=>r.id)).size===12,'후보ID 중복 없음');check(d.expandedResearch.length===4,'추가 확대조사 4항목');
for(const r of d.records){const original=w.byKey[r.key];check(original?.name===r.name,'공식 조사 처 대응 '+r.id);check(r.jobMappings.length===original.jobs.length,'전 업무 하위 솔루션 연결 '+r.id);r.jobMappings.forEach((j,i)=>check(j.name===original.jobs[i][0]&&j.output?.length>10&&j.input===original.jobs[i][1],'원 업무·입력 보존/결과 구체화 '+j.id));check(r.stages.length===5&&r.stages.every(s=>s.length===4&&s.every(v=>v.length>8)),'처별 실행·입력·결과 '+r.id);check(r.metrics.length===3&&r.metrics.every(m=>m.formula&&m.records&&m.baseline===null&&m.target===null),'3지표 측정식·원기록/미확정 '+r.id);check([r.baseline,r.target,r.fp,r.mm,r.cost].every(v=>v===null),'미산정 0 대체 금지 '+r.id);check(r.requirements.length===4&&r.tests.length>=4,'요구·반대 사례 '+r.id);check(r.sourceIds.every(id=>d.sources.some(s=>s.id===id)),'실제 근거ID '+r.id);check(r.sourceIds.some(id=>id.startsWith('N-')),'추가 원문조사 근거 '+r.id);const s=reading.selection('?dept='+r.key+'&project='+r.id);check(s.project?.id===r.id&&!s.invalidProject&&s.topicId===r.key,'처/과제/설문 링크 '+r.id);for(const type of ['md','json']){const file='dist/'+r.downloads[type];check(fs.existsSync(file),'개별 공개 다운로드 '+file);const text=fs.readFileSync(file,'utf8');check(text.includes(r.title)&&r.outputs.every(o=>text.includes(o))&&r.sourceIds.every(id=>text.includes(id)),'다운로드 본문/근거/하위기능 '+r.id+'/'+type);if(type==='json')assert.deepEqual(JSON.parse(text).record,r);}}
check(reading.rows.length===51,'51처 모집단 보존');check(reading.rows.flatMap(r=>r.projects).filter(p=>p.kind!=='katri-candidate').length===42,'기존42과제 보존');check(reading.rows.every(r=>r.projects.length>0),'51처 각각 후보 연결');check(d.sources.every(s=>s.url.startsWith('https://')&&s.checkedAt&&s.claim&&s.limit),'출처·날짜·한계');check(!/C:\\|G:\\|file:\/\/|127\.0\.0\.1|api[_-]?key\s*=/.test(JSON.stringify(d)),'공개 개인경로/비밀값 없음');check(d.byId['KT-VC-01'].existing.includes('자동화'),'기존 검사 자동화 재사용');check(d.byId['KT-RS-01'].interface.includes('TS AI PMS'),'공통PMS 중복배제');check(d.sources.find(s=>s.id==='N-RECALL42').limit.includes('모든 리콜'),'리콜 보고 보편 의무 오인 차단');console.log('12처 솔루션 확장 '+n+'항목 통과');

for(const r of d.records)for(const j of r.jobMappings)check(j.sourceIds?.length>0&&j.sourceIds.every(id=>d.sources.some(s=>s.id===id))&&j.evidenceScope,'하위 업무별 출처·판단 범위 '+j.id);
const part=d.byId['KT-CC-01'].jobMappings[2];check(part.sourceIds.includes('W-CONPART')&&part.sourceIds.includes('W-CONLAW')&&part.evidenceScope.includes('확인 전'),'건설기계 부품기관 근거와 처 분장 미확정 구분');
check(d.byId['KT-RP-01'].metrics[2].name==='성과 인계 확인률','인계 확인을 실질 활용효과로 오인 금지');
check(d.byId['KT-CR-01'].metrics[2].formula.includes('정상'),'금지 요청만 막는 시스템의 정상 사용자 차단 회귀 검증');
check(d.byId['KT-VC-01'].stageScopes.slice(0,3).every(s=>s.includes('초기'))&&d.byId['KT-VC-01'].stageScopes.slice(3).every(s=>s.includes('후속')),'초기 문서검토와 후속 실물검사 경계');
console.log('출처·분장·측정 보완을 포함한 '+n+'항목 통과');
const navigation=require('../src/ux-navigation.cjs');for(const r of d.records){const entry=navigation.searchRecords.find(e=>e.id==='ux-'+r.key);check(entry?.route===r.to&&entry.keywords.includes(r.id)&&entry.keywords.includes(r.title),'통합 검색에서 추가 후보 정본으로 연결 '+r.id);}console.log('통합 검색을 포함한 '+n+'항목 통과');
for(const type of ['md','json']){const file='dist/downloads/katri-solutions/katri-solutions-20261008.'+type;check(fs.existsSync(file)&&d.records.every(r=>fs.readFileSync(file,'utf8').includes(r.title)),'12처 전체본 실제 파일·내용 '+type);}assert.deepEqual(JSON.parse(fs.readFileSync('dist/downloads/katri-solutions/katri-solutions-20261008.json','utf8')).records,d.records);console.log('전체본을 포함한 '+n+'항목 통과');

// 2026-10-09 리콜 원문 재검증: 기존 발주·법정 보고조건·추가 AI의 경계.
const policy=d.byId['KT-DP-01'],rfp=d.sources.find(s=>s.id==='N-RECALL-RFP'),rule=d.sources.find(s=>s.id==='N-RECALL42');
check(policy.existing.includes('SFR-002')&&policy.existing.includes('SFR-003~005')&&policy.existing.includes('인수'), '기존 수정요청·연계 발주와 실제 인수 구분');
check(policy.extension.includes('의미 차이')&&policy.extension.includes('재사용')&&policy.interface.includes('승인된 내보내기'), '후속 AI 추가개발·허용 연계 명세');
check(policy.stages.some(s=>s.join(' ').includes('90%'))&&policy.stages.some(s=>s.join(' ').includes('제5항 통보'))&&policy.tests.some(s=>s.includes('실제 정비')), '90%·대상 통보·산정 간주와 정비 완료 구분');
check(policy.boundary.includes('제작사 자체')&&policy.boundary.includes('통지 대행')&&policy.boundary.includes('조사 착수'), '자체 리콜·시정명령·통지대행·접수의 권한 경계');
check(policy.privacy.some(s=>s.includes('소유자 정보')&&s.includes('모델 입력'))&&policy.tests.some(s=>s.includes('희귀')), '소유자 입력 제한과 희귀 중대위험 보존');
check(rfp?.locator.includes('P1534~1561')&&rfp.claim.includes('2027')&&rfp.limit.includes('차수')&&rfp.sha256==='4b8d305dfe56810e2f84487ec7adc955f65bdd8a5f27095b817b1bd0c133b82d', '원본 RFP 요구위치·해시·차수 조건');
check(rule.effective==='2026-10-02'&&rule.url.includes('lsiSeq=290943')&&rule.claim.includes('제6항')&&rule.limit.includes('제5항'), '현행 법령 판본·간주규정·공지 경계');
const wb=require('../src/planning-workbench.cjs'),wp=wb.byId['PROJECT-KT-DP-01'];
check(wp.means===policy.extension&&wb.byId[wp.solutionId].existing===policy.existing&&wp.sourceIds.some(id=>wb.sourceById[id].url===rfp.url),'원장·본문·출처패널 동기화');
check(policy.metrics.every(m=>m.baseline===null&&m.target===null)&&policy.cost===null,'효과·비용 미산정 보존');
console.log('리콜 원문 재검증을 포함한 '+n+'항목 통과');

// 2026-10-09 과거 EWR 연구·후속 시담·현행 고시의 근거 및 범위 보존.
const ewr=d.sources.find(s=>s.id==='N-EWR-TASK21'),ewrRfp=d.sources.find(s=>s.id==='N-EWR-RFP21'),neg=d.sources.find(s=>s.id==='N-RECALL-NEGOTIATION26'),admrule=d.sources.find(s=>s.id==='N-RECALL-ADMRULE26');
check(ewr?.sha256==='b439aebffc704ab99e4e1ce0a3f5d61caba602e2576a159b227edb55305104bb'&&ewr.claim.includes('머신러닝')&&ewr.claim.includes('소스코드')&&ewr.limit.includes('2021'),'2021 연구 요구·원본해시·현재성 한계');
check(ewrRfp?.sha256==='a931b3a1346f9df44e1ccab1003d8e1bc61a982e7f4aefab1d870ae0ac7696fc'&&ewrRfp.locator.includes('P45~57'),'독립 RFP 교차검증과 문단 위치');
check(policy.existing.includes('2021년')&&policy.existing.includes('EWR')&&policy.existing.includes('납품·운영 상태')&&policy.extension.includes('분석 코드'),'기존 머신러닝 연구와 재사용 검토 선행');
check(neg?.claim.includes('실공고(재공고)')&&neg.claim.includes('입찰방식 전자시담')&&neg.claim.includes('수의시담')&&neg.claim.includes('R25BK01235494')&&neg.limit.includes('첨부 0건')&&neg.limit.includes('계약'),'공식 후속 시담·공개첨부·계약 경계');
check(admrule?.effective==='2026-07-08'&&admrule.claim.includes('발생빈도와 별도로')&&admrule.limit.includes('모든 신고'),'빈도와 안전영향·조건부 심의 구분');
check(policy.privacy.some(s=>s.includes('분석 코드')&&s.includes('서면승인'))&&policy.ask.includes('최종보고서'),'성과물 사용권·최종 산출물 확인');
check([ewr,ewrRfp,neg,admrule].every(s=>policy.sourceIds.includes(s.id)&&wp.sourceIds.some(id=>wb.sourceById[id].url===s.url)),'새 원문4건 후보·기획화면 출처 연결');
console.log('EWR 연구·후속 시담 검증을 포함한 '+n+'항목 통과');

// 2026-10-09 별도 과징금 기능발주와 캠페인 보고의 목적·정의 구분.
const fine=d.sources.find(s=>s.id==='N-FINE-RFP25');
check(fine?.sha256==='1247ec6cd121c93e226b46000bbffe4e5e544d78aa91368429d9053b450997b9'&&fine.published.includes('2025-06')&&fine.published.includes('2025-09-18')&&fine.locator.includes('SFR-002~006'),'과징금 원본 해시·시점·요구위치');
check(policy.existing.includes('2025-09')&&policy.existing.includes('CLipReport')&&policy.scope.includes('재구축은 초기 범위에서 제외'),'기존 산정·출력 요구와 초기 추가범위 구분');
check(policy.stages[2][2].includes('과징금용 시정률')&&policy.stages[2][2].includes('정의 확인 전 자동 대체 금지')&&policy.fields.some(s=>s.includes('업무목적·분모·기준일·산식')),'보고 목적·산식 조건 대조');
check(policy.tests.some(s=>s.includes('숫자가 같은'))&&policy.requirements[3].output.includes('숫자가 같은'),'다른 목적의 같은 수치 자동 전용 회귀검증');
check(policy.boundary.includes('법정 부과·감경 승인권')&&policy.ask.includes('자산별 권리')&&fine.limit.includes('실제 계약'),'행정권한·코드 권리·실제 이행 구분');
check(policy.sourceIds.includes(fine.id)&&wp.sourceIds.some(id=>wb.sourceById[id].url===fine.url)&&policy.cost===null&&policy.metrics.every(m=>m.baseline===null&&m.target===null),'새 원문 동기화·금액·실측 미확정 보존');
console.log('과징금 기능발주 검증을 포함한 '+n+'항목 통과');

// 과거 기관 성과보고와 자체 반성의 동시 보존; 현재 병목·연구성과로 승격 금지.
const esg=d.sources.find(s=>s.id==='N-ESG23-DEFECT'),reflection=d.sources.find(s=>s.id==='N-KATRI23-REVIEW');
check(esg?.sha256==='e3919af1b6c647775a51ad7bec094213b2ed4346c7368e3ddb055a236be145eb'&&esg.locator.includes('43쪽')&&esg.limit.includes('2021'),'기관 분석 운영 보고와 연구성과 귀속 구분');
check(reflection?.sha256==='26a6b509232cb0f40f0d86ba95c9886a2cb7e39bf6c1da018d667959adbe67b4'&&reflection.locator.includes('174쪽')&&reflection.limit.includes('외부 감사'),'기관 자체 반성과 외부 감사 구분');
check(policy.existing.includes('RISK MATRIX')&&policy.existing.includes('당시 기관 보고')&&policy.ask.includes('개선 결과·현재 사례'),'과거 성과·한계와 현재 검증 질문 동시 반영');
check([esg,reflection].every(s=>policy.sourceIds.includes(s.id)&&wp.sourceIds.some(id=>wb.sourceById[id].url===s.url)),'상반된 공식 근거 모두 후보·기획화면 연결');
console.log('기관 보고·반대 근거 검증을 포함한 '+n+'항목 통과');

check(policy.requirements[0].output===policy.fields.join(' / '),'추가 시정률 정의 필드와 수집 요구사항 출력의 일치');
console.log('요구사항 추적 검증을 포함한 '+n+'항목 통과');
