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

**说明**：移动端投资组合应用（Expo + React Native）薄客户端：AppContent（偏好加载 spinner）、标签/屏幕；types（Portfolio、QuoteSnapshot）；api 层（portfolioApi、getQuotes、createQuoteSocket）；hooks（usePortfolio、useRealtimeQuotes、usePerSymbolHistory、usePreferences 含组件级 loading）；账户屏使用 useFocusEffect 在标签聚焦时加载；原生图表与组合/账户组件；后端 GET /api/v1/portfolio、GET /api/v1/quotes、WS /ws/quotes。原生代码遵循 OOP 原则，使用抽象基类（`BaseChartViewManager`、`BaseChartView`、`BaseChartRenderer`）和辅助类（ChartLayoutCalculator、ValueFormatter、AxisLabelManager、ChartDataCalculator）。共享工具：ChartCurve、ChartVertex、ChartPipeline、ChartGrid、ChartThemes。代码已简化，移除未使用代码并优化逻辑。图表全宽渲染，无左侧内边距。

### 投资组合分析 API 组件

**文件**：`c4-components.puml`

**说明**：投资组合分析 API 内部组件：投资组合路由（GET /portfolio、POST /seed）、资源路由（/api/v1/* CRUD 及 batch；AI 融入 payments、trades、customers、risk-metrics）、行情路由（GET /quotes、GET /quotes/history、WebSocket /ws/quotes）；服务（投资组合、分析、市场数据、行情历史）；RealtimeQuoteRepository（ORM、IRealtimeQuoteRepository）；Kafka 行情消费者。后端采用整洁架构（见下方图及 `services/portfolio-analytics/README.md`）。

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

**文档版本**：1.1.0  
**最后更新**：2025年2月  
**维护**：FinPulse 开发团队

## 最近更新

- **OOP 架构**：原生图表代码重构，使用抽象基类（`BaseChartViewManager`、`BaseChartView`、`BaseChartRenderer`）和辅助类（ChartLayoutCalculator、ValueFormatter、AxisLabelManager、ChartDataCalculator）。共享工具：ChartCurve、ChartVertex、ChartPipeline、ChartGrid、ChartThemes。
- **代码简化**：通过继承和抽象移除未使用代码，简化逻辑，提升可维护性
- **图表布局**：图表全宽渲染，无左侧内边距，延伸至最左侧边缘
- **周期数据处理**：PeriodDataProcessor 类封装周期过滤和成交量匹配逻辑
