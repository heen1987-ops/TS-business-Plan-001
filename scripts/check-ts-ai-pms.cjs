const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),d=require('../src/ts-ai-pms.cjs'),exporter=require('./export-ts-ai-pms.cjs');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist');let count=0;const check=(ok,msg)=>{assert(ok,msg);count++;};
check(d.date==='2026-10-08'&&d.version==='v0.1','이번 PMS 구축·연구 설계 기준일');
check(d.sections.length===13,'목적부터 근거까지 13개 연속 절');check(d.requirements.length===8&&d.research.length===4&&d.metrics.length===5,'8개 요구·4개 연구·5개 지표');
check(new Set(d.sections.map(s=>s.id)).size===d.sections.length,'절 ID 고유');
for(const s of d.sections)for(const b of s.blocks){check(['note','table','figure','requirements','research','metrics','sources'].includes(b.type),'렌더 유형 '+s.id);for(const ref of b.refs||[])check(!!d.sources[ref],'근거 연결 '+ref);if(b.type==='table')for(const r of b.rows)check(r.length===b.headers.length,'표 열 일치 '+s.id);if(b.type==='figure'){const f=path.join(out,b.path);check(fs.existsSync(f),'실제 이미지 '+b.path);const buf=fs.readFileSync(f);check(buf.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'PNG 형식 '+b.path);const w=buf.readUInt32BE(16),h=buf.readUInt32BE(20);check(w/h>1.7&&w/h<1.85,'16:9 도식 '+b.path);}}
for(const r of d.requirements){check(!!r.acceptance&&!!r.test&&!!r.wbs,'인수·시험·편성 '+r.id);for(const ref of r.refs)check(!!d.sources[ref],'요구 근거 '+r.id);}
for(const m of d.metrics){check(m.baseline===null&&m.target===null,'미측정 수치를 0으로 쓰지 않음 '+m.id);check(!!m.scope&&!!m.formula&&!!m.method&&!!m.quality&&!!m.owner,'운영·연구 측정명세 '+m.id);}
check(d.costInputs.length===8,'구축·연구·감리·운영 8개 산정 묶음');
for(const c of d.costInputs){check(c.fp===null&&c.personMonths===null&&c.unitCost===null&&c.amount===null,'미산정 비용 '+c.bundle);check(!!c.includedBoundary&&!!c.incrementalBoundary&&!!c.reuseEvidence&&!!c.overlapWbs,'대가 포함·증분·재사용·중복 경계 '+c.bundle);}
for(const [id,s]of Object.entries(d.sources)){check(s.id===id&&s.checkedAt===d.date&&!!s.location&&!!s.fact&&!!s.limit,'근거 상태 '+id);if(s.url)check(/^https:\/\//.test(s.url),'외부 원문 HTTPS '+id);}
for(const [,file]of d.downloads)check(fs.existsSync(path.join(out,file)),'배포 다운로드 '+file);
check(fs.readFileSync(path.join(out,'downloads/ts-ai-pms-2027-plan.md'),'utf8')===exporter.markdown(),'본문·기획서 동일');
check(JSON.stringify(JSON.parse(fs.readFileSync(path.join(out,'downloads/ts-ai-pms-design.json'),'utf8')))===JSON.stringify(d),'원장 내보내기 동일');
for(const p of ['ts-ai-pms-requirements.csv','ts-ai-pms-cost-inputs.csv'])check(fs.readFileSync(path.join(out,'downloads',p)).subarray(0,3).equals(Buffer.from([239,187,191])),'Excel 한글 BOM '+p);
check(fs.readFileSync(path.join(root,'src/IntegratedReader.jsx'),'utf8').includes('<TsAiPmsPlan/>'),'통합 본문 PMS 연결');check(fs.readFileSync(path.join(root,'src/SkillPms.jsx'),'utf8').includes('<TsAiPmsPlan/>'),'기존 PMS 경로 연결');
console.log('TS 자체 AI PMS 설계 '+count+'항목 통과');
