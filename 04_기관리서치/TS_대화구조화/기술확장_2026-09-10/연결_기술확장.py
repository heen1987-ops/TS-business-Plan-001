from pathlib import Path
import json, shutil
B=Path(__file__).resolve().parent
P=B.parent/'설명자료_2026-09-10'
backup=P/'이력'/'v1.2_기술확장전'
if backup.exists(): raise RuntimeError('이미 보존·연결 처리됨. 재실행하지 않음')
backup.mkdir(parents=True)
for name in ['내용.json','제작_설명자료.py','검증_설명자료.cjs','생성_기록.json','TS_편의안전_AX_설명자료.html','TS_편의안전_AX_설명자료.md','README.md']:
    shutil.copy2(P/name,backup/name)
shutil.copytree(P/'검증',backup/'검증')
D=json.loads((P/'내용.json').read_text(encoding='utf-8'))
X=json.loads((B/'기술확장_내용.json').read_text(encoding='utf-8'))
D['meta']['version']='1.3'
D['meta']['limit']='参조'.replace('参','참')+' 대화·사용자 정정·CCK 파생 기술대장을 반영했다. v1.3 기술 확장 검토에서 공식 TS 업무소개 9건을 선별 열람했고 범위·위치는 별도 출처원장에 기록했다. CCK 기능·성능·로컬 모델 호환성을 실행 검증하지 않았으며 법령 현행 원문·실제 API·심층리서치 결과 본문은 미검증이다.'
D['expansion']={
 'title':'기술을 조합해 5개 사업군으로 확대',
 'lead':X['finding'],
 'rows':[[f['id']+' '+f['title'],f['origin'],f['kind'],f['first']] for f in X['families']],
 'note':'기존 A/B/C를 포함한 5개 사업군과 2개 보조 기능의 기획 확장안이다. 신규 사업 5건의 선정·집계가 아니며 모두 CCK 주관 수행 검증 전이다. 기준 변경·이용 피드백은 별도 플랫폼 사업으로 만들기 전에 각 서비스의 운영 기능으로 검토한다.',
 'html':'../기술확장_2026-09-10/CCK_TS_기술기반_확장검토.html',
 'md':'../기술확장_2026-09-10/CCK_TS_기술기반_확장검토.md'
}
D['queue'].append(['Q12','기술 기반 5개 사업군 확장','X01~X05를 기존 A/B/C·계약 기능과 대조하고 공식 자료·API·텍스트 표본·납품 범위·CCK 수행 근거를 검증'])
(P/'내용.json').write_text(json.dumps(D,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
p=P/'제작_설명자료.py'
s=p.read_text(encoding='utf-8')
s=s.replace('"## 1. 편의와 안전을 구분해 설명하기"]','''"## 0.1 기술 기반 사업 확장", D["expansion"]["lead"],
      mt(["사업군","기존 조사 연결","기술 기능","첫 확인"], D["expansion"]["rows"]), D["expansion"]["note"],
      "[기술 확장 상세 HTML]("+D["expansion"]["html"]+") · [기술 확장 상세 Markdown]("+D["expansion"]["md"]+")",
      "## 1. 편의와 안전을 구분해 설명하기"]''')
s=s.replace('("technology","CCK·로컬 LLM"),','("technology","CCK·로컬 LLM"),("technical-expansion","기술 확장 5개"),')
s=s.replace('body = f\'\'\'', '''expanded = D["expansion"]
expansion_html = f\'''<section id="technical-expansion" class="section"><div class="section-heading"><p class="eyebrow">기술 기반 확대 / U-CCK-03</p><h2>{e(expanded["title"])}</h2><p>{e(expanded["lead"])}</p></div>{table(["사업군","기존 조사 연결","기술 기능","첫 확인"],expanded["rows"])}<p>{e(expanded["note"])}</p><p><a href="{e(expanded["html"])}">기술·처리 흐름·납품·검증 상세 보기 ↗</a> · <a href="{e(expanded["md"])}">Markdown 보기 ↗</a></p></section>\'''
body = f\'\'\'''')
s=s.replace('{technology}\n','{technology}\n{expansion_html}\n')
s=s.replace('U-CCK-01·02는','U-CCK-01~03은').replace('U-CCK-01은 현재 작업의 추가 정정','U-CCK-01~03은 현재 작업의 추가 정정·확장 요청')
s=s.replace('Q11은 CCK 주관 수행 확인이다.','Q11은 CCK 주관 수행, Q12는 기술 확장 확인이다.')
s=s.replace('v1.2에서 주관 수행 조건과 Q11을 추가했다.','v1.2에서 주관 수행 조건과 Q11, v1.3에서 기술 확장과 Q12를 추가했다.')
p.write_text(s,encoding='utf-8',newline='\n')
t=P/'검증_설명자료.cjs'
s=t.read_text(encoding='utf-8')
needle="const tabs=page.getByRole('tab'),panels=page.locator('.case-panel');"
s=s.replace(needle,"""check('기술 확장 5개와 미선정 상태·상세 링크',data.expansion.rows.length===5&&(await page.locator('#technical-expansion').textContent()).includes('신규 사업 5건의 선정·집계가 아니며')&&fs.existsSync(path.resolve(base,data.expansion.html))&&md.includes(data.expansion.md));
"""+needle)
t.write_text(s,encoding='utf-8',newline='\n')
print('v1.2 보존, v1.3 기술 확장 연결 완료')
