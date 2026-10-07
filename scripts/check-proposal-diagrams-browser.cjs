const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const d=require('../src/proposal-e2e-diagrams.cjs'),m=require('../src/proposal-diagram-assets.json'),reading=require('../src/integrated-reading.cjs'),departments=require('../src/data.json').departments;
const base=process.env.SITE_BASE||'http://127.0.0.1:8774/TS-business-Plan-001/';
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true}),page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),checks=[],errors=[];
const check=(name,pass)=>{checks.push({name,pass:!!pass});assert(pass,name)};page.on('pageerror',e=>errors.push(e.message));
const headingClear=id=>page.evaluate(id=>{const h=document.getElementById(id)?.querySelector('h4'),chrome=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ts-chrome-height'))||0;return !!h&&h.getBoundingClientRect().top>=chrome-2&&h.getBoundingClientRect().top<innerHeight},id);
const locations=reading.rows.flatMap(row=>row.projects.map(p=>({id:p.id,key:row.key}))).filter(r=>d.byId[r.id]);
fs.mkdirSync('qa-output',{recursive:true});
try{check('42개 과제 실제 URL',locations.length===42);
for(const loc of locations){const p=d.byId[loc.id];await page.goto(base+'index.html?dept='+encodeURIComponent(loc.key)+'&project='+loc.id+'#diagram-'+loc.id+'-overall');const suite=page.locator('[data-diagram-suite="'+loc.id+'"]');await suite.waitFor();
 check(loc.id+' 신규 4종 도식',await suite.locator('[data-proposal-diagram]').count()===4&&await suite.locator('figure img').count()===4);
 check(loc.id+' E2E 9단계',await suite.locator('table').first().locator('tbody tr').count()===9);
 check(loc.id+' 단일 h1',await page.locator('h1').count()===1);
 await page.waitForFunction(id=>document.getElementById(id)?.contains(document.activeElement),'diagram-'+loc.id+'-overall');check(loc.id+' 직접주소 제목 헤더 가림 없음',await headingClear('diagram-'+loc.id+'-overall'));
 for(const type of d.types){const a=m.assets.find(a=>a.id===loc.id&&a.type===type),figure=suite.locator('[data-proposal-diagram="'+type+'"]'),img=figure.locator('img');await img.scrollIntoViewIfNeeded();await img.evaluate(el=>{el.loading='eager';return el.decode()});
 check(loc.id+'/'+type+' 원본 로딩',await img.evaluate((el,a)=>el.complete&&el.naturalWidth===a.width&&el.naturalHeight===a.height&&el.src.endsWith(a.path),a));
 check(loc.id+'/'+type+' 설명·확대',!!await img.getAttribute('alt')&&(await figure.locator('figure a').first().getAttribute('href')).endsWith(a.path));
 }
 check(loc.id+' 가로 넘침 없음',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
 check(loc.id+' ID 중복 없음',await page.locator('[id]').evaluateAll(es=>new Set(es.map(e=>e.id)).size===es.length));
}
const mr=locations.find(x=>x.id==='MR-02');await page.goto(base+'index.html?dept='+mr.key+'&project=MR-02#diagram-MR-02-service');await page.locator('#diagram-MR-02-service').waitFor();
await page.waitForFunction(()=>document.getElementById('diagram-MR-02-service')?.contains(document.activeElement));check('DRT 새 직접주소 초점',true);
for(const width of [768,390]){await page.setViewportSize({width,height:900});for(const type of d.types){const img=page.locator('#diagram-MR-02-'+type+' img');await img.scrollIntoViewIfNeeded();check('DRT 모바일 넘침 없음 '+width+'/'+type,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));check('DRT 모바일 비율 '+width+'/'+type,await img.evaluate(el=>Math.abs(el.width/el.height-el.naturalWidth/el.naturalHeight)<.03));}await page.screenshot({path:'qa-output/proposal-diagrams-DRT-'+width+'.png'});}
await page.setViewportSize({width:1440,height:1000});
const direct=[{route:departments.find(x=>x.code==='MR').folder+'/01_사업정의.html',id:'MR-01'},{route:'drt-assurance.html',id:'MR-02'},{route:'proposal-links.html?unit=accounting',id:'EX11-01'}];
// 회계 상세의 실제 unit은 조사 원장에서 찾음.
const supplement=require('../src/proposal-links.cjs'),intent=require('../src/proposal-intent.cjs');direct[2].route='proposal-links.html?unit='+supplement.profiles.find(p=>intent.forProfile(p.id)?.id==='EX11-01').id;
for(const x of direct){await page.goto(base+x.route+'#diagram-'+x.id+'-data');await page.locator('#diagram-'+x.id+'-data').waitFor();await page.waitForFunction(id=>document.getElementById(id)?.contains(document.activeElement),'diagram-'+x.id+'-data');check(x.id+' 단독 URL 초점',true);await page.locator('[data-diagram-suite] nav a[href="#diagram-'+x.id+'-service"]').click();await page.waitForFunction(id=>document.getElementById(id)?.contains(document.activeElement),'diagram-'+x.id+'-service');check(x.id+' 목차 클릭 초점',true);await page.goBack();await page.waitForFunction(id=>document.getElementById(id)?.contains(document.activeElement),'diagram-'+x.id+'-data');check(x.id+' 뒤로 복귀',true);}
const link=page.locator('#diagram-EX11-01-data .proposal-diagram-image');await link.focus();check('원본 확대 키보드 초점',await link.evaluate(el=>el===document.activeElement));const popupPromise=page.waitForEvent('popup');await link.press('Enter');const popup=await popupPromise;await popup.waitForLoadState();check('원본 이미지 새 탭',popup.url().endsWith('EX11-01_data_v1.png'));await popup.close();
 await page.screenshot({path:'qa-output/proposal-diagrams-accounting-desktop.png'});
const first=locations.find(x=>x.id==='MR-01');
for(const width of [1440,390]){await page.setViewportSize({width,height:900});await page.goto(base+'index.html?dept='+first.key+'&project=MR-01#diagram-MR-01-data');await page.waitForFunction(()=>document.getElementById('diagram-MR-01-data')?.contains(document.activeElement));check('직접주소 제목 가림 없음 '+width,await headingClear('diagram-MR-01-data'));await page.locator('[data-diagram-suite="MR-01"] nav a[href="#diagram-MR-01-service"]').click();await page.waitForFunction(()=>document.getElementById('diagram-MR-01-service')?.contains(document.activeElement));check('목차 제목 가림 없음 '+width,await headingClear('diagram-MR-01-service'));}
await page.setViewportSize({width:1440,height:1000});const pattern='**/MR-01_overall_v1.png*';let aborts=0;const abortImage=route=>{aborts++;return route.abort('failed')};await page.route(pattern,abortImage);const failedRequest=page.waitForEvent('requestfailed',{predicate:r=>r.url().includes('/MR-01_overall_v1.png')});
await page.goto(base+'index.html?dept='+first.key+'&project=MR-01#diagram-MR-01-overall');await page.reload({waitUntil:'domcontentloaded'});const errorFigure=page.locator('#diagram-MR-01-overall');await errorFigure.locator('img').waitFor({state:'attached'});await errorFigure.locator('img').evaluate(el=>{el.loading='eager'});await failedRequest;await errorFigure.getByRole('alert').waitFor();check('실제 이미지 요청 실패 주입',aborts>0);check('이미지 실패 안내·원본·텍스트 보존',await errorFigure.locator('.diagram-image-error a').count()===1&&await errorFigure.locator('table').count()===1);
await page.unroute(pattern,abortImage);const retryButton=errorFigure.getByRole('button',{name:'이미지 다시 불러오기'});await retryButton.focus();await retryButton.press('Enter');await page.waitForFunction(()=>{const img=document.querySelector('#diagram-MR-01-overall img');return img?.complete&&img.naturalWidth>1000});check('이미지 재시도 복구',await errorFigure.getByRole('alert').count()===0);await page.waitForFunction(()=>document.querySelector('#diagram-MR-01-overall .proposal-diagram-image')===document.activeElement);check('재시도 후 확대 링크 포커스',true);check('브라우저 오류 없음',errors.length===0);
}finally{fs.writeFileSync('qa-output/proposal-diagrams-browser.json',JSON.stringify({base,checks,errors},null,2));await browser.close()}
console.log(JSON.stringify({checks:checks.length,passed:checks.filter(x=>x.pass).length,errors}));
})().catch(e=>{console.error(e);process.exitCode=1});
