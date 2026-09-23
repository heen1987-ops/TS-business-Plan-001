const assert=require('node:assert/strict'),fs=require('node:fs'),org=require('../src/org-map-data.cjs'),catalog=require('../src/official-sites.cjs');
const {sites,sources,forNode,find}=catalog;let count=0;function check(v,label){assert(v,label);count++}
check(sites.length===43,'수록 경로 43개');check(sites.filter(s=>s.baseline).length===31,'공식 목록 31개 전체 수록');check(new Set(sites.map(s=>s.id)).size===sites.length,'고유 경로 ID');check(new Set(sites.map(s=>s.url)).size===sites.length,'동일 URL 중복 없음');
for(const s of sites){check(!!sources[s.linkSource],'연결 주소 출처 '+s.id);check(/^https?:\/\//.test(s.url),'공개 URL '+s.id);check(s.mappings.length>0||s.status==='담당 처 미확인','미확인 상태 보존 '+s.id);for(const m of s.mappings){check(!!org.nodes[m.node],'조직 연결 '+s.id);check(!!sources[m.source],'담당 근거 '+s.id);check(m.role!=='운영 담당','운영권한 일괄 단정 없음 '+s.id)}}
for(const code of Object.keys(org.departmentByCode))check(forNode(code).length>0,'13개 처 공식 사이트/안내 연결 '+code);
check(forNode('MR').some(s=>s.id==='drt'),'DRT 담당 MR');check(!forNode('PS').some(s=>s.id==='drt'),'DRT와 정책부서 추정 배정 금지');check(forNode('DF').some(s=>s.id==='kpass'),'K-패스 DF');
check(forNode('DV').some(s=>s.id==='edu'),'실증사업처 교육 업무 연결');check(forNode('RD').every(s=>s.kind==='공식 업무안내'),'RD 독립 사이트로 과장 없음');
check(sites.find(s=>s.id==='cyberts').mappings.length===3,'사이버검사소 세 역할 구분');
check(find({status:'pending'}).length===7,'담당 처 확인 대기 7개');check(find({query:'DRT'}).length===1,'서비스명 검색');check(find({query:'없는사이트123'}).length===0,'빈 검색결과');check(forNode('budget').length===0,'연결 미확인 부서');check(find({node:'mobility',query:'K-패스'}).length===1,'상위 조직 범위');
for(const e of Object.values(sources))check(e.url.startsWith('https://main.kotsa.or.kr/'),'공식 원문 출처');
for(const f of ['dist/websites.html','dist/downloads/official-sites.md','dist/downloads/official-sites.json'])check(fs.existsSync(f),'발행물 '+f);
console.log(JSON.stringify({result:'통과',checks:count,records:sites.length,directory:31,unconfirmed_department:7}));
