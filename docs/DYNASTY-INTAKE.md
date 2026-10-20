# 四份 Schema 2 正式资料入库记录

## 边界与结论

- 2026-10-20 接收用户授权本地原件，未联网、未校勘史实、未改日期或实体 ID、未按姓名合并、未补造人物或关系。
- 原件目录：`C:\Users\Yui\Downloads\drive-download-20261020T103621Z-1-001\`；以下四份采用字节复制，不重新序列化。
- 直接校验原件均在首个不支持的活动类别处失败。仅通过独立技术投影兼容；基础校验器不修改。四份投影已通过 `validateAtlas` 和 `compileAtlas`。
- 此工作只写四份新数据、[注解模块](../lib/production-annotations.mjs)、[针对性测试](../tests/dynasty-intake.test.mjs)与本文档。不提交、不构建；页面、导航、生产接入及部署由 Lead 负责。

## 原件散列与计数

散列为整个文件字节的 SHA-256；计数顺序固定为政权 / 任期 / 人物 / 时期 / 事件 / 活动 / 来源。

| 本地原名 → 入库文件 | 字节数 | SHA-256 | 集合计数 |
|---|---:|---|---|
| 魏晋南北朝.json → [wei-jin-nan-bei.json](../data/wei-jin-nan-bei.json) | 346234 | `8370c8c485f318f750323dca1df2f1386925004edc06bbf442aba128aeb6bbef` | 28 / 99 / 140 / 5 / 21 / 19 / 86 |
| 隋唐.json → [sui-tang.json](../data/sui-tang.json) | 187345 | `5d6acd4b917f24ea2bc1da9aef93149580ae5a8b6b9eda1882bc76ceec94633c` | 10 / 36 / 67 / 6 / 16 / 17 / 48 |
| 辽金宋.json → [liao-jin-song.json](../data/liao-jin-song.json) | 213697 | `5e589da17934c7db2adc8ceadf61fb110d79820af3da1dda282071146ecac45e` | 8 / 58 / 97 / 5 / 12 / 10 / 37 |
| 明朝.json → [ming.json](../data/ming.json) | 143724 | `1e7b5bf0995d32e4cb46e79afe98a631a48782418f42c6958a8001ea86052b72` | 6 / 31 / 54 / 5 / 9 / 10 / 31 |

| 专题 | eventPolities | eventPeople | tenurePeople | personPolities |
|---|---:|---:|---:|---:|
| 魏晋南北朝 | 48 | 47 | 107 | 151 |
| 隋唐 | 29 | 42 | 51 | 79 |
| 辽金宋 | 30 | 52 | 77 | 100 |
| 明朝 | 21 | 33 | 47 | 56 |

明朝投影 `eventPolities` 为20条逻辑关联，原件21条与两条原边均保留；其余集合、逻辑关系数量不变。

## 函数契约与调用

```js
import {prepareAdditionalProduction} from './production-annotations.mjs';
// prepareProduction 已 structuredClone(input) 后：
return prepareAdditionalProduction(a, id);
```

`prepareAdditionalProduction(a, id)`：

- 输入为已 clone 的 Schema 2 对象；支持 `wei-jin-nan-bei`、`sui-tang`、`liao-jin-song`、`ming`。
- 对支持 ID 返回新的深复制投影，绝不修改传入的 `a`；无文件、网络、时钟或全局状态操作。重复调用结果深相等。
- 旧 ID 或未知 ID 直接返回同一个 `a`，确保周、秦汉、三国生产逻辑不变。
- 不是校验替代品；调用者仍须正常执行 `validateAtlas` / `compileAtlas`。未知类别、其他重复边、无效日期仍报错。
- 只对明确列出的词汇归一化。不按姓名、名称或猜测补链。无需添加 `contextual`：归一化后的全部 participant 均已有相同政权的事件关联，任期也均位于所属政权区间。
- `sourceKind` 保留类别原值；`sourceStructure` 保留时期结构原值；`metadata.importNotes` 附每次转换的集合、原始索引、实体 ID（有则）、原值、投影值与理由，并明确仅为技术投影、未重新校核。日期遍历会识别 `from/to` 为日期，因此注解使用 `originalKind/projectedKind` 等字段，不使用泛化的 `from/to`。

## 结构不兼容及完整处理

原件首错依次为：

- `未知活动类别：wj-act-duyu-01`
- `未知活动类别：st-act-gaojiong-01`
- `未知活动类别：sl-act-xiaochuo-01`
- `未知活动类别：ming-act-yuqian-01`

后续还涉及关系类别、事件类别、时期结构及明朝重复关联；不是单一活动类别问题。

现有活动/人物政权关系枚举为 `service, persuasion, death, activity, exile, travel, origin, birth, diplomacy, invitation, teaching, residence, resignation, accession, politics, founder`。现有事件类别为 `政治, 战争, 改革, 外交, 文化`，时期结构为 `coexistence, unified, transition, overview`。

下表为全部归一化数量（魏晋 / 隋唐 / 辽金宋 / 明）；未列词汇原样保留。

| 位置 | 原值 → 投影值 | 四卷数量 | 理由 |
|---|---|---|---|
| activities.kind | military → activity | 13 / 8 / 4 / 4 | 军事属于活动；不推造服役区间或具体官职 |
| activities.kind | culture → activity | 0 / 1 / 1 / 1 | 文化属于活动；不强行推作教学或旅行 |
| activities.kind | thought → activity | 0 / 0 / 1 / 1 | 思想活动归通用活动 |
| eventPolities.kind | founded → involved | 10 / 7 / 7 / 6 | 建立政权为事件涉及关系，原类型保留 |
| eventPolities.kind | ended → involved | 13 / 7 / 7 / 5 | 政权终结为事件涉及关系，原类型保留 |
| eventPeople.kind | leader → participant | 23 / 20 / 22 / 12 | 原记录的领导者属于参与者，描述保持不变 |
| eventPeople.kind | commander → participant | 12 / 10 / 14 / 10 | 原记录的统帅属于参与者，描述保持不变 |
| eventPeople.kind | victim → related | 2 / 3 / 6 / 3 | 受害者仅投影为相关人物，不推作主动参与 |
| tenurePeople.kind | holder → associated | 99 / 36 / 58 / 31 | 任职人属于任期关联人，任期及人物端点不变 |
| personPolities.kind | monarch → service | 98 / 33 / 59 / 30 | 仅技术任职关联；原资料也含执政、摄政、监国，不一律解为皇帝 |
| personPolities.kind | cultural → activity | 10 / 9 / 8 / 4 | 不推造任职 |
| personPolities.kind | royal → activity | 3 / 0 / 0 / 0 | 不推造官职或即位 |
| events.kind | 军事 → 战争 | 12 / 6 / 6 / 4 | UI类别同域归一化 |
| events.kind | 制度 → 政治 | 2 / 3 / 3 / 2 | 保守归政治，不能把所有制度创设强称改革 |
| events.kind | 思想 → 文化 | 0 / 0 / 0 / 1 | UI类别归一化，原标题与叙述不动 |
| periods.structure | dynasty → overview | 1 / 3 / 0 / 0 | 朝代视角并不意味着全时期大一统，不推作unified |

时期转换对象：`wj-period-western-jin`；`st-period-sui-unification`、`st-period-early-tang`、`st-period-wuzhou-kaiyuan`。注解记录总数分别为298、146、196、115（最后一项包含明朝重复边归一记录）。

### 明朝重复 pair：保留两阶段原边

原文件中 `ming-event-09-southern-ming-zheng-taiwan` 与 `southern-ming` 存在两条边，原类型依次是 `founded` 和 `ended`，基础校验会报告：

`重复关联：eventStates:ming-event-09-southern-ming-zheng-taiwan:southern-ming`

这是跨南明与明郑多个阶段的复合事件。仅该已知 pair 的两条、且原类型顺序准确匹配时，投影为单条 `kind: involved`，完整原边放入该边 `sourceEdges` 数组。不挑任一 subtype 充当唯一史实；不删除事件或人物/政权端点。若原边有来源则来源去重并集，说明按原顺序拼接。本次原两边仅有事件ID、政权ID、kind，无来源或说明字段可补。不处理任何其他重复 pair；测试明确要求仍抛错。

## 跨库共同 ID：差异与保留理由

以下是按同集合的显式 ID 比对，不是姓名匹配。保留每卷原有字段，不建立赢家版本；跨卷出处注册由 Lead 负责。差异字段表是结构差异清单，不表示联网判定哪卷正确。

### 与既有三国库：9个共同 ID，全部对象内容不同

旧卷为 [three-kingdoms.json](../data/three-kingdoms.json)，新卷为 [wei-jin-nan-bei.json](../data/wei-jin-nan-bei.json)。

| 集合 | ID | 不同顶层字段 |
|---|---|---|
| polities | western-jin | color, region, ending, note, sourceIds, dating |
| tenures | tk-tenure-sima-yan | chronology, dating |
| people | tk-person-sima-yan | summary |
| people | tk-person-yang-hu | role, summary |
| people | tk-person-du-yu | role, summary |
| sources | tk-source-jinshu-001 | note |
| sources | tk-source-jinshu-002 | note |
| sources | tk-source-jinshu-003 | note |
| sources | tk-source-jinshu-034 | note |

保留理由：原件明确复用跨期ID，但专题叙述、所选来源及展示颜色可以不同；同ID绝不意味着整条JSON可互相覆盖。`western-jin` 的政权起讫均265—316；`tk-tenure-sima-yan` 均265—290，基础即位/元年/死亡日期一致，但 `chronology.changes` 列表不同：旧卷列265、279、280，新卷列265、280且标签不同。羊祜角色原分别为“西晋征南大将军（巨平侯）”与“西晋征南大将军”；杜预角色原分别为“西晋镇南大将军（当阳侯）”与“西晋镇南大将军、经学家”。不能因称谓增删而自行补齐另一卷。四个来源ID标题与URL相同，note为专题用法说明，原样保留。

隋唐、辽金宋、明朝与既有三国没有同集合共享 ID。

### 魏晋南北朝与隋唐：11个共同 ID，全部对象内容不同

| 集合 | ID | 不同顶层字段 |
|---|---|---|
| polities | southern-chen | name, ending, note, sourceIds, dating |
| polities | sui | name, region, ending, note, sourceIds, dating |
| tenures | wj-tenure-chen-houzhu | chronology, dating |
| tenures | st-tenure-sui-wendi | chronology, dating |
| people | wj-person-chen-shubao | summary |
| people | st-person-yang-jian | summary, sourceIds |
| people | st-person-han-qinhu | role, summary |
| people | st-person-he-ruo-bi | summary |
| sources | wj-source-chenshu-06 | note |
| sources | st-source-suishu-01 | note |
| sources | st-source-suishu-52 | note |

保留理由同上：这是原件主动使用的同实体跨卷ID，不能用同名匹配扩张，也不能用某卷更详细的叙述覆盖另一卷。日期、关系、史源各自随专题保存。四份新卷其余两两组合无同集合共享ID；这不等于不存在同名异ID的人物，本任务不据姓名鉴定实体。

## 结构疑点、范围边界与未知项

1. 四份均有复合事件：一个定位年份容纳多个年份/多阶段叙述，全部56条活动均 `yearFromEvent: true`（19 / 17 / 10 / 10），所以活动图示年是关联事件锚点，不能视为文字里每一行为的精确年。例：`st-act-lishimin-01` 引用建唐复合事件，却叙述621年虎牢之战；`ming-act-zhuyuanzhang-01` 的1368年锚点同时叙述1380年废丞相。这是原资料口径，未拆事件、未补日期、未改关系。
2. 魏晋卷时间线265—589，但保留 `st-tenure-sui-wendi` 完整581—604任期。真实任期不可因当前专题589年边界裁短；其余新卷任期均在各自整体时间线内，事件锚点均在整体时间线内。明朝整体终点1683、默认终点1644是原件配置，不是遗漏南明明郑。
3. 四份全部58个事件的 `dating.level` 原为 `certain`（21 / 16 / 12 / 9）。这只是原件自述，技术入库不背书其史实、年代、标签或“reviewed”声明；禁止联网校验，未独立核实来源页面与引文。
4. 任期 `personId: null` 和政权 `undated` 记录均为0；不代表历史记录完整。来源可访问性、同名人物异ID是否本为一人、未收录统治者与关系的完整性、复合事件是否应拆分，全部保持未知，不补造。
5. 原件元数据提到五代十国、元朝、清朝共享ID，但这些卷不在本次获派四份和旧三国比对范围内，未因此新增关系或读入其史实进行校勘。
6. 不新增 `contextual`，不放宽任何基础校验。类别归一化本身不改变原有叙述、人物国家关系或人物/事件的定位日期。

## 验证

运行：`node --test tests/dynasty-intake.test.mjs`。

结果：12项通过，0失败。覆盖原字节散列/数量、输入不变、幂等、四卷完整校验编译、实体顺序不变、所有日期及描述可逆还原、关系原边可追溯、明朝两条边锁定、旧ID identity no-op、未知活动类别/其他重复边/零年仍被基础校验拒绝，以及三国共享ID不覆盖。未执行构建或提交。
