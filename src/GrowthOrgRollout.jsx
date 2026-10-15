import React from 'react';
import {Link} from './core.jsx';
import d from './growth-org-rollout.cjs';
import ministries from './growth-ministry-map.cjs';
const List=({items})=><ul>{items.map((x,i)=><li key={i}>{x}</li>)}</ul>;
const Links=({ids})=><div>{ids.map(id=><Link className="growth-id" key={id} to={'growth-ai.html#'+id}>{id}</Link>)}</div>;
export function GrowthOrgRollout(){return <div>
 <h3>{d.title}</h3><p>{d.intro}</p>
 <h3>{d.identityDifference.title}</h3><p>{d.identityDifference.personalization}</p><p>{d.identityDifference.organizationNative}</p><p className="growth-note">{d.identityDifference.limit}</p>
 <div className="growth-records">{d.userNeeds.map(x=><article key={x.id}><span className="growth-id">{x.id}</span><h3>{x.title}</h3><p>{x.detail}</p><Links ids={x.requirementIds}/></article>)}</div>
 <ol className="growth-timeline">{d.priorityStages.map(x=><li key={x.id}><h3>{x.title}</h3><p>{x.action}</p><p><strong>{d.labels.output}</strong> · {x.output}</p><p>{x.gate}</p></li>)}</ol>
 <h3>{d.labels.ministries}</h3><p>{ministries.note}</p>
 <div className="growth-records">{ministries.rows.map(x=><article key={x.id}><h3>{x.ministry} · {x.agency}</h3><p className="growth-state">{x.relationLabel}</p><List items={x.confirmed}/><p><strong>{d.labels.candidate}</strong></p><List items={x.workExamples}/><p><strong>{d.labels.unknowns}</strong></p><List items={x.unknowns}/>{x.sources.map((s,i)=><p key={i}><a href={s.url} target="_blank" rel="noreferrer">{s.title} ↗</a><small> · {s.readLevel} · {s.publishedOrEffective} · {d.labels.checkedAt} {s.checkedAt} · {s.note}</small></p>)}</article>)}</div>
 <h3>{d.labels.pilots}</h3><div className="growth-bundles">{d.pilotWorkflows.map(x=><article key={x.id}><span className="growth-id">{x.id}</span><h3>{x.name}</h3><p><strong>{d.labels.department}</strong> · {x.organizations.map(o=>o.name).join(" · ")}</p><p>{x.organizationUse}</p><p><strong>{d.labels.request}</strong> · {x.request}</p><List items={x.jobRoles}/><p>{x.supportResult}</p><p><strong>{d.labels.delta}</strong></p><List items={x.additionalFunctions}/><details><summary>{d.labels.organizationEvidence}</summary>{x.organizations.map(o=><div key={o.orgCode}><h4>{o.path}</h4><p className="growth-state">{o.orgCode} · {o.observedAt}</p><List items={o.dutyCandidates.map(z=>z.text)}/><a href={o.sourceUrl} target="_blank" rel="noreferrer">{d.labels.official} ↗</a></div>)}<p>{x.additionalOrganizationNeed}</p><h4>{d.labels.neededEvidence}</h4><List items={x.neededEvidence}/></details><Links ids={[...x.requirementIds,...x.testIds]}/><Link to={'growth-ai.html#growth-'+x.id}>{d.labels.annual} →</Link></article>)}</div>
 <details><summary>{d.labels.mappingContract}</summary><div className="growth-records">{d.mappingContract.map(x=><article key={x.key}><h3>{x.title}</h3><code>{x.fields.join(' · ')}</code><p>{x.rule}</p></article>)}</div></details>
 <h3>{d.labels.acceptance}</h3><div className="growth-records">{d.acceptance.map(x=><article key={x.id}><h3>{x.title}</h3><p>{x.scenario}</p><p>{x.expected}</p><small>{x.evidence}</small><Links ids={x.testIds}/></article>)}</div><p>{d.acceptanceRule}</p><p>{d.costBoundary}</p><p className="growth-note">{d.boundary}</p>
 </div>}
