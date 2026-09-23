import re,json,hashlib
from pathlib import Path
from zipfile import ZipFile
from lxml import etree
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parent.parent
NS={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
def norm(t):return re.sub(r'\s+','',t)
def words(t):return re.sub(r'[\W_]+','',t)
def plain(t):
    t=re.sub(r'\[([^\]]+)\]\([^)]+\)',r'\1',t)
    return t.replace('**','').replace(chr(96),'').replace('<br>','\n').replace('\\|','|')
ledger=json.loads((ROOT/'요구사항_원장.json').read_text(encoding='utf-8'))
results=[]
for source,target,kind in [('요구사항_분석서.md','Public_AI_PMS_요구사항_분석서_v0.1.docx','analysis_final'),('요구사항_명세서.md','Public_AI_PMS_요구사항_명세서_v0.1.docx','specification_final')]:
    with ZipFile(ROOT/target) as z:
        xml=etree.fromstring(z.read('word/document.xml'))
        text=''.join(xml.xpath('//w:t/text()',namespaces=NS))
        xml_styles=etree.fromstring(z.read('word/styles.xml'))
        rels=z.read('word/_rels/document.xml.rels').decode('utf-8')
    nt=norm(text);wt=words(text);missing=[];checked=0
    for raw in (ROOT/source).read_text(encoding='utf-8').splitlines():
        line=raw.strip()
        if not line or line=='---' or line.startswith('<a '):continue
        if line.startswith('|'):
            vals=[x.strip() for x in re.split(r'(?<!\\)\|',line)[1:-1]]
            if all(re.fullmatch(r':?-+:?',c.replace(' ','')) for c in vals):continue
        elif line.startswith('#'):
            h=re.sub(r'^#+\s*','',line)
            if re.match(r'PMS-(?:SFR|NFR|DAR|IFR|OPR|BMR)-\d{3} ·',h):
                vals=h.split(' · ',1)
            else:vals=[h]
            for val in vals:
                checked+=1
                if words(plain(val)) not in wt:missing.append(val)
            continue
        else:vals=[line[2:] if line.startswith('- ') else line]
        for val in vals:
            checked+=1
            if norm(plain(val)) not in nt:missing.append(val[:200])
    checks={
       'source_units_preserved':not missing,
       'all_tables_repeat_header':all(t.xpath('./w:tr[1]/w:trPr/w:tblHeader',namespaces=NS) for t in xml.xpath('//w:tbl',namespaces=NS)),
       'no_fixed_row_heights':not xml.xpath('//w:trHeight[@w:hRule="exact"]',namespaces=NS),
       'editable_no_protection':True,
       'toc_field_exists':bool(xml.xpath('//w:instrText[contains(text(),"TOC")]',namespaces=NS)),
    }
    with ZipFile(ROOT/target) as z:
        settings=etree.fromstring(z.read('word/settings.xml'))
        checks['editable_no_protection']=not settings.xpath('//w:documentProtection',namespaces=NS)
    if '명세서' in source:
        checks['all_58_requirements_preserved']=all(norm(r['statement']) in nt and r['id'] in text for r in ledger['requirements'])
        checks['all_116_acceptance_preserved']=all(a['id'] in text and norm(a['text']) in nt for r in ledger['requirements'] for a in r['acceptance_cases'])
        checks['all_58_internal_bookmarks']=len([b for b in xml.xpath('//w:bookmarkStart/@w:name',namespaces=NS) if b.startswith('pms_')])==58
    pdf=PdfReader(ROOT/'_word_build'/kind/'word_export.pdf')
    pages=[]
    for i,page in enumerate(pdf.pages):
        tx=page.extract_text()
        pages.append({'page':i+1,'chars':len(tx),'first':tx[:95].replace('\n',' / '),'last':tx[-90:].replace('\n',' / ')})
    (ROOT/'_word_build'/kind/'page_text_inventory.json').write_text(json.dumps(pages,ensure_ascii=False,indent=2),encoding='utf-8')
    results.append({'file':target,'source':source,'source_units':checked,'missing':missing,'checks':checks,'pages':len(pdf.pages),'sparse_pages':[p for p in pages if p['chars']<220],'sha256':hashlib.sha256((ROOT/target).read_bytes()).hexdigest()})
(ROOT/'_word_build'/'content_verification.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(results,ensure_ascii=False,indent=2))
if any(not all(x['checks'].values()) for x in results):raise SystemExit(1)

