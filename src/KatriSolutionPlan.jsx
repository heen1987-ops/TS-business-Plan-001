import React from 'react';
import {Out,Link} from './core.jsx';
import expansion from './katri-solution-expansion.cjs';
import './katri-solution-plan.css';
function Items({value}){return <ul>{(Array.isArray(value)?value:[value]).filter(Boolean).map((v,i)=><li key={i}>{v}</li>)}</ul>}
function Fields({rows}){return <dl className="department-fields">{rows.map(([k,v])=><div key={k}><dt>{k}</dt><dd><Items value={v}/></dd></div>)}</dl>}
function Sources({ids}){return <ul className="department-source-list">{ids.map(id=>{const s=expansion.sources.find(x=>x.id===id);return <li key={id} data-katri-source={id}><Out url={s.url}>{s.id} · {s.title}</Out><span>게시·시행: {s.published} · 확인: {s.checkedAt}</span><Items value={[s.claim,s.limit]}/></li>})}</ul>}
export function KatriSolutionDownloads({plan}){return <div className="work-research-downloads" data-katri-downloads={plan.id}><Link download to={plan.downloads.md}>{plan.name} 솔루션·기술·요구사항 MD ↓</Link><Link download to={plan.downloads.json}>업무·근거·측정 명세 JSON ↓</Link><p className="department-note">{expansion.common.downloadLabel}</p></div>}
export function KatriSolutionPlan({plan,topicId}){
 const r=plan,c=expansion.common,id='department-detail-'+topicId;
 return <div className="department-briefing katri-solution-plan" data-department-briefing={topicId} data-katri-solution={r.id} data-work-researched={r.key} data-detail-kind="candidate">
  <section id={id+'-scope'} tabIndex={-1}><h3>{r.title}</h3><p className="department-note">{expansion.date} · {r.id} · {c.status}</p>
   <Fields rows={[["목적 · 얻어야 할 편익",r.purpose],["목표 · 달라질 업무 상태",r.goal],["수단 · 적용 기술",'기구축 AI 플랫폼 + NOA 업무 스킬 + aRDa 근거·판본 연결 + 기존 원장/전문 도구 + 담당자 판단. 조건–증거 대사에 Grantee 후보 검증'],["초기 적용범위",r.scope],["공통 편성 묶음",r.bundle+' · 독립 플랫폼 신설보다 공통 엔진과 처별 추가 작업의 결합']]}/>
   <nav className="katri-local-jump" aria-label={r.name+' 솔루션 본문 목차'}>{[['basis','왜 필요한가·근거'],['inputs','업무별 솔루션'],['how','기술 HOW·흐름'],['metrics','개선효과·측정'],['conditions','환경·요구사항']].map(([key,title])=><a key={key} href={'#'+id+'-'+key}>{title}</a>)}</nav>
  </section>
  <section id={id+'-basis'} tabIndex={-1}><h3>왜 필요한가 · 현행 기반 · 추가 해결범위</h3>
   <Fields rows={[["공식 업무·기존 기반",r.existing],["검증할 현행 한계",r.problem],["추가 개발의 초점",r.extension],["기존·비AI 대안",'기존 시스템의 필수항목 검사·체크리스트·정형 대사 기능과 먼저 비교. AI의 문서 의미·관계·변경 영향 검토가 추가로 줄이는 누락·반복 보완·확인 부담을 측정'],["적용 판단",c.promotion]]}/>
   <h4>업무·절차를 뒷받침하는 출처</h4><p className="department-note">출처는 공개 업무·절차·기존 기능의 근거. 위 한계·솔루션·효과는 추가 검증할 기획안이며 현재 문제의 발생률을 입증한 자료와 구분</p><Sources ids={r.sourceIds}/>
  </section>
  <section id={id+'-inputs'} tabIndex={-1}><h3>담당업무별 솔루션 · 처리자료 · 만들어야 할 결과</h3><p className="department-note">현재 공개자료에서 정리한 업무목록 전체를 아래 하위 기능에 연결. 첫 적용은 한 개 업무로 제한하고, 같은 처의 나머지 업무는 검증 후 순차 확대</p>
   <ol className="department-job-list">{r.jobMappings.map((j,i)=><li key={j.id} data-researched-job={i}><h4>{String(i+1).padStart(2,'0')}. {j.name}</h4><Fields rows={[["입력·현행 처리 분석",[j.input,j.current]],["제공할 솔루션 결과",j.output],["근거·수행 책임",j.sourceIds.join(' / ')+' · '+j.evidenceScope]]}/></li>)}</ol>
   <h4>처별 데이터 연결 항목</h4><Items value={r.fields}/><p className="department-note">연결 항목은 설계안. 실제 DB 컬럼·식별키·원자료 제공·API가 확인됐다는 의미와 구분</p>
  </section>
  <section id={id+'-how'} tabIndex={-1}><h3>기술 HOW · 처음부터 결과 확인까지</h3><Fields rows={[["CCK·기존 시스템 역할",c.products.map(([name,role])=>name+' · '+role)],["해당 처의 연결방식",r.interface],["새로 개발할 증분",r.extension]]}/><h4>스키마·근거 검색·NOA 스킬·도구·검증의 구현방법</h4><Fields rows={c.technical}/>
   <div id={'diagram-'+r.id+'-overall'} tabIndex={-1} className="katri-architecture" data-katri-architecture={r.id}><h4>전체 실행 구성</h4><div className="katri-architecture-row"><div><strong>업무 시작 · 해당 처</strong><Items value={[r.name+'의 요청·변경·검토 대상',r.fields[0],r.fields[1]]}/></div><div><strong>기구축 TS AI 플랫폼</strong><Items value={['기존 인증·자료 접근정책','NOA의 해당 처 업무 스킬','aRDa의 원문·판본·근거 연결','규칙/전문 도구 및 Grantee 대사 후보']}/></div><div><strong>전문 확인 · 기존 원장</strong><Items value={[r.stages[3][3],r.stages[4][3],'기존 공식 결과 재조회·담당자 확인']}/></div></div><p className="department-note">새 회신·시험·공식 결과에 따른 미해결 항목 재검토와 다음 과업 조정. 전문 시험·승인·지급·허가의 최종 판단은 실제 권한자 담당</p></div>
   <h4>서비스·데이터의 단계별 흐름</h4><ol className="department-step-list">{r.stages.map(([title,input,operation,output],i)=><li key={title} data-katri-stage={i}><h4><span>{String(i+1).padStart(2,'0')}</span>{title}</h4>{r.id==='KT-VC-01'&&<p className="department-note">{r.stageScopes[i]}</p>}<Fields rows={[["입력·이전 결과",input],["처리·실행 주체",operation],["산출·다음 인계",output]]}/></li>)}</ol>
   <h4>원자료 → 판단자료 → 확정 결과의 데이터 흐름</h4><div className="katri-data-flow"><div><strong>원자료·근거</strong><Items value={[r.fields.join(' / '),'자료ID·원문 위치·판본·효력·이용조건']}/></div><div><strong>검토·확인 과업</strong><Items value={[r.outputs[0],'사실·상충·가설·추가 자료·전문검증 구분']}/></div><div><strong>확정·후속 반영</strong><Items value={[r.stages[4][3],'담당자 확인·기존 원장 결과·후속 수신 연결']}/></div></div>
  </section>
  <section id={id+'-completion'} tabIndex={-1}><h3>전문 판단 · 완료조건 · 개인정보 처리</h3><Fields rows={[["책임·업무 경계",r.boundary],["완료 확인",[r.stages[3][3],r.stages[4][3],'해당 업무에 필요한 자료 작성·전문 검토·실제 시험·공식 승인·원장 반영·후속 수신의 각각 확인']],["보완·예외 처리",'빠진 자료는 필요한 자료·담당·기한과 함께 보완. 서로 다른 판본·상충 자료는 전문가 확인. 조회 실패·회신 전에는 확인 가능한 범위만 표시하고 다음 단계 확정 보류'],["개인정보·기밀·제공",r.privacy]]}/></section>
  <section id={id+'-metrics'} tabIndex={-1}><h3>정량적 개선효과 · 측정 설계 3개</h3><p className="department-note">{c.measurement}</p>{r.metrics.map((m,i)=><section className="department-metric" key={m.id} data-katri-metric={m.id}><h4>{i+1}. {m.name}</h4><Fields rows={[["측정식·분모",m.formula],["원기록",m.records],["비교·해석",'현행·규칙 개선·AI 추가기능의 동일 사례 비교. 사건 유형·자료량·변경 난이도 층화, 필요한 새 시험과 자료 준비 부족 분리, 오탐·미탐 및 실제 작업/외부 대기시간 별도 보고'],["담당·현재 값",[m.owner,'기준선 미측정 · 수치 목표 미확정 · 실측 개선효과 미확인']]]}/></section>)}</section>
  <section id={id+'-conditions'} tabIndex={-1}><div id={'engineering-'+r.id} tabIndex={-1}><h3>요구환경 · 요구사항 · 인수 · 대가산정</h3><Fields rows={[["필요한 환경",c.environment],["인터페이스 범위",r.interface],["공통·증분 대가",c.cost],["처별 추가 산정단위",[r.extension,'문서 유형/분량·규칙/스킬·연계 수·권한 역할·평가 사례·전문 검수·교육/운영 인수 범위 확보 후 FP/MM 산정. 현재 FP·MM·금액 미산정']]]}/>
   {r.requirements.map(f=><section className="department-probe" key={f.id} data-katri-requirement={f.id}><h4>{f.id} · {f.name}</h4><Fields rows={[["기능 요구",f.description],["이 처의 산출물",f.output],["인수 검증",f.acceptance]]}/></section>)}
   <h4>실제 개발 전 검증할 사례</h4><Items value={[r.scenario,...r.tests]}/><p className="department-note">위 사례·시험은 설계안. NOA·aRDa·Grantee 및 TS 업무시스템의 실제 기능시험 수행 결과와 구분</p>
   <h4>적용 순서</h4><ol>{c.phase.map(step=><li key={step}>{step}</li>)}</ol></div>
  </section>
  <section id={id+'-questions'} tabIndex={-1}><h3>현업 확인 · 추가 조사 · 확대조건</h3><Fields rows={[["이 처의 확인 질문",r.ask],["필요한 증빙",'최근 종료한 정상·보완·변경 사례의 비식별 원문, 기존 시스템 화면/규칙, 담당자 처리기록, 승인·결과·후속 인계, 자료 이용권·연계 가능범위'],["편성 결정에 필요한 답",'남은 문제의 실제 발생 여부·기존 기능 차이·규칙 대안 대비 AI 추가 가치·안전/권한/인수 가능성. 실제 외부 현업 피드백 미수령']]}/>
   {expansion.expandedResearch.filter(x=>x.department.includes(r.name)).map(x=><section className="department-probe" key={x.id}><h4>{x.title}</h4><Fields rows={[["추가 확인한 업무",x.finding],["확대 후보",x.candidate],["적용 한계",x.limit]]}/><Sources ids={x.sourceIds}/></section>)}
   <details className="department-reference-detail"><summary>다른 협업기관까지의 추가 확대 조사 4항목</summary>{expansion.expandedResearch.map(x=><section key={x.id}><h4>{x.title} · {x.department}</h4><Items value={[x.finding,x.candidate,x.limit]}/><Sources ids={x.sourceIds}/></section>)}</details>
   <KatriSolutionDownloads plan={r}/>
  </section>
 </div>;
}
