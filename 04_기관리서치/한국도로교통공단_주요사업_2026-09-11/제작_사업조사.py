from pathlib import Path
from html import escape as h
import json,re,collections
B=Path(__file__).resolve().parent
main=json.loads((B/'공식메뉴_수집결과.json').read_text(encoding='utf-8'))
extra=json.loads((B/'하위항목_수집결과.json').read_text(encoding='utf-8'))
# 실제 열람 내용의 요약과 조사자의 적용 판단을 다른 필드에 기록한다.
notes=[
('시설·신호 운영, 단속장비 검사, 사고다발지 개선 및 사고조사 지원을 묶은 교통안전 업무 안내.','업무 구조 참고','개별 업무의 텍스트 절차를 확인하되 전체 안전사업을 CCK 수행 범위로 삼지 않음.'),
('안전시설 설치·운영 검토, 보호구역·보행 관련 계획과 조사, ITS 설계·사업관리·감리.','텍스트 업무 검토','기준과 검토보고서의 근거 대응·빠진 확인항목 검토. 공학 설계·도면 분석·감리는 별도 전문가 영역.'),
('교통정보센터 신호체계 운영, 중소도시 연동화, 시뮬레이션을 이용한 운영 분석.','핵심 기술 제외','CCK 범위는 승인된 운영기준·변경이력 설명의 가설에 한정. 신호 최적화·제어·교통 시뮬레이터는 제외.'),
('단속장비와 단속실 운영·점검·보수, 설치 기술지원, 장비 이력 관리. TEMS 등 기존 시스템을 소개.','텍스트 업무 검토','확정 장애기록과 정비문서의 대응 검토만 검토 가능. 영상 단속·장비 진단·현장 보수와 기존 TEMS 재구축은 제외.'),
('사고가 잦은 지점의 요인·현장 조사, 도로·시설 개선안, 교통시설 안전진단, 지자체 안전계획 지원.','텍스트 업무 검토','전문가가 작성한 문제·권고·조치자료의 의미 연결을 검토. 위험도 예측이나 도로설계의 자동 결정을 약속하지 않음.'),
('사법기관 의뢰 사고의 공학 분석 및 대형사고 조사·개선대책. 관계기관의 조치 제출과 합동점검 절차도 명시.','텍스트 업무 검토','사건 문서의 사실·출처·미확인 내용 정리 가설. 사고 원인·과실 판정 제외. 조치 추적 절차가 이미 있으므로 잔여 기능 확인 필수.'),
('교통단속장비 등에 대한 인수·성능·정기 검사, 인정범위와 검사안내. 하위 탭에서 신청부터 성적서까지 절차 제공.','텍스트 업무 검토','신청자료·모델명·시험성적서·기준 버전 대조. 성능검사 자체와 검사필증 자동 발급은 제외.'),
('교통시설·장비 공인시험, 음주측정기 교정, 시험·교정 절차·조직·신청 양식.','텍스트 업무 검토','서술형 시험의뢰·근거·보완 안내 검토. 시험과 계측을 LLM으로 대체하지 않음.'),
('신호제어기·UPS 기능검사와 사업·제조사·개발자·부품호환성 검사 안내.','텍스트 업무 검토','신청 유형·기준 버전·제출 근거를 확인하는 지원 가설. 표준 적합 판정은 공단 전문가가 수행.'),
('신호제어용 검지기의 성능인증과 인수·정기·변경/이설 현장성능검사, 안내·신청 자료 제공.','핵심 기술 제외','레이더·라이다·영상 검지 성능시험은 제외. 확정 결과의 설명·자료 보완만 제한 검토.'),
('2024년 개소한 시설·장비 시험검사 센터와 통합 지원 체계 구상을 소개.','중복 확인 우선','페이지의 통합 지원 체계는 예정으로 기재. 실제 구축·발주·운영 범위를 확인하기 전 신규 통합접수로 제안하지 않음.'),
('특별·전문·사회교육, 사고감정사, 안전운전인증과 온라인 교육센터를 안내.','업무 구조 참고','기존 교육 체계 안의 이해 확인·사례 학습 필요부터 조사. 교육 플랫폼을 새로 만드는 제안은 중복 검토.'),
('면허 정지·취소 또는 벌점 보유 운전자를 위한 교육. 연결 페이지에서 대상 확인·장소/날짜 선택·예약 절차 안내.','교육·접근성 검토','교육 조건 설명과 승인 교재 기반의 이해 확인 가설. 교육 대상 판정·이수 인정·예약 확정은 공식 절차 유지.'),
('사고조사·안전시설 분야 전문인력 교육과 운전전문학원 강사·검정원 연수.','교육·접근성 검토','전문 사례 문답과 기준 출처 확인 지원. 영상 분석 실습 및 자격시험 채점을 대신하지 않음.'),
('어린이·청소년·성인·고령층 대상 교육, 교육지도사 운영과 담당교사 연수.','교육·접근성 검토','대상별 승인 교재의 쉬운 설명·이해 확인. 신규 교재 효과와 접근성은 실제 이용자로 검증 필요.'),
('사고 조사·분석·감정을 위한 공인자격 운영과 보수교육·자격관리 안내.','교육·접근성 검토','자격 절차와 사례 학습 지원 가능성 검토. 자동 사고감정이나 자격 부여는 제외.'),
('기업·기관의 교통안전 관리체계를 대상으로 진단·교육·심의·사후관리를 수행하는 인증 제도.','중복 확인 우선','인증과 사후교육이 이미 존재. 제출 증빙의 서술 대응 또는 미이행 근거 검토에 새 필요가 있는지 확인.'),
('지역 교통·생활정보와 재난 안전을 다루는 공익방송. 방송국·중계소 운영과 제보 채널을 소개.','텍스트 업무 검토','확인된 돌발정보와 매뉴얼의 원고 대조·갱신 표시 가설. 음성 수집·자동 송출·미확인 긴급 경보는 제외.'),
('전국 13개 FM 방송국, 주파수와 지역 홈페이지 연결을 제공.','자료·기반 참고','지역별 전달 채널을 파악하는 자료. 별도 LLM 사업 단위로 보지 않음.'),
('TBN의 지역·날짜별 편성표로 연결. 연결 페이지의 당일 프로그램 표를 확인.','자료·기반 참고','편성 정보 자체는 일반 조회·표시 대상. AI 필요성을 별도로 입증해야 함.'),
('교통방송 운전자 청취율에 대한 연도별 자체공시.','자료·기반 참고','청취율은 방송 도달 지표. 안전행동 변화나 사고 감소의 직접 근거로 옮기지 않음.'),
('운전면허시험장과 면허시험·발급·갱신 등 면허업무 체계 안내.','업무 구조 참고','자동차검사를 수행하는 TS와 구분. KoROAD 면허 업무로 관리해야 함.'),
('학과·기능·도로주행 시험, 강사 자격시험 및 비문해자·외국인·청각장애인 등의 응시 지원.','교육·접근성 검토','자격·상황별 준비와 절차 이해 지원. 운전능력 판단·영상 채점은 제외하고 기존 접근성 서비스와 비교.'),
('면허 발급·교환·국제면허·적성검사·갱신, 고령운전자 컨설팅. 온라인 신청도 기존 서비스로 안내.','교육·접근성 검토','상황별 제출서류와 방문 경로의 근거 있는 안내. 건강·인지능력 판단이나 갱신 승인 자동화는 제외.'),
('장애인·국가유공상이자·기초생활수급자·한부모가족 등의 면허 취득 상담·교육·지원.','교육·접근성 검토','지원 조건·준비서류·상담 인계에서 실제 접근 장애를 조사. 운전능력 측정과 지원 자격 확정은 기존 권한자 책임.'),
('연도별 면허시험 통계로 연결되고 민원현황 탭을 제공.','자료·기반 참고','업무량의 배경 자료이며 불편·미처리 원인을 입증하지 않음. 표의 연도와 집계 단위를 보존.'),
('교통안전 정책·법제, 신호·시설·장비, 자율주행 평가·운영 관련 연구 분야 소개.','핵심 기술 제외','기관의 기존 R&D 영역을 파악하는 근거. 독립 R&D·센서·자율주행 연구를 CCK 전환사업에 편입하지 않음.'),
('2026년 기본연구 12건과 연구용역 9건을 목록·개요 수준에서 확인.','중복 확인 우선','교육 효과, 재난정보, 기준 개선, 자율주행 연구 등 기존 과제와 중복 대조. 사업별 원문 보고서·실증은 미검증.'),
('연구논집·브리프·논문·학술행사·국제회의·규격 개정·사고비용 추계의 성과 채널.','자료·기반 참고','검증된 최신 자료를 지식 근거로 사용할 가능성. 수록 논문의 주장을 공단 공식 정책이나 검증된 제품으로 취급하지 않음.'),
('해외 연구기관·국제기구와 연구·정보 교류 관계를 소개.','자료·기반 참고','국제 기준 비교 자료의 탐색 경로. 최신 협약 상태·데이터 사용권은 별도 확인.'),
('국내외 교통 연구·정책·통계 관련기관 링크와 역할 소개. TS도 별도 기관으로 수록.','자료·기반 참고','기관 경계와 추가 근거 탐색에 사용. 모든 연결기관을 KoROAD 사업이나 권한으로 묶지 않음.'),
('특허·디자인 등 지식재산 목록과 기술 설명. 열람 시 총 41건 표기.','자료·기반 참고','기술 자산이 있다는 사실과 CCK 사용권을 구분. 전체 특허의 권리 상태·실시 가능성은 조사하지 않음.'),
('AI·데이터 공동활용, 분야별 플랫폼 연계와 대민 서비스, 행정 개선의 4대 전략·9개 과제를 제시.','중복 확인 우선','플랫폼 구축을 신규 아이디어로 반복하지 않음. 실제 구축 단계·발주 범위·기존 LLM 기능부터 확인.'),
('가명정보 결합 개념과 준비·신청 절차를 안내. 결합 신청 탭·서식 연결 확인.','자료·기반 참고','신청 목적·항목·근거 문서 정리는 검토 가능. 데이터 결합 권한·반출 승인을 LLM이 부여할 수 없음.'),
('국가 교통사고 통계 DB, TAAS 통계·GIS·다발지역 분석, 보고서와 OpenAPI를 소개.','중복 확인 우선','허용된 통계 질의와 결과 설명 가설. TAAS 기능 재구축·지도 위험탐지·원시 영상 분석은 제외.'),
('정보보호 정책·점검·교육·관제·침해 대응 및 개인정보보호 업무.','자료·기반 참고','모든 사업의 공통 준수 조건. LLM 증빙 검토 가능성과 보안관제 엔진·무사고 보장은 구분.')
]
assert len(main)==len(notes)==36
for row,n in zip(main,notes):
    row['summary'],row['cck_category'],row['cck_assessment']=n
    text=(B/row['text_file']).read_text(encoding='utf-8')
    row['content_owners']=re.findall(r'(?:담당부서\s*[:：]\s*)([^\n]+)',text)
    row['review_status']='주요사업 소개·대표 본문 확인' if row['id'] not in ('KB21','KB26','KB28','KB29','KB32') else '현재 목록·안내 및 공개 본문 확인'
    row['review_limit']='현행 법령·인정범위 원문, 실제 시스템 기능·수요·CCK 제품·계약 비중복은 별도 검증. 연도별 과거 기록·첨부 전문 전수열람 아님.'
    row['judgment_type']='CCK 적용 판단은 조사자의 검토 가설'

internal=[r for r in extra if r['content_found']]
external=[r for r in extra if not r['content_found']]
manifest=json.loads((B/'공식메뉴_모집단.json').read_text(encoding='utf-8'))
assert all(r['content_found'] and r['text_chars']>0 for r in main)
assert len(internal)==16 and len(external)==12
book={'date':'2026-09-11','institution_id':'ORG-0002','institution':'한국도로교통공단(KoROAD)','scope':'주요사업 전체메뉴 6개 분야·36개 항목, 직접 하위 탭·선별 연결 안내 28개 경로. 연결 포털 전체 기능·첨부·역대 게시물 전수조사는 아님.','coverage':{'groups':6,'main_menu_population':36,'main_menu_reviewed':36,'additional_internal_paths':16,'external_guide_paths':12,'same_content_note':'KC07·KC08은 서로 다른 주소에서 동일 안전운전인증 안내를 제공하므로 독립 사업·근거로 중복 계산하지 않음.'},'items':main,'additional_sources':extra}
(B/'주요사업_확인원장.json').write_text(json.dumps(book,ensure_ascii=False,indent=2),encoding='utf-8')

research_basic=[
'원격운전자의 자격·인증 체계','도로교통법을 활용한 자율주행 합성데이터 서비스·실증','자율주행 운전능력 평가용 차량 데이터 취득','실주행 자료 기반 안전성 평가','재난·재해 돌발정보관리체계 개선Ⅱ','무인단속장비 설치 기준 개선','노면표시 유지관리 체계','교통신호 국제기준 비교·개선','고령보행자 안전대책 효과','실차 기반 운전능력진단의 신뢰성·타당성','음주운전 교육 효과·개선Ⅱ','약물운전 규제 적정화']
research_service=['자율주행 합성데이터 생성·제공','산악도로 자율주행 실증 인프라','실도로 Lv.4 운전능력 평가','혼재교통의 고위험 상황 예측·단속','Lv.4 교통안전 인프라 표준·평가','자율주행 순찰 서비스','자율화물운송 실증의 도로교통법 근거','스마트타이어 관련 노면위험감지 평가','지정노선 다목적 자율주행 중형버스']
md='''# 한국도로교통공단 주요사업 전체메뉴 조사

2026-09-11 · v1.0 · ORG-0002 · CCK 신규사업 탐색용

**공식 전체메뉴의 6개 분야·36개 항목을 모두 확인했다.** 내부 하위 안내·목록 16개와 외부 안내 12개 경로도 점검했다. 2026년 주요연구사업은 기본연구 12건·연구용역 9건의 개요를 대조했다.

범위는 ‘주요사업의 소개·하위 안내 구조’다. 연결된 통합민원·교육·방송 포털의 모든 기능, 연구논문·특허·공지의 역대 모든 게시물과 첨부 전문을 열람한 것은 아니다. 메뉴·하위 경로·연구과제는 서로 다른 집계 단위이며 사업 건수로 합산하지 않는다.

## 1. 기관을 먼저 구분한다

이번 대상은 **한국도로교통공단(KoROAD, koroad.or.kr)**이다. 기존 기획의 **한국교통안전공단(TS, kotsa.or.kr)**과 별도 기관이다. KoROAD 공식 관련기관 목록에도 TS가 별도로 안내된다. 자동차검사 예약·검사결과 중심의 TS 기획을 KoROAD의 운전면허·교육·도로시설 사업으로 자동 치환하지 않는다. [공식 관련기관 목록](https://www.koroad.or.kr/main/content/view/MN03050900.do)

공식 홈페이지가 안내하는 업무와 콘텐츠 담당부서를 기록했다. 특정 연도의 공공기관 지정 유형, 모든 개별 업무의 위탁·지정 관계, 현행 법령 원문·시행일은 이번 메뉴 조사만으로 확정하지 않는다.

## 2. 확인 범위

| 분야 | 주요사업 메뉴 수 | 포함 범위 |
|---|---:|---|
| 교통안전사업 | 11 | 시설·신호·장비·사고 분석·시험검사·인증센터 |
| 교통교육사업 | 6 | 특별·전문·사회교육·감정사·안전운전인증 |
| 교통방송사업 | 4 | 사업소개·방송국·편성·청취율 |
| 운전면허사업 | 5 | 시험·행정서비스·취약계층 지원·업무현황 |
| 연구개발사업 | 6 | 연구분야·과제·성과·국제교류·관련기관·지식재산 |
| 교통AI디지털사업 | 4 | AI·데이터 플랫폼·가명결합·사고DB·정보보호 |
| 합계 | 36 | 중복 없는 전체메뉴 항목 기준 |

기준은 사용자 제공 [교통안전사업 안내 페이지](https://www.koroad.or.kr/main/content/view/MN03010100.do)의 전체메뉴다. 일반 메뉴에 보이지 않는 검사인증센터·지식재산권도 포함했다. [메뉴 모집단](공식메뉴_모집단.json)과 [확인원장](주요사업_확인원장.json)에 URL·본문 파일·열람일·한계를 남겼다.

## 3. 전체 사업별 확인 결과

‘CCK 검토’는 조사자의 기술 적용 가설이다. 개발 가능·선정·수주 가능 판정이 아니다. 법적 판단·시설 검사·운전능력 판정은 공식 기관과 전문가의 책임으로 남긴다.
'''
for group in manifest['groups']:
    md+='\n### '+group+'\n\n| ID·공식 메뉴 | 실제 업무 요약 | CCK 검토·경계 |\n|---|---|---|\n'
    for r in main:
        if r['group']==group:md+=f"| {r['id']} [{r['title']}]({r['url']}) | {r['summary']} | **{r['cck_category']}** — {r['cck_assessment']} |\n"
md+='''
## 4. 기존 제안을 바꾸게 하는 조사 결과

**사고 분석 뒤 조치 확인은 이미 업무 절차에 있다.** KoROAD는 대형사고 조사 후 관계기관의 조치내용 제출과 합동점검을 안내한다. ‘조치 추적이 전혀 없다’고 전제할 수 없다. 새 가치가 있다면 서술형 권고와 제출 근거의 불일치를 찾는 등 실제 미해결 기능에서 확인해야 한다. [KB06](https://www.koroad.or.kr/main/content/view/MN03010800.do)

**AI·데이터 플랫폼도 기존 추진 방향이다.** 해당 페이지는 4대 전략·9개 과제로 공동활용·연계·대민 서비스 등을 제시한다. 이 자료로 구축 완료를 단정할 수는 없지만, 같은 플랫폼을 새 아이디어로 제시할 근거도 부족하다. [KB33](https://www.koroad.or.kr/main/content/view/MN03060100.do)

**교육·인증·사후관리 역시 기존 서비스다.** 온라인 교육센터에는 법정교육과 마이크로러닝이 있고 안전운전인증은 진단·교육·심의·사후관리 절차를 제공한다. 신규 LLM 후보는 기존 교육의 실제 오해·이해 확인·업무 적용 문제를 추가 검증해야 한다. [안전운전인증 안내](https://www.safedriving.or.kr/eeGuide/selectEeGuide10.do?menuCd=MN-PO-1521), [교육센터](https://trafficedu.koroad.or.kr:8443)

**TAAS는 기존 통계·GIS·다발지역 분석 기반이다.** 새 사고 통계 플랫폼보다는 허용된 통계와 자료를 정확히 찾아 의미와 한계를 설명하는 기능에서 차이를 검토한다. [KB35](https://www.koroad.or.kr/main/content/view/MN03060200.do)

## 5. 2026년 연구과제와의 중복 대조

다음은 공식 과제명·개요의 축약 표현이다. 연구 결과가 완성됐거나 효과가 검증됐다는 뜻이 아니다. 기본연구는 두 페이지의 12건, 연구용역은 한 페이지의 9건을 확인했다. 과거 연도 과제의 원문 전수조사는 하지 않았다.

### 기본연구 12건

'''+''.join(f'{i+1}. {t}\n' for i,t in enumerate(research_basic))+'''

출처: [2026 기본연구 목록](https://www.koroad.or.kr/main/research/res_basic_list.do?sc=2026), [2쪽](https://www.koroad.or.kr/main/research/res_basic_list.do?cp=2&sc=2026&cp=1&listType=list).

### 연구용역 9건

'''+''.join(f'{i+1}. {t}\n' for i,t in enumerate(research_service))+'''

출처: [2026 연구용역 목록](https://www.koroad.or.kr/main/research/res_service_list.do?sc=2026).

교육 효과·재난정보·규격 개선은 CCK 가설과 접점이 있지만 해당 연구와의 과업 대조가 선행돼야 한다. 자율주행·영상 합성데이터·센서·실증 인프라 연구는 현재 CCK 로컬 LLM·인프라 0원 제약의 핵심 수행 범위에서 제외한다. KoROAD에 연구개발사업이 있다는 사실은 CCK 독립 R&D 제안 허용을 뜻하지 않는다.

## 6. CCK가 추가 확인할 수 있는 납품 단위

| 검토 가설 | 필요한 공식 입력 | CCK·로컬 LLM 역할 | 반드시 남길 경계 |
|---|---|---|---|
| 기준 변경의 업무 반영 검토 | 승인된 규격·매뉴얼의 전후 버전, 실제 서식·체크리스트 | 변경 문장과 영향 후보 연결, 근거 제시, 담당자 확인 | 신호 제어·공학 설계·현행 법령 판정 자동화 제외 |
| 검사·인증 제출 근거 검토 | 신청서, 확정 시험결과, 요구 항목, 보완 기록 | 서술 대응·누락 질문·담당자 보완 검토 | 물리 검사·인증 결정 제외, 통합 지원 체계 기존 과업 확인 |
| 사고 개선 권고와 조치자료 대조 | 전문가 확정 권고·관계기관 제출자료 | 상충·불충분 근거를 제시하고 검토 이력 관리 | 이미 있는 합동점검·조치 추적을 신규로 재포장하지 않음 |
| 상황별 안전학습·이해 확인 | 승인 교재·사례·전문가 평가 기준 | 출발 전·정차 중 사례 문답, 오해 확인·근거 설명 | 운전 중 사용·이수 인정·운전능력 진단 제외. 2026 교육 연구와 비교 |
| 복합 면허·지원 절차 안내 | 공식 안내·승인 업무규칙·기관별 지원 조건 | 자연어 상황의 필수 조건 확인, 준비서류·다음 접점 설명 | 신규 플랫폼·일반 민원 챗봇과 구별, 실제 접근성 문제 검증 |

공통 조건은 **CCK 주관 수행 근거 확인, 로컬 LLM, 기존 서버, 신규 인프라 투자 0원**이다. 텍스트·확정 수치·공식 상태를 입력으로 사용하고 비전·신규 OCR·센서 개발은 제외한다. TS의 기존 공통플랫폼·민원·전세버스 과업 제외 조건은 유지한다. KoROAD가 TS의 현재 서버를 사용할 수 있다는 가정은 하지 않는다. KoROAD 적용 시에는 해당 기관이 제공할 기존 자원의 사용권·성능이 별도로 필요하다.

기존 TS의 1차 7억·2차 5억 목표 예산을 KoROAD 사업비로 전용하거나 이번 가설을 자동 추가하지 않았다. 수요·업무 권한·기존 계약·제품 실행·인력·견적을 확인한 뒤 기관별로 산정해야 한다.

## 7. 자료의 한계와 후속 확인

- KB05의 효과표에는 본문 기간과 표 설명 기간이 다르게 표기돼 있다. 감소율을 새 AI 사업의 기대효과로 사용하지 않았다.
- KB08 소개에는 과거 법 조항이 기재돼 있고, KB09에는 기준 개정 시점의 확인이 필요한 문구가 남아 있다. 홈페이지 안내를 현행 법령·규격 검증 결과로 승격하지 않았다.
- KB11의 통합 지원은 예정, KB33의 플랫폼은 추진 방향으로 기재돼 있다. 실제 구축·발주 현황 확인이 필요하다.
- 사업 목록의 담당부서는 콘텐츠 관리 연락처다. 계약상 발주 주체·최종 의사결정권자와 같다고 단정하지 않는다.
- 연구논집·특허의 게시 건수와 목차는 확인했지만 모든 논문·특허의 전문·성능·권리상태를 검증하지 않았다. 원문 데이터와 영상은 사업 기획용 문서에 재게시하지 않았다.
- 별도 포털은 공개 안내를 읽었으며 로그인·개인정보 입력·예약·신청·결제·기관 연락은 수행하지 않았다. 외부 안내 URL 두 개가 같은 인증 내용을 보여 주는 경우도 원장에 남겼다.

P01 안전·편익 문제, P02 현업 수용, P03 비AI 대비 가치, P04 실제 소관업무, P05 재사용 경계, P06 위탁·권한, P07 재정 타당성은 각각 실사해야 한다. 이번 작업은 해당 검토의 공식 업무 지도를 만든 단계다.

작업 유형: 기존 기획의 기관 업무 조사 확대 / 규모 M / 위험도 Medium. 메뉴 모집단 확정 → 본문·하위 안내 확인 → CCK 적합성 가설 → 자체 문서·화면 QA의 순서로 수행했다. 실제 구현·배포·독립 평가위원 승인은 이번 범위에 없다.
'''
(B/'한국도로교통공단_주요사업_전체검토.md').write_text(md,encoding='utf-8')

cards=''
for r in main:
    owner=' · '.join(r['content_owners']) or '페이지별 추가 확인'
    cards+=f'''<details data-group="{h(r['group'])}" data-fit="{h(r['cck_category'])}" data-search="{h(r['title']+' '+r['summary']+' '+r['cck_assessment'])}"><summary><span class="id">{r['id']}</span><span><strong>{h(r['title'])}</strong><small>{h(r['group'])}</small></span><span class="tag">{h(r['cck_category'])}</span></summary><div class="detail"><p><b>공식 업무</b> {h(r['summary'])}</p><p><b>CCK 적용 판단 · 가설</b> {h(r['cck_assessment'])}</p><p class="muted">콘텐츠 담당: {h(owner)} · 실제 발주부서·계약·제품 수행 검증 전</p><a href="{h(r['url'])}">공식 페이지</a></div></details>'''
groups=''.join(f'<option>{h(g)}</option>' for g in manifest['groups'])
fits=''.join(f'<option>{h(g)}</option>' for g in dict.fromkeys(r['cck_category'] for r in main))
group_rows=''.join(f'<tr><th scope="row">{h(g)}</th><td>{sum(r["group"]==g for r in main)}</td></tr>' for g in manifest['groups'])
extra_rows=''.join(f'<tr><td>{r["id"]} · {r["parent"]}</td><td><a href="{h(r["url"])}">{h(r["title"])}</a></td><td>{"본문·목록 확인" if r["content_found"] else "공개 안내 확인"}</td></tr>' for r in extra)
html=f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>KoROAD 주요사업 36개 전체 검토</title><style>
:root{{--ink:#163343;--muted:#536770;--teal:#00695b;--line:#cbdadb;--paper:#f2f6f4}}*{{box-sizing:border-box}}body{{margin:0;background:var(--paper);color:var(--ink);font:16px/1.8 'Malgun Gothic',system-ui,sans-serif}}a{{color:var(--teal);text-underline-offset:4px}}a:focus-visible,input:focus-visible,select:focus-visible,button:focus-visible,summary:focus-visible,[tabindex]:focus-visible{{outline:3px solid #9c5b00;outline-offset:4px}}.skip{{position:absolute;top:-90px;left:16px;background:white;padding:10px}}.skip:focus{{top:8px;z-index:9}}header{{background:white;border-bottom:1px solid var(--line);padding:17px max(24px,calc((100% - 1160px)/2));display:flex;justify-content:space-between;gap:20px}}header b,nav{{font-size:14px}}nav{{display:flex;gap:18px;flex-wrap:wrap}}main{{max-width:1160px;margin:auto;padding:44px 24px 70px}}h1{{font-size:clamp(34px,5vw,54px);line-height:1.3;letter-spacing:-.04em;margin:15px 0 20px}}h2{{font-size:27px;letter-spacing:-.035em;margin:45px 0 17px}}p,h1,h2,td,summary{{word-break:keep-all;overflow-wrap:anywhere}}.eyebrow{{font-size:12px;color:var(--teal);font-weight:bold;letter-spacing:.1em}}.lead{{font-size:20px;max-width:960px}}.muted,small{{color:var(--muted)}}.actions{{display:flex;gap:14px;flex-wrap:wrap;margin:24px 0}}.actions a{{padding:10px 17px;background:white;border:1px solid var(--line);border-radius:4px;text-decoration:none}}.actions a:first-child{{background:var(--teal);color:white}}.metrics{{display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin:28px 0}}.metric{{border-top:3px solid var(--teal);background:white;padding:20px}}.metric strong{{display:block;font-size:36px;line-height:1.3}}.note{{padding:22px;background:#e3ede9;border-left:4px solid var(--teal)}}.tools{{display:flex;flex-wrap:wrap;gap:14px;padding:20px;background:white;border:1px solid var(--line);margin:24px 0}}label{{font-size:14px}}input,select,button{{font:inherit;padding:9px;border:1px solid #899ea5;border-radius:4px;background:white;color:var(--ink);max-width:100%}}input{{width:270px}}button{{cursor:pointer}}label span{{display:block}}#count{{font-weight:bold;color:var(--teal)}}details{{border:1px solid var(--line);border-radius:6px;background:white;margin:12px 0}}summary{{cursor:pointer;display:flex;gap:18px;align-items:center;padding:18px 22px}}summary small{{display:block;font-size:12px;margin-top:4px}}summary strong{{font-size:17px}}summary>span:nth-child(2){{flex:1}}summary::before{{content:'+';font-weight:bold;color:var(--teal)}}details[open] summary::before{{content:'−'}}.id{{font-size:12px;color:var(--teal);font-weight:bold}}.tag{{font-size:12px;background:#edf2f0;border-radius:4px;padding:4px 8px}}.detail{{border-top:1px solid var(--line);padding:8px 24px 24px}}.detail p{{margin:16px 0}}.detail b{{display:block;margin-bottom:4px}}.cols{{display:grid;grid-template-columns:1fr 1fr;gap:22px}}.panel{{background:white;border:1px solid var(--line);padding:24px;border-radius:6px}}.panel h3{{margin-top:0;font-size:19px}}.panel li{{margin:10px 0}}.wrap{{overflow:auto;background:white;border:1px solid var(--line)}}table{{border-collapse:collapse;width:100%;font-size:14px;min-width:590px}}th,td{{text-align:left;vertical-align:top;padding:13px 15px;border-bottom:1px solid var(--line)}}th{{background:#e4eeea}}footer{{margin-top:50px;border-top:1px solid var(--line);padding-top:20px;font-size:14px}}[hidden]{{display:none!important}}
@media(max-width:650px){{header{{display:block;padding:16px 20px}}nav{{margin-top:8px}}main{{padding:28px 20px 50px}}.metrics,.cols{{grid-template-columns:1fr}}.metric strong{{font-size:30px}}summary{{gap:10px;padding:15px}}summary .tag{{display:none}}.tools label,input,select{{width:100%}}.lead{{font-size:18px}}}}
@media print{{.tools,nav,.actions{{display:none}}body{{background:white}}main{{max-width:none;padding:0}}.detail{{display:block}}details{{break-inside:avoid}}}}
</style></head><body><a class="skip" href="#content">본문으로 건너뛰기</a><header><b>KoROAD · 주요사업 조사</b><nav><a href="#map">전체 36개</a><a href="#findings">새로 확인한 점</a><a href="#coverage">하위 안내</a></nav></header><main id="content"><div class="eyebrow">OFFICIAL BUSINESS REVIEW · 2026.09.11</div><h1>한국도로교통공단<br>주요사업 전체 검토</h1><p class="lead">공식 업무를 먼저 확인하고, CCK의 로컬 LLM이 담당할 수 있는 텍스트·지식·절차 기능을 구분했습니다.</p><p class="note"><b>이번 대상은 한국도로교통공단(KoROAD)입니다.</b> 기존 TS 한국교통안전공단 기획과 기관·소관·예산을 구분합니다. 기존 서버 사용 가능성도 기관별로 확인해야 합니다.</p><div class="actions"><a href="한국도로교통공단_주요사업_전체검토.md">전체 조사 MD</a><a href="주요사업_확인원장.json">출처·판단 원장</a><a href="https://www.koroad.or.kr/main/content/view/MN03010100.do">공식 주요사업</a></div><div class="metrics"><div class="metric"><strong>6개 분야</strong>공식 주요사업 분류</div><div class="metric"><strong>36 / 36</strong>전체메뉴 소개·대표 본문 확인</div><div class="metric"><strong>28개 경로</strong>내부 16 · 외부 안내 12</div></div><p class="muted">‘전체’는 주요사업 메뉴의 누락 없는 확인을 뜻합니다. 역대 모든 게시물·첨부 전문이나 연결 포털 전체 기능을 검증한 결과는 아닙니다.</p>
<section id="map"><h2>전체 사업에서 찾아보기</h2><p>공식 업무와 CCK 적용 가설을 각 항목 안에 나누어 기록했습니다. 분류는 수주 가능성이나 우선순위 점수가 아닙니다.</p><div class="tools"><label><span>사업·내용 검색</span><input id="q" type="search" placeholder="예: 교육, 검사, 조치"></label><label><span>사업 분야</span><select id="group"><option value="">모든 분야</option>{groups}</select></label><label><span>CCK 검토 분류</span><select id="fit"><option value="">모든 분류</option>{fits}</select></label><button id="reset" type="button">초기화</button><button id="collapse" type="button">모두 접기</button></div><p id="count" role="status">36개 항목</p><div id="items">{cards}</div><p id="empty" hidden>조건에 맞는 사업이 없습니다. 검색어나 분류를 바꿔 주세요.</p></section>
<section id="findings"><h2>이번 조사로 달라지는 판단</h2><div class="cols"><div class="panel"><h3>기존 기능과 먼저 대조</h3><ul><li>사고 조사 후 조치 제출·합동점검 절차가 이미 있습니다.</li><li>시험검사 통합 지원과 AI·데이터 플랫폼 구상이 제시돼 있습니다.</li><li>교육·인증·사후관리와 TAAS 통계·GIS 서비스가 존재합니다.</li><li>따라서 단순 플랫폼·추적·교육 제공을 신규성으로 주장할 수 없습니다.</li></ul></div><div class="panel"><h3>CCK가 더 확인할 단위</h3><ul><li>기준 변경과 업무 서식의 영향 검토</li><li>검사·인증 제출 자료의 근거·누락 검토</li><li>확정 개선 권고와 조치자료의 의미 대조</li><li>승인 사례로 안전행동 이해 확인</li><li>복합 면허·지원 절차의 준비·인계 안내</li></ul><small>모두 수요·비중복·제품 실행을 확인해야 할 가설입니다.</small></div></div><p class="note"><b>기술 경계:</b> 로컬 LLM · 텍스트 및 확정 결과 · 신규 인프라 투자 0원. 비전·신규 OCR·센서·신호 제어·운전능력 판정·안전 인증 자동화는 현재 범위에서 제외합니다.</p><h2>2026년 연구과제도 대조했습니다</h2><p>기본연구 12건·연구용역 9건의 목록과 개요를 확인했습니다. 교육 효과, 재난정보, 규격 개선 연구는 중복 검토 대상이며 자율주행·실증 인프라·센서 연구는 CCK 수행 범위로 가져오지 않습니다.</p><div class="cols"><div class="panel"><h3>기본연구 12건 · 축약명</h3><ol>{''.join('<li>'+h(t)+'</li>' for t in research_basic)}</ol></div><div class="panel"><h3>연구용역 9건 · 축약명</h3><ol>{''.join('<li>'+h(t)+'</li>' for t in research_service)}</ol></div></div></section>
<section id="coverage"><h2>확인 범위와 출처</h2><div class="wrap" tabindex="0" role="region" aria-label="분야별 메뉴 수"><table><thead><tr><th>사업 분야</th><th>메뉴 수</th></tr></thead><tbody>{group_rows}</tbody></table></div><h3>추가 하위 안내 28개 경로</h3><p>한 사업이 여러 안내로 연결됩니다. KC07·KC08은 같은 인증 내용을 가리키므로 별도 사업으로 세지 않습니다.</p><div class="wrap" tabindex="0" role="region" aria-label="하위 안내 출처 목록"><table><thead><tr><th>출처 · 상위 메뉴</th><th>직접 열람한 경로</th><th>범위</th></tr></thead><tbody>{extra_rows}</tbody></table></div><p class="muted">신청·개인정보 입력·예약·결제는 실행하지 않았습니다. 현행 법령·계약 중복·CCK 로컬 실행·사용자 효과·견적은 후속 확인 대상입니다.</p></section><footer>공식 자료 요약과 조사자의 적용 판단을 구분했습니다. 실제 기관 승인·독립 평가위원 판정·제품 성능 검증 결과가 아닙니다.<br><a href="../TS_대화구조화/무사고_전략재검토_2026-09-11/TS_무사고_전략과_CCK_사업재검토.html">앞선 TS 무사고 전략 검토</a></footer></main><script>const items=[...document.querySelectorAll('#items details')],q=document.querySelector('#q'),g=document.querySelector('#group'),f=document.querySelector('#fit');function filter(){{let count=0;const term=q.value.trim().toLowerCase();for(const d of items){{d.hidden=Boolean((g.value&&d.dataset.group!==g.value)||(f.value&&d.dataset.fit!==f.value)||(term&&!d.dataset.search.toLowerCase().includes(term)));if(!d.hidden)count++;}}document.querySelector('#count').textContent=count+'개 항목';document.querySelector('#empty').hidden=count>0;}}q.addEventListener('input',filter);g.addEventListener('change',filter);f.addEventListener('change',filter);document.querySelector('#reset').addEventListener('click',()=>{{q.value='';g.value='';f.value='';filter();}});document.querySelector('#collapse').addEventListener('click',()=>items.forEach(d=>d.open=false));</script></body></html>'''
(B/'한국도로교통공단_주요사업_전체검토.html').write_text(html,encoding='utf-8')
print('작성 완료: 36개 사업, 하위 28개 경로, 연구개요 21건')
