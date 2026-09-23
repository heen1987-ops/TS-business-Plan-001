"""네 기준 원장에서 연결 문서를 생성한다. 수동 변경 파일은 덮어쓰지 않는다."""
from pathlib import Path
import hashlib
import json
import os
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parents[1]
PROJECT = ROOT.parent
STATE = ROOT / '00_관리/생성파일_원장.json'
DATE = '2026-09-09'

def read(path):
    return json.loads(path.read_text(encoding='utf-8'))

def digest(data):
    return hashlib.sha256(data).hexdigest()

subjects = read(ROOT / '01_후보별/후보분석_원장.json')['subjects']
cases = read(ROOT / '03_도입사례/사례원장.json')['cases']
solutions = read(ROOT / '02_공통솔루션/솔루션원장.json')['solutions']
sources = read(ROOT / '04_출처아카이브/출처원장.json')['sources']
DATE = read(ROOT / '04_출처아카이브/출처원장.json').get('as_of', DATE)
archived_count = sum(bool(s['archived_path']) for s in sources)
portfolio = {x['id']: x for x in read(PROJECT / '05_통합사업기획/사업포트폴리오.json')['candidates']}
laws = {x['id']: x for x in read(PROJECT / '04_기관리서치/관계도/TS_검토관계.json')}
agencies = {x['id']: x for x in read(PROJECT / '04_기관리서치/관계도/기관법령_관계원장.json')['nodes'] if x['kind']=='기관'}
S = {x['id']: x for x in sources}
C = {x['id']: x for x in cases}
L = {x['id']: x for x in solutions}
B = {x['id']: x for x in subjects}
outputs = {}

def put(path, content):
    if str(path).startswith('01_후보별/'):
        candidate=next((b for b in subjects if '/'+b['folder']+'/' in str(path)),None)
        if candidate:
            scope=candidate['scope_review']
            notice=f"\n\n> 현재 범위: **{scope['status']}** / {candidate['nature']}. {scope['reason']} 비중복은 {scope['non_overlap_status']}이다. 연구·PoC는 전환사업 세부 과업이며 독립 R&D는 현재 대상이 아니다.\n"
            parts=content.strip().split('\n',1);content=parts[0]+notice+'\n'+(parts[1] if len(parts)>1 else '')
    outputs[str(path)] = ('<!-- 기준 원장에서 생성. 수정 절차: 00_관리/폴더_아카이빙_운영규칙.md -->\n' + content.strip() + '\n').encode('utf-8')

def link(label, path, parent):
    target = os.path.relpath(path, parent).replace('\\', '/')
    return f'[{label}](<{target}>)'

def bpath(b):
    return ROOT / '01_후보별' / b['folder']

def clink(cid, parent):
    return link(cid + ' ' + C[cid]['title'], ROOT / '03_도입사례' / (cid + '.md'), parent)

def slink(sid, parent):
    return link(sid, ROOT / '04_출처아카이브/검토노트' / (sid + '.md'), parent)

def blinks(ids, parent):
    return ' · '.join(link(x+' ('+B[x]['scope_review']['status']+')', bpath(B[x]) / 'README.md', parent) for x in ids)

def refs(ids):
    return ''.join(f'[^{int(x.split("-")[-1])}]' for x in dict.fromkeys(ids))

def bibliography(ids):
    rows = ['\n## 출처\n']
    for sid in dict.fromkeys(ids):
        s = S[sid]
        rows.append(f'[^'+str(int(sid.split('-')[-1]))+f']: {s["publisher"]}, [{s["title"]}]({s["url"]}), 게시·갱신 {s["published_at"] or "미확인"}, 확인 {s["accessed_at"]}. 위치: {s["locator"]}. 열람: {s["web_review_status"]}.')
    return '\n\n'.join(rows)

def table(headers, rows):
    clean = lambda x: str(x).replace('|', '／').replace('\n', ' ')
    return '\n'.join(['| ' + ' | '.join(headers) + ' |', '| ' + ' | '.join(['---'] * len(headers)) + ' |'] + ['| ' + ' | '.join(clean(v) for v in row) + ' |' for row in rows])

for s in sources:
    parent = ROOT / '04_출처아카이브/검토노트'
    archive = link('보존 응답', ROOT / s['archived_path'], parent) if s['archived_path'] else '원문 파일 없음 — 검토 노트를 원문으로 사용하지 않음'
    used = [c['id'] for c in cases if s['id'] in c['source_ids']]
    put(f'04_출처아카이브/검토노트/{s["id"]}.md', f'''# {s['id']} · {s['title']}

{table(['관리 항목', '값'], [['발행주체', s['publisher']], ['자료 성격', s['source_type']], ['게시·갱신일', s['published_at'] or '미확인'], ['조사일', s['accessed_at']], ['본문 위치', s['locator']], ['열람 상태', s['web_review_status']], ['원문 수집 상태', s['archive_status']], ['보존본 확인', s.get('archive_body_status', '원문 미보존')]])}

## 확인 내용과 적용 한계

{s['finding']}{refs([s['id']])}

{s['limitations']}

`claim_verified`는 위의 제한된 확인 내용에 대한 열람 판단이다. 법적 적용성·실제 서비스 동작·독립 성과 검증을 뜻하지 않는다. {'본문 검토를 완료하지 못했으므로 탐색 단서로만 관리한다.' if not s['claim_verified'] else '원자료의 발표와 TS 적용 판단을 구별한다.'}

## 보존·추적

- 원문: {archive}
- SHA-256: `{s['sha256'] or '없음'}`
- 취득시각 UTC: {s.get('acquired_at', '미취득')}
- 바이트 수: {s.get('byte_size', '미취득')}
- 수집 응답 제목: {s.get('archive_title', '미취득')}
- 재사용 조건: {s['reuse_note']}
- 연관 사례: {' · '.join(clink(x, parent) for x in used) or '공통 맥락·평가 근거'}

HTML 응답은 실행을 막기 위해 `.html.txt`로 보존한다. 관련 이미지·스크립트·첨부파일까지 내려받은 완전한 웹사이트 사본은 아니다. 링크 변경·내용 변경 시 같은 출처 ID에 새 취득 버전을 연결하고 종전 응답과 판단 이력을 남긴다.
{bibliography([s['id']])}''')

for c in cases:
    parent = ROOT / '03_도입사례'
    facts = '\n\n'.join(S[x]['finding'] + refs([x]) for x in c['source_ids'])
    limits = '\n\n'.join(S[x]['limitations'] for x in c['source_ids'])
    put(f'03_도입사례/{c["id"]}.md', f'''# {c['id']} · {c['title']}

{table(['구분', '확인 수준'], [['국가·지역', c['country']], ['운영·발표 주체', c['operator']], ['도입 단계', c['deployment_stage']], ['사건·발표 시점', c['event_date']], ['AI 역할', c['ai_evidence']], ['비교 적합성', c['comparability']], ['도입비·운영비', '미확인'], ['독립 효과평가', '확인하지 못함'], ['조사일·문서 버전', DATE + ' / v' + c['version']]])}

## 확인한 사례 내용

{facts}

## 증거의 한계

{limits}

운영기관·공급사의 발표를 원출처로 기록했다. 서비스 소개, 구매 계획, 과거 실증, 실명 현장 운영을 동일 단계로 집계하지 않는다. 발표 이후 현재 기능을 직접 시험하거나 현장 인터뷰를 수행하지 않았다. 비용은 공란이며 효과와 비용을 가정해 ROI를 계산하지 않았다.

## TS 적용 판단 — 분석

{c['application_judgment']}

적용 전에는 ① 같은 국민 문제인지 ② 법적 역할과 업무 주체가 같은지 ③ 입력 데이터와 정답을 확보할 수 있는지 ④ 비AI 대안보다 나은지를 확인한다. 외국의 허가·평가 기준은 한국의 기준 자료로 넣지 않는다. 관련 기능을 재사용하더라도 실제 참여기관·데이터 공유는 별도 확인 대상이다.

## 연결과 후속 확인

- 연결 후보: {blinks(c['candidate_ids'], parent)}
- 추가 증거: 현행 운영 확인, 실제 사용자·시설 범위, 비교군과 관측기간이 명시된 성과, 전체 운영비, 실패·중단·변경 이력.
- 개별 출처 상태: {' · '.join(slink(x, parent) for x in c['source_ids'])}
- 유지 원칙: 제목이 비슷해도 운영기관·서비스·기간이 다르면 새 사례로 검토한다. 같은 사업의 단계 변화는 이 사례의 개정 이력으로 남긴다.
{bibliography(c['source_ids'])}''')

for s in solutions:
    parent = ROOT / '02_공통솔루션'
    put(f'02_공통솔루션/{s["id"]}.md', f'''# {s['id']} · {s['name']}

상태: {s['status']}. 아래는 조사에 기반한 설계 대안이며 이미 구축된 TS 제품이 아니다.

## 기능 흐름과 대안

{s['flow']}

{table(['대안', '범위', '채택 판단'], [['SI·비AI 기준안', s['si_baseline'], '콘텐츠·업무·데이터 정비 효과를 먼저 측정'], ['AX+SI 검토안', s['ai_option'], '비중복 확인 후 기준안 대비 국민 과제 성공과 위험·운영비를 비교'], ['필요 기술 검증·PoC', '해결되지 않은 기술 가설·비교 실험·재현 가능한 결과', '신규 전환사업의 세부 과업·독립 R&D 기획 제외']])}

## 공통 구조와 기관별 경계

공통으로 재사용할 것은 출처·버전 식별, 업무 규칙 연결, 접근권한 확인, 평가 데이터 형식, 정정·재검토 기록이다. 기관별로 법령·위탁 범위·공개 항목·보존 기간·승인 책임과 실제 데이터를 분리한다. 각 기관은 허용된 원천자료와 공식 접수 채널을 유지하고, 기관 간 제공 근거가 없는 원문·개인정보는 연결 대상으로 삼지 않는다.

화면에는 적용 기준일, 확인된 근거, 답변의 한계와 담당 채널을 표시한다. 데이터가 오래됐거나 불충분하면 확인 요청으로 전환하고, 이용자가 정정·이의 제기를 시작할 수 있게 한다. 직원 검토시간은 품질·지원 부담과 함께 측정하며 감축 인원으로 환산하지 않는다.

## 수용·중단 기준

{s['acceptance_gate']}

임계값은 현업 전문가와 위험 책임자가 기준 데이터로 정한다. 이번 조사에는 실측 기준값·합격 수치·운영비가 없다. 중대한 오안내·무권한 조회·필수 조치 누락이 발견되면 해당 AI 기능을 중지하고 검증된 규칙·공식 담당자 경로를 유지한다.

## 연결된 후보와 사례

후보: {blinks(s['candidate_ids'], parent)}

{' · '.join(clink(x, parent) for x in s['case_ids'])}

사례의 구현·운영·효과 증거는 위 기준 문서에서 확인한다. 이 공통 설계는 사례 제품의 라이선스 확보나 TS 조달 적합성 판단을 대신하지 않는다.''')

for b in subjects:
    parent = bpath(b)
    folder = '01_후보별/' + b['folder'] + '/'
    p = portfolio[b['id']]
    nav = link('전체 조사 인덱스', ROOT / 'README.md', parent)
    titles = [('01_문제정의.md', '문제정의'), ('02_연관솔루션.md', '연관솔루션·대안'), ('03_국내외사례.md', '국내외 사례 비교'), ('04_사업화_실증.md', 'R&D·정보화·실증'), ('05_근거_미확인.md', '근거·법적 경계·미확인')]
    put(folder+'README.md', f'''# {b['id']} · {b['name']}

{nav} · {link('전체 포트폴리오', PROJECT / '05_통합사업기획/사업기획_통합보기.html', parent)}

- 문제 ID: {b['problem_id']}
- 기획 유형: {b['nature']}
- 조사 상태: {b['status']} / v{b['version']} / {b['checked_at']}
- 사업 선정·재원·예산·추진 일정: 미정

{b['problem']}

## 읽는 순서

{chr(10).join(str(i+1)+'. '+link(title, parent / file, parent) for i,(file,title) in enumerate(titles))}

## 다음 판단을 바꾸는 증거

{b['gap']}

{b['gate']}

공통 사례와 출처는 후보 폴더에 복제하지 않고 ID로 연결한다. 사실·가설·적용 판단을 구별하고 현장 검증 후 후보분석 원장을 개정한다.''')
    domestic = [C[x] for x in b['case_ids'] if C[x]['country']=='대한민국']
    put(folder+'01_문제정의.md', f'''# {b['problem_id']} · 문제정의

{nav} · {link('후보 개요', parent / 'README.md', parent)}

## 문제 가설

{b['problem']}

{table(['분석 항목', '정의'], [['직접 사용자·이해관계자', b['actors']], ['실패가 발생할 수 있는 상황', b['trigger']], ['원인 가설', b['mechanism']], ['반대 가설', b['counter']], ['검토할 경계', b['scope']]])}

## 현행 대응에서 출발하기

{' · '.join(clink(x['id'], parent) for x in domestic)}

위 사례 문서는 공식 안내가 확인된 범위와 현행 가동 미확인 범위를 구분한다. 기존 서비스의 존재는 새로운 서비스를 필요로 한다는 증거가 아니다. 사용자가 어떤 과제에서 실패하는지와 원인이 데이터·시설·업무·화면·설명 중 어디에 있는지 분리해야 한다.

## 규모와 원인 검증

문제 발생률·빈도·이용량·피해 규모는 이 후보 수준에서 아직 실측하지 않았다. 전국 통계나 해외 이용자 수를 TS 사업의 수요·시장규모로 대입하지 않는다. 대표 성공 사례와 실패 사례를 함께 표집하고 이용하지 못한 사람도 조사 대상에 포함한다.

- 필요한 데이터: {b['dataset']}
- 분석 단위: {b['unit']}
- 일차 결과지표: {b['outcome']}
- 위해·부작용 지표: {b['risk_metric']}
- 추가 확인: {b['gap']}

## 문제정의의 수용기준 — 제안

Given: 현재 서비스와 실제 업무를 수행할 수 있는 대표 과제·참여자가 있다. When: 현행 절차로 과제를 수행하고 실패의 원인을 기록한다. Then: 반복되는 미충족 수요와 소관 업무, 대안으로 해결 가능한 범위를 근거로 설명할 수 있어야 한다.

문제 가설이 재현되지 않으면 별도 사업을 만들지 않고 현행 서비스 개선 또는 조사 보류로 전환한다. 사용자 현장 의견은 의견의 출처·표본을 기록하고 TS 공식 결정이나 전 직원 인식으로 일반화하지 않는다.''')
    rows = [[s, link(L[s]['name'], ROOT/'02_공통솔루션'/f'{s}.md', parent), L[s]['ai_option']] for s in b['solution_ids']]
    put(folder+'02_연관솔루션.md', f'''# {b['id']} · 연관솔루션과 대안 설계

{table(['ID', '공통 기능', 'AI 검토 범위'], rows)}

## 현행 → 개선 가설

{table(['전환 항목','범위'],[[label,p['transformation'][key]] for key,label in [('as_is','AS-IS'),('to_be','TO-BE'),('digital','디지털전환'),('ai','AI 핵심 기능'),('si','정보화 구축·연계'),('operations','운영·책임'),('excluded_work','추진사업과 제외 경계')]])}

{p['si']['scope']}

{table(['대안', '구현 범위', '선택 조건'], [['A. 비AI 비교 기준', p['si']['nonai'], 'AI 추가 가치가 없으면 이번 신규 후보를 유보·제외'], ['B. AX·디지털전환+AI+정보화', p['si']['ai'], p['si']['condition']], ['C. 필요한 기술 검증·PoC', p['rnd']['question'], '전환사업의 세부 과업으로 검토·독립 R&D 기획 제외']])}

비용·기간은 모두 미산정이다. 비교에는 콘텐츠 정비, 데이터 연계·정답 작성, 전문가 검토, 모델 이용료, 모니터링·정정, 장애 대체 절차까지 포함한다. AI 사용량이나 모델 정확도 한 가지로 대안을 선택하지 않는다.

## 데이터·업무 흐름 — 제안

공식 원천·업무 규칙 등록 → 출처·시점·접근권한 확인 → 기존 검색·규칙 기준안 → 허용된 AI 보조 → 담당자 판단 또는 국민의 공식 절차 진행 → 오류·정정·조치 결과 기록.

- 필요한 입력: {b['dataset']}
- 책임 경계: {b['scope']}
- 공개 전 조건: {b['gate']}

업무 규칙과 원자료의 버전을 답변·검토 결과에 연결한다. 원문 부족, 규칙 충돌, 접근권한 부족은 각각 이유를 표시하고 공식 담당 채널로 넘긴다. 생성한 문장이 원자료에 없는 사실·허가·검사 결과를 만들지 않도록 검토한다.

## 기존 사업과 중복 판단

{p['existing_relation']}

기존 계약 원문, 승인된 요구사항, 실제 구축 화면·데이터 연계·운영 기능을 대조하기 전에는 재사용 가능 자산이나 신규 과업으로 확정하지 않는다. 계약 이행·신규 사업·수행사 내부 도구는 각기 다른 범위로 기록한다.''')
    rows = [[clink(x,parent), C[x]['country'], C[x]['deployment_stage'], C[x]['ai_evidence'], C[x]['application_judgment']] for x in b['case_ids']]
    put(folder+'03_국내외사례.md', f'''# {b['id']} · 국내외 사례 비교

{table(['기준 사례', '지역', '확인한 단계', 'AI 증거', 'TS 적용 판단'], rows)}

## 비교 결과

국내 사례는 현행 대응과 중복 범위, 국외 사례는 설계 선택지와 실패 조건을 파악하는 데 사용한다. 관련성이 높은 사례라도 법적 권한·데이터·운영환경은 다르다. 이 후보의 핵심 질문은 다음과 같다.

{b['counter']}

현재 연결된 사례에 대해 독립 비교평가에 의한 TS 편익을 입증하지 못했다. 공급사 기능 소개는 실명 시설 도입으로, 구매 계획은 설치 완료로, 과거 실험은 현재 전면 운영으로 계산하지 않는다. 실제 도입·효과·비용의 추가 증거는 각 사례 문서에 누적한다.

## 실증으로 가져올 요소 — 분석

{b['research']}

해외 효과 수치를 국내 목표값으로 복사하지 않는다. 같은 사용자 과제·관측기간·비교군·결과 정의를 확보한 뒤 비교하고, 일치하지 않으면 질적 참고로만 남긴다. 연결된 사례의 출처·날짜·본문 위치는 사례 문서의 각주에서 추적할 수 있다.''')
    whyrows = [['WHY 국민',p['why']['public']],['WHY TS',p['why']['ts']],['WHY 지금',p['why']['now']],['WHY AI',p['why']['ai']],['기술가치철학',p['why']['value']]]
    principles = [['P01 국민 우선', b['outcome']], ['P02 조직 영향', p['workforce']], ['P03 AX+SI 비교', p['si']['nonai']+' 대비 AI 추가 편익과 비용 검증'], ['P04 사회문제·업무', b['problem_id']+' → '+', '.join(b['mandate_ids'])+'; 문제 규모는 추가 조사'], ['P05 범정부 확산', '공통 솔루션 '+', '.join(b['solution_ids'])+'; 기관별 규칙·권한·데이터 분리'], ['P06 법정업무 확인', p['legal_status']+' / '+p['legal_gap']], ['P07 WHY·재정 타당성', '아래 WHY·실증 지표로 편익을 검증하고 사업 유형·재원·규모·시점별 심의 적용성 확인']]
    expansions = '\n'.join('- '+link(agencies[x['agency_id']]['name']+' ('+x['agency_id']+')', PROJECT/'04_기관리서치/관계도/기관법령_관계도.html', parent).replace('.html>', '.html?node='+x['agency_id']+'>')+': '+x['scope']+' — '+x['condition'] for x in p['expansion'])
    put(folder+'04_사업화_실증.md', f'''# {b['id']} · 사업화와 실증 설계

현재 분류: **{b['nature']}**. 범위 판정은 **{p['scope_review']['status']}**이며 비중복·사업 선정·예산·신청 공고는 미확정이다.

## WHY와 공공 가치

{table(['질문', '기획 판단'], whyrows)}

## 연구·정보화·운영의 역할

독립 R&D 사업이 아닌 신규 전환사업이 현재 목표다. 아래 연구 질문·산출물은 필요한 기술 검증의 참고 내용이다. 현재 상태가 유보·제외이면 다음 제안을 위한 연구 착수를 뜻하지 않는다.

- 연구 질문: {p['rnd']['question']}
- 연구 산출물: {p['rnd']['output']}
- 정보화 기반: {p['si']['scope']}
- 실험 설계: {b['research']}
- 운영 책임과 직무 영향: {p['workforce']}

R&D는 선행 과제·논문·특허와 기술적 불확실성을 추가 대조해야 한다. 단순 시스템 구축이나 모델 연결을 연구의 신규성으로 인정하지 않는다. 정보화 중심 후보는 콘텐츠·규칙·연계 정비와 AI의 증분 가치를 검증해 범위를 정한다.

## 단계와 증거

{table(['단계', '확인할 증거', '통과하지 못한 경우'], [['1. 문제·중복', b['gap'], '현행 개선 또는 조사 보류'], ['2. 권한·데이터', b['dataset'], '허용된 공개·모의 데이터 범위로 제한'], ['3. 기준안 비교', b['research'], '비AI 대안 유지·가설 수정'], ['4. 제한 실증', b['outcome']+' 및 '+b['risk_metric'], '해당 AI 기능 중지·원인 분석'], ['5. 사업화·확산', '책임자·예산·운영비·심의·접근성·대체 절차', '사업 확정·운영 반영 보류']])}

## 지표 명세 초안

{table(['항목', '정의'], [['관측 단위', b['unit']], ['일차 결과', b['outcome']], ['위험 지표', b['risk_metric']], ['비교 방법', b['research']], ['기준값·목표값·표본 수', '미정: 현행 기준 측정·위험 검토·통계 설계 후 확정'], ['측정 환경', '동일한 대표 과제와 사용 조건, 기관·기간 외부 검증'], ['측정·판정 책임', '업무 전문가·실증 담당·위험 책임자 역할 필요, 실명 배정 전'], ['수용 조건', b['gate']]])}

관측기간·제외 표본·누락률·실패 조건을 결과와 함께 공개한다. 사고 감소는 장기·저빈도 지표일 수 있으므로 짧은 실증의 탐지 정확도를 곧 사고 감소로 해석하지 않는다. 절약시간을 감축 인원으로 계산하지 않고 안전·품질·이용자 지원·새 검토 부담을 함께 측정한다.

## 재원·심의와 확장

연구비, 구축비, 실증비, 운영비, 확산비를 나누어 총비용을 산정한다. 현재 예산·재원·사업기간·공고는 미정이다. {link('사업 유형 판단 기준', PROJECT/'05_통합사업기획/사업유형_판단기준.md', parent)}과 {link('공식근거 및 심의경로', PROJECT/'04_기관리서치/공식근거_및_심의경로.md', parent)}에서 출발하되 실제 신청 시점의 소관부처·기관 유형·규모·재원·최신 절차를 다시 확인한다. 모든 신규 사업에 동일한 기재부 사전 심의를 적용한다고 단정하지 않는다.

확장 검토기관은 참여 확정 기관이 아니다. 정확한 기관명·지정 유형은 {link('기관법령 관계도', PROJECT/'04_기관리서치/관계도/기관법령_관계도.html', parent)}에서 ID로 조회한다.

{expansions}

## P01~P07 적용

{table(['기준', '충족 근거 또는 남은 조건'], principles)}

판정: 내부 상세 기획 자료로 사용 가능하나 사업 타당성·법적 적용성·예산 및 운영 승인은 보류 상태다.''')
    lawrows = []
    for mid in b['mandate_ids']:
        law = laws[mid]
        day = parse_qs(urlparse(law['source']).query).get('efYd',['미확인'])[0]
        lawrows.append([mid, law['law']+' '+law['article'], law['relation']+' / '+law['status'], day, law['note']])
    sourcerows = [[slink(x,parent), S[x]['title'], S[x]['web_review_status'], '응답 보존' if S[x]['archived_path'] else '원문 미보존'] for x in b['source_ids']]
    put(folder+'05_근거_미확인.md', f'''# {b['id']} · 근거와 미확인 사항

## 기존 법정업무 연결

아래는 기존 기관리서치의 조문 검토 기록을 참조한 것이다. 이번 사례 조사에서 법적 적용성을 새로 확정한 결과가 아니다. 시행일은 기존 원문 링크의 시행 버전이며 실제 착수 시 현행성과 업무별 적용 범위를 다시 대조한다.

{table(['업무 ID', '관계 법령·조문', '기존 검토 상태', '원문 시행 버전', '범위·유보'], lawrows)}

기준 기록: {link('TS 조문 검토표', PROJECT/'04_기관리서치/관계도/TS_조문검토표.md',parent)} · {link('TS 검토관계 원장', PROJECT/'04_기관리서치/관계도/TS_검토관계.json',parent)}.

{p['legal_gap']}

기관의 업무 권한과 개인정보·자료 접근권은 별개의 확인이다. 위탁 가능 규정은 실제 지정·위탁 계약·고시·업무분장 증거와 대조하며, 공공기관 유형과 주무부처를 기관명만으로 추정하지 않는다.

## 조사 출처

{table(['검토 노트', '제목', '열람 수준', '보존'], sourcerows)}

## 미확인 대기열

{table(['순서', '확인할 내용', '필요한 증거', '상태'], [['1', b['gap'], '공식 현행 자료·담당 업무 확인·실제 이용 증거', '대기'], ['2', b['mechanism'], '성공·실패 과제 관찰과 익명 원인 분류', '가설'], ['3', b['counter'], '비AI 기준안과 동일 조건 비교', '미실증'], ['4', 'R&D 신규성 또는 정보화 중복', '현행 계약·선행 연구/과제·발주 범위', '미확인'], ['5', '비용·일정·소관 심의', '재원·총사업비·운영비·신청 시점 기준', '미정']])}

근거가 추가되면 출처→사례→솔루션→후보의 영향 범위를 {link('추적원장', ROOT/'05_종합분석/추적원장.json',parent)}에서 확인한다. 자료 수집 성공과 문제 해결·사업성 확정을 별도 상태로 유지한다.''')

parent=ROOT
rows=[]
for b in subjects:
    rows.append([link(b['id']+' '+b['name'],bpath(b)/'README.md',parent),b['scope_review']['status'],b['nature'],b['problem_id'],', '.join(b['solution_ids']),', '.join(b['case_ids'])])
put('README.md',f'''# TS 심층리서치 · 문제에서 사업 근거까지

{DATE} 기준. 사업기획 담당자와 내부 검토자를 위한 조사 자료다. **{len(subjects)}개 후보·{len(solutions)}개 공통 솔루션·{len(cases)}개 사례 후보·{len(sources)}개 출처**를 연결했다. {archived_count}개 원문 응답을 보존했고 {len(sources)-archived_count}개는 미보존 상태다. 사례 전체가 실명 현장 도입이나 AI 실효성이 검증된 사례라는 뜻이 아니다.

**현재 추진사업을 제외한 신규 AX 전환 또는 디지털전환+AI+정보화사업**을 기획한다. 조사 이력 8건 중 검토대상 5건·유보 2건·제외 1건이다. 독립 R&D와 기존 공통플랫폼·민원·전세버스 공시 AI 연장은 신규 대상에서 제외한다. {link('범위 기준과 후보별 판정',PROJECT/'00_기획지침/신규사업_범위와_중복배제.md',parent)}을 우선 적용한다. 기존 연구·사례는 삭제하지 않고 상태와 함께 보존한다.

먼저 {link('종합보고서',ROOT/'05_종합분석/종합보고서.md',parent)}에서 판단을 읽고, 아래 후보를 열어 문제 → 대안 → 사례 → 실증 → 근거 순서로 확인한다. {link('전체 사업 포트폴리오',PROJECT/'05_통합사업기획/사업기획_통합보기.html',parent)}와 {link('기관·법령 관계도',PROJECT/'04_기관리서치/관계도/기관법령_관계도.html',parent)}는 기존 기준 경로를 유지한다.

## 후보별 상세 조사

{table(['후보 이력', '범위 판정', '현재 사업 성격', '문제', '솔루션', '사례'],rows)}

## 공통 자료와 관리

- {link('솔루션 인덱스',ROOT/'02_공통솔루션/README.md',parent)}: 기관별 법령·규칙·데이터 경계를 유지하는 공통 설계.
- {link('사례 인덱스',ROOT/'03_도입사례/README.md',parent)}: 운영주체·도입단계·AI 여부·효과 한계별 비교.
- {link('출처 인덱스',ROOT/'04_출처아카이브/README.md',parent)}: 공식 주소·날짜·본문 위치·원문 보존·검토 상태.
- {link('비교 매트릭스',ROOT/'05_종합분석/비교매트릭스.md',parent)} · {link('추적원장',ROOT/'05_종합분석/추적원장.json',parent)}: 문제·법정업무·사례·출처 연결.
- {link('폴더·아카이빙 운영규칙',ROOT/'00_관리/폴더_아카이빙_운영규칙.md',parent)} · {link('다음 조사 대기열',ROOT/'00_관리/조사_대기열.md',parent)}.
- {link('작성 템플릿',ROOT/'90_템플릿/README.md',parent)} · {link('검증 결과',ROOT/'00_관리/검증_결과.md',parent)} · {link('변경이력',ROOT/'00_관리/변경이력.md',parent)}.

## 확인 범위

문제 규모와 원인은 현장 검증 전이며 사업 선정·예산·공고 매칭은 미정이다. 국내 위험물 체계는 직접 열람이 미완료이고, 주차설비 국외 공급사 2건은 개별 도입시설·성과가 미확인이다. 과거 시범·운영기관 발표·독립 효과평가는 구별한다. eTAS는 검색 결과와 보존 응답이 달라 현재 가동 여부를 확정하지 않았다. 전체 기관·전 업무·관계법령의 전수검토 완료본이 아니다.''')

put('02_공통솔루션/README.md','# 공통 솔루션\n\n'+table(['ID','기능','비AI 기준안','연결 후보'],[[link(s['id'],ROOT/'02_공통솔루션'/f'{s["id"]}.md',ROOT/'02_공통솔루션'),s['name'],s['si_baseline'],', '.join(s['candidate_ids'])] for s in solutions])+'\n\n제품 선정·기존 구축 완료가 아닌 설계 대안이다.')
put('03_도입사례/README.md',f'# 국내외 사례 인덱스\n\n{len(cases)}건은 도입·실증·서비스 소개·공급사 설명·조사 대기를 포함한다. 독립 성과 검증 건수는 {sum(bool(c["independent_effect_verified"]) for c in cases)}건이며 AI 사용이 명시된 범위와 운영 단계는 각각 확인한다.\n\n'+table(['사례','국가·지역','주체','단계','AI 증거'],[[clink(c['id'],ROOT/'03_도입사례'),c['country'],c['operator'],c['deployment_stage'],c['ai_evidence']] for c in cases]))
put('04_출처아카이브/README.md',f'# 출처와 보존 인덱스\n\n{len(sources)}건 등록, 원문 응답 {archived_count}건 보존, {len(sources)-archived_count}건 미보존. 보존 여부와 관련 본문 열람·주장의 적용 가능성은 별도 상태다. 발행일 미확인은 조회일로 대체하지 않는다.\n\n'+table(['출처','제목','발행주체','게시·갱신','열람','보존'],[[slink(s['id'],ROOT/'04_출처아카이브'),s['title'],s['publisher'],s['published_at'] or '미확인',s['web_review_status'],'응답 보존' if s['archived_path'] else '미보존'] for s in sources]))
put('05_종합분석/비교매트릭스.md','# 후보별 검증 우선사항\n\n점수와 사업성 순위를 매기기 전, 판단을 바꿀 증거를 비교한다. 아래의 실증 방법·성과는 제안이고 실측 결과가 아니다.\n\n'+table(['후보','문제 가설','비AI 기준안','일차 결과','핵심 미확인'],[[link(b['id']+' ('+b['scope_review']['status']+')',bpath(b)/'README.md',ROOT/'05_종합분석'),b['problem'],portfolio[b['id']]['si']['nonai'],b['outcome'],b['gap']] for b in subjects]))

nodes=[];edges=[]
for b in subjects:
    nodes += [{'id':b['id'],'type':'candidate','path':f'01_후보별/{b["folder"]}/README.md','scope_status':b['scope_review']['status'],'nature':b['nature']}, {'id':b['problem_id'],'type':'problem','status':'hypothesis'}]
    edges += [{'from':b['id'],'to':b['problem_id'],'type':'addresses'}]
    for field,typ in [('solution_ids','considers'),('case_ids','compares'),('source_ids','uses_source'),('mandate_ids','references_prior_mandate')]:
        edges += [{'from':b['id'],'to':x,'type':typ} for x in b[field]]
for s in solutions:
    nodes.append({'id':s['id'],'type':'solution','path':f'02_공통솔루션/{s["id"]}.md'})
    edges += [{'from':s['id'],'to':x,'type':'compares'} for x in s['case_ids']]
for c in cases:
    nodes.append({'id':c['id'],'type':'case','path':f'03_도입사례/{c["id"]}.md','status':c['deployment_stage']})
    edges += [{'from':c['id'],'to':x,'type':'evidence'} for x in c['source_ids']]
for s in sources:nodes.append({'id':s['id'],'type':'source','path':f'04_출처아카이브/검토노트/{s["id"]}.md','status':s['web_review_status']})
for mid in sorted({x for b in subjects for x in b['mandate_ids']}):nodes.append({'id':mid,'type':'mandate','path':'../04_기관리서치/관계도/TS_검토관계.json','status':'기존 검토 참조'})
outputs['05_종합분석/추적원장.json']=(json.dumps({'schema_version':'1.0','as_of':DATE,'nodes':nodes,'edges':edges},ensure_ascii=False,indent=2)+'\n').encode('utf-8')

previous = read(STATE).get('files',{}) if STATE.exists() else {}
conflicts=[]
for rel,data in outputs.items():
    f=ROOT/rel
    if f.exists() and f.read_bytes()!=data and previous.get(rel)!=digest(f.read_bytes()):conflicts.append(rel)
if conflicts:raise SystemExit('수동 변경 파일 보존 — 원장으로 반영 후 재생성: '+', '.join(conflicts))
for rel,data in outputs.items():
    f=ROOT/rel;f.parent.mkdir(parents=True,exist_ok=True)
    if not f.exists() or f.read_bytes()!=data:f.write_bytes(data)
STATE.write_text(json.dumps({'as_of':DATE,'files':{p:digest(d) for p,d in outputs.items()}},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'generated':len(outputs),'candidates':len(subjects),'cases':len(cases),'sources':len(sources)},ensure_ascii=False))
