import React from 'react';
import {Link} from './core.jsx';
import insights from './case-insights.cjs';
import followup from './strategy-followup.cjs';
import ax from './ax-casebook.cjs';
import './case-insight.css';
import designs from './case-designs.cjs';
import {CaseArchitecture} from './CaseArchitecture.jsx';
const List=({items})=><ul>{items.map((s,i)=><li key={i}>{s}</li>)}</ul>;
export function FollowupPlan({id,showCases=false}){
 const p=followup.byId[id];
 return <section className="case-followup" aria-label={p.id+' 후속 적용계획'}>
  <header><small>{p.id} · {p.phase} · 적용 설계안</small><h2>{p.plan}</h2><p>{p.strategy}</p></header>
  <ol className="case-pipeline">
   <li><span className="case-step">01</span><div><h3>TS 담당 부서·실제 업무</h3><p>{p.input}</p>
    <div className="case-departments">{p.departments.map((b,i)=><details key={b.code} open={i<2}><summary><strong>{b.name}</strong><span>{b.job}</span></summary>{b.workItems.length?<ul>{b.workItems.map(w=><li key={w.id}><Link to={'organization.html?view=work-map&org='+b.code+'&work='+w.id}>{w.text} ↗</Link><small>{w.id} · {w.locator}</small></li>)}</ul>:<small>{b.status}</small>}{b.restriction&&<small>{b.restriction}</small>}</details>)}</div>
    <ol className="case-workflow">{p.steps.map(s=><li key={s}>{s}</li>)}</ol><p><strong>결과물</strong> · {p.output}</p><Link to={'index.html?view=strategy&strategy='+p.id}>관계법령·부처·업무 근거 →</Link><small>부서 업무: 세칙 원문 / 협업·사업 역할: 적용 제안</small>
   </div></li>
   <li><span className="case-step">02</span><div><h3>CCK 재사용 기능</h3><div className="case-reuse">{p.reuseItems.map(r=>{const a=ax.assets.find(a=>a.id===r.assetId);return <div key={r.assetId}><strong>{r.use}</strong><small>{a.id} · {a.basis} · {a.state}</small></div>;})}</div><small>기존 SSO·RAG·권한·로그·연계 범위 대조 → 조직·업무 연결 차분 산정</small></div></li>
   <li><span className="case-step">03</span><div><h3>추가 개발·검수</h3><List items={p.deliverables}/><dl className="case-acceptance"><dt>시험 입력</dt><dd>{p.acceptancePlan.sample}</dd><dt>판정 기준</dt><dd>{p.acceptancePlan.criterion}</dd><dt>제출 증빙</dt><dd>{p.acceptancePlan.evidence}</dd></dl><small>{p.requirement} → {p.test} · 검수 설계 / {p.acceptancePlan.execution}</small><details><summary>공통 기반·업무별 검수 연결</summary><p>{p.packages.join(' · ')} / {p.tests.join(' · ')}</p><p>공통 기반: ON27-BASE / C27-COM · ST-04 단일 구축</p><p>연결 업무의 개별 요구·검수는 01단계 업무 링크에서 확인</p><Link to="proposal-2027.html">1차 구축·일정·검수 →</Link></details></div></li>
   <li><span className="case-step">04</span><div><h3>기대효과</h3><p>{p.effect}</p><strong>{p.formula}</strong><small>{p.comparison} · TS 실측 전</small></div></li>
  </ol>
  {showCases&&<details className="case-evidence-links"><summary>연결 사례 · {designs.relatedCases(p).length}건</summary><div className="ax-related">{designs.relatedCases(p).map(c=><Link key={c.id} to={c.url}>{c.title} →</Link>)}</div></details>}
  <div className="on-actions"><Link to={'index.html?view=strategy-prompts&strategy='+p.id}>이 전략의 프롬프트 편집 →</Link></div>
 </section>;
}
export function CaseInsight({item:c,platform=false}){
 const s=insights.byId[c.id],design=designs.byId[c.id];
 const linked=platform?insights.platformStrategies[c.id]:ax.mappings.filter(m=>m.caseRefs.some(r=>r.caseId===c.id)).map(m=>m.id);
 const failed=c.result==='실패'||c.id==='PF31';
 return <section className="case-insight">
   <section className="case-brief"><h3>추진 배경·대상 업무</h3><p>{design.narrative[0]}</p><dl><dt>이용자</dt><dd>{design.users}</dd><dt>업무 범위</dt><dd>{design.scope.join(' · ')}</dd></dl><h3>구현 방식·업무 변화</h3><p>{design.narrative[1]}</p></section>
   <section className="case-requirements"><h3>{design.rfp?'RFP 핵심 요구사항':'공개자료 기반 기능 명세'}</h3>{design.rfp?<><small>{design.basis} · 요구사항 요약 / 검수 항목은 CCK 비교 설계</small>{design.requirements.map((r,i)=><details key={r.id} open={i===0}><summary><strong>{r.id}</strong><span>{r.title}</span></summary><p>{r.summary}</p><dl className="case-acceptance"><dt>입력 → 결과</dt><dd>{r.data}</dd><dt>구성요소</dt><dd>{r.components.map(id=>id+' '+design.service.components.find(n=>n.id===id).title).join(' / ')}</dd><dt>검수 설계</dt><dd>{r.acceptance}</dd></dl><small>원문 위치: {r.locator} · {r.basis}</small></details>)}</>:<><small>공개 기능·운영자료를 바탕으로 재구성한 설계 명세</small>{design.benchmark.functions.map((f,i)=><details key={f.name} open={i===0}><summary>{f.name}</summary><dl className="case-acceptance"><dt>입력</dt><dd>{f.input}</dd><dt>처리</dt><dd>{f.processing}</dd><dt>결과</dt><dd>{f.output}</dd></dl></details>)}</>}</section>
   <div className="case-factors"><section><h3>{failed?'재발 방지 조건':c.group==='요구·구축'||['계획','시범'].includes(c.result)?'구축·검증 조건':'성공·확산 조건'}</h3><List items={s.success}/></section><section><h3>{failed?'실패 요인·시정 쟁점':'실패 위험·한계'}</h3><List items={s.risks}/></section></div><small>{s.analysis} · 사실·수치는 위 결과 및 원문 기준</small>
   <CaseArchitecture design={design}/>
   <div className="case-local"><h3>CCK 관점의 시사점</h3><p>{design.narrative[2]}</p><div className="ax-split"><div><strong>추가 개발</strong><p>{c.delta}</p></div><div><strong>검수 반영</strong><p>{c.test}</p></div></div><p><strong>기대효과 지표</strong> · {c.metric||c.effect}</p></div>
   <section className="case-benchmark"><h3>벤치마킹 재현·비교 시나리오</h3><small>{design.benchmark.label}</small><dl className="case-acceptance"><dt>정상 과업</dt><dd>{design.benchmark.normal}</dd><dt>예외 입력</dt><dd>{design.benchmark.exception}</dd><dt>판정 증빙</dt><dd>{design.benchmark.evidence}</dd></dl></section>
   <div className="case-next"><h3>TS 전략별 적용계획</h3><small>담당 부서·실제 업무 → CCK 재사용 → 개발·검수 → 기대효과</small><div className="ax-related">{linked.map(id=><Link key={id} to={'index.html?view=casebook&tab=strategy&strategy='+id}>{id} · {followup.byId[id].plan} →</Link>)}</div></div>
 </section>;
}
