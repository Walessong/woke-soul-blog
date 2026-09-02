import PostIndex from '@/components/PostIndex';
import PostArchive from '@/components/PostArchive';
import { posts } from '@/lib/posts';

export const metadata = { title: '文章列表 | 流动盛宴' };
export default async function BlogPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return q ? <PostIndex posts={posts} initialQuery={q} /> : <PostArchive posts={posts} />;
}
