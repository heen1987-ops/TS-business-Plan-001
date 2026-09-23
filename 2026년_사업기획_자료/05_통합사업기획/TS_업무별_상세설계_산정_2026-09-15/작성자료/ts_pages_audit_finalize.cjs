const fs=require('fs'),path=require('path'),crypto=require('crypto');
const out='G:/내 드라이브/1. 업무영역/6. CCK/1. 사업관리/TS/bizops/[TS 사업기획]/05_통합사업기획/TS_업무별_상세설계_산정_2026-09-15';
const src='C:/Users/Public/Documents/ESTsoft/CreatorTemp/ts_pages_qa.cjs';let s=fs.readFileSync(src,'utf8');s=s.replace("const pages=walk(root).filter(f=>f.endsWith('.html'));","const pages=walk(root).filter(f=>f.endsWith('.html')&&!f.includes('기준_변경전'));");fs.writeFileSync(src,s);fs.writeFileSync(path.join(out,'작성자료/ts_pages_qa.cjs'),s);
fs.copyFileSync(__filename,path.join(out,'작성자료/ts_pages_audit_finalize.cjs'));
const manifest=path.join(out,'변경파일_기록.json'),m=JSON.parse(fs.readFileSync(manifest,'utf8'));
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
m.created_package=walk(out).filter(f=>f!==manifest).map(f=>({path:path.relative(out,f),bytes:fs.statSync(f).size,sha256:crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')}));fs.writeFileSync(manifest,JSON.stringify(m,null,2));
console.log(JSON.stringify({live_html:walk(out).filter(f=>f.endsWith('.html')&&!f.includes('기준_변경전')).length,svg:walk(out).filter(f=>f.endsWith('.svg')).length,changed_existing:m.changed_existing.length,package_files:m.created_package.length+1},null,2));
