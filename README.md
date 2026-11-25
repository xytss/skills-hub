# skills-hub

面向日常开发，按分类查找和维护可复用Skill。每项Skill独立保存，中文用于介绍与分类，目录和文件名使用英文。

## 当前Skill

| Skill | 版本 | 用途 | 阅读入口 | AI入口 |
|---|---|---|---|---|
| database-design | 3.2.0 | 数据库需求建模、结构评审、查询诊断 | [介绍与漫画概念图](skills/database-design/README.md) | [SKILL.md](skills/database-design/SKILL.md) |

## 分类导航

```text
后端开发
└── 数据库与存储
    ├── 关系型数据库
    │   └── PostgreSQL
    └── 数据库架构与设计
        ├── 逻辑建模与范式设计
        ├── Schema评审与迁移
        ├── 索引设计与查询调优
        └── 并发控制与多租户隔离
```

分类路径维护在各Skill的metadata.category_paths中，同一Skill可以归入多条路径。当前检索目录为[catalog.json](catalog.json)。

## 目录约定

- `skills/<skill-name>/SKILL.md`：Skill定义及AI执行规则。
- `skills/<skill-name>/README.md`：面向人的用途、输入输出与使用说明。
- `skills/<skill-name>/assets/overview.png`：当前采用的概念图。
- `references/`和`scripts/`按具体需要增加。

每项Skill默认采用以下结构：

```text
skills/<skill-name>/
├── SKILL.md
├── README.md
└── assets/
    └── overview.png
```

当前仓库保存文件和本地版本记录。各开发工具的发现和加载方式按对应工具配置。

## 许可证

本仓库采用 [MIT License](LICENSE)。
