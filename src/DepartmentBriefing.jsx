import React from 'react';
import {Out} from './core.jsx';
import reader from './department-reader.cjs';
import research from './department-work-research.cjs';
import {DepartmentWorkResearch} from './DepartmentWorkResearch.jsx';
const lines=reader.displayLines;
function Bullets({value}){return <ul>{lines(value).map((text,i)=><li key={i}>{text}</li>)}</ul>}
function Fields({rows}){return <dl className="department-fields">{rows.filter(([,v])=>v).map(([label,value])=><div key={label}><dt>{label}</dt><dd><Bullets value={value}/></dd></div>)}</dl>}
export function DepartmentBriefing({department,topic}){
 if(topic&&research.byKey[department.key])return <DepartmentWorkResearch department={department} topic={topic}/>;
 if(!topic?.briefing)return null;const b=reader.forTopic(topic,department.key),id='department-detail-'+topic.id;
 return <div className="department-briefing" data-department-briefing={topic.id} data-detail-kind={topic.discovery?'discovery':'proposal'}>
  <section id={id+'-scope'} tabIndex={-1}><h3>업무 범위 · 대상 · 시작조건</h3>
   <Fields rows={[[topic.discovery?'확인할 업무 단위':'적용할 업무 단위',b.unit],['대상자·담당 역할',b.users],['업무 시작 시점',b.trigger],['수행 장소·자료 환경','기존 TS 업무공간·기존 시스템·허용된 원자료. 실제 설치환경·접근권한 확인 필요'],['사건·자료 연결 기준',b.key]]}/>
  </section>
  <section id={id+'-basis'} tabIndex={-1}><h3>현재 확인한 내용 · 검증할 문제</h3>
   <div className="department-evidence-split"><div><h4>기존 자료에서 확인한 범위</h4><Bullets value={b.known}/></div><div><h4>{topic.discovery?'현업 확인 목적':'필요성·문제 검증'}</h4><Bullets value={b.why}/><Bullets value={topic.gap||'병목 가설 미배정. 실제 분장·현재 처리·기존 대응·문제 유무 확인부터 진행'}/></div></div>
   <h4>근거 원문 · 확인 범위</h4><ul className="department-source-list">{b.sources.map((s,i)=><li key={s.id||i}>{s.url?<Out url={s.url}>{s.title}</Out>:<strong>{s.title}</strong>}<span>게시·시행: {s.published||s.effective||'미표시'} · 기존 조사: {s.checkedAt||s.accessed||s.date||'기존 기록 참조'}</span><Bullets value={[s.claim||s.fact||s.value||s.finding||s.locator||'구체 원문 위치 추가 확인 필요',s.verification||s.limit||s.verification_scope||s.note||s.scope||'기존 조사 기록의 확인 범위. 현행 내부 분장·구현·성능 직접 검증과 구분']}/></li>)}</ul>
  </section>
  <section id={id+'-inputs'} tabIndex={-1}><h3>처리할 데이터 · 필요한 증빙</h3><Bullets value={b.inputs}/><h4>결과물 · 후속 인계</h4><Bullets value={b.outputs}/></section>
  <section id={id+'-how'} tabIndex={-1}><h3>{topic.discovery?'업무 확인 단계 · 자료 · 산출물':'세부 실행 단계 · 입력 · 처리 · 산출물'}</h3>
   <p className="department-note">{topic.discovery?'솔루션 배정 전의 업무 확인계획. 신규 사업·도입효과·구매수요 미확정':'제안된 업무 전환 설계. 실제 담당자의 처리순서·원기록·연계권한과 대조 필요'}</p>
   <ol className="department-step-list">{b.steps.map((s,i)=><li key={i} data-department-step={i}><h4><span>{String(i+1).padStart(2,'0')}</span>{s.title}</h4><Fields rows={[["입력·선행조건",s.input],["처리·담당 역할",s.operation],["산출·다음 단계",s.output]]}/></li>)}</ol>
   <h4>CCK 제품 · 기존 도구 · 전문가의 역할</h4><Fields rows={b.tech}/>
   <p className="department-note">CCK 제품 역할은 적용 후보 또는 설계안. 실제 버전·사용권·API·실행 기능·성능 검증 후 재사용 범위 확정</p>
   <h4>정상·보완·변경 사례의 검증</h4><Bullets value={b.scenario}/>
  </section>
  <section id={id+'-completion'} tabIndex={-1}><h3>공식 완료조건 · 예외 · 책임 경계</h3><Fields rows={[[topic.discovery?'업무 확인 완료조건':'업무 완료조건',b.complete],['자료 부족·상충·실패 처리',b.exception],['사람의 판단·제외 범위',b.boundary],['개인정보·자료 처리',b.privacy]]}/></section>
  <section id={id+'-metrics'} tabIndex={-1}><h3>기대효과 · 측정방법 · 원기록</h3>{b.metrics.length?<><p className="department-note">현재 기준선·목표값·실측 개선효과 미확정. 아래 지표는 현업 확인용 측정 설계</p>{b.metrics.map((m,i)=><section className="department-metric" key={i} data-department-metric={i}><h4>{i+1}. {m.name}</h4><Fields rows={[["측정식·분모",m.formula],["수집할 원기록",m.records],["비교·측정방법",m.method],["해석조건·반대 결과",m.note]]}/></section>)}</>:<ul><li>업무·문제 확인 전 효과 지표 미설정</li><li>실제 완료결과·오류·반복 부담 확인 후 분모·원기록·비교조건 정의</li><li>자료 미확보를 효과 0 또는 문제 없음으로 대체 금지</li></ul>}</section>
  <section id={id+'-conditions'} tabIndex={-1}><h3>요구환경 · 추가 작업 · 적용 조건</h3><Fields rows={[["초기 적용·인수 검증",b.pilot],["공통플랫폼 재사용",b.common?.reuse],["실행·결과 대사",b.common?.execution],["업무 상태·보완 경로",b.common?.state],["현행·비AI 대안 비교",b.common?.comparison],["처별 증분 공수·비용",b.common?.cost]]}/><ul><li>기존 로컬 LLM·서버 활용 전제. 가용량·망·계정·라이선스·복구 조건 확인 필요</li><li>API·DB·ERP 연계별 조회·변경·결과 확인 권한의 개별 확정</li><li>동일 납품분 제외. 업무 규칙·스킬·데이터 정비·연계·검증·운영 전환의 추가 작업 산정</li></ul></section>
  <section id={id+'-questions'} tabIndex={-1}><h3>이 처에 확인할 핵심 질문 · 필요한 근거</h3>{b.probes.map((q,i)=><section className="department-probe" key={i}><h4>{i+1}. {q.question}</h4><Fields rows={[["확인할 증빙",q.evidence],["확인 목적",q.purpose]]}/></section>)}<p className="department-note">실제 현업 피드백 미수령. 질문·가설·설계와 공식 의사결정의 구분</p></section>
 </div>;
}
export function SelectedPlatformBrief({topic}){const b=topic?.briefing;if(!b)return null;return <><h3>이 과제의 공통플랫폼 확장 방식</h3><Fields rows={[["재사용 확인",b.common?.reuse],["NOA 실행·검증",b.common?.execution],["상태·예외",b.common?.state],["기존 대응 비교",b.common?.comparison]]}/><p className="department-note">부서별 독립 플랫폼 신설보다 기존 AI 플랫폼의 업무 스킬·자료·허용 도구 확장 우선 검토</p></>}
