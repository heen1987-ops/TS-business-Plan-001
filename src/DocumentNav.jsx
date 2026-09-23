import React,{useEffect,useRef,useState}from'react';
import{ChevronRight,Folder,FileText,Search,X,PanelLeft}from'lucide-react';
import{depts,legal,deptPath,Link}from'./core.jsx';
import'./document-nav.css';
const leaf=(title,to)=>({title,to});
const branch=(id,title,children)=>({id,title,children});
const views=[['modules','구성요소·역할'],['interfaces','연계·인터페이스'],['data','데이터·원장'],['runtime','서버 배치·복구'],['trace','요구사항·RFP 추적']];
function archLinks(base){return [leaf('전체 구성도',base),...views.map(([id,t])=>leaf(t,base+(base.includes('?')?'&':'?')+'arch='+id))]}
export const documentTree=[
 leaf('자료 안내','index.html'),
 branch('institution','01. TS 기관 이해',[leaf('기관의 존재 의의','about.html'),branch('laws','법정·수탁업무',[leaf('전체 업무 지도','legal.html'),...legal.groups.map(g=>leaf(g.title,'legal/'+g.id+'.html')),leaf('법령 근거·확인 범위','legal/sources.html')])]),
 branch('strategy','02. 2026–2030 계획',[leaf('경영목표·전략과제','vision.html')]),
 branch('organization','03. 조직·수행업무',[leaf('조직도·업무 연결','organization.html'),leaf('대국민 ARS 업무지도','ars.html')]),
 branch('departments','04. 처별 AX 전환 제안',[leaf('처별 제안 목록','solutions.html'),...depts.map(d=>branch('dept-'+d.code,d.name,[
 leaf('사업 정의·컨셉',deptPath(d,0)),leaf('서비스 흐름',deptPath(d,1)),
 branch('arch-'+d.code,'상세 아키텍처',archLinks(deptPath(d,2))),
 branch('measure-'+d.code,'정량효과·측정방법',[leaf('추진 근거·목표',deptPath(d,0)+'?view=impact'),...[1,2,3].map(n=>leaf('지표 '+n+' · 측정명세',deptPath(d,0)+'?view=impact&metric='+d.code+'-E0'+n+'&slide='+d.code+'-E0'+n+'-method-1'))]),
 leaf('문제·법정업무 근거',deptPath(d,0)+'?view=evidence'),
 leaf('요구사항·대가 산정',deptPath(d,0)+'?view=requirements')
 ]))]),
 branch('katri','05. 자동차안전연구원 KATRI',[leaf('문서 1차 검토 적용안','katri.html'),
 ...[['KA-01','기술검토·안전검사'],['KA-02','부품 증빙·사후관리'],['KA-03','국제기준 변경 대응']].map(([id,t])=>branch(id,t,[leaf('업무·검토 내용','katri.html?case='+id),branch('arch-'+id,'상세 아키텍처',archLinks('architecture.html?unit='+id))]))]),
 branch('references','06. 공통 설계·검토 자료',[leaf('추가 설계 정리','updates.html'),leaf('업무 전환 후보·근거','discovery.html')])
];
function canonical(to){const [path,q='']=to.split('#')[0].split('?'),s=new URLSearchParams(q);let p=path==='react/index.html'?'index.html':path;const alias={'10_세대화_통합검토.html':'about.html','11_중장기목표_처별성과.html':'vision.html','16_조직도_수행업무_분석.html':'organization.html','17_조직별_AX_전환제안.html':'solutions.html'};
 p=alias[p]||p;s.delete('contract');s.delete('store');s.delete('slide');s.delete('reading');if(p==='architecture.html'){const d=depts.find(d=>d.code===(s.get('unit')||'DF'));if(d){p=deptPath(d,2);s.delete('unit')}}if(s.has('view')&&p.startsWith('처별/'))p=p.replace(/0[123]_[^/]+\.html$/,'01_사업정의.html');s.sort();return p+(s.toString()?'?'+s.toString():'')}
function findTrail(nodes,current,parents=[]){for(const n of nodes){const trail=[...parents,n];if(n.to&&canonical(n.to)===current)return trail;if(n.children){const found=findTrail(n.children,current,trail);if(found)return found}}return null}
function filter(nodes,term,parents=[]){return nodes.flatMap(n=>{if(!term||[...parents,n.title].join(' ').toLowerCase().includes(term))return[n];const children=n.children?filter(n.children,term,[...parents,n.title]):[];return children.length?[{...n,children}]:[]})}
export function DocumentNav({route}){const current=canonical(route),trail=findTrail(documentTree,current)||[],[opened,setOpened]=useState(()=>new Set(['institution',...trail.filter(n=>n.id).map(n=>n.id)])),[query,setQuery]=useState(''),[mobile,setMobile]=useState(false),toggle=useRef(),search=useRef();const tree=filter(documentTree,query.trim().toLowerCase());
useEffect(()=>{setOpened(old=>new Set([...old,...(findTrail(documentTree,canonical(route))||[]).filter(n=>n.id).map(n=>n.id)]));setMobile(false);setQuery('');requestAnimationFrame(()=>{const panel=document.getElementById('document-tree-panel'),item=panel?.querySelector('a[aria-current=page]');if(!panel||!item||!panel.offsetHeight||!item.offsetHeight)return;const a=item.getBoundingClientRect(),b=panel.getBoundingClientRect();if(a.bottom>b.bottom-16)panel.scrollTop+=a.bottom-b.bottom+24;else if(a.top<b.top+16)panel.scrollTop-=b.top-a.top+24})},[route]);
function render(nodes,depth=0){return <ul className={depth?'doc-subtree':'doc-tree'}>{nodes.map(n=><li key={n.id||n.to}>{n.children?<details open={!!query||opened.has(n.id)}><summary onClick={e=>{e.preventDefault();setOpened(old=>{const next=new Set(old);next.has(n.id)?next.delete(n.id):next.add(n.id);return next})}}><ChevronRight className="doc-chevron" size={14}/><Folder size={16}/><span>{n.title}</span></summary>{render(n.children,depth+1)}</details>:<Link to={n.to} aria-current={canonical(n.to)===current?'page':undefined}><FileText size={14}/><span>{n.title}</span></Link>}</li>)}</ul>}
return <aside className={'document-nav '+(mobile?'mobile-open':'')} aria-label="문서 탐색" onKeyDown={e=>{if(e.key==='Escape'&&mobile){setMobile(false);toggle.current?.focus()}}}><button ref={toggle} className="doc-mobile-toggle" aria-expanded={mobile} aria-controls="document-tree-panel" onClick={()=>{setMobile(!mobile);if(!mobile)requestAnimationFrame(()=>search.current?.focus())}}><PanelLeft size={18}/>문서 목차 {mobile?'닫기':'열기'}</button><div className="doc-panel" id="document-tree-panel"><div className="doc-nav-heading"><strong>문서 목차</strong><button onClick={()=>{setQuery('');setOpened(new Set())}}>모두 접기</button></div><label className="doc-search"><Search size={16}/><input ref={search} value={query} onChange={e=>setQuery(e.target.value)} aria-label="목차 검색" placeholder="목차에서 찾기"/>{query&&<button aria-label="목차 검색 지우기" onClick={()=>{setQuery('');search.current?.focus()}}><X size={16}/></button>}</label><p className="doc-search-hint">제목·폴더명 검색</p><nav aria-label="문서 목차">{tree.length?render(tree):<div className="doc-empty" role="status">일치하는 목차 없음<button onClick={()=>setQuery('')}>검색 초기화</button></div>}</nav><div className="doc-position" aria-label="현재 문서 위치"><span>현재 위치</span><p>{trail.map(n=>n.title).join(' / ')||'연결 문서'}</p></div></div></aside>}
