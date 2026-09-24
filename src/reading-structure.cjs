const definitions=[
{id:'context',title:'업무와 사업의 목적',intro:'먼저 이 처가 맡은 업무와 대상자를 확인하고, 국민·기업에게 필요한 결과를 사업목적으로 연결.',ids:['detail-sixw','purpose','mandate','detail-why','why']},
{id:'change',title:'현행 한계와 전환 방향',intro:'기존 업무·시스템의 기반과 확인된 근거를 살펴보고, 추가로 바꿀 처리방식과 공공적 가치를 검토.',ids:['detail-limits','detail-evidence','detail-method','detail-concept','concept']},
{id:'service',title:'사용자와 업무의 흐름',intro:'실제 업무 한 건이 시작되어 보완·승인·후속조치까지 이어지는 과정을 역할과 사례로 설명.',ids:['detail-scenario','detail-service','flow-map','replan']},
{id:'design',title:'시스템과 데이터 설계',intro:'앞서 설명한 업무를 실행하기 위한 구성요소·데이터·저장소·외부 연계와 책임 경계의 구체화.',ids:['detail-overall','detail-data','detail-interfaces','flow-data']},
{id:'responsibility',title:'개인정보·책임·운영',intro:'누가 무엇을 조회·검토·승인하며, 잘못된 결과나 예외가 발생했을 때 어떻게 중단·정정·복구할 것인지 확인.',ids:['detail-privacy','detail-privacy-lifecycle','detail-access','detail-exceptions','implementation']},
{id:'outcomes',title:'도입 범위와 효과 검증',intro:'적용 단계와 검수 조건을 정하고, 개선효과를 실제 업무기록으로 측정한 뒤 다음 범위를 결정.',ids:['detail-delivery','detail-trace','detail-outcomes','detail-decisions','effect-boundary']}
];
function chaptersFor(sections,route){
 if(!sections.some(s=>s.id.startsWith('detail-')))return sections.length>9?generic(sections,route):[];
 const groups=definitions.map(d=>({...d,id:'chapter-'+d.id,sections:[]}));
 for(const s of sections){let i=definitions.findIndex(d=>d.ids.includes(s.id));if(i<0)i=5;groups[i].sections.push(s);}
 // 지표 측정의 조각은 동일 지표 아래 표시하고 원문 앵커는 유지.
 for(const g of groups)g.sections.sort((a,b)=>{const ia=definitions.find(d=>g.id==='chapter-'+d.id).ids.indexOf(a.id),ib=definitions.find(d=>g.id==='chapter-'+d.id).ids.indexOf(b.id);return (ia<0?100:ia)-(ib<0?100:ib)});
 return groups.filter(g=>g.sections.length);
}
function generic(sections,route){
 const {legal,departments}=require('./data.json'),path=route.split(/[?#]/)[0];
 if(['solutions.html','inspection.html','17_조직별_AX_전환제안.html'].includes(path)){return [
 {id:'chapter-selection',title:'제안의 목적과 검토 범위',intro:'기관 전체의 확정 사업이 아닌 처별 대표 과업의 기획안.',sections:sections.filter(s=>s.id==='catalog')},
 {id:'chapter-mobility',title:'모빌리티·교통안전 분야',intro:'안전관리·교육·데이터·정책·실증에 연결된 8개 처의 대표 제안.',sections:sections.filter(s=>departments.slice(0,8).some(d=>d.code===s.id))},
 {id:'chapter-inspection',title:'자동차검사 분야',intro:'검사 운영·특수시설·검사기술·연구에 연결된 5개 처의 대표 제안.',sections:sections.filter(s=>departments.slice(8).some(d=>d.code===s.id))}
 ].filter(g=>g.sections.length);}
 if(path==='legal.html'){return [{id:'chapter-law-overview',title:'법정업무의 범위와 읽는 방법',intro:'개별 법령·수행업무·원 권한자의 관계부터 확인.',sections:sections.filter(s=>['law-map','mandate-entry'].includes(s.id))},...legal.groups.map(g=>({id:'chapter-law-'+g.id,title:g.title,intro:g.desc,sections:sections.filter(s=>legal.rows.some(r=>r.group===g.id&&r.id===s.id))}))].filter(g=>g.sections.length);}
 return [];
}
module.exports={definitions,chaptersFor};
