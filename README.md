<div align="center">

# Skills Hub

**面向主流 AI Agent 的可复用 Skills**

按开发领域分类，提供使用指南与执行规范。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Skills: 1](https://img.shields.io/badge/Skills-1-8b5cf6.svg)](#skill-catalog)

[分类目录](#skill-catalog) · [快速使用](#quick-start) · [维护规范](#contributing)

</div>

---

<a id="skill-catalog"></a>

## 分类目录

<details open>
<summary><strong>后端开发</strong></summary>

<details open>
<summary><strong>数据库与存储</strong></summary>

#### 关系型数据库

- [PostgreSQL](#database-design)

#### 数据库架构与设计

<a id="database-design"></a>

**[database-design](skills/database-design/)** · `v3.2.0`

数据库需求建模、结构评审与查询优化。

| 项目 | 内容 |
| :--- | :--- |
| 适用任务 | 新业务建表、现有 Schema 评审、慢查询诊断 |
| 默认数据库 | PostgreSQL 15+ |

[使用指南](skills/database-design/README.md) · [执行规范](skills/database-design/SKILL.md)

分类标签：

- 逻辑建模与范式设计
- Schema 评审与迁移
- 索引设计与查询调优
- 并发控制与多租户隔离

</details>

</details>

---

<a id="quick-start"></a>

<details>
<summary><strong>快速使用</strong></summary>

### 1. 获取仓库

需要 Git。以下终端示例使用 PowerShell。

```powershell
git clone 'https://github.com/xytss/skills-hub.git'
Set-Location -LiteralPath 'skills-hub'
```

### 2. 安装到所用 Agent

将 `skills/database-design/` 整个目录复制到对应的 Skill 目录，选择项目级或用户级安装。

项目级路径相对于目标项目根目录；`~/` 表示用户主目录。各工具名称链接至官方文档。

| AI Agent | 项目级目录 | 用户级目录 |
| :--- | :--- | :--- |
| [Codex](https://learn.chatgpt.com/docs/build-skills#where-codex-loads-local-skills) | `.agents/skills/` | `~/.agents/skills/` |
| [Claude Code](https://code.claude.com/docs/en/skills) | `.claude/skills/` | `~/.claude/skills/` |
| [Cursor](https://cursor.com/docs/skills) | `.cursor/skills/` | `~/.cursor/skills/` |
| [Gemini CLI](https://geminicli.com/docs/cli/skills/) | `.gemini/skills/` | `~/.gemini/skills/` |
| [GitHub Copilot](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills) | `.github/skills/` | `~/.copilot/skills/` |

**首次安装示例：Codex 用户级安装。** 在克隆后的仓库根目录执行：

```powershell
$skillDirectory = '.agents/skills'
$skillRoot = Join-Path -Path ([Environment]::GetFolderPath('UserProfile')) -ChildPath $skillDirectory
New-Item -ItemType Directory -Path $skillRoot -Force | Out-Null
Copy-Item -LiteralPath './skills/database-design' -Destination $skillRoot -Recurse
```

其他工具按上表替换第一行的目录，例如 Claude Code 使用 `'.claude/skills'`，Cursor 使用 `'.cursor/skills'`。安装后，`SKILL.md` 位于该目录下的 `database-design/` 文件夹内。

### 3. 调用 Skill

打开目标项目，在对话中指定 Skill 和任务：

> 请使用 database-design，为一个多租户项目管理系统设计数据库，包含项目、成员和任务。使用 PostgreSQL 15，先梳理实体关系，再给出完整字段字典、约束和索引方案。

- **Codex CLI / IDE**：输入 `$database-design`，或通过 `/skills` 选择。
- **Claude Code / Cursor**：输入 `/`，选择 `database-design`。
- **Gemini CLI**：使用 `/skills list` 查看，再在任务中指定 `database-design`。
- **GitHub Copilot**：在支持 Agent Skills 的 Agent 中描述任务并指定 `database-design`。

现有 DDL、慢查询 SQL 等输入示例见 [使用指南](skills/database-design/README.md)。

</details>

<a id="contributing"></a>

<details>
<summary><strong>维护规范</strong></summary>

每个 Skill 使用独立的英文目录：

```text
skills/<skill-name>/
├── SKILL.md
├── README.md
└── assets/
    └── overview.png
```

- `SKILL.md`：定义适用任务、执行步骤、输出要求及检查项。
- `README.md`：介绍适用场景、输入输出和使用示例。
- `assets/overview.png`：展示主要功能或工作流程。
- `references/` 与 `scripts/`：按需增加参考资料和辅助脚本。

新增或修改 Skill 时，同步更新首页目录和 [catalog.json](catalog.json)。版本保存在 `metadata.version`，分类路径保存在 `metadata.category_paths`；两者应与目录索引保持一致。

提交前检查文档链接、图片路径、版本信息与安装示例。

</details>

## 许可证

本仓库采用 [MIT License](LICENSE)。
