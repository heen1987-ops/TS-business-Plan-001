'use strict';
const fs=require('node:fs'),path=require('node:path'),d=require('../src/organization-site.cjs');
const strategies=require('../src/strategy-solutions-2027.cjs');
const detail=require('../src/detailed-work.cjs');
const portfolio=require('../src/proposal-portfolio.cjs');
const csv=rows=>'\ufeff'+rows.map(r=>r.map(v=>'"'+String(v??'미확인').replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"').join(',')).join('\r\n')+'\r\n';
const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inline=s=>escape(s).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2">$1</a>');
function html(md){return '<!doctype html><html lang="ko"><head><meta name="robots" content="noindex,nofollow"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TS 조직 네이티브 AI 제안서</title><style>body{max-width:820px;margin:50px auto;padding:0 24px;font:14px/1.85 system-ui,sans-serif;color:#37352f}h1{font-size:27px}h2{margin-top:40px;border-bottom:1px solid #ddd;padding-bottom:10px}h3{font-size:17px;margin-top:30px}p{margin:8px 0}a{color:inherit}small{color:#777}.item{padding-left:15px;text-indent:-12px}header{border-bottom:1px solid #ddd;padding-bottom:16px}button{background:#fff;border:1px solid #ddd;padding:8px 12px;cursor:pointer}@media print{header{display:none}body{margin:0;font-size:10pt}h2,h3{break-after:avoid}p{orphans:2;widows:2}}</style></head><body><header><button onclick="window.print()">인쇄 / PDF 저장</button> <a href="../proposal-2027.html">구축·검수 화면</a></header>'+md.split('\n').filter(Boolean).map(line=>{const h=line.match(/^(#{1,3}) (.*)/);return h?'<h'+h[1].length+'>'+inline(h[2])+'</h'+h[1].length+'>':line.startsWith('- ')?'<p class="item">· '+inline(line.slice(2))+'</p>':'<p>'+inline(line)+'</p>';}).join('\n')+'</body></html>';}
function files(){const md=d.markdown();return {
 'growth-ai-proposal-portfolio.md':portfolio.markdown(),
 'growth-ai-proposal-institutions.csv':csv([['관계부처','기관','관계 구분','업무 적용안',...portfolio.tracks.map(t=>t.title),'적용 기준','출처','확인일'],...portfolio.institutions.map(m=>[m.ministry,m.institution,m.relation,m.focus,...m.cells,m.note,m.sources.map(id=>portfolio.sources.find(s=>s.id===id).url).join(' / '),portfolio.date])]),
 ...require('./export-all-department-work.cjs')(),
 'ts-detailed-work-processes.md':detail.markdown(),
 'ts-detailed-work-processes.csv':csv([['업무 ID','부서','업무','단계 ID','순서','처리업무','입력자료','결과물','역할안','완료조건안','직제근거','공개업무 참조','전략','공통 기반 참조','공통 검수 참조','추진 구분','상태'],...detail.processes.flatMap(p=>p.steps.map(s=>[p.id,p.department,p.title,s.id,s.order,s.task,s.input,s.output,s.role,s.done,p.basis.map(b=>b.text+' ['+b.locator+']').join(' / '),p.unitIds.join(' / '),p.strategyIds.join(' / '),p.packages.join(' / '),p.tests.join(' / '),p.phase,p.status]))]),
 'ts-detailed-work-register.csv':csv([['부서코드','부서','조직경로','근거구분','항목 ID','원문','근거좌표','확인판본','대조사항'],...Object.values(detail.byOrg).flatMap(o=>[...o.ruleItems.map(r=>[o.code,o.name,o.path,'직제시행세칙',r.id,r.text,r.locator,detail.source.ruleDate,'']),...o.publicItems.map(u=>[o.code,o.name,o.path,'공개 담당업무',u.id,u.text,u.sourceSpans.map(s=>s.observationId+':'+s.start+'-'+s.end).join(' / '),detail.source.publicDate,[u.placement,u.scopeReview?.reason].filter(Boolean).join(' / ')])])]),
 'ts-strategy-solutions-2027.md':strategies.markdown(),
 'ts-strategy-solutions-2027.json':JSON.stringify(strategies,null,2)+'\n',
 'ts-strategy-solutions-2027.csv':csv([['전략 ID','전략방향','전략과제 원문','업무 연결','수행업무','참여 조직안','직무 요약','세칙상 수행업무','조직·업무 근거','솔루션안','추가 개발안','결과물','추진 구분','공통 구축','검수 시나리오','업무 검수 기준안','근거 보완사항','전략 출처','확인일','매핑 상태'],...strategies.rows.map(r=>[r.id,r.direction,r.strategy,r.lawIds.join(' / '),r.work,r.codes.map(c=>d.rules.bindings.find(n=>n.code===c).name).join(' / '),r.dutyBindings.map(b=>b.name+': '+b.job).join(' / '),r.dutyBindings.map(b=>b.name+': '+(b.duties.join(' ; ')||b.status)).join(' / '),r.codes.map(c=>{const n=d.rules.bindings.find(n=>n.code===c);return n.name+': '+(n.locator||n.restriction);}).join(' / '),r.solution,r.features.join(' / '),r.output,r.phase,r.packages.join(' / '),r.tests.join(' / '),r.acceptance,r.basisNote,strategies.source.url,strategies.source.checkedAt,r.status])]),
 'ts-law-work-chain.md':require('../src/law-workspace.cjs').markdown(),
 'ts-organization-rules.md':d.rules.markdown(),
 'ts-organization-rules.json':JSON.stringify({source:d.rules.source,summary:d.rules.summary,notes:d.rules.notes,territories:d.rules.territories,bindings:d.rules.bindings},null,2)+'\n',
 'ts-organization-rules.csv':csv([['공개 조직코드','조직명','조직경로','조직 구조 대조','업무분장 상태','근거좌표','규정상 업무','일반 시행일','효력상태','적용조건','원본 SHA-256'],...d.rules.bindings.map(n=>[n.code,n.name,n.path,n.structure,n.status,n.locator,n.duties.join(' / '),n.effectiveDate,n.effectiveState,n.restriction,d.rules.source.sha256])]),
 'ts-2027-organization-proposal.md':md,
 'ts-2027-organization-proposal.html':html(md)
};}
function exportFiles(out){fs.mkdirSync(out,{recursive:true});for(const [name,body] of Object.entries(files()))fs.writeFileSync(path.join(out,name),body);}
module.exports=exportFiles;module.exports.files=files;
