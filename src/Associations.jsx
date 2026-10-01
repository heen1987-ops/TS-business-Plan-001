import React,{useState,useEffect,useRef}from'react';
import {Heading,Link,Out}from'./core.jsx';
import data from'./association-research.json';
import './associations.css';
const gap=data.gap_review;
const news=data.news_research;
import {DrtRelated} from './DrtAssurance.jsx';
import {AssociationProposalLinks} from './ProposalLinks.jsx';
const sectors=[...new Set(data.items.map(x=>x.sector))];
const bySource=Object.fromEntries(data.sources.map(x=>[x.id,x]));
const list=values=><ul>{values.map((v,i)=><li key={i}>{v}</li>)}</ul>;
function Table({headers,rows,label}){return <div className="assoc-table" tabIndex={0} role="region" aria-label={label}><table><caption>{label}</caption><thead><tr>{headers.map(h=><th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{r.map((v,j)=><td key={j}>{v}</td>)}</tr>)}</tbody></table></div>}
function Source({id}){const s=bySource[id];return s?<Out url={s.url}>{s.title}</Out>:<span>근거 ID 확인 필요</span>}
export function NewsResearch({proposalBase='',title=news.title}){return <section id="news-research" tabIndex={-1}><h2>{title}</h2><p>{news.scope}</p><p className="assoc-notice">{news.lead}</p>
 <Table label="뉴스에서 확인한 불편과 추가 조사 방향" headers={['사례·원기사 날짜','현재 판단','남은 확인 질문']} rows={news.cases.map(c=>[<a href={'#news-'+c.id}>{c.id+' '+c.title}<br/>{c.article.date+' · '+c.article.publisher}</a>,c.status,c.remaining])}/>
 {news.cases.map(c=><article id={'news-'+c.id} className="assoc-news-case" tabIndex={-1} key={c.id}><header><p className="assoc-muted">{c.sector+' / 보도 '+c.article.date+' / 조사 '+news.date}</p><h3>{c.id} · {c.title}</h3><p className="assoc-status">{c.status}</p></header>
 <h4>보도에서 확인한 문제</h4><p>{c.fact}</p><p><Out url={c.article.url}>{c.article.publisher+' · '+c.article.title}</Out>{c.article.naver_url&&<> · <Out url={c.article.naver_url}>네이버 게재 기사</Out></>}</p><p className="assoc-muted">{c.article.read_status} · <Out url={c.search.url}>네이버 검색 확인</Out></p>
 <dl><dt>문제·후속조치 시점</dt><dd>{c.event_period}</dd><dt>이미 있는 대응</dt><dd>{c.existing}</dd></dl>
 <div className="assoc-news-sources"><h4>공식자료 대조</h4>{c.official_sources.map(s=><div key={s.url}><p><Out url={s.url}>{s.title}</Out> · {s.date}</p><p>{s.fact}</p><p className="assoc-muted">{s.read_status} / {s.limit}</p></div>)}</div>
 <h4>새 사업으로 바로 확정할 수 없는 이유</h4>{list(c.counterevidence)}
 <dl><dt>추가 확인할 공백 가설</dt><dd>{c.remaining}</dd><dt>TS 업무·권한 경계</dt><dd>{c.ts_boundary}</dd><dt>CCK 적용 가설</dt><dd>{c.llm}</dd><dt>일반 SI·운영 대안</dt><dd>{c.rules}</dd></dl>
 <h4>실제 적용을 검토할 업무 흐름</h4><ol className="assoc-news-flow">{c.workflow.map(w=><li key={w}>{w}</li>)}</ol>
 <h4>필요한 현장 자료</h4>{list(c.needed_data)}<p><strong>중단·축소 조건:</strong> {c.stop}</p>
 <Table label={c.id+' 효과 측정안 · 기준선·목표 미확정'} headers={['지표','산식','측정·해석 기준']} rows={c.metrics.map(m=>[m.name,m.formula,m.method])}/>
 <p>연결 검토 후보: {c.proposal_ids.map(id=>proposalBase?<Link key={id} to={proposalBase+'#proposal-'+id}>{id+' '}</Link>:<a key={id} href={'#proposal-'+id}>{id+' '}</a>)} · 사업 확정·동일 업무 전체 범위로 확대하지 않음.</p>
 {c.org_ids.length>0&&<p>관련 업무 의견 확인대상: {c.org_ids.map(id=><React.Fragment key={id}><Link to={'associations.html?org='+id+'#association-detail'}>{data.items.find(o=>o.id===id)?.name}</Link>{' / '}</React.Fragment>)}<br/><span className="assoc-muted">기사 사건의 당사자·책임주체·확정 수요자로 귀속하지 않음.</span></p>}
 </article>)}
 <div className="assoc-news-evaluation"><h3>{news.evaluation.title}</h3><dl>{[['비교 설계',news.evaluation.design],['표본·관측기간',news.evaluation.sample],['결과 해석',news.evaluation.reporting],['확인 책임',news.evaluation.responsibility],['자료·개인정보',news.evaluation.privacy]].map(([k,v])=><React.Fragment key={k}><dt>{k}</dt><dd>{v}</dd></React.Fragment>)}</dl></div>
 <h3>다음 조사할 자료</h3><Table label="추가 조사 대기열 · 기관 협의 전" headers={['주제','확인할 자료·질문','협의 대상']} rows={news.queue.map(q=>[q.topic,q.question,q.owner])}/>
 <h3>조사·반증 기준</h3>{list(news.method)}<p>{news.review.result}</p><p className="assoc-muted">{news.review.scope}</p>
 </section>}
function Plan({p}){
 const e=p.enhancement,r=p.gap_review;
 return <article className="assoc-plan" id={'proposal-'+p.id} tabIndex={-1}><h3>{p.id} · {p.title}</h3><p className="assoc-status">{p.status}</p><AssociationProposalLinks id={p.id}/>{p.id==='B08'&&<DrtRelated/>}<dl><dt>기존 서비스·요구·계획</dt><dd>{r.existing}</dd><dt>다음 확인할 미처리 결과</dt><dd>{r.probe}</dd><dt>신규 제안에서 제외할 설명</dt><dd>{r.exclude}</dd></dl>
 <h4>문제 근거와 현재 한계</h4><p>{e.confirmed}</p><p>{e.gap}</p>
 <dl><dt>사용자·수혜자</dt><dd>{p.who}</dd><dt>확인할 편익</dt><dd>{p.benefit}</dd><dt>업무 단위·완료 증거</dt><dd>{e.case_unit} / {e.finish}</dd><dt>담당·권한</dt><dd>{e.human} / {e.boundary}</dd></dl>
 <details><summary>이전 설계 내용과 검증계획 · 신규성 확인 전 이력</summary>
 <h4>처리 흐름·예외</h4>{(e.flow_groups||[{name:'업무 처리 흐름',flow:e.flow}]).map(g=><Table key={g.name} label={p.id+' '+g.name} headers={['담당','처리','결과','예외']} rows={g.flow}/>)}
 <dl><dt>로컬 LLM</dt><dd>{e.llm}</dd><dt>일반 SI·업무규칙</dt><dd>{e.rules}</dd><dt>재계획</dt><dd>{e.replan}</dd><dt>기존 기능 재사용</dt><dd>{e.reuse}</dd></dl>
 <Table label={p.id+' 데이터·권한'} headers={['자료','최소 필드','책임','원천']} rows={e.data}/>
 <Table label={p.id+' 인터페이스 설계 이력'} headers={['도구','방식','입력','응답','실패']} rows={e.tools.map(t=>[t.name,t.mode,t.input,t.output,t.failure])}/>
 <p>인터페이스 명칭은 설계 제안. 실제 API·권한·연계·서버 성능 미검증.</p>
 <Table label={p.id+' 향후 인수시험 · 미수행'} headers={['요구','시험사례','수용기준']} rows={e.requirements.map(t=>[t.name,t.test_case,t.acceptance])}/>
 <Table label={p.id+' 효과 측정안 · 기준선·목표 미확정'} headers={['지표','산식','측정 범위']} rows={p.kpis}/>
 <p>{e.validation}</p><p>{e.privacy}</p><p>{e.capacity}</p><p>{e.cost_basis}</p>
 </details>
 <h4>연결 근거</h4><ul>{data.enhancement.evidence.filter(s=>s.proposal_id===p.id).map(s=><li key={s.id}><Out url={s.url}>{s.id} · {s.title}</Out><p>{s.fact}</p><p className="assoc-muted">발행 {s.published_at||'미표시'} / 열람 {s.checked_at} · {s.limit}</p></li>)}</ul>
 </article>
}
export function Associations(){
 const [query,setQuery]=useState(''),[sector,setSector]=useState(''),[relation,setRelation]=useState('all');
 const [selected,setSelected]=useState(()=>new URLSearchParams(location.search).get('org')||data.items[0].id);
 const detail=useRef(null),current=data.items.find(x=>x.id===selected)||data.items[0];
 const words=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
 const rows=data.items.filter(x=>(!sector||x.sector===sector)&&words.every(w=>[x.name,x.sector,x.scope,x.parent||''].join(' ').toLowerCase().includes(w))&&(relation!=='direct'||x.direct_issue_ids.length>0));
 const issues=data.issues.filter(x=>current.direct_issue_ids.includes(x.id)||current.sector_issue_ids.includes(x.id));
 function choose(id){setSelected(id);const u=new URL(location.href);u.searchParams.set('org',id);u.hash='association-detail';history.replaceState({},'',u);requestAnimationFrame(()=>{detail.current?.focus();detail.current?.scrollIntoView({block:'start'})})}
 useEffect(()=>{const timer=setTimeout(()=>{if(location.hash){const el=document.getElementById(decodeURIComponent(location.hash.slice(1)));el?.scrollIntoView();el?.focus({preventScroll:true})}},80);return()=>clearTimeout(timer)},[]);
 return <div className="page association-page">
 <Heading label={'추가 조사 · '+data.checked_at} title={data.publication.title} desc="단체의 역할과 실제 문제 근거를 확인하고, 기존 기능으로 처리되지 않는 결과를 찾기 위한 조사."/>
 <p className="assoc-notice"><strong>{gap.headline}</strong><br/>새 기능으로 확정한 항목 {gap.confirmed_new_count}건. 기관에 공백이 없다는 의미가 아닌 확인 범위의 한계. 확정 사업계획·운영 성과와 구별.</p>
 <p>단체·지역조직·공제·교육기관 <b>{data.items.length}개 기록</b> · 역할 재검토 {data.summary.profiles_reviewed}개 · 공개 쟁점 {data.issues.length}개 · 설계 후보 {data.proposals.length}개. 독립 협회 수·접수 민원 수·전국 전수조사 완료와 구별.</p>
 <nav className="assoc-links" aria-label="협회 조사 본문 목차">{[['news-research','뉴스 추가 조사'],['gap-review','신규성 재검토'],['existing-scope','기존 기능 대조'],['gap-probes','절차상 한계'],['associations','협회 찾기'],['evidence','전체 문제 근거'],['plans','후보별 근거·설계']].map(([id,t])=><a key={id} href={'#'+id}>{t}</a>)}</nav>
 <p className="assoc-downloads"><Link to="research-library.html">조사자료실</Link> · <Link to="downloads/association-research.md" download>전체 조사 문서 내려받기</Link> · <Link to="downloads/association-research.json" download>근거·판정 데이터 내려받기</Link></p>
 <NewsResearch/>
 <section id="gap-review" tabIndex={-1}><h2>기존 후보의 미제공 여부부터 재검토</h2><p>{gap.scope}</p><Table label="10개 후보의 기존 기반과 추가 확인" headers={['후보','기존 서비스·요구·계획','확인할 미처리 결과','상태']} rows={gap.reviews.map(r=>[<a href={'#proposal-'+r.id}>{r.id+' '+r.title}</a>,r.existing,r.probe,r.status])}/></section>
 <section id="existing-scope" tabIndex={-1}><h2>상담·민원 AI의 기존 요구·논의 범위</h2><p>확인한 RFP 요구와 제안·인터뷰 내용을 대조. 실제 납품·운영 완료 및 최종 계약편입 여부는 미확인.</p><Table label="동일 기능 신규 제안 제외 범위" headers={['기능','문서 위치','근거','확인 상태']} rows={gap.exclusions.map(r=>[r[1],r[2],<a href={'#gap-source-'+r[3]}>{r[3]}</a>,r[4]])}/><p>API 호출·답변 생성·요약·누락 검토라는 명칭만으로 추가사업의 신규성을 입증하지 않음.</p></section>
 <section id="gap-probes" tabIndex={-1}><h2>공식 절차에서 확인한 조사 출발점</h2><p>절차상 제한과 AI 기능 부재를 구별. 아래 세 항목은 조사 후보이며 선정 사업이 아님.</p>{gap.probes.map(p=><article key={p.id} className="assoc-probe"><h3>{p.id} · {p.title}</h3><p className="assoc-status">{p.status}</p><AssociationProposalLinks id={p.id}/>{p.id==='B08'&&<DrtRelated/>}<dl>{[['확인 사실',p.fact],['필요한 결과',p.needed_result],['기존 기능 대조',p.check],['일반 SI 대안',p.si],['CCK 검토 범위',p.llm],['철회·변경 조건',p.kill]].map(([k,v])=><React.Fragment key={k}><dt>{k}</dt><dd>{v}</dd></React.Fragment>)}</dl><p>{p.source_ids.map(id=><a key={id} href={'#gap-source-'+id}>{id} 근거 확인 </a>)}</p></article>)}</section>
 <section id="associations" tabIndex={-1}><h2>협회·연합회·관련 조직 찾기</h2><p>협회별 역할과 TS 업무 연관성을 구분. 목록에 있다는 사실로 TS 감독·위탁관계를 확정하지 않음.</p><form className="assoc-filters" onSubmit={e=>e.preventDefault()}>
 <label>명칭·지역 검색<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="예: 택시, 화물, 항공"/></label>
 <label>업종<select value={sector} onChange={e=>setSector(e.target.value)}><option value="">전체 업종</option>{sectors.map(s=><option key={s}>{s}</option>)}</select></label>
 <label>문제 근거<select value={relation} onChange={e=>setRelation(e.target.value)}><option value="all">전체 기록</option><option value="direct">직접 관련 자료 있음</option></select></label>
 <button type="button" onClick={()=>{setQuery('');setSector('');setRelation('all')}}>검색 초기화</button></form>
 <p role="status">{rows.length}개 표시 / 전체 {data.items.length}개 기록</p>
 {rows.length?<Table label="검색한 단체 목록" headers={['단체','분야·지역','역할 확인','문제 근거']} rows={rows.map(r=>[<button className="assoc-select" aria-pressed={current.id===r.id} onClick={()=>choose(r.id)}>{r.name}</button>,r.sector+' / '+r.scope,r.role_status,r.evidence_status])}/>:<p className="assoc-empty">검색 조건에 해당하는 기록 없음. 검색어 또는 필터를 조정해 주세요.</p>}
 <article id="association-detail" className="assoc-profile" tabIndex={-1} ref={detail}><h3>{current.name}</h3><dl>{[['정의',current.definition],['대표·수혜대상',current.represented],['의의',current.significance],['확인 수준',current.role_status],['민원수준',current.complaint_status],['추가 확보 자료',current.next_evidence]].map(([k,v])=><React.Fragment key={k}><dt>{k}</dt><dd>{v}</dd></React.Fragment>)}</dl><p><Source id={current.role_source_id}/>{current.homepage_url&&<> · <Out url={current.homepage_url}>홈페이지·공식 채널</Out></>}</p>
 {issues.length?issues.map(i=><article className="assoc-issue" key={i.id}><h4><a href={'#issue-'+i.id}>{i.title}</a></h4><p className="assoc-status">{current.direct_issue_ids.includes(i.id)?'선택 단체 직접 관련 공개자료':'업종 공통 참고 · 선택 단체에 귀속하지 않음'}</p><p>{i.fact}</p><p>{i.limits}</p><p><Source id={i.source_id}/> · <a href={'#proposal-'+i.proposal_hint}>{i.proposal_hint} 조사 후보</a></p></article>):<p>선택 단체의 문제 근거 미확보. 민원이 없다는 의미와 구별.</p>}</article>
 </section>
 <section id="evidence" tabIndex={-1}><h2>전체 공개 문제 근거와 해석의 한계</h2><p>공개 쟁점의 수와 접수 민원의 수를 구별. 단체별 접수 건수·빈도는 미확인.</p>{data.issues.map(i=><article key={i.id} id={'issue-'+i.id} className="assoc-issue" tabIndex={-1}><h3>{i.id} · {i.title}</h3><p className="assoc-status">{i.type} / {i.evidence_level}</p><p>{i.fact}</p>{i.volume&&<p>공개 집계: {i.volume.value?.toLocaleString()} {i.volume.unit} / {i.volume.period} / {i.volume.population}. {i.volume.not_equivalent_to}와 구별.</p>}<p><b>한계:</b> {i.limits}</p><p><b>TS 접점·권한:</b> {i.TS_boundary}</p><p><Source id={i.source_id}/> · {i.date||'게시일 미표시'} · <a href={'#proposal-'+i.proposal_hint}>{i.proposal_hint} 검토</a></p></article>)}</section>
 <section id="plans" tabIndex={-1}><h2>후보별 추가 확인과 기존 설계 이력</h2><p>신규성·실제 수요 확인 전 설계. 기존 서버·로컬 LLM 활용, 신규 인프라 투자 0원, 비전 제외. 효과 기준선·목표값·개발비는 미확정.</p>{data.proposals.map(p=><Plan key={p.id} p={p}/>)}</section>
 <section id="gap-sources" tabIndex={-1}><h2>이번 판정의 근거·날짜·확인 범위</h2>{gap.sources.map(s=><article key={s.id} id={'gap-source-'+s.id} tabIndex={-1} className="assoc-issue"><h3>{s.id} · {s.url?<Out url={s.url}>{s.title}</Out>:s.title}</h3><p>{s.kind} / {s.date||'게시일 미표시'} / 열람 {gap.date}</p><p>{s.locator}</p><p>{s.fact}</p><p><b>한계:</b> {s.limit}</p><p className="assoc-muted">{s.availability}</p></article>)}
 <h3>다음 확인 질문</h3>{list(gap.next_questions)}</section>
 <p><Link to="solutions.html">처별 AX 제안으로 이동</Link> · <Link to="index.html">기관 소개로 이동</Link></p>
 </div>
}
