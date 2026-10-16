'use strict';
const insights=require('../src/case-insights.cjs'),followup=require('../src/strategy-followup.cjs');
const list=a=>a.map(s=>'- '+s).join('\n');
function planMarkdown(p){return '### '+p.id+' '+p.strategy+'\n\n'+list(['추진: '+p.phase,'입력: '+p.input,'수행단계: '+p.steps.join(' → '),'결과물: '+p.output])+'\n\n#### 01 TS 담당 부서·실제 업무\n\n'+p.departments.map(b=>'**'+b.name+' · '+b.job+'**\n\n'+list(b.workItems.map(w=>w.id+' '+w.text+' / '+w.locator))+(b.restriction?'\n- 적용 조건: '+b.restriction:'')+(b.workItems.length?'':'\n- '+b.status)+'\n').join('\n')+'\n#### 02 CCK 재사용 후보\n\n'+list(p.reuseItems.map(r=>r.assetId+' '+r.use))+'\n- 기존 SSO·RAG·권한·로그·연계 범위 대조 후 차분 산정\n\n#### 03 추가 개발·검수\n\n'+list([...p.deliverables,'요구·검수: '+p.requirement+' → '+p.test,'시험 입력: '+p.acceptancePlan.sample,'판정: '+p.acceptancePlan.criterion,'증빙: '+p.acceptancePlan.evidence,'공통 검수: '+p.tests.join(' / '),'상태: 설계안 / 미실행'])+'\n\n#### 04 기대효과\n\n'+list([p.effect,p.formula,p.comparison,'TS 실측 전','AX 사례: '+p.caseRefs.map(r=>r.caseId).join(' / '),'플랫폼 사례: '+p.platformCases.join(' / '),'[전략 프롬프트](../index.html?view=strategy-prompts&strategy='+p.id+')'])+'\n';}
function detailedCaseMarkdown(c){
 const d=require('../src/case-designs.cjs').byId[c.id],s=insights.byId[c.id],a=d.service;
 return '\n### 업무·구축 범위\n\n'+list([d.purpose,'이용자: '+d.users,'범위: '+d.scope.join(' / '),'근거: '+d.basis,'성공·성립 조건: '+s.success.join(' / '),'실패 요인·위험: '+s.risks.join(' / ')])+
 '\n\n### 원문 도면\n\n'+a.figures.map(f=>'!['+f.title+'](../'+f.path+')\n\n'+f.status+' / '+f.caption+'\n').join('\n')+
 '\n\n### 세부 서비스 아키텍처\n\n'+a.status+'\n\n!['+d.purpose+'](../assets/casebook-designs/'+c.id+'.svg)\n\n'+list(a.components.map(n=>n.id+' '+n.title+' / '+n.detail))+
 '\n\n### 인터페이스·예외 처리\n\n'+list(a.interfaces.map(f=>f.id+' '+f.from+' → '+f.to+' / '+f.mode+' / 데이터: '+f.payload+' / 통제: '+f.check))+'\n- 원문 추출: '+a.facts.extracted+' / '+a.facts.locator+'\n- CCK 보완: '+a.facts.extension+'\n'+(a.source?'\n- 기술 출처: ['+a.source.title+']('+a.source.url+')\n':'')+
 '\n\n### 서비스·데이터 흐름\n\n'+d.sequence.map((n,i)=>(i+1)+'. '+n.title+' / 입력: '+n.input+' / 처리: '+n.process+' / 전달: '+n.output).join('\n')+'\n\n- 운영 환류: '+d.operations+'\n- 통제: '+s.control+'\n\n### 세부 기능·연계 명세\n\n'+list(d.benchmark.functions.map(f=>f.name+' / 입력: '+f.input+' / 처리: '+f.processing+' / 산출물: '+f.output))+'\n\n### 벤치마킹 재현·비교 시나리오\n\n'+list([d.benchmark.label,'정상: '+d.benchmark.normal,'예외: '+d.benchmark.exception,'증빙: '+d.benchmark.evidence])+'\n\n### CCK 관점의 시사점\n\n'+d.local+'\n';
}
module.exports={caseMarkdown:detailedCaseMarkdown,planMarkdown,followup};
