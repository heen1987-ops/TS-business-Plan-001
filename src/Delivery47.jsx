import React from 'react';
import {Link} from './core.jsx';
import spec from './delivery47.cjs';
import './delivery47.css';
function Grid({caption,heads,rows}){return <div className="r47-table"><table><caption>{caption}</caption><thead><tr>{heads.map(h=><th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{r.map((v,j)=><td key={j}>{v}</td>)}</tr>)}</tbody></table></div>}
function Scenario({test}){return <section className="d47-scenario" aria-labelledby={test.id+'-title'}><h5 id={test.id+'-title'}>{test.id} · {test.kind}</h5><dl>{[['사전조건',test.given],['수행',test.when],['기대결과',test.then],['확인 증거',test.evidence],['현재 상태',test.status]].map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></section>}
export function Delivery47({code}){const s=spec.get(code);if(!s)return null;return <section className="delivery47" id="r47-delivery" data-delivery-department={code} aria-labelledby="r47-delivery-title"><header><span>요구사항 → 구현 → 시험 → 운영효과</span><h3 id="r47-delivery-title" tabIndex={-1}>발주·개발 검토 명세</h3><p>작성일 {s.date} · {s.status}. 특정 제품명은 CCK 구현안의 설명이며 아래 기능 요구의 필수 구매조건으로 확정한 항목이 아님.</p><p>기능요구 4개와 재사용할 공통통제 {s.controls.length}개 연결. 아래 수용시험은 <b>시험 설계·미수행</b> 상태. 이 사이트의 화면검사 통과와 실제 솔루션의 수용시험 통과는 별도.</p></header>
<Grid caption="업무부터 인수까지 추적표" heads={['업무·요구','구현·화면','수용시험','운영효과']} rows={s.requirements.map(q=>[<a href={'#'+q.id}>{q.id}<br/>{q.title}</a>,q.module+' / '+q.screenId,q.tests.map(t=>t.id).join(' · '),q.metricRefs.map(id=><a className="d47-metric-link" key={id} href={'#r47-'+id}>{id}</a>)])}/>
{s.requirements.map(q=><article className="d47-requirement" key={q.id} id={q.id}><span className="r47-badge">{q.id} · 기능요구 초안</span><h4 tabIndex={-1}>{q.title}</h4><p className="d47-statement">{q.statement}</p><dl className="d47-definition">{[['입력 → 산출물',q.input+' → '+q.output],['구현 모듈·화면',q.module+' / '+q.screenId+' '+q.screen],['핵심 데이터(설계)',q.entityFields.join(', ')],['판단 책임',q.decision],['제품·개발 상태',q.product+' '+q.implementation],['선행 조건',q.dependsOn.length?q.dependsOn.join(', '):'사건·자료·권한·판본 확인'],['공통통제 참조',q.controlRefs.join(' · ')]].map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><p className="r47-note">{q.evidenceUse}</p><nav className="d47-evidence" aria-label={q.id+' 근거 참조'}>{q.evidenceLinks.map(x=><div key={x.id}><Link to={'updates.html?view=evidence47&dept='+code+'&q='+encodeURIComponent(x.id)}>{x.id} · {x.role} · {x.source_level}{x.source_level==='2차'?' · 보도 인용/재게시':''} ↗</Link><small>{x.grade} · {x.note||x.scope} · {x.use}</small></div>)}</nav><div className="d47-scenarios">{q.tests.map(t=><Scenario test={t} key={t.id}/>)}</div></article>)}
<div className="d47-counter"><h4>이 처에서 반드시 확인할 반례</h4><p className="r47-note">시험용 가상 상황. 실제 발생 사례 또는 위반 판단과 구분.</p><Scenario test={s.counter}/></div>
<h4>기존 시스템과 무엇을 주고받는가</h4>
<Grid caption={s.interface.id+' · 인터페이스 계약 확인표'} heads={['항목','계획·설계','확인 상태']} rows={[
['조회 대상',s.interface.read,'자료 원천·제공권한 확인 전'],
['변경·기록 후보',s.interface.proposedWrite,'허용행위·공식 승인·원천 반영 방식 확인 전'],
['교환 필드 후보',s.interface.fields.join(', '),'실제 스키마와 매핑 전'],
['호출 경로·인증', 'endpoint · auth · schema','모두 미확인. 실제 주소·방식을 임의 기재하지 않음'],
['쓰기·중복 처리','writePermission · idempotency','모두 미확인. 조회권한을 쓰기권한으로 확대하지 않음'],
['접근 불가 시',s.interface.fallback,'파일 기반 기능검토와 실제 연계시험 구분'],
['지연·거부·유실',s.interface.unavailable,'기관별 응답·시간 제한·복구 절차 협의 필요']
]}/>
<h4>공통통제 · 처별로 재사용할 요구</h4><p>동일 통제의 제품 기능을 처마다 별도 구축하는 것으로 계산하지 않음. 업무별 권한·규칙·예외·시험자료의 추가 적용은 각각 확인.</p>
<Grid caption="8개 공통통제와 예외시험" heads={['통제','요구 동작','예외시험 기대결과','증거·책임']} rows={spec.controls.map(c=>[c.id+' · '+c.title,c.statement,c.tests[1].id+' / '+c.tests[1].expected,c.artifact+' / 책임 협의: '+c.owner])}/>
<h4>납품 확인과 개선효과 검증의 구분</h4><Grid caption="네 단계 검증과 완료 경계" heads={['단계','사용 자료·환경','확인할 결과','완료 경계']} rows={s.environments}/>
<p><b>측정 이벤트 필드(설계):</b> {s.eventFields.join(', ')}</p><p className="r47-note">{s.eventPolicy}</p>
<h4>정량지표를 실제로 계산하기 위한 수집계약</h4><p className="r47-note">{s.measurementRule}</p><p><b>공통 비교 필드(설계):</b> {s.measurementCommonFields.join(', ')}</p>
{s.measurementContracts.map(m=><article className="d47-measurement" id={'collection-'+m.id} key={m.id}><h5><a href={'#r47-'+m.id}>{m.id} · {m.name}</a></h5><dl className="d47-definition">{[['원천·수집방법',m.source],['필수 필드(설계)',m.fields.join(', ')],['수집 시점·절차',m.stage],['책임 협의',m.owner],['산출불가 조건',m.blocked],['관련 기능',m.requirementRefs.join(' · ')],['확인 상태',m.status]].map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></article>)}
<h4>물량·개발범위 확정 전에 확보할 자료</h4><Grid caption="산정 입력과 미확정 상태" heads={['구분','정의할 물량·조건','확인 증거','현재 상태']} rows={s.measures}/><ul>{s.questions.map(x=><li key={x}>{x}</li>)}</ul>
<nav className="r47-downloads" aria-label="요구사항·검수명세 내려받기"><Link download to={'downloads/revision47/'+code+'_요구사항_검수명세.md'}>요구사항·검수명세 MD ↓</Link><Link download to={'downloads/revision47/'+code+'_요구사항_검수명세.json'}>요구사항·연계·시험 JSON ↓</Link><Link download to="downloads/revision47/요구사항_추적원장.json">전체 추적원장 JSON ↓</Link></nav>
</section>}
