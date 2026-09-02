import Link from 'next/link';
export default function Footer() { return <footer className="site-footer"><p>Copyright © {new Date().getFullYear()} <Link href="/">流动盛宴</Link>. All rights reserved.</p></footer>; }
