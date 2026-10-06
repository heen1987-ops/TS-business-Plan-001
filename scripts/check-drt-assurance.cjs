const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),d=require('../src/drt-assurance.cjs'),nav=require('../src/navigation.cjs');
let checks=0;const check=(ok,msg)=>{assert(ok,msg);checks++};
check(d.sections.length===6,'6개 연속 문서 장');check(new Set(d.sections.map(s=>s.id)).size===6,'앵커 고유');check(d.metrics.length===5,'5개 정량 지표');
for(const m of d.metrics){check(m.baseline===null&&m.target===null,'미검증 성능을 수치로 확정하지 않음 '+m.id);for(const k of ['formula','evidence','method','value'])check(m[k]?.length>10,'측정 명세 '+m.id+' '+k)}
for(const s of d.sections)for(const b of s.blocks){for(const id of b.refs||[])check(Boolean(d.sources[id]),'근거 ID 유효');if(b.rows)for(const r of b.rows)check(r.length===b.headers.length,'표 열 일치');}
const visuals=d.sections.flatMap(s=>s.blocks).filter(b=>b.type==='visual');check(visuals.length===5,'운영 중심 컨셉·전체·서비스·데이터·실행 5종');for(const b of visuals){const f=path.join('dist',b.src);check(fs.existsSync(f),'실제 이미지 '+b.id);const buf=fs.readFileSync(f);check(buf.subarray(1,4).toString()==='PNG','이미지 형식 '+b.id);check(b.alt.length>20&&(b.caption.includes('제안')||b.caption.includes('설계')),'대체 설명·설계 구분 '+b.id);}
check(nav.locate('drt-assurance.html')?.id==='drt-assurance','탐색 등록');check(fs.existsSync('dist/drt-assurance.html'),'직접 접근 경로');check(fs.existsSync('dist/downloads/drt-assurance.md'),'다운로드');
const dump=JSON.stringify(d);for(const t of ['447,249','29,662','75,419,630','검토 대기 ≠ 지급 보류','Grantee','비경보','공급사','기준선','DRT-AT07','신규 인프라 투자 0원'])check(dump.includes(t),'핵심 내용 보존 '+t);
const app=fs.readFileSync('src/App.jsx','utf8');check(app.includes("path==='drt-assurance.html'"),'직접 렌더링');check(JSON.parse(fs.readFileSync('src/association-research.json')).news_research.cases.length===6,'기존 뉴스6건 보존');
// 2026-09-30: 사용자 정정에 따라 운영 자동화를 중심에 놓고 후속 감사 기능은 보존.
check(d.title.includes('전화 접수·배차·운영계획'),'현장 운영 중심의 사업명');
check(Object.keys(d.sources).length===12&&d.sources.U01.kind==='user'&&!d.sources.U01.url,'기술 근거·사용자 현장 의견 추가와 출처 구분');
check(d.sources.S01.checkedAt==='2026-09-30'&&d.sources.S01.fact.includes('모바일앱')&&d.sources.S01.fact.includes('콜센터'),'TS의 전화/앱 기존 경로 구분');
check(d.sources.S08.checkedAt==='2026-09-29','공급사 이전 열람일 보존');
for(const s of Object.values(d.sources))if(s.url)check(/^https?:\/\//.test(s.url),'실제 원문 링크 형식');
for(const t of ['DRT-OP-AT01','DRT-OP-AT09','겹치는 시간창','미배차·포기','건별 담당자 승인을 요구하지 않음','기존 최적화엔진','공고 미매핑','회신기한'])check(dump.includes(t),'정정·안전 경계 보존 '+t);
check(d.metrics.every(m=>!m.name.includes('감사')&&!m.name.includes('정산')),'핵심5지표는 운영 편익 측정');
check(fs.readFileSync('src/ProposalLinks.jsx','utf8').includes('<DrtRelated/>'),'사용자가 보는 상세제안 연결 페이지의 DRT 진입점');
const md=fs.readFileSync('dist/downloads/drt-assurance.md','utf8');check(!/\]\((undefined|null|)\)/.test(md),'사용자 출처에 허위 원문 URL 없음');
check(JSON.stringify(JSON.parse(fs.readFileSync('dist/downloads/drt-assurance.json')))===JSON.stringify(d),'다운로드 동일 내용');console.log(JSON.stringify({result:'통과',checks,chapters:d.sections.length,metrics:d.metrics.length,visuals:visuals.length}));
