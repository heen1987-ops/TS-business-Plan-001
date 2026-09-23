import React from'react';
import concepts from'./concept-illustrations.json';
import'./concept.css';
export const conceptAlt=d=>d.name+' 2.5D 아이소메트릭 컨셉도: '+concepts[d.code].alt;
export function ConceptCaption({d}){const c=concepts[d.code];return <div className="concept-caption"><div className="concept-caption-heading"><h2>{c.title}</h2><span>서비스 설명용 가상 장면</span></div><div className="concept-scenes">{c.scenes.map((s,i)=><div key={s.actor}><span>0{i+1}</span><div><h3>{s.actor}</h3><p>{s.action}</p></div></div>)}</div><div className="concept-ai-role"><b>CCK NOA 지원</b><p>{c.ai}</p></div></div>}
