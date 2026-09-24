const registry=require('./navigation.cjs'),{departments}=require('./data.json'),guide=require('./institution-guide.cjs');
const page=(id,title,to)=>({id,title,to});
const sections=registry.sections.map(s=>({...s,children:s.children}));
sections[0].children=[page('intro','TS의 정의부터 읽기','about.html'),page('law-overview','법정업무와 책임','legal.html'),page('law-mapping','법령·담당 처·제안 연결','legal/mapping.html'),page('law-sources','법령 근거·판본 확인','legal/sources.html')];
sections[3].children=[page('all-proposals','전체 제안 살펴보기','solutions.html'),...departments.map(d=>page('proposal-'+d.code,d.name,d.folder+'/01_사업정의.html')),page('katri-reading','자동차안전연구원 적용안','katri.html')];
const journey=guide.journey;
function currentDepartment(route){return departments.find(d=>route.startsWith(d.folder+'/')||new URL(route,'https://local/').searchParams.get('dept')===d.code);}
function contextLinks(route){const d=currentDepartment(route);if(!d)return null;const base=d.folder+'/01_사업정의.html';return {d,links:require('./reading-structure.cjs').definitions.map(c=>page('read-'+c.id,c.title,base+'#section-chapter-'+c.id))};}
module.exports={sections,journey,contextLinks,currentDepartment};
