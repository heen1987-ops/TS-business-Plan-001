import React,{useState,useRef} from 'react';
import {PageFrame} from './PageFrame.jsx';
import {Link} from './core.jsx';
import d from './strategy-followup.cjs';
import storage from './strategy-prompt-storage.cjs';
import './case-insight.css';
function browserStore(){try{return window.localStorage;}catch{return {getItem(){throw new Error('unavailable');},setItem(){throw new Error('unavailable');}};}}
export function StrategyPromptBoard(){
 const requested=new URLSearchParams(location.search).get('strategy');
 const [id,setId]=useState(d.byId[requested]?requested:'ST-04'),[query,setQuery]=useState('');
 const [drafts,setDrafts]=useState(()=>Object.fromEntries(d.plans.map(p=>[p.id,storage.read(browserStore(),p.id,d.prompt(p.id))])));
 const [notice,setNotice]=useState(''),[undo,setUndo]=useState(null),textarea=useRef(null);
 const p=d.byId[id],draft=drafts[id];
 const filtered=d.plans.filter(p=>(p.id+' '+p.strategy+' '+p.plan+' '+p.departments.map(b=>b.name).join(' ')).toLowerCase().includes(query.toLowerCase()));
 function update(text){const result=storage.write(browserStore(),id,text);setDrafts(prev=>({...prev,[id]:{text,saved:result.ok,updatedAt:result.updatedAt,error:result.error}}));setNotice('');}
 function select(id){setId(id);setNotice('');setUndo(null);}
 async function copy(){setNotice('프롬프트 복사 중');let timer;try{await Promise.race([navigator.clipboard.writeText(draft.text),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('timeout')),2000);})]);setNotice(id+' 프롬프트 복사 완료');}catch{textarea.current?.focus();textarea.current?.select();let copied=false;try{copied=document.execCommand('copy');}catch{}setNotice(copied?id+' 프롬프트 복사 완료':'자동 복사 불가 · 선택된 내용의 Ctrl/Cmd+C 복사');}finally{clearTimeout(timer);}}
 function reset(){setUndo({id,text:draft.text});update(d.prompt(id));setNotice('기본 프롬프트 복원 · 되돌리기 가능');}
 return <PageFrame eyebrow="TS 2027 · STRATEGY PROMPTS" title="전략 프롬프트 게시판" description="12대 전략별 편집 · 복사 · 내 브라우저 저장" actions={<><Link to="index.html?view=casebook&tab=strategy">사례·후속계획 →</Link><Link to="downloads/ts-strategy-prompts.md" download>기본 프롬프트 모음 ↓</Link></>}>
  <div className="prompt-layout"><aside className="prompt-list" aria-label="전략 프롬프트 목록"><label className="prompt-search">전략·부서 검색<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="예: AI혁신처, ST-08"/></label>{filtered.map(p=><button key={p.id} aria-pressed={id===p.id} onClick={()=>select(p.id)}><small>{p.id}{drafts[p.id].saved?' · 저장본':''}</small><strong>{p.strategy}</strong></button>)}{!filtered.length&&<p>검색 결과 없음</p>}</aside>
   <section className="prompt-editor" aria-label="프롬프트 편집"><header><small>{id} · {p.phase}</small><h2>{p.plan}</h2><div className="on-actions"><Link to={'index.html?view=casebook&tab=strategy&strategy='+id}>부서·업무·개발·검수 근거 →</Link><Link to={'index.html?view=strategy&strategy='+id}>전략·법령 매핑 →</Link></div></header>
    <div className="prompt-actions"><button onClick={copy}>프롬프트 복사</button><button onClick={reset}>기본값 복원</button>{undo?.id===id&&<button onClick={()=>{update(undo.text);setUndo(null);setNotice('편집 내용 복원 완료');}}>되돌리기</button>}<small>{draft.text.length.toLocaleString()} / 50,000자</small></div>
    <p className="prompt-status" role="status">{notice||draft.error||(draft.saved?'이 브라우저에 저장됨':'기본 프롬프트 · 편집 시 자동 저장')}</p>
    <label htmlFor="strategy-prompt-text">전략 프롬프트</label><textarea ref={textarea} id="strategy-prompt-text" value={draft.text} onChange={e=>update(e.target.value)} maxLength={50000} spellCheck={false}/>
    <small>현재 브라우저·기기에 저장 · 사이트 데이터 삭제 시 초기화 · 다른 기기로 이동 시 복사</small>
   </section>
  </div>
 </PageFrame>;
}
