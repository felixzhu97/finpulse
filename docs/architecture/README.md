# FinPulse 平台 TOGAF 企业架构文档

> 基于 TOGAF 框架的 FinPulse 金融科技分析平台企业架构视图

## 📋 目录

本目录包含 FinPulse 平台的四个核心架构域的 PlantUML 架构图：

1. [业务架构图](#业务架构图-business-architecture)
2. [应用架构图](#应用架构图-application-architecture)
3. [数据架构图](#数据架构图-data-architecture)
4. [技术架构图](#技术架构图-technology-architecture)
5. 领域视角下的金融系统图（`docs/architecture/domain` 目录）

## 🎯 架构概述

本架构文档遵循 **TOGAF (The Open Group Architecture Framework)** 企业架构框架，从四个维度全面描述 FinPulse 平台的企业架构：

- **业务架构 (Business Architecture)**: 定义业务战略、治理、组织和关键业务流程
- **应用架构 (Application Architecture)**: 描述用于支持业务的功能应用及其交互
- **数据架构 (Data Architecture)**: 定义组织的数据资产和数据管理资源的结构
- **技术架构 (Technology Architecture)**: 描述支持应用和数据所需的逻辑软件和硬件能力

## 📊 架构图说明

### 业务架构图 (Business Architecture)

**文件**: `business-architecture.puml`

**描述**: 展示 FinPulse 平台的业务架构，包括业务参与者、核心业务功能域和业务服务层。

**主要内容**:
- **业务参与者层**: 投资者、平台管理员等角色
- **核心业务功能域**:
  - 投资组合管理
  - 市场分析
  - 风险管理
  - 交易管理
  - 资产管理
  - 观察列表管理
  - 大数据分析（Spark 批处理、Flink 流处理、Hadoop 数据存储）
- **业务服务层**: 提供各业务功能的服务能力
  - 大数据服务（Spark 会话管理、Flink 作业管理、HDFS 文件系统、YARN 资源管理）

**业务价值流**:
- 投资组合管理 → 风险管理（风险评估）
- 市场分析 → 投资组合管理（投资建议）
- 资产管理 → 投资组合管理（配置优化）
- 交易管理 → 投资组合管理（交易更新）
- 市场数据 → 大数据分析 → 投资组合管理（数据洞察）
- 交易记录 → 大数据分析 → 风险管理（模式识别）
- 大数据分析 → 统计分析（增强分析能力）

### 应用架构图 (Application Architecture)

**文件**: `application-architecture.puml`

**描述**: 展示 FinPulse 平台的应用架构，包括应用组件的分层结构和交互关系。

**架构分层**:
1. **展示层 (Presentation Layer)**
   - Web 应用：`apps/web`（基于 Angular 的金融分析控制台）
   - 移动应用：`apps/mobile`、`apps/mobile-portfolio`（基于 React Native 的移动客户端）
   - UI 组件库：`packages/ui`（共享 UI 组件）
   - 数据可视化（Chart.js、ng2-charts、chartjs-chart-financial、react-native-chart-kit、react-native-wagmi-charts 等）

2. **业务逻辑层 (Business Layer)**
   - 投资组合模块
   - 市场数据模块
   - 交易模块
   - 风险管理模块
   - 用户模块

3. **数据访问层 (Data Access Layer)**
   - 数据服务（DAO、缓存）
   - 状态管理（前端状态容器、上下文）

4. **外部服务层 (External Services)**
   - Vercel Analytics
   - 市场数据 API
   - 存储服务
   - 大数据服务层（Java Spring Boot 服务）
     - SparkService（SparkSession 管理、SQL 执行、DataFrame 操作）
     - FlinkService（StreamExecutionEnvironment、Table API、作业提交）
     - HadoopService（HDFS 操作、YARN 管理、MapReduce）

**API 接口**:
- 投资组合 API
- 市场数据 API
- 交易 API
- 风险分析 API
- Spark API
- Flink API
- Hadoop API

#### Mobile Applications

在应用架构中，移动端应用承担以下角色：

- 为投资者和业务用户提供随时随地访问投资组合和关键指标的入口。
- 与 Web 控制台共享核心领域模型和部分组件（例如通过 `packages/ui`、`packages/utils`）。

### 数据架构图 (Data Architecture)

**文件**: `data-architecture.puml`

**描述**: 展示 FinPulse 平台的数据架构，定义核心数据实体及其关系。

**核心数据实体**:
1. **投资组合 (Portfolio)**
   - 包含资产净值、收益统计等核心信息
   - 关联多个资产和风险指标

2. **资产 (Asset)**
   - 表示投资组合中的具体资产
   - 包含持仓数量、价格、市值等信息

3. **交易记录 (Transaction)**
   - 记录所有交易操作
   - 关联用户、投资组合和资产

4. **市场数据 (Market Data)**
   - 实时和历史市场数据
   - 包含价格、成交量、涨跌幅等信息

5. **观察列表 (Watch List)**
   - 用户自选资产列表
   - 支持价格提醒功能

6. **风险指标 (Risk Metrics)**
   - 投资组合风险评估指标
   - 包含波动率、夏普比率、VaR 等

7. **用户偏好 (User Preferences)**
   - 用户个性化设置
   - 主题、语言、通知等配置

8. **用户 (User)**
   - 平台用户信息
   - 关联多个业务实体

9. **Spark 数据实体 (Spark Data Entity)**
   - SparkSession 数据
   - DataFrame/Dataset 数据
   - SQL 查询结果
   - 批处理作业数据

10. **Flink 数据实体 (Flink Data Entity)**
    - DataStream 数据
    - Table 数据
    - 流处理作业状态
    - 检查点数据

11. **Hadoop 数据实体 (Hadoop Data Entity)**
    - HDFS 文件数据
    - YARN 应用数据
    - MapReduce 作业数据
    - 集群指标数据

**数据关系**:
- 用户 → 投资组合（一对多）
- 投资组合 → 资产（一对多）
- 投资组合 → 风险指标（一对一）
- 用户 → 交易记录（一对多）
- 资产 → 市场数据（一对多）

**数据流向**:
- 市场数据 → 资产价格更新
- 交易记录 → 投资组合更新
- 投资组合 + 市场数据 → 风险指标计算
- 市场数据 → Spark 批处理 → 风险指标计算
- 交易数据 → Flink 流处理 → 实时告警
- 投资组合数据 → HDFS 存储 → 历史数据分析

### 技术架构图 (Technology Architecture)

**文件**: `technology-architecture.puml`

**描述**: 展示 FinPulse 平台的技术架构，包括技术栈、构建工具和部署平台。

**技术栈层次**:
1. **前端技术栈**
   - Angular（金融分析 Web 控制台）
   - React Native + Expo（移动应用）
   - React 19（UI 库）
   - TypeScript 5（类型安全）

2. **UI 框架与组件**
   - Radix UI（无样式组件原语）
   - Tailwind CSS / 自定义样式
   - Lucide React（图标库）

3. **数据可视化**
   - Chart.js + ng2-charts（Web 图表）
   - chartjs-chart-financial（Web K 线等金融图表）
   - react-native-chart-kit（移动端轻量级图表）
   - react-native-wagmi-charts（移动端专业股票图表）

4. **工具库**
   - 表单管理与验证（例如 React Hook Form、Zod）
   - 日期处理库
   - 主题管理与样式合并工具

5. **构建工具链**
   - 前端构建系统（Angular CLI、相关打包工具）
   - TypeScript 编译器
   - ESLint
   - Maven 构建系统
   - Java 编译器
   - Spring Boot 打包工具

6. **部署平台**
   - Vercel 平台（托管和部署 Web 应用）
   - Git 集成（版本控制）
   - Java 服务部署（独立 JAR 或容器化）
   - REST API 服务端点

7. **基础设施层**
   - CDN（内容分发网络）
   - 对象存储

8. **大数据技术栈**
   - Java 17+（JVM 运行时）
   - Spring Boot 3.2.0（应用框架）
   - Maven 3.6+（构建工具）
   - Apache Spark 3.5.0（批处理引擎）
   - Apache Flink 1.19.0（流处理引擎）
   - Apache Hadoop 3.3.6（分布式存储与计算）

**技术标准**:
- **开发规范**: TypeScript 严格模式、ESLint 代码规范、组件化开发
- **性能标准**: 关键页面加载性能可观测并持续优化
- **安全标准**: HTTPS 强制、CSP、XSS 防护、数据验证
- **可访问性标准**: 参考 WCAG 2.1 AA 级、键盘导航、ARIA 标签

### Architecture TODO Alignment

为了保持架构文档与实现的一致性，FinPulse 在技术和应用架构层面引入了统一的 TODO 视图：

- 高层跨系统任务集中记录在 `docs/TODO.md` 中（架构、Web、移动、Big Data、共享包等）。
- 每次重要架构调整时，需要同步更新：
  - PlantUML 架构图（如本目录下的 `*.puml` 文件）。
  - 本文件 `docs/architecture/README.md` 中的相关章节。
  - `docs/TODO.md` 中对应的任务条目（新增、更新或关闭）。

### 金融系统领域视图 (Finance System Domain Views)

**目录**: `docs/architecture/domain`

**文件**:
- `finance-system.puml`: 从渠道、边缘服务、核心金融服务、数据与分析以及外部系统五个层次展示整体金融系统组件和依赖关系。
- `finance-system-domains.puml`: 从业务领域角度划分客户与账户、投资与交易、支付与资金、风控与合规、数据与洞察五大域，并展示域间依赖。
- `finance-system-flows.puml`: 以流程视图展示开户、入金、交易以及风险和报表的端到端核心业务流。

## 🛠️ 如何使用

### 查看架构图

这些架构图使用 **PlantUML** 格式编写，可以通过以下方式查看：

#### 方式 1: 使用 PlantUML 工具

1. 安装 PlantUML:
   ```bash
   # 使用 npm 安装
   npm install -g @plantuml/plantuml
   
   # 或使用 Homebrew (macOS)
   brew install plantuml
   ```

2. 生成图片:
   ```bash
   # 生成 PNG 图片
   plantuml business-architecture.puml
   plantuml application-architecture.puml
   plantuml data-architecture.puml
   plantuml technology-architecture.puml
   plantuml domain/finance-system.puml
   plantuml domain/finance-system-domains.puml
   plantuml domain/finance-system-flows.puml
   
   # 生成 SVG 图片（推荐，矢量图）
   plantuml -tsvg business-architecture.puml
   ```

#### 方式 2: 使用在线工具

1. 访问 [PlantUML 在线服务器](http://www.plantuml.com/plantuml/uml/)
2. 复制 `.puml` 文件内容
3. 粘贴到在线编辑器中查看

#### 方式 3: IDE 插件

许多 IDE 支持 PlantUML 插件，可以在编辑器中直接预览：
- **VS Code**: PlantUML 插件
- **IntelliJ IDEA**: PlantUML integration 插件
- **Atom**: plantuml-viewer 插件

#### 方式 4: VS Code 插件推荐

安装 VS Code 插件 "PlantUML" 后，可以：
- 在编辑器中直接预览图表
- 使用快捷键 `Alt+D` 预览
- 导出为 PNG/SVG 格式

### 编辑架构图

1. 使用文本编辑器打开 `.puml` 文件
2. 按照 PlantUML 语法修改
3. 保存后重新生成图片查看效果

## 📚 架构关系说明

四个架构域之间的关系：

```
业务架构
  ↓ (驱动)
应用架构
  ↓ (实现)
数据架构
  ↓ (支撑)
技术架构
```

- **业务架构** 定义了平台要实现的业务目标和流程
- **应用架构** 将业务需求转化为具体的应用组件和功能
- **数据架构** 定义了支持业务和应用所需的数据结构和关系
- **技术架构** 提供了实现应用和数据管理的技术基础

## 🔄 架构演进

本架构文档会随着项目的发展持续更新：

- **版本控制**: 所有架构图文件纳入 Git 版本控制
- **变更记录**: 重大架构变更应在架构图中添加注释说明
- **定期审查**: 建议每个发布周期审查一次架构图，确保与代码实现一致

## 📖 参考资源

- [TOGAF 9.2 标准](https://www.opengroup.org/togaf)
- [PlantUML 官方文档](https://plantuml.com/)
- [Next.js 文档](https://nextjs.org/docs)
- [React 文档](https://react.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)

## 📝 架构决策记录

### ADR-001: 采用 Next.js 作为前端框架

**决策**: 使用 Next.js 16 作为主要前端框架

**理由**:
- 支持 SSR 和 SSG，提升首屏加载性能
- 内置路由系统，简化页面管理
- 良好的 TypeScript 支持
- 与 Vercel 平台深度集成，部署简便

**影响**: 所有前端应用基于 Next.js 构建

### ADR-002: 使用 PlantUML 作为架构图格式

**决策**: 采用 PlantUML 格式描述架构

**理由**:
- 文本格式，易于版本控制
- 支持多种图表类型
- 可以生成高质量的图片
- 开源工具，使用广泛

**影响**: 所有架构文档使用 `.puml` 格式

### ADR-003: Hybrid Architecture for Big Data Integration

**决策**: 使用 Java Spring Boot 进行原生大数据库集成

**理由**:
- 直接访问 Spark/Flink/Hadoop API，无需通过第三方服务
- REST API 为 TypeScript 客户端提供统一接口
- 语言适配：Java 适合大数据生态，TypeScript 适合前端开发
- 关注点分离：大数据处理逻辑与前端业务逻辑解耦
- 技术栈选择：使用各语言生态中最成熟的工具

**影响**:
- 采用混合架构：TypeScript 前端 + （可选的）Java 后端服务
- 通过 REST API 进行跨语言通信（如有需要时引入）
- 大数据相关能力可以通过外部服务或后续扩展提供

---

**文档版本**: 1.1.0  
**最后更新**: 2024  
**维护者**: FinPulse 开发团队
