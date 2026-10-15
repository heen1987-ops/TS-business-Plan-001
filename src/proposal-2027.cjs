const orgPlatform=require('./org-platform-2027.cjs');
'use strict';
const source = require('./ts-2027-proposal.json');
const growth = require('./growth-ai.cjs');
const annual = require('./annual-work-2027.cjs');

function section(heading) {
  const start = source.blocks.indexOf(heading);
  if (start < 0) throw new Error('제안서 절 누락: ' + heading);
  const end = source.blocks.findIndex((b, i) => i > start && /^#{1,2} /.test(b));
  return source.blocks.slice(start + 1, end < 0 ? undefined : end);
}
function table(heading) {
  const block = section(heading).find(b => b.startsWith('|'));
  if (!block) throw new Error('제안서 표 누락: ' + heading);
  const rows = block.split('\n').map(line => line.trim().slice(1, -1).split('|').map(s => s.trim()));
  if (rows.some(row => row.length !== rows[0].length)) throw new Error('제안서 표 열 불일치: ' + heading);
  return {headers: rows[0], rows: rows.slice(2)};
}
const chapters = source.blocks.filter(b => /^# /.test(b)).map(b => ({id:'chapter-'+b.match(/^# (\d+)/)[1], title:b.slice(2)}));
const requirements = table('## 5.3 추가 개발과 산출물').rows.map(([name,scope,evidence,testId]) => {
  const id = name.split(' ')[0], old = growth.requirements.find(r => r.id === id);
  if (!old || old.testId !== testId) throw new Error('기존 요구·검수 연결 불일치: ' + id);
  return {id,name:name.slice(id.length+1),scope,evidence,testId,legacyIds:old.legacyIds};
});
const tests = table('## 8.2 공통 기능 검수').rows.map(([name,scenario,criterion]) => ({id:name.split(' ')[0],name:name.split(' ').slice(1).join(' '),scenario,criterion}));
const bundles = table('## 3.3 업무별 물량과 선택 조건').rows.map(([name,scope,gate],i) => {
  const id = name.split(' ')[0], old = annual.bundles.find(b => b.id === id);
  if (!old) throw new Error('기존 업무 연결 누락: ' + id);
  return {id,name:old.name,scope,gate,lead:old.lead,priority:'조직 기반 인수 후 적용 후보',href:'growth-ai.html#growth-'+id};
});
const downloads = [
  {to:'downloads/ts-2027-proposal.md',label:'제안서 전문 · Markdown',download:true},
  {to:'downloads/ts-2027-proposal.html',label:'제안서 전문 · 인쇄용 HTML',download:true},
  {to:'downloads/ts-2027-proposal-trace.csv',label:'개발·검수 연결표 · CSV',download:true}
];
module.exports = {
 source,chapters,requirements,tests,bundles,downloads,table,
 title:"TS 조직 네이티브 AI 플랫폼 · 2027 사업 제안",
 navTitle:'TS 2027 사업 제안서 초안',
 eyebrow:"PROPOSAL DRAFT · 2026.10.16 · v0.2",
 subtitle:"조직마다 다른 임무·책임·관할·업무 방식을 플랫폼에 연결합니다. 공식 조직정보로 사용자와 역할을 이해하는 기반을 먼저 인수합니다.",
 trace:orgPlatform.chain,
 intro:source.blocks[1].replaceAll('**',''),
 status:'제안 초안 · 발주 범위·예산·착수일 미확정 · 실제 구현·데이터 접근 미검증',
 cards:[
  {value:'조직 네이티브 AI',label:'1차 고도화의 중심',detail:'공식 식별 → 시점별 조직·직무 → 업무 맥락 → 권한 검증'},
  {value:'최대 9개월',label:'추진 일정 제안',detail:'M2 조직·역할 합의 / M5 통합 / M7 기반 검증 / M9 기반 인수'},
  {value:'12개 개발·검수 연결',label:'조직 기반의 추가 개발·검수',detail:'GAI-R01~R12 ↔ GAI-T01~T12 / W27·Y27 기존 검수 연결'}
 ],
 sections:[['proposal-scope','범위와 재사용'],['proposal-mapping','부서·직무·업무'],['proposal-timeline','추진 일정'],['proposal-acceptance','개발·검수 연결'],['proposal-downloads','제안서 전문']],
 scopeNote:"1차 사업은 조직 기반의 구축과 운영 인수입니다. 대표 사례는 조직 유형·역할·협업·인사이동 차이를 검증할 최소 범위로 M2까지 합의합니다. W27-A~D 전체 구축, 국민서비스 공개 운영, 병원·타 기관 전용 구축은 자동 포함하지 않습니다.",
 boundaries:[
  {title:'기존 기능 재사용',text:'NOA·대화·검색·RAG·문서·회의록·인증·로그·연계는 최종 계약, 설치판, 사용권과 시험 증거를 확인한 뒤 재사용합니다.'},
  {title:'추가 개발',text:'공식 ID 매핑, 시간에 따른 조직·직무 관계, 변경 대사, 업무 맥락, 정책 적용과 회수, 근거·상태·인계의 부족분을 개발합니다.'},
  {title:'비용과 적용 범위',text:'공통 차분 C27-COM은 조직 플랫폼 ON27-BASE에 한 번만 산정합니다. 사업비·인월은 미산정이며 병원·타 기관 전용 구축, 신규 GPU/NPU 구매는 현 범위에서 제외합니다.'}
 ],
 mapping:table('## 3.1 매핑 원장'),
 profiles:table('## 3.4 조직별 특성과 협업 모델'),
 workMapping:table('## 3.2 TS 부서와 업무 적용안'),
 mappingNote:'부서와 역할은 적용 후보입니다. 개인별 배정·전결·자료 접근권한은 공식 원천과 업무 책임자의 확인을 거쳐 확정합니다.',
 reuse:table('## 4.1 재사용 원칙'),
 timeline:table('## 7.1 9개월 추진 일정안').rows.map(([period,work,gate])=>({period,work,gate})),
 timingNote:'착수일부터 최대 9개월을 제안하며 2027년 말까지 인수하도록 조정합니다. 실제 착수일 지연 시 범위·일정을 다시 합의합니다.',
 gates:section('## 7.2 단계별 통과 조건').filter(b=>b.startsWith('- ')).map(b=>b.slice(2).replaceAll('**','')),
 acceptanceNote:section('## 8.1 검수 구성').slice(0,2).map(s=>s.replace(/\[([^\]]+)\]\([^)]+\)/g,'$1').replaceAll('**','')),
 legacyTests:table('## 8.3 선정 업무별 검수'),
 quality:table('## 8.4 품질 지표와 평가 방법'),
 handover:section('## 8.5 최종 인수 증빙'),
 labels:{profiles:'조직별 특성 매핑',workMapping:'후속 업무 적용 후보와의 연결',scope:'개발 범위',evidence:'납품 증빙',legacy:'기존 기획',test:'검수와 합격 조건 제안',lead:'주관 부서 제안',gate:'선택 조건',reuse:'재사용 후보와 추가 개발 차분',quality:'품질 지표와 측정',handover:'최종 인수 증빙',legacyTests:'후속 업무별 검수 후보',read:'제안서 전문 읽기 · 인쇄',source:'저장소의 제안서 원문',design:'GROWTH AI 통합 설계',annual:'TS 2027 기존 기획',toc:'전문 목차',downloadNote:'전문 13개 절과 개발·검수 연결표를 같은 제안서 원문에서 생성합니다. 인쇄용 문서는 브라우저에서 열어 인쇄하거나 PDF로 저장할 수 있습니다.'},
 sourceUrl:'https://github.com/heen1987-ops/TS-business-Plan-001/blob/main/src/ts-2027-proposal.json'
};
