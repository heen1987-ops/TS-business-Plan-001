import React,{useState} from 'react';
import {ArrowUpRight,Search,X,Network,Download} from 'lucide-react';
import {Link,navigate} from './core.jsx';
import catalog from './official-sites.cjs';
import org from './org-map-data.cjs';
import './websites.css';
const {sites,sources,date,forNode,find}=catalog;
const external=(url,title)=> <a href={url} target="_blank" rel="noopener noreferrer">{title}<ArrowUpRight size={14}/><span className="sr-only"> (새 창)</span></a>;
export function SiteConnections({node}){
 const rows=forNode(node.id),pending=rows.filter(s=>s.status!=='처 관계 확인').length;
 return <section className="site-connections" aria-label="공식 홈페이지 연결"><h3>공식 홈페이지·업무시스템</h3>
 {rows.length?<><p>{node.id==='TS'?'전체 목록':node.children.length?'하위 조직 포함':'담당 관계'} {rows.length}개 경로{pending>0?' · 처 미확인 '+pending+'개 포함':''}</p>
 <ul>{rows.slice(0,4).map(s=><li key={s.id}>{external(s.url,s.title)}<small>{s.kind} · {s.mappings.length?s.mappings.map(m=>m.department).filter((v,i,a)=>a.indexOf(v)===i).join(' · '):s.status}</small></li>)}</ul>
 <Link to={'websites.html'+(node.id==='TS'?'':'?node='+node.id)}>연결 목록·담당 근거 {rows.length}개 보기 <ArrowUpRight size={14}/></Link></>:<><p>이번 수집 범위에서 확인된 연결 없음. 홈페이지나 업무의 부재를 의미하지 않음.</p><Link to="websites.html">전체 사이트 목록 확인 <ArrowUpRight size={14}/></Link></>}
 </section>
}
function Card({site:s}){
 return <article className="official-site" data-site={s.id}>
  <div className="site-card-head"><div><span className="site-category">{s.category} · {s.kind}</span><h2>{external(s.url,s.title)}</h2><span className="site-url">{s.url}</span></div><span className={'site-status '+(s.status==='처 관계 확인'?'confirmed':'pending')}>{s.status}</span></div>
  <div className="site-relations">{s.mappings.length?s.mappings.map((m,i)=><div className="site-relation" key={i}><Link to={'index.html?node='+m.node}>{m.department}<Network size={14}/></Link><span>{m.role}</span>{external(sources[m.source].url,'담당 근거')}</div>):<p className="site-pending">담당 처 확인 대기 · 부서명 추정 배정 없음</p>}</div>
  {s.note&&<p className="site-note">{s.note}</p>}
  <details className="site-evidence"><summary>출처·연결 범위 확인</summary><dl><div><dt>사이트 출처</dt><dd>{external(sources[s.linkSource].url,sources[s.linkSource].title)}</dd></div><div><dt>수록 기준</dt><dd>{s.baseline?'TS 공공웹사이트 공식 목록 31개 항목에 포함':'공식 업무안내·대표 누리집에서 추가 확인'}</dd></div><div><dt>담당 판단</dt><dd>업무안내 또는 개인정보파일 운영·열람청구 담당 관계 확인. 단독 운영부서·예산권·위탁계약·연계 API 권한 확정과 구분.</dd></div>{s.mappings.map((m,i)=><div key={i}><dt>{m.department}</dt><dd>{sources[m.source].basis}</dd></div>)}<div><dt>조회 기준</dt><dd>{date} · 원문 페이지와 공개 연결주소 확인. 개별 서비스 로그인·실제 업무처리·접속 지속성 미검증.</dd></div></dl></details>
 </article>
}
export function Websites(){
 const params=new URLSearchParams(location.search),requested=params.get('node')||'TS',node=org.nodes[requested]?requested:'TS',status=['all','pending','confirmed'].includes(params.get('status'))?params.get('status'):'all';
 const [query,setQuery]=useState(''),rows=find({node,query,status});
 const change=(key,value)=>{const q=new URLSearchParams(location.search);value==='TS'||value==='all'?q.delete(key):q.set(key,value);navigate('websites.html'+(q.size?'?'+q:''))};
 const pending=sites.filter(s=>s.status!=='처 관계 확인').length;
 return <div className="websites-page">
  <header className="websites-heading"><span className="map-kicker">조직 → 업무 → 공식 사이트</span><h1>처별 홈페이지·업무시스템</h1><p>담당 관계와 근거를 함께 확인하는 TS 공식 서비스 연결 목록.</p><div className="website-actions"><Link to={'index.html'+(node==='TS'?'':'?node='+node)}><Network size={16}/>조직 지도로 이동</Link><Link to="downloads/official-sites.md" download><Download size={16}/>매핑표 내려받기</Link></div></header>
  <div className="website-summary"><div><b>{sites.length}</b><span>사이트·업무경로</span></div><div><b>{sites.filter(s=>s.baseline).length}</b><span>공식 목록 수록 항목</span></div><div><b>{sites.length-pending}</b><span>처별 담당 관계 확인</span></div><div><b>{pending}</b><span>담당 처 확인 대기</span></div></div>
  <p className="websites-scope">본 목록의 ‘부처’는 TS 내부의 처·실·센터 기준. 같은 도메인의 분야별 서비스와 공식 업무안내 포함. 독립 홈페이지 수·전체 운영 시스템 수와 구분.</p>
  <form className="website-filters" onSubmit={e=>e.preventDefault()} aria-label="공식 사이트 검색과 필터">
   <label className="website-search"><span>사이트·부서·업무 검색</span><div><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="예: DRT, 검사, 항공, 데이터융복합처" aria-label="사이트·부서·업무 검색"/>{query&&<button type="button" aria-label="사이트 검색 지우기" onClick={()=>setQuery('')}><X size={16}/></button>}</div></label>
   <label><span>조직 범위</span><select aria-label="조직 범위" value={node} onChange={e=>change('node',e.target.value)}>{Object.values(org.nodes).filter(n=>!['case','document'].includes(n.kind)).map(n=><option value={n.id} key={n.id}>{n.id==='TS'?'전체 조직':org.ancestry(n.id).slice(1).map(x=>x.name).join(' › ')}</option>)}</select></label>
   <label><span>담당 확인 상태</span><select aria-label="담당 확인 상태" value={status} onChange={e=>change('status',e.target.value)}><option value="all">전체</option><option value="confirmed">처 관계 확인</option><option value="pending">담당 처 확인 대기</option></select></label>
  </form>
  {requested!==node&&<p role="status">요청한 조직을 찾을 수 없어 전체 목록 표시.</p>}
  <div className="website-result-head"><h2>{node==='TS'?'전체':org.nodes[node].name} 연결 목록</h2><span role="status">{rows.length}개 경로</span></div>
  {rows.length?<div className="website-results">{rows.map(s=><Card site={s} key={s.id}/>)}</div>:<div className="website-empty" role="status"><h2>조건에 맞는 연결 없음</h2><p>이번 수집 범위에서 미확인 상태이거나 검색 조건과 불일치. 독립 홈페이지·담당업무의 부재를 의미하지 않음.</p><button onClick={()=>{setQuery('');navigate('websites.html')}}>전체 목록으로 초기화</button></div>}
  <section className="website-method"><h2>매핑 근거와 해석 기준</h2><ul><li>공식 목록 31개 항목 전체 수록. 담당 처 확인과 사이트 등재 여부의 분리.</li><li>업무안내 페이지의 담당부서, 개인정보처리방침 제16조의 개인정보파일 운영·열람청구 담당을 역할별 기록.</li><li>공공웹사이트 목록 페이지의 담당부서를 모든 시스템 운영부서로 일괄 배정하지 않는 원칙.</li><li>TS배움터·국가자격 포털·사이버검사소 등 공동 경로의 분야별 담당 분리.</li><li>이 목록은 외부 연결 안내. API 연계·인증·데이터 이용권한은 별도 확인 대상.</li></ul><div className="website-actions">{external(sources.directory.url,'TS 공식 공공웹사이트 목록')}{external(sources.privacy.url,'TS 개인정보처리방침')}<Link to="legal.html">법정·수탁업무 지도</Link></div><small>조사 기준 {date} · 담당 처 확인 대기 항목은 원문 보완 후 갱신</small></section>
 </div>;
}
