const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const manifest=require('../src/generated-visuals47.json'),{departments}=require('../src/data.json');
const base=process.env.SITE_BASE||'http://127.0.0.1:8773/TS-business-Plan-001/';
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true}),p=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),tests=[],errors=[];p.on('pageerror',e=>errors.push(e.message));const check=(name,v)=>{tests.push({name,pass:!!v});assert(v,name)};fs.mkdirSync('qa-output',{recursive:true});
try{
for(const d of departments){await p.goto(base+d.folder+'/01_사업정의.html');await p.locator('[data-revision-department]').waitFor();
 check('이미지 모델 도식 3종 '+d.code,await p.locator('[data-generated-diagram]').count()===3);
 for(const type of ['concept','overall','service']){const a=manifest.assets.find(a=>a.code===d.code&&a.type===type),f=p.locator('[data-generated-diagram="'+type+'"]'),img=f.locator('img');await img.scrollIntoViewIfNeeded();await img.evaluate(el=>el.loading='eager');await p.waitForFunction(sel=>{const el=document.querySelector(sel);return el?.complete&&el.naturalWidth>0},'[data-generated-diagram="'+type+'"] img');
 check('원본 로딩 '+d.code+type,await img.evaluate((el,a)=>el.naturalWidth===a.width&&el.naturalHeight===a.height&&el.src.endsWith(a.path),a));
 check('설명·예시 표시 '+d.code+type,(await img.getAttribute('alt')).includes(d.name)&&(await f.locator('figcaption').innerText()).includes('설명용 예시'));
 check('확대 주소 '+d.code+type,(await f.locator('a').first().getAttribute('href')).endsWith(a.path));
 }
 check('기존 상세 본문 유지 '+d.code,await p.locator('.r47-detail-block').count()===14&&await p.locator('.r47-part').count()===6);
 check('가로 넘침 없음 '+d.code,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
}
const qe=departments.find(d=>d.code==='QE');await p.goto(base+qe.folder+'/01_사업정의.html#section-r47-block-concept');await p.locator('[data-generated-diagram="concept"] img').scrollIntoViewIfNeeded();await p.locator('[data-generated-diagram="concept"] img').evaluate(el=>el.decode());await p.screenshot({path:'qa-output/generated-qe-concept-desktop.png'});
const zoom=p.locator('[data-generated-diagram="concept"] a').first();await zoom.focus();check('확대 키보드 포커스',await zoom.evaluate(el=>el===document.activeElement));const popupEvent=p.waitForEvent('popup');await zoom.press('Enter');const popup=await popupEvent;await popup.waitForLoadState();check('새 창 원본 확대',popup.url().endsWith('QE_concept_v1.png'));await popup.close();
await p.locator('[data-generated-diagram="overall"] img').scrollIntoViewIfNeeded();await p.locator('[data-generated-diagram="overall"] img').evaluate(el=>el.decode());check('재진입 아키텍처 표시',await p.locator('[data-generated-diagram="overall"] img').evaluate(el=>el.complete&&el.naturalWidth>0));await p.screenshot({path:'qa-output/generated-qe-architecture-desktop.png'});
for(const width of [768,390]){await p.setViewportSize({width,height:900});await p.locator('[data-generated-diagram="service"] img').scrollIntoViewIfNeeded();check('모바일 가로 넘침 없음 '+width,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));check('모바일 이미지 비율 유지 '+width,await p.locator('[data-generated-diagram="service"] img').evaluate(el=>Math.abs(el.width/el.height-el.naturalWidth/el.naturalHeight)<.03));}
await p.screenshot({path:'qa-output/generated-qe-mobile.png'});check('런타임 오류 없음',errors.length===0);
}finally{fs.writeFileSync('qa-output/generated-visuals-browser.json',JSON.stringify({base,tests,errors},null,2));await browser.close()}
console.log(JSON.stringify({checks:tests.length,passed:tests.filter(t=>t.pass).length,errors}));
})().catch(e=>{console.error(e);process.exitCode=1});
