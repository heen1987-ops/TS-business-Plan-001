from pathlib import Path
from pypdf import PdfReader
from pdf2image import convert_from_path
from zipfile import ZipFile
import json,xml.etree.ElementTree as ET
base=Path(__file__).resolve().parent
model=json.loads((base/'사업정의_데이터.json').read_text(encoding='utf-8'))
ids=[r['id'] for r in model['requirements']]
assert len(ids)==len(set(ids))==43
wpids={r[0] for r in model['wps']}
assert all(set(r['wp'].split(','))<=wpids for r in model['requirements'])
report={'requirement_count':len(ids),'id_unique':True,'wbs_mapped':True,'documents':[]}
for p in sorted((base/'검증/문서').glob('*/문서.pdf')):
    reader=PdfReader(p)
    texts=[pg.extract_text() for pg in reader.pages]
    (p.parent/'텍스트.txt').write_text('\n\n'.join(f'PAGE {i+1}\n{t}' for i,t in enumerate(texts)),encoding='utf-8')
    imgs=convert_from_path(str(p),dpi=115,poppler_path='C:/Users/김희섭/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin')
    for i,img in enumerate(imgs):img.save(p.parent/f'page-{i+1}.png')
    report['documents'].append({'document':p.parent.name,'pages':len(reader.pages),'min_page_text':min(len(t) for t in texts)})
    if p.parent.name.startswith('03'):assert all(id in ''.join(texts) for id in ids)
ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
xlsx=next((base/'outputs').glob('*/*.xlsx'))
with ZipFile(xlsx) as z:
    errorcells=[];formula_count=0
    for name in z.namelist():
        if name.startswith('xl/worksheets/sheet') and name.endswith('.xml'):
            root=ET.fromstring(z.read(name));formula_count+=len(root.findall('.//s:f',ns));errorcells += [(name,c.attrib['r'],c.find('s:v',ns).text) for c in root.findall('.//s:c',ns) if c.attrib.get('t')=='e']
    report['spreadsheet']={'formulas':formula_count,'cached_error_cells':errorcells}
    assert not errorcells
(base/'검증/정적검사.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
