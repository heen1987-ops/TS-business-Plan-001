const fs=require('fs'),path=require('path');
const build='C:/Users/Public/Documents/ESTsoft/CreatorTemp/ts_pages_build.cjs';let s=fs.readFileSync(build,'utf8');s=s.replace("marked.parse(safe(md))","marked.parse(safe(md).replace(/^# /gm,'## '))").replace(/기존 22개 공식 업무 묶음/g,'조사에서 정리한 22개 업무 묶음');fs.writeFileSync(build,s);
const root='G:/내 드라이브/1. 업무영역/6. CCK/1. 사업관리/TS/bizops/[TS 사업기획]/05_통합사업기획/TS_업무별_상세설계_산정_2026-09-15';
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
let changes=0;for(const f of walk(root).filter(f=>/\.(html|md)$/.test(f))){let a=fs.readFileSync(f,'utf8'),b=a.replace(/기존 22개 공식 업무 묶음/g,'조사에서 정리한 22개 업무 묶음');if(f.endsWith('.html')){let count=0;b=b.replace(/<h1>([\s\S]*?)<\/h1>/g,(m,t)=>++count===1?m:'<h2>'+t+'</h2>');}if(a!==b){fs.writeFileSync(f,b);changes++;}}
fs.copyFileSync(build,path.join(root,'작성자료/ts_pages_build.cjs'));console.log({changes});
