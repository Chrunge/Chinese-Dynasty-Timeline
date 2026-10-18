# 资料模型与维护约定

`atlas.json` 是唯一历史资料维护入口。“唯一”指编辑入口，不指只采用一种史料；不同原典、年表和异说仍分别列出。该版本有18行国家与王室、465个君主区间、80项未定位君主、116位独立人物、105条事件、62段活动及62项来源。

| 集合 | 含义 | 主键及关系 |
|---|---|---|
| states | 国家存续、阶段中断、未定位君主 | 原有国家 ID；不内嵌有纪年的君主 |
| rulers | 一个在位区间，不等于整个人生 | 稳定 ruler ID，stateId 指向国家 |
| people | 独立人物简介、别称与出身 | 稳定 person ID，不以姓名作关系主键 |
| events | 单一历史事件与四段摘要 | 稳定 event ID；narrative.related 仅为主题关联 |
| activities | 人物活动阶段 | 稳定活动 ID，personId、stateId、可选 eventId |
| sources | 书目及查阅链接 | 稳定 source ID，按 URL 去重 |
| relations | 独立、明确维护的关联 | 只引用 ID；见下表 |

| 关系表 | 字段 | 含义与限制 |
|---|---|---|
| eventStates | eventId、stateId、kind=involved | 事件涉及国家；绝不从人物经历反向推算。未单列国家写在说明中 |
| eventPeople | eventId、personId、kind、可选 stateId | participant 为明确事件角色，须有国家、说明及来源；related 仅表示人物生平关联 |
| rulerPeople | rulerId、personId、kind=associated | 君臣或人物关联，不表示全在位区间任职，也不表示参加该君主期间的所有战争 |
| personStates | personId、stateId、kind | 简介明确提及、尚不能定位到具体活动阶段的独立关系 |

人物的浏览器 `states` 是上述人物关系与活动国家的去重投影，不是任职年表。事件国家仅从 `eventStates` 生成。活动种类分别记录任职、游说、流亡、出身、外交、教学、死亡等；`sequence` 是阅读顺序，不代表未经核实的绝对先后。

资料主键创建后不要随排序重排，也不要因改名而修改。国家、君主、事件沿用原 ID，人物在资料迁移中一次性分配 person-001 等 ID。姓名与别称只用于显示、检索。前端新路由和阅读记录使用 `person:person-xxx`；旧 `person:姓名` 在名称或别称唯一匹配时迁移。改名时将旧名保留为别称，可兼容尚未迁移的旧记录；同名不自动猜测匹配。

## 纪年与来源

年份使用正整数表示公元前年份，越大的数越早；未知年份用 `null`，禁止用0或当前年份填充。区间起点须大于或等于终点。超出图示范围的真实结局可留在资料中。

- `rulers.start/end`：采用的年表条带范围。`chronology.regnalStart` 与 start 一致；此字段兼容旧 UI 的“元年 / 图示起点”，不保证所有原典均采用这一元年口径。
- `chronology.accession/abdication/death`：分别为实际承位、退位或传位、去世。未核实保持 null，不从条带端点自动推导。改元、称王、称帝等另写在 changes 中。
- `events.year` 和 `events.yearRef` 二选一。明确对应已核实生涯节点的事件使用 `{rulerId, field}`，field 支持 accession、regnalStart、abdication、death。
- 活动 `year` 与 `yearFromEvent: true` 二选一。后者须有 eventId，自动继承事件年份、约年属性与纪年说明；仅“主题相关”的事件链接不强制继承日期。
- `dating.level`：certain / inferred / disputed，表示所采用纪年的可信度；不能由是否约年自动覆盖编辑判断。
- `dating.reviewStatus`：legacy 为沿用资料、未逐条复核；partial 为部分校核；reviewed 为本条纪年依据已核对。均不表示整个人生或该国全部历史已核验。
- disputed 须附有来源的 alternatives；新校核条目至少列两项。沿用的少数旧记录仅有一条综合校勘说明，暂保留并标记 legacy，后续须继续细化。
- alternatives.year 可为 null，表示争议在口径、名单或未能换算的年次，禁止为凑两种年份而编造数字。
- 所有出处只维护 `sources` 目录，正文与关系使用 `sourceIds`；旧君主底表链接使用单值 `sourceId`。eventStates 未单列来源时继承该事件来源，特殊关系可附 description/sourceIds。来源链接说明可供核查，不自动证明正文中所有换算年份。

## 构建边界

`lib/atlas.mjs` 只处理校验和数据投影，不读写文件，不修改输入，不共享人物国家与事件国家的可变数组。`sync-data.mjs` 是薄的文件读写入口。构建结果为 `dist/data.js`，供时间线、搜索、详情和导出共同读取。

运行 `node build.mjs --check`（或兼容入口 `node sync-data.mjs --check`）会校验主数据并比对全部生成物；任何落后于资料或前端源码的结果均报错。`node --test tests/*.test.mjs tests/*.test.cjs` 运行资料校验与交互逻辑回归；无需浏览器或第三方依赖。

旧 enrich 脚本仅转调统一构建，不再持有历史正文或覆盖主数据。原 history/people/research JSON 已移除，勿重新建立平行编辑副本。来源和历史文本的迁移可从 Git 前一版本追溯。

## 本次校核与后续界限

此前修复孟子事件的齐国误关联；五国相王补上魏的比较关系并明确名单争议；孔子出生补前551/552两说；晋悼公实际即位前573年与条带前572年分开，移除“前572年为唯一元年”的表述。

2026-10-18专项核对将非子封秦、秦国家起点及非子条带同步为约前890年的后出换算，避免与本图周孝王拟年冲突，保留约前900年旧说；移除共王简介中的错误事件归属。补清马陵、魏惠王后元、田齐与燕哙的具体口径及出处，魏惠王前344年称王仍为有争议的沿用节点。桂陵跨年双节点、五国相王、西周采用年表及已有世系保持。完整取舍、编号核对及原典链接见[专项校核记录](../docs/HISTORY_REVIEW_2026-10-18.md)。

仍需逐条校核的包括早期推定纪年、魏惠王称王年次、五国相王的年代与名单、若干齐燕君主的综合异说，以及未收录的生涯节点。代码校验能检查结构、引用和明确的日期约束，不能代替正文史实校勘。叙事中的手写年份也须随编辑人工核对。

资料迁移阶段仅拆出历史资料与关系层。后续第六版已将查询、搜索、状态、阅读校验、存储、导出分页及图页绘制拆开，见 [架构文档](../docs/ARCHITECTURE.md)。未引入后端或跨设备同步。
