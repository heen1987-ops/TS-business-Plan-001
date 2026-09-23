from pathlib import Path
import re
base=Path(__file__).resolve().parent
old=base.parent
src=(old/'제작_비용.mjs').read_text(encoding='utf-8')
replaces={
"['1단계 기간',8":"['1단계 기간',6",
"'X01·X03·X05'":"'X01 탐색과 읽기 연계'",
"'1단계 이후 순차 도입. 2단계 대기 운영비는 미포함.'":"'2차 6개월 중 1차 서비스 제한 운영은 W10 포함. 공백 운영 별도.'",
"['구축 예산 여유',data.reserve,'구축 공급가액 대비','예산 가정','사업주 예산','계약금액에 포함하지 않는 별도 예비 충당. 신뢰구간 아님.']":"['추가 예비율',0,'가산 없음','v0.2 기준','사용 안 함','15% 추가 가산 폐지. 목표 상한과 산정 총액의 차액만 표시.']",
"전체 전자 텍스트 10,000건 이하·대상 시스템 5개·로컬 생성 동시 10건은 규모 가정입니다.":"1차 텍스트 2,000건·동시 2건, 2차 누계 5,000건·동시 4건·읽기 계약 3개. 기존 GPU 제공 조건.",
"'2026년 불변가격 · 발주 전 ROM · 5개 사업군의 제한된 최초 적용 · 공급사 확정견적 아님'":"'2026년 가격 · v0.2 예산 조정안 · 목표 상한과 계산액을 구별 · 기존 GPU 제공·재사용 권리 조건'",
"'2단계 추가 3개'":"'2단계 탐색과 연계'",
"'사업주 예산 여유','여유 포함 VAT','여유 포함 예산'":"'목표 상한 VAT 포함','상한과 산정액 차이','상한 초과 여부'",
"'공급가액 15%. 계약자 자동 지급액 아님','공급가액+예산 여유에 VAT 적용','사업주 검토 예산. 감리 등 미포함'":"'사용자 제안 7억·5억. 예산 승인 아님','목표 상한 - VAT 포함 산정액. 자동 지급액 아님','상한 내라도 견적·기존 환경 확인 필요'",
"f(s,`${c}17`,`=ROUND(${c}14*'가정과단가'!$B$8,0)`);f(s,`${c}18`,`=ROUND((${c}14+${c}17)*'가정과단가'!$B$7,0)`);f(s,`${c}19`,`=${c}14+SUM(${c}17:${c}18)`);":"f(s,`${c}17`,`=IF(AND(COUNT('가정과단가'!B${13+i})=1,'가정과단가'!B${13+i}>0),'가정과단가'!B${13+i},\"상한 입력 확인\")`);f(s,`${c}18`,`=IF(COUNT(${c}17,${c}16)=2,${c}17-${c}16,\"입력 확인\")`);f(s,`${c}19`,`=IF(COUNT(${c}18)=1,IF(${c}18>=0,\"상한 이내\",\"상한 초과\"),\"입력 확인\")`);",
"f(s,`${c}19`,`=IF(${validBuild},${c}14+SUM(${c}17:${c}18),\"입력 확인\")`);":"// 상한 상태는 산정액 검증과 입력 상한을 따르는 19행 수식 유지.",
"'중간 단계 운영비·예산 여유·기관 별도 비용 제외'":"'W10 중간 운영 포함. 상한 차액·기관 별도 비용 제외'",
"'기보유 서버를 제공받으면 해당 구매 충당액을 0으로 변경할 수 있습니다.'":"'기존 GPU 제공 조건이며 보완비 3천만 원을 신규 GPU 가격으로 사용하지 않습니다.'",
"라이선스 포함 지원이 개발 공수와 겹치면 한쪽을 제거합니다. 기보유 서버를 제공받으면 해당 구매 충당액을 0으로 변경할 수 있습니다.":"포함 지원과 개발 공수 중복을 제거합니다. 기존 GPU 제공 조건. 신규 GPU 구매 필요 시 견적 반영 후 범위 재조정.",
"'단위 MM · 파란 숫자는 기본 공수 가정 · 공통 작업은 1회 · 보정계수는 전체 구축 공수에 적용'":"'단위 MM · 파란 입력은 업무별 가정 · 공통 적응 1회 · W10에 1차의 6개월 제한 운영 포함'",
"'동일 인력의 부분 참여. 실제 배치와 대응시간 계약 필요.'":"'기존 TS 기반 운영과 문의창구 제공 조건. CCK 부분 지원·비하자 운영만.'",
"'연간 수량'":"'연간 수량'",
"range:'산정요약!A5:F24'":"range:'산정요약!A5:F24'",
}
for a,b in replaces.items():src=src.replace(a,b)
insertion="""
a.getRange('A13:F14').values=[['1차 목표 상한',data.caps['1단계'],'원 VAT 포함','사용자 제안','예산 승인 아님','산정액과 비교하는 상한'],['2차 목표 상한',data.caps['2단계'],'원 VAT 포함','사용자 제안','추가 사업비','1차와 합쳐 누계 12억']];
input(a,'B13:B14');a.getRange('B13:B14').setNumberFormat(money);a.getRange('A13:F14').format.rowHeight=42;
a.getRange('B8').format.font.color=ink;a.getRange('B8').format.fill='#FFFFFF';
"""
src=src.replace("header(a,15,",insertion+"\nheader(a,15,")
src=src.replace("s.getRange('B6:D8').setNumberFormat(mm);", "f(s,'D19','=IF(COUNT(B18:C18)=2,IF(MIN(B18:C18)>=0,\"두 단계 상한 이내\",\"단계 상한 초과\"),\"입력 확인\")');v(s,'E19','');\ns.getRange('B6:D8').setNumberFormat(mm);")
src=src.replace("wb.recalculate();\nconst baseline", "wb.recalculate();\nconst baseline",1)
src=src.replace("const errors=await wb.inspect", """
const cap1=a.getRange('B13').values[0][0];a.getRange('B13').values=[[100000000]];wb.recalculate();if(s.getRange('B19').values[0][0]!=='상한 초과')throw new Error('상한 초과 경고 실패');a.getRange('B13').values=[[null]];wb.recalculate();if(typeof s.getRange('B18').values[0][0]==='number')throw new Error('상한 누락 차액 정상 계산');a.getRange('B13').values=[[cap1]];wb.recalculate();
const errors=await wb.inspect""")
(base/'제작_비용.mjs').write_text(src,encoding='utf-8')
(base/'검증_Word.ps1').write_text((old/'검증_Word.ps1').read_text(encoding='utf-8'),encoding='utf-8-sig')
src=(old/'검증_문서.py').read_text(encoding='utf-8').replace('==43','==36')
(base/'검증_문서.py').write_text(src,encoding='utf-8')
src=(old/'검증_Excel.ps1').read_text(encoding='utf-8').replace('$tsExpected = @(1646021461,1153141990,2799163451,469027614)',"$tsCostData = Get-Content -LiteralPath (Join-Path $tsExcelBase '사업정의_데이터.json') -Raw -Encoding utf8 | ConvertFrom-Json\n    $tsExpected = @($tsCostData.budget.'1단계'.gross,$tsCostData.budget.'2단계'.gross,($tsCostData.budget.'1단계'.gross+$tsCostData.budget.'2단계'.gross),$tsCostData.budget.'운영'.gross)")
(base/'검증_Excel.ps1').write_text(src,encoding='utf-8-sig')
print('기존 계산과 검증 도구를 v0.2 범위에 맞춰 준비')
