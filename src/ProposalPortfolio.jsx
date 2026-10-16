import React,{useState} from 'react';
import {BriefcaseBusiness,Network,MessagesSquare,Target,Download,ArrowUpRight} from 'lucide-react';
import {Link} from './core.jsx';
import d from './proposal-portfolio.cjs';
import strategies from './strategy-solutions-2027.cjs';
const icons=[BriefcaseBusiness,Network,MessagesSquare,Target];
export function ProposalPortfolio(){
 const [selected,setSelected]=useState('P02'),[tab,setTab]=useState('scope');
 const t=d.tracks.find(t=>t.id===selected);
 return <article className="on-page pf-page">
  <header className="pf-head"><div><span className="ux-eyebrow">GROWTH AI / 제안 체계</span><h1>제안·관계부처</h1><p>기관·법령 → 조직·업무 → AI 기능 → 개발·검수</p></div><Link className="ux-download" to="downloads/growth-ai-proposal-portfolio.md" download><Download size={15}/> 제안 구성안</Link></header>
  <div className="pf-tracks" aria-label="제안 선택">{d.tracks.map((p,i)=>{const Icon=icons[i];return <button key={p.id} aria-pressed={p.id===selected} onClick={()=>setSelected(p.id)}><span className="pf-card-top"><Icon size={19}/><small>{p.number}</small></span><h2>{p.title}</h2><strong>{p.subtitle}</strong><p>{p.audience}</p><span className="pf-tag">{p.tag}</span></button>;})}</div>
  <div className="pf-tabs" aria-label="제안 정보 선택">{[['scope','제안 범위'],['institutions','관계부처·기관'],['delivery','개발·검수']].map(([id,title])=><button key={id} aria-pressed={tab===id} onClick={()=>setTab(id)}>{title}</button>)}</div>
  {tab==='scope'&&<section className="pf-scope" aria-label="선택 제안 범위"><header><span>{t.number} / {t.phase}</span><h2>{t.purpose}</h2><p>{t.lead}</p></header><ol className="pf-flow">{t.flow.map((step,i)=><li key={step}><small>{String(i+1).padStart(2,'0')}</small><strong>{step}</strong></li>)}</ol>
   <div className="pf-scope-grid"><section><h3>대상·업무</h3><p>{t.audience}</p><div className="pf-institution-tags">{d.institutions.filter(m=>t.ministries.includes(m.id)).map(m=><button key={m.id} onClick={()=>setTab('institutions')}>{m.ministry} ↗</button>)}</div></section><section><h3>기존 기능 재사용 <small>후보</small></h3><p>{t.reuse}</p></section></div>
   {selected==='P03'&&<div className="pf-example"><span>이용 예시</span><blockquote>{d.serviceExample.utterance}</blockquote><p>{d.serviceExample.intent} → {d.serviceExample.confirm} → {d.serviceExample.handoff}</p><strong>보조 탐색 유지 · {d.serviceExample.fallback}</strong></div>}
   {selected==='P04'&&<div className="pf-strategies">{strategies.rows.map(s=><Link key={s.id} to={'organization.html?view=work-map&org=all&strategy='+s.id}><span>{s.id}</span>{s.strategy}</Link>)}</div>}
   <p className="pf-boundary">{t.boundary}</p><div className="pf-links">{t.links.map(([to,label])=><Link key={to} to={to}>{label}<ArrowUpRight size={14}/></Link>)}</div>
  </section>}
  {tab==='institutions'&&<section aria-label="관계부처 매핑"><div className="pf-matrix-head"><h2>관계부처 × 제안</h2><span>관계·업무 근거 / 적용안 구분</span></div><div className="pf-matrix"><div className="pf-matrix-row pf-matrix-labels"><span>관계부처 · 기관</span>{d.tracks.map(p=><span key={p.id} className={selected===p.id?'is-selected':''}>{p.title}</span>)}</div>{d.institutions.map(m=><div className="pf-matrix-row" key={m.id}><div><strong>{m.ministry}</strong><p>{m.institution}</p><small>{m.relation}</small></div>{m.cells.map((cell,i)=><div key={i} className={selected===d.tracks[i].id?'is-selected':''}><span className="pf-mobile-label">{d.tracks[i].title}</span><span>{cell}</span></div>)}<details><summary>업무·근거</summary><p>{m.focus}</p><p>{m.note}</p>{m.sources.map(id=>{const s=d.sources.find(s=>s.id===id);return <a key={id} href={s.url} target="_blank" rel="noreferrer">{s.title} ↗</a>;})}{!m.sources.length&&<p>분야 확장 구상 · 개별 기관 소관 자료 연결 전</p>}</details></div>)}</div><p className="pf-boundary">AI PMS 사용자는 공공사업 수행 민간기업. 기관별 확장안은 해당 기관의 규정·계약·조직을 적용한 별도 기획.</p></section>}
  {tab==='delivery'&&<section className="pf-delivery" aria-label="선택 제안 개발·검수"><header><span>{t.number} / {t.phase}</span><h2>{t.title} · 개발·검수 연결안</h2></header><div><section><h3>추가 구성·개발</h3><ol>{t.development.map(x=><li key={x}>{x}</li>)}</ol></section><section><h3>검수 기준</h3><ol>{t.acceptance.map(x=><li key={x}>{x}</li>)}</ol></section></div><p className="pf-boundary">{t.boundary}</p><small>평가셋·분모·목표의 과업별 합의 · 실제 시험 미실행</small><div className="pf-links">{t.links.map(([to,label])=><Link key={to} to={to}>{label}<ArrowUpRight size={14}/></Link>)}</div></section>}
  <details className="ux-evidence"><summary>추진 순서·자료 기준·내려받기</summary><ol>{d.sequence.map(x=><li key={x}>{x}</li>)}</ol><p>기준일 {d.date} · 공식 기관·서비스 자료와 사용자 제안 방향의 구분 · 기능 구현·수요 확정과 구분한 적용 설계안</p><Link to="downloads/growth-ai-proposal-portfolio.md" download>제안·관계부처 구성안 Markdown ↓</Link><Link to="downloads/growth-ai-proposal-institutions.csv" download>관계부처 매핑표 CSV ↓</Link></details>
 </article>;
}
