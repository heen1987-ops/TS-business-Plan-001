import React,{useState} from 'react';
import {Link} from './core.jsx';
import insights from './case-insights.cjs';
import followup from './strategy-followup.cjs';
import ax from './ax-casebook.cjs';
import platforms from './platform-casebook.cjs';
import './case-insight.css';
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
  {showCases&&<details className="case-evidence-links" open><summary>연결 사례 · {p.caseRefs.length+p.platformCases.length}건</summary><div className="ax-related">{p.caseRefs.map(r=><Link key={r.caseId} to={'index.html?view=casebook&case='+r.caseId}>{ax.getCase(r.caseId).title} · {r.type}</Link>)}{p.platformCases.map(id=><Link key={id} to={'index.html?view=platform-cases&case='+id}>{platforms.cases.find(c=>c.id===id).title} · 구성 참조</Link>)}</div></details>}
  <div className="on-actions"><Link to={'index.html?view=strategy-prompts&strategy='+p.id}>이 전략의 프롬프트 편집 →</Link></div>
 </section>;
}
export function CaseInsight({item:c,platform=false}){
 const s=insights.byId[c.id],nodes=c.flow||c.nodes;
 const linked=platform?insights.platformStrategies[c.id]:ax.mappings.filter(m=>m.caseRefs.some(r=>r.caseId===c.id)).map(m=>m.id);
 const [tab,setTab]=useState('analysis'),[strategy,setStrategy]=useState(linked[0]);
 const failed=c.result==='실패'||c.id==='PF31';
 return <section className="case-insight">
  <div className="ax-tabs" aria-label="사례 상세 보기"><button aria-pressed={tab==='analysis'} onClick={()=>setTab('analysis')}>성공·실패 요인 / 도식</button><button aria-pressed={tab==='plan'} onClick={()=>setTab('plan')}>TS 후속계획 · {linked.length}개 전략</button></div>
  {tab==='analysis'?<>
   <div className="case-factors"><section><h3>{failed?'재발 방지 조건':c.group==='요구·구축'||['계획','시범'].includes(c.result)?'구축·검증 조건':'성공·확산 조건'}</h3><List items={s.success}/></section><section><h3>{failed?'실패 요인·시정 쟁점':'실패 위험·한계'}</h3><List items={s.risks}/></section></div><small>{s.analysis} · 사실·수치는 위 결과 및 원문 기준</small>
   <figure className="case-architecture"><figcaption><h3>서비스 아키텍처</h3><small>{s.diagramBasis}</small>{s.structureSource&&<small><a href={s.structureSource.url} target="_blank" rel="noreferrer">{s.structureSource.title} ↗</a></small>}</figcaption><div className="case-arch-grid"><div className="case-node"><small>접점·원천</small><strong>{s.architecture[0]}</strong></div><span className="case-arrow" aria-hidden="true">→</span><div className="case-node case-engine"><small>처리·추론</small><strong>{s.architecture[1]}</strong></div><span className="case-arrow" aria-hidden="true">→</span><div className="case-node"><small>결과·담당</small><strong>{s.architecture[3]}</strong></div><div className="case-datastore"><span aria-hidden="true">↕</span><small>참조·저장 자료</small><strong>{s.architecture[2]}</strong></div></div></figure>
   <figure className="case-dataflow"><figcaption><h3>데이터 흐름</h3><small>{c.flowBasis||c.diagramBasis}</small></figcaption><ol className="ax-flow">{nodes.map((n,i)=><li key={i}><span>0{i+1}</span><strong>{n}</strong><small>{s.transfers[i]}</small></li>)}</ol><div className="case-control"><strong>통제 지점</strong><span>{s.control}</span></div></figure>
   <div className="case-local"><h3>CCK 현지화</h3><p>{c.local||c.apply}</p><div className="ax-split"><div><strong>추가 개발</strong><p>{c.delta}</p></div><div><strong>사례 교훈의 검수 반영</strong><p>{c.test}</p></div></div></div>
   <div className="case-next"><strong>TS 부서·업무 → CCK 재사용 → 개발·검수 → 효과</strong><div className="ax-related">{linked.map(id=><button className="ax-text-button" key={id} onClick={()=>{setStrategy(id);setTab('plan');}}>{id} · {followup.byId[id].plan} →</button>)}</div></div>
  </>:<><label className="case-strategy-select">후속 적용 전략<select value={strategy} onChange={e=>setStrategy(e.target.value)}>{linked.map(id=><option key={id} value={id}>{id} · {followup.byId[id].strategy}</option>)}</select></label><FollowupPlan key={strategy} id={strategy}/><Link to={'index.html?view=casebook&tab=strategy&strategy='+strategy}>이 전략의 전체 사례·후속계획 →</Link></>}
 </section>;
}
