const assert=require('node:assert/strict'),fs=require('node:fs'),c=require('../src/proposal-composition.cjs'),old=require('../src/reading-structure.cjs'),r=require('../src/revision47.cjs'),docs=require('../src/document-data.cjs');let checks=0;const check=(v,m)=>{assert(v,m);checks++};
check(c.chapters.map(x=>x.title).join('|')===old.definitions.map(x=>x.title).join('|'),'9/24 여섯장 구성 재사용');
check(c.blocks.length===14&&new Set(c.blocks.map(x=>x.id)).size===14,'14개 소구획 고유');
for(const b of c.blocks)check(c.chapters.some(x=>x.id===b.chapter),'소구획 장 배정 '+b.id);
for(const code of Object.keys(r.data.departments)){const item=r.get(code),doc=docs.getDocument(item.folder+'/01_사업정의.html');check(item.detail.metrics.length===3,'최신3지표 '+code);for(const b of c.blocks)check(doc.targets['r47-block-'+b.id]==='r47-block-'+b.id,'새 앵커복원 '+code+b.id);}
check(c.currentTarget('detail-overall')==='r47-block-overall','과거 전체도→최신전체도');
check(c.currentTarget('MR-E01')==='r47-block-metrics','과거 지표→현재 측정 맥락');
check(c.currentTarget('card-DS1')==='card-DS1','동등성미확정 과거저장소 자료유지');
check(c.currentTarget('r47-design')==='r47-design','기존 최신앵커유지');
const nav=require('../src/navigation.cjs');check(nav.locate(r.get('MR').folder+'/01_사업정의.html#section-detail-overall').menuId==='solutions','옛해시 메뉴맥락회귀');
const exported=JSON.parse(fs.readFileSync('dist/downloads/revision47/MR_근거기반_상세제안.json'));check(exported.composition.blocks.length===14,'내려받기 구성정보일치');
console.log(JSON.stringify({result:'통과',checks,chapters:6,blocks:14,departments:13}));
