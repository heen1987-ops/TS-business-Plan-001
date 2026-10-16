import {CaseLinks} from './AxCasebook.jsx';
import React,{useState} from 'react';
import {Search,ArrowUpRight,ArrowLeft,ArrowRight,Download,ShieldCheck,Route,Layers,Building2} from 'lucide-react';
import {Link} from './core.jsx';
import d from './strategy-solutions-2027.cjs';
import laws from './law-workspace.cjs';
import org from './organization-site.cjs';
import workMap from './all-department-work.cjs';
const icons=[ShieldCheck,Route,Layers,Building2];
const shortDirections=['교통안전','미래 모빌리티','국민서비스','책임경영'];
const strategyLink=r=>'index.html?view=strategy&strategy='+r.id;
const lawLink=id=>'index.html?view=law&law='+id+'#mandate-detail';

function Foundation(){return <section className="ux-foundation" aria-label="AI혁신처 1차 구축 범위"><div><div className="ux-foundation-title"><span className="ux-stage">1차 구축</span><h2>AI혁신처 · 공통 기반</h2><Link to="proposal-2027.html">일정·검수 <ArrowUpRight size={15}/></Link></div><div className="ux-foundation-items">{org.packages.map((p,i)=><Link key={p.id} to={"proposal-2027.html#"+p.id}><span>{String(i+1).padStart(2,"0")}</span>{p.title}</Link>)}</div></div><div className="ux-foundation-next"><span className="ux-stage">공통 기반 인수 후</span><Link to="organization.html?view=work-map&org=all"><strong>조직·직무·업무 <ArrowRight size={15}/></strong></Link><span>업무효율화 · 국민서비스</span></div></section>;}
function Evidence({row}){return <details className="ux-evidence"><summary>출처·적용 범위</summary><p>전략과제명: TS 공식 전략체계 / 수행업무: 직제시행세칙 2026.06.30 / 직무 요약·참여 조직·솔루션·검수 연결: 사업 설계안</p>{row&&<p>{row.basisNote}</p>}<p>AI서비스개발팀: 최초 팀장 발령일부터 시행 · 시행 전 AI혁신처 담당</p><p>개인별 전결·위임·접근정책의 별도 확인 · 실제 플랫폼 시험 미실행</p><a href={d.source.url} target="_blank" rel="noreferrer">TS 공식 전략체계 ↗</a><Link to="downloads/ts-strategy-solutions-2027.md" download>상세 매핑 내려받기 ↓</Link></details>;}
function TaskDetail({row:r}){
 const related=r.lawIds.map(id=>laws.records.find(l=>l.id===id));
 return <article className="on-page ux-task-page" id={r.id}>
 <Link className="ux-back" to="index.html"><ArrowLeft size={16}/> 전체 전략과제</Link>
 <header className="ux-detail-head"><span className="ux-eyebrow">{r.id} · {r.direction}</span><h1>{r.strategy}</h1><p>{r.work}</p><span className={'ux-tag '+(r.id==='ST-04'?'is-foundation':'')}>{r.phase}</span></header>
 <nav className="ux-detail-nav" aria-label="과제 상세 목차"><a href="#task-law">01 법령·업무</a><a href="#task-duty">02 부서·직무</a><a href="#task-solution">03 솔루션·검수</a></nav>
 <section className="ux-section" id="task-law"><header><span>01</span><div><h2>관계법령과 수행업무</h2><p>권한 주체 → 업무 근거 → 수행업무</p></div></header>
 <div className="ux-law-cards">{related.length?related.map(l=><Link className="ux-law-card" key={l.id} to={lawLink(l.id)}><span>{l.principal}</span><h3>{l.title}<ArrowUpRight size={17}/></h3><p>{l.law}</p></Link>):<div className="ux-law-card"><span>한국교통안전공단</span><h3>설립법·내부 업무분장</h3><p>한국교통안전공단법 · 직제시행세칙 별표4</p><a href={laws.foundation.url} target="_blank" rel="noreferrer">설립법 원문 ↗</a></div>}</div>
 </section>
 <section className="ux-section" id="task-duty"><header><span>02</span><div><h2>담당 부서·직무·실제 업무</h2><p>세칙상 업무분장 기반 · 참여 조직안</p></div></header>
 <Link className="wm-related" to={'organization.html?view=work-map&org=all&strategy='+r.id}>{r.id} 연결 업무 {workMap.strategyCounts[r.id].toLocaleString()}개 · 조직·직무에서 보기 →</Link><div className="ux-duty-table"><div className="ux-duty-labels"><span>부서 / 직무</span><span>직제시행세칙 수행업무</span></div>{r.dutyBindings.map(b=><div className="ux-duty-row" key={b.code}><div><Link to={'organization.html?org='+b.code+'&strategy='+r.id+'#org-detail'}>{b.name}<ArrowUpRight size={15}/></Link><p>{b.job}</p><Link className="dw-open-link" to={'organization.html?view=work-map&org='+b.code+'&strategy='+r.id}>세부 업무표 →</Link></div><div>{b.duties.length?<ul>{b.duties.map(t=><li key={t}>{t}</li>)}</ul>:<p>{b.status}</p>}<details className="ux-citation"><summary>근거 위치</summary><p>{b.locator}</p>{b.restriction&&<p>{b.restriction}</p>}</details></div></div>)}</div>
 </section>
 <CaseLinks strategy={r.id}/>
 <section className="ux-section" id="task-solution"><header><span>03</span><div><h2>업무에 필요한 솔루션</h2><p>{r.id==='ST-04'?'1차 공통 기반 구축':'공통 기반 인수 후 부서별 적용'}</p></div></header>
 <div className="ux-solution"><div><span className="ux-eyebrow">솔루션 구성안</span><h3>{r.solution}</h3><ul>{r.features.map(f=><li key={f}>{f}</li>)}</ul></div><div><span className="ux-eyebrow">업무 결과물</span><p>{r.output}</p><span className="ux-eyebrow">개발 범위</span><p>{r.id==='ST-04'?'조직 인식 · 역할·권한 · 업무 맥락 · 운영 인수':'업무 전용 지식·서식·연계·품질평가 / 공통 조직·권한 기능 재사용'}</p></div></div>
 <div className="ux-acceptance"><h3>업무 검수 기준안</h3><p>{r.acceptance}</p></div>
 <div className="ux-delivery-links"><div><h3>연결 구축 항목</h3>{r.packages.map(id=><Link key={id} to={'proposal-2027.html#'+id}>{org.packages.find(p=>p.id===id).title}<ArrowUpRight size={15}/></Link>)}</div><div><h3>연결 검수 항목</h3>{r.tests.map(id=><Link key={id} to={'proposal-2027.html#'+id}>{org.acceptance.find(t=>t.id===id).name}<ArrowUpRight size={15}/></Link>)}</div></div>
 </section><Evidence row={r}/><Link className="ux-back" to="index.html"><ArrowLeft size={16}/> 전체 전략과제</Link>
 </article>;
}
export function StrategyWorkspace(){
 const params=new URLSearchParams(location.search),requested=params.get('strategy'),law=params.get('law');
 const [query,setQuery]=useState(''),[direction,setDirection]=useState(''),[phase,setPhase]=useState('');
 const selected=d.rows.find(r=>r.id===requested);
 const rows=d.rows.filter(r=>(!direction||r.direction===direction)&&(!law||r.lawIds.includes(law))&&(!phase||(phase==='common'?r.id==='ST-04':r.id!=='ST-04'))&&[r.id,r.strategy,r.solution,r.work,...r.dutyBindings.flatMap(b=>[b.name,b.job,...b.duties])].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
 if(selected)return <TaskDetail row={selected}/>;
 return <article className="on-page ux-home" id="organization-platform">
 <header className="ux-home-head"><div><span className="ux-eyebrow">TS 2027 · 조직 기반의 AI 고도화</span><h1>12대 전략과제</h1><p>법령·부서·업무에서 출발하는 AI 활용체계</p></div><Link className="ux-download" to="downloads/ts-strategy-solutions-2027.csv" download><Download size={16}/> 전체 매핑표</Link></header>
 <Foundation/><div className="ux-searchbar"><label><Search size={19} aria-hidden="true"/><span className="ux-sr">전략과제·부서·업무 검색</span><input type="search" placeholder="전략과제, 부서 또는 업무 검색" value={query} onChange={e=>setQuery(e.target.value)}/></label><label className="ux-phase-filter"><span className="ux-sr">추진 단계</span><select value={phase} onChange={e=>setPhase(e.target.value)}><option value="">전체 추진 단계</option><option value="common">1차 공통 기반</option><option value="department">부서별 후속 적용</option></select></label></div>
 <div className="ux-filter-row"><div className="ux-filter-chips" aria-label="전략방향 필터"><button onClick={()=>setDirection('')} aria-pressed={!direction}>전체</button>{d.directions.map((name,i)=><button key={name} onClick={()=>setDirection(name)} aria-pressed={direction===name}>{shortDirections[i]}</button>)}</div><span role="status">{rows.length}개 과제</span></div>
 {law&&<p className="ux-filter-note">{laws.records.find(l=>l.id===law)?.title||law} 연결 과제 · <Link to="index.html">전체 보기</Link></p>}
 {requested&&!selected&&<p role="status" className="ux-filter-note">등록되지 않은 과제 · 전체 목록 표시</p>}
 <div className="ux-strategy-board">{d.directions.map((name,i)=>{const items=rows.filter(r=>r.direction===name),Icon=icons[i];return items.length?<section key={name} className="ux-direction"><header><Icon size={21}/><div><h2>{shortDirections[i]}</h2><p>{name}</p></div></header><div>{items.map(r=><Link to={strategyLink(r)} key={r.id} className={'ux-task-card'+(r.id==='ST-04'?' is-foundation':'')}><div><span>{r.id}</span>{r.id==='ST-04'&&<span className="ux-tag is-foundation">1차 기반</span>}<ArrowUpRight size={17}/></div><h3>{r.strategy}</h3></Link>)}</div></section>:null;})}</div>
 {!rows.length&&<div className="ux-no-results"><Search size={28}/><h2>일치하는 과제 없음</h2><p>부서명 또는 다른 업무 키워드로 검색</p><button onClick={()=>{setQuery('');setDirection('');setPhase('');}}>검색 조건 초기화</button></div>}
 <Evidence/>
 </article>;
}
