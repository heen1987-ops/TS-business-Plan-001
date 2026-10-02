import React from 'react';
import {Link,Out} from './core.jsx';
import manifest from './department-documents.json';
import publication from './document-publication.cjs';
export function DocumentSourceLinks({file}){return <div className="native-source-links"><Out url={publication.sourceUrl(file)}>{publication.labels.source}</Out><Out url={publication.rawUrl(file)}>{publication.labels.fallback}</Out></div>}
export function DepartmentDownloadLinks({code}){
 const department=manifest.departments.find(d=>d.code===code);
 if(!department)return null;
 return <ul className="analysis-native-files" data-planning-documents={code}>{department.documents.map(file=><li key={file.kind}><Link to={file.path} download={file.downloadName} data-planning-file={file.kind} aria-label={department.name+' '+file.label+' 한글 다운로드'}>{publication.shortLabels[file.kind]} ↓</Link><small>{file.version.replace('_r01','')} · HWPX</small></li>)}<li><Link to={publication.catalogue+'#documents-'+code}>파일 상세·GitHub 원본 ↗</Link></li></ul>;
}
