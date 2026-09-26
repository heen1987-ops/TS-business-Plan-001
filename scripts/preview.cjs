const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../dist'),port=Number(process.env.PORT||8769),base=process.env.BASE_PATH||'/TS-business-Plan-001/';
if(!base.startsWith('/')||!base.endsWith('/'))throw Error('BASE_PATH는 /로 시작·종료');
http.createServer((req,res)=>{let p;try{p=decodeURIComponent(new URL(req.url,'http://local').pathname)}catch{res.writeHead(400);res.end();return}
if(!p.startsWith(base)){res.writeHead(404);res.end();return}
let f=path.resolve(root,p.slice(base.length)||'index.html');if(f!==root&&!f.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');
if(!fs.existsSync(f)){res.writeHead(404);res.end('문서 없음');return}
const type={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.json':'application/json; charset=utf-8','.md':'text/plain; charset=utf-8'}[path.extname(f)]||'application/octet-stream';
res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-cache'});fs.createReadStream(f).pipe(res);
}).listen(port,'127.0.0.1',()=>console.log('검토 서버 http://127.0.0.1:'+port+base));
