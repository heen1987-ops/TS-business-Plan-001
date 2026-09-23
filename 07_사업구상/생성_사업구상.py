"""기준 원장을 읽어 마인드맵과 사업기획 문서를 생성한다. 외부 통신 없음."""
from pathlib import Path
from html import escape
from urllib.parse import quote
from datetime import datetime
import hashlib
import json
import zipfile

BASE = Path(__file__).resolve().parent
ROOT = BASE.parent
INPUTS = [
    '05_통합사업기획/사업포트폴리오.json',
    '06_심층리서치/01_후보별/후보분석_원장.json',
    '06_심층리서치/03_도입사례/사례원장.json',
    '06_심층리서치/02_공통솔루션/솔루션원장.json',
    '04_기관리서치/관계도/TS_검토관계.json',
    '04_기관리서치/관계도/기관법령_관계원장.json',
    '00_기획지침/신규사업_범위와_중복배제.md',
    '07_사업구상/기획_보완.json',
    '07_사업구상/생성_사업구상.py',
    '07_사업구상/국민체감_재검토.json',
    '00_기획지침/국민체감형_AX_선정기준.md',
    '07_사업구상/고령자_민원완결_AX_구상.md',
]


def read(name):
    return json.loads((ROOT / name).read_text(encoding='utf-8'))


def sha(data):
    return hashlib.sha256(data).hexdigest()


portfolio = read(INPUTS[0])
research = {s['id']: s for s in read(INPUTS[1])['subjects']}
cases = {c['id']: c for c in read(INPUTS[2])['cases']}
solutions = {s['id']: s for s in read(INPUTS[3])['solutions']}
laws = {s['id']: s for s in read(INPUTS[4])}
agencies = {n['id']: n for n in read(INPUTS[5])['nodes']}
design = read(INPUTS[7])
screening = read('07_사업구상/국민체감_재검토.json')
active = [c for c in portfolio['candidates'] if c['scope_review']['status'] == '검토대상']
historical = [c for c in portfolio['candidates'] if c not in active]
assert active, '검토대상 후보가 없습니다.'
assert len(active) == 5 and len(historical) == 3, '후보 수가 바뀌었습니다. 도식 배치와 표기를 먼저 갱신하세요.'
assert not any(c['selected'] for c in active), '사업 선정이 변경됐습니다. 기획 단계 표기를 먼저 갱신하세요.'
assert all(c['scope_review']['non_overlap_status'] == '미확정' for c in active), '비중복 판정이 변경됐습니다. 확인 한계를 갱신하세요.'
for c in active:
    assert c['id'] in design['candidates'], f"기획 보완 필요: {c['id']}"
    assert research[c['id']]['scope_review'] == c['scope_review'], '원장 범위 불일치'
    assert research[c['id']]['name'] == c['name'], '원장 사업명 불일치'
    assert c['nature'] in ['AX 전환', '디지털전환+AI+정보화']
    assert all(x in cases for x in research[c['id']]['case_ids'])
    assert all(x in laws for x in c['mandate_ids'])


def link(label, path):
    return f'[{label}]({quote(path, safe="/#?=&:")})'


def svg_text(x, y, lines, size=20, fill='#152e42', weight=400):
    if isinstance(lines, str):
        lines = [lines]
    return ''.join(f'<text x="{x}" y="{y+i*(size+10)}" font-size="{size}" fill="{fill}" font-weight="{weight}">{escape(t)}</text>' for i, t in enumerate(lines))


def box(x, y, w, h, fill='#ffffff', stroke='#d9e2e9', rx=16):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}"/>'


def svg_start(w, h, title, desc):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc><g font-family="Malgun Gothic, Apple SD Gothic Neo, sans-serif">' + box(0, 0, w, h, '#f5f7fa', '#f5f7fa', 0)


def mindmap():
    s = svg_start(1500, 1100, '국민체감형 TS AX 마인드맵', '기존 5건의 국민 체감·TS 역할·AI 추가 가치 재검토. 구체화 검토 2건, 수행 근거 선확인 1건, 문제 또는 AI 재검토 2건. 선정 확정 아님.')
    s += svg_text(48, 55, '국민체감형 TS AX — 왜 해야 하는가?', 32, weight=700)
    s += svg_text(48, 92, '국민의 불편·위험 → TS의 역할 → AI의 추가 효과  ·  기존 5건 재검토 / 선정 0건  ·  2026.09.09', 19, '#53667a')
    # 관계선을 먼저 그려 모든 텍스트가 노드 안에 남도록 한다.
    hub_x, hub_y = 568, 565
    for y in [241, 493, 795]:
        s += f'<path d="M {hub_x} {hub_y} C 480 {hub_y}, 470 {y}, 426 {y}" fill="none" stroke="#b8c5d0" stroke-width="2"/>'
    for i, c in enumerate(active):
        y = 145 + i * 164
        s += f'<path d="M 794 {hub_y} C 830 {hub_y}, 830 {y+69}, 872 {y+69}" fill="none" stroke="#b8c5d0" stroke-width="2"/>'
    s += box(475, 485, 322, 166, '#183c50', '#183c50', 22)
    s += svg_text(502, 523, '국민이 체감하는', 23, '#dcebf3')
    s += svg_text(502, 565, 'TS AX 솔루션', 30, '#ffffff', 700)
    s += svg_text(502, 607, '왜 필요한가?', 27, '#ffffff', 700)
    left = [
        (145, 192, '01  한 문장 WHY', ['국민의 불편·위험 한 장면', 'TS의 실제 업무·법적 역할', 'AI로 달라질 국민의 경험']),
        (373, 240, '02  작게 적용·효과 확인', ['기존 업무·자산에서 작은 검증', '비AI 대비 추가 효과', '국민 시간·실패·위험의 변화', '운영 비용·현업 부담도 확인']),
        (681, 228, '03  효과의 파급', ['같은 문제가 반복되는 국민', '사업자·지역으로 재적용', '기관별 업무·권한 확인', '효과 없으면 보류·문제 재정의']),
    ]
    for y, h, title, lines in left:
        s += box(42, y, 385, h)
        s += svg_text(66, y+40, title, 24, weight=700)
        s += svg_text(66, y+82, lines, 21, '#405a6e')
    for i, c in enumerate(active):
        d = screening['candidates'][c['id']]
        y = 145 + i * 164
        color = '#176b6b' if c['nature'] == 'AX 전환' else '#395e9d'
        s += box(873, y, 582, 145)
        s += f'<rect x="873" y="{y+20}" width="5" height="105" rx="2" fill="{color}"/>'
        s += svg_text(897, y+29, c['id'] + '  ·  ' + d['decision'], 17, color, 700)
        s += svg_text(897, y+65, d['title'], 24, weight=700)
        s += svg_text(897, y+101, d['short_why'], 20)
        s += svg_text(897, y+128, '해결·효과 가설 / 수행 근거·비중복 확인 필요', 16, '#53667a')
    s += box(42, 959, 1413, 100, '#edf1f5', '#d9e2e9')
    held = ' · '.join(c['id'][-3:] + ' ' + ('공시 확장' if c['id'].endswith('001') else '튜닝 안내' if c['id'].endswith('003') else '드론 안내') + '(' + c['scope_review']['status'] + ')' for c in historical)
    s += svg_text(65, 995, '범위 이력  |  ' + held, 21, weight=700)
    s += svg_text(65, 1030, '작은 적용으로 국민 효과 검증  /  필요한 최소 정보화만 설계  /  비중복·수행 권한·예산·일정 미확정', 19, '#53667a')
    return s + '</g></svg>'


STAGES = [
    ('01', '국민의 한 장면', '누가 무엇이 불편한가', '왜 지금 해결할까', '한 문장 WHY·증거'),
    ('02', 'TS의 역할', '실제 업무·법적 근거', '현재 사업과의 경계', '수행·비중복 확인'),
    ('03', 'AI의 추가 효과', '어떤 행동이 달라질까', '규칙·비AI 대안 비교', 'AI 필요성·검증안'),
    ('04', '작은 적용', '기존 자산·한정 대상', '사람 검토·실패 복구', '필요한 최소 정보화'),
    ('05', '국민 효과 검증', '위험·불편·실패 변화', '비용·권익·운영 부담', '효과·실행 가능성'),
    ('06', '검증 후 확대', '같은 문제에 반복 적용', '기관별 업무·권한', '확산·사업화 판단'),
]


def process_svg():
    s = svg_start(1500, 620, 'TS 신규 사업화 흐름도', '기간을 확정하지 않은 단계별 사업화 설계. 각 단계에서 근거가 부족하면 보완하거나 보류한다.')
    s += svg_text(45, 54, '국민 문제 → TS의 역할 → 작은 AX 적용 → 효과 검증', 31, weight=700)
    s += svg_text(45, 92, '한 문장으로 필요성을 설명하고 효과를 확인한 뒤 넓힙니다. 필요한 협의·심의는 해당 집행 전에 확인합니다.', 20, '#53667a')
    for i, (num, title, l1, l2, out) in enumerate(STAGES):
        x = 42+i*242
        if i < 5:
            s += f'<path d="M {x+225} 235 H {x+237} M {x+232} 231 L {x+237} 235 L {x+232} 239" fill="none" stroke="#758b9f" stroke-width="1.5"/>'
        s += box(x, 141, 221, 236)
        s += svg_text(x+18, 179, num, 27, '#176b6b', 700)
        s += svg_text(x+18, 224, title, 23, weight=700)
        s += svg_text(x+18, 268, [l1, l2], 18, '#405a6e')
        s += svg_text(x+18, 348, out, 16, '#53667a')
    s += box(42, 416, 1431, 153, '#e9f1f1', '#c8dedd')
    s += svg_text(68, 454, '전 과정의 공통 확인', 23, weight=700)
    s += svg_text(68, 493, 'WHY·국민 성과  /  개인정보·안전·접근성  /  사람의 판단 책임  /  데이터 품질·출처·버전  /  비중복', 23)
    s += svg_text(68, 532, '권한·데이터 또는 AI 추가 가치가 없으면 보완·보류  ·  기간·예산·정량 목표는 근거 확보 후 산정', 21, '#405a6e')
    return s + '</g></svg>'


class Doc:
    def __init__(self):
        self.md = []
        self.html = []

    def h(self, level, title, anchor=None):
        self.md.append((f'<a id="{anchor}"></a>\n\n' if anchor else '') + '#' * level + ' ' + title)
        self.html.append(f'<h{level}' + (f' id="{anchor}"' if anchor else '') + f'>{escape(title)}</h{level}>')

    def p(self, text):
        self.md.append(text)
        self.html.append('<p>' + escape(text) + '</p>')

    def links(self, items):
        self.md.append(' · '.join(link(t, u) for t, u in items))
        self.html.append('<p class="links">' + ' · '.join(f'<a href="{escape(quote(u, safe="/#?=&:"))}">{escape(t)}</a>' for t, u in items) + '</p>')

    def table(self, heads, rows):
        self.md.append('| ' + ' | '.join(heads) + ' |\n|' + '|'.join(['---']*len(heads)) + '|\n' + '\n'.join('| ' + ' | '.join(str(v).replace('|', '／').replace('\n', '<br>') for v in row) + ' |' for row in rows))
        self.html.append('<div class="table-wrap"><table' + (' class="two-col"' if len(heads) == 2 else '') + '><thead><tr>' + ''.join('<th scope="col">'+escape(h)+'</th>' for h in heads) + '</tr></thead><tbody>' + ''.join('<tr>'+''.join('<td>'+escape(str(v))+'</td>' for v in row)+'</tr>' for row in rows) + '</tbody></table></div>')

    def ul(self, items):
        self.md.append('\n'.join('- '+x for x in items))
        self.html.append('<ul>' + ''.join('<li>'+escape(x)+'</li>' for x in items) + '</ul>')


doc = Doc()
doc.h(1, '국민이 체감하는 TS AX 솔루션')
doc.h(2, '추가 발굴: 말로 시작해 신청·예약까지 끝내는 TS 민원 AX', 'citizen-completion')
doc.p('고령자에게는 전화 한 통으로 가능한 검사 일정을 찾고 예약까지 마치는 경험을 우선 설계한다. 짧게 묻고 천천히 안내하며, 문자 링크를 열지 않아도 진행할 수 있게 한다. 필요한 본인확인·동의 후 실제 완료를 확인하고, 어려우면 상담원에게 목적·조건·진행 상태를 이어준다. 전화 처리·본인확인·결제·인계 방식은 구현 전 확인 대상이다.')
doc.p('왜 필요한가: 어르신이 사이트와 메뉴를 몰라도 필요한 예약·신청을 끝낼 수 있게 한다. 원하는 일을 말하면 필요한 정보 확인·입력 준비를 돕고, 본인의 확인·동의를 거쳐 실제 처리와 완료 확인까지 연결하는 구상이다.')
doc.p('자동차검사 예약 한 업무를 첫 적용 예시로 검토한다. 사이트 전체를 바꾸는 대신 기존 업무의 허용된 조회·처리 기능을 활용한다. 고령자의 실제 처리 완료율·중도 포기·도움 요청을 현행 절차와 간소화한 비AI 화면에 비교한다. 기존 민원 과업의 실행 범위·본인확인·연계 방식은 미확정이며, 아래 기존 5건과 별도의 발굴 초안이다.')
doc.links([('민원 완결 AX 구상·시나리오·공식 근거', '고령자_민원완결_AX_구상.md')])
doc.p('추가 현장 의견: 예약은 마감인데 현장은 여유로워 보이고, 예약 불가 정보의 반영·표시 때문에 예약이 더 어렵게 느껴진다는 사용자 경험을 기록했다. 목표는 해당 차량이 실제 예약할 수 있는 자리만 추천하고 취소 자리를 제때 연결하는 것이다. 반영 지연·예약/현장 배정 차이는 원인 가설이며 실제 기록으로 확인해야 한다. 잔여석 정확성은 기본 정비로 확보하고 AI는 조건 이해·대기 예측·적합한 선택 지원의 추가 효과를 검증한다.')
doc.p('누가 겪는 어떤 불편·위험을, TS의 어떤 업무에서 AI로 줄이는가?')
doc.p('기획 초안 v0.2 · 2026-09-09 사용자 추가 정정 반영. 기존 5건을 국민 체감·효율성·파급력으로 재검토했다. 구체화 검토 2건, 수행 근거 선확인 1건, 문제 또는 AI 필요성 재검토 2건이다. 모두 기획 판단이며 사업 선정·법적 수행 가능성의 확정이 아니다.')
doc.p('국민의 문제와 달라질 경험을 먼저 설명한다. 기존 업무·자산에서 작은 범위로 AI 효과를 확인하고 필요한 최소 정보화·연계만 뒤에서 설계한다. 전체 인프라 교체를 전제로 두지 않는다.')
doc.links([('국민체감형 AX 선정기준', '../00_기획지침/국민체감형_AX_선정기준.md')])
doc.links([('기획 범위와 중복배제', '../00_기획지침/신규사업_범위와_중복배제.md'), ('기존 사업 맥락', '../00_자료목록/기존_TS_프로젝트_맥락.md'), ('상세 포트폴리오', '../05_통합사업기획/사업기획_통합보기.html')])
doc.h(2, '1. 마인드맵 — 무엇을 기획할 것인가', 'overview')
doc.p('5개를 모두 추천하지 않는다. 국민 문제와 AI 역할이 약한 후보는 문제를 다시 찾는다. 파급력은 같은 문제를 겪는 국민·사업자·지역으로 해결책이 반복 적용될 수 있는지로 검증한다.')
doc.md.append('![TS 신규 사업 마인드맵](TS_신규사업_마인드맵.svg)')
doc.html.append('<img class="diagram" src="TS_신규사업_마인드맵.svg" alt="기획 원칙·공통 설계·사업화 조건을 5개 신규 사업에 연결한 마인드맵. 아래 후보 목록과 사업기획 카드에서 같은 내용을 읽을 수 있습니다.">')
doc.html.append('<div class="candidate-nav" aria-label="사업별 기획 카드">' + ''.join(f'<a href="#{c["id"]}"><small>{c["id"]} · {escape(c["nature"])}</small><strong>{escape(screening["candidates"][c["id"]]["title"])}</strong><span>{escape(screening["candidates"][c["id"]]["short_why"])}</span><b>{escape(screening["candidates"][c["id"]]["decision"])}</b></a>' for c in active) + '</div>')
doc.links([('마인드맵 크게 보기', 'TS_신규사업_마인드맵.svg'), ('편집 가능한 Mermaid', 'TS_신규사업_마인드맵.mmd')])
doc.table(['해결할 국민 문제', '왜 해야 하는가 — 한 문장', '이번 재검토 판단'], [[screening['candidates'][c['id']]['title'], screening['candidates'][c['id']]['why'], screening['candidates'][c['id']]['decision']+' / '+screening['candidates'][c['id']]['reason']] for c in active])
doc.h(2, '2. 국민 문제에서 작은 적용과 효과 검증으로', 'process')
doc.md.append('![TS 사업화 흐름도](TS_사업화_흐름도.svg)')
doc.html.append('<img class="diagram" src="TS_사업화_흐름도.svg" alt="국민의 한 장면, TS의 역할, AI 추가 효과, 작은 적용, 국민 효과 검증, 검증 후 확대의 순서. 단계별 내용은 이어지는 표에 설명합니다.">')
doc.table(['단계', '핵심 질문·완료 근거', '다음 단계 진입 조건'], [
    ['국민의 한 장면', '누가 어떤 불편·위험을 겪으며 왜 해결해야 하는지 한 문장 WHY와 현장 증거로 설명', '국민 문제와 원인·규모가 확인됨. 기술·인프라 필요성을 문제로 대체하지 않음'],
    ['TS의 역할', '해당 법정·수탁·대행 업무의 실제 수행 근거, 현재 추진사업과의 경계', 'TS가 할 수 있는 일과 다른 기관·사업자의 역할, 계약상 비중복 검토'],
    ['AI 추가 효과', 'AI가 바꿀 행동, 기존 규칙·비AI 대안과 비교할 성과·실패 비용', '추가 효과를 검증할 근거·표본·판단 기준 확보. 필요 기술 검증은 사업 일부'],
    ['작은 적용', '기존 자산·한정 대상·위험 유형을 정하고 필요한 최소 정보화만 설계', '사용 권한·사람 검토·현장 확인·실패 복구와 해당 집행 전 필요한 절차 확인'],
    ['국민 효과 검증', '위험·불편·실패 변화와 비용·권익·현업 운영 부담을 함께 비교', '국민 효과와 실행 가능성의 증거 확보. 처리속도나 AI 정확도만으로 통과시키지 않음'],
    ['검증 후 확대', '같은 문제가 반복되는 이용자·사업자·지역에 재적용할 수 있는지 검토', '기관별 업무·자료 제공·운영 책임과 효과를 별도 확인하고 재정·심의 적용 판단'],
])
doc.p('기간은 조건 충족 여부에 따라 정한다. 개인정보 처리·보안 검토와 필요한 협의·심의는 본 구축 단계까지 미루지 않고, 자료 이용·실증·집행에 각각 적용되는 시점 전에 확인한다. 협의의 실제 적용 여부는 아래 기존 공식근거 문서에서 검토를 이어간다.')
doc.links([('공식근거 및 심의경로', '../04_기관리서치/공식근거_및_심의경로.md'), ('사업 유형 판단기준', '../05_통합사업기획/사업유형_판단기준.md')])
doc.h(2, '3. 사업별 기획 카드', 'candidates')
doc.p('현행 업무의 공백은 확인해야 할 가설이다. 아래 목표 업무·최소 실증·산출물·역할은 제안 설계이며 TS의 승인된 과업이나 확정 사업을 뜻하지 않는다. 사례는 기존 심층리서치의 확인 수준을 그대로 보존했다. 인접 분야·공급사 설명·과거 실증을 현재의 동일 업무 AI 도입 실적으로 바꾸지 않는다.')

for index, c in enumerate(active, 1):
    r, d, t = research[c['id']], design['candidates'][c['id']], c['transformation']
    n = screening['candidates'][c['id']]
    doc.h(3, f'{index}. {n["title"]}', c['id'])
    doc.p('왜 해야 하는가: '+n['why'])
    doc.p(f'{c["id"]} · {c["nature"]} · 검토대상 / 비중복 미확정 / 선정 전')
    doc.p('국민체감형 재검토: '+n['decision']+' — '+n['reason'])
    doc.table(['국민 중심 기획', '이번 구체화'], [
        ['TS가 할 수 있는가', c['legal_status']+' / '+c['legal_gap']],
        ['AI가 바꿀 것', n['ai']],
        ['효율적인 작은 시작', n['small_start']],
        ['국민이 체감할 효과', n['citizen_measure']],
        ['효과를 넓힐 경로', n['impact']],
    ])
    doc.p('기존 원장 관리명: '+c['name']+'. 아래 이전 구현·조사 자료는 이번 판단에 맞춰 필요한 부분만 재사용한다. 재검토 후보의 구축 추진을 뜻하지 않는다.')
    doc.html.append('<details><summary>기존 구현 가설·법령·국내외 사례 자세히 보기</summary>')
    doc.html.append('<div class="value-flow">'+''.join('<span>'+escape(v.strip())+'</span>' for v in t['to_be'].split('→'))+'</div>')
    doc.p('한 장면으로 보는 서비스: ' + d['demo'])
    doc.table(['기획 항목', '구상·근거·확인 조건'], [
        ['문제정의와 메가이슈', f'{c["theme"]}와 연결한 가설: {r["problem"]}'],
        ['국민·현업', '수혜자: '+c['beneficiaries']+' / 업무 참여자: '+r['actors']],
        ['WHY — 공공 가치·TS·지금', '국민 가치: '+c['why']['public']+' / TS 관련성: '+c['why']['ts']+' / 시급성 검증: '+c['why']['now']],
        ['현행 가설 → 목표 업무', t['as_is']+' → '+t['to_be']],
        ['디지털전환·데이터', t['digital']+' / 필요한 표본: '+r['dataset']],
        ['AI의 역할', t['ai']+' / 채택 근거: '+c['why']['ai']],
        ['정보화 구축·연계', t['si']],
        ['비AI 비교·반대 가설', c['si']['nonai']+' / '+r['counter']],
        ['최소 실증', d['minimum']],
        ['국민 성과·측정 단위', r['outcome']+' / 단위: '+r['unit']+' / 기준선·표본·정량 목표는 미정'],
        ['실패·권익 지표', r['risk_metric']],
        ['수행·운영 역할안', d['role']],
        ['조직 영향', c['workforce']],
        ['계약상 경계', c['scope_review']['reason']+' 최종 계약·승인 요구사항과 실제 시스템의 대조가 필요하다. 제외 기능: '+t['excluded_work']],
        ['착수에 필요한 근거', d['first_evidence']],
        ['중단·보류 기준', d['stop']],
    ])
    doc.h(4, '구축·검수 산출물')
    doc.ul(d['deliverables'])
    doc.p('비용 산정 입력: '+d['cost_drivers']+'. 구축비와 운영비를 나누고 기존 자산 재사용 비용, 데이터 정비·연계, 검증·보안·접근성, 교육·인수, 지속 평가·유지관리 비용을 포함한다. 금액·재원·공고·사업기간은 미확정이다.')
    doc.h(4, '기관·법령 연결과 확장 조건')
    doc.p(c['legal_status']+' / 적용 판단의 남은 범위: '+c['legal_gap'])
    for lid in c['mandate_ids']:
        l = laws[lid]
        doc.links([(f'{lid} — {l["law"]} {l["article"]} ({l["relation"]})', '../04_기관리서치/관계도/기관법령_관계도.html?node='+lid)])
    doc.table(['확장 검토기관', '재사용·연계 가설', '확인 조건'], [[agencies[e['agency_id']]['name'], e['scope'], e['condition']] for e in c['expansion']])
    doc.p('기관명은 기존 관계원장의 기준시점 정보를 사용했다. 참여·협약·예산·데이터 공유 권한은 확인되지 않았다. 범정부 확장은 기관별 업무·권한 검증 후 공통 구조를 재사용한다는 구상이다.')
    doc.h(4, '국내외 도입·운영·솔루션 사례')
    doc.table(['사례', '확인 단계·시점', 'AI 증거', '적용 판단'], [[x['country']+' / '+x['title'], x['deployment_stage']+' / '+x['event_date'], x['ai_evidence'], x['application_judgment']] for x in (cases[cid] for cid in r['case_ids'])])
    doc.p('위 사례의 독립적 효과 검증은 확인되지 않았다. 사례 수치를 TS의 목표·예상 편익으로 사용하지 않는다.')
    doc.links([(cid+' 근거·한계', '../06_심층리서치/03_도입사례/'+cid+'.md') for cid in r['case_ids']])
    doc.links([(sid+' '+solutions[sid]['name'], '../06_심층리서치/02_공통솔루션/'+sid+'.md') for sid in r['solution_ids']])
    doc.links([('후보별 심층리서치', '../06_심층리서치/01_후보별/'+r['folder']+'/README.md'), ('기존 통합보기에서 검토', '../05_통합사업기획/사업기획_통합보기.html?candidate='+c['id'])])
    doc.h(4, 'P01~P07 검토와 다음 확인')
    doc.table(['기준', '이 구상에서의 반영', '충족 상태'], [
        ['P01 국민 중심', c['beneficiaries']+'의 안전·편익을 성과로 검증', '설계 반영 / 수요·효과 미검증'],
        ['P02 인력 영향', c['workforce'], '검토 항목 반영 / 현업 협의 전'],
        ['P03 AX+SI', d['ai_short']+' + '+d['si_short']+'; 비AI 대안과 비교', '구상 / 추가 가치 미검증'],
        ['P04 메가이슈', c['theme']+' → '+d['problem_short'], '가설 / 규모·원인 검증 필요'],
        ['P05 범정부 확장', '위 확장기관별 업무·데이터·권한 차이를 재검증', '구상 / 참여 미확정'],
        ['P06 법정업무', ' · '.join(c['mandate_ids'])+'; '+c['legal_gap'], '일부 조문 검토 / 적용 미완료'],
        ['P07 WHY·재정', c['why']['value']+'를 성과·실패 지표와 비용 산정 입력으로 연결', '설계 반영 / 편익·재원·심의 적용 미확정'],
    ])

    doc.html.append('</details>')

doc.h(2, '4. 효과를 내는 데 필요한 최소 구성', 'boundaries')
doc.table(['구조', '공통으로 검토할 것', '사업·기관마다 분리할 것'], [
    ['데이터', '식별자·시각·출처·품질·버전 관리 방식', '원천 데이터·처리 목적·제공 근거·보존기간'],
    ['AI', '근거 제시·불확실성·평가·변경 이력', '위험 정의·정답 기준·학습 권한·모델 적합성'],
    ['업무', '사람의 검토·배정·이행·종결 추적 방식', '법정 판단권·안전책임·조치 주체·현장 예외'],
    ['운영', '권한·감사·장애 대응·지속 성과 점검', '계약·수탁 범위·운영 주체·조달·예산'],
])
doc.p('기존 공통 AI 플랫폼, 인증·권한, 문서 처리, 모니터링 등은 실제 기능·이용 조건이 확인되는 범위에서 재사용한다. 공통 기능을 묶었다는 이유로 신규 플랫폼 사업을 만들거나 기관 간 원천 데이터를 통합하지 않는다.')
doc.h(2, '5. 다음 기획 회의에서 결정할 것', 'next')
doc.p('002·005는 국민 위험 유형을 좁혀 구체화하고 004는 실제 수행 근거를 먼저 확인한다. 006은 국민 안전 문제를 다시 찾고 007은 AI 필요성을 재검토한다. 이는 정량 우선순위나 최종 선정이 아니다.')
doc.table(['준비 묶음', '검토 후보', '먼저 확보할 결과'], [
    ['국민 위험과 작은 검증', '002 사업용차 / 005 기계식주차장', '위험 유형 하나, TS의 역할·비중복, 실행 가능한 조치, AI 비교 표본'],
    ['수행 근거 선확인', '004 교통약자', '실제 수탁 범위·상태 갱신 책임을 확인한 뒤 이동 실패 한 장면 구체화'],
    ['대표 사업 추천 전 재검토', '006 철도 / 007 위험물', '006은 국민 안전 문제, 007은 일반 정보화 이상의 AI 필요성부터 확인'],
])
doc.p('위 묶음은 자료 확보 경로이며 우열·선정 순위가 아니다. 다음 기획서에는 확보한 근거로 문제 규모, 목표 사용자, 최소 실증 범위, 비용 산정, 적용 심의·협의, 검수 기준을 채운다.')
doc.h(2, '6. 유보·제외 이력과 확인 한계', 'history')
doc.table(['후보', '현재 판정', '사유'], [[c['id']+' '+c['name'], c['scope_review']['status'], c['scope_review']['reason']] for c in historical])
doc.p('이번 산출물은 기존 아카이브·포트폴리오·심층리서치를 재구성한 시각화 및 기획 초안이다. 새 법령·통계·사례의 외부 조사는 수행하지 않았다. 전체 기관·관계법령의 전수검토 완료본이 아니며, 원문 부분 열람·미확인 사항은 기존 조사 상태를 따른다. 예산·일정·성과·계약상 비중복과 TS의 사업 승인은 확정되지 않았다.')
doc.links([('근거 원장과 운영 방법', 'README.md'), ('심층리서치 종합보고서', '../06_심층리서치/05_종합분석/종합보고서.md'), ('검증 결과', '검증_결과.md')])

CSS = """
:root{color-scheme:light;--ink:#172f43;--muted:#4e6477;--line:#d8e1e8;--paper:#fff;--bg:#f4f7fa;--accent:#176b6b}
*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:80px}body{margin:0;background:var(--bg);color:var(--ink);font:17px/1.75 'Malgun Gothic',sans-serif;word-break:keep-all;overflow-wrap:anywhere}
header{background:#173c50;color:white;padding:15px max(20px,calc((100vw - 1320px)/2));display:flex;gap:18px;align-items:center;flex-wrap:wrap}header strong{font-size:19px}nav{display:flex;gap:18px;flex-wrap:wrap}header a{color:#edf7ff;text-decoration:none;font-size:15px;padding:6px 0}
main{max-width:1376px;padding:28px;margin:auto}h1{font-size:38px;line-height:1.35;letter-spacing:-1px;margin:20px 0}h2{font-size:28px;line-height:1.4;margin:64px 0 22px;border-top:2px solid var(--line);padding-top:25px}h3{font-size:26px;line-height:1.4;margin:54px 0 18px;background:#e5eff0;padding:20px;border-radius:12px;border-left:5px solid var(--accent)}summary{cursor:pointer;padding:16px;background:#eaf0f5;border-radius:8px;color:#175b9a}summary:focus-visible{outline:3px solid #a45400}details{margin:24px 0}h4{font-size:19px;margin:27px 0 10px}p{margin:14px 0}a{color:#175b9a;text-underline-offset:4px}a:focus-visible{outline:3px solid #a45400;outline-offset:4px}.links{font-size:15px}.diagram{display:block;width:100%;height:auto;margin:26px 0}.table-wrap{overflow:auto;margin:20px 0;background:var(--paper);border-radius:10px}table{width:100%;border-collapse:collapse;font-size:16px;text-align:left}th{background:#eaf0f5;font-weight:700}th,td{padding:16px 18px;vertical-align:top;border-bottom:1px solid var(--line)}td:first-child{min-width:160px;width:20%;font-weight:700}ul{padding-left:24px}.candidate-nav{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin:24px 0}.candidate-nav a{display:flex;flex-direction:column;padding:16px;border:1px solid var(--line);border-radius:10px;background:white;text-decoration:none;color:var(--ink);gap:8px}.candidate-nav a:hover{border-color:var(--accent);background:#eff8f7}.candidate-nav small{font-size:12px;color:var(--muted)}.candidate-nav strong{font-size:18px}.candidate-nav span{font-size:14px;color:var(--muted)}.value-flow{display:flex;gap:12px;align-items:stretch;margin:22px 0;flex-wrap:wrap}.value-flow span{background:#173c50;color:white;border-radius:8px;padding:12px 20px;flex:1;position:relative;min-width:140px}.value-flow span+span:before{content:'→';position:absolute;left:-13px;top:12px;color:var(--muted)}footer{padding:35px;text-align:center;color:var(--muted);font-size:14px;border-top:1px solid var(--line)}
@media(max-width:1000px){.candidate-nav{grid-template-columns:repeat(2,1fr)}table{font-size:15px}th,td{padding:13px}}
@media(max-width:650px){main{padding:20px 16px}h1{font-size:30px}h2{font-size:24px}h3{font-size:22px;padding:16px}body{font-size:16px}.candidate-nav{grid-template-columns:1fr}.diagram{display:none}.table-wrap{border-radius:0}table{min-width:610px}.value-flow{flex-direction:column;gap:23px}.value-flow span+span:before{content:'↓';top:-27px;left:calc(50% - 8px)}header nav{gap:16px}.links a{display:inline-block;padding:5px 0}}
@media(max-width:650px){table.two-col{min-width:0}table.two-col td:first-child{min-width:90px;width:30%}table.two-col th,table.two-col td{padding:12px 10px}}
@media print{header,.candidate-nav,footer{display:none}body{background:white;font-size:11pt}main{padding:0}h1{font-size:24pt}h2{font-size:19pt;break-after:avoid}h3{font-size:16pt;break-after:avoid}h4{break-after:avoid}table{font-size:10pt}th,td{padding:8px}tr{break-inside:avoid}.table-wrap{overflow:visible}.diagram{display:block;max-height:240mm;object-fit:contain}a{color:inherit}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
"""
html = '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>TS 신규 사업 마인드맵·기획 구상</title><style>'+CSS+'</style></head><body><header><strong>TS 사업구상</strong><nav aria-label="문서 목차"><a href="#overview">마인드맵</a><a href="#process">사업화 흐름</a><a href="#candidates">5개 사업기획</a><a href="#next">다음 결정</a><a href="../05_통합사업기획/사업기획_통합보기.html">기존 통합보기</a></nav></header><main>'+''.join(doc.html)+'</main><footer>국민체감형 재검토 v0.2 · 2026-09-09 · 사실·가설·미확인 구별 · 외부 통신 없는 로컬 문서</footer></body></html>'
mmd = ['mindmap', '  root((국민이 체감하는 TS AX))']
for decision in ['구체화 검토', '수행 근거 선확인', '문제 재발굴', 'AI 필요성 재검토']:
    mmd.append('    '+decision)
    for c in active:
        n = screening['candidates'][c['id']]
        if n['decision'] == decision:
            mmd.extend(['      '+n['title'], '        '+n['short_why']])
mmd.extend(['    선정 기준', '      국민의 한 장면과 WHY', '      TS 실제 업무·법적 역할', '      비AI 대비 AI 추가 효과', '      작은 적용과 국민 성과', '      같은 문제로 효과 확산', '      기존 추진사업 중복배제'])

outputs = {
    'TS_신규사업_마인드맵.svg': mindmap(),
    'TS_사업화_흐름도.svg': process_svg(),
    'TS_신규사업_마인드맵.mmd': '\n'.join(mmd)+'\n',
    '사업기획_구상서.md': '\n\n'.join(doc.md)+'\n',
    '사업기획_구상보기.html': html,
}
manifest_path = BASE / '생성_기록.json'
old = json.loads(manifest_path.read_text(encoding='utf-8')) if manifest_path.exists() else None
if old:
    for name, expected in old['outputs'].items():
        p = BASE / name
        if not p.is_file() or sha(p.read_bytes()) != expected:
            raise RuntimeError(f'기존 생성본 수동 변경 또는 누락: {name}. 변경 내용을 먼저 기준 데이터에 반영·보존하세요.')
    changed = any(old['outputs'].get(n) != sha(s.encode('utf-8')) for n, s in outputs.items())
    if changed:
        out = BASE / '99_버전보관'
        out.mkdir(exist_ok=True)
        archive = out / (datetime.now().strftime('%Y%m%d_%H%M%S_%f')+'_이전생성본.zip')
        with zipfile.ZipFile(archive, 'x', zipfile.ZIP_DEFLATED) as z:
            z.write(manifest_path, manifest_path.name)
            for name in old['outputs']:
                z.write(BASE / name, name)
            for name in ['검증_결과.md', '화면_검증결과.json', 'QA_마인드맵.png', 'QA_모바일.png']:
                if (BASE / name).is_file(): z.write(BASE / name, name)
for name, content in outputs.items():
    (BASE / name).write_text(content, encoding='utf-8', newline='\n')
manifest = {
    'schema_version': '1.0', 'as_of': portfolio['as_of'], 'scope_revision': portfolio['scope_revision'],
    'design_version': screening['version'], 'status': '제안 설계',
    'active_ids': [c['id'] for c in active], 'historical_ids': [c['id'] for c in historical],
    'input_hashes': {name: sha((ROOT / name).read_bytes()) for name in INPUTS},
    'outputs': {name: sha(s.encode('utf-8')) for name, s in outputs.items()},
}
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(json.dumps({'검토대상':len(active),'유보·제외이력':len(historical),'생성파일':list(outputs)}, ensure_ascii=False))
