import React,{useState} from 'react';
import {Link,href,Modal} from './core.jsx';
import data from './benchmark-100.cjs';
import designs from './case-designs.cjs';
import legacyAtlas from './case-architecture-atlas.cjs';
import {CaseArchitecture} from './CaseArchitecture.jsx';
import './benchmark-100.css';

const Bullets=({items})=><ul>{items.map((text,i)=><li key={i}>{text}</li>)}</ul>;
function OriginalFigures({figures}){const [zoom,setZoom]=useState(null);return <details className="bm-original"><summary>확보한 원문 도식·평가표</summary>{figures.map(f=><figure key={f.path}><figcaption><strong>{f.title}</strong></figcaption><button className="case-figure-expand" onClick={()=>setZoom(f)} aria-label={f.title+' 확대'}><img src={href(f.path)} alt={f.title}/></button><p>{f.reading}</p><a href={f.sourceUrl} target="_blank" rel="noreferrer">공식 원문 ↗</a></figure>)}<Modal open={!!zoom} onClose={()=>setZoom(null)} title={zoom?.title} wide>{zoom&&<img src={href(zoom.path)} alt={zoom.title}/>}</Modal></details>;}
function SourceLinks({row}){return <div className="bm-sources">{row.sources.map((s,i)=><div key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{i+1}. {s.title} ↗</a><small>{s.locator}</small></div>)}</div>;}
export function BenchmarkDownloads(){return <><Link to="downloads/ts-benchmark-100.md" download>100건 상세 분석 ↓</Link><Link to="downloads/ts-benchmark-100.csv" download>비교표 CSV ↓</Link></>;}
export function Benchmark100({platform=false,initialId}){
 const requested=initialId||new URLSearchParams(location.search).get('case'),initial=data.resolve(requested),legacy=!initial&&legacyAtlas.byId[requested];
 const [scope,setScope]=useState(initial?.kind||(platform?'platform':'ax')),[query,setQuery]=useState(''),[strategy,setStrategy]=useState('all'),[verdict,setVerdict]=useState('all'),[selected,setSelected]=useState(initial?.id);
 const rows=data.cases.filter(r=>(scope==='all'||r.kind===scope)&&(strategy==='all'||r.strategies.includes(strategy))&&(verdict==='all'||r.verdict===verdict)&&(!query||[r.id,r.title,r.owner,r.country,r.tsWork,r.family,...r.tsOrgCodes.map(c=>data.org(c)?.name)].join(' ').toLowerCase().includes(query.toLowerCase())));
 const row=rows.find(r=>r.id===selected)||rows[0];
 function select(id){setSelected(id);const u=new URL(location.href);u.searchParams.set('case',id);u.searchParams.delete('tab');history.replaceState(history.state,'',u);if(innerWidth<761)requestAnimationFrame(()=>document.getElementById('benchmark-detail')?.scrollIntoView({block:'start'}));}
 if(legacy)return <section className="ax-slide bm-detail"><small>기존 설계 자료 · 100건 비교와 별도 보존</small><h2>{legacy.title}</h2><Link to={'index.html?view='+(platform?'platform-cases':'casebook')}>100건 비교로 →</Link><section className="bm-section"><h3>AS-IS → TO-BE</h3><p>{legacy.outcome.asIs}</p><p>{legacy.outcome.toBe}</p><p>{legacy.outcome.observed}</p></section><CaseArchitecture design={designs.byId[requested]}/><p>{legacy.cckImplication}</p></section>;
 return <section className="bm-library" aria-label="100건 심층 비교 사례집">
  <div className="bm-heading"><h2>100건 심층 비교</h2><small>플랫폼 {data.counts.platform} · 업무·전략 {data.counts.ax} · {data.checked}</small></div>
  <div className="ax-catalog-controls bm-controls">
   <label>사례·기관·TS 부서 검색<input aria-label="사례·기관·TS 부서 검색" value={query} onChange={e=>setQuery(e.target.value)} placeholder="사례명, 기관명, 부서명"/></label>
   <label>사례 범위<select aria-label="사례 범위" value={scope} onChange={e=>setScope(e.target.value)}><option value="all">전체 100건</option><option value="platform">플랫폼 {data.counts.platform}건</option><option value="ax">업무·전략 {data.counts.ax}건</option></select></label>
   <label>12대 전략<select aria-label="12대 전략" value={strategy} onChange={e=>setStrategy(e.target.value)}><option value="all">전체 전략</option>{data.coverage.map(s=><option key={s.id} value={s.id}>{s.id} · {s.title} ({s.ids.length})</option>)}</select></label>
   <label>성과 구분<select aria-label="성과 구분" value={verdict} onChange={e=>setVerdict(e.target.value)}><option value="all">전체 판정</option>{[...new Set(data.cases.map(r=>r.verdict))].map(v=><option key={v}>{v}</option>)}</select></label>
  </div>
  <p className="bm-result" role="status">{rows.length}건 · 도입·실증·계획·감사 구분</p>
  {row?<div className="ax-reader bm-reader"><div className="ax-list" aria-label="분석 사례 목록">{rows.map(r=><button key={r.id} aria-pressed={r.id===row.id} onClick={()=>select(r.id)}><small>{r.id} · {r.country} · {r.verdict}</small><strong>{r.title}</strong><span>{r.owner}</span></button>)}</div>
   <article className="ax-slide bm-detail" id="benchmark-detail" key={row.id}>
    <header><small>{row.id} · {row.owner}</small><h2>{row.title}</h2><div className="bm-tags"><span>{row.verdict}</span><span>{row.stage}</span></div></header>
    <section className="bm-section"><h3>01 · AS-IS → TO-BE</h3><div className="bm-compare"><div><small>AS-IS · 기존 업무</small><p>{row.asIs}</p></div><div><small>TO-BE · 변경 구조</small><p>{row.toBe}</p></div></div><dl><dt>기대했던 효과</dt><dd>{row.expectedEffect}</dd></dl></section>
    <section className="bm-section"><h3>02 · 실제 성과와 성공·실패 요인</h3><div className="bm-observed"><strong>{row.verdict}</strong><p>{row.observed}</p><small>{row.verdictReason}</small></div><div className="bm-compare"><div><h4>{row.successLabel}</h4><Bullets items={row.successFactors}/></div><div><h4>{row.failureLabel}</h4><Bullets items={row.failureFactors}/></div></div><dl><dt>핵심 병목</dt><dd>{row.bottleneck}</dd></dl><small>{row.factorBasis}</small></section>
    <section className="bm-section"><h3>03 · 아키텍처·데이터 흐름</h3><small>{row.flowKind} · {row.architectureBasis}</small><ol className="bm-flow">{row.flow.map((step,i)=><li key={i}><small>{String(i+1).padStart(2,'0')}</small><strong>{step}</strong>{i<row.flow.length-1&&<span aria-hidden="true">↓</span>}</li>)}</ol><dl><dt>자료·판단 경계</dt><dd>{row.dataBoundary}</dd>{row.decisionBoundary!==row.dataBoundary&&<><dt>최종 판단</dt><dd>{row.decisionBoundary}</dd></>}</dl>{row.figures&&<OriginalFigures figures={row.figures}/>} {row.legacyId&&designs.byId[row.legacyId]&&<details className="bm-original"><summary>확보한 원문 도면·RFP·세부 명세</summary><CaseArchitecture design={designs.byId[row.legacyId]}/></details>}</section>
    <section className="bm-section"><h3>04 · CCK 시사점 → TS 후속 적용</h3><p className="bm-implication">{row.implication}</p><ol className="bm-transfer">
     <li><strong>TS 부서·실제 업무</strong><div className="bm-orgs">{row.tsOrgCodes.map(code=>{const org=data.org(code);return <Link key={code} to={'index.html?view=organization&org='+code}>{org.name}</Link>;})}</div><p>{row.tsWork}</p><small>업무분장에 근거한 적용·협업 제안</small></li>
     <li><strong>기존 기능 재사용</strong><p>{row.reuse}</p></li>
     <li><strong>추가 개발</strong><p>{row.delta}</p></li>
     <li><strong>검수</strong><p>{row.acceptance}</p></li>
     <li><strong>기대효과</strong><p>{row.localEffect}</p></li>
    </ol><div className="bm-strategies">{row.strategies.map(id=><Link key={id} to={'index.html?view=casebook&tab=strategy&strategy='+id}>{id} · {data.coverage.find(s=>s.id===id)?.title}</Link>)}</div>
    <details><summary>조직·직무 근거 및 적용 조건</summary>{row.tsOrgCodes.map(code=>{const o=data.org(code);return <div key={code}><h4>{o.name}</h4><Bullets items={o.duties}/><small>{o.locator} · {o.effectiveDate}</small></div>;})}<p>{data.organizationBoundary}</p><p>{data.capabilityBoundary}</p><p>{row.measurementNote}</p></details></section>
    <footer className="bm-section"><h3>근거·확인 범위</h3><p>{row.sourceLevel} · {row.evidenceReview}</p><SourceLinks row={row}/><small>{row.limit}</small></footer>
   </article></div>:<p className="ax-list-empty">조건에 맞는 사례 없음</p>}
  <details className="bm-method"><summary>집계·분석 기준</summary><p>{data.method}</p><p>수집 목록과 심층 분석 100건의 구분. 기존 57건 설계 자료·PPT의 원문 자산 보존.</p></details>
 </section>;
}

export function BenchmarkFoundation(){return <section className="bm-foundation"><h2>100건 비교 → 조직 네이티브 AI</h2><p>AI혁신처 공통 기반 우선 구축 → 부서별 업무 적용 → 실제 업무효과 검증</p><div className="bm-foundation-grid">{data.foundation.map(f=><div key={f.title}><h3>{f.title}</h3><p>{f.body}</p><small>검수 · {f.check}</small><div className="bm-strategies">{f.cases.map(id=><Link key={id} to={'index.html?view=platform-cases&case='+id}>{id}</Link>)}</div></div>)}</div></section>;}

export function BenchmarkStrategyLinks({strategy}){const records=data.cases.filter(r=>r.strategies.includes(strategy));return <section className="bm-related"><h3>상세 분석 근거 · {records.length}건</h3><div className="bm-related-grid">{records.map(r=><Link to={'index.html?view=casebook&case='+r.id} key={r.id}><small>{r.id} · {r.verdict}</small><strong>{r.title}</strong></Link>)}</div></section>;}
