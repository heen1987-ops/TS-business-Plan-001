from pathlib import Path
import re,json
ROOT=Path(__file__).resolve().parent
def key(s):return re.sub('[^가-힣A-Za-z0-9]','',s)
items={};mapping={}
orgs=json.loads((ROOT/'CLEANEYE_기관별_근거.json').read_text(encoding='utf-8'))
for o in orgs:
 s=o.get('fields',{}).get('설립근거','');candidates=[]
 for c in re.findall(r'[「｢“"『\']([^」｣”"』\'’\n]*?조례)[」｣”"』\'’]',s):candidates.append(c)
 for line in s.splitlines():
  if '조례' not in line:continue
  line=re.sub(r'^[○ㅇoOοΟ●■▣*\d.ㆍ·\-\s]+','',line)
  line=re.sub(r'^(?:\(?조\s*례\)?|설립근거|설립조례)\s*[:：.]?\s*','',line)
  line=re.sub(r'^[○ㅇoO\-\s]+','',line)
  line=re.sub(r'^\(재\)\s*','',line)
  m=re.match(r'([가-힣][가-힣A-Za-z0-9\s·ㆍ･.,()㈜\-]*?조례)(?![가-힣])',line)
  if m and len(m.group(1))>6:candidates.append(m.group(1))
 mapping[o['code']]=[]
 for c in candidates:
  c=re.sub(r'\s+',' ',c).strip();k=key(c)
  if k not in mapping[o['code']]:mapping[o['code']].append(k)
  items.setdefault(k,dict(query=c,origins=[]))['origins'].append({'agency':o['code'],'source':o.get('source'),'kind':'클린아이 설립근거 인용'})
items['서울교통공사설립및운영에관한조례']={'query':'서울교통공사 설립 및 운영에 관한 조례','origins':[{'agency':'2017000008','source':'https://law.go.kr/LSW/ordinInfoP.do?ordinSeq=2116589','kind':'공식 법령 검색'}]}
mapping['2017000008']=['서울교통공사설립및운영에관한조례']
(ROOT/'자치법규_수집대상.json').write_text(json.dumps(list(items.values()),ensure_ascii=False,indent=2),encoding='utf-8')
(ROOT/'CLEANEYE_자치법규후보_매핑.json').write_text(json.dumps(mapping,ensure_ascii=False,indent=2),encoding='utf-8')
print('자치법규 후보',len(items),'기관',sum(bool(x) for x in mapping.values()))
