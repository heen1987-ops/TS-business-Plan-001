import React,{useEffect} from 'react';
import {Link,Out,href} from './core.jsx';
import plan from './ts-ai-pms.cjs';
import './ts-ai-pms.css';
function Refs({ids=[]}){return ids.length?<p className="ts-pms-refs">근거: {ids.map(id=><a key={id} href={'#ts-pms-source-'+id}>{id} · {plan.sources[id].title}</a>)}</p>:null;}
function Table({title,headers,rows}){return <div className="ts-pms-table" role="region" aria-label={title} tabIndex={0}><table><caption>{title}</caption><thead><tr>{headers.map(h=><th scope="col" key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((row,i)=><tr key={i}>{row.map((cell,j)=>j===0?<th scope="row" key={j}>{cell}</th>:<td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>;}
function Block({block}){const b=block;let body;
 if(b.type==='table')body=<Table {...b}/>;
 if(b.type==='note')body=<div className="ts-pms-note"><h4>{b.title}</h4><ul>{b.items.map(x=><li key={x}>{x}</li>)}</ul></div>;
 if(b.type==='figure')body=<figure className="ts-pms-figure"><a href={href(b.path)} target="_blank" rel="noopener noreferrer" aria-label={b.title+' 원본 이미지 확대'}><img src={href(b.path)} alt={b.alt} width="1672" height="941" loading="lazy"/></a><figcaption>{b.title} · 이미지 모델 생성 · 설계 제안. 원본 확대 가능. 정확한 구성·연계 책임은 이어지는 본문 참조</figcaption></figure>;
 if(b.type==='requirements')body=<div className="ts-pms-cards">{plan.requirements.map(r=><article key={r.id} id={'ts-pms-req-'+r.id} tabIndex={-1}><h4>{r.id} · {r.name}</h4><dl><div><dt>구현</dt><dd>{r.how}</dd></div><div><dt>인수조건</dt><dd>{r.acceptance}</dd></div><div><dt>시험·WBS</dt><dd>{r.test} / {r.wbs}</dd></div></dl><Refs ids={r.refs}/></article>)}</div>;
 if(b.type==='research')body=<div className="ts-pms-cards">{plan.research.map(r=><article key={r.id} id={'ts-pms-wp-'+r.id} tabIndex={-1}><h4>{r.id} · {r.name}</h4><dl>{[['문제',r.problem],['방법',r.method],['결과물',r.output],['비교·검증',r.comparison],['SI·판단 경계',r.boundary]].map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></article>)}</div>;
 if(b.type==='metrics')body=<div className="ts-pms-cards">{plan.metrics.map(m=><article key={m.id} id={'ts-pms-metric-'+m.id} tabIndex={-1}><h4>{m.id} · {m.name}</h4><p>{m.effect}</p><dl>{[['적용범위',m.scope],['산식·단위',m.formula+' / '+m.unit],['측정',m.method],['품질·해석',m.quality],['책임',m.owner],['기준선·목표',m.baseline===null&&m.target===null?'미측정·미확정 · 실제 기준선·평가비용 검토 후 확정':String(m.baseline)+' / '+String(m.target)]].map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></article>)}</div>;
 if(b.type==='sources')body=<div className="ts-pms-sources">{Object.entries(plan.sources).map(([id,s])=><article key={id} id={'ts-pms-source-'+id} tabIndex={-1}><h4>{id} · {s.title}</h4><p>{s.published} · 확인 {s.checkedAt} · {s.location}</p><p><strong>확인 내용:</strong> {s.fact}</p><p><strong>확인 한계:</strong> {s.limit}</p>{s.url&&<Out url={s.url}>공식 원문·공급사 출처 ↗</Out>}{s.links?.map(([label,url])=><Out key={url} url={url}>{label} ↗</Out>)}{s.to&&<Link to={s.to}>기존 제품 근거 ↗</Link>}</article>)}</div>;
 return <div className={'ts-pms-block ts-pms-block-'+b.type}>{body}<Refs ids={b.refs}/></div>;
}
export function TsAiPmsPlan(){useEffect(()=>{if(!/^#(?:pms-ts-operating|ts-pms-)/.test(location.hash))return;let frame=requestAnimationFrame(()=>{const target=document.getElementById(location.hash.slice(1));if(!target)return;let parent=target.parentElement;while(parent){if(parent.tagName==='DETAILS')parent.open=true;parent=parent.parentElement;}target.focus({preventScroll:true});target.scrollIntoView({block:'start'});});return()=>cancelAnimationFrame(frame);},[]);
 return <section id="pms-ts-operating" className="ts-pms-plan" tabIndex={-1} data-ts-pms-plan={plan.version}>
  <header><small>{plan.id} · {plan.version} · {plan.date}</small><h2>{plan.title}</h2><p className="ts-pms-lead">{plan.sections[0].intro}</p><p className="ts-pms-status">{plan.status}</p><p>{plan.assumption}</p><p>{plan.constraints}</p></header>
  <nav className="ts-pms-downloads" aria-label="AI PMS 계획서 다운로드">{plan.downloads.map(([label,to])=><Link key={to} to={to} download>{label} ↓</Link>)}</nav>
  <nav className="ts-pms-toc" aria-label="AI PMS 구축·연구 계획 목차">{plan.sections.map(s=><a key={s.id} href={'#ts-pms-'+s.id}>{s.title}</a>)}</nav>
  {plan.sections.map(s=><section key={s.id} id={'ts-pms-'+s.id} className="ts-pms-section" tabIndex={-1}><header><h3>{s.title}</h3><p>{s.intro}</p></header>{s.blocks.map((b,i)=><Block key={i} block={b}/>)}</section>)}
 </section>;
}
