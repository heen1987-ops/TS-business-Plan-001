'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const d=require('../src/ts-ax-portfolio-2027.cjs');
const base=process.env.SITE_BASE||'http://127.0.0.1:8874/TS-business-Plan-001/',output=process.env.QA_OUTPUT||'.';
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true}),page=await browser.newPage({viewport:{width:1440,height:1080}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
try {
 await page.goto(base+'index.html?view=strategy');await page.locator('.ux-task-card').first().waitFor();
 await page.evaluate(()=>{window.__axpSidebar=document.getElementById('workspace-sidebar');window.__axpPage='keep';});
 assert.equal(await page.locator('.ux-task-card').count(),12);assert.equal(await page.locator('.axp-overview').count(),1);assert.equal(await page.locator('.axp-common-links a').count(),6);
 await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:path.join(output,'portfolio-home.png'),fullPage:true});
 await page.getByLabel('추진 단계',{exact:true}).selectOption('P1');assert.equal(await page.locator('.ux-task-card').count(),4);
 await page.getByLabel('추진 단계',{exact:true}).selectOption('P2');assert.equal(await page.locator('.ux-task-card').count(),5);
 await page.getByLabel('추진 단계',{exact:true}).selectOption('P3');assert.equal(await page.locator('.ux-task-card').count(),2);
 await page.getByLabel('추진 단계',{exact:true}).selectOption('');
 await page.getByRole('searchbox').fill('없는-솔루션');assert.equal(await page.locator('.ux-task-card').count(),0);await page.getByRole('searchbox').fill('');
 for(const p of d.plans){
  await page.locator('.ux-task-card[href*="'+p.id+'"]').click();await page.locator('.axp-detail[data-strategy="'+p.id+'"]').waitFor();
  assert.equal(await page.locator('.axp-detail').count(),1);const text=await page.locator('.axp-detail').innerText();assert.ok(text.includes(p.name)&&text.includes(p.reason)&&text.includes(p.effect)&&text.includes(p.metric));assert.equal(await page.locator('.axp-case-grid>article').count(),p.cases.length);
  if(p.id==='ST-04'){assert.equal(await page.locator('.axp-layers>div').count(),3);assert.equal(await page.locator('.axp-common-grid>section').count(),6);await page.locator('.axp-example>summary').click();assert.ok((await page.locator('.axp-example').innerText()).includes(d.missingExample.response));}
  else{assert.ok(text.includes(p.output)&&text.includes(p.pass)&&text.includes(p.metric));}
  assert.ok(await page.evaluate(()=>window.__axpSidebar===document.getElementById('workspace-sidebar')&&window.__axpPage==='keep'));
  await page.locator('.ux-back').first().click();await page.locator('.ux-task-card').first().waitFor();
 }
 await page.locator('.ux-task-card[href*="ST-10"]').click();await page.locator('.axp-detail').waitFor();
 await page.locator('#task-solution').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(output,'portfolio-detail.png')});
 const style=await page.locator('.axp-compare p').first().evaluate(el=>({font:getComputedStyle(el).fontFamily,size:getComputedStyle(el).fontSize}));assert.ok(style.font.includes('Pretendard'));assert.equal(style.size,'15px');
 await page.locator('.axp-case-grid a').first().click();await page.locator('#benchmark-detail').waitFor();assert.ok(await page.evaluate(()=>window.__axpSidebar===document.getElementById('workspace-sidebar')));
 await page.locator('.bm-strategies a[href*="ST-10"]').click();await page.locator('.axp-detail[data-strategy="ST-10"]').waitFor();
 const menu=page.getByRole('navigation',{name:'주 메뉴'});
 for(const name of ['플랫폼 사례집','전략과제 사례집']){
  await menu.getByRole('link',{name,exact:true}).click();await page.getByRole('button',{name:/^종합 시사점/}).click();
  await page.locator('.axp-synthesis').waitFor();assert.equal(await page.locator('.axp-plan-list>a').count(),12);assert.equal(await page.locator('.axp-findings>article').count(),6);assert.equal(await page.locator('.axp-legacy[open]').count(),0);
  assert.ok(await page.evaluate(()=>window.__axpSidebar===document.getElementById('workspace-sidebar')));
 }
 await page.getByRole('button',{name:'12대 전략 매핑',exact:true}).click();await page.locator('.axp-detail').waitFor();assert.equal(await page.locator('.axp-detail').count(),1);
 for(const p of d.plans){await page.locator('.ax-strategy-picker button').filter({hasText:p.id}).click();await page.locator('.axp-detail[data-strategy="'+p.id+'"]').waitFor();}
 for(const suffix of ['md','csv','json']){const r=await page.request.get(base+'downloads/ts-ax-portfolio-2027.'+suffix);assert.equal(r.status(),200);assert.ok((await r.body()).length>1000);}
 const json=await (await page.request.get(base+'downloads/ts-ax-portfolio-2027.json')).json();assert.equal(json.plans.length,12);assert.equal(json.caseCoverage.length,100);
 await page.setViewportSize({width:390,height:844});for(const route of ['index.html?view=strategy','index.html?view=strategy&strategy=ST-04','index.html?view=strategy&strategy=ST-08','index.html?view=platform-cases&tab=insights']){await page.goto(base+route);await page.locator('.on-page').first().waitFor();await page.evaluate(()=>document.fonts.ready);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'모바일 넘침 '+route);}
 await page.screenshot({path:path.join(output,'portfolio-mobile.png'),fullPage:true});assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(output,'portfolio-browser-qa.json'),JSON.stringify({result:'pass',base,strategies:12,cases:100,checks:['12과제 전수·순증·검수·효과','P1/P2/P3 필터','검색·빈 결과','기관/부서/업무건 3계층','누락자료 요청 예시','사례→전략 왕복','좌측 메뉴 DOM 유지','사례집 종합·단일 본문','다운로드 3종','Pretendard 15px','모바일 4경로'],style,errors,checked:new Date().toISOString()},null,2));console.log('브라우저 통과: 12과제·100근거·공통6과업·필터·사례왕복·좌측유지·모바일·다운로드');
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
