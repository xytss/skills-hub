# 全局提示词

统一维护 AI Agent 的环境约定、实现规范与沟通方式。

```text
AI 工程与 Agent
└── 系统指令与提示词
    └── codex-win
```

## codex-win

适用于 Windows 11 与 PowerShell 7 环境的 Codex 全局指令集。核心约束包括：禁止执行文件删除操作、杜绝防御性冗余代码与无效测试、保持前端页面（默认 React + Ant Design）视觉与文案精简。沟通采用结论先行的简体中文：解释原理时讲清因果与边界，汇报改动时简短具体。

| 项目 | 内容 |
| --- | --- |
| 版本 | v1.0.0 |
| 工具 | Codex |
| 系统 | Windows 11 |
| 终端 | PowerShell 7 |
| 默认前端栈 | React / Ant Design，已有项目遵循既有组件库 |
| 界面与沟通语言 | 简体中文 |
| 标签 | 去AI味、去前端AI味、反防御性编程、全局指令、Codex、React、Ant Design、Windows 11、PowerShell 7 |

[在线阅读与复制](https://xytss.github.io/skills-hub/prompts.html?prompt=codex-win) · [提示词完整原文](codex-win.md)

## 使用方式

1. 打开在线页面，点击“复制全文”，或下载 `codex-win.md`。
2. 将正文保存到 Codex 主目录的 `AGENTS.md`。默认 Windows 路径为 `%USERPROFILE%\.codex\AGENTS.md`；设置了 `CODEX_HOME` 时使用该目录。已有指令可以直接合并编辑。
3. 在具体项目的 `AGENTS.md` 中补充业务约定，并在新会话中使用。

全局目录存在非空的 `AGENTS.override.md` 时，Codex 优先读取该文件。配置方式参见 [Codex 官方 AGENTS.md 指南](https://learn.chatgpt.com/docs/agent-configuration/agents-md)。

## 页面操作

- 分类目录：按领域展开、折叠并选择提示词。
- 大纲树：按章节和具体规则分层浏览，点击定位，滚动同步高亮。
- 正文：阅读排版后的完整内容；“原始 Markdown”查看原文格式。
- 复制与下载：始终使用完整 Markdown 原文，包含英文规则和中文沟通规范。
- 查看源码：打开仓库中对应的原文文件。

## 内容维护

提示词正文保存在 `prompts/codex-win.md`，分类、介绍、环境、标签和大纲中文短名保存在根目录的 `catalog.json` 中。页面大纲依据正文的章节标题和列表中的加粗规则名称生成。
