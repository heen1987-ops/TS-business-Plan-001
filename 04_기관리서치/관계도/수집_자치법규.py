from pathlib import Path
from urllib.request import Request,urlopen
from urllib.parse import quote,urljoin,urlparse,parse_qs,urlencode
from concurrent.futures import ThreadPoolExecutor,as_completed
import json,re,time,hashlib
import lxml.html
ROOT=Path(__file__).resolve().parent;DIR=ROOT/'원천자료'/'자치법규';DIR.mkdir(exist_ok=True)
def get(path,url):
 if path.exists():return path.read_bytes()
 with urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=25) as response:b=response.read()
 path.write_bytes(b);time.sleep(.15);return b
def one(item):
 r=dict(item);q=item['query'];k=hashlib.sha256(q.encode()).hexdigest()[:16];url='https://www.law.go.kr/'+quote('자치법규/'+q,safe='/')
 try:
  b=get(DIR/f'{k}_링크.html',url);t=lxml.html.fromstring(b.decode('utf-8'));frames=t.xpath('//iframe/@src')
  if not frames:raise ValueError('공시 제명으로 현행 자치법규 링크 미확인')
  source=urljoin('https://www.law.go.kr',frames[0]);qs={x:v[0] for x,v in parse_qs(urlparse(source).query).items()}
  seq=qs.get('ordinSeq')
  if not seq:raise ValueError('조례 일련번호 미확인')
  page=get(DIR/f'{seq}_정보.html',source);t=lxml.html.fromstring(page.decode('utf-8'))
  values={e.get('id'):e.get('value') for e in t.xpath('//input[@id]')}
  meta=' '.join(t.xpath('//span[@class="tx2"]/text()'));date=re.search(r'시행 (\d{4})\.\s*(\d+)\.\s*(\d+)',meta)
  effective=''.join([date[1],date[2].zfill(2),date[3].zfill(2)]) if date else ''
  bodyurl='https://www.law.go.kr/LSW/ordinInfoR.do?'+urlencode({'ordinSeq':seq,'ordinId':values.get('ordinId',''),'chrClsCd':'010202','gubun':values.get('gubun','KLAW')})
  b=get(DIR/f'{seq}_본문.html',bodyurl);t=lxml.html.fromstring(b.decode('utf-8'));articles=[]
  for e in t.xpath('//div[@class="lawcon"]'):
   labels=e.xpath('.//label')
   if labels:articles.append(dict(article=''.join(labels[0].itertext()).strip(),text=re.sub(r'\s+',' ',e.text_content()).strip()))
  if not articles:raise ValueError('조례 본문 미확인')
  r.update(name=values.get('ordinNm',q),sequence=seq,ordin_id=values.get('ordinId'),effective=effective,metadata=meta,
           articles=articles,source=source,body_source=bodyurl,sha256=hashlib.sha256(b).hexdigest(),
           status='본문 취득·시행일 확인' if effective and effective<='20260909' and values.get('nwYn')=='Y' else '현행 여부 검토 필요')
 except Exception as e:r.update(status='취득 확인 필요',error=str(e),source=url)
 return r
if __name__=='__main__':
 items=json.loads((ROOT/'자치법규_수집대상.json').read_text(encoding='utf-8'));results=[]
 with ThreadPoolExecutor(max_workers=3) as pool:
  for f in as_completed([pool.submit(one,x) for x in items]):
   results.append(f.result())
   if len(results)%50==0:print('자치법규',len(results),'/',len(items),flush=True)
 results.sort(key=lambda x:x['query']);(ROOT/'자치법규_본문원장.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
 from collections import Counter
 print(json.dumps(dict(Counter(x['status'] for x in results)),ensure_ascii=False),flush=True)
