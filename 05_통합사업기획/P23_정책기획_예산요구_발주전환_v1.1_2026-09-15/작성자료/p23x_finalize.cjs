const fs=require('fs'),path=require('path'),crypto=require('crypto'),{pathToFileURL,fileURLToPath}=require('url');
const root='G:/내 드라이브/1. 업무영역/6. CCK/1. 사업관리/TS/bizops/[TS 사업기획]';const dir=path.join(root,'05_통합사업기획/P23_정책기획_예산요구_발주전환_v1.1_2026-09-15');
const q=JSON.parse(fs.readFileSync(path.join(dir,'검증/자동검증_결과.json'),'utf8'));
const changes=JSON.parse(fs.readFileSync(path.join(dir,'변경파일_기록.json'),'utf8'));
let verified=0;for(const x of changes.existing_changed){const s=fs.readFileSync(x.path,'utf8');if(x.path.endsWith('.html')){const banner=s.match(/<div data-p23x="1"[\s\S]*?<\/div>/);if(!banner)throw Error('안내 배너 없음');const href=banner[0].match(/href="([^"]+)"/)[1];if(!fs.existsSync(fileURLToPath(new URL(href,pathToFileURL(x.path)))))throw Error('최신 연결 오류');verified++;}else if(!s.includes('<!--P23X-LATEST-->'))throw Error('Markdown 안내 없음');}
const report=`# P23 v1.1 검증기록

작성·검증일: 2026-09-15

## 적용 방법과 완료 범위

작업 유형: 공공 AX+SI 기획·문서 설계 및 설명용 프로토타입. 규모 M, 위험도 Medium. 근거 검토 → 범위·요구사항 → 시연 → 검증으로 진행하는 Stage-Gate와 프로토타입 검증을 적용했다. 운영 제품 구현·기관 제출·배포는 이번 산출물 범위가 아니다.

설명9페이지와 서식6종을 각각 HTML·Markdown으로 작성했다. 컨셉·아키텍처·사용자·데이터 흐름 SVG4종, 출처·요구사항·양식·추가 비용 원장, 가상 문서전환 시연 포함.

## 실행한 검사

- 자동검사 ${q.checks}건, 실패 ${q.failures.length}건. 결과: [상세 기록](검증/자동검증_결과.json)
- HTML ${q.html_pages}개, 로컬 참조 ${q.local_references}개, 화면 크기1440·768·390px 총${q.viewports}회 확인. 문서 전체 가로 넘침·이미지 누락 없음.
- SVG ${q.svg}개·노드${q.svg_nodes}개: 글자 경계 검사 통과.
- 전년도 누락과0 구분, 증감·소수 단위 계산, 음수·비정상 입력 거부, 예산 변경·연도 불일치·근거 철회의 네 문서 전파 확인.
- 실제 브라우저 원장 JSON 다운로드 내용, 오류 시 다운로드 차단, 키보드 본문 이동 확인.
- 브라우저 JavaScript 오류0, 시연의 외부 네트워크 요청0.
- 기존 HTML 안내${verified}개와 Markdown 안내3개 추가 확인. 변경 전 원문은 [변경파일 기록](변경파일_기록.json)의 경로에 보존.
- 자동검사 후 표지·데스크톱 시연·모바일 시연의 실제 렌더를 직접 확인. 입력·금액·변경 사유가 잘리지 않고 표시됨.

## 근거와 품질 검토

공식 예산 PDF 인쇄45쪽·196쪽을 화면으로 확인했다. 인쇄44–49·193–196쪽의 관련 내용을 판독하고 연차 총비용·신규사업 별첨·실제 의견조회 구분에 반영했다. 지침의 존재를 TS의 특정 사업에 대한 적용 승인으로 확대하지 않았다.

초안의 승인액·협의 결과·계약조건은 미확인으로 유지한다. RFP와 공급사 제안서를 구분하고, 기존 기술 문서의 계획 항목을 구축 완료로 쓰지 않았다. 추가 개발비는 기존 P23 기능 및 공통기반 재사용 여부별로 분리했다.

QA/QC 자체 검토: 설명자료·시연의 정의된 범위에서 사용 가능. 예산/발주 실무 적용 판정은 조건부이며 실제 서식·권한·기술 실증 필요. 독립 평가위원 또는 실제 TS 사용자 평가를 수행했다고 주장하지 않는다.

## 미수행·잔여 확인사항

실제 로컬 LLM·NOA 연동, TS 데이터·SSO, 실제 예산 경로·기관 양식, HWPX 변환·한컴 렌더, 서버 성능, 제품 인수시험은 미수행. 요구사항12개에 연결한 제품 수용시험은 설계이며 실행0건. 전체 WCAG 적합성·스크린리더·실제 직원 업무시간·정책 품질·예산 확보 효과는 검증하지 않았다.

G 드라이브 경로가 화면 확인 중 일시적으로 열리지 않았으나 드라이브·폴더 재확인 후 정상 접근하여 화면 확인을 완료했다. 삭제·외부 발송·실제 예산 제출·공고 등록·운영 배포는 없음.

## 다음 업무 입력

TS 시범 의제와 담당부서, 실제 예산 요구 경로, 수신기관 양식2종, 승인된 근거 표본, 기존 NOA·서버·이용권 정보를 확보해 기술·업무 검증 단계로 이동한다. 이 정보가 확보되면 공수·일정·고정 템플릿 범위를 재산정한다.

재사용할 검증 규칙: 미확인 금액≠0, 유사사업 검색≠실제 의견조회, 요구액≠승인액≠계약액, 예산 변경 시 요구사항 재검토, 원장과 문서의 버전 연결.
`;
fs.writeFileSync(path.join(dir,'검증기록.md'),report,'utf8');
for(const f of ['표지','전환','모바일'])fs.copyFileSync('C:/Users/Public/Documents/ESTsoft/CreatorTemp/p23x_'+f+'.png',path.join(dir,'검증/직접확인_'+f+'.png'));
fs.copyFileSync(__filename,path.join(dir,'작성자료/p23x_finalize.cjs'));
fs.copyFileSync('C:/Users/Public/Documents/ESTsoft/CreatorTemp/p23x_capture.cjs',path.join(dir,'작성자료/p23x_capture.cjs'));
const files=[];function walk(p){for(const d of fs.readdirSync(p,{withFileTypes:true})){const f=path.join(p,d.name);if(d.isDirectory())walk(f);else if(d.name!=='파일목록_해시.json'){const b=fs.readFileSync(f);files.push({path:path.relative(dir,f).replace(/\\/g,'/'),bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex')});}}}walk(dir);fs.writeFileSync(path.join(dir,'파일목록_해시.json'),JSON.stringify({date:'2026-09-15',count:files.length,files},null,2));
console.log(JSON.stringify({report_ready:true,html_links_rechecked:verified,files:files.length,url:pathToFileURL(path.join(dir,'00_기획_전체보기.html')).href}));
