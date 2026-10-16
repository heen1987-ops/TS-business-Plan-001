# 공통 UI 기준

- 적용: 모든 React 경로·정적 웹페이지·신규 생성 페이지. 오프라인 열람용 `downloads/` 독립 문서는 원본 형식 유지
- 글꼴: Pretendard Variable 1.3.9, 저장소 내 웹폰트, SIL Open Font License
- 제목: H1 30px / H2 22px / H3 16px, 모바일 H1 26px / H2 20px
- 본문: 15px / 표·폼·버튼 14px / 좌측 메뉴 13px / 출처·보조 12px
- 본문 여백: 32px, 모바일 18px / 최대 폭 1,360px
- 페이지 순서: 제목·한 줄 요약 → 자료·다운로드 → 본문 선택 → 목록·상세
- 내비게이션: 좌측 196px, 접힘 58px, 모바일 좌측 서랍
- 페이지 작성: `PageFrame` 사용, 상세 영역의 연속 스크롤, 키보드 포커스 표시
- 공통 정본: `public/assets/ui-system.css`; 빌드 시 웹페이지 HTML에 마지막으로 연결
- 새 페이지별 글꼴·제목 크기 재정의 금지, 변형은 공통 토큰에 반영
- 사례집: 조사원장과 심층 사례 구분, 필터·상세·출처·다운로드 순서 유지

폰트 원본: https://github.com/orioncactus/pretendard/tree/v1.3.9
