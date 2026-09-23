from pathlib import Path
import json
ROOT=Path(__file__).resolve().parent
data=json.loads((ROOT/'기관법령_관계원장.json').read_text(encoding='utf-8'))
template=(ROOT/'관계도_화면_원본.html').read_text(encoding='utf-8')
payload=json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
target=ROOT/'기관법령_관계도.html'
target.write_text(template.replace('__GRAPH_DATA__',payload),encoding='utf-8')
print(target.resolve(),target.stat().st_size)
