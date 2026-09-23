"""설명자료의 단일 데이터에서 독립 HTML과 Markdown을 생성한다. 실제 PMS를 실행하지 않는다."""
from pathlib import Path
import json, html, hashlib
ROOT=Path(__file__).resolve().parent
PROJECT=ROOT.parents[2]
D=json.loads((ROOT/"설명자료_데이터.json").read_text(encoding="utf-8"))
E=lambda x:html.escape(str(x),quote=True)
rows=lambda values:"".join("<tr>"+"".join("<td>"+E(v)+"</td>" for v in r)+"</tr>" for r in values)
tasks=D["tasks"]; defaults=D["defaults"]
tokens={
"CSS":(ROOT/"설명서_스타일.css").read_text(encoding="utf-8"),
"JS":(ROOT/"설명서_동작.js").read_text(encoding="utf-8"),
"OVERVIEW":E(D["overview"]),"DEFINITION":E(D["definition"]),
"ASIS":"".join('<div class="'+cl+'">'+E(v)+'</div>' for row in D["asis"] for cl,v in zip(["from","to","measure"],row)),
"FEATURES":"".join("<tr><td>"+E(f["id"])+"</td><td><strong>"+E(f["name"])+"</strong><br>"+E(f["actor"])+"</td><td>"+E(f["input"])+"<br>→ "+E(f["output"])+"</td><td>"+E(f["boundary"])+"</td><td>"+E(f["phase"])+"</td></tr>" for f in D["features"]),
"STEPBUTTONS":"".join('<button type="button" data-step="'+str(i)+'" aria-pressed="'+("true" if i==0 else "false")+'" aria-controls="step-'+str(i)+'">'+str(i+1)+". "+E(s["name"])+"</button>" for i,s in enumerate(D["steps"])),
"STEPPANELS":"".join('<article class="step-panel" id="step-'+str(i)+'" aria-labelledby="step-title-'+str(i)+'"><span class="tag proposal">'+E(s["who"])+'</span><h3 id="step-title-'+str(i)+'">'+str(i+1)+". "+E(s["name"])+'</h3><div class="step-grid"><div><p>'+E(s["action"])+'</p><p><strong>'+E(s["result"])+'</strong></p></div><dl><dt>AI 지원</dt><dd>'+E(s["ai"])+'</dd><dt>남는 기록</dt><dd>'+E(s["record"])+'</dd></dl></div><p class="example">시험결과서 예시 · '+E(s["example"])+'</p></article>' for i,s in enumerate(D["steps"])),
"ARCH":(ROOT/"CCK_Public_AI_PMS_아키텍처.svg").read_text(encoding="utf-8"),
"TASKINPUTS":"".join('<tr><td>'+E(t["name"])+'</td><td><input type="number" id="hours-'+t["id"]+'" value="'+str(t["hours"])+'" min="0" max="100000" step="1" required aria-label="'+E(t["name"])+' 현행 시간" data-label="'+E(t["name"])+' 시간"></td><td><input type="number" id="reduction-'+t["id"]+'" value="'+str(t["reduction"])+'" min="0" max="100" step="0.1" required aria-label="'+E(t["name"])+' 감소율" data-label="'+E(t["name"])+' 감소율"></td></tr>' for t in tasks),
"LOGICROWS":rows([[t["name"],t["mechanism"],t["kpi"],"순시간 차이 × 해당 업무 단가"] for t in tasks]),
"PRINCIPLES":rows(D["principles"]),
"NEWREQ":rows([[r["id"]+" / "+r["turn"],r["text"],r["where"]] for r in D["new_requirements"]]),
"DATA":json.dumps({k:D[k] for k in ["tasks","defaults","steps"]},ensure_ascii=False).replace("</","<\\/"),
}

tokens["YEARBUTTONS"]="".join('<button type="button" data-year="'+y["id"]+'" aria-pressed="'+str(i==0).lower()+'" aria-controls="year-'+y["id"]+'">'+E(y["title"])+' · '+E(y["goal"])+'</button>' for i,y in enumerate(D["years"]))
tokens["YEARPANELS"]="".join('<article class="year-panel" id="year-'+y["id"]+'" aria-labelledby="year-title-'+y["id"]+'"><span class="tag proposal">'+E(y["id"])+' · 개발 연차</span><h3 id="year-title-'+y["id"]+'">'+E(y["title"])+' '+E(y["goal"])+'</h3><p>'+E(y["message"])+'</p><div class="year-grid"><ul>'+''.join('<li>'+E(s)+'</li>' for s in y["scope"])+'</ul><dl><dt>남길 결과</dt><dd>'+E(y["deliverable"])+'</dd><dt>다음 연차의 입력</dt><dd>'+E(y["handoff"])+'</dd></dl></div><p class="gate"><strong>다음으로 넘어갈 조건</strong><br>'+E(y["gate"])+'</p><p><strong>실측할 편익</strong> · '+E(y["benefit"])+'</p></article>' for y in D["years"])
tokens["BUSINESSSTAGES"]="".join('<details class="business-stage" id="business-'+s["id"]+'"><summary>'+E(s["id"])+' · '+E(s["name"])+'</summary><div><p><strong>'+E(s["purpose"])+'</strong></p><p><b>입력</b> · '+E(s["input"])+'</p><p class="process-line">'+E(s["flow"])+'</p><p><b>남는 결과</b> · '+E(s["output"])+'</p><p><b>처리 규칙</b> · '+E(s["boundary"])+'</p><p><b>개발 범위</b> · '+E(s["year"])+'</p><p class="small">'+E(s["example"])+'</p></div></details>' for s in D["business_stages"])
tokens["RATERS"]=rows([[r["role"],r["observes"],r["evidence"],r["limit"]] for r in D["raters"]])
tokens["CADENCE"]=rows(D["cadence"])

specs=[("projects","연간 사업 수 · 건","동일 범위·업무량을 적용하는 예시",0,100000),
("rate","시간당 환산 단가 · 원","공식 단가·실제 급여가 아닌 입력값",0,10000000),
("extra_hours","추가 검토·수정 · 시간/사업","오탐 확인·입력 등 늘어나는 업무",0,100000),
("opex_man","연간 운영비 · 만원","모델·인프라·운영·유지비 포함",0,100000000),
("capex_man","초기 구축·연계비 · 만원","교육·이관 등 일회성 비용 포함",0,100000000),
("years","단순 비용배분 기간 · 년","정식 할인현금흐름 분석과 구별",1,50)]
tokens["PARAMS"]="".join('<label for="calc-'+key+'">'+E(label)+'<input id="calc-'+key+'" type="number" value="'+str(defaults[key])+'" min="'+str(low)+'" max="'+str(high)+'" step="1" required data-label="'+E(label)+'"><span>'+E(note)+'</span></label>' for key,label,note,low,high in specs)
template=(ROOT/"설명서_템플릿.html").read_text(encoding="utf-8")
for key,val in tokens.items():template=template.replace("@@"+key+"@@",val)
assert "@@" not in template
(ROOT/"CCK_Public_AI_PMS_설명서.html").write_text(template,encoding="utf-8")
def mdtable(headers, records):
    clean=lambda x:str(x).replace("|","／").replace("\n"," ")
    return "\n".join(["| "+" | ".join(headers)+" |","|"+"|".join("---" for _ in headers)+"|"]+["| "+" | ".join(clean(v) for v in r)+" |" for r in records])
base=sum(t["hours"] for t in tasks)
gross=sum(t["hours"]*t["reduction"]/100 for t in tasks)
net=gross-defaults["extra_hours"]
value=net*defaults["rate"]*defaults["projects"]
cost=defaults["opex_man"]*10000+defaults["capex_man"]*10000/defaults["years"]
md=f"""# {D["title"]}

- 작성일: 2026-09-10 / 설명자료 v1.1
- 독자: 사업 검토자, 발주기관 담당자, 수행사 PM, 감리·운영·기획 담당자
- 상태: **사업·설계 제안. 실제 엔진·PMS 구현, 기관 승인, 도입 효과 실증 전.**
- 연결: [HTML 설명자료](CCK_Public_AI_PMS_설명서.html) · [아키텍처 SVG](CCK_Public_AI_PMS_아키텍처.svg)
- 기준: 참조 대화 사용자 발언 21건과 기존 조사·구조화 문서. 이전 추가 5건은 [기존 보존본](대화추가_2026-09-10.json), 이번 6건을 포함한 전체는 [21개 턴 보존본](대화전체_설계계속_2026-09-10.json)에 기록.
- 가정: 첫 적용은 공공 정보화사업. TS의 실제 실증 수요·법적 권한·기존 과업과 비중복은 미확정.

## 1. 한 문장과 사업 정의

**{D["overview"]}**

{D["definition"]}

핵심 흐름은 **공동 업무처리 → 이행근거·수행이력 축적 → 인수인계·유지관리 → 감리·평가·후속 기획**이다. CCK의 핵심을 검사로 보는 사용자의 구상을 반영하며, 공통 엔진의 실제 보유 여부와 성능을 확인한 것은 아니다.

직접 사용자는 기관 담당자·수행업체·감리원이다. 최종 국민 편익은 대상 공공서비스의 장애·반복 불편 감소와 연결해 검증해야 한다. 관리 효율 자체만으로 국민 효과를 확정하지 않는다.

## 2. 육하원칙

{mdtable(["구분","정의"],[
["왜","관리 단절·재작업·판단 근거 부족을 줄여 품질·연속성을 지원"],
["무엇을","공동 일정·산출물 처리와 기준·증거·검사·보완·이력을 연결"],
["누가","기관 담당·검토·승인자, 수행사 PM·실무자, 감리원, 운영·기획 담당자"],
["언제","착수 기준 확정부터 수행·검수·유지관리·차기 발주까지"],
["어디서","기관이 허용한 업무환경과 기존 계약·전자결재·PMS 연계"],
["어떻게","공통 엔진에 분야별 기준 적용, AI 후보를 권한 있는 사람이 검토·확정"]
])}

## 3. 왜 도입하는가: 현행과 기대 변화

아래 현행은 사용자 경험에서 도출한 문제 가설이며 기관 전체의 실태조사 결과가 아니다.

{mdtable(["현행 문제 가설","도입 후 처리","실측 지표"],D["asis"])}

AI는 비정형 문서의 의미·표현 차이, 요구사항과 시험증거의 대응, 상충·누락 후보 확인을 돕는다. 날짜·권한·승인은 규칙과 업무 절차로 처리한다.

현행 방식, 기존 PMS 설정·연계, 규칙 기반 검토, AI 지원을 같은 자료로 비교한다. 기존 일정·산출물 기능과 겹치는 부분은 재사용하며 AI 오탐·입력·수정·운영 부담을 포함해 추가 가치를 판단한다.

## 4. 공통 검사·검증 엔진과 서비스 기능

공통 반복구조: **기준 → 증거 → 검사 → 사람 판단 → 조치 → 재검증 → 이력**.

서비스는 사업·일정 공동관리, 문서·증거, AI 검사, 검토·보완·재검증, AI·감리사 두 경로, 기업 수행이력, 전주기 운영·개선의 7개 영역이다. 상세 기능 ID는 참조 AI 답변의 F-01~17과 맞췄으며 기존 PMS-F ID와는 별도 이름공간이다.

{mdtable(["ID","기능","사용자","목적","관리 입력","결과","범위 제안","판단 경계"],[
[f["id"],f["name"],f["actor"],f["purpose"],f["input"],f["output"],f["phase"],f["boundary"]] for f in D["features"]
])}

**주기적 만족도·다면평가 기초·기본 수행이력·인수인계·유지관리 핵심은 1차년도에 포함한다.** 대화 중 달랐던 단계 배치를 이렇게 종합했다. 공식 기업등급·입찰 활용·기관 간 공유는 별도 권한과 기준을 확인한다. 자료가 없는 신규 업체를 저성과로 처리하지 않는다.

기업 레퍼런스는 회사×사업×실제 역할×기간별 확인 사실을 기본으로 하고, 소명·정정·긍정적 성과도 함께 보여준다. 협업·산출물·서비스·PMS 만족도를 목적별로 나누고 주관적 의견과 확정된 이행기록을 구별한다.

## 5. 공동 처리 흐름: 산출물 하나의 끝까지

{mdtable(["단계","담당","처리","AI 지원","남는 기록"],[
[s["name"],s["who"],s["action"],s["ai"],s["record"]] for s in D["steps"]
])}

### 시험결과서 설명 사례

결과서에 성공 수치가 있지만 원시 로그를 찾지 못하면 AI는 추가 증거 필요 후보를 제시한다. 담당자가 타당성을 검토하고 수행사는 증거를 추가하거나 다른 첨부의 로그로 소명한다. 검토자는 현재 제출 버전에서 해소·유지·철회·정정을 판단한다. 로그가 검색되지 않았다는 사실만으로 시험 실패나 업체 부실을 확정하지 않는다.

### 세 가지 상태

- 업무 상태: 작성·제출·검토·보완·재검증·승인.
- AI 상태: 대기·분석 중·완료·일부 추출·실패.
- 공식 계약 절차: 해당 제도·권한에 따른 검사·인수·변경 확정.

정상 접수 후 AI 분석이 실패해도 원래 제출시각과 버전을 유지한다. 재시도·수동 검토 경로를 제공한다. 구버전의 분석 결과로 최신 제출본을 승인하지 않는다.

### 일정·책임·접근

최초 계획일·현재 승인일·예상일·실제 이행일을 분리한다. 기관 검토·자료 제공, 업체 보완, 외부 선행조건을 구별하고 대기시간을 귀책·벌점으로 자동 변환하지 않는다.

공유 업무는 함께 보되 기관 내부 메모·수행사 미제출 초안·타 기업 영업자료를 구분한다. 담당자 변경은 현재 역할과 미결 과업을 인계하고 과거 행위자는 기록에 남긴다.

하자·운영·라이선스·제조사 지원은 각 기산 사건과 기간을 관리한다. 시작이 미확정이면 종료일도 미확정이다. 기간 만료가 미해결 장애의 자동 종결을 뜻하지 않는다.

## 6. AI와 감리사의 두 경로

동일한 접근권한 내에서 기준·산출물·시험증거·변경이력을 활용한다. **AI의 상시 검사 지원과 감리사의 독립 전문검토**를 연결하는 후속 모듈이다.

{mdtable(["경로","주요 역할","경계"],[
["AI 검사 지원","분석 가능한 문서·요구사항 대조, 누락·불일치·증빙 부족 후보, 보완 차이","추출 실패·미확보·미검토 범위 표시. 법정 감리·감리의견으로 표시하지 않음"],
["감리원·감리법인","사업 맥락·중요도·범위, 현장·시스템 확인, 인터뷰, 추가 전문검사","해당 권한에 따라 감리의견·시정 확인을 독립 판단"],
["차이점 검토","상충 의견·증거 차이를 검토하고 보완·재검증","AI와 사람이 동의했다는 사실만으로 정확성 증명 불가"]
])}

등록된 모든 항목을 검사 대상으로 삼는 것과 모두 검증 완료인 것은 다르다. 후속 장애가 발생했다고 감리 부실을 자동 판정하지 않고 당시 범위·확인 가능성·근거·시정 확인을 검토한다. 감리 자격·전문성에 대한 우려는 사용자 의견이며 전체 감리원의 실태로 일반화하지 않는다.

## 7. 기술 아키텍처

![CCK 검사·검증 엔진과 Public AI-PMS](CCK_Public_AI_PMS_아키텍처.svg)

1. 업무 서비스: Public AI-PMS의 공동 일정·제출·검토·승인·이력·운영·감리·기획.
2. 분야별 기준팩: 정보화사업·감리 기준. 회계감사·내부감사·기타 검사는 후속 검토.
3. 공통 엔진: 기준·의무, 증거 연결, 검사 후보, 사람 검토, 조치·재검증, 소명·정정·이력.
4. 데이터·연계: 원본·버전, 업무 DB, 권한 검색, 비동기 분석, 계약·결재 시스템.

핵심 객체: STANDARD → CONTROL → OBJECT → EVIDENCE → TEST → FINDING → REVIEW → ACTION → RETEST → CONCLUSION.

각 항목은 기준·세부조건·대상·증거·방법·발견사항·검토·조치·재검증·결론이다. 서비스 하나에 여러 사업·계약이 연결될 수 있다.

문서 등록 → 형식·권한 확인 → 문단·표·셀 추출 → 추출 품질 기록 → 적용 요구사항 목록별 대조 → 근거 검색 → AI 후보 → 형식·인용·버전 확인 → 사람 검토로 처리한다. 검색 상위 일부 결과만으로 전체 충족을 확정하지 않는다.

접수와 무거운 분석을 분리하고 중복 요청·재시도·동시 수정·구버전 승인을 제어한다. 파일 저장과 업무 DB의 불일치 보정, 권한 철회와 캐시 정리, 복구 절차를 설계한다. API·파일·검색·캐시에 같은 권한을 적용한다.

계약·전자결재의 공식 원본과 PMS 업무 기록의 책임을 필드별로 정한다. 분석 장애를 이유로 임의로 외부 모델에 전송하지 않는다. 기존 인증·문서·검색·LLM 기반과 계약 범위를 확인해 재사용과 신규 구현을 구별한다.

다른 분야로의 확장은 공통 구조 재사용 가설이다. 업무별 법적 지위·검사방법·데이터·전문가·최종 권한을 검증해야 하며 기준팩만 바꾸면 즉시 호환된다고 보장하지 않는다.

## 8. 정량 편익: 설명용 가정과 산식

**아래는 가상 계산이며 실측 효과·공표 임금·확정 견적이 아니다.** 기관·수행사의 동일 기간·범위 업무를 합산하는 예시이며 현금 예산 절감·감축 인원으로 환산하지 않는다.

{mdtable(["업무","현행 시간/사업·년","감소 가정","총감소 시간"],[
[t["name"],t["hours"],str(t["reduction"])+"%",t["hours"]*t["reduction"]/100] for t in tasks
])}

{mdtable(["추가 입력","예시값","해석"],[
["연간 사업 수","10건","동일 범위의 업무량을 갖는다고 가정"],
["시간당 환산 단가","50,000원","공식 단가가 아닌 임의 입력값"],
["추가 검토·수정","40시간/사업","오탐 확인·수정·중복 입력 등 추가 부담"],
["연간 운영비","6,000만원","모델·인프라·운영·유지비 가정"],
["초기 구축·연계비","10,000만원","교육·이관 등 일회성 비용 가정"],
["단순 배분 연수","3년","할인·효과 발현 시점·잔존가치 제외"]
])}

산식:

- 순확보 시간 = Σ(현행 시간 × 감소율) − AI 오탐 확인·수정 등 추가 시간.
- 도입 후 시간 = 현행 시간 − 순확보 시간.
- 연간 시간가치 = 순확보 시간 × 적용 단가 × 연간 사업 수.
- 연환산 차이 = 연간 시간가치 − 연간 운영비 − 초기 구축·연계·교육비 ÷ 배분 연수.

### 기본 가정 계산 결과

- 현행 {base:,.0f}시간 → 총감소 {gross:,.0f}시간.
- 추가 부담 {defaults["extra_hours"]}시간을 빼면 **순확보 {net:,.0f}시간/사업**, 도입 후 {base-net:,.0f}시간.
- 시간가치는 사업당 {net*defaults["rate"]/10000:,.0f}만원, 연간 {defaults["projects"]}개 사업에서 **{value/10000:,.0f}만원**.
- 연환산 구축·운영비는 **{cost/10000:,.1f}만원**, 차이는 **{(value-cost)/10000:,.1f}만원**.
- 이것은 단순 연환산 설명이며 정식 B/C·현금흐름·투자회수 결과가 아니다. HTML에서 가정을 바꿔 음수와 비용 증가도 확인할 수 있다.

이전 대화의 329시간은 추가업무 차감 전 총감소 가정이다. 본 자료는 추가업무 40시간을 별도로 차감하고 공식 임금 대신 명시적인 가상 단가를 사용하므로 이전 답변의 편익 금액과 같지 않다.

감리 준비·기관 대응·인수인계를 위 업무에 포함한 뒤 다시 더하지 않는다. 위험회피·재작업·지연 비용은 사건별 발생확률·실제 손실·기여도를 검증하기 전 합계에서 제외한다. 기관 전체 예산이나 시장규모에 임의 감소율을 곱해 실현 편익으로 표시하지 않는다.

## 9. 기능과 편익의 연결

{mdtable(["업무","개선 메커니즘","실측 지표","산정"],[
[t["name"],t["mechanism"],t["kpi"],"동일 범위 순소요시간 차이 × 업무별 적용 단가"] for t in tasks
])}

### 사회적 편익의 지표

- 판단의 투명성: 근거가 연결된 평가 비율, 소명·정정 처리시간, 후속 조회의 정정 반영률.
- 행정의 연속성: 인수인계 후 재문의·미결 누락·계약 지원기간 누락, 업무 파악 시간.
- 국민 서비스 품질: 초기 장애·반복 결함·이용 실패·서비스 만족도. 대상 서비스와 인과를 확인.
- 공정한 기업 이력: 실제 역할 확인률, 동일 기준 적용, 자료 부족 표시, 소명·정정 접근성.

관계·카르텔 감소, 업체선정 실패 예방, 사업 성공률 향상은 효과 가설이다. 독립적 실증 없이 달성한 성과나 금전편익으로 넣지 않는다.

## 10. 개발 순서와 실증

개발 연차 Y1~Y3와 사업 내부 업무 단계 B1~B3를 구분한다. 실제 시작연도·예산은 미확정이다.

{mdtable(["연차","목표","범위","산출물","다음 연차 조건"],[
[y["title"],y["goal"]," · ".join(y["scope"]),y["deliverable"],y["gate"]] for y in D["years"]
])}

1차년도는 기초 AI 문서 지원과 공동 업무 완결에 집중한다. 2차년도에 버전별 검사·Finding·감리 기준팩·독립 검토를 구축하고, 3차년도에 레퍼런스·평가·성과환류를 고도화한다. 전체를 독립 R&D로 재분류하지 않는다.


협업·컨소시엄 지원은 후속 활용이다. 기관은 필요 역량·역할을 정의하고 기업은 적법한 수행이력으로 보완 역량을 검토한다. 비공개 평가정보 공유나 특정 업체의 자동 선정은 승인된 기능이 아니다.

실증은 업무 유형·난이도·참여자·문서 버전을 맞춰 현행/규칙 기반/AI 지원을 비교한다. 사업 변화·학습효과가 섞이는 단순 전후 비교의 한계를 기록한다. 표본·허용 오류·성공 기준을 결과를 보기 전에 정한다.

확인할 항목은 순업무시간, 누락·불리한 오판과 정정, 기관·업체의 총 입력 부담, 대상 공공서비스의 품질·연속성이다. 감리원의 AI 의견 확인만을 독립 평가로 표시하지 않는다. 실제 사용자 참여 평가가 필요하다.

단계별 기간·예산·목표값·구매·심의 경로는 실제 사업조건 확인 후 결정한다. 운영 효율화의 인력 영향을 숨기거나 시간을 감축 인원으로 변환하지 않는다.

### P01~P07

{mdtable(["기준","초점","확인"],D["principles"])}

## 11. 요구·설계·수치의 확인 수준

{mdtable(["항목","근거","상태"],[
["사용자 요구","공공 PMS 병목 관리의 발언 21건","2026-09-10 본문 확인. 기관 공식 결정은 아님"],
["기존 조사","2026-09-09 조사·구조화 및 16개 출처 원장","당시 확인 수준 유지. 이번 외부 현행성 재검증 없음"],
["CCK 엔진·17개 기능·감리 두 경로","사용자 구상과 참조 AI 제안의 종합","실제 엔진 자산·성능·시스템 구현·법적 적용 미확정"],
["업무량·감소율","참조 AI의 가상 예시","예측·실증 계수로 승격하지 않음"],
["50,000원·추가업무·사업수·구축운영비","이번 설명서 임의 입력값","공표 임금·실제 급여·견적 아님"],
["이전 시제품·24개 점검","참조 답변의 완료 주장","실제 파일·시험기록 미확보"],
["이번 HTML 동작","별도 제작·검증 기록","설명자료의 동작 검사이며 PMS/AI 실증 아님"]
])}

신규 요구 연결:

{mdtable(["요구 ID","원발언","내용","반영"],[[r["id"],r["turn"],r["text"],r["where"]] for r in D["new_requirements"]])}

기존 요구 PMS-R01~20의 상세 연결은 [요구 추적표](../대화확인_변경점과_요구사항추적표.md)에 있다. 기존 원장은 보존하고 이번 확장 R21~33은 이 설명자료에서 별도로 관리한다. 원대화 F-01~17은 사용자 직접 명세가 아닌 AI 제안이며 [설명 데이터](설명자료_데이터.json)의 legacy_req에서 이전 요구와 연결한다.

새 답변에 인용된 시장규모·공표 임금·다른 분야의 생성형 AI 생산성 연구 수치는 이번 자료에서 검증된 사실이나 실현 편익으로 채택하지 않았다. 별도 공식 원문 조사와 공공 PMS 현장 적용성 검토가 필요하다.

## 12. 이번에 구체화한 업무 설계와 다면평가

{mdtable(["업무 단계","입력","처리","결과","개발 범위"],[[s["id"]+" "+s["name"],s["input"],s["flow"],s["output"],s["year"]] for s in D["business_stages"]])}

{mdtable(["평가자","관찰 영역","근거","경계"],[[r["role"],r["observes"],r["evidence"],r["limit"]] for r in D["raters"]])}

{mdtable(["평가 시점","수집","집계 규칙"],D["cadence"])}

평가 대상·주기·역할·질문을 착수에 정하고 주기적 점검·산출물·시험·종료·운영에 연결한다. 수행 사실, 검사·감리 결과, 주관적 평가를 분리해 보여준다. 관찰 불가·미응답은 0점이 아니다.

우수·미흡 수행은 확인된 근거·영향·소명·개선 결과와 함께 레퍼런스에 남긴다. 내부 점수 증감도 사전 기준과 정정 절차가 필요하며, AI 후보·보완 횟수·지연 일수를 자동 벌점으로 바꾸지 않는다. 신규기업의 무이력은 미평가로 처리한다. 공식 입찰 가감점·제재·기관 간 공유는 별도 법적 근거와 권한을 확인한다.

구체적인 Baseline·Evidence·Finding 필드, 상태전이, 화면 5종, API 계약 초안, 수용 시나리오, 평가척도 후보와 운영 규칙은 [연차별·업무별 상세설계](CCK_Public_AI_PMS_연차별_상세설계.md)에 있다. 이 API와 제품 시나리오는 아직 구현·실행하지 않았다.

### 연차별 편익 측정

{mdtable(["연차","우선 측정할 지표"],[[y["title"],y["benefit"]] for y in D["years"]])}

기존 계산기는 하나의 운영기간에 대한 가상 계산이다. 비용배분 3년은 제품 개발 3개년과 별개다. 연차별 적용 업무량·효과 발현·순시간·추가비용을 실측하고 같은 시간을 여러 연차 효과에 중복 합산하지 않는다.

## 13. 사용 방법과 다음 입력

- HTML 파일은 브라우저에서 직접 연다. 외부 라이브러리·폰트·데이터 호출 없이 화면과 예시 계산이 작동한다. 목차·단계 선택·예외 설명·편익 계산·인쇄를 제공한다.
- HTML 자체 화면·계산에는 한 파일이면 된다. Markdown·SVG·검증문서 다운로드 링크까지 유지하려면 같은 폴더를 함께 옮긴다.
- Markdown은 본 문서를 편집하고, SVG는 보고서·슬라이드의 정확한 구조도로 사용할 수 있다.
- 동작 예시는 메모리 안에서 설명만 바꾸며 실제 업무자료를 저장·전송하지 않는다.
- 후속 입력은 실제 계약·산출물·검토 사건, 기관·업체 역할, 현행 시스템·이용권한·문서 표본과 실제 비용이다.

[제작·검증 범위](설명자료_검증.md) · [설계·수용기준](설명자료_설계.md) · [기존 조사](../공공PMS_병목관리_조사보고서_2026-09-09.md) · [기존 구조화](../공공PMS_전체구조화_2026-09-09.md) · [출처목록](../출처목록.md) · [후속조사](../후속조사_대기열.md)
"""
(ROOT/"CCK_Public_AI_PMS_설명서.md").write_text(md,encoding="utf-8")
hashfile=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
input_names=["설명자료_데이터.json","설명서_템플릿.html","설명서_스타일.css","설명서_동작.js","대화추가_2026-09-10.json","대화전체_설계계속_2026-09-10.json","설계확장_데이터.json","생성_설명자료.py","CCK_Public_AI_PMS_연차별_상세설계.md"]
protected=["05_통합사업기획/사업포트폴리오.json","04_기관리서치/관계도/기관법령_관계원장.json","04_기관리서치/공공PMS_병목관리/공공PMS_전체구조화_2026-09-09.md","04_기관리서치/공공PMS_병목관리/대화_요구사항원장.json","04_기관리서치/공공PMS_병목관리/대화원문_2차.json"]
manifest={"date":"2026-09-10","scope":"설명용 HTML·Markdown·SVG; 제품 구현·외부 배포 아님","input_hashes":{n:hashfile(ROOT/n) for n in input_names},"outputs":{n:hashfile(ROOT/n) for n in ["CCK_Public_AI_PMS_설명서.html","CCK_Public_AI_PMS_설명서.md","CCK_Public_AI_PMS_아키텍처.svg","연차별_구조한장.svg","CCK_Public_AI_PMS_연차별_상세설계.md"]},"protected_hashes":{n:hashfile(PROJECT/n) for n in protected},"source_user_turns":len(D["turns"]),"features":len(D["features"]),"new_requirements":len(D["new_requirements"]),"example":{"base_hours":base,"gross_hours":gross,"net_hours":net,"annual_value_won":value,"annual_cost_won":cost,"annual_balance_won":value-cost}}
(ROOT/"생성기록.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps({"created":list(manifest["outputs"]),"example":manifest["example"]},ensure_ascii=False))
