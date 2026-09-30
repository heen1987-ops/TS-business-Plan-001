const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const manifest=require('../src/generated-visuals47.json'),r=require('../src/revision47.cjs');
let checks=0;const check=(v,m)=>{assert(v,m);checks++};
check(manifest.generator==='built-in image_gen','이미지 모델 출처');
check(manifest.assets.length===39,'13개 처 × 3종 이미지');
check(new Set(manifest.assets.map(a=>a.code+'-'+a.type)).size===39,'처별 유형 고유');
check(new Set(manifest.assets.map(a=>a.sha256)).size===39,'서로 다른 39개 이미지');
for(const code of Object.keys(r.data.departments))for(const type of ['concept','overall','service']){
 const a=manifest.assets.find(a=>a.code===code&&a.type===type);check(!!a,'이미지 누락 '+code+type);
 check(a.path===('assets/generated47/'+code+'_'+type+(code==='CL'&&type==='service'?'_v2.png':'_v1.png')),'배포 하위경로 '+a.path);
 check(a.summary.length>30&&a.summary.includes(r.get(code).name),'부서별 대체설명 '+code+type);
 const original=fs.readFileSync(path.join('public',a.path)),built=fs.readFileSync(path.join('dist',a.path));
 check(original.subarray(0,8).toString('hex')==='89504e470d0a1a0a','실제 PNG '+a.path);
 check(original.readUInt32BE(16)===a.width&&original.readUInt32BE(20)===a.height&&a.width>=1600&&a.height>=900,'원본 해상도 '+a.path);
 check(original.equals(built)&&crypto.createHash('sha256').update(original).digest('hex')===a.sha256,'빌드 자산 무결성 '+a.path);
 check(a.review.status==='합격'&&a.review.score>=34,'이미지 개별 검수 '+a.path);
}
console.log(JSON.stringify({result:'통과',checks,generated_images:39,departments:13}));
