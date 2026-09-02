import Link from 'next/link';

const links = [
  { href: '/', label: '首页' },
  { href: '/blog', label: '文章列表' },
  { href: '/guestbook', label: '留言板' },
  { href: '/about', label: '关于' },
];

export default function Header() {
  return (
    <>
      <div className="utility-nav"><nav aria-label="快捷导航" className="site-width">{links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav></div>
      <header className="site-header">
        <Link href="/" className="site-title">流动盛宴</Link>
        <p>市场的潮汐，技术的火光，与文字的远方</p>
        <nav aria-label="主导航" className="main-nav">{links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav>
      </header>
    </>
  );
}
