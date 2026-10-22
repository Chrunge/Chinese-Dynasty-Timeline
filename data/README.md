# 资料模型与维护约定

十一个专题原件各自维护，入口由[生产目录](../lib/production.mjs)登记。周朝为 [atlas.json](atlas.json)，其他专题使用同名 JSON；[传记总集](中国历代非君主人物传记全书.json)为人物补充来源。构建将补充后的资料用于页面、统计和导航，并以[出处索引](../dist/corpus.json)保留所有原始位置、文件与散列；不同说明不互相覆盖，不按姓名合并。结构样例位于 [examples](examples/README.md)，不参与生产构建。

原件里的校核标签属于作者声明，结构检查不等于逐条史实认证。夏商18条争议纪年缺少独立异说，技术投影按 legacy 继承并保留 sourceDating，不补造观点。后凉／后梁、武周／吴周复用的 ID 必须按专题隔离。

## 集合与关系

| 集合 | 含义 | 主键及关系 |
|---|---|---|
| states | 国家存续、阶段中断、未定位君主 | 国家ID；不内嵌有纪年的君主 |
| rulers | 一个在位区间，不等于整个人生 | 稳定ruler ID，stateId指向国家 |
| people | 独立人物简介、别称与出身 | 稳定person ID，不以姓名作关系主键 |
| events | 单一历史事件与四段摘要 | 稳定event ID；narrative.related仅为主题关联 |
| activities | 人物活动阶段 | 稳定活动ID，personId、stateId、可选eventId |
| sources | 书目及查阅链接 | 稳定source ID，按URL去重 |
| relations | 独立、明确维护的关联 | 只引用ID |

| 关系表 | 字段 | 含义与限制 |
|---|---|---|
| eventStates | eventId、stateId、kind=involved | 事件涉及国家；绝不从人物经历反向推算。未单列国家写在说明中 |
| eventPeople | eventId、personId、kind、可选stateId | participant为明确事件角色，须有国家、说明及来源；related仅表示生平关联 |
| rulerPeople | rulerId、personId、kind=associated | 君臣或人物关联，不表示全在位区间任职或参加期间所有战争 |
| personStates | personId、stateId、kind | 简介明确提及、尚不能定位到具体活动阶段的独立关系 |

人物的浏览器 `states` 是人物关系与活动国家的去重投影，不是任职年表。事件国家仅从 `eventStates` 生成。任职、游说、流亡、出身、外交、教学、死亡等活动分别记录；`sequence` 是阅读顺序，不代表未经核实的绝对先后。

主键创建后不要随排序重排，也不要因改名而修改。人物使用 `person-001` 等稳定ID，姓名与别称只用于显示、检索。人物路由为 `person:person-xxx`；旧 `person:姓名` 在名称或别称唯一匹配时迁移，同名不猜测匹配。需要兼容旧姓名记录时，将旧名保留为别称。未定位君主的列表顺序不自动表示父子关系。

未定位君主包含稳定 `id` 和 `legacyKeys` 数组，详情路由为 `undated:ID`。`legacyKeys` 固定保存已发布的 `undated:国家:旧序号`；排序、插入或改名时不得重算或复用。新增条目使用全新ID及空别名数组，删除条目前须另行确定旧链接的保留方式。

## 纪年与来源

**schema 1 保持原样**：年份使用正整数表示公元前年份，越大的数越早；未知年份用 `null`，禁止用0或当前年份填充。区间起点须大于或等于终点。超出图示范围的真实结局保留，不因专题图示终点裁切。schema 2 的作者日期与运行时坐标见下文，不能把两种格式混写。

- `rulers.start/end`：采用的年表条带范围。`chronology.regnalStart` 与start一致，作为“元年／图示起点”，不保证所有原典均采用这一元年口径。
- `chronology.accession/abdication/death`：分别为实际承位、退位或传位、去世。未核实保持null，不从条带端点自动推导。改元、称王、称帝等另写在changes中。
- `chronology.changes`：有值时为数组，每项包含公元前正整数 `year` 和非空字符串 `label`；缺省或null表示未收录节点，不据此推算历史。
- `events.year` 和 `events.yearRef` 二选一。明确对应已核实生涯节点的事件使用 `{rulerId, field}`，field支持accession、regnalStart、abdication、death。
- 活动 `year` 与 `yearFromEvent: true` 二选一。后者须有eventId，自动继承事件年份、约年属性与纪年说明；仅“主题相关”的事件链接不强制继承日期。
- `dating.level` 为certain／inferred／disputed，表示采用纪年的可信度，不能由是否约年自动覆盖编辑判断。
- `dating.reviewStatus` 为legacy／partial／reviewed，分别表示沿用未逐条复核、部分校核、本条纪年依据已核对；均不表示整个人生或该国全部历史已核验。
- disputed须附有来源的alternatives，新校核条目至少列两项。少数legacy记录仅有一条综合说明，保留待细化状态。
- `alternatives.year` 可为null，表示争议在口径、名单或未能换算的年次；禁止为凑年份而编造数值。
- 出处只维护在sources目录，正文与关系使用sourceIds；君主底表链接使用单值sourceId。eventStates未单列来源时继承事件来源，特殊关系可附description／sourceIds。来源链接不自动证明正文中所有换算年份。

## 构建边界

`lib/atlas.mjs` 只处理校验和投影，不读写文件、不修改输入，不共享人物国家与事件国家的可变数组。`build.mjs` 负责文件读写并生成 `dist/data.js` 及页面产物，供时间线、搜索、详情和导出使用。

本地构建和检查命令见[维护与检查](../README.md#维护与检查)。`--check` 校验主数据并比对全部生成物，不写入文件；过期生成物会使检查失败。

`sync-data.mjs` 及两个enrich脚本均为统一构建的兼容入口，不持有第二份历史正文。不要建立平行编辑副本，也不要直接编辑dist。模块职责见[架构文档](../docs/ARCHITECTURE.md)。

## schema 2：时期、政权、人物与任期

作者入口指定 `schemaVersion: 2`。以下集合均为独立数组，即使为空也须列出；它们共用稳定 ID，而不是按显示姓名匹配。

| 集合 | 最小结构与约束 |
|---|---|
| periods | `id/name/start/end/polityIds/sourceIds/dating`；可选 `parentId`、`structure`、`color`。时期是阅读分组，不拥有政权，也不表示其内所有政权全程存续。政权须与时期相交；子时期须在父时期内，不许父级循环 |
| polities | `id/name/kind/start/end/sourceIds/dating`；可选 `interruptions`、`undated` 及旧国家显示字段。政权延续不因改帝号、专题切换或人物更替而自动复制 |
| people | `id/name/summary/sourceIds`；人物身份独立于任期；同名必须保留各自 ID，不按姓名猜测合并 |
| tenures | `id/polityId/personId/name/role/start/end/chronology/sourceIds/dating`；同一人物可以有多个任期；`personId` 必须明确给出，未知可为 `null`，非空时必须引用已收录人物。默认须在对应政权存续内；显式 `polityAssociation:contextual` 表示关联任职/执政阶段而非君主统治，可有窗口外端点但必须与政权相交并提供 `associationNote`，不进入同年君主查询 |
| events | `id/name/kind`、`year` 或 `yearRef`、`dating/sourceIds/narrative`；`kind` 限政治／战争／改革／外交／文化，兼容 `category` 别名，二者同给时须一致；可选 `endYear` 表示闭区间事件（起点不得晚于终点），缺省仍按旧点事件编译 |
| activities | `id/personId/polityId/sequence/kind/kindLabel/year` 或 `yearFromEvent:true`；来源和事件继承规则沿用 schema 1 |
| sources | `id/title/url`；URL 去重。样例的 `reviewStatus:pending` 表示书目待核，不是正文已证实 |

`chronology` 仍明确列出 `accession/regnalStart/abdication/death`，未核实节点为 `null`；通常 `regnalStart` 与条带 `start` 相等，实际承位可与其不同；正式 schema 2 也允许 `start === accession` 且 `regnalStart` 在任期内，分别展示实际承位与次年改元，不改写原始日期。schema 1 校验不放宽。`changes` 仍为 `{year,label}` 数组。`dating` 的可信度、校核状态、异说要求与 schema 1 相同。schema 2 的所有日期（含异说与变化节点）均使用下述对象格式。

关系表必须显式列出：

| 原生关系表 | 字段 |
|---|---|
| eventPolities | `eventId/polityId/kind:involved` |
| eventPeople | `eventId/personId/kind`、可选 `polityId`；participant 默认须引用该事件明确涉及的政权，并有来源和说明；显式 `affiliationScope:contextual` 与 `affiliationNote` 仅保留人物关联身份，不把该身份政权反推为参战方 |
| tenurePeople | `tenureId/personId/kind:associated/description/sourceIds`；这是任期关联人物，不代替任期本人的 `personId` |
| personPolities | `personId/polityId/kind/description/sourceIds`；活动类别沿用上表 |

事件 `yearRef` 使用 `{tenureId,field}`，仅能引用已明确维护的生涯节点；schema 1 继续使用 `{rulerId,field}`。仅因为某年在位，不可自动推断其参加该年事件。

### 日期、范围与投影

- 作者日期：`{era:'BCE'|'CE',year:正整数}`（JSON 中使用双引号）；无公元零年，不接受运行时负数或 schema 1 裸年份。
- 运行时：`timeEncoding:'bce-axis'`。BCE 年 `y` 原值保留；CE 年 `y` 转为 `1-y`。前1年为 `1`，公元1年为 `0`，公元2年为 `-1`。`0` 不是未知日期；判断已知年份须用 Time.isYear 或显式 null 判断。
- `timeline:{start,end,defaultEnd,cursor}` 是显式配置。schema 2 四个值均为作者日期，构建后均为运行时整数；`start >= defaultEnd >= end`，cursor 在总范围内。`topic` 等非日期元信息可选。
- `periods.start/end` 是分组范围；`polities.start/end` 是政权采用的存续事实；`tenures.start/end` 是任期采用范围。三者不得混为一条“朝代记录”。
- 周朝保留 `all/west/spring/war` 导航 ID；`post-zhou` 补足前255—221年延伸条带。`display:false` 不画条带、`button:false` 不生成按钮、`extendToViewEnd:true` 按当前终点定位，均只是 UI 提示。
- 政权在当前图外仍可有真实起讫，构建不裁切实体端点。周朝秦旧条带的前221年是诸侯阶段转制，卫的真实终点仍为前209年；说明保留在 `ending/endNote` 中。

[`compileAtlas`](../lib/atlas.mjs) 输出独立的 `periods/polities/tenures/people`，同时保留 `states`（内嵌 `rulers`）、`events`、`updated/version/sources`、`peopleCoverage/researchCoverage` 等旧 UI 投影。来源 ID 被水合为 `sources` 卡片，作者日期转为运行时坐标；`title` 来自 `metadata.title`，`metadata` 也保留。独立实体与旧投影不共享可变数组。

schema 1 规范化严格保持 `states -> polities`、`rulers -> tenures` 的原 ID 与原年份；`tenure.polityId` 来自原 `stateId`，没有可靠的显式 `personId` 就输出 `null`。不通过君主姓名生成新人物或合并既有人物，因此现有116个人物与465个任期数量不变。

### 稳定 ID 与生产迁移边界

同一政权或人物被多个时期、专题引用时应复用其实体 ID，只增引用或有证据的任期。不得因出现“帝国”专题复制一个秦政权或秦始皇人物。周朝与秦汉共用的政权和任期使用既有 `qin` 和已发布任期 ID，依据史料区分阶段显示范围与政权真实结局；生产原件和已发布身份按来源分别保留，不批量改写历史事实。

样例的 `ex3k-`、`exqh-` 前缀仅为独立文件的演示命名空间，**不是生产迁移 ID**。尤其不覆盖旧 `wei`（卫）、`jin`（晋）、`wu`（吴）、`han`（韩）、`liang`（魏）。三国的曹魏、孙吴与战国同名字政权必须按真实实体区别，不能按简称复用 ID。

## 采用口径与待考事项

- 前841年以前采用断代工程一系拟年，不能把其他克商锚点直接平移成完整逐王年表。
- 非子封秦、秦起点和非子条带采用约前890年的后出换算，保留约前900年旧说；受封年及非子条带终点仍不能作为确年。
- 马陵保留前342／341年及月份引文分歧；魏惠王称王、后元、五国相王的名单与年次仍须分别理解。
- 田齐校订年表与《史记》旧表分列；燕哙总区间、让国及齐破燕不混作同一节点。
- 实际即位与条带起点可以不同。人物活动、事件国家及参与者独立维护；未收录节点不等于历史不存在。

结构校验不能代替史实校勘。早期推定纪年、若干君主起讫与结局及未收录的生涯节点仍需逐条查证，正文中的手写年份也须核对。已有校核过程及证据取舍存于[操作历史](../docs/HISTORY.md)。

## 专题适配

[生产准备](../lib/production.mjs)先深复制原件，调用专题适配，再执行基础校验和编译。未知类别、其他重复边、非法日期或未登记的证据变化仍会失败。

| 模块 | 当前边界 |
|---|---|
| production-annotations | 魏晋、隋唐、宋辽金、明的明确枚举归一化，保留 sourceKind／sourceStructure 与 importNotes；明的重复事件政权边保留原 sourceEdges |
| expansion-annotations | 夏商、五代、元、清的明确类别适配；十组复合边保留全部 sourceEdges；夏商单个重复 URL 以 sourceUrl 留原值，技术 fragment 不声称原典锚点有效；契的身份仅为 contextual |
| 显示注解 | 编译后按明确 ID 添加短标签、视觉行，不更改历史身份与日期；详见[架构展示规则](../docs/ARCHITECTURE.md#专题展示规则) |

夏商十八条 dating 适配由完整原证据守卫，sourceDating 保留原标注；采用值的复述不算独立异说。复合事件的 yearFromEvent 活动只继承单锚点，不代表所有子阶段发生于该年。原始全局关系顺序由作者 JSON 保全，不能把技术数组顺序解释为历史先后。原件字节散列、入库过程与差异审计见 [HISTORY](../docs/HISTORY.md)。

## 传记维护与引用

总集变更后直接运行统一构建。lib/biography.mjs 在构建期校验和补充人物，src/core/biography.js 只处理当前专题的筛选与轨迹；公共脚本不携带总集。发布统计包含传记补充，原件自身数量由出处索引单独记录。

章节事件／政权默认属于本专题。跨专题引用明确给出 eventDatasetId／polityDatasetId，并须在目标专题存在。未单列事件使用 eventId:null 与 eventReference:{status:"unindexed",originalId,reason}，保留叙述但不伪造关系；错误或未声明的引用会阻止构建。章节日期不因主题关联自动替换为复合事件锚点。引用状态可查 [诊断文件](../dist/biography-diagnostics.json)。

## 链接与存储的时间约定

- 纯BCE分享沿用 v=1；时间字段包含0或负坐标时使用 v=2&time=bce-axis。未知版本或编码拒绝恢复。
- 新视图、阅读、访问和组合写入 timeEncoding:bce-axis；无编码旧记录只接受正BCE坐标，旧0或负值按缺失回退，不猜测为公元年份。
- 专题由 datasetId 隔离；带 dataset 标记的Hash仅在对应专题恢复。未带卷别的旧链接按当前专题解读，不作为跨专题引用。
- 跨屏阅读根据专题起点和已保存可见范围重算滚动位置，视窗边界可含小数；历史事实年份仍要求安全整数。
- 旧人名路由仅在姓名或别称唯一时迁移至稳定ID；未定年君主使用固定 legacyKeys，不按当前列表索引解读旧链接。
