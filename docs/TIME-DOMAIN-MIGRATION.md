# 跨时期时间与领域模型

本文描述当前生效的时间轴编码、领域模型与兼容契约。

## 适用范围与边界

统一跨公元前后的显式时间编码，并分离时期／政权／人物／任期四类实体。发布仍是纯静态离线页面，零第三方运行时依赖，不引入数据库或前端框架。

- 十一个专题各自发布为独立数据集；旧周朝入口、ID、历史正文、同年即位口径、中断复国、分享／阅读入口继续保留。
- 两份结构样例演示并存与统一结构，不自动拼入任何专题资料，也不是完整史料库。
- 年份输入提供明确的公元前／公元选择；时间范围与时代按钮由数据集配置决定。人物主题轨道与全面史料校勘仍属后续工作。
- 自动化测试（VM DOM 边界、Canvas 命令／文字、PDF／ZIP 结构）不等于视觉验收；真实浏览器的像素排版、触控与打印结论以[呈现契约](PRESENTATION-CONTRACT.md)记录的浏览器脚本为准。

## 决策一：明确作者日期，稳定运行时坐标

新schema 2日期写作 `{era:"BCE",year:1}` 或 `{era:"CE",year:1}`，禁止作者用负数、0或裸整数猜测纪元。schema 1保留原有正整数BCE日期，不重编号。

运行时统一 `timeEncoding:"bce-axis"`：

| 作者日期 | 坐标 | 显示 |
|---|---:|---|
| BCE 2 | 2 | 前2年 |
| BCE 1 | 1 | 前1年 |
| CE 1 | 0 | 公元1年 |
| CE 2 | -1 | 公元2年 |
| 未知 | null | 年份未定 |

此轴沿用旧周朝坐标与 `start >= end` 顺序，避免整体平移旧链接；相邻前1年、公元1年只相差1。运行时0是合法坐标，**不代表历史存在公元0年**。判断已知年份必须用 `Time.isYear`／显式null判断，不能用truthiness。

构建期 `lib/time.mjs` 负责严格日期转换；网页 `src/core/time.js` 负责encode/decode/format/range/overlaps/bounds。`timeline:{start,end,defaultEnd,cursor}` 为专题视窗配置，不改变实体存续事实；缺配置的旧投影可由国家日期推导，缺少全部日期时明确报错，不能偷偷恢复周朝常量。

周朝配置显式保留前1046—221年、默认结束前256年、参考年前770年。原有分期、内置组合、终点说明移至资料配置；周朝解释文字只在明确的周朝专题显示，不污染三国或秦汉。

## 决策二：四类实体分开，兼容接口保留

| 集合 | 主键与含义 |
|---|---|
| periods | 专题／分期窗口，`polityIds` 引用共享政权，可重叠、嵌套；不是政权寿命 |
| polities | 政权事实与存续区间；不同专题引用同一个ID |
| people | 自然人简介与别称；姓名不是主键 |
| tenures | 一段在位／任职，`polityId` 连接政权、`personId` 连接自然人；未知对应人物明确为null |

同一人物可有多段任期；同一政权可在多个专题出现。改名、专题变化、排序、称号变化都不触发复制人物或政权。是否为新政权属于有来源的编辑判断，不能由前端按名称或专题推断。

原schema 1的 `states.id` 和 `rulers.id` 原样投影为 `polities.id` 和 `tenures.id`；既有君主姓名文本不自动创建或匹配人物。旧君臣关系 `rulerPeople` 仍只是关联，不被误当成君主本人的身份连接。原 `states`（内嵌rulers）接口继续提供给旧页面、搜索及导出。

周朝秦国记录的前221年仍是既有图示阶段边界，不据此改写秦亡。正式[秦汉资料](<../data/qin-han.json>)已沿用同一 `qin` 政权ID补充有依据的连续存续（前890—前206）与阶段，没有复制另一个秦国。结构样例仍使用示例命名空间，不参与生产资料合并或ID迁移。

schema 2关系名为 `eventPolities/eventPeople/tenurePeople/personPolities`。事件涉及政权只由显式事件关系生成，不从人物经历、任期或时期反向传播。参与者关系须有来源与说明，任职不等于亲自参与全部事件。

查询继续保留 `state/event/person/rulersAt/compareYear/comparison`；增补 `polity/tenure/period/tenuresForPerson/periodsInRange`。对照快照保留 `schemaVersion:1` 既有字段，增补时间编码、范围配置和独立领域集合，输出与原始资料深度分离。实体区间不会因导出窗口裁切而改写。

## 决策三：显式编码兼容旧链接与存储

- 纯BCE分享继续原 `v=1` 格式，固定旧Hash测试不从新encoder生成输入。
- 任一时间字段为0／负数时生成 `v=2&time=bce-axis`。未知版本或编码拒绝恢复；不把旧负数解释为CE。
- 既有浏览器存储键保持不变。新视图、阅读、访问记录与组合写入 `timeEncoding:"bce-axis"`。
- 无标记的旧记录仅接受正BCE坐标；旧0／负数按缺失回退到资料默认值，不猜测成公元年份。
- 跨屏幕恢复依可见范围和资料起点重算滚动位置，允许视窗范围中的小数坐标；历史事实年份仍要求安全整数。
- ID稳定不等于不同数据集之间可以混用链接：每个专题以 `datasetId` 隔离分享Hash、组合与阅读存储，带 `dataset` 标记的链接只在对应专题恢复（[视图链接](<../src/core/view-link.js>)）。不带标记的旧编码本身不携卷别信息，在别的专题打开时会按该专题的资料重新解读，不能当作同一视图的跨卷引用。

## 两份结构样例

- [三国并存](../data/examples/three-kingdoms.json)：时期引用曹魏、蜀汉、孙吴，政权起讫各自维护，孙权人物连接任期与称帝节点，不假设三国同年建立。
- [秦汉结构](../data/examples/qin-han.json)：同一秦政权跨两个观察阶段，同一嬴政人物连接两段任期；同时包含西汉跨公元任期、事件引用、人物活动继承、新与东汉等不同结构窗口。

样例书目、年代和措辞均标注待复核，只有少量记录；“unified”是观察分组，不断言该王朝每年疆域、制度或实际控制均一致。原典目录链接不是已经逐条校勘的证明。

可独立校验样例：

```sh
node --input-type=module -e "import fs from 'node:fs'; import {validateAtlas,compileAtlas} from './lib/atlas.mjs'; for(const name of ['three-kingdoms','qin-han']) { const a=JSON.parse(fs.readFileSync('data/examples/'+name+'.json','utf8')); validateAtlas(a); const d=compileAtlas(a); console.log(name,d.polities.length,d.tenures.length,d.timeline); }"
```

## 验证与维护

完整命令见[根说明](../README.md#维护与检查)。受限环境不能创建测试子进程时使用 `node --test --test-isolation=none`，不跳过断言。

- [固定周朝基线](COMPATIBILITY-BASELINE.md)：从改造前dist捕获，验证查询、实际即位／条带、中断、秦221、v1详情链接、旧阅读、JSON下载、图页文字与来源异说。不要用新结果覆盖fixture消除回归。
- 时间／持久化测试：BCE/CE双向、0与null、跨元相邻、动态边界、v1/v2、旧存储迁移及专题ID往返。
- 领域测试：两个完整样例编译、不改冻结输入、稳定ID、禁止按同名合并、重复／悬空关系／反向区间／公元零年等拒绝路径。
- 集成测试：周朝与两个样例实际启动、BCE/CE输入、滑块、分期、同年查询、详情与新记录恢复；跨元导出保留原生来源、0年节点与异说，不产生“前-1年”或“公元0年”。
- 所有发布文件由 `node build.mjs` 生成，并以 `node build.mjs --check` 验证；不手改dist。当前命令与基线数量见[根说明](../README.md#维护与检查)。
