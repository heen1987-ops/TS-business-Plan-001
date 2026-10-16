import React from 'react';
import {Link} from './core.jsx';
import {OrganizationExplorer} from './OrganizationSite.jsx';
import {WorkMapWorkspace} from './WorkMapWorkspace.jsx';
import {DutyWorkspace} from './DutyWorkspace.jsx';
export function OrganizationWorkspace({route}){const p=new URLSearchParams(location.search),view=p.get('view'),org=p.get('org')||'all',isTree=view==='tree';const navigation=<div className="org-view-switch" aria-label="조직·직무 보기"><Link to={'organization.html?view=tree'+(org==='all'?'':'&org='+org)} aria-current={isTree?'page':undefined}>조직도·역할</Link><Link to={'organization.html?view=work-map&org='+org} aria-current={!isTree?'page':undefined}>부서별 세부 업무</Link></div>;return <div className="org-unified">{isTree?<OrganizationExplorer route={route} navigation={navigation}/>:view==='duties'?<DutyWorkspace key={route} navigation={navigation}/>:<WorkMapWorkspace route={route} navigation={navigation}/>}</div>;}
