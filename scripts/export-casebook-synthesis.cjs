'use strict';
const fs=require('node:fs'),path=require('node:path');
const data=require('../src/casebook-synthesis.cjs');
const ax=require('../src/ax-casebook.cjs');
const followup=require('../src/strategy-followup.cjs');
const candidates=require('../src/strategy-solution-candidates.cjs');
const audit=require('../src/case-bottleneck-audit.cjs');
const capability=require('../src/cck-ax-capability-plan.cjs');
const architectureEvidence=require('../src/case-architecture-evidence.cjs');
const sourceFigures=require('../src/case-source-figures.json');
const safe=s=>String(s??'').replaceAll('|','／').replaceAll('\n',' ');
const csv=s=>'"'+String(s??'').replaceAll('"','""')+'"';
const sourceLink=id=>data.caseSource(id).map(s=>'['+s.title+']('+s.url+')').join(' · ');
const caseTitle=id=>{const c=data.allCases.find(c=>c.id===id);return c?.title||id;};
const linkedCases=ids=>ids.map(id=>'['+id+' '+caseTitle(id)+'](https://heen1987-ops.github.io/TS-business-Plan-001/index.html?view='+(id.startsWith('AX')?'casebook':'platform-cases')+'&case='+id+')').join(' · ');
function finding(row){return '### '+row.id+' '+row.title+'\n\n- 사례 관찰: '+row.finding+'\n- 적용 경계: '+row.boundary+'\n- CCK 방향: '+row.cck+'\n- 검증: '+row.acceptance+'\n- 전략: '+row.strategies.join(' · ')+'\n- 사례: '+linkedCases(row.cases)+'\n';}
function platformSection(){return '## AI 플랫폼 구축 사례집 · 종합 시사점\n\n'+data.platformFindings.map(finding).join('\n')+'\n## CCK 전략방향\n\n'+data.cckDirections.map(r=>'### '+r.id+' '+r.title+'\n\n- 적용 범위: '+r.scope+'\n- 기존 자산: '+r.reuse+'\n- 추가 개발 후보: '+r.delta+'\n- 착수·검수 선행조건: '+r.gate+'\n- 연결 전략: '+r.strategies.join(' · ')+'\n- 근거 사례: '+linkedCases(r.cases)+'\n').join('\n');}
function axSection(){return '## 12대 전략과제 AX 사례집 · 종합 시사점\n\n'+data.strategyFindings.map(finding).join('\n');}
function auditSection(kind){const rows=audit.byKind[kind];return '## '+(kind==='platform'?'플랫폼':'전략과제 AX')+' 사례 · 아키텍처 병목 검토 '+rows.length+'건\n\n'+rows.map(r=>{const figure=sourceFigures.find(f=>f.path===r.figure);return '### '+r.id+' '+r.caseId+' · '+r.seam+'\n\n- 근거 단계: '+r.stage+' / '+r.status+'\n- 원문에서 확인한 구성: '+r.architecture+'\n- 병목·설계 간극: '+r.bottleneck+'\n- TS 검증: '+r.check+'\n- CCK 대응: '+r.cck+'\n- 전략: '+r.strategies.join(' · ')+'\n- 원문: ['+r.caseId+' 출처]('+r.source+')'+(figure?'\n- 원문 도식: ['+figure.title+' · '+figure.status+'](../'+figure.path+')':'')+'\n';}).join('\n');}
function capabilitySection(){return '## CCK 기술 재사용 근거와 선행 실사\n\n'+capability.assets.map(a=>'### '+a.id+' '+a.name+' · '+a.level+'\n\n- 확인 근거: '+a.basis+'\n- 재사용 후보: '+a.reuse+'\n- 선행 실사: '+a.verify+'\n').join('\n');}
function markdown(){
 const header='# 플랫폼·전략과제 사례집 종합 분석과 CCK 전략방향\n\n- 검토 기준일: '+data.reviewedAt+'\n- 범위: 플랫폼 심층 31건 + AX 심층 26건 = 57건. 전체 조사 원장 2,637건은 후보 색인으로만 취급\n- TS 전략 명칭: [공식 2026–2030 경영목표 및 전략체계](https://main.kotsa.or.kr/portal/contents.do?menuCode=06020000)\n- 판단 기준: RFP 요구·공급사 설명·시범·운영·감사 결과를 분리. 사례의 성과 수치와 TS 기대효과를 분리\n- 아키텍처 근거: 원문 도식 10건, 자료 기반 이미지 재구성 3건, 공식 API 문서 기반 논리 재구성 1건, 출처 설명 기반 논리 재구성 43건. 이 수는 구현·운영 검증 건수가 아님\n\n';
 const platform=platformSection();
 const axPart=axSection();
 const strategy='## TS 12대 전략 · 솔루션과 검수 연결\n\n| 전략 | 업무 솔루션 | CCK 기술 후보 | 담당 업무·원천 | 우선 검증 | 대표 사례 |\n| --- | --- | --- | --- | --- | --- |\n'+candidates.rows.map(r=>{const p=followup.byId[r.id];return '| '+r.id+' '+safe(p.strategy)+' | '+safe(r.name)+' | '+safe(capability.strategyAssets[r.id].map(id=>capability.byId[id].name).join(' / '))+' | '+safe(p.departments.map(b=>b.name+' '+b.job).join(' / '))+' | '+safe(p.test+' · '+r.gate)+' | '+r.benchmark+(r.caution?' / '+r.caution:'')+' |';}).join('\n')+'\n\nST-04 공통 기반을 한 번 구축한 뒤 ST-01·07·10·12 대표 업무를 검증. 나머지는 업무별 입력·규칙·연계·검수의 순증 범위 산정. 상세 요구·산출물·시험은 [12대 전략 솔루션 후보](ts-strategy-solution-candidates.md) 참조.\n\n';
 const cases='## 57개 심층 사례 · 출처·단계·전략 대조\n\n| ID | 사례 | 확인 단계 | 전략 | 원문·RFP·제품 출처 |\n| --- | --- | --- | --- | --- |\n'+data.allCases.map(c=>'| '+c.id+' | '+safe(c.title)+' | '+safe(c.state||c.result+' · '+c.limit)+' | '+data.strategiesFor(c.id).join(' · ')+' | '+sourceLink(c.id)+' |').join('\n')+'\n\n출처 링크 존재는 원문 접근 경로 확인이며 현행 운영·구현·TS 재사용권의 검증을 뜻하지 않음. 각 사례의 사실·한계·서비스 흐름·요구사항·개별 시사점은 두 사례집의 상세 본문 참조.\n';
 const verification='## 원문 아키텍처 검증 기록\n\n- 국민권익위 민원 AI: [NIA 원문 RFP ZIP](https://www.nia.or.kr/common/board/Download.do?bcIdx=28233&cbIdx=78336&fileNo=2)의 SHA-256 `10b0049fea8c9ad04c1c6b448baf03bfa06cf5f296c724aba2996804040d39a6`. REA 패키지 분석에서 ZIP의 HWPX·HWP 등 4개 항목과 HWPX 내부 53개 항목 확인. 증거 ID: `ev_5f97ae9cedec501206976a81f71fd88fdf34b2cd83f2b3c182d73fcbb8e36732`, `ev_12c3ff9423094baaa31b0caf84abc98a28c21f551b0bc523c395daeb3926c8c6`.\n- PF-R02-01~04 그림의 공개 파일 SHA-256을 출처 그림 원장과 재대조. 원문 그림의 RAG·데이터 흐름은 RFP 목표 설계이며 실제 배포 토폴로지·성능 확인이 아님.\n- 나머지 사례는 기관 RFP 원문, 공개 기술 문서, 운영기관 설명, 감독·감사 자료의 해당 범위만 검토. 제3자 운영 바이너리·서버 구성·실행 추적은 확보하지 못했으므로 실제 런타임 병목으로 단정하지 않음.\n- 병목 상태가 ‘설계상 병목 후보’인 항목은 원문 연결 구조에 대한 CCK 분석. ‘감사·감독 확인’ 항목은 해당 공적 자료의 관찰 범위에 한정.\n';
 return header+platform+'\n'+auditSection('platform')+'\n'+capabilitySection()+'\n'+axPart+'\n'+auditSection('ax')+'\n'+strategy+cases+'\n'+verification;
}
function csvBody(){const rows=[['ID','구분','사례','근거 단계','연결 전략','원문 URL','원문 제목','원문 수준','아키텍처 근거 유형','아키텍처 근거 상세','연결 종합 분석','심층 병목 ID','병목 근거 상태'],...data.allCases.map(c=>[c.id,c.id.startsWith('AX')?'전략과제 AX':'플랫폼',c.title,c.state||c.result+' · '+c.limit,data.strategiesFor(c.id).join(' / '),data.caseSource(c.id).map(s=>s.url).join(' / '),data.caseSource(c.id).map(s=>s.title).join(' / '),data.caseSource(c.id).map(s=>s.level).join(' / '),architectureEvidence.forCase(c.id).type,architectureEvidence.forCase(c.id).detail,[...data.platformFindings,...data.strategyFindings].filter(f=>f.cases.includes(c.id)).map(f=>f.id).join(' / '),audit.rows.filter(r=>r.caseId===c.id).map(r=>r.id).join(' / '),audit.rows.filter(r=>r.caseId===c.id).map(r=>r.status).join(' / ')])];return '\uFEFF'+rows.map(r=>r.map(csv).join(',')).join('\r\n')+'\r\n';}
function files(){return {'ts-casebook-synthesis.md':markdown(),'ts-casebook-source-register.csv':csvBody()};}
function write(dir){fs.mkdirSync(dir,{recursive:true});for(const [name,body] of Object.entries(files()))fs.writeFileSync(path.join(dir,name),body);}
module.exports=write;module.exports.files=files;module.exports.markdown=markdown;module.exports.platformSection=platformSection;module.exports.axSection=axSection;
