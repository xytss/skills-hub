<p>
  <img src="assets/readme-wordmark.svg" width="350" height="67" alt="Skills Hub">
</p>

<p>
  <img src="assets/readme-badges.svg" width="150" height="28" alt="MIT License · 35 Skills">
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
前端开发
└── 蚂蚁前端生态
    ├── 界面设计与主题定制
    │   ├── ant-design-skill
    │   ├── antd-theme-customization
    │   └── ant-design（视觉设计版）
    ├── 组件开发与文档查询
    │   ├── ant-design（官方）
    │   ├── antd
    │   ├── antd-component-lookup
    │   └── ant-design-react（社区 v4）
    ├── 应用工程与版本迁移
    │   ├── antd-migration
    │   ├── pro-upgrade
    │   └── umi-max
    ├── AI 对话与生成界面
    │   ├── x-components
    │   ├── use-x-chat
    │   ├── x-chat-provider
    │   ├── x-request
    │   ├── x-markdown
    │   └── x-card
    ├── Vue、移动与小程序
    │   ├── ant-design-vue
    │   ├── ant-design-mobile
    │   └── ant-design-mini
    ├── 统计图表与数据叙事
    │   ├── antv-g2-chart
    │   └── antv-t8-ntv
    ├── 关系、流程与地图
    │   ├── antv-g6-graph
    │   ├── antv-x6-editor
    │   └── antv-l7
    ├── AI 图表与快速配图
    │   ├── chart-visualization（图片版）
    │   ├── chart-visualization（GPT-Vis 集成版）
    │   └── antv-gpt-vis
    ├── 信息图生成与扩展
    │   ├── infographic-creator
    │   ├── antv-infographic
    │   ├── infographic-syntax-creator
    │   ├── infographic-structure-creator
    │   ├── infographic-item-creator
    │   └── infographic-template-updater
    └── 图标与设计资源
        └── icon-retrieval
```

前端目录收录 34 项上游 Skill，按“前端开发 → 蚂蚁前端生态 → 业务场景 → Skill”组织，覆盖 Ant Design、Ant Design X、AntV、Umi 与社区扩展。官方／社区表示技能来源，卡片展示适用技术与任务标签。详情提供官方文档、Skill 原文、产品版本、源码修订与核验日期。上游技能的许可证以对应仓库声明为准。

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

### 维护前端 Skill 数据

编辑根目录的 [`ant-skills.json`](ant-skills.json)，然后同步到现有 [`catalog.json`](catalog.json)：

```powershell
npm run catalog:sync
npm run typecheck
```

同步脚本将 `categoryPath` 映射为 `navigation_path`，将输入输出与调用示例转换为详情字段，并保留独立的 `id`、显示名称、标签和上游安装指引。同步时校验 id 唯一、HTTPS 链接、重复条目、三级分类和关联技能引用。

`catalog.json` 使用 Schema v2：`skillVersion` 保存上游明确声明的技能版本，`sourceRevision` 保存核验时的 commit 与固定原文链接，`compatibleVersions` 保存适用范围，`productVersions` 分别标注当前产品、迁移目标或模板版本。`docsUrl` 为官网／官方文档入口，`verifiedAt` 为核验日期。版本快照与来源依据见 [2026-11-27 核验清单](docs/ant-skills-official-audit-2026-11-27.json)。维护这些数据后，同步重建目录；页面使用已核验的静态数据。

同名的 `ant-design` 与 `chart-visualization` 按来源分别收录。安装区显示实际目标目录与同名替换说明，复制的指引同步携带所选来源；相关技能入口说明不同用途。

`npm run build` 会先同步并校验目录，再运行类型检查和构建。构建输出位于 `dist/`。推送 `main` 后，由 GitHub Actions 构建并发布到 GitHub Pages。资源目录与 `catalog.json` 在构建时原样复制。

---

[参与贡献](https://github.com/xytss/skills-hub/pulls) · [提交问题](https://github.com/xytss/skills-hub/issues) · [MIT License](LICENSE)
