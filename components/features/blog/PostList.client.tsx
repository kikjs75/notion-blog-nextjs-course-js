'use client';

import type { Post } from '@/types/blog';
import Link from 'next/link';
import { PostCard } from '@/components/features/blog/PostCard';
import { useEffect, useState } from 'react';

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch('/api/posts');
      const data = await res.json();
      setPosts(data.posts);
    };
    fetchPosts();
  }, []);

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
