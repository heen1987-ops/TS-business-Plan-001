"""v1.0에서 v1.1로의 일회성 설계 확장. 다시 실행하지 않는다."""
from pathlib import Path
import json, re
R=Path(__file__).resolve().parents[1]
def read(n): return (R/n).read_text(encoding="utf-8")
def write(n,s): (R/n).write_text(s,encoding="utf-8")
def replace(s,a,b):
    assert a in s, a[:140]
    return s.replace(a,b)
d=json.loads(read("설명자료_데이터.json"))
assert d["version"]=="설명자료 v1.0"
ext=json.loads(read("설계확장_데이터.json"))
full=json.loads(read("대화전체_설계계속_2026-09-10.json"))
assert len(full["turns"])==21
assert all(any(x["source_turn_id"]==t["source_turn_id"] and x["user_text"]==t["user_text"] for x in full["turns"]) for t in d["turns"])
d["version"]="설명자료 v1.1"
d["schema_version"]="1.1"
d["origin"]="사용자 발언 21건. 최신 6건의 연차계획·다면평가·업무 상세화를 반영. 기관 결정·효과 실증 아님."
d["definition"]="1차년도에 AI-PMS를 구축해 공동 업무와 근거를 축적하고, 2차년도에 CCK의 감리 검사엔진을 구축합니다. 3차년도에는 다면평가·기업 레퍼런스·성과환류를 고도화합니다. 공통 검사·검증 구조는 장기 설계이며 실제 엔진 보유·성능은 미확인입니다."
d["turns"]=[{k:t[k] for k in ["id","source_turn_id","user_text"]} for t in full["turns"]]
d["new_requirements"]+=ext["new_requirements"]
for k in ["years","business_stages","raters","cadence"]: d[k]=ext[k]
phase={
"F-07":"1차년도 기초 검토 / 2차년도 검사엔진",
"F-08":"1차년도 기본 이슈 / 2차년도 구조화 Finding",
"F-11":"2차년도",
"F-12":"1차년도 기초 이력 / 3차년도 고도화",
"F-13":"1차년도 주기적 다면평가 / 3차년도 분석",
"F-14":"1차년도 핵심 / 3차년도 성과 연계",
"F-16":"3차년도","F-17":"3차년도"}
for f in d["features"]: f["phase"]=phase.get(f["id"],"1차년도")
f=d["features"][1];f["input"]="원문·적용 의무·책임·기한·완료조건";f["output"]="공동 검토·권한자 확정 Baseline 버전"
f=d["features"][12];f["name"]="주기적 만족도·다면평가";f["actor"]="담당·검토·관리·결재·업무부서·사용자";f["input"]="관찰 범위·시점·목적별 항목·근거";f["boundary"]="관찰 불가·미응답은 0점 아님"
d["steps"][0]["who"]="기관·수행사·승인권자"
d["steps"][0]["action"]="원문에서 추출한 요구·책임·기한·완료조건을 공동 검토하고 권한자가 기준 버전을 확정합니다."
d["steps"][3]["ai"]="1차년도 기초 검토를 지원하고, 2차년도에는 고정 기준·증거·Test로 구조화 검사 후보를 만듭니다."
d["model_note"]+=" 비용배분 3년은 개발 3개년과 별개이며 특정 운영기간의 가상 계산이다. 연차별 성능·효과를 선반영하지 않는다."
write("설명자료_데이터.json",json.dumps(d,ensure_ascii=False,indent=2))

# 새 데이터 영역을 기존 생성기의 동일 데이터에서 렌더링한다.
p=read("생성_설명자료.py")
insert="""
tokens["YEARBUTTONS"]="".join('<button type="button" data-year="'+y["id"]+'" aria-pressed="'+str(i==0).lower()+'" aria-controls="year-'+y["id"]+'">'+E(y["title"])+' · '+E(y["goal"])+'</button>' for i,y in enumerate(D["years"]))
tokens["YEARPANELS"]="".join('<article class="year-panel" id="year-'+y["id"]+'" aria-labelledby="year-title-'+y["id"]+'"><span class="tag proposal">'+E(y["id"])+' · 개발 연차</span><h3 id="year-title-'+y["id"]+'">'+E(y["title"])+' '+E(y["goal"])+'</h3><p>'+E(y["message"])+'</p><div class="year-grid"><ul>'+''.join('<li>'+E(s)+'</li>' for s in y["scope"])+'</ul><dl><dt>남길 결과</dt><dd>'+E(y["deliverable"])+'</dd><dt>다음 연차의 입력</dt><dd>'+E(y["handoff"])+'</dd></dl></div><p class="gate"><strong>다음으로 넘어갈 조건</strong><br>'+E(y["gate"])+'</p><p><strong>실측할 편익</strong> · '+E(y["benefit"])+'</p></article>' for y in D["years"])
tokens["BUSINESSSTAGES"]="".join('<details class="business-stage" id="business-'+s["id"]+'"><summary>'+E(s["id"])+' · '+E(s["name"])+'</summary><div><p><strong>'+E(s["purpose"])+'</strong></p><p><b>입력</b> · '+E(s["input"])+'</p><p class="process-line">'+E(s["flow"])+'</p><p><b>남는 결과</b> · '+E(s["output"])+'</p><p><b>처리 규칙</b> · '+E(s["boundary"])+'</p><p><b>개발 범위</b> · '+E(s["year"])+'</p><p class="small">'+E(s["example"])+'</p></div></details>' for s in D["business_stages"])
tokens["RATERS"]=rows([[r["role"],r["observes"],r["evidence"],r["limit"]] for r in D["raters"]])
tokens["CADENCE"]=rows(D["cadence"])
"""
p=replace(p,'specs=[("projects"',insert+'\nspecs=[("projects"')
p=p.replace("설명자료 v1.0","설명자료 v1.1").replace("사용자 발언 15건","사용자 발언 21건").replace("발언 15건","발언 21건")
p=replace(p,"새로운 5건은 [대화 추가 보존본](대화추가_2026-09-10.json)에 기록.","이전 추가 5건은 [기존 보존본](대화추가_2026-09-10.json), 이번 6건을 포함한 전체는 [21개 턴 보존본](대화전체_설계계속_2026-09-10.json)에 기록.")
p=replace(p,"확장 R21~25는","확장 R21~33은")
p=replace(p,"기본 만족도·기본 수행이력·인수인계·유지관리 핵심은 1차에 포함한다.","주기적 만족도·다면평가 기초·기본 수행이력·인수인계·유지관리 핵심은 1차년도에 포함한다.")
start=p.index('{mdtable(["단계","포함 범위 제안","진입·완료 조건"]')
end=p.index("\n\n협업·컨소시엄",start)
p=p[:start]+'''개발 연차 Y1~Y3와 사업 내부 업무 단계 B1~B3를 구분한다. 실제 시작연도·예산은 미확정이다.

{mdtable(["연차","목표","범위","산출물","다음 연차 조건"],[
[y["title"],y["goal"]," · ".join(y["scope"]),y["deliverable"],y["gate"]] for y in D["years"]
])}

1차년도는 기초 AI 문서 지원과 공동 업무 완결에 집중한다. 2차년도에 버전별 검사·Finding·감리 기준팩·독립 검토를 구축하고, 3차년도에 레퍼런스·평가·성과환류를 고도화한다. 전체를 독립 R&D로 재분류하지 않는다.
''' +p[end:]
p=replace(p,"## 12. 사용 방법과 다음 입력","""## 12. 이번에 구체화한 업무 설계와 다면평가

{mdtable(["업무 단계","입력","처리","결과","개발 범위"],[[s["id"]+" "+s["name"],s["input"],s["flow"],s["output"],s["year"]] for s in D["business_stages"]])}

{mdtable(["평가자","관찰 영역","근거","경계"],[[r["role"],r["observes"],r["evidence"],r["limit"]] for r in D["raters"]])}

{mdtable(["평가 시점","수집","집계 규칙"],D["cadence"])}

평가 대상·주기·역할·질문을 착수에 정하고 주기적 점검·산출물·시험·종료·운영에 연결한다. 수행 사실, 검사·감리 결과, 주관적 평가를 분리해 보여준다. 관찰 불가·미응답은 0점이 아니다.

우수·미흡 수행은 확인된 근거·영향·소명·개선 결과와 함께 레퍼런스에 남긴다. 내부 점수 증감도 사전 기준과 정정 절차가 필요하며, AI 후보·보완 횟수·지연 일수를 자동 벌점으로 바꾸지 않는다. 신규기업의 무이력은 미평가로 처리한다. 공식 입찰 가감점·제재·기관 간 공유는 별도 법적 근거와 권한을 확인한다.

구체적인 Baseline·Evidence·Finding 필드, 상태전이, 화면 5종, API 계약 초안, 수용 시나리오, 평가척도 후보와 운영 규칙은 [연차별·업무별 상세설계](CCK_Public_AI_PMS_연차별_상세설계.md)에 있다. 이 API와 제품 시나리오는 아직 구현·실행하지 않았다.

### 연차별 편익 측정

{mdtable(["연차","우선 측정할 지표"],[[y["title"],y["benefit"]] for y in D["years"]])}

기존 계산기는 하나의 운영기간에 대한 가상 계산이다. 비용배분 3년은 제품 개발 3개년과 별개다. 연차별 적용 업무량·효과 발현·순시간·추가비용을 실측하고 같은 시간을 여러 연차 효과에 중복 합산하지 않는다.

## 13. 사용 방법과 다음 입력""")
p=replace(p,'"대화추가_2026-09-10.json"]','"대화추가_2026-09-10.json","대화전체_설계계속_2026-09-10.json","설계확장_데이터.json","생성_설명자료.py","CCK_Public_AI_PMS_연차별_상세설계.md"]')
p=replace(p,'["CCK_Public_AI_PMS_설명서.html","CCK_Public_AI_PMS_설명서.md","CCK_Public_AI_PMS_아키텍처.svg"]','["CCK_Public_AI_PMS_설명서.html","CCK_Public_AI_PMS_설명서.md","CCK_Public_AI_PMS_아키텍처.svg","연차별_구조한장.svg","CCK_Public_AI_PMS_연차별_상세설계.md"]')
p=replace(p,'"source_user_turns":15,"features":17,"new_requirements":5','"source_user_turns":len(D["turns"]),"features":len(D["features"]),"new_requirements":len(D["new_requirements"])')
write("생성_설명자료.py",p)

t=read("설명서_템플릿.html").replace("설명자료 v1.0","설명자료 v1.1").replace("발언 15건","발언 21건")
t=replace(t,'<a href="#architecture"><span>05</span>','<a href="#evaluation"><span>05</span>다면평가·레퍼런스</a>\n<a href="#architecture"><span>06</span>')
t=t.replace('<a href="#benefits"><span>06</span>','<a href="#benefits"><span>07</span>').replace('<a href="#roadmap"><span>07</span>어디부터 시작할까','<a href="#roadmap"><span>08</span>3개년 개발계획').replace('<a href="#sources"><span>08</span>','<a href="#sources"><span>09</span>')
t=replace(t,'공통 엔진 → 업무별 서비스','1차 AI-PMS → 2차 검사엔진')
t=replace(t,'검사·검증 엔진 위에<br>공공사업 업무를 올립니다.','AI-PMS부터 구축하고,<br>감리 검사엔진으로 이어갑니다.')
t=replace(t,'CCK의 핵심을 검사로 본 사용자 구상을 반영했습니다. 공통 엔진은 재사용을 목표로 하는 설계이며 실제 보유 자산·성능은 확인 전입니다.','최신 방향은 1차년도 AI-PMS, 2차년도 감리 검사엔진, 3차년도 고도화입니다. 1차년도부터 기준·증거·권한·버전과 기초 평가를 축적합니다.')
t=replace(t,'기본 만족도와 수행이력은 1차부터 남깁니다.','주기적 만족도·다면평가 기초와 수행이력은 1차년도부터 남깁니다.')
t=replace(t,'AI의 상시 검사 지원과 감리사의 전문·현장 검토를 연결하는 후속 모듈입니다.','2차년도에 AI 검사엔진과 감리사의 전문·현장 검토를 연결합니다.')
t=replace(t,'<section class="section" id="audit"',"""<div class="flow-expansion">
<h3>추가 설계 · 사업 내부의 세 단계</h3><p>아래 B1~B3는 사업 업무 단계입니다. 개발 연차 Y1~Y3와 구분합니다. 1차년도에도 세 업무가 연결되며 전문 감리 검사는 2차년도에 확장합니다.</p>
@@BUSINESSSTAGES@@
<p class="inline-links"><a href="CCK_Public_AI_PMS_연차별_상세설계.md">상태·데이터·화면·API 상세설계 보기</a></p></div>
<section class="section" id="audit" """.replace('"audit" ','"audit"'))
# 위 상세 블록을 독립 section 밖 div로 두지 않고 flow 안으로 이동한다.
t=replace(t,'</section>\n\n<div class="flow-expansion">','<div class="flow-expansion">')
t=replace(t,'상태·데이터·화면·API 상세설계 보기</a></p></div>\n<section','상태·데이터·화면·API 상세설계 보기</a></p></div>\n</section>\n\n<section')
evaluation="""
<section class="section" id="evaluation" aria-labelledby="evaluation-title">
<div class="section-head"><span class="section-no">05</span><div><div class="kicker">주기적 다면평가 · 기업 레퍼런스</div><h2 id="evaluation-title">한 사람의 인상에서,<br>역할별 관찰과 근거로</h2><p>직접 담당자·중간관리자·최종 결재자·관련부서·실사용자가 자신이 관찰한 영역을 평가합니다. 기초 수집은 1차년도, 종합 활용은 3차년도에 고도화합니다.</p></div></div>
<div class="state-grid"><article><h4>수행 사실</h4><p>무엇을 맡아 언제 제출하고 어떤 품질·대응을 확인했는가</p></article><article><h4>검사·감리 결과</h4><p>어떤 범위를 어떤 근거로 확인·시정·재검증했는가</p></article><article><h4>사람의 평가</h4><p>누가 어떤 시점·관찰 범위에서 어떻게 경험했는가</p></article></div>
<div class="table-wrap evaluation-table"><table><caption>평가자마다 관찰할 수 있는 범위를 정합니다</caption><thead><tr><th scope="col">역할</th><th scope="col">평가할 영역</th><th scope="col">연결 근거</th><th scope="col">판단 경계</th></tr></thead><tbody>@@RATERS@@</tbody></table></div>
<details><summary>착수·정기·산출물·종료·운영의 평가 시점</summary><div class="table-wrap"><table><thead><tr><th scope="col">시점</th><th scope="col">수집 계획</th><th scope="col">운영 규칙</th></tr></thead><tbody>@@CADENCE@@</tbody></table></div></details>
<div class="mini-grid"><article><h3>우수·미흡 수행을 근거로 남김</h3><p>긍정적 성과와 미흡 사항, 실제 책임·소명·개선 결과를 함께 기록합니다. 가점·감점은 사전 기준과 사람의 확정·정정 절차에 연결합니다.</p></article><article><h3>신규기업에도 같은 기회</h3><p>자료가 없으면 미평가로 표시합니다. 제출 전 점검·명확한 완료조건·소명 경로를 제공하고 무이력을 저성과로 계산하지 않습니다.</p></article></div>
<div class="callout" style="margin-top:24px"><strong>관찰 불가·미응답은 0점이 아닙니다.</strong><p>주관적 점수·확정 사실을 분리하고 응답 수·관찰 범위·정정 상태를 함께 보여줍니다. 공식 입찰 가감점·제재·기관 간 공유는 별도 근거와 권한을 확인합니다.</p></div>
<p class="inline-links"><a href="CCK_Public_AI_PMS_연차별_상세설계.md">평가척도 후보·집계·소명·정정 운영 설계</a></p>
</section>
"""
t=replace(t,'<section class="section" id="architecture"',evaluation+'\n<section class="section" id="architecture"')
for ident,old,new in [("architecture","05","06"),("benefits","06","07"),("roadmap","07","08"),("sources","08","09")]:
    start=t.index('<section class="section" id="'+ident+'"')
    stop=t.index('</section>',start)
    chunk=t[start:stop].replace('class="section-no">'+old,'class="section-no">'+new)
    t=t[:start]+chunk+t[stop:]
start=t.index('<div class="section-head">',t.index('id="roadmap"'))
stop=t.index('\n<p>협업·컨소시엄',start)
t=t[:start]+"""<div class="section-head"><span class="section-no">08</span><div><div class="kicker">Y1 → Y2 → Y3</div><h2 id="roadmap-title">플랫폼을 먼저,<br>감리 검사와 성과환류를 다음으로</h2><p>실제 착수연도·예산은 미확정입니다. 연차를 선택하면 목표·기능·산출물·다음 단계 조건을 확인할 수 있습니다.</p></div></div>
<div class="year-buttons" role="group" aria-label="개발 연차 선택">@@YEARBUTTONS@@</div>
<div class="year-panels">@@YEARPANELS@@</div>
<div class="sr-only" id="year-live" aria-live="polite"></div>
<div class="callout" style="margin-top:24px"><strong>개발 연차와 업무 단계를 구분합니다.</strong><p>사업의 기준설정·증거축적·기초 검토는 1차년도부터 연결합니다. 2차년도에 전문 검사엔진을, 3차년도에 축적된 평가와 성과의 활용을 고도화합니다.</p></div>
<p class="inline-links"><a href="연차별_구조한장.svg" download>1:1 한 장 구조도 다운로드</a><a href="CCK_Public_AI_PMS_연차별_상세설계.md">연차별·업무별 상세설계</a></p>""" +t[stop:]
t=replace(t,'<noscript><p class="callout">계산기에는','<p class="small">이 계산은 하나의 운영기간을 가정합니다. 비용 배분 기본값 3년은 제품 개발 3개년과 별개이며, 2·3차년도 효과가 1차년도부터 발생한다는 뜻이 아닙니다.</p>\n<noscript><p class="callout">계산기에는')
t=replace(t,'공통 엔진→Public AI-PMS의 연결, 두 감리 경로, F-01~17 기능정의와 도입 단계는 대화 AI 제안을 종합했습니다.','사용자가 제시한 AI-PMS → 감리 검사엔진 → 고도화 방향에 맞춰 F-01~17, 다면평가와 업무 B1~B3를 종합했습니다. 상세 필드·API·평가척도는 설계 제안입니다.')
t=replace(t,'<h3>02 · CCK 검사·검증 엔진</h3>','<h3>2차년도 · CCK 감리 검사엔진</h3>')
t=replace(t,'<h3>01 · Public AI-PMS</h3>','<h3>1차년도 · Public AI-PMS</h3>')
t=replace(t,'<h3>03 · 데이터·연계 기반</h3>','<h3>공통 데이터·연계 기반</h3>')
t=replace(t,'<a href="../공공PMS_전체구조화_2026-09-09.md">기존 상세 설계 문서</a>','<a href="CCK_Public_AI_PMS_연차별_상세설계.md">최신 연차별·업무별 상세설계</a>')
write("설명서_템플릿.html",t)

css=read("설명서_스타일.css")
css+="""
/* v1.1 연차·업무·평가 설명 */
.flow-expansion{margin-top:38px}.flow-expansion>h3{font-size:23px}.process-line{padding:16px;background:#edf8f4;border-radius:8px}
.evaluation-table{margin-top:28px}.evaluation-table table{min-width:670px}
.year-buttons{display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap}.year-buttons button{flex:1 1 200px;text-align:left;font-weight:700;min-height:58px}
.year-buttons button[aria-pressed=true]{background:var(--navy);color:#fff;border-color:var(--navy)}
.year-panel{border:1px solid var(--line);background:#fff;border-radius:14px;padding:28px;margin-bottom:16px}.year-panel h3{font-size:25px;margin-top:14px}.year-grid{display:grid;grid-template-columns:1fr 1fr;gap:30px}.year-grid ul{padding-left:20px;margin:0}.year-grid dl{margin:0}.year-grid dt{font-weight:700;font-size:14px;color:var(--teal)}.year-grid dd{margin:6px 0 18px}.year-panel .gate{padding-top:18px;border-top:1px solid var(--line);margin-top:20px}
@media(max-width:760px){.year-grid{grid-template-columns:1fr;gap:20px}.year-panel{padding:21px}.year-buttons button{flex-basis:100%}.sidebar nav{gap:3px}.evaluation-table table{font-size:14px}}
@media print{.year-panel[hidden]{display:block!important}.year-panel{break-inside:avoid}.year-buttons{display:none!important}.flow-expansion{break-before:auto}}
"""
write("설명서_스타일.css",css)
js=read("설명서_동작.js")
js=replace(js,'update();})();',"""
const yearButtons=[...document.querySelectorAll("[data-year]")],yearPanels=[...document.querySelectorAll(".year-panel")];
function selectYear(id,announce=true){yearPanels.forEach(p=>p.hidden=p.id!=="year-"+id);yearButtons.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.year===id)));if(announce)$("year-live").textContent=$("year-title-"+id).textContent;}
yearButtons.forEach(b=>b.addEventListener("click",()=>selectYear(b.dataset.year)));
selectYear("Y1",false);
update();})();""")
write("설명서_동작.js",js)

svg=read("CCK_Public_AI_PMS_아키텍처.svg")
svg=svg.replace("01  업무 서비스","1차년도  AI-PMS · 3차년도 이력·성과환류 고도화").replace("02  공통 검사·검증 엔진","2차년도  CCK 감리 검사엔진").replace("03  데이터·연계 기반","1차년도부터  공통 데이터·연계 기반").replace("업무 서비스와 검사 엔진을 분리하는 구조","AI-PMS → 감리 검사엔진 → 성과환류의 구조")
write("CCK_Public_AI_PMS_아키텍처.svg",svg)
print("v1.1 source updated",len(d["turns"]),len(d["new_requirements"]))
