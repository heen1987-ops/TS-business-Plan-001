import React,{useMemo,useState} from 'react';
import {Link} from './core.jsx';
import model from './enterprise-work-ax.cjs';

export function EnterpriseWorkAx(){
 const [query,setQuery]=useState(''),[priority,setPriority]=useState(''),[pack,setPack]=useState('');
 const rows=useMemo(()=>model.records.filter(r=>(!priority||r.priority===priority)&&(!pack||r.pack===pack)&&(!query.trim()||[r.name,r.path,r.task,r.skill,r.additional].join(' ').toLowerCase().includes(query.trim().toLowerCase()))),[query,priority,pack]);
 const c=model.copy;
 return <section className="enterprise-ax" id="enterprise-work-ax" aria-labelledby="enterprise-title" tabIndex={-1}>
  <header><h3 id="enterprise-title">{model.title}</h3><p>{model.intro}</p><p className="ax-note">{model.scope}</p><p className="ax-note">{model.status}</p></header>
  <div className="enterprise-priorities">{model.priorities.map(p=><article key={p.id}><strong>{p.id} · {p.name}</strong><p>{p.reason}</p><small>{p.year}</small></article>)}</div>
  <p className="ax-note">{c.priorityNote}</p>
  <div className="enterprise-boundaries">{model.reuseBoundary.map(r=><article key={r.label}><h4>{r.label}</h4><p>{r.text}</p><small>{r.evidence}</small></article>)}</div>
  <details className="enterprise-common"><summary>{c.common}</summary><p>{model.commonEngine}</p><p>{model.pms}</p><p>{model.ownership}</p><p>{model.base}</p></details>
  <details className="enterprise-directory"><summary>{c.detail} · {model.records.length}{c.count}</summary>
  <form className="enterprise-filters" onSubmit={e=>e.preventDefault()} aria-label={c.detail}>
   <label>{c.search}<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder={c.placeholder}/></label>
   <label>{c.priority}<select aria-label={c.priority} value={priority} onChange={e=>setPriority(e.target.value)}><option value="">{c.all}</option>{model.priorities.map(p=><option key={p.id} value={p.id}>{p.id} · {p.name}</option>)}</select></label>
   <label>{c.pack}<select aria-label={c.pack} value={pack} onChange={e=>setPack(e.target.value)}><option value="">{c.all}</option>{model.packs.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
   <button type="button" onClick={()=>{setQuery('');setPriority('');setPack('')}}>{c.reset}</button>
  </form>
  <p className="enterprise-count" role="status" aria-live="polite">{rows.length} / {model.records.length}{c.count}</p>
  {!rows.length&&<p className="enterprise-empty">{c.empty}</p>}
  <div className="enterprise-records">{rows.map(r=><details key={r.id} id={r.id} data-enterprise-record={r.id}>
   <summary><span className="enterprise-priority">{r.priority}</span><span><strong>{r.name}</strong><small>{r.path}</small><span>{r.task}</span></span></summary>
   <div className="enterprise-body"><p>{r.priorityReason}</p><p><strong>{c.owner}</strong> — {r.owner}</p>
    <h4>{c.proposal}</h4><ol>{r.workflow.map(x=><li key={x}>{x}</li>)}</ol>
    <dl className="enterprise-matrix"><dt>{c.reuse}</dt><dd>{r.reuse.join(' / ')}</dd><dt>{c.skill}</dt><dd>{r.skill}</dd><dt>{c.additional}</dt><dd>{r.additional} · {r.gate}</dd></dl>
    <h4>{c.years}</h4><ol className="enterprise-years">{r.years.map(x=><li key={x}>{x}</li>)}</ol>
    <h4>{c.cost}</h4><p>{r.cost.status} · {r.cost.units}</p><p>{r.cost.method}</p><p>{r.acceptance}</p><p>{r.authority}</p>
    <h4>{c.evidence}</h4><p className="ax-note">{r.observedAt} · {r.status}</p><ul>{r.observations.slice(0,5).map(o=><li key={o.id}>{o.text} <small>({o.id}; {o.refs.map(x=>x.page+'쪽 '+x.row+'행').join(', ')})</small></li>)}</ul>{r.observations.length>5&&<><p className="ax-note">{c.evidenceNote}</p><details><summary>{c.evidenceMore}</summary><ul>{r.observations.slice(5).map(o=><li key={o.id}>{o.text} <small>({o.id}; {o.refs.map(x=>x.page+'쪽 '+x.row+'행').join(', ')})</small></li>)}</ul></details></>}<a href={r.sourceUrl} target="_blank" rel="noreferrer">{c.sources} ↗</a>
    <p className="ax-note">{r.citizenBoundary}</p>
   </div>
  </details>)}</div>
  </details>
  <details className="enterprise-common"><summary>{c.cost} · {c.acceptance}</summary><p>{model.cost.formula}</p><p>{model.cost.basis}</p><ul>{model.cost.inputs.map(x=><li key={x}>{x}</li>)}</ul><p>{model.cost.note}</p><p>{model.acceptance.status}</p><p>{model.acceptance.protocol}</p><div className="ax-table" role="region" aria-label={c.acceptance} tabIndex={0}><table><tbody>{model.acceptance.rows.map(r=><tr key={r[0]}><th scope="row">{r[0]}<br/>{r[1]}</th><td>{r.slice(2).map(x=><p key={x}>{x}</p>)}</td></tr>)}</tbody></table></div></details>
  <details className="enterprise-common"><summary>{c.supplementary}</summary>{model.supplementary.map(r=><article key={r[0]}><h4>{r[0]}</h4><p>{r[1]}</p><p>{r[2]}</p></article>)}</details>
  <nav className="enterprise-downloads" aria-label={c.download}><Link to="downloads/enterprise-work-ax-2027-2029.md">{c.download} · Markdown</Link><Link to="downloads/enterprise-work-ax-2027-2029.csv">{c.download} · CSV</Link></nav>
  <details className="enterprise-common"><summary>{c.sources}</summary><ul>{model.sources.map(s=><li key={s.id}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a><p>{s.date}</p></li>)}</ul></details>
 </section>
}
