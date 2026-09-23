"""이번 조사에서 사용한 공개 HTML 근거를 보존한다. 취득 성공은 내용·현행성 검증이 아니다."""
from pathlib import Path
from urllib.request import Request, urlopen
from concurrent.futures import ThreadPoolExecutor
import json, hashlib
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parent
SOURCES = json.loads((ROOT / "출처원장.json").read_text(encoding="utf-8"))["sources"]
DEST = ROOT / "근거자료"
DEST.mkdir(exist_ok=True)

def capture(item):
    target = item.get("body_url", item.get("url", ""))
    record = {"id": item["id"], "url": target, "captured_at": datetime.now(timezone.utc).isoformat()}
    if not target.startswith("https://") or item["id"] == "PMS-S10":
        record["status"] = "별도 대화·로컬 참조 또는 미열람 첨부로 취득 제외"
        return record
    path = DEST / (item["id"] + ".html")
    try:
        if path.exists():
            data = path.read_bytes()
            record["status"] = "기존 보존본 유지·신규 취득 아님"
        else:
            request = Request(target, headers={"User-Agent": "Mozilla/5.0"})
            with urlopen(request, timeout=25) as response:
                data = response.read()
                record["content_type"] = response.headers.get("Content-Type", "")
                record["resolved_url"] = response.url
            path.write_bytes(data)
            record["status"] = "HTTP 응답 보존·본문 검토와 구별"
        record.update(path=str(path.relative_to(ROOT)), bytes=len(data), sha256=hashlib.sha256(data).hexdigest())
    except Exception as exc:
        record["status"] = "취득 실패"
        record["error"] = str(exc)
    return record

with ThreadPoolExecutor(max_workers=3) as pool:
    results = list(pool.map(capture, SOURCES))
(ROOT / "취득결과.json").write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps([{"id": r["id"], "status": r["status"], "bytes": r.get("bytes")} for r in results], ensure_ascii=False))

