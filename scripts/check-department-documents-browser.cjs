const publication=require('../src/document-publication.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const manifest=require('../src/department-documents.json');
const base=process.env.SITE_BASE||'http://127.0.0.1:8770/TS-business-Plan-001/';
let browser;
function atDocumentAnchor(){const target=document.querySelector('#documents-EX26');if(!target)return false;const rect=target.getBoundingClientRect(),margin=parseFloat(getComputedStyle(target).scrollMarginTop),max=document.documentElement.scrollHeight-innerHeight,expected=Math.max(0,Math.min(scrollY+rect.top-margin,max));return location.hash==='#documents-EX26'&&scrollY>500&&Math.abs(scrollY-expected)<=2&&rect.top>=0&&rect.top<innerHeight;}
(async()=>{
 fs.mkdirSync('qa-output',{recursive:true});browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));let checks=0;const check=(v,m)=>{assert(v,m);checks++};
 await page.goto(base+'planning-documents.html');await page.locator('[data-native-department]').first().waitFor();
 check(await page.locator('[data-native-department]').count()===39,'통합 목록 39처');check(await page.locator('.native-download').count()===117,'개별 다운로드 117개');
 check(await page.locator('.doc-tree a[aria-current=page]').count()===1,'자료실 선택 위치');check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'데스크톱 가로 이탈 없음');
 await page.screenshot({path:'qa-output/department-documents-desktop.png'});
 await page.getByLabel('처명·코드·사업번호·문제 검색').fill('EX11');check(await page.locator('[data-native-department]').count()===1,'코드 검색 1처');check((await page.locator('[data-native-department]').innerText()).includes('재정회계처'),'정확한 처 검색');
 await page.getByLabel('처명·코드·사업번호·문제 검색').fill('zz-no-department');check(await page.locator('[data-native-department]').count()===0,'빈 검색 결과');check(await page.locator('.native-empty').isVisible(),'빈 상태 안내');await page.getByRole('button',{name:'검색 초기화',exact:true}).click();check(await page.locator('[data-native-department]').count()===39,'검색 초기화');
 for(const d of manifest.departments){
  await page.goto(base+d.proposalRoute);const block=page.locator('[data-native-department="'+d.code+'"]');await block.waitFor();check(await block.locator('.native-download').count()===3,'처별 다운로드 3종 '+d.code);
  for(const f of d.documents){const a=block.locator('[data-native-kind="'+f.kind+'"]');check((await a.getAttribute('href'))===new URL(publication.downloadPath(f),base).href,'정확한 링크 '+d.code+'/'+f.kind);check((await a.getAttribute('download'))===f.downloadName,'한글 다운로드 파일명 '+d.code+'/'+f.kind)}
 }
 for(const pair of [['rail-license','EX22'],['rail-type','EX23']]){await page.goto(base+'proposal-links.html?unit='+pair[0]);await page.locator('[data-native-department="'+pair[1]+'"]').waitFor();check(await page.locator('.native-download').count()===3,'공유처 카드 연결 '+pair[0])}
 await page.goto(base+'proposal-links.html?unit=katri-ncap');await page.locator('[data-native-department="EX26"]').waitFor();await page.getByRole('link',{name:'전체 처별 다운로드 목록 ↗'}).click();
 await page.waitForFunction(atDocumentAnchor);check(await page.locator('#documents-EX26').evaluate(e=>document.activeElement===e),'목록에서 해당 처 이동·초점');
 await page.reload();await page.waitForFunction(atDocumentAnchor);check(true,'직접 해시 새로고침 위치');await page.goBack();await page.locator('[data-profile="katri-ncap"]').waitFor();check(await page.locator('[data-native-department="EX26"]').count()===1,'뒤로가기 기존 카드 복귀');
 const mr=manifest.departments.find(d=>d.code==='MR');await page.goto(base+mr.proposalRoute);await page.locator('[data-native-department]').waitFor();
 await page.locator('[data-native-kind="plan"]').focus();check(await page.evaluate(()=>document.activeElement?.dataset.nativeKind==='plan'),'키보드 다운로드 초점');
 for(const f of mr.documents){const response=await page.request.get(base+f.path);check(response.status()===200,'HTTP 다운로드 '+f.kind);const data=await response.body();check(crypto.createHash('sha256').update(data).digest('hex')===f.sha256,'HTTP 파일 SHA '+f.kind)}
 await page.setViewportSize({width:390,height:844});await page.goto(base+'planning-documents.html');await page.locator('[data-native-department]').first().waitFor();check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'모바일 가로 이탈 없음');await page.screenshot({path:'qa-output/department-documents-mobile.png'});
 await page.goto(base+mr.proposalRoute);await page.locator('[data-native-department]').waitFor();check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'모바일 처별 본문 이탈 없음');await page.locator('[data-native-department]').screenshot({path:'qa-output/department-documents-MR-mobile.png'});
 check(errors.length===0,'브라우저 실행 오류 없음');const result={result:'통과',checks,departments:39,downloadLinks:117,httpHashChecks:3,browserErrors:errors};fs.writeFileSync('qa-output/department-documents-browser.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));await browser.close();
})().catch(async e=>{console.error(e);await browser?.close();process.exitCode=1});
