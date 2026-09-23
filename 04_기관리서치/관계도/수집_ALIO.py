"""공개 ALIO 일반현황 공시에서 기관 설립근거와 주요기능만 추출한다."""
from pathlib import Path
from urllib.request import Request, urlopen
from concurrent.futures import ThreadPoolExecutor, as_completed
import json, re, time, hashlib
import lxml.html

ROOT=Path(__file__).resolve().parent
RAW=ROOT/'원천자료'
DIR=RAW/'ALIO';DIR.mkdir(exist_ok=True)

def get(path,url,payload=None):
    if path.exists(): return path.read_bytes()
    req=Request(url,data=json.dumps(payload).encode() if payload is not None else None,
                headers={'User-Agent':'Mozilla/5.0','Content-Type':'application/json'})
    with urlopen(req,timeout=35) as response: data=response.read()
    path.write_bytes(data);time.sleep(.12)
    return data

def extract(data):
    t=lxml.html.fromstring(data.decode('utf-8'))
    for x in t.xpath('//script|//style'):x.drop_tree()
    text='\n'.join(re.sub(r'\s+',' ',x).strip() for x in t.text_content().splitlines() if x.strip())
    # 수정이력은 제외하고 기관소개 이후 본문의 필드 경계를 사용한다.
    text=text[text.find('◈ 기관소개'):] if '◈ 기관소개' in text else text
    def field(start,end):
        m=re.search(start+r'\s*(.*?)\s*'+end,text,re.S)
        return m.group(1).strip() if m else ''
    return dict(founding=field(r'-\s*설립근거',r'-\s*설립목적'),
                purpose=field(r'-\s*설립목적',r'-\s*주무기관'),
                ministry_in_report=field(r'-\s*주무기관',r'-\s*홈페이지'),
                functions=field(r'◈\s*주요\s*기능\s*및\s*역할',r'◈\s*경영목표'))

def one(org):
    code=org['apbaId'];result=dict(org)
    try:
        param={'pageNo':1,'apbaId':code,'apbaType':org['apbaType'],'reportFormRootNo':'10105',
               'search_word':'','search_flag':'','bid_type':'','enfc_istt':''}
        body=get(DIR/f'{code}_reports.json','https://www.alio.go.kr/item/itemReportListSusi.json',param)
        reports=json.loads(body)['data']['result']
        if not reports: raise ValueError('일반현황 공시 없음')
        report=reports[0];seq=report['disclosureNo']
        url=f'https://www.alio.go.kr/upload/disclosure/{seq[:4]}/{seq[4:6]}/{seq[6:8]}/{seq}/doc.html'
        doc=get(DIR/f'{code}_{seq}.html',url)
        result.update(extract(doc));result.update(source=url,report=report,sha256=hashlib.sha256(doc).hexdigest())
        result['status']='공시 추출' if result['founding'] else '설립근거 파싱 확인 필요'
    except Exception as e: result.update(status='취득 실패',error=str(e))
    return result

if __name__=='__main__':
    orgs=json.loads((RAW/'alio_list.json').read_text(encoding='utf-8'))['data']['organList']
    results=[]
    with ThreadPoolExecutor(max_workers=3) as pool:
        for future in as_completed([pool.submit(one,o) for o in orgs]):
            results.append(future.result())
            if len(results)%25==0:print('완료',len(results),'/',len(orgs),flush=True)
    results.sort(key=lambda x:x['apbaId'])
    (ROOT/'ALIO_기관별_근거.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
    from collections import Counter
    print(json.dumps(dict(Counter(x['status'] for x in results)),ensure_ascii=False),flush=True)
