import React from 'react';
import {Out,Link} from './core.jsx';
import research from './department-work-research.cjs';
function Items({value}){return <ul>{(Array.isArray(value)?value:[value]).filter(Boolean).map((v,i)=><li key={i}>{v}</li>)}</ul>}
function Fields({rows}){return <dl className="department-fields">{rows.map(([name,value])=><div key={name}><dt>{name}</dt><dd><Items value={value}/></dd></div>)}</dl>}
export function DepartmentWorkResearch({department,topic}){
 const r=research.byKey[department.key];if(!r)return null;const c=research.common,id='department-detail-'+topic.id;
 return <div className="department-briefing department-work-research" data-department-briefing={topic.id} data-detail-kind="discovery" data-work-researched={r.key}>
  <section id={id+'-scope'} tabIndex={-1}><h3>공식 담당업무 · 입력 · 처리 · 결과</h3><p className="department-note">{c.interpretation}</p><Fields rows={[["업무 목적",r.mission],["조직·확인일",r.parent+' / '+r.name+' · '+research.checkedAt],["결과 이용자",r.recipient]]}/>
   <ol className="department-job-list">{r.jobs.map(([name,input,operation],i)=><li key={name} data-researched-job={i}><h4>{String(i+1).padStart(2,'0')}. {name}<small>공식 담당업무 · <a href={'#work-source-'+r.key+'-ORG'}>ORG</a></small></h4><Fields rows={[["검토할 입력",input],["처리·인계 분석",operation]]}/></li>)}</ol>
  </section>
  <section id={id+'-basis'} tabIndex={-1}><h3>현재 수행기반 · 근거 · 확인 한계</h3><Fields rows={[["확인한 기존 기능",r.existing],["해석·책임 경계",r.boundary]]}/>
   <ul className="department-source-list">{r.sources.map(sid=>{const s=research.sources.find(s=>s.id===sid);return <li key={sid} id={'work-source-'+r.key+'-'+sid}><Out url={s.url}>{s.id} · {s.title}</Out><span>게시·시행: {s.published} · 확인: {s.checkedAt}{sid==='ORG'?' · 위치: '+r.name+' 담당업무':''}</span><Items value={[s.claim,s.limit]}/></li>})}</ul>
  </section>
  <section id={id+'-inputs'} tabIndex={-1}><h3>자료 연결 · 원기록 · 현업 확인</h3><Fields rows={[["연결할 정보",'위 업무별 입력을 대상·사건·형식·시험회차·변경 시점·원문 판본·공식 상태와 연결하는 분석안'],["데이터 존재·권한",'실제 연결키·원기록·DB·조회 범위·기간·제공 형태는 내부 확인 대상. 원자료를 받지 못한 상태와 기관 미보유를 구분'],["개인정보·자료 보호",r.privacy]]}/><h4>아직 확인하지 못한 사항</h4><Items value={r.unknown}/></section>
  <section id={id+'-how'} tabIndex={-1}><h3>업무 흐름 · CCK 적용 후보 · 기술적 방법</h3><p className="department-note">{r.flowKind}. 공개 절차 외의 내부 실제 처리순서·DB·API·전결·구현은 현업 확인 대상</p><ol className="department-step-list">{r.flow.map((step,i)=><li key={step} data-department-step={i}><h4><span>{String(i+1).padStart(2,'0')}</span>{step}</h4></li>)}</ol><Fields rows={[["추가 검증 후보",r.candidate],["CCK 처리·실행 흐름",r.how],["이 처의 적용 예",r.example],["기존·비AI 대안",c.comparison]]}/><p className="department-note">CCK 후보는 TS 적용 전 검증안. 제품·버전·사용권·API·성능 확인 후 재사용 범위 확정. 하나의 처에 하나의 독립 AI 플랫폼을 신설하는 제안과 구분</p></section>
  <section id={id+'-completion'} tabIndex={-1}><h3>완료 증거 · 예외 · 판단 책임</h3><Fields rows={[["확인할 완료 증거",'대상·기준·검토·시험·확정일·공식 결과·후속 인계 기록. 실제 서식·저장 시스템·전결은 내부 확인 대상'],["자료 부족·실패",'누락·판본 상충·권한 미확보를 보완·대기 상태로 분리. AI 문서 생성과 전문 검토·시험·공식 완료의 구분'],["책임·제외 범위",r.boundary],["개인정보·자료 처리",r.privacy]]}/></section>
  <section id={id+'-metrics'} tabIndex={-1}><h3>검증할 개선효과 · 측정방법</h3><p className="department-note">{c.measurementLimit}</p>{c.measures.map(([name,formula,method],i)=><section className="department-metric" key={name} data-department-metric={i}><h4>{i+1}. {name}</h4><Fields rows={[["측정식·분모",formula],["원기록·비교조건",method],["현재 상태",'기준선·수치 목표·실측 효과 미설정. 해당 처 사례·원기록 확보 후 채택 여부와 분모 확정']]}/></section>)}</section>
  <section id={id+'-conditions'} tabIndex={-1}><h3>요구환경 · 추가 공수 · 사업편성 조건</h3><Fields rows={[["기존 환경·재사용",c.environment],["추가 작업·비용",c.cost],["착수 증거",'실제 문제 사례·기존 기능과의 차이·업무자료 이용권·연계·정답셋·담당자 검증 확보. 구매수요·2027년 확정 사업계획 미확인']]}/></section>
  <section id={id+'-questions'} tabIndex={-1}><h3>이 처의 추가 확인 질문 · 필요 증빙</h3>{[...c.questions,...r.unknown.map(v=>[v+' 확인','해당 업무의 비식별 사례·내부 기준·화면·공식 기록'])].map(([q,evidence],i)=><section className="department-probe" key={q}><h4>{i+1}. {q}</h4><Fields rows={[["확인할 증빙",evidence]]}/></section>)}<p className="department-note">외부 현업 피드백 미수령. 공개자료 조사와 실제 내부 절차·병목 확인을 구분</p><p className="work-research-downloads"><Link download to="downloads/work-research/katri-department-work-20261007.md">12개 처 업무 조사·분석 MD ↓</Link><Link download to="downloads/work-research/katri-department-work-20261007.json">출처·업무·확인질문 JSON ↓</Link></p></section>
 </div>;
}
