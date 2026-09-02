import fs from 'node:fs';
import path from 'node:path';

export interface Post {
  id: string;
  title: string;
  slug: string;
  category: string;
  tags: string[];
  date: string;
  excerpt: string;
  content: string;
}

const postsDirectory = path.join(process.cwd(), 'content', 'posts');

const legacySlugs: Record<string, string> = {
  '1011黑天鹅思考': '1011-hei-tian-e-si-kao',
  '暴跌后行情和应对方式': 'bao-die-hou-hang-qing-he-ying-dui-fang-shi',
  'a股止盈攻略': 'a-gu-zhi-ying-gong-lue',
  'lstm调参经验': 'lstm-tiao-can-jing-yan',
  '深度复盘-从工程暴力到Context-Engineering': 'shen-du-fu-pan-cong-gong-cheng-bao-li-dao-context-engineering',
  'once_upon_a_time_in_america': 'once-upon-a-time-in-america',
  '机器学习中的数据预处理细节': 'ji-qi-xue-xi-zhong-de-shu-ju-yu-chu-li-xi-jie',
  clustering_algorithms: 'clustering-algorithms',
  introduction_to_pcb: 'introduction-to-pcb',
  myfirstblog: 'my-first-blog',
  '2026-12-20-rang-ai-xue-hui-zen-me-chuang-xin': 'rang-ai-xue-hui-zen-me-chuang-xin',
};

function valueFor(frontMatter: string, key: string) {
  const match = frontMatter.match(new RegExp(`^${key}:\\s*["']?(.+?)["']?\\s*$`, 'm'));
  return match?.[1]?.replace(/^['"]|['"]$/g, '').trim();
}

function listFor(frontMatter: string, key: string) {
  const inline = frontMatter.match(new RegExp(`^${key}:\\s*\\[(.+)\\]\\s*$`, 'm'));
  if (inline) return inline[1].split(',').map((item) => item.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
  const block = frontMatter.match(new RegExp(`^${key}:\\s*\\r?\\n((?:\\s+-\\s+.+\\r?\\n?)+)`, 'm'));
  return block ? [...block[1].matchAll(/^\s+-\s+['"]?(.+?)['"]?\s*$/gm)].map((match) => match[1].trim()) : [];
}

function slugFor(filename: string, frontMatter: string) {
  const explicit = valueFor(frontMatter, 'slug');
  if (explicit) return explicit;
  const basename = path.basename(filename, '.md');
  if (legacySlugs[basename]) return legacySlugs[basename];
  return basename.replace(/^\d{4}-\d{2}-\d{2}-/, '').toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/^-+|-+$/g, '');
}

function excerptFor(content: string, fallback?: string) {
  if (fallback) return fallback;
  const plain = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!?(\[[^\]]*\])\([^)]*\)/g, '$1')
    .replace(/[#>*_`~-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > 130 ? `${plain.slice(0, 130)}...` : plain;
}

function parsePost(filename: string): Post | undefined {
  const raw = fs.readFileSync(path.join(postsDirectory, filename), 'utf8').replace(/^\uFEFF/, '').trimStart();
  const match = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/);
  if (!match) return undefined;
  const [, frontMatter, content] = match;
  if (/^draft:\s*true\s*$/m.test(frontMatter)) return undefined;
  const title = valueFor(frontMatter, 'title');
  if (!title) return undefined;
  const series = listFor(frontMatter, 'series');
  const categories = listFor(frontMatter, 'categories');
  const slug = slugFor(filename, frontMatter);
  return {
    id: slug,
    title,
    slug,
    category: series[0] ?? categories[0] ?? '未分类',
    tags: listFor(frontMatter, 'tags'),
    date: (valueFor(frontMatter, 'date') ?? '').slice(0, 10),
    excerpt: excerptFor(content, valueFor(frontMatter, 'description') ?? valueFor(frontMatter, 'summary')),
    content: content.trim(),
  };
}

export const posts = fs.readdirSync(postsDirectory)
  .filter((filename) => filename.endsWith('.md') && filename !== '_index.md')
  .map(parsePost)
  .filter((post): post is Post => Boolean(post))
  .sort((left, right) => right.date.localeCompare(left.date));

export function getPostBySlug(slug: string) {
  return posts.find((post) => post.slug === slug);
}

export function readingTime(content: string) {
  return Math.max(1, Math.ceil(content.replace(/\s/g, '').length / 500));
}
