const fs=require('node:fs'),path=require('node:path'),p=require('../src/planning-2027.cjs'),review=require('../src/analysis-review.cjs');
function markdown(){
 const lines=['# '+p.title,'',p.date+' · '+p.version,'',p.status,'',p.objective,'','## 1. 2027년 기획의 범위',''];
 for(const [title,text]of p.scope)lines.push('### '+title,'',text,'');
 lines.push('## 2. 사이트 분석 대화의 최신 방향','',p.latest.direction,'',p.latest.availability,'','조회: '+p.latest.checkedAt+' / 대화: '+p.latest.title,'','## 3. 기존 제안과 신규 탐색의 관계','');
 for(const row of p.portfolio)lines.push('### '+row[0],'',row[1],'',row[2],'');
 lines.push('## 4. 타당성 선별의 5개 관문','');
 for(const [id,title,evidence,condition]of p.evidenceGates)lines.push('### '+id+' · '+title,'','필요 근거: '+evidence,'','판단 조건: '+condition,'');
 lines.push('## 5. 기존 후보의 2027년 편성 판단','', '아래 후보는 공식 업무 접점이 확인된 탐색 가설. 실제 문제의 규모·잔여 기능·AI 효과 검증 완료와 구분.','');
 for(const c of review.candidates){const r=p.candidateReviews[c.id];lines.push('### '+c.id+' · '+c.title,'','- 판단: '+r.decision,'- 필요한 근거: '+r.missing,'- 협의 대상: '+r.owner,'- 다음 검증: '+r.next,'- 문제 질문: '+c.problem,'- 중단·제외: '+c.stop,'','공식 업무 근거:','',...c.refs.map(id=>'- ['+review.sources[id].title+']('+review.sources[id].url+') · '+review.sources[id].limit),'');}
 lines.push('## 6. 편입·통합·보류·AI 제외의 기준','');
 for(const row of p.decisions)lines.push('### '+row[0],'',row[1],'',row[2],'');
 lines.push('## 7. 계획서·기술설계·RFP·대가·검수 연결','');
 for(const row of p.trace)lines.push('### '+row[0],'',row[1],'','필요 근거·완료조건: '+row[2],'');
 lines.push(p.estimate.status,'','총사업비·투입인월·기준선·목표값: 미산정·미설정. 신규 장비 구매 제외 조건을 총사업비 0원으로 해석하지 않음.','',p.documentNote,'','## 8. 전략 근거와 적용 한계','','['+p.reference.title+']('+p.reference.url+')','',p.reference.locator+' / 게시일 미표시 / 확인 '+p.reference.checkedAt,'',p.reference.limit,'');
 return lines.join('\n');
}
module.exports=function(out){fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'ts-planning-2027.md'),markdown());fs.writeFileSync(path.join(out,'ts-planning-2027.json'),JSON.stringify(p,null,2));};
module.exports.markdown=markdown;
