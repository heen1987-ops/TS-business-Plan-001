const reading=require('./integrated-reading.cjs'),planning=require('./problem-planning.cjs'),official=require('./official-duty-research.cjs'),legacy=require('./mandate-workflows.cjs');
const date='2026-10-08';
// 업무별 담당의 명시적 연결. 제안 소속이나 처 이름의 유사성으로 수행권한을 추정하지 않음.
const definitions={
 B01:[['SA','운수회사 안전관리·교통수단 점검','교통수단|운수회사|점검']],
 B02:[['DV','교통시설안전진단 평가·특별실태조사','진단|특별실태']],
 B03:[['DV','단지내도로 실태점검·개선지원','단지|도로|실태']],
 B04:[['DF','교통안전정보·운행기록 자료 관리','운행기록|교통안전정보|데이터']],
 'B05-MR':[['MR','교통문화지수 실태조사','교통문화']],
 'B05-QE':[['QE','상주·화성 체험교육센터와 연결되는 체험교육','체험|교육']],
 'B05-TEST':[['QE','교통안전관리자 자격시험','교통안전관리자']],
 'B06-IP':[['IP','자동차 정기·종합검사 기획·검사소 운영과 연결','검사']],
 'B06-AD':[['AD','전자진단·검사장비 운영기술 지원','진단|장비|KADIS']],
 'B06-RD':[['RD','신기술 차량의 검사방법 연구','검사|연구']],
 B07:[['EX17','자동차 튜닝승인·기술검토','튜닝|승인']],
 B08:[['MR','애플리케이션식 택시미터 검정','앱미터']],
 B09:[['katri-defect-policy','제작결함 정보·리콜 정책·운영 관련','결함|리콜'],['katri-defect-investigation1','제작결함 조사·시험 관련 · 세부 사건 배정 추가 확인','결함|조사'],['katri-defect-investigation2','제작결함 조사·시험 관련 · 세부 사건 배정 추가 확인','결함|조사'],['EX26','자동차안전도평가(KNCAP) 관련','안전도|KNCAP']],
 B10:[['EX08','자동차 관리정보·행정정보시스템','자동차관리|자동차정보|등록']],
 'B11-QE':[['QE','버스·택시 자격시험·운전적성정밀검사와 지역 검사조직 연결','자격|정밀|검사']],
 'B11-SA':[['SA','여객 운수종사자 경력·자격관리','종사자|경력|자격']],
 'B12-QE':[['QE','화물 운송종사자 자격시험·운전적성정밀검사와 지역 검사조직 연결','자격|정밀|검사']],
 'B12-SA':[['SA','화물 운수종사자 경력·자격관리','종사자|경력|자격']],
 B13:[['CL','화물운송실적관리(FPIS) · 안전운임 신고센터와 별도 업무','실적|FPIS']],
 'B14-RIMS':[['MR','대여사업자 운전자격확인(RIMS)','RIMS|운전자격확인']],
 'B14-PLATFORM':[],
 B15:[['MR','택시운행정보관리(TIMS)','TIMS|택시운행']],
 B16:[['PS','대중교통 현황조사·정책지원','대중교통|현황조사']],
 B17:[['MR','교통약자 이동편의 실태조사 · DRT 운영 권한과 별도','교통약자']],
 'B18-PS':[['PS','모빌리티 지원센터 정책지원 관련 · 세부 분장 추가 확인','모빌리티|정책']],
 'B18-RI':[['RI','모빌리티 규제샌드박스·특례 지원','샌드박스|특례|규제']],
 B19:[],
 B20:[['SI','내압용기 검사','내압|용기']],
 B21:[['SI','검사기기 정도검사','정도|기기']],
 B22:[['PK','기계식주차장 검사·안전관리','주차']],
 B23:[['SI','삭도·궤도 검사 · 지역 현장조직과 연결','삭도|궤도']],
 B24:[['EX22','철도 운전면허·관제자격 시험','면허|관제|시험']],
 'B25-APPROVAL':[['EX23','철도 안전관리체계 승인검사','승인|안전관리']],
 'B25-INSPECTION':[['EX24','철도 승인 이후 정기·수시검사','검사']],
 B26:[['EX19','항공종사자 자격증명 시험','시험|자격']],
 B27:[['EX20','초경량비행장치 신고·관리','신고|초경량']]
};
function reviewNotes(record,id){return record.units.filter(u=>(u.scopeReview||u.placement)&&u.sourceSpans.some(s=>s.observationId===id)).map(u=>({unitId:u.id,text:u.text,scopeReview:u.scopeReview,placement:u.placement,note:u.scopeReview?u.scopeReview.reason+' · '+u.scopeReview.note:u.placement}));}
function sourceRecord(record){return {...record,observations:record.observations.map(o=>({...o,reviewNotes:reviewNotes(record,o.id)}))};}
function ownerRef([key,duty,pattern]){const row=reading.rows.find(r=>r.key===key),records=official.forReader(key),observations=records.flatMap(r=>r.observations.filter(o=>new RegExp(pattern,'i').test(o.text)&&!reviewNotes(r,o.id).length).map(o=>({...o,url:official.sourceUrl(r.rootCode,o.refs[0].page),path:r.path})));return {key,name:row.name,duty,role:observations.length?'공식 담당업무에 기재된 업무영역':'기존 업무안내·조직 원장의 수행 관계',status:observations.length?'담당업무 기재 확인 · 위탁·전결 별도 확인':'세부 담당업무·현재 분장 추가 확인',checkedAt:date,observations,sourceRefs:records.map(r=>({url:r.sourceUrl,title:'TS 공식 직원검색 · '+r.path,checkedAt:official.date,scope:'공개 담당업무. 법적 위탁·독점 분장·내부 전결의 확정 근거와 구분'}))};}
const ownerRefsByBinding=Object.fromEntries(Object.entries(definitions).map(([id,rows])=>[id,rows.map(ownerRef)]));
const additionalSources=[
 {id:'KATRI-TECH',title:'KATRI 자동차 기술검토',url:'https://katri.kotsa.or.kr/web/contents/katri1050101.do',published:'게시일 미표시',checkedAt:date,claim:'서류상 확인·기술검토 절차, 자동차관리법 제30조제3항·시행규칙 제35조·인증 및 조사 규정 제3조 인용',limit:'안내의 기관은 TS 자동차안전연구원. 처 이름은 직원 담당업무로 별도 대조. 인용 법령 전체의 현행 판본 재검증과 구분'},
 {id:'KATRI-SAFETY',title:'KATRI 자동차 안전검사',url:'https://katri.kotsa.or.kr/web/contents/katri1050102.do',published:'게시일 미표시',checkedAt:date,claim:'기술검토 후 실차의 안전기준 적합 확인, 자동차관리법 제30조제3항·시행규칙 제37조·인증 및 조사 규정 제3조 인용',limit:'자동차관리법 제43조의 운행차 정기검사와 별도. AI 서류 검토가 실차검사·공식 합격판정을 대체하는 근거 아님'},
 {id:'KATRI-CONSTRUCTION-TYPE',title:'KATRI 건설기계 형식승인',url:'https://katri.kotsa.or.kr/web/contents/katri1050201.do',published:'게시일 미표시',checkedAt:date,claim:'건설기계관리법 제18조 및 형식·변경·신고 신청자료 안내',limit:'안내의 시행령 제18조의2는 현행 위탁 조문으로 사용하지 않음. 타워크레인 예외·현행 제18조의3 별도 표시'},
 {id:'KATRI-CONSTRUCTION-CHECK',title:'KATRI 건설기계 확인검사',url:'https://katri.kotsa.or.kr/web/contents/katri1050202.do',published:'게시일 미표시',checkedAt:date,claim:'건설기계관리법 제19조 인용. 승인 규격과 실물 대조·결과 통지 안내',limit:'안내의 시행령 제12조·시행규칙 “제54조 2” 표기를 현행 위탁 조문으로 승격하지 않음. 결과 통지와 최종 등록처리의 권한 구분'},
 {id:'LAW-CONSTRUCTION-DELEGATION',title:'건설기계관리법 시행령 제18조의3',url:'https://law.go.kr/LSW/lsLinkCommonInfo.do?lsJoLnkSeq=1032557459',published:'시행 2026-03-24 · 대통령령 제36220호',checkedAt:date,claim:'제2항제1호 형식승인·변경승인·신고 접수·확인검사: TS 및 지정 검사대행자 위탁. 타워크레인 일부 업무는 검사대행자. 제2항제2호 부품인증: TS 위탁',limit:'기관 단위 위탁. 건설기계인증처 독점 소관·내부 전결·개별 사건 권한을 확정하는 근거 아님'}
];
const additionalDuties=[
 {id:'A01',key:'katri-vehicle-certification',task:'자기인증능력이 없는 제작자 등의 자동차 기술검토',law:'자동차관리법 제30조제3항 / 시행규칙 제35조 / 자동차 및 자동차부품의 인증 및 조사 등에 관한 규정 제3조',authority:'성능시험대행자의 서류상 확인 · 업무기관 TS 자동차안전연구원',owner:ownerRef(['katri-vehicle-certification','자동차 기술검토 관련','기술검토|안전검사']),sourceIds:['KATRI-TECH'],projectIds:['KT-VC-01'],boundary:'안내에 기재된 법적근거와 직원업무의 처 연결. 위탁 근거·전결 전체 확정 아님'},
 {id:'A02',key:'katri-vehicle-certification',task:'기술검토 후 자동차 실차 안전검사',law:'자동차관리법 제30조제3항 / 시행규칙 제37조 / 자동차 및 자동차부품의 인증 및 조사 등에 관한 규정 제3조',authority:'실차의 안전기준 적합 확인 · 업무기관 TS 자동차안전연구원',owner:ownerRef(['katri-vehicle-certification','자동차 안전검사 관련','안전검사|기술검토']),sourceIds:['KATRI-SAFETY'],projectIds:['KT-VC-01'],boundary:'서류 1차 검토·준비 지원과 실차검사·합격판정의 구분. 운행차 정기·종합검사와 별도 업무'},
 {id:'A03',key:'katri-construction-certification',task:'건설기계 형식승인·변경승인·형식신고·변경신고 접수',law:'건설기계관리법 제18조 / 현행 시행령 제18조의3제2항제1호',authority:'TS 및 지정 검사대행자 위탁 · 타워크레인 형식승인·변경승인은 검사대행자',owner:ownerRef(['katri-construction-certification','건설기계 형식승인·신고 관련','형식|건설기계']),sourceIds:['KATRI-CONSTRUCTION-TYPE','LAW-CONSTRUCTION-DELEGATION'],projectIds:['KT-CC-01'],boundary:'공식 안내의 시행령 제18조의2와 현행 위탁 조문 제18조의3 구분. 개별 처 전결·독점 소관 별도 확인'},
 {id:'A04',key:'katri-construction-certification',task:'건설기계 확인검사·결과 통지',law:'건설기계관리법 제19조 / 현행 시행령 제18조의3제2항제1호',authority:'TS 및 지정 검사대행자 위탁 · 타워크레인 확인검사는 검사대행자',owner:ownerRef(['katri-construction-certification','건설기계 확인검사 관련','확인검사|건설기계']),sourceIds:['KATRI-CONSTRUCTION-CHECK','LAW-CONSTRUCTION-DELEGATION'],projectIds:['KT-CC-01'],boundary:'승인 규격·실물 대조와 결과 통지. 최종 등록은 별도 처리. 안내의 다른 시행규칙 인용은 현행 원문 추가 대조 대상'}
];
const addedRelations=[['KT-DP-01','B09','제작결함 정보·정책 업무영역','개별 조사의 원인 판정·처별 독점 분장과 구분'],['KT-D1-01','B09','제작결함 조사 업무영역','결함조사1·2처 사건 배정 기준 미확정'],['KT-D2-01','B09','제작결함 조사 업무영역','결함조사1·2처 사건 배정 기준 미확정'],['EX26-01','B09','안전도평가 업무영역','KNCAP 관련 직원업무와 연결. 제작결함조사의 주관으로 합치지 않음']].map(([projectId,bindingId,type,reason])=>({projectId,bindingId,type,reason,status:'기획상 적용관계 · 업무영역 대조 · 실제 추가과업·전결 확인 필요'}));
const projectRelations=[...legacy.projectRelations,...addedRelations.filter(a=>!legacy.projectRelations.some(r=>r.projectId===a.projectId&&r.bindingId===a.bindingId))];
const proposals=planning.proposals.map(p=>({...p,relations:projectRelations.filter(r=>r.projectId===p.id)}));
const proposalById=Object.fromEntries(proposals.map(p=>[p.id,p]));
const matrix=legacy.matrix.map(b=>({...b,ownerRefs:ownerRefsByBinding[b.id]||[],projects:projectRelations.filter(r=>r.bindingId===b.id).map(r=>({...proposalById[r.projectId],relation:r}))}));
const departments=reading.rows.map(r=>{const records=official.forReader(r.key).map(sourceRecord);return {key:r.key,name:r.name,parentId:r.parentId,path:records[0]?.path||r.name,records,proposals:proposals.filter(p=>p.departmentKey===r.key),duties:matrix.filter(b=>b.ownerRefs.some(o=>o.key===r.key)),additional:additionalDuties.filter(a=>a.key===r.key),related:matrix.filter(b=>!b.ownerRefs.some(o=>o.key===r.key)&&b.projects.some(p=>p.departmentKey===r.key)),status:'공개 담당업무와 기획 적용관계의 구분 · 내부 분장·전결 확인 필요'};});
function forDepartment(key){return departments.find(d=>d.key===key)||null;}
function selection(query){const q=new URLSearchParams(query),key=q.get('dept'),id=q.get('project'),candidate=proposalById[id],department=key?forDepartment(key):candidate?forDepartment(candidate.departmentKey):null,invalidDept=!!key&&!department,invalidProject=!!id&&(!candidate||!!key&&candidate.departmentKey!==key);return {department,project:invalidDept||invalidProject||q.has('binding')&&!id?null:candidate||department?.proposals[0]||null,invalidDept,invalidProject};}
function departmentTo(key,binding){const q=new URLSearchParams({dept:key});if(binding)q.set('binding',binding);return 'legal/mapping.html?'+q+'#mandate-department-context';}
const unlinked=proposals.filter(p=>!p.relations.length&&!additionalDuties.some(a=>a.projectIds.includes(p.id)));
const limits='51처·54제안은 탐색 대상. 기존 27개 대표 법정업무·36개 수행관계와 추가 4개 업무안내는 확인 범위. TS 전체 법정업무 조사 완료·처별 권한 확정과 구분. 직원 담당업무는 관찰 근거이며 법적 위탁·내부 전결 근거와 별도.';
module.exports={date,departments,proposals,proposalById,matrix,projectRelations,ownerRefsByBinding,additionalSources,additionalDuties,unlinked,limits,forDepartment,selection,departmentTo};
