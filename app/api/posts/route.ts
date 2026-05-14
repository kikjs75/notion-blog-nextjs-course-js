import { NextResponse, type NextRequest } from 'next/server';
import { getPublishedPosts } from '@/lib/notion';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tag = searchParams.get('tag') || undefined;
  const sort = searchParams.get('sort') || undefined;
  const pageSize = Number(searchParams.get('pageSize') || undefined);
  const startCursor = searchParams.get('startCursor') || undefined;

  const response = await getPublishedPosts({ tag, sort, pageSize, startCursor });
  return NextResponse.json(response);
}
