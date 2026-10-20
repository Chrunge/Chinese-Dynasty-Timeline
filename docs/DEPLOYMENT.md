# GitHub Pages 部署

在线地址：[周朝时间线](https://chrunge.github.io/Zhou-Dynasty-Timeline/)。

仓库为 [Chrunge/Zhou-Dynasty-Timeline](https://github.com/Chrunge/Zhou-Dynasty-Timeline)，Pages发布来源是GitHub Actions，发布分支为 `master`，发布目录为 `dist/`。个人博客使用域名根路径，时间线使用项目子路径，两者独立部署，无需复制时间线源码到博客目录。

## 工作流

工作流位于 [site.yml](../.github/workflows/site.yml)，使用Node.js 22和官方Actions：

| 阶段 | 触发及行为 |
|---|---|
| 检查 | Pull request、master推送及手动运行均检查已提交生成物的一致性，运行全部测试，再构建 |
| 上传 | 检查成功后，仅上传dist目录作为Pages产物 |
| 部署 | 仅master推送或在master上手动运行时部署；PR及其他分支的手动运行不部署 |

检查作业只有读取仓库内容的权限；部署作业申请 `pages: write` 和 `id-token: write`，使用 `github-pages` 环境。工作流按引用分组控制并发，不取消正在执行的部署。

## 仓库设置

在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。账户及组织策略须允许Actions和Pages，部署须满足 `github-pages` 环境的审批及分支限制。

工作流中的 `push.branches`、部署条件和环境分支限制须与发布分支一致。手动发布时选择 `master`。更改本地工作分支不会更改发布分支，也不会自动更新线上站点。

Pages来源配置属于仓库设置，工作流不代为修改。部署状态以[Actions列表](https://github.com/Chrunge/Zhou-Dynasty-Timeline/actions)和 `github-pages` 环境中的结果为准。

## 提交与发布

按[维护与检查](../README.md#维护与检查)运行本地命令，将源码、资料和生成的 `dist/` 一起提交。CI首先校验已提交产物，不能靠后续构建掩盖过期文件。

发布HTML引用的脚本和样式带内容散列参数；这些参数由构建维护。相同源码生成相同发布入口。源码、测试、资料源、文档和备份均不包含在Pages上传产物中。

## 排障

| 现象 | 检查方式 |
|---|---|
| dist文件缺失或过期 | 本地重新构建并提交生成物 |
| 测试失败 | 修复报告中的问题；失败的检查不会触发部署 |
| Pages权限错误 | 检查Pages来源、Actions权限、组织策略及环境限制 |
| 部署作业被跳过 | 检查是否由master推送，或手动运行时是否选择master |

原始Sites托管配置 `.openai/hosting.json` 保留在仓库中，不参与此Pages工作流。

## 2026-10-19 正式资料上线与真实浏览器验收

### 部署身份与范围

- 正式资料功能提交：`bbb695fe54d94c812713495dc1232def7f4766a4`，已推送原仓库 `master`（推送范围 `f0d566b..bbb695f`）。
- 对应[Actions运行39254141518](https://github.com/Chrunge/Zhou-Dynasty-Timeline/actions/runs/39254141518)的 `head_sha` 与上述提交完全一致，状态为 `completed / success`。检查构建作业于 `2026-10-19T12:42:36Z` 成功，Pages部署作业于 `2026-10-19T12:42:49Z` 成功（北京时间20:42:49）。
- 先前的Git凭证程序、Chrome权限阻断与两个新入口404属于部署前状态，已被本次实际推送、部署及线上验收结果取代；没有创建替代站点。
- 本轮仅做部署服务联网核验与文档收尾：未重新入库、未修改史料或应用代码、未安装依赖，未在本地重复运行139项测试。联网范围限于GitHub部署状态和原Pages站点，没有打开史源链接或联网校核史料。

### 在线入口与发布完整性

`2026-10-19T12:45:46Z` 实际通过HTTPS取回以下入口和[在线发布清单](https://chrunge.github.io/Zhou-Dynasty-Timeline/release.json)，均为HTTP200：

| 专题 | 原站入口 | 入口SHA-256 |
|---|---|---|
| 周朝 | [根入口](https://chrunge.github.io/Zhou-Dynasty-Timeline/) | `d093b7f479c04db5ba74b53259d4c69aa41c5354a39eea5fc839a39cac333926` |
| 秦汉 | [秦汉入口](https://chrunge.github.io/Zhou-Dynasty-Timeline/qin-han.html) | `bec1ad6cfa0f289322ac5c86fdf59d9dd639eae1063d9018e96d670671dfcced` |
| 三国 | [三国入口](https://chrunge.github.io/Zhou-Dynasty-Timeline/three-kingdoms.html) | `2d985a0157c37916e9684d5cf228a0cbb42287d17352ccf8c5bb69ebc1237e7e` |

- 发布标识：`releaseId=3935bf31fc3fe2ce4af28c40e69a49859fc379e9f0fbd677201ebc66e52023c2`。
- 远端清单与[仓库清单](<../dist/release.json>)逐字节一致，清单本身SHA-256为 `21234668dd7fcb56d4abca77d5fc52e51ec7c4aee972e5a3431ca6216bbb4d78`。
- 逐一取回清单列出的全部11项资源：三个入口、三个数据脚本、四个应用脚本、一个样式表。全部HTTP200，全部实际响应字节的SHA-256同时匹配清单和本地已提交产物；根入口的响应另与周朝入口散列一致。检查使用禁用缓存/唯一查询参数，非只核对资源名或HTTP头。

### 真实Chrome在线验收

验收完成时间 `2026-10-19T12:47:20Z`（北京时间20:47:20）。使用本机 `Chrome/155.0.8059.80`，以headless模式和CDP连接原站HTTPS地址，不使用DOM替身或本地替代服务。三页分别在1200×900与390×900视窗验收，共6个场景全部通过；现场读取了时间线、详情截图，确认两个新专题确有时间轴、任期条带及事件，不是空壳页面。

| 专题 | 两种宽度下实际渲染 | 通过的关键路径 |
|---|---|---|
| 周朝 | 18行、449个任期条带、100个事件/聚合按钮 | 定位前770年、同年对照、周王室详情、周武王详情、关闭返回 |
| 秦汉 | 8行、40个窗口内任期条带、16个事件/聚合按钮 | 定位公元1年（显示正确纪元，不显示公元0年）、秦政权→秦王政任期→嬴政档案、搜索“秦王政继位”→事件详情→图上联动、关闭返回 |
| 三国 | 5行、17个任期条带、6个事件/聚合按钮 | 定位公元220年、汉末政权→汉献帝任期→刘协档案、搜索“董卓入京废立与关东联军讨董”→事件详情→图上联动、关闭返回 |

- 上表为当前图上渲染数量；窗口外任期和同组聚合事件仍完整保留，不等于资料覆盖总数。资料计数见[正式入库说明](<FORMAL-DATA-IMPORT.md>)。
- 六个场景均有正确的专题标题及当前导航标识，年份输出和同年对照更新正常，页面根节点无横向溢出（时间线内部允许滚动）。CDP记录的页面未捕获JS异常、`console.error`、错误级页面日志或网络加载失败。
- Chrome进程stderr曾输出内置GCM注册诊断 `DEPRECATED_ENDPOINT`，它不是页面脚本异常，不影响上述通过结果。
- 限制：本次为真实Chrome自动化与截图抽查，不等同于实体移动设备触控、全量人工视觉/无障碍检查或打印验收；没有据此宣称这些项目已经通过。

### 文档收尾发布规则

本节记录已成功上线的功能提交及线上证据。随后仅提交这份部署记录与[入库说明](<FORMAL-DATA-IMPORT.md>)的限制更新；文档不会进入Pages产物，预期发布标识保持不变。仍须等待该文档提交对应的末次Actions部署成功，再确认原站发布标识及资源一致；末次提交和运行链接随最终交付回报记录，避免通过追加自引用提交反复触发部署。

## 2026-10-20 四专题扩展发布检查

### 本地完成的验证

- 四份授权原件逐字节入库；完整散列、类别适配和复合事件限制见[入库记录](<DYNASTY-INTAKE.md>)。没有联网检查史实或访问史源页面。
- 七个静态入口共用应用与构建生成导航；新增入口为 `wei-jin-nan-bei.html`、`sui-tang.html`、`liao-jin-song.html`、`ming.html`。周朝、秦汉、三国入口不变。
- `node --test --test-isolation=none tests/*.test.mjs tests/*.test.cjs`：233项通过、0失败、0跳过；旧周朝固定fixture保持不变。`node build.mjs --check`和`git diff --check`用于提交前核对。
- `node tests/browser-presentation.mjs`：真实Chrome/155.0.8059.80、七页×1200/390宽度共14场景通过；新四页初始分别20/9/7/5视觉行，99/36/58/25条窗口内任期。明朝默认1644年以后条目保留，可通过延伸范围进入，源库共31任期。
- 验收覆盖详情、生平、姓名搜索、同年对照、行高展开事件且无事件/任期碰撞、长政权侧栏边界、短标签/放大年份、阅读恢复、分享及JSON导出；三国与明朝还实际生成PDF Blob。页面JS异常及网络失败均为0。自动截图抽查发现长政权换行溢出后已修复并完整重跑。
- 发布清单包含全部七页、七个数据脚本、共享脚本/样式及 `corpus.json`。出处索引按ID登记各卷原文位置与字段差异，不将差异判为史实冲突。

### 线上验收规则

本节随功能提交记录本地证据，不预先声称已部署。推送原仓库后，须核对该提交对应Actions成功、原站`release.json`及所有清单资源实际响应字节与本地一致，再用上述Chrome脚本传入原站HTTPS根地址重验14场景；实际提交、运行链接和验证结果在最终交付中回报，不追加自引用文档提交。联网仅限原仓库部署服务及原站资源。实体触控、全量人工视觉/无障碍或纸面打印未据此验收。

## 2026-10-20 夏商、五代十国、元、清扩展发布检查

### 本地验收证据

- 四份原件逐字节保留，散列、18条夏商争议纪年的继承限制、10对复合事件边及单个来源URL技术片段见[入库记录](<EXPANSION-INTAKE.md>)；没有联网核对史实。
- 导航扩展为11个入口，新页为 `xia-shang.html`、`five-dynasties.html`、`yuan.html`、`qing.html`；周朝旧路由和存储键不变。新增前七专题的固定投影散列基线（只排除导航catalog），全部通过；周朝原fixture不改。
- 全量289项回归通过，无失败、无跳过；`node build.mjs --check` 与 `git diff --check` 通过。
- 真实Chrome十一页×1200/390宽度共22场景通过，新四页初始分别5/11/11/6视觉行、53/59/25/19条任期；检查短标签、长政权侧栏、真实矩形无碰撞的密集事件展开、姓名搜索、详情、生平、同年对照、年份放大、分享、阅读恢复及JSON导出。夏商、三国、明、清还生成PDF Blob。页面JS异常与资源失败为0；Chrome自身更新器/GCM的stderr不作为页面错误。
- 出处索引显式区分两组异实体同ID（后凉／后梁、武周／吴周），保持原ID不改，按dataset身份取值；跨卷分享与组合拒绝误读。其他同ID差异保留原文，不裁决历史身份。

### 线上验收约束

本节记录随提交保存的本地证据，不预先宣称上线。推送后须确认对应Actions成功，再执行 `node tests/verify-release.mjs` 比对原站发布清单和全部资源字节散列，并用 `node tests/browser-presentation.mjs https://chrunge.github.io/Zhou-Dynasty-Timeline/` 重验22场景。实际提交、运行链接与结果随最终交付回报，不追加自引用提交。联网仅限原仓库部署服务与原站资源；未做实体触控、全量人工视觉、来源网页或纸面打印验收。
