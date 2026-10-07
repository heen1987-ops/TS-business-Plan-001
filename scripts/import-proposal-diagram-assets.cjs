// 이미지 모델의 원본 PNG를 그대로 보존. 이 스크립트는 이미지 편집·합성을 수행하지 않음.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const d=require('../src/proposal-e2e-diagrams.cjs');
const input=process.argv[2];if(!input)throw Error('생성 결과 JSON 경로 필요');
const rows=JSON.parse(fs.readFileSync(input,'utf8').replace(/^\uFEFF/,''));
if(rows.length!==d.projects.length*d.types.length)throw Error('전체 168개 생성 결과 필요');
const seen=new Set(),hashes=new Set(),assets=[];
for(const r of rows){
 const key=r.id+'/'+r.type;if(!d.byId[r.id]||!d.types.includes(r.type)||seen.has(key))throw Error('과제/유형 중복·누락 '+key);seen.add(key);
 const b=fs.readFileSync(r.path);if(b.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('PNG 원본 아님 '+key);
 const width=b.readUInt32BE(16),height=b.readUInt32BE(20),ratio=width/height;
 if(width<1000||Math.min(Math.abs(ratio-16/9),Math.abs(ratio-1))>.02)throw Error('해상도·비율 검토 필요 '+key);
 const sha256=crypto.createHash('sha256').update(b).digest('hex');if(hashes.has(sha256))throw Error('과제별 이미지 중복 '+key);hashes.add(sha256);
 const assetPath=`assets/proposal-diagrams-20261006/${r.id}_${r.type}_v1.png`,target=path.join('public',assetPath);
 fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(r.path,target);
 assets.push({id:r.id,type:r.type,path:assetPath,width,height,bytes:b.length,sha256,generator:'built-in image_gen',status:'설계안 · TS 구현·성능 확인 전'});
}
assets.sort((a,b)=>d.projects.findIndex(p=>p.id===a.id)-d.projects.findIndex(p=>p.id===b.id)||d.types.indexOf(a.type)-d.types.indexOf(b.type));
fs.writeFileSync('src/proposal-diagram-assets.json',JSON.stringify({date:d.common.date,generator:'built-in image_gen',assets},null,2)+'\n');
console.log(JSON.stringify({projects:seen.size/4,images:assets.length,bytes:assets.reduce((n,a)=>n+a.bytes,0),originalPngPreserved:true}));
