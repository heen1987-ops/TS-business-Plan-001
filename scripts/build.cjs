const fs=require('node:fs'),path=require('node:path'),esbuild=require('esbuild');
const root=path.resolve(__dirname,'..'),out=path.resolve(root,'dist');
if(out!==path.join(root,'dist')||path.dirname(out)!==root)throw Error('빌드 출력 경로 오류');
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});fs.cpSync(path.join(root,'public'),out,{recursive:true});
require('./export-measurement.cjs')(path.join(out,'downloads'));
require('./export-websites.cjs')(path.join(out,'downloads'));
fs.writeFileSync(path.join(out,'downloads/navigation-registry.json'),JSON.stringify({registeredAt:require('../src/navigation.cjs').date,records:require('../src/navigation.cjs').records},null,2));
const routes=require('../site-routes.json').routes;
function shell(route){const prefix=path.posix.relative(path.posix.dirname(route),'.')||'.';return '<!doctype html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="한국교통안전공단의 임무·법정업무·2030 전략·조직별 AX 전환 제안"><title>TS AX 사업기획</title><link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27%3E%3Crect width=%2732%27 height=%2732%27 rx=%274%27 fill=%27%23244f79%27/%3E%3C/svg%3E"><link rel="stylesheet" href="'+prefix+'/react/app.css"></head><body><div id="root"></div><noscript>목차 탐색에는 JavaScript 사용 필요. <a href="'+prefix+'/legacy/index.html">정적 자료 보기</a></noscript><script>window.__TS_BASE__=new URL("'+prefix+'/",location.href).href;</script><script defer src="'+prefix+'/react/app.js"></script></body></html>'}
(async()=>{await esbuild.build({entryPoints:[path.join(root,'src/App.jsx')],bundle:true,format:'iife',minify:true,target:['chrome110'],outdir:path.join(out,'react'),entryNames:'app',define:{'process.env.NODE_ENV':'"production"'},logLevel:'info'});
for(const route of [...routes,'react/index.html']){const file=path.join(out,route);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,shell(route));}
fs.writeFileSync(path.join(out,'.nojekyll'),'');
fs.writeFileSync(path.join(out,'404.html'),'<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>문서 경로 확인 | TS AX</title><body><main style="max-width:640px;margin:15vh auto;padding:24px;font-family:system-ui"><h1>문서를 찾을 수 없습니다</h1><p>주소를 확인하거나 자료 목차에서 다시 탐색해 주세요.</p><a id="home" href="./">자료 목차로</a></main><script>const parts=location.pathname.split("/");document.getElementById("home").href=location.hostname.endsWith("github.io")?"/"+parts[1]+"/":"/";</script></body></html>');
fs.writeFileSync(path.join(out,'version.json'),JSON.stringify({commit:process.env.GITHUB_SHA||'local',built_at:new Date().toISOString(),routes:routes.length}));
console.log('빌드 완료: '+routes.length+'개 React 경로 + 연결 정적 자료');
})().catch(e=>{console.error(e);process.exit(1)});
