const source=require('./slide-data.cjs');
// 원문 항목은 보존하고, 화면 높이를 맞추기 위해 나눴던 연속 조각만 통합.
function getDocument(route){
 const raw=source.getRawDeck(route),sections=[];
 for(const item of raw.slides){
  const base=item.title.replace(/\s+\d+$/,'');const prev=sections.at(-1);
  const merge=base!==item.title&&prev?.groupTitle===base&&prev.message===item.message&&!prev.image&&!item.image&&prev.status===item.status;
  if(merge){prev.title=base;prev.cards.push(...item.cards);prev.aliases.push(item.id);prev.links.push(...(item.links||[]));}
  else sections.push({...item,cards:[...item.cards],links:[...(item.links||[])],aliases:[item.id],groupTitle:base});
 }
 const targets={};for(const section of sections){section.links=section.links.filter((l,i,a)=>a.findIndex(x=>x.to===l.to&&x.label===l.label)===i);for(const alias of section.aliases)targets[alias]=section.id;}
 // 예전 slide/part 주소도 전체 문서 내의 해당 절로 연결.
 for(const item of source.getDeck(route).slides){const parent=item.id.replace(/-part-\d+$/,'');if(targets[parent])targets[item.id]=targets[parent];}
 const cardTargets={};for(const section of sections)for(const card of section.cards){const match=/^(DS[1-6]) · /.exec(card.title);if(match)cardTargets[match[1]]={id:'card-'+match[1],sectionId:section.id};}
 return {title:raw.title,sections,targets,cardTargets};
}
function targetFromRoute(route,document){const u=new URL(route,'https://local/'),q=u.searchParams;let hash='';try{hash=decodeURIComponent(u.hash.slice(1))}catch{}const store=q.get('store');const candidates=[hash.replace(/^section-/,''),q.get('slide'),q.get('contract'),q.get('metric'),store];return candidates.map(x=>document.targets[x]||document.cardTargets[x]?.id||Object.values(document.cardTargets).find(c=>c.id===x)?.id).find(Boolean)||null;}
module.exports={getDocument,targetFromRoute};
