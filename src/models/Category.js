import { DataTypes } from 'sequelize';
import sequelize from '../lib/db.js';

/**
 * 博客分类模型
 * 定义博客文章的分类信息，包含名称、URL别名和描述
 */
const Category = sequelize.define('Category', {
  // 分类唯一标识符
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // 分类显示名称，用于前端展示，必须唯一
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  // URL友好的分类别名，用于构建分类页面路径，必须唯一
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  // 分类描述信息，可选，用于SEO和分类页面展示
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'categories', // 对应数据库表名
  timestamps: true, // 自动添加 created_at 和 updated_at 字段
  underscored: true, // 使用下划线命名而不是驼峰命名
});

export default Category;