from pathlib import Path
from zipfile import ZipFile
from lxml import etree
from pypdf import PdfReader
import json,hashlib,re,importlib.util

OUT=Path(__file__).resolve().parent
ROOT=Path('C:/Users/김희섭/Desktop/[TS]프로젝트/001.TS교통안전공단')
TAIL=ROOT/'02.공통플랫폼 고도화(4억 첫수주)/02.수행/02.산출물/1. PP00.개발준비/PP11.사업 적용범위 확정/PP11-1_테일러링내역서_260819_v1.0.hwpx'
STD=ROOT/'00.정보화사업 산출점검가이드 및 매뉴얼(공단 표준)'
DEV=next(STD.rglob('*개발+표준+가이드_v1.1.pdf'))
PM=next(STD.rglob('*사업관리+표준+가이드_v1.4(0312).pdf'))
RFP=ROOT/'04.프로젝트_통합관리/99_추가원본/회사아카이브/01.사업관리/001_공고/2. 과업 및 제안요청서.pdf'
HWP=next(STD.rglob('PP11-1테일러링 내역서(참고사항).hwp'))
sources=[]
for sid,path in [('L01',TAIL),('L02',DEV),('L03',PM),('L04',RFP),('L05',HWP)]:
 data=path.read_bytes()
 sources.append({'id':sid,'path':str(path),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'lfs_pointer':data.startswith(b'version https://git-lfs')})
 if data.startswith(b'version https://git-lfs'):continue
 if path.suffix=='.pdf':
  pdf=PdfReader(path)
  pages=[p.extract_text() for p in pdf.pages]
  (OUT/f'{sid}_pages.json').write_text(json.dumps(pages,ensure_ascii=False,indent=2),encoding='utf-8')
  print(sid,len(pages),'pages')
  for n,text in enumerate(pages,1):
   if ('테일러링' in text and sid in ['L02','L03']) or (sid=='L04' and (n<=4 or ('요구사항' in text and ('고유번호' in text or '명칭' in text) and n<20))):
    print('MATCH',sid,n,text[:1600])
 if path.suffix=='.hwpx':
  ns={'hp':'http://www.hancom.co.kr/hwpml/2011/paragraph'}
  sections=[];tabs=[]
  with ZipFile(path) as z:
   for name in sorted(x for x in z.namelist() if re.fullmatch(r'Contents/section\d+.xml',x)):
    xml=etree.fromstring(z.read(name))
    sections.append({'part':name,'text':'\n'.join(xml.xpath('//hp:t/text()',namespaces=ns))})
    for i,tab in enumerate(xml.xpath('//hp:tbl',namespaces=ns),1):
     rows=[]
     for row in tab.findall('hp:tr',ns):
      rows.append([' '.join(cell.xpath('.//hp:t/text()',namespaces=ns)) for cell in row.findall('hp:tc',ns)])
     tabs.append({'part':name,'table':i,'rows':rows})
   if 'Preview/PrvImage.png' in z.namelist():(OUT/'tailoring_preview.png').write_bytes(z.read('Preview/PrvImage.png'))
  (OUT/'L01_sections.json').write_text(json.dumps(sections,ensure_ascii=False,indent=2),encoding='utf-8')
  (OUT/'L01_tables.json').write_text(json.dumps(tabs,ensure_ascii=False,indent=2),encoding='utf-8')
  for t in tabs:print('TABLE',t['part'],t['table'],'rows',len(t['rows']),'first',t['rows'][:3])
print('olefile_available',bool(importlib.util.find_spec('olefile')))
(OUT/'sources.json').write_text(json.dumps(sources,ensure_ascii=False,indent=2),encoding='utf-8')
