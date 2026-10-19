'use strict';
const fs=require('node:fs'),path=require('node:path');
const atlas=require('../src/case-architecture-atlas.cjs');
const checkedAt=require('../src/case-architecture-reference.cjs').checkedAt;
const safe=value=>String(value??'').replace(/\|/g,'\\|').replace(/\r?\n/g,' ');
const csv=value=>'"'+String(value??'').replace(/"/g,'""')+'"';
function caseSection(row){
 const o=row.outcome;
 const pair=row.pair?'\n- 교차 관점: '+row.pairPeer+' · '+row.pair.note+' (독립 구축 건수로 중복 산정하지 않음)':'';
 const figures=row.originalFigures.map(f=>'  - ['+f.title+'](../'+f.path+') · '+f.role+' · '+f.status+(f.sharedFrom?' · '+f.sharedFrom+' 그림 공유':'')+' · '+f.locator).join('\n');
 const reconstruction=row.reconstruction?'\n- CCK 이미지 재구성: ['+row.reconstruction.title+'](../'+row.reconstruction.path+') · '+row.reconstruction.status+' · '+row.reconstruction.basis:'';
 return '### '+row.caseId+' '+row.title+'\n\n'
  +'- As-Is · 기존 문제: '+o.asIs+'\n- To-Be · 의도한 변화: '+o.toBe+'\n- 기대효과 · 목표: '+o.expectedEffect+'\n- 확인 결과 · 관찰: '+o.observed+'\n- 성과 판정: **'+o.verdict+'** · '+o.verdictReason+'\n- 판단 범위: '+o.evidenceStage+' · '+o.limits+'\n- 판단 원문: ['+row.caseId+' 자료]('+(o.sourceUrl||row.sourceUrl)+')'
  +'\n- 구조 자료 단계: '+row.sourceStage+'\n- 구조 근거: '+row.architectureBasis+'\n- 원문 유형: '+row.evidence.type+' · '+row.evidence.detail+'\n- 비교 유형: '+row.pattern+' '+row.patternTitle+'\n- 전략 연결: '+row.strategies.join(' · ')
  +'\n- 논리 자료 흐름: '+row.flow.map((step,i)=>(i+1)+'. '+step).join(' → ')
  +'\n- 데이터 경계: '+row.dataBoundary+'\n- 판단 경계: '+row.decisionBoundary+'\n- 병목 분석: '+row.bottleneckStatus+' · '+row.bottleneck
  +'\n- 검증 질문: '+row.validation+'\n- CCK 설계 시사점: '+row.cckImplication+'\n- 미확인: '+row.unknowns+pair
  +'\n- 원문: '+row.sourceDetail.map(s=>'['+s.title+']('+s.url+')').join(' · ')
  +(figures?'\n- 원문 그림:\n'+figures:'')+reconstruction+'\n';
}
function markdown(){
 const patterns=atlas.patterns.map(p=>'| '+p.id+' | '+safe(p.title)+' | '+safe(p.boundary)+' | '+safe(p.bottleneck)+' | '+safe(p.cck)+' | '+safe(p.test)+' |').join('\n');
 const verdicts=['성과 확인','부분 성과','실패 확인','성과 미검증'].map(v=>'| '+v+' | '+atlas.rows.filter(r=>r.outcome.verdict===v).length+' |').join('\n');
 return '# 플랫폼·전략과제 57개 사례 구조 전수 분석\n\n'
  +'- 검토일: '+checkedAt+'\n- 범위: 플랫폼 사례 31개 항목 + 12대 전략과제 AX 사례 26개 항목. 4개 교차 관점 쌍의 동일 계열을 고려하면 53개 기관·제품군 수준. PF08에는 Assistant 외 Debrief도 포함되어 완전 중복으로 취급하지 않음.\n- 분석법: 공개 RFP·기술 문서·운영 발표·감사 자료의 관찰 범위를 기록하고, 사례별 논리 자료 흐름·경계·병목 후보·검증 질문을 분리. 제3자 운영 바이너리·서버·실행 추적을 확보하지 못한 사례의 내부 물리 배치나 실측 병목은 추정하지 않음.\n- 그림: 원문 그림 직접 등록 10개 사례 항목, AX06의 원문 그림을 공유 참조하는 PF-A12 1개 항목, CCK 이미지 재구성 3개 항목. PF-R03·PF-R06의 그림은 **기존 시스템 현황**이며 신규 AI 목표 아키텍처가 아님. RFP 그림은 목표 설계이며 실제 설치 확인이 아님.\n- 재구성 범위: 아래 7개 유형은 CCK의 비교·설계 틀로서 사례 기관의 실배치가 아님.\n\n'
  +'## 성과 판정 방법·분포\n\n사례마다 As-Is → 기대한 To-Be와 효과 → 확인 결과 → 판정 이유를 순서대로 검토. **성과 확인**은 공개 자료에서 목표와 관련된 운영 결과 확인, **부분 성과**는 실증·자기보고 또는 일부 업무 결과 확인, **실패 확인**은 감독·감사 등의 명시적 문제 확인, **성과 미검증**은 RFP·제품 설명·도입 발표만 있거나 효과 측정 부재. 판정은 해당 자료의 관찰 범위에 한정하며 전후 기준선·비교군 없는 수치는 인과효과로 단정하지 않음.\n\n| 판정 | 사례 항목 |\n| --- | ---: |\n'+verdicts+'\n\n교차 관점 4쌍 포함 사례 항목 수이며 독립 시스템의 성공·실패 건수 아님.\n\n'
  +'## TS 조직 네이티브 AI 참조 구조\n\n![TS 조직 네이티브 AI 공통 참조 구조](../assets/ts-organization-native-reference-architecture.svg)\n\n공식 인사·조직·업무분장·업무시스템 원천 → ID·효력일·업무 관계 정규화 → 목적·자료·도구 정책 검증 → 근거형 업무 AI → 사람 확인·공식 시스템 처리 → 변경·품질 재평가. CCK 제안 구조이며 TS 설치·구현은 별도 검수 대상.\n\n'
  +'## 구조 유형과 검수 관점\n\n| 유형 | 이름 | 핵심 경계 | 병목 후보 | CCK 설계 방향 | 검수 질문 |\n| --- | --- | --- | --- | --- | --- |\n'+patterns+'\n\n'
  +'## 공개 원문 검증·한계\n\n- PF-R02: [NIA 원문 RFP ZIP](https://www.nia.or.kr/common/board/Download.do?bcIdx=28233&cbIdx=78336&fileNo=2)을 REA 패키지 분석. ZIP SHA-256 `10b0049fea8c9ad04c1c6b448baf03bfa06cf5f296c724aba2996804040d39a6`, 증거 `ev_5f97ae9cedec501206976a81f71fd88fdf34b2cd83f2b3c182d73fcbb8e36732` 및 HWPX `ev_12c3ff9423094baaa31b0caf84abc98a28c21f551b0bc523c395daeb3926c8c6`. 패키지와 그림의 진위를 확인한 범위이며 운영 시스템 분석은 아님.\n- REA 적용 경계: 입수한 문서 패키지에는 파일·도식 추출에 사용. 설치본·브라우저 런타임이 없는 제3자 시스템의 실제 호출·DB·인프라 병목은 검증 불가.\n- 병목 상태: ‘감사·감독 확인’은 공적 자료의 관찰 범위에 한정. ‘설계상 병목 후보’는 CCK의 구조 추론이며 사고 발생 주장 아님.\n- 적용 경계: TS의 기존 NOA·플랫폼 기능, 조직정보 제공권, 업무시스템 실행권, 검수 기준선은 별도 실사 후 순증 산정.\n\n'
  +'## 플랫폼 사례 31개 항목\n\n'+atlas.byKind.platform.map(caseSection).join('\n')
  +'\n## 12대 전략과제 AX 사례 26개 항목\n\n'+atlas.byKind.ax.map(caseSection).join('\n');
}
function csvBody(){
 const head=['ID','구분','사례','As-Is','To-Be','기대효과','확인결과','성과판정','판정근거','판단범위','성과원문URL','비교유형','자료단계','구조근거','논리흐름','데이터경계','판단경계','병목상태','병목','검증질문','CCK시사점','미확인','전략','원문URL','원문그림성격','공유참조','교차관점'];
 const body=atlas.rows.map(r=>[r.caseId,r.kind,r.title,r.outcome.asIs,r.outcome.toBe,r.outcome.expectedEffect,r.outcome.observed,r.outcome.verdict,r.outcome.verdictReason,r.outcome.evidenceStage+' · '+r.outcome.limits,r.outcome.sourceUrl||'',r.patternTitle,r.sourceStage,r.architectureBasis,r.flow.join(' → '),r.dataBoundary,r.decisionBoundary,r.bottleneckStatus,r.bottleneck,r.validation,r.cckImplication,r.unknowns,r.strategies.join(' / '),r.sourceUrl,r.originalFigures.map(f=>f.role+' '+f.status).join(' / '),r.originalFigures[0]?.sharedFrom||'',r.pairPeer||'']);
 return '\uFEFF'+[head,...body].map(row=>row.map(csv).join(',')).join('\r\n')+'\r\n';
}
function files(){return {'ts-case-architecture-atlas.md':markdown(),'ts-case-architecture-atlas.csv':csvBody()};}
function write(dir){fs.mkdirSync(dir,{recursive:true});for(const [name,body] of Object.entries(files()))fs.writeFileSync(path.join(dir,name),body);}
module.exports=write;module.exports.files=files;module.exports.markdown=markdown;
