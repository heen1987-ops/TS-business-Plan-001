(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else {root.P23Demo=api;api.mount();}})(typeof globalThis==='undefined'?this:globalThis,function(){
'use strict';
const fmt=n=>n===null?'미확인':(n/1000000).toLocaleString('ko-KR',{maximumFractionDigits:6})+'백만원';
function parseAmount(raw,label){if(raw===null||raw===undefined||String(raw).trim()==='')return {value:null};const n=Number(raw);if(!Number.isFinite(n)||n<0||n>1000000000)return {value:null,error:label+'은 0 이상 10억 백만원 이하의 금액으로 입력하세요.'};return {value:Math.round(n*1000000)};}
function evaluate(raw){const a=parseAmount(raw.prior,'전년도 금액'),b=parseAmount(raw.request,'요구액');const year=Number(raw.year);const errors=[a.error,b.error].filter(Boolean);if(![2027,2028].includes(year))errors.push('시연에서 지원하는 연도를 선택하세요.');const mismatch=year!==2027,withdrawn=raw.source==='withdrawn',changed=b.value!==null&&b.value!==100000000,cut=changed&&b.value<100000000;const warnings=[];
 if(errors.length)warnings.push(...errors);
 if(a.value===null)warnings.push('전년도 A 미확인: 증감은 계산하지 않습니다.');
 if(b.value===null)warnings.push('요구액 B 미확인: 예산이 확정된 초안이 아닙니다.');
 if(mismatch)warnings.push('양식 연도 불일치: 등록 프로필은 2027년입니다. '+year+'년 공식 양식 확인 전 제출용 확정 불가.');
 if(withdrawn)warnings.push('근거 철회: 해당 근거 사용 중지. 관련 문제·필요성·문서 재검토 필요.');
 if(changed)warnings.push((cut?'요구액 감소':'요구액 변경')+': 가상 범위 검토 기준 100백만원과 다릅니다. 범위·요구사항·일정·검수·RFP 재검토 필요.');
 warnings.push('실제 예산 승인·부처 의견조회·계약 검토는 미확인. 항상 작성지원 초안이며 공식 제출·공고는 실행하지 않습니다.');
 return {schema_version:'P23X-demo-1.1',synthetic:true,project_id:'EXAMPLE-RESERVATION-01',title:'자동차검사 예약 탐색 개선 — 가상 검토',year,unit:'KRW',display_unit:'백만원',vat_status:'미확인',prior_won:a.value,requested_won:b.value,difference_won:a.value===null||b.value===null?null:b.value-a.value,scope_baseline_won:100000000,budget_approved_won:null,consultation_result:null,template_profile:'MPB-2027-202604-p196',template_mismatch:mismatch,evidence_status:withdrawn?'withdrawn':'synthetic-active',source_ids:['SYNTHETIC-01'],scope_review_required:changed,scope_reduction:cut,errors,warnings,artifact_status:'작성지원 초안',official_submission:false};
}
function documentText(state,view){const common=`가상 시연 / 작성지원 초안\n사업: ${state.title}\n요구연도: ${state.year} / 표시 단위: 백만원 / VAT: ${state.vat_status}\n전년도 금액 A: ${fmt(state.prior_won)}\n요구액 B: ${fmt(state.requested_won)}\n증감 B−A: ${fmt(state.difference_won)}\n실제 승인액: 미확인 / 실제 의견조회 결과: 미확인\n`;const bodies={
 policy:'[문제정의·정책사업 검토서]\n검토 문제: 검사소·날짜를 오가며 가용 일정을 찾는 부담이라는 가설.\n근거: 설명용 가상 카드. 실제 민원 빈도·현황을 조사한 결과가 아님.\n대안: 현행 유지 / 화면·조회 개선 / 운영 개선.\n정책 선택·실제 원인·성과 목표: 담당자 확인 필요.',
 budget:'[예산 목록 작성지원]\n공식 참고 프로필: 2027 신규사업 리스트, 인쇄196쪽.\n사업개요: 규모·기간·수행주체·수혜대상·회계·비목 확인 필요.\n전년도 A는 공란을 0원으로 바꾸지 않음. 운영연차 비용 미확인: 전체 총사업비 미확정.\n부처간 의견조회 결과: 회신 증빙 미등록. AI 검색으로 협의 완료 처리하지 않음.',
 rfp:'[발주기관 RFP 검토 초안]\n요구액 B는 예산 요구 가정이며 계약 예산으로 확정된 금액이 아님.\n검토할 과업: 날짜·검사소 조건 유지 및 제공 가능한 상태의 비교.\n전제: 실제 조회 인터페이스·데이터 제공 범위 확인 필요.\n검수: 조건 유지·정확한 상태 표시·실패 처리. 목표·승인 범위는 담당자 확인 필요.',
 notice:'[공고 준비 인계서]\n계약 예산·절차·참가자격·평가·기간·제출기한: 미확인.\n공개 첨부·보호정보 처리·RFP 검토: 미완료.\n현재 요구예산을 공고 예정가격이나 승인액으로 전환하지 않음.\n실제 공고 등록 기능 없음.'
 };if(!bodies[view])throw Error('지원하지 않는 문서 종류');return common+'\n'+bodies[view]+'\n\n[공통 재검토 사항]\n'+state.warnings.map(x=>'• '+x).join('\n');}
function mount(){if(typeof document==='undefined')return;let view='policy',state;const get=id=>document.getElementById(id);function update(){const invalid=['prior','request'].filter(id=>get(id).validity.badInput).map(id=>(id==='prior'?'전년도 금액':'요구액')+'의 숫자 입력을 확인하세요.');state=evaluate({year:get('year').value,source:get('source').value,prior:get('prior').value,request:get('request').value});if(invalid.length){state.errors.push(...invalid);state.warnings.unshift(...invalid);}get('aVal').textContent=fmt(state.prior_won);get('bVal').textContent=fmt(state.requested_won);get('diffVal').textContent=fmt(state.difference_won);get('warnings').textContent=state.warnings.join(' ');get('preview').textContent=documentText(state,view);get('downloadMd').disabled=state.errors.length>0;get('downloadJson').disabled=state.errors.length>0;document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));}
 ['prior','request'].forEach(id=>get(id).addEventListener('input',update));['year','source'].forEach(id=>get(id).addEventListener('change',update));document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{view=b.dataset.view;update();}));
 function download(ext,content){const url=URL.createObjectURL(new Blob([content],{type:ext==='json'?'application/json;charset=utf-8':'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='P23_가상시연_작성지원초안.'+ext;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 get('downloadMd').addEventListener('click',()=>{if(!state.errors.length)download('md','# 가상 시연 초안\n\n'+documentText(state,view));});get('downloadJson').addEventListener('click',()=>{if(!state.errors.length)download('json',JSON.stringify(state,null,2));});update();
}
return {evaluate,documentText,parseAmount,fmt,mount};
});
