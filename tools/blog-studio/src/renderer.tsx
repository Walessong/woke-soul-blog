import { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { EnvironmentStatus, PublishResult, StudioConfig, StudioPost } from './shared';
import './styles.css';

const blankPost = (): StudioPost => ({
  filename: '', title: '', slug: '', date: new Date().toISOString().slice(0, 10), category: '技术工程', series: 'Tech & Engineering', tags: [], description: '', content: '', draft: true,
});
const seriesFor: Record<string, string> = { '市场量化': 'Markets & Quant', '技术工程': 'Tech & Engineering', '文艺思考': 'Aesthetics & Words' };

function App() {
  const [config, setConfig] = useState<StudioConfig>();
  const [environment, setEnvironment] = useState<EnvironmentStatus>();
  const [posts, setPosts] = useState<StudioPost[]>([]);
  const [post, setPost] = useState<StudioPost>();
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<PublishResult>();
  const [publishLogs, setPublishLogs] = useState<string[]>([]);
  const [importedImages, setImportedImages] = useState<string[]>([]);
  const textarea = useRef<HTMLTextAreaElement>(null);

  const load = async () => {
    const [savedConfig, status] = await Promise.all([window.studio.config.get(), window.studio.status()]);
    setConfig(savedConfig); setEnvironment(status);
    if (status.validRepo) setPosts(await window.studio.posts.list());
  };
  useEffect(() => { void load(); }, []);
  useEffect(() => window.studio.onPublishLog((message) => setPublishLogs((current) => [...current.slice(-99), message])), []);
  const categories = useMemo(() => Array.from(new Set([...Object.keys(seriesFor), ...posts.map((item) => item.category).filter(Boolean)])).sort(), [posts]);
  const visiblePosts = posts.filter((item) => `${item.title} ${item.tags.join(' ')} ${item.category}`.toLowerCase().includes(search.toLowerCase()));
  const update = (values: Partial<StudioPost>) => setPost((current) => current ? { ...current, ...values } : current);
  const openPost = (item: StudioPost) => { setPost({ ...item }); setImportedImages([]); setPublishResult(undefined); setNotice(''); };
  const createPost = () => { setPost(blankPost()); setImportedImages([]); setPublishResult(undefined); setNotice(''); };
  const save = async (nextDraft = post?.draft) => {
    if (!post) return;
    const saved = await window.studio.posts.save({ ...post, draft: Boolean(nextDraft) });
    setPost(saved); setPosts(await window.studio.posts.list()); setNotice(saved.draft ? '草稿已保存到本地。' : '文章已保存，尚未推送。');
    return saved;
  };
  const publish = async () => {
    if (!post || publishing) return;
    setPublishing(true); setPublishResult(undefined); setPublishLogs([]); setNotice('保存并开始发布…');
    try {
      const saved = await save(false);
      if (!saved) return;
      const result = await window.studio.publish(saved.filename, importedImages);
      setPublishResult(result); setNotice(result.message ?? (result.ok ? '发布完成。' : '发布未完成，文章仍保留在本地。'));
      if (result.ok) { setImportedImages([]); setPosts(await window.studio.posts.list()); }
    } catch (error) { setPublishResult({ ok: false, logs: [], error: error instanceof Error ? error.message : String(error) }); }
    finally { setPublishing(false); }
  };
  const importImages = async () => {
    const images = await window.studio.importImages();
    if (!images.length || !post) return;
    const markdown = images.map((image) => `![${image.replace(/\.[^.]+$/, '')}](/images/${image})`).join('\n');
    const input = textarea.current; const start = input?.selectionStart ?? post.content.length; const end = input?.selectionEnd ?? start;
    update({ content: `${post.content.slice(0, start)}${post.content && !post.content.endsWith('\n') ? '\n' : ''}${markdown}\n${post.content.slice(end)}` });
    setImportedImages((current) => [...new Set([...current, ...images])]); setNotice(`已导入 ${images.length} 张图片。`);
  };
  const remove = async () => {
    if (!post?.filename || !confirm(`确定删除“${post.title}”吗？此操作只删除文章 Markdown 文件。`)) return;
    await window.studio.posts.delete(post.filename); setPost(undefined); setPosts(await window.studio.posts.list()); setNotice('文章已删除。');
  };
  const chooseRepository = async () => {
    const repoPath = await window.studio.chooseRepository();
    if (!repoPath || !config) return;
    try { await window.studio.config.save({ ...config, repoPath }); await load(); setNotice('博客仓库已更新。'); }
    catch (error) { setNotice(error instanceof Error ? error.message : String(error)); }
  };

  if (!config || !environment) return <main className="loading">正在打开写作台…</main>;
  if (!environment.validRepo) return <Setup config={config} status={environment} chooseRepository={chooseRepository} />;
  return <main className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span>流动盛宴</span><strong>写作台</strong></div>
      <button className="primary" onClick={createPost}>新建文章</button>
      <input className="library-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索文章" aria-label="搜索文章" />
      <div className="article-list">{visiblePosts.map((item) => <button key={item.filename} className={post?.filename === item.filename ? 'article-item active' : 'article-item'} onClick={() => openPost(item)}><span>{item.draft ? '草稿' : item.date}</span><strong>{item.title}</strong><small>{item.category || item.series || '未分类'}</small></button>)}</div>
      <div className="sidebar-bottom"><button className="text-button" onClick={chooseRepository}>切换博客仓库</button><small>{environment.git ? 'Git 已就绪' : '未检测到 Git'} · {environment.vercel ? 'Vercel 已登录' : 'Vercel 未登录'}</small></div>
    </aside>
    {post ? <Editor post={post} categories={categories} update={update} save={save} publish={publish} remove={remove} importImages={importImages} textarea={textarea} publishing={publishing} notice={notice} result={publishResult} liveLogs={publishLogs} /> : <section className="empty-editor"><h1>开始写作</h1><p>从左侧选择一篇文章，或新建草稿。</p><button className="primary" onClick={createPost}>新建文章</button></section>}
  </main>;
}

function Setup({ config, status, chooseRepository }: { config: StudioConfig; status: EnvironmentStatus; chooseRepository(): void }) {
  return <main className="setup"><div><span className="eyebrow">流动盛宴</span><h1>连接你的博客仓库</h1><p>写作台会直接读写本机 Markdown 文件，并复用你本机的 Git 与 Vercel 登录状态。不会保存 GitHub 或 Vercel Token。</p><div className="path">{config.repoPath}</div><button className="primary" onClick={chooseRepository}>选择博客仓库</button><ul><li className={status.git ? 'ok' : ''}>{status.git ? '已检测到 Git' : '未检测到 Git，请安装 Git for Windows。'}</li><li className={status.vercel ? 'ok' : ''}>{status.vercel ? 'Vercel 已登录' : '请在命令行运行 npx vercel login 后重试。'}</li><li>{status.message}</li></ul></div></main>;
}

function Editor({ post, categories, update, save, publish, remove, importImages, textarea, publishing, notice, result, liveLogs }: { post: StudioPost; categories: string[]; update(values: Partial<StudioPost>): void; save(draft?: boolean): Promise<StudioPost | undefined>; publish(): Promise<void>; remove(): Promise<void>; importImages(): Promise<void>; textarea: React.RefObject<HTMLTextAreaElement | null>; publishing: boolean; notice: string; result?: PublishResult; liveLogs: string[] }) {
  return <section className="editor">
    <header className="editor-toolbar"><div><span className={post.draft ? 'status draft' : 'status published'}>{post.draft ? '草稿' : '待发布'}</span><span className="filename">{post.filename || '新文章'}</span></div><div className="toolbar-actions"><button className="text-button danger" disabled={!post.filename} onClick={() => void remove()}>删除</button><button className="secondary" onClick={() => void save()}>保存草稿</button><button className="primary" disabled={publishing} onClick={() => void publish()}>{publishing ? '正在发布…' : '发布'}</button></div></header>
    <div className="metadata"><label>标题<input value={post.title} onChange={(event) => update({ title: event.target.value })} placeholder="文章标题" autoFocus /></label><label>发布日期<input type="date" value={post.date} onChange={(event) => update({ date: event.target.value })} /></label><label>链接标识<input value={post.slug} onChange={(event) => update({ slug: event.target.value.toLowerCase().replace(/\s+/g, '-') })} placeholder="自动生成" /></label><label>分类<select value={post.category} onChange={(event) => update({ category: event.target.value, series: seriesFor[event.target.value] ?? post.series })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label>标签<input value={post.tags.join(', ')} onChange={(event) => update({ tags: event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean) })} placeholder="用逗号分隔" /></label><label className="wide">摘要<input value={post.description} onChange={(event) => update({ description: event.target.value })} placeholder="首页展示的文章摘要" /></label></div>
    <div className="workspace"><div className="source-pane"><div className="pane-title"><span>Markdown</span><button className="text-button" onClick={() => void importImages()}>导入图片</button></div><textarea ref={textarea} value={post.content} onChange={(event) => update({ content: event.target.value })} placeholder="从这里开始写作…" spellCheck="false" /></div><article className="preview-pane"><div className="pane-title">预览</div><h1>{post.title || '未命名文章'}</h1><div className="preview-meta">{post.category || post.series} · {post.date}</div><ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content || '正文预览会显示在这里。'}</ReactMarkdown></article></div>
    {(notice || result) && <section className={result?.ok === false ? 'notice error' : 'notice'}><strong>{notice}</strong>{result?.error && <p>{result.error}</p>}{(result?.logs.length ? result.logs : liveLogs).length ? <pre>{(result?.logs.length ? result.logs : liveLogs).join('\n')}</pre> : null}{result?.url && <button className="text-button" onClick={() => void window.studio.openExternal(result.url!)}>打开已发布文章</button>}</section>}
  </section>;
}

createRoot(document.getElementById('root')!).render(<App />);
