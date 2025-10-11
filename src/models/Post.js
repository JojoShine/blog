import { DataTypes } from 'sequelize';
import sequelize from '../lib/db.js';

/**
 * 博客文章模型
 * 定义博客文章的所有字段，包含标题、内容、发布状态等核心信息
 */
const Post = sequelize.define('Post', {
  // 文章唯一标识符
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // 文章标题，必填字段，用于前端展示和 SEO
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // URL友好的文章别名，用于构建文章详情页路径，必须唯一
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  // 文章正文内容，支持 Markdown 格式的文本
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  // 文章摘要，可选，用于文章列表页面的预览展示
  excerpt: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // 特色图片URL，可选，用于文章列表和详情页展示
  featured_image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // 文章发布状态，false为草稿，true为已发布
  published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // 文章发布时间，只有在文章发布时才设置
  published_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // 所属分类的外键，可为空（无分类文章）
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'categories', // 关联到 categories 表
      key: 'id',
    },
  },
}, {
  tableName: 'posts', // 对应数据库表名
  timestamps: true, // 自动添加 created_at 和 updated_at 字段
  underscored: true, // 使用下划线命名而不是驼峰命名
});

export default Post;