const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist'),routes=require('../site-routes.json').routes,data=require('../src/data.json'),arch=require('../src/architecture-v2.json');
let count=0;function check(value,label){assert(value,label);count++}
check(routes.length===71,'React 경로 71개: 처별 한글 다운로드 자료실 1개 추가, 기존 70개 보존');check(new Set(routes).size===routes.length,'중복 경로 없음');check(data.departments.length===13,'처 13개');check(arch.units.length===16,'상세 아키텍처 16개');
for(const route of routes){const f=path.join(out,route);check(fs.existsSync(f),'페이지 '+route);const text=fs.readFileSync(f,'utf8');check(text.includes('window.__TS_BASE__=new URL('),'상대 기준 경로 '+route);}
for(const u of arch.units){check(fs.existsSync(path.join(out,'assets/architecture-v2',u.code+'_전체아키텍처.svg')),'아키텍처 '+u.code);check(fs.existsSync(path.join(out,'downloads/architecture-v2',u.code+'_상세아키텍처.md')),'명세 '+u.code);check(u.modules.length===4,'업무 모듈 '+u.code);check(u.modules.every(m=>m.connections.length===m.interfaces.length),'계약 참조 '+u.code);}
for(const d of data.departments){check(fs.existsSync(path.join(out,'assets/isometric-v1',d.code+'_컨셉도.png')),'컨셉 이미지 '+d.code);check(fs.existsSync(path.join(out,'assets',d.code+'_서비스흐름도.svg')),'흐름 이미지 '+d.code);}
const bad=[],files=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);const stat=fs.lstatSync(p);if(stat.isSymbolicLink())throw Error('심볼릭 링크 제외: '+p);stat.isDirectory()?walk(p):files.push(p)}}walk(out);
for(const f of files){if(!/\.(html|json|md|css|js)$/.test(f))continue;const text=fs.readFileSync(f,'utf8');
check(!/(?:[CG]:[\\/](?:Users|내 드라이브)|github_pat_[A-Za-z0-9_]{20,}|gh[pousr]_[A-Za-z0-9]{25,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)/.test(text),'공개파일 경계 '+path.relative(out,f));
if(!f.endsWith('.html'))continue;
for(const m of text.matchAll(/(?:href|src)\s*=\s*["']([^"']+)["']/g)){const value=m[1];if(/^(?:[a-z][a-z0-9+.-]*:|\/\/|#|\?)/i.test(value))continue;
try{const pathname=decodeURIComponent(value.split(/[?#]/)[0]);if(!pathname)continue;const resolved=path.resolve(path.dirname(f),pathname);if(!resolved.startsWith(out+path.sep)&&resolved!==out){bad.push([path.relative(out,f),value,'외부 로컬경로']);continue}if(!fs.existsSync(resolved))bad.push([path.relative(out,f),value,'대상 없음']);}catch(e){bad.push([path.relative(out,f),value,'잘못된 경로'])}
}}
check(bad.length===0,'내부 링크: '+JSON.stringify(bad.slice(0,12)));
console.log(JSON.stringify({result:'통과',checks:count,react_routes:routes.length,static_files:files.length,broken_internal_links:bad.length}));
