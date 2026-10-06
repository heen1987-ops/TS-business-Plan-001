const manifest=require('./department-documents.json');
const repository='https://github.com/heen1987-ops/TS-business-Plan-001';
const pages='https://heen1987-ops.github.io/TS-business-Plan-001/';
const count=manifest.departments.reduce((n,d)=>n+d.documents.length,0);
const pathFor=file=>{
 if(!/^downloads\/departments\/[A-Z0-9]+\/[A-Z0-9]+_(plan|cost|diagrams)_v\d+\.\d+_r\d+\.hwpx$/.test(file.path))throw Error('허용되지 않은 한글파일 공개 경로');
 return file.path;
};
const downloadPath=file=>{
 const path=pathFor(file);
 if(!/^[a-f0-9]{64}$/.test(file.sha256))throw Error('다운로드 판본 해시 없음');
 return path+'?v='+file.sha256.slice(0,12);
};
const filesByPath=new Map(manifest.departments.flatMap(d=>[...d.documents,...d.history]).map(f=>[f.path,f]));
module.exports={repository,pages,count,departments:manifest.departments.length,
 catalogue:'planning-documents.html',
 repositoryFiles:repository+'/tree/main/public/downloads/departments',
 githubIndex:repository+'/blob/main/docs/HWPX_DOWNLOADS.md',
 title:'처별 한글파일 바로 다운로드',
 lead:'사업기획 검토와 함께 확인할 정보화사업 시행계획서·대가산정서·도식집. 아래 처별 표에서 파일 선택 또는 전체 한글 자료실에서 처명 검색.',
 publicationNote:'공개 사이트에서 HWPX 파일 직접 다운로드. 파일별 GitHub 원본·다운로드 경로도 함께 제공.',
 compatibilityNote:'2026-10-06 한글 호환 수정본. 현재·이전 문서 156개를 한컴오피스 한글 2024의 일반 열기로 확인. 이전에 받은 파일은 아래에서 다시 다운로드. 문서 보안 설정 변경 불필요.',
 versionNote:'게시 판본: 계획서 v0.5 · 대가산정서·도식집 v0.3 참조본. 2027년 처별 편성 판단·기술 HOW·측정방법을 개정한 계획서와 이전 v0.4를 구분하여 제공. 확정 대가·실측 효과는 미확정.',
 labels:{catalogue:'전체 처 한글파일 찾기',repository:'GitHub 한글파일 목록',source:'GitHub 파일 보기',fallback:'GitHub 원본 다운로드',column:'한글파일 3종',version:'게시 계획서'},
 shortLabels:{plan:'계획서',cost:'대가산정서',diagrams:'도식집'},
 downloadPath,
 resolveDownload:route=>filesByPath.has(route)?downloadPath(filesByPath.get(route)):route,
 fileUrl:file=>new URL(downloadPath(file),pages).href,
 sourceUrl:file=>repository+'/blob/main/public/'+pathFor(file),
 rawUrl:file=>repository+'/raw/refs/heads/main/public/'+downloadPath(file)
};
