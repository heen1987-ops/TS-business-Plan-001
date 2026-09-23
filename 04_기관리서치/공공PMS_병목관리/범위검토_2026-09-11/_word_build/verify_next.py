from pathlib import Path
from zipfile import ZipFile
from lxml import etree
from pypdf import PdfReader
import json,re,hashlib
base=Path(__file__).resolve().parent.parent
build=base/'_word_build'
manifest=json.loads((build/'content_manifest.json').read_text(encoding='utf-8'))
exports=json.loads((build/'word_render_manifest.json').read_text(encoding='utf-8-sig'))
ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
def norm(x):return re.sub(r'\s+','',x.replace('**',''))
report={'source_checks':manifest['checks'],'documents':[]}
for exp in exports:
 f=base/exp['file']
 with ZipFile(f) as z:
  xml=etree.fromstring(z.read('word/document.xml'))
  settings=etree.fromstring(z.read('word/settings.xml'))
  text=''.join(xml.xpath('//w:t/text()',namespaces=ns))
  missing=[x for x in manifest['documents'][exp['file']]['text_units'] if norm(x) not in norm(text)]
  tables=xml.xpath('//w:tbl',namespaces=ns)
  checks={
   'text_preserved':not missing,
   'editable':not settings.xpath('//w:documentProtection',namespaces=ns),
   'repeat_table_headers':all(t.xpath('./w:tr[1]/w:trPr/w:tblHeader',namespaces=ns) for t in tables),
   'no_fixed_row_heights':not xml.xpath('//w:trHeight[@w:hRule="exact"]',namespaces=ns),
   'no_tool_citation_tokens':not re.search(r'turn\d+(?:search|view)|cite',text),
   'title_style':bool(xml.xpath('//w:pPr/w:pStyle[@w:val="Title"]',namespaces=ns))
  }
 pages=PdfReader(exp['pdf']).pages
 sparse=[n for n,p in enumerate(pages,1) if len(p.extract_text())<220]
 checks['no_orphan_pages']=not sparse
 report['documents'].append({'file':f.name,'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'pages':len(pages),'checks':checks,'missing':missing,'sparse_pages':sparse})
old=base.parent/'요구사항_2026-09-10/요구사항_원장.json'
report['source_unchanged']=hashlib.sha256(old.read_bytes()).hexdigest()==manifest['checks']['source_sha256']
(build/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
assert report['source_unchanged']
assert all(all(x['checks'].values()) for x in report['documents'])
