import { Client } from '@notionhq/client';
import type { Post } from '@/types/blog';

export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

type NotionEnv = {
  notionToken: string;
  databaseId: string;
};

function getNotionEnv(): NotionEnv {
  // 한글 주석: 서버 런타임에서 환경변수가 비어있을 수 있으므로 반드시 방어합니다.
  const notionToken = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID ?? process.env.DATABASE_ID;

  if (!notionToken) {
    throw new Error('NOTION_TOKEN이 설정되지 않았습니다. (.env 확인)');
  }

  if (!databaseId) {
    throw new Error('NOTION_DATABASE_ID(또는 DATABASE_ID)가 설정되지 않았습니다. (.env 확인)');
  }

  return { notionToken, databaseId };
}

function getCoverImageUrl(cover: unknown): string | undefined {
  if (!cover || typeof cover !== 'object') return undefined;
  const record = cover as Record<string, unknown>;
  const type = record.type;

  if (type === 'external') {
    const external = record.external as { url?: unknown } | undefined;
    return typeof external?.url === 'string' ? external.url : undefined;
  }

  if (type === 'file') {
    const file = record.file as { url?: unknown } | undefined;
    return typeof file?.url === 'string' ? file.url : undefined;
  }

  return undefined;
}

function getRichTextPlainText(properties: unknown, propertyName: string): string | undefined {
  if (!properties || typeof properties !== 'object') return undefined;
  const record = properties as Record<string, unknown>;

  const prop = record[propertyName] as { rich_text?: Array<{ plain_text?: unknown }> } | undefined;
  const first = prop?.rich_text?.[0]?.plain_text;
  return typeof first === 'string' && first.trim().length > 0 ? first : undefined;
}

function getTitlePlainText(properties: unknown, propertyName: string): string {
  if (!properties || typeof properties !== 'object') return 'Untitled';
  const record = properties as Record<string, unknown>;

  const prop = record[propertyName] as { title?: Array<{ plain_text?: unknown }> } | undefined;
  const first = prop?.title?.[0]?.plain_text;
  return typeof first === 'string' && first.trim().length > 0 ? first : 'Untitled';
}

function getMultiSelectNames(properties: unknown, propertyName: string): string[] {
  if (!properties || typeof properties !== 'object') return [];
  const record = properties as Record<string, unknown>;

  const prop = record[propertyName] as { multi_select?: Array<{ name?: unknown }> } | undefined;

  const names = prop?.multi_select
    ?.map((item) => (typeof item?.name === 'string' ? item.name : undefined))
    .filter((name): name is string => typeof name === 'string' && name.length > 0);

  return names ?? [];
}

function getDateStart(properties: unknown, propertyName: string): string | undefined {
  if (!properties || typeof properties !== 'object') return undefined;
  const record = properties as Record<string, unknown>;

  const prop = record[propertyName] as { date?: { start?: unknown } | null } | undefined;
  const start = prop?.date?.start;
  return typeof start === 'string' && start.length > 0 ? start : undefined;
}

function getFirstPersonName(properties: unknown, propertyName: string): string | undefined {
  // 한글 주석: Notion people 프로퍼티는 name이 없을 수 있어(샘플처럼 id만 있음) 안전하게 처리합니다.
  if (!properties || typeof properties !== 'object') return undefined;
  const record = properties as Record<string, unknown>;

  const prop = record[propertyName] as { people?: Array<{ name?: unknown }> } | undefined;
  const first = prop?.people?.[0]?.name;
  return typeof first === 'string' && first.trim().length > 0 ? first : undefined;
}

function normalizeNotionPageToPost(page: unknown): Post {
  // 한글 주석: 노션 응답 구조가 달라도 Post 최소 필드는 항상 채웁니다.
  const safePage = (page ?? {}) as Record<string, unknown>;
  const id = typeof safePage.id === 'string' ? safePage.id : '';
  const lastEditedTime =
    typeof safePage.last_edited_time === 'string' ? safePage.last_edited_time : '';

  const properties = safePage.properties;

  const title = getTitlePlainText(properties, 'Title');
  const description = getRichTextPlainText(properties, 'Description');
  const slug = getRichTextPlainText(properties, 'Slug') ?? id;
  const tags = getMultiSelectNames(properties, 'Tags');
  const author = getFirstPersonName(properties, 'Author');
  const date = getDateStart(properties, 'Date');
  const coverImage = getCoverImageUrl(safePage.cover);

  return {
    id,
    title,
    description,
    coverImage,
    tags,
    author,
    date,
    modifiedData: lastEditedTime,
    slug,
  };
}

export async function getPublishedPosts(): Promise<Post[]> {
  const { databaseId } = getNotionEnv();

  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Status',
      select: { equals: 'Published' },
    },
    sorts: [{ property: 'Date', direction: 'descending' }],
  });

  const results = Array.isArray((response as { results?: unknown[] }).results)
    ? ((response as { results: unknown[] }).results as unknown[])
    : [];

  return results.map(normalizeNotionPageToPost);
}
