const assert=require('node:assert/strict'),fs=require('node:fs'),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const photos=require('../src/institution-media.json'),base=process.env.SITE_BASE||'http://127.0.0.1:8769/TS-business-Plan-001/';
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(30000);let checks=0;const check=(v,m)=>{assert(v,m);checks++};
for(const width of [1600,1280,768,390]){
 await page.setViewportSize({width,height:1000});await page.goto(base+'about.html');await page.locator('[data-source-photo]').first().waitFor();
 check(await page.locator('.document-section').count()===5,'5개 큰 장 유지 '+width);
 check(await page.locator('[data-source-photo]').count()===photos.length,'사진 수 '+width);
 for(const photo of photos){const el=page.locator('[data-source-photo="'+photo.id+'"]');await el.scrollIntoViewIfNeeded();await el.locator('img').evaluate(img=>img.decode());
 check(await el.locator('img').evaluate((img,p)=>img.naturalWidth===p.width&&img.naturalHeight===p.height,photo),'실제 원본 로드 '+width+photo.id);
 check(await el.locator('img').evaluate(img=>Math.abs(img.width/img.height-img.naturalWidth/img.naturalHeight)<.015),'비율 보존 '+width+photo.id);
 check(await el.locator('img').evaluate(img=>img.getBoundingClientRect().width<=img.naturalWidth+1),'과도한 확대 없음 '+width+photo.id);
 check((await el.innerText()).includes(photo.creator)&&(await el.innerText()).includes(photo.published),'출처 표시 '+photo.id);
 check(await el.locator('a[href="'+photo.articleUrl+'"]').count()===1,'기사 원문 링크 '+photo.id);
 check(await el.locator('a[href="'+photo.licenseUrl+'"]').count()===1,'이용조건 링크 '+photo.id);
 }check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'가로 넘침 없음 '+width);
 await page.locator('[data-source-photo]').first().scrollIntoViewIfNeeded();await page.screenshot({path:'qa-output/official-photos-'+width+'.jpg',quality:82});
}
await page.setViewportSize({width:1600,height:1100});await page.goto(base+'about.html');
const link=page.locator('.source-photo-original').first();await link.focus();const popupPromise=page.waitForEvent('popup');await page.keyboard.press('Enter');const popup=await popupPromise;await popup.waitForLoadState();
check(popup.url().endsWith(photos[0].src),'키보드 원본 사진 열기');await popup.close();
await page.route('**/assets/official/ts-schoolbus-inspection.jpg',r=>r.abort());await page.reload();await page.locator('[data-source-photo="ts-schoolbus-inspection"]').scrollIntoViewIfNeeded();
await page.locator('.source-photo-error').waitFor();check(await page.locator('.source-photo-error a').getAttribute('href')===photos[0].articleUrl,'실패 시 출처 기사 대체경로');
check((await page.locator('[data-source-photo="ts-schoolbus-inspection"]').innerText()).includes(photos[0].caption),'실패 시 설명 보존');
await page.unroute('**/assets/official/ts-schoolbus-inspection.jpg');await page.getByRole('button',{name:'사진 다시 불러오기',exact:true}).click();await page.locator('[data-source-photo="ts-schoolbus-inspection"] img').evaluate(img=>img.decode());check(true,'재시도 복구');check(await page.locator('[data-source-photo="ts-schoolbus-inspection"] .source-photo-original').evaluate(e=>e===document.activeElement),'재시도 후 원본 링크 포커스 유지');
await page.goto(base+'index.html');check(await page.locator('[data-source-photo]').count()===3,'홈 본문 사진 동일 적용');
check(errors.length===0,'자바스크립트 실행 오류');await browser.close();const result={result:'통과',checks,errors};fs.writeFileSync('qa-output/official-photos-browser.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));})().catch(e=>{console.error(e);process.exit(1)});
