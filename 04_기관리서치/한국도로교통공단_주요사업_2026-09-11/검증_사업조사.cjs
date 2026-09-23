const fs=require('node:fs/promises'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/김희섭/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const b=__dirname,out=path.join(b,'검증');await fs.mkdir(out,{recursive:true});
 const book=JSON.parse(await fs.readFile(path.join(b,'주요사업_확인원장.json'),'utf8'));
 const manifest=JSON.parse(await fs.readFile(path.join(b,'공식메뉴_모집단.json'),'utf8'));
 if(book.items.length!==36||new Set(book.items.map(x=>x.url)).size!==36)throw Error('모집단 중복·개수');
 if(manifest.items.some(x=>!book.items.find(y=>x.id===y.id&&x.url===y.url)))throw Error('모집단 누락');
 if(book.additional_sources.some(x=>!(x.content_found||x.external_text_chars>0)))throw Error('하위 본문 없음');
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(pathToFileURL(path.join(b,'한국도로교통공단_주요사업_전체검토.html')).href);
 const links=await page.locator('a[href]').evaluateAll(els=>els.map(x=>x.getAttribute('href'))),bad=[];
 for(const link of links){
  if(/^https?:/.test(link))continue;
  if(link.startsWith('#')){if(!await page.locator(link).count())bad.push(link);continue;}
  try{await fs.access(path.resolve(b,decodeURIComponent(link.split('#')[0])));}catch{bad.push(link);}
 }
 await page.screenshot({path:path.join(out,'화면_데스크톱.png')});
 await page.keyboard.press('Tab');const skipFocus=await page.locator('.skip').evaluate(x=>x===document.activeElement);
 const counts={};
 for(const group of manifest.groups){await page.locator('#group').selectOption(group);counts[group]=await page.locator('#items details:visible').count();if(counts[group]!==book.items.filter(x=>x.group===group).length)throw Error('분야 필터 불일치');}
 await page.locator('#reset').click();await page.locator('#fit').selectOption('중복 확인 우선');
 const fitCount=await page.locator('#items details:visible').count();
 if(fitCount!==book.items.filter(x=>x.cck_category==='중복 확인 우선').length)throw Error('분류 필터 오류');
 await page.locator('#reset').click();await page.locator('#q').fill('존재하지않는항목123');
 const empty=await page.locator('#empty').isVisible();
 await page.locator('#reset').click();await page.locator('#q').fill('교통사고 조사');
 await page.locator('#items details:visible summary').first().click();
 const expand=await page.locator('#items details[open]').count()===1;
 await page.locator('#items details[open]').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,'화면_사업검토.png')});
 await page.locator('#collapse').click();const collapse=await page.locator('#items details[open]').count()===0;
 await page.locator('#reset').click();const reset=await page.locator('#items details:visible').count()===36;
 const desktopOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo(0,0));
 await page.screenshot({path:path.join(out,'화면_모바일.png')});
 const mobileOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
 const result={main:36,additional:28,counts,fitCount,bad,skipFocus,empty,expand,collapse,reset,desktopOverflow,mobileOverflow,errors,limits:'기본 화면·링크·분류·검색 검사. 전체 WCAG 또는 실제 포털 이용·업무 성능 검증 아님'};
 await fs.writeFile(path.join(out,'검증결과.json'),JSON.stringify(result,null,2));await browser.close();
 if(bad.length||!skipFocus||!empty||!expand||!collapse||!reset||desktopOverflow||mobileOverflow||errors.length)throw Error(JSON.stringify(result));
 console.log(JSON.stringify(result));
})();
