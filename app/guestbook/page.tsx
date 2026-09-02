export const metadata = { title: '留言板 | 流动盛宴' };
import Comments from '@/components/Comments';
import Link from 'next/link';

export default function GuestbookPage() { return <section className="static-page"><nav className="breadcrumb" aria-label="面包屑导航"><Link href="/">首页</Link><span>›</span><span>留言板</span></nav><h1>留言板</h1><p>留下你的想法、问题或阅读感受。</p><Comments /></section>; }
