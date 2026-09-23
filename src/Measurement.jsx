import React from'react';
import{Link,Out}from'./core.jsx';
import measurement from'./measurement-data.cjs';
import'./measurement.css';
export default function Measurement({m}){
 const p=measurement.metrics[m.id];
 return <section className="measurement" aria-labelledby="measurement-title">
 <header className="measurement-header"><span className="impact-tag">측정명세 · {p.version} · 실측 전</span><h2 id="measurement-title">{m.id} 정량평가 측정방법</h2><p>목표 → 관측단위 → 원천증빙 → 독립 판정 → 산식 → 결과 확인의 연결. 기간·허용폭·담당자의 기관 협의 후 적용.</p><nav aria-label="측정명세 자료 다운로드">
 <Link to="downloads/TS_정량평가_측정명세.md" download>39개 지표 측정명세 ↓</Link>
 <Link to="downloads/TS_정량평가_결과기록표.csv" download>빈 결과 기록표 CSV ↓</Link>
 <Link to="downloads/TS_정량평가_측정명세.json" download>구조화 명세 JSON ↓</Link>
 </nav></header>
 <div className="measurement-state"><b>기준선: 미확보</b><b>실측값: 미측정</b><b>필요 표본: 산정 전</b><b>기관 승인: 협의 전</b></div>
 <div className="measurement-sections">{measurement.sections(m.id).map(s=><article key={s.title}><h3>{s.title}</h3><dl>{s.rows.map(([title,value])=><div key={title}><dt>{title}</dt><dd>{value}</dd></div>)}</dl></article>)}</div>
 <section className="measurement-common" aria-labelledby="measurement-common-title"><h3 id="measurement-common-title">공통 평가 운영기준 · 제안</h3><p>아래 기준과 지표별 명세의 함께 적용. 기간·표본·위험 허용폭은 결과 확인 전에 합의.</p><div>{measurement.common.map(([title,text])=><article key={title}><h4>{title}</h4><p>{text}</p></article>)}</div></section>
 <section className="measurement-sources"><h3>측정설계의 공식 참고자료</h3><p>공식 자료는 평가방법의 근거. 기존 목표 개선율 또는 TS의 실측 성과를 입증하는 자료와 구분.</p>{measurement.sources.map(s=><article key={s.id}><Out url={s.url}>{s.id} · {s.title}</Out><p>{s.scope}</p></article>)}</section>
 </section>;
}
