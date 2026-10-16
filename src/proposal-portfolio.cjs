'use strict';
const strategies=require('./strategy-solutions-2027.cjs');
const date='2026-10-16';
const sources=[
 {id:'TS',title:'TS 공식 서비스·기관 안내',url:'https://main.kotsa.or.kr/main.do',checkedAt:date},
 {id:'MOLIT',title:'국토교통부 공식 누리집',url:'https://www.molit.go.kr/portal.do',checkedAt:date},
 {id:'IITP',title:'과기정통부·IITP 2026 정보통신·방송 기술개발 공고',url:'https://www.msit.go.kr/bbs/view.do?bbsSeqNo=100&mId=311&mPid=121&nttSeqNo=3186367&pageIndex=&sCode=user&searchOpt=ALL&searchTxt=',checkedAt:date},
 {id:'KEIT',title:'한국산업기술기획평가원 공식 누리집',url:'https://www.keit.re.kr/',checkedAt:date},
 {id:'INDUSTRY',title:'산업통상부 2026 국정성과',url:'https://www.motir.go.kr/kor/contents/197',checkedAt:date},
 {id:'EDU',title:'교육부·시도교육청 2026학년도 준비 협의',url:'https://moe.go.kr/mnstrBoardView.do?boardID=72729&boardSeq=105340&lev=0',checkedAt:date},
 {id:'DATA',title:'공공데이터포털 · AI 검색과 전체메뉴',url:'https://www.data.go.kr/',checkedAt:date}
];
const tracks=[
 {id:'P01',number:'01',title:'AI PMS',subtitle:'감리 AI 엔진 기반',audience:'공공 정보화사업 수행 민간기업',phase:'독립 제품',tag:'민간기업용',lead:'PM · 품질관리 · 사업수행팀',ministries:['M01','M02','M03','M04','M05'],strategyIds:[],
  purpose:'제안·계약·요구사항·산출물·검수의 프로젝트 관리',
  flow:['RFP·계약 등록','요구·일정·산출물 연결','감리 관점 AI 점검','보완·버전 재검증','제출·검수 증빙 관리'],
  reuse:'공통 스킬·문서 파싱·검색·보고서 구성의 재사용 후보',
  development:['사업별 RFP·계약 의무와 요구사항 추적','일정·담당자·산출물·변경·쟁점 관리','감리 AI 엔진의 근거 인용·누락/불일치 탐지','보완 전후 비교·검수 증빙·고객별 데이터 분리'],
  acceptance:['계약 요구–산출물–검수의 양방향 추적 및 누락 검출','원문 좌표·판본 일치와 허위 인용 차단','보완본 재점검·이력 복원 및 타 고객 자료 노출 0건'],
  boundary:'AI 점검 → 수행기업 검토 → 기관·감리의 공식 판단. TS 플랫폼 구축비와 별도 산정.',
  links:[['downloads/growth-ai-proposal-portfolio.md','민간기업용 PMS 구성안'],['index.html?view=archive','공통 스킬·기획 근거']]},
 {id:'P02',number:'02',title:'AI 플랫폼 고도화',subtitle:'조직 네이티브 AI',audience:'TS 전 부서 · 기관별 조직 사용자',phase:'TS 2027 1차',tag:'공통 기반 우선',lead:'AI혁신처 조정 · 조직·인사·IT·보안·현업 협업',ministries:['M01','M02','M03','M04','M06'],strategyIds:['ST-04'],
  purpose:'부서·직무·역할·권한을 이해하는 조직 기반 구축',
  flow:['공식 조직·업무 원장','로그인 ID·역할 연결','권한·업무 맥락 분류','지식·절차·협업 구성','변경 반영·기관 인수'],
  reuse:'NOA·기구축 AI 플랫폼 및 인사·조직 연계의 설치본·계약·기능시험 대조',
  development:['조직·직무·업무 사전 및 공식 식별정보 매핑','인사이동·조직개편·겸직·대행의 효력 관리','역할·자료별 접근정책과 업무 맥락 분류','부서 간 인계·감사로그·운영 인수'],
  acceptance:['GAI-R01~R12 ↔ GAI-T01~T12 및 기관 인수 증빙','동일 요청의 직무별 결과 구분·권한 회수 후 접근 차단','조직 변경·협업 인계·장애 복구의 재현 시험'],
  boundary:'ON27-BASE / C27-COM 공통 기반 1회 산정. 업무별 적용은 추가 차분 산정.',
  links:[['proposal-2027.html','1차 구축·일정·검수'],['organization.html?view=work-map&org=1019600','AI혁신처 업무 매핑']]},
 {id:'P03',number:'03',title:'대국민서비스 개선',subtitle:'프롬프트·음성 중심',audience:'국민 · 정보약자 · TS 서비스 이용자',phase:'조직 기반 인수 후',tag:'메뉴 유지',lead:'서비스 소관 부서 · 홈페이지 운영 · AI혁신처 협업',ministries:['M01','M04','M05','M06'],strategyIds:['ST-07','ST-08'],
  purpose:'발화·요청에서 필요한 민원·행정서비스로 직접 연결',
  flow:['텍스트·음성 입력','발화 정리·의도 확인','소관·서비스 매핑','절차·서류 안내','공식 처리 시스템 연결'],
  reuse:'기존 홈페이지 메뉴·검색·신청/예약 시스템·인증·공개 안내자료',
  development:['서비스–소관 부서–법정업무–신청 경로 카탈로그','음성 인식·쉬운 표현 정리·사용자 수정·재확인','요청 분류·서류 준비·맞춤 안내·담당 창구 연결','전체메뉴·키보드·화면낭독·상담원 연결 유지'],
  acceptance:['서비스별 의도·소관·신청 경로 일치 및 미지원 요청의 안내','정보약자 참여 과업완료율·발화 의미 보존·수정 성공 평가','음성/텍스트/메뉴의 동일 서비스 접근 및 비인가 제출 0건'],
  boundary:'메뉴는 보조 탐색으로 유지. 제출·예약 확정은 공식 시스템의 인증·사용자 확인 단계 적용.',
  links:[['organization.html?view=work-map&org=all&strategy=ST-08','국민서비스 관련 업무'],['index.html?view=law','법령·행정업무 연결']]},
 {id:'P04',number:'04',title:'전략과제별 AX',subtitle:'12대 전략과제 기반',audience:'전략과제별 수행 부서 · 협업기관',phase:'부서별 후속 적용',tag:'업무 중심 확장',lead:'현업 부서 책임 · AI혁신처 기반 지원',ministries:['M01'],strategyIds:strategies.rows.map(s=>s.id),
  purpose:'관계법령·담당 직무·실제 업무에서 필요한 AI 도출',
  flow:['전략·관계법령','부서·직무·실제 업무','업무별 AI 기능','재사용·추가 개발','현업 검수·적용 확대'],
  reuse:'조직 공통 기반·부서별 기존 시스템·지식·문서·연계 기능',
  development:['전 부서 업무 원문–12대 전략과제의 연결','업무 유형별 AI 기능·입출력·수행단계 구성','업무별 부족 기능과 시스템 연계의 차분 개발','정상·예외·거부 사례 및 현업 평가셋 구성'],
  acceptance:['원문 업무–전략–기능–요구–검수의 추적성','업무 유형별 정답·권한·원천·판본·결과 재현','공통 기반 중복 산정 방지 및 현업 인수 기록'],
  boundary:'ST-04는 P02 공통 기반 참조. 나머지 11개 전략은 부서별 적용, P03의 국민 접점과 공유 기능 구분.',
  links:[['index.html','12대 전략과제'],['organization.html?view=work-map&org=all','전 부서 업무·개발·검수']]}
];
// 관계부처와 도입기관은 별도 축. 아래 적용 범위는 제안이며 수요·도입·지원사업 선정 사실이 아님.
const institutions=[
 {id:'M01',ministry:'국토교통부',institution:'TS 한국교통안전공단',relation:'교통안전·모빌리티 업무 연계',focus:'직제·법정업무 → 조직 기반 → 국민 접점·현업 AX',cells:['수행기업 PM','TS 2027 1차','TS 홈페이지','12대 전략'],sources:['TS','MOLIT'],note:'TS의 공식 직제·업무와 개별 법령/위탁 사무 기준'},
 {id:'M02',ministry:'과학기술정보통신부',institution:'IITP 정보통신기획평가원',relation:'ICT R&D 사업 공고·관리 관계',focus:'과제 공고·기획·협약·성과관리의 조직·업무 확장안',cells:['수행기업 PM','기관 확장안','—','별도 기관 전략'],sources:['IITP'],note:'정보화 계약과 R&D 협약의 기준·산출물·평가 절차 분리'},
 {id:'M03',ministry:'산업통상부',institution:'KEIT 한국산업기술기획평가원',relation:'산업기술 R&D 분야',focus:'산업기술 과제·평가·성과관리의 조직·업무 확장안',cells:['수행기업 PM','기관 확장안','—','별도 기관 전략'],sources:['KEIT','INDUSTRY'],note:'개별 공고·협약에 따른 역할·기관 관계·증빙 체계 대조'},
 {id:'M04',ministry:'교육부 · 시도교육청',institution:'교육청 · 교육지원청 · 학교',relation:'교육정책 협력 / 교육청별 도입 주체',focus:'교육행정 분장·권한·학교 지원·민원 안내 확장안',cells:['수행기업 PM','기관 확장안','교육행정 안내','별도 기관 전략'],sources:['EDU'],note:'교육청을 교육부의 단일 하위 조직으로 통합하지 않는 기관별 권한 설계'},
 {id:'M05',ministry:'행정안전부',institution:'공공데이터포털 · 공공서비스 운영기관',relation:'공공데이터 검색·메뉴 구성 참조',focus:'AI 검색과 전체메뉴 병행의 공공서비스 UX 참조',cells:['수행기업 PM','—','서비스 UX 참조','별도 기관 전략'],sources:['DATA'],note:'공공데이터포털은 UX 참조. TS와 실제 데이터·신청 연계는 별도 인터페이스 검토'},
 {id:'M06',ministry:'보건의료 분야 관계부처',institution:'병원 · 의료기관',relation:'GROWTH AI 분야 확장 구상',focus:'행정·원무·지원 부서의 업무·역할·안내 구성안',cells:['—','기관 확장안','이용·행정 안내','별도 기관 전략'],sources:[],note:'기관별 설립·소관 확인 후 부처 매핑. 임상 판단·진료 기능은 별도 범위'}
];
const serviceExample={utterance:'“자동차 검사 날짜를 바꾸고 싶은데 어디로 가야 해요?”',intent:'자동차검사 예약 변경',confirm:'예약 변경 요청 확인 · 필요 정보 안내',handoff:'TS 공식 예약 시스템 연결 · 본인 확인·변경 확정',fallback:'전체메뉴 · 서비스 검색 · 상담 연결'};
const sequence=['민간기업용 AI PMS의 독립 제품화','TS 조직 네이티브 공통 기반 구축','국민서비스·전략과제별 현업 적용','기관별 조직·규정·권한 패키지 확장'];
function markdown(){return '# GROWTH AI 제안·관계부처 매핑\n\n- 작성일: '+date+'\n- 상태: 사업 구성·적용 설계안\n- 순서: 관계부처·기관 → 법령·규정 → 조직·직무·업무 → AI 기능 → 개발·검수\n\n'+tracks.map(t=>'## '+t.number+' '+t.title+' · '+t.subtitle+'\n\n- 대상: '+t.audience+'\n- 추진: '+t.phase+' / '+t.lead+'\n- 목적: '+t.purpose+'\n- 흐름: '+t.flow.join(' → ')+'\n- 재사용: '+t.reuse+'\n'+t.development.map(x=>'- 추가 개발: '+x).join('\n')+'\n'+t.acceptance.map(x=>'- 검수: '+x).join('\n')+'\n- 범위: '+t.boundary+'\n').join('\n')+'\n## 관계부처·기관별 적용안\n\n'+institutions.map(m=>'### '+m.ministry+' / '+m.institution+'\n\n- 관계: '+m.relation+'\n- 업무: '+m.focus+'\n'+tracks.map((t,i)=>'- '+t.title+': '+m.cells[i]).join('\n')+'\n- 기준: '+m.note+'\n'+m.sources.map(id=>{const s=sources.find(s=>s.id===id);return '- 근거: ['+s.title+']('+s.url+') / '+s.checkedAt;}).join('\n')+'\n').join('\n')+'\n## 음성·프롬프트 서비스 구성\n\n- 발화 예시: '+serviceExample.utterance+'\n- 의도: '+serviceExample.intent+'\n- 확인: '+serviceExample.confirm+'\n- 처리 연결: '+serviceExample.handoff+'\n- 보조 경로: '+serviceExample.fallback+'\n- 품질 목표: 기관·서비스별 평가셋과 분모 합의 후 측정. 실제 시험 미실행.\n';}
module.exports={date,sources,tracks,institutions,serviceExample,sequence,markdown};
