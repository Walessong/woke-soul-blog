'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const links = [
  { href: '/', label: '首页' },
  { href: '/blog', label: '文章列表' },
  { href: '/guestbook', label: '留言板' },
  { href: '/about', label: '关于' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [scrollY, setScrollY] = useState(0);
  const isArticle = pathname.startsWith('/posts/');
  const progress = typeof document === 'undefined' ? 0 : Math.min(100, Math.round((scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)) * 100));

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setSearchOpen(false); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('keydown', onKeyDown); };
  }, []);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(`/blog${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`);
    setSearchOpen(false);
  };
  const nav = (className: string, closeMenu = false) => <nav aria-label="主导航" className={className}>{links.map((link) => <Link key={link.href} href={link.href} className={pathname === link.href ? 'is-active' : ''} onClick={() => closeMenu && setMobileOpen(false)}>{link.label}</Link>)}</nav>;

  return <>
    <div className="utility-nav"><nav aria-label="快捷导航" className="site-width">{links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav></div>
    <header className="site-header">
      <Link href="/" className="site-title">流动盛宴</Link>
      <p>市场的潮汐，技术的火光，与文字的远方</p>
      <div className="header-navigation site-width">
        <button className="menu-toggle" aria-label="切换菜单" aria-expanded={mobileOpen} onClick={() => setMobileOpen((value) => !value)}><span /><span /><span /></button>
        {nav(mobileOpen ? 'main-nav is-open' : 'main-nav', true)}
        <button className="search-toggle" aria-label="搜索文章" aria-expanded={searchOpen} onClick={() => setSearchOpen(true)}>⌕</button>
      </div>
    </header>
    <div className={searchOpen ? 'search-overlay is-open' : 'search-overlay'} role="dialog" aria-modal="true" aria-label="搜索文章" aria-hidden={!searchOpen}>
      <button className="search-close" aria-label="关闭搜索" onClick={() => setSearchOpen(false)}>×</button>
      <form onSubmit={submitSearch}><label htmlFor="site-search">搜索文章</label><input id="site-search" autoFocus={searchOpen} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索…" /><button type="submit">搜索</button></form>
    </div>
    <div className={scrollY > 280 ? 'sticky-header is-visible' : 'sticky-header'} aria-hidden={scrollY <= 280}>
      {isArticle && <div className="reading-progress"><span style={{ width: `${progress}%` }} /></div>}
      <div className="sticky-inner site-width"><Link href="/" className="sticky-title">流动盛宴</Link>{nav('sticky-nav')}<button className="sticky-search" aria-label="搜索文章" onClick={() => setSearchOpen(true)}>⌕</button></div>
    </div>
    <button className={scrollY > 500 ? 'back-to-top is-visible' : 'back-to-top'} aria-label="返回顶部" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑</button>
  </>;
}
