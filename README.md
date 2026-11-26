<p>
  <img src="assets/readme-wordmark.svg" width="350" height="67" alt="Skills Hub">
</p>

<p>
  <img src="assets/readme-badges.svg" width="150" height="28" alt="MIT License · 1 Skill">
</p>

面向 AI Agent 的开发 Skills 与全局提示词，按领域分类，提供使用指南与执行规范。

<a href="https://xytss.github.io/skills-hub/"><strong>浏览 Skill 资源库</strong>&nbsp;<img src="assets/icons/showcase-jump.svg" width="22" height="18" alt="" align="absmiddle"></a>

[分类目录](#skill-目录) · [全局提示词](#全局提示词) · [快速使用](#快速使用) · [参与贡献](https://github.com/xytss/skills-hub/pulls)

# Skill 目录

```text
后端开发
└── 数据库与存储
    └── 数据库架构与设计
        └── database-design
```

<table>
  <thead>
    <tr>
      <th align="left" width="200">Skill</th>
      <th align="left" width="120">版本</th>
      <th align="left" width="520">说明</th>
      <th align="left" width="360">相关链接</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><a href="skills/database-design/README.md">database-design</a></td>
      <td><code>v3.2.0</code></td>
      <td>需求建模、结构评审、查询优化</td>
      <td><a href="skills/database-design/README.md">使用指南</a> · <a href="skills/database-design/SKILL.md">SKILL.md</a></td>
    </tr>
  </tbody>
</table>

# 全局提示词

```text
AI 工程与 Agent
└── 系统指令与提示词
    └── codex-win
```

| 提示词 | 适用环境 | 说明 | 入口 |
| --- | --- | --- | --- |
| codex-win | Codex · Windows 11 · PowerShell 7 | 去 AI 味、反防御性编程、React / Ant Design 界面与中文沟通 | [在线阅读与复制](https://xytss.github.io/skills-hub/prompts.html?prompt=codex-win) · [使用指南](prompts/README.md) · [原文](prompts/codex-win.md) |

# 浏览与安装

<sub>以下浏览、安装与调用说明均以 database-design 为例。</sub>

[![Skill 资源库界面：分类目录、Skill 列表与安装提示词、知识预览](assets/readme-preview.png)](https://xytss.github.io/skills-hub/)

按分类查找 Skill，查看说明并复制安装提示词。

# 快速使用

将以下提示词发送给你的 AI Agent：

```text
请从 https://github.com/xytss/skills-hub 安装 database-design。
阅读安装说明与 SKILL.md，按当前 Agent 的规范配置。
检查已有版本，完成后返回安装位置、验证结果与调用方式。
```

安装后示例：请使用 `database-design`，评审这份 PostgreSQL 表结构。

## 本地开发

前端使用 React、TypeScript、Ant Design 与 Vite，保留原站配色、布局和本地字体。

使用 Node.js 22.12 或以上版本，在仓库目录运行：

```powershell
npm ci
npm run dev
```

本地入口为终端输出地址下的 `/skills-hub/`；提示词页面为 `/skills-hub/prompts.html?prompt=codex-win`。

```powershell
npm run build
npm run preview
```

构建输出位于 `dist/`。推送 `main` 后，由 GitHub Actions 构建并发布到 GitHub Pages。资源目录与 `catalog.json` 在构建时原样复制。

---

[参与贡献](https://github.com/xytss/skills-hub/pulls) · [提交问题](https://github.com/xytss/skills-hub/issues) · [MIT License](LICENSE)
