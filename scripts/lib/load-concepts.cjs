const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const allowedAreas=new Set(['infrastructure','knowledge','services']);
const allowedStages=new Set(['foundation','pilot','expand','research','hold']);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function validUrl(url){return /^https?:\/\//i.test(url)||/^(?:index\.html|downloads\/)[^\s]*$/.test(url);}
function inline(value){
 const tokens=[];let last=0;
 for(const match of value.matchAll(/\[([^\]]+)\]\(<?([^\s)>]+)>?\)/g)){
  tokens.push(escape(value.slice(last,match.index)));
  const [,label,url]=match;
  tokens.push(validUrl(url)?'<a href="'+escape(url)+'"'+(/^https?:/.test(url)?' target="_blank" rel="noopener noreferrer"':'')+'>'+escape(label)+'</a>':escape(label));
  last=match.index+match[0].length;
 }
 tokens.push(escape(value.slice(last)));
 return tokens.join('').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/`([^`]+)`/g,'<code>$1</code>');
}
function renderMarkdown(body){
 const lines=body.trim().split(/\r?\n/),parts=[];
 for(let i=0;i<lines.length;i++){
  const line=lines[i].trim();if(!line)continue;
  if(/^<!-- v1\.2-case-expansion:(?:start|end) -->$/.test(line))continue;
  if(/^#{1,6}\s/.test(line)){const m=line.match(/^(#{1,6})\s+(.+)$/),level=Math.min(6,m[1].length+1);parts.push(`<h${level}>${inline(m[2])}</h${level}>`);continue;}
  if(line.startsWith('|')){
   const rows=[];
   while(i<lines.length&&lines[i].trim().startsWith('|')){rows.push(lines[i].trim().replace(/^\||\|$/g,'').split(/(?<!\\)\|/).map(s=>s.trim().replace(/\\\|/g,'|')));i++;}i--;
   if(rows.length>1&&rows[1].every(s=>/^:?-+:?$/.test(s)))rows.splice(1,1);
   parts.push('<div class="opp-table-scroll" tabindex="0" role="region" aria-label="컨셉 세부 비교표"><table><thead><tr>'+rows.shift().map(c=>'<th scope="col">'+inline(c)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(c=>'<td>'+inline(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>');continue;
  }
  if(/^[-*]\s/.test(line)){
   const items=[];while(i<lines.length&&/^\s*[-*]\s/.test(lines[i])){items.push('<li>'+inline(lines[i].replace(/^\s*[-*]\s+/,''))+'</li>');i++;}i--;parts.push('<ul>'+items.join('')+'</ul>');continue;
  }
  if(/^\d+[.)]\s/.test(line)){
   const items=[];while(i<lines.length&&/^\s*\d+[.)]\s/.test(lines[i])){items.push('<li>'+inline(lines[i].replace(/^\s*\d+[.)]\s+/,''))+'</li>');i++;}i--;parts.push('<ol>'+items.join('')+'</ol>');continue;
  }
  if(/^---+$/.test(line)){parts.push('<hr>');continue;}
  parts.push('<p>'+inline(line.replace(/^>\s?/,''))+'</p>');
 }
 return parts.join('\n');
}
function parseConcept(markdown,filename){
 const raw=markdown.replace(/^\uFEFF/,'');const match=raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
 if(!match)throw Error('JSON frontmatter missing: '+filename);
 const d=JSON.parse(match[1]);
 for(const key of ['id','slug','title','summary','primary_area','stage','date','status'])if(typeof d[key]!=='string'||!d[key].trim())throw Error('Missing '+key+': '+filename);
 if(!/^C\d{2,3}$/.test(d.id)||!/^[-a-z0-9]+$/.test(d.slug))throw Error('Invalid concept ID/slug: '+filename);
 if(filename!==d.title+'.md'||/[<>:"/\\|?*]/.test(d.title))throw Error('Concept filename must match title: '+filename);
 if(!allowedAreas.has(d.primary_area)||!allowedStages.has(d.stage)||!Array.isArray(d.areas)||!d.areas.includes(d.primary_area)||d.areas.some(a=>!allowedAreas.has(a)))throw Error('Invalid classification: '+filename);
 if(!Array.isArray(d.strategy_ids)||d.strategy_ids.some(x=>!/^ST-(?:0[1-9]|1[0-2])$/.test(x)))throw Error('Invalid strategy ID: '+filename);
 if(!Array.isArray(d.task_ids)||d.task_ids.some(x=>!/^(?:[PK]0[1-5]|S0[1-6])$/.test(x)))throw Error('Invalid task ID: '+filename);
 if(!Array.isArray(d.sources)||!d.sources.length||d.sources.some(s=>!s.title||!validUrl(s.url)))throw Error('Public source required: '+filename);
 if(/(?:[CG]:[\\/]|file:\/\/|\\Users\\|-----BEGIN [A-Z ]*PRIVATE KEY-----)/i.test(raw))throw Error('Local/private reference in public concept: '+filename);
 const body=raw.slice(match[0].length).trim();if(body.length<200)throw Error('Concept body too short: '+filename);
 return {...d,filename,bytes:Buffer.byteLength(raw),sha256:crypto.createHash('sha256').update(raw).digest('hex'),markdown:raw,html:renderMarkdown(body)};
}
function loadConcepts(dir=path.resolve(__dirname,'../../src/concepts')){
 const rows=fs.readdirSync(dir).filter(f=>f.endsWith('.md')).map(f=>parseConcept(fs.readFileSync(path.join(dir,f),'utf8'),f)).sort((a,b)=>a.id.localeCompare(b.id));
 if(!rows.length)throw Error('No concepts');
 for(const key of ['id','slug','title'])if(new Set(rows.map(r=>r[key])).size!==rows.length)throw Error('Duplicate concept '+key);
 return rows;
}
module.exports={loadConcepts,parseConcept,renderMarkdown};
