const design=require('./advanced47.cjs'),esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function diagram(code,type){const p=design.get(code),nodes=[],edges=[],textBlocks=[];const w=1440;let h=1220;const node=(id,x,y,width,height,title,lines,group)=>nodes.push({id,x,y,w:width,h:height,title,lines,group});const edge=(from,to,label,route)=>edges.push({from,to,label,...route});const title=type==='runtime'?'세부 실행 아키텍처':'정상·예외 시퀀스';
if(type==='runtime'){
node('ui',40,140,320,180,'M01 · 처별 검토 화면',['사건 · 근거 · 계획 · 담당 판단','업무 단위: '+p.key],'user');
node('case',390,140,320,180,'M02 · 사건·상태',['진행 상태 / 자료판본 / 변경 이력','동시 변경은 기대 기록판본 대조'],'control');
node('policy',740,140,310,180,'M11 · 권한·정책',['역할 × 사건 × 문서 × 행위','검색·추론·실행·제공에 적용'],'control');
node('ops',1080,140,320,180,'M14 · 운영·관측',['허용 처리량 · 변경 · 복구','기존 서버 자원·SLO 확인 전'],'control');
node('evidence',40,350,320,160,'M03·13 · 근거·검색',['원문 위치 · 판본 · 효력 · 권한','문서 텍스트 / 표 / 결손·상충'],'data');
node('plan',390,350,320,160,'M04 · 목표·과업 계획',['사건별 완료조건 → 확인질문','과업 DAG · 선행조건 · 중단조건'],'ai');
node('verify',740,350,310,160,'M05 · 결과 검증',['출처 · 대상 · 판본 · 조건 확인','없음·상충이면 보완/보류'],'control');
node('approve',1080,350,320,160,'M06 · 담당 검토·승인',['대상 · 행위 · 인자 · 판본 결합','변경행위가 없는 과업은 인계 확인'],'user');
node('model',40,585,320,170,'M12 · 로컬 모델',['문서·관계 해석과 계획 후보','외부 우회 없음 / 제공 기능 확인 전'],'ai');
node('domain',390,585,660,170,'처별 과업·도구 프로필',[p.agent,p.rule],'ai');
node('exec',1080,585,320,170,'M07 · 실행 통제',['쓰기권한·승인·원천 상태 재확인','멱등키 · 허용 도구 · 출력 계약'],'control');
node('store',40,830,320,170,'문서·사건·실행 저장',['원문·판본 / 사건·과업','승인 / 요청·실행 / 공식 결과','변경이력 / 관측 참조'],'data');
node('result',390,830,320,170,'M09 · 결과 대사',['접수 ≠ 실제 반영 ≠ 확인 완료','부분·지연·미확인 → 잔여 과업'],'control');
node('measure',740,830,310,170,'M10 · 후속 관측',['업무 종결과 효과 관측 분리',p.measurementRefs.join(' · ')],'data');
node('adapter',1080,830,320,170,'M08 · 원천 어댑터',[p.official,'조회·승인 요청·결과 대사 후보'],'source');
edge('ui','case','사건 요청');edge('case','policy','권한 대조');edge('case','plan','범위·목표');edge('evidence','plan','허용 근거');edge('plan','domain','권한 내 조회·분석',{path:'M550 510 V585',badge:{x:564,y:550,text:'조회·분석'}});edge('domain','verify','처별 도구 출력 검증',{path:'M895 585 V510',badge:{x:909,y:550,text:'출력 대조'}});edge('verify','approve','검토 후보');edge('evidence','model','최소 문맥');edge('model','domain','추론 후보');edge('approve','exec','유효 승인');edge('exec','adapter','허용 요청');edge('adapter','result','원천 결과');edge('result','measure','유효 관측 참조');edge('result','case','결과 이력·잔여과업 환류',{path:'M450 1000 V1050 H20 V120 H550 V140',badge:{x:65,y:1044,text:'결과 대사 → 사건 기록 → 잔여계획'}});edge('evidence','store','원문·파생 참조',{path:'M360 490 H375 V800 H200 V830'});
textBlocks.push({x:40,y:1080,lines:['흐름의 분리: 검토용 조회·분석 → 담당 확인 / 변경행위가 필요한 경우에만 승인·실행·대사','미확인·부분 반영: M09 → M02에 이력 기록 → M04에서 영향 과업 재편성','위치·서버 대수와 무관한 논리 구성. 실제 원천 API·제품 기능·자원 여력 확인 전.']});
}else{
h=1790;const laneX=[80,420,760,1100],laneNames=['담당자·권한자','NOA 계획·검증','도구 실행·대사', '공식 원천'];
laneNames.forEach((name,i)=>node('lane'+i,laneX[i],145,260,110,name,['논리 역할 · 구현 확인 전'],'control'));
const rows=[
[0,1,'01 · 사건 목표·허용자료 제공','scope_checked',p.key],
[1,2,'02 · 검토계획 구성','plan_prepared','완료조건·선행관계·허용 조회·분석도구 확인'],
[2,1,'03 · 조회·분석과 출력 검증','analysis_started / analysis_verified','검증 후 담당 판단 대기. A 또는 B 경로 선택'],
[1,0,'A · 조회·분석 과업 인계 후 종결','handover_verified / close','검토안 인계로 끝나는 경로. 아래 B의 변경행위 미수행'],
[0,2,'B · 필요한 변경행위만 승인','approval_recorded','별도 경로: 승인 범위·판본·유효기간 결합'],
[2,3,'B-1 · 유효 조건 재확인 후 요청','dispatch','권한·원천 상태·동일행위 키 대조'],
[3,2,'B-2 · 접수 또는 응답 미확인','receipt / timeout','접수와 실제 반영 구분. 이 상태에서 무조건 재전송 금지'],
[2,3,'B-3 · 원천 조회 요청 (논리 계약 C05)','','상태 전이 이벤트가 아닌 조회 계약. 결과에 따라 아래 분기 선택'],
[3,2,'B-4a · 현재 판본·모든 항목 일치','result_verified','RESULT로 이동 → 담당 확인·잔여과업 해소 후 종결'],
[3,2,'B-4b · 일부만 반영','partial','RECONCILE 유지. 완료 항목 보존·남은 항목의 별도 계획'],
[3,2,'B-4c · 변경 전 요청의 늦은 결과','result_verified','현재판본 완료 금지. 이전 요청에 지연결과 보존 후 별도 대사'],
[2,1,'B-5 · 이전 요청 대사 해소','partial_reconciled / reconcile_superseded','부분 반영 또는 이전 판본 요청의 대사 → 잔여계획 / 미해소 보류는 HOLD'],
[1,0,'B-6 · B-4a의 유효 결과만 종결','close',p.complete]
];
rows.forEach((r,i)=>textBlocks.push({x:40,y:300+i*102,from:laneX[r[0]]+130,to:laneX[r[1]]+130,label:r[2],event:r[3],detail:r[4]}));
textBlocks.push({x:40,y:1690,lines:['A와 B는 대안 경로. B-4a/b/c는 결과별 대안이며 연속 실행 순서가 아님.','응답 유실은 조회·대사 선행. 부분 반영은 완료분 보존·잔여계획. 실제 승인·API 실행 없음.']});
}
const wrap=(s,max)=>{const out=[];for(const part of String(s).split('\n')){let line='';for(const c of part){if([...line].length>=max){out.push(line);line='';}line+=c;}out.push(line);}return out;};
const txt=(s,x,y,size,max)=>wrap(s,max).map((l,i)=>'<text x="'+x+'" y="'+(y+i*(size+8))+'" font-size="'+size+'">'+esc(l)+'</text>').join('');
const colors={control:'#edf3f8',user:'#e6f2f5',data:'#eef2e9',ai:'#edf0fc',source:'#fff4e5'};
const nodeSvg=nodes.map(n=>{let lines=n.lines.flatMap(x=>wrap(x,Math.floor((n.w-32)/16)));return '<g data-node="'+n.id+'"><rect x="'+n.x+'" y="'+n.y+'" width="'+n.w+'" height="'+n.h+'" rx="8" fill="'+colors[n.group]+'" stroke="#9cb0c0"/>'+txt(n.title,n.x+16,n.y+28,19,Math.floor((n.w-32)/19))+lines.map((l,i)=>txt(l,n.x+16,n.y+64+i*24,16,200)).join('')+'</g>'}).join('');
const edgeSvg=edges.map(e=>{const a=nodes.find(n=>n.id===e.from),b=nodes.find(n=>n.id===e.to);let path;if(e.path){path=e.path;}else if(a.y===b.y&&Math.abs(a.x-b.x)>a.w+100){path='M'+(a.x+a.w/2)+' '+(a.y+a.h)+' V'+(a.y+a.h+28)+' H'+(b.x+b.w/2)+' V'+(b.y+b.h);}else if(a.y===b.y){const right=b.x>a.x;path='M'+(right?a.x+a.w:a.x)+' '+(a.y+a.h/2)+' H'+(right?b.x:b.x+b.w);}else{const x=a.x+a.w/2,xx=b.x+b.w/2,y=a.y+a.h,yy=b.y;path='M'+x+' '+y+' V'+((y+yy)/2)+' H'+xx+' V'+yy;}return '<path data-edge="'+e.from+'-'+e.to+'" d="'+path+'" stroke="#607c92" stroke-width="2" fill="none" marker-end="url(#arrow)"><title>'+esc(e.label)+'</title></path>'+(e.badge?'<g><rect x="'+(e.badge.x-4)+'" y="'+(e.badge.y-17)+'" width="'+(e.badge.text.length*14+10)+'" height="23" fill="#fff"/>'+txt(e.badge.text,e.badge.x,e.badge.y,14,100)+'</g>':'');}).join('');
let extras='';if(type==='sequence'){extras+=nodes.map(n=>'<path d="M'+(n.x+130)+' 255 V1630" stroke="#c4d0da" stroke-dasharray="5 7"/>').join('');}
extras+=textBlocks.map(b=>b.lines?b.lines.map((x,i)=>txt(x,b.x,b.y+i*27,17,79)).join(''):'<g'+(b.event?' data-step="'+esc(b.event)+'"':' data-contract="C05"')+'><rect x="40" y="'+(b.y-30)+'" width="1360" height="88" fill="#fff" fill-opacity=".94"/>'+txt(b.label+' · '+b.event,55,b.y-8,18,87)+'<path d="M'+b.from+' '+(b.y+10)+' H'+b.to+'" stroke="#3c6888" stroke-width="2" marker-end="url(#arrow)"/>'+txt(b.detail,55,b.y+38,16,84)+'</g>').join('');
const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'" role="img" aria-labelledby="title desc"><title id="title">'+esc(p.name+' '+title)+'</title><desc id="desc">'+esc(p.goal+' · 상세 설명은 본문의 같은 절과 MD에서 확인')+'</desc><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8" fill="#3c6888"/></marker></defs><rect width="1440" height="'+h+'" fill="#fff"/><g font-family="Malgun Gothic, sans-serif" fill="#203a50">'+txt(p.name+' · '+title,40,50,28,46)+txt(p.goal,40,95,20,67)+edgeSvg+nodeSvg+extras+txt('설계 제안 · 로컬 LLM·기존 서버 활용 · 제품/API 구현·처리량·실제 효과 검증 전',40,h-18,15,87)+'</g></svg>';
return {code,type,width:w,height:h,nodes,edges,svg,path:code+'_advanced-'+type+'.svg'};}
module.exports={diagram,types:['runtime','sequence']};
