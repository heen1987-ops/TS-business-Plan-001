"""보존한 공개자료의 무결성 목록과 관계도 출처·TS 검토표를 정리한다. 신규 수집은 하지 않는다."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parent
def read(name):return json.loads((ROOT/name).read_text(encoding='utf-8'))
def write(name,data):(ROOT/name).write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
graph=read('기관법령_관계원장.json')
hashes={}
for r in read('ALIO_기관별_근거.json'):
 if r.get('sha256'):hashes[f"원천자료/ALIO/{r['apbaId']}_{r['report']['disclosureNo']}.html"]=r['sha256']
for r in read('CLEANEYE_기관별_근거.json'):
 if r.get('sha256'):hashes[f"원천자료/CLEANEYE/{r['code']}.html"]=r['sha256']
for r in read('법령_본문원장.json'):
 if r.get('sha256'):hashes[f"원천자료/법령/{r['sequence']}_{r['effective']}_본문.html"]=r['sha256']
for r in read('자치법규_본문원장.json'):
 if r.get('sha256'):hashes[f"원천자료/자치법규/{r['sequence']}_본문.html"]=r['sha256']
files=[]
for path in sorted((ROOT/'원천자료').rglob('*')):
 if path.is_file():
  name=path.relative_to(ROOT).as_posix()
  files.append(dict(path=name,bytes=path.stat().st_size,sha256=hashes.get(name),hash_status='취득 시 계산한 SHA-256 기록' if name in hashes else '해시 미산출'))
write('원천자료_매니페스트.json',dict(as_of=graph['as_of'],file_count=len(files),hashed_file_count=sum(bool(f['sha256']) for f in files),total_bytes=sum(f['bytes'] for f in files),note='법률 원문, 기관 공시, 명단 및 추출 중간자료. 실패 응답도 보존하므로 파일 수를 법령 수로 해석하지 말 것. SHA-256은 취득 시 계산된 기록을 연결했으며 이번 전 파일 재계산 검사는 장시간 파일 읽기로 중단했다. null은 해시 미산출이다. 이후 현행성을 보증하지 않음.',files=files))
write('출처목록.json',dict(as_of=graph['as_of'],source_count=len(graph['sources']),sources=graph['sources']))
rows=['# TS 핵심 관계 조문 검토표','',f"조사 기준일: {graph['as_of']}. 선정한 15개 핵심 관계이며 TS 전체 업무의 전수검증 결과가 아니다.",'','부처명으로 표시된 권한의 법문상 주체는 국토교통부장관이다. 조문검토는 해당 범위를 읽고 유형화한 결과이며 실제 위탁 고시·수행조직까지 모두 확인했다는 뜻은 아니다.','','| ID | 업무·목적 | 법령·조문·시행일 | 관계 | 권한 주체 | 범위·예외·추가 검증 |','|---|---|---|---|---|---|']
lookup={n['id']:n for n in graph['nodes']}
for r in read('TS_검토관계.json'):
 effective=lookup[r['id']].get('effective','')
 effective=f'{effective[:4]}-{effective[4:6]}-{effective[6:]}' if len(effective)==8 else effective
 authority=r['authority'] or '설립법상 기관 목적·사업'
 if r['id']=='D_TS_04':authority+=' / 시·도지사등(제2항제1호·제4호)'
 row=[r['id'],r['name'],f"[{r['law']}]({r['source']}) {r['article']} / {effective}",r['relation'],authority,r['note']]
 rows.append('| '+' | '.join(x.replace('|','\\|').replace('\n',' ') for x in row)+' |')
rows+=['','가능규정은 실제 위탁·대행 사실을 의미하지 않는다. 개별 사업기획에서 사용할 때 원문 조·항·호, 현행 지정 고시, 개인정보·데이터 활용 근거를 다시 대조한다.','', '[전체 조사 결과](조사결과_및_검증범위.md) · [관계도](기관법령_관계도.html) · [후속 조사 대기열](후속조사_대기열.md)','']
(ROOT/'TS_조문검토표.md').write_text('\n'.join(rows),encoding='utf-8')
print(json.dumps(dict(source_count=len(graph['sources']),files=len(files),total_bytes=sum(f['bytes'] for f in files)),ensure_ascii=False))
