"""HWPX 공개본의 무효 줄 배치 캐시만 제거하는 복구 도구.

기본 동작은 qa-output에 시험본을 작성한다. 본문·표·그림·숫자는 변경하지 않는다.
한글 일반 열기 검증 후 publish 단계를 통해 같은 공개 경로로 반영한다.
공식 근거: https://forum.developer.hancom.com/t/hwpx-section0-xml/2414
"""
from pathlib import Path
import argparse,hashlib,json,zipfile
from lxml import etree as E

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'qa-output/hwpx-repair/staged'
NS='http://www.hancom.co.kr/hwpml/2011/paragraph'

def sha(payload):return hashlib.sha256(payload).hexdigest()

def clear_layout(payload):
 tree=E.fromstring(payload)
 caches=tree.findall('.//{'+NS+'}linesegarray')
 for cache in caches:cache.getparent().remove(cache)
 return E.tostring(tree,encoding='UTF-8',xml_declaration=True),len(caches)

def prepare():
 manifest=json.loads((ROOT/'src/department-documents.json').read_text(encoding='utf8'))
 assert not manifest.get('compatibility'),'This dated repair has already been published; do not overwrite its validation evidence'
 jobs=[]
 for department in manifest['departments']:
  for file in [*department['documents'],*department.get('history',[])]:
   src=ROOT/'public'/file['path']
   assert sha(src.read_bytes())==file['sha256'],'Unexpected source change'
   target=OUT/file['path'];target.parent.mkdir(parents=True,exist_ok=True)
   removed=0
   if file['kind']=='plan':
    with zipfile.ZipFile(src) as original,zipfile.ZipFile(target,'w') as repaired:
     assert original.testzip() is None
     for info in original.infolist():
      payload=original.read(info.filename)
      if info.filename.startswith('Contents/section') and info.filename.endswith('.xml'):
       payload,count=clear_layout(payload);removed+=count
      repaired.writestr(info,payload)
    with zipfile.ZipFile(src) as original,zipfile.ZipFile(target) as repaired:
     assert repaired.testzip() is None and original.namelist()==repaired.namelist()
     for name in original.namelist():
      before=original.read(name);after=repaired.read(name)
      if name.startswith('Contents/section') and name.endswith('.xml'):
       stripped,_=clear_layout(before)
       assert stripped==after,'Unexpected section content change'
      else:assert before==after,'Unexpected binary or metadata change'
   else:
    target=src
   jobs.append({'code':department['code'],'name':department['name'],'kind':file['kind'],'version':file['version'],
    'publicPath':file['path'],'source':str(src),'path':str(target),'beforeSha256':file['sha256'],
    'sha256':sha(target.read_bytes()),'bytes':target.stat().st_size,'removedLayoutCaches':removed})
 (OUT/'jobs.json').write_text(json.dumps(jobs,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 print(json.dumps({'files':len(jobs),'repaired':sum(j['removedLayoutCaches']>0 for j in jobs),'removedCaches':sum(j['removedLayoutCaches'] for j in jobs)}))

def publish():
 jobs=json.loads((OUT/'jobs.json').read_text(encoding='utf8'))
 results=json.loads((OUT/'native/results.json').read_text(encoding='utf8'))
 events_path=OUT/'native/events.jsonl'
 events=[json.loads(line) for line in events_path.read_text(encoding='utf8').splitlines() if line.strip()] if events_path.exists() else []
 warnings=sum(e['kind']=='document_security_warning' for e in events)
 assert warnings==0,'Document security warnings during normal open'
 assert len(jobs)==len(results)==156 and all(r['opened'] and r['bodyRead'] and r['paragraphsVerified'] for r in results)
 assert len({r['publicPath'] for r in results})==156,'Duplicate normal open result'
 result_by_path={r['publicPath']:r for r in results}
 manifest=json.loads((ROOT/'src/department-documents.json').read_text(encoding='utf8'))
 job_by_path={j['publicPath']:j for j in jobs};published=[]
 files=[file for d in manifest['departments'] for file in [*d['documents'],*d.get('history',[])]]
 assert {f['path'] for f in files}==set(job_by_path)==set(result_by_path) and len(job_by_path)==156,'Unexpected publication scope'
 assert json.loads((OUT/'native/done.json').read_text(encoding='utf8'))['count']==156,'Native validator not complete'
 # 모든 검사를 먼저 완료하여 후반부 불일치로 일부 파일만 교체되는 상황 예방.
 for file in files:
  job=job_by_path[file['path']];result=result_by_path[file['path']]
  assert result['sha256']==job['sha256'] and sha(Path(job['path']).read_bytes())==job['sha256']
  assert sha((ROOT/'public'/file['path']).read_bytes())==job['beforeSha256']
 for department in manifest['departments']:
  for file in [*department['documents'],*department.get('history',[])]:
   job=job_by_path[file['path']];result=result_by_path[file['path']]
   assert result['sha256']==job['sha256'] and sha(Path(job['path']).read_bytes())==job['sha256']
   source=ROOT/'public'/file['path'];assert sha(source.read_bytes())==job['beforeSha256']
   if job['removedLayoutCaches']:
    backup=OUT/'backup'/file['path'];backup.parent.mkdir(parents=True,exist_ok=True);backup.write_bytes(source.read_bytes())
    source.write_bytes(Path(job['path']).read_bytes())
    file['bytes']=job['bytes'];file['sha256']=job['sha256']
    file['compatibilityRepair']={'date':'2026-10-06','beforeSha256':job['beforeSha256'],'removedLayoutCaches':job['removedLayoutCaches'],'bodyAndImagesPreserved':True}
   published.append({k:result[k] for k in ['code','kind','version','publicPath','sha256','opened','bodyRead','paragraphsVerified','paragraphCount','pages']})
 manifest['compatibility']={'date':'2026-10-06','application':'한컴오피스 한글 2024','method':'강제 열기 없이 일반 Open 및 본문 스캔 검증','verifiedFiles':156,'repairedPlans':78,'source':'https://forum.developer.hancom.com/t/hwpx-section0-xml/2414'}
 (ROOT/'src/department-documents.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 (ROOT/'src/hwpx-compatibility-20261006.json').write_text(json.dumps({'date':'2026-10-06','application':'한컴오피스 한글 2024','openOptions':'lock:false','forceOpen':False,'securitySettingsChanged':False,'documentSecurityWarnings':warnings,'files':published},ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 print(json.dumps({'published':len(published),'repaired':sum(j['removedLayoutCaches']>0 for j in jobs)}))

if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('action',choices=['prepare','publish']);args=parser.parse_args()
 (prepare if args.action=='prepare' else publish)()
