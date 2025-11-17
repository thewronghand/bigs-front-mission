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
- 반응형 디자인 (320px ~ 데스크탑)

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
- 성공 시 성공 UI 표시 및 의도적 지연

#### 로그인
- JWT 기반 인증 (Access Token + Refresh Token)
- sessionStorage 토큰 저장 (보안 강화)
- 자동 토큰 갱신 (Axios 인터셉터)
- 로그인 만료 시 오버레이 표시

### 2. 게시판 (Board)

#### 게시글 목록
- **페이지네이션**
  - 페이지당 항목 수 조절 (12/18/24)
  - 페이지네이션 바 반응형 적용
    - 좁은 화면에서 이전/다음 버튼, 맨앞/맨끝 버튼 투명화
    - 좁은 화면에서 넓은 숫자 버튼이 많으면 (3자릿수 숫자 버튼) 버튼 표시 갯수 줄이기
    - 맨 앞, 맨 뒤 페이지에서 각 방향의 nav버튼 투명화
  - 페이지 이동 기능 제공
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
  - 자동 리사이징 (1MB 초과 첨부 시, 75% 품질)
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

#### 게시글 수정
- 기존 내용 불러오기
- **이미지 삭제 기능**
  - X 버튼으로 이미지 삭제
  - 서버에 1x1 투명 PNG 전송
  - 재수정 시 투명 이미지 자동 필터링
- 변경사항 감지 (수정 안 했을 시 버튼 비활성화)
- 나가기 확인 UI 제공
- 수정 후 게시글 상세보기로 이동

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

- **관심사의 분리**
  - 페이지 컴포넌트는 orchestration만 담당
  - 비즈니스 로직은 커스텀 훅으로 분리
  - UI 컴포넌트는 재사용 가능하게 설계
- **Early Return 패턴**
  - else 문 최소화
  - 가독성 향상

### 2. 성능 최적화

- **이미지 최적화**
  - 1MB 초과 시 자동 리사이징
  - Canvas API 활용 (75% 품질)
  - 원본 파일 최대 15MB 제한 (메모리 보호)
- **조건부 리사이징**
  - 1MB 이하 파일은 원본 사용 (품질 보존)

### 3. 사용자 경험 (UX)

- **즉각적인 피드백**
  - 이미지 프리로드로 레이아웃 시프트 방지
  - 실시간 폼 검증
  - 로딩 스피너
  - 토스트 알림
- **직관적인 UI**
  - 명확한 에러 메시지
  - 페이지 자동 이동 시 UI로 표현 후 의도적 지연

### 4. 에러 처리

- **Axios 인터셉터**
  - 401: 자동 토큰 갱신
  - 403: 권한 없음 에러
  - 500: 서버 에러

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

## 테스트

### 테스트 실행

```bash
# 전체 테스트 실행
npm test

# Watch 모드 (개발 중 실시간 테스트)
npm test -- --watch

# UI 모드 (브라우저에서 테스트 결과 확인)
npm test -- --ui

# 커버리지 리포트
npm test -- --coverage
```

### 테스트 커버리지

**총 612개 테스트 (29개 파일)**

| 카테고리 | 테스트 수 | 파일 수 |
|---------|----------|---------|
| **유틸리티 함수** | 61개 | 5개 |
| **커스텀 훅** | 84개 | 4개 |
| **UI 컴포넌트** | 467개 | 20개 |

#### 상세 커버리지

**유틸리티 (61개)**
- `validation.test.ts` (15) - 이메일, 비밀번호, 이름 검증
- `errorHandlers.test.ts` (16) - API 에러 처리
- `imageUtils.test.ts` (10) - 이미지 리사이징, 포맷 변환
- `draftUtils.test.ts` (16) - 임시저장 관리
- `dateFormat.test.ts` (4) - 날짜 포맷팅

**커스텀 훅 (84개)**
- `useFormNavigation.test.ts` (23) - 폼 네비게이션 차단
- `useDraftManager.test.ts` (26) - 임시저장 로직
- `useImageUpload.test.ts` (17) - 이미지 업로드 처리
- `usePostFormData.test.ts` (18) - 게시글 폼 데이터 관리

**컴포넌트 (467개)**

*Auth 컴포넌트 (97개)*
- FormInput (21), ErrorMessage (10), PasswordRequirements (14)
- SuccessOverlay (15), SessionExpiredOverlay (17), BrandingSection (31)

*Common 컴포넌트 (146개)*
- Button (24), Spinner (14), Header (30), ConfirmModal (25)
- ScrollToTop (11), Pagination (25), PrivateRoute (14), PublicRoute (20)

*Board/Post 컴포넌트 (224개)*
- PostCard (21), ImageUploadSection (35), PostFormFields (39)
- BoardControls (38), DraftsList (33), ExitConfirmModal (32)

### 테스트 전략

#### 1. 관심사의 분리 (Separation of Concerns)
- **비즈니스 로직**: 커스텀 훅으로 분리하여 독립적으로 테스트
- **UI 컴포넌트**: props와 렌더링 로직만 테스트
- **유틸리티**: 순수 함수로 작성하여 테스트 용이성 확보

#### 2. 테스트 도구
- **Vitest** - 빠른 테스트 실행 (Vite 네이티브 지원)
- **React Testing Library** - 사용자 중심 테스트
- **happy-dom** - 경량 DOM 구현체

#### 3. 테스트 범위
- ✅ 모든 유틸리티 함수 (순수 함수)
- ✅ 모든 커스텀 훅 (비즈니스 로직)
- ✅ 모든 재사용 컴포넌트 (UI 로직)
- ✅ 라우트 가드 (보안 로직)
- ⚠️ 페이지 컴포넌트 (컴포지션만 담당, E2E 테스트로 대체 가능)

#### 4. 테스트 커버리지 상세

**핵심 기능별 테스트**
- **인증 흐름**: 회원가입/로그인 폼 검증, JWT 토큰 처리
- **게시글 CRUD**: 작성/수정/삭제 로직, 유효성 검사
- **임시저장**: localStorage 관리, 중복 방지, 자동 삭제
- **이미지 업로드**: 파일 검증, 리사이징, 드래그 앤 드롭
- **페이지네이션**: URL 쿼리 파라미터, 페이지 이동, 정렬
- **반응형 UI**: 브레이크포인트별 레이아웃, 모바일 최적화

### 테스트 활용

#### 개발 중 (Watch 모드)
```bash
npm test -- --watch
```
- 파일 저장 시 관련 테스트 자동 실행
- 즉각적인 피드백으로 빠른 개발 사이클

#### 리팩토링 시
```bash
npm test
```
- 모든 테스트 통과 확인
- 기존 기능이 깨지지 않았는지 검증

#### CI/CD 자동화
- Pull Request 시 자동 테스트 실행
- 테스트 실패 시 머지 방지

## 환경 요구사항

- Node.js 20.19+ 또는 22.12+
- npm 또는 yarn

## API 서버

- Base URL: `https://front-mission.bigs.or.kr`
- CORS 설정 완료
- JWT 인증 방식


## 라이선스

이 프로젝트는 BIGS 프론트엔드 개발자 채용 과제로 제작되었습니다.
