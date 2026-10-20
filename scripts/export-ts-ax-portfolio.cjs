'use strict';
const fs=require('node:fs'),path=require('node:path'),d=require('../src/ts-ax-portfolio-2027.cjs');
const bullets=a=>a.map(s=>'- '+s).join('\n');
function markdown(){
 const parts=['# '+d.title,'기준일: '+d.date+' · '+d.status,'근거: '+d.basis,'[TS 공식 12대 전략체계]('+d.strategySource.url+')','## 1. 추진 방향',d.principle,d.boundary,'## 2. 100건 종합 시사점','고유 사례 100건. 연결 과제는 복수 매핑 가능. 성과 구분: '+Object.entries(d.counts).map(([k,v])=>k+' '+v+'건').join(' / ')];
 for(const f of d.findings)parts.push('### '+f.id+' '+f.title,f.finding,'- CCK 방향: '+f.decision+'\n- 검증: '+f.check+'\n- 근거: '+f.cases.map(id=>'['+id+' '+d.caseById[id].title+']('+d.caseById[id].sources[0].url+')').join(' · '));
 parts.push('## 3. 공통 기반·조직 이해','[문헌 기반 조직·역할·업무·권한·협업 상세설계](ts-org-native-design.md)',...d.layers.map(l=>'### '+l.title+'\n\n'+bullets(l.items)+'\n\n원천·책임: '+l.owner),d.identityRule,'### 업무 처리 흐름',d.flow.join(' → '),'### 누락자료 요청 예시',Object.entries(d.missingExample).map(([k,v])=>'- '+({request:'요청',known:'조직·업무 맥락',missing:'자료 상태',response:'응답 예시',resume:'재개'}[k])+': '+v).join('\n'));
 for(const c of d.common)parts.push('### '+c.id+' '+c.title,'- 기간: '+c.period+'\n- 책임: '+c.lead+'\n- 재사용: '+c.reuse+'\n- 추가 개발: '+c.add+'\n- 산출물: '+c.deliverable+'\n- 검수: '+c.tests.join(', ')+'\n- 시험 입력: '+c.sample+'\n- 판정: '+c.criterion);
 parts.push('## 4. CCK 기술 근거');
 for(const t of d.technology)parts.push('### '+t.id+' '+t.name,'- 상태: '+t.stage+'\n- 근거: '+t.evidence+'\n- 재사용: '+t.reuse+'\n- 추가분: '+t.delta+'\n- 적용 범위: '+t.boundary);
 parts.push('## 5. 우선순위·추진 순서','우선순위는 기술 적합성·의존성·자료/정답 확보·오류 영향을 고려한 CCK 기획 판단. 기관 확정 투자순위와 구분.');
 for(const p of d.priorities)parts.push('### '+p.id+' '+p.label,'- 전략: '+p.strategies.join(', ')+'\n- 근거: '+p.rule+'\n- 착수: '+p.when);
 for(const r of d.roadmap)parts.push('### '+r.period+' '+r.title,bullets(r.items),r.gate);
 parts.push('기존 9개월 공통 기반 기획에 연결한 상대 일정. 실제 자원·자료·범위 합의 후 수행. P2·P3는 별도 부서별 범위 결정.','## 6. 전략과제별 서비스 기획');
 for(const p of d.plans){
 parts.push('### '+p.id+' '+p.strategy,'**'+p.name+' · '+p.priority+' '+d.priorityById[p.priority].label+'**','- 업무 주관안: '+p.leader.name+'\n- 협업: '+p.departments.filter(o=>o.code!==p.lead).map(o=>o.name).join(' · ')+'\n- AS-IS: '+p.problem+'\n- TO-BE: '+p.scope+'\n- 우선순위 근거: '+p.reason+'\n- 착수: '+d.priorityById[p.priority].when+'\n- 법령·업무 근거: '+p.basisNote,'업무분장 연결:\n'+p.dutyBindings.map(b=>'- '+b.name+' / '+b.job+' / '+(b.duties.join(' · ')||b.status)+' / '+b.locator).join('\n'),'처리: '+p.flow.join(' → '),'CCK 재사용:\n'+p.assets.map(([id,use])=>'- '+d.technologyById[id].name+': '+use).join('\n'),'추가 개발 · '+p.requirement+'\n'+bullets(p.delta),'- 결과물: '+p.output+'\n- 공통 기반: '+p.foundation+'\n- 구축 연결: '+p.packages.join(', ')+'\n- 공통 검수: '+p.commonTests.join(', ')+'\n- 부서별 검수: '+p.test+'\n- 시험 입력: '+p.sample+'\n- 판정: '+p.pass+'\n- 증적: 동결 정답·원문 위치·입출력·검토 수정·재시험 로그\n- 기대효과: '+p.effect+'\n- 측정: '+p.metric+'\n- 적용 경계: '+p.boundary,'채택 사례:\n'+p.cases.map(ref=>{const c=d.caseById[ref.id];return '- ['+ref.id+' '+c.title+']('+c.sources[0].url+') / '+c.verdict+' / '+ref.role+'\n  - 확인 결과: '+c.observed;}).join('\n'));
 }
 const e=d.evaluation;parts.push('## 7. 검수·효과 측정',e.status,e.population,e.truth,e.baseline,bullets(e.gates),bullets(e.formulas),e.rules,e.stop,'## 8. 100건 전체 → 전략 연결','기존 사례 원장의 전략 매핑 유지. 대표 사례 선정과 전체 사례 수의 구분. 아래 기여 내용은 CCK 분석·TS 적용 제안.');
 for(const c of d.caseCoverage)parts.push('- ['+c.id+' '+c.title+']('+c.source+') · '+c.verdict+' · '+c.strategies.join(', ')+'\n  - CCK 시사점: '+c.contribution);
 return parts.join('\n\n')+'\n';
}
function csv(){const header=['전략ID','전략과제','솔루션','우선순위','주관안','협업','범위','우선순위근거','CCK재사용','추가개발','산출물','공통기반','개발ID','검수ID','시험입력','판정','기대효과','측정','대표사례','근거범위'];return '\uFEFF'+[header,...d.plans.map(p=>[p.id,p.strategy,p.name,p.priority,p.leader.name,p.departments.filter(o=>o.code!==p.lead).map(o=>o.name).join(' / '),p.scope,p.reason,p.assets.map(([id,use])=>d.technologyById[id].name+': '+use).join(' / '),p.delta.join(' / '),p.output,p.foundation,p.requirement,p.test,p.sample,p.pass,p.effect,p.metric,p.cases.map(c=>c.id+': '+c.role).join(' / '),d.status])].map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n')+'\r\n';}
function publicData(){return {...require('../src/ts-ax-portfolio-2027.json'),plans:d.plans,caseCoverage:d.caseCoverage,counts:d.counts};}
function files(){return {'ts-ax-portfolio-2027.md':markdown(),'ts-ax-portfolio-2027.csv':csv(),'ts-ax-portfolio-2027.json':JSON.stringify(publicData(),null,2)+'\n'};}
module.exports=dir=>{fs.mkdirSync(dir,{recursive:true});for(const [name,body] of Object.entries(files()))fs.writeFileSync(path.join(dir,name),body);};Object.assign(module.exports,{files,markdown,csv,publicData});
