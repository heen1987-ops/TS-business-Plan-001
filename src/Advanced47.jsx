import React,{useState} from 'react';
import {Link,href} from './core.jsx';
import design from './advanced47.cjs';
import stateModel from './advanced-state47.cjs';
import './advanced47.css';
import {DetailedDiagram47} from './DetailedDiagram47.jsx';
function Table({caption,headers,rows}){return <div className="r47-table"><table><caption>{caption}</caption><thead><tr>{headers.map(x=><th key={x} scope="col">{x}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{r.map((v,j)=><td data-label={headers[j]} key={j}>{v}</td>)}</tr>)}</tbody></table></div>}
function Figure({code,type,title}){if(code==='CL'&&type==='runtime')return <DetailedDiagram47 code={code} type={type}/>;const url=href('downloads/revision47/'+code+'_advanced-'+type+'.svg');return <figure className="a47-figure"><a href={url} target="_blank" rel="noopener noreferrer" aria-label={title+' 원본 확대'}><img src={url} alt={title+' · 논리 구성요소와 책임 경계. 자세한 내용은 아래 표에 제공.'} loading="lazy"/></a><figcaption>{title} · 원본 확대 가능 · 기존 서버의 논리 배치</figcaption></figure>}
function StateExample(){const [selected,setSelected]=useState('review');const scenario=stateModel.scenarios.find(x=>x.id===selected),r=stateModel.replay(scenario.events);return <section className="a47-example" aria-labelledby="a47-example-title"><h4 id="a47-example-title">예외가 발생하면 흐름이 어떻게 달라지는가</h4><p>{stateModel.policy}</p><div className="a47-example-controls" role="group" aria-label="가상 상태 흐름 예시">{stateModel.scenarios.map(x=><button key={x.id} type="button" aria-pressed={selected===x.id} onClick={()=>setSelected(x.id)}>{x.title}</button>)}</div><p className="a47-result" role="status">선택 예시: {scenario.title} · 마지막 상태: {stateModel.labels[r.state.phase]} · 자료판본 {r.state.revision} / 기록판본 {r.state.recordVersion} · 후속관측: {r.state.observation}</p><p>{scenario.description}</p><ol className="a47-trace">{r.log.map((l,i)=><li key={i} data-accepted={l.accepted}><b>{stateModel.labels[l.from]} → {stateModel.labels[l.to]}</b><span>{l.event} · {l.accepted?'허용':'차단'} · {l.reason}</span></li>)}</ol></section>}
export function Advanced47({code}){const s=design.get(code);if(!s)return null;return <section className="advanced47" data-advanced-department={code} aria-labelledby="a47-title"><header><span>요구사항을 실제 업무 수행 구조로 연결</span><h3 id="a47-title" tabIndex={-1}>고도화 설계 · 계획·실행·검증·재계획</h3><p>{s.goal}</p><p className="r47-note">{s.date} · {s.status}. {s.scope}</p></header>
<div className="a47-summary">{[['사건의 식별',s.key],['AI가 새롭게 맡는 일',s.agent],['규칙도구가 확인하는 일',s.rule],['다시 계획해야 하는 조건',s.replan],['업무 완료를 인정할 증거',s.complete],['실행 경계',s.boundary]].map(([k,v])=><article key={k}><h4>{k}</h4><p>{v}</p></article>)}</div>
<section className="a47-subsection" id="r47-design-modules"><h4>구현 대안·모듈별 책임·요구사항 연결</h4><Table caption="고도화 대안 비교 · 기존 기능 재사용 전제" headers={['방식','적용 업무','선택·검증 기준']} rows={s.alternatives}/>
<Figure code={code} type="runtime" title="세부 실행 아키텍처 · 14개 책임 모듈"/>
<p className="r47-note">조회·분석 도구는 검토 준비에 사용. 등록·통보·수정과 같은 변경행위는 별도 승인 및 실행 직전 검증 후 허용. 검토안 인계로 끝나는 과업은 외부 변경행위를 거치지 않고 완료 가능.</p>
<Table caption="처별 과업–기능요구–검수 연결" headers={['과업','입력·구체 처리','완료 산출물','요구·검수·측정']} rows={s.steps.map(x=>[x.id+' · '+x.title,x.input+' → '+x.process,x.output,<><a href={'#'+x.requirement}>{x.requirement}</a><br/>{x.tests.join(' · ')}<br/>{x.metrics.join(' · ')}</>])}/>
<Table caption="구성요소별 책임과 검증 경계" headers={['ID','구성요소','구체 처리','확인·제한 조건']} rows={s.modules}/>
</section><section className="a47-subsection" id="r47-design-contracts"><h4>원장·저장소·인터페이스 계약</h4><p><b>이 처의 공식 원천:</b> {s.official}. AI의 추출값과 원천 값이 다르면 차이를 보존하고 권한 있는 담당자의 확인으로 연결.</p>
<Table caption="논리 엔터티 · 필드·기준 기록·정합성" headers={['엔터티','논리 필드','기준 기록의 주체','변경·대사 조건']} rows={s.entities}/>
<Table caption="논리 서비스 계약 · 실제 API 주소·인증·쓰기권한은 확인 전" headers={['계약','입력','출력','실패·예외']} rows={s.contracts}/>
<p className="r47-note">위 필드는 구현 협의용 설계. 실제 DB 스키마·API·제품 버전과 대조 전이며 원천별 {s.sourceContract.id}의 미확인 항목 유지. 이벤트는 발생시각과 수신시각을 구분하고 같은 사건의 기록판본을 대조.</p>
</section><section className="a47-subsection" id="r47-design-state"><h4>업무 상태·승인·예외·복구</h4><Table caption="서로 다른 다섯 상태 축" headers={['구분','대표 상태','해석 원칙']} rows={s.axes}/>
<StateExample/>
<Figure code={code} type="sequence" title="서비스 실행 시퀀스 · 조회·승인·결과 대사"/>
<Table caption="상태 전이 계약 · 진행 중 변경은 결과 대사를 우선" headers={['이벤트','현재 → 다음','허용조건','수행자·증거']} rows={s.transitions.map(t=>[t.id+' · '+t.title,t.from.map(x=>stateModel.labels[x]).join(' / ')+' → '+stateModel.labels[t.to]+(['source_changed','policy_blocked','reconcile_superseded','partial_reconciled'].includes(t.id)?' (진행 중 변경은 대사 우선, 해소 후 정책보류가 남으면 보류로 복귀)':''),t.guard,t.actor+' / '+t.evidence])}/>
<aside className="a47-boundary"><b>이 처에서 특별히 확인할 예외</b><p>{s.exception}</p><p>완료한 항목과 남은 항목의 분리 관리. 진행 중 원천 변경은 이미 전송된 행위를 취소한 것으로 처리하지 않고 원 요청·늦은 결과를 대사. 종결 후에도 정정·재발 신호에 따른 재개와 후속 관측 가능.</p></aside>
</section><section className="a47-subsection" id="r47-design-operations"><h4>기존 서버 배치·용량·운영 인수</h4><Table caption="배치·용량·관측·복구" headers={['구분','설계 대상','확인·인수 조건']} rows={s.operations}/>
<p>운영 설정 미확정: {Object.keys(s.parameters).join(', ')}. 확인 전 값을 0 또는 임의 보장값으로 채우지 않음. 기존 39개 수집계약 중 이 처의 {s.measurementRefs.join(' · ')}와 연결.</p>
</section><nav className="r47-downloads" aria-label="고도화 설계 내려받기"><Link download to={'downloads/revision47/'+code+'_고도화설계.md'}>고도화 설계 MD ↓</Link><Link download to={'downloads/revision47/'+code+'_고도화설계.json'}>고도화 설계 JSON ↓</Link></nav>
</section>}
