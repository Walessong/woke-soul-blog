import Link from 'next/link';
import { getPostBySlug, posts, readingTime } from '@/lib/posts';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Comments from '@/components/Comments';

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();
  const index = posts.findIndex((item) => item.slug === slug);
  const newer = posts[index - 1];
  const older = posts[index + 1];

  return <article className="article-shell">
    <Link href="/" className="back-link">返回首页</Link>
    <header className="article-header">
      <div className="post-meta"><span>{post.category}</span><i /><time>{post.date}</time><b>{readingTime(post.content)} 分钟</b></div>
      <h1>{post.title}</h1>
    </header>
    <div className="article-content"><ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown></div>
    <Comments />
    <nav className="post-nav" aria-label="文章导航">
      {newer ? <Link href={`/posts/${newer.slug}`}><span>较新文章</span>{newer.title}</Link> : <span />}
      {older ? <Link href={`/posts/${older.slug}`}><span>较早文章</span>{older.title}</Link> : <span />}
    </nav>
  </article>;
}
