from pathlib import Path
from html import escape
import json, re

B = Path(__file__).resolve().parent
P = B.parent
B.mkdir(parents=True, exist_ok=True)
book = json.loads((P/'주요사업_확인원장.json').read_text(encoding='utf-8'))
official = {x['id']:x for x in book['items']+book['additional_sources']}
DATE = '2026-09-11'
VERSION = '1.1'
TITLE = 'CCK NOA 기반 KoROAD 서비스 확장안'
STEM = 'CCK_NOA_KoROAD_서비스확장안'
catalog = 'G:/내 드라이브/1. 업무영역/6. CCK/#. 회사정보/01. 아카이브/(AX-CHATGPT)/01_TECH_ASSETS/00_TECH_CATALOG.md'
oda = 'G:/내 드라이브/1. 업무영역/6. CCK/#. 회사정보/01. 아카이브/(AX-CHATGPT)/03_RND_PROPOSALS/02_해외ODA_및_글로벌사업.md'
sources = [
 {'id':'CCK01','title':'NOA 공식 제품 소개','url':'https://www.ccksolution.com/noa','type':'공급사 공식 설명','version':'게시·제품 버전 미표기','read':'2026-09-11','finding':'문서 이해·지식 연결·작업 수행·통제, 자체 LLM 폐쇄망, 승인·이력 기능 소개','limit':'설치 버전·모듈 구성·실행 성능을 검증한 것은 아님'},
 {'id':'CCK02','title':'Accio 공식 제품 소개','url':'https://www.ccksolution.com/accio','type':'공급사 공식 설명','version':'게시·제품 버전 미표기','read':DATE,'finding':'DSD 문서 버전 비교·참조 대조·보고서 검토','limit':'DSD 기능의 HWP·교통 문서 이식은 별도 개발 검토'},
 {'id':'CCK03','title':'Audin AI 공식 제품 소개','url':'https://www.ccksolution.com/audin-ai','type':'공급사 공식 설명','version':'게시·제품 버전 미표기','read':DATE,'finding':'업무 목표의 단계화·데이터 근거 연결·실행 흐름','limit':'재무 도메인 자동화와 교통안전 판단은 서로 다른 기능'},
 {'id':'CCK04','title':'Grantee 공식 제품 소개','url':'https://www.ccksolution.com/grantee','type':'공급사 공식 설명','version':'게시·제품 버전 미표기','read':DATE,'finding':'규정과 증빙 연결, 규칙·LLM 결합, 소명·사람 검토','limit':'정산 도메인 규칙은 교통 분야 규칙으로 교체해야 함'},
 {'id':'CCK05','title':'CCK 보유기술 대장','path':catalog,'type':'내부 파생 기술대장','version':'26.09 / updated 2026-09-05 / draft-v1','read':DATE,'finding':'TA-01~05·07·20·23의 재사용 후보와 부족분','limit':'원 코드·운영 성적서 미검증. 작성자의 CONFIRMED·TRL을 본 조사 판정으로 사용하지 않음'},
 {'id':'CCK06','title':'해외 ODA·글로벌 사업 §1.9.3','path':oda,'type':'내부 파생 제안자료','version':'문서 본문의 해당 절 / 확인일 기준','read':DATE,'finding':'NOA 통제 계층과 ABaaS 연계 계층이라는 제안 구조','limit':'우즈베키스탄 사전 제안의 요약이며 NOA 전체 기능·KoROAD 구축 사실을 뜻하지 않음'}
]

services = [
 dict(id='N01', title='면허·교육 신청 완료 지원', track='연계 조건부', group='운전면허·교통교육', refs=['KB13','KB23','KB24','KB25'],
 why='고령자·교통약자가 자신의 조건에 맞는 준비와 신청 절차를 이해하고, 담당 창구에 같은 내용을 반복 설명하는 부담을 줄인다.',
 scene='설명용 가상 장면: 이용자가 “지원센터에 가려는데 무엇을 준비하고 어느 순서로 해야 하느냐”고 묻는다. 확인된 조건과 미확인 조건을 구분한 준비목록·상담카드를 만든다.',
 input='본인이 제공한 최소 조건, 승인된 지원·면허·교육 안내, 해당 센터 정보. 민감한 증명서 원문은 초기 탐색에 요구하지 않는다.',
 output='개인별 준비목록, 확인 질문, 상담 인계 카드. 조회 API가 있으면 가용 일정, 접수 API와 사용자 확인이 있으면 접수 결과까지 연결한다.',
 reuse='NOA의 작업 공간·지식 연결·승인 흐름을 활용하는 설계. RAG·Keeper·Nexus 및 인증 계층은 설치 구성과 재사용 권한 확인 후 배정한다.',
 change='면허·교육별 조건표, 접근성 UI, 인증·동의, 센터·일정 조회 어댑터, 접수 상태와 재시도 처리. 대국민 접점은 NOA 직원 화면과 별도 설계한다.',
 roles='LLM은 조건을 정리하고 모호한 내용을 질문한다. 자격·기한은 승인된 규칙, 빈자리·접수는 공식 시스템, 상담·최종 판단은 담당자가 맡는다.',
 duplicate='통합민원·고령운전자 컨설팅·디딤돌 원스톱서비스가 이미 있다. 새 가치는 기존 절차 사이의 조건 유지와 실제 인계·완료 여부이며, 현재 화면에서 부족한지 확인해야 한다.',
 minimum='단일 지원센터 업무의 상담 준비·인계 도우미. API 미확보 시 제공 범위를 “준비 지원”으로 축소하고 예약·접수 완료를 약속하지 않는다.',
 failure='조회 실패 시 조회 불가 표시, 입력 조건 보존, 담당 창구로 전환. 접수 식별자와 공식 응답 없이 완료 표시 금지.',
 benefit='준비 누락으로 인한 재방문, 조건 재입력, 도움 없이 준비를 마친 비율을 현행 안내·단계형 폼과 비교한다.',
 gate='센터의 실제 실패 사례, 안내 승인자, 인증·일정·접수 인터페이스와 기존 망의 대국민 접속 경로 확보. 운전능력·의학적 적합성 판정 제외.',
 verify='대상 조건이 불명확하면 확인 질문을 한다. 만료된 일정과 타인의 접수 상태를 표시하지 않는다. 접수 실패·중복 요청·이탈 후 재진입을 검증한다.'),
 dict(id='N02', title='시험검사 신청 사전점검', track='작게 시작', group='교통안전·시험검사', refs=['KB07','KB08','KB09','KB10','KB11'],
 why='제조·설치 사업자가 시험검사 신청자료의 누락과 서로 다른 표기를 접수 전에 발견해 보완 왕복을 줄인다.',
 scene='설명용 가상 장면: 신청서와 설명서에 적힌 모델명이 다르다. 해당 위치를 나란히 보여주고 어떤 자료를 고쳐야 하는지 질문한다. 필수서류 여부는 승인된 기준표로 확인한다.',
 input='텍스트 전자 신청서·제품설명서·기존 성적서, 신청 유형, 담당자가 확정한 제출 체크리스트와 기준 버전.',
 output='누락·표기 불일치 목록, 기준과 원문 위치, 보완 요청 초안, 검토자 수정 이력. 시험 합격·성적서 진위 판정은 출력하지 않는다.',
 reuse='NOA 업무 공간 위에 Grantee의 규정–증빙 대응 방식과 Accio의 비교·참조 검토 방식을 응용한다. Argus 실행 단계와 결과 보존은 재사용 후보다.',
 change='검사 유형별 문서 스키마·검증 규칙·용어, 텍스트 추출 품질 확인, 증빙 비교 화면, 보완 문서 양식. 회계 DSD 파서를 범용 HWP 파서로 간주하지 않는다.',
 roles='LLM은 서술 항목의 대응 후보와 보완 설명을 만든다. 모델명·일자·문서 유무는 규칙·코드, 필수성·적합성·시험 결과 확정은 권한 있는 담당자가 맡는다.',
 duplicate='통합 시험검사 지원 체계의 추진 방향이 공개돼 있다. 기존 접수시스템의 체크리스트·전자신청과 중복 여부를 먼저 대조한다.',
 minimum='신청 유형 1종 + 텍스트 서류 묶음 + 검토·보완목록 출력. 공식 접수시스템을 바꾸지 않고 담당자 검토 화면에서 시작하는 제안이다.',
 failure='스캔만 있는 파일은 판독 가능하다고 처리하지 않는다. 지원 형식·텍스트 원본을 요청하고 해당 항목을 미검토로 남긴다.',
 benefit='신청 건당 보완 왕복, 필수자료 누락, 잘못된 보완 요구, 신청자의 준비 완료까지 걸린 시간을 체크리스트만 제공한 경우와 비교한다.',
 gate='실제 보완 사례와 권한 있는 기준 소유자, 텍스트 자료, 통합시험검사 사업의 비중복 범위 확보.',
 verify='이미 제출한 자료를 누락으로 오인하는 사례, 모델명 유사어, 구·신 기준 혼재, 빈 파일·손상 파일을 포함해 원문과 지적의 일치를 검토한다.'),
 dict(id='N03', title='안전개선 조치·증빙 검토', track='같은 구조 확장', group='교통안전·안전운전인증', refs=['KB02','KB04','KB05','KB06','KB17','KC07'],
 why='주민과 운전자가 겪는 위험을 줄이기 위해, 전문가의 개선 권고가 어떤 조치로 이행됐고 무엇이 남았는지 확인하도록 돕는다.',
 scene='설명용 가상 장면: 한 권고에 시설 정비와 교육 실시가 함께 포함돼 있는데 조치보고에는 교육만 적혀 있다. 두 항목을 분리해 시설 조치의 확인 근거가 없는지 검토자에게 제시한다.',
 input='전문가가 확정한 개선 권고, 기관이 제출한 텍스트 조치보고, 조치대장, 담당자·일정·공식 상태. 현장 사진과 센서 원자료는 판단 입력으로 삼지 않는다.',
 output='권고 항목별 조치·근거 대응표, 미확인·부분 대응 항목, 확인 질문, 담당자 검토와 후속 확인 이력.',
 reuse='NOA의 업무 연결·승인·감사 기능과 Audin/Grantee의 근거 대응·검토 패턴을 응용한다. Argus·Keeper의 작업 분해·결과 저장은 확인 후 활용한다.',
 change='권고–조치–증거–검토 상태 모델, 복수 권고 분해, 부분 이행 표현, 증거 재사용 경고, 기관별 보완 회신 양식과 읽기 연계.',
 roles='LLM은 서술상 대응·누락 후보를 제시한다. 기한·상태는 업무 로직, 현장 확인과 개선 완료·안전 판단은 공단 및 권한 있는 기관이 맡는다.',
 duplicate='KoROAD는 이미 조치보고 제출과 합동점검 절차를 공개했다. TEMS·인증 사후관리도 존재한다. 신규 후보는 절차 신설이 아니라 서술 증거 대조의 미해결 부분이다.',
 minimum='하나의 개선사업에서 확정 권고와 비식별 조치보고를 비교하는 검토 도구. 기존 업무대장이 가진 확정 상태를 덮어쓰지 않는다.',
 failure='“교육했다”는 진술을 사고 위험 해소 증거로 확대하지 않는다. 부족·상충 근거는 보류하고 현장 확인이 필요한 항목을 남긴다.',
 benefit='누락 조치의 발견과 확인까지 시간, 잘못된 미이행 지적, 근거 없이 완료 처리될 뻔한 사례를 평가한다. 사고 감소는 별도의 장기 평가 대상이다.',
 gate='기존 사후관리 기능과의 차이, 조치 증거의 판정 기준, 관계기관 자료 접근권 및 현장 검토 책임 확보.',
 verify='부분 조치·다른 장소 증거·같은 증거의 중복 연결·기준 변경·상충 회신을 구분한다. 사람이 반려·수정한 결과가 최종 이력에 남아야 한다.'),
 dict(id='N04', title='기준 개정의 업무 반영 관리', track='같은 구조 확장', group='연구·교통안전·교육', refs=['KB02','KB09','KB14','KB29','KC26'],
 why='개정 전 기준이 안내·신청·시험·교육에 남아 사업자와 이용자가 서로 다른 안내를 받는 문제를 줄인다.',
 scene='설명용 가상 장면: 표준규격의 한 조항이 바뀌면 그 조항을 인용한 신청 안내·검토표·교육자료를 찾아 수정 후보를 만들고, 담당자가 실제 반영 여부를 확인한다.',
 input='승인된 구·신 기준의 텍스트, 시행일·적용 경과 규칙, 관리 대상 안내문·체크리스트·교육자료와 문서 담당자.',
 output='변경 조항–영향 문서–수정 후보–승인–반영 확인을 연결한 표. 개정 요약을 넘어 후속 확인 대상을 남긴다.',
 reuse='NOA 지식·업무·승인 기능, Accio의 변경 비교 패턴, RAG 계층을 응용한다. 새 규정 해석을 자동으로 배포하는 제품으로 설명하지 않는다.',
 change='문서·조항 식별자와 버전·시점 관리, 인용·의미 연결, 경과 규칙, 영향 확인 목록, 게시·업무시스템 어댑터. 시간 인식 지식그래프는 기보유 완성 기능으로 간주하지 않는다.',
 roles='텍스트 차이와 시행일 비교는 코드·규칙, 의미상 영향과 수정 초안은 LLM, 기준 해석·게시 승인·적용 결정은 담당자가 맡는다.',
 duplicate='KoROAD의 기준·규격 제개정 업무와 자료 배포가 이미 있다. 검색·공지 기능과 실제 영향 확인 기능을 구별하고 기존 AI·데이터 사업 범위를 확인한다.',
 minimum='하나의 기준집과 연결된 문서 집합에서 변경 영향 목록과 반영 확인표를 제공한다. 전 기관 법령망 구축을 전제하지 않는다.',
 failure='시행일 불명·원문 부재·개정 취소·경과조치 상충은 적용을 보류한다. 후보 문서를 찾지 못해도 영향 없음으로 단정하지 않는다.',
 benefit='구기준 잔존 발견, 잘못된 영향 제안, 반영 확인 누락, 상충 안내에 따른 재문의와 재작업을 단순 diff·문서검색과 비교한다.',
 gate='개정 원문과 유효시점의 권위 있는 출처, 관리 문서 목록, 게시 책임, 실제 안내 오류 사례 확보.',
 verify='삭제·이동·번호 변경·의미 변경을 구별한다. 승인 이후 원문이나 대상 문서가 바뀌면 이전 승인을 그대로 재사용하지 않는다.'),
 dict(id='N05', title='상황별 안전교육과 이해 확인', track='연계 조건부', group='교통교육·운전면허', refs=['KB13','KB14','KB15','KB16','KB17','KB23','KC09'],
 why='학습자가 안전수칙을 자신의 말로 설명하고 실제 상황에서 적용하는 연습을 하도록 돕는다.',
 scene='설명용 가상 장면: 정지 상태에서 교육을 받는 학습자에게 승인된 상황문제를 제시한다. 응답에서 이해가 부족한 부분을 찾아 교재 근거와 함께 다시 설명한다.',
 input='승인된 교재·텍스트 사례·학습 목표·질문과 응답. 초기에는 개인의 사고·처분 이력을 연계하지 않는다.',
 output='상황별 문답, 이해 확인과 재설명, 강사 검토용 오개념 목록. 공식 이수·시험 점수와 분리한 보충학습 기록.',
 reuse='NOA의 근거 검색·대화 맥락·결과 축적을 교육 업무에 응용한다. 적응형 튜터·학습관리 기능 자체는 신규 응용개발이다.',
 change='승인 사례은행, 연령·문해력에 맞는 UI, 설명 평가 기준, 잘못된 안전설명 차단, 필요시 LMS 연계와 강사 검토.',
 roles='LLM은 자유서술 응답의 이해를 돕고 질문을 조정한다. 정답 기준·교육내용은 전문가, 이수·자격은 기존 공식 시스템이 맡는다.',
 duplicate='온라인 교육·마이크로러닝·인증 사후교육이 이미 있다. 동영상이나 퀴즈 추가로 끝나면 신규 AI 가치가 약하다.',
 minimum='하나의 교육 과정에서 승인된 텍스트 사례를 이용하는 보충학습. 휴대전화 사용을 유발하는 주행 중 상호작용은 설계하지 않는다.',
 failure='위험한 행동을 긍정하거나 교재 밖의 법적 해석을 확정하지 않는다. 불명확한 답은 강사 확인으로 넘긴다.',
 benefit='설명의 이해와 상황 적용, 오개념 잔존, 학습 포기율을 동일 내용의 정적 교재·규칙형 퀴즈와 비교한다. 사고 감소 효과를 단정하지 않는다.',
 gate='실제 학습 난점, 교육 전문가·콘텐츠 권리, LMS 중복·연계, 고령자·장애인 사용성 확인.',
 verify='정답 표현의 다양성, 위험한 질문, 교재 밖 질문, 큰 글씨·키보드·명확한 재설명 흐름을 확인한다.'),
 dict(id='N06', title='TBN 교통·재난 원고 확인과 정정', track='연계 조건부', group='교통방송', refs=['KB18','KB19','KB20','KB28'],
 why='청취자가 교통·재난 상황에 맞는 최신 정보를 받도록, 확인된 사실과 방송 원고의 차이 및 정정 필요를 편집자가 찾게 한다.',
 scene='설명용 가상 장면: 공식 정보의 통제 상태가 변경되면 이전 원고의 어느 문장이 영향을 받는지 표시하고 편집자가 정정 원고를 확인한다.',
 input='기관이 확인한 텍스트 돌발정보, 출처·기준시각·지역, 승인된 안내 문구, 원고 버전. 원시 제보의 사실 판정은 선행 업무다.',
 output='근거가 연결된 원고 초안, 지역·시간·통제 상태 대조, 정보 변경에 따른 정정 후보와 승인 이력.',
 reuse='NOA 문서 생성·정책·승인, Accio 변경 비교 방식과 지식 연결 구조를 응용한다.',
 change='확인정보 수신 어댑터, 시각·지역·사건 식별 규칙, 원고 양식, 유효시간과 정정 연결, 편집자 작업 화면.',
 roles='LLM은 원고와 설명을 작성한다. 유효시각·중복·상태는 코드, 사실 확인·편집·방송 결정은 TBN 담당자가 맡는다.',
 duplicate='기존 제보·편성·방송 시스템과 2026년 재난·재해 돌발정보관리 연구의 범위를 확인해야 한다.',
 minimum='확인된 텍스트 사건 한 유형의 편집 보조. 자동 송출, STT·TTS, 독자 경보 발령은 범위 밖이다.',
 failure='업데이트 지연·상충·출처 불명은 최신 사실처럼 표현하지 않는다. 급한 상황의 기존 수동 방송 흐름을 가로막지 않는다.',
 benefit='원고와 출처의 불일치, 오래된 문구 잔존, 정정 누락과 편집자 확인 시간을 템플릿 방식과 비교한다.',
 gate='확인정보 공급 주체·유효시각 정책·편집 승인권·기존 연구와의 비중복 확보.',
 verify='동명 지역·중복 사건·통제 해제·정정 철회·정보 수신 실패에서 승인 상태와 원고 유효성을 확인한다.'),
 dict(id='N07', title='TAAS 통계의 근거 있는 질의·설명', track='연계 조건부', group='교통AI디지털·정책지원', refs=['KB05','KB27','KB28','KB29','KB35'],
 why='지역 담당자가 통계의 지역·기간·단위를 잘못 해석해 안전사업의 대상을 선정하는 오류를 줄인다.',
 scene='설명용 가상 장면: 사용자가 특정 지역의 보행사고 현황을 물으면 사고건수와 사상자수 중 무엇을 원하는지 확인하고, 승인된 조회 결과와 집계 조건을 함께 보여준다.',
 input='이용 허가된 TAAS 통계·메타데이터 또는 승인된 조회 API, 사용자가 지정한 지역·기간·지표.',
 output='조건 확인, 원천 조회 표, 집계 정의·출처·시점, 설명 초안과 재조회 조건. 수치를 LLM이 계산하거나 지어내지 않는다.',
 reuse='NOA 작업·근거 연결과 RAG를 활용하는 설계. 통계 커넥터와 질의 스키마는 추가 개발이며 NL2SQL을 기보유 자산으로 내세우지 않는다.',
 change='허용 질의 목록·파라미터 스키마·API 어댑터, 통계 단위 검증, 출처 표시, 다운로드·재조회 UI.',
 roles='LLM은 질의를 허용 파라미터로 정리하고 결과를 설명한다. 조회·계산은 API와 코드, 정책 우선순위와 안전대책은 담당자가 결정한다.',
 duplicate='TAAS는 통계·GIS·사고다발지 분석·OpenAPI를 이미 제공한다. 현재 검색만으로 해결되는 수요라면 AI 사업으로 확대하지 않는다.',
 minimum='소수의 승인된 통계 질의 또는 기존 집계표를 설명하는 업무 화면. 임의 SQL·원시 개인정보 결합은 포함하지 않는다.',
 failure='조회 실패·미공표 기간·작은 표본·집계 정의 차이는 명시한다. 사고건수 증가를 개인의 위험성이나 정책 인과효과로 바꾸지 않는다.',
 benefit='정확한 통계 선택·단위 해석·근거 확인 성공과 추가 질의 부담을 기존 TAAS 탐색·가이드 방식과 비교한다.',
 gate='현행 API 제공 범위·이용권·망 경로·메타데이터와 실제 해석 실패 사례 확보.',
 verify='단위·분모·기간·지역 경계·결측·오류 응답을 검증한다. 응답의 모든 수치는 조회 결과 또는 명시된 코드 계산으로 역추적돼야 한다.')
]

mapping = [
('KB01',[],'사업 묶음의 배경'),('KB02',['N03','N04'],'기술지원 문서·조치 검토; 공학 설계 제외'),('KB03',['N04'],'승인 기준·이력만; 신호제어·최적화 제외'),('KB04',['N03'],'확정 정비기록 검토; TEMS 중복 확인'),('KB05',['N03','N07'],'전문가 대책의 조치·통계 근거'),('KB06',['N03'],'권고·조치 검토; 사고원인·과실 판정 제외'),('KB07',['N02'],'공인검사 신청자료'),('KB08',['N02'],'시험·교정 신청자료'),('KB09',['N02','N04'],'기능검사 서류와 적용 기준'),('KB10',['N02'],'신청 서류만; 검지 성능시험 제외'),('KB11',['N02'],'통합시험검사 지원 사업 중복 확인'),('KB12',['N05'],'교육 사업 묶음의 배경'),('KB13',['N01','N05'],'교육 준비·이해 확인'),('KB14',['N04','N05'],'전문교육 자료와 기준'),('KB15',['N05'],'대상별 이해 확인'),('KB16',['N05'],'보수교육 지원; 자격부여·채점 제외'),('KB17',['N03','N05'],'인증 증빙·보충교육; 기존 사후관리 중복 확인'),('KB18',['N06'],'확인된 정보의 원고 검토'),('KB19',['N06'],'지역 배포 범위 참고'),('KB20',['N06'],'편성·편집 연계 참고'),('KB21',[],'청취율 참고; 사고감소 근거 아님'),('KB22',['N01'],'면허업무 범위 참고'),('KB23',['N01','N05'],'응시 준비·보충학습'),('KB24',['N01'],'갱신·면허 행정 준비'),('KB25',['N01'],'디딤돌 지원 상담·인계'),('KB26',[],'업무량 참고; 불편 규모 근거 아님'),('KB27',['N07'],'정책·통계 근거 활용'),('KB28',['N04','N05','N06','N07'],'2026년 연구와의 중복·산출물 연계 확인'),('KB29',['N04','N07'],'기준 개정·공개 연구 결과'),('KB30',[],'국제협력 배경; 독립 신규 후보로 집계하지 않음'),('KB31',[],'기관 경계 확인'),('KB32',[],'지식재산권 참고; 사용권 확보 의미 아님'),('KB33',[],'기존 AI·데이터 플랫폼과 연계·중복 검토 공통 조건'),('KB34',[],'가명정보 권한·결합은 별도; 신규 후보 선정 보류'),('KB35',['N07'],'TAAS 조회·설명'),('KB36',[],'보안·개인정보 운영 공통 조건')]

# 사용자 제안의 사업 구조를 구체화한 분류다. 제품 출시·기관 승인 상태가 아니다.
axes = {
 'A': {'title':'범용 공공업무·국민서비스','members':['N01','N02','N04'],'goal':'국민의 신청부터 담당자의 검토·처리와 결과 확인까지 이어지는 행정 편의'},
 'B': {'title':'교통안전 특화 서비스','members':['N03','N05','N06','N07'],'goal':'안전수칙 이해·개선조치 확인·안전정보 전달·대책 근거 해석 지원'}
}
for service in services:
    service['primary_axis'] = next(key for key,value in axes.items() if service['id'] in value['members'])
    service['axis_title'] = axes[service['primary_axis']]['title']
    service['cross_axis_note'] = {'N02':'신청 단계는 A, 실제 시험·안전판정은 담당 기관의 별도 전문업무다.', 'N04':'개정 반영 관리 기능은 A이며 안전 기준을 다루면 B에서도 같은 기능을 재사용한다.', 'N07':'KoROAD에서는 안전대책 근거 지원으로 B에 두고, 일반 통계 질의 기능은 A로 재사용 가능하다.'}.get(service['id'],'주요 사용자 성과에 따라 대표 축을 배정했다. 양쪽에 같은 기능을 중복 개발하지 않는다.')

md=[]; html=[]
def inline(s):
    s=escape(str(s))
    s=re.sub(r'\[([^\]]+)\]\(([^)]+)\)',lambda m:f'<a href="{m[2]}">{m[1]}</a>',s)
    s=re.sub(r'\*\*([^*]+)\*\*',r'<strong>\1</strong>',s)
    s=re.sub(r'`([^`]+)`',r'<code>\1</code>',s)
    return s
def head(n,title,id=None):
    md.append('#'*n+' '+title+'\n'); html.append(f'<h{n}'+(f' id="{id}"' if id else '')+f'>{escape(title)}</h{n}>')
def para(s,cls=''):
    md.append(s+'\n'); html.append(f'<p class="{cls}">{inline(s)}</p>')
def bullets(items):
    md.append('\n'.join('- '+x for x in items)+'\n'); html.append('<ul>'+''.join('<li>'+inline(x)+'</li>' for x in items)+'</ul>')
def table(headers,rows):
    md.append('| '+' | '.join(headers)+' |\n| '+' | '.join('---' for _ in headers)+' |\n'+'\n'.join('| '+' | '.join(str(v).replace('|','／') for v in row)+' |' for row in rows)+'\n')
    html.append('<div class="table-scroll" tabindex="0" role="region" aria-label="'+escape(' · '.join(headers[:2]))+' 표"><table><thead><tr>'+''.join('<th scope="col">'+inline(x)+'</th>' for x in headers)+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+inline(x)+'</td>' for x in row)+'</tr>' for row in rows)+'</tbody></table></div>')
def reflinks(refs):
    return ' · '.join(f'[{x} {official[x]["title"]}]({official[x]["url"]})' for x in refs)

head(1,TITLE)
para(DATE+' · v'+VERSION+' · ORG-0002 한국도로교통공단 · 사업기획 검토안','meta')
para('**추가 조사:** [3개 분기 병렬조사 결과](병렬조사_2026-09-11/00_NOA_병렬조사_통합보고서.html)에서 7개 후보의 근거·중복·수행 조건을 보강했다. 2026 교통AI플랫폼 구축계획을 확인했으므로 아래 제안은 기존 계약 범위와 대조한 뒤 구체화한다. [통합 MD](병렬조사_2026-09-11/00_NOA_병렬조사_통합보고서.md)','callout')
para('**기관이 데이터를 통제하는 NOA 기반 위에서, 국민과 담당자의 업무·행정처리를 쉽게 하고 교통안전 업무를 지원한다.** 사업 구조는 공통 기반 하나와 두 서비스축으로 묶는다.','lead')
para('**공통 기반: 로컬 LLM·데이터 주권을 위한 통제 / A축: 범용 공공업무·국민서비스 / B축: 교통안전 특화 서비스.** 사용자 제안을 구체화한 기획 구조이며, 아래 7개 후보는 두 축을 설명하는 적용 사례다.','callout')
head(2,'사업 구조: 공통 기반 + 두 서비스축','business-model')
para('데이터 주권은 두 축 모두에 필요한 공통 운영 원칙으로 둔다. 이 기획에서는 기관이 데이터의 저장 위치·이용 주체·외부 전송·보존과 이관, 모델과 업무 규칙의 운영을 통제하는 것으로 구체화한다. 로컬 LLM은 이를 지원하는 실행 방식이며 설치만으로 모든 통제가 구현되는 것은 아니다. 법적 소유권·독점권이나 규정 준수를 확정하는 표현으로 사용하지 않는다.')
axis_cards=[('A · 범용 공공업무·국민서비스','신청부터 처리·결과 확인까지','국민·사업자: 의도 전달 → 준비·입력 → 확인·동의 → 신청·보완 → 결과 확인','담당자: 접수 → 근거 확인 → 검토·보완 → 승인·처리 → 결과 인계','N01 신청 지원 · N02 사전점검 · N04 기준 반영'),('B · 교통안전 특화 서비스','안전수칙과 조치가 이어지도록','국민·현장: 수칙 이해 → 상황별 학습 → 필요한 행동·정보 확인','전문 담당자: 위험 관련 기록 → 조치·증빙 검토 → 확인·정정 → 후속 관리','N03 안전조치 · N05 교육 · N06 방송 · N07 통계 근거')]
html.append('<div class="axis-grid">')
for title,goal,citizen,staff,items in axis_cards:
    md.append('### '+title+'\n\n**'+goal+'**\n\n'+citizen+'\n\n'+staff+'\n\n'+items+'\n')
    html.append('<article class="axis-card"><h3>'+escape(title)+'</h3><p><strong>'+escape(goal)+'</strong></p><p>'+escape(citizen)+'</p><p>'+escape(staff)+'</p><p class="meta">'+escape(items)+'</p></article>')
html.append('</div>')
para('**두 축의 공통 기반 — NOA + 로컬 LLM + 승인된 지식·규칙 + 허용된 API + 권한·사람 검토·이력.** 기존 서버에서 실행하는 제안이며 새 인프라 투자비는 0원으로 유지한다. 실제 배포·사용권·성능은 확인 대상이다.','callout')
table(['공통으로 설계할 통제','이번 기획의 요구 방향'],[
('데이터 위치와 외부 전송','원문뿐 아니라 대화·검색용 데이터·출력·로그의 저장 위치와 외부 호출을 기관 정책에 맞게 통제한다. 임베딩·재순위화도 로컬 실행 여부를 확인한다.'),
('접근·실행 권한','국민 본인 자료와 담당자 업무 범위를 분리하고, 검색·API 실행 때도 권한을 검사한다. 업무 완료 여부는 공식 처리 결과로 확인한다.'),
('운영·이관 통제','모델·기준·지식의 버전, 승인·변경 기록, 데이터 내보내기·보존·삭제 절차와 운영 인수 조건을 정한다. 데이터 자체가 자동으로 모델 학습에 이용되도록 가정하지 않는다.')])
para('**A축의 범용성은 “신청·증빙·보완·승인·처리·결과 확인” 구조를 여러 기관에서 재사용하는 데 있다.** 기관마다 법령·자격 조건·서식·인증·연계 시스템을 바꿔 적용한다. 국민용 화면과 직원용 화면은 서로 다른 권한으로 같은 처리 흐름에 연결한다. 현재 검증된 범정부 서비스가 있다는 뜻은 아니다.')
para('**B축에서는 로컬 LLM이 텍스트와 공식 결과를 이해하고 조치를 돕는 역할**을 맡는다. 안전 판정·현장 확인·제어는 해당 전문가와 기존 시스템이 담당한다. 두 축의 차이는 사용하는 AI 모델보다 업무 규칙·책임·오류의 영향과 검수 기준에 있다.')
para('분류 경계: N02는 시험검사와 관련돼도 신청 부담을 줄이는 기능이므로 A에 둔다. N04는 범용 기준 반영 기능을 안전업무에도 재사용한다. N07은 안전대책 근거 지원을 주목적으로 B에 두되 질의·설명 구조를 다른 행정 통계로 확장할 수 있다. 대표 축으로 한 번만 집계하며 A 3개·B 4개는 현재 후보의 설명 분류다.')
para('사업 구성안은 **NOA 공통 기반 적용 + A축 범용 서비스 묶음 + B축 안전업무 묶음**이다. 공통 실행·권한·검토 기능은 한 번만 재사용·구축 범위에 반영하고, 업무마다 추가되는 규칙·화면·커넥터·검수 공수를 구별한다. 플랫폼 자체를 새 사업으로 중복 산정하지 않는다.')
para('작은 검증의 순서는 기존 제안인 **N02 신청 사전점검 → N03 안전조치 증빙·N04 기준 반영 → 연계 조건을 확보한 대국민 서비스**를 유지한다. 사업의 전체 방향은 두 축이고, N02는 그중 범위를 좁혀 시작하는 후보다. 순서는 수요·비중복·성능 검증 후 바꿀 수 있다.')
para('문제 재정의: KoROAD의 기존 업무에서 끊기는 준비·검토·후속 처리에 CCK 보유 솔루션을 어떻게 적용할 것인가. 독자는 CCK 사업기획·제품·구축 책임자이며, 성공 기준은 업무별 재사용·추가 개발·납품 경계를 설명하는 것이다. 작업은 M / 조사·기획·문서화 / Low로 분류하고, 근거 확인→기능 매핑→범위 검토→문서 QA의 순서로 수행했다. 실제 시스템 구축·배포·견적 확정은 이번 산출물이 아니다.')
head(2,'1. 적용 전제와 기관 경계','scope')
bullets(['사용자가 지정한 NOA 플랫폼 기반, 로컬 LLM, 신규 인프라 투자 0원을 적용한다. 새 GPU·서버·저장장치·클라우드 구매·임차를 사업 성립 조건으로 두지 않는다.',
'대상은 **KoROAD**다. TS의 서버·개인정보·구축물을 KoROAD에서 이용할 권한이나 KoROAD에 NOA가 설치돼 있다는 사실은 확인되지 않았다. KoROAD에서 적법하게 사용할 기존 자원 확인이 선행 조건이다.',
'제품의 기능 소개는 공급사 설명으로, 내부 기술대장은 파생 근거로 표시한다. 실제 배포 버전·납품 권리·로컬 동작·성능은 검증 전이다.',
'기존 사업과 겹치는 기능은 재사용하되 새 과업으로 중복 산정하지 않는다. TS 공통플랫폼·민원·전세버스 공시 사업을 KoROAD 신규 범위로 치환하지 않는다.',
'텍스트 전자문서·확정된 구조화 결과·허용 API만 입력한다. 비전·신규 OCR·음성 인식/합성·센서·제어·자동 안전판정을 핵심으로 삼지 않는다.',
'이전의 7억+5억은 TS 논의의 예산안이다. 이 문서는 KoROAD 예산으로 승계하지 않는다. 응용 개발·연계·검수·운영 전환 공수와 필요한 SW 이용권은 범위·권리를 확인한 뒤 산정한다.'])
head(2,'2. NOA와 보유 솔루션을 어떻게 쓰는가','assets')
para('NOA 공식 페이지는 폐쇄망 자체 LLM 업무 환경, 문서 처리, 지식 연결, 작업 수행, 정책·승인·감사 이력을 소개한다. [NOA 공식 소개](https://www.ccksolution.com/noa)')
table(['자산·확인 근거','재사용할 기능 방향','KoROAD에서 추가할 부분'],[
('NOA / 공급사 공식 소개','업무 공간, 근거 연결, 결과와 검토 이력','업무별 화면·상태·규칙·연계·권한'),
('Accio / 공급사 공식 소개','문서 버전 비교·참조 대조 패턴','교통 문서 형식·조항·용어; DSD 전용 기능의 이식 검토'),
('Grantee / 공급사 공식 소개','규정–증빙 대응, 규칙·LLM 역할 분리, 소명 검토','시험검사·조치 증빙의 체크리스트와 보완 규칙'),
('Audin AI / 공급사 공식 소개','작업 단계 구성과 원천 근거 연결 패턴','교통 업무용 실행 단계·출력·전문가 검토 기준'),
('Argus·Keeper·Nexus / 내부 대장 TA-01~03','계획·데이터 흐름, 작업 실행, 호출 관리의 재사용 후보','NOA 설치 구성과의 관계·로컬 endpoint·실패 복구 확인'),
('Mothership·RAG 계층 / 내부 대장 TA-05·20','조직·권한, 문서 검색의 재사용 후보','기관 SSO·문서/행 단위 권한·재사용 권리 검증'),
('Foundry·NL2SQL / 내부 대장 TA-07·23','기보유 확정 목록에서 제외','Foundry 상태 상충, NL2SQL은 계획 단계; 필요하면 별도 개발로 분리')])
para('Accio·Audin·Grantee는 각각 전문 도메인의 제품이다. 이를 통째로 교통 제품으로 옮기는 것이 아니라 **재사용 가능한 코드·검토 패턴을 확인하고, 교통 업무 플러그인을 개발하는 안**이다. [Accio](https://www.ccksolution.com/accio) · [Audin AI](https://www.ccksolution.com/audin-ai) · [Grantee](https://www.ccksolution.com/grantee)')
para('NOA의 공식 승인 기능 설명과 내부 대장의 “Keeper 중단·재개 근거 미확인”은 구분한다. NOA에 사람이 검토하는 기능을 소개한다는 사실만으로 특정 엔진의 중단·재개 API까지 구현됐다고 판단할 수 없다. **NOA–Argus–Keeper–Nexus–Mothership의 실제 탑재 관계도 아직 확인 전**이다.')
head(2,'3. 공통 기반은 한 번, 업무별 확장은 플러그인으로','architecture')
para('아래는 조사자의 적용 설계다. NOA 제품의 내부 구현도나 KoROAD 현행 구성도가 아니다.')
layers=[('이용자와 실무자의 목표','신청 준비 · 조치 확인 · 기준 반영 · 학습 · 원고 검토 · 통계 해석'),('NOA 위의 업무 서비스','N01~N07: 업무 화면 + 승인된 지식·규칙 + 허용 도구 + 검토 흐름'),('재사용을 검증할 NOA 기반','문서·지식 연결 / 실행 상태 / 정책·승인 / 출처·변경·감사 이력'),('기관이 보유한 업무 시스템·자원','허용 API·파일 반입 / 공식 접수·조치·교육·통계 시스템 / 사용 가능한 기존 로컬 서버')]
md.append('\n'.join(f'{i+1}. **{a}** — {b}' for i,(a,b) in enumerate(layers))+'\n')
html.append('<div class="architecture">'+''.join('<div class="layer"><b>'+escape(a)+'</b><span>'+escape(b)+'</span></div>' for a,b in layers)+'</div>')
para('공통 실행 흐름: **요청·자료 수신 → 조건 확인 → 근거 조회 → 규칙·텍스트 검토 → 사람 확인 → 허용된 실행 → 공식 결과 확인 → 이력 보존**. 외부 전송·접수는 권한과 확인 절차가 있는 업무에만 연결한다.')
table(['구분','납품·확산 방법'],[
('재사용 검증','실제 제품 버전·설치 목록·사용권과 정상/실패 동작을 확인한다. 이미 있는 기능을 신규 개발량에 중복 계상하지 않는다.'),
('업무 설정','업무 용어, 자료 유형, 승인된 기준·서식·역할·프롬프트를 구성한다. YAML 설정만으로 모든 연계가 완성된다고 약속하지 않는다.'),
('응용 개발','업무 스키마, 원문 비교·보완 UI, 공식 API 어댑터, 시점·상태 검증, 접근성, 검수 사례를 개발한다.'),
('다른 부서·기관 확산','공통 실행·검토 구조를 재사용하고 지식·규칙·권한·커넥터를 교체한다. 기관 간 원문·개인정보를 공유하는 것은 별도 권한 문제다.')])
head(2,'4. 업무 서비스 7개','services')
para('모든 서비스의 현재 상태는 **구체화 가능한 기획 가설 / CCK 주관 수행 검증 전**이다. 아래 장면은 설명용 가상 사례이며 실제 KoROAD 민원·결함으로 확인된 내용이 아니다.')
table(['서비스·대표 축','처음 납품할 수 있는 범위안','확장 판단'],[(s['id']+' '+s['title']+' / '+s['primary_axis']+'축',s['minimum'],s['track']) for s in services])
html.append('<div class="filters"><label>서비스 검색<input id="q" type="search" placeholder="예: 기준, 교통약자, 증빙"></label><label>검토 경로<select id="track"><option value="">전체</option><option>작게 시작</option><option>같은 구조 확장</option><option>연계 조건부</option></select></label><button id="reset" type="button">초기화</button><button id="expand" type="button">모두 펼치기</button><button id="collapse" type="button">모두 접기</button><p id="count" role="status" aria-live="polite">7개 서비스</p></div><div id="cards">')
labels=[('axis_title','대표 서비스축'),('cross_axis_note','분류·재사용 경계'),('why','국민·사업자에게 생기는 변화'),('scene','한 장면'),('input','입력'),('output','결과물'),('reuse','CCK 자산 재사용'),('change','설정·추가 개발'),('roles','LLM·코드·사람의 역할'),('duplicate','기존 사업과 비교'),('minimum','최소 납품 범위안'),('failure','실패·예외 처리'),('benefit','비AI 대비 확인할 성과'),('gate','착수 전 확보할 조건'),('verify','업무 검수 시나리오')]
for s in services:
    md.append(f'### {s["id"]}. {s["title"]}\n\n분야: {s["group"]} / 경로: {s["track"]}\n')
    html.append(f'<details class="service" id="{s["id"]}" data-track="{s["track"]}"><summary><span class="tag">{s["id"]} · {s["track"]}</span><strong>{s["title"]}</strong><span class="sub">{s["why"]}</span></summary><div class="service-body"><dl>')
    for key,label in labels:
        md.append(f'**{label}**: {s[key]}\n')
        html.append('<dt>'+label+'</dt><dd>'+inline(s[key])+'</dd>')
    refs=reflinks(s['refs'])
    md.append('**공식 업무 근거**: '+refs+'\n')
    html.append('</dl><p class="sources">'+inline(refs)+'</p></div></details>')
html.append('</div><p id="empty" hidden>조건에 맞는 서비스가 없습니다. 검색어나 검토 경로를 바꾸세요.</p>')
head(2,'5. 처음 개발할 범위와 확대 순서','delivery')
table(['단계','범위 제안','다음 단계로 넘어갈 조건'],[
('0 · 자산·문제 확인','NOA 설치 버전과 기존 자원 점검, 담당자와 실제 보완 사례 확인, 기존 계약·운영 기능 대조','기보유 기능과 추가 개발이 분리되고, 실제 사용자가 해결할 문제·수용 기준에 동의'),
('1 · N02의 단일 업무','텍스트 서류 반입 → 사전점검 → 담당자 검토 → 보완목록 출력; 비교 기준은 단순 체크리스트','잘못된 지적·누락·원문 오류와 준비 부담을 확인하고, 기존 자원에서 품질·응답시간 측정'),
('2 · N03·N04 선택 확장','증빙 대응 구조를 조치보고로, 버전 비교를 기준 반영으로 확장; 실제 미해결 수요가 큰 1개부터','기존 사후관리·기준배포와 차이, 권한·담당 책임, 서비스별 추가 공수 확인'),
('3 · 접점 확대','N01 대국민 준비/접수, N05 보충교육, N06 방송 편집, N07 통계 설명을 각각 검토','API·인증·망 경로·이용자 접근성과 비AI 대비 효과가 확보된 서비스만 별도 범위 확정')])
para('기획 가설상 **N02는 작은 진입 범위, N03는 안전성과의 연결이 가까운 확장 범위, N04는 여러 업무로 재사용하기 좋은 범위**다. 실제 조사에서 N03의 문제·데이터가 더 명확하면 순서를 바꾼다. 서비스 수를 모두 유지하기 위해 효과가 약한 항목까지 묶지 않는다.')
table(['CCK가 주관할 범위안','KoROAD·기존 운영자가 맡을 범위'],[
('NOA 적용 설계, 업무 플러그인, 지식·규칙 구성 도구, API 어댑터, UI, 통합·시험·배포 설정·운영 인수','공식 기준·업무 권한, 자료 제공·개인정보 처리 근거, 기존 API·망·자원, 법정 판단·승인'),
('제품 결함·모델 설정·검색 품질·실행 이력·예외처리의 기술 책임','기준 해석·현장 조치·안전 판정과 실제 업무 결과의 책임'),
('협력사 사용 시에도 산출물·통합·검수 책임을 CCK가 통제하는 계약 구조','현재 사업자와 변경 창구·접근권한·운영 책임을 명확히 합의')])
head(2,'6. 인프라 0원 조건에서 범위를 지키는 법','resources')
bullets(['NOA와 필요한 런타임·DB·검색 구성요소를 현재 환경에 올릴 수 있는지 설치 목록과 자원 사용량을 확인한다. 회사의 SaaS 구성을 기관 폐쇄망에 그대로 사용할 수 있다고 가정하지 않는다.',
'인덱싱·문서 처리는 배치로, 사용자 요청은 제한된 동시성·대기열로 설계한다. GPU 여유가 부족하면 입력량·동시성·문맥·대상 업무를 줄이고 다시 검수한다.',
'임베딩·재순위화·모델 호출·로그·라이선스 확인 등 외부 의존 경로를 점검한다. 로컬 추론 실패 시 외부 LLM 자동 전환을 두지 않는다.',
'대국민 서비스에 기존 보안 접속 경로가 없으면 N01은 내부 상담 준비 지원부터 적용한다. 신규 망·장비 투자를 숨겨 전제로 두지 않는다.',
'기존 서버로 필수 업무 품질을 만족하지 못하면 해당 범위를 보류한다. “인프라 0원”이 “추가 개발·설정·유지관리 공수 0원”을 뜻하지 않는다.'])
head(2,'7. 검수와 P01~P07 적용','quality')
para('아래는 개발 후 사용할 수용 기준 초안이다. 아직 시험 결과가 아니다. 서비스 속도·정확도·개선율 목표는 대상 사용자·실제 서버·문서 유형·사례의 난도와 오류 피해를 확인한 뒤 결정한다.')
table(['ID','공통 수용 기준 초안','증거'],[
('AC01','모든 검토 지적은 원문 위치와 적용 기준 버전 또는 미확인 상태를 보여준다.','원문과 결과의 대조 기록'),
('AC02','규칙에 필요한 조건이 없거나 근거가 상충하면 추가 확인·보류로 이동한다.','누락·상충 사례 결과'),
('AC03','서버가 권한과 승인 상태를 검증하고, 승인한 내용이 바뀌면 재확인한다.','권한·수정·승인 우회 시험'),
('AC04','공식 접수·전송 응답 없이 업무 완료를 표시하지 않으며, 재시도로 중복 처리를 만들지 않는다.','실패·중복·타임아웃 시나리오'),
('AC05','문서 안의 지시문이 도구 권한을 넓히지 않고, 다른 부서·이용자의 자료가 검색·로그로 노출되지 않는다.','지식오염·권한 분리 검토'),
('AC06','지원하지 않는 형식·빈 파일·스캔 자료를 미검토로 구분하고 입력을 보존한다.','형식·오류·복구 시험'),
('AC07','같은 실제 과업에서 현행→규칙형 개선→NOA 지원의 결과와 중요한 오류를 비교한다.','업무 완료·부담·오류 기록; 인력 감축 환산 금지'),
('AC08','합의한 로컬 환경·동시성에서 품질·응답시간·메모리·외부 호출 여부를 확인한다.','설정·운영 로그·실측 결과')])
table(['기준','적용 근거·남은 조건'],[
('P01 국민 가치','N01·02 재방문·보완 부담, N03 안전조치 확인, N04 상충 안내, N05 이해, N06 최신 정보, N07 통계 오해를 목표로 둔다. 실제 문제 규모는 미확인.'),
('P02 현업 수용','담당자는 근거 검토·판단에 참여한다. 업무시간을 감축 인원으로 환산하지 않고 오류·책임·업무 재배치를 함께 확인한다.'),
('P03 AX+SI 추가 가치','체크리스트·단계형 폼·문서 diff·기존 통계와 비교한다. 단순 SI로 충분하면 AI 범위를 줄인다.'),
('P04 실제 업무 연결','공식 36개 메뉴에 연결했으나 홈페이지 소개는 법정 권한의 증명이 아니다. 필요 법령·시행일·위탁관계는 착수 전 확인한다.'),
('P05 확산','공통 검토·실행 구조와 기관별 지식·규칙·권한·연계를 분리한다. 데이터의 기관 간 공유를 전제하지 않는다.'),
('P06 기관 구분','ORG-0002 KoROAD로 유지한다. TS와 기관 지정·업무·서버·기존 계약을 구별한다.'),
('P07 책임·재정 타당성','CCK 주관 범위·사람 판단·원천 결과·실패 복구를 명시한다. 실제 발주 유형·재원·금액에 따른 협의·심의는 조건 확정 후 검토한다.')])
head(2,'8. 주요사업 36개 항목과의 연결','coverage')
para('36개 메뉴는 조사 모집단이고, N01~N07은 이번 서비스 묶음이다. 하나의 서비스가 여러 메뉴와 연결될 수 있으며, 이를 별도 신규 사업 수로 합산하지 않는다. 빈 연결은 배경·공통 조건·유보 항목이다.')
html.append('<details class="coverage"><summary>36개 항목의 매핑표 펼치기</summary>')
table(['근거 ID·공식 업무','서비스','적용 경계'],[(f'[{rid} {official[rid]["title"]}]({official[rid]["url"]})',', '.join(ids) or '—',note) for rid,ids,note in mapping])
html.append('</details>')
head(2,'9. 근거와 미확인 사항','evidence')
table(['근거','확인한 내용','적용 한계'],[(f'[{s["id"]} {s["title"]}]({s.get("url", "#내부-근거-위치")})',s['finding'],s['limit']) for s in sources])
para('공식 제품 페이지는 2026-09-11 열람했다. 게시일·제품 빌드는 미표기다. KoROAD 근거는 같은 날 작성한 [주요사업 확인원장](../주요사업_확인원장.json)의 KB·KC 항목과 원문 저장본을 이용했다. 페이지의 기능 소개·추진 계획을 실제 배포·검수 완료로 승격하지 않았다.')
head(3,'내부 근거 위치','내부-근거-위치')
bullets(['CCK05: `'+catalog+'` — 26.09 / 2026-09-05 / draft-v1. TA-01~05·07·20·23 관련 항목을 확인.',
'CCK06: `'+oda+'` — §1.9.3. 원래의 해외 제안 요약이며 현재 NOA 기능은 공식 제품 소개를 우선 참조.',
'프로젝트 기준: `00_기획지침/CCK_로컬LLM_적용범위.md`, `국민체감형_AX_선정기준.md`, `TS_신규사업기획_지침.md`, `신규사업_범위와_중복배제.md`. 이번 대상 기관은 KoROAD로 구분.'])
para('가장 먼저 확인할 자료는 **NOA 배포 버전·기능 목록·로컬 구성**, **KoROAD의 실제 보완·누락 사례**, **기존 계약·시스템의 기능 범위**다. 다음으로 권한·API·인력·공수·운영 책임을 확보한다. [후속확인 대기열](../후속확인_대기열.md)')
para('Grantee의 정산 기능을 KoROAD 신규 사업으로 추가하려면 실제 정산·위탁 관리 업무와 미해결 수요가 별도로 확인돼야 한다. 현재 주요사업 소개만으로 보조금 관리기관이라고 추정하지 않아 별도 후보로 집계하지 않았다.')
head(2,'10. 산출물 판정','result')
para('**기획 정리 완료 / 사업화 조건부 검토 / 제품·사업 수행 가능성 검증 전.** 근거 수준과 기관 경계, 7개 서비스의 재사용·개발·납품 범위를 문서화했다. HTML의 링크·탐색·반응형 검증 결과는 [문서 QA 기록](검증/QA_결과.md)에 별도 기록한다. 독립 평가위원 심의·실제 사용자 시험·NOA 설치 시험은 수행하지 않았다.')
para('사용자 관점에서 첫 납품은 “문서를 넣으면 무엇이 부족하고 어디를 보완할지 확인하는 화면”으로 설명 가능해야 한다. 추가 확인 이후 그 범위로 서비스 정의서·요구사항·RFP·공수를 작성하는 것이 다음 입력이다. 기존 TS 예산 산출물은 수정하지 않았다.')

css='''
:root{--ink:#142d3b;--muted:#506774;--paper:#f3f6f6;--teal:#006b61;--line:#d3dfe1;--gold:#99551a}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--paper);color:var(--ink);font-family:"Malgun Gothic","맑은 고딕",system-ui,sans-serif;line-height:1.8;font-size:16px}a{color:#006252;text-decoration-thickness:1px;text-underline-offset:3px;overflow-wrap:anywhere}a:hover{color:#003c35}button,input,select{font:inherit}button{cursor:pointer} :focus-visible{outline:3px solid #aa5a16;outline-offset:4px} .skip{position:absolute;top:-100px;left:16px;background:white;padding:12px;z-index:9}.skip:focus{top:10px}.top{background:#123643;color:white;padding:20px max(22px,calc((100vw - 1180px)/2));display:flex;justify-content:space-between;gap:20px;align-items:center}.top a{color:#e4fff8}.brand{font-weight:800;letter-spacing:1px}.layout{max-width:1400px;margin:auto;display:grid;grid-template-columns:200px minmax(0,1fr);gap:32px;padding:32px 26px}nav{position:sticky;top:20px;align-self:start;border-left:3px solid #bed2d3;padding-left:18px;font-size:14px}nav a{display:block;padding:6px 0;text-decoration:none}nav .small{color:var(--muted);margin-top:25px;font-size:12px}main{min-width:0;background:white;border:1px solid var(--line);border-radius:16px;padding:42px 42px 50px;box-shadow:0 6px 24px #173b4610}h1{font-size:36px;line-height:1.4;letter-spacing:-1px;margin:0 0 12px;max-width:720px}h2{font-size:25px;margin:62px 0 18px;line-height:1.5;border-top:1px solid var(--line);padding-top:26px;scroll-margin-top:20px}h3{font-size:20px}.meta{color:var(--muted);font-size:13px}.lead{font-size:20px;line-height:1.85;margin:26px 0}.callout{padding:22px 24px;border-left:5px solid var(--teal);background:#eaf5f1;border-radius:0 9px 9px 0}.table-scroll{overflow-x:auto;margin:22px 0;border:1px solid var(--line);border-radius:8px}table{border-collapse:collapse;width:100%;font-size:14px;min-width:620px}th{background:#eaf0f2;font-weight:700;text-align:left}th,td{padding:14px 16px;vertical-align:top;border-bottom:1px solid var(--line);overflow-wrap:anywhere}td:first-child{font-weight:600;min-width:135px}tbody tr:last-child td{border-bottom:0}tbody tr:nth-child(even){background:#fbfcfd}ul{padding-left:23px}li{margin:10px 0}code{font-size:.9em;overflow-wrap:anywhere;color:#334853;background:#eef2f4}.architecture{margin:25px 0;display:grid;gap:12px}.layer{padding:18px 22px;border-radius:8px;background:#f0f5f5;border:1px solid #cbdcdb;display:grid;grid-template-columns:210px 1fr;gap:18px}.layer:nth-child(2){background:#e8f5ef;border:2px solid var(--teal)}.layer:nth-child(3){background:#173d4c;color:white}.layer span{font-size:14px}.filters{display:flex;gap:12px;flex-wrap:wrap;align-items:end;padding:20px;background:#edf3f3;border-radius:10px;margin:24px 0}label{display:grid;gap:5px;font-size:13px;font-weight:600}input,select{background:white;border:1px solid #95abb2;border-radius:6px;padding:9px 11px;min-height:44px;max-width:100%;color:var(--ink)}input{width:260px}button{border:1px solid #91a9ae;border-radius:6px;background:white;color:#244550;padding:9px 13px;min-height:44px}button:hover{background:#dfeeea}#count{width:100%;margin:0;color:var(--muted);font-size:13px}details.service{border:1px solid #c8d9dc;border-radius:10px;margin:15px 0;background:white}summary{cursor:pointer;padding:20px 23px;min-height:48px}summary::marker{color:var(--teal)}.service summary strong{display:block;font-size:22px;line-height:1.5;margin:8px 0}.tag{font-size:12px;color:#006051;font-weight:700}.sub{display:block;font-size:14px;color:var(--muted)}.service[open] summary{border-bottom:1px solid var(--line);background:#f1f7f5;border-radius:10px 10px 0 0}.service-body{padding:8px 25px 22px}dl{margin:0}dt{font-weight:700;margin-top:19px;color:#006051;font-size:14px}dd{margin:5px 0;font-size:15px}.sources{font-size:12px;border-top:1px solid var(--line);padding-top:18px}.coverage{border:1px solid var(--line);border-radius:8px}.coverage .table-scroll{border:0;margin:0}#empty{padding:22px;background:#fff3dd;border-radius:8px}[hidden]{display:none!important}footer{max-width:1180px;margin:0 auto 36px;text-align:center;font-size:12px;color:var(--muted)}
@media(max-width:1060px){.layout{display:block;padding:20px}.layout nav{position:static;display:flex;flex-wrap:wrap;gap:10px 20px;border:0;padding:0;margin-bottom:20px}.small{display:none}.layer{grid-template-columns:1fr;gap:4px}main{padding:30px}}
@media(max-width:620px){body{font-size:15px}.layout{padding:12px}.top{padding:17px;display:block}.top a{display:block;font-size:12px;margin-top:6px}main{padding:23px 18px;border-radius:10px}h1{font-size:29px}h2{font-size:23px;margin-top:42px}.lead{font-size:18px}.callout{padding:17px}.filters{padding:14px}label{width:100%}input,select{width:100%}summary{padding:17px}.service summary strong{font-size:20px}.service-body{padding:7px 17px 18px}nav{font-size:12px}th,td{padding:12px}code{word-break:break-all}}
@media print{body{background:white}.layout{display:block;padding:0}nav,.top,.filters,.skip,footer{display:none!important}main{border:0;box-shadow:none;padding:0}h1{font-size:26px}h2{break-after:avoid}table{font-size:11px;min-width:0}tr,.layer{break-inside:avoid}.table-scroll{overflow:visible}.service-body{display:block!important}details{break-inside:auto}summary{break-after:avoid}}
'''
js='''
const cards=[...document.querySelectorAll('.service')],q=document.querySelector('#q'),track=document.querySelector('#track');
function filter(){let n=0;for(const card of cards){const ok=(!track.value||card.dataset.track===track.value)&&card.textContent.toLowerCase().includes(q.value.trim().toLowerCase());card.hidden=!ok;if(ok)n++;}document.querySelector('#count').textContent=n+' / 7개 서비스';document.querySelector('#empty').hidden=n!==0;}
q.addEventListener('input',filter);track.addEventListener('change',filter);document.querySelector('#reset').addEventListener('click',()=>{q.value='';track.value='';filter();});document.querySelector('#expand').addEventListener('click',()=>cards.filter(x=>!x.hidden).forEach(x=>x.open=true));document.querySelector('#collapse').addEventListener('click',()=>cards.forEach(x=>x.open=false));
function openHash(){const el=document.getElementById(location.hash.slice(1));if(el?.classList.contains('service')){q.value='';track.value='';filter();el.open=true;el.scrollIntoView();}}window.addEventListener('hashchange',openHash);openHash();let before=[];window.addEventListener('beforeprint',()=>{before=[...document.querySelectorAll('details')].map(x=>[x,x.open,x.hidden]);before.forEach(([x])=>{x.open=true;x.hidden=false;});});window.addEventListener('afterprint',()=>before.forEach(([x,o,h])=>{x.open=o;x.hidden=h;}));
'''
css+='\n.axis-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin:22px 0}.axis-card{padding:22px;border:1px solid #b5cdd2;border-radius:10px;background:#f1f7f5}.axis-card:nth-child(2){background:#f1f4f9}.axis-card h3{margin:0;font-size:20px;line-height:1.5}.axis-card p{font-size:14px}.axis-card strong{font-size:17px}@media(max-width:700px){.axis-grid{grid-template-columns:1fr}.axis-card{padding:18px}}'
nav=[('business-model','공통 기반·두 서비스축'),('scope','전제·기관 경계'),('assets','CCK 보유 자산'),('architecture','확장 구조'),('services','7개 업무 서비스'),('delivery','납품·확대 순서'),('resources','인프라 0원'),('quality','검수·기획 기준'),('coverage','36개 업무 매핑'),('evidence','근거·미확인'),('result','검토 판정')]
page='<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+TITLE+'</title><style>'+css+'</style></head><body><a class="skip" href="#main">본문으로 이동</a><div class="top"><span class="brand">CCK × KoROAD · NOA</span><a href="../한국도로교통공단_주요사업_전체검토.html">주요사업 전체 조사로 돌아가기</a></div><div class="layout"><nav aria-label="문서 목차">'+''.join(f'<a href="#{i}">{t}</a>' for i,t in nav)+'<div class="small">LOCAL LLM<br>기존 자원 활용<br>기획 검토 v1.0<br><a href="'+STEM+'.md">Markdown 원문</a></div></nav><main id="main">'+''.join(html)+'</main></div><footer>공식 업무 근거와 CCK 공급사 설명을 구분한 확장 설계 · 실제 설치·성능·수요 검증 전</footer><script>'+js+'</script></body></html>'
page=page.replace('기획 검토 v1.0','기획 검토 v'+VERSION)
(B/(STEM+'.md')).write_text('\n'.join(md),encoding='utf-8')
(B/(STEM+'.html')).write_text(page,encoding='utf-8')
(B/'NOA_서비스_확장원장.json').write_text(json.dumps({'date':DATE,'version':VERSION,'institution_id':'ORG-0002','status':'기획 가설 / 제품·수행 검증 전','infrastructure_budget':0,'common_foundation':'NOA·로컬 LLM·기관의 데이터 및 실행 통제','business_axes':axes,'classification_basis':'사용자 두 축 제안에 따른 기획 분류. 원문·데이터·권한의 기관 간 공유를 의미하지 않음.','services':services,'menu_mapping':[dict(id=i,services=s,boundary=b) for i,s,b in mapping],'sources':sources},ensure_ascii=False,indent=2),encoding='utf-8')
assert len(services)==7 and len(mapping)==36
assert {i for i,_,_ in mapping}=={x['id'] for x in book['items']}
assert all(i in official for s in services for i in s['refs'])
assert all(n in {s['id'] for s in services} for _,ids,_ in mapping for n in ids)
print(json.dumps({'services':len(services),'mapped_menu_items':len(mapping),'html':str(B/(STEM+'.html'))},ensure_ascii=False))
