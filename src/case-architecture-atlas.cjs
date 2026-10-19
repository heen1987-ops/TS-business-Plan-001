'use strict';
// 공개 원문과 사례별 논리 흐름을 묶는 전수 비교 원장. 운영 토폴로지 검증으로 해석하지 않는다.
const synthesis=require('./casebook-synthesis.cjs');
const reference=require('./case-architecture-reference.cjs');
const platform=require('./platform-architecture-dossiers.cjs').rows;
const ax=require('./ax-architecture-dossiers.cjs').rows;
const evidence=require('./case-architecture-evidence.cjs');
const figures=require('./case-source-figures.json');
const reconstructions=require('./case-reconstruction-images.json');
const deepAudit=require('./case-bottleneck-audit.cjs').rows;

const sharedFigures={'PF-A12':'AX06'};
function figureRole(figure){
 if(/기존 (?:정보)?시스템|기존 시스템/.test(figure.status))return '기존 시스템 현황';
 if(/예시/.test(figure.status))return 'RFP 예시 구성';
 if(/사전공개/.test(figure.status))return '사전규격 목표';
 if(/RFP|과업내용서|사전공개/.test(figure.status))return '발주·제안 목표';
 if(/초기 설계/.test(figure.status))return '공개 초기 설계';
 if(/공식 단계/.test(figure.status))return '개발사 공개 운영 단계';
 return '공개 기술 문서';
}
const sourceRows=[...platform,...ax];
const byId=Object.fromEntries(sourceRows.map(row=>[row.caseId,row]));
const rows=synthesis.allCases.map(item=>{
 const dossier=byId[item.id];
 if(!dossier)throw Error(item.id+' 구조 분석 누락');
 const pattern=reference.patterns.find(p=>p.id===reference.byCase[item.id]);
 if(!pattern)throw Error(item.id+' 공통 유형 누락');
 const figureId=sharedFigures[item.id]||item.id;
 const originalFigures=figures.filter(f=>f.caseId===figureId).map(f=>({...f,role:figureRole(f),sharedFrom:figureId===item.id?null:figureId}));
 const pair=reference.pairGroups.find(group=>group.ids.includes(item.id))||null;
 return {...dossier,title:item.title,kind:item.id.startsWith('AX')?'ax':'platform',
  pattern:pattern.id,patternTitle:pattern.title,strategies:synthesis.strategiesFor(item.id),
  sourceDetail:synthesis.caseSource(item.id),evidence:evidence.forCase(item.id),
  originalFigures,reconstruction:reconstructions[item.id]||null,
  pair,pairPeer:pair?pair.ids.find(id=>id!==item.id):null,
  deepAudit:deepAudit.filter(a=>a.caseId===item.id)};
});
if(rows.length!==57||new Set(rows.map(row=>row.caseId)).size!==57||sourceRows.length!==57)throw Error('57건 사례 구조 전수 일치 실패');
const byKind={platform:rows.filter(r=>r.kind==='platform'),ax:rows.filter(r=>r.kind==='ax')};
module.exports={rows,byKind,byId:Object.fromEntries(rows.map(r=>[r.caseId,r])),patterns:reference.patterns,pairGroups:reference.pairGroups,sharedFigures,figureRole};
