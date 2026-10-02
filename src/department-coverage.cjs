const manifest=require('./department-documents.json');
const sources=[
 {id:'ORG-HQ',title:'한국교통안전공단 본사 조직도',url:'https://main.kotsa.or.kr/portal/contents.do?menuCode=06020400',published:'게시·개정일 미표시',checkedAt:'2026-10-01',location:'공개 조직도 · 감사처 및 5개 본부 산하 처',scope:'본사 처 명칭·소속. 현행 직제·업무분장·전결 전문과 구분.'},
 {id:'ORG-KATRI',title:'한국교통안전공단 자동차안전연구원 조직도',url:'https://main.kotsa.or.kr/portal/contents.do?menuCode=06020403',published:'게시·개정일 미표시',checkedAt:'2026-10-01',location:'연구기획실·결함조사·미래차연구·자율주행·인증정책 계통',scope:'연구원 처·센터·사무국 명칭. 처 명칭만으로 업무·위탁·전결 확정 금지.'},
 {id:'ORG-KATRI-CROSS',title:'자동차안전연구원 공식 조직구성',url:'https://katri.kotsa.or.kr/web/contents/katri50602.do',published:'게시·개정일 미표시',checkedAt:'2026-10-01',location:'처 명칭·상위 조직 교차 대조',scope:'13개 처 명칭 교차 확인. 자율주행실증처 업무표의 과거 K-City연구처 명칭은 추가 확인 대상.'},
 {id:'ORG-FIELD',title:'한국교통안전공단 분사무소 조직도',url:'https://main.kotsa.or.kr/portal/contents.do?menuCode=06020402',published:'게시·개정일 미표시',checkedAt:'2026-10-01',location:'지역본부 아래 안전관리처·안전사업처, 체험교육·드론센터',scope:'지역본부 하위 처 유형 2종 확인. 지역별 실제 설치 수·업무·전결 동일성은 미확인.'}
];
const groups=[
 {scope:'headquarters',parentId:'audit-office',parent:'감사실',entries:[['audit-dept','감사처']]},
 {scope:'headquarters',parentId:'planning-office',parent:'기획본부 / 기획조정실',entries:[['management-planning','경영기획처'],['budget','예산처'],['innovation','혁신성과처'],['esg','ESG경영처']]},
 {scope:'headquarters',parentId:'digital-office',parent:'기획본부 / AI디지털실',entries:[['digital-planning','디지털기획처'],['ai-innovation','AI혁신처'],['security','정보보안처'],['vehicle-info','자동차정보처']]},
 {scope:'headquarters',parentId:'support',parent:'경영지원본부',entries:[['operations','운영지원처'],['people','인재개발처'],['accounting','재정회계처'],['assets','자산인프라처']]},
 {scope:'headquarters',parentId:'mobility-lab',parent:'모빌리티교통안전본부 / 모빌리티연구실',entries:[['MR','모빌리티연구처'],['DF','데이터융복합처']]},
 {scope:'headquarters',parentId:'safety-office',parent:'모빌리티교통안전본부 / 교통안전정책실',entries:[['SA','교통안전처'],['QE','자격교육처'],['CL','기후탄소물류처']]},
 {scope:'headquarters',parentId:'mobility-center',parent:'모빌리티교통안전본부 / 모빌리티지원센터',entries:[['PS','정책지원처'],['RI','규제혁신처'],['DV','실증사업처']]},
 {scope:'headquarters',parentId:'inspection-office',parent:'자동차검사본부 / 검사전략실',entries:[['IP','검사기획처'],['SI','특수검사처'],['PK','주차안전처']]},
 {scope:'headquarters',parentId:'advanced-center',parent:'자동차검사본부 / 첨단자동차검사연구센터',entries:[['AD','첨단검사전략처'],['RD','첨단연구개발처'],['ai-inspection','AI검사인프라처']]},
 {scope:'headquarters',parentId:'tuning',parent:'자동차검사본부 / 튜닝안전기술원',entries:[['tuning-safety','기술안전처'],['test-certification','시험인증처'],['technical-approval','기술승인처']]},
 {scope:'headquarters',parentId:'air-office',parent:'항공철도안전본부 / 항공안전실',entries:[['air-safety','항공안전처'],['air-qualification','항공자격처'],['drone','드론관리처'],['uam','도심항공정책처']]},
 {scope:'headquarters',parentId:'rail-office',parent:'항공철도안전본부 / 철도안전실',entries:[['rail-safety','철도안전처'],['rail-approval','철도승인처'],['rail-inspection','철도검사처'],['rail-tech','철도기술처']]},
 {scope:'katri',parentId:'katri-planning',parent:'자동차안전연구원 / 연구기획실',entries:[['katri-research-planning','연구기획처'],['katri-research-support','연구지원처']]},
 {scope:'katri',parentId:'katri-defects',parent:'자동차안전연구원 / 결함조사본부',entries:[['katri-defect-policy','결함정책처'],['katri-defect-investigation1','결함조사1처'],['katri-defect-investigation2','결함조사2처']]},
 {scope:'katri',parentId:'katri-future',parent:'자동차안전연구원 / 미래차연구본부',entries:[['katri-ncap','안전연구처'],['katri-future-research','미래차연구처'],['katri-parts-research','부품연구처']]},
 {scope:'katri',parentId:'katri-autonomous',parent:'자동차안전연구원 / 자율주행본부',entries:[['katri-autonomous-research','자율주행연구처'],['katri-connected-research','커넥티드카연구처'],['katri-autonomous-demonstration','자율주행실증처']]},
 {scope:'katri',parentId:'katri-certification',parent:'자동차안전연구원 / 인증정책본부',entries:[['katri-vehicle-certification','자동차인증처'],['katri-construction-certification','건설기계인증처']]}
];
const context={
 'katri-defect-policy':{note:'리콜센터 담당 사이트와 결함 협업 검토안 존재. 처별 독립 계획서 미작성.',relatedTo:'proposal-links.html?unit=katri-defect',relatedLabel:'결함 3처 관련 협업 검토안'},
 'katri-defect-investigation1':{note:'결함 3처 협업 검토안만 존재. 처별 업무·요구·대가 분해 미완료.',relatedTo:'proposal-links.html?unit=katri-defect',relatedLabel:'결함 3처 관련 협업 검토안'},
 'katri-defect-investigation2':{note:'결함 3처 협업 검토안만 존재. 처별 업무·요구·대가 분해 미완료.',relatedTo:'proposal-links.html?unit=katri-defect',relatedLabel:'결함 3처 관련 협업 검토안'},
 'katri-parts-research':{note:'자동차부품 자기인증 사이트 담당 매핑과 부품 증빙 적용안 존재. 개별 계획서 미작성.',relatedTo:'websites.html?node=KATRI',relatedLabel:'연구원 공식 업무사이트'},
 'katri-vehicle-certification':{note:'기술검토·안전검사 적용안과 주제 관련. 해당 처의 확정 과업·계획서로 승격하지 않음.',relatedTo:'katri.html?case=KA-01',relatedLabel:'관련 기술검토 적용안'},
 'katri-autonomous-demonstration':{note:'현 조직도는 자율주행실증처. 공식 업무표에 K-City연구처 과거 명칭이 남아 분장·명칭 재확인 필요.'}
};
const rows=groups.flatMap(g=>g.entries.map(([id,name])=>{
 const d=manifest.departments.find(d=>d.name===name),sourceId=g.scope==='headquarters'?'ORG-HQ':'ORG-KATRI';
 return {id,name,scope:g.scope,parentId:g.parentId,parent:g.parent,sourceId,anchor:'pms-review-'+id,code:d?.code||null,status:d?'documents-linked':'plan-missing',statusLabel:d?'처별 한글 3종 연결':'개별 계획서 미작성',documentCount:d?.documents.length||0,projectCount:d?.projects.length||0,planTo:d?'skill-pms.html#pms-department-'+d.code:null,detailTo:d?.proposalRoute||null,note:d?'기획 문서 연결 확인. 현업 수요·전결·실행·효과·최종 대가 확정과 구분.':'공식 조직 명칭 확인. 업무·데이터·법정 근거·수요 확인 후 개별 계획 편성 필요.',...(context[id]||{})};
}));
const regionalTypes=[{id:'regional-safety-management',name:'안전관리처'},{id:'regional-safety-business',name:'안전사업처'}].map(d=>({...d,parentId:'regions',sourceId:'ORG-FIELD',status:'plan-missing',statusLabel:'처 유형별 계획서 미작성',installedCount:null,anchor:'pms-review-'+d.id,note:'지역본부 공통 검토안만 존재. 지역별 설치 수·담당·업무·전결 확인 필요.',relatedTo:'proposal-links.html?unit=regions',relatedLabel:'지역본부 공통 검토안'}));
const supplementary=[
 {type:'본사 직속 실',names:['AI미래전략실','대외협력실','안전보건실'],note:'공통 프로필 존재. 처 모집단에서 제외.',sourceId:'ORG-HQ'},
 {type:'처 내부 팀',names:['법무팀','자산관리팀','탄소중립정책팀'],note:'경영기획처·자산인프라처·기후탄소물류처 내부 팀. 별도 처로 중복 산입 금지.',sourceId:'ORG-HQ'},
 {type:'연구원 센터',names:['광주친환경자동차인증센터','홍성자동차부품인증지원센터','안전기준 국제화센터','특장차인증센터'],note:'센터 조직. 본사·연구원 처 모집단 51개 범위와 분리.',sourceId:'ORG-KATRI'},
 {type:'연구원 사무국',names:['자동차안전하자 심의위원회사무국','자율주행자동차 사고조사위원회사무국'],note:'사무국 조직. 사이트 담당 매핑도 처 완료 수에 합산하지 않음.',sourceId:'ORG-KATRI'},
 {type:'현장 조직',names:['지역본부','자동차검사소','상주·화성 교통안전체험교육센터','화성·김천 드론자격센터','시흥 드론교육센터'],note:'공통 현장 프로필 존재. 지역별 업무분장과 각 센터 계획서 검토는 별도.',sourceId:'ORG-FIELD'},
 {type:'담당 미확정 업무',names:['운송플랫폼'],note:'platform-scope 검토안. 수탁·계약·주관 처 미확정 상태 유지.',sourceId:null}
];
const count=scope=>{const all=rows.filter(r=>!scope||r.scope===scope);return {official:all.length,linked:all.filter(r=>r.code).length,missing:all.filter(r=>!r.code).length};};
const findings=[
 {title:'조직 범위의 누락',result:'본사 처와 연구원 처를 공식 조직도 기준으로 대조. KATRI 12개 처와 지역본부 2개 처 유형의 개별 계획서 미작성 확인.',limit:'51개는 본사+연구원 범위. TS 전국 설치 처 총수는 미확인. 조직도 확인을 위탁·예산·전결 확정으로 해석하지 않음.'},
 {title:'한글 문서·기술 HOW',result:'39개 처·현재 문서 117개와 이전 계획서 39개 ZIP/본문 XML/해시 대조. v0.5 계획서 39개 한글 재저장·그림 294개 보존. 11개 장과 42개 기획항목의 기술 HOW·반례·대가 영향 연결.',limit:'대표 PDF 5개 전쪽 자동검사·선택 페이지 시각검토. 39개 전쪽 수동 조판검수·제품/API 실행 시험은 미수행. 추가 26처 웹은 공통 구조·업무별 검토안 수준.'},
 {title:'정량지표의 근거 수준',result:'42개 사업의 KPI 128개와 산식·측정 원장·비교·정답·표본·책임·품질 조건 확인. DRT 5개, 나머지 41개 사업 각 3개.',limit:'목표는 공통 가정이 반복된 협의 초안. 기준선 4주·평가 4주·유형별 20건도 계획 가정. 실측 편익 또는 타당성이 입증된 목표로 인용 금지. 예비 분산·검정력에 따라 재설정 필요.'},
 {title:'대가와 판본의 한계',result:'계획서 v0.5와 대가·도식 v0.3 참조 판본 구분. 공통 기능과 처별 증분 산정 원칙 확인.',limit:'69.2FP 등 동일 참조세트는 처별 복잡도 실측 아님. 기능경계·DET/FTR/RET·제품 사용권·실제 견적·최신 HOW 차분 대가 확보 전 확정가격으로 사용 불가.'},
 {title:'후속 편성 순서',result:'누락 처의 공식 업무·위탁 근거 → 업무 사건·데이터·대상자 → 문제·원인 근거 → CCK 기술 HOW·SI 비교 → 요구·반례·실측 KPI → 차분 대가 순서 적용.',limit:'이번 검토에서 누락 처의 신규 솔루션·완성 계획서를 임의 생성하지 않음. 기존 결함 협업안과 KATRI 적용안은 참고자료로 연결.'}
];
module.exports={version:'v0.1',date:'2026-10-01',title:'전체 처 조직·계획서·설계 대조',status:'공식 공개 조직도 대조 및 등록 문서 검토 · 현업·기술·대가 확정 전',sources,groups,rows,regionalTypes,supplementary,findings,counts:{headquarters:count('headquarters'),katri:count('katri'),headquartersAndKatri:count(),regionalTypes:regionalTypes.length,regionalInstalledDepartments:null,linkedProjects:manifest.departments.reduce((n,d)=>n+d.projects.length,0),linkedFiles:manifest.departments.reduce((n,d)=>n+d.documents.length,0)},labels:{summary:'본사 38처·연구원 13처 대조 / 지역본부 2개 처 유형 별도',scopeNote:'51개는 본사·연구원 공개 조직도의 처 수. 지역별 실제 설치 처 수는 미확인이므로 TS 전체 처 총수로 표시하지 않음.',reviewLink:'전체 처 누락·작성 현황 확인',search:'전체 공식 처명·소속 검색',placeholder:'예: 결함조사, 자율주행, 예산처',reset:'전체 처 검색 초기화',filters:[['all','전체'],['missing','계획서 미작성'],['headquarters','본사'],['katri','자동차안전연구원']],tableCaption:'본사·자동차안전연구원 51개 처와 개별 문서의 대조',headers:['소속 / 처','작성·매핑 상태','관련 자료·확인 한계'],empty:'해당하는 처 없음. 검색어나 확인 범위 변경 필요.',plan:'처별 계획서·설계 보기',map:'조직도 위치',regional:'지역본부 하위 처 유형 · 전국 설치 수 미확인',other:'처 수와 별도로 구분할 조직·업무',findings:'문서·설계·정량·대가 검토 결과',sourceTitle:'공식 조직 근거 · 2026-10-01 열람',downloadMd:'전체 처 검토서 · MD',downloadJson:'전체 처 대조표 · JSON'}};
