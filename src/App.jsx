import planning2027 from './planning-2027.cjs';
import {IntegratedHeader,IntegratedReader} from './IntegratedReader.jsx';
import {ProblemPlanning} from './ProblemPlanning.jsx';
import {PlanningWorkbench} from './PlanningWorkbench.jsx';
import{UserHome}from'./UserHome.jsx';
import{DepartmentDirectory}from'./DepartmentDirectory.jsx';
import{DepartmentWorkspace}from'./DepartmentWorkspace.jsx';
import{SkillPms}from'./SkillPms.jsx';
import{DrtAssurance}from'./DrtAssurance.jsx';
import{PlanningDocuments}from'./DepartmentDocuments.jsx';
import{Associations}from'./Associations.jsx';
import{ResearchLibrary}from'./ResearchLibrary.jsx';
import{ProposalLinks}from'./ProposalLinks.jsx';
import{DocumentReader}from'./DocumentReader.jsx';
import{Evidence47}from'./Revision47.jsx';
import{Home}from'./Home.jsx';
import{Websites}from'./Websites.jsx';
import{GuideHome}from'./GuideHome.jsx';
import React,{useState,useEffect,useRef}from'react';import{createRoot}from'react-dom/client';import{ArrowUpRight,ArrowRight,ShieldCheck,X,GitCompareArrows,ChevronRight}from'lucide-react';
import{depts,legal,Link,Icon,readRoute,navigate}from'./core.jsx';
import{About,Vision,Organization,Services,Comparison,Legal,Sources,Department}from'./pages.jsx';import'./styles.css';import{Discovery}from'./Discovery.jsx';import'./discovery.css';import{Updates}from'./Updates.jsx';import'./updates.css';
import{Ars}from'./Ars.jsx';import{Katri}from'./Katri.jsx';import{ArchitectureHub}from'./Architecture.jsx';import{DocumentNav}from'./DocumentNav.jsx';
import {SiteHeader as Header,SiteLocation,SiteQuickLinks} from './SiteNavigation.jsx';
import {Registry} from './Registry.jsx';
import {LawMapping} from './LawMapping.jsx';
import './ts-navigation.css';
import './user-centred.css';
import './reader-ui.css';
const sectors=legal.groups;
function App(){const[route,setRoute]=useState(readRoute()+location.search+location.hash),[navigationEpoch,setNavigationEpoch]=useState(0),[selected,setSelected]=useState([]),[compare,setCompare]=useState(false),[message,setMessage]=useState(''),first=useRef(true);
useEffect(()=>{const cb=()=>{setRoute(readRoute()+location.search+location.hash);setNavigationEpoch(v=>v+1)};addEventListener('popstate',cb);return()=>removeEventListener('popstate',cb)},[]);
useEffect(()=>{setCompare(false);if(first.current){first.current=false;return}if(location.hash)return;scrollTo({top:0,behavior:'instant'});document.getElementById('main')?.focus({preventScroll:true})},[route,navigationEpoch]);
useEffect(()=>{if(!message)return;const id=setTimeout(()=>setMessage(''),4500);return()=>clearTimeout(id)},[message]);
function toggle(code){setSelected(a=>{if(a.includes(code))return a.filter(c=>c!==code);if(a.length>=3){setMessage('최대 3개 서비스까지 비교 가능. 기존 항목을 해제한 후 추가해 주세요.');return a}return [...a,code]})}
const path=route.split(/[?#]/)[0],isHome=['index.html','react/index.html',''].includes(path),view=new URLSearchParams(location.search).get('view'),isWorkbench=isHome&&view==='workbench',isMap=isHome&&!isWorkbench&&(view==='map'||new URLSearchParams(location.search).has('node'));const homeDocument=isHome&&view==='guide',isLanding=isHome&&view==='overview'&&!isMap,isProblem=isHome&&view==='problems'&&!isMap,isUnified=isHome&&!isWorkbench&&!isMap&&!homeDocument&&!isLanding&&!isProblem;let content,title='TS AX';
if(isHome){content=isMap?<Home key={route}/>:isProblem?<ProblemPlanning route={route}/>:isUnified?<IntegratedReader route={route}/>:isLanding?<UserHome key={path} route={route} navigationEpoch={navigationEpoch}/>:<About/>;title=isMap?'조직 기반 연결지도':isProblem?'문제별 통합기획':isUnified?'2027년 TS 후속사업기획 · 통합 본문':isLanding?'이전 기획 목록':'TS의 이해와 AX 사업기획';}
else if(['about.html','10_세대화_통합검토.html'].includes(path)){content=<About/>;title='TS의 존재 의의'}
else if(['vision.html','11_중장기목표_처별성과.html'].includes(path)){content=<Vision/>;title='2026–2030 방향'}
else if(['organization.html','16_조직도_수행업무_분석.html'].includes(path)){content=<Organization/>;title='조직과 업무'}
else if(path==='drt-assurance.html'){content=<DrtAssurance route={route}/>;title='택시조합 전화 접수·배차·운영계획'}
else if(path==='associations.html'){content=<Associations key={route}/>;title='협회·민원 조사와 미제공 기능 재검토'}
else if(path==='skill-pms.html'){content=<SkillPms key={route}/>;title='기구축 AI 플랫폼 확장형 스킬 PMS'}
else if(path==='research-library.html'){content=<ResearchLibrary key={path+location.search}/>;title=new URL(route,'https://local/').searchParams.get('view')==='survey'?'처별 병목 검토와 AX 확대 의견':new URL(route,'https://local/').searchParams.get('view')==='planning'?planning2027.title:'조사자료실'}
else if(path==='planning-documents.html'){content=<PlanningDocuments key={route+'-'+navigationEpoch}/>;title='처별 한글 계획서·대가산정·도식집'}
else if(path==='proposal-links.html'){content=<ProposalLinks key={route}/>;title='조직·법정업무·협회 상세제안'}
else if(path==='registry.html'){content=<Registry key={route}/>;title='자료 등록 원장'}
else if(path==='websites.html'){content=<Websites key={route}/>;title='처별 공식 홈페이지'}
else if(path==='architecture.html'){content=<ArchitectureHub key={route}/>;title='상세 아키텍처'}
else if(path==='katri.html'){content=<Katri key={route}/>;title='KATRI 문서 1차 검토 AX'}
else if(path==='ars.html'){content=<Ars key={route}/>;title='대국민 ARS 업무지도'}
else if(path==='updates.html'){content=new URLSearchParams(location.search).get('view')==='evidence47'?<Evidence47 key={route}/>:<Updates key={route}/>;title='추가 설계·공개 근거'}
else if(path==='discovery.html'){content=<Discovery key={route}/>;title='업무 전환 후보'}
else if(['solutions.html','inspection.html','17_조직별_AX_전환제안.html'].includes(path)){content=<DepartmentDirectory key={route+'-'+navigationEpoch}/>;title='처별 제안 찾기'}
else if(path==='legal/mapping.html'){content=<LawMapping key={path+location.search}/>;title='법령·업무·처·컨셉 매핑'}
else if(path==='legal/sources.html'){content=<Sources/>;title='법령 근거와 확인 범위'}
else if(path==='legal.html'||path.startsWith('legal/')){const g=path==='legal.html'?null:path.split('/')[1].replace('.html','');content=<Legal key={route} group={g}/>;title='법정·수탁업무 지도'}
else if(path.startsWith('처별/')){const d=depts.find(x=>path.startsWith(x.folder+'/'));if(d){const view=path.includes('/02_')?1:path.includes('/03_')?2:0;content=<Department key={route} d={d} view={view}/>;title=d.name+' · '+['서비스 컨셉','서비스 흐름','전체 아키텍처'][view]}}
if(isWorkbench)title='2027년 후속사업 기획 · 기본 탐색';
if(!content)content=<div className="page empty"><h1>페이지를 찾을 수 없음</h1><p>기관 소개 또는 서비스 목록에서 다시 탐색</p><Link to="index.html" className="button blue">홈으로</Link></div>;
useEffect(()=>{if(!isWorkbench)document.title=title+' | TS AX'},[title,isWorkbench]);
useEffect(()=>{const els=[document.querySelector('.ts-header'),document.querySelector('.ts-location'),document.querySelector('.doc-mobile-toggle')].filter(Boolean);const measure=()=>{const value=els.reduce((sum,el)=>sum+el.getBoundingClientRect().height,0);document.documentElement.style.setProperty('--ts-chrome-height',value+'px')};const observer=new ResizeObserver(measure);els.forEach(el=>observer.observe(el));measure();return()=>observer.disconnect()},[route]);
if(isWorkbench)return <PlanningWorkbench/>;
return <><a className="skip" href="#main">본문으로 바로가기</a>{isUnified?<IntegratedHeader route={route} navigationEpoch={navigationEpoch}/>:<Header route={route} navigationEpoch={navigationEpoch} compact={!isMap&&!isLanding&&!homeDocument}/>}{isMap&&<SiteQuickLinks/>}<div className={"document-shell"+((isUnified||isProblem)?" integrated-shell":isMap?" map-shell":isLanding?" landing-shell":"")}>{!isUnified&&!isProblem&&!isMap&&!isLanding&&<DocumentNav route={route}/>}<div className="document-body"><main id="main" tabIndex={-1}>{(isUnified||isProblem||isMap||isLanding||['solutions.html','inspection.html','17_조직별_AX_전환제안.html'].includes(path)||path==='skill-pms.html'||path==='research-library.html'||path==='planning-documents.html'||path==='drt-assurance.html'||path==='proposal-links.html'||path==='associations.html'||path==='websites.html'||path==='registry.html'||path==='legal/mapping.html'||(path==='updates.html'&&new URLSearchParams(location.search).get('view')==='evidence47'))?content:<DocumentReader key={route} route={isHome?'about.html'+location.search+location.hash:route}/>}</main>{selected.length>0&&<div className="compare-tray" aria-label="선택한 비교 서비스"><div><span className="compare-count">{selected.length}/3</span>{selected.map(c=><button key={c} className="compare-chip" onClick={()=>toggle(c)} aria-label={depts.find(d=>d.code===c).name+' 비교 해제'}>{depts.find(d=>d.code===c).name}<X size={14}/></button>)}</div><button className="button blue" onClick={()=>setCompare(true)}><GitCompareArrows size={18}/>서비스 비교</button></div>}{message&&<div className="toast" role="status">{message}</div>}<Comparison selected={selected} open={compare} onClose={()=>setCompare(false)} toggle={toggle}/><footer className={selected.length?'with-tray':''}><span>CCK × TS AX · 사업제안용 자료</span><span>기관의 공식 홈페이지와 구분 · 조사 기준일은 각 문서 참조</span><Link to="updates.html">추가 설계 정리</Link><Link to="legal/sources.html">근거·확인 범위</Link></footer></div></div></>}
createRoot(document.getElementById('root')).render(<App/>);
