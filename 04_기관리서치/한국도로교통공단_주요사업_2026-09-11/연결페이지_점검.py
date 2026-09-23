from pathlib import Path
import json,re
from 공식사업_수집 import Tree,clean
B=Path(__file__).resolve().parent
rows=json.loads((B/'하위항목_수집결과.json').read_text(encoding='utf-8'))
for r in rows:
    if r['content_found']:continue
    root=Tree((B/'근거'/(r['id']+'.html')).read_text(encoding='utf-8')).root
    title=next((clean(n.text()) for n in root.walk() if n.tag=='title'),'')
    r['response_title']=title
    if 'safedriving.or.kr' in r['url']:
        options=[n for n in root.walk() if 'contents' in n.attrs.get('class','').split()]
        body=max(options,key=lambda n:len(clean(n.text()))) if options else root
    else:body=root
    text=clean(body.text());(B/'근거'/(r['id']+'_전체텍스트.txt')).write_text(text,encoding='utf-8')
    r['status']='연결 안내 본문 수집' if text else '본문 확인 필요'
    r['external_text_file']='근거/'+r['id']+'_전체텍스트.txt'
    r['external_text_chars']=len(text)
    print(r['id'],title,len(text),r['status'])
    if r['id'] not in ('KC15',):print(text[:1600])
(B/'하위항목_수집결과.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
