const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const m=require('../src/proposal-diagram-assets.json'),active=new Set(m.assets.map(a=>a.path)),dir='assets/proposal-diagrams-20261006';let count=0,saved=0;
for(const file of fs.readdirSync('public/'+dir)){const rel=dir+'/'+file;if(!/_v\d+(?:_model)?\.png$/.test(file)||active.has(rel))continue;assert(fs.statSync('public/'+rel).isFile());assert(!fs.existsSync('dist/'+rel),'미사용 생성본·교정본 배포 제외 '+file);saved+=fs.statSync('public/'+rel).size;count++}
assert.equal(count,295,'초기본 168장·이전 교정본 126장·모델 원본 1장 Git 보존·미배포');
for(const a of m.assets)assert(fs.readFileSync('dist/'+a.path).equals(fs.readFileSync('public/'+a.path)),'현재 168장 도식 배포 보존 '+a.id+'/'+a.type);
// 이전 이미지의 바이트·계보는 기존 교정 검사에서 확인. 한글 계획서 다운로드는 제외 대상 아님.
for(const a of m.assets.filter(a=>a.platformCorrectionPath))assert(fs.statSync('public/'+a.platformCorrectionPath).isFile(),'이전 교정본 Git 보존');
const bytes=dir=>fs.readdirSync(dir,{withFileTypes:true}).reduce((n,e)=>n+(e.isDirectory()?bytes(path.join(dir,e.name)):fs.statSync(path.join(dir,e.name)).size),0),total=bytes('dist');assert(total<1_000_000_000,'공개 배포 1GB 미만: '+total);
console.log(JSON.stringify({result:'통과',currentDiagrams:168,historyPreserved:count,excludedBytes:saved,publishedBytes:total}));
