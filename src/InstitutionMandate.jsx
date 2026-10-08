import React,{useState} from 'react';
import {ArrowRight,ExternalLink} from 'lucide-react';

export function InstitutionSummary({model,change}){
 const d=model.mandate;
 return <section className="wb-section wb-mandate-summary"><div><small>설립 목적 · 공식 근거</small><h2>{d.copy.purpose}</h2><p>{d.copy.role}</p><small>{d.date} 확인 · {d.copy.scopeShort}</small></div><button className="wb-button" onClick={()=>change({screen:'institution'})}>기관의 책무·법적 근거 <ArrowRight size={16}/></button></section>;
}

export function InstitutionMandate({model,state,change,select}){
 const d=model.mandate,[query,setQuery]=useState(''),[kind,setKind]=useState('all');
 const view=['role','basis','oversight'].includes(state.legalView)?state.legalView:'role';
 const group=d.groups.find(g=>g.id===state.legalGroup)||d.groups[0];
 const selected=model.byId[state.entity];
 const ids=new Set(d.itemIds),active=ids.has(state.entity)?selected:null;
 const related=new Set(active?model.relations.filter(r=>r.from===active.id||r.to===active.id).flatMap(r=>[r.from,r.to]):[]);
 const item=id=>model.byId[id];
 const link=(id,caption)=>{const e=item(id);return <button type="button" className={'wb-link-button '+(state.entity===id?'is-selected':'')} data-mandate={id} aria-pressed={state.entity===id} onClick={()=>select(id,true)}>{caption||e.title}</button>};
 const rowClass=id=>state.entity===id?'selected':related.has(id)?'connected':'';
 const lawRows=d.basisIds.map(item).filter(e=>(kind==='all'||e.basisKind===kind)&&(!query||(e.title+' '+e.summary+' '+e.subject+' '+e.condition).toLowerCase().includes(query.toLowerCase())));
 const duties=list=><ul className="wb-mandate-duties">{list.map(id=>{const e=item(id);return <li key={id} className={rowClass(id)}><div>{link(id)}<p>{e.condition}</p></div><div>{e.basisIds.map(b=><React.Fragment key={b}>{link(b,item(b).clause)}</React.Fragment>)}</div></li>})}</ul>;
 return <div className="wb-mandate">
  <section className="wb-section wb-mandate-header"><small>기관 식별 · {d.date} 원문 확인</small><h2>한국교통안전공단 <span>TS</span></h2><p className="wb-mandate-lead">{d.copy.purpose}</p><p>{d.copy.role}</p><div className="wb-mandate-facts">{d.identityIds.map(id=><div key={id}>{link(id)}<small>{item(id).summary}</small></div>)}</div><p className="wb-note">{d.copy.scopeShort}</p></section>
  <div className="wb-mandate-tabs" role="group" aria-label="기관 책무 보기">{[['role','기관의 역할'],['basis','법적 근거'],['oversight','소관·감독 관계']].map(([id,title])=><button key={id} className="wb-button" aria-pressed={view===id} onClick={()=>change({legalView:id})}>{title}</button>)}</div>
  {active&&<div className="wb-mandate-selection" role="status"><span><b>선택 중</b> {active.title}</span><button className="wb-link-button" onClick={()=>select(active.id,true)}>근거·조건 다시 보기</button><button className="wb-button" onClick={()=>change({entity:'',legalGroup:''})}>책무 선택 해제</button></div>}
  {view==='role'&&<>
   <section className="wb-section"><div className="wb-section-title"><h2>설립 목적에서 법정 사업으로</h2><span>6개 업무군은 탐색을 위한 화면상 분류</span></div><div className="wb-mandate-chain"><div><small>설립 근거</small>{link('LAW-FOUNDATION')}<p>{d.copy.foundation}</p></div><span aria-hidden="true">→</span><div><small>설립 목적·공적 역할</small>{link('TS-A01')}<p>{d.copy.publicValue}</p></div><span aria-hidden="true">→</span><div><small>선택 업무군 · 화면상 분류</small><strong>{group.title}</strong><p>{group.description}</p></div></div><div className="wb-mandate-groups">{d.groups.map(g=><button key={g.id} className="wb-button" aria-pressed={g.id===group.id} onClick={()=>change({legalGroup:g.id})}>{g.title}<small>{g.dutyIds.length}개 항목</small></button>)}</div><h3>{group.title} · 실제 사업 항목</h3>{duties(group.dutyIds)}<p className="wb-note">{d.copy.articleSixScope}</p><details className="wb-disclosure"><summary>공단법 제6조 전체 사업 보기 · 유효 12개 호와 삭제 2개 호</summary>{duties(d.primaryDutyIds)}<p className="wb-note">{d.copy.deleted}</p></details></section>
   <section className="wb-section"><h2>정관에 명시된 추가 운영 범위</h2><p>{d.copy.charterScope}</p><details className="wb-disclosure"><summary>정관 제25조 사업 항목 전체 · {d.charterDutyIds.length}개</summary>{duties(d.charterDutyIds)}</details><details className="wb-disclosure"><summary>자동차안전연구원 임무 전체 · {d.katriDutyIds.length}개</summary><p className="wb-note">{d.copy.katriScope}</p>{duties(d.katriDutyIds)}</details></section>
   <section className="wb-section"><h2>공식 전략과 기획상 해석</h2><div className="wb-two-column"><div><small>공식 정책·전략 설명</small>{link('TS-STRATEGY')}<p>{item('TS-STRATEGY').summary}</p><ul>{d.strategyGoals.map(t=><li key={t}>{t}</li>)}</ul></div><div><small>기획상 해석</small>{link('TS-PLANNING-MEANING')}<p>{item('TS-PLANNING-MEANING').summary}</p></div></div><p className="wb-note">{d.copy.strategyLimit}</p></section>
  </>}
  {view==='basis'&&<section className="wb-section"><h2>조문–책무 매핑</h2><p className="wb-note">{d.copy.basisScope}</p><div className="wb-search"><label><span className="wb-sr-only">법령·조문·내용 검색</span><input type="search" aria-label="법령·조문·내용 검색" value={query} onChange={e=>setQuery(e.target.value)} placeholder="법령·조문·수행조건 검색"/></label><label><span className="wb-sr-only">근거 성격 필터</span><select aria-label="근거 성격 필터" value={kind} onChange={e=>setKind(e.target.value)}><option value="all">모든 근거 성격</option>{[...new Set(d.basisIds.map(id=>item(id).basisKind))].map(k=><option key={k}>{k}</option>)}</select></label><button className="wb-button" onClick={()=>{setQuery('');setKind('all')}}>법령 필터 해제</button></div><p className="wb-result-count" role="status">{lawRows.length}개 근거</p><div className="wb-table-wrap"><table className="wb-mandate-table"><thead><tr>{['근거 성격','법령·조문','핵심 내용','연결된 책무·관계','시행 상태','확인 상태'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{lawRows.map(e=><tr key={e.id} className={rowClass(e.id)}><td>{e.basisKind}</td><td>{link(e.id)}<small>{e.documentName}</small></td><td>{e.summary}<p>{e.condition}</p></td><td>{e.connectedIds?.map(id=><div key={id}>{link(id)}</div>)}</td><td>{e.effectState}<small>{e.effective||'시행일 해당 없음'}</small></td><td>{e.verification}<small>{e.checkedAt}</small></td></tr>)}</tbody></table></div>{!lawRows.length&&<p className="wb-empty-note" role="status">검색 결과 없음 · 검색어 변경 또는 법령 필터 해제</p>}</section>}
  {view==='oversight'&&<section className="wb-section"><h2>누가 무엇을 승인·감독하는가</h2><p className="wb-note">{d.copy.relationScope}</p><div className="wb-governance-list">{d.governanceIds.map(id=>{const e=item(id);return <article key={id} className={rowClass(id)}><div className="wb-governance-path"><strong>{e.fromTitle}</strong><span>— {e.relationType} →</span><strong>{e.toTitle}</strong></div>{link(id)}<p>{e.summary}</p><small>{e.condition}</small></article>})}</div></section>}
  <details className="wb-disclosure"><summary>확인 범위와 3단계 업무 매핑 인계</summary><p className="wb-note">{d.copy.handoff}</p><ul>{d.coverage.map(c=><li key={c.status}><b>{c.status}</b> · {c.scope}</li>)}</ul><div className="wb-table-wrap"><table><thead><tr><th>책무 ID · 확인 업무</th><th>연결 근거</th><th>추가 확인할 조직·관계기관</th><th>실제 수행업무 확인</th><th>미확인 사항·검증 질문</th></tr></thead><tbody>{d.handoffs.map(h=><tr key={h.dutyId}><td><small>{h.dutyId}</small>{link(h.dutyId)}</td><td>{item(h.dutyId).basisIds.map(id=><div key={id}>{link(id,item(id).clause)}</div>)}</td><td>{h.organizations}</td><td>{h.actualWork}</td><td>{h.unknown}<p>{h.question}</p></td></tr>)}</tbody></table></div><ul>{d.pending.map(p=><li key={p}>{p}</li>)}</ul></details>
 </div>;
}

export function InstitutionEvidence({detail,model,select}){
 const refs=(detail.basisIds||[]).map(id=>model.byId[id]);
 const excerpts=detail.excerpt?[detail]:refs;
 return <div className="wb-mandate-evidence">
  <p className="wb-detail-summary">{detail.summary}</p><div className="wb-badge"><span>{detail.basisKind||detail.nature}</span><span>{detail.verification}</span><span>{detail.relationNature||'직접 규정'}</span></div>
  <h3>원문 위치·발췌</h3>{excerpts.map(e=><div className="wb-legal-excerpt" key={e.id}><strong>{e.documentName||e.lawName} · {e.clause}</strong>{e.excerpt?<blockquote>{e.excerpt}</blockquote>:<p>직접 인용 없이 공식 자료의 확인 범위를 요약한 항목</p>}{e.id!==detail.id&&<button className="wb-link-button" onClick={()=>select(e.id,true)}>해당 근거 자세히 보기</button>}</div>)}
  <h3>요약과 연결 이유</h3><p>{detail.reason||detail.summary}</p>
  <dl>{[['수행 주체',detail.subject],['적용 대상',detail.target],['수행 조건·권한 강도',detail.condition],['예외·한계',detail.limit],['자료 판본',detail.version],['공포·개정·작성일',detail.promulgated||detail.published],['시행일·시행 상태',[detail.effective,detail.effectState].filter(Boolean).join(' · ')],['원문 확인일',detail.checkedAt]].filter(([,v])=>v).map(([k,v])=><div className="wb-field" key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
  <div className="wb-actions">{[...new Set([detail.url,...refs.map(e=>e.url)].filter(Boolean))].map(url=><a className="wb-button" key={url} href={url} target="_blank" rel="noopener noreferrer">공식 원문 열기 <ExternalLink size={15}/></a>)}</div>
  <h3>연결된 책무·근거·기관</h3><div className="wb-legal-related">{[...new Set([...(detail.connectedIds||[]),...(detail.basisIds||[])])].map(id=><button className="wb-row-button" key={id} onClick={()=>select(id,true)}>{model.byId[id].title}<ArrowRight size={16}/></button>)}</div>
  <h3>다음 단계 확인 질문</h3><ul>{(detail.questions||model.mandate.defaultQuestions).map(q=><li key={q}>{q}</li>)}</ul>
 </div>;
}
