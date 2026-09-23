"""실제 파일·출처·참조·각주·미확인 상태를 검증한다. 법률·성과 평가는 별도다."""
from pathlib import Path
from urllib.parse import unquote, urlsplit
import hashlib
import json
import re
import sys

ROOT=Path(__file__).resolve().parents[1]
PROJECT=ROOT.parent
errors=[]
checks=[]
(ROOT/'00_관리/검증결과.json').write_text(json.dumps({'passed':False,'status':'검사 진행 중'},ensure_ascii=False)+'\n',encoding='utf-8')

def read(path):
    return json.loads(path.read_text(encoding='utf-8'))

def check(condition, label):
    checks.append({'check':label,'passed':bool(condition)})
    if not condition:errors.append(label)

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

subjects=read(ROOT/'01_후보별/후보분석_원장.json')['subjects']
solutions=read(ROOT/'02_공통솔루션/솔루션원장.json')['solutions']
cases=read(ROOT/'03_도입사례/사례원장.json')['cases']
sources=read(ROOT/'04_출처아카이브/출처원장.json')['sources']
law_ids={x['id'] for x in read(PROJECT/'04_기관리서치/관계도/TS_검토관계.json')}
portfolio={x['id']:x for x in read(PROJECT/'05_통합사업기획/사업포트폴리오.json')['candidates']}
groups=[subjects,solutions,cases,sources]
sets=[{x['id'] for x in g} for g in groups]
bids,lids,cids,sids=sets
for name,g,ids in zip(['후보','솔루션','사례','출처'],groups,sets):check(len(g)==len(ids),name+' ID 중복 없음')
check(len({x['problem_id'] for x in subjects})==len(subjects),'후보별 문제 ID 고유성')
check(set(bids)<=set(portfolio),'기존 포트폴리오 후보 ID 일치')
for b in subjects:
    check(set(b['solution_ids'])<=lids and set(b['case_ids'])<=cids and set(b['source_ids'])<=sids and set(b['mandate_ids'])<=law_ids,b['id']+' 참조 무결성')
    check(b['selected'] is False and b['budget_krw'] is None and b['nature']==portfolio[b['id']]['nature'] and portfolio[b['id']]['selected'] is False,b['id']+' 선정·예산·사업 성격 보존')
    check(b['scope_review']==portfolio[b['id']]['scope_review'] and b['transformation']==portfolio[b['id']]['transformation'],b['id']+' 범위·전환 정의 동기화')
    check(b['nature'] in ['AX 전환','디지털전환+AI+정보화'],b['id']+' 독립 R&D 분류 없음')
    check(all(b['transformation'].get(k) for k in ['as_is','to_be','digital','ai','si','operations','excluded_work','gate']),b['id']+' 업무·데이터·AI·정보화·운영 구성')
    required=['problem','actors','trigger','mechanism','counter','scope','research','dataset','unit','outcome','risk_metric','gate','gap']
    check(all(b.get(k) for k in required),b['id']+' 문제·대안·실증 필드')
    folder=ROOT/'01_후보별'/b['folder']
    check(all((folder/f).is_file() for f in ['README.md','01_문제정의.md','02_연관솔루션.md','03_국내외사례.md','04_사업화_실증.md','05_근거_미확인.md']),b['id']+' 상세 문서 6종')
    check(all(f'P0{i}' in (folder/'04_사업화_실증.md').read_text(encoding='utf-8') for i in range(1,8)),b['id']+' P01~P07 추적')
    check(all('현재 범위:' in f.read_text(encoding='utf-8') and b['scope_review']['reason'] in f.read_text(encoding='utf-8') for f in folder.glob('*.md')),b['id']+' 상세 문서 직접 진입 범위 표시')
for s in solutions:check(set(s['candidate_ids'])<=bids and set(s['case_ids'])<=cids,s['id']+' 참조')
for c in cases:
    check(set(c['source_ids'])<=sids and set(c['candidate_ids'])<=bids,c['id']+' 참조')
    check(all(c.get(k) for k in ['country','operator','deployment_stage','event_date','ai_evidence','comparability','application_judgment']),c['id']+' 지역·주체·단계·AI·한계 필드')
    check(c['independent_effect_verified'] is False and c['cost'] is None,c['id']+' 미검증 효과·비용 보존')
    for bid in c['candidate_ids']:check(c['id'] in next(b for b in subjects if b['id']==bid)['case_ids'],c['id']+'↔'+bid+' 역참조')
paths=[]
for s in sources:
    check(all(s.get(k) for k in ['title','publisher','url','accessed_at','locator','finding','limitations','web_review_status']),s['id']+' 서지·위치·열람·한계')
    if s['archived_path']:
        f=(ROOT/s['archived_path']).resolve();paths.append(f)
        check(f.is_relative_to(ROOT.resolve()) and f.is_file(),s['id']+' 실제 원문 파일')
        if f.is_file():check(sha(f)==s['sha256'] and f.stat().st_size==s['byte_size'],s['id']+' SHA-256·크기 일치')
    else:check(not s.get('sha256'),s['id']+' 미취득 원문에 해시 없음')
check(len(paths)==len(set(paths)),'원문 파일 경로 중복 없음')
check(len({s['url'] for s in sources})==len(sources),'동일 URL 중복 등록 없음')
check(all(not s['claim_verified'] for s in sources if s['id'] in ['DRS-018','DRS-019']),'직접 열람 미완료 2건 확인 승격 없음')
check(len(next(s for s in sources if s['id']=='DRS-004').get('observations',[]))==2,'eTAS 검색·직접 응답 불일치 기록')
check(all('공급사' in c['deployment_stage'] for c in cases if c['id'] in ['CASE-010','CASE-011']),'공급사 2건 실명 도입 승격 없음')

trace=read(ROOT/'05_종합분석/추적원장.json');nodeids={n['id'] for n in trace['nodes']}
check(len(nodeids)==len(trace['nodes']),'추적원장 노드 고유성')
check(all(e['from'] in nodeids and e['to'] in nodeids for e in trace['edges']),'추적원장 관계 대상 무결성')
check(all((ROOT/n['path']).is_file() for n in trace['nodes'] if n.get('path')),'추적 노드 문서 실재')

documents=[p for p in ROOT.rglob('*.md') if '99_버전보관' not in p.parts]
documents += [PROJECT/'README.md',PROJECT/'05_통합사업기획/README.md',PROJECT/'04_기관리서치/리서치_운영.md']
links=0;footnotes=0
for p in documents:
    if not p.exists():errors.append('문서 없음: '+str(p));continue
    text=p.read_text(encoding='utf-8')
    defs=re.findall(r'^\[\^(\d+)\]:',text,re.M)
    refs=re.findall(r'\[\^(\d+)\](?!:)',text)
    if set(refs)!=set(defs) or len(defs)!=len(set(defs)):errors.append('각주 불일치: '+str(p.relative_to(PROJECT)))
    footnotes+=len(defs)
    # 텍스트 속 파일 이름이 아닌 실제 Markdown 링크를 확인한다.
    for target in re.findall(r'\]\((<[^>]+>|[^\s]+?)\)',text):
        target=target.strip('<>')
        if urlsplit(target).scheme or target.startswith('#'):continue
        target=unquote(target.split('#')[0].split('?')[0])
        f=(p.parent/target).resolve();links+=1
        if not f.is_relative_to(PROJECT.resolve()) or not f.exists():errors.append('깨진/외부 로컬 링크: '+str(p.relative_to(PROJECT))+' → '+target)
check(not any('각주 불일치' in x for x in errors),'모든 문서 각주 참조·정의 일치')
check(not any('로컬 링크' in x for x in errors),'모든 로컬 문서 링크 실재·프로젝트 내부')
generated=read(ROOT/'00_관리/생성파일_원장.json')['files']
check(all((ROOT/p).is_file() and sha(ROOT/p)==value for p,value in generated.items()),'생성 문서 해시·입력 기반 결과 일치')
result={'as_of':'2026-09-09','scope':'파일·참조·출처 보존·미확인 상태 검증. 법률·현장·독립 성과 검증 아님','counts':{'candidates':len(subjects),'solutions':len(solutions),'cases_including_leads':len(cases),'sources':len(sources),'archived_responses':len(paths),'unarchived_sources':len(sources)-len(paths),'documents_checked':len(documents),'local_links_checked':links,'footnote_definitions':footnotes,'graph_nodes':len(nodeids),'graph_edges':len(trace['edges']),'generated_files':len(generated),'checks':len(checks)},'checks':checks,'errors':errors,'passed':not errors}
(ROOT/'00_관리/검증결과.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'passed':result['passed'],'counts':result['counts'],'errors':errors},ensure_ascii=False,indent=2))
sys.exit(1 if errors else 0)
