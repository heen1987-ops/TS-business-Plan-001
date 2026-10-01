const research=require('./association-research.json');
const documents=require('./department-documents.json');
module.exports={
 title:'조사자료실',
 lead:'뉴스·민원·협회 조사와 공식 근거를 자료 종류별로 확인하는 공간. 제안 본문의 문제정의·해결방안·기대효과와 연결되는 참고자료 모음.',
 scope:'기존에 수집한 자료의 분류·연결 정리. 이번 자료실 개편을 새로운 조사·현행 상태의 재검증 완료로 해석하지 않음.',
 categories:[
  {id:'news-research',title:'뉴스·원기사 조사',count:research.news_research.cases.length,unit:'개 사례',description:'원기사·네이버 게재면·공식 대응의 교차 확인. 보도 시점, 확인 범위, 남은 문제 가설의 구분.'},
  {id:'complaint-research',title:'민원·정책건의·협회',count:research.issues.length,unit:'개 공개 쟁점',description:'공개 고충·정책건의·업종 의견과 관련 단체의 연결. 단체별 접수 민원 수와 구별.'},
  {id:'official-research',title:'법령·공식 근거',count:null,unit:'원문·확인 상태',description:'TS 법정업무, 처별 담당 관계, 적용 법령과 제안의 근거 확인. 판본·권한·열람 한계의 구분.'},
  {id:'planning-files',title:'처별 한글 문서',count:documents.departments.reduce((sum,d)=>sum+d.documents.length,0),unit:'개 파일',description:'처별 계획서·대가산정·도식집의 개별 다운로드. 문서별 버전과 작성 상태의 확인.'}
 ],
 notices:[
  '기사·공개 의견은 문제를 탐색하는 근거. 현재의 반복 발생률·기관의 책임·확정 구매수요를 직접 입증하는 자료와 구별.',
  '공개 쟁점 수·관련 조직 기록 수·민원 접수 건수의 구분. 전국 전수조사 완료나 민원 빈도 순위로 해석하지 않음.',
  '사업 본문에서 주장을 뒷받침하는 핵심 출처 유지. 상세 원문·조사 이력은 자료실에서 확인.'
 ],
 headings:{official:'법령·공식 근거',complaints:'민원·정책건의·협회 조사',news:'뉴스·원기사 교차 조사',files:'처별 한글 문서'},
 officialLinks:[
  {title:'사업 필요성·적용범위 재검토 · 2026-10-01',to:'research-library.html?view=planning',detail:'외부 문제에서 신규 문제정의로 연결: 10개 검토 항목, 6개 후보의 실제 사례·현행 대응·대안 비교·검증계획. 13처·DRT 편성 검토와 공식 출처'},
  {title:'법령·업무·담당 처·컨셉 매핑',to:'legal/mapping.html',detail:'법정·수탁업무와 제안의 담당 관계 확인'},
  {title:'법령 원문·판본·확인 범위',to:'legal/sources.html',detail:'출처와 시행일·조사일·적용 한계 확인'},
  {title:'처별 제안의 공개 근거',to:'updates.html?view=evidence47',detail:'근거 등급·열람일·원문 위치와 처별 제안 연결'},
  {title:'처별 공식 홈페이지·시스템',to:'websites.html',detail:'공식 서비스와 담당 근거·확인 대기 상태 확인'}
 ],
 complaintsLead:'공개 쟁점별 원문과 TS 업무 접점의 확인. 아래 목록은 접수 민원 통계가 아닌 조사자료의 분류.',
 complaintsLink:'공개 쟁점·확인 한계 전체보기',
 associationsLink:'협회·관련 조직 찾기',
 newsArchiveLink:'협회 조사 원래 본문·기존 주소',
 documentsLink:'처별 한글 계획서·대가산정·도식집 내려받기',
 downloads:[{title:'전체 협회·민원 조사 문서 · MD',to:'downloads/association-research.md'},{title:'전체 협회·민원 조사 데이터 · JSON',to:'downloads/association-research.json'}],
 issueHeaders:['공개 쟁점·자료 종류','게시일·확인 수준','원문 출처'],
 archiveLabel:'자료 보관·내려받기',
 dateLabel:'기존 조사 기준일',
 filesLead:documents.notice,
 sourceFiles:['src/association-research.json','src/department-documents.json','src/research-library.cjs']
};
