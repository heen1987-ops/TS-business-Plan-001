import React from 'react';
export function PageFrame({eyebrow,title,description,actions,children,className=''}){return <article className={'on-page '+className}><header className="ui-page-header"><span className="ux-eyebrow">{eyebrow}</span><h1>{title}</h1>{description&&<p>{description}</p>}{actions&&<div className="ax-downloads">{actions}</div>}</header>{children}</article>;}
