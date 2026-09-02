import PostIndex from '@/components/PostIndex';
import { posts } from '@/lib/posts';

export const metadata = { title: '文章列表 | 流动盛宴' };
export default async function BlogPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return <PostIndex posts={posts} initialQuery={q} />;
}
