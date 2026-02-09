# ER 图

通用金融科技系统的概念实体关系图，使用 PlantUML 信息工程表示法定义。包含：核心（客户、用户偏好、账户、组合）；标的与持仓（标的、持仓、观察列表、观察项）；标的扩展（债券、期权）；交易（订单、成交）；支付与结算（资金流水、支付、结算）；行情与风险（行情数据、技术指标、风险指标）；分析与估值（组合优化、统计、估值）。

生成图片可使用 PlantUML 命令行或 IDE 插件：

```bash
plantuml docs_ch/er-diagram/er-diagram.puml
```

输出将生成在源文件同目录（如 `er-diagram.png`）。也可将文件内容粘贴到 [PlantUML 在线服务](https://www.plantuml.com/plantuml/uml/) 查看或导出。

英文版见 [docs/er-diagram](../docs/er-diagram/)。
