const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=(process.env.PLAYWRIGHT_MODULE?require(process.env.PLAYWRIGHT_MODULE):require('playwright'));
const base=process.env.SITE_BASE||'http://127.0.0.1:8768/';
(async()=>{
 fs.mkdirSync('qa-output',{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:1600,height:1040},deviceScaleFactor:1});const errors=[];
 page.on('pageerror',e=>errors.push(e.message));let checks=0;
 const goto=async suffix=>{await page.goto(base+suffix);await page.locator('.mindmap-home').waitFor();};
 await goto('index.html');assert.equal(await page.locator('.map-child-list .map-node').count(),9);assert.equal(await page.locator('[data-edge]').count(),9);assert.equal(await page.locator('.briefing-slide').count(),0);checks+=3;
 await page.screenshot({path:'qa-output/map-home.jpg',fullPage:true,type:'jpeg',quality:80});
 await page.locator('.map-child-list [data-node="mobility"]').focus();await page.keyboard.press('Enter');await page.locator('.map-child-list [data-node="mobility-lab"]').click();await page.locator('.map-child-list [data-node="DF"]').click();
 assert.equal(await page.locator('[data-focus-node]').getAttribute('data-focus-node'),'DF');assert.equal(await page.locator('.map-child-list .map-document').count(),6);checks+=2;
 await page.screenshot({path:'qa-output/map-df.jpg',fullPage:true,type:'jpeg',quality:80});
 await page.reload();assert.equal(await page.locator('[data-focus-node]').getAttribute('data-focus-node'),'DF');checks++;
 await page.goBack();await page.waitForURL('**node=mobility-lab');assert.equal(await page.locator('[data-focus-node]').getAttribute('data-focus-node'),'mobility-lab');checks++;
 await goto('index.html');
 await page.getByLabel('조직·업무·시스템 검색').fill('KADIS');assert.equal(await page.locator('.map-search-results li').count(),1);await page.getByLabel('조직·업무·시스템 검색').press('Enter');assert.equal(await page.locator('[data-focus-node]').getAttribute('data-focus-node'),'AD');checks+=2;
 await page.getByLabel('조직·업무·시스템 검색').fill('존재하지않는조직123');assert.equal(await page.locator('.map-search-results li').count(),0);assert((await page.locator('.map-search-results').innerText()).includes('0개'));await page.getByLabel('검색어 지우기').click();assert.equal(await page.locator('.map-search-results').count(),0);checks+=3;
 for(const d of require('../src/data.json').departments){
  await goto('index.html?node='+d.code);const links=await page.locator('.map-child-list a').evaluateAll(es=>es.map(e=>e.href));
  assert.equal(links.length,6);assert(links.every(l=>decodeURI(l).includes(d.folder)));
  for(const link of links)assert.equal((await page.request.get(link)).status(),200);
  assert.equal(await page.locator('.map-related a[href*="metric="]').count(),3);checks+=9;
 }
 await page.locator('.map-child-list [data-node="impact"]').click();await page.locator('.briefing-slide').waitFor();checks++;
 await goto('index.html?node=DF');await page.locator('.map-related a[href*="metric=DF-E01"]').click();await page.locator('.briefing-slide').waitFor();assert((await page.locator('.briefing-slide').innerText()).includes('측정'));checks++;
 await goto('index.html?node=budget');assert.equal(await page.locator('.map-notice').count(),1);checks++;
 await goto('index.html?node=not-real');assert.equal(await page.locator('.map-invalid').count(),1);assert.equal(await page.locator('[data-focus-node]').getAttribute('data-focus-node'),'TS');checks+=2;
 await goto('index.html?node=DF');await page.getByRole('button',{name:'목록 보기',exact:true}).click();assert.equal(await page.locator('.map-outline li').count(),6);await page.getByRole('button',{name:'연결도 보기',exact:true}).click();checks++;
 await page.setViewportSize({width:1280,height:800});await page.screenshot({path:'qa-output/map-df-1280.jpg',fullPage:true,type:'jpeg',quality:80});
 const overflow=()=>page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
 assert.equal(await overflow(),false);assert((await page.locator('.map-board').boundingBox()).width>600);checks+=2;
 await page.setViewportSize({width:390,height:844});await goto('index.html');assert.equal(await overflow(),false);assert.equal(await page.locator('.map-connectors').isVisible(),false);checks+=2;
 await goto('index.html?node=field');assert.equal(await page.locator('.map-child-list .map-related-node').count(),4);assert.equal(await page.locator('.map-child-list').evaluate(e=>getComputedStyle(e).borderLeftStyle),'dashed');checks+=2;await goto('index.html');
 await page.screenshot({path:'qa-output/map-mobile.jpg',fullPage:true,type:'jpeg',quality:80});
 await goto('index.html?node=DF');assert.equal(await overflow(),false);await page.screenshot({path:'qa-output/map-df-mobile.jpg',fullPage:true,type:'jpeg',quality:80});checks++;
 for(const width of [1280,1024,981,768,640]){await page.setViewportSize({width,height:900});for(const id of ['advanced-center','mobility','AD','mobility-lab','inspection','KATRI']){await goto('index.html?node='+id);const outside=await page.locator('.map-focus h2,.map-node strong').evaluateAll(es=>es.some(e=>{const r=document.createRange();r.selectNodeContents(e);const ink=r.getBoundingClientRect(),box=e.parentElement.getBoundingClientRect();return ink.right>box.right+1||ink.left<box.left-1;}));assert.equal(outside,false,'카드 내부 글자 넘침: '+width+'/'+id);checks++;}}
 await page.setViewportSize({width:1600,height:1040});await goto('index.html');await page.keyboard.press('Tab');assert(await page.locator(':focus').count()>0);checks++;
 await page.locator('.map-guide').click();await page.locator('.briefing-slide').waitFor();assert.equal(await page.locator('.document-nav').count(),1);checks+=2;
 assert.deepEqual(errors,[]);fs.writeFileSync('qa-output/org-map-browser.json',JSON.stringify({result:'통과',base,checks,pageErrors:errors,viewports:[1600,1280,390]},null,2));
 console.log(JSON.stringify({result:'통과',checks,base}));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});

