from pathlib import Path
import json,re
ROOT=Path(__file__).resolve().parent;RAW=ROOT/'원천자료'
def key(s): return re.sub(r'[^가-힣A-Za-z0-9]','',s)
def clean(s): return re.sub(r'\s+',' ',s.replace('ㆍ','·').replace('･','·')).strip(' ○ㅇ-「」｢｣"')
overrides={
 'C0023':['암관리법'], 'C0028':['국민연금법'], 'C0031':['민법'],
 'C0115':['전쟁기념사업회법'], 'C0135':['국립대학병원 설치법'],
 'C0140':['한국철도공사법'], 'C0141':['정부출연연구기관 등의 설립·운영 및 육성에 관한 법률'],
 'C0170':['정부출연연구기관 등의 설립·운영 및 육성에 관한 법률'], 'C0210':['한국산업은행법'],
 'C0377':['사회복지사업법'], 'C0383':[], 'C0440':[], 'C0457':[],
 'C0905':['한국해양과학기술원법'], 'C1018':['생물자원관의 설립 및 운영에 관한 법률'],
 'C1044':['철도사업법'], 'C0844':['산림문화·휴양에 관한 법률'],
 'C1402':['국방과학기술혁신 촉진법','방위산업 발전 및 지원에 관한 법률'],
 'C1038':['민법','공익법인의 설립·운영에 관한 법률','연구산업진흥법'],
 'C0901':['민법','공익법인의 설립·운영에 관한 법률','여성과학기술인 육성 및 지원에 관한 법률'],
}
orgs=json.loads((ROOT/'ALIO_기관별_근거.json').read_text(encoding='utf-8'))
laws={};mapping={}
def add(name,origin):
 name=clean(name)
 if not name or len(name)>90 or name in ['법','법률','관계법','근거법','설립근거법','설립 근거 법률']:return
 if any(x in name for x in ['설립근거','설립 근거','②','⑤','[','(',')','_']):return
 k=key(name)
 laws.setdefault(k,dict(query=name,origins=[]))['origins'].append(origin)
 return k
for o in orgs:
 s=o['founding']; candidates=[]
 for m in re.finditer(r'[「｢“"]([^」｣”"\n]{2,90})[」｣”"]',s):
  c=m.group(1)
  if re.search(r'(법|법률|시행령|시행규칙|규칙)$',c):candidates.append(c)
 for line in s.splitlines():
  line=re.sub(r'^[○ㅇ\-\s]+','',line)
  line=re.sub(r'^(?:붙임\.|\[첨부\]|\(붙임\))\s*','',line)
  m=re.match(r'[^「｢“"\d]*?(?:법률|특별법|기본법|법)(?![가-힣])(?:\s*시행령|\s*시행규칙)?',line)
  if m and len(m.group())<65 and not any(x in m.group() for x in ['보건복지부장관','공보처','재단법인']):candidates.append(m.group())
 if o['apbaId'] in overrides:candidates=overrides[o['apbaId']]
 mapping[o['apbaId']]=list(filter(None,dict.fromkeys(add(c,dict(kind='ALIO 설립근거',agency=o['apbaId'],source=o['source'])) for c in candidates)))
for o in json.loads((RAW/'central_parsed.json').read_text(encoding='utf-8')):
 for link in o['links']:
  m=re.search('/법령/([^/?#]+)',link['url'])
  if m:add(m.group(1),dict(kind='정부조직도 '+link['label'],agency=o['id'],source=o['source']))
extra=['대한민국헌법','공공기관의 운영에 관한 법률','지방공기업법','지방공기업법 시행령','지방자치단체 출자·출연 기관의 운영에 관한 법률','지방자치법','개인정보 보호법','전자정부법','데이터기반행정 활성화에 관한 법률','공공데이터의 제공 및 이용 활성화에 관한 법률','인공지능 발전과 신뢰 기반 조성 등에 관한 기본법','국가연구개발혁신법','국가재정법','소프트웨어 진흥법']
ts=['한국교통안전공단법','교통안전법','자동차관리법','자동차손해배상 보장법','여객자동차 운수사업법','화물자동차 운수사업법','주차장법','철도안전법','항공안전법','항공사업법','공항시설법','대기환경보전법','소음·진동관리법','궤도운송법','물류정책기본법','지속가능 교통물류 발전법','대중교통의 육성 및 이용촉진에 관한 법률','교통약자의 이동편의 증진법','건설기계관리법','자율주행자동차 상용화 촉진 및 지원에 관한 법률','모빌리티 혁신 및 활성화 지원에 관한 법률','도심항공교통 활용 촉진 및 지원에 관한 법률','국가통합교통체계효율화법','산업융합 촉진법']
for s in extra:add(s,dict(kind='공통 적용 검토 대상',source='기획 범위에 따른 검색 후보. 개별 적용은 별도 판정.'))
for s in ts:
 for suffix in ['',' 시행령',' 시행규칙']:
  add(s+suffix,dict(kind='TS 업무 관련 검색 후보',agency='C0019',source='ALIO 주요 기능에 따른 검색 후보. 법령 본문의 기관명·위탁 조문 확인 전 관계 미확정.'))
(ROOT/'법령_수집대상.json').write_text(json.dumps(list(laws.values()),ensure_ascii=False,indent=2),encoding='utf-8')
(ROOT/'ALIO_법령후보_매핑.json').write_text(json.dumps(mapping,ensure_ascii=False,indent=2),encoding='utf-8')
print('법령 후보',len(laws),'공시 매핑기관',sum(bool(v) for v in mapping.values()))
for v in laws.values():print(v['query'])
