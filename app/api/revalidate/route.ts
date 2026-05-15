import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { BLOG_POSTS_CACHE_TAG } from '@/lib/notion';

/**
 * Notion에서 글을 추가·삭제·수정했을 때 즉시 반영하려면 이 엔드포인트를 호출합니다.
 *
 * 설정: `.env.local`에 REVALIDATE_SECRET=<임의 문자열>
 * 호출 예:
 *   curl -X POST https://your-domain/api/revalidate \
 *     -H "x-revalidate-secret: YOUR_SECRET"
 */
export async function POST(request: Request) {
  const configuredSecret = process.env.REVALIDATE_SECRET;

  if (!configuredSecret) {
    return NextResponse.json({ ok: false, message: 'REVALIDATE_SECRET이 설정되어 있지 않습니다.' }, { status: 501 });
  }

  const headerSecret = request.headers.get('x-revalidate-secret');
  let bodySecret: string | undefined;
  try {
    const body = (await request.json()) as { secret?: string };
    bodySecret = typeof body.secret === 'string' ? body.secret : undefined;
  } catch {
    bodySecret = undefined;
  }

  const provided = headerSecret ?? bodySecret;

  if (provided !== configuredSecret) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  // 한글 주석: 목록용 unstable_cache 무효화
  revalidateTag(BLOG_POSTS_CACHE_TAG);

  // 한글 주석: 홈·블로그 글 페이지 ISR 캐시 갱신
  revalidatePath('/', 'layout');
  revalidatePath('/blog', 'layout');

  return NextResponse.json({ ok: true, revalidatedAt: Date.now() });
}
