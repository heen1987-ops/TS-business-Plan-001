'use strict';
const fs=require('node:fs'),path=require('node:path');
const d=require('../src/proposal-2027.cjs');
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function inline(s){
 return escape(s).replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,'<a href="$2">$1</a>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
}
function markdown(){
 return '# '+d.source.title+'\n\n'+d.source.blocks.map(b=>b.replace(/^(#+) /gm,'#$1 ')).join('\n\n')+'\n';
}
function diagram(block){
 const nodes=Object.fromEntries([...block.matchAll(/(\w+)\["([^"]+)"\]/g)].map(m=>[m[1],m[2]]));
 const edges=[...block.matchAll(/^\s*(\w+)(?:\["[^"]+"\])?\s*-->\s*(\w+)/gm)].map(m=>[m[1],m[2]]);
 const positions={A:[20,25],B:[20,135],C:[390,25],D:[390,135],E:[20,245],F:[390,245],P:[20,355],G:[390,355],H:[390,465],I:[390,575],J:[390,685],K:[390,795]};
 if(Object.keys(nodes).length!==Object.keys(positions).length||edges.length!==11)throw Error('구성도 입력 변경: 배치와 연결을 검토하세요.');
 const lines=edges.map(([from,to])=>{
  if(!positions[from]||!positions[to])throw Error('구성도 노드 누락');
  const [x,y]=positions[from],[tx,ty]=positions[to];
  return x===tx?'<path d="M '+(x+160)+' '+(y+64)+' V '+(ty-7)+'"/>':'<path d="M '+(x+320)+' '+(y+32)+' H '+(tx-7)+'"/>';
 }).join('');
 const boxes=Object.entries(nodes).map(([id,label])=>{
  const [x,y]=positions[id];
  return '<g><rect x="'+x+'" y="'+y+'" width="320" height="64" rx="6"/><text x="'+(x+160)+'" y="'+(y+37)+'" text-anchor="middle">'+escape(label)+'</text></g>';
 }).join('');
 return '<figure><figcaption>공식 관계·업무 맥락·정책을 연결하는 처리 흐름</figcaption><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 730 885" role="img" aria-labelledby="architecture-title"><title id="architecture-title">조직 네이티브 AI 처리 흐름</title><defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#317570"/></marker></defs><g fill="none" stroke="#317570" stroke-width="2" marker-end="url(#arrow)">'+lines+'</g><g fill="#eff6f5" stroke="#a9c7c4">'+boxes+'</g><style>text{fill:#193347;stroke:none;font:16px sans-serif}</style></svg><details><summary>구성도 연결을 글로 보기</summary><ul>'+edges.map(([a,b])=>'<li>'+escape(nodes[a]+' → '+nodes[b])+'</li>').join('')+'</ul></details></figure>';
}
function render(block){
 if(block.startsWith(String.fromCharCode(96).repeat(3)+'mermaid'))return diagram(block);
 if(/^#{1,2} /.test(block)){
  const m=block.match(/^(#+) (.*)/),level=m[1].length+1;
  const id=level===2?'chapter-'+m[2].match(/^\d+/)[0]:'section-'+m[2].match(/^[\d.]+/)[0].replaceAll('.','-');
  return '<h'+level+' id="'+id+'">'+inline(m[2])+'</h'+level+'>';
 }
 if(block.startsWith('|')){
  const rows=block.split('\n').map(s=>s.trim().slice(1,-1).split('|').map(x=>x.trim()));
  return '<table><thead><tr>'+rows[0].map(h=>'<th scope="col">'+inline(h)+'</th>').join('')+'</tr></thead><tbody>'+rows.slice(2).map(row=>'<tr>'+row.map((cell,i)=>'<td data-label="'+escape(rows[0][i])+'">'+inline(cell)+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
 }
 if(block.startsWith('> '))return '<blockquote>'+inline(block.slice(2))+'</blockquote>';
 return '<p>'+inline(block).replace(/\n/g,'<br>')+'</p>';
}
function html(){
 const style='*{box-sizing:border-box}body{margin:0;background:#edf2f4;color:#193347;font-family:Arial,"Malgun Gothic",sans-serif;font-size:15px;line-height:1.85}main{max-width:1060px;margin:2rem auto;background:white;padding:3rem;border-top:6px solid #176966}h1{font-size:2rem;line-height:1.45}h2{font-size:1.5rem;margin-top:3rem;border-bottom:2px solid #cadae0;padding-bottom:.5rem;scroll-margin-top:1rem}h3{font-size:1.15rem;margin-top:2rem}a{color:#176966}nav{display:flex;gap:.8rem;flex-wrap:wrap}nav a,button{border:1px solid #97b9b6;border-radius:4px;padding:.5rem .8rem;background:white;color:#175e5a;font:inherit;text-decoration:none;cursor:pointer}table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:.86rem;line-height:1.75;margin:1.2rem 0}th,td{padding:.7rem;border:1px solid #ccdce1;vertical-align:top;text-align:left;overflow-wrap:anywhere}th{background:#edf5f4}blockquote{border-left:4px solid #3d8981;padding:1rem;background:#f1f7f6}figure{margin:1rem auto;max-width:730px}svg{width:100%;height:auto}figcaption{font-weight:700}p{overflow-wrap:anywhere}.toc{columns:2}.toc li{break-inside:avoid}.draft{padding:1rem;background:#edf5f4;border-left:4px solid #317c76}:focus-visible{outline:3px solid #237c76;outline-offset:3px}@media screen and (max-width:680px){main{margin:0;padding:1.2rem}h1{font-size:1.6rem}.toc{columns:1}thead{position:absolute;width:1px;height:1px;clip-path:inset(50%);overflow:hidden}table,tbody,tr,td{display:block;width:100%}tr{margin:1rem 0;border:1px solid #ccdce1}td{border:0;border-bottom:1px solid #e0eaed}td:before{content:attr(data-label);display:block;font-weight:bold;color:#426575}}@page{size:A4;margin:16mm}@media print{body{background:white;font-size:10pt;color:#111}main{margin:0;padding:0;max-width:none;border:0}nav,.print-note,figure details{display:none}h1{font-size:22pt}h2{font-size:16pt;break-before:page}h3{font-size:12pt;break-after:avoid}table{font-size:8.5pt}tr{break-inside:avoid}thead{display:table-header-group}a{color:#111;text-decoration:none}figure{max-width:140mm;break-inside:avoid}p{orphans:3;widows:3}}';
 return '<!doctype html><html lang="ko"><head><meta name="robots" content="noindex,nofollow"><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>'+escape(d.source.title)+' | CCK</title><style>'+style+'</style></head><body><main><nav aria-label="문서 도구"><a href="../proposal-2027.html">사업 요약으로</a><a href="ts-2027-proposal.md" download>Markdown 내려받기</a><button type="button" onclick="window.print()">인쇄 · PDF 저장</button></nav><h1>'+escape(d.source.title)+'</h1><p class="draft">'+escape(d.status)+'</p><p class="print-note">인쇄 버튼에서 프린터 또는 PDF 저장을 선택할 수 있습니다. 이 문서는 인터넷 연결 없이도 본문을 읽고 인쇄할 수 있습니다.</p><ol class="toc">'+d.chapters.map(ch=>'<li><a href="#'+ch.id+'">'+escape(ch.title.replace(/^\d+ /,''))+'</a></li>').join('')+'</ol>'+d.source.blocks.map(render).join('\n')+'</main></body></html>\n';
}
function csv(){
 const rows=[['개발 ID','개발 항목','추가 개발 범위','납품 증빙','기존 기획 ID','검수 ID','시험 사례','합격 조건 제안','제안서 판본','상태'],...d.requirements.map(r=>{
  const t=d.tests.find(x=>x.id===r.testId);
  if(!t)throw Error('제안서 검수 연결 누락: '+r.testId);
  return [r.id,r.name,r.scope,r.evidence,r.legacyIds.join(' · '),t.id,t.scenario,t.criterion,d.source.version,d.status];
 })];
 return '\ufeff'+rows.map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n')+'\r\n';
}
function exportProposal(out){
 fs.mkdirSync(out,{recursive:true});
 for(const [name,content] of Object.entries({'ts-2027-proposal.md':markdown(),'ts-2027-proposal.html':html(),'ts-2027-proposal-trace.csv':csv()}))fs.writeFileSync(path.join(out,name),content,'utf8');
}
module.exports=exportProposal;
Object.assign(module.exports,{markdown,html,csv,render,diagram});
if(require.main===module)exportProposal(process.argv[2]);
