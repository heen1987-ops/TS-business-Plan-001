const assert=require('node:assert/strict'),fs=require('node:fs'),ux=require('../src/ux-navigation.cjs'),hub=require('../src/planning-hub.cjs');
let checks=0;const check=(pass,label)=>{assert.ok(pass,label);checks++};
for(const word of ['ISP','B01','PRV04','SFR-101','가격'])check(ux.searchRecords.some(r=>r.type==='planning'&&[r.title,...r.breadcrumb,...(r.keywords||[])].join(' ').toLowerCase().includes(word.toLowerCase())),'최신 기획 검색 '+word);
for(const route of ['index.html?q=DRT','index.html?bundle=B01','react/index.html?q=MR-01'])check(ux.trailFor(route).at(-1).title==='2027년 사업기획 홈','필터 홈의 현재 위치 '+route);
check(ux.trailFor('index.html#section-purpose').at(-1).title==='TS의 정의와 역할','기관 안내 위치');
check(ux.contextLinks('research-library.html?view=planning').links.some(n=>n.to.endsWith('#implementation-feedback')),'구현 질문서 목차');
check(require('../src/isp-review.cjs').facts.find(f=>f.id==='E06').to.endsWith('#implementation-feedback'),'피드백 근거 링크 실제 대상');
for(const p of hub.projects){check(p.purpose&&p.gap&&p.how&&p.inputs.length&&p.metrics.length,'42업무의 목적·한계·HOW·자료·측정 '+p.id);check(p.purpose!==p.scope,'검증범위를 업무목적으로 오인 금지 '+p.id);check(p.selected===false&&p.target===null&&p.cost===null,'미확정 보존 '+p.id);}
check(hub.projects.find(p=>p.id==='MR-02').how.includes('배차')&&!hub.projects.find(p=>p.id==='MR-02').purpose.includes('앱미터'),'DRT와 앱미터 분리');
for(const id of ['MR-01','MR-02','EX22-02'])check(hub.departmentSearchText(hub.projects.find(p=>p.id===id).code).includes(id.toLowerCase()),'처별 공통 검색 ID '+id);
check(!fs.readFileSync('src/Revision47.jsx','utf8').includes('현재 검토:'),'이전 편성분류의 현재 승격 없음');
const profiles=require('../src/proposal-links.cjs'),pms=require('../src/skill-pms.cjs');for(const p of hub.projects){const f=profiles.profileById[pms.portfolio.find(x=>x.id===p.id).profileId];if(f)check(p.decisionBoundary.includes(f.human),'기존 공식 판단·책임 보존 '+p.id);check(p.sources.length>0&&p.sources.every(x=>/^https?:\/\//.test(x.url)),'기존 조사 출처 연결 '+p.id);}check(hub.projects.reduce((n,p)=>n+p.metrics.length,0)===128,'업무별128개 측정 산식');
console.log(JSON.stringify({result:'통과',checks,projects:hub.projects.length,latestPlanningSearch:ux.searchRecords.filter(r=>r.type==='planning').length}));
