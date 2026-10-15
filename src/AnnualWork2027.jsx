import React from 'react';
import {Link} from './core.jsx';
import d from './annual-work-2027.cjs';
import growthView from './growth-view.cjs';
export function AnnualWork2027(){const c=d.copy;return <section id="annual-work-2027" className="annual-work" aria-labelledby="annual-work-title" tabIndex={-1}>
 <h4 id="annual-work-title">{d.title}</h4><p>{d.intro}</p><p className="ax-note">{d.status}</p>
 <p><Link to="growth-ai.html#growth-ts">{growthView.annualLink} →</Link></p>
 <div className="enterprise-priorities">{d.bundles.map(b=><article key={b.id}><strong>{b.phase} · {b.id}</strong><h5><a href={'#'+b.id}>{b.name}</a></h5><p>{b.lead}</p><small>{b.why}</small></article>)}</div>
 <p>{d.selection}</p><p>{d.reuse}</p>
 <div className="annual-bundles">{d.bundles.map(b=><details id={b.id} key={b.id} data-annual-bundle={b.id}><summary>{b.id} · {b.name}</summary><div className="enterprise-body">
 <p><strong>{c.owner}</strong> — {b.lead} / {b.partners}</p><p><strong>{c.scope}</strong> — {b.scope}</p>
 <ol>{b.workflow.map(x=><li key={x}>{x}</li>)}</ol>
 <dl className="enterprise-matrix">{[['skill',b.skills],['development',b.development],['exclude',b.exclude],['cost',b.unit],['test',b.test],['gate',b.gate],['after',b.after]].map(([key,v])=><React.Fragment key={key}><dt>{c[key]}</dt><dd>{v}</dd></React.Fragment>)}</dl>
 <p className="ax-note">{b.costParent}</p><p>{b.departments.map(r=><a key={r.code} href={r.url} target="_blank" rel="noreferrer">{r.name} · {r.date} 관측 ↗ </a>)}</p>
 </div></details>)}</div>
 <details className="enterprise-common"><summary>{c.common}</summary><p>{d.common}</p><p>{d.independence}</p></details>
 <details className="enterprise-common"><summary>{c.schedule}</summary><ol>{d.timing.map(x=><li key={x}>{x}</li>)}</ol><p>{d.deadline}</p><p>{d.deferred}</p></details>
 <details className="enterprise-common"><summary>{c.cost} · {c.acceptance}</summary>{Object.values(d.cost).map(x=><p key={x}>{x}</p>)}<ul>{d.tests.map(t=><li key={t[0]}><strong>{t[0]} · {t[1]}</strong><p>{t[2]}</p><small>{t[3]} / {t[4]}</small></li>)}</ul></details>
 <nav className="enterprise-downloads" aria-label={c.download}><Link to="downloads/annual-work-2027.md">{c.download} · 상세안</Link><Link to="downloads/annual-work-2027.csv">{c.download} · 비교표</Link></nav>
 <details className="enterprise-common"><summary>{c.sources}</summary>{d.sources.map(s=><p key={s.id}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a> — {s.date}</p>)}</details>
 </section>}
