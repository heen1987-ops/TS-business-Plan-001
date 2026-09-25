const revision=require('./revision47.cjs');
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const types=['concept','overall','service','data','privacy'];
const names={concept:'사업 논리도',overall:'전체 아키텍처',service:'서비스 흐름도',data:'데이터 흐름도',privacy:'개인정보 처리도'};
function diagram(code,type){const r=revision.get(code),p=r.detail,nodes=[],edges=[];const add=(id,x,y,w,h,title,text)=>{nodes.push({id,x,y,w,h,title,text});return id};const edge=(from,to,label='')=>edges.push({from,to,label});let height=760;
 if(type==='concept'){
 add('need',40,160,330,200,'국민·기관의 목적',p.purpose);add('cap',435,160,330,200,'확보할 업무능력',r.oneLine);add('result',830,160,330,200,'확인할 편익',p.metrics.map(m=>m[0]).join(' / '));edge('need','cap','문제 → 능력');edge('cap','result','수행 → 관측');
 add('scope',40,450,530,190,'적용 단위·기존 기반',p.unit+' / '+p.trigger);add('proof',630,450,530,190,'근거와 효과의 경계',p.boundary);edge('cap','scope','업무 구체화');
 }else if(type==='overall'){
 height=1030;add('ui',40,140,1120,115,'01 · 사용자·검토 화면',p.users+' / 사건목록·원문 대조·검토·승인·결과확인');
 add('noa',40,315,540,155,'02 · NOA 업무 수행',p.steps.map(s=>s[0]).join(' → ')+' / 계획판본·과업큐·완료 검증·재계획');
 add('guard',620,315,540,155,'03 · 실행 통제','사건·문서 권한 / 승인 범위 / 도구 인자 검증 / 멱등키 / 결과 대사 / 예외 복구');edge('ui','noa','허용 요청');edge('noa','guard','승인 과업');
 add('know',40,530,350,155,'04 · 지식·로컬 추론','aRDa 연계 후보 / 원문·판본·위치 / 권한 검색 / 로컬 LLM / 사실·추론 구분');
 add('rule',425,530,350,155,'05 · 규칙·분석도구','유효 기준·기간·상태 / 검증된 계산 / 통계·비교조건 / 원천 조회 어댑터');
 add('system',810,530,350,155,'06 · 공식 원천·권한자',r.humanDecision);edge('noa','know','근거 검색');edge('guard','rule','검증 호출');edge('rule','system','승인 요청·조회');
 add('store',40,760,730,130,'07 · 기록·데이터 계층','원문 저장 / 사실·관계 색인 / 사건·계획 DB / 승인·실행 이력 / 공식 결과 참조 / 평가 데이터');
 add('ops',810,760,350,130,'08 · 운영·복구','기존 로컬 서버 / 자원여력 확인 / 모델·규칙 버전 / 권한회수·복원 대사');edge('know','store','근거·판본');edge('system','store','공식 결과');
 }else if(type==='service'){
 height=1190;for(let i=0;i<4;i++){const s=p.steps[i],y=145+i*210;add('in'+i,40,y,245,140,'입력 · '+s[1],i===0?p.trigger:p.steps[i-1][3]);add('work'+i,335,y,505,140,(i+1)+'. '+s[0],s[2]);add('out'+i,890,y,270,140,'결과·확인',s[3]);edge('in'+i,'work'+i,'제공');edge('work'+i,'out'+i,'대조');if(i<3)edge('out'+i,'in'+(i+1),'후속 입력');}
 add('decision',40,1010,1120,135,'공식 판단·예외의 책임',r.humanDecision+' / 변경·누락 시 이전 검토로 돌아가 잔여 과업 갱신');
 }else if(type==='data'){
 height=1050;add('raw',40,145,330,180,'D1 · 허용된 입력',p.inputs.join(' / '));add('extract',435,145,330,180,'P1 · 원문·사실 구조화','문서 식별·판본·해시·문단/표 위치 / case_id·object_key / 결손·상충 표시');add('facts',830,145,330,180,'D2 · 사실·근거 저장','사실값 + source_ref + 적용기간 + 권한 + 확인 수준');edge('raw','extract','수신·최소화');edge('extract','facts','원문 추적');
 add('plan',40,430,330,180,'P2 · 검토·과업 계획',p.steps.map(s=>s[0]).join(' / '));add('approve',435,430,330,180,'D3 · 계획·승인 이력','plan_version·task_id / 승인자·대상·허용행위 / 변경 시 승인 유효성 재검토');add('run',830,430,330,180,'P3 · 승인 도구 수행','조회·계산·요청 / 멱등키·접수 응답 / 실제 결과 재조회');edge('facts','plan','검증된 사실');edge('plan','approve','검토·확정');edge('approve','run','승인된 요청');
 add('result',40,735,530,190,'D4 · 공식 결과·종결',p.outputs.join(' / '));add('eval',630,735,530,190,'D5 · 후속 관측·평가','원 사건·코호트·지표판본 / 분자·분모·결측 / 독립 검토 / B와 C 비교 / 변경 제안');edge('run','result','공식 반영 재조회');edge('result','eval','관측');edge('eval','plan','후속 재검토');
 }else if(type==='privacy'){
 height=940;const rows=[['목적·근거 확인','처리 목적·자료항목·권한·보유기준'],['수신·격리','과다 제출·제3자 정보 분리'],['최소화·가명화',p.privacy],['권한 검색','기관·역할·사건·문서 ACL 적용'],['로컬 추론','필요한 문맥만 사용·외부 자동 우회 금지'],['검토·승인','정보 노출·수신자·판본 검수'],['제공·결과 확인','허용 항목만 전달·반영 대사'],['정정·권리 대응','원천 정정·파생자료 영향 확인'],['보관·파기·복구','보존근거별 처리·회수/삭제 상태 재적용']];rows.forEach((s,i)=>{const row=Math.floor(i/3),col=row%2===0?i%3:2-i%3;add('p'+i,40+col*385,140+row*235,350,165,'P0'+(i+1)+' · '+s[0],s[1]);if(i)edge('p'+(i-1),'p'+i,'확인 후 진행')});
 }
 const wrap=(text,max)=>{const chars=[...String(text)],out=[];for(let i=0;i<chars.length;i+=max)out.push(chars.slice(i,i+max).join(''));return out};
 const text=(s,x,y,size,max)=>wrap(s,max).map((line,i)=>'<text x="'+x+'" y="'+(y+i*(size+9))+'" font-size="'+size+'">'+esc(line)+'</text>').join('');
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="'+height+'" viewBox="0 0 1200 '+height+'" role="img" aria-labelledby="title desc"><title id="title">'+esc(r.name+' '+names[type])+'</title><desc id="desc">'+esc(r.title+' · '+r.oneLine)+'</desc><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8" fill="#65849a"/></marker></defs><rect width="1200" height="'+height+'" fill="#fff"/><g font-family="Malgun Gothic, sans-serif" fill="#263f53">'+text(r.name+' · '+names[type],40,48,27,42)+text(r.title,40,91,20,54)+edges.map(e=>{const a=nodes.find(n=>n.id===e.from),b=nodes.find(n=>n.id===e.to);const horizontal=a.y===b.y;let line;if(horizontal){const x1=b.x>a.x?a.x+a.w:a.x,x2=b.x>a.x?b.x:b.x+b.w;line='M'+x1+' '+(a.y+a.h/2)+' H'+x2;}else if(b.y>a.y){const x1=a.x+a.w/2,x2=b.x+b.w/2,y1=a.y+a.h,y2=b.y,mid=(y1+y2)/2;line='M'+x1+' '+y1+' V'+mid+' H'+x2+' V'+y2;}else{line='M'+(a.x+a.w)+' '+(a.y+a.h/2)+' H1182 V'+(b.y-30)+' H'+(b.x+b.w/2)+' V'+b.y;}return '<path data-edge="'+e.from+'-'+e.to+'" d="'+line+'" stroke="#65849a" stroke-width="2" fill="none" marker-end="url(#arrow)"><title>'+esc(e.label)+'</title></path>'}).join('')+nodes.map(n=>{const titleLines=wrap(n.title,Math.floor((n.w-32)/18)).length,bodyY=30+(titleLines-1)*27+35;let size=15;while(size>10&&bodyY+(wrap(n.text,Math.floor((n.w-32)/size)).length-1)*(size+9)>n.h-12)size--;return '<g data-node="'+n.id+'"><rect x="'+n.x+'" y="'+n.y+'" width="'+n.w+'" height="'+n.h+'" rx="6" fill="#f3f7fa" stroke="#bacfdc"/>'+text(n.title,n.x+16,n.y+30,18,Math.floor((n.w-32)/18))+text(n.text,n.x+16,n.y+bodyY,size,Math.floor((n.w-32)/size))+'</g>';}).join('')+text('설계 제안 · 기존 로컬 서버·로컬 LLM · 업무 권한·실제 제품 구현·처리량 확인 후 적용',40,height-20,14,84)+'</g></svg>';
 return {code,type,nodes,edges,width:1200,height,svg,path:code+'_'+type+'.svg'};
}
module.exports={diagram,types,names};
