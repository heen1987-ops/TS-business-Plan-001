"""등록한 공개 출처의 응답을 보존한다. 성공한 버전은 덮어쓰지 않는다."""
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.parse import urlsplit
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime,timezone
import json,hashlib

ROOT=Path(__file__).resolve().parents[1]

def acquire(s):
    if s.get('archived_path'): return s,None
    if s['id']=='DRS-018':
        s['archive_status']='서비스 본문 접근 실패·재시도 제외'
        return s,None
    try:
        req=Request(s['url'],headers={'User-Agent':'Mozilla/5.0 (compatible; TS-Research-Archive/1.0)'})
        with urlopen(req,timeout=22) as r:
            data=r.read(15_000_001)
            if len(data)>15_000_000:raise ValueError('15MB 보존 한도 초과')
            if not data:raise ValueError('빈 응답')
            final=r.geturl()
            if urlsplit(final).scheme not in ['http','https']:raise ValueError('허용하지 않는 리다이렉트')
            is_pdf=data.startswith(b'%PDF-')
            digest=hashlib.sha256(data).hexdigest()
            rel=f"04_출처아카이브/원문/{s['id']}/2026-09-09/{digest[:12]}."+('pdf' if is_pdf else 'html.txt')
            s.update(archived_path=rel,sha256=digest,byte_size=len(data),content_type=r.headers.get('Content-Type'),final_url=final,http_status=r.status,acquired_at=datetime.now(timezone.utc).isoformat(),archive_status='응답 보존·본문 적합성은 검토 상태 별도')
            return s,data
    except Exception as e:
        s.update(archive_status='수집 실패',archive_error=type(e).__name__+': '+str(e),acquired_at=datetime.now(timezone.utc).isoformat())
        return s,None

def main():
    p=ROOT/'04_출처아카이브/출처원장.json'
    d=json.loads(p.read_text(encoding='utf-8'))
    # 네트워크 읽기는 병렬, 파일 기록은 이 실행에서 순서대로 수행한다.
    with ThreadPoolExecutor(max_workers=4) as pool: result=list(pool.map(acquire,d['sources']))
    for s,data in result:
        if data is not None:
            out=ROOT/s['archived_path'];out.parent.mkdir(parents=True,exist_ok=True)
            if out.exists():assert hashlib.sha256(out.read_bytes()).hexdigest()==s['sha256']
            else:out.write_bytes(data)
    d['sources']=[x[0] for x in result]
    p.write_text(json.dumps(d,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'등록':len(result),'응답보존':sum(bool(s.get('archived_path')) for s,_ in result),'미보존':[{'id':s['id'],'상태':s['archive_status']} for s,_ in result if not s.get('archived_path')]},ensure_ascii=False))

if __name__=='__main__':main()
