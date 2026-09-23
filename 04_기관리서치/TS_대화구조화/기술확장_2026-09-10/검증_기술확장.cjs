const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const {chromium}=require(require.resolve('playwright',{paths:['C:/Users/김희섭/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules']}));
const base=__dirname,out=path.join(base,'검증'),name='CCK_TS_기술기반_확장검토';
fs.mkdirSync(out,{recursive:true});
const data=JSON.parse(fs.readFileSync(path.join(base,'기술확장_내용.json'),'utf8')),md=fs.readFileSync(path.join(base,name+'.md'),'utf8');
const checks=[];function check(name,ok,detail){checks.push({name,pass:!!ok,detail});}
(async()=>{
const browser=await chromium.launch({headless:true,channel:'msedge'});
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage(),external=[],errors=[];
 page.on('request',r=>{if(/^https?:/.test(r.url()))external.push(r.url())});page.on('pageerror',e=>errors.push(e.message));
 const url=pathToFileURL(path.join(base,name+'.html')).href;
 await page.goto(url);await page.evaluate(()=>document.fonts.ready);
 check('한국어 문서·하나의 제목·본문',await page.locator('html').getAttribute('lang')==='ko'&&await page.locator('h1').count()===1&&await page.locator('main').count()===1);
 check('HTML 내장 Markdown과 편집 문서 일치',await page.locator('#md-data').evaluate(el=>JSON.parse(el.textContent))===md);
 check('5개 사업군·2개 보조 기능·9개 출처',await page.locator('.family').count()===5&&data.modules.length===2&&await page.locator('.source').count()===9);
 check('기술 자산을 실행 검증으로 승격하지 않음',md.includes('검증된 기존 자산 A0로 판정하지 않았다')&&md.includes('TA-23')&&md.includes('계획 단계'));
 for(const f of data.families){check(f.id+' 근거·기술·추가 개발·납품·비AI·실패 경계 포함',['evidence','mechanism','reuse','build','dependency','deliver','nonai','metric','fail','overlap'].every(k=>f[k]&&md.includes(f[k])));}
 check('출처 링크의 근거와 한계 포함',data.sources.every(s=>md.includes(s.url)&&md.includes(s.limit)));
 const ids=await page.locator('[id]').evaluateAll(es=>es.map(el=>el.id));
 check('DOM ID 중복 없음',new Set(ids).size===ids.length);
 const anchors=await page.locator('a[href^="#"]').evaluateAll(es=>es.map(el=>el.hash.slice(1)));
 check('목차 앵커 유효',anchors.every(x=>ids.includes(x)));
 const localLinks=await page.locator('a:not([href^="#"]):not([href^="http"])').evaluateAll(es=>es.map(el=>el.getAttribute('href')));
 check('로컬 파일 링크 유효',localLinks.every(h=>fs.existsSync(path.resolve(base,h.split('#')[0]))));
 for(let i=0;i<3;i++){
  await page.locator('#integration').selectOption(String(i));
  check('연계 수준 '+i+'의 5개 납품 범위와 상태',await page.locator('.mode:visible').count()===1&&await page.locator(`.mode[data-mode="${i}"] tbody tr`).count()===5&&(await page.locator(`.mode[data-mode="${i}"]`).textContent()).includes(data.families[0].modes[i]));
 }
 await page.locator('#integration').selectOption('0');await page.locator('#integration').focus();await page.keyboard.press('ArrowDown');
 check('키보드로 연계 수준 변경',await page.locator('#integration').inputValue()==='1');
 await page.locator('.family details summary').first().focus();await page.keyboard.press('Enter');
 check('기술 상세 키보드 펼침',await page.locator('.family details').first().getAttribute('open')!==null);
 await page.goto(url);await page.screenshot({path:path.join(out,'01_데스크톱.png')});
 await page.locator('#X04').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,'02_시정조치.png')});
 for(const width of [768,390,320]){
  await page.setViewportSize({width,height:900});await page.goto(url);
  check(width+'px 본문 가로 넘침 없음',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.locator('#integration').selectOption('2');check(width+'px 연계 선택 가능',await page.locator('.mode[data-mode="2"]').isVisible());
  if(width===390){await page.goto(url);await page.screenshot({path:path.join(out,'03_모바일.png')});await page.locator('#dependencies').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,'04_모바일_연계.png')});}
 }
 await page.setViewportSize({width:1440,height:1000});await page.goto(url);await page.evaluate(()=>document.body.style.zoom='2');
 check('200% 확대 가로 넘침 없음',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.evaluate(()=>document.body.style.zoom='1');
 const opened=await page.locator('details[open]').count();await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));await page.emulateMedia({media:'print'});
 check('인쇄에서 모든 상세와 연계 수준 표시',await page.locator('details[open]').count()===5&&await page.locator('.mode:visible').count()===3);
 await page.emulateMedia({media:'screen'});await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
 check('인쇄 후 펼침 상태 복원',await page.locator('details[open]').count()===opened);
 const nj=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}}),np=await nj.newPage();await np.goto(url);
 check('JavaScript 없이 연계 3종·본문 열람',await np.locator('.mode:visible').count()===3&&await np.locator('.family').count()===5&&!(await np.locator('#integration').isVisible()));
 await np.locator('summary').first().click();check('JavaScript 없이 상세 펼침',await np.locator('details').first().getAttribute('open')!==null);await nj.close();
 check('외부 HTTP 요청 0건',external.length===0,external);check('JavaScript 오류 0건',errors.length===0,errors);
 fs.writeFileSync(path.join(out,'검증결과.json'),JSON.stringify({testedAt:new Date().toISOString(),checks,limitations:['실제 CCK·로컬 LLM·업무 API 미시험','독립 평가·실제 사용자·스크린리더·WCAG 전체 검증 미수행']},null,2));
 const failed=checks.filter(x=>!x.pass);console.log(JSON.stringify({passed:checks.length-failed.length,total:checks.length,failed},null,2));if(failed.length)process.exitCode=1;
}finally{await browser.close();}
})();
