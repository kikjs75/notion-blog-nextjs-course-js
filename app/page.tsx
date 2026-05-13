import { PostCard } from '@/components/features/blog/PostCard';
import Link from 'next/link';
import TagSection from './_components/TagSection';
import ProfileSection from './_components/ProfileSection';
import ContactSection from './_components/ContactSection';
import { getPublishedPosts } from '@/lib/notion';
import type { Post, TagFilterItem } from '@/types/blog';

// const mockPosts = [
//   {
//     id: '1',
//     title: 'Next.js 13으로 블로그 만들기',
//     description: 'Next.js 13과 Notion API를 활용하여 개인 블로그를 만드는 방법을 알아봅니다.',
//     coverImage: 'https://picsum.photos/800/400',
//     tags: [
//       { id: '1', name: 'Next.js', count: 1 },
//       { id: '2', name: 'React', count: 1 },
//     ],
//     author: '짐코딩',
//     date: '2024-02-01',
//   },
//   {
//     id: '2',
//     title: 'TypeScript 기초 다지기',
//     description: 'TypeScript의 기본 문법과 실전에서 자주 사용되는 패턴들을 살펴봅니다.',
//     coverImage: 'https://picsum.photos/800/401',
//     tags: [
//       { id: '3', name: 'TypeScript', count: 1 },
//       { id: '4', name: 'JavaScript', count: 1 },
//     ],
//     author: '짐코딩',
//     date: '2024-01-15',
//   },
// ];

type SortOrder = 'latest' | 'oldest';

function parseSortOrder(value: unknown): SortOrder {
  // 한글 주석: URL 파라미터는 신뢰할 수 없어서 안전하게 파싱합니다.
  return value === 'oldest' ? 'oldest' : 'latest';
}

function toSortableDateValue(post: Post): number {
  // 한글 주석: date가 없을 수 있으니 modifiedData를 fallback으로 사용합니다.
  const candidate = post.date ?? post.modifiedData;
  const time = Date.parse(candidate);
  return Number.isFinite(time) ? time : 0;
}

function sortPosts(posts: Post[], sortOrder: SortOrder): Post[] {
  const sorted = [...posts].sort((a, b) => toSortableDateValue(b) - toSortableDateValue(a));
  return sortOrder === 'oldest' ? sorted.reverse() : sorted;
}

function filterPostsByTag(posts: Post[], tagName: string | undefined): Post[] {
  // 한글 주석: '전체'는 필터 미적용으로 처리합니다.
  if (!tagName || tagName === '전체') return posts;
  return posts.filter((post) => (post.tags ?? []).includes(tagName));
}

function buildTagItems(posts: Post[]): TagFilterItem[] {
  const counter = new Map<string, number>();

  for (const post of posts) {
    for (const tag of post.tags ?? []) {
      counter.set(tag, (counter.get(tag) ?? 0) + 1);
    }
  }

  const items: TagFilterItem[] = Array.from(counter.entries())
    .map(([name, count]) => ({
      id: name.toLowerCase(),
      name,
      count,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return [{ id: 'all', name: '전체', count: posts.length }, ...items];
}

function buildQueryString(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value && value.length > 0) search.set(key, value);
  }
  const query = search.toString();
  return query.length > 0 ? `?${query}` : '';
}

async function safeGetPublishedPosts(): Promise<Post[]> {
  // 한글 주석: Notion API 오류가 나더라도 홈이 깨지지 않게 방어합니다.
  try {
    return await getPublishedPosts();
  } catch {
    return [];
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const selectedTag = typeof params.tag === 'string' ? params.tag : undefined;
  const sortOrder = parseSortOrder(typeof params.sort === 'string' ? params.sort : undefined);

  const posts = await safeGetPublishedPosts();
  const tags = buildTagItems(posts);
  const visiblePosts = sortPosts(filterPostsByTag(posts, selectedTag), sortOrder);
  return (
    <div className="container py-8">
      <div className="grid grid-cols-[200px_1fr_220px] gap-6">
        {/* 좌측 사이드바 */}
        <aside>
          <TagSection tags={tags} />
        </aside>

        <div className="space-y-8">
          {/* 섹션 제목 */}
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">블로그 목록</h2>
            <div className="flex items-center gap-2 text-sm">
              {/* 한글 주석: 서버 컴포넌트에서 상태를 두기보다 URL 파라미터로 정렬을 제어합니다. */}
              <Link
                href={buildQueryString({ tag: selectedTag, sort: 'latest' })}
                className={`rounded-md px-3 py-2 transition-colors ${
                  sortOrder === 'latest'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground'
                }`}
              >
                최신순
              </Link>
              <Link
                href={buildQueryString({ tag: selectedTag, sort: 'oldest' })}
                className={`rounded-md px-3 py-2 transition-colors ${
                  sortOrder === 'oldest'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground'
                }`}
              >
                오래된순
              </Link>
            </div>
          </div>

          {/* 블로그 카드 그리드 */}
          <div className="grid gap-4">
            {/* 블로그 카드 반복 */}
            {visiblePosts.length === 0 ? (
              <div className="text-muted-foreground rounded-lg border p-8 text-center">
                {/* 한글 주석: 필터 결과가 없거나 Notion 호출 실패 시 빈 상태 UI를 노출합니다. */}
                <p className="font-medium">표시할 글이 없습니다.</p>
                <p className="mt-2 text-sm">
                  {selectedTag
                    ? `선택한 태그(${selectedTag})에 해당하는 글이 없어요.`
                    : '아직 발행된 글이 없어요.'}
                </p>
              </div>
            ) : (
              visiblePosts.map((post) => (
                <Link
                  key={post.id}
                  // 한글 주석: slug가 비어있으면 id로 fallback합니다.
                  href={`/blog/${post.slug && post.slug.length > 0 ? post.slug : post.id}`}
                  className="block"
                >
                  <PostCard post={post} />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* 우측 사이드바 */}
        <aside className="flex flex-col gap-6">
          <ProfileSection />
          <ContactSection />
        </aside>
      </div>
    </div>
  );
}
