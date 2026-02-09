# FinPulse 平台 TOGAF 企业架构文档

> 基于 TOGAF 框架的 FinPulse 金融科技分析平台企业架构视图  
> English: [../../docs/architecture/README.md](../../docs/architecture/README.md)

本目录为**中文版** TOGAF 架构图与说明。图表文件（`.puml`）均为中文标注。

## 目录

1. [业务架构图](#业务架构图-business-architecture) — `business-architecture.puml`
2. [应用架构图](#应用架构图-application-architecture) — `application-architecture.puml`
3. [数据架构图](#数据架构图-data-architecture) — `data-architecture.puml`
4. [技术架构图](#技术架构图-technology-architecture) — `technology-architecture.puml`
5. 金融系统领域图（[../domain/](../domain/) 目录）

## 架构概述

本架构文档遵循 **TOGAF（The Open Group Architecture Framework）** 企业架构框架，从四个维度描述 FinPulse 平台：

- **业务架构**：业务战略、治理、组织与关键业务流程
- **应用架构**：支撑业务的应用组件及其交互
- **数据架构**：数据资产与数据管理结构
- **技术架构**：支撑应用与数据的逻辑软硬件能力

## 架构图说明

### 业务架构图 (Business Architecture)

**文件**：`business-architecture.puml`

**描述**：展示业务参与者、核心业务功能域与业务服务层。

**主要内容**：
- **业务参与者层**：投资者、平台管理员等
- **核心业务功能域**：投资组合管理、市场分析、风险管理、交易管理、资产管理、观察列表管理；大数据分析（Spark 批处理、Flink 流处理、Hadoop 数据存储）
- **业务服务层**：大数据服务（Spark 会话、Flink 作业、HDFS、YARN）

**业务价值流**：投资组合 → 风险管理（评估）；市场分析 → 投资组合（建议）；资产管理 → 投资组合（配置）；交易 → 投资组合（更新）；市场/交易数据 → 大数据 → 投资组合/风险（洞察）。

### 应用架构图 (Application Architecture)

**文件**：`application-architecture.puml`

**描述**：分层应用组件及其交互。

**层次**：
1. **展示层**：Web（`apps/web`，Angular）、移动（`apps/mobile`、`apps/mobile-portfolio`，React Native，Expo）；**Native UI（mobile-portfolio）**：**NativeDemoCard** 及六类原生图表。Metal（iOS）/ OpenGL ES（Android）；主题、提示、X 轴、拖拽滚动。共享逻辑：`useScrollableChart`、`ScrollableChartContainer`、`chartTooltip`。UI 库：`packages/ui`；图表：Chart.js、ng2-charts、chartjs-chart-financial、react-native-chart-kit、react-native-wagmi-charts。
2. **业务逻辑层**：投资组合、市场数据、交易、风险管理、用户模块
3. **数据访问层**：数据服务（DAO、缓存）、状态管理
4. **外部服务层**：**Portfolio Analytics API**（FastAPI，DDD；REST；AI/ML /api/v1/ai；PostgreSQL；Kafka）；Vercel Analytics、市场数据 API、存储、大数据服务层（Java Spring Boot）

**API 接口**：投资组合 API；AI/ML API（VaR、欺诈检测、交易监控、情感分析、身份评分、预测、摘要、Ollama、Hugging Face、TensorFlow）；市场、交易、风险、Spark、Flink、Hadoop API。

#### 移动应用

- **apps/mobile-portfolio** 连接 **Portfolio Analytics API**（http://localhost:8800）。先执行 `pnpm run start:backend`，再执行 `pnpm dev:mobile-portfolio`。

### 数据架构图 (Data Architecture)

**文件**：`data-architecture.puml`

**描述**：核心数据实体及关系。

**核心数据实体**：投资组合、资产、交易记录、市场数据、观察列表、风险指标、用户偏好、用户；Spark/Flink/Hadoop 数据实体。

**数据关系**：用户 ↔ 投资组合（一对多）；投资组合 ↔ 资产（一对多）；投资组合 ↔ 风险指标（一对一）；用户 ↔ 交易记录（一对多）；资产 ↔ 市场数据（一对多）。

**数据流向**：**Portfolio Analytics**：投资组合 → PostgreSQL（portfolio 表）持久化；POST /api/v1/seed 写入；GET /api/v1/portfolio 读取；seed 时向 Kafka（portfolio.events）发布 portfolio.seeded 事件。

### 技术架构图 (Technology Architecture)

**文件**：`technology-architecture.puml`

**描述**：技术栈、构建工具与部署平台。

**技术栈**：前端（Angular、React Native、Expo、React 19、TypeScript 5）；移动原生（iOS Metal、Android OpenGL ES）；UI（Radix UI、Tailwind、Lucide）；可视化（Chart.js、ng2-charts、chartjs-chart-financial、react-native-wagmi-charts、原生图表）；工具（React Hook Form、Zod、date-fns、主题）；构建（Angular/TS、Maven、Java、Spring Boot）；部署（Vercel、Git、Java JAR/容器、REST）；**Portfolio Analytics 后端**（FastAPI、uvicorn、端口 8800；PostgreSQL 5433、Kafka 9092；AI/ML：Ollama、Hugging Face、TensorFlow、scipy/statsmodels/sumy；python-dotenv、pytest）；大数据（Java 17+、Spring Boot 3.2、Maven、Spark 3.5、Flink 1.19、Hadoop 3.3）。

**技术标准**：开发规范（TypeScript、ESLint、组件化）；性能；安全（HTTPS、CSP、XSS、数据验证）；无障碍（WCAG 2.1 AA）。

### 架构与 TODO 对齐

- 高层任务：中文 [../TODO.md](../TODO.md)，英文 `docs/TODO.md`。架构变更时需同步更新：PlantUML、本 README、TODO。

### 金融系统领域视图

**目录**：[../domain/](../domain/)

**文件**：`finance-system-architecture.puml`（含 AI 与 ML 服务）；`finance-system.puml`（渠道、边缘、核心、数据与外部）；`finance-system-domains.puml`（业务领域，含 AI/ML）；`finance-system-flows.puml`（流程，含 DL 预测、LLM 报告摘要）。

### AI 与 ML 集成

| 领域     | 流程/组件     | 作用                         |
|----------|---------------|------------------------------|
| Onboarding | KYC         | 文档与身份 AI                |
| Funding  | 支付          | 欺诈与异常检测               |
| Trading  | 订单/成交后   | ML 限额与敞口；AI 成交后监控  |
| Risk & Reporting | 分析 | ML VaR；DL 预测；NLP 情感；LLM 摘要 |

新增或调整 AI 能力时，请更新上述 PlantUML 及 `doc_zh/TODO.md`、`docs/TODO.md` 中「人工智能与 ML」部分。

## 如何使用

### 查看架构图

架构图使用 **PlantUML** 格式（`.puml`）。

#### 方式一：PlantUML 命令行

```bash
npm install -g @plantuml/plantuml
# 或：brew install plantuml

cd doc_zh/architecture
plantuml business-architecture.puml
plantuml application-architecture.puml
plantuml data-architecture.puml
plantuml technology-architecture.puml
plantuml -tsvg *.puml
```

#### 方式二：在线

- [PlantUML 在线](http://www.plantuml.com/plantuml/uml/) — 粘贴 `.puml` 内容即可查看。

#### 方式三：IDE 插件

- VS Code：PlantUML 插件（如 Alt+D 预览）
- IntelliJ：PlantUML integration 插件

### 编辑架构图

用文本编辑器修改 `.puml` 文件，保存后重新生成图片或在线预览。

## 架构关系说明

四个架构域关系：

```
业务架构
  ↓（驱动）
应用架构
  ↓（实现）
数据架构
  ↓（支撑）
技术架构
```

## 架构演进

- 架构图纳入 Git 版本管理。重大变更在图中以注释说明。建议按发布周期审阅，与实现保持一致。

## 参考资源

- [TOGAF 9.2 标准](https://www.opengroup.org/togaf)
- [PlantUML 官方文档](https://plantuml.com/)
- [Next.js 文档](https://nextjs.org/docs) · [React 文档](https://react.dev/) · [TypeScript 文档](https://www.typescriptlang.org/docs/)

## 架构决策记录

### ADR-001：采用 Next.js 作为前端框架

**决策**：以 Next.js 16 为主要前端框架。**理由**：SSR/SSG、路由、TypeScript、与 Vercel 集成。**影响**：前端基于 Next.js 构建。

### ADR-002：使用 PlantUML 作为架构图格式

**决策**：采用 PlantUML 描述架构。**理由**：文本格式便于版本控制、支持多类图表、使用广泛。**影响**：架构文档统一使用 `.puml`。

### ADR-003：大数据混合架构

**决策**：使用 Java Spring Boot 进行 Spark/Flink/Hadoop 原生集成。**理由**：直接调用 API、REST 面向 TypeScript 客户端、关注点分离。**影响**：可选 TypeScript 前端 + Java 后端；通过 REST 跨语言通信。

---

**文档版本**：1.2.0  
**最后更新**：2025  
**维护**：FinPulse 开发团队
