'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const data=require('../src/benchmark-100.cjs');
const base=process.env.SITE_BASE||'http://127.0.0.1:8873/TS-business-Plan-001/';
const output=process.env.QA_OUTPUT||'.';
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(base+'index.html?view=platform-cases&case=PF-R01');await page.locator('#benchmark-detail').waitFor();
  await page.evaluate(()=>window.__sidebar=document.getElementById('workspace-sidebar'));
  await page.getByLabel('사례 범위',{exact:true}).selectOption('all');
  assert.equal(await page.locator('.bm-reader .ax-list button').count(),100);
  for(const row of data.cases){await page.locator('.bm-reader .ax-list button').filter({hasText:row.id+' ·'}).click();assert.ok((await page.locator('#benchmark-detail > header').innerText()).includes(row.title));assert.equal(await page.locator('#benchmark-detail h3').filter({hasText:/0[1-4] ·/}).count(),4);assert.equal(await page.locator('.bm-flow>li').count(),row.flow.length);}
  await page.getByLabel('12대 전략',{exact:true}).selectOption('ST-01');assert.equal(await page.locator('.bm-reader .ax-list button').count(),data.coverage.find(s=>s.id==='ST-01').ids.length);
  await page.getByLabel('12대 전략',{exact:true}).selectOption('all');
  await page.getByLabel('사례·기관·TS 부서 검색',{exact:true}).fill('OneService');assert.equal(await page.locator('.bm-reader .ax-list button').count(),1);
  await page.getByLabel('사례·기관·TS 부서 검색',{exact:true}).fill('없음-결과-0');assert.equal(await page.locator('#benchmark-detail').count(),0);
  await page.getByLabel('사례·기관·TS 부서 검색',{exact:true}).fill('');
  await page.locator('.bm-reader .ax-list button').filter({hasText:'BM-001 ·'}).click();
  await page.locator('.bm-original>summary').click();await page.locator('.bm-original .case-source-figure img').waitFor();await page.locator('.bm-original .case-source-figure img').evaluate(img=>img.decode());
  await page.locator('.bm-original .case-source-figure .case-figure-expand').click();assert.equal(await page.locator('dialog[open]').count(),1);await page.locator('dialog[open]').getByRole('button',{name:'확대 보기 닫기'}).click();
  await page.locator('.bm-original>summary').click();await page.evaluate(()=>document.fonts.ready);
  const style=await page.locator('.bm-detail p').first().evaluate(el=>({font:getComputedStyle(el).fontFamily,size:getComputedStyle(el).fontSize}));assert.ok(style.font.includes('Pretendard'));assert.equal(style.size,'15px');
  await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(output,'benchmark-desktop.png')});
  await page.getByRole('navigation',{name:'주 메뉴'}).getByRole('link',{name:'전략과제 사례집',exact:true}).click();await page.locator('#benchmark-detail').waitFor();
  assert.ok(await page.evaluate(()=>window.__sidebar===document.getElementById('workspace-sidebar')),'좌측 메뉴 DOM 유지');
  await page.getByRole('button',{name:'12대 전략 매핑',exact:true}).click();await page.locator('.bm-related-grid').waitFor();assert.ok(await page.locator('.bm-related-grid a').count()>0);
  await page.locator('.bm-related-grid a').first().click();await page.locator('#benchmark-detail').waitFor();assert.ok(await page.evaluate(()=>window.__sidebar===document.getElementById('workspace-sidebar')));
  for(const suffix of ['md','csv','json']){const response=await page.request.get(base+'downloads/ts-benchmark-100.'+suffix);assert.equal(response.status(),200);assert.ok((await response.body()).length>10000);}
  await page.setViewportSize({width:390,height:844});await page.goto(base+'index.html?view=casebook&case=BM-101');await page.locator('#benchmark-detail').waitFor();await page.evaluate(()=>document.fonts.ready);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'모바일 가로 넘침');await page.screenshot({path:path.join(output,'benchmark-mobile.png')});
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'benchmark-browser-qa.json'),JSON.stringify({result:'pass',base,cases:100,checks:['전수 본문 표시','검색·빈 결과','전략 필터','원문 이미지·확대','좌측 메뉴 유지','전략 연결','내려받기','Pretendard 15px','모바일 가로 넘침'],style,errors,checked:new Date().toISOString()},null,2));console.log('브라우저 통과: 100건 전수 표시·필터·도면·공통 UI·전략·다운로드');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
