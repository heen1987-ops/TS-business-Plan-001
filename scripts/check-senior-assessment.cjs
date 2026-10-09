const fs=require('node:fs'),assert=require('node:assert/strict'),d=require('../src/senior-assessment.cjs'),drt=require('../src/drt-assurance.cjs'),cost=require('../src/cost-review.cjs'),implementation=require('../src/implementation-review.cjs');
let checks=0;function check(ok,msg){assert(ok,msg);checks++}
check(d.id==='QE-H01'&&d.year===2027&&d.status.includes('후보'),'2027 추가 검토 후보 구분');
check(d.metrics.length===5&&d.metrics.every(m=>m.baseline===null&&m.target===null),'임의 정확도·효과 목표 금지');
check(d.metrics[0].name==='추가 기능 확인 필요 대상의 누락률'&&d.evaluation.includes('기능 저하 확정, 법정 적부 또는 사고위험 판정 정확도와 구분'),'M01 참조라벨을 확정 진단·자격 판단으로 승격하지 않음');
check(d.cost.amount===null&&d.cost.people===null&&d.cost.period===null,'자료·범위 확인 전 가격·인원 미확정');
const ids=new Set(d.sources.map(s=>s.id));check(ids.size===31,'기존29개와 별도논문·시행교육2개 근거');
for(const s of d.sources){check(/^https:\/\//.test(s.url)&&/^2026-10-(06|09)$/.test(s.checkedAt),'근거 URL·확인일 '+s.id);check(s.locator&&s.fact&&s.limit,'근거 위치·사실·한계 '+s.id);}
for(const s of d.sections){for(const id of s.refs)check(ids.has(id),'근거 추적 '+id);for(const r of s.rows)check(r.length===s.headers.length,'표 필드 계약 '+s.id);}
const text=JSON.stringify(d);for(const t of ['NHIS 직접 연계는 필수 착수조건으로 두지 않음','병력 자체는 적부판정 대상이 아님','연구 데이터와 개인 업무기록 분리','독립 전문 기능평가','새로운 의무교육','공통 근거관리·권한·로그 코어는 재사용'])check(text.includes(t),'중복·권리·평가 경계 '+t);
const rendered=fs.readFileSync('src/Revision47.jsx','utf8');check(rendered.includes("code==='QE'")&&rendered.includes('<SeniorAssessment/>'),'기존 QE 페이지에 추가 후보 연결');
check(JSON.stringify(JSON.parse(fs.readFileSync('dist/downloads/senior-assessment.json','utf8')))===JSON.stringify(d),'화면·JSON 동일');
const md=fs.readFileSync('dist/downloads/senior-assessment.md','utf8');for(const s of d.sources)check(md.includes(s.url),'MD 원문 링크 '+s.id);for(const m of d.metrics)check(md.includes(m.formula)&&md.includes(m.method),'MD 측정방법 '+m.id);
check(drt.scope.excluded.includes('현재 납품·대가·핵심 성과에서 제외'),'DRT 감사 제외 경계');
check(drt.sections.find(s=>s.id==='rights').blocks.slice(5).every(b=>b.deferred),'기존 감사·배분 검토는 접힌 후속안');
check(drt.sections.find(s=>s.id==='delivery').blocks.find(b=>b.title==='핵심 인수시험안').deferred,'감사 인수시험 현재 과업 제외');
check(!drt.sections.find(s=>s.id==='delivery').blocks.slice(0,2).some(b=>JSON.stringify(b.rows).includes('Grantee')),'현재 대가·단계에 감사 모듈 제외');
check(cost.bundles.find(b=>b.id==='B04').boundary.includes(drt.scope.excluded)&&implementation.candidates.find(c=>c.id==='V05').stop.includes(drt.scope.excluded),'묶음 대가·실행 기준 동일');
check(drt.metrics.every(m=>!m.name.includes('감사')),'DRT 운영 성과 보존');
for(const s of drt.sections.filter(s=>['why','solution','architecture'].includes(s.id)))for(const b of s.blocks.filter(b=>b.rows))for(const r of b.rows)if(r.some(v=>v.includes('Grantee'))||r[0].includes('정산 처리'))check(r[0].startsWith('[후속 검토 · 현재 과업 제외]'),'전환·자동화·구성표의 정산 검증 현재과업 오인 방지');
check(drt.sections.find(s=>s.id==='delivery').intro.includes('현재 개발·실증·대가·핵심 성과에서 제외'),'개발 단계 소개의 감사 제외 정합');
console.log(JSON.stringify({result:'통과',checks,metrics:5,sources:d.sources.length,scope:'DRT 운영 / QE 추가 검사검증 후보'}));

const priorStudy=d.sources.find(s=>s.id==='H09');
check(priorStudy.checkedAt==='2026-10-09'&&d.sources.filter(s=>/^H0[1-8]$/.test(s.id)).every(s=>s.checkedAt==='2026-10-06'),'기존 출처 재검증일 허위 승격 금지');
check(priorStudy.fact.includes('2025.9.16~2026.3.2')&&priorStudy.limit.includes('고령자 전용 연구 아님')&&priorStudy.limit.includes('현재 가명정보 미처리'),'과거 연구 대상·기간·현재성 경계');
check(d.sections.find(s=>s.id==='basis').refs.includes('H09')&&d.questions.some(s=>s.includes('최종 산출물')&&s.includes('사용권')),'기존 연구가 문제정의·후속조사에 연결');
console.log('기존 인지 연구 중복 대조 포함 '+checks+'개 검증 통과');

const result=d.sources.find(s=>s.id==='H10'),label=d.sources.find(s=>s.id==='H11'),evaluation=d.sources.find(s=>s.id==='H12'),rights=d.sources.find(s=>s.id==='H14');
check(result.sha256==='1cfa0bd62226433e8023d299a72977098fc3aa595480cf211d2ec3a0aad2fd50'&&result.limit.includes('동일 계약')&&result.limit.includes('최종보고서 원문'),'정부 성과발표·원보고서·사업 식별 구분');
check(label.fact.includes('검사자료를 입력으로 위험군')&&label.limit.includes('미래 실제 사고')&&d.evaluation.includes('라벨 생성규칙')&&d.evaluation.includes('동일인 분리'),'검사 라벨·실제사고·판정의 평가목적 구분');
check(evaluation.fact.includes('전체 테스트자료')&&evaluation.limit.includes('독립 외부검증')&&d.evaluation.includes('자격검사 변별력으로 전용하지 않음'),'Public 평가를 독립 운영검증으로 승격 금지');
check(rights.locator.includes('B8 공개코드')&&rights.limit.includes('모든 공개 코드의 사용금지로 일반화하지 않음')&&rights.limit.includes('데이터 이용범위'),'대회 자산별 이용조건 분리');
check(d.sections.find(s=>s.id==='how').rows.some(r=>r[0].includes('조건부 연계')&&r[1].includes('정형 어댑터')&&r[2].includes('운영 입력 제외')),'검증 전 모델 투입 제외·NOA 설명 역할');
console.log('기존 모델·평가·사용권 대조 포함 '+checks+'개 검증 통과');

const dataSpec=d.sources.find(s=>s.id==='H15'),labelFaq=d.sources.find(s=>s.id==='H19'),splitFaq=d.sources.find(s=>s.id==='H20'),combined=d.sources.find(s=>s.id==='H21'),how=d.sections.find(s=>s.id==='how');
check(labelFaq.fact.includes('검사 이후')&&labelFaq.fact.includes('실제 사고이력')&&labelFaq.fact.includes('세부 기준 비공개')&&labelFaq.limit.includes('관찰기간')&&labelFaq.limit.includes('동일시하지 않음'),'사고이력 기반 라벨·미공개 범위·단순 사고여부 구분');
check(dataSpec.fact.includes('더미')&&dataSpec.limit.includes('고유 인원수가 아님')&&d.evaluation.includes('고유 인원수'),'검사 행수·인원수·더미 성능 오인 방지');
check(how.rows.length===6&&how.rows[4][0]==='교육 연계 스킬'&&how.rows[5][0]==='담당자·의료전문가','6개 역할과 기존 설문 참조 순서 보존');
check(how.rows[2][2].includes('예측 특성·LLM 입력에서 제외')&&how.rows[2][2].includes('월내 사건 순서는 추가 근거 필요'),'식별키 분리와 년월 시간해상도 한계');
check(how.rows[3][2].includes('A3 총32와16/8')&&how.rows[3][2].includes('임의 보정 없이 관련 산출 보류')&&how.rows[3][2].includes('B4 조건별 정답1/3/5'),'명세 충돌 보류·검사별 코드 계약');
check(splitFaq.limit.includes('동일인 학습/평가 분리')&&combined.limit.includes('B·고령층')&&d.evaluation.includes('A/B·연령·검사시점별'),'배치분할·독립검증·집단성능의 구분');
check(d.cost.amount===null&&d.cost.scope.includes('집단별 평가 공수 분리'),'조건부 검증비용 미산정 유지');
console.log('라벨·데이터계약·집단평가 포함 '+checks+'개 검증 통과');

const preRfp=d.sources.find(s=>s.id==='H25'),distance=d.sources.find(s=>s.id==='H24'),templates=d.sources.find(s=>s.id==='H26');
check(preRfp.fact.includes('인터페이스')&&preRfp.limit.includes('사전규격')&&preRfp.limit.includes('CCK 재사용권 미확정'),'기존 현업 요구·사전규격·권리 경계');
check(distance.fact.includes('이격거리')&&distance.limit.includes('정확한 거리 단위')&&how.rows[3][2].includes('음수를 오류로 제거하지 않음'),'물리량·음수 의미 보존과 단위 미확인');
check(how.rows[3][2].includes('수정된32회에는 재적용 금지')&&d.sources.find(s=>s.id==='H22').limit.includes('분모 불일치'),'구판 더미 삭제의 이중 적용 금지와 미해소 분모');
check(templates.limit.includes('빈 제출양식')&&d.evaluation.includes('실제 모델 실행·수검자 데이터 시험은 이번 조사에서 수행하지 않음'),'양식·실제 보고서·재현 시험의 구분');
check(d.cost.amount===null&&d.cost.scope.includes('중복 공수 제외')&&d.cost.scope.includes('무료 재사용을 가정하지 않음'),'추가 작업·모델 권리 비용 미확정 유지');
console.log('사전규격·물리량·모델인수 포함 '+checks+'개 검증 통과');

const casebook=d.sources.find(s=>s.id==='H28'),notice=d.sources.find(s=>s.id==='H29');
check(casebook.fact.includes('24개월')&&casebook.fact.includes('398건')&&casebook.limit.includes('완료율 산정 금지'),'기관 보고의 관측기간·활용실적과 분모 한계');
check(casebook.limit.includes('정확도·사고감소율')&&d.evaluation.includes('중도절단')&&d.evaluation.includes('현재 누수·결함을 발견했다는 주장이 아닌'),'보고 점수·재현·시점 검증 제안 구분');
check(d.evaluation.includes('시스템 실제 이용가능시점')&&d.evaluation.includes('확률 보정 자료도 평가자료와 격리'),'미래 관측 정보와 보정 평가자료 분리');
check(notice.fact.includes('R25BK00904242-000')&&notice.limit.includes('최신·최종 판본'),'정식 공고 식별과 최종 납품 범위 구분');
check(!text.includes('세부 생성규칙·관찰기간은 미공개.')&&how.rows[3][2].includes('2027 추가 연계안'),'새 근거 반영 및 제안 연계 현재화 금지');
console.log('기관 사례집·정식공고·시점검증 포함 '+checks+'개 검증 통과');

const paper2014=d.sources.find(s=>s.id==='H30'),training2014=d.sources.find(s=>s.id==='H31');
check(paper2014.sha256==='b8ad7206e6c75981d6cd58a151524efc37aacaa2f7e0052724b09d10c47657e8'&&paper2014.fact.includes('이력 제외21')&&paper2014.limit.includes('동일성 미확인'),'독립 논문·평가조건·공식 원본 연결');
check(paper2014.fact.includes('결측수1개')&&paper2014.limit.includes('사고감소율이 아님'),'증분 정보 묶음과 사고효과 구분');
check(how.rows[3][2].includes('조회 실패를 무이력으로 채우지 않음')&&how.rows[3][2].includes('A검사로 자동 분류하지 않으며'),'이력 조회상태와 검사유형 독립 분기');
check(training2014.limit.includes('동일 과정으로 볼 수 없음')&&how.rows[4][2].includes('대상 구분'),'기존 지역사회 교육·사업용 교육 구분');
check(d.evaluation.includes('평가 부재로 단정하지 않음')&&d.evaluation.includes('37피처 주 평가와 동일 조건으로 비교 금지'),'논문 검증 존재와 비교조건 보존');
console.log('논문 전문·이력 가용성·기존교육 포함 '+checks+'개 검증 통과');
