# 当前架构与维护边界

## 总体结构

项目提供十一个独立静态专题，共享查询、呈现和输出程序。运行时无第三方依赖，完整 dist 目录可通过 file:// 打开；Playwright、axe-core 和 Lighthouse 只用于开发验收。

~~~mermaid
flowchart TB
  subgraph authoring[维护资料]
    A[十一专题原始 JSON]
    B[传记总集 JSON]
    C[页面模板、样式与手写代码]
  end
  subgraph build[确定性构建]
    A --> P[production 技术适配]
    P --> V[atlas 校验与领域投影]
    V --> D[专题显示注解]
    B --> G[biography-data 构建期输入投影]
    G --> BC[biography 构建期补充]
    D --> BC
    BC --> R[本地、跨专题与未收录引用校验]
    A --> I[corpus 原始出处索引]
    B --> I
    I --> L[entity-links 导航投影]
    R --> L
    R --> DATA[dist/data*.js]
    R --> DIAG[biography-diagnostics.json]
    I --> CORPUS[corpus.json]
    L --> LINKS[entity-links.js]
    C --> PACK[脚本、样式与静态页面构建]
    E[src/core/biography.js 轨迹与筛选] --> PACK
    DATA --> PACK
    PACK --> RELEASE[dist 页面、资源散列与 release.json]
  end
  subgraph runtime[浏览器运行]
    DATA --> APP[app 创建服务与状态]
    APP --> START[startup 连接界面与恢复顺序]
    APP --> H[history 历史查询]
    APP --> S[search 稳定 ID 搜索]
    APP --> STATE[state 视图状态]
    H --> T[时间线与同年看板]
    S --> DETAIL[人物、事件和政权详情]
    STATE --> T
    ACT[PersonActivities 只读活动投影] --> T
    ACT --> BIO[传记轨迹与人物定位]
    E --> BIO
    BIO --> T
    T --> DOM[timeline-dom 按行复用 DOM]
    DETAIL <--> NAV[navigation 返回栈]
    START --> VIEW[view 统一视图采集与恢复]
    STATE <--> VIEW
    VIEW <--> READ[reading 与 study 阅读恢复]
    READ <--> STORAGE[storage 本地存储]
    VIEW <--> SHARE[share 与 view-link Hash]
    LINKS --> DETAIL
    H --> SNAPSHOT[comparison 独立内容快照]
    SNAPSHOT --> JSON[JSON 导出]
    SNAPSHOT --> LAYOUT[export-layout 分页与索引]
    LAYOUT --> CANVAS[canvas 图页]
    CANVAS --> FILES[export-files PDF 与 ZIP]
  end
~~~

## 文件与职责

| 位置 | 当前职责 |
|---|---|
| [生产目录](../lib/production.mjs) | 登记专题、原件和入口，连接技术适配、编译与显示注解 |
| [资料编译](../lib/atlas.mjs)、[时间转换](../lib/time.mjs) | 纯校验与领域投影，不读写文件或修改作者输入 |
| [传记投影](../lib/biography-data.mjs) | 在构建期整理总集字段；全专题传记不进入公共脚本 |
| [传记编译](../lib/biography.mjs) | 发布前补充资料，校验引用作用域，生成诊断；页面启动不再补入人物 |
| [出处索引](../lib/corpus.mjs) | 保留原件及传记的文件、JSON 路径和散列，列出字段差异，不裁决史实 |
| [实体导航](../lib/entity-links.mjs) | 据明确稳定 ID 生成本地专题链接，不按姓名合并 |
| src/core/ | 历史查询、搜索、状态、活动投影、阅读、链接、展示与输出布局 |
| src/ui/ | 时间线、详情、人物画廊、工具栏、触控、可访问性和主题 |
| [app](../src/app.js)、[startup](../src/startup.js) | 创建服务、注入界面依赖、连接页面生命周期 |
| src/adapters/、src/outputs/ | DOM 协调、浏览器存储、文件编码与画布绘制 |
| [构建入口](../build.mjs) | 统一生成和检查 dist，维护资源版本与发布清单 |

## 资料与引用

专题原件、Schema 和技术适配以[资料约定](../data/README.md)为准。传记先与专题投影组合，再进入统计、导航和发布；发布人数包含传记补充。出处索引的专题 counts 表示原件数量，supplements 表示补充出处；同一专题的多个出处不计为跨专题共享。

传记事件和政权默认引用当前专题。明确的 eventDatasetId／polityDatasetId 指定跨专题目标，构建必须验证目标实体存在。未单列事件用 eventReference.status=unindexed、originalId 和 reason 保留说明，同时不生成 eventId。未声明或无效的引用会中止构建；已确认的跨专题及未收录状态分别列于 [诊断资源](../dist/biography-diagnostics.json)。引用关联不令章节继承复合事件的锚点年份。

PersonActivities 为章节、阶段活动和 journey 提供只读投影：同年看板读取全部明确记年的记录，轨迹和定位按阶段、章节、原活动选择叙事来源。只通过显式 ID、事件或对应章节合并重复项，全部原记录和来源保留于 provenance；不同日期、政权或仅文案相同的活动不合并。未知日期不变成公元元年，不据生卒和分散事迹推断连续活动。

时间编码、实体和旧格式见[时间与领域模型](TIME-DOMAIN-MIGRATION.md)。运行时采用 bce-axis：前1年为1、公元1年为0、公元2年为-1，未知为 null。时期、政权、人物和任期相互独立；后凉／后梁、武周／吴周的 ID 碰撞按专题隔离。

## 查询与呈现

history 提供 state／event／person、polity／tenure／period、rulersAt／compareYear、区间查询和 comparison。条带采用年表范围，同年查询考虑已明确的实际即位与中断；不把在位者推为事件参与者。快照与输入、其他输出深度分离。

呈现分组只改变视觉行，不改变实体身份、日期或关系。接续、重叠、短标签与默认集合分别由[呈现契约](PRESENTATION-CONTRACT.md)、[四专题注解](DYNASTY-DISPLAY.md)、[扩展注解](EXPANSION-DISPLAY.md)定义。闭区间事件沿用真实起讫；短祚微槽仅分配像素，不编造年内日期或继承关系。

时间轴、国家行和参考线为独立节点。timeline-dom 按稳定行键复用、移动或替换节点；参考年与搜索分页不进入历史条带缓存键，缩放改变坐标时允许重建相关行。

## 页面交互

工具栏分为搜索、年份与缩放、人物／政权／设置、导出与分享；专题导航独立。年份胶囊支持前后年和输入定位，窄屏编辑区在正常布局中展开，关闭后释放空间。人物画廊通过姓名打开详情、轨迹和高亮，分类与清除操作保留其他视图条件。

普通控件保留44px命中目标；密集图元采用虚拟命中和候选列表，不放大史料条带。手势支持单指惯性、双指中心缩放、取消与失焦终止；减少动态效果时关闭惯性。768px 以下详情采用35／60／90%底部抽屉，保持原生 dialog 与返回栈。

同年看板为非模态区域，读取专题全部存续政权，不受当前勾选或视觉行组限制。只有本专题内、明确记年且在时间范围内的传记章节可以联动左图；专题外背景保留阅读内容，不把外部政权加入本地选择。

主题为随系统、宣纸、玄青，单独持久化。Alt+Y 聚焦参考线，方向键逐年、Shift+方向键十年、Home／End 到边界；Alt+E 打开导出。搜索支持上下选择与 Enter；Esc 按当前面板边界收起或返回。

## 状态、阅读与分享

state 分为 conditions、layout、search、session；navigation 独立保存返回路径。view 统一采集和恢复控件、滚动与详情入口。恢复顺序为默认视图、本地阅读、显式 Hash；恢复时抑制反向写回。

周朝保留 zhou-layout-v2、zhou-pins-v3、zhou-comparisons-v3、zhou-reading-v4、zhou-visits-v4；其他专题附加命名空间。全站界面与主题偏好分别使用 zhou-ui-v1 和 zhou-theme-v1。不可用存储、损坏 JSON 或非法字段不阻止页面启动。

阅读横向偏移按专题起点、结束年和缩放校验；同宽保留合法像素位置，跨宽根据已保存范围重算。旧姓名路由只在名称或别称唯一时迁移到稳定 ID；未定位君主通过固定 legacyKeys 迁移，不按当前数组下标解释旧链接。

纯 BCE 分享沿用 v1，包含0或负坐标时使用 v2 和 bce-axis 标记。Hash 保存参考年、范围、筛选、固定、顺序、缩放、显示、搜索和可选稳定详情 ID；不写临时 HTML、历史记录或来源正文。连续操作200ms防抖后 replaceState，手动 Hash 和前进后退恢复视图。分享摘要不扩充协议；离线文件链接只适用于可访问该路径的设备。

## 静态呈现与导出

构建生成专题 SEO、无脚本完整年表、SVG 预览图与可选 PNG；十一页共用模板和应用，引用资源带内容散列。反馈入口只预填上下文，用户核对后自行提交。

JSON 是带时间编码和来源的对照快照，不是可重新导入的 Atlas 文件。图页由 export-layout、canvas、export-files 分层生成，保留完整命中记录与来源，跨页区间显示续接；PDF 为图片页面，文字不可选中。布局和编码不修改查询快照。

## 构建、验证与部署

常规构建与 Node 测试不需要第三方依赖；传记原件由统一构建直接读取与校验。命令与浏览器检查范围见 [README](../README.md#维护与检查)。Node 的轻量 DOM 只验证模型和状态，真实入口、排版、触控和打印须使用对应验收方式。

默认 CI 检查已提交产物、运行 Node 测试、构建，再运行 Chromium 的人物入口回归。通过后上传 dist；只有 master 推送或 master 手动运行部署 Pages。工作流、权限与可选 PNG 见[部署说明](DEPLOYMENT.md)。操作、旧方案与历次验收记录只保存在[历史文档](HISTORY.md)。
