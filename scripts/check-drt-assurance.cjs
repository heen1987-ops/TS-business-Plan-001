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
check(Object.keys(d.sources).length===14&&d.sources.U01.kind==='user'&&!d.sources.U01.url,'기술 근거·사용자 현장 의견 추가와 출처 구분');
check(d.sources.S01.checkedAt==='2026-09-30'&&d.sources.S01.fact.includes('모바일앱')&&d.sources.S01.fact.includes('콜센터'),'TS의 전화/앱 기존 경로 구분');
check(d.sources.S08.checkedAt==='2026-09-29','공급사 이전 열람일 보존');
for(const s of Object.values(d.sources))if(s.url)check(/^https?:\/\//.test(s.url),'실제 원문 링크 형식');
for(const t of ['DRT-OP-AT01','DRT-OP-AT09','겹치는 시간창','미배차·포기','건별 담당자 승인을 요구하지 않음','기존 최적화엔진','공고 미매핑','회신기한'])check(dump.includes(t),'정정·안전 경계 보존 '+t);
check(d.metrics.every(m=>!m.name.includes('감사')&&!m.name.includes('정산')),'핵심5지표는 운영 편익 측정');
check(fs.readFileSync('src/ProposalLinks.jsx','utf8').includes('<DrtRelated/>'),'사용자가 보는 상세제안 연결 페이지의 DRT 진입점');
// 지역 사례 추가: 당시 발언과 현재 안내·설계 제안의 구분 유지.
check(d.sources.S12.checkedAt==='2026-10-10'&&d.sources.S12.published.includes('미표시'),'진안 발행일 추정 금지');
check(d.sources.S13.published==='2025-12-12 회의'&&d.sources.S13.limit.includes('2026년 현행'),'삼척 당시 발언과 현행 규정 구분');
for(const id of ['S12','S13'])check(d.sources[id].limit.includes('TS 플랫폼 사용'),'사례의 TS 설치 여부 미확인 유지 '+id);
check(d.sources.S11.checkedAt==='2026-10-06','재열람하지 않은 법령 확인일 보존');
check(d.sources.S12.limit.includes('상업적이용금지')&&d.sources.S12.limit.includes('허용 여부'),'공개 원문 탑재 권한과 사실 참조 구분');
check(d.sources.S01.recheckedAt==='2026-10-06','재열람하지 않은 기존 출처의 검증일 보존');
check(d.sections.find(s=>s.id==='why').intro.includes('특정 택시조합'),'수동배정 사용자 사례의 범위 유지');
const regional=d.sections.find(s=>s.id==='delivery').blocks.find(b=>b.title==='지역 조건·확정 안내의 인수시험 제안');
check(regional.rows.length===4&&regional.refs.includes('S12')&&regional.refs.includes('S13'),'지역 사례와 시험 연결');
for(const id of ['DRT-RG-01','DRT-RG-02','DRT-RG-03','DRT-RG-04'])check(regional.rows.some(r=>r[0].includes(id)),'필수 운영 경계 시험 '+id);
check(dump.includes('수량·단가 미확보 항목은 미산정')&&dump.includes('규칙/SI'),'미산정 비용·비AI 대안 보존');
const md=fs.readFileSync('dist/downloads/drt-assurance.md','utf8');check(!/\]\((undefined|null|)\)/.test(md),'사용자 출처에 허위 원문 URL 없음');
check(JSON.stringify(JSON.parse(fs.readFileSync('dist/downloads/drt-assurance.json')))===JSON.stringify(d),'다운로드 동일 내용');console.log(JSON.stringify({result:'통과',checks,chapters:d.sections.length,metrics:d.metrics.length,visuals:visuals.length}));
