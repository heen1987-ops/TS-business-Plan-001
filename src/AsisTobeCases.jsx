import React from 'react';
import {ArrowRight,Download,ExternalLink} from 'lucide-react';
import {Link} from './core.jsx';
import dataset from './asis-tobe-v12.cjs';
import concepts from './opportunity-concepts.js';
import './asis-tobe-v12.css';

const labels={infrastructure:'인프라(플랫폼)',knowledge:'지식 아카이브',services:'업무서비스(솔루션)'};
const order=['infrastructure','knowledge','services'];
const conceptFor=id=>concepts.find(item=>item.id===id);
const stages=[['enhance','고도화'],['new','신규 구축'],['integrate','연계 강화'],['next','차세대 사업']];
function Evidence({ids}){return <ul className="case-evidence">{ids.map(id=>{const s=dataset.sources[id];return <li key={id}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}<ExternalLink size={13} aria-hidden="true"/></a><small>확인 {s.checked}{s.note?' · '+s.note:''}</small></li>})}</ul>}
function Detail({item}){
 const concept=conceptFor(item.concept);
 return <details className="case-detail"><summary>실행 절차·사업화 구분·검증·근거 보기</summary>
  <div className="case-detail-content">
   <h4>TS 적용 시나리오</h4><p>{item.scenario}</p>
   <h4>TO-BE 처리 절차</h4><p>{item.tobe}</p>
   <dl><dt>산출물과 완료</dt><dd>{item.result}</dd><dt>예외·인계</dt><dd>{item.exception}</dd><dt>비교·검증 방법</dt><dd>{item.measure}</dd></dl>
   <h4>사업화 구분</h4><dl>{stages.map(([key,label])=><React.Fragment key={key}><dt>{label}</dt><dd>{item[key]}</dd></React.Fragment>)}</dl>
   <h4>사례·현황 근거</h4><Evidence ids={item.sources}/>
   {concept&&<Link to={'index.html?view=opportunities&concept='+encodeURIComponent(concept.slug)+'#opp-detail'}>관련 컨셉 {item.concept} 상세 <ArrowRight size={15} aria-hidden="true"/></Link>}
  </div>
 </details>;
}
export function AsisTobeCases(){return <section className="opp-section cases-v12" id="opp-asis-tobe" aria-labelledby="opp-asis-tobe-title">
 <div className="opp-section-head"><div><h2 id="opp-asis-tobe-title">사례 기반 AS-IS → TO-BE</h2><p>확인한 현황과 확인할 가설을 분리하고, 실제 업무 시나리오에서 전환 과제와 사업화 경로를 도출합니다.</p></div><Link to="downloads/ts-asis-tobe-cases-v1.2.md" download><Download size={16} aria-hidden="true"/> 사례 상세 MD</Link></div>
 <p className="case-legend">현행 사실은 명시한 출처 범위만 의미합니다. 타 기관 사례는 TS 현행 운영의 증거가 아니며, TO-BE는 제안·실증 전 시나리오입니다.</p>
 <div className="case-rules">{dataset.decisionRules.map(rule=><article key={rule.label}><h3>{rule.label}</h3><strong>판단 질문</strong><p>{rule.test}</p><strong>범위와 진입 조건</strong><p>{rule.scope} {rule.gate}</p></article>)}</div><p>연계 강화는 세 사업 유형을 가로지르는 수행 방식이며, 기존 플랫폼·데이터·외부 서비스와의 연결 범위를 별도로 확인합니다.</p>
 <div className="case-baseline"><h3>기존 TS 발주 요구와 추가 범위의 경계</h3><p>제공된 2026-10-31 기존 요구 대조 자료를 다시 검토한 2차 정리입니다. TS25·TS26·INS26의 실제 계약 정본·납품·검수·운영은 미확인이고, 이번에는 공고 원문을 재열람하지 못했습니다.</p><table className="opp-responsive-table"><thead><tr><th scope="col">영역</th><th scope="col">기존 요구로 기록된 범위</th><th scope="col">추가 검토 후보</th><th scope="col">현장 확인</th></tr></thead><tbody>{dataset.existingRequirements.map(row=><tr key={row.area}><th scope="row">{labels[row.area]}</th><td data-label="기존 요구">{row.existing}</td><td data-label="추가 검토 후보">{row.delta}</td><td data-label="현장 확인">{row.verify}</td></tr>)}</tbody></table><Evidence ids={['tsPlatform','tsRfp']}/></div>
 {order.map(area=><div className="case-area" key={area}><h3>{labels[area]}</h3><div className="case-grid">{dataset.cases.filter(item=>item.area===area).map(item=><article className="case-card" key={item.id} id={'case-'+item.id}>
  <div className="case-card-head"><small>{item.id} · {item.priority}</small><h4>{item.title}</h4></div>
  <div className="case-compare"><div><strong>AS-IS · TS 현황과 참고사례</strong><p>{item.confirmed}</p><strong>미확인·진단 과제</strong><p>{item.unknown} {item.problem}</p></div><div><strong>TO-BE · 제안 결과</strong><p>{item.result}</p><strong>처리 방식</strong><p>{item.tobe}</p></div></div>
  <Detail item={item}/>
 </article>)}</div></div>)}
 </section>}
