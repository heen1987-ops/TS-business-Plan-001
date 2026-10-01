import React,{useEffect,useId,useState}from'react';
import{Link,Heading}from'./core.jsx';
import manifest from'./department-documents.json';
import'./department-documents.css';

const mb=bytes=>(bytes/1024/1024).toFixed(1)+' MB';
export function DepartmentDocuments({code,profileId,catalogue=false}){
 const d=manifest.departments.find(d=>code?d.code===code:d.profileIds.includes(profileId)),heading=useId();
 if(!d)return null;
 return <section className="department-documents" data-native-department={d.code} aria-labelledby={heading}>
  <header><div><span className="native-eyebrow">한글 원문 다운로드 · {d.code}</span><h2 id={heading}>{d.name} 계획서·대가산정·도식집</h2></div>{!catalogue&&<Link to={'planning-documents.html#documents-'+d.code}>전체 처별 다운로드 목록 ↗</Link>}</header>
  <div className="native-file-grid">{d.documents.map(f=><div className="native-file" key={f.kind}>
   <span className={'native-version '+(f.kind==='plan'?'latest':'')}>{f.kind==='plan'?'최신 계획서':'참조 첨부'} · {f.version.replace('_r01','')}</span>
   <h3>{f.label}</h3><p>{f.status}</p>
   <Link to={f.path} download={f.downloadName} className="native-download" data-native-kind={f.kind}>{f.label} 한글 다운로드 ↓</Link>
   <small>HWPX · {mb(f.bytes)} · {f.date} · 내장 그림 {f.embeddedImages}개</small>
   <details><summary>파일 무결성 SHA-256</summary><code>{f.sha256}</code></details>
  </div>)}</div>
  <p className="native-note">기관 협의용 초안. 확정 과업·최종 대가·실측 효과와 구분. v0.4 추가 기술의 차분 공수·대가는 미확정이며, 대가산정서·도식집은 v0.3 참조본.</p>
  {catalogue&&<p><Link to={d.proposalRoute}>{d.name} 관련 상세제안 보기 ↗</Link></p>}
 </section>
}

export function PlanningDocuments(){
 const[q,setQ]=useState('');const rows=manifest.departments.filter(d=>[d.code,d.name,...d.projects.map(p=>p.title)].join(' ').toLowerCase().includes(q.trim().toLowerCase()));
 useEffect(()=>{const id=decodeURIComponent(location.hash.slice(1));if(!/^documents-[A-Z0-9]+$/.test(id))return;let next;const first=requestAnimationFrame(()=>{next=requestAnimationFrame(()=>{const target=document.getElementById(id);if(target){target.focus({preventScroll:true});target.scrollIntoView({block:'start',behavior:'instant'})}})});return()=>{cancelAnimationFrame(first);if(next)cancelAnimationFrame(next)}},[]);
 return <div className="page planning-documents-page">
  <Heading label={'한글 공개 자료실 · '+manifest.version} title="처별 계획서·대가산정서·도식집" desc="39개 처의 한글 문서 117개. 처별 제안 본문의 다운로드와 동일한 파일로 연결."/>
  <div className="native-publication-note"><p><strong>계획서 v0.4 + 대가산정서 v0.3 + 도식집 v0.3</strong></p><p>{manifest.notice}</p>{manifest.limitations.map(t=><p key={t}>{t}</p>)}<p>HWPX는 그림을 포함한 한글 문서 형식. 한컴오피스에서 열람·편집 가능하며, 파일별 해시로 게시본 확인 가능.</p></div>
  <form className="native-search" role="search" onSubmit={e=>e.preventDefault()}><label htmlFor="native-search">처명·코드·사업명 검색</label><input id="native-search" type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="예: 모빌리티연구처, 철도, EX11"/><button type="button" onClick={()=>setQ('')}>검색 초기화</button><p role="status">{rows.length}개 처 · {rows.length*3}개 한글 파일</p></form>
  {rows.length>0?<><nav className="native-index" aria-label="처별 다운로드 위치">{rows.map(d=><a key={d.code} href={'#documents-'+d.code}>{d.code} · {d.name}</a>)}</nav>{rows.map(d=><div key={d.code} id={'documents-'+d.code} className="native-department-row" tabIndex={-1}><DepartmentDocuments code={d.code} catalogue/></div>)}</>:<div className="native-empty" role="status">검색 결과 없음. 처명 또는 코드 확인 후 검색 초기화.</div>}
 </div>
}
