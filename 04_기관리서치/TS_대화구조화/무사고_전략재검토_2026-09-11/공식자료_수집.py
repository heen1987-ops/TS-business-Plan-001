from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import urllib.request, json, re
from html import unescape

b=Path(__file__).resolve().parent
(b/'근거').mkdir(exist_ok=True)
urls=[
('M01','https://www.molit.go.kr/USR/NEWS/m_71/dtl.jsp?id=95090903&lcmspage=9'),
('M02','https://xn--299al2izzav4r95g5xi.kr/Action'),
('M03','https://main.kotsa.or.kr/portal/contents.do?menuCode=06020100'),
('M04','https://main.kotsa.or.kr/portal/bbs/report_list.do?menuCode=05010200'),
]
def run(item):
    code,url=item
    try:
        with urllib.request.urlopen(url,timeout=18) as response:
            status=response.status
            raw=response.read().decode('utf-8',errors='replace')
        clean=re.sub(r'<(script|style|noscript)\b[^>]*>.*?</\1>','',raw,flags=re.S|re.I)
        text='\n'.join(x.strip() for x in unescape(re.sub(r'<[^>]+>','\n',clean)).splitlines() if x.strip())
        (b/'근거'/f'{code}.html').write_text(raw,encoding='utf-8')
        (b/'근거'/f'{code}.txt').write_text(text,encoding='utf-8')
        result={'id':code,'url':url,'status':status,'retrieved':'2026-09-11','characters':len(text)}
        if code=='M01':
            result['attachments']=[a[:2000] for a in re.findall(r'<a\b[^>]*>.*?</a>',raw,flags=re.S|re.I) if any(x in a for x in ['.pdf','.hwpx','바로보기'])]
            result['body']=text[-3500:]
        elif code=='M02':result['body']=text[-5000:]
        elif code=='M04':
            result['items']=[t[:1800] for t in re.findall(r'<tr\b[^>]*>.*?</tr>',raw,flags=re.S|re.I) if '여수세계섬' in t or '위험물 사고' in t]
        return result
    except Exception as e:return {'id':code,'url':url,'error':str(e)}
with ThreadPoolExecutor(max_workers=4) as pool:results=list(pool.map(run,urls))
(b/'근거/수집기록.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(results,ensure_ascii=False,indent=2))
