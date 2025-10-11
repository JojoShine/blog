/** @type {import('next').NextConfig} */
const nextConfig = {
  // 生产环境静态资源前缀 - 使用子路径 /blog
  assetPrefix: process.env.NODE_ENV === 'production' ? '/blog' : undefined,

  // 基础路径配置
  basePath: process.env.NODE_ENV === 'production' ? '/blog' : '',

  // 压缩优化
  compress: true,

  // 生产环境优化
  productionBrowserSourceMaps: false,

  webpack: (config, { isServer }) => {
    if (isServer) {
      // 将数据库相关的包标记为外部依赖，避免打包问题
      config.externals.push('pg', 'pg-hstore', 'sequelize');
    }
    return config;
  },
};

export default nextConfig;
