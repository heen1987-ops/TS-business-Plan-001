import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {loadDependency} from './공용_실행환경.mjs';
const {chromium} = await loadDependency('playwright');
const base=path.dirname(fileURLToPath(import.meta.url)),out=path.join(base,'검증','안내');await fs.mkdir(out,{recursive:true});
const checks=[];function check(name,pass){checks.push({name,pass:!!pass});}
const browser=await chromium.launch({headless:true,channel:'msedge'});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),external=[],errors=[];
 page.on('request',r=>{if(/^https?:/.test(r.url()))external.push(r.url());});page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.join(base,'00_산출물_안내.html')).href);await page.evaluate(()=>document.fonts.ready);
 check('43개 명세와 문서4종',await page.locator('details').count()===43&&await page.locator('.doc').count()===4);
 await page.selectOption('#family','X02');check('서비스필터',await page.locator('details:visible').count()===4);
 await page.fill('#search','SFR-201');check('ID검색',await page.locator('details:visible').count()===1);
 const summary=page.locator('details:visible summary');await summary.focus();await page.keyboard.press('Enter');check('키보드펼침',await page.locator('details[open]').count()===1);
 await page.click('#collapse');check('모두접기',await page.locator('details[open]').count()===0);
 await page.fill('#search','없는요구9999');check('빈검색안내',await page.locator('#empty').isVisible());
 await page.fill('#search','');await page.selectOption('#family','');
 const links=await page.locator('a').evaluateAll(es=>es.map(el=>el.getAttribute('href')));
 for(const href of links){if(!href||href.startsWith('#')||href.startsWith('http'))continue;try{await fs.access(path.join(base,decodeURIComponent(href)));check('파일링크 '+href,true);}catch{check('파일링크 '+href,false);}}
 await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,'데스크톱.png')});
 for(const width of [360,768,1440]){await page.setViewportSize({width,height:1000});check('본문 가로넘침 '+width,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 await page.setViewportSize({width:360,height:900});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,'모바일.png')});
 check('외부통신없음',external.length===0);check('스크립트오류없음',errors.length===0);
}finally{await browser.close();}
await fs.writeFile(path.join(out,'기능검사.json'),JSON.stringify(checks,null,2));console.log(JSON.stringify({pass:checks.filter(x=>x.pass).length,total:checks.length,failures:checks.filter(x=>!x.pass)}));if(checks.some(x=>!x.pass))process.exitCode=1;
