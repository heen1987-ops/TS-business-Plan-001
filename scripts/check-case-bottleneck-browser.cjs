'use strict';
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.SITE_BASE||'http://127.0.0.1:8769/TS-business-Plan-001/';
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(base+'index.html?view=platform-cases&tab=insights');
  await page.locator('.case-audit-row').first().waitFor();
  assert.equal(await page.locator('.case-audit-row').count(),6);
  assert.equal(await page.locator('.case-synthesis-item').filter({hasText:'NOA 업무공간·문서·스킬'}).count(),1);
  await page.locator('.case-audit-row').filter({hasText:'B02 · PF-R02'}).locator('summary').first().click();
  const figure=page.locator('.case-audit-row').filter({hasText:'B02 · PF-R02'}).locator('.case-audit-figure');
  await figure.locator('summary').click();
  const img=figure.locator('img');await img.evaluate(el=>el.decode());
  assert(await img.evaluate(el=>el.naturalWidth>0));
  await page.getByRole('navigation',{name:'주 메뉴'}).getByRole('link',{name:'전략과제 사례집',exact:true}).click();
  await page.getByRole('button',{name:'종합 시사점',exact:true}).click();
  assert.equal(await page.locator('.case-audit-row').count(),5);
  assert.equal(await page.locator('.case-synthesis-strategies>a').count(),12);
  assert(await page.locator('#workspace-sidebar').count());
  assert(new URL(page.url()).pathname.endsWith('/index.html'));
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.locator('.case-audit-row').count(),5);
  assert.deepEqual(errors,[]);
  console.log('아키텍처·병목 화면 검증 통과: 11건, 원문 도식, 12개 기술 매핑, 동일 페이지·모바일');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
