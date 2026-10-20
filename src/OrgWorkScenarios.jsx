import React,{useState} from 'react';
import {Link} from './core.jsx';
import d from './ts-org-scenarios.json';
import portfolio from './ts-ax-portfolio-2027.cjs';
import './ts-org-scenarios.css';
const Table=({headers,rows})=><div className="ond-table-wrap"><table><thead><tr>{headers.map(h=><th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{r.map((v,j)=><td key={j} data-label={headers[j]}>{v}</td>)}</tr>)}</tbody></table></div>;
const Packages=({ids})=><div className="axp-links">{ids.map(id=><Link key={id} to={'index.html?view=strategy&strategy=ST-04#'+id}>{id}</Link>)}</div>;
function Scenario({s}){
 const [stepId,setStep]=useState('03'),step=s.steps.find(x=>x.id===stepId);
 const names=Object.fromEntries(s.lanes.flatMap(l=>l.nodes.map(n=>[n.id,n.title])));
 return <article className="ows-case" data-scenario={s.id}>
  <header><small>{s.code} · {s.strategy}</small><h4>{s.title}</h4><blockquote>{s.request}</blockquote><p><strong>인식 역할</strong> · {s.role}</p><p><strong>업무 범위</strong> · {s.scope}</p></header>
  <div className="ows-comparison"><div><small>AS-IS · 업무 가설</small><p>{s.asIs}</p></div><div><small>TO-BE · 적용 설계</small><p>{s.toBe}</p></div></div>
  <h4>단계별 동작 예시</h4><div className="ows-steps" role="group" aria-label="업무 단계 선택">{s.steps.map(x=><button key={x.id} type="button" aria-pressed={x.id===stepId} onClick={()=>setStep(x.id)}><span>{x.id}</span>{x.title}</button>)}</div>
  <section className="ows-step-detail" aria-live="polite" aria-label="선택 업무 단계"><small>{step.id} · {step.state}</small><h4>{step.title}</h4><blockquote>{step.response}</blockquote><dl><dt>담당</dt><dd>{step.actor}</dd><dt>입력</dt><dd>{step.input}</dd><dt>처리</dt><dd>{step.action}</dd><dt>결과·기록</dt><dd>{step.output}</dd><dt>예외 처리</dt><dd>{step.exception}</dd></dl>
   <div className="ows-change"><div><strong>CCK 재사용 후보</strong><ul>{step.technology.map(id=><li key={id}><a href="#ows-reuse" onClick={()=>{document.getElementById('ows-reuse').open=true;}}>{portfolio.technologyById[id].name}</a></li>)}</ul></div><div><strong>추가 개발</strong><p>{step.delta}</p><Packages ids={step.packages}/></div></div>
   <div className="axp-links">{step.architecture.map(id=><span key={id}>{id}</span>)}{step.tests.map(id=><Link key={id} to={'index.html?view=delivery#'+id}>{id}</Link>)}</div>
  </section>
  <details className="ows-detail"><summary>필요 자료·최초 확인 상태</summary><p>아래 상태는 최초 조회 시점의 합성 예시. 실제 자료 요구는 업무 소관이 승인한 정의 사용.</p><Table headers={['자료·제공 주체','필요 조건·필드','최초 상태','다음 조치']} rows={s.requirements.map(r=>[r.id+' '+r.name+' / '+r.owner,r.condition+' / '+r.fields,r.status,r.action])}/></details>
  <details className="ows-detail" open><summary>서비스 아키텍처·데이터 흐름</summary><p>{d.architectureNote}</p><ol className="ows-service-flow" aria-label="업무별 서비스 흐름">{s.serviceFlow.map((v,i)=><li key={v}><small>{i+1}</small><strong>{v}</strong></li>)}</ol><div className="ows-return-flows">{s.returnFlows.map(v=><p key={v}>{v}</p>)}</div><div className="ows-legend"><span data-kind="existing">TS 기존 체계</span><span data-kind="reuse">CCK 재사용 후보</span><span data-kind="new">추가 개발</span></div><div className="ows-architecture" aria-label={s.title+' 서비스 아키텍처'}>{s.lanes.map(l=><section key={l.id}><h4>{l.title}</h4>{l.nodes.map(n=><div key={n.id} data-kind={n.kind}><strong>{n.title}</strong><small>{n.detail}</small></div>)}</section>)}</div><details className="ows-detail"><summary>연결별 전달 데이터 · {s.edges.length}개</summary><Table headers={['출발 → 도착','전달·처리']} rows={s.edges.map(([a,b,v])=>[names[a]+' → '+names[b],v])}/></details></details>
  <details className="ows-detail"><summary>부서 간 협업·승인·종결 조건</summary><Table headers={['담당','진입 조건','회신·산출물','다음 단계']} rows={s.collaboration}/><p>{d.approvalRule}</p><div className="ows-close"><strong>종결 조건</strong><p>{s.close}</p></div></details>
  <details className="ows-detail"><summary>직제 근거·담당 부서</summary><small>{d.basis.edition} · {d.basis.note}</small><div className="ows-duty">{s.dutyRefs.map(r=><article key={r.code}><h4><Link to={'index.html?view=organization&org='+r.code}>{r.name} →</Link></h4><p>{r.role}</p><ul>{r.quotes.map(q=><li key={q}>{q}</li>)}</ul><small>{r.entryId} · {r.locator}</small></article>)}</div><a href={d.basis.chartUrl} target="_blank" rel="noreferrer">TS 공식 조직도 ↗</a></details>
  <details className="ows-detail"><summary>업무별 추가 개발·검수·기대효과</summary><p>{s.costRule}</p><Table headers={['단계','순증 결과','기존 과업·검수']} rows={s.steps.map(x=>[x.title,x.delta,<><Packages ids={x.packages}/>{x.tests.join(' · ')}</>])}/><Table headers={['시험','입력','통과 조건·기존 검수']} rows={s.tests.map(t=>[t.id+' '+t.title,t.input,t.expected+' / '+t.existing.join(' · ')])}/><dl><dt>실증 순서</dt><dd>{s.pilot}</dd><dt>기대효과</dt><dd>{s.effect}</dd><dt>측정</dt><dd>{s.measure}</dd></dl><Link to={'index.html?view=strategy&strategy='+s.strategy+'#task-solution'}>{s.strategy} 부서별 서비스 →</Link></details>
 </article>;
}
export function OrgWorkScenarios(){const [active,setActive]=useState('ai-change');const s=d.scenarios.find(x=>x.id===active);return <section id="org-work-scenarios" className="ows-scenarios" aria-label="TS 실제 업무 적용 시나리오">
 <header><h4>TS 업무로 보는 조직 네이티브 AI</h4><p>{d.boundary}</p><div className="axp-links"><Link to="downloads/ts-org-work-scenarios.md" download>업무 시나리오 명세 ↓</Link><Link to="downloads/ts-org-work-scenarios.json" download>자료·흐름·검수 원장 ↓</Link></div></header>
 <div className="ows-picker" role="group" aria-label="TS 업무 시나리오 선택">{d.scenarios.map(x=><button key={x.id} type="button" aria-pressed={x.id===active} onClick={()=>setActive(x.id)}><small>{x.dutyRefs[0].name}</small><strong>{x.title}</strong></button>)}</div>
 <Scenario key={s.id} s={s}/>
 <details className="ows-detail" id="ows-reuse"><summary>CCK 재사용·TS 기존 연계·추가 개발 경계</summary><Table headers={['구분·기능','근거·확인 단계','재사용','추가 개발·확인 조건']} rows={d.reuseBoundary.map(r=>[r.kind+' / '+r.name,r.evidence+' / '+r.confirmed,r.reuse,r.additional+' / '+r.verify])}/></details>
 <details className="ows-detail"><summary>기관·부서·업무건 인식과 1차 구축 순서</summary><Table headers={['조직 계층','연결 정보','작동 원칙']} rows={d.identity}/><p className="ows-fields">{d.contextFields.join(' · ')}</p><Table headers={['시기','참여 역할','구축·실증','산출물·조건']} rows={d.rollout}/></details>
 </section>;}