'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const growth = require('../src/growth-ai.cjs');
const skills = require('../src/growth-skills.cjs');
const annual = require('../src/annual-work-2027.cjs');
const exporter = require('./export-growth-ai.cjs');
const root = path.resolve(__dirname, '..');
const out = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, 'dist/downloads');
const numbered = prefix => Array.from({ length: 12 }, (_, i) => prefix + String(i + 1).padStart(2, '0'));
const requirementIds = numbered('GAI-R');
const testIds = numbered('GAI-T');

function unique(items, label) {
  assert.equal(new Set(items).size, items.length, label + ' 중복 ID');
}
function textFields(record, keys, label) {
  for (const key of keys) assert.ok(typeof record[key] === 'string' && record[key].trim(), label + ' 필수 내용: ' + key);
}

// Every new requirement resolves to a test and to identifiers that really exist
// in the earlier workflow/annual baseline, rather than a copied range label.
assert.deepEqual(growth.requirements.map(r => r.id), requirementIds);
assert.deepEqual(growth.tests.map(t => t.id), testIds);
unique(growth.sections.map(s => s.id), '설계 절');
const workflow = fs.readFileSync(path.join(root, 'public/downloads/ts-public-workflow-2027-plan.md'), 'utf8');
const workflowIds = new Set([...workflow.matchAll(/^\|\s*(WF-R\d{2}|A\d{2})\s*\|/gm)].map(match => match[1]));
const oldIds = new Set([...workflowIds, ...annual.tests.map(test => test[0])]);
for (const requirement of growth.requirements) {
  textFields(requirement, ['name', 'delta', 'evidence', 'status'], requirement.id);
  assert.equal(requirement.testId, requirement.id.replace('GAI-R', 'GAI-T'));
  assert.ok(requirement.legacyIds.length, requirement.id + ' 기존 연결 없음');
  unique(requirement.legacyIds, requirement.id + ' 기존 연결');
  for (const id of requirement.legacyIds) assert.ok(oldIds.has(id), requirement.id + ' 미정의 기존 ID: ' + id);
  assert.match(requirement.status, /제안|미검증/);
}
for (const test of growth.tests) {
  textFields(test, ['name', 'scenario', 'criterion', 'status'], test.id);
  assert.match(test.status, /미수행/, test.id + ' 실제 시험과 구분');
}

// TS scope, quantities, exclusions, gates and annual acceptance remain owned
// by the existing 2027 ledger. Organization context is only an added layer.
assert.deepEqual(growth.tsBundles.map(b => b.id), ['W27-A', 'W27-B', 'W27-C', 'W27-D']);
for (const bundle of growth.tsBundles) {
  const original = annual.bundles.find(b => b.id === bundle.id);
  for (const key of ['name', 'rank', 'lead', 'partners', 'scope', 'workflow', 'skills', 'development', 'exclude', 'unit', 'gate', 'after', 'costParent']) {
    assert.deepEqual(bundle[key], original[key], bundle.id + ' 기존 원장 불일치: ' + key);
  }
  assert.equal(bundle.criterion, original.test);
  assert.equal(bundle.testId, bundle.id + '-T');
  assert.equal(bundle.status, annual.status);
  textFields(bundle, ['organizationContext', 'href'], bundle.id);
}
assert.deepEqual(growth.legacyTests.map(t => [t.id, t.name, t.criterion, t.evidence, t.owner]), annual.tests);
assert.deepEqual(growth.timeline.map(t => t.detail), annual.timing);
assert.equal(growth.deadline, annual.deadline);
for (const [key, value] of Object.entries(annual.cost)) assert.equal(growth.cost[key], value, '비용 원장: ' + key);
assert.equal(growth.cost.ownerId, 'C27-COM');
assert.equal(growth.cost.ownership, annual.common);
assert.equal(growth.cost.independence, annual.independence);
assert.match(growth.cost.ownership, /단 하나/);
assert.match(growth.cost.independence, /발주 불가/);
assert.match(growth.cost.independence, /파일 반입\/반출/);
assert.match(growth.cost.status, /미산정/);
assert.match(growth.cost.extension, /부족분|차분/);
assert.match(growth.cost.hospitalBoundary, /TS.*분리/);
assert.match(growth.status, /미검증/);
assert.match(growth.scope, /정적/);
assert.match(growth.scope, /실제.*제공하지 않/);
assert.ok(growth.hospital.every(item => /미확정|별도|보류|제외/.test(item.status)), '병원 적용은 기관 미확정·별도 검토 상태');
for (const source of growth.sources) {
  textFields(source, ['id', 'title', 'url', 'date', 'note'], '통합 설계 근거');
  assert.match(source.url, /^https:\/\/github\.com\/heen1987-ops\/(TS-business-Plan-001|CCK-Public-basic)\/blob\/[0-9a-f]{40}\//);
}

// Nine actual TS SKILL definitions and one separate tailoring methodology.
// Source confirmation is deliberately not an installation or operation claim.
const taskIds = ['ts-project-context', 'ts-deliverable-registry', 'ts-guide-reference', 'ts-schedule-baseline', 'ts-deliverable-author', 'ts-issue-reconcile', 'ts-deliverable-tracker'];
const entryIds = ['cck-ts', 'cck-ts-management'];
for(const key of ['requirementIds','testIds','annualIds'])assert.deepEqual(skills.skills.find(x=>x.id==='cck-ts-management')[key],skills.skills.find(x=>x.id==='cck-ts')[key],'호환 진입점의 연결 범위: '+key);
assert.equal(skills.skills.length, 10);
unique(skills.skills.map(skill => skill.id), '공공사업 스킬');
assert.deepEqual(skills.skills.filter(s => s.kind === 'task').map(s => s.id).sort(), taskIds.slice().sort());
assert.deepEqual(skills.skills.filter(s => s.kind === 'entry').map(s => s.id).sort(), entryIds.slice().sort());
assert.deepEqual(skills.skills.filter(s => s.kind === 'methodology').map(s => s.id), ['agency-tailoring-bank']);
const sourceCommit = 'c991e399507e1843072405dcd0a4fd4eb7392bd0';
const sourceRepo = 'heen1987-ops/CCK-Public-basic';
assert.equal(skills.sourceSnapshot.commit, sourceCommit);
assert.equal(skills.sourceSnapshot.repo, sourceRepo);
assert.match(skills.sourceSnapshot.scope, /미실시|미수행|수행하지 않/);
assert.equal(skills.sourceSnapshot.url, 'https://github.com/' + sourceRepo + '/commit/' + sourceCommit);
const tsPackage = skills.packages.find(item => item.id === 'cck-ts-management');
assert.ok(tsPackage, 'TS 스킬 패키지');
assert.equal(tsPackage.entryCount, entryIds.length);
assert.equal(tsPackage.taskCount, taskIds.length);
const validAnnualIds = new Set([...annual.bundles.map(b => b.id), ...annual.tests.map(t => t[0]), 'C27-COM']);
for (const skill of skills.skills) {
  textFields(skill, ['id', 'name', 'purpose', 'commonReuse', 'tsUse', 'hospitalAdaptation'], skill.id);
  for (const key of ['trigger', 'inputs', 'outputs']) assert.ok(Array.isArray(skill[key]) && skill[key].length, skill.id + ' ' + key);
  assert.equal(skill.status.source, 'confirmed', skill.id + ' 원문 확인');
  assert.equal(skill.status.design, 'mapped', skill.id + ' 설계 연결');
  assert.equal(skill.status.installation, 'not_run', skill.id + ' 설치 미실행');
  assert.equal(skill.status.operation, 'not_run', skill.id + ' 운영 미실행');
  assert.equal(skill.source.repo, sourceRepo);
  assert.equal(skill.source.commit, sourceCommit);
  const expectedPath = skill.kind === 'methodology'
    ? 'CCK-Agency-Management/skills/_agency-shared/workflow.md'
    : 'CCK-TS-Management/skills/' + skill.id + '/SKILL.md';
  assert.equal(skill.source.path, expectedPath, skill.id + ' 실제 원문 경로');
  assert.equal(skill.source.url, 'https://github.com/' + sourceRepo + '/blob/' + sourceCommit + '/' + expectedPath);
  for (const [key, valid] of [['requirementIds', new Set(requirementIds)], ['testIds', new Set(testIds)], ['annualIds', validAnnualIds]]) {
    assert.ok(Array.isArray(skill[key]) && skill[key].length, skill.id + ' 연결 없음: ' + key);
    unique(skill[key], skill.id + ' ' + key);
    for (const id of skill[key]) assert.ok(valid.has(id), skill.id + ' 미정의 ' + key + ': ' + id);
  }
  assert.deepEqual(skill.testIds.slice().sort(), skill.requirementIds.map(id => id.replace('GAI-R', 'GAI-T')).sort(), skill.id + ' 요구사항과 시험 연결');
}
function checkPinnedSources(value) {
  if (!value || typeof value !== 'object') return;
  if (value.repo && value.commit && value.path && value.url) {
    assert.equal(value.repo, sourceRepo);
    assert.equal(value.commit, sourceCommit);
    assert.equal(value.url, 'https://github.com/' + sourceRepo + '/blob/' + sourceCommit + '/' + value.path, '스킬·패키지·방법론 출처 고정');
  }
  for (const child of Object.values(value)) checkPinnedSources(child);
}
checkPinnedSources(skills);
unique(skills.acceptanceChecks.map(check => check.id), '스킬 수용 기준');
for (const check of skills.acceptanceChecks) {
  textFields(check, ['id', 'name', 'condition'], '스킬 수용 기준');
  assert.equal(check.status, 'proposed');
  for (const id of check.requirementIds) assert.ok(requirementIds.includes(id), check.id + ' 미정의 요구사항: ' + id);
  for (const id of check.testIds) assert.ok(testIds.includes(id), check.id + ' 미정의 시험: ' + id);
  assert.deepEqual(check.testIds.slice().sort(), check.requirementIds.map(id => id.replace('GAI-R', 'GAI-T')).sort(), check.id + ' 요구사항과 시험 연결');
}

function read(name) { return fs.readFileSync(path.join(out, name), 'utf8'); }
const aiMarkdown = read('growth-ai.md');
const skillsMarkdown = read('growth-skills.md');
assert.equal(aiMarkdown, exporter.aiMarkdown());
assert.equal(skillsMarkdown, exporter.skillsMarkdown());
assert.deepEqual(JSON.parse(read('growth-ai.json')), JSON.parse(JSON.stringify(growth)));
assert.deepEqual(JSON.parse(read('growth-skills.json')), JSON.parse(JSON.stringify(skills)));
for (const id of [...requirementIds, ...testIds, ...annual.tests.map(t => t[0])]) assert.ok(aiMarkdown.includes(id), '통합 설계 MD에서 빠진 ID: ' + id);
for (const section of growth.sections) assert.ok(aiMarkdown.includes(section.title), '통합 설계 MD에서 빠진 절: ' + section.id);
for (const skill of skills.skills) {
  assert.ok(skillsMarkdown.includes(skill.id), '스킬 MD에서 빠진 ID: ' + skill.id);
  assert.ok(skillsMarkdown.includes(skill.source.url), '스킬 MD에서 빠진 원문: ' + skill.id);
}

// Parse the published CSV independently so quoting, multiline fields and
// column alignment are checked in addition to byte-for-byte generation.
function parseCsv(value) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    if (char === '"') {
      if (quoted && value[i + 1] === '"') { field += '"'; i++; }
      else quoted = !quoted;
    } else if (char === ',' && !quoted) { row.push(field); field = ''; }
    else if ((char === '\r' || char === '\n') && !quoted) {
      if (char === '\r' && value[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += char;
  }
  assert.equal(quoted, false, 'CSV 인용부호 미종결');
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}
const csv = read('growth-ai-trace.csv');
assert.equal(csv, exporter.csv());
assert.equal(csv.charCodeAt(0), 0xfeff, '한글 CSV UTF-8 BOM');
const rows = parseCsv(csv.slice(1));
assert.equal(rows.length, 13, 'CSV 헤더와 12개 요구사항');
assert.ok(rows.every(row => row.length === 11), 'CSV 열 수');
for (const [index, row] of rows.slice(1).entries()) {
  const requirement = growth.requirements[index];
  const test = growth.tests.find(t => t.id === requirement.testId);
  assert.equal(row[0], requirement.id);
  assert.equal(row[3], requirement.legacyIds.join(' · '));
  assert.equal(row[4], test.id);
  assert.equal(row[6], test.scenario);
  assert.equal(row[7], test.criterion);
  assert.equal(row[8], requirement.evidence);
  assert.equal(row[10], test.status);
}

const publicText = [aiMarkdown, skillsMarkdown, read('growth-ai.json'), read('growth-skills.json'), csv].join('\n');
assert.doesNotMatch(publicText, /[A-Z]:[\\/]|file:\/\/\/|sandbox:|OneDrive|chatgpt-conversation:|https?:\/\/[^\s/]*slack\.com\//, '개인 경로·비공개 대화 원문 링크 공개 금지');
assert.doesNotMatch(publicText, /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\bgh[pousr]_[A-Za-z0-9_]{20,}|\bsk-[A-Za-z0-9]{20,}/, '자격증명 공개 금지');
assert.doesNotMatch(publicText, /\bundefined\b|\[object Object\]/, '내려받기 직렬화 오류');

console.log('GROWTH AI 정적 검증 통과: 12요구→12시험·기존 ID 연결·W27 4묶음/연간 기준 보존·공통비용 1회·미검증 상태·TS 9스킬과 별도 방법론·고정 원문·MD/JSON/CSV 5종 정합. 실제 기관 연계·권한·AI 성능 시험과 구분.');
