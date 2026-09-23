import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadDependency} from './공용_실행환경.mjs';
const {Workbook,SpreadsheetFile} = await loadDependency('@oai/artifact-tool');
const base=path.dirname(fileURLToPath(import.meta.url));
const data=JSON.parse(await fs.readFile(path.join(base,'사업정의_데이터.json'),'utf8'));
const output=path.join(base,'outputs','01a085c1-adea-71a1-acf0-ff030613a6bc');
const qa=path.join(base,'검증','비용');await fs.mkdir(output,{recursive:true});await fs.mkdir(qa,{recursive:true});
const wb=Workbook.create();
const names=['산정요약','가정과단가','공수산정','도입과직접경비','연간운영'];
const sheets=Object.fromEntries(names.map(n=>[n,wb.worksheets.add(n)]));
const navy='#223E52',blue='#0000FF',green='#008000',ink='#172B39',light='#EDF3F5';
const money='#,##0;(#,##0);"-"',mm='0.0;(0.0);"-"';
function v(s,cell,value){s.getRange(cell).values=[[value]];}
function f(s,cell,value){s.getRange(cell).formulas=[[value]];s.getRange(cell).format.font.color=value.includes('!')?green:'#000000';}
function init(s,title,cols,widths){s.showGridLines=false;s.getRange(`A1:${cols}50`).format.font={name:'Malgun Gothic',size:11,color:ink};s.getRange(`A1:${cols}50`).format.rowHeight=25;s.getRange(`A1:${cols}50`).format.verticalAlignment='center';s.getRange(`A1:${cols}50`).format.wrapText=true;v(s,'A1',title);s.getRange('A1').format.font={size:19,bold:true,color:ink};s.getRange('A1').format.rowHeight=36;for(let i=0;i<widths.length;i++)s.getRange(`${String.fromCharCode(65+i)}1:${String.fromCharCode(65+i)}50`).format.columnWidth=widths[i];s.freezePanes.freezeRows(5);}
function header(s,row,heads){s.getRangeByIndexes(row-1,0,1,heads.length).values=[heads];s.getRangeByIndexes(row-1,0,1,heads.length).format={fill:navy,font:{color:'#FFFFFF',bold:true},rowHeight:32};}
function band(s,row,cols){s.getRange(`A${row}:${cols}${row}`).format={fill:light,font:{bold:true},rowHeight:30};}
function input(s,r){s.getRange(r).format.font.color=blue;s.getRange(r).format.fill='#F2F7FF';}
let a=sheets['가정과단가'];init(a,'산정 가정과 2026년 직무 단가','F',[23,17,22,19,28,75]);
v(a,'A3','파란 숫자는 편집 입력. 단가와 가산율은 서로 다른 근거입니다.');a.getRange('A3:F3').merge();a.getRange('A3:F3').format.rowHeight=32;
header(a,4,['항목','값','단위','성격','적용 범위','근거와 수정 조건']);
const controls=[['제경비율',data.overhead,'직접인건비 대비','가격화 가정','구축·운영','개발은 임시 가정. 운영 가이드의 144~154% 범위 참고.'],['기술료율',data.fee,'인건비+제경비 대비','가격화 가정','구축·운영','20%. 개발 모든 과업에 의무 적용되는 법정요율 아님.'],['VAT',data.vat,'공급가액 대비','일반 과세 가정','전체','부가가치세법 제30조. 과세 예외 발생 시 별도 계산.'],['구축 예산 여유',data.reserve,'구축 공급가액 대비','예산 가정','사업주 예산','계약금액에 포함하지 않는 별도 예비 충당. 신뢰구간 아님.'],['공수 보정계수',1,'배','민감도 입력','구축 공수','범위 확정 후 조정. 동일 계산 경로에 적용.'],['1단계 기간',8,'개월','일정 가정','X02·X04','평균 배치인원은 MM/개월. 월별 실제 배치 별도 확정.'],['2단계 기간',6,'개월','일정 가정','X01·X03·X05','1단계 이후 순차 도입. 2단계 대기 운영비는 미포함.'],['운영 기간',12,'개월','정상 운영','전체 서비스','구축 검수 후 12개월. 24시간 전담 운영·콜센터 없음.']];
a.getRange('A5:F12').values=controls;input(a,'B5:B12');a.getRange('B5:B8').setNumberFormat('0.0%');a.getRange('B9').setNumberFormat('0.00');a.getRange('A5:F12').format.rowHeight=44;
header(a,15,['직무코드','직무명','월 임금 원','출처','적용기간','단가 해석']);
data.roles.forEach((r,i)=>{const row=16+i;a.getRange(`A${row}:F${row}`).values=[[r[0],r[1],r[2],'S01','2026-01~12','기본급·수당·상여·퇴직·사업주보험 포함']];});input(a,'C16:C25');a.getRange('C16:C25').setNumberFormat(money);a.getRange('A16:F25').format.rowHeight=33;
v(a,'A28','공식 출처');a.getRange('A28').format.font.bold=true;
data.sources.slice(0,4).forEach((r,i)=>{let row=29+i*2;a.getRange(`A${row}:F${row}`).merge();v(a,`A${row}`,`${r[0]} ${r[1]} · ${r[3]}`);a.getRange(`A${row+1}:F${row+1}`).merge();v(a,`A${row+1}`,r[2]);a.getRange(`A${row+1}:F${row+1}`).format.font={size:9,color:green};});
v(a,'A38','전체 전자 텍스트 10,000건 이하·대상 시스템 5개·로컬 생성 동시 10건은 규모 가정입니다.');a.getRange('A38:F38').merge();
v(a,'A39','FP 미측정. 기능 경계·연계·사용권·견적 확보 후 산정 방식을 과업별 확정하세요.');a.getRange('A39:F39').merge();

let e=sheets['공수산정'];init(e,'구축 작업별 공수와 직접인건비','O',[9,11,32,8,8,8,8,8,8,8,8,8,8,12,21]);
e.getRange('A3:O3').merge();v(e,'A3','단위 MM · 파란 숫자는 기본 공수 가정 · 공통 작업은 1회 · 보정계수는 전체 구축 공수에 적용');
header(e,5,['WBS','단계','작업',...data.roles.map(r=>r[0]),'적용 MM','직접인건비 원']);
data.wps.forEach((w,i)=>{let row=6+i;e.getRange(`A${row}:M${row}`).values=[[w[0],w[1],w[2],...w[4]]];input(e,`D${row}:M${row}`);f(e,`N${row}`,`=IF(COUNT(D${row}:M${row})=10,SUM(D${row}:M${row})*'가정과단가'!$B$9,"입력 누락")`);let terms=data.roles.map((r,j)=>`${String.fromCharCode(68+j)}${row}*'가정과단가'!$C$${16+j}`).join('+');f(e,`O${row}`,`=IF(AND(COUNT(D${row}:M${row})=10,COUNT('가정과단가'!$C$16:$C$25)=10),(${terms})*'가정과단가'!$B$9,"입력 누락")`);e.getRange(`A${row}:O${row}`).format.rowHeight=48;});
e.getRange('D6:N15').setNumberFormat(mm);e.getRange('O6:O22').setNumberFormat(money);
for(let i=0;i<2;i++){let row=19+i;v(e,`B${row}`,`${i+1}단계`);v(e,`C${row}`,'단계 합계');f(e,`N${row}`,`=IF(COUNT(N6:N15)=10,SUMIF(B6:B15,B${row},N6:N15),"입력 누락")`);f(e,`O${row}`,`=IF(COUNT(O6:O15)=10,ROUND(SUMIF(B6:B15,B${row},O6:O15),0),"입력 누락")`);band(e,row,'O');}
v(e,'C22','전체 합계');f(e,'N22','=IF(COUNT(N19:N20)=2,SUM(N19:N20),"입력 누락")');f(e,'O22','=IF(COUNT(O19:O20)=2,SUM(O19:O20),"입력 누락")');band(e,22,'O');
data.wps.forEach((w,i)=>{let row=25+i;e.getRange(`A${row}:O${row}`).merge();v(e,`A${row}`,`${w[0]} ${w[3]} · ${w[5]}`);e.getRange(`A${row}:O${row}`).format.rowHeight=30;});

let d=sheets['도입과직접경비'];init(d,'도입비와 직접경비 충당액','H',[10,12,31,9,10,20,22,64]);
d.getRange('A3:H3').merge();v(d,'A3','모든 금액은 견적 이전의 예산 가정입니다. 구매가격·무상 제공을 확정한 자료가 아닙니다.');
header(d,5,['ID','단계','항목','단위','수량','단가 원','금액 원','확인 사항']);
data.direct.forEach((r,i)=>{let row=6+i;d.getRange(`A${row}:F${row}`).values=[[r[0],r[1],r[2],r[3],r[4],r[5]]];input(d,`E${row}:F${row}`);f(d,`G${row}`,`=IF(COUNT(E${row}:F${row})=2,ROUND(E${row}*F${row},0),"견적 입력 누락")`);v(d,`H${row}`,r[6]+' · '+r[7]);d.getRange(`A${row}:H${row}`).format.rowHeight=62;});d.getRange('F6:G22').setNumberFormat(money);
for(let i=0;i<2;i++){let row=20+i;v(d,`B${row}`,`${i+1}단계`);v(d,`C${row}`,'합계');f(d,`G${row}`,`=IF(COUNT(G6:G17)=12,SUMIF(B6:B17,B${row},G6:G17),"입력 누락")`);band(d,row,'H');}
d.getRange('A24:H24').merge();v(d,'A24','감리·개인정보 영향평가·별도 심의·추가 네트워크/센터 구축·TS 자체 인력은 미포함. 적용과 견적 확인 후 별도 예산 추가.');d.getRange('A24:H24').format.rowHeight=44;
d.getRange('A25:H25').merge();v(d,'A25','라이선스 포함 지원이 개발 공수와 겹치면 한쪽을 제거합니다. 기보유 서버를 제공받으면 해당 구매 충당액을 0으로 변경할 수 있습니다.');d.getRange('A25:H25').format.rowHeight=42;

let o=sheets['연간운영'];init(o,'전체 도입 후 정상 운영 12개월','G',[24,25,15,20,23,30,52]);
o.getRange('A3:G3').merge();v(o,'A3','구축 검수 후 증분 운영비 · 무상 하자보수·신규 기능개발·24시간 전담 인력 제외 · 입력 기간에 비례');
header(o,5,['업무','직무','연간 MM','월 임금 원','운영 인건비 원','단가 근거','범위']);
data.ops.forEach((r,i)=>{let row=6+i;let ri=data.roles.findIndex(x=>x[0]===r[2]);o.getRange(`A${row}:C${row}`).values=[[r[1],data.roles[ri][1],r[3]]];input(o,`C${row}`);f(o,`D${row}`,`='가정과단가'!C${16+ri}`);f(o,`E${row}`,`=IF(COUNT(C${row}:D${row})=2,C${row}*D${row}*'가정과단가'!$B$12/12,"입력 누락")`);v(o,`F${row}`,'S01 월 임금');v(o,`G${row}`,'동일 인력의 부분 참여. 실제 배치와 대응시간 계약 필요.');o.getRange(`A${row}:G${row}`).format.rowHeight=43;});o.getRange('C6:C11').setNumberFormat(mm);o.getRange('D6:E32').setNumberFormat(money);
header(o,14,['운영 직접경비','수량 단위','연간 수량','단가 원','비용 원','성격','확인 사항']);
data.opsdirect.forEach((r,i)=>{let row=15+i;o.getRange(`A${row}:D${row}`).values=[[r[1],i===2?'일':i===3?'개월':'식',r[2],r[3]]];input(o,`C${row}:D${row}`);f(o,`E${row}`,`=IF(COUNT(C${row}:D${row})=2,ROUND(C${row}*D${row}*'가정과단가'!$B$12/12,0),"입력 누락")`);v(o,`F${row}`,'예산 충당액');v(o,`G${row}`,r[4]);o.getRange(`A${row}:G${row}`).format.rowHeight=47;});
const opLabels=['직접인건비','제경비','기술료','운영 직접경비','공급가액','VAT','운영 총액'];
const opFormulas=['=IF(COUNT(E6:E11)=6,ROUND(SUM(E6:E11),0),"입력 누락")',"=ROUND(E22*'가정과단가'!$B$5,0)","=ROUND(SUM(E22:E23)*'가정과단가'!$B$6,0)",'=IF(COUNT(E15:E18)=4,SUM(E15:E18),"입력 누락")','=IF(COUNT(E22:E25)=4,SUM(E22:E25),"입력 누락")',"=ROUND(E26*'가정과단가'!$B$7,0)",'=IF(COUNT(E26:E27)=2,SUM(E26:E27),"입력 누락")'];
opLabels.forEach((l,i)=>{let row=22+i;v(o,`A${row}`,l);f(o,`E${row}`,opFormulas[i]);});band(o,26,'G');band(o,28,'G');
o.getRange('A31:G31').merge();v(o,'A31','운영 오류 대응은 비하자 운영 요청에 한정합니다. 구축 하자를 유상 운영으로 다시 청구하지 않도록 계약 항목을 분리합니다.');o.getRange('A31:G31').format.rowHeight=42;

let s=sheets['산정요약'];init(s,'CCK TS AX 개발과 용역비 산정','F',[31,24,24,25,18,61]);
s.getRange('A3:F3').merge();v(s,'A3','2026년 불변가격 · 발주 전 ROM · 5개 사업군의 제한된 최초 적용 · 공급사 확정견적 아님');
header(s,5,['구분','1단계 X02 X04','2단계 추가 3개','전체 구축','단위','계산과 해석']);
const labels=['적용 공수','일정','평균 배치인원','직접인건비','제경비','기술료','개발 용역비','도입비와 직접경비','공급가액','VAT','구축 총액','사업주 예산 여유','여유 포함 VAT','여유 포함 예산'];
const desc=['작업별 공수 합계','순차 도입 가정','MM/개월. 실제 배치표 아님','직무별 MM × 2026 월 임금','144% 가격화 가정','직접인건비+제경비의 20% 가정','인건비+제경비+기술료','HW·라이선스·연계사·검수 등 충당액','용역비+도입·직접경비','일반 과세 10% 가정','부가세 포함. 예산 여유 제외','공급가액 15%. 계약자 자동 지급액 아님','공급가액+예산 여유에 VAT 적용','사업주 검토 예산. 감리 등 미포함'];
labels.forEach((l,i)=>{let row=6+i;v(s,`A${row}`,l);v(s,`E${row}`,i===0?'MM':i===1?'개월':i===2?'명':'원');v(s,`F${row}`,desc[i]);s.getRange(`A${row}:F${row}`).format.rowHeight=i>7?40:33;});
for(let i=0;i<2;i++){
 const c=i===0?'B':'C',pr=19+i,dr=20+i,period=10+i;
 f(s,`${c}6`,`='공수산정'!N${pr}`);f(s,`${c}7`,`='가정과단가'!B${period}`);f(s,`${c}8`,`=IF(${c}7>0,${c}6/${c}7,"기간 확인")`);
 f(s,`${c}9`,`='공수산정'!O${pr}`);f(s,`${c}10`,`=ROUND(${c}9*'가정과단가'!$B$5,0)`);f(s,`${c}11`,`=ROUND(SUM(${c}9:${c}10)*'가정과단가'!$B$6,0)`);f(s,`${c}12`,`=IF(COUNT(${c}9:${c}11)=3,SUM(${c}9:${c}11),"입력 누락")`);
 f(s,`${c}13`,`='도입과직접경비'!G${dr}`);f(s,`${c}14`,`=IF(COUNT(${c}12:${c}13)=2,SUM(${c}12:${c}13),"입력 누락")`);f(s,`${c}15`,`=ROUND(${c}14*'가정과단가'!$B$7,0)`);f(s,`${c}16`,`=IF(COUNT(${c}14:${c}15)=2,SUM(${c}14:${c}15),"입력 누락")`);f(s,`${c}17`,`=ROUND(${c}14*'가정과단가'!$B$8,0)`);f(s,`${c}18`,`=ROUND((${c}14+${c}17)*'가정과단가'!$B$7,0)`);f(s,`${c}19`,`=${c}14+SUM(${c}17:${c}18)`);
}
for(let row=6;row<=19;row++)f(s,`D${row}`,row===8?'=IF(D7>0,D6/D7,"기간 확인")':`=IF(COUNT(B${row}:C${row})=2,SUM(B${row}:C${row}),"입력 누락")`);
s.getRange('B6:D8').setNumberFormat(mm);s.getRange('B9:D28').setNumberFormat(money);[12,14,16,19].forEach(r=>band(s,r,'F'));
v(s,'A22','도입 후 연간 운영');f(s,'D22',"='연간운영'!E28");v(s,'E22','원');v(s,'F22','VAT 포함. 전체 도입 이후 12개월의 증분비');
v(s,'A24','구축과 정상 운영 1년');f(s,'D24','=D16+D22');v(s,'E24','원');v(s,'F24','중간 단계 운영비·예산 여유·기관 별도 비용 제외');band(s,24,'F');
s.getRange('A27:F27').merge();v(s,'A27','편집 순서: 가정과단가 → 공수산정 → 도입과직접경비 → 연간운영. 파란 입력을 수정하면 이 요약에 반영됩니다.');s.getRange('A27:F27').format.rowHeight=36;
s.getRange('A28:F28').merge();v(s,'A28','원가 검토 전 확인: 실제 업무 규모·공식 API·CCK 사용권/가용인력·GPU 부하·견적·FP 적용 가능성·기관 감리/평가 예산.');s.getRange('A28:F28').format.rowHeight=38;
// 출력 결과는 검정, 내부 연결은 녹색을 유지한다.
s.getRange('B6:D24').format.font.color='#000000';
for(const sh of Object.values(sheets))sh.getRange('A1').format.wrapText=false;
// 필수 입력을 지우거나 음수를 입력했을 때 정상 예산으로 보이지 않게 한다.
const validBuild="AND(COUNT('가정과단가'!B5:B11)=7,MIN('가정과단가'!B5:B9)>=0,MIN('가정과단가'!B10:B11)>0,COUNT('가정과단가'!C16:C25)=10,MIN('가정과단가'!C16:C25)>0,COUNT('공수산정'!D6:M15)=100,MIN('공수산정'!D6:M15)>=0,COUNT('도입과직접경비'!E6:F17)=24,MIN('도입과직접경비'!E6:F17)>=0)";
for(const c of ['B','C']){
 f(s,`${c}16`,`=IF(${validBuild},${c}14+${c}15,"입력 확인")`);
 f(s,`${c}19`,`=IF(${validBuild},${c}14+SUM(${c}17:${c}18),"입력 확인")`);
}
const validOps="AND(COUNT('가정과단가'!B5:B7)=3,MIN('가정과단가'!B5:B7)>=0,COUNT('가정과단가'!B12)=1,'가정과단가'!B12>0,COUNT(C6:D11)=12,MIN(C6:C11)>=0,MIN(D6:D11)>0,COUNT(C15:D18)=8,MIN(C15:D18)>=0)";
f(o,'E28',`=IF(${validOps},SUM(E26:E27),"입력 확인")`);
f(s,'D24','=IF(COUNT(D16,D22)=2,D16+D22,"입력 확인")');
s.getRange('B6:D24').format.font.color='#000000';
wb.recalculate();
const baseline=s.getRange('B16:D16').values[0];
const expected=[data.budget['1단계'].gross,data.budget['2단계'].gross,data.budget['1단계'].gross+data.budget['2단계'].gross];
if(baseline.some((x,i)=>Math.abs(x-expected[i])>1))throw new Error('독립 계산과 구축 합계 불일치 '+JSON.stringify(baseline));
if(Math.abs(o.getRange('E28').values[0][0]-data.budget['운영'].gross)>1)throw new Error('독립 운영 계산 불일치');
// 원값을 복구하는 입력 변경 시험.
const old=e.getRange('H6').values[0][0];e.getRange('H6').values=[[1]];wb.recalculate();const changed=s.getRange('D16').values[0][0];if(!(changed>baseline[2]))throw new Error('공수 변경 미반영');e.getRange('H6').values=[[old]];
const oldDirect=d.getRange('F6').values[0][0];d.getRange('F6').values=[[0]];wb.recalculate();const zero=s.getRange('D16').values[0][0];if(!(zero<baseline[2]))throw new Error('무상 제공 0 입력 미반영');d.getRange('F6').values=[[null]];wb.recalculate();const blank=s.getRange('D16').values[0][0];if(typeof blank==='number')throw new Error('누락 입력이 정상 총액으로 계산됨');d.getRange('F6').values=[[oldDirect]];
a.getRange('B9').values=[[1.1]];wb.recalculate();const sensitivity=s.getRange('D16').values[0][0];if(!(sensitivity>baseline[2]))throw new Error('보정계수 미반영');a.getRange('B9').values=[[1]];
a.getRange('B5').values=[[null]];wb.recalculate();if(typeof s.getRange('D16').values[0][0]==='number')throw new Error('가산계수 누락 미차단');a.getRange('B5').values=[[data.overhead]];
e.getRange('D6').values=[[-1]];wb.recalculate();if(typeof s.getRange('D16').values[0][0]==='number')throw new Error('음수 공수 미차단');e.getRange('D6').values=[[data.wps[0][4][0]]];wb.recalculate();
const errors=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:200},summary:'최종 수식 오류 검사'});
await fs.writeFile(path.join(qa,'수식오류검색.txt'),errors.ndjson);
await fs.writeFile(path.join(qa,'수식검사.json'),JSON.stringify({baseline,expected,changed,zero,blank,sensitivity,errors,restored:s.getRange('B16:D16').values[0]},null,2));
await fs.writeFile(path.join(qa,'요약검사.txt'),(await wb.inspect({kind:'table',range:'산정요약!A5:F24',include:'values,formulas',tableMaxRows:20,tableMaxCols:6,maxChars:14000})).ndjson);
const renderRanges=[['산정요약','A1:F28'],['가정과단가','A1:F25'],['가정과단가','A28:F39'],['공수산정','A1:O22'],['공수산정','A25:O34'],['도입과직접경비','A1:H25'],['연간운영','A1:G31']];
for(let i=0;i<renderRanges.length;i++){const [sheetName,range]=renderRanges[i];const blob=await wb.render({sheetName,range,scale:1.4,format:'png'});await fs.writeFile(path.join(qa,`${i+1}_${sheetName}.png`),new Uint8Array(await blob.arrayBuffer()));}
const file=await SpreadsheetFile.exportXlsx(wb);await file.save(path.join(output,'CCK_TS_AX_개발_용역비_산정.xlsx'));
console.log(JSON.stringify({output:output,totals:baseline,operating:o.getRange('E28').values,tests:'공수 변경·0·누락·보정계수·원상복구·독립 합계 검증 완료'}));
