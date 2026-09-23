from pathlib import Path
import json,re,importlib.util
from concurrent.futures import ThreadPoolExecutor
ROOT=Path(__file__).resolve().parent;RAW=ROOT/'원천자료'
def key(s):return re.sub('[^가-힣A-Za-z0-9]','',s)
def read(f):return json.loads((ROOT/f).read_text(encoding='utf-8'))
def save(f,d):(ROOT/f).write_text(json.dumps(d,ensure_ascii=False,indent=2),encoding='utf-8')
# 공식 지정 보도자료 부록의 미지정기관 목록. 지정 공공기관과 구분한다.
rows=[]
for page,col in [(9,19),(10,21),(11,20)]:
 lines=(RAW/f'미지정_레이아웃{page}.txt').read_text(encoding='utf-8').splitlines();groups=[];current=None
 for line in lines:
  m=re.search(r'\((과기부|교육부|보훈부|유산청|국토부|금융위|농식품부|문체부|법무부|법제처|복지부|산림청|산업부|새만금청|성평등부|식약처|외교부|중기부|통일부|해수부|행안부|행복청|노동부|기후부|방사청|원안위|인사처|재경부|우주청|소방청)\)',line)
  if m:
   current={'ministry_short':m[1],'chunks':[line[m.end():].strip()]};groups.append(current)
  elif current and line.strip() and not re.match(r'^\s*-\s*\d+\s*-\s*$',line):
   chunk=line[col:].strip()
   if chunk:current['chunks'].append(chunk)
 for g in groups:
  for name in ' '.join(g['chunks']).split(','):
   name=re.sub(r'\s+',' ',name).strip()
   if name:rows.append(dict(name=name,ministry_short=g['ministry_short'],source_page=page,source='https://mofe.go.kr/com/cmm/fms/FileDown.do?atchFileId=ATCH_000000000030916&fileSn=2',status='2026 지정자료 미지정 목록 등재'))
save('미지정기관_기준목록.json',rows);print('미지정기관',len(rows))
# 변경된 법령명과 지방기관 공통 근거를 추가 확인한다.
spec=importlib.util.spec_from_file_location('law_fetch',ROOT/'수집_법령.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
extra=['인공지능 및 데이터 기반 행정 활성화에 관한 법률','대일항쟁기 강제동원 피해조사 및 국외강제동원 희생자 등 지원에 관한 특별법','공익법인의 설립·운영에 관한 법률','공익법인의 설립·운영에 관한 법률 시행령','지방자치단체 출자·출연 기관의 운영에 관한 법률 시행령','지방자치단체출연 연구원의 설립 및 운영에 관한 법률','지방의료원의 설립 및 운영에 관한 법률','지역문화진흥법','국가정보원법','과학기술분야 정부출연연구기관 등의 설립·운영 및 육성에 관한 법률','한국은행법','금융위원회의 설치 등에 관한 법률','한국과학기술원법','광주과학기술원법','대구경북과학기술원법','울산과학기술원법','한국에너지공과대학교법','국립대학법인 서울대학교 설립·운영에 관한 법률','국립대학법인 인천대학교 설립·운영에 관한 법률']
d=read('법령_본문원장.json');existing={key(x['query']) for x in d}
items=[dict(query=x,origins=[dict(kind='공식 제명·미지정기관·지방기관 공통근거 보완',source='공식 법령 및 공시 확인')]) for x in extra if key(x) not in existing]
with ThreadPoolExecutor(3) as pool:d+=list(pool.map(mod.one,items))
# 이미 보존된 본문에서 하이퍼링크가 포함된 조문 제목을 완전하게 다시 추출한다.
import lxml.html
for law in d:
 if not law.get('sequence'):continue
 f=RAW/'법령'/f"{law['sequence']}_{law['effective']}_본문.html"
 if not f.exists():continue
 t=lxml.html.fromstring(f.read_text(encoding='utf-8'));arts=[]
 for e in t.xpath('//div[@class="lawcon"]'):
  labels=e.xpath('.//label')
  if labels:arts.append(dict(article=''.join(labels[0].itertext()).strip(),text=re.sub(r'\s+',' ',e.text_content()).strip()))
 law['articles']=arts
save('법령_본문원장.json',d);print('법령 원장',len(d),'본문 고유',len({x['sequence'] for x in d if x.get('sequence')}))
