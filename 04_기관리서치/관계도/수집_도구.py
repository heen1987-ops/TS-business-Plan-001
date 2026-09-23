"""공식 공개 자료를 로컬에 보존하고 파싱한다. 인증정보를 사용하지 않는다."""
from pathlib import Path
from urllib.request import Request, urlopen
from concurrent.futures import ThreadPoolExecutor, as_completed
import json, hashlib, time

ROOT = Path(__file__).resolve().parent
RAW = ROOT / '원천자료'
RAW.mkdir(parents=True, exist_ok=True)

def fetch(name, url):
    target = RAW / name
    if target.exists():
        return {'file': name, 'url': url, 'cached': True, 'bytes': target.stat().st_size}
    try:
        req = Request(url, headers={'User-Agent': 'Mozilla/5.0 (compatible; public-policy-research)'})
        with urlopen(req, timeout=35) as response:
            data = response.read()
            target.write_bytes(data)
            return {'file': name, 'url': url, 'status': response.status, 'bytes': len(data),
                    'sha256': hashlib.sha256(data).hexdigest(), 'retrieved_at': time.strftime('%Y-%m-%dT%H:%M:%S%z')}
    except Exception as error:
        return {'file': name, 'url': url, 'error': str(error)}

def batch(items):
    records=[]
    with ThreadPoolExecutor(max_workers=3) as pool:
        futures=[pool.submit(fetch, name,url) for name,url in items]
        for future in as_completed(futures):
            record=future.result();records.append(record)
            print(json.dumps(record,ensure_ascii=False),flush=True)
    return records

if __name__ == '__main__':
    items=[
        ('cleaneye_public.html','https://www.cleaneye.go.kr/siteGuide/pubCompStatus.do'),
        ('cleaneye_invested.html','https://www.cleaneye.go.kr/siteGuide/iptCompStatus.do'),
        ('central_1.html','https://www.org.go.kr/cop/bbs/getInstiChartList.do'),
        ('alio_organ.html','https://www.alio.go.kr/item/itemOrganList.do?reportFormRootNo=B1010'),
        ('mofe_2026.html','https://mofe.go.kr/nw/nes/detailNesDtaView.do?menuNo=4010100&searchNttId1=MOSF_000000000076666'),
        ('law_ts.html','https://www.law.go.kr/LSW/lsInfoR.do?lsiSeq=198271'),
    ]
    records=batch(items)
    (RAW/'취득_기록.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
