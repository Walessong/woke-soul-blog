import PostIndex from '@/components/PostIndex';
import { posts } from '@/lib/posts';

export const metadata = { title: '文章列表 | 流动盛宴' };
export default function BlogPage() { return <PostIndex posts={posts} />; }
