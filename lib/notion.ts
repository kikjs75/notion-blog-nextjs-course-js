import { Client } from '@notionhq/client';
import type { Post, TagFilterItem } from '@/types/blog';
import type {
  PageObjectResponse,
  PersonUserObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { NotionToMarkdown } from 'notion-to-md';
import { unstable_cache } from 'next/cache';

/** 목록·태그용 데이터 캐시 무효화 시 revalidateTag에 넘기는 이름 */
export const BLOG_POSTS_CACHE_TAG = 'posts';

/** Notion 반영(삭제·추가 등) 후 ISR·Data Cache와 맞추기 위한 초 단위 (페이지 revalidate와 동일하게 유지) */
export const BLOG_REVALIDATE_SECONDS = 60;

export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const n2m = new NotionToMarkdown({ notionClient: notion });

export const getTags = async (): Promise<TagFilterItem[]> => {
  const { posts } = await getPublishedPosts({ pageSize: 100 });

  // 모든 태그를 추출하고 각 태그의 출현 횟수를 계산
  const tagCount = posts.reduce(
    (acc, post) => {
      post.tags?.forEach((tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    },
    {} as Record<string, number>
  );

  // TagFilterItem 형식으로 변환
  const tags: TagFilterItem[] = Object.entries(tagCount).map(([name, count]) => ({
    id: name,
    name,
    count,
  }));

  // "전체" 태그 추가
  tags.unshift({
    id: 'all',
    name: '전체',
    count: posts.length,
  });

  // 태그 이름 기준으로 정렬 ("전체" 태그는 항상 첫 번째에 위치하도록 제외)
  const [allTag, ...restTags] = tags;
  const sortedTags = restTags.sort((a, b) => a.name.localeCompare(b.name));

  return [allTag, ...sortedTags];
};

function getPostMetadata(page: PageObjectResponse): Post {
  const { properties } = page;

  const getCoverImage = (cover: PageObjectResponse['cover']) => {
    if (!cover) return '';

    switch (cover.type) {
      case 'external':
        return cover.external.url;
      case 'file':
        return cover.file.url;
      default:
        return '';
    }
  };

  return {
    id: page.id,
    title: properties.Title.type === 'title' ? (properties.Title.title[0]?.plain_text ?? '') : '',
    description:
      properties.Description.type === 'rich_text'
        ? (properties.Description.rich_text[0]?.plain_text ?? '')
        : '',
    coverImage: getCoverImage(page.cover),
    tags:
      properties.Tags.type === 'multi_select'
        ? properties.Tags.multi_select.map((tag) => tag.name)
        : [],
    author:
      properties.Author.type === 'people'
        ? ((properties.Author.people[0] as PersonUserObjectResponse)?.name ?? '')
        : '',
    date: properties.Date.type === 'date' ? (properties.Date.date?.start ?? '') : '',
    modifiedDate: page.last_edited_time,
    slug:
      properties.Slug.type === 'rich_text'
        ? (properties.Slug.rich_text[0]?.plain_text ?? page.id)
        : page.id,
  };
}

/** Slug가 비어 목록에서 page.id를 slug로 쓸 때, Slug 필드만 조회하면 0건이 될 수 있어 UUID 형태인지 구분합니다. */
function isLikelyNotionPageId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

/** retrieve 폴백 시 우리 블로그 DB 소속·게시 상태만 허용 */
function isPublishedPostInBlogDatabase(page: PageObjectResponse): boolean {
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!databaseId) return false;

  const parent = page.parent;
  if (parent.type !== 'database_id') return false;

  const normalized = (id: string) => id.replace(/-/g, '');
  if (normalized(parent.database_id) !== normalized(databaseId)) return false;

  const status = page.properties.Status;
  return status?.type === 'select' && status.select?.name === 'Published';
}

export const getPostBySlug = async (
  slug: string
): Promise<{
  markdown: string;
  post: Post | null; // 한글 주석: slug에 해당하는 글이 없으면 null 반환
}> => {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID!,
    filter: {
      and: [
        {
          property: 'Slug',
          rich_text: {
            equals: slug,
          },
        },
        {
          property: 'Status',
          select: {
            equals: 'Published',
          },
        },
      ],
    },
  });

  let page: PageObjectResponse | undefined = response.results.find(
    (result): result is PageObjectResponse => 'properties' in result
  );

  // Slug 필드가 비어 있으면 목록에서는 page.id가 slug로 노출되지만 위 쿼리는 매칭 실패 → ID로 직접 조회
  if (!page && isLikelyNotionPageId(slug)) {
    try {
      const retrieved = await notion.pages.retrieve({ page_id: slug });
      if ('properties' in retrieved && isPublishedPostInBlogDatabase(retrieved)) {
        page = retrieved;
      }
    } catch {
      // 페이지 없음·삭제·권한 없음 등 — 아래에서 post: null 처리
    }
  }

  if (!page) {
    return {
      markdown: '',
      post: null,
    };
  }

  const mBlocks = await n2m.pageToMarkdown(page.id);
  const { parent } = n2m.toMarkdownString(mBlocks);

  return {
    markdown: parent,
    post: getPostMetadata(page),
  };
};

export interface GetPublishedPostsParams {
  tag?: string;
  sort?: string;
  pageSize?: number;
  startCursor?: string;
}

export interface GetPublishedPostsResponse {
  posts: Post[];
  hasMore: boolean;
  nextCursor: string | null;
}

async function fetchPublishedPostsFromNotion({
  tag,
  sort,
  pageSize = 2,
  startCursor,
}: GetPublishedPostsParams): Promise<GetPublishedPostsResponse> {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID!,
    filter: {
      property: 'Status',
      select: {
        equals: 'Published',
      },
      and: [
        {
          property: 'Status',
          select: {
            equals: 'Published',
          },
        },
        ...(tag && tag !== '전체'
          ? [
              {
                property: 'Tags',
                multi_select: {
                  contains: tag,
                },
              },
            ]
          : []),
      ],
    },
    sorts: [
      {
        property: 'Date',
        direction: sort === 'oldest' ? 'ascending' : 'descending',
      },
    ],
    page_size: pageSize,
    start_cursor: startCursor,
  });

  const posts = response.results
    .filter((page): page is PageObjectResponse => 'properties' in page)
    .map(getPostMetadata);

  return {
    posts,
    hasMore: response.has_more,
    nextCursor: response.next_cursor,
  };
}

/**
 * 게시 목록 조회 (태그·정렬·페이지별로 캐시 분리 + TTL 만료로 Notion 삭제 반영)
 */
export async function getPublishedPosts(
  params: GetPublishedPostsParams = {}
): Promise<GetPublishedPostsResponse> {
  const pageSize = params.pageSize ?? 2;
  const tagKey = params.tag ?? '';
  const sortKey = params.sort ?? '';
  const cursorKey = params.startCursor ?? '';

  const run = unstable_cache(
    async () =>
      fetchPublishedPostsFromNotion({
        tag: params.tag,
        sort: params.sort,
        pageSize,
        startCursor: params.startCursor,
      }),
    ['posts', tagKey, sortKey, String(pageSize), cursorKey],
    {
      tags: [BLOG_POSTS_CACHE_TAG],
      revalidate: BLOG_REVALIDATE_SECONDS,
    }
  );

  return run();
}

/** 빌드 시 등 전체 Published 게시물 순회 (generateStaticParams용) */
export async function getAllPublishedPosts(): Promise<Post[]> {
  const aggregated: Post[] = [];
  let startCursor: string | undefined;

  for (;;) {
    const { posts, hasMore, nextCursor } = await getPublishedPosts({
      pageSize: 100,
      startCursor,
    });
    aggregated.push(...posts);
    if (!hasMore || nextCursor == null) break;
    startCursor = nextCursor;
  }

  return aggregated;
}

export interface CreatePostParams {
  title: string;
  tag: string;
  content: string;
}

export const createPost = async ({ title, tag, content }: CreatePostParams) => {
  const response = await notion.pages.create({
    parent: {
      database_id: process.env.NOTION_DATABASE_ID!,
    },
    properties: {
      Title: {
        title: [
          {
            text: {
              content: title,
            },
          },
        ],
      },
      Description: {
        rich_text: [
          {
            text: {
              content: content,
            },
          },
        ],
      },
      Tags: {
        multi_select: [{ name: tag }],
      },
      Status: {
        select: {
          name: 'Published',
        },
      },
      Date: {
        date: {
          start: new Date().toISOString(),
        },
      },
    },
  });

  return response;
};
