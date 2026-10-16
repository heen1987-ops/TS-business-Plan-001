import React,{useEffect,useRef,useState} from 'react';
import {href,Link} from './core.jsx';
export function CaseArchitecture({design:d}){
 const a=d.service,[view,setView]=useState(a.figures.length?'source':'structure'),[figure,setFigure]=useState(0),[expanded,setExpanded]=useState(false),[zoom,setZoom]=useState(null),dialog=useRef(null);
 const f=a.figures[figure],source=d.sources.find(s=>s.url);
 useEffect(()=>{const el=dialog.current;if(!el)return;if(zoom&&!el.open)el.showModal();else if(!zoom&&el.open)el.close();},[zoom]);
 return <section className="case-architecture-detail">
  <h3>서비스 아키텍처·데이터 흐름</h3>
  <div className="ax-tabs" aria-label="아키텍처 보기">{[...(a.figures.length?[['source','원문 자료 '+a.figures.length+'개']]:[]),['structure','세부 서비스 구조'],['flow','데이터·예외 흐름']].map(([key,label])=><button key={key} aria-pressed={view===key} onClick={()=>{setView(key);setExpanded(false);}}>{label}</button>)}</div>
  {view==='source'?<figure className="case-source-figure">
   {a.figures.length>1&&<label>원문 도면 선택<select value={figure} onChange={e=>setFigure(Number(e.target.value))}>{a.figures.map((f,i)=><option key={f.path} value={i}>{f.title}</option>)}</select></label>}
   <figcaption><strong>{f.title}</strong><small>{f.status} · {f.sourceType==='mermaid'?'공식 Mermaid 렌더':f.sourceUrl?'공식 웹 원본':'RFP 원문 추출'}</small></figcaption>
   <button type="button" className="case-figure-expand" onClick={()=>setZoom({src:href(f.path),title:f.title})} aria-label={f.title+' 현재 화면에서 확대'}><img src={href(f.path)} alt={f.title+' — '+f.caption}/></button>
   <div className="case-figure-reading"><h4>도면 해설</h4><p>{f.explanation.read}</p><h4>요구사항·업무 연결</h4><p>{f.explanation.connection}</p>{f.explanation.requirements.length>0&&<small>연결 요구: {f.explanation.requirements.join(' · ')}</small>}</div><div className="on-actions"><button type="button" onClick={()=>setZoom({src:href(f.path),title:f.title})}>현재 화면에서 확대</button><a href={href(f.path)} download>{f.sourceType==='mermaid'?'원문 렌더 이미지 ↓':'원문 이미지 ↓'}</a>{f.sourceType==='mermaid'&&<a href={href(f.path.replace('.png','.svg'))} download>SVG ↓</a>}{f.sourceUrl?<a href={f.sourceUrl} target="_blank" rel="noreferrer">공식 원문 ↗</a>:source&&<a href={source.url} target="_blank" rel="noreferrer">RFP 원문 ↗</a>}</div>
  </figure>:view==='structure'?<>
   <div className="case-diagram-caption"><strong>{a.reconstruction?.title||a.diagram.label+' · '+a.status}</strong><Link to={a.reconstruction?.path||'assets/casebook-designs/'+d.id+'.svg'} download>{a.reconstruction?'재구성 이미지 ↓':'도면 SVG ↓'}</Link></div>
   <p className="case-diagram-summary">{a.diagram.summary}</p>
   {a.reconstruction&&<small className="case-reconstruction-basis">{a.reconstruction.status} · {a.reconstruction.basis}</small>}
   <button type="button" className="case-figure-expand" onClick={()=>setZoom({src:href(a.reconstruction?.path||'assets/casebook-designs/'+d.id+'.svg'),title:a.reconstruction?.title||'세부 서비스 구조'})} aria-label="세부 서비스 구조 현재 화면에서 확대"><img className="case-service-image" src={href(a.reconstruction?.path||'assets/casebook-designs/'+d.id+'.svg')} alt={a.reconstruction?.title||d.purpose+' — '+a.diagram.summary}/></button>
   {a.reconstruction&&<Link to={'assets/casebook-designs/'+d.id+'.svg'} download>구성요소 논리도 SVG ↓</Link>}
   <button className="ax-text-button" aria-expanded={expanded} onClick={()=>setExpanded(!expanded)}>구성요소별 처리 명세 {expanded?'접기':'12개 펼치기'}</button>
   {expanded&&<ol className="case-component-spec">{a.components.map(n=><li key={n.id}><strong>{n.id} · {n.title}</strong><p>{n.detail}</p>{n.requirements.length>0&&<small>RFP 연결 · {n.requirements.join(' · ')}</small>}</li>)}</ol>}
   <dl className="case-acceptance case-provenance"><dt>원문 추출</dt><dd>{a.facts.extracted}<small>{a.facts.locator}</small></dd><dt>CCK 보완 설계</dt><dd>{a.facts.extension}</dd></dl>
  </>:<>
   <small>논리 인터페이스·데이터 계약 제안</small>
   <ol className="case-interface-flow">{a.interfaces.map(f=><li key={f.id}><strong>{f.id} · {f.mode}</strong><small>{a.components.find(n=>n.id===f.from).title} → {a.components.find(n=>n.id===f.to).title}</small><dl><dt>전달 데이터</dt><dd>{f.payload}</dd><dt>통제·검증</dt><dd>{f.check}</dd></dl></li>)}</ol>
   <div className="case-exception-flow"><h4>예외·복구 경로</h4><ol>{[['감지',a.exception.input],['보류·확인',a.exception.hold],['보정·재검증',a.exception.recovery],['종료 증빙',a.exception.evidence]].map(([title,text])=><li key={title}><strong>{title}</strong><p>{text}</p></li>)}</ol></div>
   <details><summary>데이터 준비·갱신</summary><dl className="case-acceptance"><dt>원천</dt><dd>{a.data.source}</dd><dt>정제·연결</dt><dd>{a.data.prepare}</dd><dt>운영 환류</dt><dd>{a.data.refresh}</dd></dl></details>
  </>}
  <small className="case-design-note">{a.boundary}</small>
  {a.source&&<a className="case-technical-source" href={a.source.url} target="_blank" rel="noreferrer">{a.source.title} ↗</a>}
  <dialog ref={dialog} className="case-zoom-dialog" aria-label="도면 확대" onCancel={()=>setZoom(null)} onClick={e=>{if(e.target===dialog.current)setZoom(null);}}><div className="case-zoom-head"><strong>{zoom?.title}</strong><button type="button" onClick={()=>setZoom(null)} aria-label="확대 보기 닫기">닫기</button></div>{zoom&&<img src={zoom.src} alt={zoom.title+' 확대 도면'}/>}</dialog>
 </section>;
}
