from pathlib import Path
import re

b=Path(__file__).resolve().parent
root=b.parents[2]
policy=root/'00_기획지침/CCK_로컬LLM_적용범위.md'
s=policy.read_text(encoding='utf-8')
if 'U-INFRA-01' not in s:
    s=s.replace('v1.1 · 사용자 추가 정정 U-CCK-01·02 반영','v1.2 · 사용자 추가 정정 U-CCK-01·02 및 U-INFRA-01 반영',1)
    marker='## 2. 포함·제외 경계'
    s=s.replace(marker,'**U-INFRA-01 — 사용자 확정 인프라 제약(2026-09-10): 기존 로컬 서버를 사용하며 신규 인프라 투자비는 0원이다.** 신규 GPU·서버·저장·백업·망 장비의 구매·증설·임차와 클라우드 자원비를 신규 사업비에 넣지 않는다. 응용 SW 개발·기존 환경 배포 설정·연계·검수·데이터 복원 시험 공수는 구별해 산정한다. 기존 장비 유지보수와 자원 증분도 이번 용역비에 계상하지 않는다. 기존 자원 용량은 실측 전이며 부족할 때 대기열·모델 설정·동시성·자료량·업무 범위를 조정하고 품질을 재검수한다. 인프라 0원은 TS 자산의 소유권·사용권 또는 성능 검증 완료를 뜻하지 않는다.\n\n'+marker,1)
    policy.write_text(s,encoding='utf-8')

queue=root/'04_기관리서치/TS_대화구조화/후속확인_대기열.md'
s=queue.read_text(encoding='utf-8')
if '예산 조정 v0.3' not in s:
    s=s.replace('v1.5 · 전 항목 대기','v1.6 · 전 항목 대기',1)
    entry='- 2026-09-10: U-INFRA-01 기존 로컬 서버 사용·신규 인프라 투자 0원을 [예산 조정 v0.3](../../05_통합사업기획/CCK_TS_AX_정의_RFP_비용산정_2026-09-10/예산조정_v0.3/README.md)에 반영했다. v0.2의 36개 요구·36.6 MM을 유지하고 저장·백업 보완비 및 연간 장비 보증·백업 자원 증분을 제거했다. 구축 산정은 VAT 포함 1차 642,386,048원·2차 476,001,056원, 합계 1,118,387,104원이다. 기존 자원 부족 시 처리량·범위를 조정하며 신규 인프라 구매로 전환하지 않는다. 자원 실측·제품 성능·비중복·공식 API 확인은 미완료이므로 Q09~Q12를 포함한 대기 상태를 유지한다.\n\n'
    s=s.replace('## 이번 작업 이력\n\n','## 이번 작업 이력\n\n'+entry,1)
    queue.write_text(s,encoding='utf-8')

for folder,relative,version in [(b.parent,'예산조정_v0.3','v0.1'),(b.parent/'예산조정_v0.2','../예산조정_v0.3','v0.2')]:
    p=folder/'00_산출물_안내.html';s=p.read_text(encoding='utf-8')
    banner=f'<aside id="infra-revision-notice" style="padding:22px max(24px,calc((100% - 1132px)/2));background:#fff3cf;color:#183346;border-bottom:1px solid #c8b573"><strong>이 화면은 이전 {version} 이력입니다.</strong><br>최신안은 기존 로컬 서버 사용·신규 인프라 투자 0원을 반영했습니다. 구축 추정액은 VAT 포함 약 11.18억 원입니다. <a href="{relative}/00_산출물_안내.html" style="font-weight:bold;color:#005e56">인프라 투자 0원 v0.3 열기</a></aside>'
    if 'infra-revision-notice' not in s:
        if 'budget-revision-notice' in s:s=re.sub(r'<aside id="budget-revision-notice".*?</aside>',banner,s,count=1,flags=re.S)
        else:s=s.replace('<body>','<body>'+banner,1)
        p.write_text(s,encoding='utf-8')
    p=folder/'README.md';s=p.read_text(encoding='utf-8')
    if '최신 인프라 조정 v0.3' not in s:
        lines=s.splitlines();lines[2:2]=[f'[최신 인프라 조정 v0.3]({relative}/README.md): 기존 로컬 서버 사용·신규 인프라 투자 0원. 아래 내용은 이전 버전 이력이다.',''];p.write_text('\n'.join(lines),encoding='utf-8')

record='''# CCK TS 기존 로컬 서버 기반 인프라 투자 제외

2026-09-10 · 사용자 정정 U-INFRA-01

- 확인 사실: 사용자가 기존 로컬 서버 기반이며 인프라 투자 없이 수행해야 한다고 명시했다.
- 반영: 신규 인프라 0원을 서비스·요구 정의/명세·RFP·HTML·MD·Excel에 적용했다. 기존 자원이 부족하면 처리량과 적용 범위를 조정한다.
- 구축 비용: 1차 642,386,048원, 2차 476,001,056원, 합계 1,118,387,104원(VAT 포함). 목표 7억+5억 유지. v0.2 대비 33,000,000원 감소.
- 연간 응용 운영: 118,615,907원(VAT 포함, 별도). 기존 장비 보증과 백업 자원 증분을 제거해 4,400,005원 감소.
- 유지: 36개 요구, 21.5+15.1 MM, X02·X04 제한 도입과 2차 X01 탐색·읽기 연계.
- 검증: Word 4종 20페이지 렌더 열람, Excel 5개 시트 7개 영역 열람, 독립 계산·실제 Excel 재계산·입력 변경·인프라 제약 검사, HTML 링크·검색·모바일 확인.
- 판정: 문서·계산 반영 자체 QA 통과. 사업 수행·제품 성능·TS 인수·독립 평가위원 승인 미수행. 원장 후보 수와 Q01~Q12 대기 상태를 바꾸지 않았다.
- 최신 산출물: ../05_통합사업기획/CCK_TS_AX_정의_RFP_비용산정_2026-09-10/예산조정_v0.3 (작업 폴더 기준 경로 참조)
'''
record=record.replace('../05_통합사업기획/','../../05_통합사업기획/').replace(' (작업 폴더 기준 경로 참조)','')
(root/'04_기관리서치/실행기록/2026-09-10_CCK_TS_인프라투자_제외.md').write_text(record,encoding='utf-8')
print('기획 제약·조사 이력·이전 화면 안내 갱신')
