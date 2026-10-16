'use strict';
// CCK 재구성 도면의 경로 유형. 원문에서 확인된 제품 배치가 아니라 사례별 업무·자료·통제의 연결이다.
const groups={
 document:['AX08','AX21','AX24','AX25','PF-R01','PF-R04','PF02','PF-A14'],
 retrieval:['AX06','AX09','AX13','AX19','AX22','AX26','PF-R03','PF-R05','PF-R07','PF01','PF-A03','PF05','PF-A08','PF-A09'],
 transaction:['AX02','AX15','PF-R06','PF03','PF04','PF06','PF07','PF08','PF-C03'],
 realtime:['AX05','AX10','AX14','AX16','AX17','AX18','AX20'],
 analytics:['AX01','AX11','AX12','AX23','PF-R02','PF-A15'],
 governance:['AX03','AX04','AX07','PF-R08','PF-R09','PF-A06','PF-A16','PF-A18','PF-C01','PF-C02']
};
const patterns={
 document:{label:'원문 추출·대조·사람 확정',rows:[['C01','C04','C05','C06','C07'],['C09','C10','C03','C11','C08']],links:[
  ['C01','C04','service','서류·요청'],['C09','C10','data','원문 반입'],['C10','C04','data','정제 원문'],['C03','C05','data','규정·대조 기준'],['C04','C05','service','추출값'],['C05','C06','service','불일치·누락'],['C06','C07','service','확정 결과'],['C05','C11','record','판정 이력'],['C07','C08','record','업무 결과']],interfacePairs:['C09-C10','C10-C04','C04-C05','C03-C05','C05-C06','C06-C07']},
 retrieval:{label:'지식 갱신·검색·근거 응답',rows:[['C09','C10','C11','C03'],['C01','C02','C04','C05','C06','C07']],links:[
  ['C09','C10','data','공식 자료'],['C10','C11','data','판본·색인'],['C11','C03','data','허용 지식'],['C01','C02','service','질문·목적'],['C02','C03','service','검색 문맥'],['C03','C04','service','근거 문단'],['C04','C05','service','답변 초안'],['C05','C06','service','출처 확인'],['C06','C07','service','안내·인계']],interfacePairs:['C09-C10','C10-C11','C01-C02','C11-C03','C03-C04','C05-C06']},
 transaction:{label:'입력 구조화·확인·업무시스템 처리',rows:[['C01','C02','C04','C05','C06','C07'],['C09','C03','C11','C08']],links:[
  ['C01','C02','service','요청'],['C02','C04','service','업무 필드'],['C09','C03','data','원천 상태'],['C03','C04','data','조회 결과'],['C04','C05','service','구조화 초안'],['C05','C06','service','확인 대상'],['C06','C07','service','승인·실행'],['C07','C11','record','처리 상태'],['C11','C08','record','접수·취소 대사']],interfacePairs:['C01-C02','C02-C04','C09-C03','C04-C05','C06-C07','C07-C11']},
 realtime:{label:'관측·안전 판정·현장 조치·환류',rows:[['C09','C10','C04','C05','C07'],['C02','C03','C12','C06','C08']],links:[
  ['C09','C10','data','관측 입력'],['C10','C04','data','정합화 상태'],['C02','C03','data','현장 문맥'],['C03','C04','data','이력·설비'],['C04','C05','service','위험·제어 후보'],['C12','C05','control','안전 경계'],['C05','C06','control','사람·현장 확인'],['C06','C07','service','경고·조치'],['C07','C08','record','현장 결과'],['C08','C04','feedback','다음 주기']],interfacePairs:['C09-C10','C10-C04','C04-C05','C12-C05','C06-C07','C08-C04']},
 analytics:{label:'복수 자료 결합·분석·검토·평가',rows:[['C09','C03','C10'],['C04','C05','C06','C07','C08']],links:[
  ['C09','C10','data','관측 자료'],['C03','C10','data','비교 자료'],['C10','C04','data','정합화 특징'],['C04','C05','service','예측·분류 결과'],['C05','C06','control','오차·편향 확인'],['C06','C07','service','계획·의견'],['C07','C08','record','적용 결과'],['C08','C10','feedback','다음 평가']],interfacePairs:['C09-C10','C03-C10','C10-C04','C04-C05','C05-C06','C07-C08']},
 governance:{label:'권한·목적 판정 후 허용·차단 분기',rows:[['C01','C02','C12','C05'],['C09','C04','C06','C07','C08','C11']],links:[
  ['C01','C02','service','요청·대상'],['C02','C12','control','조직·목적'],['C12','C05','control','허용 정책'],['C09','C04','data','허용 원천'],['C05','C04','service','허용된 경우'],['C05','C11','blocked','거부·보류'],['C04','C06','service','처리 결과'],['C06','C07','service','사람 확인'],['C07','C08','record','업무·감사 기록']],interfacePairs:['C01-C02','C02-C12','C12-C05','C05-C04','C05-C11','C06-C07']}
};
const familyById=Object.fromEntries(Object.entries(groups).flatMap(([family,ids])=>ids.map(id=>[id,family])));
if(Object.values(groups).flat().length!==Object.keys(familyById).length)throw Error('사례 흐름 유형 중복');
function build(d,s,components){
 const family=familyById[d.canonicalId];if(!family)throw Error('사례 흐름 유형 누락: '+d.id);
 const pattern=patterns[family],rows=d.canonicalId==='AX06'?[['C09','C10','C11','C03','C08'],...pattern.rows.slice(1)]:pattern.rows;
 const links=d.canonicalId==='AX06'?[...pattern.links,['C07','C08','record','품질 로그']]:pattern.links;
 const edges=links.map(([from,to,kind,mode])=>({from,to,kind,mode}));
 const byPair=Object.fromEntries(edges.map(edge=>[edge.from+'-'+edge.to,edge]));
 const payload={C01:d.sequence[0].input,C02:d.sequence[0].output,C03:d.sequence[1].output,C04:d.sequence[2].output,C05:d.sequence[2].output,C06:d.sequence[3].output,C07:d.sequence[3].output,C08:d.operations,C09:s.architecture[2],C10:d.benchmark.functions[1].output,C11:d.benchmark.evidence,C12:components[11].title};
 const interfaces=pattern.interfacePairs.map((pair,i)=>{const edge=byPair[pair];if(!edge)throw Error(d.id+' 흐름 연결 누락 '+pair);return{id:'IF-'+String(i+1).padStart(2,'0'),from:edge.from,to:edge.to,mode:edge.mode,payload:payload[edge.from],check:edge.kind==='blocked'?d.benchmark.exception:edge.kind==='control'?s.control:edge.kind==='feedback'?d.operations:edge.kind==='data'?d.benchmark.functions[1].processing:d.benchmark.evidence};});
 return{diagram:{family,label:pattern.label,rows,edges,summary:d.sequence.map(step=>step.title).join(' → ')},interfaces,edges:edges.map(edge=>[Number(edge.from.slice(1))-1,Number(edge.to.slice(1))-1])};
}
module.exports={build,groups,patterns,familyById};
