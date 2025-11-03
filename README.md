# BIGS Board

BIGS 프론트엔드 개발자 채용 과제 - 게시판 웹 애플리케이션

## 배포 URL

**🔗 https://bigs-front-mission.vercel.app/**

## 테스트 계정

페이지네이션 등의 기능을 테스트하기 위한 계정입니다.

```
아이디: manyposts@bigs.or.kr
비밀번호: test1234!
```

- 2000개 이상의 게시글이 작성되어 있어 페이지네이션, 정렬, 검색 등을 테스트할 수 있습니다.

## 기술 스택

### Core
- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구

### State Management & Routing
- **Zustand** - 전역 상태 관리 (인증, 세션)
- **React Router DOM** - 라우팅
- **React Hook Form** - 폼 상태 관리 및 검증

### Styling
- **Tailwind CSS 4** - 유틸리티 기반 스타일링
- 커스텀 브레이크포인트 (xs: 400px)
- 완전한 반응형 디자인 (320px ~ 데스크탑)

### HTTP & API
- **Axios** - HTTP 클라이언트
- 자동 토큰 갱신 (Refresh Token)
- 인터셉터 기반 에러 처리

### UI Libraries
- **react-hot-toast** - 토스트 알림 (반응형)
- **react-icons** - 아이콘

## 주요 기능

### 1. 인증 (Authentication)

#### 회원가입
- 이메일 형식 검증
- 비밀번호 강도 검증 (8자 이상, 숫자/영문/특수문자 포함)
- 비밀번호 확인 일치 검증
- 실시간 유효성 검사 및 에러 메시지
- 이름 8자 제한

#### 로그인
- JWT 기반 인증 (Access Token + Refresh Token)
- sessionStorage 토큰 저장 (보안 강화)
- 자동 토큰 갱신 (Axios 인터셉터)
- 로그인 만료 시 오버레이 표시

### 2. 게시판 (Board)

#### 게시글 목록
- **페이지네이션**
  - 페이지당 항목 수 조절 (10/20/50/100)
  - URL 쿼리 파라미터 연동 (`?page=1&size=10&sort=desc`)
  - 브라우저 뒤로가기/앞으로가기 지원
- **정렬**
  - 최신순/오래된순 정렬
- **카테고리 표시**
  - 공지, 자유, Q&A, 기타
- **반응형 그리드**
  - 모바일: 1열
  - 태블릿: 2열
  - 데스크탑: 3열

#### 게시글 작성
- **폼 검증**
  - 제목: 2-30자
  - 내용: 5-5000자
  - 카테고리: 필수 선택
- **이미지 업로드**
  - 최대 1MB (서버 제한)
  - 자동 리사이징 (1920px 기준, 75% 품질)
  - 드래그 앤 드롭 지원
  - 실시간 미리보기
  - 지원 형식: JPG, PNG, GIF, WEBP
- **임시저장**
  - localStorage 기반
  - 최대 10개 저장
  - 중복 방지
  - 7일 자동 삭제
  - 그리드 레이아웃 (모바일 1열, 데스크탑 3열)
  - 내용 미리보기
- **나가기 확인**
  - 작성 중 페이지 벗어날 시 경고
  - 임시저장 옵션 제공
  - 브라우저 새로고침/탭 닫기 감지

#### 게시글 수정
- 기존 내용 불러오기
- **이미지 삭제 기능**
  - X 버튼으로 이미지 삭제
  - 서버에 1x1 투명 PNG 전송
  - 재수정 시 투명 이미지 자동 필터링
- 변경사항 감지 (수정 안 했을 시 버튼 비활성화)

#### 게시글 삭제
- 확인 모달
- 삭제 후 목록으로 이동

#### 게시글 상세
- 카테고리, 제목, 내용, 작성일 표시
- 이미지 표시
- 수정/삭제 버튼

### 3. UI/UX

#### 반응형 디자인
- **브레이크포인트**
  - xs: 400px (모바일 소형)
  - sm: 640px (모바일)
  - md: 768px (태블릿)
  - lg: 1024px (데스크탑)
  - xl: 1280px (와이드)
- **컴포넌트별 최적화**
  - 모바일: 1열 레이아웃, FAB 버튼
  - 태블릿: 2열 그리드
  - 데스크탑: 3열 그리드, 분할 레이아웃

#### 토스트 알림
- **반응형 위치**
  - 모바일: 우하단 (작은 크기)
  - 데스크탑: 상단 중앙 (큰 크기)
- 성공/에러 메시지 구분

#### 로딩 상태
- Spinner 컴포넌트
- 페이지별 로딩 처리

#### 헤더
- 로고 및 브랜딩
- 사용자 정보 표시 (이름, 이메일)
- 로그아웃 버튼

### 4. 보안

- **XSS 방지**: React의 자동 이스케이핑
- **CSRF 방지**: JWT 토큰 기반 인증
- **입력 검증**: 클라이언트/서버 이중 검증
- **토큰 관리**: sessionStorage 사용 (탭 닫으면 자동 삭제)
- **자동 로그아웃**: Refresh Token 만료 시 로그인 페이지 리다이렉트

## 프로젝트 구조

```
src/
├── api/                    # API 호출 함수
│   ├── auth.ts            # 인증 API
│   ├── post.ts            # 게시판 API
│   └── index.ts
├── components/            # 재사용 컴포넌트
│   ├── auth/             # 인증 관련 컴포넌트
│   ├── board/            # 게시판 컴포넌트
│   ├── common/           # 공통 컴포넌트 (Button, Spinner 등)
│   └── index.ts
├── contexts/             # React Context
│   └── NavigationBlockerContext.tsx
├── hooks/                # 커스텀 훅
│   ├── useDraftManager.ts       # 임시저장 관리
│   ├── useFormNavigation.ts     # 폼 네비게이션 차단
│   ├── useImageUpload.ts        # 이미지 업로드 처리
│   └── usePostFormData.ts       # 게시글 데이터 관리
├── layouts/              # 레이아웃 컴포넌트
│   └── AuthenticatedLayout.tsx
├── pages/                # 페이지 컴포넌트
│   ├── SignUp.tsx
│   ├── SignIn.tsx
│   ├── Board.tsx
│   ├── PostDetail.tsx
│   └── PostForm.tsx
├── store/                # Zustand 스토어
│   └── authStore.ts      # 인증 상태 관리
├── types/                # TypeScript 타입 정의
│   ├── auth.ts
│   ├── post.ts
│   └── index.ts
├── utils/                # 유틸리티 함수
│   ├── axios.ts          # Axios 인스턴스 및 인터셉터
│   ├── validation.ts     # 입력 검증
│   ├── errorHandlers.ts  # 에러 처리
│   ├── imageUtils.ts     # 이미지 처리 (리사이징, 투명 PNG 생성)
│   ├── draftUtils.ts     # 임시저장 유틸리티
│   └── constants.ts      # 상수
├── App.tsx               # 루트 컴포넌트
├── main.tsx              # 엔트리 포인트
└── index.css             # 글로벌 스타일
```

## 주요 구현 사항

### 1. 코드 품질

- **관심사의 분리 (Separation of Concerns)**
  - 페이지 컴포넌트는 orchestration만 담당
  - 비즈니스 로직은 커스텀 훅으로 분리
  - UI 컴포넌트는 재사용 가능하게 설계
- **Early Return 패턴**
  - else 문 최소화
  - 가독성 향상
- **타입 안정성**
  - 모든 API 응답 타입 정의
  - strict mode 활성화

### 2. 성능 최적화

- **이미지 최적화**
  - 1MB 초과 시 자동 리사이징
  - Canvas API 활용 (75% 품질)
  - 원본 파일 최대 15MB 제한 (메모리 보호)
- **조건부 리사이징**
  - 1MB 이하 파일은 원본 사용 (품질 보존)
- **debounce/throttle**
  - MediaQuery 변경 감지 최적화

### 3. 사용자 경험 (UX)

- **즉각적인 피드백**
  - 실시간 폼 검증
  - 로딩 스피너
  - 토스트 알림
- **직관적인 UI**
  - 명확한 에러 메시지
  - 비활성화된 버튼에 툴팁
- **접근성**
  - semantic HTML
  - ARIA 속성
  - 키보드 네비게이션

### 4. 에러 처리

- **Axios 인터셉터**
  - 401: 자동 토큰 갱신
  - 403: 권한 없음 에러
  - 500: 서버 에러
- **사용자 친화적 메시지**
  - 네트워크 오류 안내
  - 서버 메시지 우선 표시

## 로컬 실행 방법

### 1. 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

서버는 `http://localhost:5173`에서 실행됩니다.

### 3. 빌드

```bash
npm run build
```

### 4. 프리뷰 (빌드 결과 확인)

```bash
npm run preview
```

## 환경 요구사항

- Node.js 20.19+ 또는 22.12+
- npm 또는 yarn

## API 서버

- Base URL: `https://front-mission.bigs.or.kr`
- CORS 설정 완료
- JWT 인증 방식


## 라이선스

이 프로젝트는 BIGS 프론트엔드 개발자 채용 과제로 제작되었습니다.
