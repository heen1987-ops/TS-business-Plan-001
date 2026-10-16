'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const r=require('../src/ts-organization-rules.cjs'),d=require('../src/organization-site.cjs'),mapping=require('../src/ts-department-mapping.cjs');
const node=c=>r.bindings.find(n=>n.code===c);
assert.equal(r.source.sha256,'dd20721b5bd50ab3286c83ca930a3351fbe48620addd081c52647a9173593682');
assert.equal(r.source.effectiveDate,'2026-06-30');
assert.equal(r.bindings.length,227);assert.equal(r.summary.dutyBindings,132);assert.equal(r.entries.length,57);
assert.equal(r.territories.length,14);assert.equal(r.summary.affiliatedOffices,61);
for(const b of r.bindings.filter(n=>n.entryId)){const e=r.entries.find(x=>x.id===b.entryId);assert.ok(e);assert.deepEqual(b.duties,e.duties);assert.equal(b.locator,e.locator);}
assert.equal(node('1019700').effectiveDate,null);assert.match(node('1019700').restriction,/최초.*발령.*시행.*미확인.*시행 전 AI혁신처/);
assert.match(node('1010100').duties.join(' '),/AI.*전환 전략/);
assert.match(node('1019600').duties.join(' '),/데이터 표준화/);
assert.match(node('1019700').duties.join(' '),/공통플랫폼/);
assert.match(node('1019500').duties.join(' '),/개인정보보호 업무총괄/);
assert.match(node('1016050').duties.join(' '),/업무분장/);
assert.equal(node('3402020').entryId,'RULE-T47-2');
assert.equal(node('3406050').entryId,'RULE-T48-2');
const north=r.bindings.find(n=>n.name==='안전관리처(경기북부)');assert.equal(north.entryId,'RULE-T49-2');
for(const t of r.territories)for(const o of t.offices){assert.ok(o.code);assert.equal(node(o.code).parentCode,t.code);assert.equal(node(o.code).regionCode,t.code);}
for(const n of r.bindings.filter(n=>n.path.startsWith('자동차안전연구원>'))){assert.equal(n.entryId,null);assert.match(n.restriction,/별도 확인/);}
assert.ok(r.bindings.filter(n=>n.path.startsWith('본사>')).every(n=>!n.structure.includes('상하위 차이')));
for(const row of mapping.rows){assert.deepEqual(row.rule.duties,node(row.code).duties);}
assert.deepEqual(d.packages.flatMap(p=>p.requirements).sort(),d.acceptance.map(t=>t.requirement).sort());
assert.ok(d.acceptance.every(t=>t.status.includes('미실행')));
const source=fs.readFileSync('src/OrganizationSite.jsx','utf8'),app=fs.readFileSync('src/App.jsx','utf8');
assert.ok(app.includes('isOrganizationExperience'));assert.ok(app.includes('<MandateWorkspace/>'));assert.ok(app.includes('<OrganizationExplorer route={route}/>'));
assert.ok(source.includes('aria-label="주 메뉴"'));assert.equal(d.nav.length,6);
assert.deepEqual(d.nav.map(n=>n[1]),['제안·관계부처','전략과제','법령·업무','조직·직무','구축·검수','자료실']);assert.ok(source.includes('includePending'));
assert.ok(source.includes('details key={p.id}'));assert.ok(source.includes('details key={t.id}'));
assert.ok(d.archives.flatMap(a=>a.links).some(([to])=>to==='index.html?view=legacy'));
assert.ok(d.markdown().includes('최초 발령일'));assert.ok(d.markdown().includes('W27-A~D'));
for(const [name,body] of Object.entries(require('./export-organization-site.cjs').files())){assert.equal(fs.readFileSync('dist/downloads/'+name,'utf8'),body);assert.doesNotMatch(body,/[A-Z]:[\\/]|file:\/\/|\bundefined\b/);}
console.log('조직 워크스페이스 검증 통과: 6개 주 메뉴, 57개 규정 업무정의·132개 조직 연결·14개 지역·61개 소속, 조건부 시행·연구원 별도 규정·요구/검수 추적·다운로드 일치.');

const law=require('../src/law-workspace.cjs');
assert.equal(law.records.length,27);assert.equal(law.records.flatMap(r=>r.work).length,36);
assert.deepEqual(law.labels.flow,['부처·기관','관계법령','법정·위탁업무','담당 조직·직무','12대 전략과제','AI 지원']);
for(const row of law.records){assert.ok(row.principal);assert.ok(row.lawSources.length);assert.ok(row.work.length);for(const work of row.work)for(const org of work.organizations)assert.ok(r.bindings.some(n=>n.code===org.code));}
const mandateUi=fs.readFileSync('src/MandateWorkspace.jsx','utf8');assert.ok(mandateUi.indexOf('03 수행업무')<mandateUi.indexOf('06 업무에 필요한 AI 지원'));assert.ok(mandateUi.includes('details className="on-solution-followup"'));
console.log('법령 우선 탐색 검증 통과: 27개 업무묶음·36개 세부업무, 권한 주체→법령→업무→조직→AI 지원 순서.');

const strategy=require('../src/strategy-solutions-2027.cjs');
const official=require('../src/institution-guide.cjs').chapters.find(c=>c.id==='strategy').tables[0].rows;
assert.deepEqual(strategy.rows.map(r=>r.strategy),official.flatMap(r=>r[1].split(' / ')));
assert.equal(strategy.rows.length,12);assert.equal(new Set(strategy.rows.map(r=>r.id)).size,12);
assert.equal(strategy.directions.length,4);assert.ok(app.includes('<StrategyWorkspace/>'));
for(const row of strategy.rows){
 assert.equal(strategy.rows.filter(r=>r.direction===row.direction).length,3);
 assert.deepEqual(row.dutyBindings.map(b=>b.code),row.codes);
 for(const binding of row.dutyBindings){assert.ok(binding.job);assert.ok(binding.locator);for(const duty of binding.duties)assert.ok(node(binding.code).duties.includes(duty));if(!binding.duties.length)assert.equal(binding.code,'7000000');}
 assert.ok(row.codes.length);assert.ok(row.basisNote);assert.ok(row.acceptance);assert.ok(row.features.length);
 for(const code of row.codes)assert.ok(node(code),row.id+' 조직코드 '+code);
 for(const id of row.lawIds)assert.ok(law.records.some(l=>l.id===id),row.id+' 법령업무 '+id);
 for(const id of row.packages)assert.ok(d.packages.some(p=>p.id===id),row.id+' 구축 '+id);
 const allowed=row.packages.flatMap(id=>d.packages.find(p=>p.id===id).requirements.map(r=>r.replace('-R','-T')));
 for(const id of row.tests){assert.ok(d.acceptance.some(t=>t.id===id),row.id+' 검수 '+id);assert.ok(allowed.includes(id),row.id+' 구축–검수 추적 '+id);}
 assert.equal(row.foundation,'ON27-BASE / C27-COM');assert.ok(strategy.markdown().includes(row.id+' '+row.strategy));
}
assert.equal(strategy.rows.filter(r=>r.phase==='1차 공통 기반').length,1);
assert.equal(strategy.rows.find(r=>r.phase==='1차 공통 기반').id,'ST-04');
assert.match(strategy.rows.find(r=>r.id==='ST-06').basisNote,/L13.*한정.*별표4/);
assert.match(strategy.markdown(),/단일 구축·산정/);
assert.ok(mandateUi.indexOf('05 연결 전략과제')<mandateUi.indexOf('06 업무에 필요한 AI 지원'));
console.log('전략·솔루션 검증 통과: 공식 4대 방향·12대 과제 일치, 법령/조직/구축/검수 참조 유효, ST-04 공통 기반 단일 산정.');

const detail=require('../src/detailed-work.cjs'),published=require('../src/official-duty-research.cjs');
assert.deepEqual(detail.counts,{organizations:227,publicOrganizations:188,publicUnits:2000,processes:16,steps:64,processDepartments:11});
assert.deepEqual(Object.values(detail.byOrg).flatMap(o=>o.publicItems.map(u=>u.id)).sort(),published.records.flatMap(o=>o.units.map(u=>u.id)).sort());
for(const org of Object.values(detail.byOrg)){
 assert.deepEqual(org.ruleItems.map(i=>i.text),node(org.code).duties,org.name+' 직제 원문 보존');
 for(const unit of org.publicItems)for(const span of unit.sourceSpans){
  const source=published.observations.find(o=>o.id===span.observationId);
  assert.equal(source.orgCode,org.code);assert.equal(source.text.slice(span.start,span.end),unit.text,unit.id+' 원문 구간');
 }
}
assert.equal(new Set(detail.processes.map(p=>p.id)).size,detail.processes.length);
assert.equal(new Set(detail.processes.flatMap(p=>p.steps.map(s=>s.id))).size,detail.counts.steps);
for(const p of detail.processes){
 assert.equal(p.status,'수행단계 설계안');assert.ok(p.basis.length);
 for(const b of p.basis){assert.ok(node(p.code).duties.includes(b.text));assert.equal(b.entryId,node(p.code).entryId);assert.equal(b.locator,node(p.code).locator);}
 for(const id of p.unitIds)assert.ok(detail.byOrg[p.code].publicItems.some(u=>u.id===id));
 for(const id of p.strategyIds)assert.ok(strategy.rows.some(r=>r.id===id));
 const allowed=new Set(p.packages.flatMap(id=>d.packages.find(w=>w.id===id).requirements));
 assert.ok(p.tests.length);assert.deepEqual(p.tests.map(id=>d.acceptance.find(t=>t.id===id).requirement).sort(),[...allowed].sort());
 assert.equal(p.phase,p.strategyIds.includes('ST-04')?'1차 공통 기반':'부서별 후속 적용');
 p.steps.forEach((s,i)=>{assert.equal(s.order,i+1);assert.ok(['수행','검토','승인','협업'].includes(s.role));for(const key of ['task','input','output','done'])assert.ok(s[key]?.trim());});
}
assert.equal(detail.processes.filter(p=>p.phase==='1차 공통 기반').length,8);
assert.match(detail.markdown(),/내부 직무기술서·전결·표준서식 확인/);
assert.ok(app.includes("view==='duties'"));
const exported=require('./export-organization-site.cjs').files();
assert.match(exported['ts-detailed-work-processes.csv'],/공통 검수 참조/);
assert.match(exported['ts-detailed-work-processes.csv'],/GAI-T01/);
console.log('세부 업무표 검증 통과: 공개 2,000개 원문 구간·직제 대사, 11개 부서 16개 업무·64개 단계, 1차/후속 구분·구축/검수 연결 유효.');
