const design=require('./proposal-design.cjs');
const arch=require('./architecture-v2.json');
const titles={concept:'컨셉도',overall:'전체 아키텍처',service:'서비스 아키텍처',data:'데이터 흐름도',privacy:'개인정보 처리도'};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
function wrap(s,width,max=5){let lines=[],line='',size=0;for(const ch of String(s||'')){const v=/[\x00-\x7f]/.test(ch)?.55:1;if(ch==='\n'||size+v>width){lines.push(line);line='';size=0;if(ch==='\n')continue;}line+=ch;size+=v;}if(line)lines.push(line);if(lines.length>max){lines=lines.slice(0,max);lines[max-1]=lines[max-1].replace(/.{2}$/,'')+'…';}return lines;}
function diagram(code,type){const c=design.context(code);if(!c||!titles[type])throw Error('도식 대상 오류');const {d,p,u,v}=c,W=1440,H={concept:1000,overall:1310,service:1400,data:1270,privacy:1550}[type];let backgrounds=[],shapes=[],routes=[],labels=[],nodes=[],edges=[];
const text=(x,y,s,size=22,color='#183b55',weight=400)=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${weight}">${esc(s)}</text>`;
const lines=(x,y,s,width,max=4,size=21,color='#3e596b')=>wrap(s,width,max).map((t,i)=>text(x,y+i*(size+9),t,size,color)).join('');
function node(id,x,y,w,h,title,body='',tone='blue',kind='box'){const palette={blue:['#f0f7fc','#387fa8'],teal:['#edf8f6','#238274'],amber:['#fff8e8','#a77422'],grey:['#f4f6f8','#6b7d8d'],red:['#fff1ee','#a64b3c']}[tone];nodes.push({id,title,body,x,y,w,h});let s='';if(kind==='iso')s+=`<path d="M${x} ${y+18}l${w-24} -18 24 14 -${w-24} 18Z" fill="${palette[1]}" opacity=".24"/><path d="M${x+w-24} ${y+32}l24 -18v${h-32}l-24 18Z" fill="${palette[1]}" opacity=".35"/>`;s+=`<rect x="${x}" y="${y+(kind==='iso'?32:0)}" width="${w-(kind==='iso'?24:0)}" height="${h-(kind==='iso'?32:0)}" rx="8" fill="${palette[0]}" stroke="${palette[1]}" stroke-width="2"/>`;const top=y+(kind==='iso'?32:0);const titleSize=h<=80?19:23;s+=lines(x+18,top+31,title,(w-40)/titleSize,2,titleSize,'#153c56');const n=wrap(title,(w-40)/titleSize,2).length;const bodyLines=Math.max(0,1+Math.floor((h-(top-y)-42-n*31)/29));if(bodyLines)s+=lines(x+18,top+37+n*31,body,(w-40)/20,bodyLines,20);shapes.push(`<g data-node="${esc(id)}">${s}</g>`);return id;}
function arrow(from,to,label='',side='bottom',color='#618296',way=[]){const a=nodes.find(n=>n.id===from),b=nodes.find(n=>n.id===to);if(!a||!b)throw Error('도식 연결 ID 오류');let start,end;if(side==='right'){start=[a.x+a.w,a.y+a.h/2];end=[b.x,b.y+b.h/2]}else if(side==='left'){start=[a.x,a.y+a.h/2];end=[b.x+b.w,b.y+b.h/2]}else{start=[a.x+a.w/2,a.y+a.h];end=[b.x+b.w/2,b.y]}const pts=[start,...way,end];routes.push(`<polyline points="${pts.map(x=>x.join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="2.5" marker-end="url(#arrow)"/>`);if(label){const mid=way[0]||[(start[0]+end[0])/2,(start[1]+end[1])/2];const lw=[...label].reduce((n,ch)=>n+(/[\x00-\x7f]/.test(ch)?10:18),0),lx=Math.max(20,Math.min(W-lw-20,mid[0]-lw/2));labels.push(`<rect x="${lx-4}" y="${mid[1]-17}" width="${lw+8}" height="25" rx="3" fill="white"/>`+text(lx,mid[1]+2,label,17,color));}edges.push({from,to,label});}
function band(y,title,detail){shapes.push(text(44,y,title,22,'#275e7e',700));if(detail)shapes.push(text(410,y,detail,18,'#526e80'));}
function boundary(x,y,w,h,label){shapes.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="none" stroke="#a9bfcc" stroke-width="2" stroke-dasharray="7 5"/>`+text(x+17,y+28,label,18,'#4b6a7c'));}
if(type==='concept'){
 backgrounds.push(`<path d="M700 168L1320 475 710 790 85 475Z" fill="#f2f7fa" stroke="#dbe8ef" stroke-width="2"/>`);
 node('need',60,192,390,204,'01 · 국민·기업의 필요',d.beneficiary,'blue','iso');
 node('mission',520,120,445,215,'02 · '+d.name,p.mission,'teal','iso');
 node('work',990,288,390,218,'03 · 업무 한 건',d.object+'\n'+u.modules[0].name,'blue','iso');
 node('noa',470,448,455,230,'04 · NOA 기반 업무 전환',u.modules.map(m=>m.name).join(' → '),'teal','iso');
 node('human',60,575,350,195,'05 · 전문 판단·공식 처리',d.user,'amber','iso');
 node('benefit',985,630,395,202,'06 · 확인할 공공 편익',v.metrics.map(m=>m.title).join(' / '),'teal','iso');
 arrow('need','mission','업무 목적','right','#618296',[[482,300],[482,225]]);
 arrow('mission','work','대상 구체화','right','#618296',[[982,230],[982,398]]);
 arrow('work','noa','자료·변경 반영','left','#618296',[[955,402],[955,555]]);
 arrow('noa','human','검토·승인','left');arrow('noa','benefit','결과 검증','right','#238274',[[952,563],[952,730]]);
 band(890,'컨셉의 핵심',d.object+'의 근거·과업·공식 결과를 연결');
 shapes.push(lines(44,925,'성과 확인: '+v.metrics.map(m=>m.title).join(' / '),64,2,22));
}else if(type==='overall'){
 band(137,'이용자·기존 업무','외부 참여자의 제출 / 내부 담당자의 검토 / 공식 원천의 책임 유지');
 node('user',44,160,420,120,'업무 사용자',d.user);node('source',509,160,420,120,'기존 공식 시스템',d.system,'grey');node('authority',974,160,420,120,'공식 권한·현장',u.authority,'amber');
 boundary(24,320,1392,702,'TS 내부 · 기존 서버의 논리 구성 / aRDa·NOA 적용·확장 설계');
 const groups=[['C01','C02','C03','C04'],['C05','C06','C07','C08'],['C09','C10','C11','C12']];
 groups.forEach((ids,r)=>ids.forEach((id,k)=>{const m=arch.common.find(x=>x.id===id);node(id,44+k*343,377+r*170,320,132,m.id+' · '+m.name,m.responsibility,r===2?'amber':r===1?'teal':'blue')}));
 arrow('user','C01','세션·사건');arrow('source','C02','허용 반입','bottom','#618296',[[719,302],[548,302]]);arrow('authority','C09','유효 승인','bottom','#a77422',[[1404,300],[1404,698],[204,698]]);
 groups.forEach(row=>row.slice(0,-1).forEach((id,i)=>arrow(id,row[i+1],'','right')));
 arrow('C04','C05','근거 → 계획','bottom','#238274',[[1233,531],[204,531]]);arrow('C08','C09','검증 → 승인','bottom','#a77422',[[1233,703],[204,703]]);
 band(920,'처별 업무모듈','공통 엔진을 업무 규칙·지식·판단조건으로 구체화');
 u.modules.forEach((m,i)=>node(m.id,44+i*343,944,320,66,m.id+' · '+m.name,'','teal'));
 band(1060,'저장·연계·운영','공식 원장과 검토 원장 구분 / 원시스템 변경은 승인·대사 관문 경유');
 arch.stores.forEach((s,i)=>node(s.id,44+i*228,1082,206,140,s.id+' · '+s.name,['C02·C03 수신·변환','C04 권한 검색','C05·C06 계획·실행','C08 규칙·계약','C09·C10 승인·대사','C11 감사·평가'][i],'grey'));
 u.modules.forEach((m,i)=>arrow('C12',m.id,'','bottom','#238274',[[1233,884],[204+i*343,884]]));
 u.modules.forEach((m,i)=>{for(const id of m.stores){const n=nodes.find(x=>x.id===id);arrow(m.id,id,'','bottom','#859daa',[[204+i*343,1031],[n.x+n.w/2,1031]])}});
 shapes.push(text(44,1273,'C07 로컬 LLM · C08 검증된 계산/규칙 · C10 연계 실패 시 결과 조회·대사 · C11 감사/평가',19,'#526e80'));
}else if(type==='service'){
 const xs=[44,388,732,1076],names=['제출자·현업','NOA·근거/추론','검토·승인권자','기존 시스템·결과'];
 names.forEach((n,i)=>{backgrounds.push(`<rect x="${xs[i]}" y="152" width="320" height="1120" fill="${i%2?'#f3f8fb':'#fafbfc'}" stroke="#d9e4eb"/>`+text(xs[i]+18,187,n,23,'#254f6b',700));});
 const steps=design.stages(c),positions=[[0,223],[1,338],[1,493],[2,650],[1,807],[3,807],[1,998],[2,1150]];
 steps.forEach((s,i)=>{const [col,y]=positions[i];node(s[0],xs[col]+10,y,300,i===0?94:i===7?104:118,s[0]+' · '+s[2],i===1?u.modules[0].name:i===2?u.modules[1].name:i===4?u.modules[3].name:i===6?u.modules[2].name:i===7?'업무책임자·평가자 / 종결 근거·후속 책임':s[4],i===3?'amber':i===5?'grey':'blue')});
 arrow('S01','S02','資料 반입'.replace('資料','자료'));arrow('S02','S03','판본·결손');arrow('S03','S04','계획·근거');arrow('S04','S05','승인된 인자');arrow('S05','S06','요청 → 접수','right');arrow('S06','S07','공식 결과','bottom','#618296',[[1236,963],[892,963],[892,976],[548,976]]);arrow('S07','S08','해소·잔여과업');
 node('hold',xs[2]+10,360,300,130,'보완·판정 대기',d.exception,'red');arrow('S02','hold','불일치','right','#a64b3c');
 node('replan',xs[2]+10,1010,300,110,'변경·재계획',u.modules[2].name+' / 승인 영향 확인','amber');arrow('S07','replan','변경 발견','right','#a77422');arrow('replan','S03','새 계획판본','bottom','#a77422',[[1058,1132],[1058,620],[714,620],[714,474],[548,474]]);
 shapes.push(lines(44,1320,'종결 조건: '+p.closure,65,2,21));
}else if(type==='data'){
 band(139,'원천 → 구조화 근거 → 업무 상태 → 공식 결과','자료의 판본·대상·기간과 처리계보를 모든 변환에서 유지');
 node('origin',44,173,395,147,'공식 원천·제출 자료',d.system+'\n'+d.fields.slice(0,3).join(' / '),'grey');
 node('ingest',522,173,395,147,'C02·C03 수신·변환',u.modules[0].name+' / 해시·문단·표·결손');
 node('DS1',998,173,395,147,'DS1 · 원문·판본','source_id / version / hash / 목적·ACL','grey');
 arrow('origin','ingest','허용 사본','right');arrow('ingest','DS1','원문 연결','right');
 node('DS2',44,422,395,166,'DS2 · 검색·임베딩','문서·문단 위치 + ACL판본 + 이용목적\n회수·정정 시 재색인','grey');
 node('plan',522,422,395,166,'C04·C05·C07 근거·계획',u.modules[1].name+' / '+u.modules[2].name,'teal');
 node('DS3',998,422,395,166,'DS3 · 사건·계획','case_id / 대상키 / plan_version\n근거와 질문·완료조건','grey');
 arrow('ingest','DS2','추출·색인');arrow('DS2','plan','권한 검색','right');arrow('plan','DS3','검토 상태','right');
 node('DS4',44,681,395,153,'DS4 · 규칙·도구 계약','입력 허용목록 / 정형계산 / 스키마\n모델·도구·규칙 판본','grey');
 node('execute',522,681,395,153,'C08·C09·C10 검증·실행',u.modules[3].name+' / approval_ref / action_id','amber');
 node('official',998,681,395,153,'기존 시스템의 공식 기록','요청과 접수·공식 처리 상태 구분\nreceipt_id / 대상·판본·결과','grey');
 arrow('plan','execute','계획 검수');arrow('DS4','execute','검증 규칙','right');arrow('execute','official','승인 요청','right');
 node('DS6',44,950,395,175,'DS6 · 감사·평가','접근·차단·승인·정정·파기 이력\n기준선·사건 분모·평가 근거','grey');
 node('reconcile',522,950,395,175,'C10·C11 결과 대사','공식 결과와 대상·계획·요청 대조\n불일치 → 재확인·재계획','teal');
 node('DS5',998,950,395,175,'DS5 · 승인·실행·대사','승인해시 / 멱등키 / 요청·접수증\n처리결과 미확인 별도 관리','grey');
 arrow('official','DS5','공식 결과');arrow('DS5','reconcile','수신 증거','left');arrow('reconcile','DS6','평가·감사','left');arrow('execute','reconcile','실행 참조');
 shapes.push(lines(44,1192,'원천 정정 → 영향 자료 식별 → 재색인·계획 재검토 → 승인 영향 확인. 수집시점과 효력시점의 구분.',66,2,21));
}else{
 band(140,'최소자료·업무 경계',d.name+' / '+d.object+' 중심의 처리 설계');
 const brief=[p.minimum,p.identity,p.sensitive];brief.forEach((s,i)=>node('scope'+i,44+i*457,165,432,149,['필요한 업무자료','식별정보 포함 시','처별 보호대상'][i],s,i===1?'amber':'grey'));
 const labels=[
['P01','목적·근거 등록','법적근거·항목·보유기준 / 미확정 보류'],
['P02','수신·격리','출처·판본·과다제출·제3자 정보'],
['P03','최소화·식별 분리','불필요한 식별 제거 / 포함 시 제한관리'],
['P04','권한 검색','ACL·사건·목적 / 회수 즉시 차단'],
['P05','로컬 추론','필요 문맥만 / 학습 목적 별도 확인'],
['P06','산출물 검수','다른 사건·식별정보·재식별 위험'],
['P07','연계·제공','수신자·목적·항목·유효 승인'],
['P08','권리행사·정정','본인확인 → 공식 원천 → 재색인·회신'],
['P09','보관·파기','보존 근거·기산점·종료조건 확인'],
['P10','복원·잔존 확인','삭제·회수·정정 재적용 → 재노출 점검']];
const pos=[[44,385],[518,385],[992,385],[44,625],[518,625],[992,625],[44,865],[518,865],[992,865],[518,1240]];
labels.forEach((a,i)=>node(a[0],pos[i][0],pos[i][1],402,142,a[0]+' · '+a[1],a[2],i===8?'amber':i===9?'red':'teal'));
node('hold',44,1240,402,142,'근거 확인·반입 보류','확정자료만 수신 / 보완·제한 이유 설명','red');
node('delete',1008,1080,185,112,'파기','원문·파생 잔존 확인','red');
node('retain',1210,1080,185,112,'제한보관','근거 있는 보존','amber');
arrow('P01','P02','확인','right');arrow('P02','P03','최소화','right');
arrow('P03','P04','분석용 자료','bottom','#618296',[[1193,574],[245,574]]);
arrow('P04','P05','허용 근거','right');arrow('P05','P06','생성 결과','right');
arrow('P06','P07','검수 결과','bottom','#618296',[[1193,812],[245,812]]);
arrow('P07','P08','요청·정정','right');arrow('P08','P09','목적 종료','right');
arrow('P09','delete','파기 대상');arrow('P09','retain','보존 필요','bottom','#a77422',[[1399,1038],[1302,1038]]);
arrow('delete','P10','파기 이력','bottom','#618296',[[1100,1216],[719,1216]]);
arrow('retain','P10','보존·회수 이력','bottom','#a77422',[[1302,1229],[719,1229]]);
arrow('P01','hold','미확정','bottom','#a64b3c',[[20,550],[20,1219],[245,1219]]);
arrow('P08','P04','정정 전파','bottom','#238274',[[488,1031],[488,602],[245,602]]);
shapes.push(lines(44,1440,'식별정보는 포함된 경우에만 별도 제한관리 / 개인정보 없는 집계·기기자료에 식별 DB 추가 불필요',69,2,20));
shapes.push(text(44,1507,'P01~P10은 법 조항이 아닌 처리ID. 아래 전주기 처리표와 대응. 실제 처리주체·보유기간·제공관계는 기관 기준 대조 후 확정.',19,'#526e80'));

}
const summary={concept:p.mission,overall:'12개 공통기능·4개 처별 모듈·6개 논리 저장소와 공식 원천·권한자의 책임 경계',service:'8단계 업무 흐름과 자료 보완·사람 승인·공식 결과 대사·재계획의 분기',data:d.fields.join(' · ')+'를 중심으로 원천·파생·계획·승인·결과의 계보 연결',privacy:p.minimum+' 원천부터 파생물·권리행사·파기·제한보관·복원까지의 통제'}[type];
const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc"><title id="title">${esc(d.name+' '+titles[type])}</title><desc id="desc">${esc(summary)}</desc><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#618296"/></marker></defs><rect width="${W}" height="${H}" fill="white"/><g font-family="Malgun Gothic, Noto Sans KR, sans-serif">${text(44,47,code+' · '+d.name,21,'#28708f',700)}${text(44,89,titles[type],32,'#183b55',700)}${text(890,48,'기획·설계안 / 구현·기관 승인 전 / '+design.date,17,'#577080')}${backgrounds.join('')}${routes.join('')}${shapes.join('')}${labels.join('')}</g></svg>`;
return {svg,summary,title:d.name+' · '+titles[type],nodes,edges,width:W,height:H,type,code,path:'downloads/proposals/'+code+'_'+type+'.svg'};
}
module.exports={diagram,types:Object.keys(titles)};
