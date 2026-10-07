const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const d=require('../src/proposal-engineering.cjs'),reading=require('../src/integrated-reading.cjs'),manifest=require('../src/proposal-diagram-assets.json');
const base=process.env.SITE_BASE||'http://127.0.0.1:8792/TS-business-Plan-001/',sha=process.env.RELEASE_SHA,out='qa-output/engineering/'+(sha?'public':'local');
const checks=[],errors=[],downloads=[],check=(name,ok)=>{checks.push({name,pass:!!ok});assert(ok,name)};
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true}),page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});page.setDefaultTimeout(20000);page.on('pageerror',e=>errors.push(e.message));
 const route=p=>base+'index.html?dept='+reading.rows.find(r=>r.projects.some(x=>x.id===p.id)).key+'&project='+p.id+'&v='+(sha||d.date)+'#engineering-'+p.id;
 try{
  if(sha){const v=await page.request.get(base+'version.json?v='+sha);check('공개 배포 커밋 일치',v.ok()&&(await v.json()).commit===sha)}
  for(const p of d.projects){await page.goto(route(p));const panel=page.locator('[data-engineering-project="'+p.id+'"]');await panel.waitFor();
   check(p.id+' 선택 처의 단일 개발 설계',await page.locator('[data-engineering-project]').count()===1&&await page.locator('[data-department-link]').count()===51);
   check(p.id+' 요구 8건·지표 3~5건',await panel.locator('[data-engineering-requirement]').count()===8&&await panel.locator('[data-engineering-metric]').count()===p.measurement.length);
   check(p.id+' 후보·보류 판정 보존',(await panel.locator('header').innerText()).includes(p.reviewStatus)&&p.selection.includes('미선정'));
   check(p.id+' 초기·후속 쓰기 구분',(await panel.locator('.engineering-contract').last().innerText()).includes('후속 쓰기 조건 · 초기 범위 제외'));
   check(p.id+' 측정기록·자료 미확보 표시',await panel.locator('[data-engineering-metric]').allTextContents().then(a=>a.every(s=>s.includes('수집할 기록')&&s.includes('확인 전'))));
   check(p.id+' 7개 절 연속 본문',await panel.locator(':scope > section').count()===7&&await panel.locator(':scope > section').evaluateAll(els=>els.every(el=>!el.closest('details'))));
   check(p.id+' 외부 PC 경로 없는 두 개 다운로드',await panel.locator('.engineering-downloads a').count()===2&&await panel.locator('.engineering-downloads a').evaluateAll(els=>els.every(el=>el.href.startsWith(location.origin)&&!el.href.includes('file:'))));
   check(p.id+' 중복 ID·가로 넘침 없음',await page.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);return ids.length===new Set(ids).size&&document.documentElement.scrollWidth<=innerWidth+2}));
  }
  const files=d.projects.flatMap(p=>Object.entries(p.downloads).map(([type,path])=>({p,type,path})));let cursor=0;
  await Promise.all(Array.from({length:4},async()=>{while(cursor<files.length){const f=files[cursor++],r=await page.request.get(base+f.path+'?v='+(sha||d.date));const body=await r.body(),expected=fs.readFileSync('public/'+f.path),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
   const response={project:f.p.id,type:f.type,url:r.url(),status:r.status(),contentType:r.headers()['content-type']||null,bytes:body.length,expectedBytes:expected.length,sha256:hash(body),expectedSha256:hash(expected),equal:body.equals(expected)};downloads.push(response);
   if(!r.ok()||!response.equal){fs.writeFileSync(out+'/'+f.p.id+'-'+f.type+'-failure.bin',body);console.error(JSON.stringify(response));}
   check(f.p.id+'/'+f.type+' 실제 HTTP·Git 파일 동일',r.ok()&&response.equal);if(f.type==='json'){const j=JSON.parse(body);check(f.p.id+' JSON 요구·초기 범위',j.project.requirements.length===8&&j.project.interfaces[1].optionalWrite.included===false)}else check(f.p.id+' MD 한국어·연계·측정식',body.toString('utf8').startsWith('# '+f.p.department)&&body.toString('utf8').includes('데이터·연계 계약 초안')&&body.toString('utf8').includes(f.p.measurement[0].formula))}}));
  for(const a of manifest.assets.filter(a=>a.metaDate)){const r=await page.request.get(base+a.path+'?v='+a.sha256);check(a.id+'/'+a.type+' 모델 교정 PNG 해시',r.ok()&&crypto.createHash('sha256').update(await r.body()).digest('hex')===a.sha256)}
  for(const width of [1440,768,390]){await page.setViewportSize({width,height:1000});await page.goto(route(d.byId['MR-02']));const panel=page.locator('#engineering-MR-02');await panel.waitFor();await panel.locator('#engineering-MR-02-requirements').scrollIntoViewIfNeeded();
   check(width+' 가로 넘침 없음',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
   if(width<1100)check(width+' 요구사항 단일 열',await panel.locator('.engineering-requirements').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length===1));
   await page.screenshot({path:out+'/DRT-requirements-'+width+'.png'});await panel.locator('#engineering-MR-02-cost').scrollIntoViewIfNeeded();await page.screenshot({path:out+'/DRT-cost-'+width+'.png'});
   const link=panel.locator('.engineering-downloads a').first();await link.focus();check(width+' 다운로드 키보드 포커스',await link.evaluate(el=>el===document.activeElement));
   if(width===390){const button=page.locator('.integrated-menu-toggle');await button.click();check('모바일 처 탐색 열림',await button.getAttribute('aria-expanded')==='true');await page.locator('#integrated-department-search').fill('재정회계');await page.locator('[data-department-link="EX11"]').click();await page.locator('[data-engineering-project="EX11-01"]').waitFor();check('모바일 처 선택 후 메뉴 닫힘',await button.getAttribute('aria-expanded')==='false');await page.goBack();await page.locator('[data-engineering-project="MR-02"]').waitFor();check('뒤로 가기 처·과제 복원',new URL(page.url()).searchParams.get('project')==='MR-02');}
  }
  await page.setViewportSize({width:1440,height:1000});await page.goto(route(d.byId['EX11-01']));const ex=page.locator('#engineering-EX11-01');await ex.locator('#engineering-EX11-01-interfaces').scrollIntoViewIfNeeded();await page.screenshot({path:out+'/ERP-interfaces-1440.png'});check('ERP 본문 검토안 대조 측정식',await ex.innerText().then(s=>s.includes('대조한 검토안 수')));
  await page.goto(base+'index.html?dept=EX11&project=EX11-01#diagram-EX11-01-data');const img=page.locator('#diagram-EX11-01-data img');await img.evaluate(el=>{el.loading='eager';return el.decode()});check('ERP 데이터 그림 v4 실제 표시',(await img.getAttribute('src')).includes('EX11-01_data_v4.png')&&await img.evaluate(el=>el.naturalWidth===1672));await page.locator('#diagram-EX11-01-data').screenshot({path:out+'/ERP-data-v4-1440.png'});
  check('React 실행 오류 없음',errors.length===0);
 }finally{fs.writeFileSync(out+'/results.json',JSON.stringify({base,sha:sha||null,checks,errors,downloads},null,2)+'\n');await browser.close()}
 console.log('개발 설계 브라우저 '+checks.length+'항목 통과');
})().catch(e=>{console.error(e);process.exitCode=1});
