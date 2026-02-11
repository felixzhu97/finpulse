# 金融系统领域图（中文）

本目录为 `docs/domain` 的中文版领域图，与英文版一一对应。

| 文件 | 说明 |
|------|------|
| `business-model.md` | 商业模式与盈利模式（平台商业化策略） |
| `finance-system-architecture.puml` | 综合架构（渠道、边缘、核心、数据、AI/ML、外部系统） |
| `finance-system.puml` | 五层视图（渠道、边缘、核心、数据与外部） |
| `finance-system-domains.puml` | 业务领域（客户、投资、支付、风险合规、数据洞察、AI/ML） |
| `finance-system-flows.puml` | 核心流程（入驻、资金、交易、风险与报表） |

英文版见 [../../docs/domain/](../../docs/domain/)。

生成图片示例：

```bash
cd doc_zh/domain
plantuml -tsvg *.puml
```
