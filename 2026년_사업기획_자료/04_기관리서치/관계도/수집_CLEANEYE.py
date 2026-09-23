"""클린아이 공개 기관현황의 설립근거·기능·관계기관만 추출한다."""
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.parse import urlencode
from concurrent.futures import ThreadPoolExecutor,as_completed
import json,re,time,hashlib
import lxml.html
ROOT=Path(__file__).resolve().parent;RAW=ROOT/'원천자료';DIR=RAW/'CLEANEYE';DIR.mkdir(exist_ok=True)
def one(item):
 r=dict(item);params={'entId':r['code'],'entName':r['name'],'entKind':r['kind'],'itemId':'iptSuCommStatus' if r['family']=='출자출연' else 'commStatus','itemNo':'10' if r['family']=='출자출연' else '1_1'}
 url='https://www.cleaneye.go.kr/user/'+('iptSuCommStatus' if r['family']=='출자출연' else 'empCommStatus')+'.do?'+urlencode(params)
 path=DIR/f"{r['code']}.html"
 try:
  if path.exists():b=path.read_bytes()
  else:
   with urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=30) as response:b=response.read()
   path.write_bytes(b);time.sleep(.12)
  t=lxml.html.fromstring(b.decode('utf-8'));fields={}
  for tr in t.xpath('//tr'):
   th=tr.xpath('./th');td=tr.xpath('./td')
   if len(th)==1 and td:
    label=re.sub(r'\s+','',th[0].text_content())
    if label in ['기관소개','설립근거','관계기관','주요기능','설립일','홈페이지']:
     fields[label]='\n'.join(re.sub(r'\s+',' ',x).strip() for x in td[0].text_content().splitlines() if x.strip())
  if not fields:raise ValueError('대상 공시 필드 없음')
  r.update(fields=fields,source=url,retrieved='2026-09-09',sha256=hashlib.sha256(b).hexdigest(),status='공시 추출')
 except Exception as e:r.update(status='취득 확인 필요',error=str(e))
 return r
if __name__=='__main__':
 pub=json.loads((RAW/'cleaneye_ent_list.json').read_text(encoding='utf-8'))['listEnt']
 ipt=json.loads((RAW/'cleaneye_ipt_search.json').read_text(encoding='utf-8'))['data']
 items=[dict(code=o['itemId'],name=o['itemNm'],kind=o['topItem'],family='지방공기업') for o in pub]
 items += [dict(code=o['insttCode'],name=o['insttNm'],kind=o['entKind'],family='출자출연') for o in ipt]
 results=[]
 with ThreadPoolExecutor(max_workers=3) as pool:
  for f in as_completed([pool.submit(one,o) for o in items]):
   results.append(f.result())
   if len(results)%100==0:print('지방기관',len(results),'/',len(items),flush=True)
 results.sort(key=lambda x:x['code']);(ROOT/'CLEANEYE_기관별_근거.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
 from collections import Counter
 print(json.dumps(dict(Counter(o['status'] for o in results)),ensure_ascii=False),flush=True)
 print('설립근거 필드',sum(bool(o.get('fields',{}).get('설립근거','')) for o in results),flush=True)
