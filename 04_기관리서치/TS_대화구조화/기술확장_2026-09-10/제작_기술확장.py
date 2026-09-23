from pathlib import Path
import json, html, hashlib

B = Path(__file__).resolve().parent
D = json.loads((B / '기술확장_내용.json').read_text(encoding='utf-8'))
NAME = 'CCK_TS_기술기반_확장검토'
e = lambda x: html.escape(str(x), quote=True)
md, parts = [], []

def text(s):
    md.append(s)
    parts.append('<p>'+e(s)+'</p>')

def heading(title, anchor, level=2):
    md.append('#'*level+' '+title)
    parts.append(f'<h{level} id="{anchor}">{e(title)}</h{level}>')

def table(headers, rows, caption):
    safe=lambda s:str(s).replace('|','\\|').replace('\n','<br>')
    md.append('\n'.join(['| '+' | '.join(map(safe,headers))+' |','| '+' | '.join(['---']*len(headers))+' |']+['| '+' | '.join(map(safe,row))+' |' for row in rows]))
    parts.append('<div class="table-wrap" tabindex="0" role="region" aria-label="'+e(caption)+'"><table><caption>'+e(caption)+'</caption><thead><tr>'+''.join('<th scope="col">'+e(x)+'</th>' for x in headers)+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+e(c)+'</td>' for c in row)+'</tr>' for row in rows)+'</tbody></table></div>')

def link(label, href):
    md.append(f'[{label}]({href})')
    parts.append('<p><a href="'+e(href)+'">'+e(label)+' ↗</a></p>')

md.append('# '+D['title'])
text(D['date']+' · v'+D['version']+' · '+D['status'])
text(D['lead'])
parts.append('<div class="thesis">')
text(D['finding'])
parts.append('</div>')
text(D['assumption'])
text('证거 범위'.replace('证','증')+': 참조 대화·프로젝트 지침, CCK 파생 기술대장 K01과 방법론 K02·K03, 이번에 선별 열람한 공식 업무소개 O01~O09. 심층리서치 1~6 결과 본문은 이전과 같이 미열람이며 이 문서로 복원하지 않았다. 사회문제의 규모·최신 사고통계를 새로 조사한 보고서는 아니다.')

heading('1. CCK 기술을 사업 기능으로 바꾸기','assets')
text('아래는 자료에 기재된 자산을 활용하는 설계 가설이다. A1(기존 자산·확인 필요)에 해당하는 출발 근거이며, 검증된 기존 자산 A0로 판정하지 않았다. 지식·규칙 적응 R2, 업무 흐름 조합 R3, API·어댑터 추가 R4를 중심으로 좁히고 코어 변경은 별도 검토한다. 기술 재사용 비율·공수 절감률을 추정하지 않았다.')
table(['기술·자산','문서 기재','사업 기능 연결','적응·추가 개발','증거 한계'],D['assets'],'CCK 기술과 기능의 연결')
text('주관사로서 CCK의 핵심 납품은 업무 의미를 처리하는 로컬 AI, 근거 연결, 단계별 검토·실행, 품질 검증과 전체 통합이다. UI·인증·인프라·기존 시스템 연계는 협력 분담할 수 있지만, 인수 기준과 운영 책임을 CCK가 관리할 수 있어야 한다. 특정 협력사·인력이 확보됐다는 의미는 아니다.')

heading('2. 작은 범위로 납품하는 기술 구조','architecture')
table(['계층','구성','필수 경계'],D['architecture'],'처리 구조 — 제안 설계')
text('실시간 빈자리·자격·기한 계산은 RAG 검색 결과로 대신하지 않는다. 조회는 허용된 API와 매개변수 검증을 거치고, LLM 구조화 출력은 스키마·업무규칙으로 다시 검사한다. 근거 문서의 지시문이 도구 실행 권한을 바꾸지 못하도록 입력 자료와 시스템 정책을 분리한다.')
text('문서 대조는 먼저 관계형 테이블의 항목 ID와 근거 위치로 시작할 수 있다. 전 기관 온톨로지나 자유 NL2SQL을 선행 구축할 필요가 있다는 주장은 하지 않는다. 검색 전 사용자·기관·문서 권한을 적용하고 캐시·벡터DB·로그·모델 호출까지 같은 접근 경계를 유지하도록 설계한다.')
schema='''{
  "case_id": "설명용 사례 ID",
  "item_id": "결과·지적·요건 항목 ID",
  "source": {"document_id": "공식 문서 ID", "version": "버전", "span": "근거 위치"},
  "interpretation": {"text": "설명 초안", "state": "추가확인"},
  "action": {"type": "허용된 업무", "approval_id": null},
  "execution": {"request_id": null, "status": "미실행", "official_receipt": null}
}'''
md.append('제안 데이터 계약의 설명용 예시. CCK 제품의 현행 스키마가 아니다.\n\n```json\n'+schema+'\n```')
parts.append('<p>제안 데이터 계약의 설명용 예시. CCK 제품의 현행 스키마가 아니다.</p><pre><code>'+e(schema)+'</code></pre>')
text('설명 초안 → 사람 확인 → 실행 요청 → 결과 확인의 상태는 별도로 저장한다. 업무별 필요한 승인 절차를 새로 설계하고, Keeper의 Task 제어를 외부 시스템의 트랜잭션 보장으로 취급하지 않는다. 타임아웃 시 공식 상태조회로 결과를 확인하고, 확인 전에는 완료로 표시하거나 같은 쓰기 요청을 반복하지 않는다.')
text('로컬 적합성 확인 항목: 모델·버전·양자화·라이선스, 한국어 도메인 문서의 구조화 출력과 근거 일치, 분할·재통합 시 항목 누락, 임베딩·재순위화의 로컬 실행, 허용 도구 호출, 네트워크 외부 전송 차단, 장문·동시 요청의 응답시간과 GPU 메모리. 자산의 클라우드 실적과 시험 조건이 다르므로 실제 측정 전 숫자를 제시하지 않는다.')

heading('3. 확대할 5개 사업군','families')
text('X01~X05는 이번 문서에서 기술·납품 단위로 정리한 식별자다. 기존 A/B/C와 비교 주제의 연결을 유지하며 정식 후보 원장에 5건을 추가한 것이 아니다. 모든 사업군의 상태는 주관 수행 검증 전이다.')
table(['사업군','이전 조사 연결','핵심 작동','먼저 확인'],[[f['id']+' '+f['title'],f['origin'],f['kind'],f['first']] for f in D['families']],'확대 범위 요약')
labels=[('evidence','조사 근거와 한계'),('ts','TS 접점·권한'),('input','입력'),('mechanism','처리 흐름'),('reuse','CCK 재사용'),('build','추가 개발'),('owner','직접·협력 책임'),('dependency','필수 외부 조건'),('deliver','최소 납품'),('nonai','비AI 비교'),('metric','검증할 성과'),('fail','실패 처리'),('overlap','중복·축소 기준'),('expansion','확산 경로')]
source_map={s['id']:s for s in D['sources']}
for f in D['families']:
    parts.append('<article class="family" aria-labelledby="'+f['id']+'">')
    heading(f['id']+' · '+f['title'],f['id'],3)
    text(f['origin']+' · '+f['kind']+' · 주관 수행 검증 전')
    parts.append('<div class="promise">');text(f['why']);parts.append('</div>')
    text(f['scene'])
    # Core mechanism remains visible; secondary detail opens without custom JS.
    text('핵심 처리: '+f['mechanism'])
    parts.append('<details><summary>기술·납품·책임·검증 상세</summary><div class="detail-body">')
    for key,label in labels:
        if key=='mechanism': continue
        md.append('**'+label+':** '+f[key])
        parts.append('<div class="field"><h4>'+e(label)+'</h4><p>'+e(f[key])+'</p></div>')
    for sid in f['sources']:
        s=source_map[sid];link(sid+' '+s['title'],s['url'])
    parts.append('</div></details></article>')

heading('4. 외부 연계에 따라 달라지는 납품 범위','dependencies')
text('아래 선택기는 연계 조건에 따른 설계 범위를 비교하는 설명 기능이다. 실제 데이터·API를 조회하거나 현재 CCK 수행 능력을 판정하지 않는다. 각 수준에서도 사용권·원문·규칙·제품 구현 검증이 필요하다.')
modes=['전자문서·제공자료만 확보','공식 조회 API 확보','공식 실행 API·동의·권한 확보']
parts.append('<div class="selector js-only"><label for="integration">가정할 연계 수준</label><select id="integration">'+''.join(f'<option value="{i}">{e(v)}</option>' for i,v in enumerate(modes))+'</select><p id="mode-status" role="status" aria-live="polite">'+e(modes[0])+'</p></div>')
for i,title in enumerate(modes):
    parts.append(f'<div class="mode" data-mode="{i}">')
    heading(title,'mode-'+str(i),3)
    table(['사업군','제안 납품 경계'],[[f['id']+' '+f['title'],f['modes'][i]] for f in D['families']],title+' — 범위 비교')
    parts.append('</div>')

heading('5. 보조 기능과 메가이슈의 적용 경로','expansion')
table(['기능','해결 가설','기술 연결','현재 위치'],D['modules'],'2개 보조 기능 — 별도 사업 수에 미포함')
table(['기존 조사축','연결할 사업군','확대의 조건'],D['megas'],'메가이슈를 실제 처리 기능으로 연결')
text('고령자·교통약자 접근성은 X01·X05의 입력·확인·오류 복구에 반영한다. 기본 입력은 텍스트이며 보조자 이용·큰 글자·쉬운 문장 등의 사용성은 실제 이용자와 확인한다. 시각·센서·STT 기술의 신규 도입을 전제로 범위를 확대하지 않는다.')

heading('6. 먼저 검증할 순서와 사업 단위','validation')
table(['검증 순서','대상','근거에 따른 판단','진입 자료와 중단 조건'],D['plan'],'검증 착수 순서 제안 — 선정 순위 아님')
text('현재 추천은 X02·X04의 제한된 전자문서 과업을 먼저 구체화하는 것이다. 공식 자료를 합법적으로 확보할 수 있고 기존 과업과 겹치지 않는다는 조건이 붙는다. X01은 사용자 경험 근거가 구체적이므로 API 확인을 병행한다. 실제 수요·가치·자원 조건이 달라지면 검증 순서를 변경한다.')
table(['검수 축','제안 시나리오','수용 원칙'],[
 ['사실·근거','근거 없음·구버전·서로 다른 대상·충돌 문서','근거 없는 확정 결론을 만들지 않고 출처·미확인을 표시'],
 ['조건·누락','여러 필수조건·조건 수정·장문 분할·항목 일부만 제공','사용자가 확인한 조건과 항목 ID를 보존하고 누락을 확인'],
 ['실행','조회 실패·요청 후 타임아웃·중복 입력·승인 후 내용 변경','조회 불가/빈 결과/결과 미확인을 구별. 승인 내용과 다른 실행을 차단'],
 ['권한·보호','다른 사용자 기록·문서 내 악성 지시·민감정보 포함','권한 밖 조회·전송·로그 노출을 차단. 보호 정책을 제도별 적용'],
 ['성과','현행·비AI 개선·CCK 로컬 구성에 같은 과업 제공','탐색·이해·보완·누락·실제 완료와 검토 부담을 각각 비교'],
 ['운영','모델/문서/규칙 업데이트·로컬 엔드포인트 장애','이전 버전·수동 공식 채널로 복구. 실패 위치와 책임 확인']
],'제품 PoC·인수 시험 설계 — 이번에 실행한 검사가 아님')
text('측정 계획: 사례 단위는 이용자 한 과업 또는 지적사항-조치 문서 묶음으로 정의한다. 같은 사례의 반복 실행을 독립 이용자 수로 세지 않는다. TS 업무전문가가 근거·필수사항·예외 기준을 검토하고 CCK QA가 결과를 기록한다. 목표값·표본수·측정환경·합격 임계값은 실제 위해도와 기준 성능을 확인한 뒤 공동 확정한다. 특정 오류가 발견되면 원인·수정·재검증을 기록하며 소수 사례의 무오류를 운영 안전 보증으로 쓰지 않는다.')
table(['납품 묶음','CCK가 총괄할 내용','견적·수행 판단에 필요한 입력'],[
 ['업무 적응 패키지','입력/항목 스키마, 지식·규칙, 프롬프트, 업무 흐름','문서 종류·분량·버전, 결과코드·예외, 전문가 검토량'],
 ['이용·검토 화면','국민 조건 확인, 근거 대조, 오류·정정, 사람 승인','사용자 역할·접근성, 화면/상태 수, 검토 책임'],
 ['연계 패키지','허용 API·인증, 읽기/쓰기 분리, 상태·중복·재처리','시스템별 API·망·권한, 유지보수사 협조와 인수 기준'],
 ['검수·운영 패키지','사례·평가결과, 모니터링, 버전/로그, 장애·롤백·교육','모델·GPU·동시접속, 유지관리 기간, 보안·검수 조건']
],'독립 R&D가 아닌 업무별 AX+SI 납품 묶음')
text('책임 역할 초안: CCK PM/업무설계, AI·지식 담당, 백엔드·연계 담당, 프론트엔드, QA, 보안·인프라·운영과 TS 업무검수자. 한 사람이 여러 역할을 맡을 수 있으며 인원·투입률·확보 사실을 뜻하지 않는다. 구축 공수는 지식·규칙 적응 + UI + 시스템별 어댑터 + 평가·보안 + 설치·인수로 산정하고, 운영비는 모델/GPU·라이선스·유지관리·갱신 검수로 분리해야 한다. 근거 없는 사업비·납기를 확정하지 않는다.')

heading('7. 기획 기준 P01~P07 점검','criteria')
table(['기준','이 문서에 반영한 근거','남은 검증'],D['pchecks'],'사업기획 기준 추적')
text('자체 검토 판정: 기획 확장 초안으로 조건부 적합. 후보별 의미 처리·납품·외부 조건은 설명 가능하지만 실제 수요·계약 비중복·제품 데모·인력·원가가 미검증이므로 사업 선정·제안 승인 판정은 보류다. 독립 평가위원이나 실제 사용자가 승인한 결과는 아니다.')

heading('8. 출처와 읽은 범위','sources')
text('공식 자료 O01~O09는 2026-09-10에 본문 일부를 선별 열람했다. 게시일·갱신일은 해당 열람 범위에서 확인하지 못했다. 기관 업무소개는 업무 접점의 근거이며 법령의 현행 시행일·개별 위탁·실제 수행조직을 모두 대조한 결과가 아니다. 아래 행 번호는 웹 도구가 반환한 텍스트 기준이다.')
for s in D['sources']:
    parts.append('<article class="source" id="'+s['id']+'">')
    link(s['id']+' · '+s['title'],s['url'])
    text('열람 위치: '+s['location']+' / 확인: '+s['claim']+' / 한계: '+s['limit'])
    parts.append('</article>')
text('K01: CCK솔루션 보유기술 대장, 26.09·2026-09-05·draft-v1. TA-01 구조, TA-02 실행, TA-03 호출, TA-20 지식 파이프라인과 TA-23 계획 단계·주의사항을 읽었다. 작성자의 CONFIRMED·TRL·성능 표기는 독립 실행 검증으로 승격하지 않았다.')
text('K02: CCK ASEF·Agent Engineering 지침(기존 열람). K03: Capability Fit·Reuse Architecture·Technology Gap 지침(이번 재열람). 날짜·버전 미표기, 확인일 2026-09-10. 기술 설계 방법을 설명하는 내부 자료이며 제품 보유·납품 증빙이 아니다.')
link('K01~K03 원본 경로와 적용 기준','../../../00_기획지침/CCK_로컬LLM_적용범위.md')
link('기존 A/B/C·참조 대화 설명자료','../설명자료_2026-09-10/TS_편의안전_AX_설명자료.html')
text('T05~T10의 사용자 경험·AI 제안은 보존 대화의 출처 수준을 유지한다. 이번 기술 확장 요청 U-CCK-03은 현재 작업의 지시이며 참조 대화 턴 수에 더하지 않는다. G: 원본, 정식 사업 후보 원장, 기관 모집단과 자동화는 변경하지 않았다.')
text('남은 검증은 기존 Q01~Q11과 이번 X01~X05 근거·납품 확인표로 이어간다. 웹 업무소개 열람, 문서 QA, 실제 CCK 제품 PoC와 국민 효과 검증을 서로 다른 작업으로 기록한다.')

MARKDOWN='\n\n'.join(md)+'\n'
css='''
:root{--ink:#183444;--muted:#4f646e;--teal:#087166;--line:#cbd5d0;--paper:#f6f5ef;--mint:#e2f0e9}*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:90px}body{margin:0;color:var(--ink);background:var(--paper);font:16px/1.85 "Malgun Gothic","맑은 고딕",Arial,sans-serif}a{color:#086b63;text-underline-offset:4px}a:hover{color:#123646}:focus-visible{outline:3px solid #af5118;outline-offset:4px}header{background:#183444;color:white;padding:52px max(6%,calc((100vw - 1180px)/2)) 42px}header small{letter-spacing:.12em;color:#c4e8dc;font-size:13px}h1{font-size:clamp(34px,4vw,52px);line-height:1.3;letter-spacing:-.04em;margin:17px 0 24px}header p{max-width:780px;color:#e0eae7;margin-bottom:20px}.badge{display:inline-block;border:1px solid #78978e;border-radius:30px;padding:6px 15px;font-size:12px;color:#e0eae7}nav{position:sticky;top:0;z-index:5;background:#fffefa;border-bottom:1px solid var(--line);padding:9px 5%;display:flex;align-items:center;gap:5px;flex-wrap:wrap}nav a{font-size:13px;padding:8px 12px;text-decoration:none;min-height:44px}nav a:hover{background:var(--mint)}main{max-width:1180px;margin:auto;padding:24px 32px 72px}main>p{max-width:1010px}h2{font-size:28px;line-height:1.4;letter-spacing:-.03em;margin:62px 0 22px;padding-top:16px;border-top:2px solid var(--ink)}h3{font-size:23px;line-height:1.45;letter-spacing:-.02em}h4{font-size:14px;margin:0;color:var(--teal)}.thesis{border-left:5px solid var(--teal);background:var(--mint);padding:10px 24px;margin:26px 0;font-weight:bold}.family{margin:25px 0 35px;border:1px solid var(--line);border-top:4px solid var(--teal);padding:24px 30px;background:#fffefa;border-radius:0 20px 0 0}.family h3{margin:0 0 8px}.family>p:first-of-type{font-size:13px;color:var(--muted)}.promise{font-size:19px;font-weight:700;line-height:1.65;margin:18px 0}.family>p{font-size:14px}.table-wrap{overflow:auto;margin:20px 0 30px}table{width:100%;border-collapse:collapse;font-size:13px;min-width:680px;background:#fffefa}caption{text-align:left;font-weight:bold;font-size:13px;padding:0 0 12px}th{background:#e7eee9;font-weight:700;text-align:left;border-top:2px solid #183444}th,td{padding:15px 13px;vertical-align:top;border-bottom:1px solid var(--line)}details{margin:25px 0 4px;border-top:1px solid var(--line)}summary{cursor:pointer;min-height:48px;padding:14px 3px;font-weight:bold;font-size:14px}.detail-body{display:grid;grid-template-columns:1fr 1fr;gap:20px 30px;padding:12px 0 18px}.field p{font-size:14px;margin:6px 0}.detail-body>p{font-size:13px;margin:0}.selector{background:var(--mint);padding:22px;border:1px solid var(--line);border-radius:8px}.selector label{font-weight:700;display:block;margin-bottom:8px}select{max-width:100%;width:470px;font:inherit;background:white;color:var(--ink);padding:10px;min-height:48px;border:1px solid #658177}#mode-status{font-size:13px;margin:10px 0 0}.source{border-top:1px solid var(--line);padding:10px 0;font-size:13px}.source a{font-weight:bold}pre{background:#e9eee8;padding:24px;overflow:auto;font:13px/1.7 Consolas,monospace}.skip{position:absolute;left:-9999px}.skip:focus{left:20px;top:10px;background:white;padding:12px;z-index:20}.js-only{display:none}.js .js-only{display:block}.mode[hidden]{display:none}footer{padding:22px 6%;background:#183444;color:#e0eae7;font-size:13px}.actions{display:flex;gap:10px;flex-wrap:wrap}.actions a{padding:8px 14px;border:1px solid #9ebdb3;border-radius:4px;color:white;font-size:13px;min-height:44px}button{font:inherit;cursor:pointer;border:1px solid #a9c6bc;background:transparent;color:white;padding:8px 14px;border-radius:4px;font-size:13px;min-height:44px}
@media(max-width:650px){body{font-size:14px}header{padding:35px 22px}h1{font-size:35px}header p{font-size:14px}main{padding:20px 20px 50px}nav{position:static;padding:7px 12px}nav a{font-size:12px;padding:7px 10px}h2{font-size:24px;margin-top:44px}h3{font-size:21px}.family{padding:22px 18px}.promise{font-size:17px}.detail-body{grid-template-columns:1fr;gap:19px}.field p{font-size:13px}.thesis{padding:8px 17px}pre{font-size:11px;padding:16px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
@media print{@page{size:A4;margin:15mm}body{background:white;font-size:10pt}header{padding:0;color:#183444;background:white}header small,header p,.badge{color:#183444}.badge{border-color:#183444}h1{font-size:28pt}nav,.actions,.selector,.skip{display:none!important}main{padding:0;max-width:none}h2{font-size:18pt;margin-top:28px;break-after:avoid}h3{font-size:15pt;break-after:avoid}table{min-width:0;font-size:8pt;table-layout:fixed}td,th{overflow-wrap:anywhere;padding:8px 6px}.table-wrap{overflow:visible}.family{padding:16px;break-inside:auto}.promise{font-size:12pt}.detail-body{grid-template-columns:1fr}.field{break-inside:avoid}.field p,.family>p{font-size:9pt}tr{break-inside:avoid}thead{display:table-header-group}.mode[hidden]{display:block!important}pre{white-space:pre-wrap;font-size:8pt}footer{background:white;color:#183444;padding:20px 0}.source{font-size:8pt}}
'''
js='''
document.documentElement.classList.add('js');
const select=document.getElementById('integration'),modes=[...document.querySelectorAll('.mode')];
function update(){modes.forEach((el,i)=>el.hidden=String(i)!==select.value);document.getElementById('mode-status').textContent=select.selectedOptions[0].text+' — 설계 범위 비교';}
select.addEventListener('change',update);update();
let saved=null;
window.addEventListener('beforeprint',()=>{if(saved)return;saved=[...document.querySelectorAll('details')].map(el=>[el,el.open]);saved.forEach(([el])=>el.open=true)});
window.addEventListener('afterprint',()=>{if(saved){saved.forEach(([el,open])=>el.open=open);saved=null;}});
document.getElementById('print').addEventListener('click',()=>window.print());
'''
nav=[('assets','CCK 기술'),('families','5개 사업군'),('dependencies','연계별 납품'),('validation','검증 순서'),('sources','근거')]
page='<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>'+e(D['title'])+'</title><style>'+css+'</style></head><body><a class="skip" href="#main">본문 바로가기</a><header><small>CCK × TS · 기술 기반 사업기획 · 2026.09.10</small><h1>'+e(D['headline']).replace('\n','<br>')+'</h1><p>'+e(D['lead'])+'</p><p class="badge">5개 사업군 · 2개 보조 기능 · 주관 수행 검증 전</p><div class="actions"><a href="'+NAME+'.md" download>Markdown 저장 ↓</a><a href="../설명자료_2026-09-10/TS_편의안전_AX_설명자료.html#technology">기존 설명자료</a><button class="js-only" id="print" type="button">인쇄 / PDF</button></div></header><nav aria-label="문서 목차">'+''.join('<a href="#'+a+'">'+e(t)+'</a>' for a,t in nav)+'</nav><main id="main">'+''.join(parts)+'</main><footer>기획 확장 초안 · 실제 CCK 제품·예약·신청을 실행하지 않는 설명자료</footer><script id="md-data" type="application/json">'+json.dumps(MARKDOWN,ensure_ascii=False).replace('<',r'\u003c')+'</script><script>'+js+'</script></body></html>'
out={NAME+'.md':MARKDOWN,NAME+'.html':page}
manifest=B/'생성_기록.json'
if manifest.exists():
    prev=json.loads(manifest.read_text(encoding='utf-8'))
    for name,sha in prev['outputs'].items():
        p=B/name
        if p.exists() and hashlib.sha256(p.read_bytes()).hexdigest()!=sha:
            raise RuntimeError('수동 변경 발견: '+name)
for name,body in out.items(): (B/name).write_text(body,encoding='utf-8',newline='\n')
manifest.write_text(json.dumps({'version':D['version'],'outputs':{n:hashlib.sha256((B/n).read_bytes()).hexdigest() for n in out}},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(B/'출처원장.json').write_text(json.dumps({'date':D['date'],'institution_id':'ORG-0001','scope':'이 문서의 선별 공식 업무소개. 모집단 전수조사 아님','publication_dates':'열람 범위에서 미확인','sources':D['sources']},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'created':list(out),'families':len(D['families']),'sources':len(D['sources']),'md_chars':len(MARKDOWN)},ensure_ascii=False))
