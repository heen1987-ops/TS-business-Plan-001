const fs=require('node:fs'),path=require('node:path');
module.exports=function(out){
 const d=require('../src/association-research.json'),g=d.gap_review;
 fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(path.join(out,'association-research.json'),JSON.stringify(d,null,2));
 const md=['# '+d.publication.title,'',d.checked_at+' · '+g.status,'',d.publication.scope,'',
 '**'+g.headline+'**. 기관 전체에 공백이 없다는 결론과 구별.','',
 '## 기존 후보 재검토',''];
 const n=d.news_research;
 md.splice(md.length-2,2);
 md.push('## '+n.title,'',n.scope,'',n.lead,'',...n.method.map(x=>'- '+x),'');
 for(const c of n.cases){
  md.push('### '+c.id+' '+c.title,'','**'+c.status+'**','',c.fact,'','- 기사: ['+c.article.title+']('+c.article.url+') / '+c.article.publisher+' / '+c.article.date,'- 열람: '+c.article.read_status,'- [네이버 검색 확인]('+c.search.url+') / '+c.search.checked_at,'- 시점: '+c.event_period,'- 기존 대응: '+c.existing,'');
  for(const s of c.official_sources)md.push('- 공식 근거: ['+s.title+']('+s.url+') / '+s.date+' — '+s.fact+' 확인 범위: '+s.read_status+' / '+s.limit);
  md.push('','#### 반증과 적용 가설','',...c.counterevidence.map(x=>'- '+x),'','- 남은 공백 가설: '+c.remaining,'- TS 권한 경계: '+c.ts_boundary,'- CCK 가설: '+c.llm,'- 일반 SI·운영 대안: '+c.rules,'- 흐름: '+c.workflow.join(' → '),'- 자료: '+c.needed_data.join(' / '),'- 중단·축소: '+c.stop,'','#### 효과 측정안 · 실측·목표 미확정','');
  for(const m of c.metrics)md.push('- **'+m.name+'**: '+m.formula+' / '+m.method);
  md.push('','- 연결 검토 후보: '+c.proposal_ids.join(', ')+' / 관련 조직: '+(c.org_ids.join(', ')||'특정 단체 미지정')+' — 업무 관련 의견 확인대상이며 사건 당사자·책임 귀속 아님.','');
 }
 md.push('### '+n.evaluation.title,'');for(const [k,v]of Object.entries(n.evaluation))if(k!=='title')md.push('- '+v);
 md.push('','### 후속 조사 대기열','');for(const q of n.queue)md.push('- '+q.topic+': '+q.question+' / '+q.owner);
 md.push('',n.review.result,'',n.review.scope,'','## 기존 후보 재검토','');
 for(const r of g.reviews)md.push('### '+r.id+' '+r.title,'','- 상태: '+r.status,'- 기존 서비스·요구·계획: '+r.existing,'- 다음 확인: '+r.probe,'- 제외: '+r.exclude,'');
 md.push('## 상담·민원 기존 요구·논의 범위','');
 for(const r of g.exclusions)md.push('- '+r[0]+' '+r[1]+' / '+r[2]+' / 근거 '+r[3]+' / '+r[4]);
 md.push('','RFP·제안·인터뷰는 실제 납품·운영 완료와 구별.','',
 '## 절차상 한계와 철회 조건','');
 for(const p of g.probes)md.push('### '+p.id+' '+p.title,'','- 상태: '+p.status,'- 사실: '+p.fact,'- 필요한 결과: '+p.needed_result,'- 대조: '+p.check,'- 일반 SI: '+p.si,'- CCK 검토: '+p.llm,'- 철회 조건: '+p.kill,'- 근거: '+p.source_ids.join(', '),'');
 md.push('## 협회·관련 조직','',d.items.length+'개는 단체·지역조직·공제·교육기관 기록. 독립 협회 수·전국 전수조사 완료와 구별.','');
 for(const r of d.items)md.push('### '+r.id+' '+r.name,'','- 분야·지역: '+r.sector+' / '+r.scope,'- 정의: '+r.definition,'- 대표: '+r.represented,'- 의의: '+r.significance,'- 확인: '+r.role_status,'- 민원수준: '+r.complaint_status,'- 직접 근거: '+(r.direct_issue_ids.join(', ')||'미확보'),'- 업종 공통 참고: '+(r.sector_issue_ids.join(', ')||'미확보'),'- 조사 후보: '+r.proposal_ids.join(', '),r.homepage_url?'- [홈페이지·공식 채널]('+r.homepage_url+')':'- 홈페이지·공식 채널: 미확보','');
 md.push('## 공개 문제 근거','');
 for(const i of d.issues)md.push('### '+i.id+' '+i.title,'',i.fact,'','- 성격: '+i.type+' / '+i.evidence_level,'- 한계: '+i.limits,'- TS 접점: '+i.TS_boundary,'- [원문]('+i.source_url+') / '+(i.date||'게시일 미표시'),'');
 md.push('## 후보별 설계 이력 — 신규성 미확정','');
 for(const p of d.proposals){const e=p.enhancement;md.push('### '+p.id+' '+p.title,'',p.status,'','- 확인 사실: '+e.confirmed,'- 한계: '+e.gap,'- 대상: '+p.who,'- 기대편익: '+p.benefit,'- 업무 단위: '+e.case_unit,'- 완료: '+e.finish,'- 범위: '+e.scope,'- LLM: '+e.llm,'- 정형 처리: '+e.rules,'- 담당: '+e.human,'- 권한 경계: '+e.boundary,'- 재계획: '+e.replan,'- 개인정보: '+e.privacy,'- 검증: '+e.validation,'','#### 서비스 흐름','');
 for(const group of e.flow_groups||[{name:'처리 흐름',flow:e.flow}]){md.push('**'+group.name+'**','');for(const row of group.flow)md.push('- '+row.join(' / '));}
 md.push('','#### 데이터·도구·검수·효과','');for(const row of e.data)md.push('- 데이터: '+row.join(' / '));for(const t of e.tools)md.push('- 도구: '+t.name+' / '+t.mode+' / '+t.input+' → '+t.output+' / 실패: '+t.failure);for(const r of e.requirements)md.push('- 시험안(미수행): '+r.id+' '+r.name+' / '+r.test_case+' / 수용: '+r.acceptance);for(const k of p.kpis)md.push('- 측정안: '+k.join(' / '));md.push('','기준선·목표·비용 미확정. 제품시험·기관 효과 검증 전.','');}
 md.push('## 추가 대조자료','');for(const e of d.enhancement.evidence)md.push('- ['+e.id+' '+e.title+']('+e.url+') / '+(e.published_at||'게시일 미표시')+' — '+e.fact+' 한계: '+e.limit);
 md.push('','## 이번 판정 근거','');for(const s of g.sources)md.push('### '+s.id+' '+s.title,'',s.url?'[공식 원문]('+s.url+')':s.availability,'','- 날짜: '+(s.date||'미표시')+' / 열람 '+g.date,'- 위치: '+s.locator,'- 사실: '+s.fact,'- 한계: '+s.limit,'');
 md.push('## 전체 출처 목록','');for(const s of d.sources)md.push('- '+s.id+' ['+s.title+']('+s.url+') / 열람 '+s.checked_at+' / '+s.reading_status);
 fs.writeFileSync(path.join(out,'association-research.md'),md.join('\n'));
};
