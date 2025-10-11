# 数据库配置和初始化

## 文件说明

- `schema.sql` - 数据库结构定义，包含表结构、索引和触发器
- `seed.sql` - 示例数据，包含测试分类和文章
- `README.md` - 本说明文档

## 数据库初始化步骤

### 1. 确保 PostgreSQL 已安装并运行

```bash
# 检查 PostgreSQL 是否运行
psql --version
```

### 2. 创建数据库

```bash
# 连接到 PostgreSQL
psql -U your_username -h localhost

# 创建数据库
CREATE DATABASE blog;

# 退出 psql
\q
```

### 3. 执行初始化脚本

```bash
# 进入项目根目录
cd /path/to/blog

# 执行结构初始化
psql -U admin -h localhost -d blog -f database/schema.sql

# 执行示例数据插入（可选）
psql -U admin -h localhost -d blog -f database/seed.sql
```

### 4. 验证数据库

```bash
# 连接到博客数据库
psql -U admin -h localhost -d blog

# 查看表结构
\dt

# 查看示例数据
SELECT COUNT(*) FROM categories;
SELECT COUNT(*) FROM posts;

# 退出
\q
```

## 环境配置

确保在 `.env.local` 文件中配置了正确的数据库连接信息：

```env
DATABASE_URL=postgres://admin:password@localhost:5432/blog
```

## 数据库结构说明

### categories 表
- `id` - 主键，自增
- `name` - 分类名称，唯一
- `slug` - URL友好的标识符，唯一
- `description` - 分类描述
- `created_at` - 创建时间
- `updated_at` - 更新时间

### posts 表
- `id` - 主键，自增
- `title` - 文章标题
- `slug` - URL友好的标识符，唯一
- `content` - 文章内容（Markdown格式）
- `excerpt` - 文章摘要
- `featured_image` - 特色图片URL
- `published` - 是否发布
- `published_at` - 发布时间
- `category_id` - 关联分类ID（外键）
- `created_at` - 创建时间
- `updated_at` - 更新时间

## 索引说明

为了提高查询性能，创建了以下索引：
- `idx_posts_published` - 发布状态索引
- `idx_posts_category_id` - 分类ID索引
- `idx_posts_published_at` - 发布时间索引
- `idx_posts_slug` - 文章slug索引
- `idx_categories_slug` - 分类slug索引
- `idx_posts_search` - 全文搜索索引

## 注意事项

1. 执行SQL脚本前请备份现有数据
2. 确保数据库用户有足够的权限
3. 在生产环境中，建议使用数据库迁移工具
4. 定期备份数据库数据

## 故障排除

### 连接错误
- 检查PostgreSQL服务是否启动
- 验证用户名、密码和数据库名
- 确认防火墙设置

### 权限错误
- 确保数据库用户有CREATE、INSERT、UPDATE、DELETE权限
- 检查数据库和表的所有者

### 字符编码问题
- 确保数据库使用UTF-8编码
- 检查客户端编码设置