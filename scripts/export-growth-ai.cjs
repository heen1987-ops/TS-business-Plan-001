'use strict';

const fs = require('node:fs');
const path = require('node:path');
const growth = require('../src/growth-ai.cjs');
const skills = require('../src/growth-skills.cjs');

function aiMarkdown() { return growth.toMarkdown(); }
function skillsMarkdown() { return skills.toMarkdown(); }
function aiJson() { return JSON.stringify(growth, null, 2) + '\n'; }
function skillsJson() { return JSON.stringify(skills, null, 2) + '\n'; }

function csv() {
  const tests = new Map(growth.tests.map(test => [test.id, test]));
  const rows = [
    ['요구사항 ID', '기능', '추가 개발 차분', '기존 연결 ID', '검수 ID', '검수 항목', '재현 조건', '합격 조건 제안', '납품 증빙', '요구사항 상태', '검수 상태'],
    ...growth.requirements.map(requirement => {
      const test = tests.get(requirement.testId);
      if (!test) throw new Error('연결된 검수 항목 없음: ' + requirement.id + ' → ' + requirement.testId);
      return [requirement.id, requirement.name, requirement.delta, requirement.legacyIds.join(' · '), test.id, test.name, test.scenario, test.criterion, requirement.evidence, requirement.status, test.status];
    })
  ];
  return '\ufeff' + rows.map(row => row.map(value => '"' + String(value).replace(/"/g, '""') + '"').join(',')).join('\r\n') + '\r\n';
}

function exportGrowth(out) {
  if (typeof out !== 'string' || !out.trim()) throw new TypeError('내려받기 출력 폴더가 필요합니다.');
  fs.mkdirSync(out, { recursive: true });
  const files = {
    'growth-ai.md': aiMarkdown(),
    'growth-ai.json': aiJson(),
    'growth-ai-trace.csv': csv(),
    'growth-skills.md': skillsMarkdown(),
    'growth-skills.json': skillsJson(),
    'growth-framework.json': JSON.stringify(require('../src/growth-framework.json'),null,2)+'\n'
  };
  for (const [name, content] of Object.entries(files)) fs.writeFileSync(path.join(out, name), content, 'utf8');
}

module.exports = exportGrowth;
Object.assign(module.exports, { aiMarkdown, skillsMarkdown, aiJson, skillsJson, csv });

if (require.main === module) exportGrowth(process.argv[2]);
