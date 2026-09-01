import Link from 'next/link';

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-4xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">
            新的原野
          </Link>
          <nav className="flex gap-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              首页
            </Link>
            <Link href="/blog" className="text-gray-600 hover:text-gray-900">
              文章列表
            </Link>
            <Link href="/guestbook" className="text-gray-600 hover:text-gray-900">
              留言板
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900">
              关于
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}