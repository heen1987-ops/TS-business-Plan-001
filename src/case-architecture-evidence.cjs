'use strict';
const figures=require('./case-source-figures.json');
const reconstructions=require('./case-reconstruction-images.json');
function forCase(id){
 const found=figures.filter(f=>f.caseId===id);
 if(found.length)return {type:'원문 도식',detail:[...new Set(found.map(f=>f.status))].join(' / '),count:found.length};
 if(id==='PF-A12')return {type:'원문 도식 공유 참조',detail:'GOV.UK Chat의 AX06 원문 그림 2개를 플랫폼 관점에서 공유 참조; 독립 확보 아님',count:0,sharedFrom:'AX06'};
 if(reconstructions[id])return {type:'자료 기반 이미지 재구성',detail:'원문 요구·설명을 바탕으로 CCK가 재구성',count:0};
 if(id==='PF06')return {type:'공식 API 문서 기반 논리 재구성',detail:'공개 API 명세를 CCK 서비스 계층에 적용',count:0};
 return {type:'출처 설명 기반 논리 재구성',detail:'원문에 미공개된 연결은 CCK 분석',count:0};
}
module.exports={forCase};
