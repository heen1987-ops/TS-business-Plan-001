import React,{useEffect,useRef,useState}from'react';
import{ChevronRight,Folder,FileText,Search,X,PanelLeft}from'lucide-react';
import{Link}from'./core.jsx';
import'./document-nav.css';
import navigation from './navigation.cjs';
import readingNav from './reading-navigation.cjs';
export const documentTree=readingNav.sections;
export function DocumentNav({route}){
 const trail=navigation.trailFor(route)||[],active=documentTree.find(s=>s.id===trail[0]?.id)||documentTree[0],context=readingNav.contextLinks(route);
 const[query,setQuery]=useState(''),[mobile,setMobile]=useState(false),toggle=useRef(),search=useRef();
 const words=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
 const results=words.length?navigation.records.filter(r=>words.every(w=>[r.title,...r.breadcrumb].join(' ').toLowerCase().includes(w))):[];
 useEffect(()=>{setMobile(false);setQuery('')},[route]);
 const current=navigation.canonical(route);
 function render(nodes){return <ul className="doc-tree">{nodes.map(n=><li key={n.id}>{n.children?<details><summary><ChevronRight size={14}/><Folder size={16}/>{n.title}</summary>{render(n.children)}</details>:<Link to={n.to} aria-current={(n.to.includes('#section-chapter-')?route.split('#')[1]===n.to.split('#')[1]:navigation.canonical(n.to)===current)?'page':undefined}><FileText size={14}/><span>{n.title}</span></Link>}</li>)}</ul>}
 return <aside className={'document-nav '+(mobile?'mobile-open':'')} aria-label="문서 탐색" onKeyDown={e=>{if(e.key==='Escape'&&mobile){setMobile(false);toggle.current?.focus()}}}>
 <button ref={toggle} className="doc-mobile-toggle" aria-expanded={mobile} aria-controls="document-tree-panel" onClick={()=>{setMobile(!mobile);if(!mobile)requestAnimationFrame(()=>search.current?.focus())}}><PanelLeft size={18}/>문서 목차 {mobile?'닫기':'열기'}</button>
 <div className="doc-panel" id="document-tree-panel"><div className="doc-section-heading"><span>TS를 이해하는 순서</span><strong>{active.title}</strong></div>
 <nav className="doc-journey" aria-label="기관에서 제안까지 읽는 순서">{readingNav.journey.map((j,i)=><Link to={j.to} key={j.id}><span>{i+1}</span>{j.title}</Link>)}</nav>
 <label className="doc-search"><Search size={16}/><input ref={search} value={query} onChange={e=>setQuery(e.target.value)} aria-label="목차 검색" placeholder="필요한 자료 찾기"/>{query&&<button aria-label="목차 검색 지우기" onClick={()=>{setQuery('');search.current?.focus()}}><X size={16}/></button>}</label>
 <p className="doc-search-hint">세부 항목은 검색 또는 본문에서 확인</p>
 {words.length?<nav aria-label="목차 검색 결과">{results.length?<ul className="doc-tree doc-search-results">{results.map(r=><li key={r.id}><Link to={r.route}><span><b>{r.title}</b><small>{r.breadcrumb.slice(0,-1).join(' / ')}</small></span></Link></li>)}</ul>:<div className="doc-empty" role="status">일치하는 목차 없음<button onClick={()=>setQuery('')}>검색 초기화</button></div>}</nav>:
 <nav aria-label="문서 목차"><div className="doc-context-title">{context?context.d.name:'관련 문서'}</div>{render(context?context.links:active.children)}{context&&<details className="doc-other-departments"><summary>다른 처의 제안 보기</summary>{render(readingNav.sections[3].children)}</details>}</nav>}
 <div className="doc-position"><Link to="index.html?view=map">조직 연결지도</Link><Link to="registry.html">전체 자료 원장</Link></div></div></aside>
}
