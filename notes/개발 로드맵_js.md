아래는 앞서 정리한 **요구사항 명세(Notion CMS + Next.js v15 App Router + TS + Tailwind + Shadcn + Giscus + SEO/ISR)** 를 기준으로 한 **단계별 개발 로드맵**입니다. 각 단계는 실행 단위가 보이도록 쪼개 두었습니다.

---

## Phase 0 — 사전 합의·준비

1. **Notion 콘텐츠 모델 확정**
   - 게시물 DB(또는 페이지) 속성: 제목, 슬러그, 발행일, 요약, 태그, 발행 여부, 썸네일/커버 등
2. **Notion 통합(Integration) 생성**
   - Notion → My integrations → 새 API 키 발급
3. **Notion에서 DB/페이지에 통합 초대**
   - 해당 워크스페이스에서 DB에 연결된 페이지에 통합 “연결”
4. **Giscus 저장소 준비**
   - GitHub 저장소에 Discussions 활성화, Giscus 앱 설치, `repoId` / `categoryId` 확인
5. **배포·도메인 방침 결정**
   - 예: Vercel, 프로덕션 도메인, 스테이징 여부

---

## Phase 1 — Next.js 프로젝트 생성·기본 설정

6. **Next.js v15 프로젝트 생성**
   - `create-next-app`으로 **App Router**, **TypeScript**, **ESLint**, **Tailwind CSS** 포함 생성
7. **`src/` 디렉터리 사용 여부 결정 후 구조 통일**
   - 예: `src/app`, `src/components`, `src/lib`
8. **환경 변수 스켈레톤 추가**
   - `.env.example`에 `NOTION_API_KEY`, `NOTION_DATABASE_ID`(또는 페이지 ID), Giscus 관련 키 자리 마련
9. **`.gitignore`에 `.env.local` 반영 확인**
10. **패키지 매니저·Node 버전 고정(선택)**
    - `engines` 또는 `.nvmrc`

---

## Phase 2 — Tailwind · Shadcn UI

11. **Tailwind 설정 점검**
    - `tailwind.config`, `globals.css`, 다크 모드 전략(class vs media) 결정
12. **Shadcn UI 초기화**
    - `npx shadcn@latest init` (프로젝트 규칙에 맞는 스타일·base color 선택)
13. **레이아웃용 컴포넌트 추가**
    - `Button`, `Card`, `Separator`, `Sheet` 또는 `DropdownMenu` 등 네비·카드에 필요한 것만
14. **전역 레이아웃 구성**
    - `app/layout.tsx`에 폰트, 메타 베이스, 헤더/푸터 슬롯
15. **반응형 브레이크포인트·여백 기준 정하기**
    - 목록/본문 `max-width`, 본문 `prose` 스타일( Tailwind typography 플러그인 도입 여부 결정)

---

## Phase 3 — Notion API 클라이언트·도메인 타입

16. **`@notionhq/client` 설치**
17. **서버 전용 Notion 클라이언트 모듈 작성**
    - 예: `lib/notion/client.ts`에서 `new Client({ auth: process.env.NOTION_API_KEY })`
18. **환경 변수 검증**
    - 빌드/런타임에 키 누락 시 명확히 실패하도록(서버 진입점에서만)
19. **Notion 응답 → 앱 도메인 타입 매핑**
    - `Post`, `PostListItem` 등 TypeScript 타입 정의
20. **속성 추출 헬퍼**
    - `title`, `slug`, `date`, `tags`, `published` 등 DB 프로퍼티 이름 상수화

---

## Phase 4 — 데이터 페치 · 캐시 · ISR

21. **게시물 목록 쿼리 함수**
    - `databases.query` 필터(발행됨만), 정렬(발행일 desc)
22. **단일 게시물 조회 함수**
    - 슬러그(또는 ID)로 DB에서 찾기 + 블록 children 조회 전략 결정
23. **Next.js 캐시/`revalidate` 정책 적용**
    - 목록·상세 fetch에 `next: { revalidate: N }` 또는 `unstable_cache` 등 합의된 N초
24. **에러·빈 결과 처리**
    - API 실패 시 로깅 + 사용자용 빈 상태/에러 UI 분기
25. **Notion Rate limit 대비**
    - 불필요한 중복 요청 제거, 목록에 필요한 필드만 조회

---

## Phase 5 — 라우팅·페이지 (App Router)

26. **홈 페이지 `app/page.tsx`**
    - 소개 + 최근 글 일부
27. **글 목록 페이지 `app/posts/page.tsx`**
28. **글 상세 동적 라우트 `app/posts/[slug]/page.tsx`**
29. **`generateStaticParams` 여부 결정**
    - 빌드 시 전부 정적 경로 생성 vs 일부만 + 나머지 on-demand
30. **전역 `not-found.tsx` 및 posts용 404 처리**
    - 존재하지 않는 슬러그 → `notFound()`

---

## Phase 6 — 본문 렌더링

31. **Notion 블록 → React 매핑 전략 확정**
    - 직접 매핑 vs `react-notion-x` 등 라이브러리(명세에 없으면 팀 결정)
32. **문단·제목·리스트·코드 블록 컴포넌트 구현**
33. **코드 하이라이팅(선택)**
    - `shiki` / `prism` 등
34. **이미지 블록**
    - Next `Image` + `remotePatterns`(Notion 이미지 도메인 허용)
35. **콜아웃·북마크 등 확장 블록**
    - 우선순위 낮은 것은 2차 스프린트로 분리 가능

---

## Phase 7 — SEO · 메타데이터

36. **루트 `layout.tsx` 기본 메타**
    - `metadata`에 `title.template`, `openGraph` 사이트 기본값
37. **목록·상세 `generateMetadata`**
    - 글 제목·요약·OG 이미지 URL
38. **`app/sitemap.ts` 구현**
    - 정적 URL + Notion에서 온 동적 글 URL
39. **`app/robots.ts` 구현**
    - 스테이징은 `disallow` 등 정책 반영
40. **JSON-LD(선택)**
    - `BlogPosting` 스키마

---

## Phase 8 — Giscus

41. **`giscus` React 패키지 설치(또는 공식 스크립트 방식 선택)**
42. **클라이언트 전용 댓글 래퍼 컴포넌트**
    - `'use client'` + Giscus 설정 props
43. **상세 페이지 하단에 삽입**
44. **다크/라이트 테마 연동**
    - Shadcn/theme provider와 동일 값 전달
45. **로딩 실패·차단 시 폴백 UI**
    - 본문과 독립적으로 안내 문구

---

## Phase 9 — 성능·접근성·마무리

46. **Lighthouse/Web Vitals 점검**
    - LCP 이미지 `priority` 등
47. **접근성 점검**
    - 랜드마크, 헤딩 계층, 포커스 링, 대비
48. **에러 바운더리·로딩 UI**
    - `loading.tsx`, `error.tsx`(필요한 세그먼트만)
49. **README·`.env.example` 최종 정리**
    - 로컬 실행·Notion·Giscus 설정 방법

---

## Phase 10 — 배포·운영

50. **GitHub 저장소 연결 및 Vercel(또는 선택 플랫폼) 프로젝트 생성**
51. **프로덕션 환경 변수 등록**
    - Notion 키, Giscus ID, `NEXT_PUBLIC_*` 구분
52. **프로덕션에서 ISR 동작 확인**
    - 글 수정 후 재검증 시간 내 반영 여부
53. **Search Console 제출**
    - 사이트맵 URL 등록

---

### 의존 관계 한 줄 요약

- **Phase 1 → 2** 후 UI 뼈대 위에 **3·4·5**를 병행해도 되고, **6(렌더)** 은 **4·5**와 맞물려 진행합니다.
- **7(SEO)** 은 상세 라우트·메타가 잡힌 뒤(5 후반~6 초반)가 수월합니다.
- **8(Giscus)** 는 상세 페이지가 있으면(5) 바로 붙일 수 있습니다.

원하면 위 단계를 **1주/2주 스프린트 단위**로 나눈 일정표나, **체크리스트용 Markdown 파일** 형태로도 다시 써 드리겠습니다.
