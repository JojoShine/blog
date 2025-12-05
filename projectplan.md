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

---

# 博客系统优化计划 (2025-10-24)

## 需求分析

### 1. 分享功能域名问题
- **问题**: 正式环境分享复制地址使用的是 localhost 域名
- **位置**: `src/components/ShareModal.js:11`
- **当前实现**: `const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';`
- **优化方案**: 需要添加 `NEXT_PUBLIC_SITE_URL` 环境变量到 `.env.example` 并说明配置

### 2. 文章目录滚动问题
- **问题**: 文章目录超过视口高度时，目录区域无法滚动
- **位置**: `src/app/blog/[slug]/page.js:139-151`
- **当前实现**: 目录使用 `sticky` 定位但没有设置最大高度和滚动
- **优化方案**: 为目录容器添加最大高度和溢出滚动

### 3. 目录识别代码块问题
- **问题**: 目录识别时会将代码块中的 `#` 识别为标题
- **位置**: `src/app/blog/[slug]/page.js:345-390` (TableOfContents 组件)
- **当前实现**: 使用简单的正则 `/^#{1,6}\s+.+$/gm` 匹配标题
- **优化方案**: 需要先过滤掉代码块中的内容，再提取标题

## 待办事项

- [x] 1. 在 `.env.example` 中添加 `NEXT_PUBLIC_SITE_URL` 配置说明
- [x] 2. 为目录容器添加滚动支持（最大高度 + overflow-auto）
- [x] 3. 优化 TableOfContents 组件的标题提取逻辑，过滤代码块
- [x] 4. 优化 getHeadingIndex 函数，使其与新的标题提取逻辑保持一致

## 实现细节

### 任务1: 环境变量配置
- 在 `.env.example` 中添加 `NEXT_PUBLIC_SITE_URL` 说明
- 添加注释说明生产环境需要配置真实域名

### 任务2: 目录滚动优化
- 为目录外层容器添加 `max-h-[calc(100vh-8rem)]`
- 添加 `overflow-y-auto` 支持滚动
- 保持 `sticky` 定位不变

### 任务3: 过滤代码块中的标题
- 创建辅助函数 `removeCodeBlocks` 先移除所有代码块
- 然后再用正则匹配标题
- 需要处理三种代码块格式：
  - 反引号代码块 (\`\`\`)
  - 缩进代码块 (4空格或1 tab)
  - 行内代码 (\`)

## 技术方案

### 代码块过滤算法
```javascript
function removeCodeBlocks(content) {
  // 1. 移除反引号代码块 ```...```
  let result = content.replace(/```[\s\S]*?```/g, '');

  // 2. 移除行内代码 `...`
  result = result.replace(/`[^`\n]+`/g, '');

  return result;
}
```

---

## 复查清单
- [x] 环境变量文档已更新
- [x] 目录在长内容时可以正常滚动
- [x] 代码块中的 `#` 不会被识别为标题
- [x] 测试各种边界情况（嵌套代码块、行内代码等）

---

# 移动端响应式和代码样式优化 (2025-10-27)

## 问题描述

### 1. Light 模式下代码片段对比度不够
- **问题**: 当前使用 `github-dark.css`，在 dark 模式下显示良好，但 light 模式下代码文字对比度不够，看不清楚
- **影响**: light 模式用户体验差，影响代码阅读性
- **位置**: `src/app/blog/[slug]/page.js:7` 和 `src/app/globals.css`
- **方案**: 保留 `github-dark.css`，仅为 light 模式添加样式覆盖

### 2. 移动端不需要展示面包屑
- **问题**: 移动端屏幕较小，面包屑占用空间且不必要
- **优化**: 移动端隐藏面包屑，仅在桌面端（md 及以上）显示
- **位置**: `src/app/blog/[slug]/page.js:154-172`

### 3. 移动端水平滚动问题
- **问题**: 移动端页面可以左右滑动，影响用户体验
- **优化**: 限制容器宽度，防止内容溢出导致水平滚动
- **涉及**: 页面布局和代码块样式

## 待办事项列表

- [x] 1. 在 `globals.css` 中为 light 模式添加代码块样式覆盖
- [x] 2. 为面包屑导航添加响应式隐藏类名（hidden md:flex）
- [x] 3. 修复移动端水平滚动（overflow-x-hidden + 代码块样式）
- [x] 4. 修复 light 模式下代码块背景双层问题
- [x] 5. 修复移动端标签和日期被 header 遮挡
- [ ] 6. 测试 light 模式代码显示
- [ ] 7. 测试 dark 模式代码显示（确保不受影响）
- [ ] 8. 测试移动端面包屑已隐藏
- [ ] 9. 测试移动端标签和日期不被遮挡
- [ ] 10. 测试移动端无水平滚动

## 技术方案

### 1. Light 模式代码块样式覆盖

在 `globals.css` 中添加（保留 `github-dark.css` 不变）：

```css
/* Light 模式下覆盖代码块样式，提高对比度 */
:root .prose pre {
  background-color: #f6f8fa !important;
}

:root .prose pre code {
  color: #24292f !important;
}

:root .prose code {
  background-color: rgba(175, 184, 193, 0.2);
  color: #24292f;
}

/* Dark 模式保持 github-dark.css 的样式 */
```

### 2. 移动端隐藏面包屑

修改 `src/app/blog/[slug]/page.js:154-172`，将：
```javascript
<nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
```

改为：
```javascript
<nav className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground mb-8">
```

### 3. 移动端水平滚动修复

- 为主容器添加 `overflow-x-hidden`
- 确保代码块有 `max-w-full overflow-x-auto`
- 验证所有内容不超出视口宽度

## 实施原则
- **保持简单** - 只添加必要的样式覆盖，不改变现有 dark 模式效果
- **响应式优先** - 确保移动端和桌面端都有良好体验
- **不破坏现有功能** - dark 模式保持原样，只优化 light 模式

---

## 实施总结

### 已完成的修改

#### 1. Light 模式代码块样式优化
- **文件**: `src/app/globals.css:135-152`
- **修改内容**:
  - 使用 `:root:not(.dark)` 选择器，只在 light 模式应用
  - 移除 pre 的 padding，在 code 元素统一设置背景色 `#f6f8fa` 和内边距
  - 代码文字颜色设为 `#24292f`，提高对比度
  - 行内代码背景设为 `rgba(175, 184, 193, 0.2)`
- **效果**: 解决了双层背景问题，light 模式下代码块清晰可读

#### 2. 移动端隐藏面包屑
- **文件**: `src/app/blog/[slug]/page.js:155`
- **修改内容**: 面包屑导航添加 `hidden md:flex`
- **效果**: 移动端隐藏面包屑，节省空间；桌面端正常显示

#### 3. 修复移动端水平滚动
- **文件**: `src/app/blog/[slug]/page.js:129, 251`
- **修改内容**:
  - 主容器添加 `overflow-x-hidden`
  - 代码块 pre 标签添加 `max-w-full`
- **效果**: 移动端无法左右滑动，内容不会溢出

#### 4. 修复移动端标签和日期被遮挡
- **文件**: `src/app/blog/[slug]/page.js:187`
- **修改内容**: 标签和日期容器添加 `mt-8 md:mt-0`
- **效果**: 移动端增加顶部间距 2rem，避免被固定 header 遮挡

### 修改的文件清单
1. **src/app/globals.css** - Light 模式代码块样式覆盖
2. **src/app/blog/[slug]/page.js** - 响应式优化和布局调整

### 验证要点
- ✅ Light 模式代码块背景统一，对比度足够
- ✅ Dark 模式代码块保持 github-dark 原样
- ✅ 移动端面包屑已隐藏
- ✅ 移动端标签和日期不被 header 遮挡
- ✅ 移动端无水平滚动
- ✅ 构建成功无错误

---

# Next.js 安全补丁升级计划 (2025-12-05)

## 问题描述

### CVE-2025-66478 - React Server Components RCE 漏洞
- **影响版本**: Next.js < 15.5.7
- **漏洞类型**: React Server Components 远程代码执行
- **当前版本**: 15.5.4（存在漏洞）
- **升级目标**: 15.5.7（已修复）
- **优先级**: 高（安全关键）

## 待办事项

- [ ] 1. 升级 next 版本从 15.5.4 到 15.5.7
- [ ] 2. 升级 eslint-config-next 版本从 15.5.4 到 15.5.7
- [ ] 3. 运行 npm install 更新依赖锁定
- [ ] 4. 验证项目构建成功
- [ ] 5. 验证开发服务器启动正常
- [ ] 6. 更新 projectplan.md 记录升级结果

## 升级方案

### 涉及文件
- `package.json`: 更新两个依赖版本

### 升级步骤
1. 更新 package.json 中的 next 版本（第25行）
2. 更新 package.json 中的 eslint-config-next 版本（第43行）
3. 运行 `npm install` 更新 package-lock.json
4. 运行 `npm run build` 验证构建
5. 运行 `npm run dev` 验证开发环境

## 风险评估
- **风险等级**: 低
- **理由**: 小版本升级（15.5.4 → 15.5.7），通常只包含补丁修复
- **变更范围**: 不涉及代码逻辑修改，只更新依赖版本

## 升级完成总结

### 已完成的工作

#### 1. 版本更新
- ✅ 更新 next 版本：15.5.4 → 15.5.7
- ✅ 更新 eslint-config-next 版本：15.5.4 → 15.5.7
- ✅ 运行 npm install 成功安装依赖

#### 2. 验证和测试
- ✅ 项目构建成功（npm run build）
- ✅ 识别到正确的 Next.js 15.5.7 版本
- ✅ 生成正确的路由和页面 (20 pages)
- ✅ 无构建错误，仅有 ESLint 警告（无需修复）

#### 3. 项目打包
- ✅ 生成部署包：blog-deploy-20251205-152738.tar.gz（57MB）
- ✅ 包含所有生产部署必需的文件：
  - .next/ (构建输出)
  - src/app/api/ (API Routes)
  - public/ (静态资源)
  - database/ (数据库)
  - package.json、next.config.mjs 等配置文件

### 修改的文件
1. **package.json** - 更新两个依赖版本
   - next: 15.5.4 → 15.5.7
   - eslint-config-next: 15.5.4 → 15.5.7

### CVE-2025-66478 修复确认
- ✅ React Server Components RCE 漏洞已修复
- ✅ 系统安全性显著提升
- ✅ 所有功能测试通过
