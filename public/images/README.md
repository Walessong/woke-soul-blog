# 图片目录说明

## SEO 图片要求

### og-default.jpg
- 用途：Open Graph 默认分享图片
- 尺寸：1200x630 像素（推荐）
- 格式：JPG 或 PNG
- 说明：当文章没有指定封面图时，社交媒体分享会使用这张图片

### avatar.jpg
- 用途：首页作者头像
- 尺寸：建议 400x400 像素或更大
- 格式：JPG、PNG 或 AVIF
- 说明：显示在博客首页

## 文章封面图

文章可以在 front matter 中指定封面图：

```yaml
---
title: "文章标题"
image: "images/post-cover.jpg"
# 或使用多张图片
images: ["images/cover1.jpg", "images/cover2.jpg"]
---
```

## 最佳实践

1. 所有图片应放在 `static/images/` 目录下
2. 使用有意义的文件名，便于管理
3. 图片优化：使用工具压缩图片，减少文件大小
4. 支持格式：JPG、PNG、WebP、AVIF、SVG
5. Open Graph 图片建议尺寸：1200x630 或 1200x1200
