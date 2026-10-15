import React,{useState} from 'react';
import {Link} from './core.jsx';
import d from './ts-department-mapping.cjs';
import './department-mapping.css';
export function DepartmentMapping(){
 const [query,setQuery]=useState(''),[group,setGroup]=useState('공통 기반');
 const rows=d.rows.filter(r=>(!group||r.group===group)&&[r.name,r.path,r.job,r.context,r.code].join(' ').toLowerCase().includes(query.toLowerCase().trim()));
 return <section id="department-mapping" tabIndex={-1} className="dept-mapping">
  <header><span className="proposal-eyebrow">TS OFFICIAL ORGANIZATION · {d.date}</span><h3>{d.title}</h3><p>{d.intro}</p><p className="proposal-note">{d.coverage.note}</p></header>
  <div className="dept-metrics"><p><strong>{d.coverage.registeredNodes}</strong>공식 조직 노드 색인</p><p><strong>{d.rows.length}</strong>부서별 상세 설계</p><p><strong>{d.packages.length}</strong>1차 구축 묶음</p><p><strong>{d.tests.length}</strong>요구·검수 연결</p></div>
  <p className="dept-change">{d.evidence.changes[0].observed} {d.evidence.changes[0].boundary}</p>
  <h4>{d.labels.scope}</h4><p>{d.reuseBoundary}</p><div className="dept-packages">{d.packages.map(p=><article key={p.id} id={'mapping-'+p.id}><span className="proposal-id">{p.id} · {p.period}</span><h4>{p.name}</h4><p><strong>책임 제안</strong> {p.lead}</p><p><strong>추가 개발</strong> {p.additional}</p><p><strong>납품 증빙</strong> {p.output}</p><p>{p.gate}</p><small>{p.requirements.join(' · ')} → {p.requirements.map(x=>x.replace('-R','-T')).join(' · ')}</small></article>)}</div>
  <h4>{d.labels.mapping}</h4><p>{d.roleBoundary}</p><form className="dept-filters" onSubmit={e=>e.preventDefault()}><label>{d.labels.search}<input type="search" value={query} onChange={e=>{setQuery(e.target.value);setGroup('');}} placeholder="예: AI혁신처, 철도, 연구, 서울"/></label><label>{d.labels.group}<select aria-label={d.labels.group} value={group} onChange={e=>setGroup(e.target.value)}><option value="">{d.labels.all}</option>{d.groups.map(x=><option key={x}>{x}</option>)}</select></label></form>
  <p role="status" aria-live="polite">{rows.length} / {d.rows.length}{d.labels.result} · {d.status}</p>
  <table className="dept-table"><thead><tr>{['공식 조직 / 특성 제안','직무·업무 맥락 제안','역할·협업 제안','1차 구축·검수 연결'].map(h=><th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{rows.map(r=><tr key={r.code} id={'mapping-'+r.code}>
   <td data-label="공식 조직 / 특성 제안"><strong>{r.name}</strong><small>{r.code} · {r.path}</small><p>{r.character}</p><a href={r.sourceUrl} target="_blank" rel="noreferrer">{d.labels.source} ↗</a></td>
   <td data-label="직무·업무 맥락 제안"><p>{r.job}</p><small>{r.context}</small><details><summary>공식 담당업무 관측</summary><ul>{r.evidenceIds.map(id=>{const o=d.evidence.observations.find(x=>x.id===id);return <li key={id}>{o.text}<small>{id}</small></li>;})}</ul></details></td>
   <td data-label="역할·협업 제안"><p>{r.peers.map(d.name).join(' · ')}</p><details><summary>수행·검토·승인·협업 배정 원칙</summary><ul>{Object.values(r.roles).map(x=><li key={x}>{x}</li>)}</ul><p>{r.confirmation}</p></details></td>
   <td data-label="1차 구축·검수 연결"><strong className="dept-participation">{r.participation}</strong><p>{r.workPackages.map((id,i)=><React.Fragment key={id}>{i?' · ':''}<a href={'#mapping-'+id}>{id}</a></React.Fragment>)}</p><small>{r.requirements.join(' · ')}<br/>→ {r.tests.join(' · ')}</small>{r.legacy&&<small>기존 기획 {r.legacy}</small>}</td>
  </tr>)}</tbody></table>{!rows.length&&<p>{d.labels.none}</p>}
  <details className="proposal-details"><summary>{d.labels.collaboration} · {d.relations.length}개 대표 관계</summary><p>설계 제안입니다. 양측 소관과 권한을 확인한 관계만 실제 인계에 사용합니다.</p><div className="dept-packages">{d.relations.map(r=><article key={r.id}><small>{r.id} · {r.tests.join(' · ')}</small><h4>{d.name(r.from)} → {d.name(r.to)}</h4><p>{r.trigger}</p><p>{r.exchange}</p><p>{r.check}</p></article>)}</div></details>
  <details className="proposal-details"><summary>{d.labels.acceptance} · {d.tests.length}개</summary><p>측정 목표·평가셋·분모는 M2까지 합의합니다. 필수 거부 사례의 비인가 노출·실행 0건은 인수조건 제안이며 현재 실측 결과가 아닙니다.</p>{d.tests.map(t=><article className="dept-test" key={t.id}><h4>{t.id} · {t.name}</h4><p>{t.input}</p><p>{t.criterion}</p><small>{t.status}</small></article>)}</details>
  <details className="proposal-details"><summary>출처·관측 차이·미확인 사항</summary>{d.evidence.sources.map(s=><p key={s.id}><a href={s.url}>{s.title}</a> · {s.checkedAt} 확인</p>)}<ul>{d.evidence.unresolved.map(x=><li key={x}>{x}</li>)}</ul></details>
  <h4>{d.labels.downloads}</h4><nav className="proposal-actions">{d.downloadLinks.map(([to,label])=><Link key={to} to={to} download>{label} ↓</Link>)}</nav>
 </section>;
}
