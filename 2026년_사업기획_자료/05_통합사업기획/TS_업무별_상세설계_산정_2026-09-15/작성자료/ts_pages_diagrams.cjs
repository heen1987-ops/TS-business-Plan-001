'use strict';
const esc=s=>String(s).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const colors={existing:['#edf1f5','#61768b'],ai:['#e7f5f2','#087f72'],human:['#fff1d4','#946310'],error:['#fff0ee','#b74037'],data:['#edf2fe','#4166a0']};
function wrap(s,max=18){let lines=[];const len=t=>[...t].reduce((a,c)=>a+(/[\x00-\x7f]/.test(c)?.56:1),0);for(const part of String(s).split('\n')){let line='';for(const c of part){if(len(line+c)>max&&!/[?!.,]/.test(c)){let ix=Math.max(line.lastIndexOf(' '),line.lastIndexOf('·'));if(ix>line.length*.4){lines.push(line.slice(0,ix).trim());line=line.slice(ix+1);}else{lines.push(line);line='';}}line+=c;}if(line)lines.push(line.trim());}return lines;}
function node(id,x,y,title,detail,type='ai',w=300,h=160){return {id,x,y,w,h,title,detail,type};}
function graph(p,f,kind){let title='',nodes=[],edges=[],notes=[],w=1240,h=930;const n=(...a)=>nodes.push(node(...a)),e=(from,to,label,route)=>edges.push({from,to,label,route});
 if(kind==='concept'){
 title='서비스 컨셉 · 문제에서 검토 가능한 결과까지';
 const ts=p.n===23?['자료·출처 정리','문제·원인 가설 검토','소관·기존사업·대안']:p.n===17?['기관·점검키 검증','P01 검토 결과 연결','버전·권한 확인']:p.n===22?['이륜차 교재 연결','P21 문답 기능 사용','강사 검토·교안 구성']:p.req.slice(0,3).map(r=>r[0]);
 n('U',40,150,f.actor,'서비스 이용자','existing');n('I',470,150,'입력·업무 맥락',f.input,'data');n('A',900,150,ts[0],'원문·공식 상태 확인');
 n('B',900,385,ts[1],p.n===10?'공식 가용상태·UI/API':'NOA 로컬 LLM + 업무 규칙');n('C',470,385,ts[2],'불확실·상충·예외를 표시');n('H',40,385,'사람의 확인',f.gate,'human');
 n('O',40,620,f.result,'확인된 근거와 함께 제공','data');n('F',470,620,f.official,'공식 절차·승인 권한 유지','human');n('V',900,620,'효과 검증',p.n===23?'근거·대안·수정량·기획 시간':'처리시간·누락·오류·사용성','existing');
 e('U','I','조건·자료');e('I','A','승인 범위');e('A','B','정리 결과');e('B','C','검토 후보');e('C','H','초안·근거');e('H','O','수정·확인');e('O','F','선택·인계');e('F','V','검토 결과');
 notes=['기획 가정 · 기존 시스템·NOA 활용 / 신규 인프라 0원','초록: CCK 추가 구성  ·  노랑: 사람·공식 결정  ·  회색: 기존 업무  ·  파랑: 자료·결과'];
 } else if(kind==='architecture'){
 title='전체 논리 아키텍처 · 기존 TS 서버에서 구성';h=1060;
 n('U',40,150,f.actor,'역할·기관·업무 범위','existing');n('UI',470,150,'업무 화면·검토 작업대',f.result);n('SYS',900,150,'기존 공식 업무 시스템',f.system,'existing');
 n('ACL',40,405,'권한·입력·상태 검증','허용 자료·도구 / 실패 구분');n('NOA',470,405,p.n===17?'P01 기능 연결':p.n===22?'P21 기능 연결':'NOA 업무 실행 구성',p.n===23?'출처→가설→소관→대안':p.req[0][0]);n('API',900,405,'연계·승인된 자료 반입',p.units[3]>0?'조회 / 확인 후 공식 인계':'읽기·검토 자료만 사용');
 n('LLM',40,670,p.n===17||p.n===22?'기존 공통 모델 재사용':'기존 로컬 LLM','문장·근거 기반 초안');n('RAG',470,670,'권한 적용 지식 검색',p.n===6||p.n===8?'원본·검토·전파 구획 분리':p.n===23?'주장·근거·기존사업 대조':f.store,'data');n('AUD',900,670,'최소 감사·승인 기록','권한·버전·수정·호출 이력','data');
 e('U','UI','인증·입력');e('UI','SYS','공식 경로 확인');e('UI','NOA','요청·검토 맥락');e('ACL','NOA','검증된 요청');e('NOA','API','허용 도구 호출');e('API','SYS','권한 범위 연계');e('NOA','RAG','권한·질문');e('RAG','LLM','근거·규칙');e('LLM','ACL','초안 재검증');e('API','AUD','호출 상태');e('RAG','AUD','근거 참조');
 notes=['중앙·하단 구성은 기존 TS 로컬 서버의 논리 모듈이며 새 서버 수량을 뜻하지 않음','NOA API·모델·사용권·현행 시스템 연계는 착수 시 확인 / 외부 모델 호출 없음','반환 결과는 업무 화면에서 검토. 공식 접수·안전 판단·발행은 해당 권한자가 수행'];
 } else if(kind==='user'){
 title='사용자 흐름 · 기본·대안·예외';h=1290;
 n('U1',40,165,'01 진입·목표 설정',f.actor,'existing');n('S1',470,165,'02 조건·권한 확인',f.input);n('O1',900,165,'03 원천 확인',f.system,'existing');
 n('S2',900,425,'04 초안·후보 표시',f.result);n('H1',470,425,'05 검토·선택',f.gate,'human');n('E1',40,425,'보완·재조회',f.exception,'error');
 n('H2',470,700,'06 확정 요청',p.units[3]>0?'이용자 명시 확인 후 인계':'담당자 승인 또는 공식 안내','human');n('O2',900,700,'07 공식 결과 확인',f.official,'existing');n('END',900,985,'08 종료·후속 경로','근거·상태·정정 방법 표시','data');n('E2',40,700,'근거 부족·권한 없음','확정 보류 / 기존 경로 제공','error');
 e('U1','S1','목표·자료');e('S1','O1','허용 범위 조회');e('O1','S2','상태·자료');e('S2','H1','후보·이유');e('H1','E1','아니요 / 오류');e('E1','U1','입력 보존·수정');e('H1','H2','예 / 확인');e('H2','O2','선택·승인');e('O2','END','확인된 결과');e('E1','E2','재확인 불가');
 notes=['도식의 05 단계가 사람의 검토 지점. 오류·미확인 상태를 성공으로 표시하지 않음','로딩·빈 결과·권한 거부·오프라인·타임아웃의 화면 동작은 요구사항 페이지에 정의'];
 } else {
 title='데이터 흐름 · 출처·권한·버전·승인';h=1060;
 n('E1',40,150,'E1 승인된 원천',f.input,'existing');n('P1',470,150,'P1 반입·구조 검증',p.n===23?'이용권한·사건·전재 중복':'대상키·기간·필수 항목');n('D1',900,150,'D1 근거 자료',p.n===6||p.n===8?'보호 구획별 별도 인덱스':p.n===23?'원문 위치·권리·출처군':f.store,'data');
 n('P2',900,410,'P2 근거·규칙 검색','요청자 권한·적용일 필터');n('P3',470,410,'P3 로컬 LLM 구성',p.n===23?'문제·원인 가설·반대 근거':'출처 연결 초안·확인 질문');n('P4',40,410,'P4 검토·수정',f.gate,'human');
 n('D2',40,670,'D2 검토 결과',f.result,'data');n('D3',470,670,'D3 결정·처리 이력',p.n===23?'소관·기존사업·대안 선택':'공식 상태·승인·정정 참조','data');n('D4',900,670,'D4 최소 감사기록','누가·언제·자료버전·행동','data');
 e('E1','P1','허용 자료');e('P1','D1','검증·분리 결과');e('D1','P2','원문·메타정보');e('P2','P3','근거·규칙');e('P3','P4','초안·불확실성');e('P4','D2','검토된 결과');e('D2','D3','승인·선택');e('D3','D4','참조·행동');e('P2','D4','검색·권한 기록');
 notes=['E: 외부 업무 원천 / P: 처리 / D: 논리 저장소 · 물리 DB 수량은 미정','삭제·접근 철회 시 원문·인덱스·캐시·생성물 참조의 갱신·사용중지까지 전파','원문·개인정보는 감사 로그에 반복 저장하지 않음 / 보존 기간은 자료 소유자와 확정'];
 }
 return {id:p.id+'-'+kind,title,nodes,edges,notes,width:w,height:h};
}
function anchor(a,b){let dx=b.x+b.w/2-a.x-a.w/2,dy=b.y+b.h/2-a.y-a.h/2;
 if(Math.abs(dx)>Math.abs(dy)){return dx>0?[[a.x+a.w,a.y+a.h/2],[b.x,b.y+b.h/2]]:[[a.x,a.y+a.h/2],[b.x+b.w,b.y+b.h/2]];}
 return dy>0?[[a.x+a.w/2,a.y+a.h],[b.x+b.w/2,b.y]]:[[a.x+a.w/2,a.y],[b.x+b.w/2,b.y+b.h]];
}
function render(g){let body='';for(const e of g.edges){const a=g.nodes.find(n=>n.id===e.from),b=g.nodes.find(n=>n.id===e.to);if(!a||!b)throw Error('Invalid edge');const pts=e.route||anchor(a,b),[s,t]=[pts[0],pts[pts.length-1]];let x=(s[0]+t[0])/2,y=(s[1]+t[1])/2;let horizontal=s[1]===t[1];if(horizontal)y-=13;else x+=15;const txt=wrap(e.label,16);body+=`<polyline points="${pts.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#6d8495" stroke-width="2.3" marker-end="url(#arrow)"/><text x="${x}" y="${y}" text-anchor="${horizontal?'middle':'start'}" class="edge">${txt.map((l,i)=>`<tspan x="${x}" dy="${i?24:0}">${esc(l)}</tspan>`).join('')}</text>`;}
 for(const n of g.nodes){const [fill,stroke]=colors[n.type]||colors.ai;let title=wrap(n.title,Math.floor(n.w/23)-1),detail=wrap(n.detail,Math.floor(n.w/19)-1);let h=Math.max(n.h,30+title.length*27+detail.length*23);if(h>n.h)throw Error(`Node overflow ${g.id} ${n.id} ${h}`);body+=`<g data-node="${n.id}"><rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="16" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/><text x="${n.x+18}" y="${n.y+31}" class="title" fill="${stroke}">${title.map((l,i)=>`<tspan x="${n.x+18}" dy="${i?27:0}">${esc(l)}</tspan>`).join('')}</text><text x="${n.x+18}" y="${n.y+40+title.length*27}" class="detail">${detail.map((l,i)=>`<tspan x="${n.x+18}" dy="${i?23:0}">${esc(l)}</tspan>`).join('')}</text></g>`;}
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.width} ${g.height}" role="img" aria-labelledby="title desc"><title id="title">${esc(g.title)}</title><desc id="desc">${esc(g.edges.map(e=>e.from+' → '+e.to+'：'+e.label).join('。'))}</desc><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#6d8495"/></marker></defs><style>text{font-family:'Malgun Gothic','Segoe UI',sans-serif}.title{font-size:22px;font-weight:700}.detail{font-size:18px;fill:#334d60}.edge{font-size:16px;fill:#435d70;paint-order:stroke;stroke:#fff;stroke-width:5;stroke-linejoin:round}</style><rect width="100%" height="100%" fill="#fff"/><text x="40" y="52" font-size="28" font-weight="700" fill="#172e42">${esc(g.title)}</text><text x="40" y="88" font-size="18" fill="#587082">${esc(g.id)} · 제안 설계 · 운영 시스템 실측 전</text>${body}${g.notes.map((l,i)=>`<text x="40" y="${g.height-85+i*27}" font-size="17" fill="#425b6c">${esc(l)}</text>`).join('')}</svg>`;
}
module.exports={graph,render,wrap};
