const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const {chromium}=require(require.resolve('playwright',{paths:['C:/Users/김희섭/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules']}));
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'}),checks=[],errors=[],network=[];
 const check=(ok,label)=>{if(!ok)throw new Error(label);checks.push(label)};
 const data=JSON.parse(fs.readFileSync(path.join(__dirname,'사업포트폴리오.json'),'utf8'));
 const active=['TS-BIZ-002','TS-BIZ-004','TS-BIZ-005','TS-BIZ-006','TS-BIZ-007'];
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url())});
  const file=pathToFileURL(path.join(__dirname,'사업기획_통합보기.html')).href;
  await page.goto(file);await page.waitForFunction(()=>window.tsPortfolio);
  check(JSON.stringify(await page.evaluate(()=>window.tsPortfolio.getVisible()))===JSON.stringify(active),'SC01 기본 목록은 신규 범위 검토대상 5건');
  check((await page.locator('h1').textContent()).includes('AX'),'SC02 AX·AI 정보화 중심 제목');
  const count=await page.locator('#counts').textContent();check(count.includes('검토대상5')&&count.includes('유보2')&&count.includes('제외1')&&count.includes('선정된 신규 사업0'),'SC03 검토·유보·제외·선정 집계 분리');
  await page.locator('#nature').selectOption('AX 전환');check(await page.locator('.project-row').count()===2,'SC04 AX 전환 검토대상 2건');
  await page.locator('#nature').selectOption('디지털전환+AI+정보화');check(await page.locator('.project-row').count()===3,'SC04 디지털전환 결합 검토대상 3건');
  await page.locator('#search').fill('주차장');check(await page.locator('.project-row').count()===1,'SC05 검색·성격·범위 복합 필터');
  await page.locator('#search').fill('없는대상xyz');check((await page.locator('#rows').textContent()).includes('없습니다'),'SC05 빈 결과');
  await page.locator('#clear').click();check(await page.locator('.project-row').count()===5,'SC05 초기화는 전체 이력이 아닌 검토대상 복귀');
  await page.locator('#scopeFilter').selectOption('유보');check(await page.locator('.project-row').count()===2,'SC06 유보 2건 별도 조회');
  await page.locator('#scopeFilter').selectOption('제외');check(await page.locator('[data-row="TS-BIZ-001"]').count()===1,'SC06 공시 확장 1건 제외 이력');
  await page.locator('#scopeFilter').selectOption('all');check(await page.locator('.project-row').count()===8,'SC06 원래 8건 조사 이력 보존');
  for(const p of data.candidates){
   await page.locator('[data-row="'+p.id+'"] .project-name').click();
   const t=await page.locator('#detail').textContent();
   check(t.includes('현재 범위: '+p.scope_review.status)&&t.includes(p.scope_review.reason),'SC07 '+p.id+' 상세 범위·이유');
   check(t.includes('AS-IS')&&t.includes('TO-BE')&&t.includes('디지털전환')&&t.includes('비AI 대안')&&t.includes('직무·책임'),'SC08 '+p.id+' 전환·AI·구축·운영 비교');
   check((await page.locator('#detailStatus').textContent()).includes(p.status),'SC09 '+p.id+' 상세 상태 일치');
   await page.keyboard.press('Escape');check(!await page.locator('#candidateDialog').isVisible(),'SC10 '+p.id+' Escape 닫기');
  }
  await page.locator('#clear').click();await page.locator('[data-row="TS-BIZ-002"] .project-name').focus();await page.keyboard.press('Enter');
  check(await page.locator('#candidateDialog').isVisible(),'SC10 키보드 상세 진입');
  const [popup]=await Promise.all([page.waitForEvent('popup'),page.locator('.duty-list a').first().click()]);await popup.waitForFunction(()=>window.researchMap);
  check(await popup.evaluate(()=>window.researchMap.getSelected())==='D_TS_03','SC11 해당 법정업무 관계도 연결');await popup.close();
  await page.screenshot({path:path.join(__dirname,'QA_상세.png')});await page.locator('#close').click();
  await page.locator('#tabProcess').click();check(await page.locator('#process').isVisible()&&(await page.locator('#process').textContent()).includes('독립 R&D는 현재 기획 대상이 아닙니다'),'SC12 추진 탭에서도 독립 R&D 제외');
  check(await page.locator('.step').count()===5&&await page.locator('.budget-list>div').count()===4,'SC12 단계·비용 구성 유지');await page.locator('#tabPortfolio').click();
  await page.screenshot({path:path.join(__dirname,'QA_전체.png'),fullPage:true});
  for(const width of [768,360]){
   await page.setViewportSize({width,height:900});check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'SC13 '+width+'px 가로 넘침 없음');
   await page.locator('[data-row="TS-BIZ-006"] .project-name').click();check(await page.locator('#candidateDialog').evaluate(e=>e.scrollWidth<=e.clientWidth+1),'SC13 '+width+'px 상세 가로 넘침 없음');await page.locator('#close').click();
  }
  check((await page.locator('#search').boundingBox()).width>=320,'SC13 모바일 검색 폭 유지');check((await page.locator('#scopeFilter').boundingBox()).width>=300&&(await page.locator('#nature').boundingBox()).width>=300,'SC13 모바일 범위·사업 성격 값 가독 폭');await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(__dirname,'QA_모바일.png')});
  await page.goto(file+'?candidate=TS-BIZ-001');await page.waitForFunction(()=>window.tsPortfolio);check((await page.locator('#detailStatus').textContent()).includes('제외'),'SC14 과거 제외 후보 직접 링크도 제외 표시');
  await page.goto(file+'?candidate=TS-BIZ-008');await page.waitForFunction(()=>window.tsPortfolio);check((await page.locator('#detailStatus').textContent()).includes('유보'),'SC14 과거 유보 후보 직접 링크도 유보 표시');
  check(errors.length===0,'SC15 JavaScript 오류 없음');check(network.length===0,'SC15 화면 열람 중 외부 네트워크 없음');
  fs.writeFileSync(path.join(__dirname,'화면_검증결과.json'),JSON.stringify({checked_at:'2026-09-09',scope_revision:'v0.2',passed:checks.length,checks,errors,external_requests:network,limitations:['실제 국민 사용성·종합 접근성 평가는 미실시','계약 비중복 확정 검증 아님']},null,2));
  console.log(JSON.stringify({passed:checks.length,errors},null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
