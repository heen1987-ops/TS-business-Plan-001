"""2026-09-09 사용자 범위 정정을 기존 원장에 반영한 일회성 변경 기록."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1]
PROJECT=ROOT.parent
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def write(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
pp=PROJECT/'05_통합사업기획/사업포트폴리오.json'
p=read(pp)
if p.get('scope_revision')=='2026-09-09-v0.2':raise SystemExit('이미 적용된 정정. 현재 원장을 직접 검토하세요.')
spec={
'TS-BIZ-001':('제외','AX 전환','운수서비스 안전정보 이해·선택 지원','전세버스 공시 AI의 외부 설명 확장 가설로 현재 신규 기획 범위에서 제외한다.'),
'TS-BIZ-002':('검토대상','AX 전환','사업용차 안전개입 AX 전환','전세버스 공시 산출물과 구분한 운행위험→교육·안전조치→이행 확인 업무를 검토한다.'),
'TS-BIZ-003':('유보','디지털전환+AI+정보화','자동차 튜닝·검사 절차 근거형 안내','민원·직무 특화 안내와 중복 가능성이 있다. 독립 업무 전환과 비중복 근거를 확보하기 전 신규 목록에서 유보한다.'),
'TS-BIZ-004':('검토대상','디지털전환+AI+정보화','교통약자 이동정보 신뢰·연계 정보화','시설·출입구 상태, 갱신 책임, 오류 회수와 실제 이동 지원을 연결하는 전환사업으로 검토한다.'),
'TS-BIZ-005':('검토대상','디지털전환+AI+정보화','기계식주차장 생애주기 안전관리 정보화','설비·검사·보수·조치 이력을 연결하고 위험 검토와 이행 확인을 정보화한다.'),
'TS-BIZ-006':('검토대상','AX 전환','철도 안전증빙·시정조치 AX 전환','일반 문서 질의응답과 구분해 요건·증빙·현장 조치·보완 종결을 연결하는 업무 AX로 검토한다.'),
'TS-BIZ-007':('검토대상','디지털전환+AI+정보화','위험물 사고정보·공동대응 연계 정보화','기존 관제 기능과 구분한 사건 정보·권한·수신 확인·기관 간 인계 전환을 검토한다.'),
'TS-BIZ-008':('유보','디지털전환+AI+정보화','드론 절차·안전정보 근거형 안내','현 구상은 민원 안내 중심이다. 독립된 업무·데이터 전환과 기존 과업 비중복 입증 전 유보한다.')}
flows={
'TS-BIZ-002':('분석 결과와 교육·안전조치 이행이 분리돼 있는지 확인','위험 신호→담당 검토→안전조치 배정→이행·결과 확인','차량·운행·조치 ID, 노선·운행량과 조치 결과 정합성','기존 eTAS 분석·전세버스 등급 산정·공시 보고서 생성'),
'TS-BIZ-004':('시설·운행 정보와 실제 사용 상태·갱신 책임이 분리돼 있는지 확인','시설 상태·시각·책임자→불일치 확인→갱신→이동 지원·오류 회수','시설·출입구 ID, 접근 조건·관측시각·갱신 책임과 품질 기준','새 전국 길찾기 앱·일반 민원 챗봇·기존 플랫폼 고도화'),
'TS-BIZ-005':('설비·검사·보수 이력과 미조치 상태가 단절돼 있는지 확인','설비 이력→결함·위험 검토→보수 조치→종결 확인·재점검','설비·검사·정비·조치 ID와 제조사별 이력 표준화','일반 자동차검사 업무 AI·문서 챗봇·장비 제어·검사 합격 자동 판정'),
'TS-BIZ-006':('안전요건·제출 증빙과 실제 시정조치의 버전·종결이 분리돼 있는지 확인','요건·증빙 연결→누락·충돌 검토→보완 배정→현장조치·종결 추적','요건·증빙·검사·시정조치 ID, 적용시점·버전·승인 기록','범용 RAG·직원 문서 질의응답·공통플랫폼 재구축·운영기관 검측망'),
'TS-BIZ-007':('관제 사건 정보와 권한 부여·수신·기관 간 인계가 분리돼 있는지 확인','사건→허용 정보 패키지→권한 있는 수신자 확인→기관 인계→훈련·사후 검토','사건·운송·물질·수신기관·인계 ID, 목적·권한·정보시각','현행 HMTS 관제의 중복 재구축·민원 안내·긴급 지휘 자동 실행')}
p['scope_revision']='2026-09-09-v0.2'
p['title']='TS 신규 AX·디지털전환+AI·정보화 사업 포트폴리오'
p['scope_note']='현재 아카이브의 추진사업을 제외한 신규 AX 전환 또는 디지털전환+AI+정보화사업 기획이다. 검토대상과 유보·제외 이력을 구별한다. 검토대상도 최종 계약 대조 전에는 비중복·선정·예산이 미확정이다.'
p['scope_policy']={'source':'2026-09-09 사용자 정정','allowed_natures':['AX 전환','디지털전환+AI+정보화'],'excluded':['기존 공통 AI 플랫폼 고도화','기존 민원상담·신문고 AI의 연장','기존 전세버스 공시 AI의 연장','독립 R&D','AI 가치가 없는 단순 정보화'],'rnd_role':'필요한 기술 검증·PoC를 전환사업의 세부 과업으로 검토'}
p['baseline']['boundary']='아카이브의 추진사업은 이번 신규 기획에서 제외한다. 최종 계약·승인 요구사항·추가 합의와 실제 기능을 대조하며 기존 과업의 이름·대상 채널 변경만으로 신규성을 인정하지 않는다.'
p['baseline']['reuse_hypothesis']='현재 공통 기반은 재구축 사업이 아닌 연계·재사용 가능성을 확인할 대상이다. 허용된 신규 업무에 필요한 연결 범위와 사용권을 검토한다.'
p['sources'].append({'id':'DOC-NEW-SCOPE','title':'신규사업 범위와 중복배제','url':'../00_기획지침/신규사업_범위와_중복배제.md','date':'2026-09-09','kind':'사용자 지침·아카이브 대조 판단','claim':'현재 추진사업을 제외한 AX·디지털전환+AI+정보화 기획으로 범위 정정','limit':'파생 RTM 본문 확인. 최종 계약·승인 요구사항 전체 대조와 비중복 확정은 미완료'})
for c in p['candidates']:
    state,nature,name,reason=spec[c['id']]
    c['previous_nature']=c['nature'];c['previous_name']=c['name'];c['nature']=nature;c['name']=name
    c['delivery']='신규 업무 전환 + AI + 정보화 구축·연계'
    c['scope_review']={'status':state,'reason':reason,'non_overlap_status':'미확정','checked_at':'2026-09-09','evidence_ids':['SRC-005','SRC-012','DOC-NEW-SCOPE'],'decision_basis':'사용자 신규 범위와 파생 요구사항 정리 대조·계약상 중복 확정 아님'}
    c['status']=('신규범위 검토 · 비중복 미확정' if state=='검토대상' else state+' · 신규 검토목록 제외')
    c['stage']='범위·중복 검토';c['existing_relation']=reason+' 최종 계약·승인 범위의 대조는 미완료다.'
    c['rnd']['status']='필요 기술 검증·독립 R&D 기획 제외'
    if c['id'] in flows:
        asis,tobe,digital,excluded=flows[c['id']]
    else:
        asis='기존 추진사업과의 중복 범위 미확정';tobe='현재 안은 신규 기획에서 제외·유보. 독립 업무 전환을 확인하기 전 제안하지 않음';digital='재정의 전';excluded='현재 후보의 공시·민원 설명 기능'
    c['transformation']={'as_is':asis,'to_be':tobe,'digital':digital,'ai':c['si']['ai'],'si':c['si']['scope'],'operations':c['workforce'],'excluded_work':excluded,'gate':'비중복 근거, 업무·데이터 전환, AI 추가 가치, 시스템 구축·연계, 운영·국민 성과를 모두 확인'}
    c['si']['condition']='현재 추진사업과의 비중복 대조 및 '+c['si']['condition']
    c['next_action']=('신규 제안에서 제외하고 조사 이력으로 보존' if state=='제외' else '독립 업무 전환·별도 산출물과 기존 민원·직무 특화 과업의 비중복을 입증하기 전 유보' if state=='유보' else '진행사업 산출물과 비중복 대조 후 '+c['next_action'])
    c['source_ids'].append('DOC-NEW-SCOPE')
write(pp,p)
bp=ROOT/'01_후보별/후보분석_원장.json';d=read(bp)
for b in d['subjects']:
    c=next(c for c in p['candidates'] if c['id']==b['id'])
    b['previous_nature']=b['nature'];b['previous_name']=b['name']
    for key in ['name','nature','status','scope_review','transformation']:b[key]=c[key]
    b['version']='0.2'
    b['gate']=c['transformation']['gate']+'. '+b['gate']
d['scope_revision']=p['scope_revision'];write(bp,d)
lp=ROOT/'02_공통솔루션/솔루션원장.json';d=read(lp)
for s in d['solutions']:
    if s['id'] in ['SOL-01','SOL-02']:s['status']='제외·유보 후보의 참고 기능·현재 신규 제안 대상 아님'
    elif s['id']=='SOL-07':s['status']='기존 공통 기반의 재사용·연계 검토·새 플랫폼 사업 아님'
    else:s['status']='신규 전환사업의 기능 설계 대안·비중복 확인 전'
write(lp,d)
print('범위 정정 반영: 검토대상 5 / 유보 2 / 제외 1')
