# FinPulse | 金融科技分析平台

> 专业级金融数据分析与投资组合管理平台

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/felixzhu97s-projects/fintech-project)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)

## 📋 项目简介

FinPulse 是一个现代化的金融科技分析平台，为投资者提供全面的投资组合管理、市场分析和风险管理功能。平台采用 Next.js 构建，提供流畅的用户体验和实时数据可视化。

## ✨ 核心功能

### 📊 投资组合概览

- 总资产净值实时展示
- 今日收益统计
- 累计收益率追踪
- 活跃交易监控

### 📈 市场趋势分析

- 实时市场数据可视化
- 多维度趋势图表
- 市场动态更新

### 💼 资产配置

- 资产分布可视化
- 投资组合平衡分析
- 多样化资产类别支持

### 📝 交易记录

- 最近交易历史
- 交易详情查看
- 交易分类筛选

### 📉 性能图表

- 投资组合表现可视化
- 历史数据回放
- 多时间维度分析

### ⭐ 观察列表

- 自选股票/资产管理
- 价格变动提醒
- 快速添加/删除

### 🛡️ 风险分析

- 风险指标评估
- 风险分布可视化
- 风险预警机制

### ⚡ 快速操作

- 常用功能快速入口
- 一键操作便捷体验

## 🛠️ 技术栈

### 前端框架

- **Next.js 16.0** - React 全栈框架
- **React 19.2** - UI 库
- **TypeScript 5.0** - 类型安全

### UI 组件库

- **Radix UI** - 无样式、可访问的组件原语
- **Tailwind CSS 4.1** - 实用优先的 CSS 框架
- **Lucide React** - 图标库
- **Recharts** - 图表库

### 工具库

- **React Hook Form** - 表单管理
- **Zod** - 数据验证
- **date-fns** - 日期处理
- **next-themes** - 主题切换
- **clsx** & **tailwind-merge** - 样式工具

### 部署与分析

- **Vercel** - 部署平台
- **Vercel Analytics** - 网站分析

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm (推荐) 或 npm / yarn

### 安装依赖

```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install

# 或使用 yarn
yarn install
```

### 开发模式

```bash
# 启动开发服务器
pnpm dev

# 或
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

### 代码检查

```bash
# 运行 ESLint
pnpm lint
```

## 📁 项目结构

```
fintech-project/
├── app/                      # Next.js App Router 目录
│   ├── layout.tsx           # 根布局
│   ├── page.tsx             # 主页面（仪表盘）
│   └── globals.css          # 全局样式
├── components/               # React 组件
│   ├── ui/                  # 基础 UI 组件
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── header.tsx           # 顶部导航栏
│   ├── sidebar.tsx          # 侧边栏
│   ├── portfolio-overview.tsx   # 投资组合概览
│   ├── market-trends.tsx    # 市场趋势
│   ├── asset-allocation.tsx # 资产配置
│   ├── performance-chart.tsx # 性能图表
│   ├── recent-transactions.tsx # 交易记录
│   ├── watch-list.tsx       # 观察列表
│   ├── risk-analysis.tsx    # 风险分析
│   └── quick-actions.tsx    # 快速操作
├── lib/                     # 工具函数
│   └── utils.ts             # 通用工具函数
├── public/                  # 静态资源
├── styles/                  # 样式文件
├── next.config.mjs          # Next.js 配置
├── tsconfig.json            # TypeScript 配置
├── tailwind.config.ts       # Tailwind CSS 配置
├── components.json          # shadcn/ui 配置
└── package.json             # 项目依赖
```

## 🎨 设计特性

- **现代化 UI** - 采用玻璃态设计和流畅的动画效果
- **响应式布局** - 完美适配各种屏幕尺寸
- **深色主题** - 默认深色模式，减少视觉疲劳
- **无障碍设计** - 遵循 WCAG 标准，提供良好的可访问性
- **性能优化** - Next.js SSR/SSG 优化，快速加载

## 📦 主要组件说明

### PortfolioOverview

显示总资产净值、今日收益、累计收益率和活跃交易等关键指标。

### MarketTrends

提供市场趋势的可视化分析，帮助用户了解市场动态。

### AssetAllocation

以图表形式展示资产配置情况，支持饼图和条形图等多种展示方式。

### PerformanceChart

使用 Recharts 绘制投资组合的历史表现曲线。

### RiskAnalysis

展示风险指标和风险分布，帮助用户进行风险管理。

### RecentTransactions

显示最近的交易记录，支持筛选和详情查看。

### WatchList

管理用户的自选资产列表，实时显示价格变动。

## 🌐 部署

项目已配置为自动部署到 Vercel。每次推送到主分支都会自动触发部署。

### 手动部署

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量（如需要）
4. 部署完成

## 📄 许可证

本项目为私有项目。

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

如有问题或建议，请通过 GitHub Issues 联系我们。

---

**注意**: 本项目使用 [v0.app](https://v0.app) 进行部分开发和部署管理。
