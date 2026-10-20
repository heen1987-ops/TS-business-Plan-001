'use strict';
const org=require('./organization-site.cjs');
const model=require('./ts-org-module-design.cjs');
const portfolio=require('./ts-ax-portfolio-2027.cjs');
const platform=require('./org-platform-2027.cjs');
const titles=['조직·업무 정의 원장','로그인·인사변경 연결','접근권한·승인 통제','업무 목표·계획·보완 질문','협업·실행·변경 관리','역할 화면·독립 검수·운영 인수'];
const gates=['M3','M3','M5','M7','M7','M9'];
const outputs=['조직·직무·업무 사전 / 공식 ID·책임·규정 판본 대응표','인사 이벤트 처리기 / 효력일·변경·회수 대사표','자료·행위 정책표 / 승인 판본·위임·역할분리 명세','업무건·목표·계획 모델 / 필수자료·보완 질문 / 근거 계보','인계·실행 상태 / 변경영향·재계획 / 원천 접수증·대사 기록','담당·검토·운영 작업함 / 평가·결함 조치 / 교육·운영 인수서'];
const criteria=['공식 ID·세칙 판본·효력일·책임과 정답셋 일치 / 동명이인 보류','이동·겸직·퇴직·순서 역전 반영 / 합의한 동기화 시간 충족','필수 거부셋의 비인가 노출·실행 0건 / 위임 만료·구판 승인 차단','역할별 목표·다음 행동·필수자료 대조 / 누락·접근불가·단계 미도래 구별','인계 수락·반려·변경영향 재현 / 결과 불명 조회 / 접수와 완료 구별','필수 시험 통과 / 중대 결함 해소 / 회귀·복구 재현 / 기관 검수자 인수'];
const reuse=['T1 문서·지식공간 / T3 표·필드 추출','기존 SSO·ETL·인사 제공 경로의 확인분','기존 IAM·결재·로그 / T2 검토·증빙 패턴','T1 검색·스킬·서식 / T3 문서·근거 대사','기존 파일·업무 연계 / T2 구조화 입출력·이력','T1 작업공간 / T4 개발·재현시험 지원'];
const delta=['조직 임무·관할·직무·역할·의무·예외와 효력일 연결, 소관 검토·발행','공식 키 대응·인사변경·삭제·조직승계·순서 역전·재처리·신선도 처리','검색·생성·반출·실행별 정책 적용, 승인 대상 고정·실행 직전 재검증','기관→부서→업무건 목표 구성, 선행조건·근거 부족 탐지, 계획·질문·보완 후 재개','승인된 도구 계약·operationId·결과 대사, 영향 작업만 재검토·재승인, 완료 증거 확인','역할별 다음 행동·검토 근거·운영 화면, 동결 평가셋·판본별 회귀·교육·운영 인수'];
const effects=['업무 책임·근거 탐색 부담 감소 / 담당·규정 오연결률','담당 변경 후 미결 인계 연속성 / 변경 반영 지연·미배정 건','권한·승인 경계의 일관성 / 거부시험 위반·회수 지연','재설명·자료 보완 왕복 감소 / 누락 탐지·총처리시간','협업 미결·중복 처리 감소 / 미결 체류시간·완료 오표시','운영 인수·반복 확장 가능성 / 업무완료율·결함 재발·운영 비용'];
const rows=org.packages.map((p,i)=>({...p,period:i===5?'M1~M9 (평가 설계 M1~M2·인수 M6~M9)':p.period,title:titles[i],gate:gates[i],deliverable:outputs[i],pass:criteria[i],reuse:reuse[i],delta:delta[i],effect:effects[i],modules:model.core.filter(m=>m.packages.includes(p.id)).map(m=>m.id),tests:p.requirements.map(id=>org.acceptance.find(t=>t.id===id.replace('-R','-T')))}));
const followups=model.contracts.filter(m=>m.strategy!=='ST-04').map(m=>{const p=portfolio.byId[m.strategy];return {...m,strategyTitle:p.strategy,problem:p.problem,reuse:p.assets.map(([id,text])=>id+' '+text).join(' / '),delta:p.delta.join(' / '),effect:p.effect,metric:p.metric,reason:p.reason,boundary:p.boundary,to:'index.html?view=strategy&strategy='+m.strategy+'#'+(m.strategy==='ST-08'?'drt-business-design':'strategy-module')};});
const d={date:'2026-10-20',version:'0.5',title:'TS 2027 사업 제안',subtitle:'1차 조직 네이티브 공통 기반 구축 → 인수 → 전략별 후속 서비스',period:'착수 후 9개월 제안',status:'제안 기준 · 실제 구현·자료 접근 미검증 · 사업비 미산정',rows,followups,
 phaseLabels:['1차 공통 기반','후속 적용'],
 phases:[{id:'foundation',title:'1차 · 조직 네이티브 공통 기반',scope:'ST-04 / ON27-BASE · 6개 구축 묶음 · 12개 요구·검수',result:'조직·직무 인식부터 자료 보완·협업·승인·완료까지 연결',gate:'M9 기관 인수',cost:'C27-COM 단일 산정'}, {id:'followup',title:'후속 · 부서별 AX 서비스',scope:'11개 전략 모듈 후보 · ST-08 DRT 포함',result:'공통 기반 위 업무 전용 규칙·연계·사용성의 선택 적용',gate:'인수 + 소관·자료·예산·검수 확정',cost:'부서·지역 전용 개발과 운영비 분리'}],
 need:[['조직의 업무 이해','기관 임무·부서 책임·개별 업무건의 연결과 공식 조직·규정 판본 관리'],['업무 완료까지의 연결','필요자료 확인·누락 요청·검토·협업·승인·원천 결과 대사의 연속 처리'],['후속 투자 중복 방지','공통 기능의 1회 구축과 부서·지역별 전용 차분의 별도 산정']],
 pilot:'57개 업무 시나리오는 설계 목록. 1차 대표 검증은 M2 선정한 제한 범위의 자료 보완·부서 협업·인사변경 사례. 전 부서·전체 서비스 구축과 별도 물량 관리.',
 execution:'공식 사용자·조직 확인 → 업무건·목표 구성 → 필수자료·권한 확인 → 누락 질문·보완 → 담당 검토·협업 → 승인 대상 고정 → 원천 결과 대사·완료',
 executionBoundary:'승인된 파일 반입·반출과 모의 연계부터 검증. API는 제공·사용권·중복 처리 보장이 확인된 연계만 적용. 자료 부재·접근불가·결과 불명은 보류·조회·수동 처리로 분기.',
 gates:[['M2','설계·평가 기준선','대상 조직·대표 업무·원천 책임 / 재사용 차분·정답셋·분모·목표 합의'],['M3','조직·변경 연결','공식 키·효력일·조직 관계 / 이동·겸직·회수·원천 대사'],['M5','권한·실행 통제','권한·승인·자료 보완·모의 연계 시험 / 제한 시범 진입 판정'],['M7','대표 업무 검증','목표·질문·협업·변경영향 / 현업 비교시험·결함 보완'],['M9','조직 기반 인수','독립 검수·복구·교육·운영 인수 / 후속 서비스 별도 선택']],
 timeline:platform.timeline,
 note:'검수 기준안 · 플랫폼 시험 미실행. 정량 목표·분모·평가셋은 M2 합의. 0건 조건은 동결된 필수 거부·중요 오류 시험셋의 합격 기준으로 적용.',
 reuse:[['재사용 후보','T1 NOA / T2 증빙·검토 패턴 / T3 문서 AI / 기존 SSO·IAM·ETL'],['1차 추가 개발','조직 운영 정의·업무 목표·질문·권한·승인·협업·변경·평가의 연결'],['후속 적용','업무 전용 지식·규칙·연계·평가 / ST-08 음성·DRT 접수 지원']],
 technology:portfolio.technology,
 priority:'P0 공통 기반 선행. P1 문서·업무 흐름 중심 후보 → P2 전문 규칙·연계 후보 → P3 실증·대국민 접점 후보. 우선순위는 제안이며 자료·책임자·현업 효과·운영비 확인 후 선택.',
 followupSchedule:'공통 기반 인수 이후 별도 착수. 업무별 발견·설계 → 비연결 비교시험 → 제한 운영 → 확장. 11개 모듈 동시 구축·공통 기반 9개월 내 DRT 운영 완료를 전제하지 않는 단계별 계약.',
 drt:model.drt,
 drtNeed:'지역소멸·초고령화 대응을 위한 생활권 접근 지원. 지역별 운행 조건과 고령 이용자의 발화·정정 내용을 상담원이 확인 가능한 예약 요청으로 구조화.',
 drtScope:'한 지역·한 서비스·신규 예약 상담 지원부터 적용. 발화 정리·누락 질문·지역 정책·상담원 확인·기존 예약 결과 대사. 배차 최적화·차량 공급·CTI/IVR 인프라와 별도 범위.',
 drtReuse:'공통 OM-01~06과 NOA·문서 대사 재사용. 기존 DRT 요구 SFR-004·008·012·014 및 납품·설치본 대조 후 순증 개발 판정. RFP 기재와 실제 구현 완료의 구분.',
 drtEffect:'반복 설명·재통화·상담 재입력 부담 완화. 예약 완료율·총처리시간·정정률·실제 이동을 분리 측정. 차량 부족·정책 제한·AI 오류의 원인 분리; 인구 증가 효과로 직접 환산 제외.',
 measures:[['업무 효율','동일 업무의 탐색·검토·수정·실패·재처리 포함 총시간','현행 / 양식·규칙 개선 / AI 보조 비교; 업무량·난도 통제'],['입력·판단 품질','누락 탐지 정밀도·재현율 / 과도한 보완 요청 / 근거·판본 정확도','개발셋·검수셋 분리, 부서·역할별 오류와 보류 보고'],['업무 연속성','변경 반영 지연 / 미결 인계 / 승인·완료 오표시','인사·정책·자료 변경과 응답 유실 회귀시험'],['운영·확장성','업무완료율 / 장애 복구 / 다음 부서 적용의 실제 순증 공수','공통·부서 전용·운영 비용 분리; 미실측 절감률 제시 제외']],
 responsibility:'AI혁신처 사업 조정·데이터 표준·성과관리 / 원천 부서 조직·직무·전결 확인 / 정보보안처 정책 검토 / 현업 업무 정답·완료 기준 / 기관 지정 검수자 인수. AI서비스개발팀 역할은 최초 팀장 발령일 등 적용조건 대조.',
 cost:'기존 계약상 의무·미완료분, 재사용 설정, 공통 추가 개발, 부서·지역 전용 차분, 운영비의 분리. ON27-BASE / C27-COM 공통 비용 1회 산정. 실제 계약·자료·인터페이스·물량 확인 후 견적.',
 evidence:'직제시행세칙 2026.06.30 개정본 · 57개 대표 업무 시나리오 · CCK 기술 T1~T4 근거 · 100건 벤치마킹 · DRT 공식 안내·RFP. 사례 성과의 TS 전용 없이 동일 업무 비교시험으로 평가.',
 downloads:[['downloads/ts-2027-proposal.md','제안서 전문 · MD'],['downloads/ts-2027-proposal.html','제안서 전문 · HTML'],['downloads/ts-2027-phase-plan.csv','단계·개발·검수 연결표 · CSV']],
};
const table=(headers,rs)=>'| '+headers.join(' | ')+' |\n| '+headers.map(()=> '---').join(' | ')+' |\n'+rs.map(r=>'| '+r.map(v=>String(v).replaceAll('|',' / ').replaceAll('\n',' ')).join(' | ')+' |').join('\n');
d.tables={phases:()=>table(['단계','범위','인수·진입','비용'],d.phases.map(p=>[p.title,p.scope,p.gate,p.cost])),core:()=>table(['구축·기간','CCK·기존 재사용 후보','추가 개발·납품','검수·기대효과'],rows.map(r=>[r.id+' '+r.title+' / '+r.period,r.reuse,r.delta+' / '+r.deliverable,r.tests.map(t=>t.id).join(' · ')+' / '+r.pass+' / '+r.effect])),followup:()=>table(['전략·우선순위·부서','필요 업무·모듈','재사용·추가 개발','검수·기대효과'],followups.map(m=>[m.strategy+' '+m.priority+' '+m.owner.name,m.strategyTitle+' / '+m.problem+' / '+m.name,m.reuse+' / '+m.delta,m.acceptance+' / '+m.test+' / '+m.effect+' / 측정: '+m.metric])),measures:()=>table(['효과','측정','평가방법'],d.measures),drtGates:()=>table(['단계·기간','범위','진입·종료'],d.drt.gates),drtTests:()=>table(['검수','입력','통과 기준안','증빙'],d.drt.acceptance)};
d.markdown=function(){return '# TS 2027 제안 요약 · 1차 공통 기반과 후속 적용\n\n'+this.date+' · v'+this.version+' · '+this.status+'\n\n## 사업 구조\n\n'+this.tables.phases()+'\n\n'+this.need.map(x=>'- '+x[0]+': '+x[1]).join('\n')+'\n\n## 1차 구축·재사용·추가 개발·검수\n\n'+this.pilot+'\n\n'+this.execution+'\n\n'+this.executionBoundary+'\n\n'+this.tables.core()+'\n\n## 추진 일정\n\n'+this.period+'\n\n'+table(['기간','수행','통과 조건'],this.timeline.map(x=>[x.period,x.work,x.gate]))+'\n\n## 후속 전략 모듈\n\n'+this.priority+'\n\n'+this.followupSchedule+'\n\n'+this.tables.followup()+'\n\n## ST-08 DRT 후속 사업\n\n'+[this.drtNeed,this.drtScope,this.drtReuse,this.drtEffect,this.tables.drtGates(),this.tables.drtTests()].join('\n\n')+'\n\n## 기대효과와 측정\n\n'+this.tables.measures()+'\n\n## 사업관리·근거\n\n'+[this.responsibility,this.cost,this.note,this.evidence].join('\n\n')+'\n';};
module.exports=d;
