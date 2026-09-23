const data=require('./official-sites.json'),org=require('./org-map-data.cjs');
function idsFor(node){const ids=new Set();function walk(n){if(!n)return;ids.add(n.id);n.children.forEach(walk)}walk(org.nodes[node]);return ids}
function forNode(node){if(!node||node==='TS')return data.sites;const ids=idsFor(node);return data.sites.filter(s=>s.mappings.some(m=>ids.has(m.node)))}
function find({node='TS',query='',status='all'}={}){const words=query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);return forNode(node).filter(s=>(status!=='pending'||s.status!=='처 관계 확인')&&(status!=='confirmed'||s.status==='처 관계 확인')&&words.every(w=>[s.title,s.url,s.category,s.kind,s.note,...s.mappings.flatMap(m=>[m.department,m.role,...org.ancestry(m.node).map(n=>n.name)])].join(' ').toLocaleLowerCase().includes(w)))}
module.exports={...data,forNode,find,idsFor};
