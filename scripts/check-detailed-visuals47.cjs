const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const m=require('../src/detailed-visuals47.json'),core=require('../src/generated-visuals47.json'),drt=require('../src/drt-assurance.cjs');
let checks=0;const check=(v,msg)=>{assert(v,msg);checks++};
check(m.generator==='built-in image_gen','명시적으로 호출한 이미지 모델');
check(m.assets.length===8&&new Set(m.assets.map(a=>a.code+'-'+a.type)).size===8,'CL 3종 보존 + 운영 중심 DRT 5종');
check(new Set(m.assets.map(a=>a.sha256)).size===8,'서로 다른 원본 이미지');
for(const code of ['CL','DRT'])for(const type of (code==='CL'?['data','service','runtime']:['concept','overall','data','service','runtime'])){
 const a=m.assets.find(a=>a.code===code&&a.type===type);check(!!a,'필수 도식 '+code+type);
 check(a.path===`assets/generated47/${code}_${type}_${code==='CL'?'v2':'v3'}.png`,'배포 자산 경로');
 const original=fs.readFileSync(path.join('public',a.path)),built=fs.readFileSync(path.join('dist',a.path));
 check(original.subarray(0,8).toString('hex')==='89504e470d0a1a0a','실제 PNG');
 check(a.width===original.readUInt32BE(16)&&a.height===original.readUInt32BE(20)&&a.width>=1600&&a.height>=900,'원본 해상도 일치');
 check(original.length===a.bytes&&crypto.createHash('sha256').update(original).digest('hex')===a.sha256&&original.equals(built),'원본·빌드·해시 일치');
 check(a.summary.length>40&&a.caption.includes('설계')&&a.points.length>=4,'대체텍스트와 동등 본문');
 check(a.review.status==='합격'&&a.review.score>=34&&a.review.dimensions.length===8&&a.review.dimensions.every(v=>v>=1&&v<=5)&&a.review.dimensions.reduce((s,v)=>s+v,0)===a.review.score,'독립 시각 검수 기준');
 const md=fs.readFileSync(code==='DRT'?'dist/downloads/drt-assurance.md':`dist/downloads/revision47/CL_${type==='runtime'?'고도화설계':'근거기반_상세제안'}.md`,'utf8');
 check(md.includes(a.path)&&a.points.every(t=>md.includes(t)),'화면과 내려받기 이미지·설명 일치 '+code+type);
 if(code==='DRT'){const b=drt.sections.flatMap(s=>s.blocks).find(b=>b.type==='visual'&&b.id===type);check(b?.src===a.path&&b.width===a.width&&b.height===a.height&&b.points===a.points,'DRT 렌더링 데이터 일치');}
}
const service=m.assets.find(a=>a.code==='CL'&&a.type==='service'),coreService=core.assets.find(a=>a.code==='CL'&&a.type==='service');
check(coreService.path===service.path&&coreService.sha256===service.sha256,'CL 서비스 manifest 교차 일치');
check(core.assets.length===39&&core.assets.filter(a=>a.path.endsWith('_v2.png')).length===1,'기존 39개 중 CL 서비스만 교체');
for(const a of core.assets.filter(a=>!(a.code==='CL'&&a.type==='service')))check(a.path.endsWith('_v1.png'),'다른 38개 그림 유지');
check(fs.existsSync('public/assets/generated47/CL_service_v1.png')&&fs.existsSync('public/assets/drt-assurance/service.png'),'기존 이미지 파일 보존');
check(drt.sections.flatMap(s=>s.blocks).filter(b=>b.type==='visual').length===5,'DRT 운영 중심 컨셉·전체·서비스·데이터·실행 5종');
for(const code of ['CL','DRT']){const runtime=m.assets.find(a=>a.code===code&&a.type==='runtime');for(const word of (code==='CL'?['조회','승인','점선','물리','응답 유실','계획']:['조회','승인','잠금','물리','응답 유실','계획']))check((runtime.caption+runtime.points.join(' ')).includes(word),'실행 경계 설명 '+code+word);}
console.log(JSON.stringify({result:'통과',checks,proposals:2,detailed_images:8,core_images:39,drt_images:5}));
