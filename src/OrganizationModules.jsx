import React,{useState} from 'react';
import {Link} from './core.jsx';
import d from './ts-org-module-design.cjs';
import p from './ts-ax-portfolio-2027.cjs';
import literature from './org-native-literature.json';
import './ts-org-modules.css';
const Table=({headers,rows})=><div className="ond-table-wrap"><table><thead><tr>{headers.map(x=><th key={x} scope="col">{x}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{r.map((v,j)=><td key={j} data-label={headers[j]}>{v}</td>)}</tr>)}</tbody></table></div>;
const SLink=({id,children,hash=''})=><Link to={'index.html?view=strategy&strategy='+id+hash}>{children}</Link>;
export function OrganizationExecution(){const [id,setId]=useState('OM-01'),m=d.core.find(x=>x.id===id);return <section className="onm-design" id="org-execution-design" aria-label="조직 이해·실행 모듈 설계">
 <header><span className="ux-eyebrow">기관 + 부서 + 업무건</span><h3>조직 이해 → 업무 목표 → 행동·완료</h3><p>{d.principle}</p></header>
 <div className="onm-models">{d.model.map(x=><article key={x[0]}><h4>{x[0]}</h4><p>{x[1]}</p><small>{x[2]}</small></article>)}</div>
 <h4>6개 실행 모듈</h4><div className="onm-tabs" role="group" aria-label="조직 실행 모듈 선택">{d.core.map(x=><button type="button" key={x.id} aria-pressed={id===x.id} onClick={()=>setId(x.id)}><small>{x.id}</small>{x.name}</button>)}</div>
 <article className="onm-selected" data-module={m.id} aria-live="polite"><h4>{m.name}</h4><dl><dt>입력</dt><dd>{m.input}</dd><dt>처리·판단</dt><dd>{m.process}</dd><dt>출력 계약</dt><dd>{m.output}</dd><dt>검수</dt><dd>{m.accept}</dd><dt>기존 설계 연결</dt><dd>{m.arch.join(' · ')} / {m.packages.join(' · ')}</dd></dl><div className="axp-links">{m.sources.map(id=><a key={id} href={literature.sources.find(s=>s.id===id).url} target="_blank" rel="noreferrer">{id} · {literature.sources.find(s=>s.id===id).title} ↗</a>)}</div></article>
 <details><summary>구현 순서·CCK 공통 제품 범위</summary><p>{d.costRule}</p><Table headers={['구현','개발 범위','실행 모듈','완료 산출물']} rows={d.development}/><p>D08 평가·릴리스는 D01 착수부터 병행. D03 모의 연계로 외부 시스템 연결 전 실패·중복·권한 시나리오 검증.</p><h4>별도 R&D 검토 주제</h4><ul>{d.research.map(x=><li key={x}>{x}</li>)}</ul><small>현장 오류와 비교시험으로 기술 한계 확인 후 연구과제 분리</small></details>
 <div className="axp-links"><SLink id="ST-04" hash="#org-work-scenarios">57개 부서 업무 시나리오 ↓</SLink><SLink id="ST-08" hash="#drt-business-design">DRT 사업·서비스 설계 →</SLink><Link to="downloads/ts-org-modules-drt.md" download>통합 설계 명세 ↓</Link></div>
 </section>;}
export function StrategyModule({id}){const m=d.contracts.find(x=>x.strategy===id);return <section className="onm-design onm-contract" id="strategy-module" data-contract={id}>
 <h3>업무 모듈 · {m.name}</h3><p>{m.goal}</p><dl><dt>입력·필요 자료</dt><dd>{m.input}</dd><dt>판단·보완</dt><dd>{m.reasoning}</dd><dt>사용 도구·실행</dt><dd>{m.tools}</dd><dt>산출물</dt><dd>{m.output}</dd><dt>완료 조건</dt><dd>{m.done}</dd></dl>
 <details><summary>CCK 기술·추가 개발·검수 연결</summary><Table headers={['CCK 자산','근거','재사용 조건']} rows={m.technology.map(t=>[p.technologyById[t].name,p.technologyById[t].evidence,p.technologyById[t].boundary])}/><p>{m.requirement} → {m.acceptance}</p><p>{m.test}</p><small>기존 과업·제품의 실제 배포본과 기능 대조 후 순증 산정. 기존 요구 ID에 상세 시험으로 편입.</small></details>
 <details><summary>담당 부서 시나리오 {m.scenarios.length}건</summary><div className="axp-links">{m.scenarios.map(s=><Link key={s.id} to={'index.html?view=strategy&strategy=ST-04&workOrg='+s.org+'#org-work-scenarios'}>{s.title} →</Link>)}</div></details>
 {id!=='ST-04'&&<SLink id="ST-04" hash="#org-execution-design">공통 목표·계획·실행 기반 →</SLink>}
 </section>;}
export function DrtBusinessDesign(){const x=d.drt;return <section className="onm-design onm-drt" id="drt-business-design" aria-label="DRT 사업·서비스 설계">
 <header><span className="ux-eyebrow">지역소멸·초고령화 대응 / {x.status}</span><h3>{x.title}</h3><p>{x.thesis}</p></header>
 <div className="onm-summary">{x.summary.map(r=><article key={r[0]}><h4>{r[0]}</h4><p>{r[1]}</p><small>{r[2]}</small></article>)}</div>
 <details open><summary>01 필요성·지역 선정·운영 책임</summary><Table headers={['문제','업무 가설','확보할 지역 근거','설계 대응']} rows={x.needs}/><h4>기관별 역할</h4><Table headers={['주체','책임 분담안','자료·결정']} rows={x.roles}/><p>{x.selection}</p></details>
 <details open><summary>02 서비스 아키텍처·실제 작동</summary><ol className="onm-flow" aria-label="DRT 서비스 흐름">{x.flow.map((r,i)=><li key={r[0]}><small>{i+1}</small><h4>{r[0]}</h4><p>{r[1]}</p></li>)}</ol><div className="ows-return-flows">{x.returns.map(t=><p key={t}>{t}</p>)}</div><Table headers={['합성 시나리오','처리·응답']} rows={x.example}/><h4>자료·연계 계약</h4><Table headers={['입력','필드','소관·근거','착수 조건']} rows={x.data}/></details>
 <details><summary>03 기존 RFP 경계·CCK 5개 적용 모듈</summary><Table headers={['기존 요구·위치','포함 범위','재사용·대조','추가 개발 경계']} rows={x.overlap}/><Table headers={['ID','모듈','입출력','재사용 후보','추가 개발','검수']} rows={x.modules}/><p>예약·배차·운행의 원천 기능 유지. 신규 기능은 기존 요구·계약·배포본 대조 후 차분 등록.</p></details>
 <details><summary>04 추진 단계·검수·기대효과</summary><Table headers={['단계·상대 일정','범위','다음 단계 조건']} rows={x.gates}/><h4>DRT 검수 설계</h4><p>{x.acceptanceNote}</p><Table headers={['시험','입력','판정','증적']} rows={x.acceptance}/><h4>기대효과·측정</h4><Table headers={['대상','기대효과','측정','해석 범위']} rows={x.effects}/></details>
 <details><summary>05 사업화·비용·의사결정</summary><Table headers={['구분','범위','사업 판단']} rows={x.business}/><h4>착수 전 결정사항</h4><ul>{x.issues.map(t=><li key={t}>{t}</li>)}</ul><p>{x.decision}</p></details>
 <details><summary>06 공식 근거·확인 범위</summary>{x.evidence.map(s=><article className="onm-source" key={s.id}><h4><a href={s.url} target="_blank" rel="noreferrer">{s.id} · {s.title} ↗</a></h4><p>{s.fact}</p><p>{s.use}</p><small>{s.locator} · {s.checked}</small></article>)}</details>
 <div className="axp-links">{x.related.map(id=><SLink key={id} id={id}>{id} · {p.byId[id].name} →</SLink>)}<Link to="downloads/ts-org-modules-drt.md" download>모듈·DRT 설계 명세 ↓</Link><Link to="downloads/ts-org-modules-drt.json" download>구조화 설계 원장 ↓</Link></div>
 </section>;}
