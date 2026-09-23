/* 로컬 산출물의 범위·링크·도식 배치·탐색을 검증한다. 법적 판단 검증은 아님. */
const fs = require('fs');
const path = require('path');
const { pathToFileURL, fileURLToPath } = require('url');
const crypto = require('crypto');
const { chromium } = require(require.resolve('playwright', { paths: ['C:/Users/김희섭/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'] }));
const base = __dirname;
const root = path.dirname(base);
const checks = [];
function check(name, pass, detail = null) { checks.push({ name, pass: !!pass, detail }); }
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const expected = ['TS-BIZ-002','TS-BIZ-004','TS-BIZ-005','TS-BIZ-006','TS-BIZ-007'];

(async () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(base,'생성_기록.json'),'utf8'));
  check('현행 검토대상 5개 ID', JSON.stringify(manifest.active_ids) === JSON.stringify(expected));
  check('유보·제외 3건 이력 분리', JSON.stringify(manifest.historical_ids) === JSON.stringify(['TS-BIZ-001','TS-BIZ-003','TS-BIZ-008']));
  for (const [name, sha] of Object.entries(manifest.input_hashes)) check('입력 최신성 '+name, hash(fs.readFileSync(path.join(root,name))) === sha);
  for (const [name, sha] of Object.entries(manifest.outputs)) check('출력 무결성 '+name, hash(fs.readFileSync(path.join(base,name))) === sha);
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1500, height: 1050 }, reducedMotion:'reduce' });
  const errors = [], external = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', req => { if (/^https?:/.test(req.url())) external.push(req.url()); });
  const url = pathToFileURL(path.join(base,'사업기획_구상보기.html')).href;
  await page.goto(url);
  await page.locator('.diagram').first().evaluate(img => img.decode());
  check('사업 카드 수', await page.locator('.candidate-nav a').count() === 5);
  check('국민 중심 제목·첫 질문', (await page.locator('h1').innerText()).includes('국민이 체감하는') && (await page.locator('main').innerText()).includes('누가 겪는 어떤 불편·위험'));
  const citizen = JSON.parse(fs.readFileSync(path.join(base,'국민체감_재검토.json'),'utf8')).candidates;
  check('기존 후보의 차등 재검토', Object.values(citizen).filter(c=>c.decision==='구체화 검토').length===2 && citizen['TS-BIZ-004'].decision==='수행 근거 선확인' && citizen['TS-BIZ-006'].decision==='문제 재발굴' && citizen['TS-BIZ-007'].decision==='AI 필요성 재검토');
  check('이전 구현 가설은 기본 접힘', await page.locator('details').count()===5 && await page.locator('details[open]').count()===0);
  check('AX 2건·디지털전환 3건', await page.locator('.candidate-nav a').filter({hasText:'· AX 전환'}).count() === 2 && await page.locator('.candidate-nav a').filter({hasText:'디지털전환+AI+정보화'}).count() === 3);
  for (const id of expected) {
    const card = page.locator('.candidate-nav a[href="#'+id+'"]');
    await card.click();
    check('후보별 이동 '+id, new URL(page.url()).hash === '#'+id && await page.locator('#'+id).isVisible());
    const section = await page.locator('#'+id).evaluate(h => {
      let s = ''; for(let n=h.nextElementSibling;n && !['H2','H3'].includes(n.tagName);n=n.nextElementSibling) s+=n.textContent+'\n'; return s;
    });
    check('필수 기획 항목 '+id, ['비중복 미확정','문제정의','비AI','최소 실증','국민 성과','실패·권익','비용 산정','기관·법령','국내외','P01','P07','미확정'].every(t=>section.includes(t)));
    check('국민 WHY·효율성·파급력 '+id, ['왜 해야 하는가',citizen[id].why,citizen[id].decision,'효율적인 작은 시작','국민이 체감할 효과','효과를 넓힐 경로'].every(t=>section.includes(t)));
  }
  await page.locator('header a[href="#overview"]').focus();
  await page.keyboard.press('Enter');
  check('키보드 목차 이동', new URL(page.url()).hash === '#overview');
  await page.locator('.candidate-nav a').first().focus();
  await page.keyboard.press('Enter');
  check('키보드 후보 이동', new URL(page.url()).hash === '#TS-BIZ-002');
  await page.locator('summary').first().focus();
  await page.keyboard.press('Enter');
  check('키보드 상세 열기', await page.locator('details[open]').count()===1);
  await page.keyboard.press('Enter');
  check('키보드 상세 닫기', await page.locator('details[open]').count()===0);
  const links = await page.locator('a[href],img[src]').evaluateAll(nodes => nodes.map(n=>n.href||n.src));
  const badLinks = [];
  for (const href of links) {
    if (!href.startsWith('file:')) continue;
    const u = new URL(href), disk = fileURLToPath(u);
    if (!fs.existsSync(disk)) badLinks.push(href);
    if (disk === path.join(base,'사업기획_구상보기.html') && u.hash && !(await page.locator('[id="'+u.hash.slice(1)+'"]').count())) badLinks.push(href);
  }
  check('로컬 문서·그림·목차 링크', badLinks.length === 0, {count:links.length, invalid:badLinks});
  const desktopOverflow = await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
  check('데스크톱 본문 가로 넘침 없음', !desktopOverflow);
  await page.goto(url+'#overview');
  await page.locator('.diagram').first().screenshot({path:path.join(base,'QA_마인드맵.png')});
  for (const width of [768,360,320]) {
    await page.setViewportSize({width,height:900});
    await page.goto(url+'#TS-BIZ-002');
    check(width+'px 본문 가로 넘침 없음', await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    if(width<=360) {
      check(width+'px 기획 2열 표 전체 폭 읽기', await page.locator('table.two-col').first().evaluate(t=>t.getBoundingClientRect().width<=innerWidth-30));
      check(width+'px 도식 대체 후보 목록 5개', await page.locator('.candidate-nav a').count()===5 && await page.locator('.candidate-nav a').first().isVisible());
    }
    if(width===360) {
      await page.screenshot({path:path.join(base,'QA_모바일.png')});
      await page.goto(url+'#overview');
      await page.locator('.candidate-nav').screenshot({path:path.join(base,'QA_모바일_목록.png')});
    }
  }
  for(const name of ['TS_신규사업_마인드맵.svg','TS_사업화_흐름도.svg']) {
    await page.setViewportSize({width:1500,height:1100});
    await page.goto(pathToFileURL(path.join(base,name)).href);
    await page.evaluate(()=>document.fonts.ready);
    const clipping = await page.evaluate(()=>{
      const rects = [...document.querySelectorAll('rect')].map(r=>r.getBBox()).filter(b=>b.width>100 && b.height>80);
      return [...document.querySelectorAll('text')].flatMap(t=>{
        const b=t.getBBox(), x=+t.getAttribute('x'), y=+t.getAttribute('y');
        const parent = rects.filter(r=>x>=r.x && x<r.x+r.width && y>=r.y && y<r.y+r.height).sort((a,b)=>a.width*a.height-b.width*b.height)[0];
        return parent && (b.x+b.width>parent.x+parent.width-4 || b.y+b.height>parent.y+parent.height-4) ? [{text:t.textContent, bounds:{x:b.x,y:b.y,width:b.width,height:b.height}}] : [];
      });
    });
    check(name+' 텍스트가 노드 영역 안에 배치', clipping.length===0, clipping);
    check(name+' 접근성 제목·설명', await page.locator('title').count()===1 && await page.locator('desc').count()===1);
    if(name.includes('흐름도')) {
      await page.goto(url+'#process');
      await page.locator('.diagram').nth(1).evaluate(img=>img.decode());
      await page.locator('.diagram').nth(1).screenshot({path:path.join(base,'QA_사업화흐름.png')});
    }
  }
  check('스크립트 오류 없음', errors.length===0, errors);
  check('외부 네트워크 호출 없음', external.length===0, external);
  await browser.close();
  const result={checked_at:new Date().toISOString(),pass:checks.every(c=>c.pass),passed:checks.filter(c=>c.pass).length,total:checks.length,checks};
  fs.writeFileSync(path.join(base,'화면_검증결과.json'),JSON.stringify(result,null,2)+'\n','utf8');
  console.log(JSON.stringify({pass:result.pass,passed:result.passed,total:result.total,failed:checks.filter(c=>!c.pass)},null,2));
  if(!result.pass) process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
