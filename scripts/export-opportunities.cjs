const fs=require('node:fs'),path=require('node:path');
const plan=require('../src/opportunity-plan.cjs');
const stages={foundation:'공통 기반',pilot:'우선 실증 후보',expand:'조건부 확산',research:'연구 검토',hold:'선행조건 확인'};
module.exports=function(out,rows){
 const dir=path.join(out,'concepts');fs.mkdirSync(dir,{recursive:true});
 for(const row of rows)fs.writeFileSync(path.join(dir,row.filename),row.markdown);
 const index=['# 사업기회 컨셉 목록',`${plan.meta.date} · ${plan.meta.version} · ${plan.meta.status}`,'','컨셉별 Markdown 원문. 아래 분류는 기획 검토 상태이며 기관의 확정 사업이 아님.','','| 컨셉 | 영역 | 구분 | 한 줄 기회 |','|---|---|---|---|',...rows.map(r=>`| [${r.title}](./${encodeURIComponent(r.filename)}) | ${plan.areas.find(a=>a.id===r.primary_area).label} | ${stages[r.stage]} | ${r.summary} |`),'','## 2030 추진 순서','','| 연도·초점 | 인프라 | 지식 아카이브 | 업무서비스 | 진입 조건 |','|---|---|---|---|---|',...plan.roadmap.map(r=>`| ${r.year} ${r.label} | ${r.infrastructure} | ${r.knowledge} | ${r.services} | ${r.gate} |`),'','## 적용 범위','',...plan.notes.map(t=>'- '+t),''];
 fs.writeFileSync(path.join(dir,'00_사업기회_목록.md'),index.join('\n'));
 fs.writeFileSync(path.join(out,'opportunities-v1.1.json'),JSON.stringify({meta:plan.meta,areas:plan.areas,roadmap:plan.roadmap,concepts:rows.map(({markdown,html,...r})=>r)},null,2));
};
