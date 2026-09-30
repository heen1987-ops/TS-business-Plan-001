import React from 'react';
import {href} from './core.jsx';
import revision from './revision47.cjs';
import visuals from './generated-visuals47.json';
import detailedVisuals from './detailed-visuals47.json';

const labels={concept:'컨셉도',overall:'전체 아키텍처',service:'서비스 흐름도'};
export function GeneratedDiagram47({code,type}){
 const asset=visuals.assets.find(x=>x.code===code&&x.type===type),r=revision.get(code);
 if(!asset||!r)return null;
 const detailed=detailedVisuals.assets.find(a=>a.code===code&&a.type===type);
 const p=r.detail,captionId='visual-caption-'+code+'-'+type;
 const points=type==='concept'?[p.purpose,'AI가 제안하고 담당자가 확정하는 대상: '+r.humanDecision,'담당자가 받는 결과: '+p.outputs.join(' · ')]:type==='overall'?['업무 화면 → 사건·계획·검증 → 담당 확인 → 허용 도구 → 공식 결과 대사','로컬 LLM과 근거·판본 저장소, 규칙·분석도구, 기존 원천 어댑터의 책임 분리','기존 서버의 논리 구성안. 실제 API·쓰기 권한·제품 구현범위는 현업 확인 후 확정']:p.steps.map(s=>s[0]+': '+s[1]+' → '+s[2]+' → '+s[3]);
 return <figure className="r47-diagram r47-generated" data-generated-diagram={type} data-generated-code={code}>
  <div className="r47-image-bar"><strong>{r.name} · {labels[type]}</strong><a href={href(asset.path)} target="_blank" rel="noopener noreferrer" aria-label={r.name+' '+labels[type]+' 원본 이미지 새 창에서 확대'}>원본 이미지 확대 ↗</a></div>
  <a className="r47-generated-link" href={href(asset.path)} target="_blank" rel="noopener noreferrer" aria-label={r.name+' '+labels[type]+' 이미지 확대'} aria-describedby={captionId}><img loading="lazy" decoding="async" width={asset.width} height={asset.height} src={href(asset.path)} alt={r.name+' '+labels[type]+'. '+asset.summary}/></a>
  <figcaption id={captionId}><span>이미지 모델 제작 · 현재 상세설계 기반 제안 · 도식 속 화면·자료·금액·지역·기간·지도는 설명용 예시</span><ul>{(detailed?.points||points).map((t,i)=><li key={i}>{t}</li>)}</ul></figcaption>
 </figure>;
}
