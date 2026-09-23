"""국가법령정보센터 공개 현행법령 링크와 본문을 보존한다. API 키 불필요."""
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.parse import quote,urljoin,urlparse,parse_qs,urlencode
from concurrent.futures import ThreadPoolExecutor,as_completed
import json,re,time,hashlib
import lxml.html
ROOT=Path(__file__).resolve().parent;DIR=ROOT/'원천자료'/'법령';DIR.mkdir(exist_ok=True)
TODAY='20260909'
def key(s):return re.sub('[^가-힣A-Za-z0-9]','',s)
def get(file,url):
 if file.exists():return file.read_bytes()
 req=Request(url,headers={'User-Agent':'Mozilla/5.0'})
 with urlopen(req,timeout=30) as response: data=response.read()
 file.write_bytes(data);time.sleep(.12);return data
def one(item):
 r=dict(item);q=item['query'];k=key(q);url='https://www.law.go.kr/법령/'+quote(q,safe='');r['url']=url
 try:
  b=get(DIR/f'{k}_링크.html',quote(url,safe=':/?=&%'));tree=lxml.html.fromstring(b.decode('utf-8'))
  frames=tree.xpath('//iframe/@src')
  if not frames:raise ValueError('현행 법령 링크를 해석하지 못함(법령 부존재·명칭·사이트 응답 재확인)')
  frame=urljoin('https://www.law.go.kr',frames[0]);params={x:v[0] for x,v in parse_qs(urlparse(frame).query).items()}
  if not params.get('lsiSeq'):raise ValueError('법령 일련번호 없음')
  params.update(efYn='Y',nwJoYnInfo='Y',chrClsCd='010202',ancYnChk='0')
  bodyurl='https://www.law.go.kr/LSW/lsInfoR.do?'+urlencode(params)
  body=get(DIR/f"{params['lsiSeq']}_{params.get('efYd','')}_본문.html",bodyurl)
  t=lxml.html.fromstring(body.decode('utf-8'));sections=[]
  for e in t.xpath('//div[@class="lawcon"]'):
   labels=[''.join(label.itertext()) for label in e.xpath('.//label')];txt=re.sub(r'\s+',' ',e.text_content()).strip()
   if labels: sections.append({'article':labels[0].strip(),'text':txt})
  if not sections:raise ValueError('법령 본문 조문 미취득')
  titles=t.xpath('//input[@id="lsNm"]/@value') or t.xpath('//*[@id="conTop"]/h2/text()');title=titles[0].strip() if titles else q
  effective=params.get('efYd','');metadata=[s.strip() for s in t.xpath('//span/text()') if '[시행 ' in s]
  r.update(name=title,law_id=(t.xpath('//input[@id="lsId"]/@value') or [''])[0],sequence=params['lsiSeq'],effective=effective,metadata=metadata[:1],articles=sections,
    source=frame,body_source=bodyurl,sha256=hashlib.sha256(body).hexdigest(),
    status='본문 취득·시행일 확인' if effective and effective<=TODAY else '시행일 검토 필요',
    normalized_name_match=key(q)==key(title),retrieved='2026-09-09')
 except Exception as e:r.update(status='취득 확인 필요',error=str(e))
 return r
if __name__=='__main__':
 items=json.loads((ROOT/'법령_수집대상.json').read_text(encoding='utf-8'));results=[]
 with ThreadPoolExecutor(max_workers=3) as pool:
  for future in as_completed([pool.submit(one,x) for x in items]):
   results.append(future.result())
   if len(results)%25==0:print('법령',len(results),'/',len(items),flush=True)
 results.sort(key=lambda x:x['query']);(ROOT/'법령_본문원장.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
 from collections import Counter
 print(json.dumps(dict(Counter(x['status'] for x in results)),ensure_ascii=False),flush=True)
