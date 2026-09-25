function calculateImpact(m,raw){
 if(m.target==null)return {valid:false,reason:'기준선 확보 전 목표 미설정'};
 if(raw===''||raw==null)return {valid:false,reason:'기준값 입력 필요'};
 const b=Number(raw);
 if(!Number.isFinite(b)||b<0)return {valid:false,reason:'0 이상의 유효한 숫자 입력 필요'};
 if((m.unit==='%'||m.unit==='점')&&b>100)return {valid:false,reason:'0~100 범위 입력 필요'};
 if(b===0&&m.mode==='down')return {valid:false,reason:'기준값 0: 감소효과 산정 대상 없음'};
 const after=m.mode==='down'?b*(1-m.target/100):b+m.target;
 if((m.mode==='pp'||m.mode==='point')&&after>100)return {valid:false,reason:'상한 100 초과: 기준선에 맞춘 목표 재설정 필요'};
 return {valid:true,before:b,after,delta:Math.abs(after-b)};
}
function targetLabel(m){if(m.target==null)return '기준선 확보 전 목표 미설정';return m.mode==='down'?m.target+'% 감소':m.target+(m.mode==='pp'?'%p 향상':'점 향상')}
module.exports={calculateImpact,targetLabel};
