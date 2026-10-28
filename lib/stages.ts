export type Stage = {
  kicker: string;
  title: string;
  meta: string;
  /** Short lines painted on the roadside billboard. */
  board: string[];
  groups: { h: string; items: string[] }[];
  tech: string[];
  links?: [label: string, href: string][];
  email?: string;
};

export const RESUME_URL = 'https://pickle-weeder-20b.notion.site/59bd0bc3fef244edbcf024827aeda484';
export const EMAIL = 'gth1123@naver.com';

export const STAGES: Stage[] = [
  {
    kicker: 'About',
    title: '고태환 · FDE',
    meta: 'Forward Deployed Engineer',
    board: [
      '고객 현장에서 끝까지 해내는 엔지니어',
      '제조 데이터 SaaS 3개 제품 FE·BE·파이프라인·IoT',
      '측정하고, 원인을 찾고, 수치로 검증',
    ],
    groups: [
      {
        h: 'INTRODUCTION',
        items: [
          '고객 중심으로 생각하고 끝까지 해내는 FDE(Forward Deployed Engineer)입니다',
          '제조 현장 데이터 SaaS 3개 제품(Machine365 · Eco365 · Factory365)에서 프론트엔드, 백엔드, 데이터 파이프라인, 현장 IoT 장비까지 맡아 왔습니다',
          '고객 공장에 약 2개월 직접 출근하며 요구사항 수집부터 설계·개발·배포·데이터 보정까지 책임졌습니다',
          '운영 데이터를 직접 측정해 원인을 찾고, 수치로 검증한 뒤 고칩니다',
          '배운 것을 문서와 스터디로 공유하며 함께 성장하는 것을 좋아합니다',
        ],
      },
    ],
    tech: [],
  },
  {
    kicker: 'Skills',
    title: 'Skills',
    meta: 'Soft Skills · Hard Skills',
    board: [
      'Frontend · TypeScript, React, Next.js',
      'Backend · Java 17, Spring Boot 3, FastAPI',
      'Cloud·IoT · Azure, MQTT, OPC UA',
      'Observability · Datadog, Elasticsearch',
    ],
    groups: [
      {
        h: 'SOFT',
        items: [
          '현장 중심 문제 정의: 고객 공장에서 요구를 듣고 기능과 데이터 설계로 바꿉니다',
          '근거 기반 원인 분석: 운영 데이터와 실행계획을 측정해 원인을 확정한 뒤 고칩니다',
          '끝까지 책임지는 실행: 요구 접수 → 설계 → 개발 → 배포 → 데이터 보정 → 마감',
          '문서화와 지식 공유: 설계·TDD 문서, 팀 위키, 온보딩 가이드',
        ],
      },
      {
        h: 'HARD',
        items: [
          'Frontend: TypeScript, React, Next.js, TanStack Query, Recoil, Zustand, Redux, react-hook-form, Tailwind, shadcn/ui, AG Grid, ECharts, ApexCharts, GraphQL, NX, Rollup, Jest',
          'Mobile · Desktop: React Native(Expo), Electron',
          'Backend · DB: Java 17, Spring Boot 3, JPA, Python, FastAPI, SQLAlchemy, NodeJS, SQL 성능 분석·튜닝(MSSQL, PostgreSQL)',
          'Cloud · IoT: Azure(IoT Hub, Functions, Blob Storage, Container Apps), MQTT, OPC UA, Ansible, Jenkins, Docker, Nginx, Ubuntu',
          'Observability: Datadog, FluentD, Elasticsearch',
          'Tools: Git, GitHub Actions, Jira, Confluence, Redmine, Claude Code(MCP·Skills), Copilot, Obsidian, draw.io',
        ],
      },
    ],
    tech: [],
  },
  {
    kicker: 'Career',
    title: '쓰리뷰 3View',
    meta: '선임 · 2023.12 ~ 현재',
    board: [
      '제조 현장 데이터 SaaS 3개 제품 담당',
      'PR 1,666건 작성 (98% 머지)',
      '리뷰 1,511건 · Jira 1,488건 (96% 완료)',
    ],
    groups: [
      {
        h: 'OVERVIEW',
        items: [
          'Machine365 · Eco365 · Factory365의 프론트엔드, 백엔드, 데이터 수집 파이프라인, 현장 IoT 장비까지 담당',
          'PR 1,666건 작성(98% 머지) · 1,511건 리뷰, Jira 1,488건 담당(96% 완료)',
          '다음 스테이지부터 제품별 프로젝트가 이어집니다',
        ],
      },
    ],
    tech: [],
  },
  {
    kicker: 'Project',
    title: 'Factory365',
    meta: '멀티테넌트 MES 현장 상주 개발 · 2026.07 ~ 현재',
    board: [
      '고객 공장 약 2개월 상주 · 요구부터 보정까지',
      '외주출고 중량 0 → 1,422줄 · 약 349t 복구',
      '커넥션 고갈 대응 2,248ms → 0.067ms',
      '상주 8주 PR 263건 · 티켓 160건',
    ],
    groups: [
      {
        h: 'FIELD',
        items: [
          '요구사항 수집 → 분석·설계 문서 → 백엔드·관리자 웹·작업자 키오스크·공장 엣지 서버 구현 → 운영 배포 → 데이터 보정',
          '고객 이슈 115건 담당, 96건 완료 · 처리 티켓의 55%가 2개 이상 서비스를 함께 바꾼 작업',
        ],
      },
      {
        h: 'HIGHLIGHTS',
        items: [
          '키오스크 출고 2,652줄 중 53.6%가 중량 0으로 저장되던 원인을 찾아 공정 라우팅 기준으로 수정, 보정 SQL로 1,422줄·약 349t 복구 (문의 당일)',
          '20만 행 풀스캔으로 생긴 커넥션 풀 타임아웃을 pg_stat_statements·Datadog으로 확정, 함수 인덱스로 2,248ms → 0.067ms',
          '고객사가 하드코딩된 로트 계보 DB 함수를 백엔드 재귀 CTE로 이관, 계보 맵 화면 구현',
          '공구 재고 상세 조회 175.6ms → 86.9ms, 결과 대조 차이 0행으로 회귀 검증',
          '외주 분할 입고: 3개 레포 동시 변경, 운영 30일 데이터 2,029건으로 호환성 검증',
          '투입 첫날 지식베이스 구축(도메인 19편·DB 11편), 설계·TDD 문서 124편',
        ],
      },
    ],
    tech: ['Spring Boot 3', 'Java 17', 'PostgreSQL', 'Next.js 14', 'Electron', 'MQTT', 'OPC UA', 'Datadog'],
  },
  {
    kicker: 'Project',
    title: 'Machine365',
    meta: '설비 모니터링·에너지 관리(FEMS) SaaS · 2023.12 ~ 현재',
    board: [
      'v1 → v2 리뉴얼 프론트 단독 (커밋 99%)',
      'v2 → v3 UX 3.0 전환 리드',
      '39초 응답 원인(JPA EAGER) 제거',
      'Expo 앱 App Store · Google Play 출시',
    ],
    groups: [
      {
        h: 'V2 RENEWAL',
        items: [
          'Pages Router → App Router, Tailwind·shadcn/ui 도입, PC·모바일 화면 분리',
          '리뉴얼 기간 커밋 99%(487/492), 5개월 만에 v2 기본화 · v1 제거',
        ],
      },
      {
        h: 'V2 OPERATION',
        items: [
          '다국어 5개 언어(약 3,000키), DB 기반 동적 메뉴·권한, 드래그앤드롭 메뉴 편집기',
          '분전반(FEMS) 메뉴군, ECharts sankey 에너지 계통도, 한전 요금 시뮬레이션·목표 피크 알림',
        ],
      },
      {
        h: 'V3 LEAD',
        items: [
          '셸·내비게이션 설계, 데모 → 베타 토글 → 기본화 → v2 제거의 단계적 전환',
          '3인 프론트 팀에서 팀원 PR의 77% 리뷰',
          '에너지 메뉴 통합 개편: 통합 API 8종 명세 후 FE·BE 구현, 커버링 인덱스로 Key Lookup 제거',
          '쿼리 튜닝 30일 조회 720ms → 57ms, 직전 행 조회 0.2ms',
        ],
      },
      { h: 'MOBILE', items: ['Expo 하이브리드 앱을 처음부터 개발해 스토어 출시, Expo SDK 51 → 55 업그레이드'] },
    ],
    tech: ['Next.js 14', 'TypeScript', 'TanStack Query', 'ECharts', 'Expo', 'Spring Boot 3', 'Azure SQL'],
  },
  {
    kicker: 'Project',
    title: 'Eco365',
    meta: '탄소 관리(PCF·CBAM) SaaS · 2025.06 ~ 2026.03',
    board: [
      '프론트 커밋 1위 · 화면 75개 중 45개 주도',
      'ISO 14067 PCF 분석 전체 흐름 구현',
      'PCF 보고서 자동 생성 (Word → PDF)',
      'CBAM 배출량 산정 API (FastAPI)',
    ],
    groups: [
      {
        h: 'HIGHLIGHTS',
        items: [
          '프론트엔드 핵심 개발(현재 코드의 41%) + FastAPI 산정 API 개발',
          'PCF 흐름: 목표·범위 → 데이터 수집 8개 섹션 → 할당·검증 → 전과정목록 → 탄소발자국 결과(기여도·불확도·민감도)',
          'docx.js로 ISO 14067 양식 Word 생성 → LibreOffice PDF 변환, CBAM 보고서가 같은 구조 재사용',
          'CBAM 내재배출량·전구물질·제품 고유내재배출량(SEE) API와 계산식 문서',
          '유틸리티 시설 솔루션 실서비스 전환, 백엔드 API 6종 신규',
          'PCF 심사 부적합 12건 처리, TÜV CBAM 인증심사 권고사항 반영',
        ],
      },
    ],
    tech: ['Next.js 15', 'React 19', 'Zustand', 'docx', 'FastAPI', 'SQLAlchemy 2', 'MSSQL'],
  },
  {
    kicker: 'Project',
    title: '현장 데이터 파이프라인',
    meta: 'IoT 장비 · 모니터링 · 2024 ~ 현재',
    board: [
      '장비 → IoT Hub → Blob → Function → SQL',
      '산업용 PC 약 30개 현장 배포',
      '전력 0값 원인 특정 (사이클 성공률 약 84%)',
      'Datadog RUM · E2E 회귀 + Slack 알림',
    ],
    groups: [
      {
        h: 'HIGHLIGHTS',
        items: [
          'Azure 수집 워크플로우 운영, 장비 디바이스 키 일괄 발급(Jenkins), Function App 수신 로직 개발',
          '산업용 PC 세팅과 데이터 전송 프로그램·FluentD를 Ansible·Jenkins로 배포 (약 30개 현장, 한 현장 최대 50대)',
          '장비 46대 동시 재연결로 생긴 Elasticsearch OOM의 원인 장비 특정',
          '전력 0값: 17회 순차 읽기가 하나의 예외 처리로 묶인 구조 특정',
          '중복 데이터 알림 30일 분석: 127구간 중 실제 중복 2회, 오탐의 83%가 0 채움',
          'Datadog RUM·Session Replay, 브라우저 테스트 E2E 회귀, Bits AI 대시보드',
        ],
      },
    ],
    tech: ['Azure IoT Hub', 'Functions', 'Python', 'Ansible', 'Jenkins', 'FluentD', 'Elasticsearch', 'Datadog'],
  },
  {
    kicker: 'Project',
    title: '지식 체계 · AI · 보안',
    meta: '쓰리뷰 사내 활동',
    board: [
      '사내 LLM 위키 기획 · 구축 (30명 대상)',
      '팀 위키 최다 기여 488커밋 · 문서 239편',
      'Claude Code 스킬로 개발 규칙 표준화',
      'SW 보안약점 162건 분류 · 139건 수정',
    ],
    groups: [
      {
        h: 'HIGHLIGHTS',
        items: [
          'git 마크다운 + Obsidian + Claude MCP 사내 LLM 위키를 팀 위키로 이관, 온보딩 가이드 작성',
          '설계·TDD 문서 239편, 다이어그램 226점, Confluence 발행',
          'Factory365 개발 규칙 스킬(11문서·약 2,500줄), Redmine 연동 스킬, Eco365 스킬 문서 51편',
          '감리 보안약점: Eco365 162건 분류·139건 수정, Machine365 50건 수정',
          '회사 홈페이지(Next.js 15, 4개 언어) 인수 운영',
        ],
      },
    ],
    tech: ['Claude Code', 'MCP', 'Obsidian', 'Confluence'],
  },
  {
    kicker: 'Career',
    title: 'Bubblecon',
    meta: '프론트엔드 · 2022.08 ~ 2023.12',
    board: [
      'NX 모노레포 데이터 수집 라이브러리',
      '충남교육청 LRS 대시보드',
      '대교 중국어 학습 콘텐츠 (저작도구 · 사용자앱)',
      'React Native 인증앱 스토어 배포',
    ],
    groups: [
      {
        h: 'PROJECTS',
        items: [
          '교육 데이터 수집 라이브러리: NX 모노레포, Rollup 패키지와 테스트용 Next.js 앱',
          '충남교육청 LRS 대시보드: 수집된 학습 데이터를 차트로 시각화',
          '대교 중국어 학습 콘텐츠: 도메인 JSON·API 설계, 타입 주도 개발, 관리자앱·사용자앱·공통 UI 모노레포',
          'KIRD 알파 캠퍼스 유지보수: 구글 OTP 2차 인증 도입',
          '한기대 통합학습창: 비디오·문서·퀴즈',
          '충남교육청 QR 인증앱(React Native CLI) 스토어 배포',
          '온보딩·코드 규칙·ESLint·Githook·RN 배포·Storybook 문서 정리',
        ],
      },
    ],
    tech: ['React', 'Next.js', 'TypeScript', 'NX', 'Recoil', 'React Query', 'React Native'],
  },
  {
    kicker: 'Career',
    title: 'DShare',
    meta: '프론트엔드 · 2021.11 ~ 2022.04',
    board: ['내모(내신의 모든 것) 서비스 고도화', 'Google Analytics 도입', '백오피스(CRM) 필터 기능 유지보수'],
    groups: [
      {
        h: 'PROJECTS',
        items: [
          '내모 서비스 고도화: 문제 풀이 프로세스와 UI가 바뀐 신규 기능, Google Analytics 도입',
          '내모 백오피스(CRM): 필터 기능 추가 및 수정',
        ],
      },
    ],
    tech: ['Next.js', 'TypeScript', 'Recoil', 'React Query', 'MUI', 'Antd'],
  },
  {
    kicker: 'Career',
    title: '애드크림',
    meta: '프론트엔드 · 2021.07 ~ 2021.11',
    board: ['TVCF 회원 콘텐츠 관리 웹 유지보수', '어워드 페이지 신규 개발'],
    groups: [
      {
        h: 'PROJECTS',
        items: [
          'TVCF 회원 개인 콘텐츠 관리 웹: 기능 추가 및 수정 (React, Redux, Typesafe-actions)',
          '어워드 페이지: 신규 페이지 및 기능 개발 (classic ASP, SCSS)',
        ],
      },
    ],
    tech: ['React', 'TypeScript', 'Redux', 'Material-UI', 'classic ASP'],
  },
  {
    kicker: 'Career',
    title: '코넥 · 설비보전팀',
    meta: '2017.06 ~ 2018.10',
    board: ['자동차 부품 공장 가공설비 유지보수', '설비 예비품 · 업체 AS 관리', '현장 직원 관리 및 지원'],
    groups: [
      {
        h: 'WORK',
        items: ['자동차 부품 공장 가공설비 유지보수', '설비 예비품 관리, 설비 업체 AS 관리', '현장 직원 관리 및 지원'],
      },
    ],
    tech: [],
  },
  {
    kicker: 'Know-how',
    title: 'AI 활용 노하우',
    meta: 'Claude Code 중심 개발 흐름',
    board: [
      '탭 7~10개 · git worktree로 티켓 3개 병렬',
      '착수 시 설계 문서, 종료 시 변경 반영',
      'DB MCP는 읽기 전용 계정만',
      'Datadog 알림 전용 DevOps 세션 상시 운영',
    ],
    groups: [
      {
        h: 'MULTI-SESSION',
        items: [
          '프로젝트마다 메인 세션, 티켓마다 탭과 git worktree로 작업 공간 분리',
          'Claude Code 탭 7~10개로 티켓 3개 정도를 동시에 처리',
        ],
      },
      {
        h: 'DESIGN & VERIFY',
        items: [
          '티켓 착수 시 사내 LLM 위키에 설계 문서, 종료 시 바뀐 내용 반영',
          'DB 변경은 draw.io 다이어그램으로 먼저 그리고 직접 확인 후 진행',
          'DB MCP는 읽기 전용 계정만, 데이터를 바꾸는 쿼리는 직접 실행',
          '네거티브 케이스 포함 테스트케이스 문서 → 머지 전 Playwright 자동 검증 → 직접 사용 확인',
        ],
      },
      {
        h: 'MONITORING',
        items: [
          'Datadog 알림 원인 분석 DevOps 세션 상시 운영, Remote Control로 모바일 확인',
          '클라우드 Claude Code가 문서와 알림을 2시간마다 취합해 이메일 보고',
        ],
      },
    ],
    tech: ['Claude Code', 'git worktree', 'MCP', 'Playwright', 'Datadog'],
  },
  {
    kicker: 'Personal',
    title: '스터디',
    meta: '2021 ~ 2023',
    board: [
      '함수형 코딩 · 운영체제 · 디자인 패턴',
      '타입스크립트 · 자바스크립트 Deep Dive',
      '리팩터링 2판 · HTTP 완벽가이드',
    ],
    groups: [
      {
        h: 'STUDIES',
        items: [
          '쏙쏙 들어오는 함수형 코딩 (2023.08 ~ 2023.10)',
          '운영체제 Operating System Concepts 발표 (2023.01 ~ 2023.06)',
          '헤드 퍼스트 디자인 패턴 발표·토론 (2022.10 ~ 2023.01)',
          '타입스크립트 프로그래밍 (2022.05 ~ 2022.06)',
          '자바스크립트 Deep Dive (2022.02 ~ 2022.04)',
          '리팩터링 2판 (2021.11 ~ 2022.02)',
          'HTTP 완벽가이드 (2021.10 ~ 2022.02)',
        ],
      },
    ],
    tech: [],
    links: [
      ['함수형 코딩 노트', 'https://github.com/TaehwanGo/books/tree/main/Grokking-Simplicity'],
      ['운영체제 스터디', 'https://github.com/Metacognition-Polymath/operating-system-concepts'],
      ['디자인 패턴 스터디', 'https://github.com/Metacognition-Polymath/design-pattern'],
      ['리팩터링 2판 스터디', 'https://github.com/Metacognition-Polymath/refactoring-2nd-edition'],
    ],
  },
  {
    kicker: 'Contact',
    title: 'Contact',
    meta: '여기까지 달려 주셔서 감사합니다',
    board: ['gth1123@naver.com', 'github.com/TaehwanGo', 'velog.io/@gth1123'],
    groups: [{ h: 'CHANNELS', items: ['더 궁금한 내용이 있으시면 이메일로 연락 부탁드립니다'] }],
    tech: [],
    email: EMAIL,
    links: [
      ['GitHub · TaehwanGo', 'https://github.com/TaehwanGo'],
      ['GitHub · GoTaehwan', 'https://github.com/GoTaehwan'],
      ['기술 블로그 · velog', 'https://velog.io/@gth1123'],
      ['개인 블로그', 'https://blog.naver.com/gth1123'],
      ['이력서 웹으로 보기 (Notion)', RESUME_URL],
    ],
  },
];
