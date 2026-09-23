"""격리한 임시 복사본에서 재생성 안정성과 수동 변경 보호를 검증한다."""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess
import sys
import tempfile

ROOT=Path(__file__).resolve().parents[1]
PROJECT=ROOT.parent
TEST_PARENT=ROOT/'99_버전보관'
TEST_PARENT.mkdir(exist_ok=True)
temp=Path(tempfile.mkdtemp(prefix='재생성검증_',dir=TEST_PARENT)).resolve()
checks=[]
try:
    files=['06_심층리서치/00_관리/생성_리서치문서.py','06_심층리서치/01_후보별/후보분석_원장.json','06_심층리서치/02_공통솔루션/솔루션원장.json','06_심층리서치/03_도입사례/사례원장.json','06_심층리서치/04_출처아카이브/출처원장.json','05_통합사업기획/사업포트폴리오.json','04_기관리서치/관계도/TS_검토관계.json','04_기관리서치/관계도/기관법령_관계원장.json']
    for rel in files:
        dest=temp/rel;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(PROJECT/rel,dest)
    task=temp/'06_심층리서치'
    def run():return subprocess.run([sys.executable,'-X','utf8',str(task/'00_관리/생성_리서치문서.py')],capture_output=True,text=True,encoding='utf-8')
    def hashes():
        state=json.loads((task/'00_관리/생성파일_원장.json').read_text(encoding='utf-8'))['files']
        return {rel:hashlib.sha256((task/rel).read_bytes()).hexdigest() for rel in state}
    first=run();checks.append({'check':'격리 입력으로 113개 문서 생성','passed':first.returncode==0})
    if first.returncode:raise RuntimeError(first.stderr)
    before=hashes();second=run();checks.append({'check':'같은 입력 재실행 시 모든 생성 파일 바이트 유지','passed':second.returncode==0 and hashes()==before})
    protected=task/'README.md';protected.write_text(protected.read_text(encoding='utf-8')+'\n수동 작성 보존 검증 문장\n',encoding='utf-8')
    edited=hashes();third=run();checks.append({'check':'수동 변경 시 생성 중단·수동 문장과 다른 파일 보존','passed':third.returncode!=0 and '수동 변경 파일 보존' in third.stderr and hashes()==edited})
finally:
    # 재귀 삭제 대상은 이 도구가 만든 작업공간 내 임시 폴더만 허용한다.
    resolved=temp.resolve();boundary=TEST_PARENT.resolve()
    if resolved.parent!=boundary or not resolved.name.startswith('재생성검증_'):raise RuntimeError('임시 경로 경계 검증 실패 — 삭제 안 함')
    shutil.rmtree(resolved)
result={'checks':checks,'passed':bool(checks) and len(checks)==3 and all(c['passed'] for c in checks),'scope':'격리 복사본 검사·실제 원장 및 사용자 문서 변경 없음'}
(ROOT/'00_관리/재생성_검증결과.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result,ensure_ascii=False,indent=2))
sys.exit(0 if result['passed'] else 1)
