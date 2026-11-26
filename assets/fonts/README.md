# 字体资源

当前页面已改用系统字体：Windows 11 的英文采用 Segoe UI Variable Text，中文采用 Microsoft YaHei UI，代码采用 Consolas。页面不再导入本目录的 fonts.css。下列文件保留作为历史资源，其授权继续随文件保存。

| 用途 | 字体 | 授权 | 上游来源 |
| --- | --- | --- | --- |
| 中英文界面 | Noto Sans SC，可变字重 | SIL OFL 1.1 | [Google Fonts](https://github.com/google/fonts/tree/main/ofl/notosanssc) |
| 代码与命令 | JetBrains Mono Regular | SIL OFL 1.1 | [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono) |

Noto Sans SC 使用 WOFF2 格式，按当前界面字符与其余字符拆分为两个互补文件。界面文件预加载，其余字符按 `unicode-range` 加载；两个文件合并覆盖上游字体的全部字符。授权全文随资源保存。

页面不请求外部字体 CDN。新增文字即使未进入首屏子集，也可从扩展字体取得字形。
