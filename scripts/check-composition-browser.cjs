const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),composition=require('../src/proposal-composition.cjs'),r=require('../src/revision47.cjs'),{departments}=require('../src/data.json');
const base=process.env.SITE_BASE||'http://127.0.0.1:8773/TS-business-Plan-001/';
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true}),p=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),tests=[],errors=[];p.on('pageerror',e=>errors.push(e.message));const check=(name,v)=>{tests.push({name,pass:!!v});assert(v,name)};fs.mkdirSync('qa-output',{recursive:true});
try{
for(const d of departments){const current=r.get(d.code);await p.goto(base+d.folder+'/01_사업정의.html');await p.locator('[data-revision-department]').waitFor();
await p.locator('.diagram-history').evaluateAll(es=>es.forEach(el=>{el.open=true}));
check('이전6장 구조 '+d.code,(await p.locator('.r47-part>header h2').allTextContents()).join('|')===composition.chapters.map(c=>c.title).join('|'));
check('14개 설명구획 '+d.code,await p.locator('.r47-detail-block').count()===14);
check('설계4개·검수4개 구획 '+d.code,await p.locator('.a47-subsection').count()===4&&await p.locator('.d47-subsection').count()===4);
check('전체도→상세모듈 순서 '+d.code,await p.evaluate(()=>!!(document.querySelector('#section-r47-block-overall').compareDocumentPosition(document.querySelector('[data-advanced-department]'))&Node.DOCUMENT_POSITION_FOLLOWING)));
const text=await p.locator('[data-revision-department]').innerText();
check('최신업무·공개근거 보존 '+d.code,text.includes(current.title)&&text.includes(current.detail.unit)&&current.facts.every(f=>text.includes(f.text)));
check('단계·입출력·지표 보존 '+d.code,current.detail.steps.flat().every(t=>text.includes(t))&&current.detail.metrics.flat().every(t=>text.includes(t)));
check('가로이탈없음 '+d.code,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
}
const path=departments.find(x=>x.code==='MR').folder+'/01_사업정의.html';
await p.goto(base+path+'#section-detail-overall');await p.waitForFunction(()=>document.activeElement?.closest('#section-r47-block-overall'));
check('옛상세 링크 최신전체도로 연결',!(await p.locator('.r47-legacy').evaluate(el=>el.open)));
await p.screenshot({path:'qa-output/composition-architecture-desktop.png'});
await p.reload();await p.waitForFunction(()=>document.activeElement?.closest('#section-r47-block-overall'));check('직접링크새로고침',true);
await p.goto(base+path+'#section-r47-block-products');await p.waitForFunction(()=>document.activeElement?.closest('#section-r47-block-products'));check('신규소제목주소복구',true);
await p.goto(base+path+'?history=20260924#section-detail-sixw');await p.locator('.r47-legacy[open]').waitFor();check('옛원문명시적열람',await p.locator('#section-detail-sixw').isVisible());
await p.goto(base+path);await p.locator('[data-revision-department]').waitFor();await p.locator('#section-r47-context').scrollIntoViewIfNeeded();await p.screenshot({path:'qa-output/composition-desktop.png'});
await p.locator('.r47-hero nav a').nth(3).click();check('6장목차이동',p.url().endsWith('#section-r47-design'));
await p.locator('.a47-example-controls').first().evaluate(el=>{for(let parent=el.parentElement;parent;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true});
await p.locator('.a47-example-controls button').nth(1).click();check('상태예시동작',await p.locator('.a47-example-controls button').nth(1).getAttribute('aria-pressed')==='true');
await p.locator('.d47-metric-link').first().click();check('요구에서측정앵커이동',p.url().includes('#r47-MR-R'));
for(const width of [1000,768,390]){await p.setViewportSize({width,height:900});await p.goto(base+path+'#section-r47-block-products');await p.locator('#section-r47-block-products').waitFor();check('모바일넘침없음 '+width,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));check('모바일열제목보존 '+width,await p.locator('#section-r47-block-products td').first().evaluate(el=>!!el.dataset.label&&getComputedStyle(el,':before').content.includes(el.dataset.label)));}
await p.screenshot({path:'qa-output/composition-mobile.png'});
for(let i=0;i<8;i++){await p.goto(base+path+'#section-detail-'+(i%2?'privacy':'overall'));await p.waitForFunction(()=>location.hash.startsWith('#section-r47-'));await p.waitForTimeout(500);check('빠른 구앵커 전환·이력접힘 '+i,!(await p.locator('.r47-legacy').evaluate(el=>el.open)));}
check('브라우저오류없음',errors.length===0);
}finally{fs.writeFileSync('qa-output/composition-browser.json',JSON.stringify({base,tests,errors},null,2));await browser.close()}
console.log(JSON.stringify({checks:tests.length,passed:tests.filter(t=>t.pass).length,errors}));
})().catch(e=>{console.error(e);process.exitCode=1});
