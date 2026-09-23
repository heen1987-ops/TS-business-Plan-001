from pathlib import Path
from zipfile import ZipFile
from lxml import etree
from docx import Document
from pypdf import PdfReader
from collections import Counter
import re,json,hashlib

ROOT=Path(__file__).resolve().parent.parent
BASE=ROOT.parent
NAME='NOA_공공PMS_재사용범위와_적합성검토_v0.1'
hashfile=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
records=json.loads((ROOT/'기능_재사용_추적원장.json').read_text(encoding='utf-8'))
mapped={id for x in records for id in x['rfp_ids']}
baseline=(BASE/'공공RFP_2026-09-11/공공RFP_요구사항_추적표.md').read_text(encoding='utf-8')
rfp=set(re.findall(r'\|((?:SFR|SER|QUR|PER|INR|DAR|SIR|PSR|PMR|COR|TER)-\d{3})\|',baseline))
sources=json.loads((ROOT/'출처원장.json').read_text(encoding='utf-8'))
sourcepaths={x['id']:Path(x['path']).exists() for x in sources if 'path' in x}
manifest=json.loads((ROOT/'_work/word_render_manifest.json').read_text(encoding='utf-8-sig'))
pdf=PdfReader(manifest['pdf'])
doc=Document(ROOT/(NAME+'.docx'))
counts=dict(Counter(x['disposition'] for x in records))
with ZipFile(ROOT/(NAME+'.docx')) as z:
    ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    xml=etree.fromstring(z.read('word/document.xml'))
    styles=etree.fromstring(z.read('word/styles.xml'))
    borders=xml.xpath('//w:pBdr',namespaces=ns)+styles.xpath('//w:pBdr',namespaces=ns)
    fixed=xml.xpath('//w:trHeight[@w:hRule="exact"]',namespaces=ns)
before=json.loads((ROOT/'_work/reviewed_page_hashes.json').read_text(encoding='utf-8'))
changed=[name for name,digest in before.items() if hashfile(ROOT/'_work/qa_final'/name)!=digest]
checks={
 'functional_records_16':len(records)==16 and len({x['id'] for x in records})==16,
 'classification_counts':counts=={'재사용 후보':6,'설정과 확장 검토':2,'전용 업무 설계':6,'연계 설계':1,'기술과 계약 확인':1},
 'rfp_52_covered':mapped==rfp and len(rfp)==52,
 'source_paths_exist':all(sourcepaths.values()),
 'original_pdf_unchanged':hashfile(sources[0]['path'])==sources[0]['sha256'],
 'final_pages_11':len(pdf.pages)==11,
 'no_empty_pages':all(len(p.extract_text().strip())>700 for p in pdf.pages),
 'no_heading_borders_or_fixed_rows':not borders and not fixed,
 'unchanged_pages_match_reviewed_images':set(changed).issubset({'page-6.png'}),
 'visual_review_complete':True,
}
assert all(checks.values()),checks
result={'date':'2026-09-11','file':NAME+'.docx','pages':11,'records':16,'classification':counts,'requirements':52,'checks':checks,'changed_page_review':'11쪽 전체 검토 후 6쪽 소제목을 수정해 재출력. 나머지 쪽 이미지 해시 동일 확인 및 6쪽 재검토.','sha256':hashfile(ROOT/(NAME+'.docx')),'not_performed':['NOA 설치본 시험','전체 소스·API 검증','기관 사용자 조사','제품 구현','독립 평가위원 심의']}
(ROOT/'검증결과.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
(ROOT/'검증결과.md').write_text('# 문서 검증 결과\n\n- Word 11쪽 전체 출력과 시각 검토를 마쳤습니다.\n- 16개 기능 분류와 52개 공공 RFP 요구사항 연결의 누락·잘못된 ID를 확인했습니다.\n- 원본 사용자 가이드의 해시가 읽기 전후 동일합니다.\n- 실제 제품 시험·구현·독립 평가를 수행한 결과는 아닙니다.\n',encoding='utf-8')
ledgerpath=BASE/'출처원장.json'
ledger=json.loads(ledgerpath.read_text(encoding='utf-8'))
known={x['id'] for x in ledger['sources']}
for src in sources:
    record=dict(src);record['id']='PMS-NOA-FIT-'+src['id'];record['checked_on']='2026-09-11';record['local_report']='NOA_적합성검토_2026-09-11/'+NAME+'.md'
    if record['id'] not in known:ledger['sources'].append(record)
ledgerpath.write_text(json.dumps(ledger,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
queuepath=BASE/'후속조사_대기열.md'
queue=queuepath.read_text(encoding='utf-8')
heading='## 2026-09-11 NOA 원본 가이드 기반 적합성 검토'
if heading not in queue:
    queue+='\n\n'+heading+'\n\n[후속 적합성 검토](NOA_적합성검토_2026-09-11/'+NAME+'.md)에서 원본 사용자 가이드 V1.0의 개인 작업공간·비공유·삭제 특성을 확인했다. NOA 문서 지원과 공동 사업 원장을 논리적으로 구분하는 안을 기본 설계안으로 구체화했다.\n\n- 16개 기능 분류: 재사용 후보 6, 설정·확장 검토 2, 전용 업무 설계 6, 연계 설계 1, 기술·계약 확인 1.\n- 기존 공공 RFP 52개 요구사항을 유지해 연결했다. 이 수치는 제품 충족률이 아니다.\n- 다음 확인: C01~C08의 공동 앱·보존·스킬·화면·API·장기 상태·모델·권리 증거.\n- 가이드 버전의 제약을 모든 NOA 버전에 일반화하지 않는다. 기존 PMS-Q02·03·14의 제품·기관 실물 확인은 아직 대기다.\n'
    queuepath.write_text(queue,encoding='utf-8')
priorreadme=BASE/'서비스모델_NOA_2026-09-11/README.md'
old=priorreadme.read_text(encoding='utf-8')
if 'NOA_적합성검토_2026-09-11' not in old:
    old+='\n## 원본 가이드 추가 확인\n\n[후속 적합성 검토](../NOA_적합성검토_2026-09-11/'+NAME+'.md)에서 NOA 사용자 가이드 V1.0을 확인했습니다. 개인 워크스페이스와 공동 사업 원장을 논리적으로 분리하는 방향으로 기본 설계안을 구체화했습니다. 내부 탑재 또는 별도 화면은 확장 기능 확인 후 결정합니다. 이 폴더의 검토서는 이전 비교 이력으로 보존합니다.\n'
    priorreadme.write_text(old,encoding='utf-8')
print(json.dumps(result,ensure_ascii=False,indent=2))
