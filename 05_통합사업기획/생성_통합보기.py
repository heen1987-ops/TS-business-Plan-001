"""기획 원장과 기존 법령 조사에서 통합 화면·요약을 생성한다. 외부 수집·배포는 하지 않는다."""
from pathlib import Path
from urllib.parse import urlparse,quote
import json,hashlib
ROOT=Path(__file__).resolve().parent
PROJECT=ROOT.parent
LAW=PROJECT/'04_기관리서치'/'관계도'
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def write(name,text):(ROOT/name).write_text(text,encoding='utf-8')
def safe_url(value):
 parsed=urlparse(value)
 return parsed.scheme in ('http','https') or (not parsed.scheme and not value.startswith('//'))
data=read(ROOT/'사업포트폴리오.json');graph=read(LAW/'기관법령_관계원장.json');curated=read(LAW/'TS_검토관계.json')
nodes={n['id']:n for n in graph['nodes']};source_ids={s['id'] for s in data['sources']}
candidates=data['candidates'];ids=[p['id'] for p in candidates]
assert len(ids)==len(set(ids)), '후보 ID 중복'
required=['problem','beneficiaries','mandate_ids','legal_status','legal_gap','rnd','si','pilot','metrics','existing_relation','why','workforce','expansion','next_action','source_ids','funding_status','budget_krw','target_date','metric_targets','owner']
for p in candidates:
 assert all(k in p for k in required), p['id']+' 필수 항목 없음'
 assert p['nature'] in ['AX 전환','디지털전환+AI+정보화'],p['id']+' 신규 사업 성격 확인'
 assert p['scope_review']['status'] in ['검토대상','유보','제외'],p['id']+' 범위 판정 확인'
 assert all(p['transformation'].get(k) for k in ['as_is','to_be','digital','ai','si','operations','excluded_work','gate']),p['id']+' 전환 구성 누락'
 assert all(id in nodes for id in p['mandate_ids']),p['id']+' 업무 ID 오류'
 assert all(x['agency_id'] in nodes for x in p['expansion']),p['id']+' 확장기관 ID 오류'
 assert all(id in source_ids for id in p['source_ids']),p['id']+' 출처 ID 오류'
 if p.get('selected'):assert p.get('selection_evidence'),p['id']+' 선정 근거 필요'
 assert set(p['why'])=={'public','ts','now','ai','value'},p['id']+' WHY 누락'
for s in data['sources']:assert safe_url(s['url']),s['id']+' 허용되지 않는 출처 주소'
for r in data['review_routes']:assert all(id in source_ids for id in r['source_ids'])
for id in data['baseline']['source_ids']:assert id in source_ids
duty_ids={id for p in candidates for id in p['mandate_ids']}
data['duties']=[]
for d in curated:
 if d['id'] in duty_ids:
  effective=nodes[d['id']]['effective'];effective=effective[:4]+'-'+effective[4:6]+'-'+effective[6:]
  data['duties'].append(dict(d, effective=effective, evidence_as_of=graph['as_of']))
assert {d['id'] for d in data['duties']}==duty_ids
agency_ids={x['agency_id'] for p in candidates for x in p['expansion']}
data['agencies']=[{k:nodes[id].get(k,'') for k in ['id','name','group','category','ministry']} for id in sorted(agency_ids)]
template=(ROOT/'통합보기_원본.html').read_text(encoding='utf-8');assert template.count('__PORTFOLIO_DATA__')==1
payload=json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
write('사업기획_통합보기.html',template.replace('__PORTFOLIO_DATA__',payload))
lookup={d['id']:d for d in data['duties']};sources={s['id']:s for s in data['sources']}
def md(text):return str(text).replace('|','\\|').replace('\n',' ')
rows=['# TS R&D·정보화 사업 포트폴리오','',f"기준일: {data['as_of']}",'','[통합보기](사업기획_통합보기.html) · [사업유형 판단 기준](사업유형_판단기준.md) · [기관·법령 관계도](../04_기관리서치/관계도/기관법령_관계도.html)','',data['scope_note'],'','## 현재 상태','',f"기존 사업 참고 1건, 신규 탐색 후보 {len(candidates)}건이다. R&D·정보화 연계 후보 {sum('R&D' in p['nature'] for p in candidates)}건과 정보화 중심 후보 {sum(p['nature']=='정보화' for p in candidates)}건을 구별했다. 신규 선정·예산 확보는 확인하지 않았다. 표시 순서는 사업 우선순위가 아니다.",'','## 기존 사업 기준','',data['baseline']['name'],'',data['baseline']['status'],'']
rows+=['- '+x for x in data['baseline']['scope']]
rows+=['',data['baseline']['boundary'],'','재사용 가설: '+data['baseline']['reuse_hypothesis'],'','근거: [기존 TS 프로젝트 맥락](../00_자료목록/기존_TS_프로젝트_맥락.md). 계약·승인 요구사항·실제 자산은 추가 대조한다.','','## 신규 후보 전체 비교','','| ID | 후보 | 기획상 사업 성격 | R&D 판단 | 법적 확인 수준 | 다음 확인 |','|---|---|---|---|---|---|']
for p in candidates:rows+=['| '+' | '.join(md(x) for x in [p['id'],p['name'],p['nature'],p['rnd']['status'],p['legal_status'],p['next_action']])+' |']
rows+=['','예산·재원·공고·일정·TRL·성과 목표값·담당자는 미정이다. 데이터 원장의 null은 0원·목표 0·해당 없음이 아니다. 연구와 구축을 한 묶음으로 발주하거나 예산을 중복 계상하는 판단을 하지 않았다.']
for p in candidates:
 rows+=['',f"## {p['id']} · {p['name']}",'',f"상태: {p['status']} / {p['stage']} · {p['funding_status']}",'',f"문제 가설: {p['problem']}",'',f"국민 수혜집단: {p['beneficiaries']}",'','### 법적 근거와 적용 한계','']
 rows+=['', '**현재 범위: '+p['scope_review']['status']+'** — '+p['scope_review']['reason'],'','### 업무·데이터·AI·정보화 전환','','| 항목 | 기획 내용 |','|---|---|']
 for key,label in [('as_is','AS-IS'),('to_be','TO-BE'),('digital','디지털전환'),('ai','AI'),('si','정보화 구축·연계'),('operations','운영·책임'),('excluded_work','진행사업과 제외 경계'),('gate','통과 조건')]:rows+=['| '+label+' | '+md(p['transformation'][key])+' |']
 for id in p['mandate_ids']:
  d=lookup[id];rows+=[f"- [{d['law']}]({d['source']}) {d['article']} / 시행 {d['effective']} / {d['relation']} → {d['name']}. {d['note']}"]
 rows+=['','추가 확인: '+p['legal_gap'],'','### 연구·구축·실증·확산','','| 구분 | 기획 내용 |','|---|---|',f"| R&D 판단 | {md(p['rnd']['status'])} |",f"| 연구 질문 | {md(p['rnd']['question'])} |",f"| 비교 실험 | {md(p['rnd']['experiment'])} |",f"| 연구 결과물 | {md(p['rnd']['output'])} |",f"| SI 구축 | {md(p['si']['scope'])} |",f"| AI 역할 | {md(p['si']['ai'])} |",f"| 비AI 대안 | {md(p['si']['nonai'])} |",f"| 구축 선행조건 | {md(p['si']['condition'])} |",f"| 실증 | {md(p['pilot'])} |",f"| 성과 지표 후보 | {md(' / '.join(p['metrics']))} |",'| 측정 기준 | 기준값·목표값·표본·측정기간·평가방법 세부·책임자 미정. 사업 기획 단계에서 사전 합의 |','',f"기존 사업과의 관계: {p['existing_relation']}",'',f"현업·직무 영향: {p['workforce']}",'','확장 가설:','']
 for x in p['expansion']:rows+=[f"- {nodes[x['agency_id']]['name']}: {x['scope']}. 조건: {x['condition']}"]
 rows+=['','확장기관 참여·협약·데이터 공유는 확인하지 않았다.','','### WHY와 다음 실행','']
 for k,label in [('public','왜 공공인가'),('ts','왜 TS인가'),('now','왜 지금인가'),('ai','왜 AI인가'),('value','지킬 가치')]:rows+=['- '+label+': '+p['why'][k]]
 rows+=['','다음 실행: **'+p['next_action']+'**','', '관련 자료: '+' · '.join(f"[{sources[id]['title']}]({sources[id]['url']})" for id in p['source_ids']), '']
rows+=['## 출처·날짜·확인 한계','']
for s in data['sources']:rows+=[f"- {s['id']} · [{s['title']}]({s['url']}) / {s['date']}. 확인: {s['claim']}. 한계: {s['limit']}."]
rows+=['','## 다음 반복주기','', '평일 오전 9시 기관 리서치에서 신규 근거를 해당 후보에 연결한다. 초기 비교를 위해 TS-BIZ-001·002·003의 기존 자산·법적 권한·실제 수요부터 확인할 수 있으나, 이는 조사 효율을 위한 순서 제안이며 사업성 우선순위 확정이 아니다. 가능규정이 있는 TS-BIZ-004·007은 실제 지정·대행 확인을 먼저 처리한다.','','[검증 및 운영 기록](검증_및_운영.md) 참조.']
summary_text='\n'.join(rows)+'\n'
summary_text=summary_text.replace('# TS R&D·정보화 사업 포트폴리오','# TS 신규 AX·디지털전환+AI·정보화 사업 포트폴리오')
old_state=f"기존 사업 참고 1건, 신규 탐색 후보 {len(candidates)}건이다. R&D·정보화 연계 후보 {sum('R&D' in p['nature'] for p in candidates)}건과 정보화 중심 후보 {sum(p['nature']=='정보화' for p in candidates)}건을 구별했다."
new_state=f"추진사업 제외 기준 1건, 조사 이력 {len(candidates)}건 중 신규 범위 검토대상 {sum(p['scope_review']['status']=='검토대상' for p in candidates)}건·유보 {sum(p['scope_review']['status']=='유보' for p in candidates)}건·제외 {sum(p['scope_review']['status']=='제외' for p in candidates)}건이다. 독립 R&D는 현재 기획 대상이 아니다."
summary_text=summary_text.replace(old_state,new_state).replace('## 신규 후보 전체 비교','## 검토·유보·제외 기록').replace('### 연구·구축·실증·확산','### 전환 구축·실증·확산').replace('초기 비교를 위해 TS-BIZ-001·002·003의 기존 자산·법적 권한·실제 수요부터 확인할 수 있으나, 이는 조사 효율을 위한 순서 제안이며 사업성 우선순위 확정이 아니다.','현재 검토대상은 TS-BIZ-002·004·005·006·007이다. 유보·제외 이력을 신규사업 목록으로 자동 복귀시키지 않는다.')
write('사업포트폴리오_요약.md',summary_text)
start='<!-- PORTFOLIO:START -->';end='<!-- PORTFOLIO:END -->'
ledger=PROJECT/'01_기획과제'/'기획과제_관리대장.md';text=ledger.read_text(encoding='utf-8')
table=[start,'## 신규 AX·AI 정보화 검토대상과 유보·제외 이력','',f"{data['as_of']} · 현재 추진사업을 제외한다. 검토대상 5건·유보 2건·제외 1건이며 비중복·사업 선정은 미확정이다. [통합보기](../05_통합사업기획/사업기획_통합보기.html)와 [상세 요약](../05_통합사업기획/사업포트폴리오_요약.md)을 기준으로 관리한다.",'','| ID | 사업 후보 | 성격 | 상태 | 다음 확인 |','|---|---|---|---|---|']
for p in candidates:table+=['| '+' | '.join(md(x) for x in [p['id'],p['name'],p['nature'],p['status'],p['next_action']])+' |']
table+=['','예산·목표일·담당자·우선순위는 미정. 후보와 확정 과제, 기존 계약 과업을 구별한다.',end]
if start in text:
 assert end in text
 text=text[:text.index(start)]+'\n'.join(table)+text[text.index(end)+len(end):]
else:text+='\n\n'+'\n'.join(table)+'\n'
ledger.write_text(text,encoding='utf-8')
summary=dict(as_of=data['as_of'],candidate_count=len(candidates),linked_duties=len(duty_ids),expansion_agencies=len(agency_ids),checks=['후보 ID 고유성','업무·기관 ID 참조','출처 ID·주소','필수 기획 필드','선정 여부와 근거 분리','WHY 5개 필드','단일 원장으로 화면·요약·대장 생성'],limitations=['후보별 공고·예산·일정·성과목표 미확정','법적 적용 전수검증·기관 참여 의사 미확인'],source_sha256=hashlib.sha256((ROOT/'사업포트폴리오.json').read_bytes()).hexdigest())
write('데이터_검증결과.json',json.dumps(summary,ensure_ascii=False,indent=2))
print(json.dumps(summary,ensure_ascii=False,indent=2))
