import React from 'react';
import {Link} from './core.jsx';
import d from './org-platform-2027.cjs';
import './organization-platform.css';
export function OrganizationPlatform({primary=false}){
 const Heading=primary?'h1':'h2';
 return <section className="org-platform" id="organization-platform" tabIndex={-1} aria-labelledby="org-platform-title">
  <header><span className="org-eyebrow">{d.eyebrow}</span><Heading id="org-platform-title">{d.title}</Heading><p className="org-lead">{d.intro}</p><p>{d.meaning}</p></header>
  <ol className="org-chain">{d.chain.map(x=><li key={x}>{x}</li>)}</ol>
  <p><strong>{d.roles[0].name}</strong> — {d.roles[0].responsibility}. {d.roles[0].boundary}.</p>
  <h3>{d.labels.foundation}</h3><div className="org-stages">{d.stages.map((s,i)=><article key={s.id}><span className="org-number">{i+1}</span><h4>{s.title}</h4><p>{s.detail}</p><small>{s.requirements.join(' · ')} → {s.tests.join(' · ')}</small></article>)}</div>
  <p className="org-gate">{d.gate}</p><h3>{d.labels.expansion}</h3><div className="org-branches">{d.branches.map(b=><article key={b.id}><h4>{b.title}</h4><p>{b.detail}</p></article>)}</div>
  <p>{d.scope}</p>
  <details className="org-details"><summary>{d.labels.details}</summary><h3>{d.labels.profiles}</h3><div className="org-profiles">{d.profiles.map(p=><article key={p.type}><h4>{p.type}</h4><p>{p.character}</p><p>{p.mapping}</p></article>)}</div><p>{d.profileNote}</p><h4>{d.labels.fields}</h4><ul>{d.fields.map(f=><li key={f}>{f}</li>)}</ul><p>{d.relationNote}</p><h3>{d.labels.roles}</h3><dl className="org-roles">{d.roles.map(r=><div key={r.name}><dt>{r.name}</dt><dd>{r.responsibility}<small>{r.boundary}</small></dd></div>)}</dl><p><a href={d.evidence.url}>{d.evidence.date}</a> · {d.evidence.note}</p><p>{d.common}</p><p>{d.independence}</p></details>
  <p className="org-status">{d.status}</p><nav className="org-actions"><Link to="proposal-2027.html#department-mapping">공식 조직·부서별 매핑 76개 →</Link><Link to="proposal-2027.html#proposal-mapping">{d.labels.proposal} →</Link><Link to="downloads/ts-2027-proposal.md" download>{d.labels.download} ↓</Link></nav>
 </section>;
}
