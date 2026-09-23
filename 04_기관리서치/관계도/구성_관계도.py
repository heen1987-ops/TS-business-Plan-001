"""2026-09-09 조사 스냅샷을 출처·관계유형·검증상태가 있는 그래프로 구성한다."""
from pathlib import Path
from collections import defaultdict,Counter
from urllib.parse import quote
import json,re,hashlib
ROOT=Path(__file__).resolve().parent;RAW=ROOT/'원천자료'
def read(f):return json.loads((ROOT/f).read_text(encoding='utf-8'))
def save(f,d):(ROOT/f).write_text(json.dumps(d,ensure_ascii=False,indent=2),encoding='utf-8')
def key(s):return re.sub('[^가-힣A-Za-z0-9]','',s)
def norm(s):
 for w in ['재단법인','사단법인','주식회사','농업회사법인','유한회사','(재)','(사)','(주)','㈜','(유)','(시설)']:s=s.replace(w,'')
 return key(s)
def digest(s):return hashlib.sha256(s.encode()).hexdigest()[:14]
nodes={};edges=[];edgekeys=set();lawqueries={};lawbyname={};ordqueries={};sources={};gaps=[]
def source(url,title,date='',file=''):
 sid='S'+digest(url)
 sources.setdefault(sid,dict(id=sid,url=url,title=title,date=date,file=file,retrieved='2026-09-09'))
 return sid
def node(id,name,kind,**kw):
 if id not in nodes:nodes[id]=dict(id=id,name=name,kind=kind,**kw)
 return id
def edge(a,b,relation,status,src,**kw):
 ek=(a,b,relation,kw.get('article',''))
 if a==b or ek in edgekeys:return
 edgekeys.add(ek);edges.append(dict(id='E'+str(len(edges)+1).zfill(6),from_id=a,to_id=b,relation=relation,status=status,source_ids=src if isinstance(src,list) else [src],**kw))

designation=source('https://mofe.go.kr/com/cmm/fms/FileDown.do?atchFileId=ATCH_000000000030916&fileSn=2','2026년도 공공기관 지정 보도자료·참고2 및 참고3','2026-01-29','원천자료/2026_공공기관_지정.pdf')
alio_list_source=source('https://www.alio.go.kr/organ/organDisclosureList.do','ALIO 기관별 공시: 지정기관·부설기관·소관 구분','2026-09-09','원천자료/alio_apbaList.json')
pub_source=source('https://www.cleaneye.go.kr/siteGuide/pubCompStatus.do','클린아이 지방공기업 현황 423개','2026-06-30','원천자료/cleaneye_public.html')
ipt_source=source('https://www.cleaneye.go.kr/siteGuide/iptCompStatus.do','클린아이 지방출자출연기관 현황 892개','2026-06-30','원천자료/cleaneye_invested.html')
laws=read('법령_본문원장.json');ords=read('자치법규_본문원장.json')
for law in laws:
 if not law.get('sequence'):continue
 lid='LAW_'+(law.get('law_id') or law['sequence']);sid=source(law['source'],law['name'],law['effective'])
 node(lid,law['name'],'법령',group='법령',effective=law['effective'],verification=law['status'],source_ids=[sid],metadata=law.get('metadata'),aliases=[])
 if law['query'] not in nodes[lid]['aliases']:nodes[lid]['aliases'].append(law['query'])
 lawqueries[key(law['query'])]=lid;lawbyname[key(law['name'])]=law
 law['node_id']=lid;law['source_id']=sid
for law in ords:
 if not law.get('sequence'):continue
 lid='ORD_'+str(law.get('ordin_id') or law['sequence']);sid=source(law['source'],law['name'],law.get('effective',''))
 node(lid,law['name'],'자치법규',group='자치법규',effective=law.get('effective',''),verification=law['status'],source_ids=[sid],metadata=law.get('metadata'),aliases=[law['query']])
 ordqueries[key(law['query'])]=lid;law['node_id']=lid;law['source_id']=sid
lawnameids={key(l.get('name','')):l['node_id'] for l in laws if l.get('node_id')}
def lawid(name):return lawqueries.get(key(name)) or lawnameids.get(key(name))
def pending_law(query,kind='법령'):
 id='P_'+digest(kind+query);node(id,query,'미확인 '+kind,group=kind+' 확인 대기',verification='공시 제명·현행 여부 확인 필요',source_ids=[]);return id

central=read('원천자료/central_parsed.json');govnames={}
for o in central:
 id='G'+o['id'];sid=source(o['source'],'정부조직관리정보시스템 기관 기구도 목록','2026-09-09')
 node(id,o['name'],'기관',group='정부·헌법기관',category=o['category'],source_ids=[sid],verification='공식 목록 확인',coverage='개별 소관법령·직제·위임전결 전체 검토 미완료')
 govnames[o['name']]=id
 for link in o['links']:
  m=re.search('/법령/([^/?#]+)',link['url'])
  if m:
   lid=lawid(m[1]) or pending_law(m[1]);edge(id,lid,link['label']+'(공식 조직도)','공식자료',[sid],article=(link['url'].split('/')[-1] if '/제' in link['url'] else ''),note='공식 조직도가 연결한 근거. 해당 조문과 직제의 업무 전체를 검토했다는 의미는 아님.')
def gov(name):
 if name in govnames:return govnames[name]
 id='G_REF_'+digest(name);node(id,name,'기관',group='정부 관계기관',verification='공시의 주무기관 표기',source_ids=[]);govnames[name]=id;return id
intel=lawbyname.get(key('국가정보원법'))
if intel:
 id=node('G_SUP_NIS','국가정보원','기관',group='정부·헌법기관',category='별도법 보완기관',verification='설치 법률 본문 확인',source_ids=[intel['source_id']],coverage='기구도 63개 밖에서 설치법으로 보완. 내부조직·업무 관련 법령 전수검토 미완료.')
 edge(id,intel['node_id'],'기관 설치 법률','법령본문',intel['source_id'],article='제2조')
alio=read('ALIO_기관별_근거.json');meta={o['apbaId']:o for o in read('원천자료/alio_apbaList.json')['data']};almap=read('ALIO_법령후보_매핑.json')
for o in alio:
 id='A_'+o['apbaId'];m=meta[o['apbaId']];sub=m['subFlag']=='Y';sid=source(o['source'],o['apbaNa']+' ALIO 일반현황',o['report']['idate'])
 node(id,o['apbaNa'],'기관',group='부설기관' if sub else '지정 공공기관',category=o['typeNa'],ministry=o['jidtNa'],source_ids=[sid,alio_list_source],verification='설립근거 공시 확보',
      founding=o['founding'],functions=o['functions'],purpose=o['purpose'],basis_date=o['report']['stDate'],coverage='설립근거 공시와 현행 본문을 구분. 법정사업·위임·위탁·지정고시 전체 검토 미완료.')
 edge(id,gov(o['jidtNa']),'주무기관','공식자료',alio_list_source)
 if sub and m.get('parnApbaId'):edge(id,'A_'+m['parnApbaId'],'부설기관의 모기관','공식자료',alio_list_source)
 if not sub:edge(id,lawid('공공기관의 운영에 관한 법률'),'공공기관 분류 체계','공식자료',designation,note='2026년 지정 자료와 ALIO 유형을 대조. 위탁집행형이라는 분류만으로 개별 수탁업무가 확정되지는 않음.')
 found=0
 for q in almap[o['apbaId']]:
  lid=lawqueries.get(q)
  if not lid:continue
  found+=1;edge(id,lid,'설립근거 공시 인용','공시근거',sid,note='공시의 설립근거 필드에서 추출. 설립·업무·역사적 근거가 섞일 수 있어 개별 적용은 추가 검토.',evidence=o['founding'][:1400])
 gaps.append(dict(agency_id=id,name=o['apbaNa'],group=nodes[id]['group'],founding_disclosure=True,current_basis_body_count=found,full_legal_review=False,remaining=['법정사업별 조·항·호 매핑','시행령·시행규칙·별표 전수 대조','위탁·대행·지정 고시의 현행성 및 실제 수탁 여부','수행조직·전결규정·변경 이력']))

local=read('CLEANEYE_기관별_근거.json');local_lookup=defaultdict(list);ordmap=read('CLEANEYE_자치법규후보_매핑.json')
for o in local:
 id='L_'+o['code'];f=o.get('fields',{});sid=source(o.get('source','https://www.cleaneye.go.kr/user/itemGongsi.do'),o['name']+' 클린아이 일반현황','공시 기준일 별도 확인')
 typemap={'012001':'출자기관','012002':'출연기관','006001':'도시철도공사','006002':'도시개발공사','006003':'기타공사','011001':'시설관리공단','011002':'경륜공단','005001':'직영 상수도','005002':'직영 하수도','005003':'직영 공영개발','005005':'직영 자동차운송'}
 node(id,o['name'],'기관',group='지방 출자출연기관' if o['family']=='출자출연' else '지방공기업',category=typemap.get(o['kind'],o['kind']),source_ids=[sid],verification=o['status'],
      founding=f.get('설립근거',''),functions=f.get('주요기능',f.get('기관소개','')),relations_in_report=f.get('관계기관',''),coverage='개별 설립 조례·사업·수탁범위·고시의 전수 법률검토 미완료')
 local_lookup[(o['family'],norm(o['name']))].append(id)
 common='지방자치단체 출자·출연 기관의 운영에 관한 법률' if o['family']=='출자출연' else '지방공기업법'
 edge(id,lawid(common),'공시 분류의 공통법 검토','분류근거',sid,note='분류별 공통 법체계 연결. 개별 법률 우선적용·적용제외와 정확한 적용조문은 별도 확인.')
 for law in laws:
  if not law.get('node_id') or len(key(law['name']))<3:continue
  if key(law['name']) in key(f.get('설립근거','')):
   edge(id,law['node_id'],'설립근거 공시 인용','공시근거',sid)
 current=0
 for q in ordmap.get(o['code'],[]):
  lid=ordqueries.get(q)
  if lid:
   current+=nodes[lid]['verification']=='본문 취득·시행일 확인'
   edge(id,lid,'설립 조례 공시 인용','공시근거',sid,note='공시 인용 제명을 통해 본문을 찾음. 실제 설립·사업 조항의 대응관계는 추가 검토.')
  else:
   item=next((x for x in ords if key(x['query'])==q),None)
   if item:
    lid=pending_law(item['query'],'자치법규');edge(id,lid,'공시 제명 재확인 필요','미확인',sid,note=item.get('error',''))
 gaps.append(dict(agency_id=id,name=o['name'],group=nodes[id]['group'],founding_disclosure=bool(f.get('설립근거')),current_ordinance_body_count=current,full_legal_review=False,remaining=['현행 설립 조례와 공시 제명 대조','조례의 사업범위·시행규칙·개별 업무 조례','위수탁 협약·지정고시 및 계약 범위','공시 목록과 2026-06-30 기준명단의 변동 대조']))

# 날짜가 다른 공식 기준 명단을 보존한다. 이름이 유사하다는 이유로 병합하지 않는다.
roster_results=[]
for family,file,sid in [('지방공기업','cleaneye_public.html.parsed.json',pub_source),('출자출연','cleaneye_invested.html.parsed.json',ipt_source)]:
 roster=read('원천자료/'+file)
 for i,o in enumerate(roster):
  match=local_lookup.get((family,norm(o['name'])),[])
  id=match[0] if len(match)==1 else 'R_'+family+'_'+str(i).zfill(4)
  matched=len(match)==1
  if not matched:
   node(id,o['name'],'기관',group='기준명단 대조 대기',category=family+' '+o['type'],region=o['region'],source_ids=[sid],verification='기준명단 확인·공시ID 대조 대기',coverage='기관명 변경·약칭·동명기관 가능성. 자동 병합하지 않음.')
   gaps.append(dict(agency_id=id,name=o['name'],group='기준명단 대조 대기',full_legal_review=False,remaining=['기준명단과 현재 공시 기관ID 대조','동명이기관의 지역·설립주체 확인','개별 설립·업무·위탁 근거 확보']))
  else:nodes[id]['region']=o['region'];nodes[id]['roster_date']='2026-06-30'
  region_id='REGION_'+o['region'];node(region_id,o['region'],'지역',group='광역지역',verification='공식 목록 지역 분류',source_ids=[sid])
  edge(id,region_id,'공식 목록 지역','공식자료',sid,note='광역지역 분류이며 소유·감독·위탁관계를 뜻하지 않음.')
  roster_results.append(dict(**o,family=family,agency_id=id,profile_matched=matched,candidate_ids=match))

short={'과기부':'과학기술정보통신부','교육부':'교육부','보훈부':'국가보훈부','유산청':'국가유산청','국토부':'국토교통부','금융위':'금융위원회','농식품부':'농림축산식품부','문체부':'문화체육관광부','법무부':'법무부','법제처':'법제처','복지부':'보건복지부','산림청':'산림청','산업부':'산업통상부','새만금청':'새만금개발청','성평등부':'성평등가족부','식약처':'식품의약품안전처','외교부':'외교부','중기부':'중소벤처기업부','통일부':'통일부','해수부':'해양수산부','행안부':'행정안전부','행복청':'행정중심복합도시건설청','노동부':'고용노동부','기후부':'기후에너지환경부','방사청':'방위사업청','원안위':'원자력안전위원회','인사처':'인사혁신처','재경부':'재정경제부','우주청':'우주항공청','소방청':'소방청'}
nondesignated=read('미지정기관_기준목록.json')
for o in nondesignated:
 id='N_'+digest(norm(o['name']));ministry=short[o['ministry_short']]
 node(id,o['name'],'기관',group='미지정기관 참고목록',ministry=ministry,source_ids=[designation],verification='미지정 참고목록 등재',coverage='미지정기관은 하나의 법적 유형이 아님. 법적 지위·독립성·감독관계 추가 검토.')
 edge(id,gov(ministry),'미지정 자료의 주무기관 표기','공식자료',designation,article='PDF '+str(o['source_page'])+'쪽',note='보도자료의 주무기관 열을 옮긴 것으로 지휘·감독권이나 소유권을 단정하지 않음.')
 gaps.append(dict(agency_id=id,name=o['name'],group='미지정기관 참고목록',full_legal_review=False,remaining=['설립·법정사업·감독 법령 확인','미지정 사유와 독립성 확인','소관·위임·위탁·자회사 관계 구분']))

# 법률-하위법령의 명칭상 대응. 위임 조문이 자동으로 검토됐다는 뜻은 아니다.
for law in laws:
 if not law.get('node_id'):continue
 name=law['name'];base=re.sub(r'\s*시행(?:령|규칙)$','',name)
 if base!=name and lawid(base):edge(law['node_id'],lawid(base),'법률·하위법령 체계','법령본문',law['source_id'],note='제명과 현행 본문을 연결. 개별 조문별 위임 범위의 검토는 별도.')

# 본문이 명시적으로 인용하는 법률을 연결한다. 인용만으로 권한이 이전되지는 않는다.
seen_refs=set()
for law in laws+ords:
 lid=law.get('node_id')
 if not lid or lid in seen_refs:continue
 seen_refs.add(lid);refs=defaultdict(list)
 for a in law.get('articles',[]):
  for title in re.findall(r'「([^」]+)」',a['text']):
   target=lawid(title)
   if target and target!=lid:refs[target].append(a['article'])
 for target,articles in refs.items():edge(lid,target,'조문 인용 법령','법령본문',law['source_id'],articles=list(dict.fromkeys(articles)),note='본문의 명시적 법령 인용. 인용만으로 기관간 권한·데이터 제공 권한이 생기는 것은 아님.')

# 전체 본문에서 기관명 출현을 찾아 재검토 가능한 근거로 연결한다.
# 자동 추출 관계는 위탁·법정업무로 승격하지 않는다.
aliases=defaultdict(list)
for n in nodes.values():
 if n['kind']=='기관' and n['group'] in ['지정 공공기관','부설기관','미지정기관 참고목록']:
  k=norm(n['name'])
  if len(k)>=4:aliases[k].append(n['id'])
pattern=re.compile('|'.join(re.escape(s) for s in sorted(aliases,key=len,reverse=True)))
seenlaws=set()
for law in laws:
 lid=law.get('node_id')
 if not lid or lid in seenlaws:continue
 seenlaws.add(lid);hits=defaultdict(list)
 for a in law['articles']:
  for name in set(pattern.findall(key(a['text']))):
   for aid in aliases[name]:hits[aid].append(a['article'])
 for aid,articles in hits.items():
  edge(aid,lid,'기관명 등장 조문','자동추출',law['source_id'],articles=list(dict.fromkeys(articles)),note='기관명 또는 기관명이 포함된 법령명 등장. 설립·위탁·지정·협조·제재 중 실제 역할은 별도 검토. 약칭만 등장하거나 별표·서식에 있는 근거는 누락될 수 있음.')

# 검토한 TS 핵심 관계. 호의 예외 및 재량·지정 가능 여부를 명시한다.
curated=[
 ('국민 생명·신체·재산 보호','한국교통안전공단법','제1조','설립 목적','법정목적','안전한 교통환경 및 교통안전 관리의 효율화를 통한 국민 보호.',''),
 ('교통안전 교육·연구·정보시스템','한국교통안전공단법','제6조','법정 사업','법정사업','도로교통 교육은 자동차운송사업 안전관리·자동차 관리, 기술개발은 자동차 성능·안전으로 범위 제한. 제12호 지정·승인사업은 별도 근거 필요.',''),
 ('교통수단 점검·안전진단 결과 평가','교통안전법 시행령','제48조의2','법정 위탁','위탁확정','제1항: 교통수단안전점검, 교통시설안전진단 결과 평가, 교통안전관리자 시험·자격증명 업무.','국토교통부'),
 ('운행기록 분석·교통안전 정보체계','교통안전법 시행령','제48조의2','법정 위탁','위탁확정','제2항: 안전관리규정 확인·평가, 정보관리체계, 자동차 운행기록 제출·점검·분석 등. 제1호 및 제4호 업무에는 시·도지사등도 위탁 주체.','국토교통부'),
 ('튜닝 안전연구·자동차 이력정보','자동차관리법 시행령','제19조','법정 위탁','위탁확정','제3항: 튜닝 안전성 연구·장비개발·전문인력 양성, 정밀도검사 및 이력정보 제공.','국토교통부'),
 ('자동차 튜닝 승인','자동차관리법 시행령','제19조','법정 위탁','위탁확정','제5항: 시장·군수·구청장이 자동차 튜닝 승인 권한을 TS에 위탁. 중앙부처 위탁과 구분.','시장·군수·구청장(법정 주체)'),
 ('자동차 전산정보처리조직 운영','자동차관리법 시행령','제19조','법정 위탁','위탁확정','제9항: 전산정보처리조직의 설치·운영. 제4항의 전자적 등록사무 위탁은 재량과 고시가 필요해 별도.','국토교통부'),
 ('건설기계 부품인증·경력관리','건설기계관리법 시행령','제18조의3','법정 위탁','위탁확정','제2항제2·3호: 부품인증, 조종사 경력관리 및 전산정보처리조직. 제1호 형식승인 등은 검사대행자와 분담하고 타워크레인 예외가 존재.','국토교통부'),
 ('철도 안전체계 검사·자격관리','철도안전법 시행령','제63조','법정 위탁','위탁확정','제1항: 안전관리체계 검사·수준평가, 운전·관제 자격, 철도차량 정비기술자, 철도안전 정보체계 등. 제2항 철도기술연구원 및 제3항 국가철도공단 위탁은 별도.','국토교통부'),
 ('항공자격·드론 신고·안전보고','항공안전법 시행령','제26조','법정 위탁','위탁확정','제6항: 항공자격시험, 항공안전 자율보고, 초경량비행장치 신고·조종자 증명·전문교육기관 등. 제8항 영어시험의 지정 전문기관 위탁과 구분.','국토교통부'),
 ('기계식주차장 정보망','주차장법 시행령','제12조의11','법정 위탁','위탁확정','기계식주차장 정보망 구축·운영을 TS에 위탁. 검사·사고조사와 개별 조문을 구분.','국토교통부'),
 ('대중교통 통합정보시스템','대중교통의 육성 및 이용촉진에 관한 법률 시행령','제11조의9','법정 위탁','위탁확정','법 제10조의10제4항에 따른 통합정보시스템 구축·운영 업무.','국토교통부'),
 ('위험물질 운송안전센터','물류정책기본법','제29조','대행 가능','가능규정','제1항은 TS에 대행하게 할 수 있는 근거. 실제 대행 지정·운영 근거는 별도 대조. 제4항 목적 외 사용 금지와 제5항 관계행정기관 공동활용을 함께 검토.','국토교통부'),
 ('교통약자 조사·정보체계·교육교재','교통약자의 이동편의 증진법 시행령','제21조의3','위탁 대상 자격','가능규정','제3·4항: TS와 한국교통연구원이 수탁 가능한 대상. 제5항 실제 위탁기관·업무 고시를 추가 확인해야 함.','국토교통부'),
 ('UAM 실증·버티포트 등 지원','도심항공교통 활용 촉진 및 지원에 관한 법률 시행령','제25조','위탁 대상 자격','가능규정','제2항 TS·LX·항우연·항공안전기술원 등은 수탁 가능한 기관군. 제3항 실제 위탁 고시를 확인하기 전 TS의 확정 업무로 사용하지 않음.','국토교통부'),
]
curated_rows=[]
for i,(name,ln,art,rel,status,note,authority) in enumerate(curated,1):
 law=lawbyname[key(ln)];a=next(x for x in law['articles'] if re.match(re.escape(art)+r'(?:\(|\s|$)',x['article']))
 did='D_TS_'+str(i).zfill(2);node(did,name,'업무',group='TS 검토 업무',verification=status,source_ids=[law['source_id']],description=note,article=a['article'],effective=law['effective'])
 edge('A_C0019',did,rel,'조문검토',law['source_id'],article=a['article'],note=note)
 edge(did,law['node_id'],'업무 근거 조문','조문검토',law['source_id'],article=a['article'],evidence=a['text'],note=note)
 if authority:
  authority_note='법문상 권한 주체는 국토교통부장관이며 관계도에는 기관 단위로 표시.' if authority=='국토교통부' else ''
  if status=='가능규정':authority_note+=' 가능규정은 실제 위탁 사실을 의미하지 않음.'
  edge(did,gov(authority),'위탁·대행 권한 주체','조문검토',law['source_id'],article=a['article'],note=authority_note)
 if did=='D_TS_04':edge(did,gov('시·도지사등(법정 주체)'),'일부 업무의 위탁 권한 주체','조문검토',law['source_id'],article=a['article'],note='제2항제1호 및 제4호에 관한 시·도지사등의 업무에 한정. 모든 시·도지사의 모든 업무 위탁을 뜻하지 않음.')
 curated_rows.append(dict(id=did,name=name,law=ln,article=a['article'],relation=rel,status=status,authority=authority,note=note,source=sources[law['source_id']]['url']))

# 명칭 변경의 추적 가능성을 남긴다.
new_ai=lawid('인공지능 및 데이터 기반 행정 활성화에 관한 법률')
if new_ai:nodes[new_ai]['aliases'].append('데이터기반행정 활성화에 관한 법률')
gap_ids={g['agency_id'] for g in gaps}
for n in nodes.values():
 if n['kind']=='기관' and n['id'] not in gap_ids:
  gaps.append(dict(agency_id=n['id'],name=n['name'],group=n['group'],full_legal_review=False,remaining=['소관법령·직제·조직 규정의 전체 목록 확인','설립·업무·위임·위탁 근거의 조문별 검토','공식 조직도 기준과 현재 법적 지위의 대조']))

stats=dict(date='2026-09-09',central_roster=63,designated=342,subsidiary=13,alio_reports=len(alio),local_public_roster=423,local_invested_roster=892,
 local_live_profiles=len(local),local_profiles_fetched=sum(x['status']=='공시 추출' for x in local),local_founding_fields=sum(bool(x.get('fields',{}).get('설립근거')) for x in local),
 local_roster_profile_matches=sum(x['profile_matched'] for x in roster_results),local_roster_profile_pending=sum(not x['profile_matched'] for x in roster_results),
 nondesignated_reference=len(nondesignated),law_bodies=len({x['node_id'] for x in laws if x.get('node_id')}),ordinance_bodies=len({x['node_id'] for x in ords if x.get('node_id')}),
 ordinance_current_bodies=len({x['node_id'] for x in ords if x.get('node_id') and x['status']=='본문 취득·시행일 확인'}),curated_ts_relations=len(curated),
 agency_nodes=sum(n['kind']=='기관' for n in nodes.values()),nodes=len(nodes),edges=len(edges),full_coverage=False)
graph=dict(schema_version='1.0',title='기관·법령·법정업무 관계도',as_of='2026-09-09',coverage_note='기준 명단의 목록 포괄성과 개별 관계의 법률 검증은 다르다. 모든 기관의 모든 관계법령·조례·고시를 검증한 전수 완료본이 아니다.',stats=stats,nodes=list(nodes.values()),edges=edges,sources=list(sources.values()))
# 참조·ID·모집단 수 검증. 실제 법률 검토를 대신하지 않는다.
assert len(alio)==355 and sum(meta[o['apbaId']]['subFlag']!='Y' for o in alio)==342
assert len(roster_results)==1315
assert all(e['from_id'] in nodes and e['to_id'] in nodes for e in edges)
assert all(s in sources for e in edges for s in e['source_ids'])
assert len({e['id'] for e in edges})==len(edges)
assert all(not l.get('effective') or l['effective']<='20260909' for l in laws if l.get('node_id'))
assert all(not g['full_legal_review'] for g in gaps)
assert {g['agency_id'] for g in gaps}=={n['id'] for n in nodes.values() if n['kind']=='기관'}
save('기관법령_관계원장.json',graph);save('기관별_미확인대장.json',gaps);save('기준명단_공시대조.json',roster_results);save('TS_검토관계.json',curated_rows)
save('취득실패_및_제명검토.json',dict(laws=[{k:v for k,v in x.items() if k!='articles'} for x in laws if not x.get('node_id')],ordinances=[{k:v for k,v in x.items() if k!='articles'} for x in ords if x['status']!='본문 취득·시행일 확인']))
save('검증결과.json',dict(checked_at='2026-09-09',stats=stats,checks={'JSON 생성':'통과','ID 고유성':'통과','관계 참조 무결성':'통과','출처 참조 무결성':'통과','공공기관·부설기관 분리':'통과','지방 기준명단 1315개 보존':'통과','기관 항목별 미확인 대장 연결':'통과','법령 본문 시행일이 조사일 이내':'통과','미검증의 완료 승격 방지':'통과'},legal_review='전수·독립 법률검토 미실시',ui_review='뷰어_검증결과.json 참조. 재생성 시 뷰어 생성·검증을 다시 실행할 것.'))
print(json.dumps(stats,ensure_ascii=False,indent=2))
