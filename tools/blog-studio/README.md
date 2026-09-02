# 流动盛宴写作台

用于本地编辑 `content/posts` 中的 Markdown 文章并一键发布到博客的 Windows 桌面应用。

## 使用

1. 运行 `release/流动盛宴写作台 Setup 0.1.0.exe` 安装应用。
2. 首次启动时选择博客仓库，例如 `D:\blog\woke-soul-blog`。
3. 确保 GitHub 已通过 Git 登录，并在 PowerShell 中至少执行过一次 `npx vercel login`。
4. 新建文章会保存为本地草稿；点击“发布”会保存、提交、推送，并等待 Vercel 自动部署。

应用只会提交当前文章和本次导入的图片。Git 暂存区已有改动时会阻止发布，避免误提交其他文件。

## 开发和打包

```powershell
cd D:\blog\woke-soul-blog\tools\blog-studio
npm install
npm run dev
npm run dist
```

`npm run dist` 会生成 NSIS 安装程序到 `release` 目录。该目录、构建产物和依赖均不提交到博客仓库。
