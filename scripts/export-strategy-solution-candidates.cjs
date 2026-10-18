'use strict';
const fs=require('node:fs'),path=require('node:path');
const candidates=require('../src/strategy-solution-candidates.cjs');
const strategies=require('../src/strategy-solutions-2027.cjs');
const followup=require('../src/strategy-followup.cjs');
const ax=require('../src/ax-casebook.cjs');
const platform=require('../src/platform-casebook.cjs');
const capability=require('../src/cck-ax-capability-plan.cjs');
const sourceOverride={'PF-A03':'https://www.kindkorea.or.kr/pages/72?id=11391&menuMode=READ&q=page%3D1'};
function caseSource(id){
 if(id.startsWith('AX')){const c=ax.getCase(id),s=ax.sources.find(x=>x.id===c?.sources[0]);return {title:c?.title,url:s?.url};}
 const c=platform.cases.find(x=>x.id===id);return {title:c?.title,url:sourceOverride[id]||c?.url};
}
function markdown(){
 const head=['# TS 조직 네이티브 AI · 12대 전략과제 솔루션 후보','',
  '- 조사·설계 기준일: '+candidates.checkedAt,
  '- 전략 명칭: [TS 공식 2026–2030 전략체계]('+strategies.source.url+')',
  '- 적용 순서: ST-04 조직·업무·권한 공통 기반 → 대표 업무 검증 → 나머지 부서별 적용·국민서비스',
  '- 사례의 방법과 TS의 실제 구현·효과는 구분. CCK 기능은 설치본·권리·연계 대조 전 재사용 후보',
  '- 공통 조직·권한 기반은 한 번 구축·산정. 나머지 11개 솔루션은 업무별 자료·규칙·연계·검수 차분만 산정','',
  '| 전략 | 업무 솔루션 후보 | 추진 구분 | 대표 검증 |','| --- | --- | --- | --- |'];
 for(const c of candidates.rows){const s=strategies.rows.find(r=>r.id===c.id);head.push(`| ${c.id} ${s.strategy} | ${c.name} | ${s.phase} | ${c.benchmark} |`);}
 head.push('');
 for(const c of candidates.rows){
  const s=strategies.rows.find(r=>r.id===c.id),p=followup.byId[c.id],e=caseSource(c.benchmark),risk=c.caution?caseSource(c.caution):null;
  head.push('## '+c.id+' '+s.strategy,'',
   '- 솔루션: **'+c.name+'** · '+c.focus,
   '- 담당 조직·직무: '+s.dutyBindings.map(x=>x.name+' / '+x.job).join(' · '),
   '- 관계 근거: '+(s.lawIds.join(', ')||'한국교통안전공단법·직제시행세칙 별표4')+' / 업무 상세는 기존 매핑표 참조',
   '- 업무 흐름: '+c.flow.join(' → '),
   '- CCK 재사용 후보: '+p.reuseItems.map(x=>x.use).join(' / '),
   '- CCK 기술 근거 수준: '+capability.strategyAssets[c.id].map(id=>{const a=capability.byId[id];return a.name+'('+a.level+')';}).join(' / '),
   '- 추가 개발: '+p.deliverables.join(' / '),
   '- 결과물: '+p.output,
   '- 우선 검증: '+c.gate,
   '- 검수 연결: '+p.test+' / 공통 '+p.tests.join(', ')+' / '+p.acceptancePlan.sample+' → '+p.acceptancePlan.criterion,
   '- 효과 측정안: '+p.formula+' · TS 실측 전',
   '- 사례 근거: ['+c.benchmark+' '+e.title+']('+e.url+') · '+c.transfer);
  if(risk)head.push('- 위험 사례: ['+c.caution+' '+risk.title+']('+risk.url+') · 동일 실패 조건의 TS 시험셋 구성');
  head.push('- TS 사례집: [상세 아키텍처·데이터 흐름](../index.html?view='+(c.benchmark.startsWith('PF')?'platform-cases':'casebook')+'&case='+c.benchmark+')','');
 }
 head.push('## 적용·계약 경계','',
  '- ST-04 공통: 공식 인사·조직·업무분장 정본, 효력일, 자료별 정책, 검색 전 권한 판정, 변경·복구 시험의 인수 범위 확인',
  '- 대표 검증: ST-01·07·10·12의 서로 다른 데이터·권한·인계 조건으로 공통 기반 재사용성 시험',
  '- 국민서비스: ST-08의 공개 지식·음성·상담 경계를 내부 직원 업무와 분리하여 후속 시험',
  '- 기존 NOA·SSO·RAG·ETL·권한·로그의 계약상 의무와 실제 설치본 확인 후 신규 차분 확정',
  '- 각 사례의 발표·RFP·감사 결과는 TS의 납품·성과 또는 CCK 기능 구현 증빙이 아님','');
 return head.join('\n');
}
function write(out){fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'ts-strategy-solution-candidates.md'),markdown());}
if(require.main===module)write(path.join(__dirname,'../public/downloads'));
module.exports={markdown,caseSource,write};
