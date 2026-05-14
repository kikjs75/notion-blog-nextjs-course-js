'use client';

import Link from 'next/link';
import { PostCard } from '@/components/features/blog/PostCard';
import { Button } from '@/components/ui/button';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import PostListSkeleton from '@/components/features/blog/PostListSkeleton';
import type { GetPublishedPostsResponse } from '@/lib/notion';
import { useState } from 'react';

async function fetchPosts({
  pageParam,
  tag,
  sort,
  pageSize,
}: {
  pageParam: string | undefined;
  tag: string | undefined;
  sort: string | undefined;
  pageSize: number;
}): Promise<GetPublishedPostsResponse> {
  const params = new URLSearchParams();
  if (tag) params.set('tag', tag);
  if (sort) params.set('sort', sort);
  if (pageParam) params.set('startCursor', pageParam);
  params.set('pageSize', String(pageSize));

  const res = await fetch(`/api/posts?${params.toString()}`);
  return res.json();
}

export default function PostList() {
  const PAGE_SIZE = 2;
  const searchParams = useSearchParams();
  const tag = searchParams.get('tag') ?? undefined;
  const sort = searchParams.get('sort') ?? undefined;

  const [pageSize, setPageSize] = useState(5);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } = useInfiniteQuery({
    queryKey: ['posts', { tag, sort, pageSize }],
    queryFn: ({ pageParam }) => fetchPosts({ pageParam, tag, sort, pageSize: Number(PAGE_SIZE) }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
  });

  if (isPending) return <PostListSkeleton />;

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {posts.map((post, index) => (
          <Link href={`/blog/${post.slug}`} key={post.id}>
            <PostCard post={post} priority={index === 0} />
          </Link>
        ))}
      </div>
      {hasNextPage && (
        <div>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? '불러오는 중...' : '더보기'}
          </Button>
        </div>
      )}
    </div>
  );
}
