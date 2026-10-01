const fs=require('node:fs'),path=require('node:path'),d=require('../src/analysis-review.cjs'),departments=require('../src/data.json').departments;
const name=code=>departments.find(v=>v.code===code)?.name||code;
function markdown(){const lines=['# '+d.title,'',d.date+' · '+d.version,'',d.status,'',d.origin.scope,'',d.origin.deepResearch,'','## 1. 처별 현재 편성 검토',''];
 for(const r of Object.values(d.departments)){lines.push('### '+r.code+' · '+name(r.code),'','검토 상태: '+r.status,'',...['purpose','why','how','records','measure','exclude'].map(k=>'- '+({purpose:'목적',why:'현행 한계·검증 필요',how:'CCK 기술적 처리',records:'필요 원기록',measure:'측정할 변화',exclude:'제외·보류 조건'}[k])+': '+r[k]),'',r.decision,'');}
 lines.push('## 2. DRT 운영 실증','',d.drt.status,'',d.drt.why,'',d.drt.purpose,'',d.drt.how,'',d.drt.records,'',d.drt.measure,'',d.drt.exclude,'',...d.drt.causes.map(r=>'- '+r.join(' / ')),'','## 3. 공통 플랫폼의 초기 범위','',...Object.values(d.platform),'');
 for(const m of d.modules)lines.push('### '+m.id+' · '+m.title,'','우선: '+m.codes.map(name).join(' · ')+' / 조건부: '+m.optional.map(name).join(' · '),'',m.how,'','산출: '+m.deliverables,'검증: '+m.metrics,'');
 lines.push('## 4. 근거 해석의 정정','',...d.corrections.map(r=>'- '+r.join(' / ')),'',d.audit.status,'',d.audit.scope,'');
 for(const [id,claim,a,b,c,why]of d.audit.claims)lines.push('### '+id+' · '+claim,'','독립 판정 A/B/C: '+[a,b,c].join(' / '),'',why,'');
 const csv=d.audit.csv;lines.push('### 공개 CSV 재집계','',csv.fileTitle,'','전체 '+csv.rows+'행 / 재검일 기재 '+csv.datePresent+'행 / 공란 '+csv.dateBlank+'행. '+csv.definition+' '+csv.ratio.toFixed(1)+'%.','',csv.method,'',csv.limit,'','SHA-256: '+csv.sha256,'','## 5. 추가 문제 후보 · 발생 규모 미확인','');
 for(const c of d.candidates){lines.push('### '+c.id+' · '+c.title,'',c.status,'','- 업무 접점: '+c.owner,'- 문제 질문: '+c.problem,'- 기술 처리: '+c.how,'- 현장 확인: '+c.records,'- 측정 후보: '+c.metrics.join(' · '),'- 기준선·목표: 미확보·미설정','- 축소·중단: '+c.stop,'',...c.refs.map(id=>'- ['+d.sources[id].title+']('+d.sources[id].url+') · '+d.sources[id].limit),'');}
 lines.push('## 6. 기존 4개 기획의 보강','');for(const r of d.refinements)lines.push('### '+r.title,'',r.problem,'',r.how,'','필요 기록: '+r.records,'','축소·중단: '+r.stop,'');
 lines.push('## 7. 편익·착수 판단','',...d.comparison.map(r=>'- '+r.join(' / ')),'',d.measurement,'',...d.gate.map(r=>'- '+r.join(' / ')),'',d.documentNote,'','## 8. 공식 출처·확인 범위','');
 for(const [id,s]of Object.entries(d.sources))lines.push('### '+id+' · ['+s.title+']('+s.url+')','','게시 '+s.published+' / 확인 '+s.checkedAt+' / 위치 '+s.locator,'','확인 사실: '+s.fact,'','한계: '+s.limit,'');return lines.join('\n');
}
module.exports=function(out){fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'site-analysis-review.md'),markdown());fs.writeFileSync(path.join(out,'site-analysis-review.json'),JSON.stringify(d,null,2));console.log('사이트 분석 반영: 13처·DRT·3모듈·6가설·10공식출처 · MD/JSON');};
module.exports.markdown=markdown;
