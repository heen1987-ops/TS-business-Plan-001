const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const manifest=require('../src/department-documents.json'),publication=require('../src/document-publication.cjs'),review=require('../src/analysis-review.cjs');
const base=process.env.SITE_BASE||'http://127.0.0.1:8770/TS-business-Plan-001/';
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];let checks=0;
 const check=(value,label)=>{assert(value,label);checks++};page.on('pageerror',e=>errors.push(e.message));fs.mkdirSync('qa-output/document-publication',{recursive:true});
 try{
  await page.goto(base+'research-library.html?view=planning#analysis-departments');await page.locator('[data-planning-download-entry]').waitFor();
  const reviewTable=page.locator('#analysis-departments'),ispTable=page.locator('#planning-panel-isp');
  check(await reviewTable.locator('[data-planning-documents]').count()===13,'이전 검토표 13처의 한글 연결');
  check(await reviewTable.locator('[data-planning-file]').count()===39,'이전 검토표에서 한글 39개 직접 연결');
  check(await ispTable.locator('[data-planning-documents]').count()===39&&await ispTable.locator('[data-planning-file]').count()===117,'ISP 검토에 39처 117개 한글 연결');
  check((await page.locator('[data-planning-download-entry]').innerText()).includes(publication.versionNote),'웹 수정과 한글 판본의 구분');
  for(const code of Object.keys(review.departments))for(const file of manifest.departments.find(d=>d.code===code).documents){
   const link=reviewTable.locator(`[data-planning-documents="${code}"] [data-planning-file="${file.kind}"]`);
   check(await link.getAttribute('href')===new URL(publication.downloadPath(file),base).href,'처별 실제 파일 '+code+'/'+file.kind);
   check(await link.getAttribute('download')===file.downloadName,'한글 파일명 '+code+'/'+file.kind);
  }
  for(const department of manifest.departments)for(const file of department.documents){const link=ispTable.locator(`[data-planning-documents="${department.code}"] [data-planning-file="${file.kind}"]`);check(await link.getAttribute('href')===new URL(publication.downloadPath(file),base).href&&await link.getAttribute('download')===file.downloadName,'ISP 전체 처의 정확한 게시 파일 '+department.code+'/'+file.kind)}
  await page.screenshot({path:'qa-output/document-publication/planning-desktop.png'});
  // 파일 응답 확인에 그치지 않고 사용자 클릭의 실제 다운로드 이벤트·해시까지 확인.
  for(const file of manifest.departments.find(d=>d.code==='MR').documents){
   const pending=page.waitForEvent('download');await reviewTable.locator(`[data-planning-documents="MR"] [data-planning-file="${file.kind}"]`).click();const download=await pending;
   check(await download.failure()===null,'클릭 다운로드 성공 '+file.kind);
   check(download.suggestedFilename()===file.downloadName,'사용자 저장 파일명 '+file.kind);
   check(download.url()===new URL(publication.downloadPath(file),base).href,'실제 다운로드 URL '+file.kind);
   const content=fs.readFileSync(await download.path());check(crypto.createHash('sha256').update(content).digest('hex')===file.sha256,'다운로드 원본 무결성 '+file.kind);
  }
  await page.setViewportSize({width:390,height:844});await page.goto(base+'research-library.html?view=planning');await page.locator('[data-planning-download-entry]').waitFor();
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'모바일 문서 가로 넘침 없음');
  await page.screenshot({path:'qa-output/document-publication/planning-mobile.png'});
  const all=page.locator('[data-planning-download-entry]').getByRole('link',{name:/전체 처 한글파일 찾기/});await all.focus();check(await all.evaluate(e=>e===document.activeElement),'키보드 다운로드 목록 초점');await all.click();
  await page.locator('[data-native-department]').first().waitFor();check(await page.locator('.native-download').count()===117,'전체 목록 117개');
  check(await page.locator('.native-archive').count()===39,'39개 처 이전판 접힘 목록');
  check(await page.locator('.native-archive[open]').count()===0,'이전판 기본 접힘');
  for(const d of manifest.departments)for(const file of d.documents){const block=page.locator(`[data-native-department="${d.code}"] .native-file`).filter({has:page.locator(`[data-native-kind="${file.kind}"]`)});
   check(await block.locator('a').evaluateAll((links,urls)=>urls.every(url=>links.some(a=>a.href===url)),[publication.sourceUrl(file),publication.rawUrl(file)]),'파일별 GitHub 보기·직접 다운로드 '+d.code+'/'+file.kind);
  }
  await page.getByLabel('처명·코드·사업번호·문제 검색').fill('MR');check(await page.locator('.native-download').count()===3,'검색 후 한글 3종');
  const archive=page.locator('.native-archive');await archive.locator('summary').focus();await page.keyboard.press('Enter');check(await archive.getAttribute('open')!==null,'키보드로 이전판 열기');
  const previous=manifest.departments.find(d=>d.code==='MR').history[0];const pendingOld=page.waitForEvent('download');await archive.locator('.native-archive-download').click();const oldDownload=await pendingOld;
  check(await oldDownload.failure()===null,'이전판 다운로드 성공');check(crypto.createHash('sha256').update(fs.readFileSync(await oldDownload.path())).digest('hex')===previous.sha256,'이전판 바이트 보존');
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'모바일 한글 자료실 가로 넘침 없음');
  await page.screenshot({path:'qa-output/document-publication/library-mobile.png',fullPage:true});
  check(errors.length===0,'JavaScript 실행 오류 없음');
  const result={result:'통과',checks,base,actualDownloads:4,githubFiles:117,historyFiles:39,errors};fs.writeFileSync('qa-output/document-publication/browser.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
