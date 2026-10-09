const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.TS_BASE||'http://127.0.0.1:8794/TS-business-Plan-001/',sha=process.env.TS_EXPECTED_SHA||'',checks=[],errors=[];
const check=(n,v)=>{assert(v,n);checks.push(n)};
(async()=>{fs.mkdirSync('qa-output/institution-rfp',{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:1440,height:900}});page.on('pageerror',e=>errors.push(e.message));
const go=async(q='')=>{await page.goto(base+'index.html?view=workbench&screen=institution&project=MR-02'+q);await page.locator('.wb-mandate').waitFor()};
const pick=async id=>{await page.locator('#wb-main [data-mandate="'+id+'"]').first().click();await page.locator('dialog[open]').waitFor()};
try{
 if(sha){const r=await page.request.get(base+'version.json');check('공개 배포 SHA 일치',(await r.json()).commit===sha)}
 await go();check('기관 목적·법적지위 구분',await page.locator('.wb-mandate-header').innerText().then(t=>t.includes('국민의 생명')&&t.includes('비영리법인')&&t.includes('위탁집행형')));
 check('주 메뉴8개 유지',await page.locator('#wb-nav [data-screen]').count()===8);
 await pick('DUTY-TS-01');check('책무 패널의 조건·시행일·원문',await page.locator('dialog').innerText().then(t=>t.includes('자동차운송사업')&&t.includes('2018-01-01')&&t.includes('2026-10-09')&&t.includes('예외·한계')));
 await page.locator('.wb-legal-related button').filter({hasText:'제6조제1호'}).click();check('책무에서 직접 조문 탐색',await page.locator('#wb-panel-title').innerText().then(t=>t.startsWith('제6조제1호')));
 await page.locator('.wb-legal-related button').filter({hasText:'교통안전 교육·계몽·홍보'}).click();check('조문에서 책무 역탐색',new URL(page.url()).searchParams.get('entity')==='DUTY-TS-01');check('항목전환 후 패널 상단과 초점 복원',await page.locator('#wb-panel-title').evaluate(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&document.querySelector('dialog').contains(document.activeElement)}));
 await page.keyboard.press('Escape');check('책무→조문→책무 탐색 후 최초 본문 초점 복귀',await page.evaluate(()=>document.activeElement.getAttribute('data-mandate')==='DUTY-TS-01'&&!document.querySelector('dialog').contains(document.activeElement)));await page.getByRole('button',{name:'법적 근거',exact:true}).click();check('보기전환 시 선택 유지',new URL(page.url()).searchParams.get('entity')==='DUTY-TS-01'&&await page.locator('.wb-mandate-selection').innerText().then(t=>t.includes('교통안전 교육')));
 await page.getByRole('searchbox',{name:'법령·조문·내용 검색'}).fill('없는법령XYZ');check('법령 빈 결과',await page.locator('.wb-mandate-table tbody tr').count()===0&&await page.locator('.wb-empty-note').innerText().then(t=>t.includes('검색 결과 없음')));
 await page.getByRole('button',{name:'법령 필터 해제',exact:true}).click();check('법령 필터 초기화',await page.locator('.wb-mandate-table tbody tr').count()===27);
 await page.getByLabel('근거 성격 필터',{exact:true}).selectOption('수행 권한');check('근거 유형 필터',await page.locator('.wb-mandate-table tbody tr').count()===1);
 await pick('TS-A24-2');check('자료요청의 주체·대상·강도',await page.locator('dialog').innerText().then(t=>t.includes('포괄 개인정보 연계 권한이 아님')&&t.includes('관계 행정기관')));await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'소관·감독 관계',exact:true}).click();check('6개 방향과 관계 구분',await page.locator('.wb-governance-list article').count()===6&&await page.locator('.wb-governance-list').innerText().then(t=>t.includes('승인 신청')&&t.includes('지도·감독')&&t.includes('자료 협조')));
 await pick('TS-REL-APPROVAL');check('승인·기한·의결 세 근거',await page.locator('.wb-legal-excerpt').count()===3&&await page.locator('dialog').innerText().then(t=>t.includes('시행령')&&t.includes('정관')&&t.includes('이사회')));
 await page.locator('.wb-icon-button').focus();for(let i=0;i<18;i++)await page.keyboard.press('Tab');check('근거 패널 키보드 초점 유지',await page.evaluate(()=>document.querySelector('dialog').contains(document.activeElement)));await page.keyboard.press('Escape');
 check('닫기 초점복귀',await page.evaluate(()=>document.activeElement.getAttribute('data-mandate')==='TS-REL-APPROVAL'));
 await page.reload();check('새로고침 보기·항목·사업 유지',new URL(page.url()).searchParams.get('legalView')==='oversight'&&new URL(page.url()).searchParams.get('entity')==='TS-REL-APPROVAL'&&await page.locator('.wb-context').innerText().then(t=>t.includes('전화 DRT')));
 await page.getByRole('button',{name:'기관의 역할',exact:true}).click();await page.getByRole('button',{name:'책무 선택 해제',exact:true}).click();check('책무 해제는 사업 유지',!new URL(page.url()).searchParams.has('entity')&&new URL(page.url()).searchParams.get('project')==='MR-02');
 await page.getByText('공단법 제6조 전체 사업 보기',{exact:false}).click();check('공단법 전체12항목·삭제호 표시',await page.locator('details').filter({has:page.locator('summary').filter({hasText:'공단법 제6조'})}).innerText().then(t=>t.includes('제7호·제8호')&&t.includes('외국기술')));
 await page.getByText('정관 제25조 사업 항목 전체',{exact:false}).click();await page.getByText('자동차안전연구원 임무 전체',{exact:false}).click();check('38업무 데이터 화면 존재',await page.locator('.wb-mandate-duties li').count()===40);
 await page.getByRole('button',{name:'정보시스템·정보 제공 1개 항목',exact:true}).click();check('업무군 URL 변경',new URL(page.url()).searchParams.get('legalGroup')==='G-DATA');await page.goBack();check('뒤로 업무군 복원',new URL(page.url()).searchParams.get('legalGroup')!=='G-DATA');
 for(const width of [1440,1366,390]){await page.setViewportSize({width,height:width===390?844:900});for(const [view,title] of [['role','기관의 역할'],['basis','법적 근거'],['oversight','소관·감독 관계']]){await go('&legalView='+view);check(width+' '+view+' 전체 가로 넘침 없음',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));await page.screenshot({path:`qa-output/institution-rfp/${sha?'public':'local'}-${view}-${width}.png`,fullPage:width===1440});}
 await pick('TS-REL-APPROVAL');check(width+' 복수법령 패널 폭',await page.locator('.wb-panel').evaluate(e=>e.scrollWidth<=e.clientWidth+2));await page.screenshot({path:`qa-output/institution-rfp/${sha?'public':'local'}-evidence-${width}.png`});await page.keyboard.press('Escape');}
 await page.setViewportSize({width:1440,height:900});await page.goto(base+'index.html?view=workbench&screen=plan&project=MR-02');await page.getByRole('button',{name:'TS 공고·RFP 5건 보기',exact:true}).click();check('RFP6단계·후보맥락 유지',await page.locator('.wb-rfp-outline>li').count()===6&&new URL(page.url()).searchParams.get('project')==='MR-02');
 await page.getByRole('button',{name:'요구사항 작성 예시',exact:true}).focus();await page.keyboard.press('Tab');check('조사 범위 펼침의 키보드 접근',await page.evaluate(()=>document.activeElement.tagName==='SUMMARY'&&document.activeElement.textContent.includes('조사 범위')));await page.keyboard.press('Enter');check('조사 범위 키보드 펼침',await page.locator('.wb-rfp>details').evaluate(e=>e.open));
 await page.getByRole('button',{name:'공고 5건 비교',exact:true}).click();check('5개 공고·10첨부·13보충 출처 접근',await page.locator('.wb-rfp-sample').count()===5&&await page.locator('.wb-rfp-sample a').count()===28);
 await page.locator('.wb-rfp tbody button').first().click();check('표 클릭 상세공고 펼침',await page.locator('#rfp-DRT').evaluate(e=>e.open));check('기간상충·권한 경계 표시',await page.locator('#rfp-DRT').innerText().then(t=>t.includes('2029-12-31')&&t.includes('2027-12-31')&&t.includes('권한을 입증하지')));
 check('DRT 작성조건·비용과 원문 링크 표시',await page.locator('#rfp-DRT').innerText().then(t=>t.includes('100쪽')&&t.includes('200쪽')&&t.includes('양쪽에 이미 존재')&&t.includes('과업수행사 비용에 포함')&&t.includes('TS 사전규격')&&t.includes('TS 본공고')));
 await page.screenshot({path:`qa-output/institution-rfp/${sha?'public':'local'}-rfp-version-review.png`});
 check('DRT 수동 현행·규칙 자동재배차·AI 제외 표시',await page.locator('#rfp-DRT').innerText().then(t=>t.includes('현행 업무')&&t.includes('자동 재배차')&&t.includes('금회 제외')));
 check('DRT 채널·역할·인계의 반대 근거 표시',await page.locator('#rfp-DRT').innerText().then(t=>t.includes('같은 지역·버전·시점인지는 미확인')&&t.includes('3월 RFP에도 콜센터 운영 요구')&&t.includes('기술 인계와 필요 시 데이터 이관계획')));
 await page.locator('#rfp-COMMON > summary').click();check('공통플랫폼 Tool 변환·호출은 기존 요구',await page.locator('#rfp-COMMON').innerText().then(t=>t.includes('Tool')&&t.includes('API 호출')&&t.includes('미포함이라는 뜻으로 확대하지 않음')));
 await page.locator('#rfp-EXAM > summary').click();check('시험망·연계조건·정정된 요구 ID 표시',await page.locator('#rfp-EXAM').innerText().then(t=>t.includes('폐쇄망')&&t.includes('타 시스템 연계 제외')&&t.includes('상세 본문은 INR-001~004')));
 check('교육 AX와 판본 확인 한계 표시',await page.locator('#rfp-EXAM').innerText().then(t=>t.includes('교육 AX 전체의 중복 배제 근거로 확대하지 않음')&&t.includes('2025-700호 본문')&&t.includes('교육일지 통합 수집 근거로 확대하지 않음')));

 check('대상별 교육·의료 대체·공식 서식 표시',await page.locator('#rfp-EXAM').innerText().then(t=>t.includes('고령 자격유지까지 포함되지 않음')&&t.includes('과거 1년 누산81점')&&t.includes('별지26호의2')&&t.includes('빈 평가·점수·종합소견')));
 await page.screenshot({path:`qa-output/institution-rfp/${sha?'public':'local'}-rfp-exam-correction.png`});
 await page.getByRole('button',{name:'요구사항 작성 예시',exact:true}).click();check('예시는 가상·측정전 상태',await page.locator('.wb-rfp').innerText().then(t=>t.includes('가상 요구사항')&&t.includes('기준선 조사 후 합의')));await page.keyboard.press('Escape');check('RFP닫기 초점 복귀',await page.evaluate(()=>document.activeElement.textContent==='TS 공고·RFP 5건 보기'));
 for(const width of [1440,1366,390]){await page.setViewportSize({width,height:width===390?844:900});await page.getByRole('button',{name:'TS 공고·RFP 5건 보기',exact:true}).click();for(const title of ['기본 작성구조','공고 5건 비교','요구사항 작성 예시']){await page.getByRole('button',{name:title,exact:true}).click();check(width+' RFP '+title+' 패널 폭',await page.locator('.wb-panel').evaluate(e=>e.scrollWidth<=e.clientWidth+2));}await page.screenshot({path:`qa-output/institution-rfp/${sha?'public':'local'}-rfp-${width}.png`});await page.keyboard.press('Escape');}
 await page.setViewportSize({width:1366,height:900});await page.goto(base+'index.html?view=workbench&screen=organization&department=QE&project=QE-01');await page.locator('#wb-department').waitFor();
 for(const [title,sourcePage,sourceRow]of [['시흥드론교육센터','38','8'],['교통안전관리 업무(교통수단안전점검 등)','38','10'],['천안홍성운전적성정밀검사','39','1']]){
  const button=page.getByRole('button',{name:title,exact:true});await button.click();check(title+' 수행범위 확인 표시',await page.locator('dialog').innerText().then(t=>t.includes('확인 필요')&&t.includes('대조 필요')));
  await page.getByRole('button',{name:'이 항목의 출처',exact:true}).click();const article=page.locator('dialog .wb-source');check(title+' 실제 페이지·행 원문',await article.count()===1&&await article.innerText().then(t=>t.includes(sourcePage+'쪽 '+sourceRow+'행'))&&await article.locator('a').getAttribute('href').then(h=>new URL(h).searchParams.get('pageNumb')===sourcePage));
  if(sourcePage==='39')await page.screenshot({path:`qa-output/institution-rfp/${sha?'public':'local'}-qe-duty-source.png`});await page.keyboard.press('Escape');
 }
 await page.goto(base+'index.html?view=workbench&screen=organization&department=katri-research-planning');await page.locator('#wb-department').waitFor();
 await page.getByRole('button',{name:'안전연구처',exact:true}).click();check('연구기획처 조직명 표기의 수행관계 확인 안내',await page.locator('dialog').innerText().then(t=>t.includes('연구기획처 소속 행')&&t.includes('실제 수행관계')&&t.includes('확인 필요')));
 await page.getByRole('button',{name:'이 항목의 출처',exact:true}).click();check('연구기획처 표기의 실제2쪽2행 출처',await page.locator('dialog .wb-source').innerText().then(t=>t.includes('2쪽 2행'))&&await page.locator('dialog .wb-source a').getAttribute('href').then(h=>new URL(h).searchParams.get('pageNumb')==='2'));await page.keyboard.press('Escape');
 await page.setViewportSize({width:390,height:844});
 await page.goto(base+'index.html?view=workbench&screen=service&project=QE-01');await page.locator('.wb-service-flow').waitFor();check('QE 목표 흐름·검사 유형·사람 판단 보존',await page.locator('.wb-service-flow li').count()===5&&await page.locator('#wb-main').innerText().then(t=>t.includes('수료기록·검사판정·자격 발급')&&t.includes('건강보험 질병자료')&&t.includes('현 제안 입력에서 제외')));
 check('서식 세부항목·식별정보 분리·자유서술 점검 표시',await page.locator('#wb-main').innerText().then(t=>t.includes('주민등록번호')&&t.includes('자유서술')&&t.includes('별지26호의2')&&t.includes('공란 자동 보충 금지')));
 await page.goto(base+'index.html?view=workbench&screen=solutions&project=QE-01');await page.locator('.wb-intent').waitFor();check('QE 기존 기반·추가 개발·교육 존재 함께 표시',await page.locator('#wb-main').innerText().then(t=>t.includes('aRDa')&&t.includes('NOA')&&t.includes('설치본·연계 가능성은 확인 필요')&&t.includes('교정교육이 이미 존재')));
 await page.screenshot({path:`qa-output/institution-rfp/${sha?'public':'local'}-qe-workflow-review.png`,fullPage:true});
 check('QE 모바일 흐름 가로 넘침 없음',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
 await page.setViewportSize({width:1366,height:768});await go('&legalView=role');await page.evaluate(()=>document.documentElement.style.zoom='200%');check('200% 확대 책무 내용 가로 넘침 없음',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));await page.evaluate(()=>document.documentElement.style.zoom='');
 for(const width of [1366,390]){
  await page.setViewportSize({width,height:900});await page.goto(base+'index.html?view=workbench&screen=solutions&project=KT-DP-01');await page.locator('.wb-intent').waitFor();
  check(width+' 리콜 기존 발주·추가 AI 구분',await page.locator('#wb-main').innerText().then(t=>t.includes('SFR-002')&&t.includes('SFR-003~005')&&t.includes('의미 차이')&&t.includes('인수 상태는 미확인')));
  check(width+' 기존 과징금 기능과 신규 기능 구분',await page.locator('#wb-main').innerText().then(t=>t.includes('2025-09')&&t.includes('CLipReport')&&t.includes('실제 납품·계산식·재산정')));
  check(width+' 기존 EWR 연구와 실제 운영 구분',await page.locator('#wb-main').innerText().then(t=>t.includes('2021년 EWR')&&t.includes('머신러닝')&&t.includes('납품·운영 상태는 미확인')));
  check(width+' 후속 전자시담·재사용 산출물 표시',await page.locator('#wb-main').innerText().then(t=>t.includes('전자시담')&&t.includes('최종 분석 코드')&&t.includes('사용권 확인')));
  await page.goto(base+'index.html?view=workbench&screen=service&project=KT-DP-01');await page.locator('.wb-service-flow').waitFor();
  check(width+' 리콜 보고조건·실제 정비 구분',await page.locator('#wb-main').innerText().then(t=>t.includes('90%')&&t.includes('제5항 통보')&&t.includes('실제 정비 완료')));
  check(width+' 리콜 개인정보 입력 경계·가로 넘침',await page.locator('#wb-main').innerText().then(t=>t.includes('소유자 정보')&&t.includes('모델 입력'))&&await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
  check(width+' 보고 목적별 시정률 자동 전용 차단',await page.locator('#wb-main').innerText().then(t=>t.includes('과징금용 시정률')&&t.includes('정의 확인 전 자동 대체 금지')&&t.includes('매출액·사업자등록증·차대번호')));
  check(width+' 연구 자료의 이용권 경계 표시',await page.locator('#wb-main').innerText().then(t=>t.includes('서면승인')&&t.includes('분석 코드')&&t.includes('학습')));
  await page.screenshot({path:`qa-output/institution-rfp/${sha?'public':'local'}-recall-${width}.png`,fullPage:true});
  await page.goto(base+'index.html?view=workbench&screen=institution&project=KT-DP-01');await page.locator('.wb-law-context').first().waitFor();check(width+' 리콜 기관 화면의 법정주체 구분',await page.locator('#wb-main').innerText().then(t=>t.includes('제작사 자체')&&t.includes('시정명령')&&t.includes('통지 대행')));
 }
 check('브라우저 JS 오류 없음',errors.length===0);
}finally{fs.writeFileSync(`qa-output/institution-rfp/${sha?'public':'local'}-browser.json`,JSON.stringify({base,sha,checks,errors},null,2));await browser.close()}
console.log('기관 책무·RFP 브라우저 '+checks.length+'항목 통과');})().catch(e=>{console.error(e);process.exitCode=1});
