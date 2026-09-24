const source=require('./slide-data.cjs');
function consolidate(sections){
 if(!sections.some(s=>s.id==='detail-sixw'))return;
 const bindings={purpose:'detail-sixw',mandate:'detail-sixw',why:'detail-why',replan:'detail-scenario','flow-data':'detail-data',implementation:'detail-method','effect-boundary':'detail-outcomes','measurement-common-0':'detail-outcomes'};
 for(const s of sections){const m=/^(.+-E0[123])-method-\d+$/.exec(s.id);if(m)bindings[s.id]=m[1];}
 const remove=new Set();
 for(const item of sections){const target=sections.find(s=>s.id===bindings[item.id]);if(!target||target===item||item.image||item.diagram)continue;
 target.aliases.push(...item.aliases);target.parts=[...(target.parts||[target.id]),...(item.parts||[item.id])];
 target.additionalMessages=[...(target.additionalMessages||[]),...([item.message,...(item.additionalMessages||[])].filter(x=>x&&x!==target.message))];
 target.additionalStatuses=[...(target.additionalStatuses||[]),...([item.status,...(item.additionalStatuses||[])].filter(x=>x&&x!==target.status))];
 for(const c of item.cards){const existing=target.cards.find(x=>x.title===c.title);if(existing)existing.bullets=[...new Set([...existing.bullets,...c.bullets])];else target.cards.push({...c,bullets:[...c.bullets]});}
 target.links.push(...item.links);if(item.tables)target.tables=[...(target.tables||[]),...item.tables];remove.add(item.id);
 }
 for(let i=sections.length-1;i>=0;i--)if(remove.has(sections[i].id))sections.splice(i,1);
 for(const s of sections){s.additionalMessages=[...new Set(s.additionalMessages||[])];s.additionalStatuses=[...new Set(s.additionalStatuses||[])];}
}

// 원문 설명·근거·기존 앵커를 보존하고 반복되는 목적·측정 조각을 의미 단위로 통합.
function getDocument(route){
 const raw=source.getRawDeck(route),sections=[];
 for(const item of raw.slides){
  const base=item.title.replace(/\s+\d+$/,'');const prev=sections.at(-1);
  const merge=base!==item.title&&prev?.groupTitle===base&&prev.message===item.message&&!prev.image&&!item.image&&prev.status===item.status;
  if(merge){prev.title=base;prev.cards.push(...item.cards);prev.aliases.push(item.id);prev.links.push(...(item.links||[]));}
  else sections.push({...item,cards:item.cards.map(c=>({...c,bullets:[...c.bullets]})),links:[...(item.links||[])],aliases:[item.id],groupTitle:base});
 }
 consolidate(sections);
 const targets={};for(const section of sections){section.links=section.links.filter((l,i,a)=>a.findIndex(x=>x.to===l.to&&x.label===l.label)===i);for(const alias of section.aliases)targets[alias]=section.id;}
 // 예전 slide/part 주소도 전체 문서 내의 해당 절로 연결.
 for(const item of source.getDeck(route).slides){const parent=item.id.replace(/-part-\d+$/,'');if(targets[parent])targets[item.id]=targets[parent];}
 const cardTargets={};for(const section of sections)for(const card of section.cards){const match=/^(DS[1-6]) · /.exec(card.title);if(match)cardTargets[match[1]]={id:'card-'+match[1],sectionId:section.id};}
 const chapters=require('./reading-structure.cjs').chaptersFor(sections,route);for(const chapter of chapters)targets[chapter.id]=chapter.id;if(route.startsWith('about.html'))targets.technology='benefit';
 return {title:raw.title,lead:raw.lead,sections,chapters,targets,cardTargets};
}
function targetFromRoute(route,document){const u=new URL(route,'https://local/'),q=u.searchParams;let hash='';try{hash=decodeURIComponent(u.hash.slice(1))}catch{}const store=q.get('store');const candidates=[hash.replace(/^section-/,''),q.get('slide'),q.get('contract'),q.get('metric'),store];return candidates.map(x=>document.targets[x]||document.cardTargets[x]?.id||Object.values(document.cardTargets).find(c=>c.id===x)?.id).find(Boolean)||null;}
module.exports={getDocument,targetFromRoute};
