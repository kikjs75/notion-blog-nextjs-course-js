import { NextResponse, type NextRequest } from 'next/server';
import { getPublishedPosts } from '@/lib/notion';

export async function GET(request: NextRequest) {
  const posts = await getPublishedPosts();
  return NextResponse.json({ posts });
}
