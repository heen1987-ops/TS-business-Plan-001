import React,{useEffect,useRef,useState} from 'react';
import {ExternalLink,Maximize2} from 'lucide-react';
import {href} from './core.jsx';

export default function SourceFigure({figure}){
 const [failed,setFailed]=useState(false),original=useRef(),retry=useRef(),restoreFocus=useRef(false);
 useEffect(()=>{if(restoreFocus.current){(failed?retry:original).current?.focus();restoreFocus.current=false}},[failed]);
 return <figure className="source-document" data-source-figure={figure.id} aria-labelledby={'source-title-'+figure.id}>
  <figcaption className="source-document-heading">
   <span className="source-document-kicker">{figure.acquisition}</span>
   <h3 id={'source-title-'+figure.id}>{figure.title}</h3>
   <p className="source-document-version">{figure.versionLabel}</p>
   <p>{figure.caption}</p>
  </figcaption>
  <div className="source-document-visual">
   {failed?<div className="source-document-error" role="status"><p>원문 도표를 불러오지 못했습니다.</p><a href={figure.sourceUrl} target="_blank" rel="noopener noreferrer">공식 원문에서 확인 <ExternalLink size={14}/></a><button ref={retry} type="button" onClick={()=>{restoreFocus.current=true;setFailed(false)}}>도표 다시 불러오기</button></div>:<a ref={original} className="source-document-original" href={href(figure.src)} target="_blank" rel="noopener noreferrer" aria-describedby={figure.textDescription?'source-description-'+figure.id:undefined}>
    <img src={href(figure.src)} alt={figure.alt} width={figure.width} height={figure.height} loading="lazy" decoding="async" onError={()=>{restoreFocus.current=document.activeElement===original.current;setFailed(true)}}/>
    <span><Maximize2 size={15}/>도표 크게 보기<span className="sr-only"> (새 창)</span></span>
   </a>}
  </div>
  <div className="source-document-reading"><strong>이 도표에서 읽어야 할 내용</strong><ul>{figure.readingPoints.map((p,i)=><li key={i}>{p}</li>)}</ul></div>
  {figure.textDescription&&<div className="source-document-transcript" id={'source-description-'+figure.id}>
   <h4>{figure.textDescription.title}</h4><p>{figure.textDescription.intro}</p>
   <div className="source-document-taskgroups">{figure.textDescription.groups.map(g=><section key={g.title}><h5>{g.title}</h5><ul>{g.tasks.map(t=><li key={t}>{t}</li>)}</ul><p><strong>성과지표</strong> · {g.metrics}</p></section>)}</div>
   <ul className="source-document-notes">{figure.textDescription.notes.map(n=><li key={n}>{n}</li>)}</ul>
  </div>}
  <div className="source-document-credit">
   <span>출처: {figure.creator} · 확인일 <time dateTime={figure.checked}>{figure.checked}</time></span>
   <a href={figure.sourceUrl} target="_blank" rel="noopener noreferrer">{figure.sourceTitle}<ExternalLink size={13}/><span className="sr-only"> (새 창)</span></a>
   <a href={figure.licenseUrl} target="_blank" rel="noopener noreferrer">{figure.license}<ExternalLink size={13}/><span className="sr-only"> (새 창)</span></a>
  </div>
 </figure>
}
