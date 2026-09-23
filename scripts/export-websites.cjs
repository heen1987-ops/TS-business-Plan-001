const fs=require('node:fs'),path=require('node:path'),data=require('../src/official-sites.json');
module.exports=function(out){fs.mkdirSync(out,{recursive:true});const lines=['# TS 처별 공식 홈페이지·업무시스템 매핑','', '조사일: '+data.date,'',data.scope,'','- 업무안내 담당·개인정보파일 운영·열람청구 담당·기관 연결을 구분한 매핑. 단독 운영·예산권·API 이용권한 확정과 구분.','- 외부 사이트 로그인·실제 업무처리·접속 지속성 미검증.','- 개인정보처리방침 기준: 2026.08.18~현재 판본.',''];
for(const s of data.sites){lines.push('## '+s.title,'', '- 구분: '+s.category+' / '+s.kind,'- 주소: ['+s.title+']('+s.url+')','- 상태: '+s.status,'- 범위: '+(s.baseline?'공식 목록 31개 항목':'추가 확인 경로'));
for(const m of s.mappings){const e=data.sources[m.source];lines.push('- 담당: '+m.department+' / '+m.role+' / [근거: '+e.title+']('+e.url+')')}
if(s.note)lines.push('- 해석: '+s.note);
const e=data.sources[s.linkSource];lines.push('- 연결주소 출처: ['+e.title+']('+e.url+')','')}
lines.push('## 조사·갱신 기준','','공식 목록 페이지의 담당부서를 개별 사이트 담당으로 일괄 배정하지 않음. 미확인은 원문 보완 전까지 유지. 동일 도메인 내 업무경로와 독립 사이트를 구분. KATRI 처별 관계는 원문 부서명을 보존하고 지도상 상위 기관에 연결.','');
fs.writeFileSync(path.join(out,'official-sites.md'),lines.join('\n'));fs.writeFileSync(path.join(out,'official-sites.json'),JSON.stringify(data,null,2))};
