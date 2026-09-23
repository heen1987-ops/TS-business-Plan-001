import React,{useEffect,useMemo,useRef,useState}from'react';
import{ArrowLeft,ArrowRight,Maximize2,Minimize2,List,FileText,Presentation,ExternalLink}from'lucide-react';
import{Link,href}from'./core.jsx';import model from'./slide-data.cjs';import'./slide-reader.css';
function modeFromUrl(){return new URLSearchParams(location.search).get('reading')==='full'}
function indexFromUrl(slides){const q=new URLSearchParams(location.search),store=q.get('store'),id=q.get('slide')||q.get('contract')||q.get('metric')||(store&&/^DS[1-6]$/.test(store)?'data-'+Math.floor((Number(store.slice(2))-1)/2):null)||decodeURIComponent(location.hash.slice(1));const fallback=q.get('contract')||q.get('metric')||(store&&/^DS[1-6]$/.test(store)?'data-'+Math.floor((Number(store.slice(2))-1)/2):null);const found=slides.findIndex(s=>s.id===id);return found>=0?found:Math.max(0,slides.findIndex(s=>s.id===fallback))}
function updateUrl(slide,full){const url=new URL(location.href);if(slide)url.searchParams.set('slide',slide);else url.searchParams.delete('slide');full?url.searchParams.set('reading','full'):url.searchParams.delete('reading');history.replaceState(history.state,'',url)}
function Reference({link}){return /^[a-z][a-z0-9+.-]*:/i.test(link.to)?<a href={link.to} target="_blank" rel="noopener noreferrer">{link.label}<ExternalLink size={13}/></a>:<Link to={link.to}>{link.label}<ExternalLink size={13}/></Link>}
export function SlideReader({route,children}){
 const deck=useMemo(()=>model.getDeck(route),[route]),[index,setIndex]=useState(()=>indexFromUrl(deck.slides)),[full,setFull]=useState(modeFromUrl),[focus,setFocus]=useState(false),[outline,setOutline]=useState(false),[imageOpen,setImageOpen]=useState(false),[imageError,setImageError]=useState(false),titleRef=useRef(),bodyRef=useRef(),[overflow,setOverflow]=useState(false),outlineRef=useRef(),outlineButton=useRef(),dialog=useRef(),imageButton=useRef();
 const active=deck.slides[index]||deck.slides[0],count=deck.slides.length;
 useEffect(()=>{document.body.classList.toggle('slide-reading',!full);document.body.classList.toggle('slide-focus',focus&&!full);return()=>{document.body.classList.remove('slide-reading','slide-focus')}},[full,focus]);
 useEffect(()=>{setImageError(false)},[active.id]);
 useEffect(()=>{const el=bodyRef.current;if(!el)return;const check=()=>setOverflow(el.scrollHeight>el.clientHeight+2);const observer=new ResizeObserver(check);observer.observe(el);for(const child of el.children)observer.observe(child);check();return()=>observer.disconnect()},[full,active.id]);
 useEffect(()=>{const el=dialog.current;if(!el)return;if(imageOpen&&!el.open)el.showModal();if(!imageOpen&&el.open)el.close()},[imageOpen]);
 function go(next,moveFocus=true){const n=Math.max(0,Math.min(count-1,next));setIndex(n);setOutline(false);updateUrl(deck.slides[n].id,false);if(moveFocus)requestAnimationFrame(()=>{titleRef.current?.focus({preventScroll:true});const reader=titleRef.current?.closest('.slide-reader');const header=document.querySelector('.header');if(reader)window.scrollTo({top:Math.max(0,scrollY+reader.getBoundingClientRect().top-(header?.getBoundingClientRect().height||0)),behavior:'instant'});reader?.querySelector('.slide-body')?.scrollTo({top:0})})}
 function reading(next){setFull(next);setOutline(false);updateUrl(active.id,next);requestAnimationFrame(()=>{if(next)document.getElementById('main')?.focus({preventScroll:true});else titleRef.current?.focus({preventScroll:true})})}
 useEffect(()=>{if(full)return;function keys(e){if(e.defaultPrevented||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||e.isComposing||document.querySelector('dialog[open]'))return;
 const target=e.target;if(target.closest('input,textarea,select,[contenteditable="true"],.document-nav,.slide-body,button,a,summary'))return;
 if(['ArrowRight','PageDown'].includes(e.key)){e.preventDefault();go(index+1)}else if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();go(index-1)}else if(e.key==='Home'){e.preventDefault();go(0)}else if(e.key==='End'){e.preventDefault();go(count-1)}
 }addEventListener('keydown',keys);return()=>removeEventListener('keydown',keys)},[index,count,full]);
 useEffect(()=>{if(outline){requestAnimationFrame(()=>outlineRef.current?.querySelector('[aria-current=page]')?.focus({preventScroll:true}))}},[outline]);
 function closeImage(){setImageOpen(false);imageButton.current?.focus()}
 return <section className={'slide-reader '+(full?'is-document':'')} aria-label={deck.title+' 읽기'}>
 <div className="reader-toolbar"><div className="reader-context"><span>TS AX 사업기획</span><strong>{deck.title}</strong></div><div className="reader-actions"><button onClick={()=>reading(!full)} aria-pressed={!full}>{full?<Presentation size={17}/>:<FileText size={17}/>}<span>{full?'슬라이드 보기':'전체 문서'}</span></button>{!full&&<button onClick={()=>setFocus(!focus)} aria-pressed={focus}>{focus?<Minimize2 size={17}/>:<Maximize2 size={17}/>}<span>{focus?'목차와 함께':'집중 보기'}</span></button>}</div></div>
 {full?<div className="reader-full-content">{children}</div>:<>
 <div className="slide-workspace">
 <article className={'briefing-slide '+(active.image?'has-diagram ':'')+(active.wideImage?'diagram-full ':'')+(active.layout||'')} aria-roledescription="슬라이드" aria-label={(index+1)+' / '+count+' · '+active.title}>
 <header className="slide-heading"><div className="slide-kicker"><span>{deck.title}</span><span>{String(index+1).padStart(2,'0')} / {String(count).padStart(2,'0')}</span></div><h1 ref={titleRef} tabIndex={-1}>{active.title}</h1><p className="slide-message">{active.message}</p></header>
 <div className="slide-body" ref={bodyRef} tabIndex={0} role="region" aria-label="슬라이드 세부 설명">
 {active.image&&<figure className="slide-figure">{imageError?<div className="slide-image-error"><p>도식을 불러오지 못했습니다.</p><a href={href(active.image)}>원본 경로 확인</a><button onClick={()=>setImageError(false)}>다시 불러오기</button></div>:<button ref={imageButton} onClick={()=>setImageOpen(true)} aria-label={active.alt+' 확대'}><img src={href(active.image)} alt={active.alt} onError={()=>setImageError(true)}/><span><Maximize2 size={14}/>도식 확대</span></button>}<figcaption>{active.alt}</figcaption></figure>}
 {active.cards.length>0&&<div className={'slide-cards count-'+active.cards.length}>{active.cards.map((card,i)=><section className="slide-card" key={i}><h2><span>{String(i+1).padStart(2,'0')}</span>{card.title.replace(/^0[1-4] · /,'')}</h2><ul>{card.bullets.map((text,j)=><li key={j}>{text}</li>)}</ul></section>)}</div>}
 </div>
 <p className="slide-reading-hint" hidden={!overflow}>세부 설명은 본문 영역에서 스크롤하여 확인 · 키보드 Tab으로 본문 선택 후 ↑ ↓</p><footer className="slide-footnote"><p>{active.status||'기존 사업기획 자료의 구조화 · 적용 조건·확인 범위는 원문 참조'}</p>{active.links?.length>0&&<nav aria-label="슬라이드 근거·상세자료">{active.links.map((l,i)=><Reference key={i} link={l}/>)}</nav>}</footer>
 </article>
 </div>
 <div className="reader-pagination"><button className="page-step" onClick={()=>go(index-1)} disabled={index===0} aria-label="이전 슬라이드"><ArrowLeft size={18}/><span>이전</span></button><div className="reader-outline-wrap"><button ref={outlineButton} className="page-position" aria-expanded={outline} aria-controls="slide-outline" onClick={()=>setOutline(!outline)}><List size={17}/><strong>{index+1} / {count}</strong><span>페이지 목차</span></button>{outline&&<nav id="slide-outline" ref={outlineRef} aria-label="슬라이드 페이지 목차" className="reader-outline" onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();setOutline(false);outlineButton.current?.focus()}}}>{deck.slides.map((s,i)=><button key={s.id} aria-current={index===i?'page':undefined} onClick={()=>go(i)}><span>{String(i+1).padStart(2,'0')}</span>{s.title}</button>)}</nav>}</div><span className="reader-next-title">{index<count-1?'다음 · '+deck.slides[index+1].title:'마지막 페이지'}</span><button className="page-step" onClick={()=>go(index+1)} disabled={index===count-1} aria-label="다음 슬라이드"><span>다음</span><ArrowRight size={18}/></button></div>
 <p className="reader-shortcuts">← → 키로 이동 · 페이지 목차로 바로가기 · 전체 문서에서 기존 상세 기능 확인</p>
 <div className="sr-only" aria-live="polite">{index+1} / {count} · {active.title}</div>
 <dialog ref={dialog} className="slide-image-dialog" aria-label="도식 확대 보기" onCancel={e=>{e.preventDefault();closeImage()}} onClick={e=>{if(e.target===dialog.current)closeImage()}}><div className="slide-dialog-head"><strong>{active.alt}</strong><button onClick={closeImage}>닫기 · Esc</button></div>{active.image&&<img src={href(active.image)} alt={active.alt}/>}<a href={active.image?href(active.image):'#'} target="_blank" rel="noopener noreferrer">원본 도식 열기</a></dialog>
 </>}
 </section>
}

