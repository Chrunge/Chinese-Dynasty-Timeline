# 资料模型与维护约定

`atlas.json` 是唯一历史资料维护入口。“唯一”指编辑入口，不指只采用一种史料；不同原典、年表和异说分别列出。资料包含18行国家与王室、465个君主区间、80项未定位君主、116位独立人物、105条事件、62段活动及62项来源。

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

年份使用正整数表示公元前年份，越大的数越早；未知年份用 `null`，禁止用0或当前年份填充。区间起点须大于或等于终点。超出图示范围的真实结局可留在资料中。

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

## 采用口径与待考事项

- 前841年以前采用断代工程一系拟年，不能把其他克商锚点直接平移成完整逐王年表。
- 非子封秦、秦起点和非子条带采用约前890年的后出换算，保留约前900年旧说；受封年及非子条带终点仍不能作为确年。
- 马陵保留前342／341年及月份引文分歧；魏惠王称王、后元、五国相王的名单与年次仍须分别理解。
- 田齐校订年表与《史记》旧表分列；燕哙总区间、让国及齐破燕不混作同一节点。
- 实际即位与条带起点可以不同。人物活动、事件国家及参与者独立维护；未收录节点不等于历史不存在。

结构校验不能代替史实校勘。早期推定纪年、若干君主起讫与结局及未收录的生涯节点仍需逐条查证，正文中的手写年份也须核对。已有校核过程及证据取舍存于[操作历史](../docs/HISTORY.md)。
