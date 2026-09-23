from pathlib import Path
from zipfile import ZipFile
import hashlib
import json
import re
import sys
import xml.etree.ElementTree as ET

sys.stdout.reconfigure(encoding='utf-8')
source = Path(r'C:/Users/김희섭/Desktop/한국도로교통공단 정보공개업무편람(2025).hwpx')
output = Path(__file__).resolve().parent
HP = '{http://www.hancom.co.kr/hwpml/2011/paragraph}'

def paragraph_text(node):
    parts = []
    def visit(current):
        for child in current:
            if child.tag == HP + 'p':
                continue
            if child.tag == HP + 't':
                parts.append(''.join(child.itertext()))
            elif child.tag in (HP + 'lineBreak', HP + 'tab'):
                parts.append(' ')
            else:
                visit(child)
    visit(node)
    return re.sub(r'\s+', ' ', ''.join(parts)).strip()

records = []
sections = []
with ZipFile(source) as archive:
    members = archive.namelist()
    names = sorted((x for x in members if re.fullmatch(r'Contents/section\d+\.xml', x)), key=lambda x: int(re.search(r'(\d+)\.xml', x).group(1)))
    for name in names:
        section = int(re.search(r'(\d+)\.xml', name).group(1))
        root = ET.fromstring(archive.read(name))
        parent = {child: node for node in root.iter() for child in node}
        tables = {id(node): index + 1 for index, node in enumerate(root.iter(HP + 'tbl'))}
        paragraphs = list(root.iter(HP + 'p'))
        before = len(records)
        for index, para in enumerate(paragraphs, 1):
            value = paragraph_text(para)
            if not value:
                continue
            context = []
            anc = parent.get(para)
            while anc is not None:
                if anc.tag == HP + 'tc':
                    addr = anc.find(HP + 'cellAddr')
                    if addr is not None:
                        context.append('행'+str(int(addr.get('rowAddr', '0'))+1)+'·열'+str(int(addr.get('colAddr', '0'))+1))
                if anc.tag == HP + 'tbl':
                    context.append('표'+str(tables[id(anc)]))
                anc = parent.get(anc)
            records.append({'id': f'S{section}-P{index:04d}', 'section': section, 'context': ' / '.join(reversed(context)), 'text': value})
        sections.append({'file': name, 'paragraphs': len(paragraphs), 'nonempty': len(records)-before, 'tables': len(tables)})
    preview = archive.read('Preview/PrvText.txt').decode('utf-8-sig', errors='replace') if 'Preview/PrvText.txt' in members else ''

lines = ['# 한국도로교통공단 정보공개업무편람(2025) — 본문 추출', '', '원본은 읽기 전용으로 참조했다. 내부 스크립트를 실행하지 않고 HWPX XML 본문만 추출했다.', 'S번호·P번호는 XML 절·문단 식별자이며 인쇄 쪽번호가 아니다. 표는 셀 좌표를 보존한 문단 순서로 추출했다. 도형·이미지 내부 텍스트와 원본 페이지 배치는 검증하지 않았다.', '']
for record in records:
    location = f" ({record['context']})" if record['context'] else ''
    lines.append(f"[{record['id']}]{location} {record['text']}")
    lines.append('')
(output / '편람_본문추출.md').write_text('\n'.join(lines), encoding='utf-8')
metadata = {'source': str(source), 'sha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'bytes': source.stat().st_size, 'extracted_on': '2026-09-11', 'sections': sections, 'records': len(records), 'scripts_executed': False, 'rendered': False, 'preview_characters': len(preview)}
(output / '추출_기록.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(metadata, ensure_ascii=False, indent=2))
print('\nPREVIEW\n'+preview[:7000])
