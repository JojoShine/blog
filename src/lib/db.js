import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 数据库连接配置
const sequelize = new Sequelize(
  process.env.DB_NAME || 'blog',
  process.env.DB_USER || 'postgres', 
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true,
    },
    // 不自动同步模型，使用SQL文件管理结构
    sync: false,
  }
);

// 测试数据库连接
export async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
    return true;
  } catch (error) {
    console.error('数据库连接失败:', error);
    return false;
  }
}

export default sequelize;