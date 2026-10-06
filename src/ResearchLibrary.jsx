import {AnalysisReview} from './AnalysisReview.jsx';
import {SurveyDesign} from './SurveyDesign.jsx';
import React,{useEffect}from'react';
import{Heading,Link,Out}from'./core.jsx';
import{NewsResearch}from'./Associations.jsx';
import research from'./association-research.json';
import library from'./research-library.cjs';
import './research-library.css';

export function ResearchLibrary(){
 useEffect(()=>{let frame;function reveal(){cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{if(!location.hash)return;let id=location.hash.slice(1);try{id=decodeURIComponent(id)}catch{/* 잘못된 공유 해시는 원문 ID로 확인 */}const target=document.getElementById(id);if(!target)return;for(let el=target.parentElement;el;el=el.parentElement)if(el.tagName==='DETAILS')el.open=true;frame=requestAnimationFrame(()=>{target.setAttribute('tabindex','-1');target.scrollIntoView({block:'start'});target.focus({preventScroll:true})})})}reveal();addEventListener('hashchange',reveal);addEventListener('popstate',reveal);return()=>{cancelAnimationFrame(frame);removeEventListener('hashchange',reveal);removeEventListener('popstate',reveal)}},[]);
 if(new URLSearchParams(location.search).get('view')==='survey')return <SurveyDesign standalone/>;
 if(new URLSearchParams(location.search).get('view')==='planning')return <AnalysisReview/>;
 return <div className="page association-page research-library-page">
  <Heading label="자료실" title={library.title} desc={library.lead}/>
  <nav className="research-categories" aria-label="조사자료 분류">{library.categories.map(c=><a href={'#'+c.id} key={c.id}><h2>{c.title}</h2><span>{c.count!==null?c.count.toLocaleString()+' ':''}{c.unit}</span><p>{c.description}</p></a>)}</nav>
  <div className="research-scope"><p>{library.scope}</p><ul>{library.notices.map(n=><li key={n}>{n}</li>)}</ul><p className="assoc-muted">{library.dateLabel} · {research.checked_at} / 뉴스 {research.news_research.date}</p></div>
  <section id="official-research" tabIndex={-1}><h2>{library.headings.official}</h2><div className="research-source-links">{library.officialLinks.map(s=><div key={s.to}><Link to={s.to}>{s.title}</Link><p>{s.detail}</p></div>)}</div></section>
  <section id="complaint-research" tabIndex={-1}><h2>{library.headings.complaints}</h2><p>{library.complaintsLead}</p><p className="assoc-links"><Link to="associations.html#evidence">{library.complaintsLink}</Link><Link to="associations.html#associations">{library.associationsLink} · {research.items.length.toLocaleString()}개 기록</Link></p><div className="assoc-table" tabIndex={0} role="region" aria-label={library.headings.complaints}><table><caption>{library.headings.complaints}</caption><thead><tr>{library.issueHeaders.map(h=><th scope="col" key={h}>{h}</th>)}</tr></thead><tbody>{research.issues.map(i=><tr key={i.id}><td><Link to={'associations.html#issue-'+i.id}>{i.id+' · '+i.title}</Link><br/><small>{i.type}</small></td><td>{i.date||'게시일 미표시'}<br/>{i.evidence_level}</td><td><Out url={i.source_url}>{i.source_title}</Out></td></tr>)}</tbody></table></div></section>
  <section id="planning-files" tabIndex={-1}><h2>{library.headings.files}</h2><p>{library.filesLead}</p><Link className="research-primary-link" to="planning-documents.html">{library.documentsLink}</Link></section>
  <NewsResearch proposalBase="associations.html" title={library.headings.news}/>
  <section className="research-archive"><h2>{library.archiveLabel}</h2><p className="assoc-links"><Link to="associations.html#news-research">{library.newsArchiveLink}</Link>{library.downloads.map(d=><Link to={d.to} key={d.to} download>{d.title}</Link>)}</p></section>
 </div>
}
