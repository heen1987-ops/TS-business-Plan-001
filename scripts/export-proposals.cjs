const fs=require('node:fs'),path=require('node:path');
const {departments}=require('../src/data.json'),design=require('../src/proposal-design.cjs'),visual=require('../src/proposal-diagrams.cjs');
module.exports=function exportProposals(downloads){const out=path.join(downloads,'proposals');fs.mkdirSync(out,{recursive:true});const index=[];
for(const d of departments){const sections=design.build(d.code),diagrams=visual.types.map(t=>visual.diagram(d.code,t));for(const g of diagrams)fs.writeFileSync(path.join(out,path.basename(g.path)),g.svg);
 const data={code:d.code,department:d.name,date:design.date,status:design.status,sections,diagrams:diagrams.map(({svg,...g})=>g)};
 fs.writeFileSync(path.join(out,d.code+'_상세기획.json'),JSON.stringify(data,null,2));
 const md=['# '+d.name+' · AX 상세기획','','작성일: '+design.date+'  \n상태: '+design.status,'','근거·기획 가설·가상 사례·실측 전 목표를 구분한 검토자료. 금액 산정과 실제 구축 완료를 의미하지 않음.',''];
 const cell=v=>String(v??'').replace(/\|/g,'\\|').replace(/\r?\n/g,'<br>');
 for(const s of sections){md.push('## '+s.title,'',s.message,'');if(s.diagram){const g=diagrams.find(x=>x.type===s.diagram.type);md.push('!['+g.title+']('+path.basename(g.path)+')','',g.summary,'');}
 for(const c of s.cards)md.push('### '+c.title,'',...c.bullets.map(b=>'- '+b),'');
 for(const t of s.tables||[])md.push('### '+t.title,'','| '+t.headers.map(cell).join(' | ')+' |','| '+t.headers.map(()=> '---').join(' | ')+' |',...t.rows.map(r=>'| '+r.map(cell).join(' | ')+' |'),'');
 md.push('상태: '+s.status,'');for(const l of s.links||[]){const dest=/^https?:/.test(l.to)?l.to:'../../'+l.to;md.push('- ['+l.label+']('+dest+')')}md.push('');}
 fs.writeFileSync(path.join(out,d.code+'_상세기획.md'),md.join('\n'));index.push({code:d.code,department:d.name,sections:sections.length,diagrams:diagrams.length,document:d.code+'_상세기획.md'});
}fs.writeFileSync(path.join(out,'index.json'),JSON.stringify({date:design.date,status:design.status,departments:index},null,2));console.log('상세기획 내보내기: '+index.length+'개 처 · '+index.length*visual.types.length+'개 SVG');};
