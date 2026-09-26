import React,{useEffect,useRef,useState} from 'react';
import {ExternalLink,Maximize2} from 'lucide-react';
import {href} from './core.jsx';

export default function SourcePhoto({photo}){
 const [failed,setFailed]=useState(false),original=useRef(),retry=useRef(),restoreFocus=useRef(false);
 useEffect(()=>{if(restoreFocus.current){(failed?retry:original).current?.focus();restoreFocus.current=false}},[failed]);
 return <figure className={'source-photo'+(photo.width<500?' source-photo-compact':'')} data-source-photo={photo.id} aria-labelledby={'photo-title-'+photo.id}>
  <div className="source-photo-visual">
   {failed?<div className="source-photo-error" role="status"><p>사진을 불러오지 못했습니다.</p><a href={photo.articleUrl} target="_blank" rel="noopener noreferrer">출처 기사에서 확인 <ExternalLink size={14}/></a><button ref={retry} type="button" onClick={()=>{restoreFocus.current=true;setFailed(false)}}>사진 다시 불러오기</button></div>:<a ref={original} className="source-photo-original" href={href(photo.src)} target="_blank" rel="noopener noreferrer" aria-label={photo.title+' — 원본 사진 보기 (새 창)'}>
    <img src={href(photo.src)} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" decoding="async" onError={()=>{restoreFocus.current=document.activeElement===original.current;setFailed(true)}}/>
    <span><Maximize2 size={14}/>원본 사진 보기</span>
   </a>}
  </div>
  <figcaption>
   <span className="source-photo-kicker">현장에서 보는 TS의 역할</span>
   <h3 id={'photo-title-'+photo.id}>{photo.title}</h3>
   <p className="source-photo-caption">{photo.caption}</p>
   <p className="source-photo-context">{photo.explanation}</p>
   <div className="source-photo-credit">
    <span>사진 출처: {photo.creator} · <time dateTime={photo.published}>{photo.published}</time></span>
    <a href={photo.articleUrl} target="_blank" rel="noopener noreferrer">{photo.articleTitle}<ExternalLink size={13}/><span className="sr-only"> (새 창)</span></a>
    <a href={photo.licenseUrl} target="_blank" rel="noopener noreferrer">{photo.license}<ExternalLink size={13}/><span className="sr-only"> (새 창)</span></a>
   </div>
  </figcaption>
 </figure>
}
