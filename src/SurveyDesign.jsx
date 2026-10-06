import React,{useEffect,useRef,useState} from 'react';
import {Link,Out} from './core.jsx';
import d from './survey-design.cjs';
import './survey-design.css';
const p=d.presentation;
const selectedFromHash=()=>d.departments.find(r=>location.hash==='#'+r.anchor)?.id||'';
function Fields({fields}){return <div className="survey-fields">{fields.map(f=><article key={f.id} data-survey-field={f.id}>
 <h5>{f.title}</h5><p className="survey-question">{f.question}</p>
 {f.options.length>0&&<ul className="survey-options">{f.options.map(o=><li key={o.code}>{o.label}</li>)}</ul>}
 <small>{f.id} · {f.type==='single_choice'?'단일선택':f.type==='multiple_choice'?'복수선택':'서술형'} · 선택 작성</small>
 <p className="survey-field-help">{f.help}</p>
 {f.displayIf&&<p className="survey-help">{f.id==='ACTUAL_CASE'?'현재/조건부 발생을 확인한 경우 선택 작성':'AI 추가 적용을 선택한 경우에만 작성'}</p>}
 </article>)}</div>}
function Sources({sources}){return <details className="survey-sources"><summary>출처·확인 범위 ({sources.length}건)</summary><p>{d.sourceNote}</p>{sources.map(s=><p key={s.id+'-'+s.url}><b>{s.id} · </b>{s.url?<Out url={s.url}>{s.title}</Out>:s.title}<small>게시/시행 {s.published||s.effective||'미표시'} · 기존 확인 {s.checkedAt||s.accessed||s.date||'미확인'} · {s.limit||s.verification_scope||s.note||s.scope||'기존 원장 확인범위 참조'}</small></p>)}</details>}
export function SurveyDesign({standalone=false}){
 const [selected,setSelected]=useState(selectedFromHash),selectedRef=useRef(selected),current=d.departments.find(r=>r.id===selected);
 useEffect(()=>{if(!Object.hasOwn(history.state||{},'surveyDepartment'))history.replaceState({...history.state,surveyDepartment:selectedFromHash()},'',location.href);let first,second;function reveal(){const id=selectedFromHash()||(Object.hasOwn(history.state||{},'surveyDepartment')?history.state.surveyDepartment:selectedRef.current);selectedRef.current=id;setSelected(id);if(history.state?.surveyDepartment!==id)history.replaceState({...history.state,surveyDepartment:id},'',location.href);cancelAnimationFrame(first);cancelAnimationFrame(second);first=requestAnimationFrame(()=>{second=requestAnimationFrame(()=>{const target=document.getElementById(location.hash.slice(1));if(!target||!target.closest('#implementation-survey-design'))return;for(let el=target.parentElement;el;el=el.parentElement)if(el.tagName==='DETAILS')el.open=true;target.scrollIntoView({block:'start'});target.focus({preventScroll:true})})})}reveal();addEventListener('hashchange',reveal);addEventListener('popstate',reveal);return()=>{cancelAnimationFrame(first);cancelAnimationFrame(second);removeEventListener('hashchange',reveal);removeEventListener('popstate',reveal)}},[]);
 function choose(id){selectedRef.current=id;setSelected(id);location.hash=id?d.departments.find(r=>r.id===id).anchor:'survey-departments';history.replaceState({...history.state,surveyDepartment:id},'',location.href);}
 const parents=[...new Set(d.departments.map(r=>r.parent))],Title=standalone?'h1':'h5';
 return <section id="implementation-survey-design" className={'survey-design'+(standalone?' survey-standalone':'')} data-survey-version={d.version} tabIndex={-1}>
 <header><small>{d.date} · {d.version} · 2027년 후속사업 의견 수렴</small><Title>{p.title}</Title><p>{p.lead}</p><p className="survey-preview-note">{p.previewNote}</p></header>
 <nav className="survey-jumps" aria-label="설문 구성">{p.navigation.map(([id,title],index)=><a href={'#'+id} key={id}><span>0{index+1}</span>{title}</a>)}</nav>
 <section id="survey-intro" className="survey-stage" tabIndex={-1}><h2><span>01</span>현재 프로젝트와 NOA·AX 확대 설명</h2>
 {d.intro.map(b=><article className="survey-intro-block" data-survey-intro={b.id} key={b.id}><h3>{b.title}</h3><p>{b.text}</p><small>{b.status}</small><p className="survey-help">{b.note}{b.source&&' · '+b.source}</p></article>)}
 <details className="survey-reference"><summary>제품별 역할·서두 근거 확인</summary><dl className="survey-products">{d.products.map(([name,role,status])=><div key={name}><dt>{name}</dt><dd>{role}<small>{status}</small></dd></div>)}</dl><Sources sources={d.introSources}/></details>
 <p><Link to={d.downloads[0][1]} download>서두 설명문 내려받기 ↓</Link></p></section>
 <section id="survey-departments" className="survey-stage" tabIndex={-1}><h2><span>02</span>내 처의 병목과 질문</h2><p>{p.selectionNote}</p>
 <div className="survey-picker"><label htmlFor="survey-department-select">담당 처</label><select id="survey-department-select" value={selected} onChange={e=>choose(e.target.value)} aria-describedby="survey-selection-status"><option value="">담당 처를 선택해 주세요</option>{parents.map(parent=><optgroup key={parent} label={parent}>{d.departments.filter(r=>r.parent===parent).map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</optgroup>)}</select><p id="survey-selection-status" role="status">{current?current.name+' · '+current.topics.length+'개 주제 · '+current.mode:'선택한 처 없음 · 서두와 별도 의견은 먼저 확인 가능'}</p></div>
 <details className="survey-directory-details"><summary>전체 51처 목록에서 찾기</summary><p>{p.scopeNote}</p><ul className="survey-directory">{d.departments.map(r=><li key={r.id}><a href={'#'+r.anchor}>{r.name}<small>{r.parent}</small></a></li>)}</ul></details>
 {!current&&<p className="survey-empty">처를 선택하면 해당 업무의 병목 가설·해결 방향·판단 질문이 이 위치에 표시됩니다.</p>}
 {d.departments.map(r=><section className="survey-department" data-survey-department={r.id} key={r.id} hidden={selected!==r.id}><details open={selected===r.id}><summary>{r.name} <small>{r.mode} · {r.topics.length}개 주제</small></summary><div id={r.anchor} className="survey-department-body" tabIndex={-1}>
 <h3 className="survey-body-title">{r.name} · 병목 검토·추가 의견</h3><p>{r.parent} · 실제 분장·전결 확인 필요. 응답 역할 후보: {r.roles.join(' · ')}</p>
 <p className="survey-primary-downloads"><Link to={r.downloads[0][1]} download>이 처 설문지 v0.2 내려받기 ↓</Link><Link to={r.downloads[2][1]} download>빈 회신 양식 CSV ↓</Link></p>
 <section className="survey-background"><h4>먼저 · 응답 역할과 현재 플랫폼 사용</h4><Fields fields={d.profile}/></section>
 {r.topics.map(t=><article className="survey-topic" data-survey-topic={t.id} key={t.id}><header><small>{t.id} · {t.status}</small><h4>{t.title}</h4></header>
 <div className="survey-case"><h5>검토할 업무와 조사된 병목</h5><dl>{[['목적·필요한 결과',t.purpose],['현재 조사된 병목 가설',t.gap||'현재 제시할 병목 가설 없음. 담당 업무와 문제 유무부터 확인.'],['CCK 기반 해결 방법',t.how||'현행 확인 후 대안 검토. 솔루션을 사전 배정하지 않음.'],['필요한 자료·조건',t.inputs.join(' · ')||'실제 입력·자료·권한 미확인'],['기존 대응·공식 판단 경계',t.boundary]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div>
 {t.metrics.length>0&&<details className="survey-measures"><summary>기대 결과와 측정 방법 확인 ({t.metrics.length}개 지표)</summary><ul>{t.metrics.map(m=><li key={m.name}><strong>{m.name}</strong><p>{m.formula}</p><small>{m.method||m.records||m.note}</small></li>)}</ul><p className="survey-help">기준선·목표값·CCK 적용효과는 실측 전 미확정. 편익과 중요 오류·과잉처리를 함께 확인.</p></details>}
 <Sources sources={t.sources}/>
 <div className="survey-writing"><h5>{t.discovery?'업무·문제 발견 3문항':'이 병목에 대한 판단과 개선 의견'}</h5><p>{p.groupsNote}</p>
 {t.discovery?<Fields fields={d.discovery}/>:p.questionGroups.map(g=><section className={'survey-question-group survey-question-group-'+g.id} key={g.id}><h4>{g.title}</h4><Fields fields={g.fields.map(id=>d.topicFields.find(f=>f.id===id))}/></section>)}
 <details className="survey-reference"><summary>사례를 구체화할 보충 질문 3개</summary><ul>{t.probeQuestions.map(q=><li key={q.id}>{q.id} · {q.question}</li>)}</ul></details></div></article>)}
 <p className="survey-next"><a href="#survey-additional">병목 검토 후 · 별도 의견 5문항으로 이동 ↓</a></p>
 </div></details></section>)}</section>
 <section id="survey-additional" className="survey-stage" tabIndex={-1}><h2><span>03</span>별도 의견 · 현업 불편과 대국민서비스</h2><p>선택한 병목의 타당성이나 AI 적용 찬반과 무관하게 작성할 의견. 누락된 문제·다른 원인·AX 확대 및 제외 범위도 함께 검토.</p>{current&&<p className="survey-selected-context">현재 선택: {current.name} · 이 처 설문지에 아래 5문항 포함</p>}<Fields fields={d.general}/><p className="survey-help">{d.privacy}</p></section>
 <section id="survey-resources" className="survey-stage" tabIndex={-1}><h2><span>04</span>설문지와 참고자료</h2><p>{p.resourcesNote}</p>
 {current&&<div className="survey-resource-current"><h3>{current.name} · 현재 응답용 자료</h3><p className="survey-primary-downloads">{current.downloads.map(([label,to])=><Link key={to} to={to} download>{label} ↓</Link>)}</p><details className="survey-reference"><summary>기존 계획서·이전 인터뷰 v0.1 참고</summary>{current.documentsRoute&&<p><Link to={current.documentsRoute}>기존 한글 계획서 ↗</Link></p>}<p><Link to={'research-library.html?view=planning#implementation-interview-'+current.id}>이전 인터뷰 준비 v0.1 ↗</Link></p></details></div>}
 <details className="survey-reference"><summary>조사 담당자용 · 전체 CSV·JSON·매핑표</summary><p className="analysis-downloads">{d.downloads.map(([label,to])=><Link key={to} to={to} download>{label} ↓</Link>)}</p><p>{d.tool}</p></details>
 <section id="survey-response-model" tabIndex={-1}><details className="survey-reference"><summary>조사 담당자용 · 공통 문항·선택·분기 정의</summary><Fields fields={d.profile}/><Fields fields={d.topicFields}/><dl className="survey-products">{d.branchRules.map(([label,rule])=><div key={label}><dt>{label}</dt><dd>{rule}</dd></div>)}</dl><p>{d.interpretation}</p><p className="survey-help">NONE(근거 미확보), NO_NEED(추가 개선 불필요), UNKNOWN(판단자료 부족)은 해당 복수선택의 다른 항목과 동시 선택하지 않음.</p></details></section>
 <details className="survey-reference"><summary>응답의 해석과 후속사업 문서 반영</summary><p>{d.handoff}</p><p>{d.interpretation}</p></details>
 <p><Link to="research-library.html?view=planning">ISP·업무 묶음·대가·기술 검토로 이동 ↗</Link></p></section>
 </section>;
}
