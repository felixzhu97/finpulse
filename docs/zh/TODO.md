# 金融科技项目 TODO（中文）

本仓库 `fintech-project` monorepo 的高层 TODO 列表。本列表与 Git 平台上的 issue 跟踪互补，不替代后者。

英文版：`docs/TODO.md`。

## 架构与文档

- [ ] 使 `docs/zh/togaf, docs/zh/c4` 下 PlantUML 与代码库一致（apps、apps/portfolio-analytics）。
- [ ] 保持 `docs/zh/togaf/README.md, docs/zh/c4/README.md` 与技术栈同步。
- [ ] 新增子系统或流程时审阅 `docs/domain` 领域图及 `.cursor/rules/togaf-specification.mdc` 中的 TOGAF 映射。

## Web 应用（`apps/web`）

- [ ] 保持 `apps/web/README.md` 与 Angular 版本及模块布局同步。
- [ ] 为关键投资组合与报表用例添加端到端流程。
- [ ] 扩大关键组件的单元与集成测试覆盖。

## 移动应用（`apps/mobile`、`apps/mobile-portfolio`）

- [ ] 为投资组合与账户界面添加基础错误与空状态。
- [ ] 使移动端视觉风格与 Web 共享设计语言一致。
- [ ] 为关键应用内事件增加简单分析或埋点。

## 共享包（`packages/ui`、`packages/utils`）

- [ ] 用简短示例记录 `@fintech/ui` 各组件的使用方式。
- [ ] 确保 `@fintech/utils` 暴露命名清晰的工具并配有测试；抽取共享逻辑避免重复。
- [ ] 发布前在各包上执行 type-check 与 lint。

## 服务端（`apps/portfolio-analytics`）

- [ ] 增加健康/就绪探针（如 `/health`、`/ready`），检查 API 及依赖（PostgreSQL、Kafka）。
- [ ] 保持 OpenAPI 与 `apps/portfolio-analytics/README.md` 与 API 路由及环境变量同步。
- [ ] 明确生产部署方式（Docker、环境配置、扩缩容）并在 README 或 `docs/zh/togaf, docs/zh/c4` 中记录。

## 数据库（PostgreSQL、Kafka）

- [ ] 引入数据库迁移（如 Alembic）；做 schema 版本管理并与 `docs/er-diagram` 一致。
- [ ] 文档化 PostgreSQL 备份与恢复；按需考虑保留策略与 PITR。
- [ ] 文档化 Kafka 主题及 portfolio 事件的消费者约定。

## 监控与可观测性

- [ ] 为 API 暴露指标（请求数、延迟、错误率），采用 Prometheus 或 OpenMetrics 格式。
- [ ] 定义告警规则：API 不可用、DB/Kafka 不可达、高错误率。
- [ ] 增加或文档化 API 与依赖健康的简易仪表盘。

## 风险管理

- [ ] 明确风险域（市场、信用、流动性、操作等），并保持 `docs/zh/domain` 与 `docs/zh/togaf` 对投资组合与分析流程的映射一致。
- [ ] 定义核心风险度量（如 VaR、压力测试、情景分析），在 `apps/portfolio-analytics` API 文档中记录其输入/输出及关键假设。
- [ ] 确保风险计算可复现、可回溯；在文档中记录用于风险指标的数据来源与数据血缘。

## 合规

- [ ] 识别关键合规场景（如交易监控、KYC/AML、制裁名单筛查等），并在领域图与服务边界设计中体现。
- [ ] 记录由法规驱动的日志、留存与审计要求（如 MiFID II、Dodd-Frank、GDPR 等），并在监控与数据架构文档中覆盖。
- [ ] 将数据分级、访问控制与留存策略与合规要求对齐，并在 `docs/zh/togaf` 及安全相关文档中加以说明。

## 安全

- [ ] 明确安全架构（认证、授权、密钥管理、网络边界等），并在 `docs/zh/togaf` 及相关 C4 图中记录。
- [ ] 为 Web、移动端与后端记录安全编码与数据保护实践（如输入校验、传输与存储加密、密钥轮换、机密信息存储）。
- [ ] 确保日志与监控覆盖安全相关事件（认证失败、权限变更、可疑行为等），并与安全事件响应流程对齐。

## 性能与扩展性

- [ ] 为关键 Web 与 API 流程定义性能目标（P95/P99 延迟、吞吐量等），并在架构文档中记录。
- [ ] 为高流量的 `apps/portfolio-analytics` 端点及 `apps/web` 关键交互增加基础性能测试或基准测试。
- [ ] 在 `docs/zh/togaf` 与各服务 README 中记录扩展策略（水平/垂直扩展、缓存、队列等）与容量规划假设。

## 人工智能与 ML

- [ ] 扩展 ML 风险/VaR、欺诈、监控、情感等能力；定义生产 ML 的 serving、版本与监控策略。
- [ ] 增加或扩展 DL 时间序列/风险预测与 LLM 摘要；记录 TensorFlow/PyTorch 与 OpenAI/Ollama 选项。
- [ ] 新增或变更 AI 能力时，保持 `docs/domain` 与 `docs/zh/togaf/README.md, docs/zh/c4/README.md` AI 小节及本 TODO 一致。

## 流程与开发体验

- [ ] 定义轻量发布检查清单，引用本 TODO 与架构文档。
- [ ] 重要架构变更时：更新 PlantUML、`docs/zh/togaf/README.md, docs/zh/c4/README.md` 及本 `docs/TODO.md`。
- [ ] 为主要应用与服务添加简短的“上手”指南。

---

**说明**：重大发布前请结合 `docs/zh/togaf, docs/zh/c4` 审阅并更新中英文 TODO。
