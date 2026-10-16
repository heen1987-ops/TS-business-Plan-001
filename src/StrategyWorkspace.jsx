import React,{useState} from 'react';
import {Link} from './core.jsx';
import d from './strategy-solutions-2027.cjs';
import laws from './law-workspace.cjs';
import './strategy-workspace.css';
const strategyLink=r=>'index.html?view=strategy&strategy='+r.id+'#'+r.id;
function Duties({row}){return <div className="on-strategy-duties">{row.dutyBindings.map(b=><div key={b.code}><div><Link to={'organization.html?org='+b.code+'&strategy='+row.id+'#org-detail'}>{b.name} →</Link><strong>{b.job}</strong></div><div>{b.duties.length?<ul>{b.duties.map(t=><li key={t}>{t}</li>)}</ul>:<p>{b.status}</p>}<small>{b.locator}</small>{b.restriction&&<details className="on-details"><summary>적용 범위</summary><p>{b.restriction}</p></details>}</div></div>)}</div>;}
export function StrategyWorkspace(){
 const [query,setQuery]=useState(''),[direction,setDirection]=useState(''),[phase,setPhase]=useState('');
 const requested=new URLSearchParams(location.search).get('strategy'),law=new URLSearchParams(location.search).get('law');
 const rows=d.rows.filter(r=>(!direction||r.direction===direction)&&(!law||r.lawIds.includes(law))&&(!phase||(phase==='common'?r.id==='ST-04':r.id!=='ST-04'))&&[r.strategy,r.solution,r.work,...r.dutyBindings.flatMap(b=>[b.name,b.job,...b.duties])].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
 return <article className="on-page on-strategy-page">
 <header className="on-page-head"><span className="on-kicker">TS 2027 / 전략과제와 실행</span><h1>12대 전략과제 · 업무와 솔루션</h1><p className="on-muted">관계법령 → 담당 부서 → 직무·수행업무 → 필요한 솔루션</p><div className="on-actions"><Link to="downloads/ts-strategy-solutions-2027.md" download>전략·업무 매핑 ↓</Link><Link to="downloads/ts-strategy-solutions-2027.csv" download>매핑표 CSV ↓</Link><a href={d.source.url} target="_blank" rel="noreferrer">공식 전략체계 ↗</a></div></header>
 <div className="on-phase-map"><section><span>1차 · AI혁신처 추진</span><strong>조직 네이티브 AI 공통 기반</strong><p>조직·직무·업무 사전 / 사용자 인식 / 역할·권한 / 업무 맥락 / 협업·변경 이력</p><Link to="proposal-2027.html">6개 구축 묶음 · 9개월 · 12개 검수 →</Link></section><section><span>후속 · 소관 부서 적용</span><strong>12대 전략과제별 업무 지원</strong><p>공통 기반 재사용 / 부서별 지식·서식·연계 / 업무효율화·국민서비스</p><small>1차 대표 업무 검증 → 공통 기반 인수 → 부서별 전용 개발·성과 검수</small></section></div>
 <section className="on-section on-law-search"><h2>전략과제별 업무 매핑</h2>{law&&<p className="on-muted">연결 업무 {law} · <Link to="index.html?view=strategy">전체 과제 보기</Link></p>}
 <form onSubmit={e=>e.preventDefault()}><label>전략방향<select value={direction} onChange={e=>setDirection(e.target.value)}><option value="">전체</option>{d.directions.map(x=><option key={x}>{x}</option>)}</select></label><label>추진 구분<select value={phase} onChange={e=>setPhase(e.target.value)}><option value="">전체</option><option value="common">1차 공통 기반</option><option value="department">부서별 후속 적용</option></select></label><label>전략과제·부서·직무 검색<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="예: 안전망, 예산, 인수인계"/></label></form>
 <p className="on-muted" role="status">{rows.length}개 전략과제 · 세칙상 수행업무 → 솔루션 연결안</p>
 <div className="on-strategies">{d.directions.map(group=>{const items=rows.filter(r=>r.direction===group);return items.length?<section key={group}><h3>{group}</h3>{items.map(r=><details key={r.id+'-'+requested} id={r.id} open={requested===r.id}>
 <summary><span>{r.id}</span><strong>{r.strategy}<small>{r.dutyBindings.map(b=>b.name).join(' · ')}</small><small className="on-summary-work">업무 · {r.work}</small><small>지원 · {r.solution}</small></strong><small>{r.phase}</small></summary>
 <div className="on-strategy-body"><dl className="on-law-chain"><dt>01 관계법령·업무</dt><dd>{r.lawIds.length?r.lawIds.map(id=>{const l=laws.records.find(x=>x.id===id);return <div className="on-law-duty" key={id}><Link to={'index.html?law='+id+'#mandate-detail'}>{l.title} →</Link><small>{l.principal} · {l.law}</small></div>;}):<><a href={laws.foundation.url} target="_blank" rel="noreferrer">한국교통안전공단법 ↗</a><small className="on-block">별표4 내부 업무분장 및 업무별 규정</small></>}<details className="on-details"><summary>근거 적용 범위</summary><p>{r.basisNote}</p></details></dd>
 <dt>02 담당 부서·직무<br/>03 수행업무</dt><dd><Duties row={r}/></dd>
 <dt>04 필요한 솔루션</dt><dd><strong>{r.solution}</strong><ul>{r.features.map(f=><li key={f}>{f}</li>)}</ul></dd><dt>결과물</dt><dd>{r.output}</dd>
 <dt>추가 개발 구분</dt><dd>{r.id==='ST-04'?'1차 공통 추가분: 조직 인식·역할/권한·업무 맥락·운영 인수':'부서 후속 추가분: 업무 전용 지식·서식·연계·품질평가 / 공통 조직·권한 기능 재사용'}<small className="on-block">{r.phase} · 공통 추가분 ON27-BASE / C27-COM 단일 산정</small></dd>
 <dt>공통 구축·검수</dt><dd><div className="on-pills">{r.packages.map(id=><Link key={id} to={'proposal-2027.html#'+id}>{id}</Link>)}</div><div className="on-pills">{r.tests.map(id=><Link key={id} to={'proposal-2027.html#'+id}>{id}</Link>)}</div></dd><dt>업무 검수 기준안</dt><dd>{r.acceptance}</dd></dl><Link className="on-detail-link" to={strategyLink(r)}>이 과제 바로가기 ↗</Link></div></details>)}</section>:null;})}</div>
 {!rows.length&&<p className="on-empty">일치 과제 없음 · 검색어·전략방향 재선택</p>}</section>
 <details className="on-details"><summary>추진체계·근거</summary><p>전략과제명: TS 공식 전략체계 / 수행업무: 제공 직제시행세칙 / 직무 요약·솔루션·분담·검수 연결: 사업 설계안</p><p>AI혁신처: 부서별 수요·데이터 표준·서비스 구축 지원·성과 조정 / AI서비스개발팀: 공통플랫폼 구축·운영·품질 / 관련팀 시행 전 AI혁신처 담당</p><p>ST-04 공통 추가분의 단일 산정 · 대표 검증 후보의 M2 선정 · 후속 전용 개발·성과 검수의 별도 구성</p><p>개인별 전결·위임·데이터 접근정책의 별도 확인 / 실제 플랫폼 시험 미실행</p></details>
 </article>;
}
