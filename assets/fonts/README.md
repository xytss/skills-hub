# 字体资源

当前中文界面及全角标点采用 Noto Sans SC，Windows 11 的英文采用 Segoe UI Variable Text，代码英文采用 Consolas。页面导入 chinese.css，仅加载 Noto Sans SC 的中文与补充符号范围；fonts.css 和 JetBrains Mono 保留作为历史资源。

| 用途 | 字体 | 授权 | 上游来源 |
| --- | --- | --- | --- |
| 中文界面及标点 | Noto Sans SC，可变字重 | SIL OFL 1.1 | [Google Fonts](https://github.com/google/fonts/tree/main/ofl/notosanssc) |
| 历史代码字体 | JetBrains Mono Regular | SIL OFL 1.1 | [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono) |

Noto Sans SC 使用 WOFF2 格式，保留100～900可变字重、字形、hinting及字体内的授权信息。`chinese.css`通过互补的`unicode-range`限制为中文、全角字符与补充符号：常用界面字使用`noto-sans-sc-ui.woff2`；当前页面文案新增的字使用`noto-sans-sc-content.woff2`；其余字按固定的2048码位区间分包到`noto-sans-sc-block-*.woff2`。浏览器只请求页面实际使用的分包。

页面不请求外部字体 CDN。新增文字即使未进入内容子集，也可从对应的区间分包取得字形。原始两个字体文件保留作为生成来源；运行页面不再引用7.7MB的完整扩展文件。

两页仅预加载常用界面字库，CSS及预加载使用相同的构建指纹地址。Vite保持所有WOFF2为独立文件，避免小分包被内联进主CSS。

更新`catalog.json`、`src/**/*.tsx`或`prompts/**/*.md`中的中文文案后，在项目根目录执行`npm run fonts:build`，再执行`npm run build`。生成命令使用uv的隔离环境及固定版本fontTools；生成后的WOFF2和CSS随仓库提交，常规开发、构建与GitHub Actions无需安装Python依赖。

生成脚本为`scripts/build-font-subsets.py`，不清理或删除已有文件。依据[fontTools子集文档](https://fonttools.readthedocs.io/en/latest/subset/index.html)生成；字体授权全文随资源保存。
