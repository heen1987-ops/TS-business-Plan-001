const fs=require('node:fs/promises'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/김희섭/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const base=__dirname,out=path.join(base,'검증');await fs.mkdir(out,{recursive:true});
 const model=JSON.parse(await fs.readFile(path.join(base,'NOA_서비스_확장원장.json'),'utf8'));
 const prior=JSON.parse(await fs.readFile(path.join(base,'../주요사업_확인원장.json'),'utf8'));
 const checks=[];function check(name,pass){checks.push({name,pass});if(!pass)throw Error(name);}
 check('7개 서비스 고유 ID',model.services.length===7&&new Set(model.services.map(s=>s.id)).size===7);
 check('36개 주요사업 누락 없음',model.menu_mapping.length===36&&prior.items.every(x=>model.menu_mapping.some(y=>y.id===x.id)));
 check('기획 경계 보존',model.institution_id==='ORG-0002'&&model.infrastructure_budget===0);
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 const url=pathToFileURL(path.join(base,'CCK_NOA_KoROAD_서비스확장안.html')).href;
 await page.goto(url);
 const links=await page.locator('a[href]').evaluateAll(xs=>xs.map(x=>x.getAttribute('href'))),bad=[];
 for(const link of links){
  if(/^https?:/.test(link))continue;
  if(link.startsWith('#')){if(!await page.evaluate(id=>!!document.getElementById(decodeURIComponent(id)),link.slice(1)))bad.push(link);continue;}
  try{await fs.access(path.resolve(base,decodeURIComponent(link.split('#')[0])));}catch{bad.push(link);}
 }
 check('로컬 파일·문서 앵커 링크',bad.length===0);
 const dupIds=await page.locator('[id]').evaluateAll(xs=>{const ids=xs.map(x=>x.id);return ids.length-new Set(ids).size});
 check('HTML 중복 ID 없음',dupIds===0);
 await page.keyboard.press('Tab');check('첫 키보드 포커스 본문 이동',await page.locator('.skip').evaluate(x=>x===document.activeElement));
 await page.screenshot({path:path.join(out,'데스크톱.png')});
 for(const track of ['작게 시작','같은 구조 확장','연계 조건부']){
  await page.locator('#track').selectOption(track);
  check('필터 '+track,await page.locator('.service:visible').count()===model.services.filter(x=>x.track===track).length);
 }
 await page.locator('#reset').click();await page.locator('#q').fill('교통약자');
 check('교통약자 검색',await page.locator('#N01').isVisible());
 await page.locator('#q').fill('없는서비스123ABC');check('검색 결과 없음',await page.locator('#empty').isVisible());
 await page.locator('#reset').click();check('초기화',await page.locator('.service:visible').count()===7);
 await page.locator('#expand').click();check('전체 펼침',await page.locator('.service[open]').count()===7);
 await page.locator('#collapse').click();check('전체 접기',await page.locator('.service[open]').count()===0);
 await page.goto(url+'#N02');check('직접 링크 진입',await page.locator('#N02').getAttribute('open')!==null);
 await page.locator('#N02').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,'N02_서비스.png')});
 check('데스크톱 가로 넘침 없음',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.setViewportSize({width:390,height:844});await page.goto(url);await page.screenshot({path:path.join(out,'모바일.png')});
 check('모바일 가로 넘침 없음',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.goto(url+'#N02');await page.screenshot({path:path.join(out,'모바일_N02.png')});
 check('모바일 상세 가로 넘침 없음',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));
 check('인쇄 시 모든 서비스 표시',await page.locator('.service[open]:visible').count()===7);
 await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
 check('인쇄 후 상태 복원',await page.locator('.service[open]').count()===1);
 await page.goto(url);
 await page.addStyleTag({content:'html{scroll-behavior:auto!important}'});
 await page.locator('.axis-grid').screenshot({path:path.join(out,'두서비스축_모바일.png')});
 await page.setViewportSize({width:1440,height:1000});
 await page.locator('.axis-grid').scrollIntoViewIfNeeded();
 await page.screenshot({path:path.join(out,'두서비스축_데스크톱.png')});
 check('브라우저 스크립트 오류 없음',errors.length===0);
 const result={date:'2026-09-11',checks,errors,bad,limits:'설명 문서의 정적 구조·브라우저 탐색 검증. 실제 NOA 기능·로컬 성능·업무·전체 WCAG 검증 아님'};
 await fs.writeFile(path.join(out,'검증결과.json'),JSON.stringify(result,null,2));
 await browser.close();console.log(JSON.stringify(result));
})().catch(e=>{console.error(e);process.exit(1)});
