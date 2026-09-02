---
title: "Auto Deploy"
date: 2025-08-06
draft: false
series: ["Tech & Engineering"]
---

### Github Action自动部署

* （1）Github创建一个新的仓库，用于存放Hugo的主文件

* （2）前往`Setttings -> Developer Settings -> Personal access tokens`，创建一个token(classic)

[创建Token1](https://letere-gzj.github.io/hugo-stack/p/hugo/custom-blog/createToken1.png)

* （3）token选择永不过期，并勾选 **repo** 和 **workflow** 选项

[创建Token2](https://letere-gzj.github.io/hugo-stack/p/hugo/custom-blog/createToken2.png)

* （4）为保证安全，将生成的token，保存的仓库的变量中，前往`Settings -> Secrets and variables -> Actions`中设置

[创建Token3](https://letere-gzj.github.io/hugo-stack/p/hugo/custom-blog/createToken3.png)

[设置Token1](https://letere-gzj.github.io/hugo-stack/p/hugo/custom-blog/setToken1.png)

* （5）在hugo主文件创建一个`.github/workflows/xxxx.yaml`文件，将以下内容复制进去，想具体了解更多，可查看【[Github Action文档](https://docs.github.com/zh/actions)】

```yaml
name: deploy

# 代码提交到main分支时触发github action
on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
        - name: Checkout
          uses: actions/checkout@v4
          with:
              fetch-depth: 0

        - name: Setup Hugo
          uses: peaceiris/actions-hugo@v3
          with:
              hugo-version: "latest"
              extended: true

        - name: Build Web
          run: hugo -D

        - name: Deploy Web
          uses: peaceiris/actions-gh-pages@v4
          with:
              PERSONAL_TOKEN: ${{ secrets.你的token变量名 }}
              EXTERNAL_REPOSITORY: 你的github名/你的仓库名
              PUBLISH_BRANCH: main
              PUBLISH_DIR: ./public
              commit_message: auto deploy
```

* （6）在hugo主文件创建`.gitignore`文件，来避免提交不必要的文件

```
# 自动生成的文件
public
resources
.hugo_build.lock

# hugo命令
hugo.exe
```

* （7）将hugo的主文件上传到仓库，上传成功后会触发Github Action，来自动部署你的静态页面

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin {你的github仓库地址}
git push -u origin main
```

[GitHub Action运行](https://letere-gzj.github.io/hugo-stack/p/hugo/custom-blog/githubActionRun.png)
