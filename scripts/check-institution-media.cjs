const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const photos=require('../src/institution-media.json'),guide=require('../src/institution-guide.cjs'),model=require('../src/document-data.cjs');
let checks=0;const check=(v,m)=>{assert(v,m);checks++};
check(photos.length===3,'TS 현장 보도사진 3건');
check(new Set(photos.map(p=>p.id)).size===photos.length,'사진 식별자 중복 없음');
const document=model.getDocument('about.html');
for(const p of photos){
 check(p.src.startsWith('assets/official/')&&!p.src.includes('..'),'로컬 사진 경로 '+p.id);
 const file=path.join(__dirname,'../public',p.src);
 check(fs.existsSync(file),'원본 파일 '+p.id);
 check(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')===p.sha256,'원본 바이트 보존 '+p.id);
 check(p.width>0&&p.height>0&&p.alt.length>15,'비율·대체텍스트 '+p.id);
 check(/^https:\/\//.test(p.articleUrl)&&/^https:\/\//.test(p.downloadUrl),'출처·다운로드 주소 '+p.id);
 check(/제1유형/.test(p.license)&&p.licenseUrl.includes('kogl.or.kr'),'출처표시 이용조건 '+p.id);
 check(!!p.creator&&!!p.articleTitle&&!!p.published&&!!p.checked&&!!p.rightsEvidence,'발행·이용조건 근거 '+p.id);
 check(guide.chapters.find(c=>c.id===p.chapter)?.media.some(x=>x.id===p.id),'본문 연결 '+p.id);
 check(document.sections.some(s=>s.media?.some(x=>x.id===p.id)),'문서 모델 사진 보존 '+p.id);
}
console.log(JSON.stringify({result:'통과',checks,photos:photos.length}));
