'use strict';
const fs=require('node:fs'),path=require('node:path'),d=require('../src/ts-department-mapping.cjs');
const csv=rows=>'\ufeff'+rows.map(r=>r.map(x=>'"'+String(x??'미확인').replace(/^[=+@-]/,"'$&").replace(/"/g,'""')+'"').join(',')).join('\r\n')+'\r\n';
function files(){return {
 'ts-department-mapping.md':d.markdown(),
 'ts-department-mapping.json':JSON.stringify(d,null,2)+'\n',
 'ts-department-mapping.csv':csv([['매핑ID','공식 조직코드','부서','조직경로','특성 제안','직무 요약 제안','맥락 구분키','수행 제안','검토 제안','승인 미확정','협업 제안','협업 상대 제안','1차 참여 제안','구축 묶음','요구사항','검수','기존 기획','공식 근거ID','공식 원문','확인일','상태'],...d.rows.map(r=>[r.id,r.code,r.name,r.path,r.character,r.job,r.context,r.roles.perform,r.roles.review,r.roles.approve,r.roles.collaborate,r.peers.map(d.name).join(' / '),r.participation,r.workPackages.join(' / '),r.requirements.join(' / '),r.tests.join(' / '),r.legacy,r.evidenceIds.join(' / '),r.sourceUrl,d.date,r.status])]),
 'ts-org-acceptance.csv':csv([['검수ID','요구ID','검수 시나리오','입력','판정 기준 제안','증빙','상태'],...d.tests.map(t=>[t.id,t.requirement,t.name,t.input,t.criterion,t.proof,t.status])]),
 'ts-org-collaboration.csv':csv([['관계ID','보내는 조직코드','보내는 조직','받는 조직코드','받는 조직','발생 조건','입력과 결과','양측 확인','검수','상태'],...d.relations.map(r=>[r.id,r.from,d.name(r.from),r.to,d.name(r.to),r.trigger,r.exchange,r.check,r.tests.join(' / '),r.status])])
};}
function exportMapping(out){fs.mkdirSync(out,{recursive:true});for(const [name,body] of Object.entries(files()))fs.writeFileSync(path.join(out,name),body);}
module.exports=exportMapping;module.exports.files=files;
