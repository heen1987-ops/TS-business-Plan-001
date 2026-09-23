const fs=require('fs'),path=require('path');const temp=__dirname;function edit(file,fn){const p=path.join(temp,file),s=fs.readFileSync(p,'utf8');const t=fn(s);if(t===s)throw Error('변경 지점 없음 '+file);fs.writeFileSync(p,t,'utf8');}
edit('p23v12_data.cjs',s=>s.replace('via:[[1425,435],[1425,965]]','via:[[1425,435],[1425,965]],labelAt:[1390,580]').replace('via:[[1415,240],[1415,755]]','via:[[1415,240],[1415,755]],labelAt:[1395,605]').replace('via:[[1415,1020],[1415,755]],dashed:true','via:[[1415,1020],[1415,755]],labelAt:[1395,910],dashed:true'));
edit('p23v12_build.cjs',s=>s.replace("const color=e.error?", "let anchor=vertical?'start':'middle';if(e.labelAt){[lx,ly]=e.labelAt;anchor=e.labelAnchor||'end';}else{const estimated=[...e.label].reduce((v,c)=>v+(/[\\x00-\\x7f]/.test(c)?10:18),0);if(vertical&&lx+estimated>g.width-18){lx=g.width-18;anchor='end';}}const color=e.error?")
 .replace('text-anchor="${vertical?\'start\':\'middle\'}"','text-anchor="${anchor}"')
 .replace('class="scenario-bar" aria-label','class="scenario-bar" data-mode="normal" aria-label')
 .replace('write(\'assets/visual.css\',css);',`write('assets/visual.css',css+".mapBack{display:none}@media(max-width:850px){.intro{font-size:14px;line-height:1.6}.badge{margin-top:9px;padding:4px 9px}.nav{margin:17px 0}.scenario-bar{padding:10px}.scenario-bar[data-mode=normal] .scenario-message{display:none}.scenario-bar strong{display:none}.mapbar strong{font-size:15px}.mapBack{display:inline-block}}");`)
 .replace('write(\'diagrams/\'+g.id+\'.svg\',diagram);',`write('diagrams/'+g.id+'.svg',diagram.replace(/role="button" tabindex="0"/g,'role="group"').replace(/ 상세보기/g,'').replace('각 단계를 선택하면 입출력·담당자·보완 경로를 볼 수 있습니다.','정적 도식 원본입니다. 상세 입출력은 HTML 설명페이지에서 확인합니다.').replace('cursor:pointer','cursor:default'));`));
edit('p23v12_visual.js',s=>s.replace("' 图中粗边框'.replace('图中粗边框',' 굵은 테두리는 관련 단계입니다.')","' 굵은 테두리는 관련 단계입니다.'")
 .replace('function select(id){','function select(id,user=false){')
 .replace('showDetail(n,graph);}',"showDetail(n,graph);if(user&&innerWidth<850)detail.scrollIntoView({behavior:'instant',block:'start'});}")
 .replaceAll('select(n.dataset.node);','select(n.dataset.node,true);')
 .replace('select(e.target.value)','select(e.target.value,true)')
 .replace('scenario=b.dataset.scenario;const s=',"scenario=b.dataset.scenario;document.querySelector('.scenario-bar').dataset.mode=scenario;const s=")
 .replace("'<div class=\"related\" id=\"related\"></div>'", "'<a class=\"mapBack\" href=\"#canvas\">도식으로 돌아가기 ↑</a><div class=\"related\" id=\"related\"></div>'"));
edit('p23v12_qa.cjs',s=>s.replaceAll('h1唯一','주제목 1개').replaceAll('连接','연결').replaceAll('端点','선 끝점').replace("ck('노드 글자 경계 '+g.id,bounds.length===0,bounds);",`ck('노드 글자 경계 '+g.id,bounds.length===0,bounds);const edgeBounds=await page.evaluate(()=>{const svg=document.querySelector('.canvas svg'),v=svg.viewBox.baseVal;return [...svg.querySelectorAll('.edge text')].flatMap(t=>{const b=t.getBBox();return b.x<0||b.x+b.width>v.width||b.y<0||b.y+b.height>v.height?[{text:t.textContent,x:b.x,y:b.y,w:b.width,h:b.height}]:[];});});ck('연결 설명 잘림 없음 '+g.id,edgeBounds.length===0,edgeBounds);`));
console.log('도식 연결 문구 위치·모바일 상세 이동·검증 문구를 보완했습니다.');
