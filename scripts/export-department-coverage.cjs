const fs=require('node:fs'),path=require('node:path'),d=require('../src/department-coverage.cjs');
const base='https://heen1987-ops.github.io/TS-business-Plan-001/';
function markdown(){const lines=['# '+d.title,'',d.version+' · '+d.date,'',d.status,'',d.labels.scopeNote,'','## 확인 범위','', '| 범위 | 공식 처 수 | 문서 연결 | 미작성 |','| --- | ---: | ---: | ---: |',...['headquarters','katri','headquartersAndKatri'].map(k=>{const c=d.counts[k];return '| '+({headquarters:'본사',katri:'자동차안전연구원',headquartersAndKatri:'본사+연구원'})[k]+' | '+c.official+' | '+c.linked+' | '+c.missing+' |';}),'','지역본부 하위 처 유형 '+d.counts.regionalTypes+'종. 전국 설치 처 수 미확인(null).','','## 51개 처별 대조','','| 소속 | 처 | 상태 | 문서·관련 자료 | 확인 한계 |','| --- | --- | --- | --- | --- |'];
 for(const r of d.rows)lines.push('| '+r.parent+' | '+r.name+' | '+r.statusLabel+' | '+(r.planTo?'['+r.code+' 계획서·설계]('+base+encodeURI(r.planTo)+')':r.relatedTo?'['+r.relatedLabel+']('+base+encodeURI(r.relatedTo)+')':'개별 계획서 미작성')+' | '+r.note+' / '+r.sourceId+' |');
 lines.push('','## 지역본부 처 유형','');for(const r of d.regionalTypes)lines.push('### '+r.name,'',r.statusLabel,'',r.note,'','- ['+r.relatedLabel+']('+base+r.relatedTo+')','- 근거: '+r.sourceId,'');
 lines.push('','## 처 외 조직·업무','');for(const r of d.supplementary)lines.push('### '+r.type,'',r.names.join(' · '),'',r.note,'');
 lines.push('','## 문서·설계 검토','');for(const r of d.findings)lines.push('### '+r.title,'','- 확인: '+r.result,'- 한계: '+r.limit,'');
 lines.push('','## 공식 출처','');for(const s of d.sources)lines.push('### '+s.id+' '+s.title,'','- 원문: ['+s.title+']('+s.url+')','- 게시·개정일: '+s.published,'- 조사일: '+s.checkedAt,'- 확인 위치: '+s.location,'- 적용·한계: '+s.scope,'');
 return lines.join('\n')+'\n';}
module.exports=function(out){fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'department-coverage.json'),JSON.stringify(d,null,2)+'\n');fs.writeFileSync(path.join(out,'department-coverage.md'),markdown());};
module.exports.markdown=markdown;
