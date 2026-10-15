'use strict';
const f=require('./growth-framework.cjs');
const table=(heads,rows)=>['| '+heads.join(' | ')+' |','| '+heads.map(()=>'---').join(' | ')+' |',...rows.map(row=>'| '+row.map(v=>String(v??'').replace(/\|/g,'\\|').replace(/\r?\n/g,'<br>')).join(' | ')+' |')].join('\n');
module.exports=()=>[
 '# 15 공통 스킬 정본과 제안서·사업관리 분기','',f.title,'',f.intro,'',f.foundation.text,'',
 table(['분기','입력','산출물','처리 기준'],f.workBranches.map(x=>[x.title,x.input,x.output,x.boundary])),'',
 table(['스킬','용도','고정 원문'],f.skills.map(x=>[x.id,x.purpose,'['+x.name+']('+x.url+')'])),'',
 f.expansion,'',table(['기관','상태','확인할 사항'],f.agencies.map(x=>[x.name,x.status,x.unknowns.join(' · ')])),'',
 table(['기존 기획','제안서 작성','사업관리'],f.tsMapping.map(x=>[x.id,x.proposal,x.management])),'',
 '['+f.labels.source+']('+f.source.url+') · '+f.version+' · '+f.source.commit,'',f.status,''
].join('\n');
