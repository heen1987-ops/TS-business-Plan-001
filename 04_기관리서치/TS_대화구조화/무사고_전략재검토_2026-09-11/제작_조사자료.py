"""추가 조사 MD의 내용을 외부 의존성 없는 열람용 HTML로 만든다."""
from pathlib import Path
from html import escape
import json
import re

BASE = Path(__file__).resolve().parent
NAME = 'TS_무사고_전략과_CCK_사업재검토'
records = [
    dict(id='S01', title='교통안전 대한민국, 모두의 참여로 — 오늘도 무사고 통합 캠페인 선포식', publisher='국토교통부', url='https://www.molit.go.kr/USR/NEWS/m_71/dtl.jsp?id=95090903&lcmspage=9', date='2025-04-29', status='공식 검색 결과에서 제목·등록일·담당부서·첨부명 확인. 원 게시 본문 직접 열람 실패', location='보도자료 검색 결과', claim='국토교통부·TS 캠페인 선포 보도자료 존재', limit='본문은 S01a 게시본으로 보완', linked_source='S01a'),
    dict(id='S01a', title='국토교통부 오늘도 무사고 통합 캠페인 선포식 보도자료 PDF', publisher='국토교통부·한국교통안전공단', host='ITS Korea', url='https://itskorea.kr/downloadFile.do?fileId=FILE_000000000101210&fileSn=0', date='2025-04-29', event_date='2025-04-30', status='PDF 3쪽의 추출 본문 열람. 화면 캡처는 도구 내부 오류', location='1쪽: 주최·일정·여섯 수칙 / 2쪽: 당시 활동계획 / 3쪽: 캠페인 취지·발행부서', claim='일상 안전행동을 위한 통합 캠페인. 사망 없는 일상 지향', limit='기관 원 호스팅이 아닌 협회 게시본. 2025년 계획을 2026년 계획으로 해석하지 않음', linked_source='S01'),
    dict(id='S02', title='경영목표 및 전략체계', publisher='한국교통안전공단', url='https://main.kotsa.or.kr/portal/contents.do?menuCode=06020100', date=None, version='2026–2030 중장기 경영목표 체계도', status='공식 웹 본문 열람', location='미션·비전·전략방향·12대 전략과제', claim='사고 예방·안전관리·AI 전환과 국민 서비스 편익을 함께 제시', limit='게시·개정일 미표기. 특정 LLM 사업의 승인·예산 근거가 아님'),
    dict(id='S03', title='TS 보도자료 목록 — 여수엑스포역 캠페인', publisher='한국교통안전공단', url='https://main.kotsa.or.kr/portal/bbs/report_list.do?menuCode=05010200', date='2026-09-07', status='목록 열람', location='열람 당시 목록 번호 2652·제목·등록일', claim='2026년 9월에도 해당 캠페인 관련 공식 게시 확인', limit='개별 기사 본문·행사일·효과 미확인. 갱신되는 목록이므로 이후 페이지 위치가 달라질 수 있음'),
    dict(id='S04', title='운수안전컨설팅지원시스템(COSAS)', publisher='한국교통안전공단', url='https://main.kotsa.or.kr/portal/contents.do?menuCode=01081000', date=None, status='공식 웹 본문 열람', location='제도소개·대상·서비스 내용·업무 흐름 설명', claim='운수회사·지자체 안전관리와 위험 대상·점검 진행 관리 기능 소개', limit='실제 운영 화면·API·성과·개별 LLM 기능·계약 중복은 미검증'),
    dict(id='S05', title='자동차검사 소개', publisher='한국교통안전공단', url='https://main.kotsa.or.kr/portal/contents.do?menuCode=01010101', date=None, status='공식 웹 본문 열람', location='자동차검사란·검사목적', claim='자동차검사의 안전 확인·사고 예방 목적과 기존 수행업무 확인', limit='현행 법령 원문·시행일·개인별 결과·조치 API·실제 미조치 빈도 미확인', prior_source_id='기술확장_2026-09-10/O01'),
    dict(id='S06', title='기계식주차장 검사 소개', publisher='한국교통안전공단', url='https://main.kotsa.or.kr/portal/contents.do?menuCode=01030401', date=None, status='공식 웹 본문 열람', location='검사 소개·검사 유형·관련 서비스', claim='주차설비 안전·성능 관련 기존 검사 업무 확인', limit='LLM 조치 검토의 신규성·실제 현장 상태·운영권한은 확인하지 않음'),
    dict(id='S07', title='운수회사 교통안전담당자 교육', publisher='한국교통안전공단', url='https://main.kotsa.or.kr/portal/contents.do?menuCode=01070101', date=None, status='공식 웹 본문 열람', location='교육목적·대상·교육과정', claim='안전담당자 대상 기존 안전관리 교육 존재', limit='현재 교육 시스템의 대화·평가 기능, 학습 효과·법정 수료 인정 조건은 미검증'),
]
sourcebook = {
    'date': '2026-09-11', 'version': '1.0', 'institution_id': 'ORG-0001',
    'scope': '캠페인·전략·연관 업무에 대한 선별 추가 조사. 전수조사 아님',
    'source_count_note': '8개 기록 중 S01·S01a는 동일 보도자료의 원 게시와 재게시 PDF. 독립 근거 2건으로 계산하지 않음',
    'distinction': '공식 업무소개 확인과 현행 법령·실제 기능·제품 수행 검증을 구별',
    'retrieval_note': '웹 도구 본문 열람과 urllib 파일 수집 결과는 서로 다름. 수집 실패는 근거/수집기록.json 보존',
    'sources': records,
    'assessment': {
        'claim': 'X02·X04의 안전조치 이행 연결을 보완하고 X01은 접근성 가치로 검토한다',
        'type': '조사자의 적용 판단', 'support': ['S01a','S02','S05','S06'],
        'counter_evidence': ['S04: 기존 안전관리 기능 존재', 'S07: 기존 교육 존재'],
        'not_established': ['실제 미해결 문제 규모','기존 계약·기능 대비 신규성','CCK 로컬 제품 수행성','사고 감소 효과'],
        'new_hypothesis': 'H01 상황별 안전학습·이해 확인. 조사 가설이며 신규사업 집계·기존 비용에 미포함'
    }
}
for row in records:
    row['accessed_at'] = '2026-09-11'
(BASE / '출처원장.json').write_text(json.dumps(sourcebook, ensure_ascii=False, indent=2), encoding='utf-8')

def inline(text):
    text = escape(text)
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', lambda m: f'<a href="{m[2]}">{m[1]}</a>', text)
    return re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)

lines = (BASE / (NAME + '.md')).read_text(encoding='utf-8').splitlines()
parts, paragraph = [], []
index, section = 0, 0
def flush():
    if paragraph:
        parts.append('<p>' + inline(' '.join(paragraph)) + '</p>')
        paragraph.clear()
while index < len(lines):
    line = lines[index]
    if not line.strip():
        flush(); index += 1; continue
    if line.startswith('# '):
        flush(); parts.append('<h1>' + inline(line[2:]) + '</h1>'); index += 1; continue
    if line.startswith('## '):
        flush(); section += 1
        parts.append(f'<h2 id="s{section}">' + inline(line[3:]) + '</h2>'); index += 1; continue
    if line.startswith('### '):
        flush(); parts.append('<h3>' + inline(line[4:]) + '</h3>'); index += 1; continue
    if line.startswith('|'):
        flush(); rows = []
        while index < len(lines) and lines[index].startswith('|'):
            cols = [c.strip() for c in lines[index].strip().strip('|').split('|')]
            if not all(re.fullmatch(r'[-: ]+',c) for c in cols):
                rows.append(cols)
            index += 1
        parts.append('<div class="table-wrap" tabindex="0" role="region" aria-label="비교표, 가로로 스크롤할 수 있습니다">')
        parts.append('<table><thead><tr>' + ''.join('<th scope="col">'+inline(c)+'</th>' for c in rows[0]) + '</tr></thead><tbody>')
        for row in rows[1:]:
            parts.append('<tr>' + ''.join('<td>'+inline(c)+'</td>' for c in row) + '</tr>')
        parts.append('</tbody></table></div>'); continue
    if line.startswith('- '):
        flush(); parts.append('<ul>')
        while index < len(lines) and lines[index].startswith('- '):
            parts.append('<li>' + inline(lines[index][2:]) + '</li>'); index += 1
        parts.append('</ul>'); continue
    paragraph.append(line); index += 1
flush()
style = '''
:root{--ink:#172f3b;--muted:#4c626e;--teal:#006857;--line:#cfdbdd;--paper:#f1f5f3}
*{box-sizing:border-box}html{scroll-padding-top:85px}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.85 'Malgun Gothic',system-ui,sans-serif}
a{color:var(--teal);text-underline-offset:4px}a:focus-visible,[tabindex]:focus-visible{outline:3px solid #a75d00;outline-offset:4px}
.skip{position:absolute;top:-100px;left:16px;padding:12px;background:white}.skip:focus{top:8px;z-index:9}
header{background:#fff;border-bottom:1px solid var(--line);padding:17px max(24px,calc((100vw - 1160px)/2));display:flex;gap:24px;justify-content:space-between;align-items:center;position:sticky;top:0;z-index:3}
header b{font-size:14px;white-space:nowrap}nav{display:flex;gap:20px;flex-wrap:wrap;font-size:14px}nav a{text-decoration:none}
main{max-width:1160px;margin:auto;padding:42px 24px 70px}.label{font-size:12px;letter-spacing:.12em;font-weight:bold;color:var(--teal)}
h1{font-size:clamp(32px,4vw,49px);line-height:1.35;letter-spacing:-.045em;max-width:940px;margin:15px 0 20px}h1+p{color:var(--muted);font-size:14px}h1+p+p{font-size:20px;line-height:1.8;max-width:960px}
h1+p+p+p{color:var(--muted);font-size:14px;padding-bottom:22px;border-bottom:1px solid var(--line)}
h1,h2,h3,p,li,td,th{word-break:keep-all;overflow-wrap:anywhere}h2{font-size:27px;line-height:1.45;margin:52px 0 20px;letter-spacing:-.035em}h3{font-size:21px;margin-top:30px}p{margin:16px 0}
.actions{display:flex;gap:14px;flex-wrap:wrap;margin:24px 0}.actions a{padding:9px 15px;background:#fff;border:1px solid var(--line);border-radius:4px;text-decoration:none;font-size:14px}.actions a:first-child{background:var(--teal);color:#fff;border-color:var(--teal)}
.table-wrap{overflow-x:auto;background:#fff;border:1px solid var(--line);border-radius:6px;margin:22px 0}table{width:100%;border-collapse:collapse;font-size:14px;min-width:650px}th,td{padding:17px 16px;text-align:left;vertical-align:top;border-bottom:1px solid var(--line)}th{background:#e2eeea;color:#174c43}td:first-child{font-weight:bold;min-width:115px}tr:last-child td{border-bottom:0}li{margin:11px 0}ul{padding-left:22px}footer{border-top:1px solid var(--line);padding-top:23px;margin-top:45px;color:var(--muted);font-size:14px}
@media(max-width:650px){header{position:static;display:block;padding:16px 20px}nav{margin-top:10px;gap:13px}main{padding:27px 20px 45px}h1+p+p{font-size:18px}h2{font-size:24px}table{min-width:730px}html{scroll-padding-top:12px}}
@media print{header,.actions,.skip{display:none}body{background:white;font-size:10pt}main{padding:0;max-width:none}h1{font-size:26pt}h2{font-size:17pt;break-after:avoid}table{min-width:0;font-size:9pt}.table-wrap{overflow:visible}th,td{padding:8px}a{color:inherit}tr{break-inside:avoid}}
'''
doc = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TS 오늘도 무사고 — CCK 사업 방향 추가 조사</title><style>{style}</style></head><body>
<a class="skip" href="#content">본문으로 건너뛰기</a><header><b>CCK × TS · 추가 조사</b><nav aria-label="문서 목차"><a href="#s1">공식 근거</a><a href="#s3">후보 재검토</a><a href="#s5">안전 성과</a><a href="#s6">사업 적용</a></nav></header>
<main id="content"><div class="label">RESEARCH NOTE · 2026.09.11</div>
<div class="actions"><a href="{NAME}.md">Markdown 원문</a><a href="출처원장.json">출처·열람 상태</a><a href="../../../05_통합사업기획/CCK_TS_AX_정의_RFP_비용산정_2026-09-10/예산조정_v0.3/00_산출물_안내.html">기존 예산 v0.3</a></div>
{''.join(parts)}<footer>기존 서버 · 로컬 LLM · 신규 인프라 투자 0원 · CCK 주관 수행 검증 전<br>이번 자료는 추가 조사이며 기존 RFP·비용 산정의 재발행본이 아닙니다.</footer></main></body></html>'''
(BASE / (NAME + '.html')).write_text(doc, encoding='utf-8')
print(json.dumps({'html':NAME+'.html','sources':len(records),'sections':section},ensure_ascii=False))
