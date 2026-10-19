'use strict';
const fs=require('node:fs'),path=require('node:path'),d=require('../src/benchmark-100.cjs');
function markdown(){
 const lines=['# TS AX 벤치마킹 100건 상세 분석','',`정리: 2026-10-20 · 근거 대조: ${d.checked} · 플랫폼 ${d.counts.platform}건 / 업무·전략 ${d.counts.ax}건`,'',d.method,'',d.capabilityBoundary,'',d.organizationBoundary,'',
 '## 종합 시사점 — AI혁신처 공통 기반 우선 구축','',
 '외부 사례의 도입 규모·모델 정확도·업무효과를 분리한 비교. 조직·직무·권한·필수자료·업무 상태를 먼저 정의하고 부서별 기능을 연결하는 고도화 방향.',''];
 for(const f of d.foundation)lines.push(`### ${f.title}`,'',`- 구축: ${f.body}`,`- 검수: ${f.check}`,`- 비교 근거: ${f.cases.join(', ')}`,'');
 lines.push('## 12대 전략 연결','');
 for(const s of d.coverage)lines.push(`- **${s.id} ${s.title}**: ${s.ids.join(', ')} (${s.ids.length}건)`);
 lines.push('','## 사례별 상세 분석','');
 for(const r of d.cases){
  lines.push(`### ${r.id} · ${r.title}`,'',`${r.owner} / ${r.country} / ${r.stage} / ${r.verdict}`,'',
   '**AS-IS → TO-BE**','',`- AS-IS: ${r.asIs}`,`- TO-BE: ${r.toBe}`,`- 기대효과: ${r.expectedEffect}`,'',
   '**실제 성과와 성공·실패 요인**','',`- 실제 확인: ${r.observed}`,`- 판정: ${r.verdictReason}`,
   ...r.successFactors.map(t=>`- ${r.successLabel}: ${t}`),...r.failureFactors.map(t=>`- ${r.failureLabel}: ${t}`),`- 핵심 병목: ${r.bottleneck}`,`- 분석 범위: ${r.factorBasis}`,'',
   '**아키텍처·데이터 흐름**','',`- ${r.flow.join(' → ')}`,`- 구조 근거: ${r.architectureBasis}`,`- 자료 경계: ${r.dataBoundary}`,`- 판단 경계: ${r.decisionBoundary}`,'',
   '**CCK 시사점 → TS 적용**','',`- 시사점: ${r.implication}`,`- 부서: ${r.tsOrgCodes.map(code=>{const o=d.org(code);return `${o.name} (${o.locator})`;}).join(' / ')}`,
   `- 업무: ${r.tsWork}`,`- 전략: ${r.strategies.join(', ')}`,`- 재사용 후보: ${r.reuse}`,`- 추가 개발: ${r.delta}`,`- 검수: ${r.acceptance}`,`- 기대효과·측정: ${r.localEffect}`,`- 평가 조건: ${r.measurementNote}`,'',
   '**근거·한계**','',`- 근거 수준: ${r.sourceLevel} / ${r.evidenceReview}`,`- 한계: ${r.limit}`,
   ...r.sources.map(s=>`- [${s.title}](${s.url}) — ${s.locator}`),'');
 }
 return lines.join('\n')+'\n';
}
const escape=v=>'"'+String(v??'').replaceAll('"','""')+'"';
function csv(){const headers=['비교ID','구분','사례','기관','국가','단계','성과판정','AS-IS','TO-BE','기대효과','실제성과','성공요인_성립조건','실패요인_한계','병목','데이터흐름','TS부서','TS업무','전략','CCK시사점','재사용후보','추가개발','검수','출처등급','출처','확인일'];return '\ufeff'+[headers,...d.cases.map(r=>[r.id,r.kind,r.title,r.owner,r.country,r.stage,r.verdict,r.asIs,r.toBe,r.expectedEffect,r.observed,r.successFactors.join(' / '),r.failureFactors.join(' / '),r.bottleneck,r.flow.join(' → '),r.tsOrgCodes.map(c=>d.org(c).name).join(' / '),r.tsWork,r.strategies.join(' / '),r.implication,r.reuse,r.delta,r.acceptance,r.sourceLevel,r.sources.map(s=>s.url).join(' | '),r.reviewed])].map(row=>row.map(escape).join(',')).join('\r\n')+'\r\n';}
function files(){return {'ts-benchmark-100.md':markdown(),'ts-benchmark-100.csv':csv(),'ts-benchmark-100.json':JSON.stringify(require('../src/benchmark-100.json'),null,2)+'\n'};}
module.exports=dir=>{fs.mkdirSync(dir,{recursive:true});for(const [name,text] of Object.entries(files()))fs.writeFileSync(path.join(dir,name),text);};
Object.assign(module.exports,{files,markdown,csv});
