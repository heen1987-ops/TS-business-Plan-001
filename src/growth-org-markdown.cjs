'use strict';
const d=require('./growth-org-rollout.cjs'),m=require('./growth-ministry-map.cjs');
const table=(heads,rows)=>['| '+heads.join(' | ')+' |','| '+heads.map(()=>'---').join(' | ')+' |',...rows.map(row=>'| '+row.map(v=>String(v??'').replace(/\|/g,'\\|').replace(/\r?\n/g,'<br>')).join(' | ')+' |')].join('\n');
module.exports=()=>[
 '# 0 1차 고도화: 조직·직무 기반 사용자 인식과 업무 맥락 자동 분류','',d.intro,'',d.boundary,'',
 '## '+d.identityDifference.title,'',d.identityDifference.personalization,'',d.identityDifference.organizationNative,'',d.identityDifference.limit,'',
 table(['사용자 요구','목표 동작','개발·검수 연결'],d.userNeeds.map(x=>[x.title,x.detail,[...x.requirementIds,...x.testIds].join(' · ')])),'',
 table(['우선 단계','작업','산출물','진입 기준'],d.priorityStages.map(x=>[x.title,x.action,x.output,x.gate])),'',
 '## 공식 매핑 필드와 규칙','',table(['구분','필드','처리 규칙'],d.mappingContract.map(x=>[x.title,x.fields.join(' · '),x.rule])),'',
 '## 부처·기관 관계와 업무 확장','',m.note,'',
 table(['부처/정책 분야','기관','관계 유형','확인 범위','업무 후보(제안)','미확인'],m.rows.map(x=>[x.ministry,x.agency,x.relationLabel,x.confirmed.join(' · '),x.workExamples.join(' · '),x.unknowns.join(' · ')])),'',
 ...m.rows.flatMap(x=>x.sources.map(s=>'- ['+s.title+']('+s.url+') — '+s.readLevel+' / '+s.publishedOrEffective+' / 확인일 '+s.checkedAt+' / '+s.note)),'',
 '## TS 부서·직무·업무 매핑','',...d.pilotWorkflows.flatMap(x=>[
  '### '+x.id+' '+x.name,'',x.organizationUse,'','요청 예시: '+x.request,'',
  table(['조직 관측','코드','담당업무 후보','출처·관측일'],x.organizations.map(o=>[o.path,o.orgCode,o.dutyCandidates.map(z=>z.text).join(' · '),'[공식 원문]('+o.sourceUrl+') · '+o.observedAt])),'',
  ...x.jobRoles.map(z=>'- '+z),'',x.supportResult,'',x.additionalOrganizationNeed,'',
  '필요 근거: '+x.neededEvidence.join(' · '),'','추가 기능: '+x.additionalFunctions.join(' · '),'',
  '개발: '+x.requirementIds.join(' · '),'','검수: '+x.testIds.join(' · '),'','기존 인수: '+x.annualTestId+' · '+x.annualCriterion,''
 ]),
 '## 조직 네이티브 검수','',table(['항목','시나리오','기대 결과','증거','시험 연결'],d.acceptance.map(x=>[x.title,x.scenario,x.expected,x.evidence,x.testIds.join(' · ')])),'',d.acceptanceRule,'',d.costBoundary,''
].join('\n');
