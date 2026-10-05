import React from 'react';
import {Link,Out} from './core.jsx';
import {DepartmentDownloadLinks} from './DocumentLinks.jsx';
import d from './isp-review.cjs';
import './isp-review.css';
function Fields({rows}){return <dl className="isp-fields">{rows.map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>}
function Table({title,headers,rows}){return <div className="isp-table" role="region" aria-label={title} tabIndex={0}><small>좁은 화면에서는 표를 좌우로 이동하여 전체 항목 확인</small><table><caption>{title}</caption><thead><tr>{headers.map(h=><th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{r.map((v,j)=>j===0?<th key={j} scope="row">{v}</th>:<td key={j}>{v}</td>)}</tr>)}</tbody></table></div>}
function Refs({ids}){return <span className="isp-refs">{ids.map(id=><a key={id} href={'#isp-source-'+id} aria-label={id+' 근거와 적용 한계 확인'}>{id}</a>)}</span>}
function Chapter({id,title,children}){return <section id={id} className="isp-chapter" tabIndex={-1}><h3>{title}</h3>{children}</section>}
export function IspReview(){return <section className="isp-review" id="isp-review" tabIndex={-1} data-isp-review={d.date}>
 <header className="isp-hero"><small>{d.date} · {d.version} · 2027년 사업기획</small><h2>{d.title}</h2><p>{d.lead}</p><p className="isp-note">{d.status}</p><div className="isp-summary"><span><strong>5단계</strong>ISP 공식 구성</span><span><strong>39처 · 42항목</strong>기존 기획 조사 후보</span><span><strong>22개</strong>보안·개인정보·윤리 통제안</span><span><strong>미확정</strong>현업·수행가격·운영 수락</span></div></header>
 <nav className="isp-toc" aria-label="ISP 준비본 목차">{d.navigation.map(([id,title])=><a key={id} href={'#'+id}>{title}</a>)}<a href="#isp-sources">출처·9개 다운로드</a></nav>
 <Chapter id="isp-start" title={d.sections[0][1]}>
  <p className="isp-note">{d.notices.basis}</p><p>{d.scope}</p>
  <h4>기관 임무에서 출발하는 환경분석</h4><Table title="TS 임무·상위전략·재정·기술환경의 2027년 적용" headers={['환경·근거','확인할 대상','이번 기획의 적용']} rows={d.environment.map(([k,a,b,ref])=>[<>{k}<Refs ids={[ref]}/></>,a,b])}/>
  <p className="isp-links"><Link to="about.html">TS의 정의·전략·조직 설명</Link><Link to="legal/mapping.html">법정업무·담당 처·법령 매핑</Link><Link to="skill-pms.html">기구축 플랫폼·스킬 적용안</Link></p>
  <h4>재원·사업 성격에 따라 결정할 공식 경로</h4><p className="isp-note">{d.notices.threshold} <Refs ids={['I02']}/></p><Table title="ISP·ISMP·소규모·예외 경로의 현재 판단" headers={['경로','확인 입력','현재 상태','판정 경계']} rows={d.pathways}/>
  <h4>ISP와 ISMP 선택을 위한 원본 준비도 4문항</h4><p>{d.notices.route}</p><Table title="문서 보유와 실제 요구 확인의 구분" headers={['원본 준비도 질문','현재 확인 수준']} rows={d.readinessQuestions}/>
  <h4>차근차근 진행할 ISP 공식 5단계</h4><ol className="isp-stage-line" aria-label="ISP 단계 순서">{d.phases.map(p=><li key={p.id}><a href={'#isp-phase-'+p.id}><small>{p.id}</small><strong>{p.title}</strong></a></li>)}</ol>
  {d.phases.map(p=><section className="isp-phase" id={'isp-phase-'+p.id} key={p.id} data-isp-phase={p.id} tabIndex={-1}><header><small>{p.id} · {p.status}</small><h5>{p.title}</h5><p>{p.question}</p></header><Fields rows={[["받아야 할 입력",p.input],["수행할 분석",p.work],["만들 산출물",p.outputs.join(' / ')],["종료·다음 단계 조건",p.gate],["책임 후보",p.owner]]}/><p>통제 연결: {p.controls.join(' · ')} <Refs ids={p.refs}/></p></section>)}
 </Chapter>
 <Chapter id="isp-asis" title={d.sections[1][1]}>
  <h4>현재 확인한 사실과 아직 확인하지 못한 현황</h4><div className="isp-facts">{d.facts.map(f=><section key={f.id} data-isp-fact={f.id}><small>{f.id} · {f.type}</small><h5>{f.claim}</h5><Fields rows={[["ISP에서의 사용",f.use],["판단 한계",f.limit],["근거",f.source]]}/><Link to={f.to}>기존 검토·원 자료 연결</Link></section>)}</div>
  <Table title="처별 실제 업무·시스템·데이터 현황분석 범위" headers={['영역','흐름·확인 범위','현재 상태·결손','다음 증거']} rows={d.asis}/>
  <h4>최근 업무 한 건으로 흐름·원인·완료를 확인</h4><p>정상·보완·변경 사례의 설명·규정·실기록을 대조하는 방식. 실제 자료와 합성 시험자료, 담당자 활동시간과 외부 대기시간의 구분. 아직 요청을 보내거나 실제 사례를 입력한 상태가 아닌 조사 준비본.</p><Table title="업무 사건카드의 기록 항목" headers={['기록 영역','작성할 내용']} rows={d.caseFields}/>
  <h4>AI 필요성을 입증할 현행·정형·NOA 비교</h4><div className="isp-alternatives">{d.alternatives.map(a=><section key={a.id} data-isp-alternative={a.id}><small>대안 {a.id}</small><h5>{a.title}</h5><Fields rows={[["처리 방법",a.how],["편익 가설",a.benefit],["총비용 범위",a.cost],["선택 전 확인",a.limit]]}/></section>)}</div>
  <p className="isp-note">{d.notices.decision}</p><h4>최대 5개 효과지표 · 기준선과 목표값은 실측 후 확정</h4><div className="isp-metrics">{d.metrics.map(k=><section key={k.id} data-isp-metric={k.id}><h5>{k.id} · {k.name}</h5><Fields rows={[["산식",k.formula],["필요 데이터",k.data],["측정·비교",k.method],["해석 경계",k.boundary]]}/></section>)}</div>
  <h4>TS·CCK·기존 시스템에 확인할 14개 질문</h4><p className="isp-note">{d.feedback}</p><Table title="미발송 자료요청·현업 확인 질문서" headers={['질문·확인 대상','질문','필요 증빙','상태']} rows={d.intake.map(q=>[q.id+' · '+q.owner,q.question,q.evidence,q.status])}/>
 </Chapter>
 <Chapter id="isp-assurance" title={d.sections[2][1]}>
  <p className="isp-note">{d.notices.controls}</p><p>{d.notices.lawRefresh}</p>
  <h4>법적 의무·조건부 적용·노력 규정·설계 제안의 구분</h4><Table title="보안·개인정보·AI 법제 적용 판정과 RFP 추적" headers={['법·제도와 근거','성격·조건','판정할 입력','작성 증거·추적']} rows={d.legal.map(([id,nature,input,output,trace,refs])=>[<>{id}<Refs ids={refs}/></>,nature,input,<>{output}<small className="isp-trace">{trace}</small></>])}/>
  <h4>2026.10.01 공공부문 AI 윤리 최종 기준의 6가치</h4><p>{d.notices.ethics} <Refs ids={['I09']}/></p><Table title="공식 핵심가치와 TS 통제·평가 적용안" headers={['공식 핵심가치','업무별 적용안','통제 후보']} rows={d.ethicsValues}/>
  <h4>전체 구성·실행 책임 아키텍처</h4><p className="isp-note">기구축 플랫폼을 확장하는 목표모델 후보. 실제 제품 build·허용 API·기관 승인 확인 전 상태. NOA 계획과 독립 권한검사를 분리하고, 공식 원장·검증된 계산·최적화 도구의 역할 유지.</p>
  <figure className="isp-architecture" aria-label="6계층의 업무 계획·독립 통제·자료·연계·운영 구성"><figcaption>기존 로컬 서버 · 공통 플랫폼 확장 / 기관·사건·행위 경계</figcaption>{d.architecture.map(([layer,components,responsibility,boundary],i)=><div key={layer} data-isp-layer={i+1}><strong>{layer}</strong><p>{components}</p><span>{responsibility}</span><small>{boundary}</small></div>)}</figure>
  <h4>개인정보·데이터의 수집부터 삭제·복구까지</h4><ol className="isp-data-flow" aria-label="데이터 및 개인정보 처리 흐름">{d.lifecycle.map(([stage,flow,control,protection])=><li key={stage} data-isp-lifecycle={stage.slice(0,2)}><strong>{stage}</strong><p>{flow}</p><span>{protection}</span><small>{control}</small></li>)}</ol>
  {['보안','개인정보','AI 윤리'].map(category=><section className="isp-control-group" key={category} aria-label={category+' 통제 요구·시험'}><h4>{category} · 기술 통제·증빙·인수시험</h4><div className="isp-controls">{d.controls.filter(c=>c.category===category).map(c=><section id={'isp-control-'+c.id} key={c.id} data-isp-control={c.id} tabIndex={-1}><header><small>{c.id} · {c.nature}</small><h5>{c.title}</h5></header><Fields rows={[["막아야 할 위험",c.risk],["기술·운영 HOW",c.control],["제출할 증빙",c.output],["검사·인수시험 계획",c.test],["책임 후보",c.owner],["묶음 검토 대상",c.bundles.join(' · ')]]}/><p className="isp-control-state">{c.status}</p><p>후속 RFP 후보: ISP-{c.id} <Refs ids={c.refs}/></p></section>)}</div></section>)}
 </Chapter>
 <Chapter id="isp-delivery" title={d.sections[3][1]}>
  <h4>구현에 들어가기 전 확인할 8개 준비조건</h4><Table title="착수·범위 확정 관문" headers={['조건','필요 증거','현재 상태','책임 후보']} rows={d.readiness}/>
  <h4>순차 수행과 단계별 종료 조건</h4><Table title="ISP 방법론 준비·수행 계획" headers={['단계','수행 작업','현재 상태','종료 조건']} rows={d.stagePlan}/>
  <h4>ISP 투입 역할과 공수·대가의 산정 단위</h4><p className="isp-note">{d.notices.cost} <Refs ids={['I07']}/></p><Table title="인원·기간·가격을 결정할 실제 작업량" headers={['필요 역할','수행 작업','공수 결정 요인','현재 산정']} rows={d.staffing.map(r=>[r.role,r.work,r.driver,r.status])}/>
  <p>확인 업무·자료·협의·설계·검증 수량 → 역할별 WBS·MD/현행 단가·경비 → ISP 기획비 → 별도 구현·운영 대가의 순서. 자료 접근과 검수 부담을 반영하며, 업무시간 절감을 감축 인원으로 환산하지 않는 기준.</p>
  <h4>39개 처의 42개 기획항목 → ISP 조사 → 후속 RFP</h4><p className="isp-note">{d.notices.mapping}</p><p>아래 통제 연결은 위험·적용조건을 검토할 후보. 법적 해당성·수용 조건이 확인된 뒤 목표모델과 RFP로 확정. 기존 한글 자료는 현재 판본 그대로 연결.</p>
  <div className="isp-departments">{d.departments.map(unit=><section className="isp-department" key={unit.code} id={'isp-dept-'+unit.code} data-isp-department={unit.code} tabIndex={-1}><header><small>{unit.code} · {unit.status}</small><h5>{unit.name}</h5></header>{d.mappings.filter(m=>m.code===unit.code).map(m=><div className="isp-mapping" key={m.id} data-isp-mapping={m.id}><h6>{m.id} · {m.title}</h6><p><strong>{m.bundle} 묶음 후보</strong> · {m.status}</p><p>기존 요구 후보: {m.rfpCandidates.join(' · ')}</p><p className="isp-mapped-controls">검토 통제: {m.controls.map(id=><a key={id} href={'#isp-control-'+id}>{id}</a>)}</p><small>{m.readiness} · 후속 보안·윤리 요구 ID: ISP-통제ID</small></div>)}<DepartmentDownloadLinks code={unit.code}/></section>)}</div>
  <h4>공공 RFP로 전환하는 요구사항 추적 구조</h4><p>정책·법령과 문제 → 실제 사례·원인·현재 대응 → 대안·목표 → 업무·데이터·시스템·기술/보안 모델 → 요구 ID → 납품·수락시험 → WBS/기능량·비용 → 발주·검토·운영 인수. CCK 구현 타당성을 검토하되 공개 RFP는 업무 목적·기능·성능·연계·안전·권리·검사 기준으로 작성.</p><p>아래 22개 요구와 기존 13개 묶음 요구는 미확정 후보. 같은 계약의 동일 납품을 다시 산정하지 않으며, 사업별 과업심의·영향평가·보안성 검토 경로는 실제 재원·범위·내규로 확인.</p>
  <Table title="보안·개인정보·윤리 후속 RFP 후보와 인수 기준" headers={['요구ID·통제','납품 증빙','인수시험','현재 상태']} rows={d.followupRfp.map(r=>[<a href={'#isp-control-'+r.controlId}>{r.id}</a>,r.deliverable,r.acceptance,r.status])}/>
  <p className="isp-note">{d.notices.decision}</p><p className="isp-links"><a href="#cost-bundles">기존 공공 RFP 기반 묶음 검토</a><a href="#cost-pricing">기존 대가·비목 대조</a><a href="#implementation-review">이전 실행 가능성 조사</a></p>
 </Chapter>
 <Chapter id="isp-sources" title={d.sections[4][1]}>
  <h4>처별 원본과 분리해 누적한 ISP v0.1 준비본</h4><p>온라인에서 직접 내려받는 MD 4종·CSV 4종·JSON 1종. 사례카드는 빈 양식, 질문서는 미발송·미회신. PC 경로를 사용하지 않는 배포 파일.</p><ul className="isp-downloads">{d.downloads.map(([title,to])=><li key={to}><Link to={to}>{title}</Link></li>)}</ul>
  <h4>공식 출처와 판본·확인 범위</h4>{d.sources.map(s=><section className="isp-source" key={s.id} id={'isp-source-'+s.id} tabIndex={-1}><h5>{s.id} · <Out url={s.url}>{s.title}</Out></h5><Fields rows={[["근거 성격",s.kind],["게시·공포 / 시행",s.published+' / '+(s.effective||'해당 없음 또는 미확인')],["확인일·원문 위치",s.checkedAt+' / '+s.locator],["확인한 내용",s.fact],["사용·검증 한계",s.limit]]}/></section>)}
 </Chapter>
</section>}
