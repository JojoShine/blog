# 贡献指南

感谢您考虑为本项目做出贡献！我们欢迎任何形式的贡献，包括但不限于：

- 🐛 报告Bug
- 💡 提出新功能
- 📝 改进文档
- 🔧 提交代码修复
- ✨ 添加新功能

## 行为准则

参与本项目即表示您同意遵守我们的 [行为准则](./CODE_OF_CONDUCT.md)。请在参与之前阅读它。

## 如何贡献

### 报告Bug

如果您发现了Bug，请通过 [GitHub Issues](https://github.com/your-username/blog/issues) 报告，并包含以下信息：

- **Bug描述**: 清晰简洁地描述问题
- **重现步骤**: 详细说明如何重现问题
- **预期行为**: 描述您期望发生什么
- **实际行为**: 描述实际发生了什么
- **截图**: 如果适用，添加截图帮助解释问题
- **环境信息**:
  - 操作系统: [如 macOS 14.0]
  - Node.js版本: [如 18.17.0]
  - 浏览器: [如 Chrome 120]

### 提出新功能

如果您有新功能的想法，欢迎通过 [GitHub Issues](https://github.com/your-username/blog/issues) 提出，并包含：

- **功能描述**: 清晰描述您想要的功能
- **使用场景**: 说明这个功能解决什么问题
- **替代方案**: 您考虑过的其他解决方案
- **额外信息**: 任何其他相关信息

### 提交代码

#### 开发流程

1. **Fork 仓库**

点击右上角的 "Fork" 按钮，将项目Fork到您的账户下。

2. **克隆您的Fork**

```bash
git clone https://github.com/your-username/blog.git
cd blog
```

3. **添加上游仓库**

```bash
git remote add upstream https://github.com/original-owner/blog.git
```

4. **创建分支**

```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

分支命名规范：
- `feature/功能名` - 新功能
- `fix/问题描述` - Bug修复
- `docs/文档说明` - 文档更新
- `refactor/重构说明` - 代码重构
- `style/样式说明` - 样式更新

5. **安装依赖**

```bash
npm install
```

6. **进行开发**

- 遵循项目的代码风格
- 编写清晰的代码注释
- 确保代码通过ESLint检查

7. **测试您的更改**

```bash
npm run dev     # 启动开发服务器
npm run build   # 构建生产版本
npm run lint    # 运行代码检查
```

8. **提交更改**

```bash
git add .
git commit -m "feat: 添加某某功能"
```

提交信息格式：
- `feat: 新功能`
- `fix: 修复问题`
- `docs: 文档更新`
- `style: 格式调整（不影响代码运行的变动）`
- `refactor: 重构（既不是新增功能，也不是修改bug的代码变动）`
- `test: 增加测试`
- `chore: 构建过程或辅助工具的变动`

9. **推送到您的Fork**

```bash
git push origin feature/your-feature-name
```

10. **创建Pull Request**

- 访问您Fork的仓库页面
- 点击 "New Pull Request" 按钮
- 填写PR描述，说明：
  - 这个PR做了什么
  - 相关的Issue编号（如果有）
  - 测试情况
  - 截图（如果适用）

#### 代码规范

**JavaScript/React**

- 使用ES6+语法
- 组件使用函数式组件和Hooks
- 保持组件单一职责
- 合理使用注释说明复杂逻辑

**CSS/样式**

- 优先使用Tailwind CSS类
- 自定义样式使用CSS Modules或组件内样式
- 保持响应式设计

**文件命名**

- 组件文件使用PascalCase: `MyComponent.js`
- 工具函数文件使用camelCase: `utilityHelper.js`
- 页面文件使用kebab-case或Next.js约定

**代码组织**

```javascript
// 1. 导入
import React from 'react';
import { useState } from 'react';

// 2. 组件定义
export default function MyComponent({ prop1, prop2 }) {
  // 3. Hooks
  const [state, setState] = useState();

  // 4. 函数
  const handleClick = () => {
    // ...
  };

  // 5. 渲染
  return (
    <div>
      {/* ... */}
    </div>
  );
}
```

### 审查过程

1. 提交PR后，维护者会进行审查
2. 根据反馈进行必要的修改
3. 审查通过后，您的代码将被合并

### 同步上游更改

在开发过程中，定期同步上游仓库的更改：

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

## 开发环境设置

### 必需工具

- Node.js 18+
- PostgreSQL 数据库
- Git
- 代码编辑器（推荐 VS Code）

### 推荐的VS Code扩展

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets

### 环境配置

1. 复制 `.env.example` 为 `.env`
2. 配置数据库连接
3. 配置OSS（如果需要测试图片上传）
4. 运行 `node database/init.js` 初始化数据库

## 目录结构说明

```
src/
├── app/              # Next.js App Router
│   ├── admin/       # 管理后台页面
│   ├── api/         # API路由
│   └── ...          # 其他页面
├── components/      # 可复用组件
├── lib/             # 工具函数和配置
├── models/          # Sequelize数据模型
└── assets/          # 静态资源
```

## 常见问题

### Q: 我该从哪里开始？

A: 查看标记为 `good first issue` 的Issues，这些通常是适合新贡献者的任务。

### Q: 我可以同时处理多个Issue吗？

A: 建议一次专注于一个Issue，确保质量。

### Q: 我的PR多久会被审查？

A: 通常在1-3个工作日内。如果超过5个工作日没有回应，可以在PR中评论提醒。

### Q: 我不擅长编程，还能贡献什么？

A: 可以帮助改进文档、报告Bug、提出功能建议、翻译等。

## 许可证

贡献到本项目的代码将采用 MIT 许可证。

## 联系我们

如有任何问题，欢迎通过以下方式联系：

- GitHub Issues
- 项目讨论区
- 邮箱: [your-email@example.com]

再次感谢您的贡献！🎉