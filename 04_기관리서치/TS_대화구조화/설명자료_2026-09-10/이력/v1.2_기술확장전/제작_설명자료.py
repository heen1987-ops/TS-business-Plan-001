from pathlib import Path
import json, html, hashlib

BASE = Path(__file__).resolve().parent
D = json.loads((BASE / "내용.json").read_text(encoding="utf-8"))
S = json.loads((BASE / "참조대화_보존.json").read_text(encoding="utf-8"))
NAME = "TS_편의안전_AX_설명자료"
def e(value):
    return html.escape(str(value), quote=True)
def ul(items):
    return "<ul>" + "".join("<li>"+e(x)+"</li>" for x in items) + "</ul>"
def table(headers, rows):
    head = "<thead><tr>"+"".join('<th scope="col">'+e(x)+"</th>" for x in headers)+"</tr></thead>"
    body = "<tbody>"+"".join("<tr>"+"".join("<td>"+e(x)+"</td>" for x in row)+"</tr>" for row in rows)+"</tbody>"
    return '<div class="table-wrap" tabindex="0" role="region" aria-label="'+e(" · ".join(headers))+' 비교표">'+f"<table>{head}{body}</table></div>"
def mt(headers, rows):
    safe = lambda x: str(x).replace("|", r"\|").replace("\n", "<br>")
    return "\n".join(["| "+" | ".join(map(safe,headers))+" |","| "+" | ".join(["---"]*len(headers))+" |"]+["| "+" | ".join(map(safe,row))+" |" for row in rows])
def para(s):
    return "<p>"+e(s)+"</p>"

md = ["# "+D["meta"]["title"],
      f'작성일: {D["meta"]["date"]} · v{D["meta"]["version"]} · {D["meta"]["status"]}',
      D["overview"]["headline"].replace("\n"," ")+"\n\n"+D["overview"]["intro"],
      "**기획 판단:** "+D["overview"]["decision"],
      D["overview"]["note"],
      "## 0. CCK 솔루션·로컬 LLM 적용 범위", D["technology"]["lead"],
      "### CCK 주관 수행 가능성", D["delivery"]["lead"],
      mt(["구분","책임·조건"],D["delivery"]["roles"]),
      "**선정 전 확인:**", "\n".join("- "+x for x in D["delivery"]["gates"]),
      "### 조사안별 최소 납품단위 초안",mt(["조사안","CCK 주관 범위 가설","필수 외부 협조","납품 묶음 초안"],D["delivery"]["packages"]),
      D["delivery"]["status"],D["delivery"]["decisions"],
      " → ".join(D["technology"]["flow"]),
      mt(["경계", "적용 기준"], D["technology"]["boundaries"]),
      "### CCK 기술과 필요한 확인", mt(["기능군", "활용 가설", "확인 수준"], D["technology"]["assets"]),
      "### 8개 메가이슈를 로컬 LLM 관점으로 다시 읽기", mt(["메가이슈", "검토할 언어·업무 문제", "범위 경계"], D["technology"]["megas"]),
      D["technology"]["evidenceNote"], "### 후보별 적용 질문", "\n".join("- "+x for x in D["technology"]["checks"]),
      D["technology"]["guard"], "[CCK 적용 기준·자료 경로](../../../00_기획지침/CCK_로컬LLM_적용범위.md)",
      "## 1. 편의와 안전을 구분해 설명하기"]
for a in D["axes"]:
    md += ["### "+a["title"],a["question"],"\n".join("- "+x for x in a["items"]),a["boundary"]]
md += ["## 2. 대화에서 바뀐 방향",mt(["근거","변화","내용","상태"],[[t["ref"],t["title"],t["text"],t["type"]] for t in D["timeline"]])]
md += ["## 3. 세 가지 조사안 — 선정 전 출발 사례"]
for c in D["cases"]:
    md += ["### "+c["id"]+". "+c["title"],c["axis"]+" · "+c["evidence"]+" · 근거 "+c["source"],"**설명용 요청 예시:**","> "+c["quote"],
           "**문제:** "+c["problem"],"**경험·가설 흐름:** "+c["from"],"**개선 가설:** "+c["to"],
           mt(["구분","내용"],[["AI의 역할",c["ai"]],["업무시스템·사람",c["system"]],["먼저 확인할 것",c["verify"]],["측정할 결과"," · ".join(c["metrics"])],["오류·위험",c["risk"]],["비AI 비교",c["nonai"]]])]
md += ["## 4. 예약 상황별 설명","아래는 설계 설명용 시나리오다. 실제 예약 가능 정보·추천 결과·확정 기능이 아니다. ‘우회 안내’는 변경 가능한 조건을 조정해 대안을 찾는다는 뜻이다."]
for s in D["scenarios"]:
    md += ["### "+s["label"],"**"+s["title"]+"**",s["text"],"\n".join("- "+x for x in s["conditions"]),s["boundary"]]
md += ["검색·추천 요청과 예약 실행은 구분한다. 선택 후 실제 상태를 다시 확인하며 확정 결과 없이 예약 완료로 표시하지 않는다.",
       "## 5. 비교할 네 가지 주제",mt(["비교 주제","남겨둘 질문","상태"],D["comparisons"]),
       "세 가지 조사안과 네 가지 비교 주제는 대화 주제 수다. 정식 신규 사업 7건 또는 최종 추천 7건이 아니다.",
       "## 6. 근거 수준과 현재 기획 범위",mt(["확인 수준","해석","대화 근거"],D["evidence"]),
       "### 적용할 범위","\n".join("- "+x for x in D["scopeRules"]),
       "## 7. 8단계 심층리서치 흐름",
       "대화 T11의 계획을 CCK·로컬 LLM 기반 AX 범위에 맞게 요약했다. T12~T17의 ‘1~6 시작’ 요청은 각각 DR01~06에 대응해 표시했지만, 반환 기록에 연구 보고서 본문이 없어 실제 수행·완료 여부를 판정하지 않았다. 이 설명자료 제작은 연구 단계 완료로 계산하지 않는다.",
       mt(["단계","주제","확인된 상태"],[[r["id"],r["title"],r["status"]] for r in D["roadmap"]])]
for r in D["roadmap"]:
    md += ["### "+r["id"]+" · "+r["title"],r["question"],"**산출물:** "+r["output"],"**다음 단계 전 확인:** "+r["criteria"],"**상태:** "+r["status"]]
md += ["이 페이지는 후속 연구를 자동 실행하거나 실제 진행률을 추적하지 않는다. 다음 실행 단계는 직전 연구 보고서를 확인한 뒤 결정해야 한다.",
       f'## 8. 후속 확인 {len(D["queue"])}개',mt(["ID","확인 영역","질문"],D["queue"]),"Q01~09는 기존 대기열, Q10은 CCK·로컬 실행, Q11은 CCK 주관 수행 확인이다. 이번 문서 제작으로 완료 처리하지 않았다.",
       "## 9. 짧게 설명하는 순서"]
for i,p in enumerate(D["talk"],1):
    md += [str(i)+". **"+p["title"]+"** — "+p["text"]]
md += ["## 10. 출처·버전·한계",
       "[참조 대화: "+D["meta"]["sourceTitle"]+"]("+D["meta"]["sourceUrl"]+")",
       D["meta"]["limit"],
       f'최초 14턴 보존과 추가 열람 요청 3턴을 병합해 사용자 발언 {D["meta"]["sourceTurns"]}개와 AI 답변 본문 {D["meta"]["sourceReplies"]}개를 보존했다. 심층리서치 시작 요청 {D["meta"]["sourceRequestOnly"]}개에는 결과 본문이 반환되지 않았다. 자료 반환 범위 밖의 보고서나 첨부파일까지 읽었다고 해석하지 않는다.',
       "아래 T01~T17은 보존 JSON의 reference_id와 대응한다. 초기 T01~T14의 순서를 유지하고 T15~T17을 추가했다. U-CCK-01·02는 현재 작업의 사용자 정정이며 참조 대화 턴으로 합산하지 않는다.",
       mt(["근거","시각(KST)","사용자 발언","반환된 본문"],[[t["reference_id"],t["started_at"][:16],t["user_text"],"AI 답변 있음" if t["assistant_text"] else "시작 요청만 확인"] for t in S["turns"]]),
       "### 산출물 관리",
       "HTML과 이 Markdown은 같은 내용.json에서 생성했다. HTML 안의 Markdown 저장 기능은 이 문서와 같은 내용을 내보낸다. Markdown을 직접 수정하면 HTML에 자동 반영되지는 않으므로, 두 형식을 함께 갱신할 때에는 내용.json을 수정해 제작 스크립트를 실행한다.",
       "기존 자료: 2026-09-09 대화 구조화 문서·후속확인 대기열, 현재 프로젝트의 TS 신규사업 기획 지침·신규사업 범위와 중복배제 문서. v1.1에서 CCK 적용 기준과 Q10, v1.2에서 주관 수행 조건과 Q11을 추가했다. 원천자료·정식 후보 원장·자동화는 변경하지 않았다."]
MARKDOWN = "\n\n".join(md)+"\n"

nav_items = [("overview","기획의 중심"),("technology","CCK·로컬 LLM"),("candidates","3개 조사안"),("scenario","예약 상황"),("evidence","근거·범위"),("research","연구 8단계"),("next","후속 확인")]
nav = "".join(f'<a href="#{id}"><span>{i:02d}</span>{e(label)}</a>' for i,(id,label) in enumerate(nav_items,1))
axes = "".join(f'<article class="axis {a["id"]}"><div class="axis-top"><span class="axis-dot"></span><h3>{e(a["title"])}</h3></div><p class="axis-question">{e(a["question"])}</p>{ul(a["items"])}<p class="axis-limit">{e(a["boundary"])}</p></article>' for a in D["axes"])
timeline = "".join(f'<li><span class="timeline-index">{i:02d}</span><div><p class="eyebrow">{e(t["ref"])} / {e(t["type"])}</p><h3>{e(t["title"])}</h3><p>{e(t["text"])}</p></div></li>' for i,t in enumerate(D["timeline"],1))
tabs = "".join(f'<button type="button" class="case-tab" id="tab-{c["id"]}" role="tab" aria-controls="case-{c["id"]}" aria-selected="false" tabindex="0"><span class="case-letter">{c["id"]}</span><span><strong>{e(c["title"])}</strong><small>{e(c["subtitle"])}</small></span><span class="tab-arrow" aria-hidden="true">↗</span></button>' for c in D["cases"])
cases = ""
for c in D["cases"]:
    cases += f'''<article class="case-panel" id="case-{c["id"]}" aria-labelledby="tab-{c["id"]}" tabindex="0">
<div class="case-header"><div><p class="eyebrow">{e(c["axis"])} · {e(c["source"])}</p><h3>{c["id"]}. {e(c["title"])}</h3></div><span class="status-pill">{e(c["evidence"])}</span></div>
<p class="request-example">설명용 요청 예시</p><blockquote>{e(c["quote"])}</blockquote><p class="case-problem">{e(c["problem"])}</p>
<div class="flow-pair"><div><span>경험·문제 가설</span><p>{e(c["from"])}</p></div><div class="flow-to"><span>개선 가설</span><p>{e(c["to"])}</p></div></div>
<div class="role-grid"><section><h4>AI가 도울 일</h4><p>{e(c["ai"])}</p></section><section><h4>시스템·사람이 확인할 일</h4><p>{e(c["system"])}</p></section><section><h4>가장 먼저 확인할 것</h4><p>{e(c["verify"])}</p></section></div>
<div class="case-bottom"><section><h4>측정할 결과</h4>{ul(c["metrics"])}</section><section><h4>오류와 비교 기준</h4><p>{e(c["risk"])}</p><p>{e(c["nonai"])}</p></section></div></article>'''
scenario_buttons = "".join(f'<button type="button" class="scenario-button" data-scenario="{s["id"]}" aria-pressed="false">{e(s["label"])}</button>' for s in D["scenarios"])
scenario_panels = "".join(f'<article class="scenario-panel" data-scenario-panel="{s["id"]}"><p class="eyebrow">추천 원칙 / {e(s["label"])}</p><h3>{e(s["title"])}</h3><p>{e(s["text"])}</p>{ul(s["conditions"])}<p class="scenario-boundary">{e(s["boundary"])}</p></article>' for s in D["scenarios"])
evidence = "".join(f'<article class="evidence-item"><span class="evidence-num">{i:02d}</span><div><h3>{e(row[0])}</h3><p>{e(row[1])}</p><small>근거 {e(row[2])}</small></div></article>' for i,row in enumerate(D["evidence"],1))
roadmap = ""
for i,r in enumerate(D["roadmap"]):
    prompt = f'{r["id"]} {r["title"]}: {r["question"]} 산출물은 {r["output"]}. {r["criteria"]} 이전 단계의 실제 보고서와 출처를 먼저 확인하고, 미열람 결과를 완료로 가정하지 않는다. 현재 신규사업은 CCK 솔루션·로컬 LLM 기반 AX 또는 디지털전환+AI+정보화다. 비전·영상인식·신규 OCR·센서·장비·자율주행 제어와 독립 R&D는 제외한다. CCK 자산의 실제 보유·버전·로컬 실행·재사용 권한을 확인하며 기존 추진과업은 재포장하지 않는다.'
    prompt += ' CCK가 주관·총괄 수행사로 책임질 수 있는 사업을 대상으로 한다. 핵심 자산·직접/협력 수행·외부 의존성·인력·납기·원가·납품·검수·운영 근거를 확인하며 LLM 적용 가능성을 주관 수행 가능으로 간주하지 않는다.'
    roadmap += f'''<details class="research-step"><summary><span class="step-id">{r["id"]}</span><span class="step-title">{e(r["title"])}</span><span class="step-status">{e(r["status"])}</span><span class="expand" aria-hidden="true">+</span></summary><div class="step-body"><h3>{e(r["question"])}</h3><dl><dt>남길 산출물</dt><dd>{e(r["output"])}</dd><dt>다음 단계 전 확인</dt><dd>{e(r["criteria"])}</dd></dl><div class="copy-block"><p id="prompt-{r["id"]}">{e(prompt)}</p><button type="button" class="small-button copy-button" data-copy="prompt-{r["id"]}">단계 질문 복사</button></div></div></details>'''
source_rows = [[t["reference_id"],t["started_at"][:16],t["user_text"],"AI 답변 있음" if t["assistant_text"] else "시작 요청만 확인"] for t in S["turns"]]
talk = "".join(f'<article><span>{i:02d}</span><h3>{e(p["title"])}</h3><p>{e(p["text"])}</p></article>' for i,p in enumerate(D["talk"],1))
tech = D["technology"]
delivery = D["delivery"]
delivery_html = f'''<section id="prime-delivery" class="prime-delivery"><div class="section-heading"><p class="eyebrow">사업 수행의 기준 / 사용자 정정 U-CCK-02</p><h3>{e(delivery["title"])}</h3><p>{e(delivery["lead"])}</p></div>{table(["구분","책임·조건"],delivery["roles"])}<p class="caption">{e(delivery["decisions"])}</p><details class="scope-details"><summary>직접·협력 수행과 최소 납품단위 초안 <span aria-hidden="true">+</span></summary><div>{table(["조사안","CCK 주관 범위 가설","필수 외부 협조","납품 묶음 초안"],delivery["packages"])}{ul(delivery["gates"])}</div></details><p class="caption">{e(delivery["status"])}</p></section>'''
tech_flow = '<ol class="tech-flow">'+''.join(f'<li><span>{i:02d}</span>{e(x)}</li>' for i,x in enumerate(tech["flow"],1))+'</ol>'
tech_boundaries = ''.join(f'<article class="evidence-item"><span class="evidence-num">{i:02d}</span><div><h3>{e(x[0])}</h3><p>{e(x[1])}</p></div></article>' for i,x in enumerate(tech["boundaries"],1))
technology = f'''<section id="technology" class="section"><div class="section-heading"><p class="eyebrow">기술의 기준 / 사용자 정정 U-CCK-01</p><h2>{e(tech["title"])}</h2><p>{e(tech["lead"])}</p></div>{delivery_html}{tech_flow}<div class="evidence-grid">{tech_boundaries}</div>
<details class="scope-details"><summary>CCK 자산과 필요한 확인 <span aria-hidden="true">+</span></summary><div>{table(["기능군","활용 가설","확인 수준"],tech["assets"])}</div></details>
<details class="scope-details" open><summary>8개 메가이슈 → 로컬 LLM 적용 가설 <span aria-hidden="true">+</span></summary><div>{table(["메가이슈","검토할 언어·업무 문제","범위 경계"],tech["megas"])}<p>{e(tech["evidenceNote"])}</p></div></details>
<p class="caption">{e(tech["guard"])}</p><p class="caption"><a href="../../../00_기획지침/CCK_로컬LLM_적용범위.md">CCK 적용 기준·자료 경로 보기 ↗</a></p></section>'''
body = f'''
<a href="#main" class="skip-link">본문으로 건너뛰기</a>
<div class="shell">
<aside class="sidebar"><a class="wordmark" href="#overview"><span class="mark">TS</span><span>기획 브리핑<small>편의 × 안전</small></span></a>
<p class="sidebar-label">한국교통안전공단 조사</p><nav aria-label="주요 목차">{nav}</nav>
<div class="sidebar-foot"><span class="version">v{e(D["meta"]["version"])} / {e(D["meta"]["date"])}</span><p>내부 검토용<br>사업 선정 전</p><a href="{e(D["meta"]["sourceUrl"])}">참조 대화 열기 ↗</a></div></aside>
<div class="workspace"><header class="topbar"><span>대화에서 사업기획으로</span><div class="toolbar"><button type="button" class="button js-control" id="download-md">Markdown 저장 ↓</button><button type="button" class="button secondary js-control" id="print-button">인쇄 / PDF</button></div></header>
<main id="main" tabindex="-1">
<section id="overview" class="hero">
<div class="hero-copy"><p class="eyebrow">국민이 겪는 한 장면에서 출발하는 AX</p><h1>{e(D["overview"]["headline"]).replace(chr(10),"<br>")}</h1><p class="intro">{e(D["overview"]["intro"])}</p><p class="hero-note">대화 기반 설명자료 · 2026.09.10</p></div>
<div class="hero-diagram" role="img" aria-label="국민의 상황을 이해하고, 가능한 선택을 찾고, 필요한 행동을 완료하는 공통 흐름. 편의와 안전은 각각 검증한다.">
<div class="diagram-kicker">기획의 공통 흐름</div>
<div class="route"><div><span>01</span><strong>상황 이해</strong><small>무엇을 하려는가</small></div><b aria-hidden="true">↓</b><div><span>02</span><strong>가능한 선택</strong><small>무엇을 바꿀 수 있는가</small></div><b aria-hidden="true">↓</b><div><span>03</span><strong>필요한 행동</strong><small>실제로 끝냈는가</small></div></div>
<div class="diagram-axes"><span>편의 · 이용 부담</span><span>안전 · 이해와 이행</span></div></div>
</section>
<div class="decision-line"><span class="label">기획 판단</span><p>{e(D["overview"]["decision"])}</p></div>
{technology}
<section class="section" aria-labelledby="axes-title"><div class="section-heading"><p class="eyebrow">01 / 판단의 기준</p><h2 id="axes-title">두 성과축을 따로 봅니다.</h2><p>편의 개선과 안전 행동의 연결은 확인하되, 한쪽 성과를 다른 쪽의 증거로 대신하지 않습니다.</p></div><div class="axes-grid">{axes}</div></section>
<section class="section timeline-section" aria-labelledby="history-title"><div class="section-heading"><p class="eyebrow">논의의 변화</p><h2 id="history-title">검색에서 대안으로,<br>예약에서 편의와 안전으로.</h2></div><ol class="timeline">{timeline}</ol></section>
<section id="candidates" class="section"><div class="section-heading"><p class="eyebrow">02 / 조사할 출발 사례</p><h2>어디에서 다음 행동이 막히는가?</h2><p>{e(D["overview"]["note"])}</p></div>
<div class="case-tabs" role="tablist" aria-label="조사안 비교">{tabs}</div><div class="case-panels">{cases}</div>
<noscript><p class="notice">JavaScript가 꺼져 있어 모든 조사안과 상황 설명을 펼쳐 보여줍니다.</p></noscript>
</section>
<section id="scenario" class="section"><div class="section-heading"><p class="eyebrow">03 / 예약 구상을 설명하는 방법</p><h2>마감 다음에, 무엇을 제안할까?</h2><p>사용자가 바꿀 수 있는 조건과 반드시 지킬 조건을 구분합니다.</p></div>
<div class="scenario-box"><div class="scenario-side"><span class="example-tag">설명용 시나리오</span><h3>같은 마감에도<br>다른 다음 선택.</h3><p>실제 빈자리 조회·예약 기능이 아닙니다.</p><div class="scenario-controls" role="group" aria-label="예약 상황 선택">{scenario_buttons}</div></div><div class="scenario-results" aria-live="polite">{scenario_panels}</div></div>
<p class="caption">“우회 안내”는 변경 가능한 조건을 조정하는 대안 탐색을 뜻합니다. 검색·추천 요청과 예약 실행은 구분하고, 선택 뒤 실제 상태를 다시 확인합니다.</p>
</section>
<section class="section comparison-section" aria-labelledby="compare-title"><div class="section-heading"><p class="eyebrow">비교 범위</p><h2 id="compare-title">같은 질문을 다른 업무에도.</h2><p>아래 4개도 검증할 주제입니다. 앞의 3개와 합쳐 신규 사업 7건으로 집계하지 않습니다.</p></div>{table(["비교 주제","남겨둘 질문","대화의 제안 상태"],D["comparisons"])}</section>
<section id="evidence" class="section"><div class="section-heading"><p class="eyebrow">04 / 근거와 판단</p><h2>확인한 것과 확인할 것을 구분합니다.</h2></div><div class="evidence-grid">{evidence}</div><details class="scope-details"><summary>현재 기획 범위와 중복 배제 기준 <span aria-hidden="true">+</span></summary><div>{ul(D["scopeRules"])}<p>대화의 R&D 표현은 현재 프로젝트 범위에 맞게 해석했습니다. 기관·법령·위탁 관계의 원문 재검증은 후속 과제입니다.</p></div></details></section>
<section id="research" class="section"><div class="section-heading"><p class="eyebrow">05 / 다음 연구의 구조</p><h2>넓게 조사하고,<br>근거가 쌓인 뒤 좁힙니다.</h2><p>대화 T11의 8단계 계획을 현재 AX 범위에 맞게 요약했습니다.</p></div>
<div class="research-notice"><strong>시작 요청과 결과 확인은 다른 상태입니다.</strong><p>T12~T17에서 1~6차 시작 요청을 확인했습니다. 아래 DR01~06에 대응해 표시했으며, 반환 기록에 보고서 본문이 없어 실제 수행·완료 여부는 판정하지 않았습니다.</p></div>
<div class="research-list">{roadmap}</div><p class="caption">이 자료는 연구 순서를 설명합니다. 후속 연구를 자동 실행하거나 실제 진행률을 추적하지 않습니다. 다음 실행 단계는 직전 보고서 확인 후 결정합니다.</p></section>
<section id="next" class="section"><div class="section-heading"><p class="eyebrow">06 / 다음에 확보할 증거</p><h2>질문을 자료와 연결합니다.</h2><p>Q10은 CCK·로컬 실행, Q11은 CCK 주관 수행 가능성 확인입니다. 이번 제작으로 완료 처리하지 않았습니다.</p></div>{table(["ID","확인 영역","질문"],D["queue"])}</section>
<section class="section talk-section" aria-labelledby="talk-title"><div class="section-heading"><p class="eyebrow">설명 순서</p><h2 id="talk-title">세 문단으로 전달하기.</h2></div><div class="talk-grid">{talk}</div></section>
<section class="section sources-section"><details><summary>대화 출처·버전·열람 범위 <span aria-hidden="true">+</span></summary><div class="source-content"><p>{e(D["meta"]["limit"])}</p><p>최초 14턴과 추가 요청 3턴을 병합했습니다. 사용자 발언 {D["meta"]["sourceTurns"]}개와 AI 답변 {D["meta"]["sourceReplies"]}개를 보존했으며 시작 요청 {D["meta"]["sourceRequestOnly"]}개에는 연구 결과 본문이 반환되지 않았습니다. T01~T14 순서를 유지했습니다. U-CCK-01은 현재 작업의 추가 정정으로 별도 관리합니다.</p><a href="{e(D["meta"]["sourceUrl"])}">한국교통안전공단 조사 원 대화 ↗</a>{table(["근거","시각(KST)","사용자 발언","반환 범위"],source_rows)}<p>기존 자료: 2026-09-09 대화 구조화·후속 대기열, TS 신규사업 기획 지침·신규사업 범위와 중복배제. CCK 파생 자료와 외부 인용 표식은 제품·성능·공식 원문 검증을 대신하지 않습니다.</p></div></details></section>
<footer><strong>TS 편의·안전 AX 기획 설명자료</strong><span>2026.09.10 · v{e(D["meta"]["version"])} · 내부 검토용</span><p>편의와 안전의 문제를 설명하는 기획 자료입니다. 실제 예약·안전판정·사업 승인·연구 완료를 나타내지 않습니다.</p></footer>
</main></div></div><div id="live-status" role="status" aria-live="polite"></div>
'''
css = r'''
:root{--ink:#172e3d;--muted:#51636b;--paper:#f6f5ef;--white:#fff;--line:#d8dedb;--navy:#152f40;--teal:#0c6f64;--mint:#e5f1eb;--orange:#ac4c20;--sand:#fcf0e4;--focus:#1868b7}
*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:90px}body{margin:0;background:var(--paper);color:var(--ink);font-family:"Malgun Gothic","맑은 고딕","Noto Sans KR",Arial,sans-serif;font-size:15px;line-height:1.75;word-break:keep-all;overflow-wrap:anywhere}button,a,summary{-webkit-tap-highlight-color:transparent}button{font:inherit;cursor:pointer}button:disabled{cursor:default}a{color:inherit;text-underline-offset:4px}p,h1,h2,h3,h4,ul,ol{margin:0}p+p{margin-top:10px}button:focus-visible,a:focus-visible,summary:focus-visible,[tabindex]:focus-visible{outline:3px solid var(--focus);outline-offset:4px}button[hidden],[hidden]{display:none!important}.skip-link{position:fixed;left:20px;top:-100px;background:#fff;color:var(--ink);padding:12px 20px;z-index:100}.skip-link:focus{top:12px}
.shell{display:grid;grid-template-columns:218px minmax(0,1fr)}.sidebar{position:sticky;top:0;height:100vh;padding:35px 22px 25px;border-right:1px solid var(--line);display:flex;flex-direction:column;background:#fafaf7}.wordmark{display:flex;gap:12px;align-items:center;text-decoration:none;font-weight:800;line-height:1.4}.wordmark small{display:block;font-size:11px;letter-spacing:.14em;font-weight:500;margin-top:5px}.mark{font-family:Arial,sans-serif;font-size:22px;letter-spacing:-2px;display:grid;place-items:center;width:43px;height:43px;background:var(--navy);color:#fff;border-radius:12px 12px 12px 3px;padding-right:3px}.sidebar-label{font-size:11px;color:var(--muted);margin:48px 0 14px}.sidebar nav{display:grid;gap:6px}.sidebar nav a{min-height:44px;display:flex;align-items:center;gap:13px;text-decoration:none;padding:7px 9px;font-size:13px;border-radius:6px}.sidebar nav a:hover,.sidebar nav a[aria-current]{background:var(--mint);color:var(--teal);font-weight:700}.sidebar nav span{font-family:Arial,sans-serif;font-size:10px;letter-spacing:.08em;color:var(--muted)}.sidebar-foot{margin-top:auto;font-size:11px;color:var(--muted);line-height:1.7}.sidebar-foot p{margin:12px 0}.sidebar-foot a{display:inline-flex;align-items:center;min-height:44px}.version{font-family:Arial,sans-serif;font-size:10px;letter-spacing:.06em}
.workspace{min-width:0}.topbar{height:76px;display:flex;align-items:center;justify-content:space-between;padding:0 6%;border-bottom:1px solid var(--line);font-size:12px;color:var(--muted)}.toolbar{display:flex;gap:8px}.button{border:1px solid var(--navy);border-radius:5px;min-height:42px;background:var(--navy);color:white;padding:9px 14px;font-size:12px;font-weight:700}.button.secondary{background:transparent;color:var(--ink);border-color:#adb9bb}.button:hover{filter:brightness(.95)}main{max-width:1280px;margin:auto;padding:0 6%}.hero{display:grid;grid-template-columns:1.25fr .75fr;gap:46px;padding:68px 0 42px;align-items:center}.eyebrow{font-size:11px;letter-spacing:.09em;color:var(--muted);font-weight:700;margin-bottom:13px}.hero h1{font-size:clamp(34px,3.5vw,52px);font-weight:800;line-height:1.28;letter-spacing:-.065em}.intro{font-size:16px;line-height:1.85;max-width:570px;margin-top:26px}.hero-note{font-size:11px;color:var(--muted);margin-top:26px}.hero-diagram{background:var(--navy);color:#fff;padding:25px 28px;border-radius:4px 36px 4px 4px;box-shadow:10px 10px 0 #e5e8df}.diagram-kicker{font-size:11px;color:#cbdbdf;letter-spacing:.14em;margin-bottom:18px}.route{display:grid;gap:4px}.route>div{display:grid;grid-template-columns:30px 1fr;column-gap:10px;align-items:center;padding:10px 0}.route span{grid-row:1/3;color:#9cd7c7;font-size:11px;font-family:Arial,sans-serif}.route strong{font-size:18px;letter-spacing:-.02em}.route small{font-size:11px;color:#d4e0e2}.route>b{color:#88a2ac;font-size:15px;line-height:1;text-align:center;transform:translateX(-14px)}.diagram-axes{border-top:1px solid #506875;margin-top:15px;padding-top:15px;display:flex;gap:10px;justify-content:space-between;font-size:10px;color:#daf0e7}.diagram-axes span:last-child{color:#ffd2af}.decision-line{border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:22px 0;display:flex;align-items:baseline;gap:22px}.label{font-size:11px;letter-spacing:.08em;font-weight:700;color:var(--teal);white-space:nowrap}.decision-line p{font-size:15px;font-weight:700}
.section{padding:58px 0;border-bottom:1px solid var(--line);scroll-margin-top:18px}.section-heading{margin-bottom:27px;max-width:760px}.section-heading h2{font-size:29px;font-weight:800;line-height:1.45;letter-spacing:-.045em}.section-heading>p:last-child:not(.eyebrow){font-size:14px;color:var(--muted);margin-top:12px}.axes-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}.axis{padding:29px 30px;border:1px solid #c5dcd2;background:var(--mint);border-radius:5px}.axis.safety{background:var(--sand);border-color:#e8d0bc}.axis-top{display:flex;align-items:center;gap:10px}.axis-dot{height:9px;width:9px;border-radius:50%;background:var(--teal)}.safety .axis-dot{background:var(--orange)}.axis h3{font-size:22px;color:var(--teal)}.safety h3{color:var(--orange)}.axis-question{margin:15px 0 13px;font-size:16px;font-weight:700}.axis ul{display:flex;gap:7px 18px;flex-wrap:wrap;list-style:none;padding:0;font-size:12px}.axis li:before{content:"·";margin-right:5px}.axis-limit{font-size:12px;border-top:1px solid #bfd2ca;margin-top:23px;padding-top:15px;color:var(--muted)}.safety .axis-limit{border-color:#dbc9b6}.timeline-section{display:grid;grid-template-columns:.8fr 1.2fr;gap:35px}.timeline{list-style:none;padding:0}.timeline li{display:flex;gap:20px;padding:0 0 24px;position:relative}.timeline li:last-child{padding-bottom:0}.timeline-index{flex:none;display:grid;place-items:center;background:var(--paper);border:1px solid #adbbb8;color:var(--teal);width:33px;height:33px;border-radius:50%;font-family:Arial,sans-serif;font-size:10px}.timeline li:not(:last-child):before{content:"";position:absolute;left:16px;top:33px;bottom:0;width:1px;background:#c7d1cc}.timeline .eyebrow{font-size:10px;margin:2px 0 3px}.timeline h3{font-size:15px;margin-bottom:5px}.timeline li p:last-child{font-size:12px;color:var(--muted)}
.case-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:20px}.case-tab{display:flex;align-items:center;gap:12px;text-align:left;min-height:94px;border:1px solid #bac6c3;background:#fff;padding:17px 15px;border-radius:5px;color:var(--ink)}.case-tab[aria-selected=true]{border-color:var(--teal);box-shadow:inset 0 3px 0 var(--teal);background:#eef6f0}.case-letter{font-family:Arial,sans-serif;font-size:26px;font-weight:700;color:var(--teal)}.case-tab strong{display:block;font-size:14px;letter-spacing:-.035em}.case-tab small{display:block;font-size:10px;color:var(--muted);margin-top:4px}.tab-arrow{margin-left:auto;font-size:15px;color:var(--teal)}.case-panel{background:#fff;padding:30px;border:1px solid var(--line);border-radius:5px;margin-bottom:12px}.case-header{display:flex;gap:15px;justify-content:space-between;align-items:center}.case-header .eyebrow{margin-bottom:4px}.case-header h3{font-size:23px;letter-spacing:-.04em}.status-pill{border:1px solid #d4b997;color:#764111;background:#fff8eb;border-radius:20px;padding:5px 10px;font-size:10px;white-space:nowrap}.case-panel blockquote{font-size:18px;line-height:1.65;font-weight:700;margin:22px 0 13px;border-left:3px solid var(--teal);padding:8px 0 8px 18px;letter-spacing:-.02em}.case-problem{font-size:14px;color:var(--muted)}.flow-pair{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:25px 0}.flow-pair>div{padding:18px;background:#f3f4f1;border-radius:4px}.flow-pair>.flow-to{background:#eaf5ef}.flow-pair span{font-size:10px;font-weight:700;color:var(--muted)}.flow-pair p{font-size:13px;margin-top:7px;font-weight:700}.role-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}.case-panel h4{font-size:12px;color:var(--teal);margin-bottom:9px}.role-grid p,.case-bottom p{font-size:12px;color:var(--muted)}.case-bottom{display:grid;grid-template-columns:1fr 2fr;gap:28px;border-top:1px solid var(--line);padding-top:22px;margin-top:24px}.case-bottom ul{padding-left:17px;font-size:12px}.case-bottom li{margin-bottom:5px}.scenario-box{display:grid;grid-template-columns:270px 1fr;border:1px solid #cbd5d0;background:#fff;border-radius:5px;overflow:hidden}.scenario-side{padding:27px;background:#eaf0eb}.example-tag{font-size:10px;letter-spacing:.05em;padding:4px 8px;border:1px solid #a1b8ac;border-radius:3px;color:var(--teal)}.scenario-side h3{font-size:23px;line-height:1.5;margin-top:17px;letter-spacing:-.04em}.scenario-side>p{font-size:11px;color:var(--muted);margin-top:10px}.scenario-controls{display:grid;gap:8px;margin-top:23px}.scenario-button{border:1px solid #b4c5bb;background:transparent;color:var(--ink);min-height:44px;padding:8px 12px;text-align:left;border-radius:4px;font-size:12px}.scenario-button[aria-pressed=true]{background:var(--teal);color:white;border-color:var(--teal)}.scenario-panel{padding:32px}.scenario-panel+.scenario-panel{border-top:1px solid var(--line)}.scenario-panel h3{font-size:24px;line-height:1.5;letter-spacing:-.045em;margin-bottom:19px}.scenario-panel>p:not(.eyebrow){font-size:14px;line-height:1.8}.scenario-panel ul{margin:22px 0;padding-left:20px;font-size:12px}.scenario-panel li{margin-bottom:9px}.scenario-panel .scenario-boundary{font-size:12px!important;border-top:1px solid var(--line);padding-top:18px;color:var(--orange)}.caption{font-size:11px;color:var(--muted);margin-top:15px;line-height:1.8}.table-wrap{overflow:auto;border-top:2px solid var(--ink);margin-top:12px}table{width:100%;border-collapse:collapse;font-size:12px;text-align:left;min-width:560px}th{font-size:11px;color:var(--muted);background:#edf0eb;font-weight:700}td,th{padding:15px 13px;border-bottom:1px solid var(--line);vertical-align:top}td:first-child{font-weight:700}table th:first-child{width:24%}#next table th:first-child{width:10%}#next table th:nth-child(2){width:22%}.evidence-grid{display:grid;grid-template-columns:1fr 1fr;gap:23px 30px}.evidence-item{display:flex;gap:16px;border-top:1px solid var(--line);padding-top:20px}.evidence-num{color:var(--teal);font-size:12px;font-family:Arial,sans-serif;padding-top:3px}.evidence-item h3{font-size:16px}.evidence-item p{font-size:12px;color:var(--muted);margin-top:8px}.evidence-item small{display:block;font-size:10px;color:var(--muted);margin-top:9px}details summary{cursor:pointer;list-style:none;min-height:48px;display:flex;align-items:center;gap:13px}summary::-webkit-details-marker{display:none}.scope-details{margin-top:28px;border:1px solid var(--line);border-radius:4px;background:#fff}.scope-details summary{padding:17px 20px;font-size:13px;font-weight:700}.scope-details summary>span{margin-left:auto}.scope-details>div{padding:0 20px 20px;font-size:12px;color:var(--muted)}.scope-details ul{padding-left:20px}.scope-details li{margin-bottom:10px}.scope-details>div>p{border-top:1px solid var(--line);padding-top:14px}.research-notice{background:#fff4e5;border-left:3px solid #b56e2c;padding:19px 22px;margin-bottom:25px}.research-notice strong{font-size:13px}.research-notice p{font-size:12px;margin-top:7px;color:#6f4f2d}.research-step{border-bottom:1px solid var(--line)}.research-step:first-child{border-top:1px solid var(--line)}.research-step summary{padding:18px 0}.step-id{font-family:Arial,sans-serif;font-weight:700;font-size:12px;color:var(--teal);width:56px;flex:none}.step-title{font-size:15px;font-weight:700}.step-status{margin-left:auto;font-size:10px;color:var(--muted)}.expand{width:24px;text-align:center;font-size:22px;font-weight:400;color:var(--teal)}details[open] .expand{transform:rotate(45deg)}.step-body{padding:3px 0 25px 69px}.step-body h3{font-size:17px;letter-spacing:-.025em;margin-bottom:20px}.step-body dl{display:grid;grid-template-columns:125px 1fr;font-size:12px;gap:12px;margin:0}.step-body dt{font-weight:700;color:var(--teal)}.step-body dd{margin:0;color:var(--muted)}.copy-block{margin-top:20px;padding:16px;background:#eef1ec;border-radius:4px}.copy-block p{font-size:11px;color:var(--muted);line-height:1.85}.small-button{min-height:44px;padding:6px 13px;background:#fff;border:1px solid #a6b9af;border-radius:4px;color:var(--teal);font-size:11px;font-weight:700;margin-top:12px}.talk-section{background:var(--navy);color:#fff;padding:35px;margin:48px 0 10px;border-radius:5px}.talk-section .eyebrow{color:#badbd0}.talk-section h2{font-size:27px}.talk-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}.talk-grid article>span{font-family:Arial,sans-serif;font-size:11px;color:#a4d5c3}.talk-grid h3{font-size:15px;margin:8px 0 11px}.talk-grid p{font-size:12px;line-height:1.9;color:#d5e2e6}.sources-section{padding:28px 0}.sources-section summary{font-size:13px;font-weight:700}.sources-section summary>span{margin-left:auto}.source-content{padding:20px 0;font-size:12px;color:var(--muted)}.source-content .table-wrap{margin-top:25px}.source-content table{min-width:800px}.source-content table th:first-child{width:10%}.source-content table th:nth-child(2){width:18%}.source-content table th:last-child{width:18%}footer{padding:28px 0 42px;font-size:11px;color:var(--muted)}footer strong{font-weight:700;color:var(--ink)}footer>span{float:right}footer p{margin-top:12px;font-size:10px}#live-status{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:var(--navy);color:#fff;border-radius:5px;padding:0 20px;font-size:12px;z-index:30;max-width:90vw;box-shadow:0 3px 12px #0002}#live-status:not(:empty){padding:12px 20px}.js-control{display:none}.js .js-control{display:inline-block}.copy-button{display:none}.js .copy-button{display:inline-block}
.request-example{font-size:10px;color:var(--muted);margin-top:22px}.case-panel .request-example+blockquote{margin-top:7px}.case-tabs,.scenario-controls{display:none}.js .case-tabs,.js .scenario-controls{display:grid}.button,.sidebar nav a{min-height:44px}
@media(min-width:1600px){main{padding:0 70px}.hero{gap:70px}}
@media(max-width:1100px){.shell{grid-template-columns:180px minmax(0,1fr)}.sidebar{padding:30px 15px}.hero{gap:26px}.hero h1{font-size:36px}.hero-diagram{padding:23px 20px}.case-tab{padding:14px 10px;gap:8px}.case-tab strong{font-size:12px}.case-tab small{font-size:9px}.tab-arrow{display:none}.scenario-box{grid-template-columns:230px 1fr}.scenario-side{padding:25px 20px}.role-grid{gap:17px}}
@media(max-width:820px){.shell{display:block}.sidebar{position:static;width:auto;height:auto;display:block;padding:16px 5%;border-bottom:1px solid var(--line)}.wordmark{font-size:13px}.mark{height:35px;width:35px;font-size:18px}.wordmark small{display:none}.sidebar-label,.sidebar-foot{display:none}.sidebar nav{display:flex;margin-top:12px;gap:4px;flex-wrap:wrap}.sidebar nav a{font-size:11px;padding:4px 9px;min-height:36px;gap:7px}.sidebar nav span{font-size:9px}.topbar{height:67px;padding:0 5%}main{padding:0 5%}.hero{padding-top:42px;gap:26px;grid-template-columns:1.1fr .9fr}.hero h1{font-size:33px}.intro{font-size:14px}.diagram-axes{flex-wrap:wrap;gap:3px}.hero-diagram{box-shadow:6px 6px 0 #e5e8df}.timeline-section{grid-template-columns:1fr;gap:8px}.timeline-section h2 br{display:none}.axes-grid{gap:13px}.axis{padding:24px}.case-tabs{gap:7px}.case-tab{padding:16px 11px;min-height:106px;display:block}.case-letter{font-size:18px}.case-tab strong{font-size:13px}.case-tab small{font-size:10px}.case-panel{padding:25px}.scenario-box{grid-template-columns:220px 1fr}.scenario-panel{padding:27px}.section-heading h2{font-size:27px}.step-title{font-size:14px}.step-status{font-size:9px}.step-id{width:45px}.step-body{padding-left:58px}.talk-section{padding:29px}.talk-grid{gap:22px}.talk-grid p{font-size:11px}}
@media(max-width:580px){body{font-size:14px}.topbar{align-items:center;font-size:10px}.toolbar{gap:5px}.button{font-size:10px;padding:8px 9px;min-height:44px}.topbar>span{max-width:80px;line-height:1.6}.hero{grid-template-columns:1fr;padding-top:33px;gap:27px}.hero h1{font-size:36px;line-height:1.3}.eyebrow{font-size:10px}.intro{font-size:14px;line-height:1.9;margin-top:20px}.hero-note{margin-top:19px}.hero-diagram{padding:24px;border-radius:4px 26px 4px 4px}.route{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.route>b{display:none}.route>div{display:block;padding:0}.route span{display:block;font-size:10px;margin-bottom:6px}.route strong{display:block;font-size:15px}.route small{font-size:9px}.diagram-kicker{margin-bottom:16px}.diagram-axes{justify-content:space-between;margin-top:18px;padding-top:13px;font-size:10px}.decision-line{align-items:flex-start;gap:14px;padding:20px 0}.decision-line p{font-size:13px}.label{font-size:10px;padding-top:3px}.section{padding:39px 0}.section-heading{margin-bottom:22px}.section-heading h2{font-size:25px}.section-heading>p:last-child:not(.eyebrow){font-size:12px}.axes-grid{grid-template-columns:1fr;gap:13px}.axis{padding:23px}.axis h3{font-size:20px}.axis-question{font-size:15px}.timeline-index{width:29px;height:29px;font-size:9px}.timeline li{gap:14px}.timeline li:not(:last-child):before{left:14px;top:29px}.timeline h3{font-size:14px}.timeline li p:last-child{font-size:12px}.case-tabs{grid-template-columns:1fr}.case-tab{display:flex;min-height:72px;padding:12px 16px;gap:15px}.case-letter{font-size:25px}.case-tab strong{font-size:14px}.case-tab small{font-size:11px}.tab-arrow{display:block}.case-panel{padding:23px 19px}.case-header{display:block}.case-header h3{font-size:22px}.status-pill{display:inline-flex;margin-top:11px;font-size:10px}.case-panel blockquote{font-size:17px;padding-left:13px;margin-top:19px}.case-problem{font-size:13px}.flow-pair,.role-grid,.case-bottom{grid-template-columns:1fr}.flow-pair{gap:9px;margin:21px 0}.flow-pair>div{padding:16px}.role-grid{gap:21px}.case-panel h4{font-size:12px}.role-grid p,.case-bottom p,.case-bottom ul{font-size:12px}.case-bottom{gap:19px;padding-top:21px}.scenario-box{grid-template-columns:1fr}.scenario-side{padding:24px}.scenario-side h3{font-size:23px}.scenario-side h3 br{display:none}.scenario-side>p{font-size:11px}.scenario-controls{grid-template-columns:1fr 1fr;gap:8px;margin-top:20px}.scenario-button{font-size:11px;min-height:48px;padding:9px 10px}.scenario-panel{padding:26px 24px}.scenario-panel h3{font-size:23px}.scenario-panel>p:not(.eyebrow){font-size:13px}.evidence-grid{grid-template-columns:1fr;gap:21px}.evidence-item h3{font-size:15px}.research-notice{padding:18px}.research-step summary{display:grid;grid-template-columns:45px 1fr 20px;gap:3px 10px;padding:17px 0}.step-id{grid-row:1/3;align-self:center;font-size:11px}.step-title{font-size:14px}.step-status{grid-column:2;margin:2px 0 0;font-size:9px}.expand{grid-column:3;grid-row:1/3}.step-body{padding:3px 0 23px}.step-body h3{font-size:16px}.step-body dl{grid-template-columns:1fr;gap:5px}.step-body dd{margin-bottom:10px}.talk-section{padding:26px 22px;margin-top:36px}.talk-section h2{font-size:24px}.talk-grid{grid-template-columns:1fr;gap:24px}.talk-grid h3{margin:4px 0 8px}.talk-grid p{font-size:12px}.talk-grid article+article{border-top:1px solid #45606c;padding-top:22px}.sources-section{padding:22px 0}footer>span{float:none;display:block;margin-top:6px}.sidebar nav a{min-height:44px;font-size:10px;gap:5px}.sidebar nav a span{display:none}.caption{font-size:10px}.table-wrap table{font-size:11px}}
.sidebar nav a{min-height:44px}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{transition:none!important;animation:none!important}}
@media print{@page{size:A4;margin:13mm}body{font-size:10pt;background:white;color:#142d3c;line-height:1.6;-webkit-print-color-adjust:exact;print-color-adjust:exact}.shell{display:block}.sidebar,.topbar,.skip-link,.case-tabs,.scenario-controls,.copy-button,.js-control,#live-status{display:none!important}main{padding:0;max-width:none}.hero{padding:0 0 18px;grid-template-columns:1.2fr .8fr;gap:28px}.hero h1{font-size:29pt}.intro{font-size:10pt}.hero-diagram{box-shadow:none;padding:18px}.hero-note{font-size:8pt}.decision-line{padding:13px 0}.section{padding:24px 0}.section-heading h2{font-size:19pt}.section-heading .eyebrow{font-size:8pt}.section-heading>p:last-child:not(.eyebrow){font-size:9pt}.axis,.hero,.case-header,.flow-pair,.role-grid>section,.evidence-item,.talk-grid article{break-inside:avoid}.timeline-section{grid-template-columns:1fr}.timeline{display:grid;grid-template-columns:1fr 1fr;gap:15px}.timeline li{padding-bottom:0}.timeline li:before{display:none}.case-panel[hidden],.scenario-panel[hidden]{display:block!important}.case-panel{margin:15px 0;padding:20px;break-before:auto}.case-panel h3{font-size:17pt}.case-panel blockquote{font-size:12pt}.case-problem,.scenario-panel>p:not(.eyebrow){font-size:9pt}.role-grid{grid-template-columns:1fr 1fr 1fr;gap:17px}.case-bottom{grid-template-columns:1fr 2fr}.role-grid p,.case-bottom p,.case-bottom ul{font-size:8.5pt}.flow-pair p{font-size:9pt}.scenario-box{display:block;overflow:visible}.scenario-side{padding:16px}.scenario-side h3{font-size:16pt}.scenario-side h3 br{display:none}.scenario-results{display:grid;grid-template-columns:1fr 1fr}.scenario-panel{padding:17px;break-inside:avoid}.scenario-panel h3{font-size:14pt}.scenario-panel .eyebrow{font-size:8pt}.scenario-panel ul,.scenario-panel .scenario-boundary{font-size:8pt!important}.table-wrap{overflow:visible;outline:none!important}table,.source-content table{min-width:0;font-size:8pt;table-layout:fixed}th{font-size:8pt}td,th{padding:9px 7px;overflow-wrap:anywhere}tr{break-inside:avoid}thead{display:table-header-group}.evidence-grid{gap:16px}.scope-details,.research-step{break-inside:avoid}.research-step summary{padding:13px 0}.step-title{font-size:11pt}.step-status{font-size:8pt}.step-body{padding:0 0 17px 55px}.step-body h3{font-size:12pt}.step-body dl{font-size:8.5pt;grid-template-columns:105px 1fr}.copy-block{display:none}.talk-section{margin:25px 0 0;padding:25px}.talk-grid{grid-template-columns:repeat(3,1fr)}.talk-grid p{font-size:8.5pt}.source-content{font-size:9pt}.sources-section summary{font-size:10pt}footer{padding:20px 0 0}footer p{font-size:8pt}a{text-decoration:none}.section-heading{break-after:avoid}h2,h3,h4{break-after:avoid}.expand{display:none}.status-pill{font-size:8pt}.caption{font-size:8pt}}
'''
css += r'''
.tech-flow{list-style:none;padding:0;margin:0 0 30px;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}.tech-flow li{padding:16px 12px;background:var(--mint);border:1px solid #c5dcd2;font-size:12px;font-weight:700;border-radius:5px}.tech-flow span{display:block;color:var(--teal);font:700 11px Arial,sans-serif;margin-bottom:9px}#technology .scope-details{margin-top:24px}#technology .caption{margin-top:16px}#technology .scope-details .table-wrap{margin:0}.hero h1{font-size:clamp(31px,3vw,46px)}
#technology .evidence-num{flex:0 0 24px;white-space:nowrap}
.prime-delivery{margin:0 0 30px;padding:24px 0;border-top:2px solid var(--teal);border-bottom:1px solid var(--line)}.prime-delivery h3{font-size:23px;line-height:1.5}.prime-delivery .section-heading{margin-bottom:18px}.prime-delivery ul{padding-left:20px;font-size:12px}.prime-delivery li+li{margin-top:7px}
@media(max-width:580px){.tech-flow{grid-template-columns:1fr;gap:7px}.tech-flow li{display:flex;align-items:center;gap:12px;padding:12px 15px}.tech-flow span{margin:0}.hero h1{font-size:33px}}
@media print{.tech-flow{grid-template-columns:repeat(5,minmax(0,1fr));margin-bottom:18px;break-inside:avoid}.tech-flow li{font-size:8pt;padding:10px}#technology details{break-inside:auto}#technology .evidence-item{break-inside:avoid}.hero h1{font-size:26pt}}
'''
js = r'''
document.documentElement.classList.add('js');
const tabs=[...document.querySelectorAll('[role="tab"]')];
const panels=[...document.querySelectorAll('.case-panel')];
function selectCase(index, focus=false){
 tabs.forEach((t,i)=>{t.setAttribute('aria-selected',String(i===index));t.tabIndex=i===index?0:-1;panels[i].hidden=i!==index;panels[i].setAttribute('role','tabpanel')});
 if(focus)tabs[index].focus();
}
tabs.forEach((t,i)=>{
 t.addEventListener('click',()=>selectCase(i));
 t.addEventListener('keydown',event=>{
  let next=i;
  if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(i+1)%tabs.length;
  else if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(i+tabs.length-1)%tabs.length;
  else if(event.key==='Home')next=0;
  else if(event.key==='End')next=tabs.length-1;
  else return;
  event.preventDefault();selectCase(next,true);
 });
});
selectCase(0);
const scenarioButtons=[...document.querySelectorAll('[data-scenario]')];
function selectScenario(id){
 scenarioButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.scenario===id)));
 document.querySelectorAll('[data-scenario-panel]').forEach(p=>p.hidden=p.dataset.scenarioPanel!==id);
}
scenarioButtons.forEach(b=>b.addEventListener('click',()=>selectScenario(b.dataset.scenario)));
selectScenario('relaxed');
const live=document.getElementById('live-status');
let liveTimer;
function announce(message){live.textContent=message;clearTimeout(liveTimer);liveTimer=setTimeout(()=>live.textContent='',7000);}
document.querySelectorAll('.copy-button').forEach(button=>button.addEventListener('click',async()=>{
 const element=document.getElementById(button.dataset.copy);
 try {
  await navigator.clipboard.writeText(element.textContent);
  announce('단계 질문을 복사했습니다. 실제 연구 요청을 보낼 때 사용할 수 있습니다.');
 } catch {
  const selection=window.getSelection();const range=document.createRange();range.selectNodeContents(element);selection.removeAllRanges();selection.addRange(range);
  announce('자동 복사를 사용할 수 없어 질문을 선택했습니다. Ctrl+C로 복사해 주세요.');
 }
}));
document.getElementById('download-md').addEventListener('click',()=>{
 const markdown=JSON.parse(document.getElementById('markdown-data').textContent);
 const url=URL.createObjectURL(new Blob([markdown],{type:'text/markdown;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download='TS_편의안전_AX_설명자료.md';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
 announce('편집용 Markdown 파일을 저장합니다.');
});
let printState=null;
window.addEventListener('beforeprint',()=>{
 if(printState)return;
 printState=[...document.querySelectorAll('details')].map(el=>[el,el.open]);
 printState.forEach(([el])=>el.open=true);
});
window.addEventListener('afterprint',()=>{if(printState){printState.forEach(([el,open])=>el.open=open);printState=null;}});
document.getElementById('print-button').addEventListener('click',()=>window.print());
const navLinks=[...document.querySelectorAll('.sidebar nav a')];
const sectionObserver=new IntersectionObserver(entries=>{
 const current=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
 if(current)navLinks.forEach(a=>{if(a.hash==='#'+current.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
},{rootMargin:'-5% 0px -60% 0px',threshold:[0,.1,.3]});
navLinks.forEach(a=>sectionObserver.observe(document.querySelector(a.hash)));
'''
page = '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>'+e(D["meta"]["title"])+'</title><meta name="description" content="한국교통안전공단 참조 대화를 편의·안전·조사안·근거 수준·8단계 연구 흐름으로 설명하는 내부 검토 자료."><style>'+css+'</style></head><body>'+body+'<script id="markdown-data" type="application/json">'+json.dumps(MARKDOWN,ensure_ascii=False).replace("<",r"\u003c")+'</script><script>'+js+'</script></body></html>'
outputs = {NAME+".md":MARKDOWN, NAME+".html":page}
manifest_path = BASE / "생성_기록.json"
if manifest_path.exists():
    prev=json.loads(manifest_path.read_text(encoding="utf-8"))
    for filename, expected in prev.get("outputs",{}).items():
        p=BASE/filename
        if p.exists() and hashlib.sha256(p.read_bytes()).hexdigest()!=expected:
            raise RuntimeError("수동 변경 발견, 덮어쓰기 중단: "+filename)
for name, content in outputs.items():
    (BASE/name).write_text(content,encoding="utf-8",newline="\n")
manifest={"date":D["meta"]["date"],"version":D["meta"]["version"],"source_turns":len(S["turns"]),
          "inputs":{name:hashlib.sha256((BASE/name).read_bytes()).hexdigest() for name in ["내용.json","참조대화_보존.json","제작_설명자료.py"]},
          "outputs":{name:hashlib.sha256((BASE/name).read_bytes()).hexdigest() for name in outputs}}
manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(json.dumps({"created":list(outputs),"source_turns":len(S["turns"]),"markdown_chars":len(MARKDOWN),"html_chars":len(page)},ensure_ascii=False))
