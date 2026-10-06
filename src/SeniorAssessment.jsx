import React from 'react';
import {Out,href} from './core.jsx';
import data from './senior-assessment.cjs';
import './senior-assessment.css';

function Sources({ids}){return <p className="senior-refs">근거: {ids.map((id,i)=><React.Fragment key={id}>{i>0?' · ':''}<a href={'#senior-source-'+id}>{id}</a></React.Fragment>)}</p>}
export function SeniorAssessment(){return <section className="senior-review" id="section-qe-health-review" aria-labelledby="senior-review-title">
<header><p className="r47-badge">{data.date} · {data.id} · {data.status}</p><h2 id="senior-review-title" tabIndex={-1}>{data.title}</h2><p>{data.purpose}</p><p className="r47-note">{data.mapping}</p><ul>{data.assumptions.map(t=><li key={t}>{t}</li>)}</ul></header>
<nav aria-label="고령 운수종사자 추가 검토 목차">{data.sections.map(s=><a key={s.id} href={'#senior-'+s.id}>{s.title}</a>)}<a href="#senior-metrics">5개 평가 지표</a><a href="#senior-sources">공식 근거</a></nav>
{data.sections.map(s=><section id={'senior-'+s.id} key={s.id}><h3 tabIndex={-1}>{s.title}</h3><div className="r47-table"><table><caption>{s.title}</caption><thead><tr>{s.headers.map(h=><th scope="col" key={h}>{h}</th>)}</tr></thead><tbody>{s.rows.map((r,i)=><tr key={i}>{r.map((v,j)=><td data-label={s.headers[j]} key={j}>{v}</td>)}</tr>)}</tbody></table></div><Sources ids={s.refs}/></section>)}
<section id="senior-metrics"><h3 tabIndex={-1}>검증할 개선효과 · 측정방법 5개</h3><p>{data.evaluation}</p>{data.metrics.map(m=><article className="r47-metric" key={m.id}><h4>{m.id} · {m.name}</h4><dl><div><dt>산식</dt><dd>{m.formula}</dd></div><div><dt>측정방법</dt><dd>{m.method}</dd></div><div><dt>검증할 편익</dt><dd>{m.benefit}</dd></div><div><dt>기준선·목표</dt><dd>실측·전문 검토 전 미확정</dd></div></dl></article>)}</section>
<section><h3>편성·대가 산정 전제</h3><p>{data.cost.scope}</p><p>{data.cost.gate}</p><h4>현업·개발팀에 확인할 질문</h4><ol>{data.questions.map(q=><li key={q}>{q}</li>)}</ol></section>
<section id="senior-sources"><h3 tabIndex={-1}>공식 원문과 적용 범위</h3>{data.sources.map(s=><article className="r47-source" id={'senior-source-'+s.id} key={s.id}><h4><Out url={s.url}>{s.id} · {s.title}</Out></h4><small>{s.effective} · 확인 {s.checkedAt} · 위치 {s.locator}</small><p>확인 사실: {s.fact}</p><p>적용 한계: {s.limit}</p></article>)}</section>
<nav aria-label="고령 운수종사자 검토서 다운로드"><a href={href('downloads/senior-assessment.md')} download>검토서 MD ↓</a><a href={href('downloads/senior-assessment.json')} download>검토 명세 JSON ↓</a></nav>
</section>}
