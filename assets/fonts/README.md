# 字体资源

当前中文界面及全角标点采用 Noto Sans SC，Windows 11 的英文采用 Segoe UI Variable Text，代码英文采用 Consolas。页面导入 chinese.css，仅加载 Noto Sans SC 的中文与补充符号范围；fonts.css 和 JetBrains Mono 保留作为历史资源。

| 用途 | 字体 | 授权 | 上游来源 |
| --- | --- | --- | --- |
| 中文界面及标点 | Noto Sans SC，可变字重 | SIL OFL 1.1 | [Google Fonts](https://github.com/google/fonts/tree/main/ofl/notosanssc) |
| 历史代码字体 | JetBrains Mono Regular | SIL OFL 1.1 | [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono) |

Noto Sans SC 使用 WOFF2 格式，按界面字符与其余字符拆分为两个互补文件。文件按 `unicode-range` 按需加载；原始两个字体文件合并覆盖上游字体的全部字符，chinese.css 将参与匹配的范围限定为中文、全角字符与补充符号。授权全文随资源保存。

页面不请求外部字体 CDN。新增文字即使未进入首屏子集，也可从扩展字体取得字形。
