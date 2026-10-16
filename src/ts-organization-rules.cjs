'use strict';
const source=require('./ts-org-rule-20260630.json');
const directory=require('./ts-org-evidence-20261016.json');
const normalize=s=>s.replace(/[\s()]/g,'');
const table=id=>source.tables.find(t=>t.id===id);
const entries=source.tables.filter(t=>+t.id.slice(1)<=55).flatMap(t=>t.rows.slice(1).map(r=>({
 id:`RULE-${t.id}-${r.row}`,table:t.id,row:r.row,name:normalize(r.cells[0].paragraphs.join('')),
 locator:`별표4 · ${t.id} · ${r.row}행 · 업무분장 열`,duties:r.cells[1].paragraphs
})));
const find=(id,name)=>entries.find(e=>e.table===id&&(!name||e.name===normalize(name)));
const territories=Array.from({length:14},(_,i)=>{
 const col=i+1,cell=row=>table('T56').rows[row-1].cells.find(c=>c.col===col).paragraphs;
 const name=cell(1).join(''),code=directory.nodes.find(n=>n.name===name&&n.parentCode==='3000000').code;
 const offices=[...cell(4).map(n=>({name:n+'검사소',group:'가군'})),...cell(5).map(n=>({name:n+'검사소',group:'나군'})),...(cell(6).length?[{name:cell(6).join(''),group:'기타'}]:[])];
 return {code,name,area:cell(3).join(''),location:cell(2).join(''),locator:`별표5 · T56 · ${col+1}열`,offices:offices.map(o=>({...o,code:directory.nodes.find(n=>n.name===o.name&&n.parentCode===code)?.code||null})),type:i===0?'서울':i<6?'5개 본부':'8개 본부'};
});
// 별표1 본사 기구표의 명칭·상하위 구조를 명시적으로 전사. 공개 직원안내의 기타 노드와 분리.
const hierarchy=[
 ['본사','AI미래전략실','대외협력실','안전보건실','감사실','기획본부','경영지원본부','모빌리티교통안전본부','자동차검사본부','항공철도안전본부'],
 ['감사실','감사처'],['기획본부','기획조정실','AI디지털실'],
 ['기획조정실','경영기획처','예산처','혁신성과처','ESG경영처'],['경영기획처','법무팀'],
 ['AI디지털실','디지털기획처','AI혁신처','정보보안처','자동차정보처'],['AI혁신처','AI서비스개발팀'],
 ['경영지원본부','운영지원처','인재개발처','재정회계처','자산인프라처'],['자산인프라처','자산관리팀'],
 ['모빌리티교통안전본부','모빌리티연구실','교통안전정책실','모빌리티지원센터'],
 ['모빌리티연구실','모빌리티연구처','데이터융복합처'],['교통안전정책실','교통안전처','자격교육처','기후탄소물류처'],['기후탄소물류처','탄소중립정책팀'],
 ['모빌리티지원센터','정책지원처','규제혁신처','실증사업처'],
 ['자동차검사본부','검사전략실','첨단자동차검사연구센터','튜닝안전기술원'],['검사전략실','검사기획처','특수검사처','주차안전처'],
 ['첨단자동차검사연구센터','첨단검사전략처','첨단연구개발처','AI검사인프라처'],['튜닝안전기술원','기술안전처','시험인증처','기술승인처'],
 ['항공철도안전본부','항공안전실','철도안전실'],['항공안전실','항공안전처','항공자격처','드론관리처','도심항공정책처'],['철도안전실','철도안전처','철도승인처','철도검사처','철도기술처']
];
const expectedParent=Object.fromEntries(hierarchy.flatMap(([p,...children])=>children.map(c=>[c,p])));
const bindings=directory.nodes.map(n=>{
 let entry=null,restriction=null,structure='직원안내 관측 · 세칙 대조 미확인';
 const region=territories.find(t=>n.code===t.code||n.parentCode===t.code);
 const baseName=n.name.replace(/\([^)]*\)/g,'').trim();
 if(['1000000','3000000'].includes(n.code))structure='별표1 조직 탐색 분류';
 else if(n.path.startsWith('본사>')&&expectedParent[n.name]){
  entry=entries.find(e=>+e.table.slice(1)<=46&&e.name===normalize(n.name));
  const p=directory.nodes.find(x=>x.name===expectedParent[n.name]&&x.path.startsWith('본사'));
  structure=p?.code===n.parentCode?'별표1 본사 구조 대조':'별표1·직원안내 상하위 차이 확인 필요';
 }else if(region){
  structure='별표1 지역본부 유형 · 별표5 관할·소속 대조';
  if(/^안전(관리|사업)/.test(n.name)){
   entry=find(region.type==='서울'?'T47':region.type==='5개 본부'?'T48':'T49',baseName);
   restriction='지역본부별 해당 사무에 한정한 적용 · 실제 수행 사무 확인 필요';
  }else if(region.offices.some(o=>o.code===n.code)){
   entry=find(n.name==='수소전기차검사센터'?'T51':'T50');
   restriction='검사소·센터별 해당 사무에 한정한 적용 · 실제 수행 사무 확인 필요';
  }
 }else if(n.code==='7000000'||n.path.startsWith('자동차안전연구원>')){
  structure=n.code==='7000000'?'별표1 부설기관':'직원안내 관측 · 연구원 별도 세칙 확인 필요';
  restriction='별표4 부설기관: 자동차안전연구원 직제시행세칙에 따름 · 하부조직·직무·업무분장 별도 확인 필요';
 }else if(n.name.includes('교육운영처')){
  entry=find('T52');structure='별표1 교육센터 기구 대조';
 }else if(['상주교통안전체험교육센터','화성교통안전체험교육센터'].includes(n.name))structure='별표1 교육센터 기구 대조';
 else if(['화성드론자격센터','김천드론자격센터','시흥드론교육센터'].includes(n.name)){
  entry=entries.find(e=>e.name===n.name);structure='별표1 드론센터 기구 대조';
 }
 const conditional=n.code==='1019700';
 if(conditional)restriction='부칙 제1·2조: 팀장 최초 인사발령일부터 시행 · 발령일 미확인 · 시행 전 AI혁신처 관련 업무·정원 담당';
 return {...n,entryId:entry?.id||null,duties:entry?.duties||[],locator:entry?.locator||null,structure,regionCode:region?.code||null,restriction,effectiveDate:entry&&!conditional?source.effectiveDate:null,effectiveState:conditional?'최초 발령일 확인 대기':entry?'제공 개정본 일반 시행일':'해당 세칙 별도 확인',status:entry?(restriction?'업무분장 확인 · 적용조건 확인 필요':'업무분장 확인'):'업무분장 미확인',inRule:!structure.includes('미확인')&&!structure.includes('별도 세칙')};
});
const summary={directoryNodes:bindings.length,dutyBindings:bindings.filter(n=>n.entryId).length,dutyDefinitions:entries.length,regions:territories.length,affiliatedOffices:territories.reduce((s,t)=>s+t.offices.length,0)};
const notes=[
 '직제시행세칙 2026-06-30 개정본의 조직·업무분장 기준 적용',
 '공개 직원안내 2026-10-16 관측 코드와 규정 명칭의 대응 · 내부 조직키·SSO 식별자 별도 확인',
 '업무분장 확인과 개인별 직무 배정·전결권·자료 접근권한의 별도 검증',
 'AI서비스개발팀 최초 발령일 미확인 · 부칙 경과조치의 별도 적용',
 '지역본부·검사소별 실제 해당 사무 확인 · 소속관계와 지도·관리 업무의 구분',
 '자동차안전연구원 하부조직·업무분장의 별도 세칙 확인 필요',
 '제공 개정본 이후 후속 개정 여부 미확인 · 실제 플랫폼 구현·데이터 연계 미검증'
];
function markdown(){return '# TS 조직·업무 규정 매핑\n\n- 기준: '+source.amendment+'\n- 확인일: '+source.checkedAt+'\n- 원본: '+source.title+'\n- SHA-256: '+source.sha256+'\n- 좌표: '+source.locatorNote+'\n\n'+notes.map(n=>'- '+n).join('\n')+'\n\n## 지역본부 관할·소속\n\n'+territories.map(t=>'### '+t.name+'\n\n- 관할: '+t.area+'\n- 근거: '+t.locator+'\n- 소속: '+t.offices.map(o=>o.name+'('+o.group+')').join(' · ')+'\n').join('\n')+'\n## 조직별 업무분장\n\n'+bindings.map(n=>'### '+n.path+'\n\n- 공개 조직코드: '+n.code+'\n- 조직 구조: '+n.structure+'\n- 업무분장 상태: '+n.status+'\n- 근거: '+(n.locator||'개별 업무분장 근거 확인 필요')+'\n- 시행일: '+(n.effectiveDate||'미확인')+'\n'+(n.restriction?'- 적용조건: '+n.restriction+'\n':'')+(n.duties.length?'\n'+n.duties.map(d=>'- '+d).join('\n')+'\n':'')).join('\n');}
module.exports={source,entries,territories,hierarchy,expectedParent,bindings,summary,notes,markdown};
