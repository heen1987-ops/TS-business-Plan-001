const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const design=require('../src/proposal-design.cjs'),visual=require('../src/proposal-diagrams.cjs'),{departments}=require('../src/data.json'),impact=require('../src/impact.json'),arch=require('../src/architecture-v2.json'),{getDocument,targetFromRoute}=require('../src/document-data.cjs');
let checks=0;const check=(v,m)=>{assert(v,m);checks++};let diagrams=0,rows=0;
for(const d of departments){const list=design.build(d.code),u=arch.units.find(x=>x.code===d.code);check(list.length===19,'상세기획 19절 '+d.code);check(list.find(x=>x.id==='detail-sixw').cards.length===6,'육하원칙 '+d.code);check(!/undefined|NaN|\[object Object\]/.test(JSON.stringify(list)),'누락 문자열 없음');
 for(const s of list){check(s.status&&s.message,'절 상태·요지');for(const t of s.tables||[]){check(t.rows.every(r=>r.length===t.headers.length&&r.every(x=>typeof x==='string'&&x.length)),'표 스키마 '+t.title);rows+=t.rows.length}}
 check(!/현재 TS 계약|계약 미포함|사용자 확인 기준/.test(JSON.stringify(list)),'공개 자료에 개별 계약범위 금지');
 const trace=list.find(x=>x.id==='detail-trace').tables[0];for(const r of u.requirements_mapping)check(trace.rows.find(x=>x[0].startsWith(r.id))[1]===r.module,'원장 모듈 대응 '+r.id);
 const out=list.find(x=>x.id==='detail-outcomes');for(const m of impact.departments[d.code].metrics){const target=out.cards.find(x=>x.title.startsWith(m.id)).bullets[0];check(target.includes(m.target+({down:'% 상대감소',pp:'%p 향상',point:'점 향상'}[m.mode])),'지표 단위 보존 '+m.id);check(target.includes(m.targetStatus),'실측 전 목표 표시')}
 const route=d.folder+'/01_사업정의.html',doc=getDocument(route);for(const type of visual.types){const g=visual.diagram(d.code,type);check(new Set(g.nodes.map(n=>n.id)).size===g.nodes.length,'도식 ID');check(g.edges.every(e=>g.nodes.some(n=>n.id===e.from)&&g.nodes.some(n=>n.id===e.to)),'도식 연결');check(g.nodes.every(n=>n.x>=0&&n.y>=0&&n.x+n.w<=g.width&&n.y+n.h<=g.height),'도식 경계 '+type);
 check(!/<script|foreignObject|https?:\/\/(?!www.w3.org)/.test(g.svg),'실행·외부 자산 없는 SVG');
 check(fs.readFileSync(path.join('dist',g.path),'utf8')===g.svg,'빌드 동일 SVG');check(targetFromRoute(route+'#section-detail-'+type,doc)==='detail-'+type,'직접 연결 '+type);
 if(type==='privacy'){for(const row of design.privacyStages)check(g.nodes.some(n=>n.id===row[0]&&n.title.includes(row[1])),'개인정보 본문·도식 '+row[0]);check(['hold','delete','retain'].every(id=>g.nodes.some(n=>n.id===id)),'개인정보 분기');}
 diagrams++;}
 for(const ext of ['md','json'])check(fs.existsSync('dist/downloads/proposals/'+d.code+'_상세기획.'+ext),'문서 다운로드');
 check(doc.sections.filter(x=>x.diagram).length===5,'한 문서 5종 도식');
}
check(departments.length===13&&diagrams===65,'대상수 보존');console.log(JSON.stringify({result:'통과',checks,departments:13,detail_sections:247,diagrams,table_rows:rows,requirements:104,metric_protocols:39}));
