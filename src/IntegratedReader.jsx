import React,{useEffect,useRef,useState} from 'react';
import {Menu,Search,ArrowUp} from 'lucide-react';
import {ReadingLinkContext,navigate,legal,href} from './core.jsx';
import reading from './integrated-reading.cjs';
import hub from './planning-hub.cjs';
import survey from './survey-design.cjs';
import supplement from './proposal-links.cjs';
import {DocumentReader} from './DocumentReader.jsx';
import {Proposal47} from './Revision47.jsx';
import {Profile} from './ProposalLinks.jsx';
import {DrtAssurance} from './DrtAssurance.jsx';
import {IspReview} from './IspReview.jsx';
import {CostReview} from './CostReview.jsx';
import {SkillPms} from './SkillPms.jsx';
import {SurveyOpinion} from './SurveyDesign.jsx';
import {DepartmentDocuments} from './DepartmentDocuments.jsx';
import {IntentDefinitions,ProposalIntent} from './ProposalIntent.jsx';
import {ProposalDiagramSuite} from './ProposalDiagramSuite.jsx';
import {DepartmentBriefing,SelectedPlatformBrief} from './DepartmentBriefing.jsx';
import {MandateWorkContext} from './MandateWorkContext.jsx';
import {SiteHeader} from './SiteNavigation.jsx';
import readerUI from './reader-ui.cjs';
import departmentDisplay from './department-reader.cjs';
import workResearch from './department-work-research.cjs';
import './integrated-reading.css';
import './department-reader.css';
const l=reading.labels;
export function IntegratedHeader({route,navigationEpoch}){return <SiteHeader compact route={route} navigationEpoch={navigationEpoch}/>;}
function Chapter({section,children,collapsed=false}){return <section className={'integrated-chapter'+(collapsed?' integrated-chapter-secondary':'')} id={section.id} tabIndex={-1} data-integrated-section={section.id}>{collapsed?<details className="department-common-chapter"><summary>{section.title}</summary><div className="department-common-body">{children}</div></details>:<><header><div><h2>{section.title}</h2></div></header>{children}</>}</section>}
export function IntegratedReader({route}){
 const current=reading.selection(new URL(route,'https://reader/').search),{department:r,project:p}=current,department=survey.departments.find(d=>d.id===r.surveyId),topic=department?.topics.find(t=>t.id===current.topicId)||department?.topics.find(t=>t.id===p?.id)||department?.topics[0],project=hub.projects.find(x=>x.id===p?.id),profile=p?supplement.profileById[new URL(p.to,'https://reader/').searchParams.get('unit')]:null;
 const[pendingProject,setPendingProject]=useState(p?.id||''),[pending,setPending]=useState(r.key),[q,setQ]=useState(''),[menu,setMenu]=useState(false),[active,setActive]=useState('integrated-department'),button=useRef(),root=useRef();
 const words=q.trim().toLowerCase().split(/\s+/).filter(Boolean),rows=reading.rows.filter(row=>words.every(w=>[row.key,row.name,row.parent,...row.projects.map(p=>p.title),...(workResearch.byKey[row.key]?.jobs.map(j=>j[0])||[])].join(' ').toLowerCase().includes(w))),parents=[...new Set(rows.map(row=>row.parent))],pendingRow=reading.rows.find(x=>x.key===pending),resolve=to=>reading.resolve(to,current);
 useEffect(()=>{setPending(r.key);setPendingProject(p?.id||'')},[r.key,p?.id]);
 useEffect(()=>{const frame=requestAnimationFrame(()=>{const link=root.current?.querySelector('[data-department-link="'+r.key+'"]'),tree=root.current?.querySelector('.department-tree');if(link&&tree){const box=tree.getBoundingClientRect(),target=link.getBoundingClientRect();if(target.top<box.top||target.bottom>box.bottom)tree.scrollTop+=target.top-box.top-44;}});return()=>cancelAnimationFrame(frame)},[r.key,q]);
 function choose(key,projectId){const next=reading.rows.find(row=>row.key===key);if(!next)return;const params=new URLSearchParams({dept:next.key});if(projectId)params.set('project',projectId);setMenu(false);navigate('index.html?'+params+'#integrated-work-context');}
 useEffect(()=>{let frame,second;function reveal(){cancelAnimationFrame(frame);cancelAnimationFrame(second);frame=requestAnimationFrame(()=>{second=requestAnimationFrame(()=>{let id;try{id=decodeURIComponent(location.hash.slice(1))}catch{return}if(!id)return;const target=document.getElementById(id)||document.getElementById(departmentDisplay.aliasFor(id,topic));if(!target)return;for(let el=target;el;el=el.parentElement){if(el.tagName==='DETAILS')el.open=true;const child=el.querySelector?.(':scope > details.department-common-chapter');if(child)child.open=true;}target.setAttribute('tabindex','-1');target.scrollIntoView({block:'start'});target.focus({preventScroll:true});setMenu(false)})})}reveal();addEventListener('hashchange',reveal);return()=>{cancelAnimationFrame(frame);cancelAnimationFrame(second);removeEventListener('hashchange',reveal)}},[route]);
 useEffect(()=>{let frame;function scroll(){cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const top=(document.querySelector('.ts-header')?.getBoundingClientRect().height||70)+24,sections=reading.sections.map(s=>({id:s.id,top:document.getElementById(s.id)?.getBoundingClientRect().top})).filter(s=>s.top!==undefined).sort((a,b)=>a.top-b.top),before=sections.filter(s=>s.top<=top);setActive(before.at(-1)?.id||'integrated-department')})}addEventListener('scroll',scroll,{passive:true});scroll();return()=>{cancelAnimationFrame(frame);removeEventListener('scroll',scroll)}},[r.key,p?.id]);
 function jump(e,id){if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();const u=new URL(location.href);u.hash=id;history.pushState({},'',u);dispatchEvent(new PopStateEvent('popstate'));setMenu(false);}
 const detailsId=topic?'department-detail-'+topic.id:null,researched=workResearch.byKey[r.key];
 return <ReadingLinkContext.Provider value={resolve}><article className="integrated-reader department-reader" ref={root} data-integrated-reader={reading.date}>
 <aside className="integrated-sidebar" onKeyDown={e=>{if(e.key==='Escape'){setMenu(false);button.current?.focus()}}}>
  <button ref={button} className="integrated-menu-toggle" aria-expanded={menu} aria-controls="integrated-outline" onClick={()=>setMenu(!menu)}><Menu size={18}/>처별 탐색 · {r.name}</button>
  <nav id="integrated-outline" className={menu?'open':''} aria-label="처별 탐색과 본문 목차">
   <section className="department-explorer" aria-labelledby="department-explorer-title"><h2 id="department-explorer-title">처별 탐색 <small>51개 조직</small></h2>
    <label className="department-search-label" htmlFor="integrated-department-search"><Search size={15}/>처·업무 검색</label><input id="integrated-department-search" type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="처 이름·업무·조직 검색"/>
    <p className="department-tree-status" role="status">{rows.length}개 조직{q?' · 검색 결과':''}</p>
    {!rows.length&&<div className="department-tree-empty"><p>검색 결과 없음</p><button type="button" onClick={()=>setQ('')}>검색 초기화</button></div>}
    {q&&!rows.some(x=>x.key===r.key)&&<p className="department-search-current">현재 {r.name}은 검색 결과 밖의 선택 조직</p>}
    {q&&rows.length>0&&<button className="department-search-reset" type="button" onClick={()=>setQ('')}>검색 초기화</button>}
    <div className="department-tree">{parents.map(parent=><details key={parent} open={!!q||parent===r.parent}><summary>{parent}</summary><ul>{rows.filter(row=>row.parent===parent).map(row=><li key={row.key}><a href={href('index.html?dept='+row.key+'#integrated-work-context')} data-department-link={row.key} aria-current={r.key===row.key?'page':undefined} onClick={e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();choose(row.key)}}><span>{row.name}</span><small>{row.projects.length?row.projects.length+'과제':(workResearch.byKey[row.key]?'업무·근거':'업무 확인')}</small></a></li>)}</ul></details>)}</div>
   </section>
   {r.projects.length>1&&<section className="department-current-projects"><h2>이 처의 검토 과제</h2>{r.projects.map(x=><a key={x.id} href={href('index.html?dept='+r.key+'&project='+x.id+'#integrated-work-context')} aria-current={p?.id===x.id?'page':undefined} onClick={e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();choose(r.key,x.id)}}>{department?.topics.find(t=>t.id===x.id)?.reading.title||x.title}</a>)}</section>}
   <strong className="department-outline-label">선택 처의 상세 본문</strong>
   <div className="department-local-outline">{detailsId&&[['scope','업무 범위·대상'],['basis','현행·문제·근거'],['how','기술 HOW·단계별 처리'],['completion','완료·책임·개인정보'],['metrics','기대효과·측정방법'],['conditions','환경·추가 작업'],['questions','현업 확인 질문']].map(([key,title])=><a href={'#'+detailsId+'-'+key} key={key} onClick={e=>jump(e,detailsId+'-'+key)}>{title}</a>)}{p&&<a href={'#diagram-'+p.id+'-overall'} onClick={e=>jump(e,'diagram-'+p.id+'-overall')}>아키텍처·흐름도 4종</a>}<a href="#integrated-documents" onClick={e=>jump(e,'integrated-documents')}>관련 한글 문서</a></div>
   <strong className="department-outline-label">공통 설명·의견</strong>{reading.sections.map(s=><a key={s.id} href={'#'+s.id} aria-current={active===s.id?'location':undefined} onClick={e=>jump(e,s.id)}>{s.title}</a>)}
   <a className="integrated-top" href="#integrated-start" onClick={e=>jump(e,'integrated-start')}><ArrowUp size={14}/>선택 처 처음으로</a>
  </nav>
 </aside>
 <div className="integrated-content">
  <header className="integrated-intro" id="integrated-start" tabIndex={-1}><small>{r.parent} · 2027년 후속사업 검토</small><h1>{r.name} · 업무와 AX 전환</h1><p>{p?.title||(researched?researched.mission:'실제 업무·기존 대응·추가 개선 필요성 확인계획')}</p><p className="department-brief-status">{p?'조사·설계 후보 · 사업 선정·발주·효과 미확정':(researched?workResearch.common.status:'업무 확인 단계 · 개별 사업계획 미작성')}</p></header>
  <details className="department-selector-advanced"><summary>처·과제 직접 선택</summary><form className="integrated-selector reader-selection" aria-label="처·과제 선택" onSubmit={e=>{e.preventDefault();choose(pending,pendingProject)}}><div><label htmlFor="integrated-department-select">처 선택</label><select id="integrated-department-select" value={pending} onChange={e=>{setPending(e.target.value);setPendingProject(reading.rows.find(x=>x.key===e.target.value)?.projects[0]?.id||'')}}>{!rows.some(x=>x.key===pending)&&<option value={pending}>{reading.rows.find(x=>x.key===pending)?.name} · 현재 선택</option>}{parents.map(parent=><optgroup key={parent} label={parent}>{rows.filter(x=>x.parent===parent).map(x=><option key={x.key} value={x.key}>{x.name}{x.code?'':(workResearch.byKey[x.key]?' · 업무·근거':' · 업무 확인')}</option>)}</optgroup>)}</select></div><div><label htmlFor="integrated-project-select">검토 과제</label><select id="integrated-project-select" value={pendingProject} onChange={e=>setPendingProject(e.target.value)} disabled={!pendingRow?.projects.length}>{pendingRow?.projects.length?pendingRow.projects.map(x=><option key={x.id} value={x.id}>{x.title}</option>):<option value="">{workResearch.byKey[pendingRow?.key]?'공식 업무 조사':'업무 확인계획'}</option>}</select></div><button className="reader-apply" type="submit">{readerUI.labels.apply}</button><p role="status">{rows.length}개 조사 대상 조직 · 현재 {r.name}{pending!==r.key||pendingProject!==(p?.id||'')?' / '+readerUI.labels.pending:''}</p></form></details>
  {(current.invalid||current.invalidProject)&&<p className="integrated-warning" role="status">{current.invalid?l.unknown:'이 처에 해당하지 않는 과제입니다. 해당 처의 첫 과제 표시.'}</p>}
  <Chapter section={reading.sections[2]}><header className="integrated-department-heading"><small>조직 계통: {r.parent} · 실제 분장·전결 확인 필요</small><h3 className="department-screen-only">{r.name}</h3></header>
   {r.projects.length>1&&<nav className="integrated-project-picker" aria-label="이 처의 검토 과제">{r.projects.map(x=><button key={x.id} aria-pressed={p?.id===x.id} onClick={()=>choose(r.key,x.id)}>{department?.topics.find(t=>t.id===x.id)?.reading.title||x.title}</button>)}</nav>}
   <div className="integrated-proposal" id="integrated-work-context" tabIndex={-1} key={p?.id||r.key} data-integrated-project={p?.id||r.key}>
    {p?<ProposalIntent projectId={p.id} diagrams={false} compact/>:<section className="department-discovery-purpose"><h3>{r.name} · {researched?'실제 업무와 추가 검증':'우선 확인할 사항'}</h3><ul><li>{researched?researched.mission:(department?.reading.goal||r.goal)}</li><li>{researched?'공식 업무·기존 기능 확인 → 내부 처리·문제 확인 → CCK 추가 기여·편성 검증':'업무 범위·현재 대응·남은 문제의 실제 근거 확보 후 적용방향 결정'}</li></ul><p className="integrated-warning">개별 사업계획 미작성 · 현재 병목·효과·구매수요 미확정</p></section>}
    <DepartmentBriefing department={r} topic={topic}/>
    {p&&<section className="department-diagrams"><h3>전체 아키텍처 · 서비스 · 데이터 · 요구환경</h3><ProposalDiagramSuite projectId={p.id}/></section>}
    {p&&<details className="department-reference-detail"><summary>법령·현재 공식 업무·국내외 사례 상세 근거</summary><MandateWorkContext projectId={p.id} contextId={'department-work-evidence-'+p.id}/></details>}
    {p&&<details className="department-reference-detail"><summary>이 과제의 상세 설계 · 요구사항 · 검증 · RFP</summary>{p.id==='MR-02'?<DrtAssurance route={p.to} embedded showIntent={false}/>:profile?<Profile p={profile} embedded showIntent={false}/>:<Proposal47 code={r.code} embedded showIntent={false}/>}</details>}
   </div>
   {project&&<details className="department-reference-detail" id="integrated-feasibility" tabIndex={-1}><summary>착수·구현·편성 조건</summary><dl className="integrated-fields">{[['현재 상태',project.classificationLabel+' · '+project.classificationDate+' / '+project.status],['초기 범위',project.scope],['필요한 입력',project.inputs],['공식 판단 경계',project.decisionBoundary],['착수 조건',project.entry],['완료·인수 기준',project.acceptance],['제외·보류 조건',project.boundary],['산정 상태','기준선·수치 목표·최종 수행가격 미확정. 원기록·필드·연계·검증 범위 확보 후 산정']].map(([k,v])=><div key={k}><dt>{k}</dt><dd>{Array.isArray(v)?<ul>{v.map((x,i)=><li key={i}>{x}</li>)}</ul>:v}</dd></div>)}</dl></details>}
   <section id="integrated-documents" tabIndex={-1}><h3>{r.name} · 관련 한글 문서</h3>{r.code?<DepartmentDocuments code={r.code}/>:<p>현재 개별 한글 계획서 없음. 앞의 업무 확인계획·필요 증빙·현업 질문을 우선 활용</p>}</section>
  </Chapter>
  <Chapter section={reading.sections[5]} collapsed><SurveyOpinion key={r.key+'-'+p?.id} departmentId={r.surveyId} projectId={current.topicId} onTopic={id=>{const params=new URLSearchParams({dept:r.key});if(p)params.set('project',p.id);params.set('topic',id);navigate('index.html?'+params+'#survey-topic-'+id+'-opinion')}}/></Chapter>
  <Chapter section={reading.sections[3]} collapsed><SelectedPlatformBrief topic={topic}/><details className="department-reference-detail"><summary>전체 처의 공통플랫폼·스킬 적용안</summary><SkillPms embedded/></details></Chapter>
  <Chapter section={reading.sections[4]} collapsed><p>선택 처의 실제 업무·자료·필드·연계·인수조건 확인 → 현행·규칙/SI·AI 추가 기여 비교 → 처별 증분 WBS·FP/MM 산정 → 보안·윤리·운영 검토</p><details className="department-reference-detail"><summary>전체 ISP·편성 검토</summary><IspReview embedded/></details><details className="department-reference-detail"><summary>전체 대가산정·RFP 검토</summary><CostReview/></details></Chapter>
  <Chapter section={reading.sections[1]} collapsed><IntentDefinitions/><section className="integrated-project-intro"><h3>현재 적용과 추가 제안의 경계</h3>{survey.intro.map(b=><section key={b.id}><h4>{b.title}</h4><ul><li>{b.text}</li><li>{b.status} {b.note}</li></ul></section>)}</section></Chapter>
  <Chapter section={reading.sections[0]} collapsed><DocumentReader route="about.html" embedded/></Chapter>
  <section className="integrated-references"><h2>출처·전체 자료</h2><ul>{legal.sources.filter(s=>s.id==='foundation').map(s=><li key={s.id}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a> · {s.effective}</li>)}</ul><details><summary>전체 자료실·보존 문서</summary><a href={href('research-library.html')}>조사자료실</a><a href={href('planning-documents.html')}>전체 처별 한글 자료</a><a href={href('index.html?view=map')}>조직 연결지도</a></details></section>
 </div></article></ReadingLinkContext.Provider>;
}
