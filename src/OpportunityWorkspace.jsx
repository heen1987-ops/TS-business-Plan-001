import React,{useEffect,useState,useSyncExternalStore} from 'react';
import {ArrowRight,ArrowLeft,Download,Search,RotateCcw,ExternalLink} from 'lucide-react';
import {Link,navigate} from './core.jsx';
import {PageFrame} from './PageFrame.jsx';
import plan from './opportunity-plan.cjs';
import {AsisTobeCases} from './AsisTobeCases.jsx';
import concepts from './opportunity-concepts.js';
import './opportunity-workspace.css';

const catalog=Array.isArray(concepts)?concepts:concepts.items||[];
const stages=[['foundation','공통 기반'],['pilot','우선 실증 후보'],['expand','조건부 확산'],['research','연구 검토'],['hold','선행조건 확인']];
const stageLabel=id=>stages.find(([key])=>key===id)?.[1]||id;
const areaLabel=id=>plan.areas.find(area=>area.id===id)?.label||id;
const subscribe=listener=>{window.addEventListener('popstate',listener);return()=>window.removeEventListener('popstate',listener);};
const snapshot=()=>location.search+location.hash;
const downloadPath=concept=>'downloads/concepts/'+encodeURIComponent(concept.filename||concept.title+'.md');
const strategyId=id=>String(id).replace(/^ST-?(\d+)$/,'ST-$1');
function routeWith(changes={},hash=''){
 const params=new URLSearchParams(location.search);
 params.set('view','opportunities');
 for(const [key,value] of Object.entries(changes)){if(value)params.set(key,value);else params.delete(key);}
 return 'index.html?'+params.toString()+hash;
}
function Lines({value}){
 if(Array.isArray(value))return <ul>{value.map((line,index)=><li key={index}>{line}</li>)}</ul>;
 return value?<p>{value}</p>:null;
}
function SourceLinks({sources}){
 return <ul className="opp-sources">{sources.map((source,index)=>{
  const item=typeof source==='string'?plan.sources.find(s=>s.id===source)||{title:source}:source;
  return <li key={item.id||item.url||index}>{item.url?<a href={item.url} target="_blank" rel="noopener noreferrer">{item.title||item.url}<ExternalLink size={14} aria-hidden="true"/></a>:<strong>{item.title}</strong>}{item.note&&<small>{item.note}</small>}{(item.checkedAt||item.publishedAt)&&<small>{item.checkedAt?'검토 기준일 '+item.checkedAt:'게시일 '+item.publishedAt}</small>}</li>;
 })}</ul>;
}
function AreaMatrix(){
 const columns=plan.workTypes?.length?plan.workTypes:[{id:'new',label:'신규 개발·구축'},{id:'enhance',label:'고도화'},{id:'integrate',label:'연계강화'}];
 return <section className="opp-section" id="opp-areas" aria-labelledby="opp-areas-title">
  <div className="opp-section-head"><h2 id="opp-areas-title">3개 영역의 개발과 연계</h2><Link to="index.html?view=strategy&strategy=ST-04">공통 기반 연결 <ArrowRight size={15} aria-hidden="true"/></Link></div>
  <table className="opp-matrix opp-responsive-table"><thead><tr><th scope="col">영역과 역할</th>{columns.map(column=><th scope="col" key={column.id}>{column.label}</th>)}</tr></thead><tbody>{plan.areas.map(area=><tr key={area.id}><th scope="row"><strong>{area.label}</strong><p>{area.summary}</p>{area.tasks?.length>0&&<small>{area.tasks.join(' · ')}</small>}</th>{columns.map(column=><td key={column.id} data-label={column.label}><Lines value={area[column.id]}/></td>)}</tr>)}</tbody></table>
 </section>;
}
function Roadmap(){
 const columns=[['infrastructure',plan.areas[0]?.label||'인프라 플랫폼'],['knowledge',plan.areas[1]?.label||'지식 아카이브'],['services',plan.areas[2]?.label||'업무서비스 솔루션'],['gate','다음 단계 진입 조건']];
 return <section className="opp-section" id="opp-roadmap" aria-labelledby="opp-roadmap-title">
  <div className="opp-section-head"><h2 id="opp-roadmap-title">2030까지의 추진 방향</h2><small>{plan.meta.status}</small></div>
  <table className="opp-roadmap opp-responsive-table"><thead><tr><th scope="col">연도와 초점</th>{columns.map(([key,label])=><th scope="col" key={key}>{label}</th>)}</tr></thead><tbody>{plan.roadmap.map(row=><tr key={row.year}><th scope="row"><strong>{row.year}</strong><span>{row.label}</span></th>{columns.map(([key,label])=><td key={key} data-label={label} className={key==='gate'?'opp-gate':undefined}><Lines value={row[key]}/></td>)}</tr>)}</tbody></table>
 </section>;
}
function Topics(){
 if(!plan.topics?.length)return null;
 return <section className="opp-section" id="opp-topics" aria-labelledby="opp-topics-title"><h2 id="opp-topics-title">컨셉을 연결하는 업무 흐름</h2><div className="opp-topic-grid">{plan.topics.map((topic,index)=><article key={topic.id||topic.title}><small>{String(index+1).padStart(2,'0')}</small><h3>{topic.title}</h3><Lines value={topic.flow}/><div className="opp-pills">{topic.ids?.map(id=>{const concept=catalog.find(c=>c.id===id||c.task_ids?.includes(id));return concept?<Link key={id} to={routeWith({concept:concept.slug},'#opp-detail')}>{id}</Link>:<span key={id}>{id}</span>;})}</div>{topic.condition&&<div className="opp-condition"><strong>적용 조건</strong><Lines value={topic.condition}/></div>}{topic.conceptId&&<Link to={routeWith({concept:catalog.find(c=>c.id===topic.conceptId)?.slug},'#opp-detail')}>관련 컨셉 상세 <ArrowRight size={15} aria-hidden="true"/></Link>}</article>)}</div></section>;
}
function ConceptDetail({concept,onClear}){
 useEffect(()=>{
  if(!concept)return;
  const frame=requestAnimationFrame(()=>{
   if(location.hash==='#opp-detail'){const element=document.getElementById('opp-detail');element?.scrollIntoView({block:'start'});element?.focus({preventScroll:true});}
  });
  return()=>cancelAnimationFrame(frame);
 },[concept?.slug]);
 if(!concept)return null;
 return <section className="opp-detail opp-section" id="opp-detail" tabIndex={-1} aria-labelledby="opp-detail-title">
  <div className="opp-section-head"><Link to={onClear}><ArrowLeft size={15} aria-hidden="true"/> 컨셉 목록</Link><Link className="opp-download" to={downloadPath(concept)} download={concept.filename||concept.title+'.md'}><Download size={16} aria-hidden="true"/> 이 컨셉 MD</Link></div>
  <header className="opp-detail-head"><small>{concept.id} · {concept.date} · {concept.status}</small><h2 id="opp-detail-title">{concept.title}</h2><p>{concept.summary}</p><div className="opp-pills"><span>{stageLabel(concept.stage)}</span>{(concept.areas||[concept.primary_area]).filter(Boolean).map(area=><span key={area}>{areaLabel(area)}</span>)}</div>{concept.strategy_ids?.length>0&&<div className="opp-strategy-links">{concept.strategy_ids.map(id=><Link key={id} to={'index.html?view=strategy&strategy='+encodeURIComponent(strategyId(id))}>{strategyId(id)} 전략과제 <ArrowRight size={14} aria-hidden="true"/></Link>)}</div>}</header>
  <div className="opp-document" dangerouslySetInnerHTML={{__html:concept.html||''}}/>
  {concept.sources?.length>0&&<details className="opp-evidence"><summary>이 컨셉의 공개 출처</summary><SourceLinks sources={concept.sources}/></details>}
  <Link to={onClear} className="opp-back"><ArrowLeft size={15} aria-hidden="true"/> 컨셉 목록으로</Link>
 </section>;
}
export function OpportunityWorkspace(){
 const locationState=useSyncExternalStore(subscribe,snapshot,snapshot);
 const params=new URLSearchParams(locationState.split('#')[0]);
 const query=params.get('q')||'',area=params.get('area')||'',stage=params.get('stage')||'',slug=params.get('concept')||'';
 const [draft,setDraft]=useState(query);
 useEffect(()=>setDraft(query),[query]);
 const selected=catalog.find(concept=>concept.slug===slug);
 const normalized=query.trim().toLocaleLowerCase('ko-KR');
 const rows=catalog.filter(concept=>(!area||concept.primary_area===area)&&(!stage||concept.stage===stage)&&(!normalized||[concept.id,concept.title,concept.summary,...(concept.task_ids||[]),...(concept.strategy_ids||[])].join(' ').toLocaleLowerCase('ko-KR').includes(normalized)));
 const change=(changes,hash='#opp-catalog')=>navigate(routeWith(changes,hash));
 const reset=()=>{setDraft('');change({q:null,area:null,stage:null,concept:null});};
 const invalidArea=area&&!plan.areas.some(item=>item.id===area),invalidStage=stage&&!stages.some(([id])=>id===stage);
 const actions=<><a href="#opp-asis-tobe">사례별 AS-IS → TO-BE</a><a href="#opp-areas">3개 영역</a><a href="#opp-roadmap">2030 로드맵</a><a href="#opp-catalog">컨셉별 사업기회</a><Link to={'downloads/concepts/'+encodeURIComponent('00_사업기회_목록.md')} download><Download size={16} aria-hidden="true"/> MD 목록</Link></>;
 return <PageFrame className="opp-page" eyebrow={plan.meta.version+' · '+plan.meta.date} title={plan.meta.title} description={plan.meta.subtitle} actions={actions}>
  <p className="opp-status">{plan.meta.status}</p>
  <AsisTobeCases/><AreaMatrix/><Roadmap/>
  <section className="opp-section" id="opp-catalog" aria-labelledby="opp-catalog-title">
   <div className="opp-section-head"><h2 id="opp-catalog-title">컨셉별 사업기회</h2><span role="status" aria-live="polite">{rows.length}개 / 전체 {catalog.length}개</span></div>
   <form className="opp-filters" onSubmit={event=>{event.preventDefault();change({q:draft.trim()||null});}}>
    <label className="opp-search-label"><span>컨셉·업무·전략 검색</span><div className="opp-search"><Search size={18} aria-hidden="true"/><input type="search" value={draft} onChange={event=>setDraft(event.target.value)} placeholder="컨셉명, 업무 또는 전략 ID" aria-label="컨셉·업무·전략 검색"/><button type="submit">검색</button></div></label>
    <label><span>대표 영역</span><select aria-label="사업기회 영역" value={area} onChange={event=>change({area:event.target.value||null,q:draft.trim()||null})}><option value="">전체 영역</option>{invalidArea&&<option value={area}>등록되지 않은 영역</option>}{plan.areas.map(item=><option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
    <label><span>추진 구분</span><select aria-label="사업기회 추진 구분" value={stage} onChange={event=>change({stage:event.target.value||null,q:draft.trim()||null})}><option value="">전체 추진 구분</option>{invalidStage&&<option value={stage}>등록되지 않은 구분</option>}{stages.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
    <button className="opp-reset" type="button" onClick={reset}><RotateCcw size={16} aria-hidden="true"/> 초기화</button>
   </form>
   {slug&&!selected&&<p className="opp-notice" role="status">등록되지 않은 컨셉입니다. 목록에서 다시 선택해 주세요.</p>}
   {rows.length?<div className="opp-concept-grid">{rows.map(concept=><article className={'opp-concept'+(concept.slug===slug?' is-selected':'')} key={concept.id}><div className="opp-concept-meta"><span>{concept.id}</span><small>{stageLabel(concept.stage)}</small></div><Link className="opp-concept-main" to={routeWith({concept:concept.slug},'#opp-detail')} aria-current={concept.slug===slug?'true':undefined}><h3>{concept.title}<ArrowRight size={17} aria-hidden="true"/></h3><p>{concept.summary}</p></Link><div className="opp-concept-footer"><small>{areaLabel(concept.primary_area)}</small><Link to={downloadPath(concept)} download={concept.filename||concept.title+'.md'} aria-label={concept.title+' Markdown 내려받기'}><Download size={15} aria-hidden="true"/> MD</Link></div></article>)}</div>:<div className="opp-empty"><Search size={26} aria-hidden="true"/><h3>조건에 맞는 컨셉이 없습니다</h3><p>다른 검색어나 영역·추진 구분으로 찾아보세요.</p><button type="button" onClick={reset}>검색 조건 초기화</button></div>}
  </section>
  <ConceptDetail concept={selected} onClear={routeWith({concept:null},'#opp-catalog')}/>
  <Topics/>
  {plan.notes?.length>0&&<section className="opp-section opp-notes" aria-labelledby="opp-notes-title"><h2 id="opp-notes-title">협의와 검증의 기준</h2><Lines value={plan.notes}/></section>}
  {plan.sources?.length>0&&<section className="opp-section" id="opp-sources" aria-labelledby="opp-sources-title"><h2 id="opp-sources-title">공개 근거와 확인 범위</h2><SourceLinks sources={plan.sources}/></section>}
 </PageFrame>;
}
export function OpportunityTeaser(){
 const years=plan.roadmap.filter(row=>Number(row.year)>=2027);
 return <section className="opp-teaser" aria-labelledby="opp-teaser-title"><div className="opp-section-head"><div><small>{plan.meta.version} · {plan.meta.date}</small><h2 id="opp-teaser-title">사업기회와 2030 로드맵</h2></div><Link className="opp-teaser-open" to="index.html?view=opportunities">컨셉별 검토 <ArrowRight size={16} aria-hidden="true"/></Link></div><div className="opp-teaser-areas">{plan.areas.map(area=><div key={area.id}><h3>{area.label}</h3><p>{area.summary}</p></div>)}</div><ol className="opp-teaser-years">{years.map(row=><li key={row.year}><strong>{row.year}</strong><span>{row.label}</span></li>)}</ol><small className="opp-teaser-status">{plan.meta.status}</small></section>;
}
