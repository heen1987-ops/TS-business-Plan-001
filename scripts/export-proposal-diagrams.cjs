const fs=require('node:fs');
const d=require('../src/proposal-e2e-diagrams.cjs');
const end={
overall:'REQUIRED PRODUCT PLACEMENT: Three spatial layers INSIDE existing platform: upper NOA (Workspace·Skills·계획), middle Grantee (근거 대사 후보) + 규칙·조회 도구, Argus·Keeper (Task·실행 후보), lower aRDa (원문·판본 후보), Nexus (로컬 LLM 연결 후보). NOA calls Grantee with evidence from aRDa; Grantee returns findings to NOA; deterministic tools feed NOA then human Gate then authorized existing-system hand-off; official read-back to NOA and aRDa. Existing authentication/RBAC crosses all layers. No more than 12 major boxes. End-to-end input to official-result verification.',
service:'Add product names at relevant stages: existing platform input, aRDa evidence, NOA plan, Grantee·규칙도구 comparison, human confirmation, official-result read-back, NOA replan. Use distinct states and return arrows, not a product diagram.',
data:'Label version store aRDa 후보, draft NOA, reconciliation Grantee 후보. Keep source identifiers outside model context. Show official result independent from AI draft.',
environment:'Label runtime NOA / Argus·Keeper 후보, evidence storage aRDa 후보, tool Grantee 후보, model Nexus·로컬 LLM 후보. Logical modules may be colocated on existing servers; they are not newly purchased servers.'};
// 육안 검수에서 수정한 실제 생성 입력을 우선하여 같은 오류의 재생성을 방지.
const revisions=['image-prompts-revision.json','image-prompts-overall-consistency.json','image-prompts-final-repairs.json','image-prompts-connection-corrections.json','image-prompts-qe-authority-environment.json','image-prompts-precision-edits.json','image-prompts-precision-edits-additional.json','image-prompts-last-local-edits.json'].flatMap(name=>{
 const path='docs/diagram-design-20261006/'+name;
 return fs.existsSync(path)?JSON.parse(fs.readFileSync(path,'utf8')).images:[];
});
const revised=new Map(revisions.map(t=>[t.id+'/'+t.type,t]));
const tasks=d.projects.flatMap(p=>d.types.map(type=>{const r=revised.get(p.id+'/'+type);return {id:p.id,type,...(r?.referenceAsset?{referenceAsset:r.referenceAsset}:{}),prompt:r?.prompt||d.prompt(p,type)+' '+end[type]}}));
fs.mkdirSync('docs/diagram-design-20261006',{recursive:true});
fs.writeFileSync('docs/diagram-design-20261006/image-prompts.json',JSON.stringify(tasks,null,2)+'\n');
fs.mkdirSync('public/downloads/proposal-diagrams',{recursive:true});
fs.writeFileSync('public/downloads/proposal-diagrams/design.json',JSON.stringify({date:d.common.date,status:d.common.status,products:d.products,productSources:d.productSources.filter(s=>['CCK-NOA','CCK-GRANTEE'].includes(s.id)),projects:d.projects},null,2)+'\n');
fs.writeFileSync('public/downloads/proposal-diagrams/design.md','# 처별 4종 도식·End-To-End 연계 설계\n\n'+d.common.status+'\n\n'+d.projects.map(p=>'## '+p.id+' · '+p.department+' · '+p.title+'\n\n### End-To-End\n\n'+p.e2e.map((s,i)=>`${i+1}. ${s.join(' → ')}`).join('\n')+'\n\n### 전체 아키텍처\n\n'+p.overall.nodes.map(n=>n.id+': '+n.label+' ('+n.role+')').join(' / ')+'\n\n'+p.overall.edges.map(e=>e.from+' → '+e.to+': '+e.label+(e.conditional?' · 조건 확인 후 인계':'')).join('\n')+'\n\n### 서비스 흐름\n\n'+p.steps.join(' → ')+'\n\n예외: '+p.exception+'\n\n### 데이터 흐름\n\n연결키: '+p.key+'\n\n'+p.data.transforms.join(' → ')+'\n\n개인정보: '+p.privacy+'\n\n입력: '+p.inputs.join(' / ')+'\n\n결과: '+p.output+'\n\n### 요구환경\n\n선행조건: '+p.precondition+'\n\n'+p.environment.groups.map(s=>s.join(': ')).join('\n\n')+'\n\n수동 복귀: '+p.environment.fallback+'\n\n범위 경계: '+p.boundary).join('\n\n')+'\n');
if(process.argv.includes('--json'))console.log(JSON.stringify(tasks));else console.log('42개 과제 · 168개 프롬프트 및 정확한 텍스트 설계 명세 출력');
