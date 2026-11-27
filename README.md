<p>
  <img src="assets/readme-wordmark.svg" width="350" height="67" alt="Skills Hub">
</p>

<p>
  <img src="assets/readme-badges.svg" width="150" height="28" alt="MIT License · 35 Skills">
</p>

面向 AI Agent 的开发 Skills 与全局提示词，按领域分类，提供使用指南与执行规范。

<a href="https://xytss.github.io/skills-hub/"><strong>浏览 Skill 资源库</strong>&nbsp;<img src="assets/icons/showcase-jump.svg" width="22" height="18" alt="" align="absmiddle"></a>

[快速使用](#快速使用) · [Skill 目录](#skill-目录) · [全局提示词](#全局提示词) · [本地开发](#本地开发) · [数据维护](#数据维护)

## 快速使用

1. 打开 [Skill 资源库](https://xytss.github.io/skills-hub/)，按分类选择 Skill。
2. 在安装区选择 AI Agent，点击“复制安装提示词”，发送给对应工具。
3. 安装完成后，参照该 Skill 的调用示例提交任务。

以 `database-design` 为例，也可以直接发送：

```text
请从 https://github.com/xytss/skills-hub 安装 database-design。
阅读安装说明与 SKILL.md，按当前 Agent 的规范配置。
检查已有版本，完成后返回安装位置、验证结果与调用方式。
```

调用示例：请使用 `database-design`，评审这份 PostgreSQL 表结构。

[![database-design 浏览示例：分类目录、Skill 列表、安装提示词与知识预览](assets/readme-preview.png)](https://xytss.github.io/skills-hub/?skill=database-design#catalog)

## Skill 目录

当前收录 **35 个 Skill**：本仓库维护的 `database-design`，以及 34 个上游前端 Skill。

<details>
<summary>查看完整分类树</summary>

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

</details>

**本仓库维护的 Skill**

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

**上游前端 Skill**

覆盖 Ant Design、Ant Design X、AntV、Umi 与社区扩展，按业务场景分类。[浏览全部前端 Skill](https://xytss.github.io/skills-hub/?category=%E5%89%8D%E7%AB%AF%E5%BC%80%E5%8F%91#catalog)。

每项提供用途、调用示例、具体文档链接、Skill 原文及版本核验信息。“官方／社区”标注 Skill 的来源；上游内容按对应仓库的许可证使用。

## 全局提示词

```text
AI 工程与 Agent
└── 系统指令与提示词
    └── codex-win
```

| 提示词 | 版本 | 适用环境 | 说明 | 入口 |
| --- | --- | --- | --- | --- |
| codex-win | `v1.0.0` | Codex · Windows 11 · PowerShell 7 | 禁止删除文件、精简实现与界面、结论先行的中文沟通 | [在线阅读与复制](https://xytss.github.io/skills-hub/prompts.html?prompt=codex-win) · [使用指南](prompts/README.md) · [原文](prompts/codex-win.md) |

## 本地开发

前端使用 React、TypeScript、Ant Design 与 Vite。

需要 Node.js 22.12 或以上版本。在仓库目录安装依赖并启动开发服务：

```powershell
npm ci
npm run dev
```

本地入口为终端输出地址下的 `/skills-hub/`；提示词页面为 `/skills-hub/prompts.html?prompt=codex-win`。

构建并预览发布产物：

```powershell
npm run build
npm run preview
```

`npm run build` 依次执行目录同步与校验、类型检查、Vite 构建，产物位于 `dist/`。

## 数据维护

| 维护内容 | 编辑文件 |
| --- | --- |
| 上游前端 Skill | [`ant-skills.json`](ant-skills.json) |
| 本仓库数据库 Skill | [`skills/database-design/`](skills/database-design/README.md) 与 [`catalog.json`](catalog.json) 中对应条目 |
| 全局提示词 | [`prompts/codex-win.md`](prompts/codex-win.md)；介绍、版本和分类保存在 [`catalog.json`](catalog.json) 的 `prompts` 中 |

修改前端 Skill 数据后，同步并校验：

```powershell
npm run catalog:sync
npm run typecheck
```

提交时一并包含 `ant-skills.json` 与同步后的 `catalog.json`。字段含义、版本核验、同名 Skill 和条目下架方式见 [数据维护指南](docs/catalog-maintenance.md)。

## 发布

推送 `main` 后，[GitHub Actions](https://github.com/xytss/skills-hub/actions/workflows/deploy.yml) 自动构建并发布到 [GitHub Pages](https://xytss.github.io/skills-hub/)。发布配置见 [`deploy.yml`](.github/workflows/deploy.yml)。

---

[参与贡献](https://github.com/xytss/skills-hub/pulls) · [提交问题](https://github.com/xytss/skills-hub/issues) · [MIT License](LICENSE)
