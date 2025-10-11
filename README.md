# 甜宝塔的博客 (TBT Blog)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)

一个基于 Next.js 15 构建的现代化博客系统，支持Markdown文章编写、分类管理、评论系统、图片上传（OSS）等功能。

## ✨ 特性

- 🎨 **现代化UI** - 使用 Tailwind CSS 4 和自定义组件库
- 📝 **Markdown编辑** - 支持Markdown语法，代码高亮，实时预览
- 🌓 **主题切换** - 支持深色/浅色主题自动切换
- 🔍 **全文搜索** - 快速搜索文章内容
- 🏷️ **分类管理** - 灵活的文章分类系统
- 💬 **评论系统** - 支持文章评论功能
- 🖼️ **图片管理** - 集成阿里云OSS，支持图片上传和管理
- 📱 **响应式设计** - 完美适配移动端和桌面端
- 🔗 **社交分享** - 支持微信、微博、Twitter等平台分享
- 📊 **管理后台** - 完整的内容管理系统
- 🚀 **SEO优化** - 服务端渲染，优化搜索引擎收录

## 🛠️ 技术栈

### 前端
- **框架**: Next.js 15.5.4 (App Router)
- **UI库**: React 19.1.0
- **样式**: Tailwind CSS 4
- **组件库**: Radix UI
- **Markdown**: react-markdown, remark-gfm, rehype-highlight
- **主题**: next-themes

### 后端
- **数据库**: PostgreSQL
- **ORM**: Sequelize
- **存储**: 阿里云 OSS
- **部署**: PM2 + Nginx

## 📦 快速开始

### 前置要求

- Node.js 18+
- PostgreSQL 数据库
- npm 或 yarn

### 安装步骤

1. **克隆项目**

```bash
git clone https://github.com/your-username/blog.git
cd blog
```

2. **安装依赖**

```bash
npm install
```

3. **配置环境变量**

复制 `.env.example` 文件为 `.env`，并填写相关配置：

```bash
cp .env.example .env
```

配置数据库连接和OSS信息：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=blog
DB_USER=your_username
DB_PASSWORD=your_password

# 阿里云OSS配置
OSS_REGION=oss-cn-hangzhou
OSS_ACCESS_KEY_ID=your_access_key_id
OSS_ACCESS_KEY_SECRET=your_access_key_secret
OSS_BUCKET=your_bucket_name
```

4. **初始化数据库**

```bash
# 运行数据库迁移脚本
node database/init.js
```

5. **启动开发服务器**

```bash
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 📖 使用指南

### 开发环境

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm start            # 启动生产服务器
npm run lint         # 运行代码检查
```

### 生产部署

项目提供了自动化部署脚本：

```bash
# 1. 构建项目
npm run build

# 2. 打包部署文件
./deploy-package.sh

# 3. 上传到服务器并解压
tar -xzf blog-deploy-*.tar.gz
cd blog-deploy-*

# 4. 安装生产依赖
npm install --production

# 5. 使用PM2启动（推荐）
pm2 start ecosystem.config.js

# 或直接启动
npm start
```

详细部署说明请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

### 管理后台

访问 `/admin` 进入管理后台，首次使用需要创建管理员账户。

管理后台功能：
- 📝 文章管理（创建、编辑、发布、删除）
- 🏷️ 分类管理
- 💬 评论管理
- 🖼️ 媒体库管理
- 📊 数据统计

## 🗂️ 项目结构

```
blog/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── admin/          # 管理后台
│   │   ├── api/            # API Routes
│   │   ├── blog/           # 博客展示页
│   │   ├── categories/     # 分类页
│   │   ├── search/         # 搜索页
│   │   └── page.js         # 首页
│   ├── components/         # React组件
│   ├── lib/                # 工具函数
│   ├── models/             # Sequelize模型
│   └── assets/             # 静态资源
├── database/               # 数据库脚本
├── public/                 # 公共文件
├── .env.example           # 环境变量示例
├── next.config.mjs        # Next.js配置
├── ecosystem.config.js    # PM2配置
└── deploy-package.sh      # 部署打包脚本
```

## 🤝 贡献指南

欢迎贡献代码！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详细信息。

### 贡献流程

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 📝 许可证

本项目采用 MIT 许可证。详见 [LICENSE](./LICENSE) 文件。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Radix UI](https://www.radix-ui.com/) - UI组件库
- [React Markdown](https://github.com/remarkjs/react-markdown) - Markdown渲染
- [Sequelize](https://sequelize.org/) - ORM框架
- [Highlight.js](https://highlightjs.org/) - 代码高亮

## 📧 联系方式

- 网站: [https://tbtparent.me/blog](https://tbtparent.me/blog)
- 问题反馈: [GitHub Issues](https://github.com/your-username/blog/issues)

## 🌟 Star History

如果这个项目对您有帮助，请给我们一个 ⭐️ Star！

---

**注意**: 在部署到生产环境前，请确保：
1. 修改默认的管理员密码
2. 配置正确的数据库连接
3. 设置OSS访问密钥
4. 更新 `next.config.mjs` 中的 `basePath` 配置
5. 确保敏感信息（`.env` 文件）不被提交到版本控制系统