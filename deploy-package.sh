#!/bin/bash

# Next.js + API Routes 项目打包脚本
# 只包含生产部署必需的文件

echo "开始打包 Next.js + API Routes 项目..."

# 检查是否已构建
if [ ! -d ".next" ]; then
    echo "错误: 未找到 .next 目录，请先运行 npm run build"
    exit 1
fi

# 创建打包目录
PACKAGE_DIR="blog-deploy-$(date +%Y%m%d-%H%M%S)"
echo "创建打包目录: $PACKAGE_DIR"
mkdir -p "$PACKAGE_DIR"

# 复制必需的文件
echo "复制生产部署文件..."

# 1. 构建输出（核心）
cp -r .next "$PACKAGE_DIR/"

# 2. 公共资源
cp -r public "$PACKAGE_DIR/" 2>/dev/null || echo "public 目录不存在，跳过"

# 3. API Routes 源代码（Next.js 需要这些来运行 API）
if [ -d "src/app/api" ]; then
    mkdir -p "$PACKAGE_DIR/src/app"
    cp -r src/app/api "$PACKAGE_DIR/src/app/"
else
    echo "API Routes 不存在，跳过"
fi

# 4. 必要的配置文件
cp package.json "$PACKAGE_DIR/"
cp package-lock.json "$PACKAGE_DIR/"
cp next.config.mjs "$PACKAGE_DIR/"

# 5. 环境配置
cp .env "$PACKAGE_DIR/" 2>/dev/null || echo ".env 不存在，跳过"
cp .env.local "$PACKAGE_DIR/" 2>/dev/null || echo ".env.local 不存在，跳过"

# 6. 数据库相关
if [ -d "database" ]; then
    cp -r database "$PACKAGE_DIR/"
fi

# 7. PM2 配置
if [ -f "ecosystem.config.js" ]; then
    cp ecosystem.config.js "$PACKAGE_DIR/"
fi

# 创建部署说明文档
cat > "$PACKAGE_DIR/DEPLOYMENT.md" << 'EOF'
# Next.js + API Routes 项目部署说明

## 项目架构
- Next.js App Router
- API Routes (位于 src/app/api/)
- 生产构建已包含在 .next 目录中

## 环境要求
- Node.js 18+
- npm
- 数据库 (根据 .env 配置)

## 部署步骤

1. 安装依赖
```bash
npm install --production
```

2. 设置环境变量
确保 .env 文件中的数据库配置正确

3. 启动应用
```bash
# 直接启动
npm start

# 使用 PM2 (推荐)
pm2 start ecosystem.config.js
```

## 文件说明
- `.next/` - Next.js 生产构建输出
- `src/app/api/` - API Routes 源代码 (运行时需要)
- `public/` - 静态资源
- `database/` - 数据库相关文件
- `.env` - 环境变量配置

## 注意事项
- 确保数据库连接配置正确
- API Routes 需要源代码才能在运行时处理请求
- 生产环境建议使用 PM2 进行进程管理
EOF

# 创建启动脚本
cat > "$PACKAGE_DIR/start.sh" << 'EOF'
#!/bin/bash

# Next.js + API Routes 项目启动脚本

echo "启动 Next.js + API Routes 项目..."

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "安装生产依赖..."
    npm install --production
fi

# 启动应用
echo "启动应用..."
npm start
EOF

chmod +x "$PACKAGE_DIR/start.sh"

# 创建压缩包
echo "创建压缩包..."
tar -czf "$PACKAGE_DIR.tar.gz" "$PACKAGE_DIR"

# 清理临时目录
rm -rf "$PACKAGE_DIR"

echo "打包完成!"
echo "打包文件: $PACKAGE_DIR.tar.gz"
echo ""
echo "部署说明:"
echo "1. 解压: tar -xzf $PACKAGE_DIR.tar.gz"
echo "2. 进入目录: cd $PACKAGE_DIR"
echo "3. 查看部署说明: cat DEPLOYMENT.md"
echo "4. 启动应用: ./start.sh 或 npm start"
echo ""
echo "包含的文件:"
echo "- .next/ (构建输出)"
echo "- src/app/api/ (API Routes)"
echo "- public/ (静态资源)"
echo "- database/ (数据库)"
echo "- 配置文件 (package.json, .env 等)"