(()=>{"use strict";document.documentElement.classList.add("js");
const DATA=JSON.parse(document.getElementById("explain-data").textContent);
const $=id=>document.getElementById(id);
let selected=0;
const panels=[...document.querySelectorAll(".step-panel")], buttons=[...document.querySelectorAll("[data-step]")];
function selectStep(n,announce=true){selected=Math.max(0,Math.min(panels.length-1,n));panels.forEach((p,i)=>p.hidden=i!==selected);buttons.forEach((b,i)=>b.setAttribute("aria-pressed",String(i===selected)));$("step-counter").textContent=(selected+1)+" / "+panels.length;$("prev-step").disabled=selected===0;$("next-step").disabled=selected===panels.length-1;if(announce)$("flow-live").textContent=(selected+1)+"단계 "+DATA.steps[selected].name+": "+DATA.steps[selected].result;}
buttons.forEach(b=>b.addEventListener("click",()=>selectStep(Number(b.dataset.step))));
$("prev-step").addEventListener("click",()=>selectStep(selected-1));$("next-step").addEventListener("click",()=>selectStep(selected+1));selectStep(0,false);
const notes={normal:"정상 흐름: 정상 제출 → 기관 검토 → 필요한 보완·소명 → 현재 버전 재검증 → 권한자의 업무승인입니다.",failure:"AI 분석 실패: 정상 접수된 제출시각·버전은 유지합니다. 실패 구간을 표시하고 재시도 또는 수동 검토로 이어갑니다. 분석 실패를 업체 미제출로 계산하지 않습니다.",dispute:"지적에 이견이 있는 경우: 수행사는 원문·계약 근거로 소명합니다. 검토자는 철회·정정·유지를 판단하고, 정정 결과를 수행이력과 인수인계에 함께 반영합니다."};
$("case-select").addEventListener("change",()=>{$("case-note").textContent=notes[$("case-select").value];});
const num=n=>new Intl.NumberFormat("ko-KR",{maximumFractionDigits:1}).format(Object.is(n,-0)?0:n);
function compute(m){const base=m.tasks.reduce((a,t)=>a+t.hours,0);const gross=m.tasks.reduce((a,t)=>a+t.hours*t.reduction/100,0);const net=gross-m.extra_hours;const after=base-net;const annualValue=net*m.rate*m.projects;const annualCost=m.opex_man*10000+m.capex_man*10000/m.years;return {base,gross,net,after,annualValue,annualCost,balance:annualValue-annualCost};}
window.PMSExplain={compute};
function readModel(){const inputs=[...document.querySelectorAll("#benefit-form input")];for(const el of inputs){if(el.value.trim()===""||!Number.isFinite(el.valueAsNumber)||!el.checkValidity())return {error:el.dataset.label+"에 허용 범위의 숫자를 입력하세요."};}return {tasks:DATA.tasks.map(t=>({...t,hours:$("hours-"+t.id).valueAsNumber,reduction:$("reduction-"+t.id).valueAsNumber})),...Object.fromEntries(Object.keys(DATA.defaults).map(k=>[k,$("calc-"+k).valueAsNumber]))};}
function update(){const m=readModel();if(m.error){$("calc-error").textContent=m.error;$("calc-error").hidden=false;$("calc-values").hidden=true;return;}$("calc-error").hidden=true;$("calc-values").hidden=false;const r=compute(m);$("net-hours").textContent=num(r.net);$("base-hours").textContent=num(r.base);$("after-hours").textContent=num(r.after);$("gross-hours").textContent=num(r.gross);$("extra-hours").textContent=num(m.extra_hours);$("annual-value").textContent=num(r.annualValue/10000)+"만원";$("annual-cost").textContent=num(r.annualCost/10000)+"만원";$("annual-balance").textContent=(r.balance>0?"+":"")+num(r.balance/10000)+"만원";$("annual-balance").classList.toggle("negative",r.balance<0);$("assumption-caption").textContent="연간 "+num(m.projects)+"개 사업 · 시간당 "+num(m.rate)+"원 · 구축비 "+num(m.capex_man)+"만원을 "+num(m.years)+"년으로 단순 배분";$("calc-live").textContent="예시 가정 계산: 사업당 순확보 시간 "+num(r.net)+"시간. 연환산 비용 반영 후 차이 "+num(r.balance/10000)+"만원. 실측 효과 또는 현금 절감액이 아닙니다.";}
$("benefit-form").addEventListener("submit",e=>e.preventDefault());$("benefit-form").addEventListener("input",update);
$("reset-calc").addEventListener("click",()=>{$("benefit-form").reset();update();});
$("print-button").addEventListener("click",()=>window.print());
let oldDetails=[];window.addEventListener("beforeprint",()=>{oldDetails=[...document.querySelectorAll("details")].map(d=>({d,open:d.open}));oldDetails.forEach(x=>x.d.open=true);});window.addEventListener("afterprint",()=>oldDetails.forEach(x=>x.d.open=x.open));
const links=[...document.querySelectorAll(".sidebar nav a")];
let navPending=false;function syncNav(){const sections=[...document.querySelectorAll("main>section[id]")];let current=sections[0];if(scrollY>30)for(const s of sections){if(s.getBoundingClientRect().top<innerHeight*.3)current=s;}links.forEach(a=>{if(a.getAttribute("href")==="#"+current.id)a.setAttribute("aria-current","true");else a.removeAttribute("aria-current");});navPending=false;}function requestNav(){if(!navPending){navPending=true;requestAnimationFrame(syncNav);}}addEventListener("scroll",requestNav,{passive:true});addEventListener("resize",requestNav);syncNav();

const yearButtons=[...document.querySelectorAll("[data-year]")],yearPanels=[...document.querySelectorAll(".year-panel")];
function selectYear(id,announce=true){yearPanels.forEach(p=>p.hidden=p.id!=="year-"+id);yearButtons.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.year===id)));if(announce)$("year-live").textContent=$("year-title-"+id).textContent;}
yearButtons.forEach(b=>b.addEventListener("click",()=>selectYear(b.dataset.year)));
selectYear("Y1",false);
update();})();
