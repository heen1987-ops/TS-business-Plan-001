const assert=require('node:assert/strict'),fs=require('node:fs'),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const figures=require('../src/institution-media.json'),base=process.env.SITE_BASE||'http://127.0.0.1:8769/TS-business-Plan-001/';
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(30000);let checks=0;const check=(v,m)=>{assert(v,m);checks++};
for(const width of [1600,1280,768,390]){
 await page.setViewportSize({width,height:1000});await page.goto(base+'about.html');await page.locator('[data-source-figure]').first().waitFor();
 check(await page.locator('.document-section').count()===5,'5개 큰 장 유지 '+width);
 check(await page.locator('[data-source-figure]').count()===figures.length,'공식 도표 수 '+width);
 check(await page.locator('[data-source-photo]').count()===0,'현장사진 제외 '+width);
 for(const figure of figures){const el=page.locator('[data-source-figure="'+figure.id+'"]');await el.scrollIntoViewIfNeeded();await el.locator('img').evaluate(img=>img.decode());
 check(await el.locator('img').evaluate((img,p)=>img.naturalWidth===p.width&&img.naturalHeight===p.height,figure),'실제 발췌본 로드 '+width+figure.id);
 check(await el.locator('img').evaluate(img=>Math.abs(img.width/img.height-img.naturalWidth/img.naturalHeight)<.015),'비율 보존 '+width+figure.id);
 check(await el.locator('img').evaluate(img=>img.getBoundingClientRect().width<=img.naturalWidth+1),'과도한 확대 없음 '+width+figure.id);
 const text=await el.innerText();check(text.includes(figure.creator)&&text.includes(figure.versionLabel)&&text.includes(figure.checked),'출처·판본 표시 '+figure.id);
 check(await el.locator('a[href="'+figure.sourceUrl+'"]').count()===1,'공식 원문 링크 '+figure.id);
 check(await el.locator('a[href="'+figure.licenseUrl+'"]').count()===1,'저작권 안내 링크 '+figure.id);
 check(await el.locator('.source-document-reading li').count()===figure.readingPoints.length,'도표 해설 '+figure.id);
 if(figure.textDescription){check(await el.locator('.source-document-taskgroups li').count()===14,'도표 14과제 텍스트 '+width);check(await el.locator('.source-document-original').getAttribute('aria-describedby')==='source-description-'+figure.id,'이미지 설명 연결 '+width);}
 if(width===1600)await el.screenshot({path:'qa-output/strategy-'+figure.id+'-desktop.jpg',quality:85});
 }check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'가로 넘침 없음 '+width);
 await page.locator('[data-source-figure]').first().scrollIntoViewIfNeeded();await page.screenshot({path:'qa-output/strategy-'+width+'.jpg',quality:82});
}
await page.setViewportSize({width:1600,height:1100});await page.goto(base+'about.html');
const link=page.locator('.source-document-original').first();await link.focus();const popupPromise=page.waitForEvent('popup');await page.keyboard.press('Enter');const popup=await popupPromise;await popup.waitForLoadState();
check(popup.url().endsWith(figures[0].src),'키보드 도표 확대 열기');await popup.close();
await page.route('**/assets/official/ts-strategy-2030.png',r=>r.abort());await page.reload();await page.locator('[data-source-figure="ts-strategy-2030"]').scrollIntoViewIfNeeded();
await page.locator('.source-document-error').waitFor();check(await page.locator('.source-document-error a').getAttribute('href')===figures[0].sourceUrl,'실패 시 원문 대체경로');
check((await page.locator('[data-source-figure="ts-strategy-2030"]').innerText()).includes(figures[0].caption),'실패 시 설명 보존');
await page.unroute('**/assets/official/ts-strategy-2030.png');await page.getByRole('button',{name:'도표 다시 불러오기',exact:true}).click();await page.locator('[data-source-figure="ts-strategy-2030"] img').evaluate(img=>img.decode());check(true,'재시도 복구');
check(await page.locator('[data-source-figure="ts-strategy-2030"] .source-document-original').evaluate(e=>e===document.activeElement),'재시도 포커스 유지');
check((await page.locator('[data-source-figure="ts-esg-strategy-2026"]').innerText()).includes('2029'),'ESG 목표연도 판본 차이');
await page.goto(base+'index.html');check(await page.locator('[data-source-figure]').count()===3,'홈 동일 적용');
check(errors.length===0,'자바스크립트 실행 오류');await browser.close();const result={result:'통과',checks,errors};fs.writeFileSync('qa-output/strategy-figures-browser.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));})().catch(e=>{console.error(e);process.exit(1)});
