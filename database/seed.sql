-- 博客示例数据
-- 注意：运行此脚本前请确保已经运行了 schema.sql

-- 插入示例分类
INSERT INTO categories (name, slug, description) VALUES
('技术', 'tech', '技术相关文章，包括编程、开发工具等'),
('生活', 'life', '生活感悟、日常记录'),
('学习', 'study', '学习笔记和心得体会'),
('随笔', 'notes', '随想随记，思考片段')
ON CONFLICT (slug) DO NOTHING;

-- 插入示例文章
INSERT INTO posts (title, slug, content, excerpt, published, published_at, category_id) VALUES
(
    '欢迎来到我的博客',
    'welcome-to-my-blog',
    '# 欢迎来到我的博客

这是我的第一篇博客文章！

## 关于这个博客

这个博客是使用 Next.js 和 PostgreSQL 构建的现代化博客系统，具有以下特点：

- **响应式设计**：适配各种设备
- **Markdown 支持**：支持 Markdown 语法写作
- **分类管理**：文章可以按分类组织
- **搜索功能**：快速找到您需要的内容
- **后台管理**：完整的后台管理系统

## 技术栈

- **前端**：Next.js + Tailwind CSS + shadcn/ui
- **后端**：Next.js API Routes
- **数据库**：PostgreSQL + Sequelize
- **文件存储**：阿里云OSS
- **Markdown 渲染**：react-markdown

希望您喜欢这个博客！',
    '欢迎来到我的博客！这里将分享技术见解、生活感悟和学习心得。',
    true,
    CURRENT_TIMESTAMP,
    (SELECT id FROM categories WHERE slug = 'life')
),
(
    'Next.js 开发入门指南',
    'nextjs-development-guide',
    '# Next.js 开发入门指南

Next.js 是一个基于 React 的全栈框架，提供了很多开箱即用的功能。

## 主要特性

### 1. 服务端渲染 (SSR)
Next.js 支持服务端渲染，可以提高首屏加载速度和 SEO 效果。

```javascript
export async function getServerSideProps(context) {
  const data = await fetchData();
  return {
    props: {
      data,
    },
  };
}
```

### 2. 静态生成 (SSG)
对于内容相对静态的页面，可以使用静态生成来提高性能。

```javascript
export async function getStaticProps() {
  const posts = await getPosts();
  return {
    props: {
      posts,
    },
    revalidate: 60, // 60秒后重新生成
  };
}
```

### 3. API Routes
Next.js 内置了 API 功能，可以轻松创建后端接口。

```javascript
export default function handler(req, res) {
  res.status(200).json({ message: "Hello World" });
}
```

## 总结

Next.js 是一个功能强大的框架，适合构建现代化的 Web 应用。',
    'Next.js 是一个基于 React 的全栈框架，本文介绍了其主要特性和使用方法。',
    true,
    CURRENT_TIMESTAMP - INTERVAL ''1 day'',
    (SELECT id FROM categories WHERE slug = 'tech')
),
(
    'Markdown 语法快速参考',
    'markdown-syntax-reference',
    '# Markdown 语法快速参考

Markdown 是一种轻量级标记语言，让您可以使用易读易写的纯文本格式编写文档。

## 标题

```markdown
# 一级标题
## 二级标题
### 三级标题
```

## 文本格式

- **粗体**：`**文本**` 或 `__文本__`
- *斜体*：`*文本*` 或 `_文本_`
- ~~删除线~~：`~~文本~~`
- `行内代码`：用反引号包围

## 列表

### 无序列表
```markdown
- 项目 1
- 项目 2
  - 子项目 2.1
  - 子项目 2.2
```

### 有序列表
```markdown
1. 第一项
2. 第二项
3. 第三项
```

## 链接和图片

- 链接：`[链接文本](URL)`
- 图片：`![替代文本](图片URL)`

## 代码块

使用三个反引号创建代码块：

```javascript
function hello() {
  console.log("Hello, World!");
}
```

## 表格

```markdown
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 内容1 | 内容2 | 内容3 |
```

## 引用

> 这是一个引用文本。
> 可以跨越多行。

希望这个快速参考对您有帮助！',
    'Markdown 语法快速参考指南，包含常用的 Markdown 语法和示例。',
    true,
    CURRENT_TIMESTAMP - INTERVAL ''2 days'',
    (SELECT id FROM categories WHERE slug = 'study')
),
(
    '我的学习方法分享',
    'my-learning-methods',
    '# 我的学习方法分享

在这篇文章中，我想分享一些我在学习过程中总结的方法和经验。

## 1. 主动学习

不要只是被动地接受信息，要主动地思考和提问：

- 这个概念的本质是什么？
- 它解决了什么问题？
- 有什么实际应用？
- 与其他概念有什么联系？

## 2. 实践导向

理论学习要结合实践：

- 边学边做项目
- 写代码验证概念
- 教别人来加深理解
- 写文章总结学到的内容

## 3. 建立知识体系

- 使用思维导图整理知识点
- 建立概念之间的联系
- 定期回顾和更新知识结构

## 4. 持续学习

- 设定学习计划
- 保持好奇心
- 关注行业动态
- 参与技术社区

## 5. 总结和反思

- 定期总结学习成果
- 反思学习方法的效果
- 调整学习策略

学习是一个持续的过程，希望这些方法对您有帮助！',
    '分享我在学习过程中总结的一些有效方法和经验。',
    true,
    CURRENT_TIMESTAMP - INTERVAL ''3 days'',
    (SELECT id FROM categories WHERE slug = 'study')
),
(
    '博客系统开发日记（草稿）',
    'blog-development-diary-draft',
    '# 博客系统开发日记

这是一篇关于博客系统开发过程的记录文章（草稿状态）。

## 项目规划

最近开始开发一个个人博客系统，主要目标：

1. 学习 Next.js 框架
2. 实践全栈开发
3. 搭建个人内容平台

## 技术选型

经过调研，最终选择了以下技术栈：

- 前端：Next.js + Tailwind CSS
- 后端：Next.js API Routes
- 数据库：PostgreSQL
- 部署：Vercel

## 开发计划

- [ ] 设计数据库结构
- [ ] 实现基础 CRUD 功能
- [ ] 开发前端界面
- [ ] 添加 Markdown 支持
- [ ] 实现搜索功能
- [ ] 部署上线

这篇文章还在完善中...',
    '记录博客系统的开发过程和技术选型思考（草稿）。',
    false,
    NULL,
    (SELECT id FROM categories WHERE slug = 'tech')
);

-- 显示插入的数据统计
SELECT 
    '分类' as 表名, 
    COUNT(*) as 记录数 
FROM categories
UNION ALL
SELECT 
    '文章' as 表名, 
    COUNT(*) as 记录数 
FROM posts;

-- 显示已发布的文章
SELECT 
    p.title as 文章标题,
    c.name as 分类,
    p.published as 已发布,
    p.created_at as 创建时间
FROM posts p
LEFT JOIN categories c ON p.category_id = c.id
ORDER BY p.created_at DESC;