# FinPulse | 金融科技分析平台

> 专业级金融数据分析与投资组合管理平台  
> English: [../README.md](../README.md)

本目录为项目**中文文档**汇总。英文文档见根目录 `README.md` 与 `docs/`。

| 子目录 | 说明 |
|--------|------|
| [c4/](c4/README.md) | C4 模型图（PlantUML） |
| [togaf/](togaf/README.md) | TOGAF 架构图（业务、应用、数据、技术） |
| [domain/](domain/README.md) | 金融系统领域图 |
| [er-diagram/](er-diagram/README.md) | 实体关系图 |
| [TODO.md](TODO.md) | 项目 TODO 中文版 |

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/felixzhu97s-projects/fintech-project)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)

## 项目概述

FinPulse 是现代金融科技分析平台，为投资者提供投资组合管理、市场分析与风险管理能力。基于 Next.js 构建，提供流畅体验与实时数据可视化。

## 核心功能

### 投资组合概览

- 实时总资产净值展示
- 当日盈亏统计
- 累计收益率跟踪
- 活跃交易监控

### 市场趋势分析

- 实时市场数据可视化
- 多维度趋势图表
- 市场动态更新

### 资产配置

- 资产分布可视化
- 组合平衡分析
- 多资产类别支持

### 交易记录

- 近期交易历史
- 交易详情查看
- 交易分类筛选

### 业绩图表

- 组合业绩可视化
- 历史回放
- 多周期分析

### 自选列表

- 自选资产管理
- 涨跌提醒
- 快速添加/移除

### 风险分析

- 风险指标评估
- 风险分布可视化
- 风险预警机制

### 快捷操作

- 常用功能快速入口
- 一键操作

## 技术栈

### 前端框架

- **Angular 21** - Web 分析控制台（`apps/web`）
- **React Native + Expo** - 移动应用（`apps/mobile`、`apps/mobile-portfolio`）
- **React 19.2** - UI 组件与共享库
- **TypeScript 5.0** - 类型安全

### Monorepo 工具

- **pnpm Workspaces** - 包与工作区管理
- **TypeScript Project References** - 跨包类型检查

### 后端服务

- **Python 3.10+ + FastAPI** - 投资组合分析 API（`services/portfolio-analytics`），端口 8800。Clean Architecture（composition.py、container、crud_helpers、api/config）；通过 `.env` 配置。
- **PostgreSQL** - 投资组合持久化（Docker，主机端口 5433）
- **Apache Kafka** - 投资组合事件消息（Docker，端口 9092）
- **AI/ML** - 融入业务流（无独立 AI 路由）：`POST /payments` 返回欺诈检测；`POST /trades` 返回监控告警；`POST /customers` 返回身份评分；`POST /risk-metrics/compute` 根据组合历史计算 VaR。可选：Ollama、Hugging Face、TensorFlow 用于后续集成。
- **一键启动** - `pnpm run start:backend`（Docker + API + 种子数据）。**API 测试** - `pnpm run test:api`（pytest；Ollama/HF/TF 测试在服务不可用时可能跳过；Hugging Face 首次运行约 1–3 分钟）。

### UI 与可视化

- **Radix UI** - 无样式可访问组件原语（`@fintech/ui`）
- **Tailwind CSS 4.1** - 实用优先 CSS 框架
- **Lucide React** - 图标库
- **Chart.js + ng2-charts + chartjs-chart-financial** - Web 图表与金融（K 线）图
- **react-native-wagmi-charts** - 移动端专业股票图（折线、K 线、十字线）
- **react-native-chart-kit** - 轻量移动端组合指标图表

### 工具库

- **React Hook Form** - 表单管理
- **Zod** - 数据校验
- **date-fns** - 日期处理
- **next-themes** - 主题切换
- **clsx** 与 **tailwind-merge** - 样式工具（`@fintech/utils`）

### 部署与分析

- **Vercel** - 部署平台
- **Vercel Analytics** - 网站分析

## 项目架构

本项目采用 pnpm workspaces 管理的 **monorepo** 架构：

- **apps/web** - 基于 Angular 的金融分析 Web 控制台。
- **apps/mobile** - React Native 演示移动应用。
- **apps/mobile-portfolio** - React Native（Expo）组合应用；扁平化 `src/`：`src/types/`、`src/lib/`（services、api、network、i18n、utils）、`src/hooks/`、`src/components/`、`src/styles/`、`src/store/`。Stocks 屏实时报价与 sparkline；原生图表（Metal/OpenGL ES）；主题、提示、拖拽滚动。
- **services/portfolio-analytics** - Python FastAPI 后端（Clean Architecture）；PostgreSQL；Kafka；AI/ML 融入 payments、trades、customers、risk-metrics；配置见 `.env.example`；`pnpm run start:backend`；API 测试 `pnpm run test:api`。
- **packages/ui** - 共享 UI 组件库。
- **packages/utils** - 共享工具函数库。

架构优势：代码复用、独立开发与版本、类型安全、按需构建。

## 快速开始

### 环境要求

- Node.js 18+
- pnpm 10.6.0+（必须，项目使用 pnpm workspaces）
- Python 3.10+（后端 FastAPI 服务）
- Docker（使用 `pnpm run start:backend` 时的 PostgreSQL 与 Kafka）

### 安装依赖

```bash
# 在项目根目录安装全部依赖（含所有包）
pnpm install
```

### 开发模式

```bash
# 启动 Web 开发服务器
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000)。

### 移动应用（mobile-portfolio）

```bash
pnpm dev:mobile-portfolio
pnpm --filter mobile-portfolio ios
pnpm --filter mobile-portfolio android
```

### 后端服务（Python FastAPI）

**一键启动（在项目根目录）：**

```bash
pnpm run start:backend
```

将启动 Docker（PostgreSQL + Kafka）、portfolio-analytics API（http://127.0.0.1:8800）并写入种子数据。

**手动启动：**

```bash
cd services/portfolio-analytics
cp .env.example .env   # 可选：按需编辑 DB、Kafka、Ollama、HF 模型
docker compose up -d
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8800 --reload
```

API 测试：在项目根目录执行 `pnpm run test:api`，或在 `services/portfolio-analytics` 下激活 venv 后执行 `pytest tests -v`。

### 生产构建

```bash
pnpm build
pnpm start
```

### 代码检查

```bash
pnpm lint
```

## 项目结构

```
fintech-project/
├── apps/           # Web / 移动应用
├── scripts/        # backend/, seed/, db/
├── services/
│   └── portfolio-analytics/   # FastAPI, PostgreSQL, Kafka (Clean Architecture)
├── packages/       # ui, utils
├── docs/           # 英文架构与领域文档
├── doc_zh/         # 中文文档（本目录）
├── package.json
├── pnpm-workspace.yaml
└── pnpm-lock.yaml
```

## 路线图与 TODO

- 中文 TODO：[doc_zh/TODO.md](TODO.md)
- 英文 TODO：`docs/TODO.md`。重要发布前请与 `docs/zh/togaf`、`docs/zh/c4` 及本目录架构文档一起审阅并更新。

## 设计特点

- 现代 UI、响应式布局、暗色主题、无障碍（WCAG）、Next.js 性能优化。

## 部署

项目配置为自动部署到 Vercel；推送到 main 分支即触发部署。Monorepo 需在 Vercel 中配置根目录、构建命令（如 `pnpm --filter web build`）、输出目录（如 `apps/web/.next`）、安装命令（`pnpm install`）。

## 许可证

本项目为私有项目。

## 贡献

欢迎提交 Issue 与 Pull Request。

## 联系

通过 GitHub Issues 联系我们。

---

**说明**：本项目部分开发与部署管理使用 [v0.app](https://v0.app)。
