const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),fs=require('node:fs'),data=require('../src/proposal-links.cjs'),law=require('../src/law-mapping.cjs');
const base=process.env.SITE_URL||'http://127.0.0.1:8773/TS-business-Plan-001/';
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true}),tests=[],errors=[];
 const check=(name,value)=>{tests.push({name,pass:!!value});if(!value)throw Error(name)};
 const p=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});p.on('pageerror',e=>errors.push(e.message));
 try{
 await p.goto(base+'proposal-links.html');await p.locator('.supplement-page h1').waitFor();
 check('전체37카드 연속본문',await p.locator('.supplement-profile').count()===37&&await p.locator('.supplement-profile details').count()===0);
 check('필수 공통·업무별 내용',(await p.locator('#proposal-technical-approval').textContent()).includes('개인정보')&&(await p.locator('#proposal-technical-approval').textContent()).includes('기준선 미확보'));
 await p.getByLabel('조직·업무 검색',{exact:true}).fill('기술승인');
 check('검색필터',await p.locator('.supplement-profile').count()>0&&await p.locator('.supplement-profile').count()<37);
 await p.getByLabel('조직·업무 검색',{exact:true}).fill('없는업무999');
 check('빈결과 명시',(await p.locator('.supplement-page').textContent()).includes('검색 결과 없음'));
 await p.getByRole('button',{name:'검색 초기화',exact:true}).click();check('초기화37',await p.locator('.supplement-profile').count()===37);
 await p.locator('.supplement-index a[href="#proposal-budget"]').click();check('문서내 목차이동',p.url().endsWith('#proposal-budget'));
 await p.goto(base+'index.html?node=technical-approval');await p.locator('.map-focus').waitFor();
 await p.locator('.map-document[href*="unit=technical-approval"]').click();await p.locator('.supplement-profile').waitFor();
 check('조직에서 실제 과업 이동',await p.locator('.supplement-profile').count()===1&&(await p.locator('.supplement-profile').getAttribute('data-profile'))==='technical-approval');
 await p.reload();await p.locator('.supplement-profile').waitFor();check('직접URL·새로고침',await p.locator('.supplement-profile').count()===1);
 await p.locator('.supplement-profile nav a[href*="legal/mapping"]').click();await p.locator('.mandate-law-list').waitFor();
 check('상세에서 법정관계 연결',await p.locator('[data-binding="B07"]').count()===1);
 await p.locator('[data-binding="B07"] a[href*="unit=technical-approval"]').click();await p.locator('.supplement-profile').waitFor();
 check('법정관계에서 상세 복귀',p.url().includes('unit=technical-approval'));
 await p.goto(base+'associations.html#proposal-B03');await p.locator('.association-page h1').waitFor();
 check('협회후보10개 조직매핑',await p.locator('[data-association]').count()===10);
 await p.locator('[data-association="B03"] a[href*="unit=technical-approval"]').click();await p.locator('.supplement-profile').waitFor();
 check('협회에서 상세 이동',p.url().includes('unit=technical-approval'));
 await p.goto(base+'associations.html#proposal-B08');await p.locator('[data-association="B08"]').waitFor();
 check('DRT 비교참고 표시',(await p.locator('[data-association="B08"] a').first().textContent()).includes('권한 차이 비교'));
 for(const id of ['ai-strategy','platform-scope']){await p.goto(base+'proposal-links.html?unit='+id);await p.locator('.supplement-profile').waitFor();check('미확정 담당 표시 '+id,(await p.locator('.supplement-profile').textContent()).includes('현재 배정된 것으로 간주하지 않음'))}
 await p.goto(base+'legal/mapping.html?mode=law');await p.locator('.mandate-law-list').waitFor();check('법정 미연결9개 실제 렌더',await p.locator('[data-binding]').count()===9);
 for(const item of data.legalLinks)check('법정카드별 연결 '+item.binding,await p.locator('[data-binding="'+item.binding+'"] a').count()===item.profiles.length);
 const response=await p.request.get(base+'downloads/proposal-links.json');check('JSON다운로드',response.ok()&&(await response.json()).profiles.length===37);
 const md=await p.request.get(base+'downloads/proposal-links.md');check('MD다운로드',md.ok()&&(await md.text()).includes('수락기준안'));
 await p.goto(base+'proposal-links.html?unit=does-not-exist');await p.locator('.supplement-profile').first().waitFor();check('잘못된ID 전체복구',await p.locator('.supplement-profile').count()===37);
 await p.goto(base+'proposal-links.html?unit=technical-approval');await p.locator('.supplement-profile').waitFor();
 await p.locator('.supplement-profile').scrollIntoViewIfNeeded();fs.mkdirSync('qa-output',{recursive:true});await p.screenshot({path:'qa-output/proposal-links-desktop.png'});
 await p.setViewportSize({width:390,height:844});check('모바일본문넘침없음',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
 check('모바일표내부스크롤',await p.locator('.supplement-table').first().evaluate(el=>el.scrollWidth>el.clientWidth));
 await p.getByRole('button',{name:'문서 목차 열기',exact:true}).click();await p.getByRole('textbox',{name:'목차 검색',exact:true}).fill('추가 조직');
 check('메뉴검색한곳에서진입',await p.locator('.doc-search-results a[href$="proposal-links.html"]').count()===1);
 await p.keyboard.press('Escape');check('목차Escape초점복귀',await p.locator('.doc-mobile-toggle').evaluate(el=>el===document.activeElement));
 await p.locator('.supplement-profile').scrollIntoViewIfNeeded();await p.screenshot({path:'qa-output/proposal-links-mobile.png'});
 await p.goto(base+'proposal-links.html');await p.locator('.supplement-page h1').waitFor();await p.getByLabel('조직·업무 검색',{exact:true}).focus();await p.keyboard.type('budget');check('입력키보드포커스',await p.getByLabel('조직·업무 검색',{exact:true}).evaluate(el=>el===document.activeElement));
 check('JS오류없음',errors.length===0);
 }finally{fs.mkdirSync('qa-output',{recursive:true});fs.writeFileSync('qa-output/proposal-links-browser.json',JSON.stringify({base,tests,errors},null,2));await browser.close()}
 console.log(JSON.stringify({checks:tests.length,passed:tests.filter(t=>t.pass).length,errors}));
})().catch(e=>{console.error(e);process.exitCode=1});
