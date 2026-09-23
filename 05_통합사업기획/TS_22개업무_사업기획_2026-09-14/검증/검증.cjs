const fs=require('fs'),path=require('path'),assert=require('assert');
const {pathToFileURL,fileURLToPath}=require('url');
const {chromium}=require('C:/Users/김희섭/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out='G:/내 드라이브/1. 업무영역/6. CCK/1. 사업관리/TS/bizops/[TS 사업기획]/05_통합사업기획/TS_22개업무_사업기획_2026-09-14';
const dest=path.join(out,'검증');fs.mkdirSync(dest,{recursive:true});
const read=f=>JSON.parse(fs.readFileSync(path.join(out,f),'utf8'));
const book=read('03_사업기획_원장.json'),plans=book.plans,ledger=read('02_업무별_확인원장.json'),trace=read('04_요구사항_추적표.json'),sources=read('근거원장.json').sources;
const checks=[];function check(name,value,detail=''){checks.push({name,pass:Boolean(value),detail});if(!value)throw Error(name+' '+JSON.stringify(detail));}
async function main(){
check('22개 고유 기획과 7개 분류',plans.length===22&&new Set(plans.map(x=>x.id)).size===22&&new Set(plans.map(x=>x.category)).size===7);
check('기존 업무 22개 1대1 연결',ledger.items.length===22&&new Set(plans.map(x=>x.source_item_id)).size===22&&plans.every((p,i)=>p.source_item_id==='TS-L'+String(i+1).padStart(2,'0')));
check('신규 후보·인프라·실제시험 상태 보존',plans.every(x=>x.registered_as_new_opportunity===false)&&book.new_infrastructure_budget_won===0&&book.actual_product_test_runs===0&&book.existing_candidate_count_unchanged);
check('요구사항 88개 고유·참조 일치',trace.requirements.length===88&&new Set(trace.requirements.map(x=>x.requirement_id)).size===88&&trace.requirements.every(x=>plans.some(p=>p.id===x.plan_id)&&x.test_status.includes('미수행')));
check('근거 식별자 연결',sources.length===34&&new Set(sources.map(x=>x.id)).size===34&&ledger.items.every(p=>p.source_ids.every(id=>sources.some(s=>s.id===id))));
check('P17·P22 통합 및 예산 상태',plans.filter(x=>x.status==='독립사업 제외·통합').map(x=>x.n).join(',')==='17,22'&&book.program_caps_vat_included_assumption.stage1_won===700000000&&book.program_caps_vat_included_assumption.stage2_additional_won===500000000);
for(const p of plans){const md=fs.readFileSync(path.join(out,p.document),'utf8');check(p.id+' 문서·내용·시험 설계',fs.existsSync(path.join(out,p.html))&&md.includes(p.problem)&&md.includes(p.scope)&&md.includes(p.exception)&&md.includes(p.kpi)&&/^## 11\./m.test(md)&&[1,2,3,4,5].every(i=>md.includes(p.id+'-T'+i))&&!/undefined|\uFFFD/.test(md));}
const browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
let localLinks=0,anchors=0;
const all=['00_사업기획_통합보기.html','01_공통_수행설계.html',...plans.map(x=>x.html)];
for(const f of all){await page.goto(pathToFileURL(path.join(out,f)).href);const info=await page.evaluate(()=>({h1:document.querySelectorAll('h1').length,ids:[...document.querySelectorAll('[id]')].map(x=>x.id),hrefs:[...document.querySelectorAll('a[href]')].map(x=>x.getAttribute('href')),body:document.body.innerText,wide:document.documentElement.scrollWidth>innerWidth+1,h2:document.querySelectorAll('h2').length,lang:document.documentElement.lang}));
const invalid=[];for(const h of info.hrefs){const u=new URL(h,page.url());if(h.startsWith('#')){anchors++;if(!info.ids.includes(decodeURIComponent(u.hash.slice(1))))invalid.push(h);}else if(u.protocol==='file:'){localLinks++;const t=new URL(u);t.hash='';if(!fs.existsSync(fileURLToPath(t)))invalid.push(h);}}
check(f+' HTML·링크·화면',info.h1===1&&info.lang==='ko'&&new Set(info.ids).size===info.ids.length&&invalid.length===0&&!info.wide&&!info.body.includes('[^')&&!/\]\([^\n]+\.html\)/.test(info.body),{invalid});
if(f.startsWith('개별기획서/'))check(f+' 11개 절과 출처',info.h2===12);
}
await page.goto(pathToFileURL(path.join(out,all[0])).href);
check('통합표 22행·44개 파일 링크',await page.locator('#index-table tbody tr').count()===22&&await page.locator('#index-table tbody a').count()===44);
await page.keyboard.press('Tab');check('키보드 본문 건너뛰기 초점',await page.locator('.skip').evaluate(e=>e===document.activeElement));await page.keyboard.press('Enter');check('본문 초점 이동',await page.locator('#main').evaluate(e=>e===document.activeElement));
await page.locator('a[href="#chapter-2"]').click();check('비교표 앵커 실제 도착',await page.locator('#chapter-2').evaluate(e=>Math.abs(e.getBoundingClientRect().top)<4));
const visible=()=>page.locator('#index-table tbody tr:not([hidden])').count();
await page.selectOption('#cat',{label:'철도교통안전 관리'});check('철도 분류 3개',await visible()===3);
await page.click('#reset');await page.fill('#q','ts-p13');check('P13 검색 1개',await visible()===1);
await page.click('#reset');await page.selectOption('#state',{label:'독립사업 제외·통합'});check('통합 판정 2개',await visible()===2);
await page.fill('#q','이륜차');check('상태+검색 결합 1개',await visible()===1);
await page.fill('#q','해당항목없음');check('검색 빈 상태',await visible()===0&&await page.locator('.empty').isVisible());
await page.click('#reset');check('초기화 22개·검색 초점',await visible()===22&&await page.locator('#q').evaluate(e=>e===document.activeElement));
await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(dest,'01_통합_데스크톱.png')});
await page.fill('#q','TS-P13');await page.locator('#index-table tbody tr:not([hidden]) a').first().click();check('개별 P13 이동',await page.locator('h1').innerText()==='TS-P13 '+plans[12].title);
await page.screenshot({path:path.join(dest,'02_P13_데스크톱.png')});
await page.locator('.contents summary').click();await page.locator('.contents a[href="#chapter-4"]').click();check('개별 목차 실제 도착',await page.locator('#chapter-4').evaluate(e=>Math.abs(e.getBoundingClientRect().top)<4));await page.screenshot({path:path.join(dest,'03_P13_요구사항.png')});
for(const width of [768,390]){await page.setViewportSize({width,height:900});for(const f of all){await page.goto(pathToFileURL(path.join(out,f)).href);check(`${width}px ${f} 가로 넘침 없음`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}}
await page.goto(pathToFileURL(path.join(out,all[0])).href);await page.screenshot({path:path.join(dest,'04_통합_모바일.png')});
await page.locator('a[href="#chapter-2"]').click();await page.selectOption('#cat',{label:'철도교통안전 관리'});check('모바일 필터',await visible()===3);await page.screenshot({path:path.join(dest,'05_통합_모바일_필터.png')});
await page.goto(pathToFileURL(path.join(out,plans[12].html)).href);await page.screenshot({path:path.join(dest,'06_P13_모바일.png')});
await page.locator('.table-wrap').first().focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(250);check('모바일 표 키보드 스크롤',await page.locator('.table-wrap').first().evaluate(e=>e.scrollLeft>0));
check('브라우저 스크립트 오류 없음',errors.length===0,errors);
await browser.close();return {checked_at:'2026-09-14',scope:'문서·데이터·HTML 기능 검증. 실제 제품·독립 평가·사용자 조사 아님',total:checks.length,passed:checks.filter(x=>x.pass).length,html_pages:24,local_link_occurrences_checked:localLinks,anchor_occurrences_checked:anchors,checks};
}
main().then(r=>{fs.writeFileSync(path.join(dest,'자동검증_결과.json'),JSON.stringify(r,null,2));console.log(JSON.stringify({...r,checks:undefined},null,2));}).catch(e=>{fs.writeFileSync(path.join(dest,'자동검증_실패.json'),JSON.stringify({error:e.message,checks},null,2));console.error(e);process.exitCode=1});
