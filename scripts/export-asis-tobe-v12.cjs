const fs=require('node:fs'),path=require('node:path');
const d=require('../src/asis-tobe-v12.cjs'),plan=require('../src/opportunity-plan.cjs');
module.exports=function(out){
 const lines=['# TS 사례 기반 AS-IS → TO-BE 사업기회',`기준일 ${d.date} · ${d.version} · 제안/현장 검증 전`,'','TS의 확인된 현황과 확인할 가설을 분리. 타 기관 사례는 제안의 참고이며 TS 운영 사실이 아님. 차세대는 선행 검증 후 추진하는 조건부 확장.','','## 사업 유형 판단','','| 구분 | 판단 질문 | 범위 | 진입 조건 |','|---|---|---|---|',...d.decisionRules.map(r=>`| ${r.label} | ${r.test} | ${r.scope} | ${r.gate} |`),'','연계 강화는 세 유형을 가로지르는 수행 방식. 기존 플랫폼·데이터·외부 서비스와의 연결 범위를 별도로 확인.','','## 영역별 고도화·신규·연계·차세대','','| 영역 | 고도화 | 신규 개발·구축 | 연계 강화 | 차세대 사업 |','|---|---|---|---|---|'];
 for(const a of plan.areas)lines.push(`| ${a.label} | ${a.enhance.join(' / ')} | ${a.new.join(' / ')} | ${a.integrate.join(' / ')} | ${a.next.join(' / ')} |`);
 lines.push('','## TS 기존 발주 요구와 추가 범위의 경계','','제공된 2026-10-31 기존 요구 대조 자료를 다시 검토한 2차 정리. 이번에는 공고 원문을 재열람하지 못했고 실제 계약·납품·검수·운영은 미확인.','','| 영역 | 기존 요구로 기록된 범위 | 추가 검토 후보 | 현장 확인 |','|---|---|---|---|',...d.existingRequirements.map(r=>`| ${plan.areas.find(a=>a.id===r.area).label} | ${r.existing} | ${r.delta} | ${r.verify} |`),'',`[${d.sources.tsRfp.title}](${d.sources.tsRfp.url}) · ${d.sources.tsRfp.note}`);
 lines.push('','## 2026~2030 추진 경로','','| 연도·초점 | 인프라 | 지식 아카이브 | 업무서비스 | 다음 단계 진입 조건 |','|---|---|---|---|---|');
 for(const r of plan.roadmap)lines.push(`| ${r.year} ${r.label} | ${r.infrastructure} | ${r.knowledge} | ${r.services} | ${r.gate} |`);
 for(const area of plan.areas){
  lines.push('',`## ${area.label}`);
  for(const c of d.cases.filter(x=>x.area===area.id)){
   lines.push('',`### ${c.id} ${c.title}`,`**분류:** ${c.priority} · 연결 컨셉 ${c.concept}`,'',`**AS-IS · TS 현황과 참고사례:** ${c.confirmed}`,'',`**미확인·진단 과제:** ${c.unknown} ${c.problem}`,'',`**TS 적용 시나리오:** ${c.scenario}`,'',`**TO-BE · 처리:** ${c.tobe}`,'',`**산출물·완료:** ${c.result}`,'',`**예외·인계:** ${c.exception}`,'',`**고도화:** ${c.enhance}`,'',`**신규 구축:** ${c.new}`,'',`**연계 강화:** ${c.integrate}`,'',`**차세대 사업:** ${c.next}`,'',`**검증:** ${c.measure}`,'','**근거:**',...c.sources.map(id=>{const s=d.sources[id];return `- [${s.title}](${s.url}) · 검토 ${s.checked}${s.note?' · '+s.note:''}`;}));
  }
 }
 lines.push('','## 적용 범위','','- 사업별 수요·자료 권리·시스템 현행·예산·책임·기준선은 현업과 확인 후 확정.','- 2027년 공개 안내 및 내부 대표 1~2업무는 선택 실증 후보이며 조건이 갖춰지지 않으면 범위 축소 또는 이월.','- 38개 컨셉은 기존 12전략과 13처 및 92개 상세 제목 등을 통합한 검토 단위. 187개 후보 전체 및 92개 상세 본문 전수 검증은 수행하지 않음.','');
 fs.writeFileSync(path.join(out,'ts-asis-tobe-cases-v1.2.md'),lines.join('\n'));
};
