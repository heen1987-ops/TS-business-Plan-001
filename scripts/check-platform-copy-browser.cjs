const fs = require('node:fs');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const spec = require('../src/diagram-platform-corrections.json');
const manifest = require('../src/proposal-diagram-assets.json');
const reading = require('../src/integrated-reading.cjs');
const base = process.env.SITE_BASE || 'http://127.0.0.1:8792/TS-business-Plan-001/';
const sha = process.env.RELEASE_SHA;
const checks = [], errors = [];
const check = (name, pass) => { checks.push({ name, pass: !!pass }); assert(pass, name); };

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const out = 'qa-output/platform-copy/' + (sha ? 'public' : 'local') + '-browser';
  fs.mkdirSync(out, { recursive: true });
  page.on('pageerror', e => errors.push(e.message));
  try {
    if (sha) {
      const response = await page.request.get(base + 'version.json?v=' + sha);
      check('배포 커밋 일치', response.ok() && (await response.json()).commit === sha);
    }
    let cursor = 0;
    await Promise.all(Array.from({ length: 4 }, async () => {
      while (cursor < spec.assets.length) {
        const a = spec.assets[cursor++];
        const live = manifest.assets.find(x => x.id === a.id && x.type === a.type);
        const response = await page.request.get(base + live.path + '?v=' + live.sha256);
        check(a.id + '/' + a.type + ' PNG HTTP·SHA', response.ok() && crypto.createHash('sha256').update(await response.body()).digest('hex') === live.sha256);
      }
    }));
    const samples = [
      ['MR-02', 'service'], ['DF-01', 'data'], ['AD-01', 'overall'],
      ['PK-01', 'service'], ['EX06-01', 'data'], ['QE-01', 'environment'],
      ['RI-01', 'overall'], ['EX26-01', 'environment'],
    ];
    for (const [id, type] of samples) {
      const row = reading.rows.find(r => r.projects.some(p => p.id === id));
      const live = manifest.assets.find(a => a.id === id && a.type === type);
      await page.goto(base + 'index.html?dept=' + row.key + '&project=' + id + '&v=' + (sha || 'copy-review') + '#diagram-' + id + '-' + type);
      const section = page.locator('#diagram-' + id + '-' + type), img = section.locator('img');
      await img.waitFor();
      await img.evaluate(el => { el.loading = 'eager'; return el.decode(); });
      check(id + '/' + type + ' 실제 교정본 표시', (await img.getAttribute('src')).endsWith(live.path) && await img.evaluate(el => el.naturalWidth === 1672 && el.naturalHeight === 941));
      check(id + '/' + type + ' 확대 링크·교정 캡션', (await section.locator('.proposal-diagram-image').getAttribute('href')).endsWith(live.path) && (await section.locator('figcaption').innerText()).includes(live.businessDate?'업무 설명 개정본 v3':'한글 표기 교정본 v2'));
      check(id + '/' + type + ' 탐색·반응형 보존', await page.locator('[data-department-link]').count() === 51 && await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
      if (['MR-02', 'DF-01', 'AD-01'].includes(id)) await section.locator('.proposal-diagram-image').screenshot({ path: out + '/' + id + '-' + type + '.png' });
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base + 'index.html?dept=MR&project=MR-02&v=' + (sha || 'copy-review') + '#diagram-MR-02-service');
    const mobile = page.locator('#diagram-MR-02-service img');
    await mobile.waitFor();
    await mobile.evaluate(el => { el.loading = 'eager'; return el.decode(); });
    check('모바일 교정본·가로 넘침', (await mobile.getAttribute('src')).endsWith(manifest.assets.find(a=>a.id==='MR-02'&&a.type==='service').path) && await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
    const popupPromise = page.waitForEvent('popup');
    await page.locator('#diagram-MR-02-service .proposal-diagram-image').click();
    const popup = await popupPromise;
    await popup.waitForLoadState();
    check('원본 확대 새 탭의 교정 경로', popup.url().endsWith(manifest.assets.find(a=>a.id==='MR-02'&&a.type==='service').path));
    await popup.close();
    await page.screenshot({ path: out + '/mobile.png' });
    check('브라우저 실행 오류 없음', errors.length === 0);
  } finally {
    fs.writeFileSync(out + '/results.json', JSON.stringify({ base, sha: sha || null, checks, errors }, null, 2) + '\n');
    await browser.close();
  }
  console.log('플랫폼 교정본 브라우저 ' + checks.length + '항목 통과');
})().catch(e => { console.error(e); process.exitCode = 1; });
