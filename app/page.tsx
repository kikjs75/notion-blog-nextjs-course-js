// import TagSection from '@/app/_components/TagSection';
import TagSectionClient from './_components/TagSection.client';
import ProfileSection from '@/app/_components/ProfileSection';
import ContactSection from '@/app/_components/ContactSection';
import { getTags } from '@/lib/notion';
import HeaderSection from './_components/HeaderSection';
// import PostList from '@/components/features/blog/PostList';
import PostListSuspense from '@/components/features/blog/PostListSuspense';
import { Suspense } from 'react';
import TagSectionSkeleton from './_components/TagSectionSkeleton';
import PostListSkeleton from '@/components/features/blog/PostListSkeleton';

interface HomeProps {
  searchParams: Promise<{ tag?: string; sort?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { tag } = await searchParams;
  const selectedTag = tag || '전체';

  const tags = getTags();

  return (
    <div className="container py-8">
      <div className="grid grid-cols-[200px_1fr_220px] gap-6">
        {/* 좌측 사이드바 */}
        <aside>
          {/* <TagSection tags={tags} selectedTag={selectedTag} /> */}

          <Suspense fallback={<TagSectionSkeleton />}>
            <TagSectionClient tags={tags} selectedTag={selectedTag} />
          </Suspense>
        </aside>
        <div className="space-y-8">
          {/* 섹션 제목 */}
          <HeaderSection selectedTag={selectedTag} />

          {/* 블로그 카드 그리드 */}
          {/* <PostList posts={posts} /> */}
          <Suspense fallback={<PostListSkeleton />}>
            <PostListSuspense />
          </Suspense>
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
