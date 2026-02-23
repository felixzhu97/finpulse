# FinPulse 平台 TOGAF 企业架构文档

> 基于 TOGAF 框架的 FinPulse 金融科技分析平台企业架构视图  
> English: [docs/en/rd/togaf/README.md](../../../en/rd/togaf/README.md)  
> C4 模型: [docs/zh/rd/c4/](../c4/)

## 目录

本目录为**中文版** TOGAF 架构图与说明。图表文件（`.puml`）均为中文标注。

1. [业务架构图](#业务架构图-business-architecture) — `business-architecture.puml`
2. [应用架构图](#应用架构图-application-architecture) — `application-architecture.puml`
3. [数据架构图](#数据架构图-data-architecture) — `data-architecture.puml`
4. [技术架构图](#技术架构图-technology-architecture) — `technology-architecture.puml`
5. 金融系统领域图（[../../product/domain/](../../product/domain/) 目录）

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

### 应用架构图 (Application Architecture)

**文件**：`application-architecture.puml`

**描述**：分层应用组件及其交互。展示层包含 Admin（apps/admin）、门户（apps/portal，React + Vite、@fintech/ui）、移动端投资组合（含 styled-components 主题 UI：StyledThemeProvider、useTheme、基元）。

### 数据架构图 (Data Architecture)

**文件**：`data-architecture.puml`

**描述**：核心数据实体及关系。

### 技术架构图 (Technology Architecture)

**文件**：`technology-architecture.puml`

**描述**：技术栈、构建工具与部署平台。

## 如何使用

```bash
cd docs/zh/rd/togaf
plantuml business-architecture.puml application-architecture.puml data-architecture.puml technology-architecture.puml
plantuml -tsvg *.puml
```

或使用 [PlantUML 在线](http://www.plantuml.com/plantuml/uml/) 或 IDE PlantUML 插件。

## 架构关系说明

```
业务架构
  ↓（驱动）
应用架构
  ↓（实现）
数据架构
  ↓（支撑）
技术架构
```

---

**文档版本**：1.3.0  
**最后更新**：2025年2月  
**维护**：FinPulse 开发团队

## 最近更新

- **Redux 优化（移动端投资组合）**：报价统一走 Redux；`extraSubscribedSymbols` 支持抽屉符号；单 WebSocket；统一使用 useAppSelector/useAppDispatch。
- **Redux + styled-components（移动端投资组合）**：Portfolio 状态迁至 Redux（portfolio slice）；主屏与列表组件统一使用 styled-components 基元（ScreenRoot、ListRow、CardBordered、SafeAreaScreen 等）实现主题 UI。
- **整洁架构（移动端投资组合）**：Presentation → Application → Domain；Infrastructure 仅由 DependencyContainer 注入。共享 hooks：**useAsyncLoad**、**runWithLoading**、**useRefreshControl**、**useAccountData**。
- **OOP 架构**：原生图表代码重构，使用抽象基类（`BaseChartViewManager`、`BaseChartView`、`BaseChartRenderer`）和辅助类（ChartLayoutCalculator、ValueFormatter、AxisLabelManager、ChartDataCalculator）。共享工具：ChartCurve、ChartVertex、ChartPipeline、ChartGrid、ChartThemes。
- **代码简化**：移除未使用代码（usePerSymbolHistory、重复 PeriodDataProcessor），简化逻辑，提升可维护性
