import {AnalysisDisposition} from './AnalysisReview.jsx';
import analysis from './analysis-review.cjs';
import {DrtRelated} from './DrtAssurance.jsx';
import {DepartmentDocuments} from './DepartmentDocuments.jsx';
import isp from './isp-review.cjs';
import React,{useState}from'react';
import{Link,Out,href}from'./core.jsx';
import revision from'./revision47.cjs';
import composition from'./proposal-composition.cjs';
import './revision47.css';
import {ProposalIntent} from './ProposalIntent.jsx';
import intent from './proposal-intent.cjs';
import {Delivery47} from './Delivery47.jsx';
import {Advanced47} from './Advanced47.jsx';
import {GeneratedDiagram47} from './GeneratedDiagram47.jsx';
import {DetailedDiagram47} from './DetailedDiagram47.jsx';
import {SeniorAssessment} from './SeniorAssessment.jsx';
const {get,chapters}=revision;
function List({items}){return <ul>{items.map((x,i)=><li key={i}>{x}</li>)}</ul>}
function Table({title,headers,rows}){return <div className="r47-table"><table><caption>{title}</caption><thead><tr>{headers.map(x=><th key={x} scope="col">{x}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{r.map((x,j)=><td data-label={headers[j]} key={j}>{x}</td>)}</tr>)}</tbody></table></div>}
function Part({id,children}){const c=composition.chapters.find(c=>c.id===id),i=composition.chapters.indexOf(c);return <section className="r47-part reading-chapter" id={'section-r47-'+id} data-section-id={'r47-'+id}><header><span>{String(i+1).padStart(2,'0')}</span><div><h2 tabIndex={-1} id={'heading-r47-'+id}>{c.title}</h2><p>{c.intro}</p></div></header>{children}</section>}
function Block({id,children}){const b=composition.blockById[id];return <section className="r47-detail-block" id={'section-r47-block-'+id}><header><h3 tabIndex={-1} id={'heading-r47-block-'+id}>{b.title}</h3><p>{b.lead}</p></header><div className="r47-block-body">{children}</div></section>}
function Source({s}){return <div className="r47-source"><Out url={s.url}>{s.id} · {s.title}</Out><small>{s.source_level==='2차'?'보도 인용 · ':''}{s.grade} / {s.source_level} · {s.published||'게시일 미표시'} · 원장 열람일 {s.accessed}</small><p>근거 위치: {s.locator||'세부 위치 미등록'}</p></div>}
export function CommonFinding47(){return <aside className="r47-common"><span>2026-09-25 · 추가 근거 반영</span><h2>{revision.common.title}</h2><p>{revision.common.text}</p><p className="r47-note">{revision.common.limit}</p><Link to="updates.html?view=evidence47">처별 공개 근거와 검토 결과 보기 →</Link></aside>}
export function Metrics47({code}){const r=get(code),p=r.detail;return <><p className="r47-baseline"><b>기준선 확보 경로</b>{r.baseline}</p><p className="r47-note">수치 목표: 기준선 확보 전 목표값 미설정. 아래 {p.metrics.length}개는 측정 설계안이며 실제 개선 실적·성능 보장이 아님. 이전 E01~E03과 개념이 달라진 지표는 R01~R03으로 별도 관리.</p>{p.metrics.map((m,i)=><article className="r47-metric" id={'r47-'+code+'-R0'+(i+1)} key={m[0]}><span>{code}-R0{i+1} · {i===0?'주 평가 후보':'보조 평가 후보'}</span><h3>{m[0]}</h3><dl><div><dt>무엇을 세는가</dt><dd>{m[1]}</dd></div><div><dt>원천 증빙</dt><dd>{m[2]}</dd></div><div><dt>집계·해석 조건</dt><dd>{m[3]}</dd></div><div><dt>관측단위·기간</dt><dd>{p.unit}. 실제 적용 전 기준기간·추적종료일·기한 도래 집단을 확정하고 동일 조건으로 전후 수집.</dd></div><div><dt>검수·확정</dt><dd>현업이 원천 기록 확인, 독립 평가자가 표본 재판정, 평가책임자가 분모·결측·집계 코드·변경 이유 확인 후 결과 확정.</dd></div></dl></article>)}<Table title="효과를 사업 가치로 해석하는 기준" headers={['구분','계산·판정 방법','주의사항']} rows={[
['비율 개선','전후 또는 비교군 간 %p 차이와 상대비율을 별도 산출','분자·분모·관측 종료일 고정. 미확인을 성공이나 정상으로 대입 금지'],
['시간 개선','경과시간 중앙값·P90, 참여자 활동시간과 재작업 시간 함께 보고','미완료 사건 수·대기 사유 병기. 완료 사건만 비교한 결과는 제한된 기술통계'],
['AI 추가 기여','같은 자료·인력·기간의 현행 A, 규칙/SI B, B+NOA C 비교','B와 C 차이로 추가 기여 평가. 비교조건 미충족 시 관찰 결과로 제한'],
['연간 업무 편익','유효 대상 건수 × 사건당 검수 포함 활동시간 차이','발생량과 적용률 실측 후 산정. 인원 감축·사업비 절감액으로 바로 환산하지 않음'],
['안전·권리 품질','중요 누락·잘못된 근거·권한 밖 열람·오통보를 별도 집계','효율이 개선되어도 사전 합의한 품질 기준 위반 시 확대 보류'],
['불확실성','독립 사건·회사·장치의 군집을 반영한 구간과 결측 민감도 분석','필요 표본은 실제 분산·발생률·최소 의미 개선폭으로 산정. 근거 없는 고정 표본 수 금지']
]}/></>}
function PriorDiagram({code,type,title}){if(code==='CL'&&type==='data')return <DetailedDiagram47 code={code} type={type}/>;if(['concept','overall','service'].includes(type))return <GeneratedDiagram47 code={code} type={type}/>;return <figure className="r47-diagram"><a href={href('downloads/revision47/'+code+'_'+type+'.svg')} target="_blank" rel="noopener noreferrer" aria-label={title+' 원본 확대'}><img loading="lazy" src={href('downloads/revision47/'+code+'_'+type+'.svg')} alt={title+' · '+get(code).title}/></a><figcaption>{title} · 클릭 시 원본 확대 · 상세 설계안</figcaption></figure>}
function Diagram({code,type,title}){return <details className="diagram-history"><summary>이전 도식 · {title}</summary><PriorDiagram code={code} type={type} title={title}/></details>}
export function Proposal47({code,embedded=false}){const r=get(code);if(!r)return null;const p=r.detail,framing=intent.byId[code+'-01'];return <div className="revision47" data-revision-department={code}>
<header className="r47-hero"><span className="r47-badge">현재 ISP: 조사 후보 · {isp.date}</span><p className="r47-note">이전 편성 검토: {r.currentReview.status} · {r.currentReview.date}. 현재 사업 선정·발주 미확정.</p><h2>{r.title}</h2><dl className="r47-executive">{[['검토 대상',p.unit],['직접 사용자',p.users],['업무 시작 조건',p.trigger],['이번 목표 상태',framing.completion]].map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><div className="r47-visual-shortcuts" aria-label="최신 4종 도식"><a href={'#diagram-'+code+'-01-overall'}><b>01 전체 아키텍처</b><span>CCK 제품 · 기존 플랫폼 · 공식 결과</span></a><a href={'#diagram-'+code+'-01-service'}><b>02 서비스 흐름도</b><span>역할 · 판단 · 보완 · 완료</span></a><a href={'#diagram-'+code+'-01-data'}><b>03 데이터 흐름도</b><span>원문 · 근거 · 개인정보 · 결과 대사</span></a><a href={'#diagram-'+code+'-01-environment'}><b>04 요구환경 정의</b><span>기존 서버 · 권한 · 연계 · 복구</span></a></div><nav aria-label="최신 상세 제안 목차">{chapters.map(([id,title],i)=><a key={id} href={'#section-r47-'+id}>{i+1}. {title}</a>)}</nav></header>
<ProposalIntent projectId={code+'-01'}/>{!embedded&&<DepartmentDocuments code={code}/>}
{code==='QE'&&<><p className="r47-note"><a href="#section-qe-health-review">추가 검토 · 고령 운수종사자의 기능평가·의료근거 연계와 변별력 검증 ↓</a></p><SeniorAssessment/></>}
{['MR','PS'].includes(code)&&<DrtRelated/>}
<Part id="context"><Block id="definition"><AnalysisDisposition code={code}/>
<p className="r47-lead">{r.oneLine}</p>{p.why.map(t=><p key={t}>{t}</p>)}
<Table title="육하원칙 기반 사업 정의" headers={['질문','이번 제안의 구체 범위']} rows={[
['누가','주관 검토: '+r.name+' / 사용자: '+p.users+' / 실제 직제·전결·협업 역할은 현업 대조 대상'],
['누구를 위해',framing.purpose],['무엇을',p.unit],['언제',p.trigger],['어디서','TS 기존 로컬 서버의 제한 업무공간, 승인된 기존 시스템·자료 연계'],['달성할 결과',framing.completion],['어떻게',framing.means.noa+' / 기존 처리: '+framing.means.rules]
]}/></Block>
</Part>
<Part id="change"><Block id="evidence">
{r.facts.map((f,i)=><article className="r47-fact" key={i}><span>{f.role} · {f.review}</span><p>{f.text}</p>{f.sources.map(s=><Source key={s.id} s={s}/>)}</article>)}
<aside className="r47-caution"><b>해석의 경계</b><p>{p.boundary}</p><p>등급은 제공 원장의 판정. ‘CONFIRMED’도 현재 TS의 미해결 문제 규모나 AI 효과까지 입증하지 않음. 이번 표시 검토에서 발견한 판본·인용 범위 문제는 위 문구에 반영.</p></aside>
<p className="r47-note">원장상 근거 {r.evidenceCount.total}건 · 공개 입력 {revision.data.evidence.filter(e=>e.dept===code).length}건 · 전체 원문을 이번 작업에서 재검증한 수와 구분.</p><Link to={'updates.html?view=evidence47&dept='+code}>이 처의 공개 근거 전체 확인 →</Link>
</Block>
<Block id="concept">
<p className="r47-note">{analysis.documentNote} 기존 도식은 적용 검증 전 설계안이며 현재 보류·축소 조건을 먼저 적용.</p><p>도입 단위: <b>{r.title} 모듈</b>. 기존 시스템의 공식 기록과 판단 절차를 활용하고, {p.unit}을 연결하는 업무별 설정·연계·검증 기능 추가.</p>
<Diagram code={code} type="concept" title="사업 논리도 · 문제에서 기대편익까지"/>
<div className="r47-grid"><article><h3>입력자료 · 필요한 사실</h3><List items={p.inputs}/></article><article><h3>완료 산출물 · 담당자가 받는 결과</h3><List items={p.outputs}/></article></div>
</Block>
<Block id="products"><details className="diagram-history"><summary>이전 공통 제품 구성·납품 명세</summary><Table title="제품·추가 개발·기존 시스템의 역할" headers={['구성','맡길 일','구현 확인·납품 범위']} rows={[
['NOA · 로컬 LLM','문서 의미 이해, 확인질문 구성, 근거 대조, 새 결과에 따른 과업 갱신','업무별 스킬·프롬프트·평가셋·계획 상태와 도구 사용 범위 구성. 실제 배포본에서 재사용·추가 구현 구분'],
['aRDa 연계 후보','원문·판본·문서 권한·조직지식 연결','원문 저장·버전·권한 API의 실제 제공범위 확인. 미확인 기능을 보유 확정으로 계산하지 않음'],
['규칙·통계·계산도구','정확한 수치 계산, 상태·기한 검증, 비교조건 보정','업무 기준과 테스트 사례를 코드화. LLM이 임의 계산한 값을 공식 결과로 쓰지 않음'],
['연계 어댑터·기존 업무시스템','공식 상태 조회, 허용된 요청 등록, 실제 결과 확인','조회·변경 권한 분리, 멱등키·응답 대사·오류 복구 구현. ERP는 해당 업무 필요성이 확인될 때만 연결'],
['담당자 검토 화면','원문 근거·제안·불확실성·수정 이유를 한 사건에서 검토','확정·보완·판단유보·재확인·종결 상태 및 인수기준 구현']
]}/><p className="r47-note">제품 설명은 공급사 기능 소개이며 TS 적용 성능의 독립 입증과 구분. 기관별 과업 계획·재계획·연계 실행은 위 납품 범위에서 확인할 설계안.</p><Out url="https://www.ccksolution.com/noa">CCK NOA 공식 제품 소개</Out>
</details></Block>
</Part>
<Part id="service"><Block id="journey">
<Diagram code={code} type="service" title="서비스 흐름 · 사용자·AI·담당자의 역할"/>
<div className="r47-case"><h3>가상 업무 사례 · 사실 사례와 구분</h3><p>{p.scenario}</p></div>
</Block>
<Block id="process"><p className="r47-note">아래 표는 기존 상세설계의 적용 후보. 초기 편성은 최신 ISP의 범위 확인 결과를 따르며, 기관 간 전달·후속 관측·추가 도구는 실제 권한·원 기록·잔여 수요 확인 후 선택 적용. 표·도식의 존재를 확정 납품범위로 사용하지 않음.</p><Table title="단계별 구체 처리 명세" headers={['단계','입력','처리 방법','출력']} rows={p.steps}/>
</Block>
<Block id="state"><Table title="처리 상태와 다음 행동" headers={['상태','완료 증거','다음 처리']} rows={[
['접수·범위 확인',p.trigger+'의 원문 및 사건 식별','자료·권한·대상 범위 확인 후 검토 시작'],
['근거 검토·계획안',p.outputs[0]+'와 연결된 원문 위치','누락·상충 시 보완 대기. 확인 불가를 부적합으로 변환하지 않음'],
['담당자 판단',r.humanDecision,'공식 권한자 확정 내용과 계획판본을 연결'],
['허용 범위 실행','승인된 대상·수신자·행위·인자와 유효 권한','요청 성공과 원천 시스템의 실제 반영 성공을 구분'],
['결과 확인·종결',p.outputs.at(-1)+' 및 공식 결과 참조','미확인·부분 완료면 잔여 과업 갱신. 원 판단·변경이력 보존']
]}/><h3>오류·변경 시의 처리</h3><List items={['동일 사건 중복 수신: 원문 해시·대상·이벤트 식별로 중복 후보 분리 후 대조','기준·입력 변경: 영향받는 계획과 승인을 보류하고 필요한 항목만 재검토','외부 응답 유실: 결과 미확인 상태 유지, 원천 조회로 실제 반영 여부 확인 후 재시도 결정','AI 근거 불일치: 공식 원문 확인과 담당자 정정으로 복구, 수정 사유를 평가셋에 반영']}/>
</Block>
</Part>
<Part id="design"><Block id="overall">


<Diagram code={code} type="overall" title="전체 아키텍처 · 화면·실행·지식·도구·원천"/>
<Table title="구성요소·책임·운영 경계" headers={['계층','세부 구성','책임과 완료조건']} rows={[
['사용자·검토','접수자료·사건목록·근거대조·승인·결과확인 화면',p.users+'의 역할별 접근 분리'],
['업무 수행','사건 상태기계·계획판본·과업큐·검증기·재계획',p.steps.map(s=>s[0]).join(' → ')],
['지식·추론','원문 구조화·문단/표 위치·검색 권한·기준 판본·로컬 모델','출처 없는 문장은 확정 근거로 사용하지 않음'],
['계산·연계','검증된 규칙/계산기·API 어댑터·수신대사·멱등 처리','요청과 반영 결과를 연결하고 오류 상태 보존'],
['운영·평가','권한·승인·감사기록·품질평가·복구·변경관리','기존 서버 여력 확인, 운영 중 모델 자동 재학습 금지']
]}/></Block>
<Block id="data"><Diagram code={code} type="data" title="데이터 흐름 · 원자료부터 공식 결과·성과까지"/>
<Table title="원장·데이터 계약" headers={['저장·교환 대상','필수 필드','기준 기록과 정합성']} rows={[
['원문·증거','source_id, version, hash, locator, access_policy','aRDa 또는 지정 문서 원천. 가공문서와 원문 연결'],
['사건·검토','case_id, object_key, fact, source_ref, uncertainty','사실·추론·미확인 구분, 원천 변경 시 영향표시'],
['계획·승인','plan_version, task_id, approver_ref, action_scope','승인 뒤 변경된 대상·인자에 과거 승인 재사용 금지'],
['실행·응답','action_id, idempotency_key, request, receipt, result_ref','접수·반영·확인 상태 구분. 반복 요청으로 중복 행위 발생 방지'],
['종결·평가','closure_ref, event_time, cohort_id, metric_version','공식 원천 결과 우선. 사건 중복·기간 미도래·결측 분리']
]}/>
</Block>
<Block id="runtime"><details className="diagram-history"><summary>세부 실행·인터페이스·상태 명세</summary><Advanced47 code={code}/></details></Block>
</Part>
<Part id="responsibility"><Block id="privacy">
<p className="r47-lead">{p.privacy}</p><Diagram code={code} type="privacy" title="개인정보 처리 흐름 · 목적·최소화·권한·정정·보존"/>
<Table title="처리 단계별 통제와 증거" headers={['처리 단계','적용 통제','확인 기록']} rows={[
['수집 전','업무 목적·처리근거·항목·제공주체·보유기준 확인','자료별 권한·처리목적 승인표'],
['반입·변환','과다 제출 격리, 직접식별정보 분리, 원문 위치 보존','반입목록·가명키 연결권한·변환 대조'],
['검색·추론','기관·부서·사건·문서별 접근 정책 적용, 필요한 문맥만 로컬 입력','정상/차단 시험·조회이력·모델판본'],
['검토·제공','수신자·제공 목적·허용 항목·승인판본 대조','검수·승인·제공·원천반영 기록'],
['정정·종결','원천 정정 후 파생 색인·보고서 영향 확인','정정 목록·재처리·잔여 사본 상태'],
['보관·파기·복구','업무별 보존근거 적용, 정정·삭제·권한회수의 복구 후 재적용','파기·제한보관·복원 검증기록']
]}/><div className="r47-grid"><article><h3>사람의 공식 결정</h3><p>{r.humanDecision}</p></article><article><h3>이번 솔루션의 제외 범위</h3><p>{r.excluded}</p><p>비전·생체 인식·신규 센서·차량/장치 제어 제외. 개인정보·자료권한이 자동 확보된다는 전제 없음.</p></article></div>
</Block>
</Part>
<Part id="outcomes"><Block id="delivery">
<p>{p.pilot}</p>
<Table title="실제 구축·검수 계획" headers={['과업','주요 산출물','인수 시 확인할 결과']} rows={[
['업무·기준선 확인','정상·보완·변경 사례, 권한표, 원천항목, 기준선 집계','새 대표과제와 실제 업무·자료·사용자가 일치하는지 확인'],
['업무별 모듈 구현','위 처리 단계의 스킬·규칙·상태·화면·어댑터','필수 증거가 없는 상태에서 확정 결과를 만들지 않는지 검증'],
['종단간 시험','정상·권한차단·누락·변경·중복·응답유실 시험기록','담당자 판단과 실제 원천 반영·결과확인이 연결되는지 확인'],
['병행 실증','현행/규칙/AI 비교 기록, 오탐·재작업·접근성 평가','전체 업무부담과 품질을 함께 평가, AI 추가효과 미확인 시 범위 조정'],
['운영 인수','운영 책임·모델/규칙 변경·복구·평가셋·사용자 안내','장애 시 수동 공식 절차 복귀와 재시작·대사 검증']
]}/><p className="r47-note">CCK 주관, 기존 로컬 서버·로컬 LLM 활용 전제. 서버 여력과 실제 제품 재사용 범위를 확인한 후 물량·공수 산정. {r.verdict==='재설계'?'새 과제의 공수는 미산정이며 이전 가설의 공수를 승계하지 않음.':'기존 공수는 이전 가설 기준으로, 이번 추가 범위의 산정 근거와 별도 대조 필요.'}</p>
</Block>
<Block id="requirements"><Delivery47 code={code}/></Block>
<Block id="metrics"><Metrics47 code={code}/></Block>
<nav className="r47-downloads" aria-label="최신 상세기획 내려받기"><Link download to={'downloads/revision47/'+code+'_근거기반_상세제안.md'}>상세 제안 MD ↓</Link><Link download to={'downloads/revision47/'+code+'_근거기반_상세제안.json'}>구조화 명세 JSON ↓</Link><Link to={'updates.html?view=evidence47&dept='+code}>근거 원문 목록 →</Link></nav>
</Part>
</div>}
export function Evidence47(){const q0=new URLSearchParams(location.search);const[dept,setDept]=useState(q0.get('dept')||''),[type,setType]=useState(''),[grade,setGrade]=useState(''),[level,setLevel]=useState(''),[q,setQ]=useState(q0.get('q')||'');const all=revision.data.evidence.map(e=>revision.evidence(e.id)),list=all.filter(e=>(!dept||e.dept===dept)&&(!type||e.type===type)&&(!grade||e.grade===grade)&&(!level||e.source_level===level)&&[e.id,e.title,e.publisher,e.locator].join(' ').toLowerCase().includes(q.toLowerCase()));return <section className="revision47 r47-register"><h1>처별 공개 근거·재검증 제안</h1><CommonFinding47/><p>공개 입력 원장 {all.length}건. 제공된 판정·집계와 이번 사이트 표시 검토를 구분. 원장의 출처 등급은 각 주장의 적용 범위 전체를 보증하는 표시가 아님.</p><div className="r47-filters">{[['처',dept,setDept,Object.keys(revision.data.departments).map(c=>[c,get(c).name])],['유형',type,setType,[...new Set(all.map(e=>e.type))].map(x=>[x,x])],['등급',grade,setGrade,[...new Set(all.map(e=>e.grade))].map(x=>[x,x])],['출처 수준',level,setLevel,[...new Set(all.map(e=>e.source_level))].map(x=>[x,x])]].map(([label,value,set,options])=><label key={label}>{label}<select aria-label={label} value={value} onChange={e=>set(e.target.value)}><option value="">전체</option>{options.map(([v,t])=><option value={v} key={v}>{t}</option>)}</select></label>)}<label>근거 검색<input value={q} onChange={e=>setQ(e.target.value)} placeholder="제목·근거 ID·발행기관"/></label><button onClick={()=>{setDept('');setType('');setGrade('');setLevel('');setQ('')}}>필터 초기화</button></div><p role="status">{list.length}건 표시</p>{!list.length&&<p>일치하는 근거가 없음. 검색어 또는 필터를 조정해 주세요.</p>}{list.map(e=><article className="r47-fact" key={e.id} id={'evidence-'+e.id}><Source s={e}/><p>{e.dept} · {e.type} · 발행: {e.publisher}</p><p className="r47-note">{e.note||'추가 비고 미등록'} · 원문 인용 범위와 현행 판본 확인 후 사용</p></article>)}<Link download to="downloads/revision47/공개근거원장.json">공개 근거 원장 JSON ↓</Link></section>}

export function Catalogue47(){return <section className="revision47 r47-catalogue" aria-label="최신 처별 제안 목록"><CommonFinding47/><p className="r47-lead">처별 법정업무의 어느 판단·조치·결과가 달라져야 하는지부터 검토하는 13개 상세 제안.</p><p>공개 근거가 보여 주는 현황, 확인이 남은 문제, CCK로 구현할 처리, 측정할 효과를 구분. 기준선 확보 전 수치 목표 미설정.</p><div className="r47-catalogue-grid">{Object.keys(revision.data.departments).map(code=>{const r=get(code),framing=intent.byId[code+'-01'];return <article key={code} id={'section-r47-catalog-'+code} data-section-id={'r47-catalog-'+code}><span className="r47-badge">{r.name} · {r.currentReview.status}</span><h2 tabIndex={-1}>{r.title}</h2><h3>목적 · 누구를 위한 편익인가</h3><p>{framing.purpose}</p><h3>목표 · 달성할 결과</h3><p>{framing.completion}</p><List items={framing.goals.map(g=>g.change)}/><h3>수단 · 어떻게 바꾸는가</h3><p>{framing.means.noa}</p><p>{framing.means.rules}</p><h3>필요성 · 확인할 현행 한계</h3><p>{framing.gap}</p><nav><Link to={r.folder+'/01_사업정의.html'}>근거·솔루션·흐름·측정 상세 →</Link><Link to={'updates.html?view=evidence47&dept='+code}>공개 근거 {revision.data.evidence.filter(e=>e.dept===code).length}건 →</Link></nav></article>})}</div></section>}
