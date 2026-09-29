const assert=require('node:assert/strict'),fs=require('node:fs'),d=require('../src/proposal-links.cjs'),org=require('../src/org-map-data.cjs'),law=require('../src/law-mapping.cjs'),{routes}=require('../site-routes.json');let count=0;const check=(v,n)=>{assert(v,n);count++};
check(d.profiles.length===37,'37개 업무 검토카드');
check(new Set(d.profiles.map(p=>p.id)).size===37,'업무ID 고유');
const former=['management-planning','budget','innovation','esg','digital-planning','ai-innovation','security','vehicle-info','operations','people','accounting','assets','ai-inspection','tuning-safety','test-certification','technical-approval','air-safety','air-qualification','drone','uam','rail-safety','rail-approval','rail-inspection','rail-tech','ai-strategy','external','health','audit-dept','regions','stations','experience','drone-centers'];
for(const id of former){check(d.forOrg(id).length>0,'미연결 조직 검토 보완 '+id);check(org.documents(org.nodes[id]).some(r=>r.to.startsWith('proposal-links.html?unit=')),'조직에서 상세 진입 '+id)}
for(const p of d.profiles){check(p.org===null||!!org.nodes[p.org],'유효 조직 '+p.id);check(p.inputs.length>=3&&p.flow.length>=4,'입력·처리흐름 '+p.id);check(p.known&&p.goal&&p.gap&&p.llm&&p.rules&&p.human,'근거·가설·AI·규칙·사람 '+p.id);check(p.metrics.length===3&&p.metrics.every(m=>m.formula&&m.baseline===null&&m.target===null),'미측정 수치 조작 금지 '+p.id);check(p.sourceIds.length>0&&p.sourceIds.every(id=>d.sources[id]?.url?.startsWith('https://')),'공식 근거 연결 '+p.id)}
check(d.legalLinks.length===9,'미연결 법정관계9개');
for(const b of law.bindings.filter(x=>!x.concepts.length)){check(!!d.forLaw(b.id),'법정관계 누락 없음 '+b.id)}
for(const r of d.legalLinks){check(law.bindings.some(b=>b.id===r.binding),'법정관계ID 유효');check(r.profiles.every(id=>d.profileById[id]),'법정업무 상세 유효');check(!!r.type&&!!r.note,'직접·관련·보류 구분')}
check(d.associationLinks.length===10,'협회 후보10개 연결');
for(const r of d.associationLinks){check(r.orgs.every(id=>org.nodes[id])&&r.profiles.every(id=>d.profileById[id])&&r.laws.every(id=>law.bindings.some(b=>b.id===id)),'협회 연결 무결성 '+r.proposal);check(!!r.type&&!!r.note,'협회관계 의미 명시 '+r.proposal)}
check(d.profileById['ai-strategy'].pending&&d.profileById['platform-scope'].pending,'미확정 배정 유지');
check(d.forLaw('B25-APPROVAL').profiles.includes('rail-approval')&&!d.forLaw('B25-APPROVAL').profiles.includes('rail-type'),'안전관리체계승인과 차량형식승인 구분');
check(d.profileById['rail-license'].sourceIds.includes('rail-qual-role'),'철도 자격 담당 근거');
check(d.forAssociation('B05').note.includes('동일시하지'),'철도 평가·시험범위 혼동 방지');
check(d.forAssociation('B08').note.includes('동일사업 매핑 아님'),'DRT와 운송플랫폼 분리');
check(routes.includes('proposal-links.html')&&fs.existsSync('dist/proposal-links.html'),'정적 진입 경로');
const published=JSON.parse(fs.readFileSync('dist/downloads/proposal-links.json','utf8'));check(published.profiles.length===37,'배포용 자료 원본 일치');
check(fs.readFileSync('dist/downloads/proposal-links.md','utf8').includes('철도안전처'),'문서 다운로드');
check(!fs.readFileSync('dist/downloads/proposal-links.md','utf8').includes('C:/Users/'),'개인 로컬경로 제외');
console.log(JSON.stringify({result:'통과',checks:count,formerUnlinkedOrganizations:32,profiles:37,legalLinks:9,associationLinks:10}));
