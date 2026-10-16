"""Read-only import of supplied public case inventories; source rows are not outcomes."""
import argparse, hashlib, json, re
from pathlib import Path
from pypdf import PdfReader
import openpyxl

p=argparse.ArgumentParser();p.add_argument('--pdf',required=True);p.add_argument('--xlsx',required=True);p.add_argument('--output',required=True);a=p.parse_args()
book='https://bigdata.dongjak.go.kr/board/viewArticle?articleNo=954&boardId=4'
pdf=PdfReader(a.pdf);rows=[];section='';domain='';buffer=''
for page in pdf.pages[1:7]:
 for raw in page.extract_text().splitlines():
  line=raw.strip()
  if '｢사회문제 해결｣' in line:section='사회문제 해결'
  if '｢대국민 서비스 혁신｣' in line:section='대국민 서비스 혁신'
  if '｢일하는 방식 개선｣' in line:section='일하는 방식 개선'
  if line.startswith('<') or line.startswith('＜'):domain=re.sub(r'[<>＜＞\s]','',line);continue
  if not buffer and not re.match(r'^\d[\d\s]*\.',line):continue
  buffer+=' '+line
  m=re.match(r'^\s*([\d\s]+)\.\s*(.*?)\s*[·.]{3,}\s*(\d+)\s*$',buffer)
  if m:
   number=int(m[1].replace(' ',''));title=re.sub(r'\s+',' ',m[2]).strip();printed=int(m[3])
   rows.append(dict(id=f'KR-{len(rows)+1:03}',source='국내 공공AI 사례집',sourceId=f'{section}-{number}',country='대한민국',owner=None,title=title,domain=domain,section=section,function='실증 사례',url=book,sourceUrl=book,locator=f'책자 {printed}쪽 / PDF {printed+8}쪽',sourceUpdated='2022~2025.03 수록 범위',kind='실증·기획 수록',platform=False))
   buffer=''
assert len(rows)==110,(len(rows),buffer)
w=openpyxl.load_workbook(a.xlsx,read_only=True,data_only=True)
foreign=[]
for excel_row,r in enumerate(w.active.iter_rows(min_row=2,values_only=True),start=2):
 if r[0] is None:continue
 def url(x):
  value=str(x or '').strip()
  return value if re.match(r'^https?://',value) else None
 foreign.append(dict(id=f'INT-{int(r[0]):04}',source='해외 AI 인벤토리',sourceId=str(r[0]),country=r[1],owner=r[3],title=r[5] or r[4],originalTitle=r[4],domain=r[11],section=r[10],function=r[13],url=url(r[6]),sourceUrl=url(r[16]) or book,locator=f'전체 시트 {excel_row}행',sourceUpdated=str(r[17] or '미표시'),kind='인벤토리 수록',platform=r[13]=='통합플랫폼'))
assert len(foreign)==2527
patterns=[('ST-01',r'교통안전|보행|도로안전|사고.?예측|교통약자'),('ST-02',r'자동차|차량.?검사|소비자'),('ST-03',r'재난|화재|산사태|사고|위험|안전|재해'),('ST-04',r'인공지능|AI|플랫폼|행정'),('ST-05',r'자율주행|드론|모빌리티|항공|철도'),('ST-06',r'에너지|탄소|기후|환경|배출'),('ST-07',r'데이터|정보공개|공공정보|데이터 공유'),('ST-08',r'교통|이동|버스|여행|장애인'),('ST-09',r'중소기업|창업|지역|기업지원|입찰|수출|농업'),('ST-10',r'회계|감사|계약|문서|행정|재정|예산'),('ST-11',r'환경|에너지|탄소|공정|윤리|ESG'),('ST-12',r'인사|직원|참여|의견|소통|교육|학습')]
for row in rows+foreign:
 text=' '.join(str(row.get(k) or '') for k in ['title','domain','section'])
 row['strategyCandidates']=[id for id,pattern in patterns if re.search(pattern,text,re.I)]
 # ST-04 is reserved for platform or organizational AI evidence, not every AI title.
 if not row['platform'] and not re.search(r'공통|조직|직원|행정',text):row['strategyCandidates']=[s for s in row['strategyCandidates'] if s!='ST-04']
 row['mappingStatus']='키워드 연결 후보'
result=dict(asOf='2026-10-16',scope='원장 2,637행 전수 색인 / 개별 사례의 최신 운영·성과 검증과 구분 / 중복 사업 가능',counts=dict(domestic=len(rows),international=len(foreign),countries=len(set(r['country'] for r in foreign)),platform=sum(r['platform'] for r in foreign)),sources=[dict(title=Path(a.pdf).name,sha256=hashlib.sha256(Path(a.pdf).read_bytes()).hexdigest(),url=book),dict(title=Path(a.xlsx).name,sha256=hashlib.sha256(Path(a.xlsx).read_bytes()).hexdigest(),url=book)],records=rows+foreign)
Path(a.output).write_text(json.dumps(result,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf8');print(result['counts'])
