from pathlib import Path
import json
BASE=Path(__file__).resolve().parent
rows=json.loads((BASE/'공식메뉴_수집결과.json').read_text(encoding='utf-8'))
seen={r['url'] for r in rows};extra=[]
for row in rows:
    for link in row['links']:
        u=link['url'];title=link['text'].replace('\n선택됨','')
        if not u or u in seen:continue
        tab=link['css']=='btn-tab' and row['id'] not in ('KB21','KB26')
        guide='safedriving.or.kr' in u and ('Guide' in u or 'EduGuide' in u or 'Guide11' in u)
        page2=row['id']=='KB28' and title=='2'
        service=row['id'] in ('KB20',) or (row['id']=='KB12' and 'trafficedu' in u)
        relevant_stat=row['id']=='KB26' and title=='운전면허 민원현황'
        if not(tab or guide or page2 or service or relevant_stat):continue
        seen.add(u)
        extra.append(dict(id='KC'+str(len(extra)+1).zfill(2),parent=row['id'],group=row['group'],title=title if title not in ('바로가기','2') else row['title']+' '+('2쪽' if page2 else '연결 안내'),url=u,level='내부 하위 탭' if tab else '연결 안내·목록'))
(BASE/'하위항목_모집단.json').write_text(json.dumps(extra,ensure_ascii=False,indent=2),encoding='utf-8')
for r in extra:print(r['id'],r['parent'],r['title'],r['url'])
