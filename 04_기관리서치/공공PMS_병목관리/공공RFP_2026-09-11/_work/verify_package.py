from pathlib import Path
from zipfile import ZipFile
from lxml import etree
from pypdf import PdfReader
import json,hashlib,collections,re,sys
sys.stdout.reconfigure(encoding='utf-8')
W=Path(__file__).resolve().parent;OUT=W.parent
P=json.loads((OUT/'공공RFP_요구사항_테일러링_원장.json').read_text(encoding='utf-8'))
N={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
checks=[]
def check(name,result,detail=''):
    checks.append({'check':name,'pass':bool(result),'detail':detail})
R=P['requirements'];codes=[r['id'] for r in R];old=[x['old'] for x in P['crosswalk']]
check('RFP 요구사항 52개 및 고유 ID',len(codes)==len(set(codes))==52)
check('원 요구사항 58개 보존',len(old)==len(set(old))==58)
check('원 1차 대응 46개',sum(x['new']!='후속 제외' for x in P['crosswalk'])==46)
check('후속 제외 12개',sum(x['new']=='후속 제외' for x in P['crosswalk'])==12)
check('발주 보강 6개',sum(r['source_kind']=='발주·납품 관리 보강' for r in R)==6)
check('조건부 연계 2개',set(r['id'] for r in R if r['condition']=='조건부')=={'SIR-001','SIR-002'})
check('요구별 검수기준 두 개',all(len(r['acceptance'])==2 for r in R))
check('요구별 산출물 연결 존재',all(r['deliverables'] for r in R))
T=P['tailoring'];known={x['code'] for x in T if x['code']}|{x['code'] for x in P['standard_supplements']}|{'사업수행계획서'}
check('알 수 없는 산출물 참조 없음',all(c in known for r in R for c in r['deliverables']))
check('테일러링 원 코드 74개 및 기초 4개',sum(bool(x['code']) for x in T)==74 and len(T)==78)
check('테일러링 원 코드 중복 없음',len(set(x['code'] for x in T if x['code']))==74)
ct=collections.Counter(x['status'] for x in T if x['code'])
check('판정 집계',ct=={'적용':50,'통합':17,'조건부':5,'제외':2},dict(ct))
check('표준 보완 7개',len(P['standard_supplements'])==7)
check('공고 전 확정 항목 15개',len(P['conditions'])==15)
source_results=[]
for s in P['source_hashes']:
    path=Path(s['path']);current=hashlib.sha256(path.read_bytes()).hexdigest()
    check(s['id']+' Desktop 원본 무변경',current==s['sha256'])
    source_results.append({'id':s['id'],'sha256':current})
docs=[]
for file in OUT.glob('*.docx'):
    with ZipFile(file) as z:
        xml=etree.fromstring(z.read('word/document.xml'))
        text='\n'.join(xml.xpath('//w:t/text()',namespaces=N))
        check(file.name+' 깨진 문자 없음','\ufffd' not in text)
        check(file.name+' 개인정보·원본 가격·특정 업체 미승계',all(x not in text for x in ['448,316,087','H200','L40S','씨씨케이','손현곤','조현수','이영학','CCK']))
        if '제안요청서' in file.name:
            check('RFP DOCX 요구번호 52개 존재',all(id in text for id in codes))
            check('RFP DOCX 상세설명 표 52개',len(xml.xpath('//w:t[text()="상세설명"]',namespaces=N))==52)
            check('RFP 신규 인프라 조건 존재','신규 인프라 투자비는 0원' in text)
            check('RFP 일곱 장 존재',all(k in text for k in ['Ⅰ 사업개요','Ⅱ 사업추진 방안','Ⅲ 제안요청 내용','Ⅳ 제안서 작성요령','Ⅴ 제안 안내사항','Ⅵ 서식','Ⅶ 별첨']))
        else:
            check('테일러링 DOCX 원 코드 74개 존재',all(x in text for x in known if re.match(r'^(PM|PP|AN|DE|CO|TE|IM|TO)\d\d-\d+$',x)))
        check(file.name+' 변경 추적·댓글 미포함',not xml.xpath('//w:ins|//w:del|//w:commentRangeStart',namespaces=N))
        docs.append({'file':file.name,'bytes':file.stat().st_size,'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'tables':len(xml.xpath('//w:tbl',namespaces=N))})
manifest_path=W/'word_render_manifest.json'
if manifest_path.exists():
    manifest=json.loads(manifest_path.read_text(encoding='utf-8-sig'))
    for entry in manifest:
        pages=PdfReader(entry['pdf']).pages
        check(entry['file']+' Word 페이지 수 일치',len(pages)==entry['pages'])
        body_counts=[]
        for i,page in enumerate(pages,1):
            text=page.extract_text() or '';body_counts.append(len(text))
        check(entry['file']+' 과도하게 짧은 분리 페이지 없음',min(body_counts)>250,{'pages':len(pages),'min_page_text':min(body_counts)})
report={'status':'구조·대응 검사','checks':checks,'documents':docs,'sources':source_results,'product_tests':'미실시',
 'visual_review':'최종 렌더 PNG 별도 검토 필요','independent_review':'외부 독립 검토 미실시'}
(W/'package_verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'checks':len(checks),'passed':sum(c['pass'] for c in checks),'failures':[c for c in checks if not c['pass']]},ensure_ascii=False,indent=2))
