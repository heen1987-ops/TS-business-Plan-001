const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const manifest=require('../src/detailed-visuals47.json'),departments=require('../src/data.json').departments;
const base=process.env.SITE_BASE||'http://127.0.0.1:8773/TS-business-Plan-001/';
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true}),p=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),tests=[],errors=[];
p.setDefaultTimeout(30000);p.on('pageerror',e=>errors.push(e.message));const check=(name,ok)=>{tests.push({name,pass:!!ok});assert(ok,name)};fs.mkdirSync('qa-output',{recursive:true});
try{
 for(const code of ['CL','DRT']){
  const route=code==='CL'?departments.find(d=>d.code===code).folder+'/01_사업정의.html':'drt-assurance.html';
  await p.setViewportSize({width:1440,height:1000});await p.goto(base+route);await p.locator(code==='CL'?'[data-revision-department="CL"]':'.drt-hero').waitFor();
  if(code==='CL'){check('CL 기존 6개 장·14개 블록 유지',await p.locator('.r47-part').count()===6&&await p.locator('.r47-detail-block').count()===14);check('CL 기본3종·상세2종',await p.locator('[data-generated-diagram]').count()===3&&await p.locator('[data-detailed-diagram]').count()===2);}
  else check('DRT 운영 전환 도식5종',await p.locator('.drt-block-visual').count()===5);
  for(const a of manifest.assets.filter(a=>a.code===code)){
   const img=p.locator('img[src$="'+a.path+'"]');check('이미지 한 번씩 배치 '+code+a.type,await img.count()===1);await img.evaluate(el=>{for(let a=el.parentElement;a;a=a.parentElement)if(a.tagName==='DETAILS')a.open=true});await img.scrollIntoViewIfNeeded();await img.evaluate(el=>el.decode());
   check('실제 크기·비율 '+code+a.type,await img.evaluate((el,a)=>el.naturalWidth===a.width&&el.naturalHeight===a.height&&Math.abs(el.width/el.height-a.width/a.height)<.03,a));
   const figure=img.locator('xpath=ancestor::figure');const caption=await figure.locator('figcaption').innerText();check('동등 설명 전체 표시 '+code+a.type,a.points.every(t=>caption.includes(t)));check('대체텍스트 '+code+a.type,(await img.getAttribute('alt')).includes(a.summary));
   const link=figure.locator('a').first();await link.focus();check('키보드 포커스 '+code+a.type,await link.evaluate(el=>el===document.activeElement));const popupEvent=p.waitForEvent('popup');await link.press('Enter',{noWaitAfter:true});const popup=await popupEvent;await popup.waitForLoadState();check('원본 확대 '+code+a.type,popup.url().endsWith(a.path));await popup.close();
   if(a.type==='runtime'){await figure.screenshot({path:'qa-output/detail-'+code+'-runtime-desktop.png'});}
  }
  for(const width of [768,390]){await p.setViewportSize({width,height:900});for(const a of manifest.assets.filter(a=>a.code===code)){const img=p.locator('img[src$="'+a.path+'"]');await img.evaluate(el=>{for(let a=el.parentElement;a;a=a.parentElement)if(a.tagName==='DETAILS')a.open=true});await img.scrollIntoViewIfNeeded();check('모바일 본문 가로 넘침 '+code+a.type+width,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));check('모바일 비율 '+code+a.type+width,await img.evaluate(el=>Math.abs(el.width/el.height-el.naturalWidth/el.naturalHeight)<.03));}await p.screenshot({path:'qa-output/detail-'+code+'-mobile-'+width+'.png'});}
 }
 await p.setViewportSize({width:1440,height:1000});
 const clRoute=departments.find(d=>d.code==='CL').folder+'/01_사업정의.html';
 for(const id of ['data','runtime']){const currentType=id==='runtime'?'environment':id;await p.goto(base+clRoute);await p.locator('[data-revision-department]').waitFor();await p.locator('.r47-visual-shortcuts a[href="#diagram-CL-01-'+currentType+'"]').click();await p.waitForFunction(id=>document.getElementById('diagram-CL-01-'+id)?.contains(document.activeElement),currentType);check('CL 새 바로가기 초점 '+id,await p.locator('#diagram-CL-01-'+currentType).evaluate(el=>{const y=el.getBoundingClientRect().top;return y>=0&&y<innerHeight/2}));await p.goto('about:blank');await p.goto(base+clRoute+'#section-r47-block-'+id);await p.waitForFunction(id=>document.activeElement?.id==='heading-r47-block-'+id,id);check('CL 새 직접주소 초점 '+id,await p.locator('#heading-r47-block-'+id).evaluate(el=>el===document.activeElement));}
 for(const id of ['data','runtime']){await p.goto(base+'drt-assurance.html#drt-visual-'+id);await p.waitForFunction(id=>document.activeElement===document.querySelector('#drt-visual-'+id+' h3'),id);check('DRT 도식 직접주소·포커스 '+id,await p.locator('#drt-visual-'+id).evaluate(el=>{const y=el.getBoundingClientRect().top;return y>=0&&y<innerHeight/2}));}
 await p.goto(base+'drt-assurance.html');await p.locator('.drt-hero').waitFor();await p.locator('.drt-hero details.diagram-history').evaluate(el=>el.open=true);await p.locator('.drt-hero a[href="#drt-visual-data"]').click();await p.waitForFunction(()=>document.activeElement===document.querySelector('#drt-visual-data h3'));check('DRT 도식 바로가기 포커스',await p.locator('#drt-visual-data').evaluate(el=>el.getBoundingClientRect().top>=0));
 check('런타임 오류 없음',errors.length===0);
}finally{fs.writeFileSync('qa-output/detailed-visuals47-browser.json',JSON.stringify({base,tests,errors},null,2));await browser.close()}
console.log(JSON.stringify({checks:tests.length,passed:tests.filter(t=>t.pass).length,errors}));
})().catch(e=>{console.error(e);process.exitCode=1});
