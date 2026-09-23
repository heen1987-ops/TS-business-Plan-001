from pathlib import Path
base=Path(__file__).resolve().parent
old=base.parent
p=old/'00_산출물_안내.html'
src=p.read_text(encoding='utf-8')
banner='<aside id="budget-revision-notice" style="padding:22px max(24px,calc((100% - 1132px)/2));background:#fff3cf;color:#183346;border-bottom:1px solid #c8b573"><strong>이 화면은 이전 v0.1 전체 확장안입니다.</strong><br>최신 검토안은 1차 7억 원·2차 5억 원 목표로 범위를 축소했습니다. <a href="예산조정_v0.2/00_산출물_안내.html" style="font-weight:bold;color:#005e56">예산 조정 v0.2 열기</a></aside>'
if 'budget-revision-notice' not in src:p.write_text(src.replace('<body>','<body>'+banner,1),encoding='utf-8')
p=old/'README.md';src=p.read_text(encoding='utf-8')
if '최신 예산 조정 v0.2' not in src:
    lines=src.splitlines();lines[2:2]=['[최신 예산 조정 v0.2](예산조정_v0.2/README.md): 1차 7억·2차 5억 목표 상한으로 납품 범위를 수정했다. 아래 v0.1은 이전 전체 확장 이력이며 최신 범위에 합산하지 않는다.',''];p.write_text('\n'.join(lines),encoding='utf-8')
print('이전 화면과 README에 최신 범위 안내 추가')
