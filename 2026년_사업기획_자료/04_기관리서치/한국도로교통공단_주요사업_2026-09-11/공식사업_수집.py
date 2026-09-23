from pathlib import Path
from html.parser import HTMLParser
from urllib.request import Request, urlopen
from urllib.parse import urljoin, urlsplit
from concurrent.futures import ThreadPoolExecutor, as_completed
import re, json, hashlib, sys

BASE=Path(__file__).resolve().parent
HOST='https://www.koroad.or.kr'
GROUPS=['교통안전사업','교통교육사업','교통방송사업','운전면허사업','연구개발사업','교통AI디지털사업']
class Node:
    def __init__(self,tag='',attrs=None,parent=None):
        self.tag=tag;self.attrs=dict(attrs or []);self.parent=parent;self.children=[]
    def walk(self):
        yield self
        for n in self.children:
            if isinstance(n,Node):yield from n.walk()
    def text(self):
        if self.tag in ('script','style','noscript'):return ''
        texts=[]
        for n in self.children:texts.append(n.text() if isinstance(n,Node) else n)
        if self.tag=='img' and self.attrs.get('alt'):texts.append('[이미지 대체텍스트] '+self.attrs['alt'])
        result=' '.join(texts)
        if self.tag in ('p','li','tr','h1','h2','h3','h4','h5','div','section','br'):result='\n'+result+'\n'
        return result
class Tree(HTMLParser):
    def __init__(self,s):
        super().__init__(convert_charrefs=True);self.root=Node();self.cur=self.root;self.feed(s)
    def handle_starttag(self,tag,attrs):
        n=Node(tag,attrs,self.cur);self.cur.children.append(n)
        if tag not in ('br','img','input','link','meta','hr','source','area','wbr','col','embed','param'):self.cur=n
    def handle_endtag(self,tag):
        n=self.cur
        while n.parent and n.tag!=tag:n=n.parent
        if n.parent:self.cur=n.parent
    def handle_data(self,s):self.cur.children.append(s)
def clean(s):return '\n'.join(x for x in (re.sub(r'\s+',' ',l).strip() for l in s.splitlines()) if x)
def url_of(n,base_url=HOST):
    href=n.attrs.get('href','').strip()
    if href and not href.startswith(('javascript:','#')):return urljoin(base_url,href)
    action=n.attrs.get('onclick','')
    found=re.search(r"(?:location(?:\.href)?\s*=|window\.open\()\s*['\"]([^'\"]+)",action)
    if found:return urljoin(base_url,found[1].strip())
    return None
def collect_manifest():
    tree=Tree((BASE/'공식_기준페이지.html').read_text(encoding='utf-8')).root
    manifest=[]
    for group in GROUPS:
        title=next(n for n in tree.walk() if n.tag=='h4' and clean(n.text())==group)
        buttons=[n for n in title.parent.walk() if n.tag=='button']
        for n in buttons:
            url=url_of(n)
            if url:manifest.append(dict(id='KB'+str(len(manifest)+1).zfill(2),group=group,title=clean(n.text()),url=url,level='주요사업 메뉴'))
    assert len({x['url'] for x in manifest})==len(manifest)
    (BASE/'공식메뉴_모집단.json').write_text(json.dumps({'date':'2026-09-11','source':HOST+'/main/content/view/MN03010100.do','groups':GROUPS,'count':len(manifest),'items':manifest},ensure_ascii=False,indent=2),encoding='utf-8')
    return manifest
def extract(s,base_url=HOST):
    root=Tree(s).root
    candidates=[n for n in root.walk() if n.attrs.get('id')=='content']
    content=next((n for n in candidates if 'wrapper' in n.attrs.get('class','').split()),candidates[-1] if candidates else None)
    if not content:return dict(content_found=False,text='',links=[])
    links=[]
    for n in content.walk():
        if n.tag not in ('a','button','form'):continue
        u=url_of(n,base_url)
        if u or n.attrs.get('onclick'):links.append(dict(text=clean(n.text()),url=u,action=n.attrs.get('onclick',''),css=n.attrs.get('class','')))
    return dict(content_found=True,text=clean(content.text()),links=links)
def fetch(row):
    d=dict(row);d['accessed_at']='2026-09-11'
    try:
        req=Request(row['url'],headers={'User-Agent':'Mozilla/5.0'})
        with urlopen(req,timeout=22) as response:
            data=response.read();d['http_status']=response.status;d['final_url']=response.url
        raw=data.decode('utf-8',errors='replace');d.update(extract(raw,d['final_url']))
        d['sha256']=hashlib.sha256(data).hexdigest()
        folder=BASE/'근거';folder.mkdir(exist_ok=True)
        (folder/(row['id']+'.html')).write_text(raw,encoding='utf-8')
        (folder/(row['id']+'.txt')).write_text(d['text'],encoding='utf-8')
        d['text_file']='근거/'+row['id']+'.txt';d['text_chars']=len(d.pop('text'))
        d['status']='본문 수집' if d['content_found'] and d['text_chars']>30 else '본문 확인 필요'
    except Exception as e:d['status']='수집 실패';d['error']=str(e)
    return d
def run(rows,name):
    results=[]
    with ThreadPoolExecutor(max_workers=4) as executor:
        futures={executor.submit(fetch,row):row for row in rows}
        for f in as_completed(futures):
            r=f.result();results.append(r);print(r['id'],r['status'],r.get('text_chars',0),flush=True)
    results.sort(key=lambda x:x['id'])
    (BASE/name).write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
    return results
if __name__=='__main__':
    if len(sys.argv)>1 and sys.argv[1]=='--reparse':
        results=json.loads((BASE/'공식메뉴_수집결과.json').read_text(encoding='utf-8'))
        for d in results:
            raw=(BASE/'근거'/(d['id']+'.html')).read_text(encoding='utf-8');d.update(extract(raw,d['final_url']))
            (BASE/'근거'/(d['id']+'.txt')).write_text(d['text'],encoding='utf-8');d['text_chars']=len(d.pop('text'))
            print(d['id'],d['text_chars'],len(d['links']))
        (BASE/'공식메뉴_수집결과.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
    elif len(sys.argv)>1:
        rows=json.loads((BASE/sys.argv[1]).read_text(encoding='utf-8'));run(rows,sys.argv[2])
    else:
        rows=collect_manifest();print('메뉴',len(rows),flush=True);run(rows,'공식메뉴_수집결과.json')
