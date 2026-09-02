'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { readingTime, tagsForPost, type Post } from '@/lib/posts';

export default function PostIndex({ posts }: { posts: Post[] }) {
  const [category, setCategory] = useState('全部');
  const [tag, setTag] = useState('全部');
  const [query, setQuery] = useState('');
  const categories = ['全部', ...Array.from(new Set(posts.map((post) => post.category)))];
  const tags = ['全部', ...Array.from(new Set(posts.flatMap(tagsForPost)))];
  const visiblePosts = useMemo(() => posts.filter((post) => {
    const matchesCategory = category === '全部' || post.category === category;
    const matchesTag = tag === '全部' || tagsForPost(post).includes(tag);
    return matchesCategory && matchesTag && `${post.title} ${post.excerpt} ${post.content}`.toLowerCase().includes(query.trim().toLowerCase());
  }), [category, posts, query, tag]);

  return <section className="post-index site-width">
    <div className="index-tools">
      <div className="category-filters" aria-label="文章分类">
        {categories.map((item) => <button key={item} className={item === category ? 'is-active' : ''} onClick={() => setCategory(item)}>{item}</button>)}
      </div>
      <label className="search-box"><span className="sr-only">搜索文章</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索文章" /></label>
    </div>
    <div className="tag-filters" aria-label="文章标签">{tags.map((item) => <button key={item} className={item === tag ? 'is-active' : ''} onClick={() => setTag(item)}>#{item}</button>)}</div>
    <p className="result-count">{query || category !== '全部' ? `找到 ${visiblePosts.length} 篇文章` : '最新文章'}</p>
    <div className="post-grid">
      {visiblePosts.map((post, index) => <article className={`post-preview ${index === 0 ? 'post-featured' : ''}`} key={post.id}>
        <div className="post-meta"><span>{post.category}</span><i /><time>{post.date}</time><b>{readingTime(post.content)} 分钟</b></div>
        <h2><Link href={`/posts/${post.slug}`}>{post.title}</Link></h2>
        <p>{post.excerpt}</p>
        <div className="post-tags">{tagsForPost(post).map((item) => <button key={item} onClick={() => setTag(item)}>#{item}</button>)}</div>
        <Link className="read-more" href={`/posts/${post.slug}`}>阅读更多</Link>
      </article>)}
    </div>
    {visiblePosts.length === 0 && <p className="empty-state">没有找到匹配的文章。</p>}
  </section>;
}
