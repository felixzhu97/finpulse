# 金融科技项目 TODO（中文）

本仓库 `fintech-project` monorepo 的高层 TODO 列表。本列表与 Git 平台上的 issue 跟踪互补，不替代后者。

## 架构与文档

- [ ] 使 `docs/architecture` 下所有 PlantUML 图与当前代码库结构一致。
- [ ] 在相关架构视图中体现移动应用（`apps/mobile`、`apps/mobile-portfolio`）。
- [ ] 保持 `docs/architecture/README.md` 与实际技术栈（Angular Web、React Native 移动端）同步。
- [ ] 新增金融流程时审阅并更新 `docs/domain` 下领域图。
- [ ] 引入新子系统时，在 `.cursor/rules/togaf-specification.mdc` 中维护 TOGAF 映射。

## Web 应用（`apps/web`）

- [ ] 在 `apps/web/README.md` 中说明 Angular 应用结构与主要模块。
- [ ] 为关键投资组合与报表用例添加端到端流程。
- [ ] 提升核心仪表盘的可访问性与响应式。
- [ ] 增加更贴近实际的示例数据与场景。
- [ ] 扩大关键组件的单元与集成测试覆盖。

## 移动应用（`apps/mobile`、`apps/mobile-portfolio`）

- [X] 为每个移动应用添加 README.md，说明用途、技术栈与主要界面。
- [X] 在可获得时将 `apps/mobile-portfolio` 接入真实后端 API（替代 mock）。
- [ ] 为所有投资组合与账户界面添加基础错误与空状态。
- [ ] 使移动端视觉风格与 Web 共享设计语言一致。
- [ ] 为关键应用内事件增加简单分析或埋点。
- [X] 实现基于 Metal/Vulkan 的自定义图表渲染。

## 共享包（`packages/ui`、`packages/utils` 等）

- [ ] 用简短示例记录 `@fintech/ui` 各组件的使用方式。
- [ ] 确保 `@fintech/utils` 仅暴露命名清晰、通用的工具并配有测试。
- [ ] 通过抽取共享工具避免应用与包间重复逻辑。
- [ ] 发布前在各包上定期执行 type-check 与 lint。
- [ ] 审阅共享库依赖版本并移除未使用包。

## 人工智能与 ML

- [ ] 实现或集成 ML 风险与 VaR 引擎；对接风险服务与风险指标存储。
- [ ] 增加 KYC 用文档与身份 AI（如文档核验、身份评分）；对接合规与客户服务。
- [ ] 在资金/支付流程中集成欺诈与异常检测；消费交易存储。
- [ ] 增加成交后监控（异常与模式检测）；从交易服务与交易存储获取数据。
- [ ] 引入市场/新闻数据的 NLP 与情感服务；对接分析引擎与市场数据存储。
- [ ] 定义生产 ML 模型的 serving、版本与监控策略。
- [ ] **深度学习**：增加基于 DL 的时间序列或风险预测（如神经网络预测端点）；记录 TensorFlow/PyTorch 或托管模型 serving 的集成点。
- [ ] **大语言模型**：增加报告摘要、文档问答或客服的 LLM 集成；对接分析/报表与合规；记录 OpenAI/Ollama 或自托管方案。
- [ ] 新增或变更 AI 能力时，保持 `docs/domain/finance-system-flows.puml`、`finance-system-architecture.puml`、`finance-system-domains.puml` 与 `docs/architecture/README.md` AI 小节及本 TODO 一致。

## 流程与开发体验

- [ ] 定义轻量发布检查清单，引用本 TODO 与架构文档。
- [ ] 确保每次重要架构变更都更新：PlantUML 图、`docs/architecture/README.md`、本 `docs/TODO.md` 相关小节。
- [ ] 为主要应用与服务添加简短的“上手”指南。

---

**说明**：英文版见 `docs/TODO.md`。重大发布前请结合 `docs/architecture` 与 `doc_zh/architecture` 审阅并更新中英文 TODO。
