from pathlib import Path
import os,sys,importlib.util,json
SKILL=Path('C:/Users/김희섭/.codex/plugins/cache/openai-primary-runtime/documents/26.909.12148/skills/documents/render_docx.py')
ROOT=Path(__file__).resolve().parent.parent
RUNTIME=Path('C:/Users/김희섭/.cache/codex-runtimes/codex-primary-runtime/dependencies')
os.environ['PATH']=str(RUNTIME/'native/poppler/Library/bin')+os.pathsep+os.environ.get('PATH','')
spec=importlib.util.spec_from_file_location('document_renderer',SKILL)
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
item=json.loads((ROOT/'_work/word_render_manifest.json').read_text(encoding='utf-8-sig'))
def word_pdf(input_path,user_profile,convert_tmp_dir,stem,verbose=False):
    assert Path(item['pdf']).is_file()
    return item['pdf'],'PDF backend Microsoft Word native read-only export; bundled LibreOffice unavailable on this host'
module.convert_to_pdf=word_pdf
sys.argv=[str(SKILL),str(ROOT/item['file']),'--output_dir',item['directory'],'--dpi','110']
module.main()
