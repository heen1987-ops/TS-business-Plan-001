const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const figures=require('../src/institution-media.json'),guide=require('../src/institution-guide.cjs'),model=require('../src/document-data.cjs');
let checks=0;const check=(v,m)=>{assert(v,m);checks++};
check(figures.length===3,'공식 목표·전략·추진체계 3개 원문');
check(new Set(figures.map(p=>p.id)).size===figures.length,'식별자 중복 없음');
const document=model.getDocument('about.html');
for(const p of figures){
 check(p.kind==='strategy-diagram','장식·현장사진 제외 '+p.id);
 check(p.src.startsWith('assets/official/')&&!p.src.includes('..'),'로컬 원문 도표 경로 '+p.id);
 const file=path.join(__dirname,'../public',p.src);
 check(fs.existsSync(file),'발췌 이미지 '+p.id);
 check(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')===p.sha256,'발췌본 무결성 '+p.id);
 check(p.width>0&&p.height>0&&p.alt.length>30,'비율·도표 대체텍스트 '+p.id);
 check(new URL(p.sourceUrl).hostname==='main.kotsa.or.kr'&&new URL(p.downloadUrl).hostname==='main.kotsa.or.kr','TS 공식 원문 '+p.id);
 check(!p.license.includes('공공누리')&&p.licenseUrl.includes('07050000'),'자유이용 허락 오표시 없음 '+p.id);
 check(!!p.creator&&!!p.sourceTitle&&!!p.versionLabel&&!!p.checked&&!!p.rightsEvidence&&!!p.sourceLocation,'판본·발췌 위치·권리 근거 '+p.id);
 check(p.readingPoints.length>=2,'본문과 연결하는 해설 '+p.id);
 check(guide.chapters.find(c=>c.id===p.chapter)?.media.some(x=>x.id===p.id),'본문 연결 '+p.id);
 check(document.sections.some(s=>s.media?.some(x=>x.id===p.id)),'문서 모델 도표 보존 '+p.id);
}
check(figures.find(p=>p.id==='ts-esg-strategy-2026').readingPoints.some(t=>t.includes('2029')),'목표연도 차이 명시');
check(!guide.chapters.find(c=>c.id==='purpose').media.length,'기관 정의에 무관한 현장사진 제외');
for(const file of ['ts-schoolbus-inspection.jpg','ts-senior-support.jpg','ts-safety-education.png'])check(!fs.existsSync(path.join(__dirname,'../public/assets/official',file)),'배포 자산의 무관한 사진 제거 '+file);
const esg=figures.find(p=>p.id==='ts-esg-strategy-2026').textDescription;
check(esg.groups.length===3&&esg.groups.reduce((n,g)=>n+g.tasks.length,0)===14,'ESG 3방향·14과제 텍스트 설명');
check(esg.groups.every(g=>g.metrics)&&esg.notes.some(n=>n.includes('2027–2029'))&&esg.notes.some(n=>n.includes('다음 계획')),'지표·단계·환류 텍스트 설명');
console.log(JSON.stringify({result:'통과',checks,figures:figures.length}));
