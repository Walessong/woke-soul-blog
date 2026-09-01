import Link from 'next/link';
import { getPostBySlug } from '@/lib/posts';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link 
          href="/" 
          className="inline-block mb-8 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
        >
          ← 返回首页
        </Link>

        <article className="bg-white dark:bg-zinc-900 rounded-lg p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {post.category}
            </span>
            <span className="text-zinc-300 dark:text-zinc-600">·</span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {post.date}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-8">
            {post.title}
          </h1>

          <div className="prose prose-zinc dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </div>
  );
}