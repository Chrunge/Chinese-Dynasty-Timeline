# 当前架构与维护边界

项目是十一个专题共用程序的静态网站。资料在构建期校验和投影，浏览器只读取当前专题并处理交互；无后台服务、数据库或第三方运行时依赖。完整 dist 可离线打开。

## 架构图

~~~mermaid
flowchart TB
  A[data 专题原件与传记总集] --> B[lib 技术适配、纪年和关系校验]
  B --> C[构建期传记补充与引用校验]
  C --> D[专题数据、出处索引和实体导航]
  S[src 页面、样式与手写算法] --> E[build.mjs 统一构建]
  D --> E
  E --> F[dist 独立页面、资源版本与发布清单]
  F --> G[浏览器 app 与 startup]
  G --> H[history 查询、search 搜索]
  G --> I[state 状态与 navigation 返回栈]
  H --> J[时间线、人物画廊与详情]
  I --> J
  K[PersonActivities 活动投影] --> J
  J --> L[timeline-dom 按行复用与独立参考线]
  I --> V[view 视图采集与恢复]
  V --> R[reading、study 与 storage]
  V --> U[share、view-link 与 URL Hash]
  H --> O[comparison 独立快照]
  O --> Q[JSON 输出]
  O --> P[export-layout 分页]
  P --> N[canvas 绘制、PDF 与 ZIP 编码]
  F --> CI[Actions 检查与 Pages 发布]
~~~

传记总集只由构建程序读取；公共 app.js 中的 biography 仅包含活动筛选和轨迹算法，不携带全专题正文。出处总索引 corpus.json 不作为首屏脚本加载。

## 目录与模块

| 位置 | 职责 |
|---|---|
| data/、data/examples/ | 正式原件、Schema、传记总集；examples 为非生产结构样例，规则见[资料维护](../data/README.md) |
| lib/production.mjs、*-annotations.mjs | 登记专题，深复制原件后执行明确的技术适配 |
| lib/atlas.mjs、lib/time.mjs | 纯校验、日期转换与领域投影，不修改作者输入 |
| lib/biography-data.mjs、lib/biography.mjs | 构建期总集投影、人物补充和引用诊断 |
| lib/corpus.mjs、lib/entity-links.mjs | 按原始文件、路径、散列与明确 ID 生成出处和跨专题导航 |
| lib/*display.mjs、src/core/presentation.js | 显示注解、分组、短标签、默认顺序与像素布局 |
| src/core/ | 历史查询、搜索、状态、活动、阅读、分享及导出布局规则 |
| src/ui/ | 页面渲染、控件、手势、响应式布局、可访问性和主题 |
| src/adapters/、src/outputs/ | 浏览器存储、DOM 协调、文件编码与画布绘制 |
| src/app.js、src/startup.js | 创建服务、连接界面与恢复顺序 |
| build.mjs、tools/ | 统一生成和检查发布目录；tools 包含可选预览图工具及旧命令入口 |
| dist/ | 自动生成的完整网站，供 file:// 或静态托管使用，不直接编辑 |
| tests/、tests/fixtures/、tests/helpers/ | 规则回归、固定兼容样本、浏览器边界辅助器 |
| .github/ | 自动检查、Pages 发布与资料纠错表单 |
| docs/ | 当前架构、项目管理与维护手册、统一历史记录 |
| .openai/ | 旧Sites配置，不参与Pages运行 |
| node_modules/、.validation/ | 本机开发依赖及按需生成的验收结果，忽略提交与发布 |
| arichive/（按需创建） | 临时内容的本地归档位置；压缩包和清单忽略提交，规则见[项目手册](PROJECT-GUIDE.md#临时文件归档与清理) |
| .git/ | Git 历史与仓库元数据 |

## 数据与查询边界

原件字段、BCE/CE 编码、来源和显式关系只在[资料维护约定](../data/README.md)说明。技术投影不裁决史实，不按姓名合并实体；后凉/后梁、武周/吴周的 ID 碰撞按专题隔离。构建拒绝未声明或无效引用，跨专题和未单列事件状态分别进入[诊断资源](../dist/biography-diagnostics.json)。

history 提供 state/event/person、polity/tenure/period、rulersAt/compareYear、tenuresForPerson/periodsInRange 与 comparison。条带使用采用年表，同年查询考虑明确即位和中断；在位不自动表示参与事件。查询快照、原资料与各次导出深度分离。

PersonActivities 将章节、活动阶段和 journey 投影为只读活动。同年看板读取全部明确记年的记录；轨迹按阶段、章节、原活动选择叙事来源。仅通过明确 ID、事件或章节合并重复项，原始记录及来源保留于 provenance，不从生卒或零散事迹推断连续活动。

## 专题展示规则

Core/Minor 是阅读层级，不表示历史正统或政权等级。表中为默认顺序与集合；未列的政权按需展开。分组仅组合已选成员，实体身份和真实区间保持独立。

| 专题 | 默认顺序与接续行 | 默认参考年 |
|---|---|---|
| 夏商 | 夏→商共行，周及其他政权独立；默认全部 | 前1600 |
| 周朝 | 周王室、齐、晋、秦、楚、燕、鲁、吴、越、韩、赵、魏；其余折叠 | 前770 |
| 秦汉 | 秦→西汉→新→玄汉→东汉共行；卫、张楚、西楚独立；默认全部 | 前140 |
| 三国 | 曹魏、蜀汉、孙吴、东汉末、西晋独立；默认全部 | 公元229 |
| 魏晋南北朝 | 两晋、南朝、北朝东西支分别共行，前秦独立；其余十六国及隋折叠 | 公元383 |
| 隋唐 | 隋独立，唐与武周共行；其他折叠 | 公元618 |
| 五代十国 | 后梁→后唐→后晋→后汉→后周→北宋主行；次要政权展开时杨吴→南唐共行，其余独立 | 公元923 |
| 宋辽金 | 北宋→南宋共用首行，其后辽、金、西夏；其他折叠 | 公元960 |
| 元朝 | 蒙元、南宋、金、明独立；其他折叠 | 公元1271 |
| 明朝 | 明→南明共行，后金/清独立；其他折叠 | 公元1368 |
| 清朝 | 后金/清、明默认显示；展开时明→南明共行，其余独立 | 公元1644 |

- 完整策略与明确任期短标签分别由 presentation、production-display、dynasty-display、expansion-display 维护。短称不替代姓名、身份、任职说明和出处；完整内容保留于提示与详情。元监国、称制与复辟任期不合并或伪标为皇帝。
- 武周以“武周 · 武则天”、特殊底色和描边显示，保留 690—705 年国号说明及原唐存续区间。北魏只在一个分支中出现；辽与西辽、前蜀与后蜀保持独立。
- 区间首尾年均计入；同年交接仍按重叠分别排布。短祚微槽和事件防碰撞只分配像素，不编造月份、日期或继承关系。
- 分组左列标题占24px，成员名称与年代至少40px，次要成员附注另加12px，行高含6px内边距。标题和成员不纵向压缩，右侧条带共享同一行高；页面不显示内部排版术语。
- 增加行高时，事件先使用条带旁及下方空白，不足才聚合；聚焦项优先预留位置，聚合仍保留全部标题与日期。时间坐标、类别过滤与导出内容不因像素布局改变。
- 固定某成员只置顶其视觉行，不恢复被过滤成员。排序、筛选、搜索定位、同年对照、分享、阅读和导出始终使用原政权或任期 ID；计数按实体而非视觉行。
- 时间轴、国家行和参考线独立；timeline-dom 按稳定行键复用、移动或替换节点。参考年与搜索分页不进入历史条带缓存键，坐标改变时重建相关行。

## 状态与交互

state 分为 conditions、layout、search、session；navigation 独立保存返回路径。view 统一采集控件、滚动和详情。恢复顺序为默认、本地阅读、显式 Hash；恢复过程抑制反向写回。

布局、固定、组合、阅读和访问记录使用 zhou-layout-v2、zhou-pins-v3、zhou-comparisons-v3、zhou-reading-v4、zhou-visits-v4。其他专题附加 datasetId 命名空间；界面与主题分别使用 zhou-ui-v1、zhou-theme-v1。损坏或不可用存储不阻止启动。日期协议、旧姓名路由与 Hash 的时间编码见[资料约定](../data/README.md#链接与存储的时间约定)。

宋辽金仅将无 orderVersion 且与原资料默认顺序完全相同的布局迁至宋优先。新保存布局写入 orderVersion:1；其他自定义顺序、已标记布局和显式分享顺序保持。专题显示名称由 Branding 映射，已有网址、ID 与资料投影保持。

工具栏依次提供搜索、年份与缩放、人物/政权/设置、导出/分享；主题有随系统、宣纸、玄青。窄屏年份编辑区在正常布局中展开。手势支持单指惯性与双指中心缩放，取消、失焦或减少动态效果会终止相应动画。768px 以下详情为三档底部抽屉，保留原生 dialog 和返回栈。

同年看板查询专题全部存续政权，不受当前选择或视觉分组限制；只有本专题内、明确记年且在范围内的章节可联动时间线。外部背景保留阅读内容。Alt+Y 聚焦参考线，方向键逐年、Shift+方向键十年、Home/End 到边界；Alt+E 导出，搜索上下键与 Enter 操作，Esc 按面板边界返回。

## 输出与发布

构建生成专题 SEO、无脚本完整年表、SVG 及可选 PNG。页面资源引用内容散列；分享 Hash 保存视图与可选稳定详情 ID，连续操作200ms防抖后 replaceState，手动 Hash 与前进后退恢复视图。资料纠错入口只预填表单，由用户核对后提交。

JSON 是附带时间编码和来源的对照快照，不是可重新导入的原始 Atlas。图页由 export-layout 分页、canvas 绘制、export-files 编码，保留完整记录与来源，跨页区间显示续接。PDF 为图片页，文字不可选中。文件生成不修改查询快照。

## 兼容与验收

[固定周朝基线](../tests/zhou-baseline.test.cjs)读取[固定样本](../tests/fixtures/zhou-baseline.json)，覆盖旧查询、同年即位/条带、中断复国、秦前221年阶段、v1分享、旧阅读恢复、JSON下载、图页文字和来源异说。不得用当前实现重算预期或覆盖 fixture 来消除回归。仅导出运行日期归一化，真实年份、名称、日期口径、来源和数组身份保持检查。

[传记固定投影](../tests/fixtures/biography-projections.json)和[七专题原件投影](../tests/fixtures/seven-topic-projections.json)保护资料及补充结果；输出隔离检查保证修改快照不污染原件或后续导出。Node 的 DOM/Canvas 边界验证不等于真实字体、像素或设备验收。

浏览器脚本与命令见[项目手册](PROJECT-GUIDE.md#开发与测试)。默认 CI 检查人物入口与分组左列实际边界；完整展示脚本覆盖筛选、搜索、阅读、分享、JSON与PDF。自动化不替代实体手机、读屏和打印检查。Pages配置与排障见[项目手册](PROJECT-GUIDE.md#发布与部署)，操作与退役文档全文仅存于[历史记录](HISTORY.md)。
