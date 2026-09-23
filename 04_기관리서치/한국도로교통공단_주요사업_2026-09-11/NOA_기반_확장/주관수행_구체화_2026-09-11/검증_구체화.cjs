const fs=require('node:fs'),path=require('node:path'),{pathToFileURL,fileURLToPath}=require('node:url');
const {chromium}=require(require.resolve('playwright',{paths:['C:/Users/김희섭/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules']}));
const root=__dirname, checks=[];
const read=n=>JSON.parse(fs.readFileSync(path.join(root,n),'utf8'));
const check=(name,pass,detail='')=>{checks.push({name,pass:!!pass,detail});};
(async()=>{
 const map=read('후보_기술매핑.json'),contract=read('공통대조_입출력계약.json'),sample=read('합성_검토사례.json'),sources=read('추가근거_원장.json');
 const prior=JSON.parse(fs.readFileSync(path.join(root,'../병렬조사_2026-09-11/후보별_검토결과.json'),'utf8'));
 const ids=map.services.map(s=>s.id), expected=[...prior.services.map(s=>s.id),'KR-H01','KR-H02','KR-H03'];
 check('기존 7개와 추가 3개 ID 보존',ids.length===10&&new Set(ids).size===10&&expected.every(id=>ids.includes(id)));
 check('5개 패턴에서 10개 ID를 정확히 한 번 연결',map.patterns.length===5&&map.patterns.flatMap(p=>p[2]).length===10&&new Set(map.patterns.flatMap(p=>p[2])).size===10&&map.patterns.flatMap(p=>p[2]).every(id=>ids.includes(id)));
 check('재사용 패턴과 기관별 조건 보존',map.services.every(s=>s.pattern&&s.blocker&&s.product_verified===false));
 const req=new Set(contract.requirements.map(r=>r[0]));
 check('공통 요구 14개 고유 ID',contract.requirements.length===14&&req.size===14);
 check('합성 사례의 요구 참조 유효',sample.cases.every(c=>c.requirement_ids.every(id=>req.has(id))));
 check('공통 요구 전부에 사례 참조 존재',new Set(sample.cases.flatMap(c=>c.requirement_ids)).size===req.size);
 check('합성 14개, 실제 모델 결과 0개',sample.cases.length===14&&new Set(sample.cases.map(c=>c.id)).size===14&&sample.cases.every(c=>c.synthetic&&c.model_result===null));
 check('사람 검토와 안전 종료 구분',contract.state_meaning.REVIEWED.includes('아님')&&contract.output.official_outcome.includes('미결정'));
 check('추가 근거 6개 고유 ID',sources.length===6&&new Set(sources.map(s=>s.id)).size===6);
 check('공식 제품 본문의 수집 해시 보존',sources.slice(0,2).every(s=>/^[0-9a-f]{64}$/.test(s.retrieved_html_sha256)));
 const md=fs.readFileSync(path.join(root,'CCK_NOA_주관수행_구체화.md'),'utf8');
 check('예산·기관·인프라·미실행 경계', ['신규 인프라 투자 0원','KoROAD 예산','실제 LLM 성능 시험은 아직 수행하지 않았다','합성 14개 통과를 운영 정확도'].every(t=>md.includes(t)));
 for(const file of ['CCK_NOA_주관수행_구체화.md','후속확인_대기열.md']){
  const text=fs.readFileSync(path.join(root,file),'utf8');
  const links=[...text.matchAll(/\]\(([^\n)]+)\)/g)].map(m=>m[1]).filter(h=>!/^https?:|^#/.test(h));
  check(file+' 내부 연결',links.every(h=>fs.existsSync(path.resolve(root,decodeURIComponent(h.split('#')[0])))),`${links.length}개`);
 }
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
   const page=await browser.newPage({viewport:{width,height}}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.route(/^https?:/,r=>r.abort());
   await page.goto(pathToFileURL(path.join(root,'CCK_NOA_주관수행_구체화.html')).href,{waitUntil:'load'});
   const state=await page.evaluate(()=>({title:document.title,h1:document.querySelectorAll('h1').length,body:document.body.innerText,overflow:document.documentElement.scrollWidth>innerWidth+2,lang:document.documentElement.lang}));
   check(name+' 본문·표 표시',state.h1===1&&ids.every(id=>state.body.includes(id))&&state.body.includes('SC-14'));
   check(name+' 페이지 가로 넘침 없음',!state.overflow);
   check(name+' JavaScript 오류 없음',errors.length===0,errors.join('\n'));
   check(name+' 한국어 문서',state.lang==='ko');
   const links=await page.locator('a[href]').evaluateAll(nodes=>nodes.map(a=>({href:a.href,raw:a.getAttribute('href')})));
   const local=links.filter(l=>l.href.startsWith('file:')&&!l.raw.startsWith('#'));
   check(name+' HTML 내부 파일 연결',local.every(l=>fs.existsSync(fileURLToPath(new URL(l.href)))),`${local.length}개`);
   check(name+' 목차 앵커',await page.evaluate(()=>[...document.querySelectorAll('nav a')].every(a=>document.getElementById(a.hash.slice(1)))));
   await page.keyboard.press('Tab');
   check(name+' 키보드 첫 목차 접근',await page.evaluate(()=>document.activeElement.matches('nav a')));
   await page.screenshot({path:path.join(root,'검증_'+name+'.png')});
   await page.close();
  }
 }finally{await browser.close();}
 const report={date:'2026-09-11',scope:'문서·구조화 데이터·기본 HTML 표시 검증. NOA/로컬 LLM·기관 API·실제 업무 검증 아님',checks,passed:checks.filter(c=>c.pass).length,failed:checks.filter(c=>!c.pass).length,model_runs:0};
 fs.writeFileSync(path.join(root,'검증결과.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));
 if(report.failed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
