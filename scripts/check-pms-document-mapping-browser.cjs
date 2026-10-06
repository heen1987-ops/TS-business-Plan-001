const publication=require('../src/document-publication.cjs');
const{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),fs=require('node:fs'),crypto=require('node:crypto'),d=require('../src/skill-pms.cjs');
const base=process.env.SITE_URL||'http://127.0.0.1:8770/TS-business-Plan-001/';
(async()=>{const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'msedge',headless:true}),tests=[],errors=[];const check=(name,value)=>{tests.push({name,pass:!!value});if(!value)throw Error(name)};const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(base+'skill-pms.html#pms-portfolio');await page.waitForFunction(()=>document.activeElement?.id==='pms-portfolio');
  check('처별 큰 문서 블록 39개',await page.locator('[data-pms-department]').count()===39);
  check('사업별 상세설계 42개',await page.locator('[data-pms-project]').count()===42);
  const downloads=await page.locator('[data-pms-document]').evaluateAll(nodes=>nodes.map(a=>({href:a.href,name:a.getAttribute('download'),kind:a.dataset.pmsDocument})));
  check('117개 파일을 한 번씩 직접 다운로드',downloads.length===117&&new Set(downloads.map(a=>a.href)).size===117);
  for(const g of d.documentGroups)for(const f of g.documents){const found=downloads.find(a=>a.href===new URL(publication.downloadPath(f),base).href);check('정확한 파일·다운로드명 '+g.code+'/'+f.kind,found?.name===f.downloadName&&found.kind===f.kind)}
  for(const code of ['MR','EX22','EX23'])check('통합 계획서 공유 명시 '+code,(await page.locator('[data-pms-department="'+code+'"]>header').textContent()).includes('통합 계획서 공유'));
  check('처별 문서 수 중복 없는 검색 결과',(await page.locator('.pms-search:has(#pms-project-search) [role="status"]').textContent()).includes('117 고유 한글 파일'));
  await page.locator('#pms-project-search').fill('mr-02');check('사업 검색과 공유 문서 유지',await page.locator('[data-pms-project]').count()===1&&await page.locator('[data-pms-document]').count()===3);
  await page.locator('[data-pms-project="MR-02"] [data-pms-design]').filter({hasText:'서비스·배차 흐름'}).click();await page.locator('#drt-flow').waitFor();check('검색에서 DRT 전용 흐름으로 진입',new URL(page.url()).hash==='#drt-flow');
  await page.goto(base+'skill-pms.html#pms-project-EX23-02');await page.waitForFunction(()=>document.activeElement?.id==='pms-project-EX23-02');check('사업 직접 공유 위치·초점',await page.locator('#pms-project-EX23-02').isVisible());
  await page.locator('#pms-project-EX23-02 [data-pms-design]').filter({hasText:'공통 구현 구조'}).click();await page.waitForFunction(()=>document.activeElement?.id==='proposal-rail-type-architecture');check('추가 처의 실제 아키텍처 절로 이동',new URL(page.url()).searchParams.get('unit')==='rail-type');
  await page.reload();await page.waitForFunction(()=>document.activeElement?.id==='proposal-rail-type-architecture');check('query와 hash 새로고침 후 초점·고정헤더 회피',await page.locator('#proposal-rail-type-architecture').evaluate(el=>el.getBoundingClientRect().top>=document.querySelector('.ts-location').getBoundingClientRect().bottom-2&&el.getBoundingClientRect().top<innerHeight));
  await page.goto(base+d.portfolio.find(p=>p.id==='MR-01').proposalRoute);await page.locator('[data-native-department="MR"]').waitFor();await page.locator('[data-native-department="MR"] a[href*="pms-department-MR"]').click();await page.waitForFunction(()=>document.activeElement?.id==='pms-department-MR');check('처별 기존 제안에서 해당 처 문서·설계로 직접 복귀',new URL(page.url()).hash==='#pms-department-MR');
  for(const p of d.portfolio){
   await page.goto(base+p.proposalRoute,{waitUntil:'domcontentloaded'});await page.locator('#'+p.designLinks[0].to.split('#')[1]).waitFor();
   const results=await page.evaluate(links=>links.map(a=>({to:a.to,exists:!!document.getElementById(a.to.split('#')[1])})),p.designLinks);
   for(const r of results)check('설계 대상 실제 DOM '+p.id+' '+r.to.split('#')[1],r.exists);
  }
  for(const code of ['MR','EX22','EX23'])for(const f of d.documentGroups.find(g=>g.code===code).documents){const res=await page.request.get(base+f.path),body=await res.body();check('공유 처 실제 한글 다운로드 HTTP·바이트·SHA256 '+code+'/'+f.kind,res.ok()&&body.length===f.bytes&&crypto.createHash('sha256').update(body).digest('hex')===f.sha256)}
  await page.goto(base+'skill-pms.html#pms-department-MR');await page.waitForFunction(()=>document.activeElement?.id==='pms-department-MR');fs.mkdirSync('qa-output',{recursive:true});await page.screenshot({path:'qa-output/pms-document-mapping-desktop.png'});
  await page.setViewportSize({width:390,height:844});await page.goto(base+'skill-pms.html#pms-department-MR');await page.waitForFunction(()=>document.activeElement?.id==='pms-department-MR');
  check('모바일 세로 문서 카드·가로 넘침 없음',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2)&&await page.locator('[data-pms-department="MR"] [data-pms-document]').count()===3);await page.screenshot({path:'qa-output/pms-document-mapping-mobile.png'});
  await page.locator('#pms-project-search').fill('없는처999');check('빈 검색 상태',await page.locator('.pms-empty').isVisible());await page.getByRole('button',{name:'검색 초기화',exact:true}).click();check('전체 검색 복구',await page.locator('[data-pms-project]').count()===42);
  await page.goto(base+'skill-pms.html#pms-project-MR-01');await page.waitForFunction(()=>document.activeElement?.id==='pms-project-MR-01');await page.keyboard.press('Tab');check('사업 초점에서 설계 링크 키보드 접근',await page.locator('#pms-project-MR-01 [data-pms-design]').first().evaluate(el=>el===document.activeElement));
  check('JavaScript 오류 없음',errors.length===0);
 }finally{fs.mkdirSync('qa-output',{recursive:true});fs.writeFileSync('qa-output/pms-document-mapping-browser.json',JSON.stringify({base,tests,errors},null,2));await browser.close()}
 console.log(JSON.stringify({checks:tests.length,passed:tests.filter(t=>t.pass).length,errors}));
})().catch(e=>{console.error(e);process.exitCode=1});
