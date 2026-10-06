import React,{useEffect,useRef,useState}from'react';
import{ChevronRight,PanelLeft,ArrowLeft}from'lucide-react';
import{Link}from'./core.jsx';
import'./document-nav.css';
import ux from'./ux-navigation.cjs';
export const documentTree=ux.sections;
export function DocumentNav({route}){const active=ux.sectionFor(route),context=ux.contextLinks(route),[mobile,setMobile]=useState(false),toggle=useRef(),panel=useRef();
 useEffect(()=>{setMobile(false)},[route]);
 function closeAfterLink(e){if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;setMobile(false);}
 const links=context?context.links:active.children;const routeUrl=new URL(route,'https://local/'),chosen=links.find(n=>n.id===context?.activeId)||links.find(n=>n.to===route)||links.find(n=>routeUrl.hash&&new URL(n.to,'https://local/').hash===routeUrl.hash)||links.find(n=>!new URL(n.to,'https://local/').hash&&new URL(n.to,'https://local/').pathname===routeUrl.pathname&&new URL(n.to,'https://local/').search===routeUrl.search);
 return <aside className={'document-nav '+(mobile?'mobile-open':'')} aria-label="문서 탐색" onKeyDown={e=>{if(e.key==='Escape'&&mobile){setMobile(false);toggle.current?.focus()}}}>
 <button ref={toggle} className="doc-mobile-toggle" aria-expanded={mobile} aria-controls="document-tree-panel" onClick={()=>{setMobile(!mobile);if(!mobile)requestAnimationFrame(()=>panel.current?.querySelector('a')?.focus())}}><PanelLeft size={18}/>문서 목차 {mobile?'닫기':'열기'}</button>
 <div className="doc-panel" id="document-tree-panel" ref={panel}><div className="doc-section-heading"><span>{context?.kind==='institution'?'기관 이해':context?.kind==='analysis'?'2027 후속사업기획':context?'처별 상세제안':'현재 메뉴'}</span><strong>{context?context.d.name:active.title}</strong></div>
 {context?<Link to={context.kind==='institution'?'index.html':context.kind==='analysis'?'index.html':'solutions.html'} className="ux-back-link" onClick={closeAfterLink}><ArrowLeft size={15}/>{context.kind==='institution'?'사업기획 안내':context.kind==='analysis'?'사업기획 홈':'다른 처 찾기'}</Link>:<p className="ux-nav-description">{active.description}</p>}
 <nav aria-label="문서 목차"><ul className="doc-tree">{links.map((n,i)=>{const exact=chosen?.id===n.id;return <li key={n.id}><Link to={n.to} onClick={closeAfterLink} aria-current={exact?'page':undefined}>{context?<span className="ux-nav-number">{String(i+1).padStart(2,'0')}</span>:<ChevronRight size={14}/>}<span>{n.title}</span></Link></li>})}</ul></nav>
 <div className="ux-nav-separator"/><nav className="ux-sidebar-areas" aria-label="사이트 영역">{ux.sections.filter(s=>s.id!==active.id).map(s=><Link key={s.id} to={s.children[0].to} onClick={closeAfterLink}>{s.title}<ChevronRight size={14}/></Link>)}</nav>
 <p className="ux-sidebar-note">자료 제목·조직 검색은 상단의 자료 검색 이용</p></div></aside>
}
