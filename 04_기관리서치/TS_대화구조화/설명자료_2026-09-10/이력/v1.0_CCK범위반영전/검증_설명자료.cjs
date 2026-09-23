const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url'),crypto=require('crypto');
const libs='C:/Users/김희섭/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {chromium}=require(require.resolve('playwright',{paths:[libs]}));
const base=__dirname, out=path.join(base,'검증'),data=JSON.parse(fs.readFileSync(path.join(base,'내용.json'),'utf8'));
fs.mkdirSync(out,{recursive:true});
const checks=[];function check(name,ok,detail){checks.push({name,pass:!!ok,detail});}
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
const browser=await chromium.launch({headless:true,channel:'msedge'});
try{
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',acceptDownloads:true});
const page=await context.newPage(),errors=[],external=[];
page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))external.push(r.url())});
const url=pathToFileURL(path.join(base,'TS_편의안전_AX_설명자료.html')).href;
const md=fs.readFileSync(path.join(base,'TS_편의안전_AX_설명자료.md'),'utf8');
const source=JSON.parse(fs.readFileSync(path.join(base,'참조대화_보존.json'),'utf8'));
await page.goto(url);await page.evaluate(()=>document.fonts.ready);
check('대화 14턴·응답 11개·요청만 3개',source.turns.length===14&&source.turns.filter(t=>t.assistant_text).length===11);
check('한국어·제목·본문 랜드마크',await page.locator('html').getAttribute('lang')==='ko'&&await page.locator('h1').count()===1&&await page.locator('main').count()===1);
check('HTML 내장 Markdown과 별도 문서 일치',await page.locator('#markdown-data').evaluate(el=>JSON.parse(el.textContent))===md);
check('공통 데이터의 조사안·지표·근거가 두 형식에 존재',data.cases.every(c=>md.includes(c.problem)&&md.includes(c.ai)&&md.includes(c.risk))&&data.roadmap.every(r=>md.includes(r.id)&&md.includes(r.status)));
check('재구성한 요청 3개는 직접 인용 대신 설명용 예시로 표시',await page.locator('.request-example').count()===3&&(md.match(/\*\*설명용 요청 예시:\*\*/g)||[]).length===3);
const tabs=page.getByRole('tab'),panels=page.locator('.case-panel');
check('기본 A 조사안만 표시',await panels.count()===3&&await page.locator('#case-A').isVisible()&&!(await page.locator('#case-B').isVisible()));
for(const c of data.cases){await page.locator('#tab-'+c.id).click();check('조사안 '+c.id+' 선택·접근성 연결',await page.locator('#case-'+c.id).isVisible()&&await page.locator('#tab-'+c.id).getAttribute('aria-selected')==='true'&&await page.locator('.case-panel:not([hidden])').count()===1);}
await page.locator('#tab-A').focus();await page.keyboard.press('ArrowRight');
check('키보드 화살표로 B 탐색',await page.locator('#tab-B').evaluate(el=>el===document.activeElement)&&await page.locator('#case-B').isVisible());
await page.keyboard.press('End');check('키보드 End로 C 탐색',await page.locator('#case-C').isVisible());
await page.keyboard.press('Home');check('키보드 Home으로 A 복귀',await page.locator('#case-A').isVisible());
for(const s of data.scenarios){await page.locator('[data-scenario="'+s.id+'"]').click();check('예약 상황 '+s.id+' 상태·설명',await page.locator('[data-scenario-panel="'+s.id+'"]').isVisible()&&await page.locator('.scenario-panel:not([hidden])').count()===1&&await page.locator('[data-scenario="'+s.id+'"]').getAttribute('aria-pressed')==='true');}
check('빈 결과와 조회 실패 구분',data.scenarios.find(s=>s.id==='none').title!==data.scenarios.find(s=>s.id==='error').title);
check('연구 8단계와 완료 오인 방지',await page.locator('.research-step').count()===8&&await page.locator('.step-status').filter({hasText:'시작 요청 확인 · 결과 미열람'}).count()===3&&await page.locator('.step-status').filter({hasText:'실행 여부 미확인'}).count()===5);
await page.locator('.research-step summary').first().focus();await page.keyboard.press('Enter');
check('연구 단계 키보드 펼침',await page.locator('.research-step').first().getAttribute('open')!==null);
await page.locator('.copy-button').first().click();
await page.waitForFunction(()=>/복사했습니다|질문을 선택했습니다/.test(document.getElementById('live-status').textContent),{},{timeout:7000});
check('단계 질문 복사 또는 명시된 대체 안내',/복사했습니다|질문을 선택했습니다/.test(await page.locator('#live-status').textContent()));
await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('blocked')}}}));
await page.locator('.copy-button').first().click();
check('클립보드 차단 시 원문 선택 대안',await page.evaluate(()=>window.getSelection().toString().startsWith('DR01'))&&(await page.locator('#live-status').textContent()).includes('Ctrl+C'));
const downloadPromise=page.waitForEvent('download');await page.locator('#download-md').click();const download=await downloadPromise;
await download.saveAs(path.join(out,'저장기능_결과.md'));
check('Markdown 실제 저장 내용 일치',fs.readFileSync(path.join(out,'저장기능_결과.md'),'utf8')===md);
const anchors=await page.locator('a[href^="#"]').evaluateAll(nodes=>nodes.map(a=>a.getAttribute('href').slice(1)));
check('문서 목차 앵커 유효',await page.evaluate(ids=>ids.every(id=>!!document.getElementById(id)),anchors));
const ids=await page.locator('[id]').evaluateAll(nodes=>nodes.map(n=>n.id));
check('DOM ID 중복 없음',new Set(ids).size===ids.length);
check('로컬 외부요청 없음',external.length===0,external);
check('콘솔 JavaScript 오류 없음',errors.length===0,errors);
await page.goto(url);await page.screenshot({path:path.join(out,'01_데스크톱.png')});
await page.locator('#candidates').screenshot({path:path.join(out,'02_조사안.png')});
for(const width of [768,390,320]){
 await page.setViewportSize({width,height:900});await page.goto(url);
 check(width+'px 본문 가로 넘침 없음',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.locator('#tab-C').click();check(width+'px 주제 선택 가능',await page.locator('#case-C').isVisible());
 await page.locator('[data-scenario="error"]').click();check(width+'px 조회 실패 설명 표시',await page.locator('[data-scenario-panel="error"]').isVisible());
 if(width===390){await page.goto(url);await page.screenshot({path:path.join(out,'03_모바일.png')});await page.locator('#scenario').screenshot({path:path.join(out,'04_모바일_상황.png')});}
}
await page.setViewportSize({width:1440,height:1000});await page.goto(url);await page.evaluate(()=>{document.body.style.zoom='2'});
check('200% 확대 본문 가로 넘침 없음',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
await page.evaluate(()=>document.body.style.zoom='1');
await page.locator('.scope-details summary').click();
const before=await page.locator('details[open]').count();
await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));await page.emulateMedia({media:'print'});
check('인쇄 시 접힌 연구·출처 모두 펼침',await page.locator('details[open]').count()===await page.locator('details').count());
check('인쇄 시 모든 조사안·상황 표시',await page.locator('#case-C').isVisible()&&await page.locator('[data-scenario-panel="error"]').isVisible());
await page.pdf({path:path.join(out,'인쇄_확인.pdf'),printBackground:true,preferCSSPageSize:true});
await page.emulateMedia({media:'screen'});await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
check('인쇄 종료 후 펼침 상태 복구',await page.locator('details[open]').count()===before);
const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}});
const nj=await nojs.newPage();await nj.goto(url);
check('JavaScript 없이 세 조사안·네 상황 열람',await nj.locator('#case-C').isVisible()&&await nj.locator('[data-scenario-panel="error"]').isVisible());
check('JavaScript 없이 저장 버튼 숨김',!(await nj.locator('#download-md').isVisible()));
check('JavaScript 없이 동작하지 않는 선택 조작 숨김',!(await nj.locator('.case-tabs').isVisible())&&!(await nj.locator('.scenario-controls').isVisible()));
await nojs.close();
await page.goto(url);
const contrast=await page.evaluate(()=>{
 const rgb=s=>(s.match(/[\d.]+/g)||[]).slice(0,4).map(Number);
 const lum=c=>c.slice(0,3).map(n=>{n/=255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4}).reduce((a,n,i)=>a+n*[.2126,.7152,.0722][i],0);
 const bad=[];let checked=0;
 for(const el of document.querySelectorAll('body *')){
  if(['STYLE','SCRIPT','NOSCRIPT'].includes(el.tagName)||!el.getClientRects().length||![...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))continue;
  const cs=getComputedStyle(el);if(cs.visibility==='hidden')continue;
  const fg=rgb(cs.color);if(fg.length<3)continue;
  let p=el,bg=[255,255,255];while(p){const b=rgb(getComputedStyle(p).backgroundColor);if(b.length>=3&&(b.length===3||b[3]===1)){bg=b;break;}p=p.parentElement;}
  const a=lum(fg),b=lum(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  const size=parseFloat(cs.fontSize),weight=parseInt(cs.fontWeight)||400,target=(size>=24||(size>=18.66&&weight>=700))?3:4.5;
  checked++;if(ratio<target-.02)bad.push({tag:el.tagName,text:el.textContent.trim().slice(0,50),ratio:+ratio.toFixed(2),target});
 }
 return {checked,bad};
});
check('기본 화면 CSS 텍스트 명도 대비',contrast.bad.length===0,contrast);
let axeResult=null;
try{const axePath=require.resolve('axe-core/axe.min.js',{paths:[libs]});await page.addScriptTag({path:axePath});axeResult=await page.evaluate(async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));check('axe 자동 접근성 중대·심각 위반 없음',axeResult.violations.filter(v=>['serious','critical'].includes(v.impact)).length===0,axeResult.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length})));}catch(err){axeResult={unavailable:String(err.message)}}
const manifest=JSON.parse(fs.readFileSync(path.join(base,'생성_기록.json'),'utf8'));
check('생성 HTML·MD 해시 일치',Object.entries(manifest.outputs).every(([name,h])=>hash(fs.readFileSync(path.join(base,name)))===h));
fs.writeFileSync(path.join(out,'검증결과.json'),JSON.stringify({testedAt:new Date().toISOString(),checks,passed:checks.filter(c=>c.pass).length,total:checks.length,externalRequests:external,jsErrors:errors,axe:axeResult?{violations:axeResult.violations?.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),unavailable:axeResult.unavailable}:null},null,2));
console.log(JSON.stringify({passed:checks.filter(c=>c.pass).length,total:checks.length,failed:checks.filter(c=>!c.pass),axeAvailable:!!axeResult?.violations},null,2));
if(checks.some(c=>!c.pass))process.exitCode=1;
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
