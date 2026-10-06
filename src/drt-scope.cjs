const scope={date:'2026-10-06',core:'기존 TS-DRT를 활용한 접수조건 이해·배차 예외 대응·운영계획 고도화',excluded:'정산감사·부정수급 판단·환수·전국 예산배분은 현재 납품·대가·핵심 성과에서 제외. 기존 검토 내용은 미선정 후속안으로 보존.',authority:'TS 공식 안내는 플랫폼 구축·유지보수와 지자체의 콜센터·차량·기사 운영을 구분. 감사 지원 소프트웨어의 추가가 항상 법 개정을 필요로 하는 것은 아니지만, 적법한 자료 이용과 담당기관 권한 확인 필요. TS의 새로운 감사·환수 권한은 별도 법적 근거 검토 대상.'};
function apply(d){d.date=scope.date;d.scope=scope;d.status='2027년 조건부 운영 고도화 제안 · 추가사업 공고 미매핑 · 현업·추가범위·자료·API 미확정 · 정산감사 현재 과업 제외';d.lead='택시조합 담당자의 전화 접수와 기사 배정 부담을 줄이기 위해, 기존 TS-DRT의 배차·관제 도구에 요청조건 이해·예외 대응·운영계획 검토를 연결하는 제안. 최초 입력은 직원 기록 또는 허용된 기존 전사 텍스트. 전화/STT 연계는 실제 사용권·성능 확인 후 선택.';d.relatedNotice.text=scope.core+'. '+scope.excluded;
 d.summaries=d.summaries.map(([t,v])=>t.includes('후속')?['운영계획','시간·생활권별 수요와 공급, 운영 제약을 비교해 기존 운영계획의 개선안 검토.']: [t,v]);
 d.sources.S01.recheckedAt=scope.date;
 d.sources.S11={title:'보조금 관리에 관한 법률 제28조',url:'https://www.law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1033397805',published:'2026-06-02 시행 판본 · 법률 제21751호',checkedAt:scope.date,kind:'official',fact:'국고보조금 실적심사·보조금액 확정은 중앙관서의 장의 업무로 규정.',limit:'지역 DRT 재원의 실제 유형·사업지침·위탁관계는 별도 확인. 국고 법령을 지방재원에 일괄 적용하거나 TS의 감사·환수 권한으로 확대하지 않음.'};
 const first=d.sections.find(s=>s.id==='why');first.blocks.unshift({type:'note',title:'현재 과업 경계 · '+scope.date,items:[scope.core,scope.excluded,scope.authority,'2026 발주에서 이미 요구한 자동배차·운영표·정산·부정수급 관리 기능은 계약·최종 납품 차분을 확인하고 재개발·중복 대가에서 제외.'],refs:['S01','S11']});
 const rights=d.sections.find(s=>s.id==='rights');rights.title='운영 책임 · 개인정보 · 현재 과업 경계';rights.intro='운영 고도화의 자료·처리 권한과 이용자 보호. 과거 정산·감사 검토는 미선정 후속안으로 보존하며 이번 과업에서 제외.';for(const b of rights.blocks.slice(5)){b.deferred=true;}
 const oldState=d.sections.find(s=>s.id==='flow').blocks.find(b=>b.title==='업무 상태를 섞지 않는 설계');oldState.deferred=true;
 d.sections.find(s=>s.id==='flow').blocks.unshift({type:'note',title:'현재 운영 상태의 완료 기준',items:['접수 → 조건 확인 → 배차 후보 → 운영자 확정 또는 승인된 정상 처리 → 기사 수락 → 실제 운행 확인. 각 상태를 기존 원천 결과와 대조.','AI의 후보 생성, 배정 확정, 기사 수락, 탑승·운행 완료는 별도 상태. 공급 부족·거절·취소·응답 유실은 사유별 예외로 기록.','정산·감사 상태는 현재 운영 종료조건에 포함하지 않음. 기존 정산 시스템의 원장은 그대로 활용.'],refs:['S01']});
 const delivery=d.sections.find(s=>s.id==='delivery');delivery.intro='접수·배차·예외 대응·실제 운행과 운영계획의 변화를 검증하는 단계적 전환. 미선정 정산·감사 검증은 현재 개발·실증·대가·핵심 성과에서 제외.';for(const b of delivery.blocks){if(b.title==='핵심 인수시험안')b.deferred=true;}
 delivery.blocks[0].rows[3]=['4. 운영계획·실제 운행 환류','일/주간 공급계획 비교·운영자 확인과 실적 측정. 정산·감사 확장 제외.','계획의 실행가능성·미충족 지역의 원인·이용자 조건 충족 여부 검증. 기존 운영표의 중복 신설 제외.'];
 delivery.blocks[1].rows[3][1]='잠금·기사 수락·취소 경합·운행 이벤트·기존 운행원장 결과 대사';
 for(const s of d.sections)for(const b of s.blocks){if(b.type==='visual')b.caption+=' 현재 과업: 접수·배차·운영계획. 그림의 정산·감사 확장 요소는 미선정 후속안이며 현재 납품·대가 제외.';if(['why','solution','architecture'].includes(s.id)&&b.rows)for(const r of b.rows){if(r.some(t=>/Grantee|후속검증|후속 정산|정산·감사 지원/.test(t))||/^정산 처리/.test(r[0])){r[0]='[후속 검토 · 현재 과업 제외] '+r[0];}}}
}
module.exports={scope,apply};
