from pathlib import Path
import os,sys,importlib.util,json
SKILL=Path('C:/Users/김희섭/.codex/plugins/cache/openai-primary-runtime/documents/26.909.12148/skills/documents/render_docx.py')
ROOT=Path(__file__).resolve().parent.parent
RUNTIME=Path('C:/Users/김희섭/.cache/codex-runtimes/codex-primary-runtime/dependencies')
os.environ['PATH']=str(RUNTIME/'native/poppler/Library/bin')+os.pathsep+os.environ.get('PATH','')
spec=importlib.util.spec_from_file_location('document_renderer',SKILL)
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
manifest=json.loads((ROOT/'_work/word_render_manifest.json').read_text(encoding='utf-8-sig'))
exports={str((ROOT/x['file']).resolve()):x['pdf'] for x in manifest}
# The canonical LibreOffice conversion failed because it is not bundled on Windows.
# Use Microsoft's native Word export as the PDF backend, keeping the packaged rasterizer.
def word_pdf(input_path,user_profile,convert_tmp_dir,stem,verbose=False):
    pdf=exports[str(Path(input_path).resolve())]
    assert Path(pdf).is_file()
    return pdf,'PDF backend: Microsoft Word; native Word PDF from read-only DOCX copy'
module.convert_to_pdf=word_pdf
for x in manifest:
    sys.argv=[str(SKILL),str(ROOT/x['file']),'--output_dir',x['directory'],'--dpi','110']
    module.main()


