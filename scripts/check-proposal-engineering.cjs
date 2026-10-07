const fs=require('node:fs'),assert=require('node:assert/strict'),d=require('../src/proposal-engineering.cjs'),intent=require('../src/proposal-intent.cjs'),m=require('../src/proposal-diagram-assets.json'),crypto=require('node:crypto');
let count=0;const check=(ok,label)=>{count++;assert(ok,label)};
check(d.projects.length===42&&new Set(d.projects.map(p=>p.id)).size===42,'42과제 설계 후보');
check(d.commonRequirements.length===5&&d.commonCosts.length===3,'공통 요구5·코어3 단일 기준');
check(d.productChecks.length===7&&d.precedents.length===3,'제품 확인7·원문 판독 RFP3');
for(const p of d.projects){const source=intent.byId[p.id];check(p.reviewStatus===source.reviewStatus&&p.selection.includes('미선정'),p.id+' 기획 판단 보존');check(p.requirements.length===8&&p.interfaces.length===2&&p.workPackages.length===7,p.id+' 요구·연계·증분');check(p.measurement.length>=3&&p.measurement.length<=5,p.id+' 3~5목표');
 const req=new Set(p.requirements.map(r=>r.id)),tests=new Set(p.requirements.map(r=>r.testId));
 for(const r of p.requirements){check(r.input?.trim()&&!/^\s*[ /]*$/.test(r.input)&&r.work&&r.output&&r.owner&&r.acceptance,p.id+' 요구 명세 '+r.id);check(p.workPackages.some(w=>w.id===r.costId&&w.requirementIds.includes(r.id)),r.id+' 요구→비목');check(r.sourceIds.every(id=>p.evidence.some(s=>s.id===id))&&r.goalIds.every(id=>p.measurement.some(g=>g.id===id)),r.id+' 업무맥락·평가 연결');}
 for(const x of p.interfaces){check(x.requirementIds.every(id=>req.has(id))&&x.testIds.every(id=>tests.has(id)),x.id+' 연계→요구·시험');check(x.request.length&&x.response.length&&x.failure&&x.acceptance,x.id+' 계약·예외');if(x.optionalWrite)check(x.optionalWrite.included===false&&x.optionalWrite.fields.includes('approvedInputHash')&&x.optionalWrite.fields.includes('expectedSourceVersion'),x.id+' 초기 조회/후속 쓰기 경계');}
 for(const g of p.measurement)check(g.records&&g.recordsStatus.includes('확인 전')&&g.baseline===null&&g.target===null&&g.comparison.includes('결측'),g.id+' 수집계획·목표 미확정');
 check(p.workPackages.every(w=>w.quantity===null&&w.unitPrice===null&&w.amount===null),p.id+' 미산정≠0');
 for(const [type,to] of Object.entries(p.downloads)){check(fs.existsSync('public/'+to)&&fs.readFileSync('public/'+to).equals(fs.readFileSync('dist/'+to)),p.id+'/'+type+' Git·배포 다운로드 일치');}
 check(fs.readFileSync('public/'+p.downloads.md,'utf8').includes(p.key),p.id+' 문서 업무 단위 보존');
 check(!/최적화을|경우 상황에서/.test(JSON.stringify(p.requirements)),p.id+' 본문 조사·중복 표현 회귀');
}
const ex=d.byId['EX11-01'];check(ex.completion.includes('검토안')&&!ex.completion.includes('등록'), 'ERP 초기 완료는 검토안');check(ex.measurement[1].formula.includes('대조한 검토안')&&!ex.measurement[1].formula.includes('등록'), 'ERP 초기 측정은 검토안 대조');check(ex.special.some(s=>s.stage.includes('후속 쓰기')&&s.stage.includes('제외')),'ERP 쓰기 시험은 후속 범위');
check(d.projects.filter(p=>p.reviewStatus.includes('보류')).length===4,'4개 독립 편성 보류 보존');
const current=m.assets.find(a=>a.id==='MR-02'&&a.type==='service');check(current.revision===4&&current.metaImageModel&&crypto.createHash('sha256').update(fs.readFileSync('public/'+current.metaPreviousPath)).digest('hex')===current.metaPreviousSha256,'DRT 실제 이미지 모델 수정·v3 보존');
for(const type of ['service','data']){const a=m.assets.find(a=>a.id==='EX11-01'&&a.type===type);check(a.revision===4&&a.metaImageModel&&a.metaReason.includes('초기 ERP 읽기')&&crypto.createHash('sha256').update(fs.readFileSync('public/'+a.metaPreviousPath)).digest('hex')===a.metaPreviousSha256,'ERP '+type+' 초기 읽기 이미지 모델 교정·이전본 보존');}
check(d.precedents[0].url.includes('krihs.re.kr')&&d.precedents[0].originalSha256==='de43d645cf33a1daea42ba71c82549c1df5a4ed80e8243d15392a843e5c02ab0','선행 RFP 공식 공고와 보관 원본 동일성 연결');
check(!fs.readFileSync('src/drt-scope.cjs','utf8').includes('운영자 확정 또는 승인된 정상 처리 → 기사 수락'),'DRT 수락→확정 상세 원장');
console.log('개발·연계·평가·대가 '+count+'조건 통과');
