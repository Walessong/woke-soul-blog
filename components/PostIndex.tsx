'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Post } from '@/lib/posts';

const pageSize = 10;
const formatDate = (value: string) => {
  const [year, month, day] = value.split('-');
  return year && month && day ? `${year}年${Number(month)}月${Number(day)}日` : value;
};

export default function PostIndex({ posts, showFilters = true, initialQuery = '' }: { posts: Post[]; showFilters?: boolean; initialQuery?: string }) {
  const [category, setCategory] = useState('全部');
  const [tag, setTag] = useState('全部');
  const [query, setQuery] = useState(initialQuery);
  const [page, setPage] = useState(1);
  const categories = ['全部', ...Array.from(new Set(posts.map((post) => post.category)))];
  const tags = ['全部', ...Array.from(new Set(posts.flatMap((post) => post.tags)))];
  const visiblePosts = useMemo(() => posts.filter((post) => {
    const matchesCategory = category === '全部' || post.category === category;
    const matchesTag = tag === '全部' || post.tags.includes(tag);
    return matchesCategory && matchesTag && `${post.title} ${post.excerpt} ${post.content}`.toLowerCase().includes(query.trim().toLowerCase());
  }), [category, posts, query, tag]);
  const pages = Math.max(1, Math.ceil(visiblePosts.length / pageSize));
  const pagePosts = visiblePosts.slice((page - 1) * pageSize, page * pageSize);

  return <section className="post-index site-width">
    {showFilters && <div className="index-tools">
      <div className="category-filters" aria-label="文章分类">{categories.map((item) => <button key={item} className={item === category ? 'is-active' : ''} onClick={() => { setCategory(item); setPage(1); }}>{item}</button>)}</div>
      <label className="search-box"><span className="sr-only">搜索文章</span><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="搜索文章" /></label>
    </div>}
    {showFilters && <div className="tag-filters" aria-label="文章标签">{tags.map((item) => <button key={item} className={item === tag ? 'is-active' : ''} onClick={() => { setTag(item); setPage(1); }}>#{item}</button>)}</div>}
    {showFilters && (query || category !== '全部' || tag !== '全部') && <p className="result-count">找到 {visiblePosts.length} 篇文章</p>}
    <div className="post-grid">
      {pagePosts.map((post, index) => <article className={`post-preview ${index === 0 ? 'post-featured' : ''}`} key={post.id}>
        <div className="post-meta"><span>{post.category}</span><i /><time>{formatDate(post.date)}</time></div>
        <h2><Link href={`/posts/${post.slug}`}>{post.title}</Link></h2>
        <p>{post.excerpt}</p>
        <Link className="read-more" href={`/posts/${post.slug}`}>阅读更多</Link>
      </article>)}
    </div>
    {visiblePosts.length === 0 && <p className="empty-state">没有找到匹配的文章。</p>}
    {pages > 1 && <nav className="pagination" aria-label="文章导航"><button disabled={page === 1} onClick={() => setPage((value) => value - 1)}>上一页</button>{Array.from({ length: pages }, (_, index) => <button key={index + 1} className={page === index + 1 ? 'is-active' : ''} onClick={() => setPage(index + 1)}>{index + 1}</button>)}<button disabled={page === pages} onClick={() => setPage((value) => value + 1)}>下一页</button></nav>}
  </section>;
}
