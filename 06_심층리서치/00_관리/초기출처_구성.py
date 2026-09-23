"""2026-09-09에 실제 검토한 출처를 등록한다. 재실행 시 기존 원장을 덮어쓰지 않는다."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
ROWS = [
('001','전세버스 교통안전정보 공시','https://main.kotsa.or.kr/portal/contents.do?menuCode=01040204','한국교통안전공단',None,'제도 소개·법적근거·이용절차','평가 등급·점수를 국민이 지역·업체명으로 조회하는 제도와 자료 검증·예비공시 절차를 안내한다.','서비스 설명은 확인했으나 실제 이용률·이해도·사고 감소 효과는 미확인.'),
('002','Look Before You Book: Put Bus Safety First','https://www.fmcsa.dot.gov/travelplanner','미국 FMCSA',None,'Bus Safety Search 안내','여행 기획자가 버스회사의 안전 이력 등을 조회하도록 안내하고 검색 도구를 제공한다.','미국 제도 사례이며 한국 공시 등급과 직접 등치하지 않는다. AI 사용·사고 감소 인과효과 미확인.'),
('003','운행기록분석시스템(ETAS)','https://main.kotsa.or.kr/portal/contents.do?menuCode=01040400','한국교통안전공단',None,'목적·서비스 내용','위험운전 행동의 횟수·거리당 지표, GIS 분석 및 운전자·업체별 진단을 공식 서비스 내용으로 설명한다.','현재 세부 기능 가동·API 제공·연구용 데이터 권한은 미검증.'),
('004','eTAS 접속 시 시스템 점검 안내','https://etas.kotsa.or.kr/','한국교통안전공단',None,'첫 화면 점검 공지','열람 시 2026-03-26부터 추후 공지까지의 시스템 점검과 수동 제출 방안 추후 안내 문구를 확인했다.','공개 페이지의 응답 관찰이다. 전체 업무 중단 기간이나 모든 사용자의 장애를 단정하지 않는다.'),
('005','Making Bus Journeys Safer for Everyone','https://www.lta.gov.sg/content/ltagov/en/newsroom/2025/8/news-releases/making_bus_journeys_safer.html','싱가포르 LTA','2025-08','본문 5~11항','운전자 근무환경 개선과 안전기술을 함께 추진하며 AI 충돌경고 등을 신규 버스 구매에 반영한다고 발표했다.','구매·확대 계획과 실제 장착 완료를 구별. 국내 DTG 분석과 동일 기술이 아니며 사고 감소 효과값 미확인.'),
('006','TS튜닝알리고','https://main.kotsa.or.kr/portal/contents.do?menuCode=01020300','한국교통안전공단',None,'기술·제품 마켓, 튜닝기술지원','튜닝업체 지원 플랫폼으로 견적·홍보·교육·외관도 지원 등을 설명한다.','튜닝 승인 판정 시스템이나 AI 상담으로 분류하지 않는다. 실제 이용량 미확인.'),
('007','자동차 튜닝제도','https://main.kotsa.or.kr/portal/contents.do?menuCode=01020101','한국교통안전공단',None,'튜닝 정의·절차','자동차 튜닝제도와 승인·검사 관련 절차를 안내하는 공식 페이지다.','개별 차량의 허용 여부·최신 예외는 법령과 담당자 확인이 필요. 안내 페이지 자체가 승인 증거는 아니다.'),
('008','Making changes to a vehicle ... (INF318)','https://www.gov.uk/government/publications/making-changes-to-a-vehicle-and-registering-kit-built-kit-converted-and-reconstructed-classic-vehicles-inf318/making-changes-to-a-vehicle-and-registering-kit-built-kit-converted-and-reconstructed-classic-vehicles-inf318','영국 DVLA','2026-08-03','수리·복원, 구조변경 및 신고 증빙 구분','수리·구조변경 등의 상황과 증빙·신고를 구분한 HTML 지침을 제공한다.','최초 게시 2025-08-26, 확인된 개정 2026-08-03. 비AI 안내 사례이며 한국 승인 기준으로 사용할 수 없다.'),
('009','휠체어·유모차 다니기 편한 길 알려드려요… 서울동행맵 정식 출시','https://news.seoul.go.kr/traffic/archives/512992?listPage=1','서울특별시','2024-11-05','정식 서비스 시작·맞춤형 길 안내·접근성 개선','2024-11-01 정식 서비스 시작과 교통약자 맞춤 길안내·저상버스 이용 지원·화면낭독기 기능을 설명한다.','페이지 날짜와 서비스 시작일 구별. 최신 앱을 직접 사용하거나 전국 적용·효과를 검증하지 않았다. 공공누리 제4유형 표기.'),
('010','Assistive Technologies to Help Bus Commuters with Special Needs','https://www.lta.gov.sg/content/ltagov/en/newsroom/2020/3/news-releases/assistive-technologies-to-help-bus-commuters-with-special-needs.html','싱가포르 LTA','2020-03-05','본문 2~4항','MAVIS의 2019년 버스 시범과 맞춤 이동 안내·승하차 알림·운전자 지원 요청 기능, 후속 시범 확대 계획을 발표했다.','현재 전 노선 운영으로 볼 수 없다. 긍정 피드백은 통제 실험 효과가 아니며 AI 사용 근거도 없다.'),
('011','기계식주차장 검사 소개','https://main.kotsa.or.kr/portal/contents.do?menuCode=01030401','한국교통안전공단',None,'업무 소개·법적근거·검사종류','설계서 안전도 심사와 사용·정기·정밀안전검사 업무, 관리시스템 연결을 안내한다.','검사 업무 소개 확인 수준. 정보망 위탁 조문만으로 모든 검사·사고조사 권한을 포괄하지 않는다.'),
('012','After-Sales Services','https://www.ihi.co.jp/parking/services/index.html','IHI',None,'Preventive Maintenance / 24-Hour Emergency Response','기계식 주차설비 예방보전·긴급 대응·원격감시 서비스를 공급사 공식 페이지에서 설명한다.','공급사 설명이며 실명 도입시설·계약·AI 모델·고장률 개선 증거 미확인. 일본계 공급사의 해외 서비스 안내로 지역별 설치를 추정하지 않는다.'),
('013','パーキングシステムメンテナンス：大型保全','https://www.mhi.com/jp/business/products-services/mobility/parking-system-equipment/parking-system-support/renewal','미쓰비시중공업',None,'遠隔監視システム·安全対策','설비 상태 감시·이상 자동통보·경년 열화정보 파악을 설명한다.','공급사 기능 설명이며 AI 예지보전 또는 특정 고객 설치·검증 실적으로 승격하지 않는다.'),
('014','機械式立体駐車場の安全対策','https://www.mlit.go.jp/toshi/toshi_gairo_tk_000038.html','일본 국토교통성',None,'안전대책 검토·가이드라인 수립 및 개정','제조자·설치자·관리자·이용자의 안전대책과 2014년 가이드라인 개정을 소개한다.','과거 정책 자료다. 현행 일본 의무 또는 한국 적용 법령의 근거가 아니다. AI 도입사례도 아니다.'),
('015','철도안전관리체계 소개','https://main.kotsa.or.kr/portal/contents.do?menuCode=02040101','한국교통안전공단',None,'제도 소개·검사 방법','TS가 운영기관의 안전관리체계를 검사하고 서류·현장 확인을 수행한다고 설명한다.','안내에 열거된 기관명·개수는 개편될 수 있어 최신 모집단으로 사용하지 않음. 자동 승인 또는 AI 도입 근거는 없다.'),
('016','코레일, 열차 운행과 시설물 점검 동시에…AI로 꼼꼼','https://info.korail.com/info/selectBbsNttView.do?bbsNo=199&key=911&nttNo=25238','한국철도공사','2025-08-17','자동검측 운영 현황·확대 계획·까치집 탐지','운행 열차 자동검측의 운영, 설비 확대 및 AI 통합 분석 고도화 계획을 발표한다. 2025년 상반기 까치집 약 180건 탐지·제거를 보고했다.','운영기관 발표 수치이며 독립 대조평가가 아니다. 4대에서 7대 확대·2030년 계획을 현재 완료로 취급하지 않는다.'),
('017','Using artificial intelligence to create a better railway','https://www.networkrail.co.uk/stories/using-artificial-intelligence-to-create-a-better-railway/','영국 Network Rail','2023-12-22','Smart tech·A more reliable railway','Insight에서 검측·영상·원격상태 자료를 결합해 유지보수 우선순위와 고장 예측을 지원한다고 설명한다.','운영기관 사용 설명은 있으나 독립 효과평가·한국 적용 가능성 미확인. 발표된 사전 경고 기간을 보장 성능으로 쓰지 않는다.'),
('018','위험물질운송안전관리 시스템 접속','https://hmts.kotsa.or.kr/','한국교통안전공단',None,'직접 열람 실패','TS 공식 홈페이지의 관련 시스템 링크에서 존재를 확인했으나 해당 서비스 본문 열람은 실패했다.','서비스 상세·현행 가동·이용자 권한은 미확인. 실패를 운영 중단으로 판단하지 않는다.'),
('019','위험물 운송차량 실시간 관리체계 관련 정책자료','https://www.codil.or.kr/filebank/original/EC/OTKCEC211033/OTKCEC211033.pdf','CODIL 수록 정책자료·원 발행자 추가 확인',None,'위험물 운송차량 실시간 관리체계 항목','검색에서 국토부·TS의 차량관제·사고 전파 관련 과제를 찾았다.','웹 본문 열람 실패. 원문 취득·표지 확인 전에는 정책 시행·실제 도입의 핵심 근거로 사용하지 않는다.'),
('020','AskRail for Rapid Access to Rail Car Hazmat Information','https://www.usfa.fema.gov/blog/askrail-for-rapid-access-to-rail-car-hazmat-info/','미국 소방청 USFA','2023-07-27','What you should know about AskRail','위험물 철도차량 정보를 대응요원이 조회하는 서비스이며 철도회사의 자격 승인 후 접근하고 일반 공개를 제한한다.','최종 검토일 2026-05-01. 철도 사례를 한국 도로운송에 직접 전용할 수 없으며 AI 사용·사고 감소 효과는 미확인.'),
('021','Safety Advisory Notice for Railroad Emergency Preparedness','https://www.phmsa.dot.gov/sites/phmsa.dot.gov/files/2023-03/PHMSA%20Safety%20Advisory%20-%20Railroad%20Emergency%20Preparedness.pdf','미국 PHMSA','2023-03-03','PDF 3쪽 AskRail, 5쪽 발행일','East Palestine 사고 대응 때 일부 요원이 AskRail에 접근하지 못했을 가능성을 우려하며 접근성·가용성 점검과 교육을 권고했다.','사고원인 확정 또는 AskRail 효과 부정의 통계가 아니다. 가이던스 자체는 법률 효력을 갖는다고 명시하지 않는다.'),
('022','초경량비행장치 기체신고','https://main.kotsa.or.kr/portal/contents.do?menuCode=02020100','한국교통안전공단',None,'신고 소개·공식 신청 채널·대상','기체·소유자 신고와 변경·말소 상황을 안내하고 드론원스톱 등 공식 경로를 연결한다.','개별 신고 면제·기준 판단은 현행 법령 재대조 필요. 비행 승인과 기체 신고는 다른 절차다.'),
('023','드론원스톱 민원서비스','https://drone.onestop.go.kr/','국토교통부 드론원스톱',None,'공개 초기 화면·민원 서비스 메뉴','공식 드론 민원서비스 채널의 공개 화면과 안내 메뉴를 확인했다.','로그인·민원 제출·승인 처리는 실행하지 않았다. 기존 채널 존재만으로 만족도·오류율을 알 수 없다.'),
('024','B4UFLY','https://www.faa.gov/uas/getting_started/b4ufly','미국 FAA','2026-08-25','기능 소개·공급사 목록','FAA가 승인한 서비스 제공자를 통해 비행구역·제한정보를 확인하는 도구를 소개한다.','본문 제공자 수와 표 행 수가 일치하지 않아 숫자는 채택하지 않았다. 상황 인지 도구와 승인 권한을 구별한다.'),
('025','UAS Data Exchange (LAANC)','https://www.faa.gov/uas/getting_started/laanc','미국 FAA','2026-08-25','How does it work?','공역 데이터와 FAA 승인 공급사를 연결하여 공역 승인 신청·확인을 자동화한다. 공역 승인이 다른 운항 조건의 면제를 뜻하지 않는다고 명시한다.','자동화는 곧 생성형 AI가 아니다. 미국 협약·권한 모델을 TS에 그대로 적용할 수 없다.'),
('026','Global status report on road safety 2023','https://www.who.int/teams/social-determinants-of-health/safety-and-mobility/global-status-report-on-road-safety-2023','WHO','2023-12-13','보고서 소개·2010~2021 비교 범위','전 세계 도로 사망의 연간 추정치를 119만 명으로 설명하는 2023년 보고서이며 2021년을 포함하는 비교 기간을 명시한다.','2026년 실측치나 한국 사업용차 피해 규모로 전용하지 않는다.'),
('027','경찰통계자료: 교통사고 현황','https://www.police.go.kr/www/open/publice/publice0204.jsp','경찰청',None,'교통사고 현황 2024·2025년 열, 보호구역 통계 주석','표에 전체 교통사고 사망자는 2024년 2,521명, 2025년 2,549명으로 제시돼 있다. 보호구역 통계에는 2025년 확인 시스템 변경 주석이 있다.','웹 검색 본문에서 표·주석 확인, 직접 재열람 일부 실패. 사업용차·전세버스·드론 통계가 아니다. 수집본과 표를 대조해 사용한다.'),
('028','교통약자 이동지원 강화로 교통환경이 개선되고 있습니다','https://eiec.kdi.re.kr/policy/materialView.do?num=273885&pg=&pp=20&topic=C','국토교통부·KDI 경제교육정보센터 재게시','2025-11-26','본문 조사 결과 요약','2024년 말 교통약자 1,613만 명·31.5%, 9개 도 지역 이동편의시설 조사 결과를 설명한다.','전국 인구 추정과 도 지역 시설조사 표본을 구별. 첨부 PDF는 웹 열람 실패, 재게시 요약 확인 수준. 구매시장 규모가 아니다.'),
('029','The findings of our first generative AI experiment: GOV.UK Chat','https://insidegovuk.blog.gov.uk/2024/01/18/the-findings-of-our-first-generative-ai-experiment-gov-uk-chat/','영국 GDS','2024-01-18','Our early findings','초기 실험에서 유용성 반응과 함께 정확도 부족·환각·정부 브랜드에 따른 과신 문제를 보고했다.','초기 버전 결과이며 2026년 개선 결과와 같은 시점의 성능으로 비교하지 않는다.'),
('030','5 things we learned testing GOV.UK Chat','https://insidegovuk.blog.gov.uk/2026/03/16/5-things-we-learned-testing-gov-uk-chat-an-ai-assistant-for-government/','영국 GDS','2026-03-16','1~5절·정확도 및 응답 한계','두 차례 공개 실험 후 정확도 90%, 유용성 73%, 만족도 64%를 자체 보고하고 오류 가능성과 근거 확인 기능을 설명했다.','지표별 평가 집단·정의가 다르며 무오류 또는 TS 성능 목표가 아니다. 자체 평가이지 독립 성과 검증은 아니다.'),
('031','Developing GOV.UK Chat: Our data science and AI engineering journey','https://insidegovuk.blog.gov.uk/2026/05/15/developing-gov-uk-chat-our-data-science-and-ai-engineering-journey/','영국 GDS / Alessia Tosi·Nick Lange','2026-05-15','Evaluation-driven development·Ingestion·Retrieval','공식 콘텐츠의 메타데이터·최신성·계층구조를 활용하는 RAG와 자동·사람 검토 평가의 결합을 설명한다.','2026-06-02 편집 보완 표기. 특정 공급사·모델을 TS 권고안으로 채택하는 근거로 쓰지 않는다.'),
('032','AI RMF Core','https://airc.nist.gov/airmf-resources/airmf/5-sec-core/','미국 NIST','2023','5절 Govern·Map·Measure·Manage','역할·맥락·평가·운영을 연속적으로 관리하는 AI RMF 1.0의 네 기능을 설명한다.','페이지에 개정 진행 중 표시. 자발적 참고 체계이며 한국 법적 의무·인증을 대체하지 않는다.'),
('033','TS 공식 홈페이지: 관련 시스템','https://main.kotsa.or.kr/main.do','한국교통안전공단',None,'관련시스템 메뉴','위험물질운송안전관리 등 공식 관련 서비스로 연결하는 메뉴를 확인했다.','링크 존재는 로그인 이후 기능·현재 가동·효과 검증이 아니다.')
]

def main():
    dest=ROOT/'04_출처아카이브/출처원장.json'
    if dest.exists():
        raise SystemExit('기존 출처원장이 존재합니다. 신규 근거는 원장에 명시적으로 추가하세요.')
    sources=[]
    for no,title,url,publisher,published,locator,finding,limit in ROWS:
        sources.append(dict(id='DRS-'+no,title=title,url=url,publisher=publisher,published_at=published,accessed_at='2026-09-09',locator=locator,finding=finding,limitations=limit,source_type='공급사 1차 설명' if no in ['012','013'] else '공식 기관 자료',web_review_status='열람 실패' if no in ['018','019'] else '검색 본문 확인·직접 열람 일부 실패' if no=='027' else '공식 페이지 관련 본문 검토',claim_verified=no not in ['018','019'],archived_path=None,sha256=None,archive_status='미수집',reuse_note='내부 근거 확인용. 원문 저작권·재배포 조건은 별도 확인하며 외부 공개하지 않음.'))
    dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_text(json.dumps({'schema_version':'1.0','as_of':'2026-09-09','sources':sources},ensure_ascii=False,indent=2),encoding='utf-8')
    print(f'출처 {len(sources)}개 등록')

if __name__=='__main__': main()
