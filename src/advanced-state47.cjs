const labels={RECEIVED:'접수·범위 확인',EVIDENCE:'근거 대조',NEEDS_DATA:'보완 대기',PLANNED:'검토계획 편성',VERIFYING:'조회·분석 검증',REVIEW:'담당 판단 대기',APPROVED:'변경행위 승인 유효',EXECUTING:'승인 요청 진행',RECONCILE:'원천 결과 대사',RESULT:'완료 증거 확인',CLOSED:'업무 종결',HOLD:'정책·권한 보류'};
const transitions=[
['scope_checked',['RECEIVED'],'EVIDENCE','범위·권한 확인','관할·자료 이용·역할 확인','접수/자료 담당자','허용 자료·대상·권한 참조'],
['evidence_missing',['EVIDENCE','VERIFYING'],'NEEDS_DATA','결손·상충 확인','필수 근거의 결손 또는 상충','검토자','보완 사유·영향 과업'],
['supplement_verified',['NEEDS_DATA'],'EVIDENCE','보완자료 확인','도착 자료의 출처·대상·판본 확인','자료 확인자','검증된 보완자료 참조'],
['plan_prepared',['EVIDENCE'],'PLANNED','검토계획 구성','유효 근거·도구목록·완료조건 확인','계획기·검수자','계획판본·선행관계·중단조건'],
['analysis_started',['PLANNED'],'VERIFYING','조회·분석 수행','권한 내 조회·로컬 분석만 허용','도구 통제·분석기','도구/규칙판본·입출력 참조'],
['analysis_verified',['VERIFYING'],'REVIEW','검토 결과 대조','출처·조건·출력계약·계산 검증','검토자·검증기','검증기록·미결 항목'],
['approval_recorded',['REVIEW'],'APPROVED','변경행위 승인 기록','기관 지정 승인권자의 유효 범위 확인','승인권자','대상·행위·인자·사건/계획판본·유효기간'],
['handover_verified',['REVIEW'],'RESULT','검토안 인계 확인','조회·분석 범위 과업의 담당 확인·인계 증거','담당자·인계받는 주체','인계 참조·제한범위·남은 외부 조치'],
['dispatch',['APPROVED'],'EXECUTING','허용 요청 전달','실행 직전 권한·승인·원천 상태 재확인','실행 통제','요청ID·동일행위 키·승인 참조'],
['receipt',['EXECUTING'],'RECONCILE','접수 응답 확인','접수와 실제 반영을 분리','어댑터','접수 참조·원천 조회과업'],
['timeout',['EXECUTING'],'RECONCILE','응답 미확인','무응답은 성공·실패 확정 불가','어댑터·복구 담당','요청 참조·미확인 사유'],
['partial',['EXECUTING','RECONCILE'],'RECONCILE','부분 반영 확인','완료 항목과 미확인 항목 분리','원천 대사 담당','항목별 결과·잔여 목록'],
['result_verified',['EXECUTING','RECONCILE'],'RESULT','원천 반영 대사','원천 결과·요청·판본 일치 및 잔여 항목 해소','공식 결과 확인자','현재 유효 결과 참조·대사 증거'],
['retry_authorized',['RECONCILE'],'APPROVED','미반영 확인 후 재검토','권한 있는 원천에서 미반영 확인·승인 유효·동일행위 계약 확인','업무·원천 담당자','미반영 근거·재요청 허용기록'],
['partial_reconciled',['RECONCILE'],'EVIDENCE','부분 대사 후 잔여계획','완료·잔여 항목의 공식 대사와 중복 없는 범위 확인','원천·업무 담당자','완료분 보존·잔여 항목·기존 승인 실효'],
['reconcile_superseded',['RECONCILE'],'EVIDENCE','이전 요청 대사 후 재검토','권한 있는 원천의 이전 요청 결과·잔여 항목 확인','원천·업무 담당자','반영/미반영/부분반영 근거·보류 이유 보존'],
['close',['RESULT'],'CLOSED','업무 종결','완료조건·담당 확인·잔여과업 해소','업무 책임자','종결근거·별도 후속관측 계획'],
['source_changed',['EVIDENCE','NEEDS_DATA','PLANNED','VERIFYING','REVIEW','APPROVED','EXECUTING','RECONCILE','RESULT','CLOSED'],'EVIDENCE','원천 변경·재개','새 원천 판본·정정 사유·영향 확인','자료/업무 담당자','이전 결과 보존·새 사건판본·영향 과업'],
['policy_blocked',['HOLD','RECEIVED','EVIDENCE','NEEDS_DATA','PLANNED','VERIFYING','REVIEW','APPROVED','EXECUTING','RECONCILE','RESULT','CLOSED'],'HOLD','정책·권한 보류','권한 회수·해석 불명·진행 불가','권한/업무 담당자','보류 이유·미확인 실행 보존'],
['hold_resolved',['HOLD'],'EVIDENCE','보류 해소 확인','권한자 해석·자료 이용조건 재확인','지정 권한자','해소 근거·재검토 과업']
].map(([id,from,to,title,guard,actor,evidence])=>({id,from,to,title,guard,actor,evidence}));
const axes=[
['사건','위 12개 진행 상태','접수·검토·종결의 진행. 별도 자료/승인/실행/관측 상태와 함께 해석'],
['근거','미확인·확인·결손·상충·변경','자료 도착은 사실 확인 완료가 아님'],
['승인','불필요·요청 전·대기·유효·실효·회수','조회·분석 과업에 변경행위 승인을 강제로 적용하지 않음'],
['개별 실행','미요청·진행·접수 확인·응답 미확인·부분 반영·반영 확인','실제 구현은 action_id별 관리. 아래 예시는 한 행위만 다루는 축약 모델'],
['후속 관측','미도래·관측 중·충분 관측·결측·종료','업무 종결이 관측 완료나 무재발을 의미하지 않음']
];
const policy='설계 예시 · 가상 사건 · 실제 승인·AI·API 실행 없음. 클릭 결과는 아래 축약 상태모델의 설명이며 제품 안전성 시험이 아님. 조건 플래그는 가상 입력이며 실제 권한·서명 검증기가 아님.';
function initial(){return {phase:'RECEIVED',revision:1,recordVersion:1,planVersion:0,evidence:'미확인',approval:null,action:null,result:null,observation:'미도래',deferredResults:[],reconciledActions:[],pendingHold:[],completedItems:[],actionLedger:[],retryGrant:null,history:[],seen:[]};}
function auditApproval(a){return a?{...a,status:'실효'}:null;}
function apply(s,e){const t=transitions.find(x=>x.id===e.type),deny=reason=>({accepted:false,reason,state:s});if(!t)return deny('정의하지 않은 이벤트');if(s.seen.includes(e.eventId))return deny('이미 처리한 이벤트: 중복 상태 변경 차단');if(!e.eventId)return deny('이벤트 식별자 필요');if(e.expectedRevision!==s.recordVersion)return deny('동시 변경 감지: 현재 사건판본 재조회 필요');const prior=s.reconciledActions.find(x=>x.requestId===e.requestId);if(e.type==='result_verified'&&e.resultRef&&prior&&(s.action?.requestId!==e.requestId||s.action?.status==='반영 확인')){if(prior.resultRef===e.resultRef)return deny('이미 확인한 공식 결과 참조: 중복 정정 처리 제외');const reason='대사 완료한 이전 요청의 추가 결과: 현행 사건 완료에 사용하지 않고 정정 검토 보류',phase=s.action&&s.action.status!=='반영 확인'?'RECONCILE':'HOLD';return {accepted:false,reason,state:{...s,phase,revision:s.revision+1,recordVersion:s.recordVersion+1,approval:auditApproval(s.approval),retryGrant:null,pendingHold:[...s.pendingHold,{id:'LATE-'+e.eventId,reason,basisRevision:s.revision}],seen:[...s.seen,e.eventId],deferredResults:[...s.deferredResults,{requestId:e.requestId,resultRef:e.resultRef,basisRevision:prior.revision,priorReconciliation:prior.proof}],history:[...s.history,{eventId:e.eventId,type:e.type,from:s.phase,to:phase,proof:e.resultRef,deferred:true}]}};}
if(!t.from.includes(s.phase))return deny('현재 상태에서 허용하지 않는 전이');const a=s.approval;
const unique=x=>Array.isArray(x)&&x.length>0&&new Set(x).size===x.length;const same=(x,y)=>Array.isArray(x)&&Array.isArray(y)&&x.length===y.length&&x.every(z=>y.includes(z));const partition=(done,remaining)=>unique(done)&&unique(remaining)&&done.every(x=>!remaining.includes(x))&&same([...done,...remaining],s.action?.itemRefs)&&(!s.action?.completedRefs||s.action.completedRefs.every(x=>done.includes(x)));
const valid=a&&a.revision===s.revision&&a.planVersion===s.planVersion&&a.digest===e.digest&&a.expiresAt>e.now&&a.status==='유효';
if(e.type==='scope_checked'&&!e.scopeVerified)return deny('관할·자료·권한 확인 필요');
if(e.type==='supplement_verified'&&!e.evidenceVerified)return deny('보완자료의 출처·대상·판본 확인 필요');
if(e.type==='plan_prepared'&&(!e.evidenceVerified||!e.planValidated))return deny('유효 근거와 계획 계약 확인 필요');
if(['analysis_started','analysis_verified'].includes(e.type)&&!e.readAllowed)return deny('조회·분석 권한 확인 필요');
if(e.type==='analysis_verified'&&!e.outputsVerified)return deny('출력·근거 검증 필요');
if(e.type==='approval_recorded'&&(!e.approverVerified||!e.approvalRef||!e.digest||!unique(e.itemRefs)||e.itemRefs.some(x=>s.completedItems.includes(x))||!(e.expiresAt>e.now)))return deny('승인권자·범위·유효기간 확인 필요');
if(e.type==='handover_verified'&&(!e.reviewOnly||!e.handoverRef||!e.reviewerVerified))return deny('조회·분석 범위와 담당 인계 확인 필요');
if(e.type==='dispatch'&&(!valid||!e.writeAllowed||!e.sourceFresh||!e.requestId||!e.idempotencyKey||!e.remainingScopeVerified||!same(a?.itemRefs,e.itemRefs)||e.itemRefs.some(x=>s.completedItems.includes(x))))return deny('유효 승인·쓰기권한·현재 원천·행위키·잔여 실행범위 확인 필요');
if(e.type==='dispatch'){const key=s.actionLedger.find(x=>x.key===e.idempotencyKey),request=s.actionLedger.find(x=>x.requestId===e.requestId);if(key&&(key.digest!==e.digest||key.requestId!==e.requestId))return deny('동일행위 키 충돌: 최초 승인 인자·원 요청과 불일치');if(request&&request.key!==e.idempotencyKey)return deny('기존 원 요청에 새 행위 키 사용 금지');if(key&&(!s.retryGrant||s.retryGrant.key!==key.key||s.retryGrant.requestId!==key.requestId||s.retryGrant.digest!==key.digest))return deny('기존 행위 키 재사용: 미반영 대사에 따른 재시도 허용기록 필요');}
if(['receipt','timeout','partial','result_verified'].includes(e.type)&&(!s.action||s.action.requestId!==e.requestId))return deny('원 요청 식별 불일치');
if(e.type==='partial'&&!partition(e.completedRefs,e.remainingRefs))return deny('승인 항목을 완료·잔여로 정확히 분할하고 이전 완료분을 보존해야 함');
if(e.type==='result_verified'&&e.resultRef&&s.action.revision!==s.revision){return {accepted:false,reason:'이전 판본의 늦은 결과: 원 요청에 보존 후 별도 대사. 현재 사건 종결 금지',state:{...s,recordVersion:s.recordVersion+1,seen:[...s.seen,e.eventId],deferredResults:[...s.deferredResults,{requestId:e.requestId,resultRef:e.resultRef,basisRevision:s.action.revision}],history:[...s.history,{eventId:e.eventId,type:e.type,from:s.phase,to:s.phase,proof:e.resultRef,deferred:true}]}};}
if(e.type==='result_verified'&&(!e.resultRef||!e.sourceMatched||!e.allItemsResolved||s.action.revision!==s.revision))return deny('현재 판본의 원천 결과와 전 항목 대사 필요: 늦은 결과는 원 요청에 보존 후 별도 검토');
if(e.type==='retry_authorized'&&(!e.notAppliedProof||!valid||!e.idempotencyConfirmed||!s.action||s.action.requestId!==e.requestId||s.action.key!==e.idempotencyKey||s.action.status==='부분 반영'))return deny('미반영 근거·유효 승인·중복계약 필요. 부분 반영은 잔여행위 별도 계획');
if(e.type==='close'&&(!s.result||s.result.revision!==s.revision||!e.reviewerVerified||!e.noRemaining))return deny('현재 유효 결과·담당 확인·잔여과업 해소 필요');
if(e.type==='policy_blocked'&&(!e.policyReason||!e.holdId||s.pendingHold.some(x=>x.id===e.holdId&&x.reason!==e.policyReason)))return deny('보류 식별자·사유 필요. 다른 사유에 동일 보류 식별자 사용 금지');
if(e.type==='partial_reconciled'&&(!s.action||s.action.status!=='부분 반영'||s.action.requestId!==e.requestId||!e.reconciliationProof||!e.reviewerVerified||!partition(e.completedRefs,e.remainingRefs)))return deny('부분 반영의 공식 대사·확인자·전체 항목 분할 확인 필요');
if(e.type==='reconcile_superseded'&&(!s.action||s.action.requestId!==e.requestId||s.action.revision===s.revision||!e.reconciliationProof||!e.reviewerVerified||!['반영 확인','미반영 확인','부분 반영'].includes(e.priorOutcome)||!e.remainingScopeVerified||(e.priorOutcome==='부분 반영'&&!partition(e.completedRefs,e.remainingRefs))||(e.priorOutcome==='미반영 확인'&&s.action?.completedRefs?.length)))return deny('이전 요청의 공식 대사 결과·확인자·잔여범위 필요. 확인불가는 계속 대사');
if(e.type==='source_changed'&&!e.sourceChangeRef)return deny('원천 변경 근거 필요');
if(e.type==='hold_resolved'&&(!e.authorityResolution||!s.pendingHold.length||!Array.isArray(e.resolvedHoldIds)||!s.pendingHold.every(x=>e.resolvedHoldIds.includes(x.id))))return deny('모든 미해소 보류 식별자와 권한자의 해소 근거 필요');
const n={...s,recordVersion:s.recordVersion+1,phase:t.to,seen:[...s.seen,e.eventId],history:[...s.history,{eventId:e.eventId,type:e.type,from:s.phase,to:t.to,revision:s.revision,proof:({approval_recorded:e.approvalRef,source_changed:e.sourceChangeRef,result_verified:e.resultRef,handover_verified:e.handoverRef,dispatch:e.requestId,close:s.result?.ref})[e.type]||null}]};
if(['scope_checked','supplement_verified'].includes(e.type))n.evidence='확인';
if(e.type==='evidence_missing')n.evidence='결손';
if(e.type==='plan_prepared'){n.planVersion++;n.approval=null;n.result=null;n.retryGrant=null;}
if(e.type==='approval_recorded')n.approval={ref:e.approvalRef,revision:s.revision,planVersion:s.planVersion,digest:e.digest,expiresAt:e.expiresAt,itemRefs:[...e.itemRefs],status:'유효'};
if(e.type==='retry_authorized')n.retryGrant={key:s.action.key,requestId:s.action.requestId,digest:s.action.digest};
if(e.type==='dispatch'){n.action={requestId:e.requestId,key:e.idempotencyKey,digest:e.digest,revision:s.revision,itemRefs:[...e.itemRefs],status:'진행'};if(!s.actionLedger.some(x=>x.key===e.idempotencyKey))n.actionLedger=[...s.actionLedger,{key:e.idempotencyKey,requestId:e.requestId,digest:e.digest,basisRevision:s.revision,planVersion:s.planVersion}];n.retryGrant=null;}
if(['receipt','timeout','partial'].includes(e.type))n.action={...s.action,status:({receipt:'접수 확인',timeout:'응답 미확인',partial:'부분 반영'})[e.type],completedRefs:e.completedRefs||[],remainingRefs:e.remainingRefs||[]};
if(e.type==='result_verified'){n.action={...s.action,status:'반영 확인'};n.completedItems=[...new Set([...s.completedItems,...s.action.itemRefs])];n.reconciledActions=[...s.reconciledActions,{...s.action,outcome:'반영 확인',proof:e.resultRef,resultRef:e.resultRef,completedRefs:[...s.action.itemRefs],remainingRefs:[]}];n.result={ref:e.resultRef,revision:s.revision,kind:'공식 결과 대사'};}
if(e.type==='handover_verified')n.result={ref:e.handoverRef,revision:s.revision,kind:'검토안 인계'};
if(['reconcile_superseded','partial_reconciled'].includes(e.type)){const outcome=e.type==='partial_reconciled'?'부분 반영':e.priorOutcome,done=outcome==='반영 확인'?s.action.itemRefs:outcome==='부분 반영'?e.completedRefs:[];n.reconciledActions=[...s.reconciledActions,{...s.action,outcome,proof:e.reconciliationProof,completedRefs:done,remainingRefs:e.remainingRefs||[]}];n.completedItems=[...new Set([...s.completedItems,...done])];n.action=null;n.result=null;n.retryGrant=null;n.approval=a?{...a,status:'실효'}:null;n.phase=s.pendingHold.length?'HOLD':'EVIDENCE';n.history[n.history.length-1].to=n.phase;n.history[n.history.length-1].proof=e.reconciliationProof;}
if(e.type==='hold_resolved'){n.pendingHold=[];n.history[n.history.length-1].resolvedHolds=s.pendingHold;n.history[n.history.length-1].proof=e.authorityResolution;}
if(e.type==='policy_blocked'){n.pendingHold=s.pendingHold.some(x=>x.id===e.holdId)?s.pendingHold:[...s.pendingHold,{id:e.holdId,reason:e.policyReason,basisRevision:s.revision}];n.history[n.history.length-1].hold={id:e.holdId,reason:e.policyReason};}
if(['source_changed','policy_blocked'].includes(e.type)){n.retryGrant=null;n.revision++;n.evidence=e.type==='source_changed'?'변경':s.evidence;n.approval=a?{...a,status:e.type==='source_changed'?'실효':'회수'}:null;n.result=null;const pending=s.action&&s.action.status!=='반영 확인';n.phase=pending?'RECONCILE':t.to;n.history[n.history.length-1].to=n.phase;}
return {accepted:true,reason:'가상 전이 확인 · '+t.evidence,state:n};}
const common={sourceChangeRef:'DEMO-CHANGE',policyReason:'가상 권한 회수',holdId:'DEMO-HOLD',resolvedHoldIds:['DEMO-HOLD'],itemRefs:['A','B'],scopeVerified:true,evidenceVerified:true,planValidated:true,readAllowed:true,outputsVerified:true,approverVerified:true,approvalRef:'DEMO-APPROVAL',digest:'DEMO-SCOPE',now:10,expiresAt:20,writeAllowed:true,sourceFresh:true,remainingScopeVerified:true,requestId:'DEMO-REQUEST',idempotencyKey:'DEMO-ACTION',resultRef:'DEMO-RESULT',sourceMatched:true,allItemsResolved:true,reviewerVerified:true,noRemaining:true,reviewOnly:true,handoverRef:'DEMO-HANDOVER'};
function replay(events){let state=initial(),log=[];events.forEach((event,i)=>{const e={...common,...(typeof event==='string'?{type:event}:event),eventId:'DEMO-E'+i,expectedRevision:state.recordVersion};const r=apply(state,e);log.push({event:e.type,accepted:r.accepted,reason:r.reason,from:state.phase,to:r.state.phase});state=r.state;});return {state,log};}
const base=['scope_checked','plan_prepared','analysis_started','analysis_verified'];
const scenarios=[
{id:'review',title:'조회·분석 완료',events:[...base,'handover_verified','close'],description:'검토안의 담당 확인·인계로 모듈 완료. 정책 집행·시험·공사 완료를 의미하지 않음.'},
{id:'missing',title:'자료 보완 후 재검토',events:['scope_checked','evidence_missing',{type:'supplement_verified',evidenceVerified:false},'supplement_verified','plan_prepared','analysis_started','analysis_verified'],description:'도착만 한 보완자료는 재개 불가. 출처·대상·판본 확인 후 계획 구성.'},
{id:'changed',title:'승인 후 원천 변경',events:[...base,'approval_recorded','source_changed','dispatch'],description:'기존 승인의 유효성 상실. 변경된 계획을 검토하기 전 요청 전달 차단.'},
{id:'timeout',title:'응답 유실·원천 대사',events:[...base,'approval_recorded','dispatch','timeout','dispatch','result_verified','close'],description:'응답 미확인 상태에서 재전송 차단. 원천 반영 대사 후 종결.'},
{id:'partial',title:'일부 항목만 반영',events:[...base,'approval_recorded','dispatch',{type:'partial',completedRefs:['A'],remainingRefs:['B']},'close'],description:'부분 반영과 잔여 항목 유지. 전체 종결 및 완료분 재실행 차단.'},
{id:'remaining',title:'완료분 보존·잔여계획',events:[...base,'approval_recorded','dispatch',{type:'partial',completedRefs:['A'],remainingRefs:['B']},{type:'partial_reconciled',completedRefs:['A'],remainingRefs:['B'],reconciliationProof:'DEMO-PARTIAL'},'plan_prepared'],description:'원천판본 변경 없이도 부분 대사를 완료하고 잔여 B의 계획으로 복귀. A 재승인·재실행 금지.'},
{id:'hold',title:'진행 중 보류·대사 복귀',events:[...base,'approval_recorded','dispatch','policy_blocked','source_changed','result_verified',{type:'reconcile_superseded',priorOutcome:'반영 확인',reconciliationProof:'DEMO-PROOF'},'plan_prepared'],description:'이전 요청의 반영 여부를 먼저 확인. 정책보류가 해소되지 않으면 대사 후에도 계획·실행 재개 차단.'},
{id:'reopen',title:'종결 후 정정',events:[...base,'handover_verified','close','source_changed'],description:'이전 종결 이력을 보존하고 새 근거 검토로 재개. 후속 관측은 별도 상태.'}
];
module.exports={labels,transitions,axes,policy,initial,apply,replay,scenarios,common,base};
