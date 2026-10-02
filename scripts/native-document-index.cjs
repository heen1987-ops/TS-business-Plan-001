const fs=require('node:fs'),path=require('node:path');
const manifest=require('../src/department-documents.json'),publication=require('../src/document-publication.cjs');
function render(){
 const lines=['# 처별 한글파일 다운로드','','GitHub에 저장된 HWPX 파일을 직접 내려받는 목록. 개인 PC 경로 없이 이용 가능.','',
  `- 대상: ${publication.departments}개 처 · ${publication.count}개 파일`,
  '- 작성 상태: 기관 협의용 초안',
  '- '+publication.versionNote,
  `- [홈페이지에서 처명 검색](${publication.pages+publication.catalogue})`,
  `- [실제 파일 폴더](${publication.repositoryFiles})`,'',
  '각 파일 링크는 GitHub 원본 다운로드. 처명 링크는 공개 홈페이지의 해당 처 문서 상세(판본·용량·SHA-256·그림 수)로 이동.','',
  '| 처 코드 | 처명·문서 상세 | 정보화사업 시행계획서 | 대가산정서 | 컨셉·아키텍처·흐름 도식집 |',
  '| --- | --- | --- | --- | --- |'];
 for(const d of manifest.departments)lines.push(`| ${d.code} | [${d.name}](${publication.pages+publication.catalogue}#documents-${d.code}) | `+d.documents.map(f=>`[${f.version.replace('_r01','')} HWPX 다운로드](${publication.rawUrl(f)})`).join(' | ')+' |');
 lines.push('','## 게시·검증 기준','','- 정본 목록: `src/department-documents.json`','- 실제 파일: `public/downloads/departments/`','- GitHub Actions에서 검증한 동일 파일을 GitHub Pages로 배포','- 빌드 시 파일 누락·바이트·SHA-256·HWPX 구조·그림 수·개인 PC 경로 검사','- 웹 검토서 갱신과 한글 본문 개정은 별도 관리. 한글파일 버전·작성일을 확인한 뒤 활용','');
 return lines.join('\n');
}
module.exports=render;
if(require.main===module){fs.writeFileSync(path.join(__dirname,'../docs/HWPX_DOWNLOADS.md'),render());console.log('한글파일 GitHub 목록 갱신');}
