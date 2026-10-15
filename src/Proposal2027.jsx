import React,{useEffect} from 'react';
import {Link} from './core.jsx';
import d from './proposal-2027.cjs';
import './proposal-2027.css';
import {OrganizationPlatform} from './OrganizationPlatform.jsx';

function Section({id,children}) {
 const index=d.sections.findIndex(s=>s[0]===id);
 return <section className="proposal-section" id={id} tabIndex={-1}><header><span>{String(index+1).padStart(2,'0')}</span><h2>{d.sections[index][1]}</h2></header>{children}</section>;
}
function Table({data}) {
 return <table className="proposal-table"><thead><tr>{data.headers.map(h=><th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{data.rows.map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j} data-label={data.headers[j]}>{cell}</td>)}</tr>)}</tbody></table>;
}
function Downloads(){return <div className="proposal-actions">{d.downloads.map(x=><Link key={x.to} to={x.to} download={x.to.split("/").pop()}>{x.label} ↓</Link>)}</div>;}
export function Proposal2027({navigationEpoch}){
 useEffect(()=>{
  const frame=requestAnimationFrame(()=>{
   const target=document.getElementById(location.hash.slice(1));
   if(target?.closest('.proposal-page')){target.scrollIntoView({block:'start'});target.focus({preventScroll:true});}
  });
  return()=>cancelAnimationFrame(frame);
 },[navigationEpoch]);
 return <article className="page proposal-page">
  <header className="proposal-hero">
   <span className="proposal-eyebrow">{d.eyebrow}</span><h1>{d.title}</h1><p className="proposal-subtitle">{d.subtitle}</p>
   <p>{d.intro}</p><p className="proposal-status">{d.status}</p>
   <ol className="proposal-flow" aria-label={d.navTitle}>{d.trace.map(s=><li key={s}>{s}</li>)}</ol>
   <div className="proposal-cards">{d.cards.map(c=><div key={c.label}><span>{c.label}</span><strong>{c.value}</strong><p>{c.detail}</p></div>)}</div>
   <Downloads/><nav className="proposal-jumps" aria-label={d.navTitle}>{d.sections.map(([id,title])=><Link key={id} to={'proposal-2027.html#'+id}>{title}</Link>)}</nav>
  </header>
  <OrganizationPlatform/>
  <Section id="proposal-scope">
   <p>{d.scopeNote}</p><div className="proposal-boundaries">{d.boundaries.map(x=><article key={x.title}><h3>{x.title}</h3><p>{x.text}</p></article>)}</div>
   <div className="proposal-bundles">{d.bundles.map(b=><article key={b.id}><header><span className="proposal-id">{b.id}</span><span className="proposal-tag">{b.priority}</span></header><h3>{b.name}</h3><p>{b.scope}</p><dl><dt>{d.labels.lead}</dt><dd>{b.lead}</dd><dt>{d.labels.gate}</dt><dd>{b.gate}</dd></dl><Link to={b.href}>{d.labels.annual} →</Link></article>)}</div>
   <details className="proposal-details"><summary>{d.labels.reuse}</summary><Table data={d.reuse}/></details>
  </Section>
  <Section id="proposal-mapping"><p>{d.mappingNote}</p><Table data={d.mapping}/><h3>{d.labels.profiles}</h3><Table data={d.profiles}/><details className="proposal-details"><summary>{d.labels.workMapping}</summary><Table data={d.workMapping}/></details></Section>
  <Section id="proposal-timeline">
   <p>{d.timingNote}</p><ol className="proposal-timeline">{d.timeline.map(t=><li key={t.period}><strong>{t.period}</strong><div><h3>{t.work}</h3><p>{t.gate}</p></div></li>)}</ol>
   <div className="proposal-gates">{d.gates.map(g=><p key={g}>{g}</p>)}</div>
  </Section>
  <Section id="proposal-acceptance">
   {d.acceptanceNote.map(p=><p className="proposal-note" key={p}>{p}</p>)}
   <div className="proposal-requirements">{d.requirements.map(r=>{const t=d.tests.find(x=>x.id===r.testId);return <article key={r.id} id={'proposal-'+r.id} tabIndex={-1}>
    <header><Link className="proposal-id" to={'growth-ai.html#'+r.id}>{r.id}</Link><h3>{r.name}</h3></header>
    <div className="proposal-requirement-body"><div><h4>{d.labels.scope}</h4><p>{r.scope}</p><h4>{d.labels.evidence}</h4><p>{r.evidence}</p><h4>{d.labels.legacy}</h4><p>{r.legacyIds.join(' · ')}</p></div>
     <div><h4>{d.labels.test}</h4><Link className="proposal-id" to={'growth-ai.html#'+t.id}>{t.id}</Link><p>{t.criterion}</p></div>
    </div></article>;})}</div>
   <h3>{d.labels.legacyTests}</h3><Table data={d.legacyTests}/>
   <details className="proposal-details"><summary>{d.labels.quality}</summary><Table data={d.quality}/></details>
   <div className="proposal-handover"><h3>{d.labels.handover}</h3>{d.handover.map(p=><p key={p}>{p}</p>)}</div>
  </Section>
  <Section id="proposal-downloads"><p>{d.labels.downloadNote}</p><Downloads/>
   <div className="proposal-actions"><Link to="downloads/ts-2027-proposal.html">{d.labels.read} ↗</Link><a href={d.sourceUrl}>{d.labels.source} ↗</a></div>
   <h3>{d.labels.toc}</h3><ol className="proposal-toc">{d.chapters.map(ch=><li key={ch.id}><Link to={'downloads/ts-2027-proposal.html#'+ch.id}>{ch.title.replace(/^\d+ /,'')}</Link></li>)}</ol>
   <div className="proposal-actions"><Link to="growth-ai.html">{d.labels.design} →</Link><Link to="index.html#annual-work-2027">{d.labels.annual} →</Link></div>
  </Section>
 </article>;
}
