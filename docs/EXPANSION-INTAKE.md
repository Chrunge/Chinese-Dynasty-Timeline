# 夏商、五代十国、元、清：离线原件入库记录

## 权限与真实性边界

- 输入仅为用户授权的本地四份 schema 2 文件。**本次未联网、未作史实核验；本入库委派未运行构建、未提交。** 这里的构建/提交范围仅指本委派，不代表 Lead 后续集成、构建与部署的产品状态。入库成功/结构校验成功不等于史实正确。
- 原件目录：`C:\Users\Yui\Downloads\drive-download-20261020T103621Z-1-001\`；对应夏商、五代十国、元朝、清朝四份 JSON。下表正式数据均逐字节复制，原文件未改。
- 原作者的 `reviewed`、元信息“校核”、日期准确度及来源说明一律视为原作者主张，**不是本次复核结论**。不承诺原链接可达、内容准确、章节匹配、王表完整或年代方案权威。
- 入库写入仅四份正式数据、[独立结构投影](<../lib/expansion-annotations.mjs>)、[测试](<../tests/expansion-intake.test.mjs>)及本文档；未修改基础校验器或旧四卷投影。生产调用已在[生产入口](<../lib/production.mjs>)接通，构建与发布只由人工执行。

## 原字节与计数

计数依次为政权 / 任期 / 人物 / 时期 / 事件 / 活动 / 来源。关系计数为 eventPolities / eventPeople / tenurePeople / personPolities。

| 数据 | 原件 | 字节 | SHA-256 | 集合计数 | 原关系计数 |
|---|---|---:|---|---|---|
| [夏商](<../data/xia-shang.json>) | [夏商.json](<C:/Users/Yui/Downloads/drive-download-20261020T103621Z-1-001/夏商.json>) | 179704 | `496c80210607fcb70fbbaaa3aa38bd360f1ebfa26dd3938f9578ab9dac2ebfdb` | 6 / 53 / 67 / 5 / 13 / 10 / 14 | 25 / 44 / 66 / 69 |
| [五代十国](<../data/five-dynasties.json>) | [五代十国.json](<C:/Users/Yui/Downloads/drive-download-20261020T103621Z-1-001/五代十国.json>) | 182004 | `943aa7f457f3cab0df171ff4b20be74c89798aa74ead5408b4b8abe35bd492d6` | 17 / 59 / 69 / 5 / 7 / 10 / 25 | 36 / 29 / 68 / 74 |
| [元](<../data/yuan.json>) | [元朝.json](<C:/Users/Yui/Downloads/drive-download-20261020T103621Z-1-001/元朝.json>) | 124499 | `10f88ae6bc41956afa746e9cd6db85494e06e747415245561965fcec71422d37` | 11 / 25 / 39 / 5 / 8 / 10 / 21 | 24 / 31 / 38 / 42 |
| [清](<../data/qing.json>) | [清朝.json](<C:/Users/Yui/Downloads/drive-download-20261020T103621Z-1-001/清朝.json>) | 123589 | `78067278fb6b4adfb7b73b70f9766556a065cb22822e75b10a6e4aac53ea6661` | 7 / 19 / 39 / 5 / 9 / 10 / 23 | 22 / 36 / 38 / 43 |

## 函数契约与适配项

```js
import {prepareExpansionProduction} from './lib/expansion-annotations.mjs';
const prepared = prepareExpansionProduction(alreadyClonedSchema2, datasetId);
// 必须继续 validateAtlas(prepared)；不替代基础校验。
```

- 支持 `xia-shang`、`five-dynasties`、`yuan`、`qing`。支持 ID 返回新深副本；不修改输入，纯函数、无 I/O、确定性、幂等；旧/未知 ID 按对象身份原样返回。
- 输入须为完整 schema 2 对象；不承诺修复损坏输入。技术记录位于 `metadata.importNotes`，码为 `expansion-production-v1`。
- 保留所有原实体 ID、日期、叙述、引用和关系端点，不按姓名或 URL 合并实体。改动仅生产投影；以 `sourceKind`、`sourceStructure`、`sourceDating`、`sourceEdges`、`sourceUrl` 保留原值，可反向还原全部原声明。

| 集合 | 原枚举→显示兼容枚举 | 理由/保留 |
|---|---|---|
| activities | military/culture→activity | 通用活动，不推造服役/教学。原 kindLabel/label/text 不动；**politics/diplomacy 原生支持，原样保留** |
| events | 军事→战争，制度→政治 | 不把全部制度事项强作改革；保留 sourceKind |
| eventPolities | founded/ended→involved | 原建设/终结细类另存 sourceKind |
| eventPeople | leader/commander→participant；victim→related | 不推造受害者主动参与；原说明不动 |
| tenurePeople | holder→associated | 持有人归关联人物，任期/身份不变 |
| personPolities | monarch→service；cultural→activity | 任职关联不等于皇帝；文化不推造官职 |
| periods | 元 `yuan-period-mid-yuan-reforms-coups` dynasty→overview | 朝代视角全览，不推断全时期统一；保留 sourceStructure |

### 复合事件重复边：只处理十个确知 pair

基础校验禁止同一 eventId/polityId 重复。以下各 pair 在原文中恰有按顺序 `founded`、`ended` 两条，投影成一条 `involved`；**两条原边完整保留在 sourceEdges**，不是删除原始关系，不拆分复合事件，也不选择其中一种史实。若 pair/数量/原kind模式改变，则不套用此处理，基础校验继续报错。

| 卷 | eventId | polityId |
|---|---|---|
| 夏商 | xs-event-03-taikang-loss-shaokang-restoration | youqiong-han |
| 五代 | wd-event-04-yanyun-later-jin-khitan | later-jin |
| 五代 | wd-event-06-later-han-zhou-chai-rong | later-han |
| 元 | yuan-event-08-red-turban-ming-conquer-dadu | tianwan-xu |
| 元 | yuan-event-08-red-turban-ming-conquer-dadu | zhang-zhou |
| 元 | yuan-event-08-red-turban-ming-conquer-dadu | red-turban-song |
| 元 | yuan-event-08-red-turban-ming-conquer-dadu | chen-han |
| 清 | qing-event-02-shanhaiguan-conquest | dashun |
| 清 | qing-event-03-kangxi-sanfan-taiwan-nerchinsk | wu-zhou |
| 清 | qing-event-07-taiping-second-opium-war-xinyou | taiping |

投影 eventPolities 数量分别为 24 / 34 / 20 / 19，其余关系表数量不变。全部原边通过 sourceEdges 仍可回溯，其他重复 pair 仍不兼容。sourceEdges 保留 pair 内原边顺序，但不承诺投影数组直接 flatMap 后的全局顺序与原数组相同：例如五代 later-jin 两条原边并非相邻。原始全局关系顺序由逐字节保留的正式数据保全；投影保证关系声明多重集不丢失，不将数组重排解释为历史先后。

### 夏商唯一来源 URL 重复

`xs-source-shangshu-pangeng` 的《尚书·商书》（汤誓、盘庚、高宗肜日、西伯戡黎、微子）与 `xs-source-shangshu-mushi` 的《尚书·周书·牧誓》（附洪范）原 URL 都是 `https://zh.wikisource.org/wiki/尚書`，基础校验不允许重复 URL。

仅后一原 ID 的已知原 URL 投影附加 `#atlas-source-xs-source-shangshu-mushi`，原 URL 保留 `sourceUrl`，并加 `urlProjectionNote`。**该 fragment 只是原 ID 派生的本地去重技术标识，不是原典真实章节锚点，不承诺网页存在或精确跳章，未联网验证。** 不改网页 path、不改标题/原 note/reviewStatus、不删来源，不改任何 sourceIds。其他重复 URL 不自动修复。

### 夏商契的身份关联

唯一原边 `xs-event-01-yu-flood-founding-xia` → `xs-person-xie-shang` 原 kind=participant、polityId=shang、description=“佐禹治水受封于商”，但事件的政权表未列商。仅该已知原人物/事件/身份/说明/来源组合加 `affiliationScope='contextual'` 及原因；不据此把约前1600年起的商王朝列为约前2070年治水复合事件的参政政权，不补造 eventPolities，不改两端 ID 或说明。

### 夏商十八条争议纪年结构欠缺

基础校验要求 disputed+reviewed 至少两项 alternatives；夏商 18 条不满足，其中 4 条只有一项、14 条零项。本次不虚构第二观点，不降级 disputed 为 certain/inferred，不改原日期，不声称完成史学多口径校核。

Lead 明确批准的可逆投影：**严格限定十八个原 ID 以及完整原 dating、原采用 start/year、原 sourceIds 的静态精确证据**。原 dating 完整存 sourceDating；仅 reviewStatus 改为 legacy；已有一项保持完全不动；零项时仅将原采用的 start/year、原 reason、原 sourceIds 复述成一项，label 固定“原作者采用口径（非新增独立异说）”。这只是旧资料继承的技术字段折衷，**仍欠缺独立异说，未重新校核**。不增加日期/观点/来源，不把采用口径包装为新的独立年代学方案。未知新 ID 或原证据改动不自动补项，继续由基础校验失败。

下表自动列明十八 ID 及改前后项数。

## 跨卷实体策略与未知项

- 对照此前七卷的全部同集合显式 ID，完成 4×7=28 组比较。周卷 schema 1 的 states/rulers 仅在审计时映射为 polities/tenures；原卷不改。只比较显式 ID，不按姓名补造匹配。
- **两个同 ID、明确不同实体**：五代 `later-liang` 后梁907—923 vs 魏晋后凉386—403；清 `wu-zhou` 吴周1673—1681 vs 隋唐武周690—705。必须采用 datasetId+collection+id 隔离，不得全局ID去重或误标同一对象。原 ID 依授权不改。
- 夏商 `zhou` 前1150—1046 vs 周卷前1046—256；`zhou-r0` 前1050—1046 vs 周卷前1046—1043，原文主张阶段接续，并非同一显示区间。元 `ming` 1356—1368 vs 明卷1368—1644 等专题裁剪差异，均原样保留、不延长、不补齐、不拼接。
- 共享人物/任期存在称谓、叙述和范围差异，逐字段差异详列下方；未见除上述两处外可从本地明确确认的异实体同ID。此结论仅基于原文对比，不为共享ID身份做外部史实背书。
- 多个同 source ID 的 URL 相同但标题覆盖卷数不同（如辽史卷一至二 vs 一至四；宋史卷一至三 vs 一至五；元史卷一 vs 一至三），不合并标题、不宣称入口页面完整覆盖所列全部卷。审计将原 title/url/note/reviewStatus 全部差异保留。
- 四卷全部 40 条活动均 yearFromEvent；复合事件横跨多年但只有单锚点，活动继承的只是原事件锚点，不代表该人的全部行动均发生该年。未拆事件或补造更细日期。
- 夏商315个原日期对象均BCE（含异说）；其他三卷分别362/174/134个原日期对象均CE。原BCE对象以及所有异说日期不改，无零年推造。
- 夏商原77条dating为20 disputed/reviewed、57 inferred/reviewed；五代88、元49、清40条均certain/reviewed。全部是原作者标签；仅上述18项显式legacy技术继承，其他原reviewed不改，不代表本次核验。
- 仍未知：年代方案可靠性与精度、原作者各项“校核”的依据是否充分、来源链接是否可达/对应、人物与王表覆盖完整性、同名异ID是否同人、复合事件各子阶段真实日期、原文内部叙述矛盾（如武乙原reason同时列拟年及另备年方案）应如何裁定。全部不擅自修史，不新增实体/日期/关系。

## 离线验收

```sh
node --test tests/expansion-intake.test.mjs
```

15项测试通过：四卷SHA/字节/计数、纯函数/幂等/原输入不变、原记录/原声明回溯、十对复合边、十八条严格guard与原争议级别/原异说保留、单URL例外、契contextual、原生diplomacy不改、未知枚举/未知重复/未知纪年不兼容与零年仍拒绝、28组跨卷ID不合并。本委派仅做离线资料校验，未运行构建/部署验收；不代表 Lead 后续集成构建和部署状态。

## 十八条 dating 逐ID原项数→投影项数

| 集合 | ID | alternatives 原→投影 |
|---|---|---|
| polities | xia | 1 → 1 |
| polities | shang | 1 → 1 |
| tenures | xs-tenure-xia-01-yu | 0 → 1 |
| tenures | xs-tenure-xia-17-jie | 0 → 1 |
| tenures | xs-tenure-shang-01-tang | 0 → 1 |
| tenures | xs-tenure-shang-19-pangeng | 0 → 1 |
| tenures | xs-tenure-shang-22-wuding | 0 → 1 |
| tenures | xs-tenure-shang-27-wuyi | 1 → 1 |
| tenures | xs-tenure-shang-28-wending | 0 → 1 |
| tenures | xs-tenure-shang-29-diyi | 0 → 1 |
| tenures | xs-tenure-shang-30-dixin | 0 → 1 |
| tenures | zhou-r0 | 0 → 1 |
| periods | xs-period-late-shang-yin | 1 → 1 |
| events | xs-event-01-yu-flood-founding-xia | 0 → 1 |
| events | xs-event-05-mingtiao-tang-founding-shang | 0 → 1 |
| events | xs-event-08-pangeng-move-to-yin | 0 → 1 |
| events | xs-event-09-wuding-fuhao-golden-age | 0 → 1 |
| events | xs-event-11-zhou-danfu-jili-rise | 0 → 1 |

## 与既有七卷的28组审计计数

计数按政权/任期/人物/时期/事件/活动/来源；0也明确列出。同ID匹配按每一对卷分别计数，总计67条配对记录（不等于67个去重实体）。

| 新卷 | 既有卷 | 各集合匹配计数 | 合计 |
|---|---|---|---:|
| xia-shang | zhou | 1 / 1 / 3 / 0 / 0 / 0 / 5 | 10 |
| xia-shang | qin-han | 0 / 0 / 0 / 0 / 0 / 0 / 1 | 1 |
| xia-shang | three-kingdoms | 0 / 0 / 0 / 0 / 0 / 0 / 0 | 0 |
| xia-shang | wei-jin-nan-bei | 0 / 0 / 0 / 0 / 0 / 0 / 0 | 0 |
| xia-shang | sui-tang | 0 / 0 / 0 / 0 / 0 / 0 / 0 | 0 |
| xia-shang | liao-jin-song | 0 / 0 / 0 / 0 / 0 / 0 / 0 | 0 |
| xia-shang | ming | 0 / 0 / 0 / 0 / 0 / 0 / 0 | 0 |
| five-dynasties | zhou | 0 / 0 / 0 / 0 / 0 / 0 / 0 | 0 |
| five-dynasties | qin-han | 0 / 0 / 0 / 0 / 0 / 0 / 0 | 0 |
| five-dynasties | three-kingdoms | 0 / 0 / 0 / 0 / 0 / 0 / 0 | 0 |
| five-dynasties | wei-jin-nan-bei | 1 / 0 / 0 / 0 / 0 / 0 / 0 | 1 |
| five-dynasties | sui-tang | 0 / 0 / 1 / 0 / 0 / 0 / 1 | 2 |
| five-dynasties | liao-jin-song | 2 / 4 / 4 / 0 / 0 / 0 / 2 | 12 |
| five-dynasties | ming | 0 / 0 / 0 / 0 / 0 / 0 / 0 | 0 |
| yuan | zhou | 0 / 0 / 0 / 0 / 0 / 0 / 0 | 0 |
| yuan | qin-han | 0 / 0 / 0 / 0 / 0 / 0 / 0 | 0 |
| yuan | three-kingdoms | 0 / 0 / 0 / 0 / 0 / 0 / 0 | 0 |
| yuan | wei-jin-nan-bei | 0 / 0 / 0 / 0 / 0 / 0 / 0 | 0 |
| yuan | sui-tang | 0 / 0 / 0 / 0 / 0 / 0 / 0 | 0 |
| yuan | liao-jin-song | 5 / 4 / 6 / 0 / 0 / 0 / 2 | 17 |
| yuan | ming | 1 / 0 / 3 / 0 / 0 / 0 / 2 | 6 |
| qing | zhou | 0 / 0 / 0 / 0 / 0 / 0 / 0 | 0 |
| qing | qin-han | 0 / 0 / 0 / 0 / 0 / 0 / 0 | 0 |
| qing | three-kingdoms | 0 / 0 / 0 / 0 / 0 / 0 / 0 | 0 |
| qing | wei-jin-nan-bei | 0 / 0 / 0 / 0 / 0 / 0 / 0 | 0 |
| qing | sui-tang | 1 / 0 / 0 / 0 / 0 / 0 / 0 | 1 |
| qing | liao-jin-song | 0 / 0 / 0 / 0 / 0 / 0 / 0 | 0 |
| qing | ming | 4 / 5 / 6 / 0 / 0 / 0 / 2 | 17 |

### 全部67条配对记录的完整顶层字段差异

以下JSON仅记录原文比较，不推断同一身份；`{absent:true}`表示对应原对象没有该字段。顶层字段的完整值同时列出（嵌套日期/简介/来源数组未省略）；空differences表示内容相同。若同source ID原URL相同仍保留其标题/note/覆盖差异，不合并。

```json
[
  {
    "topic": "xia-shang",
    "previousTopic": "zhou",
    "collection": "polities",
    "id": "zhou",
    "differentFields": [
      "name",
      "kind",
      "start",
      "end",
      "color",
      "region",
      "ending",
      "note",
      "sourceIds",
      "dating",
      "approxStart",
      "approxEnd",
      "undated",
      "interruptions"
    ],
    "differences": {
      "name": {
        "xia-shang": "周（岐周方邦至西周王朝）",
        "zhou": "周王室"
      },
      "kind": {
        "xia-shang": "empire",
        "zhou": {
          "absent": true
        }
      },
      "start": {
        "xia-shang": {
          "era": "BCE",
          "year": 1150
        },
        "zhou": 1046
      },
      "end": {
        "xia-shang": {
          "era": "BCE",
          "year": 1046
        },
        "zhou": 256
      },
      "color": {
        "xia-shang": "#64796d",
        "zhou": "#a58444"
      },
      "region": {
        "xia-shang": "豳（今陕西旬邑） / 周原岐山（今陕西岐山、扶风） / 丰镐（今陕西西安长安区）",
        "zhou": "王畿 · 洛邑"
      },
      "ending": {
        "xia-shang": "前1046年正月牧野之战克商，由商之西方方伯正式跃升为西周天下共主（完整周代谱系接续周朝库 zhou）",
        "zhou": "王室终结；东西周小国另有延续"
      },
      "note": {
        "xia-shang": "复用周代库政权ID（zhou）。姬姓，始祖后稷，公刘迁豳，商武乙时期古公亶父（周太王）率族迁于岐山周原筑城建邦；经季历开拓、周文王姬昌“三分天下有其二”营建丰京，至前1046年周武王姬发牧野克商建立周朝。",
        "zhou": "前841年以前采用夏商周断代工程一系的拟定纪年，均标为约年。共和为行政时期，不作为一位君主。周敬王元年及周考王同年即位等存在口径差异。"
      },
      "sourceIds": {
        "xia-shang": [
          "source-010",
          "source-005",
          "xs-source-shangshu-mushi"
        ],
        "zhou": {
          "absent": true
        }
      },
      "dating": {
        "xia-shang": {
          "level": "inferred",
          "reviewStatus": "reviewed",
          "reason": "本卷收录周自古公亶父迁岐（约前1150年）至前1046年牧野克商建周阶段；前1046—前256年完整三十七王谱系无缝接续周代库（atlas.json）。",
          "alternatives": []
        },
        "zhou": {
          "level": "inferred",
          "reason": "前841年以前采用夏商周断代工程一系的拟定纪年，均标为约年。共和为行政时期，不作为一位君主。周敬王元年及周考王同年即位等存在口径差异。",
          "alternatives": [],
          "reviewStatus": "legacy"
        }
      },
      "approxStart": {
        "xia-shang": {
          "absent": true
        },
        "zhou": true
      },
      "approxEnd": {
        "xia-shang": {
          "absent": true
        },
        "zhou": false
      },
      "undated": {
        "xia-shang": {
          "absent": true
        },
        "zhou": []
      },
      "interruptions": {
        "xia-shang": {
          "absent": true
        },
        "zhou": []
      }
    }
  },
  {
    "topic": "xia-shang",
    "previousTopic": "zhou",
    "collection": "tenures",
    "id": "zhou-r0",
    "differentFields": [
      "polityId",
      "personId",
      "name",
      "role",
      "start",
      "end",
      "sourceIds",
      "chronology",
      "dating",
      "person",
      "approx",
      "lane",
      "sourceId",
      "note",
      "description",
      "exit",
      "biography",
      "stateId"
    ],
    "differences": {
      "polityId": {
        "xia-shang": "zhou",
        "zhou": {
          "absent": true
        }
      },
      "personId": {
        "xia-shang": "xs-person-ji-fa",
        "zhou": {
          "absent": true
        }
      },
      "name": {
        "xia-shang": "周武王姬发",
        "zhou": "周武王"
      },
      "role": {
        "xia-shang": "周王/天子",
        "zhou": "周天子"
      },
      "start": {
        "xia-shang": {
          "era": "BCE",
          "year": 1050
        },
        "zhou": 1046
      },
      "end": {
        "xia-shang": {
          "era": "BCE",
          "year": 1046
        },
        "zhou": 1043
      },
      "sourceIds": {
        "xia-shang": [
          "source-010",
          "source-005",
          "xs-source-shangshu-mushi"
        ],
        "zhou": {
          "absent": true
        }
      },
      "chronology": {
        "xia-shang": {
          "accession": {
            "era": "BCE",
            "year": 1050
          },
          "regnalStart": {
            "era": "BCE",
            "year": 1046
          },
          "abdication": null,
          "death": null,
          "changes": []
        },
        "zhou": {
          "accession": null,
          "regnalStart": 1046,
          "abdication": null,
          "death": null,
          "changes": [],
          "endKind": "在位区间结束；具体性质待核实",
          "sourceIds": [
            "source-005"
          ]
        }
      },
      "dating": {
        "xia-shang": {
          "level": "disputed",
          "reviewStatus": "reviewed",
          "reason": "复用周代库在位ID（zhou-r0）。前1050年嗣西伯位，前1048年盟津观兵，前1046年正月牧野克商建立西周王朝（周代库接续前1046—前1043年周天子任期）。",
          "alternatives": []
        },
        "zhou": {
          "level": "inferred",
          "reason": "采用约年、传统推定或年表拟定值，不能据此认定确切日期。",
          "alternatives": [],
          "reviewStatus": "legacy"
        }
      },
      "person": {
        "xia-shang": {
          "absent": true
        },
        "zhou": ""
      },
      "approx": {
        "xia-shang": {
          "absent": true
        },
        "zhou": true
      },
      "lane": {
        "xia-shang": {
          "absent": true
        },
        "zhou": 0
      },
      "sourceId": {
        "xia-shang": {
          "absent": true
        },
        "zhou": "source-005"
      },
      "note": {
        "xia-shang": {
          "absent": true
        },
        "zhou": ""
      },
      "description": {
        "xia-shang": {
          "absent": true
        },
        "zhou": ""
      },
      "exit": {
        "xia-shang": {
          "absent": true
        },
        "zhou": "在位终点按所列年表；退位、被废、遇害或去世的具体原因尚未逐条校勘。"
      },
      "biography": {
        "xia-shang": {
          "absent": true
        },
        "zhou": {
          "summary": "周文王之子，继承周的军事与政治基础，在牧野击败商军，建立周王朝。胜利后分封诸侯，早逝后由成王继位，王室治理进入周公辅政阶段。",
          "detailLevel": "生平简介",
          "sourceIds": [
            "source-010"
          ],
          "note": "依据所列史传整理；传闻、异说及现代换算纪年不视作无争议事实。"
        }
      },
      "stateId": {
        "xia-shang": {
          "absent": true
        },
        "zhou": "zhou"
      }
    }
  },
  {
    "topic": "xia-shang",
    "previousTopic": "zhou",
    "collection": "people",
    "id": "person-003",
    "differentFields": [
      "name",
      "role",
      "summary",
      "sourceIds"
    ],
    "differences": {
      "name": {
        "xia-shang": "姜尚（吕尚 / 太公望 / 齐太公）",
        "zhou": "姜尚"
      },
      "role": {
        "xia-shang": "周太师、齐国始封君",
        "zhou": "军事与政治辅臣"
      },
      "summary": {
        "xia-shang": "复用周代库人物ID（person-003）。姜姓吕氏，钓于渭水遇周文王尊为“太公望”，辅佐武王筹划伐商，牧野之战率百夫冲阵克殷，受封于齐（营丘）。",
        "zhou": "亦称太公望、吕尚，辅佐周武王伐商，后受封齐。早期事迹中的传说成分与可考历史须区分。"
      },
      "sourceIds": {
        "xia-shang": [
          "source-021",
          "source-010"
        ],
        "zhou": [
          "source-021"
        ]
      }
    }
  },
  {
    "topic": "xia-shang",
    "previousTopic": "zhou",
    "collection": "people",
    "id": "person-001",
    "differentFields": [
      "name",
      "role",
      "summary"
    ],
    "differences": {
      "name": {
        "xia-shang": "周公旦（姬旦）",
        "zhou": "周公旦"
      },
      "role": {
        "xia-shang": "西周王室辅政者",
        "zhou": "王室辅政者"
      },
      "summary": {
        "xia-shang": "复用周代库人物ID（person-001）。周文王第四子、武王同母弟，参与制定伐纣方略，牧野之战秉旄麾师，成王初年摄政东征平定武庚与三监之乱，制礼作乐。",
        "zhou": "周武王之弟，武王去世后辅佐成王，参与平定东方叛乱及制度建设。摄政传说和礼制归属应结合不同文献阅读。"
      }
    }
  },
  {
    "topic": "xia-shang",
    "previousTopic": "zhou",
    "collection": "people",
    "id": "person-002",
    "differentFields": [
      "name",
      "role",
      "summary"
    ],
    "differences": {
      "name": {
        "xia-shang": "召公奭（姬奭）",
        "zhou": "召公奭"
      },
      "role": {
        "xia-shang": "西周太保、王室重臣",
        "zhou": "王室重臣"
      },
      "summary": {
        "xia-shang": "复用周代库人物ID（person-002）。周宗室重臣，佐武王牧野克商，后封于北燕，与周公旦分陕而治。",
        "zhou": "周初重臣，参与王室治理与分封。传世文献将其与周公并举，其后裔成为燕国统治家族。"
      }
    }
  },
  {
    "topic": "xia-shang",
    "previousTopic": "zhou",
    "collection": "sources",
    "id": "source-010",
    "differentFields": [
      "title",
      "reviewStatus",
      "note"
    ],
    "differences": {
      "title": {
        "xia-shang": "《史记》卷四 · 周本纪",
        "zhou": "《史记》·周本纪"
      },
      "reviewStatus": {
        "xia-shang": "reviewed",
        "zhou": {
          "absent": true
        }
      },
      "note": {
        "xia-shang": "复用周代库史源ID（source-010）：后稷、公刘、古公亶父迁岐、季历、周文王姬昌三分天下有其二及周武王姬发牧野克商史源。",
        "zhou": {
          "absent": true
        }
      }
    }
  },
  {
    "topic": "xia-shang",
    "previousTopic": "zhou",
    "collection": "sources",
    "id": "source-021",
    "differentFields": [
      "title",
      "reviewStatus",
      "note"
    ],
    "differences": {
      "title": {
        "xia-shang": "《史记》卷三十二 · 齐太公世家",
        "zhou": "《史记》·齐太公世家"
      },
      "reviewStatus": {
        "xia-shang": "reviewed",
        "zhou": {
          "absent": true
        }
      },
      "note": {
        "xia-shang": "复用周代库史源ID（source-021）：姜尚（太公望）渭水遇文王、辅佐武王鹰扬牧野及受封于齐史源。",
        "zhou": {
          "absent": true
        }
      }
    }
  },
  {
    "topic": "xia-shang",
    "previousTopic": "zhou",
    "collection": "sources",
    "id": "source-040",
    "differentFields": [
      "title",
      "reviewStatus",
      "note"
    ],
    "differences": {
      "title": {
        "xia-shang": "《史记》卷三十六 · 陈杞世家",
        "zhou": "《史记》·陈杞世家"
      },
      "reviewStatus": {
        "xia-shang": "reviewed",
        "zhou": {
          "absent": true
        }
      },
      "note": {
        "xia-shang": "复用周代库史源ID（source-040）：周武王克商后求禹之后得东楼公封于杞，奉夏后氏之祀史源。",
        "zhou": {
          "absent": true
        }
      }
    }
  },
  {
    "topic": "xia-shang",
    "previousTopic": "zhou",
    "collection": "sources",
    "id": "source-037",
    "differentFields": [
      "title",
      "reviewStatus",
      "note"
    ],
    "differences": {
      "title": {
        "xia-shang": "《史记》卷三十八 · 宋微子世家",
        "zhou": "《史记》·宋微子世家"
      },
      "reviewStatus": {
        "xia-shang": "reviewed",
        "zhou": {
          "absent": true
        }
      },
      "note": {
        "xia-shang": "复用周代库史源ID（source-037）：微子启、箕子、比干“殷末三仁”、箕子陈《洪范》及微子封宋奉殷祀史源。",
        "zhou": {
          "absent": true
        }
      }
    }
  },
  {
    "topic": "xia-shang",
    "previousTopic": "zhou",
    "collection": "sources",
    "id": "source-005",
    "differentFields": [
      "title",
      "reviewStatus",
      "note"
    ],
    "differences": {
      "title": {
        "xia-shang": "Zhou dynasty · Kings（夏商周断代工程与西周纪年对照）",
        "zhou": "Zhou dynasty · Kings（含西周不同纪年方案）"
      },
      "reviewStatus": {
        "xia-shang": "reviewed",
        "zhou": {
          "absent": true
        }
      },
      "note": {
        "xia-shang": "复用周代库史源ID（source-005）：用于前1046年武王克商断代工程拟年与传统前1122年、竹书前1027年异说对照。",
        "zhou": {
          "absent": true
        }
      }
    }
  },
  {
    "topic": "xia-shang",
    "previousTopic": "qin-han",
    "collection": "sources",
    "id": "source-005",
    "differentFields": [
      "title",
      "note"
    ],
    "differences": {
      "title": {
        "xia-shang": "Zhou dynasty · Kings（夏商周断代工程与西周纪年对照）",
        "qin-han": "Zhou dynasty · Kings（西周断代工程拟年参照）"
      },
      "note": {
        "xia-shang": "复用周代库史源ID（source-005）：用于前1046年武王克商断代工程拟年与传统前1122年、竹书前1027年异说对照。",
        "qin-han": "用于秦非子受封年代与周孝王拟年对照。"
      }
    }
  },
  {
    "topic": "five-dynasties",
    "previousTopic": "wei-jin-nan-bei",
    "collection": "polities",
    "id": "later-liang",
    "differentFields": [
      "name",
      "kind",
      "start",
      "end",
      "color",
      "region",
      "ending",
      "note",
      "sourceIds",
      "dating"
    ],
    "differences": {
      "name": {
        "five-dynasties": "后梁",
        "wei-jin-nan-bei": "后凉"
      },
      "kind": {
        "five-dynasties": "empire",
        "wei-jin-nan-bei": "state"
      },
      "start": {
        "five-dynasties": {
          "era": "CE",
          "year": 907
        },
        "wei-jin-nan-bei": {
          "era": "CE",
          "year": 386
        }
      },
      "end": {
        "five-dynasties": {
          "era": "CE",
          "year": 923
        },
        "wei-jin-nan-bei": {
          "era": "CE",
          "year": 403
        }
      },
      "color": {
        "five-dynasties": "#7a5240",
        "wei-jin-nan-bei": "#876f56"
      },
      "region": {
        "five-dynasties": "开封（东都） / 洛阳（西都）",
        "wei-jin-nan-bei": "姑臧（今甘肃武威）"
      },
      "ending": {
        "five-dynasties": "龙德三年（923年）十月后唐庄宗李存勖攻破开封，末帝朱友贞自杀",
        "wei-jin-nan-bei": "403年八月末主吕隆受南凉、北凉交逼，献姑臧归降后秦姚兴"
      },
      "note": {
        "five-dynasties": "朱温代唐建立五代第一朝，传三主（太祖朱温、郢王朱友珪、末帝朱友贞）十七年，与河东晋王李克用、李存勖父子长期血战，923年亡于后唐。",
        "wei-jin-nan-bei": "氐族大将吕光奉苻坚命平定西域龟兹，携鸠摩罗什东归凉州，闻苻坚遇害后于386年建元太安割据河西（396年称天王），403年降于后秦。"
      },
      "sourceIds": {
        "five-dynasties": [
          "wd-source-jwds-1",
          "wd-source-xwds-01"
        ],
        "wei-jin-nan-bei": [
          "wj-source-jinshu-122"
        ]
      },
      "dating": {
        "five-dynasties": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "开平元年（907年）四月朱温称帝，至923年十月亡于后唐。",
          "alternatives": []
        },
        "wei-jin-nan-bei": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "386年十月吕光称酒泉公建元太安，403年八月吕隆降后秦。",
          "alternatives": []
        }
      }
    }
  },
  {
    "topic": "five-dynasties",
    "previousTopic": "sui-tang",
    "collection": "people",
    "id": "st-person-zhu-wen",
    "differentFields": [
      "name",
      "role",
      "summary",
      "sourceIds"
    ],
    "differences": {
      "name": {
        "five-dynasties": "朱温（后梁太祖朱晃）",
        "sui-tang": "朱温（朱全忠 / 后梁太祖）"
      },
      "role": {
        "five-dynasties": "后梁开国皇帝",
        "sui-tang": "宣武军节度使、梁王、后梁开国皇帝"
      },
      "summary": {
        "five-dynasties": "复用隋唐库人物ID（st-person-zhu-wen）。原黄巢部将，882年降唐赐名全忠，封梁王；907年四月废唐哀帝于汴州称帝建后梁（907—912年在位），与晋王李克用、李存勖长期争霸，912年六月被子朱友珪所弑。",
        "sui-tang": "原黄巢起义军大将，882年降唐赐名全忠，任宣武军节度使据汴州，先后吞并中原诸镇、诛灭宦官、胁迫唐昭宗迁洛，905年制造“白马驿之祸”屠杀清流朝臣，907年四月废唐哀帝建立后梁，开启五代十国时代。"
      },
      "sourceIds": {
        "five-dynasties": [
          "st-source-jts-20",
          "wd-source-jwds-1",
          "wd-source-xwds-01"
        ],
        "sui-tang": [
          "st-source-jts-20",
          "st-source-jts-200b"
        ]
      }
    }
  },
  {
    "topic": "five-dynasties",
    "previousTopic": "sui-tang",
    "collection": "sources",
    "id": "st-source-jts-20",
    "differentFields": [
      "title",
      "note"
    ],
    "differences": {
      "title": {
        "five-dynasties": "《旧唐书》卷二十上、卷二十下 · 昭宗本纪、哀帝本纪",
        "sui-tang": "《旧唐书》卷二十上、卷二十下 · 昭宗本纪、哀帝本纪（李晔、李柷）"
      },
      "note": {
        "five-dynasties": "复用隋唐库史源ID：907年朱温代唐建后梁史源。",
        "sui-tang": "唐昭宗与唐哀帝在位，朱温控制朝政、905年白马驿之祸及907年四月朱温代唐建后梁史源。"
      }
    }
  },
  {
    "topic": "five-dynasties",
    "previousTopic": "liao-jin-song",
    "collection": "polities",
    "id": "liao",
    "differentFields": [
      "name",
      "end",
      "region",
      "ending",
      "note",
      "sourceIds",
      "dating"
    ],
    "differences": {
      "name": {
        "five-dynasties": "契丹 / 辽朝",
        "liao-jin-song": "辽朝（契丹）"
      },
      "end": {
        "five-dynasties": {
          "era": "CE",
          "year": 979
        },
        "liao-jin-song": {
          "era": "CE",
          "year": 1125
        }
      },
      "region": {
        "five-dynasties": "上京临潢府 / 南京析津府（幽州）",
        "liao-jin-song": "上京临潢府（巴林左旗） / 中京大定府 / 南京析津府（北京） / 西京大同府"
      },
      "ending": {
        "five-dynasties": "跨期政权（完整存续907—1125年，接续辽金宋专卷 liao）",
        "liao-jin-song": "保大五年（1125年）二月金将完颜娄室于应州俘辽天祚帝耶律延禧，辽亡"
      },
      "note": {
        "five-dynasties": "跨期共用政权ID（liao）。907年耶律阿保机任契丹可汗，936年耶律德光助石敬瑭灭后唐获燕云十六州，947年灭后晋入汴京改国号大辽，册封并支援北汉对抗后周与北宋。",
        "liao-jin-song": "耶律阿保机于907年任契丹可汗、916年称帝，传九帝二百一十九年；936年获燕云十六州，947年改号大辽；实行“以国制治契丹，以汉制待汉人”的南北面官制与四时捺钵制，1004年与北宋订立澶渊之盟，1125年为金朝所灭。"
      },
      "sourceIds": {
        "five-dynasties": [
          "sl-source-liaoshi-01"
        ],
        "liao-jin-song": [
          "sl-source-liaoshi-01",
          "sl-source-liaoshi-03",
          "sl-source-liaoshi-10",
          "sl-source-liaoshi-18"
        ]
      },
      "dating": {
        "five-dynasties": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "本卷呈现907—979年契丹/辽与五代十国互动阶段，完整辽朝接续 song-liao-jin.json。",
          "alternatives": []
        },
        "liao-jin-song": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "907年阿保机即可汗位，至1125年二月天祚帝被金军俘获。",
          "alternatives": []
        }
      }
    }
  },
  {
    "topic": "five-dynasties",
    "previousTopic": "liao-jin-song",
    "collection": "polities",
    "id": "northern-song",
    "differentFields": [
      "name",
      "end",
      "region",
      "ending",
      "note",
      "sourceIds",
      "dating"
    ],
    "differences": {
      "name": {
        "five-dynasties": "北宋（削平十国阶段）",
        "liao-jin-song": "北宋"
      },
      "end": {
        "five-dynasties": {
          "era": "CE",
          "year": 979
        },
        "liao-jin-song": {
          "era": "CE",
          "year": 1127
        }
      },
      "region": {
        "five-dynasties": "东京开封府",
        "liao-jin-song": "东京开封府 / 西京河南府（洛阳） / 南京应天府（商丘） / 北京大名府"
      },
      "ending": {
        "five-dynasties": "跨期政权（完整存续960—1127年，接续辽金宋专卷 northern-song）",
        "liao-jin-song": "靖康二年（1127年）三月金军攻陷开封，掳宋徽宗、钦宗北迁，北宋亡"
      },
      "note": {
        "five-dynasties": "跨期共用政权ID（northern-song）。960年赵匡胤陈桥兵变代后周建宋，与宋太宗赵光义依“先南后北”方略于963—979年间依次平定荆南、后蜀、南汉、南唐、吴越与北汉，终结五代十国分裂。",
        "liao-jin-song": "960年赵匡胤陈桥兵变建宋，传九帝一百六十八年；以文官集权体制消除藩镇割据，削平十国；商品经济（交子纸币、汴京坊市合一）、活字印刷、指南针、火药、宋词与理学空前繁荣，1127年亡于靖康之变。"
      },
      "sourceIds": {
        "five-dynasties": [
          "sl-source-songshi-001"
        ],
        "liao-jin-song": [
          "sl-source-songshi-001",
          "sl-source-songshi-009",
          "sl-source-songshi-014",
          "sl-source-songshi-019"
        ]
      },
      "dating": {
        "five-dynasties": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "本卷呈现960—979年北宋统一十国阶段，完整两宋接续 song-liao-jin.json。",
          "alternatives": []
        },
        "liao-jin-song": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "建隆元年（960年）正月赵匡胤称帝，至靖康二年（1127年）三月徽钦被俘。",
          "alternatives": []
        }
      }
    }
  },
  {
    "topic": "five-dynasties",
    "previousTopic": "liao-jin-song",
    "collection": "tenures",
    "id": "sl-tenure-liao-taizu",
    "differentFields": [
      "dating"
    ],
    "differences": {
      "dating": {
        "five-dynasties": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "跨期共用在位ID（sl-tenure-liao-taizu）。907年任可汗，916年称帝，926年崩。",
          "alternatives": []
        },
        "liao-jin-song": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "907年任契丹可汗，916年称帝，926年七月崩。",
          "alternatives": []
        }
      }
    }
  },
  {
    "topic": "five-dynasties",
    "previousTopic": "liao-jin-song",
    "collection": "tenures",
    "id": "sl-tenure-liao-taizong",
    "differentFields": [
      "sourceIds",
      "dating"
    ],
    "differences": {
      "sourceIds": {
        "five-dynasties": [
          "sl-source-liaoshi-01"
        ],
        "liao-jin-song": [
          "sl-source-liaoshi-03"
        ]
      },
      "dating": {
        "five-dynasties": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "跨期共用在位ID（sl-tenure-liao-taizong）。936年获燕云十六州，947年灭后晋改国号大辽，同年四月崩。",
          "alternatives": []
        },
        "liao-jin-song": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "926年即位，936年获燕云十六州，947年改号大辽，同年四月崩。",
          "alternatives": []
        }
      }
    }
  },
  {
    "topic": "five-dynasties",
    "previousTopic": "liao-jin-song",
    "collection": "tenures",
    "id": "sl-tenure-nsong-taizu",
    "differentFields": [
      "dating"
    ],
    "differences": {
      "dating": {
        "five-dynasties": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "跨期共用在位ID（sl-tenure-nsong-taizu）。960年陈桥兵变建宋，平荆湖、后蜀、南汉、南唐，976年十月崩。",
          "alternatives": []
        },
        "liao-jin-song": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "建隆元年（960年）正月陈桥兵变称帝，开宝九年（976年）十月崩。",
          "alternatives": []
        }
      }
    }
  },
  {
    "topic": "five-dynasties",
    "previousTopic": "liao-jin-song",
    "collection": "tenures",
    "id": "sl-tenure-nsong-taizong",
    "differentFields": [
      "name",
      "end",
      "sourceIds",
      "chronology",
      "dating"
    ],
    "differences": {
      "name": {
        "five-dynasties": "宋太宗赵光义（平北汉段）",
        "liao-jin-song": "宋太宗赵光义"
      },
      "end": {
        "five-dynasties": {
          "era": "CE",
          "year": 979
        },
        "liao-jin-song": {
          "era": "CE",
          "year": 997
        }
      },
      "sourceIds": {
        "five-dynasties": [
          "sl-source-songshi-001"
        ],
        "liao-jin-song": [
          "sl-source-songshi-004"
        ]
      },
      "chronology": {
        "five-dynasties": {
          "accession": {
            "era": "CE",
            "year": 976
          },
          "regnalStart": {
            "era": "CE",
            "year": 976
          },
          "abdication": null,
          "death": null,
          "changes": []
        },
        "liao-jin-song": {
          "accession": {
            "era": "CE",
            "year": 976
          },
          "regnalStart": {
            "era": "CE",
            "year": 976
          },
          "abdication": null,
          "death": {
            "era": "CE",
            "year": 997
          },
          "changes": []
        }
      },
      "dating": {
        "five-dynasties": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "跨期共用在位ID（sl-tenure-nsong-taizong）。978年受吴越纳土，979年五月灭北汉终结十国（完整任期至997年接续辽金宋专卷）。",
          "alternatives": []
        },
        "liao-jin-song": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "太平兴国元年（976年）十月即位，至道三年（997年）三月崩。",
          "alternatives": []
        }
      }
    }
  },
  {
    "topic": "five-dynasties",
    "previousTopic": "liao-jin-song",
    "collection": "people",
    "id": "sl-person-yelv-abaoji",
    "differentFields": [
      "role",
      "summary"
    ],
    "differences": {
      "role": {
        "five-dynasties": "契丹（辽朝）开国皇帝",
        "liao-jin-song": "辽朝（契丹）开国皇帝"
      },
      "summary": {
        "five-dynasties": "跨期共用人物ID（sl-person-yelv-abaoji）。907年任契丹可汗，916年称帝建元神册，926年灭渤海国。",
        "liao-jin-song": "907年任契丹可汗统一八部，916年称帝建元神册（907—926年在位），建皇都上京、创契丹大字、926年灭渤海国设东丹国。"
      }
    }
  },
  {
    "topic": "five-dynasties",
    "previousTopic": "liao-jin-song",
    "collection": "people",
    "id": "sl-person-yelv-deguang",
    "differentFields": [
      "role",
      "summary",
      "sourceIds"
    ],
    "differences": {
      "role": {
        "five-dynasties": "契丹（辽朝）第二任皇帝",
        "liao-jin-song": "辽朝第二任皇帝"
      },
      "summary": {
        "five-dynasties": "跨期共用人物ID（sl-person-yelv-deguang）。926—947年在位，936年助石敬瑭灭后唐获燕云十六州，947年灭后晋入汴京改国号为大辽。",
        "liao-jin-song": "926—947年在位，936年助石敬瑭灭后唐获燕云十六州，947年灭后晋入汴京改国号为大辽，确立“以国制治契丹，以汉制待汉人”的南北面官制。"
      },
      "sourceIds": {
        "five-dynasties": [
          "sl-source-liaoshi-01"
        ],
        "liao-jin-song": [
          "sl-source-liaoshi-03"
        ]
      }
    }
  },
  {
    "topic": "five-dynasties",
    "previousTopic": "liao-jin-song",
    "collection": "people",
    "id": "sl-person-zhao-kuangyin",
    "differentFields": [
      "role",
      "summary"
    ],
    "differences": {
      "role": {
        "five-dynasties": "北宋开国皇帝",
        "liao-jin-song": "宋朝开国皇帝"
      },
      "summary": {
        "five-dynasties": "跨期共用人物ID（sl-person-zhao-kuangyin）。960年陈桥兵变代后周建宋，963—975年先后平定荆南、湖南、后蜀、南汉、南唐。",
        "liao-jin-song": "原后周殿前都点检，960年正月发动陈桥兵变代后周建北宋（960—976年在位），通过“杯酒释兵权”与文臣知州、通判、转运使制度根除藩镇割据，平定荆湖、后蜀、南汉、南唐。"
      }
    }
  },
  {
    "topic": "five-dynasties",
    "previousTopic": "liao-jin-song",
    "collection": "people",
    "id": "sl-person-zhao-guangyi",
    "differentFields": [
      "name",
      "summary",
      "sourceIds"
    ],
    "differences": {
      "name": {
        "five-dynasties": "赵光义（宋太宗）",
        "liao-jin-song": "赵光义（宋太宗赵炅）"
      },
      "summary": {
        "five-dynasties": "跨期共用人物ID（sl-person-zhao-guangyi）。976年即位，978年受漳泉与吴越纳土，979年五月攻克太原灭北汉，彻底终结五代十国分裂。",
        "liao-jin-song": "赵匡胤之弟，976—997年在位，受吴越纳土、979年灭北汉完成统一，扩大科举取士、编纂《太平御览》《太平广记》《文苑英华》，979年高梁河与986年雍熙北伐两败于辽。"
      },
      "sourceIds": {
        "five-dynasties": [
          "sl-source-songshi-001"
        ],
        "liao-jin-song": [
          "sl-source-songshi-004"
        ]
      }
    }
  },
  {
    "topic": "five-dynasties",
    "previousTopic": "liao-jin-song",
    "collection": "sources",
    "id": "sl-source-liaoshi-01",
    "differentFields": [
      "title",
      "note"
    ],
    "differences": {
      "title": {
        "five-dynasties": "《辽史》卷一至卷四 · 太祖本纪（耶律阿保机）、太宗本纪（耶律德光）",
        "liao-jin-song": "《辽史》卷一至卷二 · 太祖本纪（耶律阿保机）"
      },
      "note": {
        "five-dynasties": "跨期共用史源ID：契丹耶律阿保机建国、耶律德光受燕云十六州与947年灭后晋改号大辽史源。",
        "liao-jin-song": "907年耶律阿保机任契丹可汗、916年称帝、创契丹大字、926年灭渤海国史源。"
      }
    }
  },
  {
    "topic": "five-dynasties",
    "previousTopic": "liao-jin-song",
    "collection": "sources",
    "id": "sl-source-songshi-001",
    "differentFields": [
      "title",
      "note"
    ],
    "differences": {
      "title": {
        "five-dynasties": "《宋史》卷一至卷五 · 太祖本纪（赵匡胤）、太宗本纪（赵光义）",
        "liao-jin-song": "《宋史》卷一至卷三 · 太祖本纪（赵匡胤）"
      },
      "note": {
        "five-dynasties": "跨期共用史源ID：960年陈桥兵变代周建宋及963—979年平定荆南、后蜀、南汉、南唐、吴越、北汉史源。",
        "liao-jin-song": "960年陈桥兵变建北宋、杯酒释兵权及削平南方诸国史源。"
      }
    }
  },
  {
    "topic": "yuan",
    "previousTopic": "liao-jin-song",
    "collection": "polities",
    "id": "mongol-yuan",
    "differentFields": [
      "name",
      "end",
      "region",
      "ending",
      "note",
      "sourceIds",
      "dating"
    ],
    "differences": {
      "name": {
        "yuan": "大蒙古国 / 元朝",
        "liao-jin-song": "大蒙古国 / 元朝（灭夏灭金平宋阶段）"
      },
      "end": {
        "yuan": {
          "era": "CE",
          "year": 1368
        },
        "liao-jin-song": {
          "era": "CE",
          "year": 1279
        }
      },
      "region": {
        "yuan": "哈拉和林 / 上都开平府（正蓝旗） / 大都（北京）",
        "liao-jin-song": "哈拉和林 / 上都（开平） / 大都（北京）"
      },
      "ending": {
        "yuan": "至正二十八年（1368年）八月明军徐达攻克大都，元顺帝北走上都（退居漠北延续为北元）",
        "liao-jin-song": "跨期政权（1279年完成全国统一，完整1206—1368年谱系接续元朝专卷 yuan.json）"
      },
      "note": {
        "yuan": "跨期共用政权ID（mongol-yuan）。1206年铁木真建大蒙古国，历四汗二监国称制，1260年忽必烈即位，1271年取《易经》“大哉乾元”改国号大元，1279年灭南宋完成全国大一统；创行省制度，将西藏（宣政院）、云南、台湾澎湖纳入中央直接行政管辖，元曲、农学与天文历法臻于极盛。",
        "liao-jin-song": "跨期共用政权ID（mongol-yuan）。1206年铁木真称成吉思汗，1218年灭西辽、1227年灭西夏、1234年联宋灭金、1253年灭大理；1271年忽必烈定国号大元，1279年灭南宋统一全国。"
      },
      "sourceIds": {
        "yuan": [
          "ymq-source-yuanshi-001",
          "ymq-source-yuanshi-004",
          "ymq-source-yuanshi-038",
          "ymq-source-yuanshi-058"
        ],
        "liao-jin-song": [
          "ymq-source-yuanshi-001",
          "ymq-source-yuanshi-004"
        ]
      },
      "dating": {
        "yuan": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "1206年铁木真称成吉思汗，1271年定国号大元，至1368年八月明军克大都。",
          "alternatives": []
        },
        "liao-jin-song": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "本卷呈现1206—1279年蒙元与夏金宋并立及统一阶段，完整元朝谱系见 yuan.json。",
          "alternatives": []
        }
      }
    }
  },
  {
    "topic": "yuan",
    "previousTopic": "liao-jin-song",
    "collection": "polities",
    "id": "western-xia",
    "differentFields": [
      "name",
      "start",
      "region",
      "ending",
      "note",
      "sourceIds",
      "dating"
    ],
    "differences": {
      "name": {
        "yuan": "西夏（亡于蒙古阶段）",
        "liao-jin-song": "西夏（大白高国）"
      },
      "start": {
        "yuan": {
          "era": "CE",
          "year": 1206
        },
        "liao-jin-song": {
          "era": "CE",
          "year": 982
        }
      },
      "region": {
        "yuan": "中兴府（银川）",
        "liao-jin-song": "夏州 / 兴庆府（中兴府，今宁夏银川）"
      },
      "ending": {
        "yuan": "1227年六月成吉思汗蒙古大军攻灭西夏",
        "liao-jin-song": "宝义二年（1227年）六月蒙古大军围困中兴府，夏末帝李睍出降被杀，西夏亡"
      },
      "note": {
        "yuan": "跨期共用政权ID（western-xia，完整谱系见辽金宋专卷 song-liao-jin.json）。1205—1227年间遭受蒙古六次征讨，1227年六月末帝李睍出降被杀。",
        "liao-jin-song": "党项拓跋氏李继迁于982年抗宋自立，经李德明开拓河西，1038年十月李元昊正式称大夏皇帝，传十帝一百九十年（自982年计246年）；创西夏文、颁《天盛律令》，周旋于宋、辽、金之间，1227年亡于蒙古。"
      },
      "sourceIds": {
        "yuan": [
          "ymq-source-yuanshi-001"
        ],
        "liao-jin-song": [
          "sl-source-songshi-485",
          "ymq-source-yuanshi-001"
        ]
      },
      "dating": {
        "yuan": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "本卷呈现1206—1227年蒙夏战争至西夏灭亡阶段。",
          "alternatives": []
        },
        "liao-jin-song": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "982年李继迁起兵抗宋，1038年李元昊称帝，至1227年六月李睍降蒙。",
          "alternatives": []
        }
      }
    }
  },
  {
    "topic": "yuan",
    "previousTopic": "liao-jin-song",
    "collection": "polities",
    "id": "jin-jurchen",
    "differentFields": [
      "name",
      "start",
      "region",
      "ending",
      "note",
      "sourceIds",
      "dating"
    ],
    "differences": {
      "name": {
        "yuan": "金朝（蒙金战争阶段）",
        "liao-jin-song": "金朝"
      },
      "start": {
        "yuan": {
          "era": "CE",
          "year": 1206
        },
        "liao-jin-song": {
          "era": "CE",
          "year": 1115
        }
      },
      "region": {
        "yuan": "中都（北京） / 南京汴京（开封） / 蔡州",
        "liao-jin-song": "上京会宁府（阿城） / 中都大兴府（北京，1153年迁都） / 南京开封府（1214年南迁）"
      },
      "ending": {
        "yuan": "天兴三年（1234年）正月窝阔台汗与南宋联军攻破蔡州，金亡",
        "liao-jin-song": "天兴三年（1234年）正月蒙宋联军攻破蔡州，金哀宗自缢、末帝完颜承麟战死"
      },
      "note": {
        "yuan": "跨期共用政权ID（jin-jurchen，完整谱系见辽金宋专卷 song-liao-jin.json）。1211年野狐岭惨败，1214年南迁汴京，1232年三峰山主力覆没，1234年正月亡于蔡州。",
        "liao-jin-song": "女真完颜阿骨打于1115年建大金国，传十帝一百二十年；以猛安谋克制度于1125年灭辽、1127年灭北宋，与南宋划淮水大散关对峙；海陵王迁都北京，世宗章宗开创大定明昌之治，1234年于蔡州亡于蒙宋联军。"
      },
      "sourceIds": {
        "yuan": [
          "ymq-source-yuanshi-001",
          "ymq-source-yuanshi-002"
        ],
        "liao-jin-song": [
          "sl-source-jinshi-02",
          "sl-source-jinshi-03",
          "sl-source-jinshi-06",
          "sl-source-jinshi-13"
        ]
      },
      "dating": {
        "yuan": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "本卷呈现1206—1234年蒙金战争至金朝灭亡阶段。",
          "alternatives": []
        },
        "liao-jin-song": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "收国元年（1115年）正月阿骨打称帝，至1234年正月蔡州陷落。",
          "alternatives": []
        }
      }
    }
  },
  {
    "topic": "yuan",
    "previousTopic": "liao-jin-song",
    "collection": "polities",
    "id": "dali",
    "differentFields": [
      "name",
      "start",
      "region",
      "ending",
      "note",
      "sourceIds",
      "dating"
    ],
    "differences": {
      "name": {
        "yuan": "大理国（忽必烈平大理阶段）",
        "liao-jin-song": "大理国"
      },
      "start": {
        "yuan": {
          "era": "CE",
          "year": 1206
        },
        "liao-jin-song": {
          "era": "CE",
          "year": 937
        }
      },
      "region": {
        "yuan": "羊苴咩城（云南大理）",
        "liao-jin-song": "羊苴咩城（今云南大理）"
      },
      "ending": {
        "yuan": "1253年十二月忽必烈、兀良哈台革囊渡江攻克大理城",
        "liao-jin-song": "1253年十二月蒙古忽必烈、兀良哈台攻克大理城，俘末帝段兴智"
      },
      "note": {
        "yuan": "跨期共用政权ID（dali，见辽金宋专卷）。1253年底忽必烈灭大理，后设云南行省。",
        "liao-jin-song": "白族段思平于937年建国，传二十二帝三百一十七年（中间1094—1096年高升泰建大中国，后段正淳复国称后理），崇尚佛教、向两宋通贡互市供战马，1253年底为忽必烈所灭。"
      },
      "sourceIds": {
        "yuan": [
          "ymq-source-yuanshi-003",
          "ymq-source-yuanshi-004"
        ],
        "liao-jin-song": [
          "sl-source-songshi-488",
          "ymq-source-yuanshi-004"
        ]
      },
      "dating": {
        "yuan": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "本卷呈现大理国晚期至1253年并入蒙元阶段。",
          "alternatives": []
        },
        "liao-jin-song": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "937年段思平立国，至1253年十二月忽必烈克大理城。",
          "alternatives": []
        }
      }
    }
  },
  {
    "topic": "yuan",
    "previousTopic": "liao-jin-song",
    "collection": "polities",
    "id": "southern-song",
    "differentFields": [
      "name",
      "start",
      "region",
      "ending",
      "note",
      "sourceIds",
      "dating"
    ],
    "differences": {
      "name": {
        "yuan": "南宋（宋蒙战争阶段）",
        "liao-jin-song": "南宋"
      },
      "start": {
        "yuan": {
          "era": "CE",
          "year": 1206
        },
        "liao-jin-song": {
          "era": "CE",
          "year": 1127
        }
      },
      "region": {
        "yuan": "临安府（杭州） / 崖山",
        "liao-jin-song": "南京应天府（商丘） / 行在临安府（杭州） / 福州（福安） / 崖山（新会）"
      },
      "ending": {
        "yuan": "1279年二月崖山海战元军张弘范击败宋军，陆秀夫负幼帝赵昺投海，南宋亡",
        "liao-jin-song": "祥兴二年（1279年）二月崖山海战兵败，左丞相陆秀夫负幼帝赵昺投海殉国"
      },
      "note": {
        "yuan": "跨期共用政权ID（southern-song，完整谱系见辽金宋专卷 song-liao-jin.json）。1234—1279年独立抗击蒙元四十五年，经钓鱼城、襄樊、临安、崖山四阶段覆亡。",
        "liao-jin-song": "1127年五月康王赵构于应天府即位建立南宋，传九帝一百五十三年（两宋合十八帝319年）；岳飞、韩世忠抗金保住江南半壁，海上丝绸之路与程朱理学极盛，后期独立抵抗蒙元大军四十五年，1279年亡于崖山。"
      },
      "sourceIds": {
        "yuan": [
          "ymq-source-yuanshi-003",
          "ymq-source-yuanshi-004",
          "ymq-source-yuanshi-127"
        ],
        "liao-jin-song": [
          "sl-source-songshi-024",
          "sl-source-songshi-033",
          "sl-source-songshi-041",
          "sl-source-songshi-418"
        ]
      },
      "dating": {
        "yuan": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "本卷呈现南宋晚期抗蒙至1279年崖山灭亡阶段。",
          "alternatives": []
        },
        "liao-jin-song": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "建炎元年（1127年）五月赵构即位，至祥兴二年（1279年）二月崖山殉国。",
          "alternatives": []
        }
      }
    }
  },
  {
    "topic": "yuan",
    "previousTopic": "liao-jin-song",
    "collection": "tenures",
    "id": "ymq-tenure-temujin",
    "differentFields": [
      "name",
      "dating"
    ],
    "differences": {
      "name": {
        "yuan": "元太祖成吉思汗铁木真",
        "liao-jin-song": "大蒙古国成吉思汗铁木真"
      },
      "dating": {
        "yuan": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "1206年于斡难河源即大汗位，1227年七月崩于六盘山。",
          "alternatives": []
        },
        "liao-jin-song": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "跨期共用在位ID（ymq-tenure-temujin）。1206年即大汗位，1227年七月崩。",
          "alternatives": []
        }
      }
    }
  },
  {
    "topic": "yuan",
    "previousTopic": "liao-jin-song",
    "collection": "tenures",
    "id": "ymq-tenure-ogedei",
    "differentFields": [
      "name",
      "sourceIds",
      "dating"
    ],
    "differences": {
      "name": {
        "yuan": "元太宗窝阔台汗",
        "liao-jin-song": "大蒙古国窝阔台汗"
      },
      "sourceIds": {
        "yuan": [
          "ymq-source-yuanshi-002"
        ],
        "liao-jin-song": [
          "ymq-source-yuanshi-001"
        ]
      },
      "dating": {
        "yuan": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "1229年八月即大汗位，1234年灭金，1241年十一月崩。",
          "alternatives": []
        },
        "liao-jin-song": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "跨期共用在位ID（ymq-tenure-ogedei）。1229年即位，1234年联宋灭金，1241年崩。",
          "alternatives": []
        }
      }
    }
  },
  {
    "topic": "yuan",
    "previousTopic": "liao-jin-song",
    "collection": "tenures",
    "id": "ymq-tenure-mongke",
    "differentFields": [
      "name",
      "sourceIds",
      "dating"
    ],
    "differences": {
      "name": {
        "yuan": "元宪宗蒙哥汗",
        "liao-jin-song": "大蒙古国蒙哥汗"
      },
      "sourceIds": {
        "yuan": [
          "ymq-source-yuanshi-003"
        ],
        "liao-jin-song": [
          "ymq-source-yuanshi-001"
        ]
      },
      "dating": {
        "yuan": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "1251年六月即大汗位，1259年七月崩于合州钓鱼城下。",
          "alternatives": []
        },
        "liao-jin-song": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "跨期共用在位ID（ymq-tenure-mongke）。1251年即位，1259年七月死于合州钓鱼城下。",
          "alternatives": []
        }
      }
    }
  },
  {
    "topic": "yuan",
    "previousTopic": "liao-jin-song",
    "collection": "tenures",
    "id": "ymq-tenure-kublai",
    "differentFields": [
      "name",
      "end",
      "chronology",
      "dating"
    ],
    "differences": {
      "name": {
        "yuan": "元世祖薛禅汗忽必烈",
        "liao-jin-song": "元世祖忽必烈（灭宋统一段）"
      },
      "end": {
        "yuan": {
          "era": "CE",
          "year": 1294
        },
        "liao-jin-song": {
          "era": "CE",
          "year": 1279
        }
      },
      "chronology": {
        "yuan": {
          "accession": {
            "era": "CE",
            "year": 1260
          },
          "regnalStart": {
            "era": "CE",
            "year": 1260
          },
          "abdication": null,
          "death": {
            "era": "CE",
            "year": 1294
          },
          "changes": []
        },
        "liao-jin-song": {
          "accession": {
            "era": "CE",
            "year": 1260
          },
          "regnalStart": {
            "era": "CE",
            "year": 1260
          },
          "abdication": null,
          "death": null,
          "changes": []
        }
      },
      "dating": {
        "yuan": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "中统元年（1260年）三月于开平即位，至元八年（1271年）十一月定国号大元，1279年灭南宋，至元三十一年（1294年）正月崩。",
          "alternatives": []
        },
        "liao-jin-song": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "跨期共用在位ID（ymq-tenure-kublai）。1260年即位，1271年建国号大元，1279年灭南宋（完整任期至1294年见 yuan.json）。",
          "alternatives": []
        }
      }
    }
  },
  {
    "topic": "yuan",
    "previousTopic": "liao-jin-song",
    "collection": "people",
    "id": "ymq-person-temujin",
    "differentFields": [
      "role",
      "summary"
    ],
    "differences": {
      "role": {
        "yuan": "大蒙古国开国大汗",
        "liao-jin-song": "大蒙古国创立者"
      },
      "summary": {
        "yuan": "跨期共用人物ID（ymq-person-temujin）。统一蒙古草原诸部，1206年于斡难河源忽里勒台大会尊号“成吉思汗”，创千户百户十户军政合一制与怯薛宿卫军，颁行《大扎撒》法典，发动第一次西征（灭西辽、花剌子模），南下伐金并于1227年灭西夏。",
        "liao-jin-song": "跨期共用人物ID（ymq-person-temujin）。1206年建大蒙古国，1211年野狐岭破金，1227年灭西夏。"
      }
    }
  },
  {
    "topic": "yuan",
    "previousTopic": "liao-jin-song",
    "collection": "people",
    "id": "ymq-person-ogedei",
    "differentFields": [
      "summary",
      "sourceIds"
    ],
    "differences": {
      "summary": {
        "yuan": "跨期共用人物ID（ymq-person-ogedei）。成吉思汗第三子，1229—1241年在位，任耶律楚材为中书令定赋税仪制，营建哈拉和林，1234年正月联宋攻灭金朝，1235年发动“长子西征”（拔都西征钦察与罗斯）。",
        "liao-jin-song": "跨期共用人物ID（ymq-person-ogedei）。1229—1241年在位，1232年三峰山破金，1234年正月联宋灭金。"
      },
      "sourceIds": {
        "yuan": [
          "ymq-source-yuanshi-002",
          "ymq-source-yuanshi-146"
        ],
        "liao-jin-song": [
          "ymq-source-yuanshi-001"
        ]
      }
    }
  },
  {
    "topic": "yuan",
    "previousTopic": "liao-jin-song",
    "collection": "people",
    "id": "ymq-person-mongke",
    "differentFields": [
      "summary",
      "sourceIds"
    ],
    "differences": {
      "summary": {
        "yuan": "跨期共用人物ID（ymq-person-mongke）。拖雷长子，1251—1259年在位，使大汗位由窝阔台系转入拖雷系；命弟旭烈兀发动第三次西征（灭木剌夷与阿拔斯王朝），命弟忽必烈平定大理（1253），1258年亲率大军攻宋，1259年七月崩于合州钓鱼城下。",
        "liao-jin-song": "跨期共用人物ID（ymq-person-mongke）。1251—1259年在位，命忽必烈灭大理，1259年七月攻合州钓鱼城死于城下。"
      },
      "sourceIds": {
        "yuan": [
          "ymq-source-yuanshi-003"
        ],
        "liao-jin-song": [
          "ymq-source-yuanshi-001"
        ]
      }
    }
  },
  {
    "topic": "yuan",
    "previousTopic": "liao-jin-song",
    "collection": "people",
    "id": "ymq-person-kublai",
    "differentFields": [
      "name",
      "summary",
      "sourceIds"
    ],
    "differences": {
      "name": {
        "yuan": "忽必烈（元世祖薛禅汗）",
        "liao-jin-song": "忽必烈（元世祖）"
      },
      "summary": {
        "yuan": "跨期共用人物ID（ymq-person-kublai）。拖雷第四子，1260年于开平即汗位建元中统，击败幼弟阿里不哥、平李璮之乱；采纳刘秉忠、许衡、姚枢汉法方略，1271年定国号为“大元”，1272年建大都，1279年灭南宋统一全国；创立中书省—十行中书省体制，设宣政院管辖西藏、澎湖巡检司管辖台湾，颁行《授时历》并开通惠河与海运。",
        "liao-jin-song": "跨期共用人物ID（ymq-person-kublai）。1260年即位，1271年建国号大元，1273年破襄樊，1276年下临安，1279年灭南宋。"
      },
      "sourceIds": {
        "yuan": [
          "ymq-source-yuanshi-004",
          "ymq-source-yuanshi-058"
        ],
        "liao-jin-song": [
          "ymq-source-yuanshi-004"
        ]
      }
    }
  },
  {
    "topic": "yuan",
    "previousTopic": "liao-jin-song",
    "collection": "people",
    "id": "ymq-person-bayan",
    "differentFields": [
      "name",
      "summary",
      "sourceIds"
    ],
    "differences": {
      "name": {
        "yuan": "伯颜（巴延）",
        "liao-jin-song": "伯颜"
      },
      "summary": {
        "yuan": "跨期共用人物ID（ymq-person-bayan）。1274年统率二十万水陆大军南下伐宋，突破阳逻堡、丁家洲，1276年二月兵不血刃进驻临安接受南宋朝廷出降。",
        "liao-jin-song": "跨期共用人物ID（ymq-person-bayan）。1274年统军渡江，1276年二月进驻临安受南宋降。"
      },
      "sourceIds": {
        "yuan": [
          "ymq-source-yuanshi-127"
        ],
        "liao-jin-song": [
          "ymq-source-yuanshi-004"
        ]
      }
    }
  },
  {
    "topic": "yuan",
    "previousTopic": "liao-jin-song",
    "collection": "people",
    "id": "ymq-person-zhang-hongfan",
    "differentFields": [
      "summary",
      "sourceIds"
    ],
    "differences": {
      "summary": {
        "yuan": "跨期共用人物ID（ymq-person-zhang-hongfan）。汉人世侯张柔第九子，1278年底于五坡岭生擒文天祥，1279年二月指挥崖山海战消灭南宋最后抵抗力量。",
        "liao-jin-song": "跨期共用人物ID（ymq-person-zhang-hongfan）。1279年二月指挥崖山海战灭亡南宋。"
      },
      "sourceIds": {
        "yuan": [
          "ymq-source-yuanshi-127"
        ],
        "liao-jin-song": [
          "ymq-source-yuanshi-004"
        ]
      }
    }
  },
  {
    "topic": "yuan",
    "previousTopic": "liao-jin-song",
    "collection": "sources",
    "id": "ymq-source-yuanshi-001",
    "differentFields": [
      "title",
      "note"
    ],
    "differences": {
      "title": {
        "yuan": "《元史》卷一 · 太祖本纪（成吉思汗铁木真）",
        "liao-jin-song": "《元史》卷一至卷三 · 太祖（铁木真）、太宗（窝阔台）、宪宗（蒙哥）本纪"
      },
      "note": {
        "yuan": "跨期共用史源ID：1206年铁木真建大蒙古国、创千户制、西征花剌子模、伐金与1227年灭西夏史源。",
        "liao-jin-song": "跨期共用史源ID：1206年建大蒙古国、1227年灭西夏、1234年联宋灭金、1259年钓鱼城之战史源。"
      }
    }
  },
  {
    "topic": "yuan",
    "previousTopic": "liao-jin-song",
    "collection": "sources",
    "id": "ymq-source-yuanshi-004",
    "differentFields": [
      "title",
      "note"
    ],
    "differences": {
      "title": {
        "yuan": "《元史》卷四至卷十七 · 世祖本纪（忽必烈）",
        "liao-jin-song": "《元史》卷四至卷十七 · 世祖本纪（忽必烈）及卷一百二十七伯颜传"
      },
      "note": {
        "yuan": "跨期共用史源ID：1260年忽必烈中统建元、平阿里不哥与李璮、1271年建国号大元、1272年建大都、1279年灭南宋统一全国史源。",
        "liao-jin-song": "跨期共用史源ID：1253年平大理、1271年建国号大元、1273年克襄樊、1276年下临安、1279年崖山灭宋史源。"
      }
    }
  },
  {
    "topic": "yuan",
    "previousTopic": "ming",
    "collection": "polities",
    "id": "ming",
    "differentFields": [
      "name",
      "start",
      "end",
      "region",
      "ending",
      "note",
      "sourceIds",
      "dating"
    ],
    "differences": {
      "name": {
        "yuan": "西吴 / 明朝（平定江南与北伐驱元阶段）",
        "ming": "明朝"
      },
      "start": {
        "yuan": {
          "era": "CE",
          "year": 1356
        },
        "ming": {
          "era": "CE",
          "year": 1368
        }
      },
      "end": {
        "yuan": {
          "era": "CE",
          "year": 1368
        },
        "ming": {
          "era": "CE",
          "year": 1644
        }
      },
      "region": {
        "yuan": "应天府（南京）",
        "ming": "应天府（南京） / 顺天府（北京，1421年迁都）"
      },
      "ending": {
        "yuan": "跨期政权（1368年正月称帝建大明、八月克元大都，完整1368—1644年谱系接续明朝专卷 ming.json）",
        "ming": "崇祯十七年（1644年）三月十九日李自成大顺军攻破北京，崇祯帝朱由检自缢煤山"
      },
      "note": {
        "yuan": "跨期共用政权ID（ming）。朱元璋于1356年攻克集庆（改应天府），1364年称吴王（史称西吴），先后消灭陈友谅、张士诚，1368年正月称帝建大明，八月徐达攻克元大都结束元朝中原统治。",
        "ming": "跨期共用政权ID（ming）。1368年正月朱元璋于应天称帝建大明，传十六帝享国276年；废中书省与丞相制、创立内阁与司礼监体制；明成祖迁都北京、派郑和七下西洋；中后期经历土木之变、阳明心学、戚继光抗倭、隆庆开关与张居正一条鞭法改革，1644年亡于甲申之变。"
      },
      "sourceIds": {
        "yuan": [
          "ymq-source-mingshi-1",
          "ymq-source-mingshi-125"
        ],
        "ming": [
          "ymq-source-mingshi-1",
          "ymq-source-mingshi-5",
          "ymq-source-mingshi-20",
          "ymq-source-mingshi-23"
        ]
      },
      "dating": {
        "yuan": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "本卷呈现1356年朱元璋克集庆至1368年建明驱元阶段，完整明朝谱系见 ming.json。",
          "alternatives": []
        },
        "ming": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "洪武元年（1368年）正月朱元璋称帝，至崇祯十七年（1644年）三月甲申之变。",
          "alternatives": []
        }
      }
    }
  },
  {
    "topic": "yuan",
    "previousTopic": "ming",
    "collection": "people",
    "id": "ymq-person-toghon-temur",
    "differentFields": [
      "name",
      "role",
      "summary",
      "sourceIds"
    ],
    "differences": {
      "name": {
        "yuan": "妥懽贴睦尔（元顺帝 / 元惠宗乌哈噶图汗）",
        "ming": "妥懽贴睦尔（北元惠宗 / 元顺帝）"
      },
      "role": {
        "yuan": "元朝末代皇帝、北元首任可汗",
        "ming": "北元首任可汗"
      },
      "summary": {
        "yuan": "明宗长子，1333—1368年在元帝位（在位三十六年，为元代最久）；1340年支持脱脱铲除权臣伯颜、推行“至正新政”并修成辽金宋三史；后期沉迷宫廷天魔舞与佛事，1351年爆发红巾军大起义，1368年八月明军徐达逼近大都时北奔上都。",
        "ming": "跨期共用人物ID（ymq-person-toghon-temur）。1368年八月弃大都北奔上都与应昌，延续北元汗庭，1370年四月崩于应昌。"
      },
      "sourceIds": {
        "yuan": [
          "ymq-source-yuanshi-038"
        ],
        "ming": [
          "ymq-source-mingshi-327"
        ]
      }
    }
  },
  {
    "topic": "yuan",
    "previousTopic": "ming",
    "collection": "people",
    "id": "ymq-person-zhu-yuanzhang",
    "differentFields": [
      "name",
      "summary"
    ],
    "differences": {
      "name": {
        "yuan": "朱元璋（西吴王 / 明太祖）",
        "ming": "朱元璋（明太祖洪武帝）"
      },
      "summary": {
        "yuan": "跨期共用人物ID（ymq-person-zhu-yuanzhang）。1352年投郭子兴濠州红巾军，1356年攻占集庆（改应天府），1363年鄱阳湖破陈友谅、1367年灭张士诚，1368年正月称帝建大明，八月派徐达北伐攻克元大都。",
        "ming": "跨期共用人物ID（ymq-person-zhu-yuanzhang）。濠州钟离贫农出身，平陈友谅、张士诚，1368年正月于应天府称帝建大明（1368—1398年在位），派徐达北伐驱元；1380年借胡惟庸案废中书省与丞相制，1393年兴蓝玉案，创卫所制、编赋役黄册与鱼鳞图册、颁《大明律》《大诰》，开创“洪武之治”。"
      }
    }
  },
  {
    "topic": "yuan",
    "previousTopic": "ming",
    "collection": "people",
    "id": "ymq-person-xu-da",
    "differentFields": [
      "role",
      "summary"
    ],
    "differences": {
      "role": {
        "yuan": "明朝征虏大将军、魏国公",
        "ming": "明朝开国征虏大将军、魏国公"
      },
      "summary": {
        "yuan": "跨期共用人物ID（ymq-person-xu-da）。1367年十月受命为征虏大将军与常遇春率二十五万大军北伐，平山东、下汴梁，1368年八月攻克元大都。",
        "ming": "跨期共用人物ID（ymq-person-xu-da）。明朝开国第一功臣，统兵平陈友谅、张士诚，1368年八月攻克元大都，其后镇守北平十余年巩固北疆。"
      }
    }
  },
  {
    "topic": "yuan",
    "previousTopic": "ming",
    "collection": "sources",
    "id": "ymq-source-mingshi-1",
    "differentFields": [
      "title",
      "note"
    ],
    "differences": {
      "title": {
        "yuan": "《明史》卷一 · 太祖本纪一（朱元璋起兵至洪武建元）",
        "ming": "《明史》卷一至卷三 · 太祖本纪（洪武帝朱元璋）"
      },
      "note": {
        "yuan": "跨期共用史源ID：朱元璋1356年克集庆、1363年鄱阳湖破陈友谅、1367年灭张士诚、1368年称帝建明并派徐达北伐克大都史源。",
        "ming": "跨期共用史源ID：1368年朱元璋称帝建明、北伐驱元、1380年胡惟庸案废丞相设六部、1393年蓝玉案、卫所制与《大明律》史源。"
      }
    }
  },
  {
    "topic": "yuan",
    "previousTopic": "ming",
    "collection": "sources",
    "id": "ymq-source-mingshi-125",
    "differentFields": [
      "title",
      "note"
    ],
    "differences": {
      "title": {
        "yuan": "《明史》卷一百二十五 · 徐达常遇春传",
        "ming": "《明史》卷一百二十五至一百三十二 · 徐达、常遇春、李文忠、邓愈、汤和、沐英、蓝玉传"
      },
      "note": {
        "yuan": "跨期共用史源ID：1367—1368年徐达、常遇春率明军北伐驱逐元顺帝攻克大都史源。",
        "ming": "跨期共用史源ID：明初开国名将北伐灭元、平云南、1388年蓝玉捕鱼儿海大捷及蓝玉案史源。"
      }
    }
  },
  {
    "topic": "qing",
    "previousTopic": "sui-tang",
    "collection": "polities",
    "id": "wu-zhou",
    "differentFields": [
      "name",
      "kind",
      "start",
      "end",
      "color",
      "region",
      "ending",
      "note",
      "sourceIds",
      "dating"
    ],
    "differences": {
      "name": {
        "qing": "吴周（三藩割据政权）",
        "sui-tang": "武周"
      },
      "kind": {
        "qing": "rebel",
        "sui-tang": "empire"
      },
      "start": {
        "qing": {
          "era": "CE",
          "year": 1673
        },
        "sui-tang": {
          "era": "CE",
          "year": 690
        }
      },
      "end": {
        "qing": {
          "era": "CE",
          "year": 1681
        },
        "sui-tang": {
          "era": "CE",
          "year": 705
        }
      },
      "color": {
        "qing": "#825548",
        "sui-tang": "#8c5230"
      },
      "region": {
        "qing": "昆明 / 衡州（湖南衡阳，1678年称帝都城）",
        "sui-tang": "神都洛阳"
      },
      "ending": {
        "qing": "康熙二十年（1681年）十月清军赵良栋、蔡毓荣攻破昆明，吴世璠自杀，三藩平定",
        "sui-tang": "神龙元年（705年）正月张柬之等发动神龙政变，唐中宗复位、二月复国号为唐"
      },
      "note": {
        "qing": "平西王吴三桂于康熙十二年（1673年）十一月在云南起兵反清，自称天下都招讨兵马大元帅，靖南王耿精忠、平南王之子尚之信响应（三藩之乱）；1678年三月吴三桂于衡州称帝，国号大周，八月病死后孙吴世璠退守云南，1681年十月为康熙帝平定。",
        "sui-tang": "天授元年（690年）九月武则天改唐为周，自称圣神皇帝，定都神都洛阳；705年神龙政变后退位为则天大圣皇帝，恢复李唐国号。"
      },
      "sourceIds": {
        "qing": [
          "ymq-source-qsg-6",
          "qing-source-qsg-474"
        ],
        "sui-tang": [
          "st-source-jts-06",
          "st-source-jts-89"
        ]
      },
      "dating": {
        "qing": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "1673年十一月吴三桂起兵，1678年称周帝，至1681年十月昆明城破。",
          "alternatives": []
        },
        "sui-tang": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "天授元年（690年）九月壬午改国号为周，至神龙元年（705年）二月甲寅复国号为唐。",
          "alternatives": []
        }
      }
    }
  },
  {
    "topic": "qing",
    "previousTopic": "ming",
    "collection": "polities",
    "id": "later-jin-qing",
    "differentFields": [
      "name",
      "end",
      "region",
      "ending",
      "note",
      "sourceIds",
      "dating"
    ],
    "differences": {
      "name": {
        "qing": "后金 / 清朝",
        "ming": "后金 / 清朝（崛起与入关灭明阶段）"
      },
      "end": {
        "qing": {
          "era": "CE",
          "year": 1912
        },
        "ming": {
          "era": "CE",
          "year": 1683
        }
      },
      "region": {
        "qing": "赫图阿拉 / 盛京（沈阳） / 京师顺天府（北京，1644年定都）",
        "ming": "赫图阿拉 / 盛京（沈阳） / 北京（1644年定都）"
      },
      "ending": {
        "qing": "宣统三年十二月二十五日（1912年2月12日）隆裕太后携宣统帝溥仪颁布《退位诏书》",
        "ming": "跨期政权（完整1616—1912年谱系接续清朝专卷 qing.json）"
      },
      "note": {
        "qing": "跨期共用政权ID（later-jin-qing）。1616年努尔哈赤建后金，1636年皇太极改国号大清，1644年入关定都北京，传十二帝296年；康雍乾三朝彻底解决北方游牧边患、统一台湾新疆西藏奠定现代中国疆域；1840年后历经近代化转型，1912年2月清帝逊位终结两千余年帝制。",
        "ming": "跨期共用政权ID（later-jin-qing）。1616年努尔哈赤建后金，1619年萨尔浒破明，1636年皇太极改号大清，1644年多尔衮奉顺治帝入关定都北京，1662年灭南明永历、1683年统一台湾。"
      },
      "sourceIds": {
        "qing": [
          "ymq-source-qsg-1",
          "ymq-source-qsg-2",
          "ymq-source-qsg-4",
          "ymq-source-qsg-6",
          "ymq-source-qsg-25"
        ],
        "ming": [
          "ymq-source-qsg-1",
          "ymq-source-qsg-224"
        ]
      },
      "dating": {
        "qing": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "1616年正月努尔哈赤建后金，1636年改号大清，至1912年2月12日宣统帝退位。",
          "alternatives": []
        },
        "ming": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "本卷呈现1616—1683年明清战争与易代阶段，完整清朝谱系见 qing.json。",
          "alternatives": []
        }
      }
    }
  },
  {
    "topic": "qing",
    "previousTopic": "ming",
    "collection": "polities",
    "id": "ming",
    "differentFields": [
      "name",
      "start",
      "region",
      "ending",
      "note",
      "sourceIds",
      "dating"
    ],
    "differences": {
      "name": {
        "qing": "明朝（辽东明清战争阶段）",
        "ming": "明朝"
      },
      "start": {
        "qing": {
          "era": "CE",
          "year": 1616
        },
        "ming": {
          "era": "CE",
          "year": 1368
        }
      },
      "region": {
        "qing": "北京",
        "ming": "应天府（南京） / 顺天府（北京，1421年迁都）"
      },
      "ending": {
        "qing": "1644年三月十九日李自成攻破北京，崇祯帝自缢煤山",
        "ming": "崇祯十七年（1644年）三月十九日李自成大顺军攻破北京，崇祯帝朱由检自缢煤山"
      },
      "note": {
        "qing": "跨期共用政权ID（ming，完整十六帝谱系见明朝专卷 ming.json）。1618—1644年间与后金/清朝在辽东展开萨尔浒、宁远、松锦等大战。",
        "ming": "跨期共用政权ID（ming）。1368年正月朱元璋于应天称帝建大明，传十六帝享国276年；废中书省与丞相制、创立内阁与司礼监体制；明成祖迁都北京、派郑和七下西洋；中后期经历土木之变、阳明心学、戚继光抗倭、隆庆开关与张居正一条鞭法改革，1644年亡于甲申之变。"
      },
      "sourceIds": {
        "qing": [
          "ymq-source-qsg-1",
          "ymq-source-qsg-2"
        ],
        "ming": [
          "ymq-source-mingshi-1",
          "ymq-source-mingshi-5",
          "ymq-source-mingshi-20",
          "ymq-source-mingshi-23"
        ]
      },
      "dating": {
        "qing": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "本卷呈现1616—1644年晚明与后金/清朝交战阶段。",
          "alternatives": []
        },
        "ming": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "洪武元年（1368年）正月朱元璋称帝，至崇祯十七年（1644年）三月甲申之变。",
          "alternatives": []
        }
      }
    }
  },
  {
    "topic": "qing",
    "previousTopic": "ming",
    "collection": "polities",
    "id": "dashun",
    "differentFields": [
      "ending",
      "note",
      "sourceIds",
      "dating"
    ],
    "differences": {
      "ending": {
        "qing": "1644年四月山海关一片石败于多尔衮与吴三桂，1645年五月李自成于九宫山遇害",
        "ming": "1644年四月山海关战败退回陕西，1645年五月李自成于湖北通山九宫山遇害"
      },
      "note": {
        "qing": "跨期共用政权ID（dashun）。1644年三月推翻明朝，四月在山海关被清军击败退出北京。",
        "ming": "跨期共用政权ID（dashun）。李自成于1644年正月在西安称帝建号大顺、改元永昌，三月十九日攻克北京推翻明朝，四月在山海关一片石败于清军多尔衮与吴三桂。"
      },
      "sourceIds": {
        "qing": [
          "ymq-source-qsg-4"
        ],
        "ming": [
          "ymq-source-mingshi-309",
          "ymq-source-qsg-1"
        ]
      },
      "dating": {
        "qing": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "1644年正月李自成建大顺，至1645年五月败亡。",
          "alternatives": []
        },
        "ming": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "1644年正月李自成于西安称帝，至1645年五月九宫山败亡。",
          "alternatives": []
        }
      }
    }
  },
  {
    "topic": "qing",
    "previousTopic": "ming",
    "collection": "polities",
    "id": "southern-ming",
    "differentFields": [
      "region",
      "ending",
      "note",
      "sourceIds",
      "dating"
    ],
    "differences": {
      "region": {
        "qing": "南京 / 福州 / 肇庆—昆明 / 台湾安平",
        "ming": "南京（弘光） / 福州（隆武） / 绍兴—舟山（鲁王） / 肇庆—昆明（永历） / 台湾东都安平（明郑）"
      },
      "ending": {
        "qing": "康熙二十二年（1683年）七月施琅攻克澎湖，延平王郑克塽奉表降清",
        "ming": "康熙二十二年（永历三十七年，1683年）七月施琅攻克澎湖，延平王郑克塽奉表降清"
      },
      "note": {
        "qing": "跨期共用政权ID（southern-ming，完整谱系见明朝专卷 ming.json）。1644—1662年南明弘光、隆武、永历抗清，1661—1683年郑成功收复台湾并传三代至施琅平台。",
        "ming": "跨期共用政权ID（southern-ming）。1644年五月福王朱由崧于南京即位（弘光帝），其后唐王隆武帝、鲁王监国、桂王永历帝及史可法、张煌言、李定国相继抗清；1661—1662年延平王郑成功驱逐荷兰殖民者收复台湾，历郑成功、郑经、郑克塽三代奉永历正朔至1683年。"
      },
      "sourceIds": {
        "qing": [
          "ymq-source-qsg-4",
          "ymq-source-qsg-6",
          "ymq-source-qsg-224"
        ],
        "ming": [
          "ymq-source-mingshi-274",
          "ymq-source-qsg-224"
        ]
      },
      "dating": {
        "qing": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "1644年五月弘光即位，至1683年七月台湾郑克塽降清。",
          "alternatives": []
        },
        "ming": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "1644年五月弘光帝于南京即位，至1683年七月台湾明郑降清。",
          "alternatives": []
        }
      }
    }
  },
  {
    "topic": "qing",
    "previousTopic": "ming",
    "collection": "tenures",
    "id": "ymq-tenure-qing-nurhaci",
    "differentFields": [
      "name",
      "dating"
    ],
    "differences": {
      "name": {
        "qing": "后金天命汗努尔哈赤（清太祖）",
        "ming": "后金天命汗努尔哈赤"
      },
      "dating": {
        "qing": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "天命元年（1616年）正月于赫图阿拉称汗建后金，天命十一年（1626年）八月崩。",
          "alternatives": []
        },
        "ming": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "跨期共用在位ID（ymq-tenure-qing-nurhaci）。1616年建后金，1619年萨尔浒破明，1626年崩。",
          "alternatives": []
        }
      }
    }
  },
  {
    "topic": "qing",
    "previousTopic": "ming",
    "collection": "tenures",
    "id": "ymq-tenure-qing-hongtaiji",
    "differentFields": [
      "name",
      "sourceIds",
      "chronology",
      "dating"
    ],
    "differences": {
      "name": {
        "qing": "清太宗皇太极（天聪汗 / 崇德帝）",
        "ming": "清太宗皇太极"
      },
      "sourceIds": {
        "qing": [
          "ymq-source-qsg-2"
        ],
        "ming": [
          "ymq-source-qsg-1"
        ]
      },
      "chronology": {
        "qing": {
          "accession": {
            "era": "CE",
            "year": 1626
          },
          "regnalStart": {
            "era": "CE",
            "year": 1627
          },
          "abdication": null,
          "death": {
            "era": "CE",
            "year": 1643
          },
          "changes": []
        },
        "ming": {
          "accession": {
            "era": "CE",
            "year": 1626
          },
          "regnalStart": {
            "era": "CE",
            "year": 1626
          },
          "abdication": null,
          "death": {
            "era": "CE",
            "year": 1643
          },
          "changes": []
        }
      },
      "dating": {
        "qing": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "1626年九月即汗位，崇德元年（1636年）四月称帝改国号大清，崇德八年（1643年）八月崩。",
          "alternatives": []
        },
        "ming": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "跨期共用在位ID（ymq-tenure-qing-hongtaiji）。1636年改国号大清，1642年松锦大捷，1643年崩。",
          "alternatives": []
        }
      }
    }
  },
  {
    "topic": "qing",
    "previousTopic": "ming",
    "collection": "tenures",
    "id": "ymq-tenure-ming-chongzhen",
    "differentFields": [
      "sourceIds",
      "dating"
    ],
    "differences": {
      "sourceIds": {
        "qing": [
          "ymq-source-qsg-1"
        ],
        "ming": [
          "ymq-source-mingshi-23"
        ]
      },
      "dating": {
        "qing": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "跨期共用在位ID（ymq-tenure-ming-chongzhen）。1627年即位，1644年三月煤山殉国。",
          "alternatives": []
        },
        "ming": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "1627年八月即位，崇祯十七年（1644年）三月十九日自缢煤山殉国。",
          "alternatives": []
        }
      }
    }
  },
  {
    "topic": "qing",
    "previousTopic": "ming",
    "collection": "tenures",
    "id": "ymq-tenure-dashun-lizicheng",
    "differentFields": [
      "sourceIds",
      "dating"
    ],
    "differences": {
      "sourceIds": {
        "qing": [
          "ymq-source-qsg-4"
        ],
        "ming": [
          "ymq-source-mingshi-309"
        ]
      },
      "dating": {
        "qing": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "跨期共用在位ID（ymq-tenure-dashun-lizicheng）。1644年正月称帝，1645年五月遇害。",
          "alternatives": []
        },
        "ming": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "永昌元年（1644年）正月于西安称帝，三月克北京，1645年五月九宫山遇害。",
          "alternatives": []
        }
      }
    }
  },
  {
    "topic": "qing",
    "previousTopic": "ming",
    "collection": "tenures",
    "id": "ming-tenure-zheng-chenggong",
    "differentFields": [
      "name",
      "dating"
    ],
    "differences": {
      "name": {
        "qing": "明郑延平王郑成功",
        "ming": "明郑延平武王郑成功"
      },
      "dating": {
        "qing": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "跨期共用在位ID（ming-tenure-zheng-chenggong）。1661—1662年驱荷收复台湾。",
          "alternatives": []
        },
        "ming": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "永历九年（1655）受封延平王，1661—1662年收复台湾，1662年五月病逝于安平。",
          "alternatives": []
        }
      }
    }
  },
  {
    "topic": "qing",
    "previousTopic": "ming",
    "collection": "people",
    "id": "ymq-person-nurhaci",
    "differentFields": [
      "summary"
    ],
    "differences": {
      "summary": {
        "qing": "跨期共用人物ID（ymq-person-nurhaci）。1583年以十三副遗甲起兵统一建州、海西女真，创制八旗兵民合一制度与老满文；1616年正月于赫图阿拉称汗建国号大金（后金，1616—1626年在位），1618年以“七大恨”伐明，1619年在萨尔浒之战大破明军，迁都辽阳、沈阳。",
        "ming": "跨期共用人物ID（ymq-person-nurhaci）。统一女真创八旗，1616年建后金，1619年萨尔浒之战大破明军。"
      }
    }
  },
  {
    "topic": "qing",
    "previousTopic": "ming",
    "collection": "people",
    "id": "ymq-person-hong-taiji",
    "differentFields": [
      "name",
      "role",
      "summary",
      "sourceIds"
    ],
    "differences": {
      "name": {
        "qing": "皇太极（清太宗天聪汗 / 崇德帝）",
        "ming": "皇太极（清太宗崇德帝）"
      },
      "role": {
        "qing": "后金第二任大汗、清朝开国皇帝",
        "ming": "后金大汗、清朝开国皇帝"
      },
      "summary": {
        "qing": "跨期共用人物ID（ymq-person-hong-taiji）。努尔哈赤第八子，1626—1643年在位，设立内三院与六部、增编蒙古八旗与汉军八旗，1635年收服漠南蒙古林丹汗部并定族名为“满洲”，1636年四月于盛京称帝改国号为“大清”，1640—1642年在松锦之战歼灭明军关外主力。",
        "ming": "跨期共用人物ID（ymq-person-hong-taiji）。1636年改国号大清，1642年松锦大捷摧毁明军关外主力。"
      },
      "sourceIds": {
        "qing": [
          "ymq-source-qsg-2"
        ],
        "ming": [
          "ymq-source-qsg-1"
        ]
      }
    }
  },
  {
    "topic": "qing",
    "previousTopic": "ming",
    "collection": "people",
    "id": "ymq-person-dorgon",
    "differentFields": [
      "name",
      "summary",
      "sourceIds"
    ],
    "differences": {
      "name": {
        "qing": "多尔衮（睿忠亲王 / 皇父摄政王）",
        "ming": "多尔衮（睿忠亲王）"
      },
      "summary": {
        "qing": "跨期共用人物ID（ymq-person-dorgon）。努尔哈赤第十四子，1643年拥立顺治帝任辅政王，1644年四月统八旗大军入山海关联合吴三桂击败李自成，迎顺治帝迁都北京，主持统一黄河流域与江南。",
        "ming": "跨期共用人物ID（ymq-person-dorgon）。1644年四月率清军入山海关击败李自成，定都北京并统兵灭南明弘光、隆武政权。"
      },
      "sourceIds": {
        "qing": [
          "ymq-source-qsg-4"
        ],
        "ming": [
          "ymq-source-qsg-1"
        ]
      }
    }
  },
  {
    "topic": "qing",
    "previousTopic": "ming",
    "collection": "people",
    "id": "ymq-person-zhu-youjian",
    "differentFields": [
      "name",
      "summary",
      "sourceIds"
    ],
    "differences": {
      "name": {
        "qing": "朱由检（明崇祯帝）",
        "ming": "朱由检（明思宗崇祯帝）"
      },
      "summary": {
        "qing": "跨期共用人物ID（ymq-person-zhu-youjian）。1627—1644年在位，与皇太极在辽东长期交战，1644年三月十九日自缢煤山。",
        "ming": "光宗第五子、熹宗弟（信王），1627—1644年在位；即位即铲除魏忠贤阉党，勤于政事但多疑急躁（在位十七年更换五十位内阁大学士），1630年自毁长城处死袁崇焕；在陕北农民大起义与清军叩关两面夹击下，于1644年三月十九日自缢于北京煤山殉国。"
      },
      "sourceIds": {
        "qing": [
          "ymq-source-qsg-1"
        ],
        "ming": [
          "ymq-source-mingshi-23"
        ]
      }
    }
  },
  {
    "topic": "qing",
    "previousTopic": "ming",
    "collection": "people",
    "id": "ymq-person-li-zicheng",
    "differentFields": [
      "summary",
      "sourceIds"
    ],
    "differences": {
      "summary": {
        "qing": "跨期共用人物ID（ymq-person-li-zicheng）。1644年正月建大顺，三月克北京，四月在山海关一片石败于多尔衮与吴三桂。",
        "ming": "跨期共用人物ID（ymq-person-li-zicheng）。陕西米脂人，继高迎祥为闯王，提出“均田免赋”，1643年于潼关歼灭孙传庭明军主力，1644年正月于西安称帝建国号大顺，三月十九日攻破北京推翻明朝，四月在山海关一片石败于多尔衮与吴三桂，1645年五月于湖北通山九宫山遇害。"
      },
      "sourceIds": {
        "qing": [
          "ymq-source-qsg-4"
        ],
        "ming": [
          "ymq-source-mingshi-309"
        ]
      }
    }
  },
  {
    "topic": "qing",
    "previousTopic": "ming",
    "collection": "people",
    "id": "ymq-person-zheng-chenggong",
    "differentFields": [
      "name",
      "summary"
    ],
    "differences": {
      "name": {
        "qing": "郑成功（延平王）",
        "ming": "郑成功（国姓爷 / 延平武王）"
      },
      "summary": {
        "qing": "跨期共用人物ID（ymq-person-zheng-chenggong）。东南抗清主力，1661—1662年驱逐荷兰殖民者收复台湾。",
        "ming": "跨期共用人物ID（ymq-person-zheng-chenggong）。隆武帝赐国姓朱、永历帝封延平王，1659年与张煌言北伐围攻南京；1661年四月率水师二万五千人横渡台湾海峡登陆鹿耳门，围攻热兰遮城九个月，于1662年2月1日迫使荷兰殖民总督揆一签字投降，收复台湾。"
      }
    }
  },
  {
    "topic": "qing",
    "previousTopic": "ming",
    "collection": "sources",
    "id": "ymq-source-qsg-1",
    "differentFields": [
      "title",
      "note"
    ],
    "differences": {
      "title": {
        "qing": "《清史稿》卷一 · 太祖本纪（努尔哈赤）",
        "ming": "《清史稿》卷一至卷五 · 太祖（努尔哈赤）、太宗（皇太极）、世祖（顺治帝）本纪"
      },
      "note": {
        "qing": "跨期共用史源ID：1583年努尔哈赤起兵统一女真、创立八旗制度、1616年建后金及1619年萨尔浒之战史源。",
        "ming": "跨期共用史源ID：后金崛起、萨尔浒之战、松锦之战与1644年清军入关史源。"
      }
    }
  },
  {
    "topic": "qing",
    "previousTopic": "ming",
    "collection": "sources",
    "id": "ymq-source-qsg-224",
    "differentFields": [
      "title",
      "note"
    ],
    "differences": {
      "title": {
        "qing": "《清史稿》卷二百二十四 · 郑成功传（附卷二百六十施琅传）",
        "ming": "《清史稿》卷二百二十四 · 郑成功传（附子郑经、孙郑克塽）"
      },
      "note": {
        "qing": "跨期共用史源ID：郑成功收复台湾、明郑三代及1683年福建水师提督施琅澎湖海战统一台湾、设台湾府史源。",
        "ming": "跨期共用史源ID：郑成功抗清、1661—1662年驱荷收复台湾及明郑三代存续至1683年史源。"
      }
    }
  }
]
```

## 四新卷之间的额外六组显式ID检查

除用户要求对照七旧卷外，也记录四新卷互比；不合并、不改ID。

| 新卷 | 另一新卷 | 各集合匹配计数 | 合计 |
|---|---|---|---:|
| xia-shang | five-dynasties | 0 / 0 / 0 / 0 / 0 / 0 / 0 | 0 |
| xia-shang | yuan | 0 / 0 / 0 / 0 / 0 / 0 / 0 | 0 |
| xia-shang | qing | 0 / 0 / 0 / 0 / 0 / 0 / 0 | 0 |
| five-dynasties | yuan | 0 / 0 / 0 / 0 / 0 / 0 / 0 | 0 |
| five-dynasties | qing | 0 / 0 / 0 / 0 / 0 / 0 / 0 | 0 |
| yuan | qing | 1 / 0 / 0 / 0 / 0 / 0 / 0 | 1 |

```json
[
  {
    "topic": "yuan",
    "previousTopic": "qing",
    "collection": "polities",
    "id": "ming",
    "differentFields": [
      "name",
      "start",
      "end",
      "region",
      "ending",
      "note",
      "sourceIds",
      "dating"
    ],
    "differences": {
      "name": {
        "yuan": "西吴 / 明朝（平定江南与北伐驱元阶段）",
        "qing": "明朝（辽东明清战争阶段）"
      },
      "start": {
        "yuan": {
          "era": "CE",
          "year": 1356
        },
        "qing": {
          "era": "CE",
          "year": 1616
        }
      },
      "end": {
        "yuan": {
          "era": "CE",
          "year": 1368
        },
        "qing": {
          "era": "CE",
          "year": 1644
        }
      },
      "region": {
        "yuan": "应天府（南京）",
        "qing": "北京"
      },
      "ending": {
        "yuan": "跨期政权（1368年正月称帝建大明、八月克元大都，完整1368—1644年谱系接续明朝专卷 ming.json）",
        "qing": "1644年三月十九日李自成攻破北京，崇祯帝自缢煤山"
      },
      "note": {
        "yuan": "跨期共用政权ID（ming）。朱元璋于1356年攻克集庆（改应天府），1364年称吴王（史称西吴），先后消灭陈友谅、张士诚，1368年正月称帝建大明，八月徐达攻克元大都结束元朝中原统治。",
        "qing": "跨期共用政权ID（ming，完整十六帝谱系见明朝专卷 ming.json）。1618—1644年间与后金/清朝在辽东展开萨尔浒、宁远、松锦等大战。"
      },
      "sourceIds": {
        "yuan": [
          "ymq-source-mingshi-1",
          "ymq-source-mingshi-125"
        ],
        "qing": [
          "ymq-source-qsg-1",
          "ymq-source-qsg-2"
        ]
      },
      "dating": {
        "yuan": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "本卷呈现1356年朱元璋克集庆至1368年建明驱元阶段，完整明朝谱系见 ming.json。",
          "alternatives": []
        },
        "qing": {
          "level": "certain",
          "reviewStatus": "reviewed",
          "reason": "本卷呈现1616—1644年晚明与后金/清朝交战阶段。",
          "alternatives": []
        }
      }
    }
  }
]
```
