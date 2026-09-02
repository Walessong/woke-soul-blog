import PostIndex from '@/components/PostIndex';
import { posts } from '@/lib/posts';

export default function Home() {
  return <PostIndex posts={posts} showFilters={false} />;
}
