# FinPulse | 金融分析平台

专业级金融数据分析与投资组合管理平台，帮助您轻松追踪市场动态、管理投资组合、掌控风险。

中文文档：[docs/zh/README.md](docs/zh/README.md)

## 概述

FinPulse 提供投资组合管理、市场分析和风险管理功能。基于 React（管理后台、门户）、React Native（移动端）和 FastAPI/Go 后端构建。

## 截图

### 移动端
<p align="center">
  <img src="./screenshots/finpulse-mobile-dashboard.png" width="200" alt="移动端仪表盘">
  <img src="./screenshots/finpulse-mobile-watchlist.png" width="200" alt="移动端自选股">
  <img src="./screenshots/finpulse-mobile-stock-detail.png" width="200" alt="移动端股票详情">
</p>
<p align="center">
  <img src="./screenshots/finpulse-mobile-insights.png" width="200" alt="移动端洞察">
  <img src="./screenshots/finpulse-mobile-account.png" width="200" alt="移动端账户">
  <img src="./screenshots/finpulse-mobile-new-payment.png" width="200" alt="移动端新支付">
</p>

### 管理后台
<p align="center">
  <img src="./screenshots/finpulse-admin-dashboard.png" width="280" alt="管理后台仪表盘">
  <img src="./screenshots/finpulse-admin-portfolio.png" width="280" alt="管理后台投资组合">
  <img src="./screenshots/finpulse-admin-transactions.png" width="280" alt="管理后台交易记录">
  <img src="./screenshots/finpulse-admin-clients.png" width="280" alt="管理后台客户管理">
</p>

## 技术栈

- **前端**: React 19 + Vite, React Native + Expo, Emotion, Radix UI
- **组件库**: `@fintech/analytics`（行为追踪、A/B 测试）、`@fintech/ui`、`@fintech/utils`
- **后端**: Python FastAPI（分析、组合聚合、行情、行为事件、AI/ML）、Go（网关 + CRUD）、TimescaleDB、Redis、Kafka
- **工具**: pnpm workspaces, TypeScript 5

## 快速开始

**环境要求**: Node 18+, pnpm 10.6+, Python 3.10+, Docker

```bash
pnpm install
pnpm dev              # 管理后台 @ localhost:4200
pnpm dev:portal       # 门户 @ localhost:3001
pnpm dev:finpulse-mobile   # 移动端 (Expo)
pnpm run start:server # 后端 (Docker + Python :8800 + Go :8801 + 种子数据)
```

后端运行后，使用 `http://127.0.0.1:8801` 作为 API 入口。管理后台行为分析页面需设置 `VITE_API_BASE_URL`（如 `http://127.0.0.1:8801/api/v1` 或使用默认开发代理）。移动端分析需设置 `EXPO_PUBLIC_API_BASE_URL`（如 `http://localhost:8801`；`/api/v1` 会自动追加）。

## 行为分析

门户、管理后台和移动端均使用 `@fintech/analytics`：通过 `AnalyticsProvider` + `useAnalytics().track()` / `identify()` 追踪事件。事件发送至 `POST /api/v1/analytics/events`（开发模式下无 API 时使用 Console 传输）。管理后台 **Behavior** 页面（`/behavior`）展示事件列表，点击行可在抽屉中查看用户详情（userId、email、name）。

## 项目结构

```
finpulse/
├── apps/
│   ├── admin/         # React 管理后台
│   ├── portal/        # React 门户应用
│   ├── mobile/        # React Native (Expo) 移动端
│   ├── server-python/ # FastAPI 后端
│   └── server-go/     # Go API 网关
├── packages/
│   ├── analytics/     # @fintech/analytics（追踪、识别、GrowthBook A/B 测试、Console/HTTP 传输）
│   ├── ui/            # @fintech/ui 组件库
│   └── utils/         # @fintech/utils 工具库
├── scripts/           # 后端启动、种子数据、数据库
└── docs/              # 架构、C4、ER 图等文档
```

## 常用脚本

| 脚本 | 说明 |
|--------|-------------|
| `pnpm dev` | 管理后台开发服务器 |
| `pnpm dev:portal` | 门户开发服务器 |
| `pnpm dev:finpulse-mobile` | 移动端 Metro |
| `pnpm run start:server` | 后端（Doker + API + 种子数据） |
| `pnpm build` | 构建管理后台 |
| `pnpm test:api` | Python API 测试 |
| `pnpm lint` | ESLint 检查 |

## 文档

- **架构设计**: `docs/en/rd/togaf/`、`docs/en/rd/c4/`
- **ER 图**: `docs/en/data/er-diagram/`
- **TODO**: `docs/en/TODO.md`

## 部署（Vercel）

- 根目录: `/`
- 构建: `pnpm install && pnpm --filter finpulse-admin build`
- 输出目录: `apps/admin/dist`

## 开源许可

私有项目。欢迎提交 Issue 和 PR。
