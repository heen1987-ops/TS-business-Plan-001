import React,{useMemo,useState} from 'react';
import {Link} from './core.jsx';
import atlas from './case-architecture-atlas.cjs';
import './case-architecture-atlas.css';

function Figure({figure}){return <details className="case-atlas-figure"><summary>{figure.title} · {figure.role}{figure.sharedFrom?' · '+figure.sharedFrom+' 공유':''}</summary><p>{figure.status} · {figure.caption}</p><a href={figure.path} target="_blank" rel="noreferrer"><img src={figure.path} loading="lazy" alt={figure.title+' · '+figure.status}/></a></details>;}
export function OutcomeComparison({row}){const o=row.outcome;return <section className="case-outcome" aria-label={row.caseId+' As-Is To-Be 성과 대조'}>
  <div className="case-outcome-grid"><div><small>As-Is · 기존 문제</small><p>{o.asIs}</p></div><div><small>To-Be · 의도한 변화</small><p>{o.toBe}</p></div><div><small>기대효과 · 목표</small><p>{o.expectedEffect}</p></div><div><small>확인 결과 · 관찰</small><p>{o.observed}</p></div></div>
  <div className="case-outcome-assessment" data-verdict={o.verdict}><strong>{o.verdict}</strong><span>{o.verdictReason}</span></div>
  <p className="case-outcome-scope"><b>판단 범위</b> {o.evidenceStage} · {o.limits}</p>
 </section>;}
function Dossier({row}){return <details className="case-atlas-row"><summary><span className="case-atlas-id">{row.caseId}</span><strong>{row.title}</strong><span className="case-atlas-verdict" data-verdict={row.outcome.verdict}>{row.outcome.verdict}</span><span className="case-atlas-expand">+</span></summary><div className="case-atlas-body">
  <OutcomeComparison row={row}/>
  <details className="case-atlas-technical"><summary>구조·데이터 흐름·병목 분석</summary>
  <div className="case-atlas-meta"><span>{row.patternTitle}</span><span>{row.sourceStage}</span><span>{row.originalFigures.length?'원문 그림 '+row.originalFigures.length+'개'+(row.originalFigures[0].sharedFrom?' · 공유':''):row.reconstruction?'CCK 이미지 재구성':'원문 설명 기반 논리 흐름'}</span><span>{row.strategies.join(' · ')}</span></div>
  {row.pair&&<p className="case-atlas-pair">동일 계열의 다른 관점: {row.pairPeer} · {row.pair.note}. 사례 항목 수와 독립 구축 건수 구분.</p>}
  <dl className="case-atlas-facts"><dt>구조 근거</dt><dd>{row.architectureBasis}</dd><dt>데이터 경계</dt><dd>{row.dataBoundary}</dd><dt>판단 경계</dt><dd>{row.decisionBoundary}</dd></dl>
  <div className="case-atlas-flow" aria-label="사례별 논리 데이터 흐름">{row.flow.map((step,i)=><div key={i}><small>{String(i+1).padStart(2,'0')}</small><span>{step}</span></div>)}</div>
  <dl className="case-atlas-facts"><dt>병목·상태</dt><dd><b>{row.bottleneckStatus}</b> · {row.bottleneck}</dd><dt>검증 질문</dt><dd>{row.validation}</dd><dt>CCK 설계</dt><dd>{row.cckImplication}</dd><dt>미확인</dt><dd>{row.unknowns}</dd></dl>
  {row.originalFigures.length>0&&<div className="case-atlas-images">{row.originalFigures.map(f=><Figure key={f.path} figure={f}/>)}</div>}
  {row.reconstruction&&<Figure figure={{...row.reconstruction,role:'CCK 재구성 이미지',caption:row.reconstruction.basis}}/>}
  </details>
  <div className="case-atlas-links"><Link to={'index.html?view='+(row.kind==='ax'?'casebook':'platform-cases')+'&case='+row.caseId}>사례 세부 근거 →</Link><a href={row.outcome.sourceUrl||row.sourceUrl} target="_blank" rel="noreferrer">판단 원문 ↗</a></div>
 </div></details>;}

export function CaseArchitectureAtlas({kind}){
 const [pattern,setPattern]=useState('ALL');const [verdict,setVerdict]=useState('ALL');const [query,setQuery]=useState('');
 const all=atlas.byKind[kind];
 const filtered=useMemo(()=>all.filter(r=>(pattern==='ALL'||r.pattern===pattern)&&(verdict==='ALL'||r.outcome.verdict===verdict)&&(!query||[r.caseId,r.title,r.sourceStage,r.bottleneck,r.cckImplication,r.outcome.asIs,r.outcome.toBe,r.outcome.expectedEffect,r.outcome.observed,r.outcome.verdictReason,...r.flow].join(' ').toLowerCase().includes(query.trim().toLowerCase()))),[all,pattern,verdict,query]);
 return <section id="case-architecture-atlas" className="case-atlas case-synthesis-directions" aria-label="57개 사례 아키텍처 전수 분석">
  <header><small>As-Is → To-Be → 기대효과 → 확인 결과</small><h2>{kind==='platform'?'플랫폼 31건':'전략과제 26건'} 성과·구조 대조</h2><p>As-Is는 공개 자료의 기존 업무 또는 CCK의 비교 기준. 성공·실패는 공개 자료에서 확인한 범위만 판정. 발주 목표와 제품 기능은 운영 성과로 계산하지 않음.</p></header>
  {kind==='platform'&&<details className="case-atlas-reference"><summary>TS 조직 네이티브 AI · 공통 참조 구조 보기</summary><p>공식 조직·업무 원천 → 관계·효력 관리 → 권한·근거 게이트 → 업무 AI → 사람 확인·공식 처리. 아래 그림은 CCK 제안 구조이며 사례 기관의 실제 시스템도가 아님.</p><a href="assets/ts-organization-native-reference-architecture.svg" target="_blank" rel="noreferrer"><img src="assets/ts-organization-native-reference-architecture.svg" alt="TS 조직 네이티브 AI 공통 참조 구조도" loading="lazy"/></a></details>}
  <div className="case-atlas-patterns" aria-label="구조 유형 필터"><button type="button" aria-pressed={pattern==='ALL'} onClick={()=>setPattern('ALL')}>전체 {all.length}</button>{atlas.patterns.map(p=>{const count=all.filter(r=>r.pattern===p.id).length;return count?<button type="button" key={p.id} aria-pressed={pattern===p.id} onClick={()=>setPattern(p.id)}>{p.title} {count}</button>:null;})}</div>
  <div className="case-atlas-controls"><label className="case-atlas-verdict-filter">성과 판정 <select value={verdict} onChange={e=>setVerdict(e.target.value)}><option value="ALL">전체 판정</option>{['성과 확인','부분 성과','실패 확인','성과 미검증'].map(v=><option key={v} value={v}>{v} · {all.filter(r=>r.outcome.verdict===v).length}</option>)}</select></label><label className="case-atlas-search">사례 검색 <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="기관·사례 ID·업무·성과" type="search"/></label></div>
  <p className="case-atlas-count">표시 {filtered.length} / {all.length}건 · 전체 57개 분석 항목 / 53개 기관·제품군 수준 · 교차 관점 4쌍</p>
  <div className="case-atlas-list">{filtered.map(r=><Dossier key={r.caseId} row={r}/>)}</div>
  {filtered.length===0&&<p>해당 사례 없음. 검색어나 구조 유형 변경 필요.</p>}
 </section>;
}
