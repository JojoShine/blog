import sequelize from '../lib/db.js';
import Category from './Category.js';
import Post from './Post.js';
import Comment from './Comment.js';

/**
 * 数据库模型关联配置
 * 定义模型之间的关联关系
 */

// 一个分类可以有多篇文章（一对多关系）
Category.hasMany(Post, {
  foreignKey: 'category_id', // 使用Post表中的category_id字段作为外键
  as: 'posts', // 关联别名，在查询时可以通过category.posts访问该分类下的所有文章
});

// 一篇文章属于一个分类（多对一关系）
Post.belongsTo(Category, {
  foreignKey: 'category_id', // 使用Post表中的category_id字段作为外键
  as: 'category', // 关联别名，在查询时可以通过post.category访问文章所属的分类
});

// 一篇文章可以有多条评论（一对多关系）
Post.hasMany(Comment, {
  foreignKey: 'post_id',
  as: 'comments',
});

// 一条评论属于一篇文章（多对一关系）
Comment.belongsTo(Post, {
  foreignKey: 'post_id',
  as: 'post',
});

// 一条评论可以有多条回复（自关联一对多）
Comment.hasMany(Comment, {
  foreignKey: 'parent_id',
  as: 'replies',
});

// 一条回复属于一条父评论（自关联多对一）
Comment.belongsTo(Comment, {
  foreignKey: 'parent_id',
  as: 'parent',
});

/**
 * 数据库同步说明：
 * 本项目不使用Sequelize的自动同步功能，数据库结构通过SQL文件手动管理
 * 初始化数据库结构请使用：database/schema.sql
 * 示例数据请使用：database/seed.sql
 */

// 导出模型供其他模块使用
export { Category, Post, Comment };
// 导出数据库连接实例
export default sequelize;