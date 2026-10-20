'use strict';
const base=require('./ts-org-scenarios.json'),rules=require('./ts-organization-rules.cjs'),profiles=require('./ts-org-scenario-profiles.cjs'),strategies=require('./strategy-solutions-2027.cjs');
const entryById=Object.fromEntries(rules.entries.map(e=>[e.id,e]));
const nodesFor=id=>rules.bindings.filter(n=>n.entryId===id);
const orgView=n=>({code:n.code,name:n.name,path:n.path,regionCode:n.regionCode,restriction:n.restriction,locator:n.locator});
function dutyRef(entryId,indexes,role){const n=nodesFor(entryId)[0],e=entryById[entryId];return {code:n.code,name:n.name,entryId,locator:n.locator,quotes:indexes.map(i=>e.duties[i]),role,candidateCodes:nodesFor(entryId).map(n=>n.code)};}
const titles=['조직·직무 인식','업무·자료 선택','누락 판정·요청','보완·재검토','부서 협업·회신','전결·승인','원천 반영·대사','종결·변경 대비'];
const packages=[['ON-W01','ON-W02'],['ON-W01','ON-W04'],['ON-W04'],['ON-W04','ON-W05'],['ON-W05'],['ON-W03','ON-W05'],['ON-W03','ON-W05'],['ON-W06']];
const tests=[['GAI-T01','GAI-T02'],['GAI-T05','GAI-T06'],['GAI-T06','GAI-T11'],['GAI-T06','GAI-T07'],['GAI-T07','GAI-T10'],['GAI-T04','GAI-T08'],['GAI-T08','GAI-T09'],['GAI-T09','GAI-T12']];
const architectures=[['A01','A02'],['A02','A03'],['A03','A04'],['A03','A04'],['A04','A05'],['A05'],['A05','A06'],['A06','A07']];
function make(p){
 const e=entryById[p.entryId],n=nodesFor(p.entryId)[0],code='SC-'+e.table+'-'+e.row;
 const partnerNames=p.peers.map(x=>entryById[x.entryId].name),peerLabel=partnerNames.join('·');
 const requirements=p.materials.map((m,i)=>({id:code+'-D'+(i+1),name:m.name,fields:m.fields,owner:[e.name+' 업무 요청자',e.name+' 기준·자료 소관','원자료 작성·보유 주체',peerLabel,'조건별 소관'][i],condition:['업무건 접수','적용 기준 확인','핵심 판단 증거 확보','협의 대상 판정·요청 이후',m.fields.split('·')[0]+' 해당 시'][i],status:['확인','확인','미제출','단계 미도래','조건부'][i],action:['공식 업무건·대상 범위 식별','효력일·판본·변경 이력 대조',m.fields+' 포함 원자료 요청; 접근불가·수집지연은 별도 처리','협의 요청 전 미제출 오류 제외; 요청 후 회신 상태 추적','조건 충족 시 요구 활성화; 비해당 근거 보존'][i]}));
 const s={id:e.id.toLowerCase(),code,title:p.title,lead:n.code,strategy:p.strategy,entryId:e.id,applicableOrgs:nodesFor(e.id).map(orgView),strategyReason:p.subject+' → '+strategies.rows.find(x=>x.id===p.strategy).strategy,
 request:p.subject+'에 필요한 자료와 보완사항, 협의·승인 순서를 정리해줘.',asIs:p.materials.slice(0,3).map(m=>m.name).join('·')+'의 분산 확인과 수작업 협의 취합',toBe:p.review,
 dutyRefs:[dutyRef(e.id,p.dutyIndexes,'주관 · '+p.subject),...p.peers.map(x=>dutyRef(x.entryId,[x.dutyIndex],'협업 후보 · '+x.condition))],
 role:e.name+'의 해당 업무 배정자 · 작성·검토·승인 권한 별도 인식',scope:'TS → 선택 조직·관할 → '+p.subject+' → 업무건·기준시점·판본',requirements,
 collaboration:[[e.name,'업무 요청·역할 배정 확인',p.materials[0].name+'·'+p.materials[2].name,'자료 충족·미결 항목별 다음 조치'],...p.peers.map(x=>[entryById[x.entryId].name+' · 해당 관할·수행사무 대조',x.condition,x.reply,'수신·검토수락·의견 회신 구분; 권한 없는 문서 제외']),['현행 전결표의 권한자','필수 회신·자료 충족 및 미결 해소',p.approval,'현재 판본·위임 확인 후 기관 공식 경로']],
 effect:p.effect,measure:'동일 업무건 기준 준비·재질문·검수·수정·인계를 포함한 총시간, '+p.materials[2].name+' 보완 횟수, 오판·누락 협의·잘못된 완료 수; 실패·보류 건 포함',
 pilot:'공통 기반 인수 → '+e.name+' '+p.title+'의 합성·비식별 사례 대조 → 현업 정답 확인 → 읽기 전용 시범 → 승인된 연계만 확대',
 close:p.materials[2].name+' 충족 + 필수 회신 + 현재 판본 권한자 판단 + '+p.system+'의 결과 일치. '+p.approval,
 approvalBoundary:p.approval,system:p.system,risk:p.risk,costRule:base.scenarios[0].costRule,
 serviceFlow:[p.materials[0].name,p.materials[1].name+' 대조',p.materials[2].name+' 보완',peerLabel+' 조건부 협의','권한자·현재 판본 확인',p.system+' 결과 대사'],
 returnFlows:[p.materials[2].name+' 미제출 → 제공 주체 → 내용·판본 재검사',p.materials[3].name+' 단계 미도래·지연 → 원천·회신 상태 확인 → 협의 대기','기준·역할·증빙 변경 → 영향 작업만 재계획 → 재검토·필요 재승인']};
 const rows=[
 [e.name+' 배정자 / SSO·인사 원천','주체 ID·직무·겸직·기준시점·선택 관할','공식 조직 배정과 해당 세칙의 사무·시행조건 확인','ContextSnapshot / 조직·직무·관할·정책 판본',e.name+'의 '+p.title+' 업무로 확인하겠습니다. 대상 업무건과 담당 역할을 선택해 주세요.','업무 식별 대기','조직명 외에 사무·유효기간·관할을 업무 목표에 연결','동명 부서·겸직·조건부 시행은 배정 확인 후 활성화'],
 [e.name+' 담당 / 원자료 소관',p.materials[0].fields+' / '+p.materials[1].fields,'권한 필터 후 자료 정의·업무건·효력일 대조','RequirementSnapshot / 자료별 확인·미제출·단계 미도래·조건부',p.materials[0].name+'와 '+p.materials[1].name+'를 연결했습니다. '+p.materials[2].name+'의 근거 항목을 확인하겠습니다.','자료 확인','업무별 자료 사전·필수 조건·원문 좌표 어댑터','타 업무·기간·대상의 동명 자료 배제; 접근불가와 미제출 분리'],
 [e.name+' 담당 확인 후 원자료 제공 주체',p.materials[2].name+' 부재 / '+p.materials[3].name+' 협의 전','보유·권한·수집시점 확인 후 부족 항목·사유·제출 위치를 포함한 보완 요청 초안','Finding / '+code+'-D3 보완대기; D4 협의 전',p.materials[2].name+'에 '+p.materials[2].fields+'을 포함해 주시면 '+p.title+'를 검토하겠습니다. 협의 회신은 요청 이후 확인하겠습니다.','보완 대기','업무 정의에서 부족 조건·제공 역할·보완 하위 목표 도출','검색 부재만으로 미제출 단정 금지; 요청 발송은 담당 확인·기관 경로'],
 [e.name+' 검토자',p.materials[2].name+' 보완 판본·원문 위치',p.review,'지적별 해소·미해결·상충 결과 / evidenceRef·caseVersion',p.materials[2].name+'를 확인해 '+p.materials[1].name+'와 대조하겠습니다. 상충 항목은 해소하지 않고 검토 의견에 남기겠습니다.','재검토',p.materials[2].fields+'의 내용 충족·변경 영향 검증',p.risk],
 [peerLabel+' / '+e.name, p.materials[3].name+' / 미결 항목·현재 판본','독립 협의는 병행, 선행 자료가 필요한 협의는 대기; 의견 충돌은 소관 확인','CollaborationTask / 조건·수신·수락·회신·잔여 의존관계',p.peers.map(x=>x.condition+'이면 '+entryById[x.entryId].name+'의 '+x.reply+'을 연결하겠습니다.').join(' '),'협의 중','조건별 협업 계획·부서 간 최소 자료·회신 판본 연결','지역·센터는 관할·실제 수행사무 일치 확인; 회신 미도착을 동의로 간주 금지'],
 ['현행 전결표·유효 위임의 권한자',p.materials[3].name+' / 필수자료·미결·판본·권한',p.approval+'; 조건 확인 후 상신 패키지 잠금','ApprovalRequest / 범위·판본·권한자·기한', '필수 검토자료와 회신을 묶어 결재를 준비했습니다. 현재 전결·위임 기준 확인 후 상신합니다.','승인 대기','업무별 판단 범위·자료·협의·승인 판본의 교집합 검증','전결표 부재·위임 만료·판본 변경 시 대기; 직급으로 승인자 추정 금지'],
 [p.system+' 공식 처리 담당','approvalRef·operationId·승인 판본','실행 직전 재인가·원천 버전 확인; 허용된 연계 또는 담당자 공식 입력','SourceReceipt / 접수·승인·최종 처리 결과·불명',p.system+'의 접수와 최종 결과를 각각 확인하겠습니다. 응답이 없으면 같은 요청의 처리결과부터 조회하겠습니다.','결과 확인',p.system+' 어댑터·중복 방지·응답 유실 대사','연계가 없으면 초안·수동 입력 지원에 한정; 접수=승인=완료로 합치지 않음'],
 [e.name+' / 운영·QA',p.system+' 결과·미결 목록·협의·판단 이력','종결 조건 대조 후 기록; 기준·조직·자료 변경 시 영향받는 계획만 재개','CaseClosed 또는 조정대기 / 결과·근거·측정 로그','현재 판본의 결과와 미결 상태를 확인해 종결 여부를 판단하겠습니다. 이후 변경은 이전 이력을 보존해 연결합니다.','종결 조건 확인','업무별 완료 증거·효과·계획 갱신 평가','결과 불명·반려·미해결 지적이 있으면 완료 표시 금지']];
 s.steps=rows.map((v,i)=>({id:String(i+1).padStart(2,'0'),title:titles[i],actor:v[0],input:v[1],action:v[2],output:v[3],response:v[4],state:v[5],delta:v[6],exception:v[7],technology:i===1||i===3?['T1','T2','T3']:i===2||i===4?['T1','T2']:['T1'],packages:packages[i],tests:tests[i],architecture:architectures[i]}));
 s.tests=[{id:code+'-T1',title:'자료·단계·관할 분리',input:p.materials[2].name+' 미제출, '+p.materials[3].name+' 단계 미도래, 타 관할 동일명 자료',expected:'D3만 보완 요청; D4 오류 제외; 타 관할 원문·수치 혼합 없음',existing:['GAI-T02','GAI-T06']},{id:code+'-T2',title:'업무 판단·협의 경계',input:p.risk+' 상황과 '+p.materials[2].name+' 정상 대조 사례',expected:p.review+'; '+p.approval+'; 잘못된 자동 판정·실행 없음',existing:['GAI-T05','GAI-T07']},{id:code+'-T3',title:'승인·변경·결과 유실',input:'승인 뒤 '+p.materials[1].name+' 개정·역할 회수 + '+p.system+' 응답 유실',expected:'영향 작업 재검토·이전 승인 보존·권한 재판정·결과 조회 우선·중복 반영 및 완료 오표시 없음',existing:['GAI-T08','GAI-T09','GAI-T10']}];
 s.lanes=JSON.parse(JSON.stringify(base.scenarios[0].lanes));
 s.lanes[0].nodes[1].title=p.materials.slice(0,3).map(m=>m.name).join('·');
 s.lanes[1].nodes[0].detail=p.title+' / A01·02';s.lanes[1].nodes[1].detail=p.materials[2].fields;
 s.lanes[2].nodes[1].title=p.materials[2].name+' 대사';s.lanes[3].nodes[0].title=peerLabel+' 조건부 협의';s.lanes[4].nodes[1].title=p.system;
 s.edges=base.scenarios[0].edges.map(v=>v.slice());
 const changes={3:p.subject+'의 목표·자료 조건',4:p.materials[2].name+' 중 허용된 자료',5:p.materials[2].fields+' 구조화·근거 대조',6:p.review,7:p.peers.map(x=>x.condition+' → '+x.reply).join(' / '),8:p.approval,11:p.system+'의 승인 판본·operationId',12:p.system+' 접수와 최종 결과'};
 for(const [i,v] of Object.entries(changes))s.edges[+i][2]=v;
 return s;
}
const expanded=profiles.map(make);
const scenarios=[...base.scenarios.map(s=>({...s,entryId:s.dutyRefs[0].entryId,applicableOrgs:nodesFor(s.dutyRefs[0].entryId).map(orgView),strategyReason:s.title+' → '+strategies.rows.find(x=>x.id===s.strategy).strategy})),...expanded];
const scenarioByEntry=Object.fromEntries(scenarios.map(s=>[s.entryId,s]));
const byOrg=Object.fromEntries(rules.bindings.filter(n=>n.entryId).map(n=>[n.code,scenarioByEntry[n.entryId]?.id]));
const coverage=rules.bindings.map(n=>({...orgView(n),entryId:n.entryId,scenarioId:byOrg[n.code]||null,group:n.path.startsWith('본사>')?'본사':n.regionCode?'지역본부·검사소':n.path.startsWith('자동차안전연구원')?'자동차안전연구원':'교육·드론센터',state:n.entryId?'시나리오 연결':n.structure.includes('별도 세칙')||n.code==='7000000'?'별도 세칙 필요':n.structure.includes('미확인')?'조직·업무 근거 필요':'하위 조직 선택',next:n.entryId?n.restriction||'개인별 배정·전결·실제 자료목록 대조':n.path.startsWith('자동차안전연구원')?'자동차안전연구원 직제시행세칙·업무분장표 확보':n.structure.includes('미확인')?'조직 설치·발령·업무분장 근거 확보':'하위 조직의 업무 시나리오 선택'}));
module.exports={...base,version:'2.0',title:'TS 전 부서 업무 기반 조직 네이티브 적용 시나리오',scenarios,coverage,byOrg,counts:{definitions:rules.entries.length,scenarios:scenarios.length,organizations:Object.keys(byOrg).length,directory:coverage.length,pending:coverage.filter(n=>!n.scenarioId).length},coverageNote:'세칙 57개 업무분장 유형별 대표업무 1건 · 132개 조직 적용 경로. 전 업무 항목은 기존 조직·직무 원장 연결. 지역·검사소별 실제 사무·관할 확인 후 적용.',strategyIndex:strategies.rows.map(s=>({id:s.id,name:s.strategy,scenarioIds:scenarios.filter(x=>x.strategy===s.id).map(x=>x.id)}))};
