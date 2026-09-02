import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pinyin } from 'pinyin-pro';
import type { EnvironmentStatus, PublishResult, StudioConfig, StudioPost } from './shared';

const execFileAsync = promisify(execFile);
const defaultConfig: StudioConfig = {
  repoPath: 'D:\\blog\\woke-soul-blog',
  branch: 'master',
  productionUrl: 'https://woke-soul-blog-nine.vercel.app',
};
const categorySeries: Record<string, string> = {
  '市场量化': 'Markets & Quant',
  '技术工程': 'Tech & Engineering',
  '文艺思考': 'Aesthetics & Words',
};

function configPath() { return path.join(app.getPath('userData'), 'blog-studio.json'); }
async function readConfig(): Promise<StudioConfig> {
  try { return { ...defaultConfig, ...JSON.parse(await fs.readFile(configPath(), 'utf8')) }; }
  catch { return defaultConfig; }
}
async function writeConfig(config: StudioConfig) {
  await fs.mkdir(path.dirname(configPath()), { recursive: true });
  await fs.writeFile(configPath(), JSON.stringify(config, null, 2), 'utf8');
}
function postsPath(config: StudioConfig) { return path.join(config.repoPath, 'content', 'posts'); }
function imagesPath(config: StudioConfig) { return path.join(config.repoPath, 'public', 'images'); }
async function exists(target: string) { try { await fs.access(target); return true; } catch { return false; } }
async function validRepo(config: StudioConfig) {
  return (await exists(postsPath(config))) && (await exists(path.join(config.repoPath, '.git'))) && (await exists(path.join(config.repoPath, 'package.json')));
}
async function run(command: string, args: string[], cwd?: string) {
  const executable = process.platform === 'win32' && command === 'npx' ? 'npx.cmd' : command;
  try {
    return await execFileAsync(executable, args, { cwd, windowsHide: true, maxBuffer: 2 * 1024 * 1024, timeout: 60_000 });
  } catch (error) {
    const failure = error as Error & { stdout?: string; stderr?: string; killed?: boolean };
    const detail = [failure.killed ? '命令超时（60 秒）。' : failure.message, failure.stderr?.trim(), failure.stdout?.trim()].filter(Boolean).join('\n');
    throw new Error(detail);
  }
}
function frontValue(source: string, key: string) {
  const match = source.match(new RegExp(`^${key}:\\s*[\"']?(.+?)[\"']?\\s*$`, 'm'));
  return match?.[1]?.replace(/^[\"']|[\"']$/g, '').trim() ?? '';
}
function frontList(source: string, key: string) {
  const inline = source.match(new RegExp(`^${key}:\\s*\\[(.+)\\]\\s*$`, 'm'));
  if (inline) return inline[1].split(',').map((entry) => entry.trim().replace(/^[\"']|[\"']$/g, '')).filter(Boolean);
  const block = source.match(new RegExp(`^${key}:\\s*\\r?\\n((?:\\s+-\\s+.+\\r?\\n?)+)`, 'm'));
  return block ? [...block[1].matchAll(/^\s+-\s+[\"']?(.+?)[\"']?\s*$/gm)].map((entry) => entry[1].trim()) : [];
}
function parsePost(filename: string, raw: string): StudioPost | undefined {
  const match = raw.replace(/^\uFEFF/, '').match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/);
  if (!match) return undefined;
  const [, front, content] = match;
  const category = frontList(front, 'categories')[0] ?? '';
  return {
    filename,
    title: frontValue(front, 'title'),
    slug: frontValue(front, 'slug') || filename.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, ''),
    date: frontValue(front, 'date').slice(0, 10),
    category,
    series: frontList(front, 'series')[0] ?? categorySeries[category] ?? '',
    tags: frontList(front, 'tags'),
    description: frontValue(front, 'description') || frontValue(front, 'summary'),
    content: content.trim(),
    draft: /^draft:\s*true\s*$/m.test(front),
  };
}
function quote(value: string) { return JSON.stringify(value); }
function serializePost(post: StudioPost) {
  const values = [
    '---', `title: ${quote(post.title)}`, `date: ${quote(post.date)}`, `slug: ${quote(post.slug)}`,
    `categories: [${post.category ? quote(post.category) : ''}]`, `series: [${post.series ? quote(post.series) : ''}]`,
    `tags: [${post.tags.filter(Boolean).map(quote).join(', ')}]`, `description: ${quote(post.description)}`,
    `draft: ${post.draft ? 'true' : 'false'}`, '---', '', post.content.trim(), '',
  ];
  return values.join('\n');
}
function slugify(title: string) {
  const romanized = pinyin(title, { toneType: 'none', type: 'array' }).join('-');
  return romanized.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `post-${Date.now()}`;
}
function filenameFor(post: StudioPost) { return `${post.date || new Date().toISOString().slice(0, 10)}-${post.slug}.md`; }
async function allPosts(config: StudioConfig) {
  const files = await fs.readdir(postsPath(config));
  const posts = (await Promise.all(files.filter((file) => file.endsWith('.md') && file !== '_index.md').map(async (filename) => {
    const parsed = parsePost(filename, await fs.readFile(path.join(postsPath(config), filename), 'utf8'));
    return parsed;
  }))).filter((post): post is StudioPost => Boolean(post && post.title));
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}
async function savePost(config: StudioConfig, input: StudioPost) {
  if (!input.title.trim()) throw new Error('请输入文章标题。');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new Error('发布日期必须是 YYYY-MM-DD。');
  const slug = input.slug.trim() || slugify(input.title);
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error('Slug 只能使用小写字母、数字和连字符。');
  const post = { ...input, slug, series: input.series || categorySeries[input.category] || '' };
  const targetName = input.filename || filenameFor(post);
  const records = await allPosts(config);
  if (records.some((record) => record.filename !== input.filename && record.slug === slug)) throw new Error(`Slug “${slug}” 已被其他文章使用。`);
  if (input.filename && input.filename !== targetName) {
    const oldPath = path.join(postsPath(config), input.filename);
    const newPath = path.join(postsPath(config), targetName);
    if (await exists(newPath)) throw new Error(`文件 ${targetName} 已存在。`);
    await fs.rename(oldPath, newPath);
  }
  await fs.writeFile(path.join(postsPath(config), targetName), serializePost({ ...post, filename: targetName }), 'utf8');
  return { ...post, filename: targetName };
}
async function status(config: StudioConfig): Promise<EnvironmentStatus> {
  const repo = await validRepo(config);
  const test = async (command: string, args: string[], cwd?: string) => { try { await run(command, args, cwd); return true; } catch { return false; } };
  return { validRepo: repo, git: await test('git', ['--version']), vercel: await test('npx', ['vercel', 'whoami'], repo ? config.repoPath : undefined), message: repo ? undefined : '请选择包含 content/posts、.git 和 package.json 的博客仓库。' };
}
async function inspectProduction(config: StudioConfig) {
  const { stdout } = await run('npx', ['vercel', 'inspect', config.productionUrl], config.repoPath);
  const url = stdout.match(/url\s+https:\/\/([^\s]+)/i)?.[1];
  const ready = /status\s+.*Ready/i.test(stdout);
  return { ready, url: url ? `https://${url}` : config.productionUrl, raw: stdout };
}
async function deploymentForCommit(config: StudioConfig, commit: string) {
  let projectName = '';
  try {
    const project = JSON.parse(await fs.readFile(path.join(config.repoPath, '.vercel', 'project.json'), 'utf8')) as { projectName?: string };
    projectName = project.projectName ?? '';
  } catch { /* The linked project name is optional; Vercel can infer it from the repository. */ }
  const args = ['vercel', 'ls'];
  if (projectName) args.push(projectName);
  args.push('--meta', `githubCommitSha=${commit}`);
  const { stdout } = await run('npx', args, config.repoPath);
  const url = stdout.match(/https:\/\/[^\s]+\.vercel\.app/)?.[0];
  return { ready: /Ready/i.test(stdout), url, raw: stdout };
}
async function publish(config: StudioConfig, filename: string, images: string[], onLog: (message: string) => void): Promise<PublishResult> {
  const logs: string[] = [];
  const addLog = (message: string) => { logs.push(message); onLog(message); };
  const logRun = async (label: string, command: string, args: string[]) => {
    addLog(label);
    const result = await run(command, args, config.repoPath);
    if (result.stdout.trim()) addLog(result.stdout.trim());
    if (result.stderr.trim()) addLog(result.stderr.trim());
    return result;
  };
  try {
    if (!(await validRepo(config))) throw new Error('博客仓库无效，请先在设置中重新选择。');
    const relativePost = path.posix.join('content/posts', filename);
    const relativeImages = images.map((image) => path.posix.join('public/images', image));
    const { stdout: alreadyStaged } = await run('git', ['diff', '--cached', '--name-only'], config.repoPath);
    if (alreadyStaged.trim()) throw new Error('Git 暂存区已有改动。请先在 Git 中处理这些改动后再发布。');
    await logRun('暂存当前文章和导入图片…', 'git', ['add', '--', relativePost, ...relativeImages]);
    const { stdout: staged } = await run('git', ['diff', '--cached', '--name-only'], config.repoPath);
    const stagedFiles = staged.split(/\r?\n/).filter(Boolean);
    if (!stagedFiles.every((file) => file === relativePost || relativeImages.includes(file))) throw new Error('暂存区含有非本次发布文件，请先清理后重试。');
    const post = (await allPosts(config)).find((item) => item.filename === filename);
    if (!post) throw new Error('找不到待发布文章。');
    if (!stagedFiles.length) {
      addLog('没有检测到待提交的文章改动，无需重复发布。');
      return { ok: true, message: '文章已是最新版本，无需重复发布。', url: `${config.productionUrl}/posts/${post.slug}`, logs };
    }
    await logRun('创建 Git 提交…', 'git', ['commit', '-m', `Publish: ${post.title}`]);
    const { stdout: sha } = await run('git', ['rev-parse', 'HEAD'], config.repoPath);
    await logRun('推送到 GitHub…', 'git', ['push', 'origin', config.branch]);
    addLog('GitHub 推送成功，等待 Vercel 对应提交完成部署…');
    const started = Date.now();
    while (Date.now() - started < 10 * 60 * 1000) {
      try {
        const deployment = await deploymentForCommit(config, sha.trim());
        if (deployment.ready) return { ok: true, message: '发布完成。', commit: sha.trim(), url: `${config.productionUrl}/posts/${post.slug}`, logs };
      } catch (error) { addLog(`部署查询重试：${error instanceof Error ? error.message : String(error)}`); }
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }
    throw new Error('GitHub 已推送，但 Vercel 在 10 分钟内未报告部署完成。');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    addLog(`发布失败：${message}`);
    return { ok: false, logs, error: message };
  }
}

let windowRef: BrowserWindow | undefined;
function createWindow() {
  windowRef = new BrowserWindow({ width: 1440, height: 940, minWidth: 1080, minHeight: 720, backgroundColor: '#f7f8f6', webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true } });
  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) windowRef.loadURL(devUrl); else windowRef.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
}

app.whenReady().then(() => {
  ipcMain.handle('config:get', readConfig);
  ipcMain.handle('config:save', async (_event, config: StudioConfig) => { if (!(await validRepo(config))) throw new Error('该目录不是有效博客仓库。'); await writeConfig(config); return config; });
  ipcMain.handle('dialog:repo', async () => { const result = await dialog.showOpenDialog({ properties: ['openDirectory'] }); return result.canceled ? undefined : result.filePaths[0]; });
  ipcMain.handle('status:get', async () => status(await readConfig()));
  ipcMain.handle('posts:list', async () => allPosts(await readConfig()));
  ipcMain.handle('posts:save', async (_event, post: StudioPost) => savePost(await readConfig(), post));
  ipcMain.handle('posts:delete', async (_event, filename: string) => { const config = await readConfig(); await fs.unlink(path.join(postsPath(config), filename)); });
  ipcMain.handle('images:import', async () => {
    const config = await readConfig();
    const result = await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'], filters: [{ name: '图片', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'svg'] }] });
    if (result.canceled) return [];
    await fs.mkdir(imagesPath(config), { recursive: true });
    const imported: string[] = [];
    for (const source of result.filePaths) {
      const extension = path.extname(source).toLowerCase();
      const base = path.basename(source, extension).replace(/[^a-zA-Z0-9\u4e00-\u9fff_-]+/g, '-').replace(/^-+|-+$/g, '') || 'image';
      let filename = `${base}${extension}`; let sequence = 2;
      while (await exists(path.join(imagesPath(config), filename))) filename = `${base}-${sequence++}${extension}`;
      await fs.copyFile(source, path.join(imagesPath(config), filename)); imported.push(filename);
    }
    return imported;
  });
  ipcMain.handle('publish', async (event, filename: string, images: string[]) => publish(await readConfig(), filename, images, (message) => event.sender.send('publish:log', message)));
  ipcMain.handle('openExternal', async (_event, url: string) => shell.openExternal(url));
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
