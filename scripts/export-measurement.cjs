const fs=require('node:fs'),path=require('node:path');
const m=require('../src/measurement-data.cjs'),impact=require('../src/current-impact.cjs'),{targetLabel}=require('../src/impact-math.cjs');
function exportMeasurement(out){
 fs.mkdirSync(out,{recursive:true});
 let md='# TS 처별 정량평가 측정명세\n\n- 판본: '+m.version+'\n- 대상: 13개 처 · 39개 지표\n- 상태: 기준선·실측값·표본 수·기관 승인 미확정\n- 용도: 현업 협의·평가계획 수립·RFP 측정 요구사항 초안\n\n';
 md+='## 사용 순서\n\n1. 업무 담당자와 대상·판정 기준·자료 접근 확인\n2. 기준선 수집 및 표본/비교 설계 확정\n3. 모델·평가표·분모·기한·품질조건 사전 고정\n4. 원장·이벤트·시간일지·독립 판정표 수집\n5. 분석 코드로 효과·불확실성·누락/탈락/위반 집계\n6. 기관 확인 후 목표·효과·계약 인수의 각각 판정\n\n';
 md+='## 공통 평가기준\n\n'+m.common.map(([k,v])=>'### '+k+'\n\n'+v+'\n').join('\n');
 md+='\n## 출처와 적용 범위\n\n측정방법 참고 원문 열람일: 2026-09-23. 해외 평가 지침은 한국 기관의 법정 요건으로 사용하지 않음. 기존 TS 업무 근거와 가설 목표 수치는 별도 관리.\n\n'+m.sources.map(s=>'- ['+s.id+' · '+s.title+']('+s.url+'): '+s.scope).join('\n')+'\n\n';
 for(const [id,p]of Object.entries(m.metrics)){
  const d=impact.departments[p.code],metric=d.metrics.find(x=>x.id===id);
  md+='## '+id+' · '+p.title+'\n\n- 목표: '+targetLabel(metric)+' · 실측 전 협의용 목표안\n- 기준선: 미확보 / 측정값: 미측정 / 필요 표본: 산정 전\n- 기존 산식: '+metric.formula+'\n- 사업 필요성: '+d.why+'\n- 목표 근거수준: '+metric.evidenceLevel+'\n- 목표의 가정: '+metric.model+'\n\n';
  for(const s of m.sections(id))md+='### '+s.title+'\n\n'+s.rows.map(([k,v])=>'- **'+k+'**: '+v).join('\n')+'\n\n';
  md+='### 기존 업무근거 연결\n\n'+d.sourceIds.map(sid=>impact.sources.find(s=>s.id===sid)).filter(Boolean).map(s=>'- ['+s.title+']('+s.url+') · '+s.date+'\n  - 기존 조사 요지: '+s.fact+'\n  - 한계: '+s.limit).join('\n')+'\n\n';
 }
 md+='## 결과 기록표 작성방법\n\nCSV는 군 A·B·C별 빈 행이며 관측자료가 아님. 군별 원 통계값을 먼저 입력하고 A대비/B대비 효과와 구간은 C행에 작성. A대비·B대비 각각의 효과척도/단위와 95% 구간을 별도 열에 기록. 군별 원 통계값의 구간은 분석부록에 별도 기재. 발생률비는 상대감소율 구간으로 변환 후 기록. 미확보는 0이 아닌 빈칸과 결측 사유로 기록. 가명ID만 사용.\n\n';
 md+='## RFP 측정 요구사항 초안\n\n- 모집단·이벤트·판정·증빙의 데이터 사전 및 지표별 수집명세 제출\n- 분모 동결·중복·미완료·결측·판본 변경 이력의 보존\n- 기관이 제공하는 승인된 표본으로 집계 재현 및 원문 역추적\n- A→C 총효과·B→C 추가효과·역할별 총부담·품질위반의 구분 보고\n- 원자료 접근·비교설계·표본 부족으로 판단할 수 없는 지표의 유보 근거 제출\n- 목표 수치는 기준선과 평가설계 합의 전 즉시 계약 보장수치로 전환하지 않는 조건\n\n';
 const csv=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
 const entries=Object.values(m.metrics).flatMap(p=>['A','B','C'].map(arm=>m.resultColumns.map(c=>({'지표ID':p.id,'판본':m.version,'군':arm}[c]??''))));
 fs.writeFileSync(path.join(out,'TS_정량평가_측정명세.md'),md);
 fs.writeFileSync(path.join(out,'TS_정량평가_측정명세.json'),JSON.stringify({version:m.version,status:'측정 설계안 · 미실측',common:m.common,sources:m.sources,metrics:m.metrics,rubrics:m.rubrics,scoreGuide:m.scoreGuide},null,2));
 fs.writeFileSync(path.join(out,'TS_정량평가_결과기록표.csv'),'\ufeff'+[m.resultColumns,...entries].map(row=>row.map(csv).join(',')).join('\r\n')+'\r\n');
}
module.exports=exportMeasurement;
if(require.main===module)exportMeasurement(path.resolve(__dirname,'../dist/downloads'));
