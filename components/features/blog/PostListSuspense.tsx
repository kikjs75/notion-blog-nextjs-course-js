import Link from 'next/link';
import { PostCard } from '@/components/features/blog/PostCard';
import { getPublishedPosts } from '@/lib/notion';

interface PostListProps {
  selectedTag: string;
  selectedSort: 'latest' | 'oldest';
}

export default async function PostList({ selectedTag, selectedSort }: PostListProps) {
  const { posts } = await getPublishedPosts({ tag: selectedTag, sort: selectedSort });

  return (
    <div className="grid gap-4">
      {posts.map((post, index) => (
        <Link href={`/blog/${post.slug}`} key={post.id}>
          <PostCard post={post} priority={index === 0} />
        </Link>
      ))}
    </div>
  );
}
