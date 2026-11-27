# Skill 数据维护

前端 Skill 的编辑源为根目录的 [`ant-skills.json`](../ant-skills.json)。页面读取 [`catalog.json`](../catalog.json)，其中还包含本仓库的数据库 Skill 与全局提示词。汇总目录使用 Schema v2，前端类型见 [`src/types.ts`](../src/types.ts)。

## 更新流程

1. 核对上游 Skill 原文、版本声明、源码提交及具体文档页，将适用范围、产品版本和实际核验日期写入 `ant-skills.json`。
2. 修改条目的分类、用途、输入输出、调用示例与上游安装指引。
3. 同步目录并运行类型检查：

   ```powershell
   npm run catalog:sync
   npm run typecheck
   ```

4. 发布前构建并预览，核对目录、卡片、详情、文档跳转与安装对象：

   ```powershell
   npm run build
   npm run preview
   ```

5. 提交 `ant-skills.json` 与同步后的 `catalog.json`。更新核验记录时，一并提交对应记录；已有依据见 [2026-11-27 核验清单](ant-skills-official-audit-2026-11-27.json)。

同步和构建处理本地数据；上游版本、文档地址与 `verifiedAt` 在第 1 步人工核验后更新。页面展示这份版本快照。

## 字段说明

下表列出 `ant-skills.json` 中的主要字段。

| 字段 | 填写规则 |
| --- | --- |
| `id` | 全局唯一的条目标识，用于页面选择与关联引用。 |
| `name` / `displayName` | `name` 保留上游 Skill 名称；`displayName` 用于界面展示，可添加来源或用途后缀。 |
| `categoryPath` | 恰好三级分类，以“前端开发”开头，例如 `前端开发 → 蚂蚁前端生态 → 界面设计与主题定制`。 |
| `publisherType` / `tags` | `publisherType` 使用 `official`、`community` 或 `project`；`tags` 标注技术栈与任务。 |
| `sourceRepo` / `sourceUrl` | 上游仓库及具体 Skill 原文的 HTTPS 地址，两者须对应。 |
| `sourceRevision` | `commit` 保存核验时的提交；`pinnedSourceUrl` 指向该提交下固定的 Skill 原文。 |
| `skillVersion` / `skillVersionSource` | 记录上游明确声明的技能版本及依据链接；技能未声明版本时，二者填写 `null`，页面显示“上游未标注”。 |
| `compatibleVersions` | Skill 适用的技术栈和版本范围。 |
| `productVersions` | 记录产品版本与 `versionSourceUrl`；`scope` 使用 `current`（核验时的产品版本）、`target`（迁移目标）或 `template`（模板版本）。 |
| `docsUrl` / `docsTitle` | `docsUrl` 指向与任务对应的具体文档或指南页；`docsTitle` 使用“主题定制指南”等明确的跳转名称。 |
| `verifiedAt` | 实际完成来源与版本核验的日期，格式为 `YYYY-MM-DD`。 |
| `detail` | 维护 `purpose`、`inputOutput`、`usageExample` 与 `installPrompt`，分别对应用途、输入输出、调用示例和上游安装指引。 |
| `relatedSkills` | 使用已有条目的 `id`，并通过 `reason` 说明配合方式或用途差异。 |

`skillVersion`、`compatibleVersions` 和 `productVersions` 分别描述技能版本、适用范围与产品版本。源码提交保存在 `sourceRevision` 中。

## 同步规则

[`import-ant-skills.mjs`](../scripts/import-ant-skills.mjs) 按 `id` 新增或更新前端条目，同时保留其他已有条目及提示词数据。

- `categoryPath` 转为 `navigation_path`，并生成对应的 `category_paths`。
- `detail.inputOutput` 转为 `details.scenarios`，`detail.usageExample` 转为 `details.example`。
- 校验必填字段、唯一 `id`、HTTPS 链接、重复来源、三级分类与关联引用；`docsUrl` 须指向具体内容页。
- 下架条目时，需要同时从 `ant-skills.json` 与 `catalog.json` 中移除对应记录，并调整指向它的 `relatedSkills`；同步脚本保留源文件以外的已有条目。

`npm run dev` 使用当前目录数据；编辑前端源数据后，先执行 `npm run catalog:sync`。`npm run build` 已包含同步和类型检查，构建时将 `catalog.json`、`skills/` 与 `prompts/` 复制到 `dist/`。

## 同名 Skill

不同仓库的 `ant-design` 与 `chart-visualization` 分别收录：

- 为各来源分配独立 `id`，保留实际 `name`，通过 `displayName` 区分用途。
- 同一仓库与同一 `name` 的组合保持唯一。
- 安装区按实际 `name` 显示目标目录，并在同名目录冲突时说明替换来源；复制的指引携带所选仓库与原文地址。

## 提示词维护

全局提示词正文保存在 [`prompts/codex-win.md`](../prompts/codex-win.md)，介绍、版本、分类和大纲标签保存在 `catalog.json` 的 `prompts` 数组。修改介绍或版本时，同时更新 [根目录 README](../README.md) 和 [提示词使用指南](../prompts/README.md) 中对应内容。
