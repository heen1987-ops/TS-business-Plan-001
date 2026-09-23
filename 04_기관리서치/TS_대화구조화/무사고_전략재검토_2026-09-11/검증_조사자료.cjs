const fs=require('node:fs/promises');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/김희섭/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
  const dir=__dirname, out=path.join(dir,'검증');
  await fs.mkdir(out,{recursive:true});
  const browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(pathToFileURL(path.join(dir,'TS_무사고_전략과_CCK_사업재검토.html')).href);
  const links=await page.locator('a[href]').evaluateAll(els=>els.map(e=>e.getAttribute('href')));
  const bad=[];
  for(const link of links){
    if(link.startsWith('https://'))continue;
    if(link.startsWith('#')){if(!await page.locator(link).count())bad.push(link);continue;}
    try{await fs.access(path.resolve(dir,decodeURIComponent(link.split('#')[0])));}catch{bad.push(link);}
  }
  const desktopOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  await page.screenshot({path:path.join(out,'화면_데스크톱.png')});
  await page.keyboard.press('Tab');
  const skipFocus=await page.locator('.skip').evaluate(e=>e===document.activeElement);
  await page.keyboard.press('Enter');
  await page.locator('a[href="#s3"]').click();
  const candidateHeading=await page.locator('#s3').boundingBox();
  await page.screenshot({path:path.join(out,'화면_후보검토.png')});
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo(0,0));
  const mobileOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  await page.screenshot({path:path.join(out,'화면_모바일.png')});
  await page.locator('.table-wrap').first().focus();
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(300);
  const tableKeyboardScroll=await page.locator('.table-wrap').first().evaluate(e=>e.scrollLeft>0);
  const report={localAndAnchorLinks:links.filter(x=>!x.startsWith('https://')).length,bad,desktopOverflow,mobileOverflow,skipFocus,tableKeyboardScroll,candidateAnchorVisible:!!candidateHeading&&candidateHeading.y>=0&&candidateHeading.y<1000,errors,limits:'구조·링크·기본 키보드·반응형 검사. 전체 WCAG 적합성 또는 스크린리더 검증 아님'};
  await fs.writeFile(path.join(out,'검증결과.json'),JSON.stringify(report,null,2));
  await browser.close();
  if(bad.length||desktopOverflow||mobileOverflow||!skipFocus||!tableKeyboardScroll||errors.length)throw new Error(JSON.stringify(report));
  console.log(JSON.stringify(report));
})();
