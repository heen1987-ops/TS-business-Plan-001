const {departments,legal}=require('./data.json');
const date='2026-09-23';
const page=(id,title,to,extra={})=>({id,title,to,...extra});
const group=(id,title,children,extra={})=>({id,title,children,...extra});
const dp=(d,n)=>d.folder+'/'+['01_사업정의','02_UI시제품','03_아키텍처_흐름'][n]+'.html';
const views=[['modules','구성요소·역할'],['interfaces','연계·인터페이스'],['data','데이터·원장'],['runtime','서버 배치·복구'],['trace','요구사항·RFP 추적']];
function architecture(id,base){return [page(id+'-overview','전체 구성도·상세설계',base),...(!id.startsWith('KA-')?[['concept','컨셉도·공공 편익'],['overall','전체 아키텍처'],['service','서비스 아키텍처'],['data','데이터 흐름도'],['privacy','개인정보 처리도']].map(([key,title])=>page(id+'-detail-'+key,title,base+'#section-detail-'+key)):[]),...views.map(([key,title])=>page(id+'-'+key,title,base+(base.includes('?')?'&':'?')+'arch='+key))]}
const sections=[
 group('institution','공단 이해',[page('home','TS의 정의부터 읽기','index.html'),page('about','기관의 존재 의의','about.html'),group('laws','법정·수탁업무',[page('legal','전체 업무 지도','legal.html'),page('law-mapping','법령·처·컨셉 매핑','legal/mapping.html'),...legal.groups.map(g=>page('law-'+g.id,g.title,'legal/'+g.id+'.html')),page('legal-sources','법령 근거·확인 범위','legal/sources.html')])],{description:'설립 목적·법적 근거·국민 편익',sourceFiles:['src/data.json']}),
 group('strategy','중장기 전략',[page('vision','2026–2030 경영목표·전략과제','vision.html')],{description:'기관의 방향과 전환 목표',sourceFiles:['src/data.json','src/slide-data.cjs']}),
 group('organization','조직·업무',[page('map','조직 기반 연결지도','index.html?view=map'),page('organization-page','조직도·수행업무','organization.html'),page('ars','대국민 ARS 업무지도','ars.html')],{description:'조직 계통에서 업무와 자료로 이동',sourceFiles:['src/org-map-data.cjs','src/data.json','src/ars.json']}),
 group('solutions','AX 전환 제안',[page('solutions-page','처별 제안 전체보기','solutions.html'),page('proposal-links','추가 조직·업무 상세제안','proposal-links.html'),...departments.map(d=>group('dept-'+d.code,d.name,[
  page(d.code+'-concept','사업 정의·컨셉',dp(d,0)),page(d.code+'-flow','서비스 흐름',dp(d,1)),
  group(d.code+'-architecture','상세 아키텍처',architecture(d.code+'-arch',dp(d,2)),{kind:'아키텍처',sourceFiles:['src/architecture-v2.json']}),
  group(d.code+'-measurement','정량효과·측정방법',[page(d.code+'-impact','추진 근거·목표',dp(d,0)+'?view=impact'),...[1,2,3].map(n=>page(d.code+'-metric-'+n,'지표 '+n+' · 측정명세',dp(d,0)+'?view=impact&metric='+d.code+'-E0'+n+'&slide='+d.code+'-E0'+n+'-method-1'))],{kind:'정량평가',sourceFiles:['src/impact.json','src/measurement-data.cjs']}),
  page(d.code+'-mandate','컨셉·업무·법령 매핑','legal/mapping.html?dept='+d.code,{kind:'법령·컨셉 매핑'}),
  page(d.code+'-evidence','문제·법정업무 근거',dp(d,0)+'?view=evidence',{kind:'근거자료'}),
  page(d.code+'-websites','공식 홈페이지·담당 근거','websites.html?node='+d.code,{kind:'공식 사이트 매핑',sourceFiles:['src/official-sites.json']}),
  page(d.code+'-requirements','요구사항·대가 산정',dp(d,0)+'?view=requirements',{kind:'요구사항'})
 ],{organization:d.code,kind:'처별 제안',sourceFiles:['src/data.json','src/slide-data.cjs']})),
 group('katri','자동차안전연구원 KATRI',[page('katri-main','문서 1차 검토 적용안','katri.html'),...[['KA-01','기술검토·안전검사'],['KA-02','부품 증빙·사후관리'],['KA-03','국제기준 변경 대응']].map(([id,title])=>group(id,title,[page(id+'-case','업무·검토 내용','katri.html?case='+id),group(id+'-architecture','상세 아키텍처',architecture(id+'-arch','architecture.html?unit='+id))],{organization:'KATRI',kind:'업무 적용안'}))],{organization:'KATRI',sourceFiles:['src/katri.json','src/architecture-v2.json']})
 ],{description:'목적·근거·기술·기대효과의 연결',sourceFiles:['src/data.json'],kind:'기획 제안'}),
 group('services','공식 서비스',[page('websites','처별 공식 홈페이지·시스템','websites.html'),page('websites-pending','담당 처 확인 대기','websites.html?status=pending')],{description:'공식 사이트와 담당 관계 확인',sourceFiles:['src/official-sites.json'],kind:'공식 사이트 매핑'}),
 group('resources','자료실',[page('guide','TS의 정의부터 읽는 안내','index.html?view=guide'),page('updates','추가 설계 정리','updates.html'),page('discovery','업무 전환 후보·근거','discovery.html'),page('associations','협회·민원 조사와 미제공 기능','associations.html'),page('registry','자료 등록 원장','registry.html',{kind:'등록 원장',sourceFiles:['src/navigation.cjs']})],{description:'자료 분류·근거·변경 내용 관리',sourceFiles:['src/updates.json','src/discovery.json']})
];
const alias={'react/index.html':'index.html','10_세대화_통합검토.html':'about.html','11_중장기목표_처별성과.html':'vision.html','16_조직도_수행업무_분석.html':'organization.html','17_조직별_AX_전환제안.html':'solutions.html','inspection.html':'solutions.html'};
function canonical(route){const [path,q='']=route.split('#')[0].split('?'),s=new URLSearchParams(q);let p=alias[path]||path||'index.html';
 for(const key of ['contract','store','slide','reading','v','history'])s.delete(key);
 if(p==='index.html'&&s.has('node')){s.delete('node');s.set('view','map');}
 if(p==='architecture.html'){const d=departments.find(d=>d.code===(s.get('unit')||'DF'));if(d){p=dp(d,2);s.delete('unit')}}
 if(s.has('view')&&p.startsWith('처별/'))p=p.replace(/0[123]_[^/]+\.html$/,'01_사업정의.html');
 s.sort();return p+(s.size?'?'+s:'')+(route.includes('#section-detail-')?'#'+route.split('#')[1]:'')
}
function sourceFilesFor(route){
 if(route.startsWith('proposal-links.html'))return ['src/proposal-links.cjs','src/ProposalLinks.jsx','src/proposal-links.css'];
 const [path,q='']=route.split('?'),query=new URLSearchParams(q),slide='src/slide-data.cjs';
 if(path==='legal/mapping.html')return ['src/LawMapping.jsx','src/law-mapping.json','src/law-mapping.cjs','src/data.json'];
 if(path==='associations.html')return ['src/Associations.jsx','src/association-research.json'];
 if(path==='registry.html')return ['src/Registry.jsx','src/navigation.cjs'];
 if(path==='websites.html')return ['src/Websites.jsx','src/official-sites.json'];
 if(path==='index.html')return query.get('view')==='map'?['src/Home.jsx','src/org-map-data.cjs','src/data.json']:['src/institution-guide.cjs','src/DocumentReader.jsx',slide];
 if(path.startsWith('처별/')){
  if(path.includes('03_')||query.has('arch'))return ['src/Architecture.jsx','src/architecture-v2.json','src/proposal-design.cjs','src/proposal-diagrams.cjs',slide];
  if(query.get('view')==='impact')return ['src/Measurement.jsx','src/measurement-data.cjs','src/impact.json',slide];
  return ['src/pages.jsx','src/data.json','src/impact.json','src/law-mapping.json',slide];
 }
 if(path==='architecture.html')return ['src/Architecture.jsx','src/architecture-v2.json',slide];
 const topics={'ars.html':['Ars','ars'],'katri.html':['Katri','katri'],'updates.html':['Updates','updates'],'discovery.html':['Discovery','discovery']};
 if(topics[path]){const [component,data]=topics[path];return ['src/'+component+'.jsx','src/'+data+'.json',slide]}
 return ['src/pages.jsx','src/data.json','src/law-mapping.json',slide];
}
const records=[];
function walk(nodes,trail=[],inherited={}){for(const n of nodes){const meta={...inherited,...n},chain=[...trail,n];if(n.children)walk(n.children,chain,meta);else records.push({id:n.id,title:n.title,route:n.to,menuId:chain[0].id,menu:chain[0].title,parentId:trail.at(-1)?.id||null,breadcrumb:chain.map(x=>x.title),organization:meta.organization||null,kind:meta.kind||'안내·분석',sourceFiles:sourceFilesFor(n.to),status:'등록 경로·분류 확인 / 내용 상태는 원문 참조',registeredAt:date})}}
walk(sections);
function locate(route){const key=canonical(route);const exact=records.find(r=>r.route===route);if(exact)return exact;const record=records.find(r=>canonical(r.route)===key);if(record)return record;
 const [path]=key.split(/[?#]/);if(path==='websites.html')return records.find(r=>r.id==='websites');return records.find(r=>r.route.split(/[?#]/)[0]===path)||null}
function trailFor(route){const record=locate(route);if(!record)return [];function find(ns,trail=[]){for(const n of ns){if(n.id===record.id)return [...trail,n];if(n.children){const a=find(n.children,[...trail,n]);if(a)return a}}}return find(sections)||[]}
function firstRoute(n){return n.to||(n.children||[]).map(firstRoute).find(Boolean)}
module.exports={sections,records,date,canonical,locate,trailFor,firstRoute};
