# FinPulse C4 架构模型

> FinPulse 金融科技平台 C4 架构图  
> English: [docs/en/c4/README.md](../../en/c4/README.md)  
> TOGAF 架构: [docs/zh/togaf/](../togaf/)

## 目录

本目录为**中文版** C4 PlantUML 架构图。

**文件**：
- `c4-system-context.puml` — 系统上下文图
- `c4-containers.puml` — 容器（模块）图
- `c4-components.puml` — 投资组合分析 API 组件图
- `c4-web-app-components.puml` — Web 应用组件图
- `c4-mobile-portfolio-components.puml` — 移动端投资组合应用组件图
- `c4-mobile-demo-components.puml` — 移动端演示应用组件图

## 如何查看

```bash
cd docs/zh/c4
plantuml c4-system-context.puml c4-containers.puml c4-components.puml c4-web-app-components.puml c4-mobile-portfolio-components.puml c4-mobile-demo-components.puml
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
