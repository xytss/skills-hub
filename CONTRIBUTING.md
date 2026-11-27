# 贡献指南

欢迎补充 Skill、改进使用说明或修复工作台问题。提交 Pull Request 时，请说明改动目的、影响范围和验证结果。

## 本地开发

前端使用 React、TypeScript、Ant Design 与 Vite，需要 Node.js 22.12 或以上版本。

在仓库目录安装依赖并启动开发服务：

```powershell
npm ci
npm run dev
```

本地入口为终端输出地址下的 `/skills-hub/`；提示词页面为 `/skills-hub/prompts.html?prompt=codex-win`。

## 内容维护

| 维护内容 | 编辑文件 |
| --- | --- |
| 上游前端 Skill | [`ant-skills.json`](ant-skills.json) |
| 本仓库数据库 Skill | [`skills/database-design/`](skills/database-design/README.md) 与 [`catalog.json`](catalog.json) 中对应条目 |
| 全局提示词 | [`prompts/codex-win.md`](prompts/codex-win.md)；介绍、版本和分类保存在 [`catalog.json`](catalog.json) 的 `prompts` 中 |

修改前端 Skill 数据后，同步并运行类型检查：

```powershell
npm run catalog:sync
npm run typecheck
```

提交时一并包含 `ant-skills.json` 与同步后的 `catalog.json`。字段说明、版本核验、同名 Skill 与条目下架方式见 [数据维护指南](docs/catalog-maintenance.md)。

修改介绍、版本或收录数量时，同时更新 [README](README.md) 中对应的使用者信息。

## 构建与预览

```powershell
npm run build
npm run preview
```

`npm run build` 依次执行目录同步与校验、类型检查、Vite 构建。产物位于 `dist/`，其中 `catalog.json`、`skills/` 与 `prompts/` 由构建流程复制。通过本地预览核对分类选择、详情、文档跳转及安装对象。

## 发布

维护者推送 `main` 后，[GitHub Actions](https://github.com/xytss/skills-hub/actions/workflows/deploy.yml) 自动构建并发布到 [GitHub Pages](https://xytss.github.io/skills-hub/)。发布配置见 [`deploy.yml`](.github/workflows/deploy.yml)，CI 使用 Node.js 24。

前端布局与交互约定见 [UI 设计规范](docs/ui-design.md)。
