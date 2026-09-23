"""공공 PMS 조사 문서·출처·보존본의 참조 무결성을 점검한다. 사실의 법적 정확성을 자동 판정하지 않는다."""
from pathlib import Path
import json, re, hashlib, sys
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
check("후속조사 ID 01~15 연결",set(re.findall(r"\| (PMS-Q\d{2}) \|",queue))=={f"PMS-Q{i:02d}" for i in range(1,16)})
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
raw=json.loads((ROOT/"대화원문_2차.json").read_text(encoding="utf-8"))
ledger=json.loads((ROOT/"대화_요구사항원장.json").read_text(encoding="utf-8"))
turns=raw["turns"]
turn_ids={t["id"] for t in turns}
reqs=ledger["requirements"]
designs=ledger["designs"]
claims=ledger["unverified_claims"]
req_ids={r["id"] for r in reqs}
design_ids={d["id"] for d in designs}
structured=(ROOT/"공공PMS_전체구조화_2026-09-09.md").read_text(encoding="utf-8")
trace=(ROOT/"대화확인_변경점과_요구사항추적표.md").read_text(encoding="utf-8")
check("대화 조회 10건·페이지 종료 상태",len(turns)==10 and turn_ids=={f"PMS-T{i:02d}" for i in range(1,11)} and raw["reader_page"]["hasMore"] is False and raw["reader_page"]["nextCursor"] is None and all(t["user_text"] and t["assistant_text"] for t in turns))
raw_users={t["id"]:(t["source_turn_id"],t["user_text"]) for t in turns}
ledger_users={t["id"]:(t["source_turn_id"],t["user_text"]) for t in ledger["turns"]}
check("보존본과 요구원장의 사용자 발언 일치",raw_users==ledger_users)
check("요구 20건 ID·원발언 참조",len(reqs)==20 and req_ids=={f"PMS-R{i:02d}" for i in range(1,21)} and all(r["turn_ids"] and set(r["turn_ids"])<=turn_ids for r in reqs))
check("사용자 발언 10건 모두 요구에 연결",set().union(*(set(r["turn_ids"]) for r in reqs))==turn_ids)
check("설계 18건 ID·원발언 참조",len(designs)==18 and design_ids=={f"PMS-D{i:02d}" for i in range(1,19)} and all(d["turn_ids"] and set(d["turn_ids"])<=turn_ids for d in designs))
check("요구의 기능·설계 연결과 원장 상태",all(r["feature_id"] and r["design_id"] in design_ids and r["implementation_status"]=="미구현" for r in reqs) and all(d["approval_status"]=="사용자 최종 승인 미확인" for d in designs))
missing_trace=[]
for r in reqs:
    if not any(all(token in line for token in [r["id"],r["feature_id"],r["design_id"],*r["turn_ids"]]) for line in trace.splitlines() if line.startswith("| ")):
        missing_trace.append(r["id"])
check("추적표의 요구·기능·설계·발언 연결",not missing_trace,missing_trace)
claim_ids={x["id"] for x in claims}
check("미검증 주장 6건과 구현·시험 구별",len(claims)==6 and claim_ids=={f"PMS-C{i:02d}" for i in range(1,7)} and all(x["status"] and set(x["turn_ids"])<=turn_ids for x in claims) and raw["attachments"]==[] and "24개" in structured and "미확인 주장" in structured)
ac_ids=set(re.findall(r"\| (PMS-AC\d{2}) \|",structured))
check("수용 시나리오 14건·실행 결과 아님 표기",ac_ids=={f"PMS-AC{i:02d}" for i in range(1,15)} and "제품 시험을 수행한 결과가 아니다" in structured)
phase_by_id={r["id"]:r["proposed_phase"] for r in reqs}
check("기본 만족도·수행이력·레퍼런스 초기 범위 보존",all(phase_by_id[r]=="1차" for r in ["PMS-R06","PMS-R09","PMS-R17"]) and "기본 만족도" in structured and "공식 기업등급" in structured)
backup=ROOT/"이력"/"2026-09-09_구조화추가_이전"
manifest=json.loads((backup/"보존목록.json").read_text(encoding="utf-8"))
check("이전 문서 7개 보존 해시",len(manifest)==7 and all(hashlib.sha256((backup/x["path"]).read_bytes()).hexdigest()==x["sha256"] for x in manifest))
s01=next(x for x in items if x["id"]=="PMS-S01")
check("출처 S01의 대화·요구원장·조회범위 연결",s01["url"].endswith(raw["conversation_id"]) and (ROOT/s01["local_capture"]).exists() and (ROOT/s01["requirements_ledger"]).exists() and s01["review_history"][-1]["user_turn_count"]==10)
old_sources=json.loads((backup/"출처원장.json").read_text(encoding="utf-8"))["sources"]
check("기존 외부 출처의 검증 수준 보존",{x["id"]:x for x in items if x["id"]!="PMS-S01"}=={x["id"]:x for x in old_sources if x["id"]!="PMS-S01"})
all_named=set(re.findall(r"PMS-(?:S|Q|T|R|D|C|AC)\d{2}",structured+"\n"+trace))
known=ids|{f"PMS-Q{i:02d}" for i in range(1,16)}|turn_ids|req_ids|design_ids|claim_ids|ac_ids
check("구조화 문서의 근거·요구·조치 ID 존재",all_named<=known,sorted(all_named-known))
result={"as_of":"2026-09-09","revision":"v0.2","scope":"문서·대화·요구추적·참조·보존 무결성만 검사. 수용 시나리오의 제품 실행, 현행법 전수·AI 성능·실증·독립 검증은 제외.","passed":all(x["passed"] for x in checks),"checks":checks}
(ROOT/"검증결과.json").write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps(result,ensure_ascii=False,indent=2))
sys.exit(0 if result["passed"] else 1)
