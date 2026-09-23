const {departments}=require('./data.json');
const departmentByCode=Object.fromEntries(departments.map(d=>[d.code,d]));
const unit=(id,name,summary,children=[],extra={})=>({id,name,summary,children,kind:'organization',...extra});
const dept=(code)=>{const d=departmentByCode[code];return unit(code,d.name,d.title,[],{code,kind:'department'});};
const pending=(id,name)=>unit(id,name,'기존 조직도 연결 · 처별 상세 제안 미연결',[],{pending:true});
const tree=unit('TS','한국교통안전공단','안전하고 편리한 교통환경을 위한 법정·수탁업무와 AX 전환 제안',[
 unit('planning','기획본부','경영방향·자원 배분·성과·디지털 기반',[
  unit('planning-office','기획조정실','경영·예산·성과·ESG 관련 조직',[
   pending('management-planning','경영기획처'),pending('budget','예산처'),pending('innovation','혁신성과처'),pending('esg','ESG경영처')]),
  unit('digital-office','AI디지털실','디지털·AI·정보보호·자동차정보 관련 조직',[
   pending('digital-planning','디지털기획처'),pending('ai-innovation','AI혁신처'),pending('security','정보보안처'),pending('vehicle-info','자동차정보처')])]),
 unit('support','경영지원본부','인력·재정·자산 등 기관 운영 지원',[
  pending('operations','운영지원처'),pending('people','인재개발처'),pending('accounting','재정회계처'),pending('assets','자산인프라처')]),
 unit('mobility','모빌리티교통안전본부','운수·도로안전·이동서비스·정책 실행',[
  unit('mobility-lab','모빌리티연구실','조사·교통정보·데이터 활용',[dept('MR'),dept('DF')]),
  unit('safety-office','교통안전정책실','안전관리·자격교육·물류',[dept('SA'),dept('QE'),dept('CL')]),
  unit('mobility-center','모빌리티지원센터','정책지원·규제혁신·실증',[dept('PS'),dept('RI'),dept('DV')])]),
 unit('inspection','자동차검사본부','운행차·특수검사·주차안전·검사기술·튜닝',[
  unit('inspection-office','검사전략실','검사 기획·특수검사·주차안전',[dept('IP'),dept('SI'),dept('PK')]),
  unit('advanced-center','첨단자동차검사연구센터','검사전략·연구개발·검사 인프라',[dept('AD'),dept('RD'),pending('ai-inspection','AI검사인프라처')]),
  unit('tuning','튜닝안전기술원','튜닝 기술·시험·승인',[pending('tuning-safety','기술안전처'),pending('test-certification','시험인증처'),pending('technical-approval','기술승인처')])]),
 unit('air-rail','항공철도안전본부','항공·드론·철도의 안전·자격·기술 검토',[
  unit('air-office','항공안전실','항공·드론 관련 조직',[pending('air-safety','항공안전처'),pending('air-qualification','항공자격처'),pending('drone','드론관리처'),pending('uam','도심항공정책처')]),
  unit('rail-office','철도안전실','철도 승인·검사·안전·기술 관련 조직',[pending('rail-safety','철도안전처'),pending('rail-approval','철도승인처'),pending('rail-inspection','철도검사처'),pending('rail-tech','철도기술처')])]),
 unit('chair','이사장 직속 조직','직속 조직을 묶은 탐색 항목',[
  pending('ai-strategy','AI미래전략실'),pending('external','대외협력실'),pending('health','안전보건실')],{kind:'group'}),
 unit('audit','감사(비상임)','이사장 직속과 구분되는 감사 계통',[
  unit('audit-office','감사실','감사 계통의 조직',[pending('audit-dept','감사처')])]),
 unit('KATRI','자동차안전연구원','차량·부품·국제기준 문서 검토의 AX 적용안',[
  unit('KA-01','기술검토·안전검사','검토대상·기준·증빙의 누락 확인',[],{kind:'case'}),
  unit('KA-02','부품 증빙·사후관리','부품 자료와 보완·후속조치 연결',[],{kind:'case'}),
  unit('KA-03','국제기준 변경 대응','기준 변경의 적용범위·검토사항 연결',[],{kind:'case'})],{kind:'institute'}),
 unit('field','지역·현장 조직','지역본부·검사·교육 현장의 탐색 묶음',[
  pending('regions','지역본부'),pending('stations','자동차검사소'),
  pending('experience','교통안전체험교육센터'),pending('drone-centers','드론교육·자격센터')],{kind:'group'})
],{kind:'institution'});
const nodes={},parents={};
function index(node,parent){if(nodes[node.id])throw Error('중복 조직 ID: '+node.id);nodes[node.id]=node;if(parent)parents[node.id]=parent.id;node.children.forEach(child=>index(child,node));}
index(tree);
function ancestry(id){const result=[];let node=nodes[id];while(node){result.unshift(node);node=nodes[parents[node.id]];}return result;}
function proposals(node){return node.code?[departmentByCode[node.code]]:node.children.flatMap(proposals);}
function doc(id,name,summary,to){return {id,name,summary,to,kind:'document'};}
function documents(node){
 if(node.code){const d=departmentByCode[node.code],p=d.folder+'/01_사업정의.html';return [
  doc('concept','사업 정의·컨셉','목적 · 대상자 · 달라지는 업무',p),
  doc('flow','서비스 흐름','사용자 · AI · 담당자의 처리 흐름',d.folder+'/02_UI시제품.html'),
  doc('architecture','전체 아키텍처','모듈 · 연계 · 데이터 · 실행 구조',d.folder+'/03_아키텍처_흐름.html'),
  doc('evidence','문제·법정업무 근거','WHY · 원문 · 확인 범위',p+'?view=evidence'),
  doc('impact','정량효과·측정방법','3개 지표 · 산식 · 표본 · 판정',p+'?view=impact'),
  doc('requirements','요구사항·대가 산정','개발범위 · 요구사항 · 투입 공수',p+'?view=requirements')];}
 if(node.kind==='case')return [
  doc('case','업무·검토 내용','대상 자료 · 검토항목 · 담당자 확인','katri.html?case='+node.id),
  doc('architecture','상세 아키텍처','구성요소 · 인터페이스 · 데이터','architecture.html?unit='+node.id)];
 if(node.id==='KATRI')return [doc('katri','KATRI 적용안 전체','문서 1차 검토 · 누락방지 · 후속처리','katri.html')];
 if(node.id==='TS')return [
  doc('about','TS의 존재 의의','설립 목적 · 기관의 역할','about.html'),
  doc('vision','2026–2030 계획','경영목표 · 전략과제','vision.html'),
  doc('legal','법정·수탁업무','적용 법령 · 위임·위탁 관계','legal.html'),
  doc('all','처별 AX 제안 전체','13개 처의 제안 비교','solutions.html')];
 return [
  doc('organization','조직·업무 분석','제공 조직도와 기존 원장 확인','organization.html'),
  doc('legal','법정·수탁업무 지도','업무별 법령·수행조직 대조','legal.html')];
}
function kindLabel(node){return node.kind==='group'?'탐색 묶음':node.kind==='case'?'적용안':node.kind==='department'?'AX 제안 연결':node.pending?'상세 제안 미연결':node.kind==='document'?'자료 바로가기':'조직';}
function edgeKind(parent,child){return child.kind==='document'||[parent.kind,child.kind].some(k=>k==='group'||k==='case')?'related':'organization';}
module.exports={edgeKind,tree,nodes,parents,ancestry,proposals,documents,departmentByCode,kindLabel};
