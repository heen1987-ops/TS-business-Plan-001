import React,{useState} from 'react';
import {ArrowLeft,ArrowUpRight,ChevronRight,Search,X,Network,FolderTree,FileText} from 'lucide-react';
import {Link,navigate} from './core.jsx';
import org from './org-map-data.cjs';
import impact from './impact.json';
import './org-map.css';
import {SiteConnections} from './Websites.jsx';
const {tree,nodes,parents,ancestry,proposals,documents,departmentByCode,kindLabel,edgeKind}=org;
const nodeUrl=id=>id==='TS'?'index.html?view=map':'index.html?node='+encodeURIComponent(id);
const related=d=>d?Object.values(departmentByCode).filter(x=>x.code!==d.code&&String(d.partner||'').includes(x.name)):[];
function MapNode({node,position,back=false,relation}){
 const body=<><span className="map-node-tag">{back?'상위 항목':kindLabel(node)}</span><strong>{node.name}</strong>{node.kind==='document'?<FileText size={16}/>:<ChevronRight size={17}/>}</>;
 return node.to?<Link to={node.to} className="map-node map-document" style={position} data-node={node.id}>{body}</Link>:
 <Link to={nodeUrl(node.id)} className={'map-node '+(back?'map-ancestor ':'')+(relation==='related'?'map-related-node':'')} style={position} data-node={node.id} aria-label={node.name+(back?'로 돌아가기':node.children.length?' 하위 항목 보기':' 연결 자료 보기')}>{body}</Link>;
}
function Diagram({node}){
 const parent=nodes[parents[node.id]], children=node.children.length?node.children:documents(node),isDocs=!node.children.length;
 const height=Math.max(432,children.length*72+32), mid=height/2;
 const focusX=parent?28:5, focusW=parent?27:30,childX=parent?67:53;
 const start=(height-children.length*72)/2;
 const relation=child=>edgeKind(node,child);
 return <div className="org-diagram" style={{'--map-height':height+'px'}} data-focus-node={node.id}>
  <svg className="map-connectors" viewBox={'0 0 1000 '+height} preserveAspectRatio="none" aria-hidden="true">
   {parent&&<path d={'M 205 '+mid+' H '+focusX*10} className={edgeKind(parent,node)==='related'?'is-related':''}/>}
   {children.map((child,i)=>{const y=start+i*72+30;return <path key={child.id} data-edge={node.id+'>'+child.id} d={'M '+(focusX+focusW)*10+' '+mid+' H '+(childX-7)*10+' V '+y+' H '+childX*10} className={relation(child)==='related'?'is-related':''}/>;})}
  </svg>
  {parent&&<MapNode node={parent} back relation={edgeKind(parent,node)} position={{left:0,width:'20.5%',top:mid}}/>}
  <div className="map-focus" style={{left:focusX+'%',width:focusW+'%',top:mid}} aria-label={'현재 위치: '+node.name}>
   <span>{node.id==='TS'?'TS · 출발점':kindLabel(node)}</span><h2>{node.name}</h2><p>{node.code?'처별 AX 제안 '+documents(node).length+'개 자료 연결':node.kind==='case'?'부서명이 아닌 업무 적용안':node.children.length?'하위 '+node.children.length+'개 항목 탐색':node.supplement?.length?'업무별 상세 검토안·공식 근거 연결':'기존 조직 자료 연결'}</p>
  </div>
  <div className={"map-child-list"+(children.every(c=>relation(c)==='related')?" all-related":"")} aria-label={isDocs?'연결 자료':'하위 조직과 적용안'}>
   {children.map((child,i)=><MapNode key={child.id} node={child} relation={relation(child)} position={{left:childX+'%',width:(99-childX)+'%',top:start+i*72}}/>)}
  </div>
 </div>;
}
function Context({node}){
 const d=departmentByCode[node.code],list=proposals(node),links=documents(node),metrics=d?impact.departments[d.code]?.metrics||[]:[],collaborators=related(d);
 return <aside className="map-context" aria-label="현재 조직의 자료 안내">
  <span className="map-kicker">{node.code?'제안된 전환 목적':'연결 자료 안내'}</span>
  <h2>{d?d.title:node.id==='TS'?'기관에서 업무로, 업무에서 제안으로':node.name}</h2>
  <p>{d?d.goal:node.summary}</p>
  {d&&<div className="map-system"><b>기존 업무·시스템 접점</b><p>{d.system}</p></div>}
  {node.pending&&<p className="map-notice">상세 조사·검토 경로 연결. 현행 조직 배정과 전체 분장은 확인 대기. 업무 부재 또는 과업 확정을 의미하지 않음.</p>}
  {node.children.length>0&&<div className="map-resource-links">{links.map((link,i)=><Link key={link.id} to={link.to}><span>{String(i+1).padStart(2,'0')}</span><div><b>{link.name}</b><small>{link.summary}</small></div><ArrowUpRight size={16}/></Link>)}</div>}
  {metrics.length>0&&<div className="map-related"><h3>지표별 측정명세 바로가기</h3>{metrics.map(m=><Link key={m.id} to={d.folder+'/01_사업정의.html?view=impact&metric='+m.id+'&slide='+m.id+'-method-1'}>{m.id} · {m.title}<ArrowUpRight size={14}/></Link>)}<small>목표안과 실측 결과 구분 · 산식·표본·증빙·판정 확인</small></div>}
  {!d&&list.length>0&&node.id!=='TS'&&<div className="map-related"><h3>이 계통의 AX 제안 · {list.length}개 처</h3>{list.map(x=><Link key={x.code} to={nodeUrl(x.code)}>{x.name}<ChevronRight size={14}/></Link>)}</div>}
  <SiteConnections node={node}/>
  {collaborators.length>0&&<div className="map-related"><h3>제안서상 협업 접점</h3>{collaborators.map(x=><Link key={x.code} to={nodeUrl(x.code)}>{x.name}<ChevronRight size={14}/></Link>)}<small>협업 설계안 연결 · 공식 업무분장 확정과 구분</small></div>}
 </aside>;
}
export function Home(){
 const requested=new URLSearchParams(location.search).get('node')||'TS',node=nodes[requested]||tree;
 const [query,setQuery]=useState(''),[outline,setOutline]=useState(false);
 const words=query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
 const matches=words.length?Object.values(nodes).filter(n=>{const d=departmentByCode[n.code];const text=[n.name,n.summary,d?.goal,d?.system,...ancestry(n.id).map(a=>a.name)].join(' ').toLocaleLowerCase();return words.every(w=>text.includes(w));}):[];
 const trail=ancestry(node.id),childNodes=node.children.length?node.children:documents(node);
 return <div className="mindmap-home">
  <div className="map-home-heading"><div><span className="map-kicker">TS AX 사업기획 · 조직 기반 탐색</span><h1>조직에서 시작하는 연결지도</h1><p>조직을 따라 이동하고, 업무별 제안과 근거를 한 번에 찾는 자료 지도.</p></div><div className="map-top-links"><Link to="skill-pms.html#pms-department-review" className="map-guide">{org.coverageLabels.topLink}</Link><Link to="proposal-links.html" className="map-guide">추가 조직·업무 상세제안</Link><Link to="websites.html" className="map-guide"><ArrowUpRight size={17}/>처별 공식 홈페이지</Link><Link to="about.html" className="map-guide"><FolderTree size={17}/>TS의 정의부터 읽기</Link></div></div>
  <div className="map-toolbar">
   <div className="map-search-wrap"><label className="map-search"><Search size={19}/><input aria-label="조직·업무·시스템 검색" placeholder="처 이름, 업무 또는 시스템 검색 · 예: 데이터융복합, KADIS" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Escape')setQuery('');if(e.key==='Enter'&&matches.length===1)navigate(nodeUrl(matches[0].id));}}/>{query&&<button onClick={()=>setQuery('')} aria-label="검색어 지우기"><X size={17}/></button>}</label>
    {words.length>0&&<div className="map-search-results"><p role="status">{matches.length}개 연결 항목{matches.length===0?' · 검색어를 줄이거나 처 이름으로 검색':''}</p><ul>{matches.map(n=><li key={n.id}><Link to={nodeUrl(n.id)}><strong>{n.name}</strong><small>{ancestry(n.id).slice(1,-1).map(a=>a.name).join(' › ')||'TS'} · {kindLabel(n)}</small></Link></li>)}</ul></div>}
   </div>
   <div className="map-toolbar-actions"><Link to="index.html?view=map"><Network size={16}/>전체 지도</Link><button onClick={()=>setOutline(!outline)} aria-pressed={outline}>{outline?'연결도 보기':'목록 보기'}</button></div>
  </div>
  {!nodes[requested]&&<p role="status" className="map-invalid">요청한 조직을 찾을 수 없어 전체 지도 표시. 검색 또는 아래 조직에서 다시 탐색.</p>}
  <nav className="map-breadcrumb" aria-label="조직 경로">{trail.map((n,i)=><React.Fragment key={n.id}>{i>0&&<ChevronRight size={13}/>}<Link to={nodeUrl(n.id)} aria-current={i===trail.length-1?'location':undefined}>{n.name}</Link></React.Fragment>)}</nav>
  <div className="map-workspace">
   <section className="map-board" aria-label="조직 연결지도">
    <header><div>{parents[node.id]?<Link className="map-back" to={nodeUrl(parents[node.id])}><ArrowLeft size={16}/>상위 항목</Link>:<b>TS 조직·업무 탐색</b>}</div><div className="map-legend"><span>━━ 조직 계통</span><span>┄┄ 탐색·자료 연결</span></div></header>
    {outline?<div className="map-outline"><h2>{node.name}</h2><ul>{childNodes.map(child=><li key={child.id}><Link to={child.to||nodeUrl(child.id)}><strong>{child.name}</strong><small>{child.summary}</small><span>{kindLabel(child)} <ChevronRight size={14}/></span></Link></li>)}</ul></div>:<Diagram node={node}/>}
    <div className="map-caption">{node.children.length?'조직명 클릭 → 하위 항목 이동 · 경로 클릭 → 상위 단계 복귀':'자료명 클릭 → 해당 상세 페이지 이동'}<span>{node.id==='TS'?org.coverageLabels.rootCaption:'실선: 조직 계통 / 점선: 탐색 묶음·적용안·자료'}</span></div>
   </section>
   <Context node={node}/>
  </div>
  <div className="map-basis"><b>조직도 기반 탐색용 지도</b><p>{org.coverageLabels.basis}</p><Link to="organization.html">조직 분석·확인 범위</Link><Link to="legal/sources.html">법령 근거·원문</Link></div>
 </div>;
}
