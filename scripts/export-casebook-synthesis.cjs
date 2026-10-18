'use strict';
const fs=require('node:fs'),path=require('node:path');
const data=require('../src/casebook-synthesis.cjs');
const ax=require('../src/ax-casebook.cjs');
const followup=require('../src/strategy-followup.cjs');
const candidates=require('../src/strategy-solution-candidates.cjs');
const safe=s=>String(s??'').replaceAll('|','／').replaceAll('\n',' ');
const csv=s=>'"'+String(s??'').replaceAll('"','""')+'"';
const sourceLink=id=>data.caseSource(id).map(s=>'['+s.title+']('+s.url+')').join(' · ');
const caseTitle=id=>{const c=data.allCases.find(c=>c.id===id);return c?.title||id;};
const linkedCases=ids=>ids.map(id=>'['+id+' '+caseTitle(id)+'](https://heen1987-ops.github.io/TS-business-Plan-001/index.html?view='+(id.startsWith('AX')?'casebook':'platform-cases')+'&case='+id+')').join(' · ');
function finding(row){return '### '+row.id+' '+row.title+'\n\n- 사례 관찰: '+row.finding+'\n- 적용 경계: '+row.boundary+'\n- CCK 방향: '+row.cck+'\n- 검증: '+row.acceptance+'\n- 전략: '+row.strategies.join(' · ')+'\n- 사례: '+linkedCases(row.cases)+'\n';}
function platformSection(){return '## AI 플랫폼 구축 사례집 · 종합 시사점\n\n'+data.platformFindings.map(finding).join('\n')+'\n## CCK 전략방향\n\n'+data.cckDirections.map(r=>'### '+r.id+' '+r.title+'\n\n- 적용 범위: '+r.scope+'\n- 기존 자산: '+r.reuse+'\n- 추가 개발 후보: '+r.delta+'\n- 착수·검수 선행조건: '+r.gate+'\n- 연결 전략: '+r.strategies.join(' · ')+'\n- 근거 사례: '+linkedCases(r.cases)+'\n').join('\n');}
function axSection(){return '## 12대 전략과제 AX 사례집 · 종합 시사점\n\n'+data.strategyFindings.map(finding).join('\n');}
function markdown(){
 const header='# 플랫폼·전략과제 사례집 종합 분석과 CCK 전략방향\n\n- 검토 기준일: '+data.reviewedAt+'\n- 범위: 플랫폼 심층 31건 + AX 심층 26건 = 57건. 전체 조사 원장 2,637건은 후보 색인으로만 취급\n- TS 전략 명칭: [공식 2026–2030 경영목표 및 전략체계](https://main.kotsa.or.kr/portal/contents.do?menuCode=06020000)\n- 판단 기준: RFP 요구·공급사 설명·시범·운영·감사 결과를 분리. 사례의 성과 수치와 TS 기대효과를 분리\n- 아키텍처: 사례별 원문 도면은 상세 사례 화면 참조. 미공개 연결은 논리 재구성으로 표시\n\n';
 const platform=platformSection();
 const axPart=axSection();
 const strategy='## TS 12대 전략 · 솔루션과 검수 연결\n\n| 전략 | 업무 솔루션 | 담당 업무·원천 | 우선 검증 | 대표 사례 |\n| --- | --- | --- | --- | --- |\n'+candidates.rows.map(r=>{const p=followup.byId[r.id];return '| '+r.id+' '+safe(p.strategy)+' | '+safe(r.name)+' | '+safe(p.departments.map(b=>b.name+' '+b.job).join(' / '))+' | '+safe(p.test+' · '+r.gate)+' | '+r.benchmark+(r.caution?' / '+r.caution:'')+' |';}).join('\n')+'\n\nST-04 공통 기반을 한 번 구축한 뒤 ST-01·07·10·12 대표 업무를 검증. 나머지는 업무별 입력·규칙·연계·검수의 순증 범위 산정. 상세 요구·산출물·시험은 [12대 전략 솔루션 후보](ts-strategy-solution-candidates.md) 참조.\n\n';
 const cases='## 57개 심층 사례 · 출처·단계·전략 대조\n\n| ID | 사례 | 확인 단계 | 전략 | 원문·RFP·제품 출처 |\n| --- | --- | --- | --- | --- |\n'+data.allCases.map(c=>'| '+c.id+' | '+safe(c.title)+' | '+safe(c.state||c.result+' · '+c.limit)+' | '+data.strategiesFor(c.id).join(' · ')+' | '+sourceLink(c.id)+' |').join('\n')+'\n\n출처 링크 존재는 원문 접근 경로 확인이며 현행 운영·구현·TS 재사용권의 검증을 뜻하지 않음. 각 사례의 사실·한계·서비스 흐름·요구사항·개별 시사점은 두 사례집의 상세 본문 참조.\n';
 return header+platform+'\n'+axPart+'\n'+strategy+cases;
}
function csvBody(){const rows=[['ID','구분','사례','근거 단계','연결 전략','원문 URL','원문 제목','원문 수준','연결 종합 분석'],...data.allCases.map(c=>[c.id,c.id.startsWith('AX')?'전략과제 AX':'플랫폼',c.title,c.state||c.result+' · '+c.limit,data.strategiesFor(c.id).join(' / '),data.caseSource(c.id).map(s=>s.url).join(' / '),data.caseSource(c.id).map(s=>s.title).join(' / '),data.caseSource(c.id).map(s=>s.level).join(' / '),[...data.platformFindings,...data.strategyFindings].filter(f=>f.cases.includes(c.id)).map(f=>f.id).join(' / ')])];return '\uFEFF'+rows.map(r=>r.map(csv).join(',')).join('\r\n')+'\r\n';}
function files(){return {'ts-casebook-synthesis.md':markdown(),'ts-casebook-source-register.csv':csvBody()};}
function write(dir){fs.mkdirSync(dir,{recursive:true});for(const [name,body] of Object.entries(files()))fs.writeFileSync(path.join(dir,name),body);}
module.exports=write;module.exports.files=files;module.exports.markdown=markdown;module.exports.platformSection=platformSection;module.exports.axSection=axSection;
