# 历史时间线 · 同年对照

纯静态中文历史资料库，提供夏商、周朝、秦汉、三国、魏晋南北朝、隋唐、五代十国、宋辽金、元、明、清十一个专题，支持时间线、同年对照、搜索、人物传记、阅读恢复、分享和导出。

[在线打开](https://chrunge.github.io/Zhou-Dynasty-Timeline/)。个人博客与本项目分别使用域名根路径和项目子路径，独立部署。离线直接打开 dist/index.html；复制或部署时使用完整 dist 目录。

## 使用

- 在专题栏切换时期，拖动、滚动或缩放时间轴；通过年份输入或时代按钮定位。
- “重点人物”打开人物画廊，“选择政权”切换主要/全部/自定义集合；“视图设置”提供排序、行高、密度、研究组合和主题。
- 点击政权、君主、事件或人物查看详情、传记、纪年异说与史源；Esc 返回。日期未定的资料保留阅读内容，专题外背景不定位到当前卷。
- 参考线与“同年对照”查看当年已收录的政权、在位者、事件和人物活动。实际承位与年表元年分别维护，在位不表示直接参与事件。
- 分享按钮复制带筛选、顺序、缩放、参考年和详情的在线链接。阅读位置与研究组合保存在当前浏览器，专题之间隔离。
- 导出当前对照为 JSON、A4横向图片PDF或PNG/ZIP。JSON可检索和处理；PDF中的文字为图像。资料纠错通过预填 GitHub 表单，由用户核对并提交。

桌面和触屏共用页面；Alt+Y 聚焦年份参考线，Alt+E 导出。首次访问提供可跳过引导。资料是精选，空白不代表没有历史；结构及引用校验不等于逐条史实认证。

## 目录

| 位置 | 用途 |
|---|---|
| data/ | 编辑专题原件与传记总集，字段和来源规则见[资料维护](data/README.md) |
| src/ | 页面、样式、查询与交互源码 |
| lib/ | 构建期适配、校验、资料补充与展示注解 |
| dist/ | 自动生成的网站，不直接修改 |
| tools/ | 可选预览图等维护工具 |
| tests/ | 自动回归、浏览器验收与固定兼容样本 |
| .github/ | 检查、Pages发布与反馈模板 |
| docs/ | 架构、部署及统一历史；其他本地目录见[架构说明](docs/ARCHITECTURE.md#目录与模块) |
| arichive/ | [本地归档与清理说明](arichive/README.md)；压缩包和逐文件清单留在本机 |

build.mjs 是统一构建入口；package.json 与锁文件管理开发工具。浏览器运行没有第三方依赖。

## 维护与检查

需要 Node.js 22 或更高版本。编辑资料或源码后，从项目根目录运行：

~~~sh
node build.mjs
node build.mjs --check
node --test tests/*.test.mjs tests/*.test.cjs
~~~

传记总集由统一构建直接校验与补充。常规构建和 Node 测试无需安装开发依赖；受限环境可使用 node --test --test-isolation=none。Windows 父目录 realpath 的 EPERM 可用 --preserve-symlinks --preserve-symlinks-main 参数处理。

真实浏览器验收先安装开发依赖 npm ci，并使用本机 Chrome 或 npx playwright install chromium。可用 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH 指定浏览器；结果保存在忽略提交的 .validation/，工具不进入发布目录。

| 检查 | 命令与范围 |
|---|---|
| 默认CI | npm run test:figures；所有专题手机/桌面人物入口、主题、年份编辑、分组左列边界与关键响应式宽度 |
| 完整展示 | node tests/browser-presentation.mjs；时间线、筛选、搜索、阅读、分享、JSON和PDF |
| 线上展示 | node tests/browser-presentation.mjs https://chrunge.github.io/Zhou-Dynasty-Timeline/ |
| 发布一致性 | node tests/verify-release.mjs；线上清单、全部资源散列及根入口 |
| 触控 | node tests/browser-p0.mjs；惯性、缩放、抽屉、键盘与拒绝存储 |
| 语义与无障碍 | node tests/browser-p1.mjs；node tests/lighthouse-p1.mjs |
| 静态呈现与导航 | node tests/browser-publication.mjs；node tests/browser-stage4.mjs |

旧命令 sync-data.mjs、enrich-context.mjs、enrich-people.mjs、tools/build-biography-core.mjs 均转调统一构建，不维护平行资料副本。WebMCP 可用时注册 compare_history_year；适用的公元前专题保留 compare_zhou_year 接口。

## 文档

| 文档 | 什么时候看 |
|---|---|
| [架构说明](docs/ARCHITECTURE.md) | 理解目录、模块边界、专题展示与兼容约束 |
| [资料维护](data/README.md) | 修改历史资料、日期、关系、传记与出处 |
| [部署说明](docs/DEPLOYMENT.md) | 配置或排查 GitHub Pages、生成可选PNG |
| [历史记录](docs/HISTORY.md) | 查找操作、评审、资料校核与退役文档原文 |

[结构样例](data/examples/README.md)仅供理解模型，不参与生产构建。十一份正式原件各自维护，出处差异按专题保留；不按同名或共享ID猜测合并。
