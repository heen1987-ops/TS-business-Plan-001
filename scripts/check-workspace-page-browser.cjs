const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.SITE_BASE||'http://127.0.0.1:8769/TS-business-Plan-001/';

(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 const errors=[],popups=[];
 page.on('pageerror',error=>errors.push(error.message));
 page.on('popup',popup=>popups.push(popup.url()));
 try{
  await page.goto(base+'index.html?view=platform-cases&case=PF-R01');
  await page.locator('.ax-reader').waitFor();
  await page.evaluate(()=>{window.__workspaceMarker={sidebar:document.getElementById('workspace-sidebar')};});
  const menu=page.getByRole('navigation',{name:'주 메뉴'});
  for(const [label,view] of [['제안·관계부처','portfolio'],['전략과제',null],['법령·업무','law'],['조직·직무','organization'],['구축·검수','delivery'],['자료실','archive'],['플랫폼 사례집','platform-cases'],['전략과제 사례집','casebook']]){
   await menu.getByRole('link',{name:label,exact:true}).click();
   await page.locator('#main h1').first().waitFor();
   const url=new URL(page.url());
   assert(url.pathname.endsWith('/index.html'),label+' 이동 경로');
   assert.equal(url.searchParams.get('view'),view,label+' 본문 선택');
   assert(await page.evaluate(()=>window.__workspaceMarker.sidebar===document.getElementById('workspace-sidebar')),label+' 좌측 메뉴 유지');
  }
  await menu.getByRole('link',{name:'플랫폼 사례집'}).click();
  await page.locator('.ax-reader').waitFor();
  const before=page.url();
  await page.locator('.case-figure-expand').first().click();
  assert(await page.locator('.case-zoom-dialog').evaluate(el=>el.open));
  assert.equal(page.url(),before);
  await page.locator('.case-zoom-dialog button').click();
  assert(!(await page.locator('.case-zoom-dialog').evaluate(el=>el.open)));
  await page.getByRole('button',{name:'세부 서비스 구조'}).first().click();
  await page.locator('.case-figure-expand').first().click();
  assert(await page.locator('.case-zoom-dialog').evaluate(el=>el.open));
  await page.keyboard.press('Escape');
  assert(!(await page.locator('.case-zoom-dialog').evaluate(el=>el.open)));
  await menu.getByRole('link',{name:'전략과제 사례집'}).click();
  await page.locator('.ax-reader').waitFor();
  assert(await page.evaluate(()=>window.__workspaceMarker.sidebar===document.getElementById('workspace-sidebar')));
  for(const [view,id,count] of [['platform-cases','PF-R01','원문 자료 1개'],['platform-cases','PF07','원문 자료 4개'],['casebook','AX05','원문 자료 4개'],['casebook','AX06','원문 자료 2개']]){
   await page.goto(base+'index.html?view='+view+'&case='+id);
   await page.locator('.case-architecture-detail').waitFor();
   assert(await page.getByRole('button',{name:count}).count(),id+' 공식 원문 자료');
   const img=page.locator('.case-source-figure img').first();
   assert(await img.evaluate(el=>el.complete&&el.naturalWidth>0),id+' 원문 이미지 로드');
  }
  for(const id of ['PF-R07','PF-R09','PF-A03']){
   await page.goto(base+'index.html?view=platform-cases&case='+id);
   await page.locator('.case-architecture-detail').waitFor();
   assert.equal(await page.getByRole('button',{name:/원문 자료/}).count(),0,id+' 원문 없는 사례에 원문 탭 없음');
   assert(await page.locator('.case-reconstruction-basis').isVisible(),id+' RFP 재구성 표기');
   assert(await page.locator('.case-service-image').evaluate(el=>el.complete&&el.naturalWidth>0),id+' 재구성 이미지 로드');
  }
  await page.goto(base+'index.html?view=casebook&case=AX05');
  await page.locator('.ax-reader').waitFor();
  await page.evaluate(()=>{window.__workspaceMarker={sidebar:document.getElementById('workspace-sidebar')};});
  await page.setViewportSize({width:390,height:844});
  await page.getByRole('button',{name:'메뉴 열기'}).click();
  await menu.getByRole('link',{name:'조직·직무',exact:true}).click();
  assert.equal(new URL(page.url()).searchParams.get('view'),'organization');
  assert(await page.evaluate(()=>window.__workspaceMarker.sidebar===document.getElementById('workspace-sidebar')));
  assert.equal(popups.length,0);
  assert.deepEqual(errors,[]);
  console.log('한 화면 탐색 검증 통과: 8개 주 메뉴·모바일 본문 전환, 공식 원문 4사례·RFP 재구성 3사례 이미지, 새 페이지 0건');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
