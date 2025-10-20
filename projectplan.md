# 管理端特色图片上传报错修复 (2025-10-20)

## 问题描述

### 管理端上传特色图片报错
- **问题**: 在管理端上传特色图片时出现Next.js Image配置错误
- **错误信息**: `Invalid src prop (https://blog.tbtparent.me/e7cc341d-c843-4d11-81e9-96662a4c4d09.jpg) on next/image, hostname "blog.tbtparent.me" is not configured under images in your next.config.js`
- **影响**: 特色图片虽然上传成功，但无法在管理端预览显示
- **位置**: `/admin/posts/new` 和 `/admin/posts/[id]` 文章编辑页面

## 技术分析

### 根本原因
- Next.js Image组件要求所有外部图片域名必须在配置中明确列出
- 当前 `next.config.mjs` 缺少 `images` 配置
- 上传的图片返回完整URL（如 `https://blog.tbtparent.me/xxx.jpg`）
- Image组件尝试加载该URL时发现域名未配置，抛出错误

### 解决方案选择

**方案1**: 配置 Next.js Image domains
- 在 `next.config.mjs` 中添加 `images.remotePatterns` 配置
- 允许来自 `blog.tbtparent.me` 域名的图片
- 保留Image组件的优化功能

**方案2**: 使用普通img标签（采用此方案）
- 将管理端特色图片预览的Image组件替换为img标签
- 与之前修复的展示端图片显示方式保持一致
- 简单直接，直接使用OSS地址

**最终选择**: 方案2 - 使用普通img标签
- OSS已经提供了优化后的图片，不需要Next.js再次优化
- 与展示端保持一致的处理方式
- 避免配置复杂性，简单直接
- 减少Next.js的图片处理负担

## 待办事项列表

### 阶段1：修复新建文章页特色图片显示
- [x] 1.1 检查 /admin/posts/new/page.js 文件
- [x] 1.2 将 Image 组件替换为 img 标签
- [x] 1.3 移除 Image 组件导入
- [x] 1.4 验证修改正确

### 阶段2：修复编辑文章页特色图片显示
- [x] 2.1 检查 /admin/posts/[id]/page.js 文件
- [x] 2.2 将 Image 组件替换为 img 标签
- [x] 2.3 移除 Image 组件导入
- [x] 2.4 验证修改正确

### 阶段3：测试和验证
- [x] 3.1 测试上传新特色图片
- [x] 3.2 验证图片正常显示
- [x] 3.3 检查控制台无错误
- [x] 3.4 测试编辑文章中的特色图片

### 阶段4：更新和总结
- [x] 4.1 更新projectplan.md总结
- [x] 4.2 记录修改的文件

## 实施总结

### 已完成的工作

#### 修复管理端特色图片显示问题
- **问题**: 上传特色图片后报错 "hostname 'blog.tbtparent.me' is not configured"
- **原因**: Next.js Image 组件要求外部图片域名必须在配置中列出
- **解决方案**: 将 Image 组件替换为普通 img 标签，直接使用 OSS 地址
- **优势**:
  - 简单直接，无需配置
  - 与展示端图片显示方式保持一致
  - 直接使用 OSS 地址，减少 Next.js 处理负担

### 修改的文件

1. **/src/app/admin/posts/new/page.js** - 新建文章页
   - 移除 `import Image from "next/image"` 导入
   - 将特色图片的 Image 组件替换为 img 标签（第364-368行）

2. **/src/app/admin/posts/[id]/page.js** - 编辑文章页
   - 移除 `import Image from "next/image"` 导入
   - 将特色图片的 Image 组件替换为 img 标签（第438-442行）

### 验证要点
- ✅ 特色图片上传功能正常
- ✅ 图片使用 OSS 地址直接显示
- ✅ 控制台不再报 Next.js Image 配置错误
- ✅ 新建文章和编辑文章页都正常工作

## 实施原则
- **保持简单** - 只修改必要的组件代码
- **统一处理** - 与展示端图片显示方式保持一致
- **直接使用OSS** - 直接使用OSS地址，不经过Next.js优化
- **验证充分** - 测试上传和显示功能

## 技术要点

### 修改方式
将 Next.js Image 组件：
```javascript
<Image
  src={formData.featuredImage}
  alt="特色图片"
  width={400}
  height={128}
  className="w-full h-32 object-cover rounded-lg"
/>
```

替换为普通 img 标签：
```javascript
<img
  src={formData.featuredImage}
  alt="特色图片"
  className="w-full h-32 object-cover rounded-lg"
/>
```

### 修改位置
- `/src/app/admin/posts/new/page.js` - 第365-371行
- `/src/app/admin/posts/[id]/page.js` - 第439-445行
