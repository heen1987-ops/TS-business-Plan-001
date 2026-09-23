"""기존 버전을 덮어쓰지 않고 문서·원장 ZIP과 원문 해시 목록을 보존한다."""
from pathlib import Path
import argparse
import hashlib
import json
import re
import zipfile

ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('--date',required=True)
parser.add_argument('--version',required=True)
args=parser.parse_args()
if not re.fullmatch(r'\d{4}-\d{2}-\d{2}',args.date) or not re.fullmatch(r'v\d+\.\d+(?:\.\d+)?',args.version):raise SystemExit('날짜 YYYY-MM-DD, 버전 v숫자.숫자 형식 필요')
target=ROOT/'99_버전보관'/f'{args.date}_{args.version}'
if target.exists():raise SystemExit('기존 버전 보존: 새 버전을 지정하세요.')
validation=json.loads((ROOT/'00_관리/검증결과.json').read_text(encoding='utf-8'))
if not validation['passed']:raise SystemExit('문서 검증 실패 상태에서는 스냅샷을 만들지 않습니다.')
files=[p for p in ROOT.rglob('*') if p.is_file() and not any(x in p.parts for x in ['99_버전보관','원문','__pycache__'])]
sources=json.loads((ROOT/'04_출처아카이브/출처원장.json').read_text(encoding='utf-8'))['sources']
for s in sources:
    if s['archived_path'] and hashlib.sha256((ROOT/s['archived_path']).read_bytes()).hexdigest()!=s['sha256']:raise SystemExit('원문 해시 불일치: '+s['id'])
target.mkdir(parents=True)
manifest={'date':args.date,'version':args.version,'meaning':'조사 자료 보존 시점·사업 승인 아님','files':[],'raw_references':[],'restore_note':'ZIP은 원문을 포함하지 않음. 원문 복구·이전에는 raw_references 파일도 필요.'}
with zipfile.ZipFile(target/'문서원장.zip','x',zipfile.ZIP_DEFLATED) as archive:
    for p in sorted(files):
        rel=p.relative_to(ROOT).as_posix();data=p.read_bytes();archive.writestr(rel,data)
        manifest['files'].append({'path':rel,'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data)})
manifest['raw_references']=[{'id':s['id'],'path':s['archived_path'],'sha256':s['sha256'],'bytes':s['byte_size']} for s in sources if s['archived_path']]
manifest['zip_sha256']=hashlib.sha256((target/'문서원장.zip').read_bytes()).hexdigest()
with zipfile.ZipFile(target/'문서원장.zip') as archive:
    if archive.testzip():raise SystemExit('ZIP CRC 오류')
    for item in manifest['files']:
        if hashlib.sha256(archive.read(item['path'])).hexdigest()!=item['sha256']:raise SystemExit('ZIP 내용 해시 오류')
(target/'스냅샷목록.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'path':str(target),'files':len(files),'raw_references':len(manifest['raw_references']),'zip_crc_and_sha256':'통과'},ensure_ascii=False))
