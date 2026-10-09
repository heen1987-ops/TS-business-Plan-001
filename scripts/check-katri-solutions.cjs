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

const ai25=d.sources.find(s=>s.id==='N-KATRI25-AI');
check(ai25?.sha256==='33bdcd6b7059e8445a21408e3957bac912c89549ec6cf61d55e5193dffcbcbc2'&&ai25.locator.includes('199쪽')&&ai25.locator.includes('200쪽'),'2025 원본·실적/계획 위치 분리');
check(policy.existing.includes('AI 활용 자체를 신규로 계상하지 않으며')&&policy.existing.includes('납품 완료로 판단하지 않음')&&policy.extension.includes('2026 분석시스템'),'기존 AI 실적과 추가구축·2027 증분개발 구분');
check(policy.sourceIds.includes(ai25.id)&&wp.sourceIds.some(id=>wb.sourceById[id].url===ai25.url)&&policy.ask.includes('대상·분류·처리 경로'),'신규 근거·현재성 확인질문·기획화면 동기화');
check(policy.requirements[3].output.includes('AI 인과효과')&&policy.metrics.every(m=>m.baseline===null&&m.target===null),'기관 조치 실적의 AI 효과 전용 방지·검수 연결');
console.log('2025 AI 실적·추진방향 대조 포함 '+n+'항목 통과');

const link26=d.sources.find(s=>s.id==='N-RECALL-LINK-RFP26'),contract26=d.sources.find(s=>s.id==='N-RECALL-LINK-CONTRACT26');
check(link26?.sha256==='9cf8e0c4b6a2f64c6bc81db8ed02d7f55d4d2882147a4f7cbd236d77c9b4ab50'&&link26.locator.includes('SFR-003~007'),'2026 연계 원본·요구사항 위치');
check(contract26?.sha256==='5c2bd1ec5d8008fe6078549a69d57a73f3ab1d08849377f50aca2b4450a851f9'&&contract26.limit.includes('20260512')&&contract26.limit.includes('계약번호 직접 연결 미확인'),'계약대장 날짜 차이·제목 일치 한계');
check(policy.existing.includes('일일배치 반영')&&policy.scope.includes('동일 신규 납품으로 재산정하지 않음')&&policy.existing.includes('최종 범위·가동·인수는 미확인'),'기존 연계 과업 중복·실제 인수 구분');
check(policy.extension.includes('원본·승인·감사이력 삭제로 확대하지 않음')&&policy.tests.some(s=>s.includes('취소된 원문')),'현행 AI 설명 철회와 원본·감사 보존 구분');
check(policy.stages[2][2].includes('일일배치')&&policy.stages[2][2].includes('실시간 조회의 기준시각')&&policy.fields.some(s=>s.includes('배치 기준시각')),'서로 다른 연계시점·최신성 확인');
check(policy.ask.includes('DB 구조 변경이력')&&policy.ask.includes('최종 계약·자산별'),'자료구조 형상·업무이력 및 자산권리 구분');
check(policy.requirements[0].output===policy.fields.join(' / ')&&policy.requirements[3].output===policy.tests.join(' / '),'신규 대사 필드·인수시험 요구사항 동기화');
check(['N-KATRI26-PLAN','N-KATRI26-TASK','N-RECALL-LINK-RFP26','N-RECALL-LINK-CONTRACT26'].every(id=>{const source=d.sources.find(s=>s.id===id);return policy.sourceIds.includes(id)&&wp.sourceIds.some(k=>wb.sourceById[k].url===source.url)}),'2026 계획·연구·연계·계약 4근거의 실제 기획화면 연결');
console.log('2026 연계·계약 범위 포함 '+n+'항목 통과');

// 계약 공시의 날짜·식별 범위와 구현/검수 미확인을 별도로 보존.
const fineContract=d.sources.find(s=>s.id==='N-FINE-CONTRACT25');
check(fineContract?.sha256==='845685d86ee24055fafd5a6e99da924a79a114441d4106d819666a73bb30ffff'&&fineContract.url.includes('F_finninfo3796697669')&&fineContract.locator.includes('26행(연번21)'),'과징금 계약 원본·대상행 추적');
check(fineContract.published.includes('2025-12-31')&&fineContract.claim.includes('2025-11-04')&&fineContract.claim.includes('2025-11-05~2026-01-03'),'게시일·계약일·대장상 기간 구분');
check(fineContract.limit.includes('입찰·계약번호 직접 연결')&&fineContract.limit.includes('기간 종료를 준공·검수 완료로 해석하지 않음')&&fineContract.limit.includes('사용권 미확인'),'계약 공시를 구현·권리 확보로 승격 금지');
check(['계산식','재산정','최종 승인','구현','검수'].every(t=>fine.limit.includes(t))&&fine.limit.includes('동일명 계약 공시 확인'),'새 계약 근거와 남은 RFP 미확인의 동시 보존');
check(policy.existing.includes('2025-11-04')&&policy.existing.includes('기간 종료를 납품·검수 완료로 판단하지 않음')&&policy.ask.includes('입찰·계약번호 연결'),'기획 본문·현업 확인 질문에 계약 증거 수준 반영');
check(policy.sourceIds.includes(fineContract.id)&&wp.sourceIds.some(id=>wb.sourceById[id].url===fineContract.url)&&policy.cost===null&&policy.metrics.every(m=>m.baseline===null&&m.target===null),'계약 근거 실제 화면 연결·미산정 보존');
console.log('과징금 계약 공시 대조 포함 '+n+'항목 통과');

// 원천별 단위·시점·상충 처리와 기획화면/내려받기 근거 연결.
const sourceContractIds=['N-RECALL-PUBLIC26','N-NHTSA-DATA26','N-NHTSA-DICT26','N-NHTSA-USE23','N-KATRI-RESEARCH-CONTRACT26'];
check(sourceContractIds.every(id=>{const s=d.sources.find(x=>x.id===id);return s&&policy.sourceIds.includes(id)&&wp.sourceIds.some(k=>wb.sourceById[k].url===s.url)}),'원천 조건5건 후보·기획화면 근거 연결');
check(d.sources.find(s=>s.id==='N-NHTSA-DICT26').sha256==='5bf96ea4ea22f02049435411e043f58c1406a27b285a09c3575bf7e9672bb747','데이터사전 원문 고정');
check(policy.requirements[0].output===policy.fields.join(' / ')&&policy.requirements[3].output===policy.tests.join(' / '),'입력·검수 조건의 요구사항 동기화');
check(policy.tests.some(s=>s.includes('다중 행')&&s.includes('문서ID'))&&policy.tests.some(s=>s.includes('512/516')&&s.includes('임의 확정')),'정상 다중 행 보존·상충 규격 미확정 검수');
check(policy.boundary.includes('보고 반영 전')&&policy.boundary.includes('국내 사양')&&policy.privacy.some(s=>s.includes('대량 VIN')),'시점·국내 적용·식별정보 전송 경계');
check(policy.metrics.every(m=>m.baseline===null&&m.target===null)&&policy.cost===null,'실측·예산 미확정 유지');
console.log('원천자료 의미·판본 검증 포함 '+n+'항목 통과');

// 국내 원천의 파일/API 구분과 실제 CSV 형식·권한 경계 회귀 확인.
const domesticIds=['N-KR-RECALL-DATA26','N-KR-RECALL-CSV25','N-KR-RECALL-SCHEMA26','N-KR-RECALL-API21','N-KR-RECALL-API-GUIDE'];
check(domesticIds.every(id=>{const s=d.sources.find(x=>x.id===id);return s&&policy.sourceIds.includes(id)&&wp.sourceIds.some(k=>wb.sourceById[k].url===s.url)}),'국내 공개근거5건 화면·후보 연결');
check(d.sources.find(s=>s.id==='N-KR-RECALL-CSV25').sha256==='f8ec0a20cbef74cc583e303bf233ab4b209c6c608731dfef29680a433aebabdf','실제 확인 CSV판본 고정');
check(policy.interface.includes('연간 CSV')&&policy.interface.includes('파일자동변환 API')&&policy.interface.includes('사전협의·운영승인')&&policy.interface.includes('이전 기준일'),'연간 파일·기관 API·조회실패 구분');
check(policy.tests.some(t=>t.includes('CP949')&&t.includes('길이8'))&&policy.tests.some(t=>t.includes('2015')&&t.includes('최신6열')),'인코딩·날짜길이·판본차이 검수');
check(policy.boundary.includes('1045행')&&policy.boundary.includes('비리콜 무상수리')&&policy.privacy.some(t=>t.includes('법적 처리근거')),'집계단위·무상수리 범위·차대번호 이용조건 구분');
check(policy.requirements[0].output===policy.fields.join(' / ')&&policy.requirements[3].output===policy.tests.join(' / ')&&policy.cost===null&&policy.metrics.every(m=>m.baseline===null&&m.target===null),'요구사항 연결 및 비용·효과 미확정 보존');
console.log('국내 공개자료 적용 검증 포함 '+n+'항목 통과');
