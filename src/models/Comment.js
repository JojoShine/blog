import { DataTypes } from 'sequelize';
import sequelize from '../lib/db.js';

/**
 * 评论模型
 * 支持层级回复、浏览器指纹识别和作者标识
 */
const Comment = sequelize.define('Comment', {
  // 评论唯一标识符
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // 所属文章ID
  post_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'posts',
      key: 'id',
    },
    onDelete: 'CASCADE', // 文章删除时级联删除评论
  },
  // 父评论ID，用于回复功能，null表示顶级评论
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'comments',
      key: 'id',
    },
    onDelete: 'CASCADE', // 父评论删除时级联删除子评论
  },
  // 浏览器指纹，用于识别评论者
  fingerprint: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  // 评论者昵称
  author_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  // 评论者邮箱（可选）
  author_email: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  // 评论内容
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  // 是否为博客作者的回复
  is_author: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'comments',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['post_id'],
    },
    {
      fields: ['parent_id'],
    },
  ],
});

export default Comment;