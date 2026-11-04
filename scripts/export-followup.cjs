'use strict';
const fs=require('node:fs'),path=require('node:path');
const plan=require('../src/followup-plan.cjs'),comparison=require('../src/followup-comparison.json'),cases=require('../src/followup-cases.json');
function markdown(){
 const lines=['# '+plan.meta.title,'',plan.meta.date+' · '+plan.meta.version+' · '+plan.meta.status,'',plan.meta.subtitle,'',
 '기존 계약·요구·배포·시험·검수·운영을 대조한 뒤 순증 범위만 후속사업으로 검토. 기능 확인은 실측 성능이 아니며 미확인은 미지원 판정이 아님.','',
 '## 1. TS 기본정보와 현행 기준선',''];
 for(const b of plan.basics)lines.push('### '+b.title,b.text,'[기존 기본자료](https://heen1987-ops.github.io/TS-business-Plan-001/'+b.to+')','');
 for(const b of plan.baseline)lines.push('### '+b.title+' · '+b.state,'- 현행: '+b.known,'- 확인: '+b.check,'- 후속: '+b.next,'- 근거: '+b.source,'');
 lines.push('## 2. AI 서비스 기능 비교','',comparison.basis,'');
 for(const r of comparison.rows){lines.push('### '+r.id+' '+r.title,'','| 서비스 | 확인한 기능·결과 |','|---|---|',...['ts','chatgpt','claude','gemini'].map((id,i)=>'| '+['TS AI Mate','ChatGPT','Claude','Gemini'][i]+' | '+r[id]+' |'),'','- 이용 조건: '+r.condition,'- TS 적용 제안: '+r.implication,'- 공식 근거: '+r.sourceIds.map(id=>{const s=comparison.sources.find(s=>s.id===id);return '['+s.title+']('+s.url+')'}).join(' · '),'');}
 lines.push('## 3. 대표 사례와 적용 경계','','143건은 2024 17건 + 2025 110건 + 2026 16건의 검토 항목. 독립 사업·성과 143개가 아님. 대표 12건을 아래에 연결.','');
 for(const c of cases)lines.push('### '+c.id+' '+c.title,'',c.organization+' · '+c.stage,'- 원사례: '+c.observed,'- TS 적용 제안: '+c.application,'- 현행·착수 경계: '+c.boundary,'- 검증: '+c.validation,'- 출처: ['+c.source.title+']('+c.source.url+') · '+c.source.locator+' · 확인 '+c.source.checkedAt,'');
 lines.push('## 4. 3영역과 설명 깊이','','L1~L3은 기능 의존관계, D1~D4는 설명 상세 수준. 연도와 사업 순서를 별도로 관리.','');
 for(const d of plan.depths)lines.push('- '+d.code+' '+d.title+': '+d.description+' / 예: '+d.example);
 for(const l of plan.layers){lines.push('','### '+l.code+' '+l.title,l.question,'- 역할: '+l.role,'- 책임: '+l.owner,'- 산출물: '+l.output,'- 현행 경계: '+l.boundary,'');for(const g of l.groups)lines.push('#### '+g.id+' '+g.title,...g.items.map(x=>'- '+x),'- 검증: '+g.gate,'');}
 lines.push('## 5. 후속사업 후보','','F01~F10은 업무 결과 중심 재구성안. 기존 38개 컨셉·16개 과제와 단순 합산하지 않음.','');
 for(const p of plan.projects){lines.push('### '+p.id+' '+p.title,'',p.priority+' · '+p.status,'- 목적: '+p.purpose,'- 현행: '+p.current,'- 순증 후보: '+p.delta,'- 입력: '+p.inputs,'- 처리: '+p.flow.join(' → '),'- 산출물: '+p.output,'- 담당: '+p.owner,'- 예외·인계: '+p.exceptions,'- 지표: '+p.metrics.join(' / '),'- 착수 조건: '+p.gate,'- 연결 역량: '+p.modules.join(', '),'- 비교 기능: '+p.comparisons.join(', '),'- 대표 사례: '+(cases.filter(c=>c.projectIds.includes(p.id)).map(c=>c.id).join(', ')||'직접 대응 사례 미배정. TS 현행·업무 표본을 우선 검증.'),'');}
 lines.push('## 6. 대안·실행 로드맵','');
 for(const [id,title,condition,validation]of plan.alternatives)lines.push('- '+id+' '+title+': '+condition+' / '+validation);
 for(const r of plan.roadmap)lines.push('','### '+r.year+' '+r.title,'- 인프라: '+r.infra,'- 지식인프라: '+r.knowledge,'- 서비스: '+r.service,'- 담당: '+r.owner,'- 산출물: '+r.output,'- 다음 단계 조건: '+r.gate);
 lines.push('','## 7. 자료 판본·검증 한계','');
 for(const s of plan.sources)lines.push('- '+s.id+' '+s.title+' ('+s.version+'): '+s.scope+' / '+s.note);
 lines.push('','현행 운영·성능·자료 권리·예산·후속사업 승인은 미확정. 동일 입력·완료 기준의 실제 실증은 수행하지 않음. 사이트 작성·배포 검증과 실제 TS 시스템 구축·운영을 구분.','');
 return lines.join('\n');
}
function files(){return {'ts-followup-plan-v2.md':markdown(),'ts-followup-data-v2.json':JSON.stringify({plan,comparison,cases},null,2)+'\n'};}
module.exports=out=>{fs.mkdirSync(out,{recursive:true});for(const [name,body] of Object.entries(files()))fs.writeFileSync(path.join(out,name),body);};
module.exports.files=files;
