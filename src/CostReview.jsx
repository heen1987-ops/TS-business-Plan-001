import React from 'react';
import {Link,Out} from './core.jsx';
import data from './cost-review.cjs';
import './cost-review.css';
const money=n=>n==null?'미산정':n.toLocaleString('ko-KR')+'원';
function Fields({rows}){return <dl className="analysis-fields">{rows.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
function Table({title,headers,rows}){return <div className="cost-review-table" role="region" aria-label={title} tabIndex={0}><small className="cost-table-hint">좁은 화면에서는 표를 좌우로 이동하여 전체 항목 확인</small><table><caption>{title}</caption><thead><tr>{headers.map(h=><th scope="col" key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((row,i)=><tr key={i}>{row.map((v,j)=>j===0?<th scope="row" key={j}>{v}</th>:<td key={j}>{v}</td>)}</tr>)}</tbody></table></div>}
function Section({id,title,children}){return <section id={id} tabIndex={-1}><h4>{title}</h4>{children}</section>}
function Source({s}){return <section className="cost-review-source" id={'cost-source-'+s.id} tabIndex={-1}><h5>{s.id} · {/^[a-z]+:\/\//i.test(s.url)?<Out url={s.url}>{s.title}</Out>:<Link to={s.url}>{s.title}</Link>}</h5><small>게시 {s.published} · 확인 {s.checkedAt} · {s.locator}</small><Fields rows={[["확인한 근거",s.fact],["사용 한계",s.limit]]}/></section>}
export function CostDepartmentNote({code}){const r=data.records.find(r=>r.code===code);if(!r)return null;const b=data.bundles.filter(b=>r.projects.some(p=>b.projects.includes(p)));return <aside className="cost-department-note" data-cost-department={code}><h3>{data.date} · 실행·비용·묶음 편성 검토</h3><p><strong>{r.verdict}</strong>. 현 v0.5 과업의 수행가격은 미확정.</p><p>기존 v0.3 공급가 {money(r.supply)} / WBS 직접노무비 참고 {money(r.directLabor)} / 차액 {money(r.gap)}. 두 값 모두 설계 가정의 교차 검토이며 합산 대상 아님.</p><p>기능 재사용·협의 배치: {b.map(x=>x.id+' '+x.title).join(' · ')}. 실제 수요·자료·권한 확보 전 전 항목 동시 구축으로 해석 금지.</p><Link to={'research-library.html?view=planning#cost-audit-'+code}>이 처의 원문 대조·가격 판단 확인 ↗</Link>{b.map(x=><p key={x.id}><Link to={'research-library.html?view=planning#cost-bundle-'+x.id}>{x.id} 납품·요구·착수 조건 확인 ↗</Link></p>)}</aside>}
export function CostReview(){return <section className="cost-review" data-cost-review={data.date} id="cost-review" tabIndex={-1}>
 <header><small>{data.date} · {data.version} · 2027년 기획</small><h3>{data.title} · 묶음형 RFP 편성</h3><p>{data.lead}</p><p className="analysis-limit">{data.status}. {data.scope}</p></header>
 <div className="cost-summary">{[[data.counts.arithmeticPassed+' / '+data.counts.documents,'기존 대가 원문 산술 일치'],[data.counts.laborExceeds+' / '+data.counts.documents,'WBS 직접노무 참고치가 공급가 초과'],[data.bundles.length+'개 묶음','공통 필수 + 업무 선택'],['미확정','총사업비·실제 수행가격·경제성']].map(([value,label])=><div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
 <p className="analysis-limit">{data.ui.arithmeticLimit}</p>
 <nav className="cost-jumps" aria-label="실행·비용·묶음 편성 목차">{[['cost-bundles','묶음형 편성'],['cost-feasibility','최소 실행범위'],['cost-audit','39처 비용 대조'],['cost-pricing','대가·비목'],['cost-precedents','공공 RFP 선례'],['cost-next','착수·경제성'],['cost-sources','출처·다운로드']].map(([id,title])=><a href={'#'+id} key={id}>{title}</a>)}</nav>
 <Section id="cost-bundles" title="1. 하나의 통합 발주 검토안 · 공통 필수 + 선택 업무 묶음">
  <p><strong>{data.bundlePlan.name}</strong></p><p>{data.bundlePlan.model}</p><p>{data.bundlePlan.rationale}</p><p className="analysis-limit">{data.bundlePlan.procurementBoundary}</p><p className="analysis-limit">{data.bundlePlan.evidenceLimit} {data.ui.scopeLimit}</p>
  <div className="cost-bundle-overview" aria-label="묶음 간 관계"><div><strong>B00 · 공통 필수</strong><p>근거·판본·권한·계획/실행·검증·오류·인수</p></div><p className="cost-connect">같은 실행 기반과 업무 ID로 연결 ↓</p><div className="cost-bundle-options">{data.bundles.slice(1).map(b=><a key={b.id} href={'#cost-bundle-'+b.id}><strong>{b.id}</strong>{b.title}<small>{b.id==='B04'?'기존 발주 차분 확인 후 선택':'자료 확보되는 최소 업무부터 선택'}</small></a>)}</div></div>
  {data.bundles.map(b=><section className="cost-card" key={b.id} id={'cost-bundle-'+b.id} data-cost-bundle={b.id} tabIndex={-1}><h5>{b.id} · {b.title}</h5><p><strong>{b.status}</strong></p><Fields rows={[["편성 단위",b.role],["업무 주체",b.lead],["우선 실행",b.initial],["납품 결과",b.deliverables],["인수·반례",b.acceptance],["착수 증거",b.entry],["비용 산정",b.cost],["책임·제외 경계",b.boundary]]}/><p>RFP 선례: {b.precedents.map(id=><a key={id} href={'#cost-precedent-'+id}>{id}　</a>)}</p><p><small>배정 {b.projects.length}항목 · 기술 재사용·협의 후보 배치, 확정 납품 수량 아님</small>{b.projects.map(id=><a className="cost-project-link" key={id} href={'#cost-assignment-'+id}>{id}</a>)}</p></section>)}
  <Table title="42개 기획의 단일 편성 위치 · 실제 착수 판단은 별도" headers={['업무·기획','묶음·대표 납품','이전 검토 상태·현재 판단']} rows={data.assignments.map(r=>[<span id={'cost-assignment-'+r.id} data-cost-assignment={r.id}><strong>{r.id} · {r.department}</strong><p>{r.title}</p><Link to={'planning-documents.html#documents-'+r.code}>해당 처 한글·대가 원문 ↗</Link></span>,<a href={'#cost-bundle-'+r.bundle}>{r.bundle} · {data.bundles.find(b=>b.id===r.bundle).title}</a>,r.previousStatus+' / '+r.commitment])}/>
 <div id="cost-rfp" tabIndex={-1}><Table title="RFP 초안 요구사항 · 기획용 ID, 공식 기관 요구번호 아님" headers={['요구ID·묶음','납품 요구·입출력','수락·범위 조건','선례']} rows={data.rfp.map(([id,bundle,title,io,acceptance,ref])=>[id+' · '+bundle,<><strong>{title}</strong><p>{io}</p></>,acceptance,ref])}/></div>
 </Section>
 <Section id="cost-feasibility" title="2. 기술적으로 실행할 최소 범위와 견적 조건">
  <p>{data.ui.candidateLead}</p><p className="analysis-limit">{data.ui.productLimit} {data.assumptions}</p>
  {data.candidates.map(c=><section className="cost-card" key={c.id} data-cost-candidate={c.id}><h5>{c.id} · {c.title}</h5><p><strong>{c.verdict}</strong></p><Fields rows={[["최소 실행",c.minimum],["CCK 추가 작업",c.newWork],["공수 결정 요인",c.costDriver],["공통 재사용·차분",c.reuse],["측정할 변화",c.effect],["제외·중단",c.stop]]}/></section>)}
  <Table title="실행·견적 전에 확인할 8개 조건" headers={['확인 조건','필요 증거','실행 검증','비용 영향·보류']} rows={data.gates}/>
 </Section>
 <Section id="cost-audit" title="3. 39개 처 대가산정서의 실제 수치 대조">
  <p>{data.ui.auditLead}</p>
  <Fields rows={[["원문·방법",data.method],...data.ui.auditFields]}/>
  <p className="analysis-limit">{data.ui.auditLimit}</p>
  <Table title="처별 산정 원문 대조 · 단위 원 · 최신 수행가격 전부 미확정" headers={['처·기획·원문','FP · MD / MM','기존 공급가 / VAT 포함 소계','직접노무 참고 / 차액','판정']} rows={data.records.map(r=>[<span id={'cost-audit-'+r.code} data-cost-audit={r.code}><strong>{r.code} · {r.department}</strong><p>{r.projects.join(' · ')}</p><Link to={r.document} download>대가 {r.version} HWPX ↓</Link></span>,`${r.fp}FP · ${r.md}MD / ${r.mmShown.toFixed(2)}MM`,<>{money(r.supply)}<small>VAT 포함 {money(r.subtotal)}</small></>,<>{money(r.directLabor)}<small>차액 {money(r.gap)}</small></>,<>{r.verdict}<small>산술 일치 · 최신가격 미산정</small></>])}/>
 </Section>
 <Section id="cost-pricing" title="4. 적정가격을 만드는 산정 단위·중복 제외·누락 비목">
  <p>{data.bundlePlan.pricing}</p><Table title="개발·제품·자료·운영의 가격 판단" headers={['작업 구분','산정 접근','증빙·산정 단위','중복·누락 방지']} rows={data.pricing}/>
  <Table title="실제 견적 입력을 위해 확보할 16개 비목" headers={['ID·구분','산정 대상','필요 증거','경계·현재 금액']} rows={data.costItems.map(r=>[<span data-cost-item={r.id}>{r.id} · {r.group}</span>,r.item,r.evidence,<>{r.rule}<small>{money(r.amount)} · {r.confirmed}</small></>])}/>
  <p className="analysis-limit">{data.ui.pricingLimit}</p>
 </Section>
 <Section id="cost-precedents" title="5. 공공 RFP 4건이 뒷받침하는 과업 구성·비용 한계">
  <p>{data.ui.precedentLead}</p>
  {data.precedents.map(s=><section className="cost-card" key={s.id} id={'cost-precedent-'+s.id} data-cost-precedent={s.id} tabIndex={-1}><h5>{s.id} · <Out url={s.url}>{s.title}</Out></h5><small>게시 {s.published} · 확인 {s.checkedAt}</small><Fields rows={[["공개 발주 예산",money(s.budget)+' · '+s.tax],["기간",s.period],["실제 요구 범위",s.scope],["TS와 다른 조건",s.difference],["편성에 쓸 근거",s.use],["열람 위치·한계",s.locator+' / '+s.limit]]}/><details><summary>확인한 원본 SHA-256</summary><code>{s.sha256}</code></details></section>)}
 </Section>
 <Section id="cost-next" title="6. 착수·확산·경제성의 판단 순서">
  <Table title="선택 묶음의 단계별 진행·보류 조건" headers={['단계','수행 범위','진입·축소 조건']} rows={data.bundlePlan.phases}/><Table title="가격 확정에 앞서 수행할 5단계" headers={['단계','입력·확인','수행·판단','완료·보류 조건']} rows={data.decision}/>
  <Fields rows={[["편익과 총비용",data.comparison],...data.ui.economyFields]}/>
 </Section>
 <Section id="cost-sources" title="7. 공식 출처·다운로드·판본 한계">
  {data.sources.map(s=><Source key={s.id} s={s}/>)}<p className="analysis-limit">{data.documentNote}</p><div className="analysis-downloads">{data.downloads.map(([label,url])=><Link key={url} to={url} download>{label} ↓</Link>)}</div><p><Link to="planning-documents.html">39처 한글 원문·이전 판본 목록 ↗</Link></p>
 </Section>
</section>}
