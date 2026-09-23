"""공공 PMS 조사 문서·출처·보존본의 참조 무결성을 점검한다. 사실의 법적 정확성을 자동 판정하지 않는다."""
from pathlib import Path
import json, re, hashlib
ROOT=Path(__file__).resolve().parent
checks=[]
def check(name, passed, details=None):
    checks.append({"check":name,"passed":bool(passed),"details":details})

source=json.loads((ROOT/"출처원장.json").read_text(encoding="utf-8"))
items=source["sources"]
ids={s["id"] for s in items}
check("출처 ID 중복 없음",len(ids)==len(items),len(items))
check("출처 필수 필드",all(all(k in s and s[k] for k in ["id","title","kind","published_or_effective","location","status","finding","limitation","retrieved_or_reviewed"]) for s in items))
check("사업 적용 미검증 상태 유지",all(s["application_verified"] is False for s in items))
report=(ROOT/"공공PMS_병목관리_조사보고서_2026-09-09.md").read_text(encoding="utf-8")
refs=set(re.findall(r"PMS-S\d{2}",report))
check("보고서 출처 참조 존재",refs<=ids,sorted(refs-ids))
check("P01~P07 검토 존재",all(f"P{i:02d}" in report for i in range(1,8)))
queue=(ROOT/"후속조사_대기열.md").read_text(encoding="utf-8")
check("후속조사 12건",len(set(re.findall(r"\| (PMS-Q\d{2}) \|",queue)))==12)
check("한글 파일 UTF-8·대체문자 없음",all("\ufffd" not in p.read_text(encoding="utf-8") for p in ROOT.glob("*.md")))
check("미검증·제한사항 표기 존재",all(s in report for s in ["실제 사업 실증은 수행하지 않았다","독립 평가위원","기존 신규사업 5건","비중복 미확정"]))
bad=[]
for p in ROOT.glob("*.md"):
    for match in re.finditer(r"\]\(([^)]+)\)",p.read_text(encoding="utf-8")):
        href=match.group(1).strip("<>")
        if re.match(r"^[a-z]+(?:-[a-z]+)*://",href) or href.startswith("#"): continue
        if not (p.parent/href.split("#",1)[0]).exists(): bad.append({"file":p.name,"target":href})
check("주제 문서 로컬 링크 존재",not bad,bad)
captures=json.loads((ROOT/"취득결과.json").read_text(encoding="utf-8"))
saved=[r for r in captures if "path" in r]
check("공개 HTML 13개 보존",len(saved)==13,len(saved))
check("보존본 SHA-256 일치",all(hashlib.sha256((ROOT/r["path"]).read_bytes()).hexdigest()==r["sha256"] for r in saved))
markers={"PMS-S03":["제20조","제29조","사용자 만족도"],"PMS-S04":["E-GENE","PMS"],"PMS-S05":["WATCH2","산출물"],"PMS-S06":["42.1503","14 calendar days"],"PMS-S07":["2026. 8. 28.","제57조"],"PMS-S08":["2026. 4. 20.","제2조"],"PMS-S09":["제6조","국토교통부장관"],"PMS-S12":["2026. 7. 21.","제33조"],"PMS-S13":["2026. 7. 21.","제35조"]}
missing=[]
for key, tokens in markers.items():
    raw=(ROOT/"근거자료"/f"{key}.html").read_text(encoding="utf-8",errors="replace")
    if not all(t in raw for t in tokens):missing.append(key)
check("핵심 근거의 본문·시행일 표식 존재",not missing,missing)
project=ROOT.parent.parent
protected={
"05_통합사업기획/사업포트폴리오.json":"B842402EEB5462DF92D87CC9646F12F4D7C929F25679108D9DB41BF27641CDF4",
"04_기관리서치/관계도/기관법령_관계원장.json":"52B9A8293B68650A2CA19F1A42B336099F328A90E67645129DDB07DF51008BC1"}
check("기존 원장 보존",all(hashlib.sha256((project/p).read_bytes()).hexdigest().upper()==h for p,h in protected.items()),"연결문서 편집 직전 해시와 비교")
result={"as_of":"2026-09-09","scope":"문서·참조·보존 무결성만 검사. 현행법 전수·제품 성능·실증·독립 검증은 제외.","passed":all(x["passed"] for x in checks),"checks":checks}
(ROOT/"검증결과.json").write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps(result,ensure_ascii=False,indent=2))
