import Link from 'next/link';
import { posts } from '@/lib/posts';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            新的原野
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            一片新的原野，一个充满爱与善良的博客
          </p>
        </div>

        <div className="space-y-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {post.category}
                </span>
                <span className="text-zinc-300 dark:text-zinc-600">·</span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {post.date}
                </span>
              </div>
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
                <Link href={`/posts/${post.slug}`} className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                  {post.title}
                </Link>
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                {post.excerpt}
              </p>
              <Link
                href={`/posts/${post.slug}`}
                className="text-zinc-900 dark:text-zinc-50 hover:text-zinc-600 dark:hover:text-zinc-300 font-medium transition-colors"
              >
                阅读更多 →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}