const fs=require('fs'),path=require('path'),{pathToFileURL,fileURLToPath}=require('url');
const {chromium}=require('C:/Users/김희섭/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root='G:/내 드라이브/1. 업무영역/6. CCK/1. 사업관리/TS/bizops/[TS 사업기획]';
const dir=path.join(root,'05_통합사업기획/TS_22개업무_고도화보고서_2026-09-15');
const prev=path.join(root,'05_통합사업기획/TS_22개업무_사업기획_2026-09-15_v0.2');
const data=JSON.parse(fs.readFileSync(path.join(dir,'02_고도화보고서_원장.json'),'utf8'));
const trace=JSON.parse(fs.readFileSync(path.join(dir,'03_요구사항_시험추적.json'),'utf8'));
const cost=JSON.parse(fs.readFileSync(path.join(dir,'04_작업분해_공수원장.json'),'utf8'));
const old=JSON.parse(fs.readFileSync(path.join(prev,'04_요구사항_추적표.json'),'utf8'));
const checks=[],broken=[],pageErrors=[],requests=[],screens=[];let links=0,anchors=0;
function check(name,ok,detail){checks.push({name,passed:!!ok,detail});}
const files=[path.join(dir,'00_고도화보고서_통합보기.html'),path.join(dir,'01_공통설계_추진계획_비용산정.html'),...data.plans.map(p=>path.join(dir,p.report_file+'.html'))];
check('22개 보고서 및 7개 대분류',data.plans.length===22&&new Set(data.plans.map(p=>p.category)).size===7);
check('요구132·시험154·작업88',trace.requirements.length===132&&trace.tests.length===154&&cost.domain_tasks.length===88);
check('고유 요구사항·시험 ID',new Set(trace.requirements.map(r=>r.id)).size===132&&new Set(trace.tests.map(t=>t.id)).size===154);
check('제품 시험 모두 미실행',trace.tests.every(t=>t.status==='미실행')&&data.counts.actual_product_tests===0);
check('신규 인프라 0원',data.new_infrastructure_budget_won===0&&cost.new_infrastructure_budget_won===0);
const oldIds=new Set(old.requirements.map(r=>r.requirement_id)),tids=new Set(trace.tests.map(t=>t.id));
check('기존 요구사항 88개 연결 유효',trace.requirements.filter(r=>r.baseline_requirement).length===88&&trace.requirements.filter(r=>r.baseline_requirement).every(r=>oldIds.has(r.baseline_requirement)));
check('요구→시험 연결 유효',trace.requirements.every(r=>tids.has(r.test)));
const totals=cost.domain_tasks.reduce((a,r)=>[a[0]+r.min_person_days,a[1]+r.max_person_days],[0,0]);
check('증분 공수 합계',JSON.stringify(totals)===JSON.stringify(cost.totals.domain_person_days),totals);
check('P01/P17·P21/P22 통합 그룹',data.plans[0].group===data.plans[16].group&&data.plans[20].group===data.plans[21].group);
for(const p of data.plans){const md=fs.readFileSync(path.join(dir,p.report_file+'.md'),'utf8');check(p.id+' 개별 구성·원문',md.length>8500&&(md.match(/^## /gm)||[]).length===14&&p.req.length===4&&p.fields.length===6&&p.outputs.length===5,{characters:md.length});check(p.id+' 고유 시험·최소범위·책임',md.includes(p.prerequisite)&&md.includes(p.req[1][3])&&md.includes(p.req[3][3])&&p.requirements.length===6);}
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage();page.on('pageerror',e=>pageErrors.push(String(e)));page.on('request',r=>{if(/^https?:/i.test(r.url()))requests.push(r.url())});
for(const file of files){await page.goto(pathToFileURL(file).href);const info=await page.evaluate(()=>({title:document.title,lang:document.documentElement.lang,h1:document.querySelectorAll('h1').length,h2:document.querySelectorAll('h2').length,ids:[...document.querySelectorAll('[id]')].map(x=>x.id),hrefs:[...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')),deletions:document.querySelectorAll('del,s').length,tables:document.querySelectorAll('table').length,wraps:document.querySelectorAll('.tablewrap').length}));
check(path.basename(file)+' 문서 구조',info.lang==='ko'&&info.h1===1&&info.deletions===0&&info.tables===info.wraps&&new Set(info.ids).size===info.ids.length);
for(const href of info.hrefs){if(!href||/^https?:|^mailto:/i.test(href))continue;try{const u=new URL(href,pathToFileURL(file));if(u.protocol!=='file:')throw Error('지원하지 않는 경로');const fp=fileURLToPath(u);links++;if(!fs.existsSync(fp)){broken.push({file,href,target:fp});continue;}if(u.hash&&path.extname(fp).toLowerCase()==='.html'){anchors++;const body=fs.readFileSync(fp,'utf8');if(!body.includes('id="'+decodeURIComponent(u.hash.slice(1))+'"'))broken.push({file,href,error:'대상 앵커 없음'});}}catch(e){broken.push({file,href,error:String(e)})}}
for(const width of [1440,768,390]){await page.setViewportSize({width,height:960});const dim=await page.evaluate(()=>({w:innerWidth,sw:document.documentElement.scrollWidth}));check(path.basename(file)+' '+width+'px 가로 넘침',dim.sw<=dim.w+1,dim);}}
check('전체 로컬 링크·앵커',broken.length===0,{links,anchors,broken});
const idx=pathToFileURL(files[0]).href;await page.goto(idx);await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:path.join(dir,'검증/01_통합_데스크톱.png')});screens.push('01_통합_데스크톱.png');
await page.locator('#q').fill('P17');check('검색 P17',await page.locator('.card:visible').count()===1&&await page.locator('.card:visible').innerText().then(x=>x.includes('TS-P17')));
await page.locator('#reset').click();await page.locator('#cat').selectOption('철도교통안전 관리');check('철도 분류 3개',await page.locator('.card:visible').count()===3);
await page.locator('#reset').click();await page.locator('#family').selectOption('보호된 안전사례');check('보호 사례 2개',await page.locator('.card:visible').count()===2);
await page.locator('#q').fill('존재하지않는검증단어');check('검색 빈 상태',await page.locator('.card:visible').count()===0&&await page.locator('#empty').isVisible());
await page.locator('#reset').click();check('초기화·초점 복귀',await page.locator('.card:visible').count()===22&&await page.locator('#q').evaluate(x=>x===document.activeElement));
await page.setViewportSize({width:390,height:844});await page.locator('#q').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(dir,'검증/02_검색_모바일.png')});screens.push('02_검색_모바일.png');
await page.locator('a[href="#s05"]').click();await page.waitForFunction(()=>{const y=document.getElementById('s05').getBoundingClientRect().top;return y>=-5&&y<100},{},{timeout:10000});await page.waitForTimeout(400);const anchorPos=await page.locator('#s05').evaluate(x=>x.getBoundingClientRect().top);check('목차 클릭 실제 도착',anchorPos>=-5&&anchorPos<100,{top:anchorPos,method:'목표 도착 조건 대기'});await page.screenshot({path:path.join(dir,'검증/07_목차_모바일도착.png')});screens.push('07_목차_모바일도착.png');
await page.goto(idx);await page.keyboard.press('Tab');check('키보드 본문 바로가기',await page.evaluate(()=>document.activeElement.classList.contains('skip')));await page.keyboard.press('Enter');check('바로가기 본문 초점',await page.evaluate(()=>document.activeElement.id==='main'));
await page.setViewportSize({width:1440,height:1000});await page.goto(pathToFileURL(path.join(dir,'개별보고서/TS-P10_고도화보고서.html')).href);await page.screenshot({path:path.join(dir,'검증/03_P10_데스크톱.png')});screens.push('03_P10_데스크톱.png');
await page.locator('#s06').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(dir,'검증/04_P10_요구사항.png')});screens.push('04_P10_요구사항.png');
await page.setViewportSize({width:390,height:844});await page.locator('#s06').scrollIntoViewIfNeeded();const wrap=page.locator('#s06 ~ .tablewrap').first();await page.screenshot({path:path.join(dir,'검증/05_P10_모바일표.png')});screens.push('05_P10_모바일표.png');
check('모바일 상세표 내부 스크롤',await wrap.evaluate(x=>{const overflow=x.scrollWidth>x.clientWidth;x.scrollLeft=200;return overflow&&x.scrollLeft>0}));
await page.setViewportSize({width:1440,height:1000});await page.goto(pathToFileURL(path.join(dir,'01_공통설계_추진계획_비용산정.html')).href);await page.locator('#s06').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(dir,'검증/06_공통_예산산식.png')});screens.push('06_공통_예산산식.png');
await page.emulateMedia({media:'print'});check('인쇄용 탐색 숨김',await page.locator('.top').evaluate(x=>getComputedStyle(x).display==='none'));await page.emulateMedia({media:'screen'});
check('브라우저 실행 오류 없음',pageErrors.length===0,pageErrors);check('HTML 외부 네트워크 요청 없음',requests.length===0,requests);
await browser.close();const result={date:'2026-09-15',scope:'산출물 구조·수량·링크·계보·산술·브라우저·대표 상호작용. 제품 성능시험 아님',summary:{checks:checks.length,passed:checks.filter(c=>c.passed).length,failed:checks.filter(c=>!c.passed).length,html_files:files.length,local_link_occurrences:links,anchor_occurrences:anchors,viewports:[1440,768,390],screenshots:screens.length},checks,broken,pageErrors,external_requests:requests,screenshots:screens,product_tests_run:0};fs.writeFileSync(path.join(dir,'검증/자동검증_결과.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({summary:result.summary,failures:checks.filter(c=>!c.passed),screens}));if(result.summary.failed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
