import {Link} from './core.jsx';
import React from 'react';
import d from './org-platform-2027.cjs';
import './org-understanding-summary.css';

function Content(){return <div className="org-context-content">
  <div className="org-context-grid">{d.understanding.map(x=><article className="org-context-card" key={x.scope}><h3>{x.scope}</h3><p>{x.source}</p><small>{x.purpose}</small></article>)}</div>
  <ol className="org-context-steps">{d.requestSteps.map(x=><li key={x}>{x}</li>)}</ol>
  <blockquote className="org-context-example"><small>필수 서류 누락 시 · {d.missingInput.request}</small><p>{d.missingInput.response}</p><footer>{d.missingInput.acceptance}</footer></blockquote>
  <details className="org-context-archive"><summary>일하는 방법을 조직 지식으로 남기는 기록</summary><div>{d.workArchive.map(x=><p key={x.stage}><strong>{x.stage}</strong><span>{x.record}</span></p>)}</div></details>
 <Link to="index.html?view=strategy&strategy=ST-04#org-native-design">조직·역할·업무·권한·협업 상세설계 →</Link></div>;}

export function OrgUnderstandingSummary({compact=false}){
 if(compact)return <details id="organization-understanding" className="org-context org-context-compact"><summary><strong>조직을 이해하는 AI</strong><span>기관 전체 + 해당 부서 + 현재 업무건 → 누락 서류 확인·검토 보류</span></summary><Content/></details>;
 return <section id="organization-understanding" className="org-context"><header><small>AI혁신처 · 1차 공통 기반</small><h2>기관 전체와 해당 부서의 일하는 방식을 연결</h2><p>공식 조직·권한·업무·필수 자료를 업무건에 적용. 자료가 없으면 검토를 보류하고 필요한 서류를 요청.</p></header><Content/></section>;
}
