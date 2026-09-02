'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
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
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(`/blog${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`);
    setSearchOpen(false);
  };

  return <>
    <div className="utility-nav"><nav aria-label="快捷导航" className="site-width">{links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav></div>
    <header className="site-header">
      <Link href="/" className="site-title">流动盛宴</Link>
      <p>市场的潮汐，技术的火光，与文字的远方</p>
      <div className="header-navigation site-width">
        <button className="menu-toggle" aria-label="切换菜单" aria-expanded={mobileOpen} onClick={() => setMobileOpen((value) => !value)}>菜单</button>
        <nav aria-label="主导航" className={mobileOpen ? 'main-nav is-open' : 'main-nav'}>{links.map((link) => <Link key={link.href} href={link.href} className={pathname === link.href ? 'is-active' : ''} onClick={() => setMobileOpen(false)}>{link.label}</Link>)}</nav>
        <button className="search-toggle" aria-label="搜索文章" aria-expanded={searchOpen} onClick={() => setSearchOpen((value) => !value)}>⌕</button>
      </div>
      {searchOpen && <form className="header-search site-width" onSubmit={submitSearch}><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索文章" aria-label="搜索文章" /><button type="submit">搜索</button></form>}
    </header>
  </>;
}
