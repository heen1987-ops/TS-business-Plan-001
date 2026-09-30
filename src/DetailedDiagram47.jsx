import React from 'react';
import {href} from './core.jsx';
import visuals from './detailed-visuals47.json';

export function DetailedDiagram47({code,type}){
 const asset=visuals.assets.find(a=>a.code===code&&a.type===type);
 if(!asset)return null;
 const caption='detail-caption-'+code+'-'+type;
 return <figure className="r47-diagram r47-generated" data-detailed-diagram={type} data-detailed-code={code}>
  <div className="r47-image-bar"><strong>{asset.title}</strong><a href={href(asset.path)} target="_blank" rel="noopener noreferrer" aria-label={asset.title+' 원본 확대 · 새 탭'}>원본 이미지 확대 ↗</a></div>
  <a className="r47-generated-link" href={href(asset.path)} target="_blank" rel="noopener noreferrer" aria-label={asset.title+' 이미지 확대'} aria-describedby={caption}><img loading="lazy" decoding="async" width={asset.width} height={asset.height} src={href(asset.path)} alt={asset.summary}/></a>
  <figcaption id={caption}><p>{asset.caption}</p><ul>{asset.points.map(t=><li key={t}>{t}</li>)}</ul></figcaption>
 </figure>;
}
