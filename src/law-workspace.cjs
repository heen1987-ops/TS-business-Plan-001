'use strict';
const legal=require('./data.json').legal,mandates=require('./law-mapping.cjs'),rules=require('./ts-organization-rules.cjs');
const authorities=[{id:'all',name:'전체 권한·위탁 주체'},{id:'molit',name:'국토교통부 관련 업무'},{id:'local',name:'지방자치단체 관련 업무'},{id:'other',name:'기타 권한·지정체계'}];
const records=legal.rows.map(row=>{
 const authorityIds=[];
 if(row.principal.includes('국토교통부'))authorityIds.push('molit');
 if(/시·도지사|시장|군수|구청장|지방조사/.test(row.principal))authorityIds.push('local');
 if(!authorityIds.length||/지정체계/.test(row.principal))authorityIds.push('other');
 const work=mandates.bindings.filter(b=>b.lawId===row.id).map(b=>({id:b.id,task:b.task,owner:b.owner,ownerStatus:b.ownerStatus,sourceIds:b.sourceIds,organizations:rules.bindings.filter(n=>n.inRule&&n.name.length>3&&b.owner.includes(n.name)).map(n=>({code:n.code,name:n.name,rule:n.locator})),solutions:b.concepts.map(c=>({code:c.code,name:c.department.name,title:c.department.title,relation:c.label,url:mandates.mappingPath(c.code)}))}));
 return {...row,authorityIds,work,lawSources:row.refs.map(id=>legal.sources.find(s=>s.id===id)).filter(Boolean)};
});
const labels={title:'부처·법령·업무 체계',subtitle:'관계법령 → 수행업무 → 담당 조직·전략과제 → AI 지원',flow:['부처·기관','관계법령','법정·위탁업무','담당 조직·직무','12대 전략과제','AI 지원'],basis:'한국교통안전공단법',sourceDate:legal.date,scope:'기존 법령 원장 27개 업무묶음 · 전체 사무 목록과 구분',sourceNote:'법령 원장 기준일 2026-09-23 · 제공 직제시행세칙 2026-06-30 개정본 대조 · 후속 법령 개정·개별 위탁·지정의 별도 확인'};
function markdown(){return '# 부처·관계법령·업무·조직·AI 지원 연결\n\n- 탐색 순서: '+labels.flow.join(' → ')+'\n- '+labels.sourceNote+'\n\n'+records.map(r=>'## '+r.id+' '+r.title+'\n\n- 원 권한·위탁 주체: '+r.principal+'\n- 관계법령: '+r.law+'\n- 업무: '+r.work.map(w=>w.task).join(' / ')+'\n- 담당 조직: '+r.org+'\n- 수행 근거 유형: '+r.mode+'\n- 검토사항: '+r.boundary+'\n- 원문: '+r.lawSources.map(s=>'['+s.name+']('+s.url+')').join(' / ')+'\n- 다음 단계: 담당 조직·업무별 필요 기능 확인 후 AI 지원 구성\n').join('\n');}
module.exports={authorities,groups:legal.groups,records,labels,foundation:legal.sources.find(s=>s.id==='foundation'),markdown};
