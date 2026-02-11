# FinPulse C4 架构模型

> FinPulse 金融科技平台 C4 架构图  
> English: [docs/en/c4/README.md](../../en/c4/README.md)  
> TOGAF 架构: [docs/zh/togaf/](../togaf/)

## 目录

本目录为**中文版** C4 PlantUML 架构图。

1. **系统上下文** — `c4-system-context.puml`
2. **容器（模块）** — `c4-containers.puml`
3. **投资组合分析 API 组件** — `c4-components.puml`
4. **整洁架构（投资组合 API）** — `clean-architecture-portfolio-api.puml`
5. **Web 应用组件** — `c4-web-app-components.puml`
6. **移动端投资组合组件** — `c4-mobile-portfolio-components.puml`
7. **移动端演示组件** — `c4-mobile-demo-components.puml`

### 移动端投资组合组件

**文件**：`c4-mobile-portfolio-components.puml`

**说明**：移动端投资组合应用（Expo + React Native）薄客户端：标签/屏幕；types（Portfolio、QuoteSnapshot）；api 层（portfolioApi、getQuotes、createQuoteSocket）；hooks（usePortfolio、useRealtimeQuotes、usePerSymbolHistory）；原生图表与组合/账户组件；后端 GET /api/v1/portfolio、GET /api/v1/quotes、WS /ws/quotes。

### 投资组合分析 API 组件

**文件**：`c4-components.puml`

**说明**：投资组合分析 API 内部组件：投资组合路由（GET /portfolio、POST /seed）、资源路由（/api/v1/* CRUD 及 batch；AI 融入 payments、trades、customers、risk-metrics）、行情路由；服务（投资组合、分析、市场数据）；仓储与 Kafka/Redis。后端采用整洁架构（见下方图及 `services/portfolio-analytics/README.md`）。

### 整洁架构（投资组合 API）

**文件**：`clean-architecture-portfolio-api.puml`

**说明**：投资组合分析 API 的整洁架构分层：API（组合根、端点、模式、映射器）→ 基础设施（数据库、配置、外部服务、消息代理）→ 应用层（用例、端口）→ 领域（实体、值对象、事件）。依赖规则：内层不依赖外层；仅组合根将基础设施装配到应用端口。

## 如何查看

```bash
cd docs/zh/c4
plantuml c4-system-context.puml c4-containers.puml c4-components.puml clean-architecture-portfolio-api.puml c4-web-app-components.puml c4-mobile-portfolio-components.puml c4-mobile-demo-components.puml
plantuml -tsvg *.puml
```

或使用 [PlantUML 在线](http://www.plantuml.com/plantuml/uml/) 或 IDE PlantUML 插件。

## 离线 / 本地 C4 库

图表使用 `docs/c4-lib/` 中的本地 C4 库。如出现「Cannot open URL」，请执行：

```bash
cd docs/c4-lib
git clone https://github.com/plantuml-stdlib/C4-PlantUML.git .
```

完成后即可离线渲染。

---

**文档版本**：1.0.0  
**最后更新**：2025  
**维护**：FinPulse 开发团队
