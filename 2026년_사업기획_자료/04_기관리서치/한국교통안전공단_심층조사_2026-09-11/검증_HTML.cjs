const {chromium}=require('C:/Users/김희섭/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path');
const {pathToFileURL,fileURLToPath}=require('url');
const base=__dirname,qa=path.join(base,'검증');fs.mkdirSync(qa,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const checks=[];const check=(name,pass,details)=>checks.push({name,pass,details});
 const target=pathToFileURL(path.join(base,'한국교통안전공단_심층조사.html')).href;
 await page.goto(target);await page.waitForLoadState('load');
 check('문서 언어',await page.locator('html').getAttribute('lang')==='ko');
 check('제목 1개',await page.locator('h1').count()===1);
 check('본문 12개 장과 출처',await page.locator('main h2').count()===13);
 check('출처 41개',await page.locator('ol.sources>li').count()===41);
 check('외부 스크립트·스타일 없음',await page.locator('script[src],link[rel=stylesheet]').count()===0);
 const badAnchors=await page.locator('a[href^="#"]').evaluateAll(els=>els.filter(e=>!document.getElementById(e.getAttribute('href').slice(1))).map(e=>e.getAttribute('href')));
 check('모든 내부 앵커 연결',badAnchors.length===0,badAnchors);
 const ids=await page.locator('[id]').evaluateAll(els=>els.map(e=>e.id));check('중복 ID 없음',new Set(ids).size===ids.length);
 const localLinks=await page.locator('a').evaluateAll(els=>els.map(e=>e.getAttribute('href')).filter(x=>!x.startsWith('http')&&!x.startsWith('#')));
 const broken=localLinks.filter(x=>!fs.existsSync(fileURLToPath(new URL(x,target))));check('로컬 문서 연결',broken.length===0,broken);
 const texts=await page.locator('main').innerText();
 check('자리표시·깨진 인용 없음',!/(turn\d+(search|view)|\[\^\d|\uFFFD|TODO|TBD)/.test(texts));
 check('예산의 조건 표시',texts.includes('신규 인프라')&&texts.includes('목표 상한 검토안')&&texts.includes('승인 예산·계약금액·공급사 견적이 아니'));
 check('데이터주권·두 적용축 유지',texts.includes('데이터 주권은 공통 기반')&&texts.includes('국민서비스 처리 지원'));
 check('사업 확정·제품 시험과 구별',texts.includes('제품의 납품')||texts.includes('납품 성능')||texts.includes('제품 실증'));
 await page.keyboard.press('Tab');check('키보드 첫 이동은 본문 바로가기',await page.locator(':focus').getAttribute('class')==='skip');
 await page.keyboard.press('Enter');check('본문 바로가기 작동',await page.evaluate(()=>document.activeElement.id)==='main');
 await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(qa,'desktop.png')});
 await page.locator('nav a[href="#section-8"]').click();check('가설 장 목차 이동',(await page.evaluate(()=>location.hash))==='#section-8');
 await page.screenshot({path:path.join(qa,'hypotheses.png')});
 await page.locator('.cite').first().click();check('인용에서 출처 이동',(await page.evaluate(()=>location.hash))==='#source-1');
 await page.locator('#source-1 .back').click();check('출처에서 본문 복귀',(await page.evaluate(()=>location.hash))==='#cite-1-1');
 await page.evaluate(()=>{window.__printCalled=false;window.print=()=>window.__printCalled=true});await page.locator('#print').click();check('인쇄 버튼 연결',await page.evaluate(()=>window.__printCalled));
 for(const [name,width,height] of [['tablet',768,1024],['mobile',390,844]]){
  await page.setViewportSize({width,height});await page.goto(target);await page.waitForLoadState('load');
  check(name+' 본문 가로 넘침 없음',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  if(name==='mobile'){
   check('모바일 목차 접힘',!(await page.locator('details').getAttribute('open')));
   await page.locator('summary').click();check('모바일 목차 펼침',await page.locator('details').evaluate(e=>e.open));
   await page.locator('nav a[href="#section-6"]').click();check('모바일 목차 이동',(await page.evaluate(()=>location.hash))==='#section-6');
   await page.goto(target);await page.screenshot({path:path.join(qa,'mobile.png')});
   await page.locator('main table').first().scrollIntoViewIfNeeded();await page.screenshot({path:path.join(qa,'mobile-table.png')});
  }
 }
 check('페이지 스크립트 오류 없음',errors.length===0,errors);
 const result={checked_at:'2026-09-11',browser:'Microsoft Edge / Playwright headless',checks,passed:checks.filter(x=>x.pass).length,failed:checks.filter(x=>!x.pass).length,limitations:['실제 사용자 조사·스크린리더·WCAG 전체 적합성 인증 미수행','NOA 설치·LLM 실행·업무 API·부하 시험 미수행','외부 출처 접근은 조사 시점 도구·일부 원문 보존으로 확인; 모든 링크의 영속 접속 보장 아님']};
 fs.writeFileSync(path.join(qa,'구조_동작검증.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
 await browser.close();if(result.failed)process.exitCode=1;
})();
