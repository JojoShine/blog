# 博客系统部署文档

## 系统架构概述

本博客系统采用 Next.js 全栈架构，包含三个主要部分：

1. **展示端** - 用户访问的博客前端页面
2. **管理端** - 后台管理系统
3. **后端接口服务** - API 服务和数据库

## 环境要求

- Node.js 18+
- PostgreSQL 12+
- PM2 (用于进程管理)
- Nginx (用于静态资源服务和反向代理)

## 1. 数据库部署

### 1.1 创建数据库

```sql
-- 创建数据库
CREATE DATABASE blog;

-- 创建用户（可选）
CREATE USER blog_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE blog TO blog_user;
```

### 1.2 初始化数据库表结构

执行 `database/schema.sql` 文件：

```bash
psql -h localhost -U postgres -d blog -f database/schema.sql
```

### 1.3 可选：导入初始数据

```bash
psql -h localhost -U postgres -d blog -f database/seed.sql
```

## 2. 应用整体部署（前后端一体化）

由于本系统使用 Next.js API Routes，前后端是同一个应用，部署步骤如下：

### 2.1 环境配置

创建 `.env.production` 文件：

```env
# 数据库配置
DATABASE_URL=postgres://blog_user:your_password@localhost:5432/blog
DB_HOST=localhost
DB_PORT=5432
DB_NAME=blog
DB_USER=blog_user
DB_PASSWORD=your_password

# 阿里云OSS配置
OSS_REGION=oss-cn-hangzhou
OSS_ACCESS_KEY_ID=your_access_key_id
OSS_ACCESS_KEY_SECRET=your_access_key_secret
OSS_BUCKET=your_bucket_name
OSS_PUBLIC_URL=https://your_cdn_domain

# Next.js 配置
NEXT_PUBLIC_API_URL=https://your-domain.com/blog
NEXT_PUBLIC_SITE_URL=https://your-domain.com/blog

# 应用配置
NODE_ENV=production

# 管理员认证配置
NEXT_PUBLIC_ADMIN_USERNAME=admin
NEXT_PUBLIC_ADMIN_PASSWORD=your_admin_password
```

### 2.2 PM2 配置文件

创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [
    {
      name: 'blog-app',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/path/to/your/blog',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5004
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5004
      }
    }
  ]
};
```

### 2.3 部署方法

#### 方法一：本地构建后部署（推荐）

在开发环境中构建生产版本，然后上传到服务器：

```bash
# 本地构建
npm install
npm run build

# 打包项目（排除开发依赖）
tar -czf blog-deploy.tar.gz --exclude=node_modules --exclude=.git --exclude=logs .

# 上传到服务器
scp blog-deploy.tar.gz user@server:/path/to/deploy/

# 服务器上解压并部署
cd /path/to/deploy/
tar -xzf blog-deploy.tar.gz
npm ci --only=production
pm2 start ecosystem.config.js --env production
```

#### 方法二：Git 部署

使用 Git 在服务器上直接构建：

```bash
# 服务器上克隆项目
git clone https://github.com/your-username/blog.git /path/to/blog
cd /path/to/blog

# 安装依赖并构建
npm install
npm run build

# 启动服务
pm2 start ecosystem.config.js --env production
```

#### 方法三：Docker 部署（可选）

创建 Dockerfile：

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5004
CMD ["npm", "start"]
```

### 2.4 服务器部署步骤

无论使用哪种方法，服务器上的部署步骤：

```bash
# 1. 进入项目目录
cd /path/to/your/blog

# 2. 确保依赖已安装
npm ci --only=production

# 3. 启动服务（使用PM2）
pm2 start ecosystem.config.js --env production

# 4. 设置开机自启
pm2 startup
pm2 save
```

## 3. Nginx 反向代理配置

由于 Next.js 应用运行在 5004 端口，需要使用 Nginx 作为反向代理对外提供服务：

### 3.1 Nginx 配置

创建 `/etc/nginx/conf.d/blog.conf`：

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 缓存设置
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 博客系统路径代理
    location /blog {
        proxy_pass http://localhost:5004;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect / /blog/;
    }
}
```

### 3.2 重启 Nginx

```bash
# 测试配置
sudo nginx -t

# 重启nginx
sudo systemctl restart nginx
```

## 4. 管理端访问

管理端与展示端是同一个应用，通过路由区分：

- 展示端：`/`、`/blog`、`/categories` 等
- 管理端：`/admin` 路径下

### 4.1 访问管理端

管理端通过以下URL访问：
```
https://your-domain.com/blog/admin
```

### 4.2 管理员登录

使用在环境变量中配置的管理员账号登录：
- 用户名：`NEXT_PUBLIC_ADMIN_USERNAME`
- 密码：`NEXT_PUBLIC_ADMIN_PASSWORD`

## 5. SSL证书配置（可选）

使用 Let's Encrypt 配置 HTTPS：

```bash
# 安装certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 设置自动续期
sudo crontab -e
# 添加：0 12 * * * /usr/bin/certbot renew --quiet
```

## 6. 监控和维护

### 6.1 PM2 监控

```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs blog-app

# 重启服务
pm2 restart blog-app

# 停止服务
pm2 stop blog-app
```

### 6.2 日志文件

- PM2 日志：`~/.pm2/logs/`
- Nginx 日志：`/var/log/nginx/`
- 应用日志：通过 PM2 管理

### 6.3 备份策略

```bash
# 数据库备份
pg_dump -h localhost -U blog_user blog > backup_$(date +%Y%m%d).sql

# 静态资源备份
sudo tar -czf blog_static_$(date +%Y%m%d).tar.gz /var/www/blog
```

## 7. 故障排除

### 7.1 常见问题

1. **数据库连接失败**
   - 检查数据库服务是否运行
   - 验证连接字符串和凭据
   - 检查防火墙设置

2. **静态资源404**
   - 检查nginx配置中的root路径
   - 验证文件权限
   - 检查nginx错误日志

3. **API请求失败**
   - 检查后端服务是否运行
   - 验证PM2状态
   - 检查环境变量配置

### 7.2 日志检查

```bash
# 检查nginx错误日志
sudo tail -f /var/log/nginx/error.log

# 检查PM2应用日志
pm2 logs blog-api

# 检查系统日志
sudo journalctl -u nginx -f
```

## 8. 性能优化建议

1. **数据库优化**
   - 为常用查询字段添加索引
   - 定期清理过期数据
   - 使用连接池

2. **前端优化**
   - 启用CDN加速静态资源
   - 配置浏览器缓存
   - 压缩图片资源

3. **服务端优化**
   - 使用Redis缓存频繁访问的数据
   - 启用Gzip压缩
   - 配置负载均衡（如需）

---

**部署成功检查清单：**

- [ ] 数据库连接正常
- [ ] 后端API服务运行正常
- [ ] 静态资源可访问
- [ ] 管理端可登录
- [ ] SSL证书配置正确（如使用HTTPS）
- [ ] 监控和日志系统正常工作