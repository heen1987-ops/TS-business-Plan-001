const assert=require('node:assert/strict'),fs=require('node:fs'),p=require('../src/planning-2027.cjs'),d=require('../src/analysis-review.cjs');
let checks=0;function check(value,label){assert(value,label);checks++;}
check(p.year===2027&&p.date==='2026-10-02','대상연도·정정일');
check(d.planning2027===p&&d.updatedAt===p.date&&d.title===p.title,'표시·연구 판본의 분리');
check(d.date==='2026-10-01'&&Object.values(d.sources).every(s=>s.checkedAt===d.date),'기존 공식 자료의 확인일을 신규 조사일로 승격하지 않음');
check(p.hardware.npuInScope===false&&p.hardware.newInfrastructurePurchase===false&&p.hardware.visionInScope===false,'NPU·인프라·비전 범위 혼입 방지');
check(p.scope.some(r=>r[1].includes('로컬 LLM'))&&p.scope.some(r=>r[1].includes('5개년')),'2027년 로컬 LLM과 중장기 계획의 경계');
check(p.evidenceGates.length===5&&new Set(p.evidenceGates.map(r=>r[0])).size===5,'신규 문제 선별의 다섯 관문');
check(p.decisions.length===4,'기획 편입·통합·보류·AI 제외');
check(p.latest.availability.includes('완료 보고서 본문·첨부자료는 미확보'),'착수 안내를 연구결과로 사용하지 않음');
check(p.portfolio.some(r=>r[1].includes('재사용')&&r[2].includes('반드시')),'3개 구현 모듈이 신규 문제영역을 제한하지 않음');
for(const key of ['total','personMonths','baseline','target'])check(p.estimate[key]===null,'미산정·미실측을 0으로 표시하지 않음 '+key);
assert.deepEqual(Object.keys(p.candidateReviews).sort(),d.candidates.map(c=>c.id).sort(),'기존 후보 누락·추가 확정 방지');checks++;
const md=fs.readFileSync('dist/downloads/ts-planning-2027.md','utf8');
for(const c of d.candidates){const r=p.candidateReviews[c.id];check(r.decision.startsWith('보류'),'근거 미확보 후보의 상태 '+c.id);check(c.baseline===null&&c.target===null&&c.problemConfirmed===false,'후보 사실상태 보존 '+c.id);for(const key of ['decision','missing','owner','next'])check(typeof r[key]==='string'&&r[key].length>15&&md.includes(r[key]),'후보별 판단·필요 근거·협의·검증 출력 '+c.id+' '+key);}
assert.deepEqual(JSON.parse(fs.readFileSync('dist/downloads/ts-planning-2027.json','utf8')),p,'화면 정본과 내려받기 일치');checks++;
for(const rows of [p.scope,p.evidenceGates,p.decisions,p.trace,p.portfolio])for(const row of rows)check(row.every(text=>md.includes(text)),'MD 필수 내용 누락 없음 '+row[0]);
check(md.includes(p.documentNote)&&md.includes(p.reference.url),'HWPX 보존본·공식 전략 출처');
const combined=fs.readFileSync('dist/downloads/site-analysis-review.md','utf8');check(combined.includes(p.title)&&combined.includes(p.scope[3][1])&&combined.includes(p.latest.direction),'기존 검토서 내려받기에서도 범위 정정 유지');
const jsx=fs.readFileSync('src/AnalysisReview.jsx','utf8');check(jsx.includes('data-planning-year={plan.year}')&&jsx.includes('plan.candidateReviews[c.id].missing')&&jsx.includes('rows={plan.trace}'),'범위·후보·산정 연결의 실제 표시');
console.log(JSON.stringify({result:'통과',checks,year:p.year,evidenceGates:p.evidenceGates.length,retainedCandidates:d.candidates.length,newConfirmedProjects:0}));
