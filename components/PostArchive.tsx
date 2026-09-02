import Link from 'next/link';
import type { Post } from '@/lib/posts';

const formatMonthDay = (date: string) => {
  const [, month, day] = date.split('-');
  return month && day ? `${Number(month)}月${Number(day)}日` : date;
};

export default function PostArchive({ posts }: { posts: Post[] }) {
  const years = new Map<string, Post[]>();
  posts.forEach((post) => {
    const year = post.date.slice(0, 4) || '未分类日期';
    years.set(year, [...(years.get(year) ?? []), post]);
  });
  return <section className="archive-page site-width">
    <nav className="breadcrumb" aria-label="面包屑导航"><Link href="/">首页</Link><span>›</span><span>文章列表</span></nav>
    <h1>文章列表</h1>
    <nav className="archive-years" aria-label="文章年份">{[...years.keys()].map((year) => <a key={year} href={`#year${year}`}>{year}</a>)}</nav>
    {[...years.entries()].map(([year, entries]) => <section key={year} id={`year${year}`} className="archive-year"><h2>{year}<span>({entries.length})</span></h2><ul>{entries.map((post) => <li key={post.id}><time>{formatMonthDay(post.date)}：</time><Link href={`/posts/${post.slug}`}>{post.title}</Link><span>（{post.category}）</span></li>)}</ul></section>)}
  </section>;
}
