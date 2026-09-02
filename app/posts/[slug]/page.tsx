import Link from 'next/link';
import { getPostBySlug, posts } from '@/lib/posts';
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

  return <article className="article-shell site-width">
    <nav className="breadcrumb" aria-label="面包屑导航"><Link href="/">首页</Link><span>›</span><span>{post.title}</span></nav>
    <header className="article-header">
      <div className="post-category">{post.category}</div>
      <h1>{post.title}</h1>
      <div className="post-meta post-byline"><span>Woke Soul</span><i /><time>{post.date}</time></div>
    </header>
    <div className="article-content"><ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown></div>
    <footer className="article-footer">分类：<Link href={`/blog?q=${encodeURIComponent(post.category)}`}>{post.category}</Link></footer>
    <section className="author-card" aria-label="作者资料"><h2>Woke Soul</h2><p>流动盛宴</p><span>已发布 {posts.length} 篇文章</span></section>
    <Comments />
    <nav className="post-nav" aria-label="文章导航">
      {newer ? <Link href={`/posts/${newer.slug}`}><span>较新文章</span>{newer.title}</Link> : <span />}
      {older ? <Link href={`/posts/${older.slug}`}><span>较早文章</span>{older.title}</Link> : <span />}
    </nav>
  </article>;
}
