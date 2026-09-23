
import React,{useState}from'react';
import{Search,ArrowRight,ArrowUpRight,Download,Phone,ChevronRight}from'lucide-react';
import{Link,Out,Heading,depts,deptPath}from'./core.jsx';
import data from'./ars.json';import'./ars.css';
export function Ars(){
 const[group,setGroup]=useState('1'),[query,setQuery]=useState('');
 const select=v=>{setGroup(v);setQuery('')};
 const groups=data.groups.filter(g=>group==='all'||g.key===group).map(g=>({...g,routes:g.routes.filter(r=>[r.path,r.label,r.action,r.organization].join(' ').toLowerCase().includes(query.trim().toLowerCase()))})).filter(g=>g.routes.length);
 const count=groups.reduce((n,g)=>n+g.routes.length,0);
 return <div className="page ars-page">
 <Heading label="PUBLIC SERVICE CONTACT MAP" title={<>국민이 찾는 업무에서,<br/>처리 완료까지.</>} desc="제공 ARS 표와 공식 안내의 대조 · 기존 서비스·담당 조직·AX 추가범위의 연결">
 <Link to="downloads/TS_ARS_대국민접점_검토.md" download className="button outline"><Download size={18}/>검토문서</Link></Heading>
 <div className="ars-intro"><div><span className="eyebrow">현행 접점 기준선</span><h2>6개 메뉴군 · 31개 선택 경로</h2><p>상담·문자·챗봇이 이어지는 국민의 이용 경로. 조직도와 업무분장표는 별도 확인.</p><small>안내 경로를 분석한 기획 화면 · 실제 ARS 조작·SMS 발송 기능과 구분</small></div><div className="ars-source"><Phone size={24}/><b>공식 안내 대조</b><Out url={data.source.url}>TS 고객콜센터 원문</Out><span>{data.date} · 통화·문자·챗봇 실사용 미검증</span></div></div>
 <div className="ars-controls">{data.control.map(([k,v])=><div key={k}><b>{k}</b><span>{v}</span></div>)}</div>
 <section className="ars-browser" aria-label="ARS 업무 탐색">
 <nav className="ars-nav" aria-label="ARS 대분류">
 <button onClick={()=>select('all')} aria-pressed={group==='all'}><span>전체</span><b>6개 메뉴군</b><small>31경로</small></button>
 {data.groups.map(g=><button key={g.key} onClick={()=>select(g.key)} aria-pressed={group===g.key}><span>{g.key}</span><b>{g.title}</b><small>{g.routes.length}경로</small></button>)}</nav>
 <div className="ars-results"><label className="search"><Search size={18}/><input aria-label="ARS 경로 검색" placeholder="선택한 메뉴의 업무·연결·담당 검색" value={query} onChange={e=>setQuery(e.target.value)}/></label>
 <p className="ars-result-count" role="status">{count}개 경로 · {group==='all'?'전체 메뉴':data.groups.find(g=>g.key===group).title}</p>
 {groups.length?groups.map(g=><article className="ars-group" key={g.key}>
 <header><span className="ars-number">{g.key}</span><div><h2>{g.title}</h2><p>{g.goal}</p></div></header>
 <div className="ars-responsibility"><b>업무 담당 연결안</b><p>{g.organization}</p><small>{g.mapping}</small></div>
 <div className="ars-routes">{g.routes.map(r=><details className="ars-route" key={r.id}><summary><span className="ars-path">{r.path}</span><b>{r.label}</b><span className="ars-action">{r.action}</span><ChevronRight size={17}/></summary><div><p><b>담당 연결안</b> · {r.organization}</p><p className="muted">업무 담당 연결은 기존 원장 참조. 실제 상담 이관·최종 전결은 추가 확인.</p>{r.codes.length>0&&<div className="ars-dept-links">{r.codes.map(c=>depts.find(d=>d.code===c)).filter(Boolean).map(d=><Link key={d.code} to={deptPath(d)}>{d.name} 기존 대표 제안 <ArrowUpRight size={15}/></Link>)}</div>}</div></details>)}</div>
 <div className="ars-after"><span>AX로 바꿀 처리방식 · 제안</span><p>{g.after}</p></div>
 </article>):<div className="empty"><h2>일치하는 경로 없음</h2><p>다른 메뉴를 선택하거나 전체 경로에서 확인</p><button className="button blue" onClick={()=>select('all')}>전체 경로 보기</button></div>}
 </div></section>
 <p className="micro">{data.countRule}</p>
 <section className="ars-model"><span className="eyebrow">공통 서비스 모델 · 기획 가설</span><h2>문자 도착과 업무 완료의 구분.</h2><p>국민의 상황을 이해하고, 필요한 확인과 공식 처리가 이어지도록 지원하는 공통 과업 모델.</p><ol>{data.flow.map(([a,b],i)=><li key={a}><span>0{i+1}</span><h3>{a}</h3><p>{b}</p></li>)}</ol><div className="ars-comparison"><div><b>비AI 비교안</b><p>메뉴 단순화 · 문자 목적지 개선 · 상담원 인계서식 정비</p></div><div><b>AI 추가 가치의 검증</b><p>복합적인 상황의 해석 · 필요한 확인 질문 · 진행 중 조건 변화에 따른 경로 조정</p></div></div></section>
 <div className="ars-grid"><section><h2>기존 구축 기반과 추가 작업</h2>{data.implementation.map(([a,b])=><details className="ars-detail" key={a}><summary>{a}</summary><p>{b}</p></details>)}<div className="ars-cost"><b>산정의 경계</b><p>{data.scope}</p></div></section>
 <section><h2>무엇이 달라졌는지 확인</h2><p className="note">{data.validation}</p>{data.metrics.map(([a,b,c])=><details className="ars-detail" key={a}><summary>{a}</summary><p><b>측정</b> · {b}</p><p>{c}</p></details>)}</section></div>
 {data.corrections?.map(c=><div className="ars-cost" key={c.title}><b>{c.title}</b><p>{c.text}</p><Out url={c.url}>공식 이관 공지 · {c.effective}</Out></div>)}<section className="ars-gap"><h2>기존 13개 대표안 밖의 접점</h2><p>동일한 공통 지원구조를 검토하되 업무별 근거·권한·담당자를 추가 확인할 영역</p><div>{data.gaps.map(x=><span key={x}>{x}</span>)}</div></section>
 <details className="ars-detail ars-limits"><summary>근거의 한계와 추가 확인</summary><ul>{data.limitations.map(x=><li key={x}>{x}</li>)}</ul><h3>현업 확인 질문</h3><ul>{data.questions.map(x=><li key={x}>{x}</li>)}</ul><p>기준: 사용자 제공 표 → 공식 게시내용 대조 → 기존 법정업무 지도 연결 → 설계 가설. 최신 내부 업무분장·전체 실운영 검증과 구분.</p></details>
 <div className="discovery-foot"><p>{data.status}</p><Link to="organization.html">조직과 업무 <ArrowRight size={17}/></Link><Link to="solutions.html">기존 AX 서비스 <ArrowRight size={17}/></Link></div>
 </div>
}
