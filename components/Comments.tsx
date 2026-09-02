import Script from 'next/script';

export default function Comments() {
  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO;
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;
  if (!repo || !repoId || !categoryId) return null;

  return <section aria-label="评论" className="comments">
    <Script src="https://giscus.app/client.js" data-repo={repo} data-repo-id={repoId} data-category="Announcements" data-category-id={categoryId} data-mapping="pathname" data-strict="0" data-reactions-enabled="1" data-emit-metadata="0" data-input-position="top" data-theme="light" data-lang="zh-CN" crossOrigin="anonymous" async />
  </section>;
}
