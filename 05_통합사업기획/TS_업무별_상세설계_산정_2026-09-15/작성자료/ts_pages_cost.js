(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.TSCost=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const rates={BA:475154,DATA:414600,PM:492039,ARCH:541621,UI:336666,DEV:378250,OPS:519469,QA:538638,TEST:197714,SEC:507887};
const names={BA:'업무분석가',DATA:'데이터분석가',PM:'IT PM',ARCH:'IT아키텍트',UI:'UI/UX기획·개발자',DEV:'응용SW개발자',OPS:'정보시스템운용자',QA:'IT품질관리자',TEST:'IT테스터',SEC:'정보보안전문가'};
const weights=[{BA:.8,PM:.2},{DEV:.7,DATA:.3},{DEV:.7,UI:.3},{TEST:.6,QA:.4}];
const defaults={scenario:'mid',overhead:144,tech:20,vat:10,license:0,expenses:0,months:12,operatingFees:0};
const dependencies={17:[1],22:[21]};
function point(range,scenario){if(scenario==='low')return range[0];if(scenario==='high')return range[1];return (range[0]+range[1])/2;}
function unit(w){return Object.entries(w).reduce((s,[k,v])=>s+rates[k]*v,0);}
function effort(p,scenario){return p.days.reduce((s,r)=>s+point(r,scenario),0);}
function labor(p,scenario){return p.days.reduce((s,r,i)=>s+point(r,scenario)*unit(weights[i]),0);}
function commonWeight(c){return c.id==='C00'?{ARCH:.25,SEC:.25,DEV:.25,QA:.25}:{DEV:.7,ARCH:.2,QA:.1};}
function charge(direct,cfg,license=0,expenses=0){let overhead=direct*cfg.overhead/100,tech=(direct+overhead)*cfg.tech/100,net=direct+overhead+tech+license+expenses,vat=net*cfg.vat/100;return {direct,overhead,tech,license,expenses,net,vat,total:net+vat};}
function validate(cfg){for(const k of ['overhead','tech','vat','license','expenses','months','operatingFees'])if(!Number.isFinite(Number(cfg[k]))||Number(cfg[k])<0)throw new Error('금액·요율·기간은 0 이상의 유효한 숫자로 입력하세요.');if(!['low','mid','high'].includes(cfg.scenario))throw new Error('공수 시나리오를 선택하세요.');return cfg;}
function expand(selected){const set=new Set(selected.map(Number));for(const n of [...set])for(const d of dependencies[n]||[])set.add(d);return [...set].sort((a,b)=>a-b);}
function monthlyDays(p){return p.n===23?2:[15,20].includes(p.n)?.5:1;}
function calc(model,selected,options={}){const cfg=validate({...defaults,...options});let ns=expand(selected);const plans=ns.map(n=>model.plans.find(p=>p.n===n));if(plans.some(p=>!p))throw new Error('존재하지 않는 업무 번호입니다.');
 const ids=[...new Set(plans.flatMap(p=>p.common_ids))],commons=model.common_modules.filter(c=>ids.includes(c.id));
 const domain=plans.reduce((s,p)=>s+labor(p,cfg.scenario),0),common=commons.reduce((s,c)=>s+point(c.days,cfg.scenario)*unit(commonWeight(c)),0);
 const pd=plans.reduce((s,p)=>s+effort(p,cfg.scenario),0),cpd=commons.reduce((s,c)=>s+point(c.days,cfg.scenario),0);
 const opDays=plans.length?3+plans.reduce((s,p)=>s+monthlyDays(p),0):0;
 const operating=charge(opDays*cfg.months*unit({OPS:.7,DEV:.3}),cfg,plans.length?cfg.operatingFees:0,0);
 const build=charge(domain+common,cfg,plans.length?cfg.license:0,plans.length?cfg.expenses:0);
 return {selected:selected.map(Number),included:ns,added:ns.filter(n=>!selected.map(Number).includes(n)),commonIds:ids,days:pd+cpd,domainDays:pd,commonDays:cpd,domain:charge(domain,cfg),common:charge(common,cfg),build,operating,operatingDays:opDays*cfg.months,options:cfg,infrastructure:0};
}
return {rates,names,weights,defaults,dependencies,point,unit,effort,labor,commonWeight,charge,validate,expand,monthlyDays,calc};
});
