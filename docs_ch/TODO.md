# 金融科技项目 TODO（中文）

本仓库 `fintech-project` monorepo 的高层 TODO 列表。本列表与 Git 平台上的 issue 跟踪互补，不替代后者。

英文版：`docs/TODO.md`。

## 架构与文档

- [ ] 使 `docs/architecture` 下 PlantUML 与代码库一致（apps、services/portfolio-analytics）。
- [ ] 保持 `docs/architecture/README.md` 与技术栈同步。
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

## 服务端（`services/portfolio-analytics`）

- [ ] 增加健康/就绪探针（如 `/health`、`/ready`），检查 API 及依赖（PostgreSQL、Kafka）。
- [ ] 保持 OpenAPI 与 `services/portfolio-analytics/README.md` 与 API 路由及环境变量同步。
- [ ] 明确生产部署方式（Docker、环境配置、扩缩容）并在 README 或 `docs/architecture` 中记录。

## 数据库（PostgreSQL、Kafka）

- [ ] 引入数据库迁移（如 Alembic）；做 schema 版本管理并与 `docs/er-diagram` 一致。
- [ ] 文档化 PostgreSQL 备份与恢复；按需考虑保留策略与 PITR。
- [ ] 文档化 Kafka 主题及 portfolio 事件的消费者约定。

## 监控与可观测性

- [ ] 为 API 暴露指标（请求数、延迟、错误率），采用 Prometheus 或 OpenMetrics 格式。
- [ ] 定义告警规则：API 不可用、DB/Kafka 不可达、高错误率。
- [ ] 增加或文档化 API 与依赖健康的简易仪表盘。

## 人工智能与 ML

- [ ] 扩展 ML 风险/VaR、欺诈、监控、情感等能力；定义生产 ML 的 serving、版本与监控策略。
- [ ] 增加或扩展 DL 时间序列/风险预测与 LLM 摘要；记录 TensorFlow/PyTorch 与 OpenAI/Ollama 选项。
- [ ] 新增或变更 AI 能力时，保持 `docs/domain` 与 `docs/architecture/README.md` AI 小节及本 TODO 一致。

## 流程与开发体验

- [ ] 定义轻量发布检查清单，引用本 TODO 与架构文档。
- [ ] 重要架构变更时：更新 PlantUML、`docs/architecture/README.md` 及本 `docs/TODO.md`。
- [ ] 为主要应用与服务添加简短的“上手”指南。

---

**说明**：重大发布前请结合 `docs/architecture` 审阅并更新中英文 TODO。
