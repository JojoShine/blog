-- ===================================================================
-- 博客数据库初始化脚本
-- ===================================================================
-- 描述: 创建博客系统所需的数据库表结构、索引和触发器
-- 创建时间: 2024-10-09
-- 功能: 
--   1. 创建分类表(categories)和文章表(posts)
--   2. 建立表间关联关系
--   3. 创建性能优化索引
--   4. 设置自动更新时间戳触发器
--   5. 支持全文搜索功能
-- ===================================================================

-- 创建分类表
-- 用于存储博客文章的分类信息，支持分类管理和文章筛选
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 为分类表和字段添加注释
COMMENT ON TABLE categories IS '博客分类表，用于存储博客文章的分类信息';
COMMENT ON COLUMN categories.id IS '分类唯一标识ID，自增主键';
COMMENT ON COLUMN categories.name IS '分类名称，唯一不重复';
COMMENT ON COLUMN categories.slug IS 'URL友好的分类标识符，用于路由';
COMMENT ON COLUMN categories.description IS '分类描述信息，可选';
COMMENT ON COLUMN categories.created_at IS '分类创建时间，自动设置';
COMMENT ON COLUMN categories.updated_at IS '分类最后更新时间，自动维护';

-- 创建文章表
-- 用于存储博客文章的核心内容，包括标题、内容、发布状态等信息
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image VARCHAR(500),
    published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 为文章表和字段添加注释
COMMENT ON TABLE posts IS '博客文章表，用于存储博客文章的核心内容信息';
COMMENT ON COLUMN posts.id IS '文章唯一标识ID，自增主键';
COMMENT ON COLUMN posts.title IS '文章标题';
COMMENT ON COLUMN posts.slug IS 'URL友好的文章标识符，用于路由';
COMMENT ON COLUMN posts.content IS '文章正文内容，支持Markdown格式';
COMMENT ON COLUMN posts.excerpt IS '文章摘要，用于列表页显示';
COMMENT ON COLUMN posts.featured_image IS '文章特色图片URL';
COMMENT ON COLUMN posts.published IS '文章发布状态，true为已发布';
COMMENT ON COLUMN posts.published_at IS '文章发布时间';
COMMENT ON COLUMN posts.category_id IS '关联的分类ID，外键';
COMMENT ON COLUMN posts.created_at IS '文章创建时间，自动设置';
COMMENT ON COLUMN posts.updated_at IS '文章最后更新时间，自动维护';

-- 创建评论表
-- 用于存储博客评论，支持层级回复和浏览器指纹识别
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL,
    parent_id INTEGER,
    fingerprint VARCHAR(255) NOT NULL,
    author_name VARCHAR(100) NOT NULL,
    author_email VARCHAR(255),
    content TEXT NOT NULL,
    is_author BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comments_post
        FOREIGN KEY (post_id)
        REFERENCES posts(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_comments_parent
        FOREIGN KEY (parent_id)
        REFERENCES comments(id)
        ON DELETE CASCADE
);

-- 为评论表和字段添加注释
COMMENT ON TABLE comments IS '博客评论表，支持层级回复和浏览器指纹识别';
COMMENT ON COLUMN comments.id IS '评论唯一标识ID，自增主键';
COMMENT ON COLUMN comments.post_id IS '所属文章ID，外键关联posts表';
COMMENT ON COLUMN comments.parent_id IS '父评论ID，null表示顶级评论，非null表示回复';
COMMENT ON COLUMN comments.fingerprint IS '浏览器指纹，用于识别评论者';
COMMENT ON COLUMN comments.author_name IS '评论者昵称';
COMMENT ON COLUMN comments.author_email IS '评论者邮箱（可选）';
COMMENT ON COLUMN comments.content IS '评论内容，纯文本';
COMMENT ON COLUMN comments.is_author IS '是否为博客作者回复，true表示作者回复';
COMMENT ON COLUMN comments.created_at IS '评论创建时间，自动设置';
COMMENT ON COLUMN comments.updated_at IS '评论最后更新时间，自动维护';

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);        -- 文章发布状态索引，加速已发布文章查询
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id);    -- 分类ID索引，加速按分类筛选
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at);  -- 发布时间索引，加速按时间排序
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);                  -- 文章slug索引，加速单篇文章查询
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);        -- 分类slug索引，加速分类页面访问
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);      -- 评论文章ID索引，加速按文章查询评论
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);  -- 评论父ID索引，加速查询回复
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC); -- 评论创建时间索引，加速按时间排序
CREATE INDEX IF NOT EXISTS idx_comments_fingerprint ON comments(fingerprint); -- 浏览器指纹索引，加速查询用户评论

-- 创建全文搜索索引
-- 使用GIN索引支持英文全文搜索，包含标题和内容
CREATE INDEX IF NOT EXISTS idx_posts_search ON posts USING gin(to_tsvector('english', title || ' ' || content));

-- 创建更新时间戳的触发器函数
-- 此函数用于自动更新记录的updated_at字段为当前时间
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;  -- 设置更新时间为当前时间戳
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为函数添加注释
COMMENT ON FUNCTION update_updated_at_column() IS '自动更新updated_at字段的触发器函数';

-- 为表添加更新时间戳触发器
-- 当分类记录更新时，自动触发updated_at字段更新
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 当文章记录更新时，自动触发updated_at字段更新
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 当评论记录更新时，自动触发updated_at字段更新
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- 显示创建完成的表结构
-- ===================================================================
-- 执行此命令查看已创建的表
\dt