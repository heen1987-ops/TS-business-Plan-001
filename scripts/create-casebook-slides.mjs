// Copy into qa-output/slides/build and run with the bundled node_modules.
// Arguments: repository root, presentation skill directory, bundled Python executable.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {Presentation,PresentationFile,FileBlob} from '@oai/artifact-tool';
import {GlobalFonts,createCanvas} from '@napi-rs/canvas';
const [root,skill,python]=process.argv.slice(2),require=createRequire(path.join(root,'package.json'));
const ax=require('./src/ax-casebook.cjs'),pf=require('./src/platform-casebook.cjs'),designs=require('./src/case-designs.cjs'),insights=require('./src/case-insights.cjs'),followup=require('./src/strategy-followup.cjs');
const build=process.cwd(),workspace=path.dirname(build),edition='v8',finalDir=path.join(workspace,'final-'+edition);
GlobalFonts.registerFromPath(path.join(build,'Pretendard-Regular.otf'),'Pretendard');
GlobalFonts.registerFromPath(path.join(build,'Pretendard-Bold.otf'),'Pretendard');
const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')).href);
await fs.mkdir(finalDir,{recursive:true});
const ink='#28352B',muted='#687369',accent='#42634B',line='#D4DDD5',paper='#FAFBF8',ctx=createCanvas(1,1).getContext('2d');
const manifest={edition,updated:'2026-10-16',fingerprint:crypto.createHash('sha256').update(JSON.stringify({ax,pf,designs,insights,followup:followup.plans})).digest('hex'),decks:[]};
function wrap(content,w,size,bold){ctx.font=`${bold?'bold ':''}${size}px Pretendard`;return String(content).split('\n').flatMap(par=>{let rows=[],row='';for(const c of par){if(ctx.measureText(row+c).width>(w-4)/1.18&&row){rows.push(row);row=c;}else row+=c;}rows.push(row);return rows;});}
function text(s,content,x,y,w,h,size=23,bold=false,color=ink,min=17){let rows;for(;;){rows=wrap(content,w,size,bold);if(rows.length*size*1.28<=h)break;if(size<=min)throw Error('Text fit: '+String(content).slice(0,100));size--;}
 const q=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});q.text=rows.join('\n');q.text.style={fontSize:size,typeface:'Pretendard',color,bold,autoFit:'none',verticalAlignment:'top',wrap:'square'};q.text.insets=0;return q;}
function rule(s,y,x=60,w=1160){s.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:1},fill:line,line:{fill:'none',width:0}});}
function slide(p,title,kicker,notes){const s=p.slides.add();s.background.fill=paper;text(s,kicker,60,30,1160,28,17,false,muted);text(s,title,60,77,1160,88,36,true,ink,32);rule(s,650);text(s,'CCK / TS 2027  / 2026.10.16',60,668,1020,25,15,false,muted,15);text(s,String(p.slides.items.length).padStart(2,'0'),1160,668,60,25,15,false,muted,15);s.speakerNotes.text=notes;return s;}
function section(s,label,body,x,y,w,h,size=23){text(s,label,x,y,w,30,21,true,accent);text(s,body,x,y+37,w,h-37,size);}
function notesFor(c){const d=designs.byId[c.id];return JSON.stringify({case:c,design:d,factors:insights.byId[c.id]},null,2)+'\n\n출처\n'+d.sources.map(v=>v.title+' '+v.url).join('\n')+'\n홈페이지 https://heen1987-ops.github.io/TS-business-Plan-001/index.html?view='+(c.id.startsWith('AX')?'casebook':'platform-cases')+'&case='+c.id;}
function analysis(p,c){const d=designs.byId[c.id],s0=insights.byId[c.id],failed=c.result==='실패'||c.id==='PF31';const s=slide(p,c.title,c.id+' / '+(c.state||c.result)+' / '+c.region,notesFor(c));
 section(s,'추진 배경·대상 업무',d.narrative[0],60,180,560,206,22);
 section(s,'구현 방식·업무 변화',d.narrative[1],60,402,560,232,22);
 section(s,'CCK 관점의 시사점',d.narrative[2],670,180,550,166,21);
 section(s,'추가 개발',c.delta,670,356,550,86,21);
 section(s,'검수 반영',c.test,670,451,550,92,21);
 section(s,'기대효과 지표',c.metric||c.effect,670,552,550,82,20);
 s.speakerNotes.text+='\n한계: '+c.limit+'\n'+(failed?'재발 방지 조건: '+s0.success.join(' / '):'실패 위험: '+s0.risks.join(' / '));
 // The material status remains visible; detailed evidence and limits remain in the notes and web source.
 text(s,c.limit,60,143,1160,32,14,false,muted,14);
}
function requirements(p,c){const d=designs.byId[c.id];for(let start=0;start<d.requirements.length;start+=3){const rows=d.requirements.slice(start,start+3),s=slide(p,c.title+' · RFP 요구사항',c.id+' / '+d.basis+' / '+(start+1)+'–'+(start+rows.length),notesFor(c));rows.forEach((r,i)=>{const y=184+i*153;rule(s,y-8);text(s,r.id+' '+r.title,60,y,1160,32,21,true,accent);text(s,r.summary,60,y+40,550,98,21);text(s,r.components.join(' · ')+' / 검수 설계\n'+r.acceptance,665,y+40,555,98,20);});}}
async function originals(p,c){const d=designs.byId[c.id];for(const f of d.service.figures){const s=slide(p,f.title,c.id+' / '+f.status+' / 원문 삽입도 추출',notesFor(c)+'\n원문 도면 '+JSON.stringify(f));s.images.add({blob:new Uint8Array(await fs.readFile(path.join(root,'public',f.path))),contentType:'image/png',alt:f.title,fit:'contain',position:{left:60,top:174,width:1160,height:440}});text(s,f.caption,60,621,1160,24,17,false,muted,17);}}
function architecture(p,c){const d=designs.byId[c.id],a=d.service,s=slide(p,c.title+' · 세부 서비스 구조',c.id+' / '+a.status,notesFor(c));
 text(s,a.facts.locator,60,151,1160,26,16,false,muted,16);const boxes=[];
 const positions=a.components.map((n,i)=>({x:60+(i<4?i:i<8?7-i:i-8)*296,y:i<4?194:i<8?345:496}));
 for(let i=0;i<12;i++){const n=a.components[i],{x,y}=positions[i];boxes.push(s.shapes.add({geometry:'rect',position:{left:x,top:y,width:272,height:112},fill:i>7?'#F1F4ED':'#FFFFFF',line:{fill:line,width:1}}));text(s,n.id+' / '+n.layer,x+14,y+12,244,25,16,false,muted,16);text(s,n.title,x+14,y+49,244,56,22,true,accent,19);}
 for(let i=0;i<7;i++){const down=i===3,right=i<3;s.shapes.connect(boxes[i],boxes[i+1],{kind:'straight',fromSide:down?'bottom':right?'right':'left',toSide:down?'top':right?'left':'right',line:{fill:accent,width:2},tail:{type:'arrow'}});}
 for(const [i,j] of [[8,9],[9,10]])s.shapes.connect(boxes[i],boxes[j],{kind:'straight',fromSide:'right',toSide:'left',line:{fill:'#9A8A65',width:1},tail:{type:'arrow'}});
 text(s,'데이터 C11 → 조회 C03 / 정책 C12 → 문맥 C02·검증 C05 / 결과 C08 → 운영 환류',60,622,1160,24,17,false,muted,17);
}
function serviceFlow(p,c){const d=designs.byId[c.id],a=d.service,s=slide(p,c.title+' · 데이터와 예외 처리',c.id+' / 논리 인터페이스·복구 설계',notesFor(c));
 text(s,'요청·처리·결과의 전달',60,176,560,30,22,true,accent);text(s,'예외·복구 경로',665,176,555,30,22,true,accent);
 a.interfaces.forEach((f,i)=>{const y=222+i*66;text(s,f.id+' '+f.mode,60,y,155,26,19,true,accent);text(s,f.payload,230,y,390,58,20,false,ink,17);if(i<5)rule(s,y+59,60,560);});
 const v=[['감지',a.exception.input],['보류·확인',a.exception.hold],['보정·재검증',a.exception.recovery],['종료 증빙',a.exception.evidence]];
 v.forEach(([label,body],i)=>section(s,label,body,665,222+i*101,555,93,21));
}
function benchmark(p,c){const d=designs.byId[c.id],f=insights.byId[c.id],b=d.benchmark,s=slide(p,c.title+' · 벤치마킹',c.id+' / '+b.label,notesFor(c));
 section(s,c.result==='실패'||c.id==='PF31'?'재발 방지 조건':'성공·성립 조건',f.success.join('\n'),60,190,550,150,24);
 section(s,c.result==='실패'||c.id==='PF31'?'실패 요인·시정 쟁점':'실패 위험·한계',f.risks.join('\n'),60,360,550,150,24);
 section(s,'통제 지점',f.control,60,530,550,100,22);
 section(s,'정상 과업',b.normal,665,190,555,135,24);
 section(s,'예외 입력',b.exception,665,345,555,125,24);
 section(s,'판정·증빙',b.evidence,665,490,555,140,24);
}
function cover(p,platform){const title=platform?'AI 플랫폼 구축 사례집':'12대 전략과제 AX 사례집',s=slide(p,title,'GROWTH AI / TS ORGANIZATION-NATIVE AI','홈페이지와 동일한 사례·분석·요구사항 데이터 사용.\n사실과 요구사항은 출처 기준. 아키텍처의 연결·운영 환류는 CCK 논리 설계. 실제 설치 배치도와 구분.');text(s,platform?'조직 기반과 업무 서비스의 구성':'부서·업무에 연결한 후속 적용계획',60,260,1160,100,40,true,accent,32);text(s,platform?'31개 상세 사례 / RFP 확보 10개\n원문 도면 13개 / 세부 서비스·데이터·예외 흐름':'26개 상세 사례 / 12개 전략 후속계획\n사례별 세부 구조·예외 처리·개발·검수·효과',60,420,1160,110,27);text(s,'공개자료·RFP 기반 CCK 분석 및 적용 설계',60,584,1160,40,21,false,muted);}
function plan(p,m){const depts=m.departments;for(let start=0;start<depts.length;start+=4){const batch=depts.slice(start,start+4),s=slide(p,m.plan,m.id+' / TS 담당 부서·실제 업무 / '+m.phase,JSON.stringify(m,null,2));text(s,m.strategy,60,159,1160,32,21,false,accent);
 batch.forEach((b,i)=>{const y=210+i*105;rule(s,y-10);text(s,b.name,60,y,235,32,23,true,accent);text(s,b.job,60,y+39,235,55,18);text(s,b.workItems.length?b.workItems.map(w=>w.text).join('\n'):b.status,330,y,890,92,21);});text(s,'직제시행세칙 2026.06.30 / 참여·협업 역할은 적용 설계',60,626,1160,23,16,false,muted,16);}
 const s=slide(p,m.plan,m.id+' / CCK 재사용·추가 개발·검수·기대효과',JSON.stringify(m,null,2));
 section(s,'CCK 재사용 후보',m.reuseItems.map(r=>r.use).join('\n'),60,184,550,135,23);
 section(s,'추가 개발',m.deliverables.join('\n'),60,337,550,125,23);
 section(s,'기대효과',m.effect+'\n'+m.formula,60,480,550,152,22);
 section(s,'검수 입력',m.acceptancePlan.sample,665,184,555,111,23);
 section(s,'판정 기준',m.acceptancePlan.criterion,665,307,555,127,23);
 section(s,'제출 증빙',m.acceptancePlan.evidence,665,446,555,107,22);
 text(s,m.requirement+' / '+m.test,665,572,555,30,19,true,accent);text(s,'검수 설계안·미실행 / 기대효과 TS 실측 전',665,610,555,24,16,false,muted,16);
 s.speakerNotes.text+='\nCCK-01: NOA 사용자 가이드 확인. 설치본 기능시험 필요.\nCCK-02/03: 명세 기반 재사용 후보. 실물 기능검증 필요.\n기존 SSO·RAG·권한·로그·연계 범위 대조 후 추가분 산정.';
}
for(const kind of ['platform','ax']){
 const p=Presentation.create({slideSize:{width:1280,height:720}});p.theme.defaultFont='Pretendard';cover(p,kind==='platform');const cases=kind==='platform'?pf.cases:ax.cases;
 const index=[];for(const c of cases){index.push({id:c.id,slide:p.slides.items.length+1});analysis(p,c);requirements(p,c);await originals(p,c);architecture(p,c);serviceFlow(p,c);benchmark(p,c);}
 const plans=kind==='platform'?[followup.byId['ST-04']]:followup.plans;
 for(const m of plans)plan(p,m);
 if(kind==='platform'){const s=slide(p,'부서별 후속 적용의 연결','12대 전략 / 공통 기반 인수 후 업무 특화','전체 후속계획 https://heen1987-ops.github.io/TS-business-Plan-001/index.html?view=casebook&tab=strategy');followup.plans.forEach((m,i)=>{const col=i<6?0:1,row=i%6; text(s,m.id+' '+m.plan,60+col*600,195+row*70,560,60,23);});}
 const name='ts-'+(kind==='platform'?'platform':'ax')+'-casebook',candidate=path.join(build,name+'-'+edition+'.pptx'),final=path.join(finalDir,name+'.pptx');await(await PresentationFile.exportPptx(p)).save(candidate);
 await finalizePresentation({workspaceDir:workspace,candidatePath:candidate,finalPath:final,pythonExecutable:python,integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],requiredNativeTableOwnerSlides:[],fontPolicy:{basis:'user_request',families:['Pretendard']},verifyArtifactToolImport:true,receiptPath:path.join(build,name+'-'+edition+'.validation.json')});
 const finalDeck=await PresentationFile.importPptx(await FileBlob.load(final));const renderDir=path.join(workspace,kind+'-render-'+edition);await fs.mkdir(renderDir,{recursive:true});for(let i=0;i<finalDeck.slides.items.length;i++){await fs.writeFile(path.join(renderDir,String(i+1).padStart(3,'0')+'.png'),new Uint8Array(await(await finalDeck.export({slide:finalDeck.slides.items[i],format:'png',scale:1})).arrayBuffer()));}
 manifest.decks.push({kind,file:name+'.pptx',slides:finalDeck.slides.items.length,cases:index,strategies:plans.map(m=>m.id),sha256:crypto.createHash('sha256').update(await fs.readFile(final)).digest('hex')});
 console.log(name+' finalized and rendered: '+finalDeck.slides.items.length+' slides');
}
await fs.writeFile(path.join(finalDir,'casebook-decks.json'),JSON.stringify(manifest,null,2)+'\n');
