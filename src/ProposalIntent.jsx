import React from 'react';
import {Out} from './core.jsx';
import intent from './proposal-intent.cjs';
import './proposal-intent.css';

export function IntentDefinitions(){return <section className="intent-definitions" aria-label="목적·목표·수단의 구분"><h2>이 기획에서 구분할 세 가지</h2><div>{intent.definitions.map(d=><section key={d.id}><h3>{d.label} <small>{d.question}</small></h3><p>{d.text}</p></section>)}</div><p className="intent-context">{intent.methodology.institution}</p></section>}

export function ProposalIntent({projectId,profileId}){
 const p=projectId?intent.byId[projectId]:intent.forProfile(profileId);if(!p)return null;
 const id='proposal-intent-'+p.id;
 return <section className="proposal-intent" id={id} data-proposal-intent={p.id} aria-labelledby={id+'-title'}>
  <header><small>{p.id} · {p.reference?'보조 제안·편입 확인 전':'2027년 조사 후보'} · {intent.date}</small><h3 id={id+'-title'}>{intent.labels.title}</h3><p>{intent.methodology.status}</p>{p.reviewStatus&&<p>{p.reviewDate} 구현 검토: {p.reviewStatus} · 현재 ISP 조사 후보, 발주 미확정</p>}</header>
  <section className="intent-purpose" data-intent-role="purpose"><h4>{intent.labels.purpose}</h4><p className="intent-benefit">{p.purpose}</p><p><b>직접 수혜자</b> {p.beneficiaries}</p></section>
  <section className="intent-goals" data-intent-role="goals"><h4>{intent.labels.goals}</h4><p className="intent-completion"><b>달성할 결과 상태</b> {p.completion}</p><ol>{p.goals.map((g,i)=><li key={g.id} data-intent-goal={g.id}><span>{String(i+1).padStart(2,'0')}</span><div><h5>{g.change}</h5><p><b>판단 지표</b> {g.metric.name}</p><p className="intent-formula"><b>측정식</b> {g.metric.formula}</p>{g.metric.note&&<p className="intent-metric-condition"><b>해석 조건</b> {g.metric.note}</p>}</div></li>)}</ol><p className="intent-measure-status" data-intent-target-status>{intent.methodology.targets}</p><p className="intent-quality">{intent.methodology.quality}</p></section>
  <section className="intent-why"><h4>필요성 · 지금 확인할 현행 한계</h4><p>{p.gap}</p><p><b>처음 검증할 범위·조건</b> {p.scope}</p><p className="intent-note">공식 업무·기존 절차의 존재와 실제 문제의 반복성·크기, AI의 효과를 구분. 실제 사건·원자료로 미지원 범위와 현업 수요 확인 후 사업 편성 판단.</p><ul className="intent-basis" aria-label="이 제안의 업무·현황 근거">{p.evidence.slice(0,3).map((s,i)=><li key={s.id||i}>{s.url?<Out url={s.url}>{s.title}</Out>:s.title}<small>{s.source_level==='2차'?'보도 인용 · ':''}{s.published||'게시일 미표시'} · 원문 적용 범위는 아래 상세 근거에서 확인</small></li>)}</ul></section>
  <section className="intent-means" data-intent-role="means"><h4>{intent.labels.means}</h4><dl>{[
   ['NOA · 문서·조건 이해',p.means.noa],
   ['기존 시스템·규칙·계산',p.means.rules],
   ['원문·판본·권한 지식 기반',p.means.knowledge],
   ['사람 · 공식 판단·확정',p.means.human]
  ].map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><p className="intent-note">{intent.methodology.capability}</p></section>
  <section className="intent-change" data-intent-role="change"><h4>{intent.labels.change}</h4><dl><div><dt>업무의 출발점</dt><dd>{p.change.entry}</dd></div><div><dt>추가하는 처리</dt><dd><ol>{p.change.steps.map((s,i)=><li key={i}>{s}</li>)}</ol></dd></div><div><dt>담당자에게 제공할 것</dt><dd>{p.change.prepared}</dd></div><div><dt>끝났는지 확인할 상태</dt><dd>{p.change.completion}</dd></div></dl><p className="intent-note">{p.qualification}</p></section>
  <section className="intent-delivery" data-intent-role="deliverable"><h4>{intent.labels.deliverable}</h4><dl><div><dt>재사용 검토</dt><dd>{p.reuse}</dd></div><div><dt>추가 개발 검토</dt><dd>{p.newWork}</dd></div></dl><p className="intent-note">자료·양식·스킬·연계 모듈은 납품 산출물. 납품·문서 생성 완료와 위의 업무 결과·공공 편익 달성을 각각 확인하는 평가. 수치 목표·최종 가격·발주범위 미확정.</p></section>
 </section>;
}
