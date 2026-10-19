'use strict';
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.SITE_BASE||'http://127.0.0.1:8769/TS-business-Plan-001/';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(base+'index.html?view=platform-cases&tab=insights');
  await page.locator('.case-atlas-row').first().waitFor();
  assert.equal(await page.locator('.case-atlas-row').count(),31);
  assert.equal(await page.locator('.case-synthesis-item').filter({hasText:'NOA 업무공간·문서·스킬'}).count(),1);
  await page.locator('.case-atlas-row').filter({hasText:'PF-R02'}).locator('summary').first().click();
  const figure=page.locator('.case-atlas-row').filter({hasText:'PF-R02'}).locator('.case-atlas-figure').first();
  await figure.locator('summary').click();
  const img=figure.locator('img');await img.evaluate(el=>el.decode());
  assert(await img.evaluate(el=>el.naturalWidth>0));
  assert(await page.getByRole('link',{name:'구조 분석 전문'}).count());
  await page.getByRole('button',{name:/조직 문맥·권한/}).click();
  assert.equal(await page.locator('.case-atlas-row').count(),12);
  await page.getByRole('button',{name:'전체 31'}).click();
  assert.equal(await page.locator('.case-atlas-row').count(),31);
  await page.getByRole('searchbox',{name:'사례 검색'}).fill('PF-A12');
  assert.equal(await page.locator('.case-atlas-row').count(),1);
  assert(await page.locator('.case-atlas-row').first().innerText().then(t=>t.includes('GOV.UK Chat')));
  await page.getByRole('searchbox',{name:'사례 검색'}).clear();
  await page.getByRole('navigation',{name:'주 메뉴'}).getByRole('link',{name:'전략과제 사례집',exact:true}).click();
  await page.getByRole('button',{name:'종합 시사점',exact:true}).click();
  assert.equal(await page.locator('.case-atlas-row').count(),26);
  assert.equal(await page.locator('.case-synthesis-strategies>a').count(),12);
  assert(await page.locator('#workspace-sidebar').count());
  assert(new URL(page.url()).pathname.endsWith('/index.html'));
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.locator('.case-atlas-row').count(),26);
  assert.deepEqual(errors,[]);
  console.log('아키텍처·병목 화면 검증 통과: 57건, 원문 그림, 유형·검색, 동일 페이지·모바일');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
