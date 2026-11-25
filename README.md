<div align="center">

# Skills Hub

**面向日常开发的 AI Agent Skills**

将数据库建模、结构评审与查询优化整理为可复用的工作流程。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Skills: 1](https://img.shields.io/badge/Skills-1-2ea44f.svg)](#skill-catalog)

[快速开始](#quick-start) · [Skill 目录](#skill-catalog) · [领域分类](#categories) · [维护规范](#contributing)

</div>

---

## 可以用来做什么

- **需求建模**：从业务描述梳理实体关系、字段、约束和表结构。
- **结构评审**：检查现有 Schema 的数据类型、唯一性、租户隔离和迁移影响。
- **查询优化**：结合 SQL、表结构和执行计划，提出改写与索引方案。

当前提供 `database-design v3.2.0`，默认面向 PostgreSQL 15+，包含对应的设计步骤、输出要求和检查项。

<a id="quick-start"></a>

## 快速开始

### 1. 获取仓库

需要 Git。以下终端示例使用 PowerShell。

```powershell
git clone 'https://github.com/xytss/skills-hub.git'
Set-Location -LiteralPath 'skills-hub'
```

### 2. 安装 Skill

将 `skills/database-design/` 整个目录复制到所用工具的 Skill 目录。下表列出两种安装范围，选择其中一种即可。

| 工具 | 项目级目录：相对于目标项目根目录 | 用户级目录：相对于用户主目录 |
| :--- | :--- | :--- |
| Claude Code | `.claude/skills/database-design/` | `.claude/skills/database-design/` |
| Cursor | `.cursor/skills/database-design/` | `.cursor/skills/database-design/` |

**首次安装示例：Claude Code 用户级安装。** 在刚才克隆的仓库根目录执行：

```powershell
$skillDirectory = '.claude/skills'
$skillRoot = Join-Path -Path ([Environment]::GetFolderPath('UserProfile')) -ChildPath $skillDirectory
New-Item -ItemType Directory -Path $skillRoot -Force | Out-Null
Copy-Item -LiteralPath './skills/database-design' -Destination $skillRoot -Recurse
```

安装到 Cursor 时，将第一行的 `'.claude/skills'` 改为 `'.cursor/skills'`，再执行该段命令。

目录位置与调用方式参见 [Claude Code 官方文档](https://code.claude.com/docs/en/skills)和 [Cursor 官方文档](https://cursor.com/docs/skills)。

### 3. 调用并提供任务

在工具中打开目标项目，在对话中输入 `/` 并选择 `database-design`，随后描述任务，例如：

> 为一个多租户项目管理系统设计数据库，包含项目、成员和任务。使用 PostgreSQL 15，请先梳理实体关系，再给出完整字段字典、约束和索引方案。

也可以提供现有 DDL 或慢查询 SQL。输入材料与交付示例见 [database-design 使用指南](skills/database-design/README.md)。

<a id="skill-catalog"></a>

## Skill 目录

| Skill | 版本 | 核心能力 | 文档与规范 |
| :--- | :---: | :--- | :--- |
| **[database-design](skills/database-design/)** | `v3.2.0` | 数据库需求建模、Schema 评审、慢查询诊断 | [使用指南](skills/database-design/README.md) · [执行规范](skills/database-design/SKILL.md) |

<a id="categories"></a>

## 领域分类

```text
后端开发
└── 数据库与存储
    ├── 关系型数据库
    │   └── PostgreSQL
    └── 数据库架构与设计
        ├── 逻辑建模与范式设计
        ├── Schema 评审与迁移
        ├── 索引设计与查询调优
        └── 并发控制与多租户隔离
```

<a id="contributing"></a>

## 维护规范

<details>
<summary>查看目录结构、分类与版本要求</summary>

每个 Skill 使用独立的英文目录，保留执行规范、使用指南和当前概览图：

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
