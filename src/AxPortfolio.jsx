import React from 'react';
import {Link} from './core.jsx';
import model from './ax-portfolio.json';
import './ax-portfolio.css';
import {EnterpriseWorkAx} from './EnterpriseWorkAx.jsx';

export function AxPortfolio(){return <section className="ax-portfolio" id="ax-portfolio" aria-labelledby="ax-portfolio-title" tabIndex={-1}>
 <header><small>{model.date} · {model.status}</small><h2 id="ax-portfolio-title">{model.title}</h2><p>{model.intro}</p></header>
 <div className="ax-axes">{model.axes.map((axis,i)=><article key={axis.id} id={'ax-'+axis.id} data-ax-axis={axis.id} tabIndex={-1}>
  <span className="ax-number">{i+1}</span><h3>{axis.title}</h3><p className="ax-purpose">{axis.purpose}</p><p><strong>{model.copy.audience}</strong> {axis.audience}</p>
  <ul>{axis.items.map(item=><li key={item}>{item}</li>)}</ul><p><strong>{model.copy.acceptance}</strong> {axis.acceptance}</p>
  <nav aria-label={axis.title+' 상세'}>{axis.links.map(([label,to])=><Link key={to} to={to}>{label} ↗</Link>)}</nav>
 </article>)}</div>
 <div className="ax-foundation"><h3>{model.foundation.title}</h3><p>{model.foundation.reuse}</p><p>{model.foundation.cost}</p></div>
 <div className="ax-table" role="region" aria-label="두 축의 연차별 추진계획" tabIndex={0}><table><caption>{model.copy.annualCaption}</caption><thead><tr><th scope="col">{model.copy.year}</th>{model.axes.map(a=><th scope="col" key={a.id}>{a.title}</th>)}</tr></thead><tbody>{[2027,2028,2029].map((year,i)=><tr key={year}><th scope="row">{year}</th>{model.axes.map(a=><td key={a.id}>{a.years[i]}</td>)}</tr>)}</tbody></table></div>
 <p className="ax-note">{model.annualNote}</p>
 <details id="ax-public-services"><summary>{model.copy.serviceSummary}</summary><p>{model.classificationRule}</p><p>{model.copy.serviceNote}</p><ol className="ax-services">{model.services.map(s=><li key={s.id}><strong>{s.id} · {s.name}</strong><span>{s.wave}</span></li>)}</ol></details>
 <EnterpriseWorkAx/>
</section>}
