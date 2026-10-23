# 项目操作历史

本文件集中保存版本、导入、部署、资料校核和清理记录。当前功能、架构、部署方法及资料约束分别见[项目说明](../README.md)、[架构](ARCHITECTURE.md)、[部署](DEPLOYMENT.md)和[资料维护](../data/README.md)。

记录中的文件数量、测试数量及托管状态表示相应操作当时的情况，不作为当前状态说明。工作提交完成后追加真实提交哈希；记录由后续提交保存，不向文档填入自身提交的自引用哈希。

## 2026-10-20 夏商、五代十国、元、清扩展

- 将用户授权四份原JSON逐字节纳入正式生产库，接入十一专题目录、独立页面、统一导航和出处索引；没有联网校验历史事实。
- 独立技术投影保留不支持的原枚举、复合事件原关系和全部原日期/ID。夏商18条异说不足记录按legacy继承，不编造第二观点；原dating完整保留。
- 出处索引明确区分后凉/后梁与武周/吴周两处异实体ID碰撞，原ID不更名，运行时按专题隔离。当前卷短标签、并存分行、接续分组及摄政/复位身份不改变事实记录。
- 既有七专题编译投影固定SHA保持不变（仅排除导航目录），旧周朝fixture不修改；完整原件散列和技术例外见[新增入库记录](<EXPANSION-INTAKE.md>)，本地及线上证据以[部署记录](<DEPLOYMENT.md>)和最终提交交付为准。

## 既有版本记录摘要

原说明按第二至第七版组织，日期未逐项复核，按原有顺序归档：

| 阶段 | 操作摘要及当时验证范围 |
|---|---|
| 第二版 | 增加行高、视窗高度、国家排序及对比布局，整理君主生平与关联人物；enrich-people改为兼容构建入口 |
| 第三版 | 增加密度显示、事件联动、纪年异说、固定行及研究组合；enrich-context改为兼容入口 |
| 搜索与导航整理 | 增加分组搜索、简介开关、全站／选中国家范围、简繁别称及详情返回；移除独立七雄按钮，使用组合入口 |
| 第四版 | 统一独立人物详情，整理12人的62段活动及105条事件摘要；增加阅读恢复、浏览历史和图页导出 |
| 第五版 | 拆出统一资料源、显式关联与纪年校验；纠正孟子事件齐国误关联，补五国相王及孔子出生异说，区分晋悼公承位与条带起点；当时记录27项检查 |
| 第六版 | 拆出查询、搜索、状态、导航、阅读、导出分页、绘制及编码模块，增加JSON导出；当时记录36项检查。本地自动浏览器访问file协议受当时工具策略限制 |
| 第七版 | 分离参考线与国家行渲染，复用未变化DOM，加入Hash同步分享、Actions与Pages流程；当时记录46项检查 |

历史正文的history／people／research平行JSON副本在统一资料源阶段移除。浏览器定时器在阅读与分享控制器入口绑定全局接收者，发布HTML增加资源内容散列参数，以处理在线运行和缓存一致性问题。

## Sites导入记录

原导入将21个原始文件及8个Sites历史版本接入GitHub仓库，保留初始化提交 `b2db80a645103b9d090ac954f038888e5f2eca11`。导入提交重新生成元数据，原始版本与对应导入版本的tree相同，提交SHA不同。导入时原项目末次提交为 `fd8742cdd4d7f26cf636fac47bd2f838ca0a5d92`。

| 原始提交 | GitHub导入提交 |
|---|---|
| `4b87783813d36dc92405d63e1374a495bf946b53` | `2a9987615c58a28fe2513b71efc72e5ea91dbf4f` |
| `41109ef9b38c39f1adf04462fa4c69cc6302a21c` | `98e0a5527599228e1cf8aa690d8e080edba9ed9b` |
| `f9fc7f495141b85c3187e7d7ea2d3bba3030718e` | `62d0c01c5288690551f0a725678c5f457a65c134` |
| `e5d09b4b620592fe7545f3f260e285f0055eecac` | `2f525cb2985e86766db3f3c21c65bf6903935483` |
| `9886106643f6bf6da6d9a7ad1c59f32d15f0f681` | `b686587f822329f534ca38d06a2ae096f10889cc` |
| `72ca685e59808da823dc47fe5d3c243fe512b974` | `94fbbc22c91d60b0e14c259ab9250e2ddc5c76a9` |
| `fb7ede4728c94b9228fbf615f17c5bb13bec111c` | `e73d0ce75abe14b176d20afeddfd9471e14b1a7c` |
| `fd8742cdd4d7f26cf636fac47bd2f838ca0a5d92` | `b9c79002fbb2a07806029271a830ddca5d06998e` |

原始8个提交、作者和日期保存在 [sites-history.bundle](../backups/sites-history.bundle)，SHA-256为 `36d67e23bef9a9999885d127c2cb113dc88ee8b702e444d1c9a1482f6da8565e`。以下命令在项目根目录验证并恢复到另一个目录：

```sh
git bundle verify backups/sites-history.bundle
git clone backups/sites-history.bundle ../zhou-original-history
```

恢复后的原始分支为main。该导入是一次性操作，不自动同步Sites后续修改；导入当时保留了 `.openai/hosting.json`，没有重新部署Sites。

## 2026-10-18 Pages发布记录

当时完成的步骤为：确认仓库Pages来源和master发布分支；本地运行46项检查及生成物一致性检查；同步源码、测试、dist和工作流；由Actions检查、构建并部署dist；在线检查页面、搜索、详情定位和分享入口。

首次成功发布记录为 [Actions #39086309694](https://github.com/Chrunge/Zhou-Dynasty-Timeline/actions/runs/39086309694)。发布资源版本参数及部署文档的提交为 `9cf95359c3a872943dc59234a55be1bded1168a1`，对应 [Actions #39087085099](https://github.com/Chrunge/Zhou-Dynasty-Timeline/actions/runs/39087085099)。发布截图保留在 [pages-deployment-20261018.png](../backups/pages-deployment-20261018.png)。

## 2026-10-18 历史资料专项核对

本次按“确认错误才修正、正确资料保留、争议保留出处”的原则核对用户提供的建议。核对对象为当前 `data/atlas.json`，不是建议中可能使用的旧版编号。本次未新增事件、人物、活动或君主，也未将部分核对一律升级为 `reviewed`。

### 编号先行核对

| 建议中的对象 | 当前实际 ID | 建议所用 ID 在当前资料中的对象 |
|---|---|---|
| 马陵之战 | `e73` | `e35` 是孔子生于鲁 |
| 桂陵之战 | `e70`，前一年的围邯郸为 `e69` | `e33` 是鄢陵之战 |
| 五国相王 | `e77` | `e37` 是宋之弭兵会盟 |
| 魏惠王 | `liang-r1` | `liang-r3` 是魏武侯 |
| 齐威王、宣王、愍王（湣王） | `qi-r31`、`qi-r32`、`qi-r33` | `qi-r17/18/19` 是齐惠公、顷公、灵公 |
| 燕王哙 | `yan-r28` | `yan-r13` 是燕武公 |

卫宋初封 `e3`、非子封秦 `e4`、魏襄王 `liang-r4` 的编号相符。所有原有 ID 均保留。

### 已修正及补清依据的条目

| 条目 | 原数据问题 | 本次处理 |
|---|---|---|
| 非子封秦 `e4`、秦国家起点、秦非子 `qin-r0` | 约前900年落在本图共王时期，与原典明称孝王、以及本图孝王前891—886年的拟年不相容 | 三处同步采用约前890年；保留前900年旧说。890是后出换算，不是原典确年，均保留争议、约年及部分校核标记 |
| 周共王、孝王简介 | 共王摘要仍把非子封秦列作其时期事件 | 按《秦本纪》将相关叙事归回孝王；两王条带年份不变 |
| 卫宋初封 `e3` | 原有约前1040年已作谨慎说明，但来源未直接列到两国世家 | 补《卫康叔世家》《宋微子世家》，明确原典不直接给出1040，不保证两次分封同年；日期不改 |
| 马陵 `e73` | 前342年的来源说明只写“按现有事件表”，却指向本身列前341年的《六国年表》 | 保留342采用值、341另说，分别说明所据体系；补“二十七年十二月／二十八年”引文及校改、跨年解释的分歧 |
| 魏惠王 `liang-r1` | 简注无保留写“前344年称王”，与该事件自身的争议标记冲突；国家说明直接把369元年当即位年 | 修正两处过度断言，补后元及《史记》分世问题；369—319的采用区间不改 |
| 魏襄王 `liang-r4` | 采用校订区间，但缺少与旧表同名襄王、哀王的区别说明 | 补古注依据，保留318—296。仍不从条带端点自动填写实际承位、死亡年份 |
| 田齐三王 | 威、宣王的异说说明笼统；愍王仍标较确定，不能反映旧表差异 | 保留既有条带，列出旧表对照及威王继立／元年之别；三者均为有争议、部分校核 |
| 燕王哙 `yan-r28`、齐破燕 `e80` | 让国与总区间的区别不够具体；两套齐王年表易混用 | 补《六国年表》前316年让国口径；说明318对应“三年攻秦”不能直接断为让国年。314破燕仍保留，按本图系年属齐宣王时期 |

非子的新约值见[天水市政府介绍](https://www.tianshui.gov.cn/mlts.htm)；原典为[《秦本纪》非子段](https://zh.wikisource.org/zh-hans/史記/卷005)。约900旧说的[甘肃档案网页](https://www.cngsda.net/mrda/32777.jhtml)明确注明转载百度百科，本次也在来源标题中标明，不能将其当作档案原始证据。地方介绍只能说明换算说法存在，不足以确定受封年；非子前858年的条带终点仍为待复核拟年。

马陵月份不能直接表述成“《竹书纪年》无争议记前342年十二月”。[《古本竹书纪年辑证》魏纪〔八二〕](https://book.pans.cn/史部/其他/竹书纪年/YEAR1.HTM)汇录不同引文并讨论跨年解释；[王政冬的研究](https://www.fdgwz.org.cn/Web/Show/3072)采用校“二十七”为“二十八”的解释，换算为342年十二月。两者应区分为原有引文与现代校订意见。当前资料中没有“齐秦并称东西洋”这句话，也没有把东西帝事件塞入马陵叙事，故没有相应删改。

### 魏国与五国相王的取舍

[《魏世家》三家注](https://zh.wikisource.org/zh-hant/史記三家註/卷044)已保存惠王三十六年改元、并非去世的校勘，又引《世本》惠王生襄王、无哀王之说；注家之间仍有不同意见。本地原本就没有另立魏哀王，不能重复执行“删除哀王”。

按本图369元年，三十六年为334年；古注另有后元十六、十七年的差异。“52年”、370／369起点、改元当年是否重计，不能混成一个无歧义的在位长度。故保留采用区间，补说明，将本次核到的两位魏王标为 `partial`，不标 `reviewed`。

迁都大梁361年是九年说，另有364年等说，见[严可《魏国迁都大梁年代之争》](https://www.cssn.cn/skgz/bwyc/202208/t20220803_5464162.shtml)。逢泽会盟、称王、后元改元、徐州相王也不是同一节点。此次不将建议中的361、344、334一概写成已经核定的 `changes`；334年的徐州相王 `e75` 原已收录，保留。

五国相王 `e77` 原有323年比较节点、名单异说及赵拒称王说明，处理合理，整条不改。[《赵世家》](https://zh.wikisource.org/zh-hans/史記/卷043)与[《战国策》中山篇诸注](https://zh.wikisource.org/zh-hant/戰國策/卷33)不能支持把“魏、韩、赵、燕、中山”升为唯一确定名单，也不能支持据此填写赵君323年首次称王。

### 田齐年表的实际对照

以下是区间对照；不是将旧表等同现代结论，也不把每个起点都解释为唯一即位元年。

| 君主 | 本图保留 | 《六国年表》旧表换算 |
|---|---|---|
| 齐威王 | 356—320 | 378—343 |
| 齐宣王 | 319—301 | 342—324 |
| 齐愍王／湣王 | 300—284 | 323—284 |

前述王政冬文另置威王356年继立、355年元年、320年卒；因此356也不宜称作校订学界唯一元年。陈侯午敦的相对纪年有助于讨论前代桓公午年数，但不能仅由铭文直接读出后三王的全部公元起讫。

[《六国年表》](https://zh.wikisource.org/zh-hans/史記/卷015)在燕哙五年记让国，对应316年；[《燕世家》](https://zh.wikisource.org/zh-hans/史記/卷034)的“三年攻秦”、其后的让国、子之执政三年后乱须分别读。[《孟子·梁惠王下》](https://zh.wikisource.org/zh-hans/孟子/梁惠王下)保留宣王伐燕叙事，本图314年对应宣王，不能再套入旧表的湣王年次。此次未把让国字段填成无争议的确定退位年。

### 西周三系方案不作机械替换

现有武王至厉王的条带采用断代工程一系拟年并标推定，未发现仅因另有克商方案就必须改动的错误。本次保留这些数值。

- 1046是本图采用的克商拟年，不等同武王此前所有统治活动的起点。
- 1027可由西周总积年257与幽王末年771首尾计年倒算：771＋257－1＝1027。相关引文见[《周本纪》集解](https://zh.wikisource.org/wiki/史記三家註/卷004)。一个总积年不足以推出每王起讫；不能用今本的逐王年数填成“古本完整表”。
- 刘歆三统历所推1122可作为历史年代方案讨论，涉及文王受命、武王克商、周公摄政及成王亲政等不同起点，不能将断代工程逐王统一平移。原典见[《汉书·律历志下》](https://www.shidianguji.com/zh/book/NGJ8924119990125431003/chapter/1lq08q70i6b76)。

因此不新增三套貌似完整且权威等同的逐王数值，也不因克商锚点不同就生成虚构的在位范围。

### 已有事件、世系与本次未扩充内容

桂陵已经分成354年的围邯郸 `e69`、353年的桂陵 `e70`，无需再拆。建议中的八项事件已有七项：

| 已收录事件 | ID | 本图公元前年份 |
|---|---|---|
| 繻葛之战 | `e12` | 707 |
| 郑铸刑书 | `e39` | 536 |
| 柏举之战、吴入郢 | `e45` | 506 |
| 宋灭曹 | `e52` | 487 |
| 楚灭陈（最终） | `e56` | 479 |
| 楚灭蔡（最终） | `e60` | 447 |
| 徐州相王 | `e75` | 334 |

昭王南征不返已经见于其简介，未单设事件。将其作为约977年的独立选题可以另行扩充，但精选事件未收某项不等于原数据错误，本次不增。陈、蔡此前的中断与复国也保持原有独立节点。

吴、陈、蔡、曹、越的现有未定位名单未发现需要重排的硬错，80项总数保持。核读世系时还须注意：[陈相公之后的孝公是申公之子](https://zh.wikisource.org/wiki/史記/卷036)；[曹宫伯名侯，蔡宫侯的“宫侯”为君称](https://zh.wikisource.org/wiki/史記/卷035)；[虞仲为周章弟、另封北虞](https://zh.wikisource.org/wiki/史記/卷031)，不是吴的连续继位者；越先祖传说有缺世，不能把无余与后续名单画成无缺的直接父子链。列表顺序不自动表达父子关系。

晋鄙、芒卯、孙武、屈原的现有简介基本符合所列史传，缺少结构化活动不构成事实错误，本次保留。芒卯败走与被擒另有不同叙述，孙武、屈原及老子生涯更不能凭概述填入精确年。老子尚未单列独立人物，也不为“补活动”而自动新增。

《左传》《战国策》《孟子》原已按篇目收录，不能笼统说六项来源全缺。本次仅新增实际用于此次说明的8项来源，并澄清两项已有来源标题；未为凑数添加未引用的《睡虎地秦简·编年记》《清华简·系年》。资料维持18国、465个君主区间、80项未定位君主、116人、105事件、62活动；来源由54项变为62项。

### 验证与范围

专项回归检查覆盖封秦与孝王的时代对应、马陵采用值和旧表来源分开、田齐采用区间与314年参与君主相容、魏国未核实节点及五国相王争议保留。统一构建同步生成 `dist/data.js` 和页面资源版本参数；其余前端功能不改。

验证结果：50项自动检查全部通过；发布文件与资料、源码的一致性检查通过。其中4项为本次新增的历史资料回归检查，其余为既有资料及前端功能检查。

本记录是本次定向校核的证据及取舍，不代表已完成全表史实审定。源码资料与离线发布目录在本地更新；本次未推送 GitHub 或重新发布 Pages。

## 2026-10-18 清理审查与批准范围

审查覆盖58个项目文件，基线为50项测试、发布生成物一致性和43个脚本的语法检查通过。未检测到项目依赖或已安装的knip、depcheck、eslint，未安装新依赖。初次审查时本地目录没有Git元数据，未直接删除文件。

用户批准：先建立基于现有仓库历史的独立清理分支并保留未推送修改，再分批执行A01—A05、C01—C02、E01—E03。A06旧命令、A07全局接口、A08 Sites配置保留；B01—B04重复逻辑不在本轮处理。

| 观察位置（审查时） | 现象 | 后续评估原因 |
|---|---|---|
| tests/reading-boundary.test.cjs:40 | 通过固定注释切割源码 | 清理注释可能影响测试加载范围 |
| src/core/search.js:16 | 未定位君主路由使用列表下标 | 重排序可能影响旧链接目标 |
| src/core/export-layout.js:17 | 君主导出来源主要读取r.source | 需另行评估纪年及异说来源的索引覆盖 |

### 分批操作记录

| 日期 | 清单编号 | 做了什么 | 原因 | 提交哈希 |
|---|---|---|---|---|
| 2026-10-18 | PREP | 在cleanup/2026-10-18分支接入原仓库历史，单独保存已有资料校核、测试、文档及截图 | 保留清理前尚未推送的本地内容；基线检查通过 | `0e69c3a1834443f5251c67a6484d08f3717ceb48` |
| 2026-10-18 | C01、C02、E01—E03 | 整理当前使用、架构、部署与资料维护说明；归并版本、导入、发布和校核记录，移除两份独立历史文档 | 统一现状文档职责及操作历史入口；批次前后50项测试、构建一致性和43个脚本语法检查通过 | `cc2e055401d2cb7f11c306cdec5277b8190555c5` |
| 2026-10-18 | A01—A03 | 删除moveState旧函数、includedEvents未用封装及三个测试文件的attachStudy未用导入，同步发布文件 | 全量引用核对无调用；批次前后50项测试、构建一致性和43个脚本语法检查通过 | `fc0cc16884fad6229d25acec2d372dbae088d35c` |
| 2026-10-18 | A04、A05 | 删除dash、bioFacts两组无引用样式的三条规则及7项字符恒等映射，同步发布文件 | 动态类名排查及中文归一化逐字核对一致；批次前后50项测试、构建一致性和43个脚本语法检查通过 | `3d39c51bd5f7ec3bec5767890be3ebbdde267fff` |

## 2026-10-18 架构评审批准条目执行

用户确认执行R01—R05；R01、R02修复已确认的校验错误，R03兼容迁移未定位君主标识，R04收拢页面协调逻辑，R05补齐图形导出引用。独立分支为refactor/r01-r05，起点e6ac060；开始时50项测试、43个脚本语法检查及发布文件一致性检查通过。

| 日期 | 条目编号 | 做了什么 | 原因 | 提交哈希 |
|---|---|---|---|---|
| 2026-10-18 | R01 | 单独提交合法组合特征测试，严格校验组合中的字符串国家ID，同步文档和发布文件 | 对象不能充当国家ID；52项测试、44个脚本语法检查与生成物一致性通过 | `cb79f741bb1467f2cc73ccd9e7e2209284585f2a`；特征测试 `be46744` |

| 2026-10-18 | R02 | 校验chronology.changes的数组类型、正整数年份及非空说明，保留缺省/null兼容并完善资料文档 | 在构建阶段拒绝损坏节点；58项测试、44个脚本语法检查与生成物一致性通过，发布数据不变 | `e1f24ac1037aad666b29958fe9e36dbfb70ba791`；特征测试 `6102975` |
| 2026-10-18 | R03 | 为80项未定位君主增加稳定ID与固定旧路由别名，搜索、阅读和Hash通过统一入口迁移，完善维护约定 | 排序、插入和改名不改变既有链接含义；61项测试、45个脚本语法检查及生成物一致性通过，既有历史内容未改 | `2b5889166e829e982a0c717e67e055dd1a007718`；特征测试 `a239bfd` |
| 2026-10-18 | R04 | 独立组合模型，共享视图字段与浏览器适配入口，显式页面启动及保存回调，统一阅读/分享详情分派，保留全局兼容函数 | 65项测试、49个脚本语法检查与生成物一致性通过；桌面/窄屏各7步前后输出一致，浏览器搜索、详情、分享和返回验收通过 | `85e76ab`、`9bea53d7c791d11a61311e79ed4ae26cfabb21fc`；特征测试 `341eb44` |

R04额外对照脚本曾将存储JSON字符串中的运行时间戳差异误判为行为变化。按执行约定先回退未提交小步；仅在内存核对中解析存储内容、排除时间字段后，确认其余输出相同，再恢复同一份实现并重跑全部检查，未尝试其他实现方案。

| 日期 | 条目编号 | 做了什么 | 原因 | 提交哈希 |
|---|---|---|---|---|
| 2026-10-18 | R05 | 图形索引补齐君主纪年节点与君主/事件异说来源、解释和引用编号，按URL去重，完善使用和架构文档 | 68项测试、50个脚本语法检查与生成物一致性通过；长文本分页和JSON不可变检查通过；浏览器生成齐国前355年两页PDF | `6289899b37624639ea7bb37ecb73e29b4559d7c7`；特征测试 `2faef84` |

最终资料核对：剔除本次为80项未定位君主新增的id与legacyKeys字段后，data/atlas.json与重构起点e6ac060完全相同。项目未增加第三方依赖；旧命令、全局兼容接口和Sites配置保留。全部改动停留在独立重构分支，未合并、推送或重新部署Pages。Git差异空白检查按CRLF换行口径执行；仓库原有Windows换行不作格式调整。真实触控设备和实际打印未另行验收。

## 2026-10-18 合并、推送与Pages发布

用户批准合并、推送并部署。获取远端后确认origin/master仍为9cf95359c3a872943dc59234a55be1bded1168a1，随后将清理与R01—R05重构的21项本地提交快进合并到master（73036a036a83b9b0feb271fe1c5ef30aacd01745）并推送，保留此前未推送的资料校核及全部分项提交。

GitHub Actions [第4次运行](https://github.com/Chrunge/Zhou-Dynasty-Timeline/actions/runs/39130371711)的检查构建和Pages部署作业均成功，提交产物一致性检查、自动化测试、构建及上传全部通过。线上index.html与app.js、data.js、export.js、share.js、study.js、style.css均返回HTTP 200，SHA-256与本地dist对应文件逐一相同。

发布地址：https://chrunge.github.io/Zhou-Dynasty-Timeline/ 。本条为发布后补充的历史记录；记录提交仅更新本文件，发布目录内容保持上述已验证版本，由既有master工作流继续检查和部署。
## 2026-10-19 正式资料上线与真实浏览器验收

- 正式资料功能提交 `bbb695fe54d94c812713495dc1232def7f4766a4` 推送原仓库 `master`（推送范围 `f0d566b..bbb695f`）；[Actions 39254141518](https://github.com/Chrunge/Zhou-Dynasty-Timeline/actions/runs/39254141518) 的 `head_sha` 与提交一致，状态为 `completed / success`。检查构建作业于 `2026-10-19T12:42:36Z`、Pages部署作业于 `2026-10-19T12:42:49Z` 成功（北京时间20:42:49）。先前的Git凭证程序、Chrome权限阻断与两个新入口404属于部署前状态，已被本次推送、部署及线上验收取代；没有创建替代站点。
- `2026-10-19T12:45:46Z` 经HTTPS取回三个入口和在线 `release.json`，均为HTTP200：

| 专题 | 入口SHA-256 |
|---|---|
| 周朝 | `d093b7f479c04db5ba74b53259d4c69aa41c5354a39eea5fc839a39cac333926` |
| 秦汉 | `bec1ad6cfa0f289322ac5c86fdf59d9dd639eae1063d9018e96d670671dfcced` |
| 三国 | `2d985a0157c37916e9684d5cf228a0cbb42287d17352ccf8c5bb69ebc1237e7e` |

- 发布标识 `releaseId=3935bf31fc3fe2ce4af28c40e69a49859fc379e9f0fbd677201ebc66e52023c2`；远端清单与仓库 [dist/release.json](../dist/release.json) 逐字节一致，清单SHA-256为 `21234668dd7fcb56d4abca77d5fc52e51ec7c4aee972e5a3431ca6216bbb4d78`。清单列出的11项资源全部HTTP200，响应字节散列同时匹配清单和本地已提交产物；取回时使用禁用缓存与唯一查询参数，非只核对资源名或HTTP头。
- 真实Chrome/155.0.8059.80以headless模式和CDP连接原站HTTPS地址，三页×1200×900／390×900共6场景通过：周朝18行、449个任期条带、100个事件／聚合按钮，定位前770年及周王室／周武王详情；秦汉8行、40个窗口内任期、16个事件按钮，公元1年定位、秦政权→秦王政→嬴政档案及“秦王政继位”搜索联动；三国5行、17个任期、6个事件按钮，公元220年定位、汉末→汉献帝→刘协档案及董卓入京事件联动。页面JS异常、`console.error`、错误级页面日志与网络失败均为0；Chrome内置GCM的 `DEPRECATED_ENDPOINT` 诊断不属于页面错误。
- 限制：真实Chrome自动化与截图抽查不等同实体移动设备触控、全量人工视觉／无障碍或打印验收；本轮未重新入库、未改史料或应用代码、未安装依赖、未在本地复跑139项测试，联网仅限GitHub部署状态与原站资源。

## 2026-10-20 四专题扩展发布检查

- 四份授权原件逐字节入库；完整散列、类别适配和复合事件限制见[入库记录](DYNASTY-INTAKE.md)；没有联网检查史实或访问史源页面。新增入口为 `wei-jin-nan-bei.html`、`sui-tang.html`、`liao-jin-song.html`、`ming.html`，七个入口共用应用与构建生成导航。
- `node --test --test-isolation=none tests/*.test.mjs tests/*.test.cjs`：233项通过、0失败、0跳过，旧周朝固定fixture不变；`node build.mjs --check` 与 `git diff --check` 用于提交前核对。
- `node tests/browser-presentation.mjs`：真实Chrome/155.0.8059.80、七页×1200/390宽度共14场景通过；新四页初始分别20/9/7/5视觉行，99/36/58/25条窗口内任期。覆盖详情、生平、姓名搜索、同年对照、行高展开且无事件／任期碰撞、长政权侧栏、短标签／放大年份、阅读恢复、分享及JSON导出；三国与明朝实际生成PDF Blob。页面JS异常与网络失败为0；自动截图抽查发现长政权换行溢出，修复后完整重跑。
- 发布清单包含七页、七个数据脚本、共享脚本／样式及 `corpus.json`。推送后须核对该提交对应的Actions成功、原站 `release.json` 与全部清单资源实际响应字节一致，再以HTTPS根地址重验14场景；实体触控、全量人工视觉／无障碍及纸面打印未据此验收。

## 2026-10-20 夏商、五代十国、元、清扩展发布检查

- 四份原件逐字节保留；散列、18条夏商争议纪年的继承限制、10对复合事件边及单个来源URL技术片段见[入库记录](EXPANSION-INTAKE.md)；没有联网核对史实。
- 导航扩展为11个入口，新页为 `xia-shang.html`、`five-dynasties.html`、`yuan.html`、`qing.html`；周朝旧路由和存储键不变。新增前七专题的固定投影散列基线（只排除导航catalog）全部通过；周朝原fixture不改。
- 全量289项回归通过，无失败、无跳过；`node build.mjs --check` 与 `git diff --check` 通过。
- 真实Chrome十一页×1200/390宽度共22场景通过；新四页初始分别5/11/11/6视觉行，53/59/25/19条任期。检查短标签、长政权侧栏、真实矩形无碰撞的密集事件展开、姓名搜索、详情、生平、同年对照、年份放大、分享、阅读恢复及JSON导出；夏商、三国、明、清还生成PDF Blob。页面JS异常与资源失败为0；Chrome自身更新器／GCM的stderr不作为页面错误。
- 出处索引显式区分两组异实体同ID（后凉／后梁、武周／吴周），保持原ID不改，按dataset身份取值，跨卷分享与组合拒绝误读。推送后须确认对应Actions成功，再运行 `node tests/verify-release.mjs` 比对原站发布清单与全部资源字节散列，并用原站HTTPS地址重验22场景。联网仅限原仓库部署服务与原站资源；未做实体触控、全量人工视觉、来源网页或纸面打印验收。

## 2026-10-21 P0 首屏与移动交互验收

- 全量Node测试316项通过，0失败、0跳过；包含旧周朝固定基线、既有七专题投影散列、全部入库原件散列、分享／阅读／专题隔离及显示／导出契约。
- [Playwright离线检查](<../tests/browser-p0.mjs>)：Chrome 155.0.8059.80，十一专题×375／390／768／1200／1440px共55场景通过；全部场景运行 `file://` 并禁网，无页面级横向溢出、页面脚本错误或HTTP(S)依赖请求。375／768px另检查筛选、排序、组合和导出对话框无内部横向溢出。
- 周朝375px用真实CDP触控输入验证惯性、第二指／取消中断、双指中心年份、参考线拖动与键盘、密集邻项消歧、三档抽屉／长详情滚动／下拉关闭；额外禁写存储上下文检查首次未聚焦Esc与帮助可用。
- [既有Chrome显示回归](<../tests/browser-presentation.mjs>)改为通过真实工具入口访问原工具；十一专题×1200／390px共22场景通过，覆盖事件分层／碰撞、原任期详情、搜索、筛选／固定／排序、阅读与分享，以及全部专题JSON和夏商／三国／明／清的实际PDF生成。报告内页面错误和资源失败均为0。
- 截图和报告保存在忽略提交的 `.validation/p0/`，可重复运行生成；`P0_TOPIC`／`P0_WIDTHS` 仅用于定位单个失败，默认完整55场景。

## 2026-10-21 P1 语义与可访问性验收

- 子进程权限恢复后，构建、生成物一致性及 `git diff --check` 通过；357项单元测试全部通过，无跳过。
- P1离线22场景（11专题×375／1200px）通过，包含全键盘链、看板、异说／史源、世系、对比度与无横向页面溢出；无页面脚本错误或HTTP(S)页面资源请求。
- axe-core 4.14.0使用默认全部启用规则，不覆盖任何规则配置：90份首页／看板／详情／世系／导出报告，serious／critical为0；仍有较低等级的heading-order提示，color-contrast、label-content-name-mismatch、aria-prohibited-attr的人工复核项保留在原始报告，不视为自动通过。
- Lighthouse 13.5.0：22场景Accessibility均为96分（满足≥95）。唯一扣分规则为target-size：密集图元按显示契约保留原18px／短任期矩形，P0的独立44px触控命中和多候选消歧不等同于DOM矩形满足WCAG 2.2尺寸规则；没有为取得分数禁用规则、忽略图元或扩大历史条带。
- P0共55场景（11专题×五种宽度）及原展示／分享／阅读／导出22场景全部通过，真实触控、双指、惯性和抽屉回归保留。报告见 `.validation/p1/`，不打包发布。

## 2026-10-21 阶段三发布能力本地验收

- 默认构建与 `--check` 通过；388项Node测试通过，无跳过，覆盖原史料散列、原链接快照、专题隔离、摘要复制与拒绝剪贴板、纠错转义、原快照兼容及十一专题静态输出。
- [发布浏览器验收](../tests/browser-publication.mjs)：十一专题×375／1200px共22组；每组分别检查禁用脚本后的完整年表／专题导航，以及启用脚本后的分享、实际JSON下载和纠错链接。离线运行，没有提交Issue。
- 既有P1浏览器验收22组、P0验收55组及既有呈现验收22组通过；本阶段未重新运行Lighthouse，不更新此前P1评分，也不宣称全面无障碍认证。
- 本地Chrome离线渲染11张PNG；在独立临时副本中验证PNG构建、同参数检查、全部元信息／清单与陈旧输入拒绝，不用可选测试覆盖当前默认SVG成果。
- 成果当时保留在本地，未提交、未推送、未更新线上站点。

## 阶段四：区间事件与跨卷导航本地验收（本地未发布）

- `node build.mjs`、`node build.mjs --check`、`git diff --check` 通过；普通隔离模式下全量Node测试439项通过、0失败、0跳过。
- 阶段四浏览器验收34场：十一真实专题×375/1200px共22场，五类区间及短祚微槽合成场景×两宽度共12场；包括区间中途命中、跨页续接、跨公元与年坐标0、低倍真实跨度、悬停／Tab提示、触控候选和真实跨卷往返。
- 既有回归全部通过：P0共55个响应式场景及触控／惯性操作、P1共22场、阶段三发布能力22场、原有十一专题浏览器回归22场。此次没有重新运行Lighthouse，不把此前分数作为本轮新测结果。
- 十一专题原件、旧点事件编译投影及周朝基线兼容检查通过；未手改发布目录，未提交、推送或部署。

## 2026-10-22 第二轮低风险文档清理

用户批准范围：C01–C04、C07、E01–E02。独立分支 `cleanup/2026-10-22`，保留工作区既有的阶段 A 与 BCD 改动，不清洗、不回滚。基线检查：`node build.mjs --check` 通过，`node --test` 514项通过、0失败、0跳过；117个脚本语法检查通过。

| 日期 | 清单编号 | 做了什么 | 原因 | 提交哈希 |
|---|---|---|---|---|
| 2026-10-22 | C01、C02、C03、C04、C07 | README 改为四模块工具栏并修正武周并唐行表述；架构说明改为十一专题、四模块工具栏及构建入口显式样式清单；P0／P1 同步模块口径；资料维护与样例说明补充 `endYear` 闭区间 | 当前说明滞后于已实施的四模块工具栏、十一专题与区间事件契约 | `1839bc7` |
| 2026-10-22 | E01、E02 | 将部署文档与 P0／P1／阶段三／阶段四的逐次验收数字迁入本文件；原文档保留当前命令、检查范围与限制 | 当前文档只保留“现在是什么、怎么用”，过程与验收摘要集中归档 | `1839bc7` |

本批提交为 `1839bc74d2a35be1a0cf27cf977d549054063299`，改动10份文档；提交前后 `node build.mjs --check` 与 `git diff --check` 通过，`node --test` 514项通过、0失败、0跳过。哈希由本次后续提交补记，未修改源码、测试或发布目录。

未处理：C05、C06 未获批准；`docs/PRESENTATION-CONTRACT.md` 的阶段 A 验收段属于工作区尚未提交的阶段 A 改动，迁移会与待提交内容纠缠，故保留原样，C06 的 B/C/D 状态描述同样未改。审查观察（不属本轮修复）：`tests/browser-p0.mjs:69` 仍断言五个 `[data-toolbar-group]`，与当前四模块模板不一致；`tests/timeline-era.test.cjs:4-5` 手工维护的应用源清单少于 `build.mjs` 实际加载清单。

## 2026-10-22 第三轮：当前职责措辞与测试观察

用户就上一轮建议答复“根据你的建议实施”，据此处理 C05、E03、E04 与两项审查观察；C06 仍不动（原因见下）。基线：`node build.mjs --check` 通过，`node --test` 514项通过、0失败、0跳过。

| 日期 | 清单编号 | 做了什么 | 原因 | 提交哈希 |
|---|---|---|---|---|
| 2026-10-22 | C05 | [时间与领域模型](TIME-DOMAIN-MIGRATION.md)去掉“第一轮迁移”的过程框架、126项旧验收数字与旧样例口径，改为当前编码、实体与兼容契约，并指向呈现契约的浏览器验收段 | 该文长期被当作当前说明引用，过程框架与现状混在一起 | `e9eadd4` |
| 2026-10-22 | E04 | README 的“新增正式资料／原件／新专题入口”与“本次未联网”改为当前措辞；架构说明三处“不自动提交／部署”改为人工构建发布规则；“由 Lead 接入／本任务不修改生产入口”改为指向 `lib/production.mjs` 的实际接线 | 生产入口早已接通，文档仍写委派与未接入状态 | `e9eadd4` |
| 2026-10-22 | E03（部分） | [四卷入库](DYNASTY-INTAKE.md)、[扩展入库](EXPANSION-INTAKE.md)、[正式入库](FORMAL-DATA-IMPORT.md)的委派分工与测试数字改为当前接线和基线指向 | “不提交、不构建、由 Lead 负责”已与事实相反 | `e9eadd4` |
| 2026-10-22 | 观察1 | [P0 脚本](<../tests/browser-p0.mjs>) 的工具栏组断言由五个改为四个并附失败提示 | 模板在 BCD 后为四个 `data-toolbar-group`，旧断言必然失败 | `fb366d5` |
| 2026-10-22 | 观察2 | [时间轴回归](<../tests/timeline-era.test.cjs>) 改为从 `build.mjs` 读取 `app.js` 源清单，不再手工维护25项 | 手工清单落后于构建实际加载的32项，测试成功不代表生产组合 | `fb366d5` |

本批提交为 `e9eadd4`（8份文档）与 `fb366d5`（2份测试）；提交前后 `node build.mjs --check` 与 `git diff --check` 通过，`node --test` 514项通过、0失败、0跳过。`docs/DYNASTY-DISPLAY.md` 只提交了第8行这一处 hunk，其余阶段 A 改动仍留在工作区，未纳入任何清理提交。未修改源码、发布目录或史料。

未处理：C06（[呈现契约](PRESENTATION-CONTRACT.md)的 B/C/D 状态句位于工作区尚未提交的阶段 A 验收段内，单独改写会与待提交内容纠缠，留待阶段 A 一并提交）；E03 的[扩展审计附录](EXPANSION-INTAKE.md)差异快照按审计价值原样保留，归档粒度仍未确认。新发现：真实浏览器 P0 脚本在本批修复断言后仍失败于“44px controls”检查，实测专题导航链接为 42×44，属既有布局差异而非本批引入，未修。

| 2026-10-22 | 重构基线 | 独立分支保存全部既有工作区修改，514 项测试及构建检查通过 | 保留原有工作并隔离重构提交 | `1d4c0e6` |
| 2026-10-22 | AR04 | 阅读横向偏移按专题范围和缩放校验，覆盖同宽、跨宽及夏商实际记录恢复；518 项测试、构建检查通过 | 高倍缩放阅读位置被固定像素上限截断 | `c0519fd` |

| 2026-10-22 | AR03 | 生成工具仅写纯数据，手写算法独立；构建校验数据新鲜度，十一专题有效资料散列与轨迹行为保持一致；522 项测试及构建检查通过 | 防止重新生成覆盖运行时逻辑；特征测试先独立提交 `d52287f` | `8fb0dd0` |

| 2026-10-22 | AR01 | 构建期统一补充传记、人物统计、出处及跨卷导航，页面不再注入；527 项测试及构建检查通过 | 统一资料入口；55 处未关联引用（50 事件、5 政权）保留原文并诊断；首次验证因两项旧发布契约失败已回滚，原件与有效发布投影分别校验，原件散列不变，测试调整单独提交 `d82e119` | `0201e13` |

| 2026-10-22 | AR02 | 人物活动由共享只读投影归一化；同年看板纳入明确年份，轨迹及定位保留叙事优先级，重复项保留全部出处；532 项测试及构建检查通过 | 修复王安石 1070 年等章节活动在同年看板缺失，不推断未知日期或连续活跃期 | `58ea459` |

| 2026-10-22 | AR05 | Playwright 通过页面按钮覆盖十一专题×390/1200px 的画廊、核心筛选、详情、清除、分类、Esc及主题持久化，22 场景通过；532 项 Node 测试、生成数据与构建检查通过；接入默认 CI | 轻量 DOM 只验证状态，真实入口独立验证；浏览器使用本机 Chrome，远端 CI 尚未运行 | `02c4425` |

AR05 验证过程：额外探测年份浮层时发现 390px 下浮层遮挡画廊按钮，已回滚测试步骤；正式画廊检查使用默认关闭浮层的状态，不修改此范围外界面问题。另一次回滚纠正了观察字段：真实浏览器读取 navigation.key，而非仅测试桩提供的 currentDetailKey。未采用强制点击、关闭断言或业务代码修改掩盖失败。

待后续处理：390px 下展开年份编辑浮层后，画廊按钮中心被 #yearEra 遮挡；可先按 Esc 收起年份浮层，再打开画廊。本轮未修复此范围外问题。

| 2026-10-22 | AR02 复核 | 去重只依据显式 ID、事件和对应章节，不因文案相同合并不同活动；533 项 Node 测试、22 个真实浏览器场景、传记数据及构建检查通过 | 避免独立活动被误合并，原始专题及传记总集文件均未修改；本轮未合并、推送或部署 | `ff3ac49` |

## 2026-10-22 传记引用核对

仅调整引用 ID、显式专题作用域和未收录状态，章节叙述、日期、人物及来源保持不变；复合事件关联不令章节继承事件锚点年份。原 55 处诊断的逐项处置如下。

| 专题 | 原路径 | 原引用 | 处理 | 目标 |
|---|---|---|---|---|
| xia-shang | `/dynasties/0/figures/0/biographyPlan/chapters/1/eventId` | `xs-event-04-mingtiao-shang-founding` | local | `xs-event-05-mingtiao-tang-founding-shang` |
| xia-shang | `/dynasties/0/figures/0/biographyPlan/chapters/2/eventId` | `xs-event-05-yiyin-taijia-tonggong` | local | `xs-event-06-yiyin-taijia-taiwu` |
| xia-shang | `/dynasties/0/figures/1/biographyPlan/chapters/2/eventId` | `xs-event-13-muye-fall-of-shang` | local | `xs-event-13-muye-zhou-conquest-shang` |
| xia-shang | `/dynasties/0/figures/2/biographyPlan/chapters/0/eventId` | `xs-event-13-muye-fall-of-shang` | local | `xs-event-13-muye-zhou-conquest-shang` |
| qin-han | `/dynasties/2/figures/2/biographyPlan/chapters/1/eventId` | `qh-event-02-jianzhuke` | local | `qh-event-03-jianzhuke` |
| qin-han | `/dynasties/2/figures/2/biographyPlan/chapters/2/eventId` | `qh-event-03-qin-unification` | local | `qh-event-07-unification` |
| qin-han | `/dynasties/2/figures/2/biographyPlan/chapters/3/eventId` | `qh-event-05-shaqiu-coup` | local | `qh-event-10-shaqiu` |
| qin-han | `/dynasties/2/figures/3/biographyPlan/chapters/1/eventId` | `qh-event-07-hongmen-feast` | local | `qh-event-13-qin-fall` |
| qin-han | `/dynasties/2/figures/4/biographyPlan/chapters/1/eventId` | `qh-event-10-baideng` | local | `qh-event-15-baideng` |
| qin-han | `/dynasties/2/figures/4/biographyPlan/chapters/3/eventId` | `qh-event-11-zhulv-wendi` | local | `qh-event-16-zhulv` |
| qin-han | `/dynasties/2/figures/5/biographyPlan/chapters/3/eventId` | `qh-event-12-seven-states` | local | `qh-event-17-qiguo` |
| qin-han | `/dynasties/2/figures/7/biographyPlan/chapters/2/eventId` | `qh-event-15-huoguang-xuandi` | unindexed | 保留叙述，未单列事件 |
| three-kingdoms | `/dynasties/3/figures/1/biographyPlan/chapters/0/eventId` | `tk-event-04-longzhong-chibi` | local | `tk-event-05-longzhong` |
| three-kingdoms | `/dynasties/3/figures/1/biographyPlan/chapters/2/eventId` | `tk-event-10-yiling` | local | `tk-event-14-baidicheng` |
| three-kingdoms | `/dynasties/3/figures/1/biographyPlan/chapters/4/eventId` | `tk-event-13-wuzhangyuan` | local | `tk-event-17-wuzhangyuan` |
| three-kingdoms | `/dynasties/3/figures/2/biographyPlan/chapters/2/eventId` | `tk-event-13-wuzhangyuan` | local | `tk-event-17-wuzhangyuan` |
| three-kingdoms | `/dynasties/3/figures/2/biographyPlan/chapters/4/eventId` | `tk-event-15-gaopingling` | local | `tk-event-19-gaopingling` |
| wei-jin-nan-bei | `/dynasties/4/figures/0/biographyPlan/chapters/1/eventId` | `wj-event-04-eastern-jin-founding` | local | `wj-event-06-eastern-jin-founding` |
| wei-jin-nan-bei | `/dynasties/4/figures/1/biographyPlan/chapters/2/eventId` | `wj-event-10-feishui` | local | `wj-event-10-battle-of-feishui` |
| wei-jin-nan-bei | `/dynasties/4/figures/2/biographyPlan/chapters/2/eventId` | `wj-event-13-northern-wei-unification` | local | `wj-event-14-taiwudi-unify-north` |
| wei-jin-nan-bei | `/dynasties/4/figures/3/biographyPlan/chapters/0/polityId` | `eastern-han` | external | `eastern-han` |
| wei-jin-nan-bei | `/dynasties/4/figures/3/biographyPlan/chapters/1/polityId` | `cao-wei` | external | `cao-wei` |
| wei-jin-nan-bei | `/dynasties/4/figures/3/biographyPlan/chapters/2/eventId` | `tk-event-13-wuzhangyuan` | external | `tk-event-17-wuzhangyuan` |
| wei-jin-nan-bei | `/dynasties/4/figures/3/biographyPlan/chapters/2/polityId` | `cao-wei` | external | `cao-wei` |
| wei-jin-nan-bei | `/dynasties/4/figures/3/biographyPlan/chapters/3/polityId` | `cao-wei` | external | `cao-wei` |
| wei-jin-nan-bei | `/dynasties/4/figures/3/biographyPlan/chapters/4/eventId` | `tk-event-15-gaopingling` | external | `tk-event-19-gaopingling` |
| wei-jin-nan-bei | `/dynasties/4/figures/3/biographyPlan/chapters/4/polityId` | `cao-wei` | external | `cao-wei` |
| sui-tang | `/dynasties/5/figures/0/biographyPlan/chapters/3/eventId` | `st-event-06-taizong-khan-xuanzang` | local | `st-event-08-xuanzang-west-journey` |
| sui-tang | `/dynasties/5/figures/1/biographyPlan/chapters/2/eventId` | `st-event-09-wu-zhou-shenlong` | local | `st-event-10-wuzhou-dianshi-shenlong` |
| sui-tang | `/dynasties/5/figures/2/biographyPlan/chapters/3/eventId` | `st-event-11-an-shi-rebellion` | local | `st-event-12-talas-an-shi-rebellion` |
| sui-tang | `/dynasties/5/figures/3/biographyPlan/chapters/2/eventId` | `st-event-11-an-shi-rebellion` | local | `st-event-12-talas-an-shi-rebellion` |
| sui-tang | `/dynasties/5/figures/4/biographyPlan/chapters/0/eventId` | `st-event-11-an-shi-rebellion` | local | `st-event-12-talas-an-shi-rebellion` |
| sui-tang | `/dynasties/5/figures/6/biographyPlan/chapters/1/eventId` | `st-event-03-yangdi-canal-western-regions` | unindexed | 保留叙述，未单列事件 |
| sui-tang | `/dynasties/5/figures/7/biographyPlan/chapters/1/eventId` | `st-event-11-an-shi-rebellion` | local | `st-event-12-talas-an-shi-rebellion` |
| five-dynasties | `/dynasties/6/figures/0/biographyPlan/chapters/2/eventId` | `wd-event-04-khitan-enter-bianliang` | local | `wd-event-04-yanyun-later-jin-khitan` |
| liao-jin-song | `/dynasties/7/figures/0/biographyPlan/chapters/2/eventId` | `sl-event-04-western-xia-qingli` | local | `sl-event-04-yuanhao-xia-qingli-reforms` |
| liao-jin-song | `/dynasties/7/figures/1/biographyPlan/chapters/1/eventId` | `sl-event-05-wang-anshi-reform` | local | `sl-event-05-wang-anshi-reforms-yuanyou` |
| liao-jin-song | `/dynasties/7/figures/2/biographyPlan/chapters/1/eventId` | `sl-event-05-wang-anshi-reform` | local | `sl-event-05-wang-anshi-reforms-yuanyou` |
| liao-jin-song | `/dynasties/7/figures/6/biographyPlan/chapters/3/eventId` | `sl-event-09-mongol-conquest-jin` | local | `sl-event-11-mongol-conquer-xia-jin` |
| yuan | `/dynasties/8/figures/0/biographyPlan/chapters/3/eventId` | `sl-event-09-mongol-conquest-jin` | local | `yuan-event-02-ogedei-chucai-conquer-jin` |
| yuan | `/dynasties/8/figures/1/biographyPlan/chapters/2/eventId` | `yuan-event-03-kublai-kaiping-yuan` | local | `yuan-event-04-kublai-found-yuan-unification` |
| yuan | `/dynasties/8/figures/2/biographyPlan/chapters/2/eventId` | `yuan-event-05-shoushi-calendar` | local | `yuan-event-05-province-xuanzhengyuan-shoushili` |
| yuan | `/dynasties/8/figures/4/biographyPlan/chapters/1/eventId` | `yuan-event-06-yanyou-civil-exams` | local | `yuan-event-06-yanyou-keju-zhizhi-tianli` |
| ming | `/dynasties/9/figures/0/biographyPlan/chapters/1/eventId` | `ming-event-02-jingnan-yongle` | local | `ming-event-02-jingnan-yongle-beijing` |
| ming | `/dynasties/9/figures/1/biographyPlan/chapters/1/eventId` | `ming-event-04-tumubao-beijing-defense` | local | `ming-event-04-tumu-crisis-beijing-defense` |
| ming | `/dynasties/9/figures/2/biographyPlan/chapters/1/eventId` | `ming-event-05-wang-yangming-ningwang` | local | `ming-event-05-hongzhi-yangming-daliyi` |
| ming | `/dynasties/9/figures/4/biographyPlan/chapters/1/eventId` | `ming-event-06-longqing-peace-wanli-reforms` | local | `ming-event-06-wokou-longqing-altan` |
| ming | `/dynasties/9/figures/5/biographyPlan/chapters/1/eventId` | `ming-event-07-wanli-campaigns-donglin-liaodong` | local | `ming-event-08-sarhu-ningyuan-jiashen` |
| qing | `/dynasties/10/figures/0/biographyPlan/chapters/1/eventId` | `qing-event-05-yongzheng-reforms-junjichu` | local | `qing-event-04-yongzheng-junjichu-tandingerumu` |
| qing | `/dynasties/10/figures/2/biographyPlan/chapters/1/eventId` | `qing-event-07-taiping-tianguo-xiangjun` | local | `qing-event-07-taiping-second-opium-war-xinyou` |
| qing | `/dynasties/10/figures/2/biographyPlan/chapters/4/eventId` | `qing-event-08-yangwu-xinjiang-sino-japanese` | local | `qing-event-08-yangwu-recover-xinjiang` |
| qing | `/dynasties/10/figures/3/biographyPlan/chapters/1/eventId` | `qing-event-08-yangwu-xinjiang-sino-japanese` | local | `qing-event-08-yangwu-recover-xinjiang` |
| qing | `/dynasties/10/figures/3/biographyPlan/chapters/4/eventId` | `qing-event-10-boxer-xinhai-abdication` | local | `qing-event-09-jiawu-wuxu-xinhai-abdication` |
| qing | `/dynasties/10/figures/4/biographyPlan/chapters/3/eventId` | `qing-event-08-yangwu-xinjiang-sino-japanese` | local | `qing-event-08-yangwu-recover-xinjiang` |
| qing | `/dynasties/10/figures/5/biographyPlan/chapters/2/eventId` | `qing-event-02-shanhaiguan-beijing-entry` | local | `qing-event-02-shanhaiguan-conquest` |

| 2026-10-22 | 后续问题 | 46 处引用改为现有 ID，7 处显式跨专题，2 处保留叙述并声明未单列事件；构建阻止未处理引用；窄屏年份编辑区使用正常布局，专题外章节不联动本地时间轴 | 消除悬空关联及年份浮层遮挡；538 项测试、22 个含浮层开启步骤的真实浏览器场景及构建检查通过，叙述、日期与来源散列保持一致 | `83ae682` |

## 2026-10-22 文档归档与当前状态整理

实施计划、入库过程、历史验收数字和原始差异快照统一归档。以下快照保留原技术资料及历史上下文；其中的部署状态和待办只代表原文写作时刻。原始字节可由 Git 的 `774069e:docs/文件名` 恢复；归档正文仅更新指向同批退役文档的链接。

<a id="archive-bcd-implementation-plan"></a>

### BCD-IMPLEMENTATION-PLAN.md

原文 SHA-256：`83251bbb06df0074572c9635d8ac98efc57adf122fb058858ed68f3261244e7d`。该独立文档已归档。

<details>
<summary>展开归档正文</summary>

# 阶段 B/C/D 实施与保留计划

用户已确认实施无冲突部分（2026-10-22）。以阶段 A 的 486 项测试、22 个离线 Chrome 场景为兼容基线；保持史料、稳定 ID、存储键、分享协议和零第三方运行时依赖。发布产物只经 `node build.mjs` 生成。

## 本轮实施

- B：11 专题导航独立一层，主工具栏按搜索、年份/缩放、人物/政权/设置入口、导出/分享四模块布局。唯一固定位置的“视图设置”开关；删除内部关闭按钮，Esc 和画布空白关闭，不接管详情弹窗或拖动手势。年份胶囊支持前后年、点击编辑；搜索支持上下选择/Enter；“同年对照”统一一个操作入口；“全览”改“全景”。设置收纳行高、密度、分期、研究组合和历史。
- C：仅从当前专题已挂载的人物记录构建独立画廊，按稳定 ID 去重；四分类依已有分类字段，核心依已有精选标记，隐藏空卡片。姓名直达已有传记与轨迹，类别/人物高亮有工具栏清除签。清除只撤销高亮/淡化，不擅自清空用户筛选和阅读状态。
- D：构建与运行时共享 11 专题品牌映射；短标题、独立 Logo/副标题/标语与不足 100 字简介；资料徽章打开完整范围/校核说明和用户自行提交的纠错入口。增加宣纸/玄青明暗主题和古典显示色，原始史料颜色不回写；固定政权列及日期小字。正文、条带和淡化态均验证 WCAG AA。

## 暂不实施，保留待确认

1. **65% 减量的绝对承诺**：11 朝代标签、胶囊内前后年与缩放按钮是否计数尚未固定，且全部计入可能与必备控件冲突。本轮只实施结构瘦身，报告独立入口/真实控件数，不伪报减量比例，也不为数字隐藏必需操作。
2. **缺失传记章节、活动年份和分类的补造**：不以用户示例代替本卷资料；不足五章保留实际章数，无分类的记录不猜测归类。待补充可靠来源后另行处理。
3. **“精选原典”作为全量史实认证**：现有资料兼含原典、年表和汇编。本轮徽章使用“原典与年表整理”，完整校核限制继续提供；不提升为全部独立核验。
4. **金色文字与无条件透明淡化**：指定亮金用于描边、轨迹、参考线；浅底正文使用达标墨色。淡化使用对比度可测的中性底色，不以整体透明度牺牲文字可读性。

## 验收

- `node build.mjs --check`、`node --test` 全量。
- 11 专题 × 桌面/手机的离线浏览器检查：品牌隔离、单点设置开关/Esc/空白关闭、画廊人数及空分类、人物详情/轨迹/清除签、年份与搜索键盘、政权筛选和阶段 A 默认值。
- 明暗主题实际文字合成色对比度 ≥ 4.5:1；固定列横滚位置和移动端溢出检查。
- 旧阅读、组合、分享与返回导航回归；不提交或部署，除非用户另行要求。


</details>

<a id="archive-formal-data-import"></a>

### FORMAL-DATA-IMPORT.md

原文 SHA-256：`b711a8c7fca1fd9fb19fd4c9dfff328ca090c20469470df7931057282b44738c`。该独立文档已归档。

<details>
<summary>展开归档正文</summary>

# 秦汉、三国正式入库（2026-10-19）

## 输入及覆盖

两份用户原文件可以读取，已按字节复制到生产数据目录，未以样例代替。未联网搜索、查阅或核对历史事实；`reviewStatus` 和史源链接均沿用用户输入，不代表本次另行校核。

| 用户文件 | 仓库入口 | SHA-256 |
|---|---|---|
| `C:\Users\Yui\Downloads\秦汉.json` | [秦汉](<../data/qin-han.json>) | `472c34323d4595b549c4a5beaf16cb02cc0954c96666464b7f52c35f6fe369b2` |
| `C:\Users\Yui\Downloads\三国.json` | [三国](<../data/three-kingdoms.json>) | `123db0ae57aea7a0319d540cc52313acd455575d7e6d07b644898ce16ead4fa2` |

| 专题 | 政权 | 人物 | 任期 | 时期 | 事件 | 活动 | 来源 |
|---|---:|---:|---:|---:|---:|---:|---:|
| 秦汉 | 8 | 78 | 74 | 7 | 32 | 19 | 79 |
| 三国 | 5 | 51 | 17 | 5 | 23 | 19 | 32 |

秦汉窗口前247年至公元220年，三国窗口公元189—280年。原文件中窗口以外的秦任期等完整保留，时间范围查询/导出只选择相交条目，不虚构被截断的日期。

## 可审计的结构适配

原始 JSON 完整保留。新增的 [生产投影适配](<../lib/production.mjs>) 在克隆副本中添加明确注释，不猜测姓名、不改日期、不新增未经输入提供的历史事实：

1. **承位与元年分开**：`qin-r35` 前247年承位/前246年元年、`qh-tenure-han-pingdi` 前1年承位/公元1年元年、`tk-tenure-cao-rui` 公元226年承位/227年元年、`tk-tenure-cao-fang` 公元239年承位/240年元年。schema 2 允许起点等于承位、元年在任期内；schema 1 原严格规则不变。
2. **巨鹿参与者身份**：`qh-event-12-julu` 中项羽的 `western-chu` 关联只表示原文件人物身份上下文，注记 `affiliationScope:contextual`，保留关系与来源，但不反向将西楚加入该事件涉及政权列表。卡片显示说明。
3. **汉末任职/执政不等于汉帝统治**：`tk-tenure-caocao-foundation`、`tk-tenure-liubei-hanzhong`、`tk-tenure-sunquan-early` 注记 `polityAssociation:contextual`。原任期和东汉结束日期分别保留；条带采用特殊虚线/斜纹、详情与图形文字索引附说明，同年君主对照不将其冒充东汉皇帝。仅这类明确标注、与政权相交且附说明的区间可跨政权终点。
4. 输入使用的 `founder`、`accession`、`politics` 等活动类型纳入校验，不改变记录内容。
5. 正式事件仅有完整四段叙事，运行时将其合成为摘要，避免图形导出遗漏正文；任期详情通过显式 `personId` 显示对应人物简介与人物档案入口。原始输入仍不增加派生字段。

共享的 `eastern-han`、`qh-person-liu-xie`、`qh-person-dong-zhuo`、`qh-tenure-han-xiandi` 等 ID 原样保留。各专题描述存在上下文差别，不粗暴覆盖成统一文案。周朝 `qin/wei` 等已发布 ID 与旧投影日期不变；秦汉中完整秦政权和周朝的诸侯阶段投影并存，不能直接把所有专题数组相加当作去重历史总量。

## ADR：采用共用应用、独立静态专题入口

**状态：已接受。**

- **背景**：需正式入库两个跨度重叠、含跨公元日期的专题，同时保留周朝入口、旧分享链接、浏览器阅读和导出兼容。
- **方案A（采用）**：共用应用及领域代码，构建独立 HTML / 数据资源。根路径继续周朝；新增 `qin-han.html` 与 `three-kingdoms.html`。专题导航在每页可见，整个发布目录离线可用。
- **方案B**：把三份资料合并成单一运行时全集、用 URL 参数切换。优点是跨专题聚合查询方便；代价是当前存在的阶段描述、同 ID 投影差异需要全面建模，易破坏周朝既有链接与阅读状态，且增加初始加载。
- **影响**：方案A简单可逆、旧根路径完全保留，但不提供“所有时期同时叠图”。未来若业务确需全集查询，可在稳定 ID 上建立去重索引，不改变既有专题入口。

## 兼容与发布产物

- 周朝数据投影继续与原 `serializeAtlas` 一致；原国家、人物、未定位君主路由不改名。
- 周朝存储仍使用原键；秦汉与三国的布局、固定行、组合、阅读和访问记录通过专题命名空间隔离。
- 新专题分享 Hash 与组合 JSON 带专题标识，拒绝在错误专题中误解；原周朝 v1/v2 分享和无专题标记的组合继续可读。
- JSON 对照快照为新专题增加 `datasetId`；PDF、PNG/ZIP沿用原导出接口与来源索引。
- [发布清单](<../dist/release.json>) 包含三个入口的源码输入散列、资源散列和覆盖计数；仅记录可公开资料，不含凭证。

## 验证及限制

正式输入测试覆盖输入散列、全实体详情、1200/390像素DOM边界、跨元时间、分期、搜索、查询、结构化导出、存储隔离、分享和组合专题标记；测试使用生产资料，而非结构样例。测试数量随功能演进，当前基线见[根说明](../README.md#维护与检查)。

早期真实Chrome尝试曾被会话权限阻断（`crashpad_client_win.cc:430 OpenProcess: 拒绝访问。 (0x5)`、`crash server failed to launch, self-terminating`）。2026-10-19权限允许后已完成真实 `Chrome/155.0.8059.80` headless/CDP原站验收：周朝、秦汉、三国各1200×900与390×900，共6个场景通过，未捕获页面JS异常、控制台错误或网络加载失败。两个新专题均显示实际时间线；已验证定位公元1年/220年、政权与任期详情、显式人物档案入口、事件搜索及图上联动。此前“真实浏览器未验收”的限制已解除，详细数量、在线资源SHA-256和部署成功证据见[部署记录](<DEPLOYMENT.md>)。

入库没有修改史料或应用代码，也不安装依赖；验收记录按当时的测试与浏览器验证分别保存，不混同。仍未完成实体移动设备触控、完整人工视觉/无障碍及打印验收，也未在真实浏览器重验所有导出格式，不能以截图抽查或既有自动化测试代替这些项目。未联网校核史料或打开史源链接；原文件的审核状态不变。


</details>

<a id="archive-dynasty-intake"></a>

### DYNASTY-INTAKE.md

原文 SHA-256：`26f2d1cd27c594e1b57a9f5a7dda1b5493344ef026400dba790cbcf03ea9f8be`。该独立文档已归档。

<details>
<summary>展开归档正文</summary>

# 四份 Schema 2 正式资料入库记录

## 边界与结论

- 2026-10-20 接收用户授权本地原件，未联网、未校勘史实、未改日期或实体 ID、未按姓名合并、未补造人物或关系。
- 原件目录：`C:\Users\Yui\Downloads\drive-download-20261020T103621Z-1-001\`；以下四份采用字节复制，不重新序列化。
- 直接校验原件均在首个不支持的活动类别处失败。仅通过独立技术投影兼容；基础校验器不修改。四份投影已通过 `validateAtlas` 和 `compileAtlas`。
- 入库范围是四份新数据、[注解模块](../lib/production-annotations.mjs)、[针对性测试](../tests/dynasty-intake.test.mjs)与本文档；页面、导航与生产接入已在[生产入口](../lib/production.mjs)接通，构建与发布只由人工执行。

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


</details>

<a id="archive-expansion-intake"></a>

### EXPANSION-INTAKE.md

原文 SHA-256：`05c1c8de3eb51443527e31e2014c98a52eb9b9fe2301e727f94bfa5dfb43633f`。该独立文档已归档。

<details>
<summary>展开归档正文</summary>

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


</details>

<a id="archive-p0-interface"></a>

### P0-INTERFACE.md

原文 SHA-256：`eb0ec6703b8501b8d832f1de9c9b1cb709dcd48aebc3f15833e12c3bef8ac030`。该独立文档已归档。

<details>
<summary>展开归档正文</summary>

# P0 首屏与移动交互交付

2026-10-21，本地实现与离线验收。**本轮未推送或部署线上站点。**

## 已实现

1. 一级工具分为搜索、时间（年份与缩放）、政权与视图入口、导出／分享四个模块；专题切换条独立于工具栏。行高、视窗、密度、研究组合、阅读与帮助保留在默认折叠的视图设置面板中；筛选与排序入口在政权模块内，原有控件ID未删除。
2. 三步非模态引导，支持Tab／Enter、跳过、Esc及帮助中重看。完成或跳过后刷新不重复出现。新增独立全站偏好键 `zhou-ui-v1` 只保存高级区开合与引导版本；旧阅读／布局／组合键及专题隔离不变。禁写存储不阻止使用，显示保存失败说明。
3. 十一专题横向时代标签、当前项自动居中、上一／下一时期、方向键／Home／End浏览标签；首尾入口正确禁用。专题窗口与实体身份不变。
4. 单指双轴拖动和惯性、双指中心锚定缩放，取消或新手势终止旧惯性；沿用0.8—24px／年范围。金色参考线使用44px透明手柄并支持键盘逐年／十年调整；小年份徽标和细线保留。
5. 普通按钮至少44×44px；密集图元保留原几何，通过虚拟命中区与邻项选择列表解决触控冲突，最后调用原按钮。列表支持键盘选择、Esc／取消与外点退出。
6. 小于768px时原生详情dialog成为35／60／90dvh底部抽屉，支持按钮、键盘换档和手柄拖动／下拉关闭；保留原滚动容器、史源、导航返回、焦点、阅读恢复及关闭回调。768px及以上沿用桌面详情。

## 文件边界

- [模板](<../src/index.html>)、[界面体验及偏好](<../src/ui/experience.js>)、[局部界面样式](<../src/ui/experience.css>)。
- [手势](<../src/ui/gestures.js>)与[手势样式](<../src/ui/gestures.css>)。
- [详情抽屉](<../src/ui/detail-sheet.js>)与[抽屉样式](<../src/ui/detail-sheet.css>)。
- [页面控件](<../src/ui/controls.js>)、[时间线](<../src/ui/timeline.js>)、[详情导航](<../src/ui/navigation-details.js>)、[应用状态连接](<../src/app.js>)、[启动连接](<../src/startup.js>)、[构建入口](<../build.mjs>)。
- [开发依赖](<../package.json>)、[依赖锁定](<../package-lock.json>)仅用于Playwright验收；构建和发布无第三方运行时依赖。

史料、构建期入库／领域库、分享字段、既有存储键、接续分组、短标签及图页导出逻辑均未改动。发布目录只由构建生成，没有手改。

## 验收命令与检查范围

```sh
node build.mjs
node build.mjs --check
node --test tests/*.test.mjs tests/*.test.cjs
node tests/browser-p0.mjs
node tests/browser-presentation.mjs
git diff --check
```

最近一轮本地验收的测试数量、浏览器场景结果与设备条件已归档到[操作历史](HISTORY.md)。

- 每个场景检查四模块首屏、视图设置默认折叠／持久化、纯键盘走完引导／刷新不重复、重看／Esc、当前专题可见、普通控件44px、缩放重置、完整详情与断点。
- 375／768px额外检查筛选、排序、组合和导出对话框没有内部横向溢出。
- 周朝375px使用真实CDP触控输入验证惯性、第二指／取消中断、双指中心年份、参考线拖动与键盘、真实密集邻项消歧、三档抽屉／长详情滚动／下拉关闭；额外禁写存储上下文检查首次未聚焦Esc与帮助可用。
- [既有Chrome显示回归](<../tests/browser-presentation.mjs>)从真实工具入口访问原功能，覆盖事件分层／碰撞、原任期详情、搜索、筛选／固定／排序、阅读与分享，以及各专题JSON和夏商／三国／明／清的实际PDF生成；浏览器自身更新器／GCM诊断不属于页面错误。
- 截图和报告保存在忽略提交的 `.validation/p0/`，可重复运行生成。可选 `P0_TOPIC`／`P0_WIDTHS` 仅用于定位单个失败；默认完整55场景。

## 验收限制

真实桌面Chrome的响应式与触控协议自动化不等同于实体手机操作；尚未进行iOS Safari／Android实体设备手工验收或辅助技术全面审查。保留原生dialog可访问性及可见键盘焦点。此次没有进行历史事实核验，也没有改变原线上站点。


</details>

<a id="archive-p1-semantics"></a>

### P1-SEMANTICS.md

原文 SHA-256：`ed57b37fbfaa88a2c194f558077f393017eb1272c3d2663936d2b2e208f08654`。该独立文档已归档。

<details>
<summary>展开归档正文</summary>

# P1 时间轴语义与可访问性

## 边界

- 历史原件、实体 ID、时间坐标、定／推／异语义、专题隔离和旧链接/阅读/组合键不变。
- 事件图标、看板与世系入口仅为投影；接续共行不是身份合并，连线不是新增参与关系。
- 发布页无第三方运行时依赖，所有新增脚本与样式仍由 `node build.mjs` 生成；不得手改 dist。
- 本阶段不自动提交或部署。保留此前未提交的 P0 工作及其兼容行为；P1 仅在其上增加语义和可访问性。

## 功能

### 事件

五类事件保留类别色彩，并辅以政治（建筑）、战争（交叉剑）、改革（调节杆）、外交（链环）、文化（书本）图标及完整文字可访问名称。未知类别使用中性图标，绝不归入某个历史类别。混合聚类保留类别组合与全部事件 ID。

关键事件的原名称在空间允许时优先展示，不新增“历史短名”；不足时聚类，悬停与键盘焦点提供完整名称。事件标记仍沿用 18px 高度、22px 车道节距与 P0 独立的 44px 密集命中消歧。

多政权引导线只对应原事件关联：点表示可见相关泳道，虚线可经过不相关行而不表示其参与；提示显示被筛选或滚出视窗的关联数量。

### 同年天下速览

位于时间模块，展开到现有同年对照区域，不新增工具栏模块。看板枚举当前专题全部存续政权，不受时间轴勾选项影响；原对照卡仍反映当前可见选择。

- 君主名单重用历史查询，尊重中断、contextual 任职与同年交替，不把“当年在位”解释为“亲自参与事件”。
- 年次只用明确 `chronology.regnalStart`。采用 bce-axis 连续坐标计算 `regnalStart - year + 1`，CE1 坐标 0 是有效年份；元年前和缺失分别提示，不从条带起点补造元年。
- 人物仅列 journey 中明确系于当年的活动，不能由生卒、分散事迹或任职关系推导连续活跃期。
- 点击原稳定详情键，沿用详情返回与滚动位置保存。更新年份时不抢外部焦点；看板内原按钮消失时退回标题。

### 纪年与世系

推定条带的柔和端部装饰限于原矩形内，不改变实际日期。异说面板同时列出本图定位与已有 alternatives，展示原说明、史源、缺失端点和旧资料不足双口径的边界；不把某替代口径自动认定为采用值。

未定年胶囊打开国家详情中的按原序链条。条目仍用原稳定 ID 和已有 undated 路由，不据列表次序或国家存续线给先公补定年。

### 键盘与对比度

- 所有链接、按钮、输入、summary 和可聚焦区域有统一可见焦点环。
- 详情沿用原生 dialog 和返回栈；其他原生模态框与高级设置在自身边界循环 Tab，Esc 关闭/返回原触发点；程序跳转到章节后可自然 Tab 到其中史源。
- `Alt+Y` 聚焦金色参考线，左右键逐年，Shift+方向键十年，Home/End 到边界；`Alt+E` 打开导出。输入框的浏览器本地快捷键可能受系统设置影响，仍保留普通 Tab 入口。
- 集中 polite 状态区延迟合并键盘年份播报与详情变化，拖动不连续刷屏。
- 类别/政权原色保留，彩色条带前景按实际背景选择黑/白；条带文字使用实色底，不让推定斜线降低文字对比度。搜索使用匹配边框而非低透明文字。
- 减少动态效果偏好禁用平滑滚动、过渡及松手惯性，单指直接拖动和双指直接缩放仍可用。

## 验收命令

```sh
node build.mjs
node build.mjs --check
node --test tests/*.test.mjs tests/*.test.cjs
# Windows 受子进程限制时：
node --test --test-isolation=none tests/*.test.mjs tests/*.test.cjs
node tests/browser-p1.mjs
node tests/lighthouse-p1.mjs
node tests/browser-p0.mjs
node tests/browser-presentation.mjs
```

Playwright、axe-core 与 Lighthouse 均为开发依赖，不进入 dist。P1 浏览器在 file://、断网条件下检查 11 专题；Lighthouse 仅临时启动回环地址静态服务，不是线上部署。审计 JSON 与截图放 `.validation/p1/`，该目录不作为史料或发布资产。

## 验收记录

2026-10-21的单元测试数量、P1／P0／既有呈现三组浏览器场景、axe-core 与 Lighthouse 结果已归档到[操作历史](HISTORY.md)。本机报告在忽略提交的 `.validation/p1/`，不打包发布。

自动审计及模拟触控不等于完整 WCAG 认证，也不替代读屏软件、真实设备和上述人工复核项检查。


</details>

<a id="archive-stage3-publication"></a>

### STAGE3-PUBLICATION.md

原文 SHA-256：`353bd20d73f61c74012a6736a4f2ae11b2e082d0d0f3384663c0043403eb3d16`。该独立文档已归档。

<details>
<summary>展开归档正文</summary>

# 阶段三：可检索、可分享与资料反馈

## 范围与不变项

本阶段在已完成的P0/P1之上增加发布呈现与反馈入口。史料原件、定／推／异口径、显示分组、原始ID、专题隔离、Hash编解码及浏览器存储字段不变。不增加第三方运行时依赖，不做博客主题桥接，不自动提交或部署。

- [构建期呈现](../lib/site-presentation.mjs)：从各专题已编译投影生成独立标题、description、canonical、Open Graph和Twitter Card元信息；原站项目子路径保持不变。所有插值转义。
- 无脚本时直接显示完整政权—任期列表，包括专题窗口外的原始起讫、未定年原序和各政权中断说明。提供十一专题原生链接及页内政权导航，不补造未详日期。仅交互式搜索、详情、同年联动与导出需要脚本。
- 十一张1200×630 SVG从原投影确定性生成，不通过截图改变史实。最多示意八个政权，图注明确“缩略示意／部分政权”，不是完整资料图或校核认证。
- 非周朝页面显式披露本次入库只做结构与引用检查、未联网核验史实；来源资料自身的校核标记不等于本站完成逐条复核。

## 分享与导出

[摘要模型](../src/core/share-summary.js)与[分享控制器](../src/share.js)增加“摘要＋链接”复制，包含当前专题、真实所选政权、范围、参考年与筛选说明。原“复制链接”仍只复制原链接；没有复制权限时提供可选择文本，不修改既有Hash字段。

[导出控制器](../src/export.js)保留原对照快照schemaVersion 1的所有字段，并新增 `exportContext`：

- `kind: comparison-snapshot`、`reimportableAsAtlas: false`，明确不是Atlas史料导入文件。
- 记录实际政权ID、范围、事件类别、参考年、搜索与显示条件、坐标编码及资料版本。
- 按查询保留完整命中记录，不按像素截断生平／日期／异说／来源；完整人物或政权关联资料可能包含范围外信息。搜索仅影响政权选择，不重新全文裁剪命中记录。
- PDF仍为图片页，文字不可选中；多页PNG仍使用ZIP。未增加运行时PDF库，不把此格式宣称为可编辑矢量文件。

## 资料纠错

[纠错链接纯函数](../src/core/correction.js)只对十一专题白名单生成固定仓库的Issue Form链接，使用一次URLSearchParams编码。预填专题、条目原始稳定ID、完整名称和**当前参考线**年份；后者不是条目的事件／在位日期。

[详情控制器](../src/ui/navigation-details.js)为政权、君主、事件、人物和未定年条目提供同一入口，保留原详情返回、滚动与焦点。恢复旧详情或改变参考年后，激活链接前更新预填值；不预先联网、不自动提交、不直接改史料。

[Issue Form](../.github/ISSUE_TEMPLATE/data-correction.yml)要求用户核对上下文并补充问题及来源，再自行提交。离线查看可以生成链接，实际提交需要联网、GitHub账户及仓库已发布该表单；本轮没有访问或提交远端表单。

## 可选PNG社交图

普通构建只需Node.js 22+，默认SVG，不安装开发依赖：

```sh
node build.mjs
node build.mjs --check
node --test tests/*.test.mjs tests/*.test.cjs
```

部分社交平台不接受SVG。需要更广的图片格式兼容时，使用[开发渲染器](../tools/render-social-previews.mjs)暂存PNG，再由唯一的构建入口发布；不要手工改生成目录：

```sh
npm ci
npx playwright install chromium
node build.mjs
node tools/render-social-previews.mjs
node build.mjs --social-png-dir=.validation/social-png
node build.mjs --check --social-png-dir=.validation/social-png
```

本机已有Chrome时，可设置 `SOCIAL_CHROMIUM_CHANNEL=chrome`；或使用 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`。渲染时离线，中文显示依赖本机字体；CI可选步骤安装Noto CJK。PNG不要求跨操作系统逐字节一致。

暂存清单关联原SVG散列与PNG散列。[构建入口](../build.mjs)验证每张PNG的头部、1200×630尺寸及两项散列，拒绝陈旧输入；统一更新所有页面的图片格式、MIME、发布清单和散列。渲染器拒绝直接输出到发布目录。

[Pages工作流](../.github/workflows/site.yml)的手动 `social_png` 开关默认关闭：常规PR／push仍走零依赖SVG构建；手动开启后才安装开发工具、生成PNG并统一发布。CI仍先检查已提交的默认生成物。不要将PNG模式产物直接当作默认SVG模式提交：普通 `--check` 按默认模式检查，PNG模式须携带相同输入参数。

元信息提供静态抓取入口，但平台是否抓取、缓存何时刷新、SVG支持情况均由平台决定；未进行远端社交抓取验收。

## 本地验收记录

2026-10-21的单元测试数量、发布浏览器场景、既有 P0／P1／呈现回归及 PNG 隔离构建结果已归档到[操作历史](HISTORY.md)。报告、截图和临时副本位于忽略提交的验证目录；浏览器实际交互与下载通过，不代表远端 GitHub 表单或社交平台抓取已验收。


</details>

<a id="archive-stage4-entities"></a>

### STAGE4-ENTITIES.md

原文 SHA-256：`0cd64d5b5548c984ba1668a419ebf08c4e1480c3cadd8f8d287ff7d1fb5e8089`。该独立文档已归档。

<details>
<summary>展开归档正文</summary>

# 阶段四：区间事件、跨卷实体导航与短祚微槽

## 范围与保真边界

本轮只扩展模型能力和呈现，不修改十一专题 JSON 原件、既有史料正文、实体 ID 或历史日期；不联网核验史实，不添加第三方运行时依赖，不自动提交、推送或部署。发布目录全部由 [构建入口](<../build.mjs>) 生成。

[既有显示契约](<PRESENTATION-CONTRACT.md>)、[多卷显示契约](<DYNASTY-DISPLAY.md>)、[新增四卷约定](<EXPANSION-DISPLAY.md>) 继续适用。专题是窗口，不是实体；同年重叠不通过改年、合并任期或补造月日消除。

## 1. 可选事件终点

[资料校验与编译](<../lib/atlas.mjs>) 保留 `validateAtlas(atlas)` / `compileAtlas(input)` 接口。事件仍以 `year` 或 `yearRef` 表示起点，只增可选 `endYear`：

- schema 1：终点沿用公元前正安全整数，例如起点 `year:755`、终点 `endYear:763` **不合法**，因为历史终点早于起点。合法示例为 `year:763,endYear:755`（前763年至前755年）。
- schema 2：作者必须使用明确纪元对象，例如 `year:{era:'CE',year:755},endYear:{era:'CE',year:763}`。不接受裸数、公元零年或不受支持的附加日期字段。
- 编译后两端统一为 `bce-axis`：前1年=1、公元1年=0、公元2年=-1，必须满足 `year >= endYear`。终点与 `yearRef` 解析后的起点比较；不能用终点代替未核实或缺失的起点。
- 未提供 `endYear` 的旧记录不新增该字段，仍为单点。显式 `null` / `undefined` / 非整数 / 逆序不退化为单点，不交换端点；等年终点保留单点显示。
- 活动的 `yearFromEvent` 继续只继承事件的起点；事件跨年不代表参与人物全程活跃或全程参与。

运行时 [Time.eventRange(event)](<../src/core/time.js>) 返回 `{start,end}` 或 `null`；[历史查询](<../src/core/history.js>)、同年横截面和导出共用闭区间相交口径，开始年、结束年和中间年均可命中。非法运行时区间安全跳过。

[网页时间线](<../src/ui/timeline.js>) 用胶囊表示真正跨年的事件，跨度不受210px短标签上限截断，也不借用短祚控件的14px下限扩大短区间；低倍缩放保留真实跨度（边框受浏览器最小像素绘制限制）。折叠保留全部原 ID，不把多事件聚类画成一段连续史事。视窗裁切只影响可见几何，原日期保持完整；单点图元、定／推／异标记、关系及原正文不变。区间详情列出完整起讫，参考线在区间内时保持该年；“参考年在位”不冒充全程参与。

[导出排版](<../src/core/export-layout.js>) 与 [Canvas输出](<../src/outputs/canvas.js>) 保持原 E 编号；区间跨图页时画可见段及续接标记，只有真实端点为圆帽。文字索引收录完整原始起讫一次，不把分页边界变成史实日期；JSON保留完整记录，不做像素裁剪。

现有正式原件没有为本功能补写终点。跨年实例使用合成测试覆盖，不将合成故事发布到资料库。

## 2. 跨卷导航，不合并史料

[构建期链接索引](<../lib/entity-links.mjs>) 从原有出处索引和各卷编译投影生成独立的导航资源，不改变各卷数据脚本或原有出处索引格式。索引仅包含实体类型、稳定 ID、目标专题名称与本地入口链接，不复制生平或裁决字段差异。

- 只有同类型、`identityScope:'stable-id'`、至少两个真实有效收录位置的政权／人物才可链接。不按姓名、正文提及、来源引用或任期人物关系猜测对端实体。
- `later-liang` 与 `wu-zhou` 的已知跨卷异实体碰撞继续排除；未知、单卷、失效或缺少目标记录的条目不显示链接。
- [浏览器适配](<../src/core/entity-links.js>) 校验当前实体、当前卷收录和相对HTML目标；拒绝远程协议、身份不匹配或损坏资源，无索引时安全降级。
- 人物与政权详情顶部显示“跨卷收录”，使用真正的原生链接，支持键盘、另开标签与浏览器返回。文案不把收录顺序声称为真实生平延续。
- 每个目标使用干净的既有 v1/v2 Hash 条件、目标卷真实政权 ID 及 `item` / `target`。不转发来源卷的筛选或阅读状态；保持既有“默认→本地阅读→显式Hash”的恢复优先级。
- 定位仅依据目标卷明确相关事件或已记载活动；无日期人物使用目标专题默认参考年，不将该年写成人物事实。0是有效公元1年，不作缺失处理。

实际跨卷示例使用已收录实体，如周→秦汉的 `person-033`。目前魏晋卷没有收录 `tk-person-sima-yi` 人物实体、辽金宋卷没有收录 `ymq-person-yelv-chucai` 人物实体，因此不能为背景举例中的司马懿／耶律楚材伪造对应链接。

## 3. 短祚像素微槽

[纯呈现模型](<../src/core/presentation.js>) 的 `tenureSlots` 接口接收已分层任期及像素测量，仅返回显示坐标、最小14px控件宽度、展示次序与车道；原 inclusive `pack` 及输入记录不变。

同一政权同年起点或前段同年结束的密集条目使用资料数组原序作展示次序，不按姓名合并。同一人物的复位任期仍有独立 ID；并存政权不组成同一接续链。长条先预留原几何，短槽复用空余车道，空间不足再分层，避免逐条把后续长任期挤入新车道。微偏移通过引线连接真实年份锚点；它不是小数历史年或确定月日。

[专用提示](<../src/ui/tenure-tooltip.js>) 在悬停或键盘聚焦时显示完整原称谓、角色、原始年份及“仅像素微槽”说明，保留原生 title 作为降级；Esc、失焦或指针交互的滚动关闭提示；键盘聚焦触发的原生自动滚动则重定位提示，保留有效的 `aria-describedby`。金线44px手柄限定在年代轴内，避免覆盖首行短槽。移动端继续使用原44px虚拟命中与多候选选择，不扩写历史几何。详情列出同年任期及原 ID，选择、搜索、分享、阅读和导出仍使用原身份。

## 验证

```sh
node build.mjs
node build.mjs --check
node --test tests/*.test.mjs tests/*.test.cjs
# 受限环境的无子进程模式：
node --test --test-isolation=none tests/*.test.mjs tests/*.test.cjs
# 已安装开发依赖与Chrome：
node tests/browser-stage4.mjs
```

新增回归见 [资料模型测试](<../tests/domain-model.test.mjs>)、[区间查询及导出](<../tests/interval-events.test.cjs>)、[链接索引](<../tests/entity-links.test.mjs>)、[短祚及网页区间](<../tests/stage4-presentation.test.cjs>)、[真实浏览器验收](<../tests/browser-stage4.mjs>)。旧点事件的完整编译 JSON、原周朝查询／链接／阅读／导出基线和十一专题原件散列继续锁定。浏览器脚本只访问本地发布资源，不打开史料网站。

本地验收记录（测试数量、浏览器场景组合及既有回归范围）已归档到[操作历史](HISTORY.md)。

上述为本地构建与浏览器验收，不代表线上已经发布。


</details>

<a id="archive-compatibility-baseline"></a>

### COMPATIBILITY-BASELINE.md

原文 SHA-256：`6374e41ac9b798d5d690b2341a41348b59c5e43a59568a7733c280a69fd5892f`。文件保留当前契约，此处保存整理前快照。

<details>
<summary>展开归档正文</summary>

# 周朝固定兼容基线

## 来源与运行

- [测试](../tests/zhou-baseline.test.cjs)与[固定输入和预期](../tests/fixtures/zhou-baseline.json)于 2026-10-19 从用户既有、lead 重建前的 `dist` 一次性采集；资料版本为“第五版 · 统一资料源 / 2026-10-18专项纪年校核”。捕获完成后已先通知 lead 可以重建。
- 测试运行只读取上述 JSON，不生成、更新或从当前实现推导 expected；不要用新版输出覆盖 fixture 来消除回归。
- 使用既有[浏览器边界辅助器](../tests/helpers/browser.cjs)，加载当前构建产物，无需浏览器或第三方依赖。

```powershell
node tests/zhou-baseline.test.cjs
# 正常允许子进程的环境也可用：
node --test tests/zhou-baseline.test.cjs
```

原版验证：直接运行 `node` 得到 1 pass / 0 fail（约 140ms）。本会话 sandbox 下 `node --test` 的隔离子进程报 `Error: spawn EPERM`，因此改用直接执行（仍由 `node:test` 报告结果）；不是跳过断言。重建由 lead 负责；测试不会隐式执行 build。

## 固定覆盖

1. **旧查询**：13 个固定查询的稳定 key、标题与命中原因；包含同名齐桓公、简繁、别名、空白、人物与简介分离、无结果、所选国家范围。
2. **同年口径**：24 组查询分别固定国家存在、实际即位君主、条带君主、事件与中断信息。覆盖秦孝文王/庄襄王/秦王政的继承与元年差异、晋悼公前573/572年、齐威王前356/355年，以及燕/陈/蔡中断与复国前后边界。
3. **秦前221年阶段边界**：秦王政条带前246—221、实际继位前247、前221称帝而非去世/退位、前210去世；国家在前221存在、前220不在周朝阶段范围。
4. **分享 v1**：两个直接保存的、含完整视图与详情的代表 hash（旧人名 `person:商鞅`、长平之战 `event:e91`），固定解析结果、视图、钉选/排序、详情文字与规范化 key；同时验证编码/解析往返。不是用本次 encoder 生成输入链接。
5. **旧阅读记录**：保存了旧版 `zhou-reading-v4` / `zhou-visits-v4` / 布局与钉选记录；人物访问使用旧名 key，验证迁移为稳定 ID、根视图、详情滚动318、关闭返回，以及 1200/390 两种宽度下的实际恢复数值。记录时间使用固定值，不比较当前时刻。
6. **JSON 和图页**：齐前355、秦前260—221、晋前580—570、蔡/陈前535—529四组。固定选定元数据、君主与事件关键字段、日期争议、原典与现代来源、图页条带/lane、事件 E 编号、完整文字/来源索引及 Canvas 实际绘制文字。额外走真实 JSON 下载入口，验证文件名、MIME 和 Blob 内容。
7. **隔离**：排版与 Canvas 绘制不得改变 JSON/plan；修改一次导出的国家、君主、事件、来源、纪年节点来源以及异说及其来源，不得污染原资料或后续导出；恢复不修改调用者的旧记录对象。

## 比较口径

- 只固定挑选的稳定字段；对象新增元数据字段兼容，原有字段缺失、数值变化以及数组成员/顺序变化仍失败。
- 导出日期尾部归一化为 `<DATE>`；数据更新时间、标题、实际年份、来源编号、出处与异说正文仍固定。刻意不固定像素截图、PDF/ZIP 二进制与运行时间。
- 这组基线只保护周朝 BCE 坐标与内容不变。新增运行时 `Zhou.Time` 和跨公元 `CE y -> 1-y` 的新能力应由独立新测试验证，不能反向改写本 fixture。
- 边界辅助器不是完整浏览器：Canvas 通过绘制命令/文字验证，不宣称完成真实字体、像素布局或设备视觉验收。


</details>

<a id="archive-presentation-contract"></a>

### PRESENTATION-CONTRACT.md

原文 SHA-256：`5f3f484b4f84fe9c73116ffa99bc783f9d9cdc17b305b4d3a7b6714fa6116fef`。文件保留当前契约，此处保存整理前快照。

<details>
<summary>展开归档正文</summary>

# ADR：接续泳道、专题核心政权与君主短标签

## 状态
已接受（2026-10-19）。实现与原站发布采用同一仓库 `master`，不创建替代站点。

## 背景
秦、汉及其分期原来各占国家行，顺次存续部分形成大面积空白；秦汉、三国的长称谓、任职和阶段文字进入君主条带，挤占姓名。原始资料、稳定 ID、年级重叠及周朝既有行为必须保留。本轮没有联网查证史实。

## 决策与契约

在[生产显示适配](<../lib/production-display.mjs>)中，按**任期 ID**显式标注，不修改原始资料、`name`、`role`、人物、任期或政权日期。投影新增：

```js
// 任期及 states[].rulers[]，同一自然人的不同身份仍是不同记录。
display: { shortTitle: '汉武帝', personalName: '刘彻' }
// 名号/职位过多时：{ shortTitle: '', personalName: '曹操' }
// 政权短标签；完整 name 仍用于详情、可访问名称和提示。
display: { shortName: '玄汉' }
presentation: {
  version: 1,
  rowGroups: [{
    id: 'qin-han-succession', name: '秦汉接续',
    stateIds: ['qin', 'western-han', 'xin', 'gengshi-han', 'eastern-han'],
    note: '接续共行；原日期、同年重叠保留，重叠分层。'
  }]
}
```

[呈现核心](<../src/core/presentation.js>)提供纯适配接口：

- `rulerLabel(r)`：优先显式 `display.label`（武周专用“武周 · 武则天”），否则短名号＋姓名；空名号只显示姓名；无 display 的周朝资料回退原 `name`。未知姓名不推测补全。
- `pack(records, from, to, laneKey='displayLane')`：返回带显示 lane 的克隆记录，保留原 lane 下限；年级区间端点相等也算重叠，不裁掉年份或伪造月日。
- `rows(states, presentation, pins)`：仅对**已经筛选出来**的政权进行视觉分组；第一位成员决定组的位置。分组键 `group:…` 只用于 DOM，不是国家、人物或任期 ID。

[网页时间线](<../src/ui/timeline.js>)将秦 → 西汉 → 新 → 玄汉 → 东汉放在一条主行，轴内展示各政权分段与日期提示，国家／年代位置列出各成员。卫、张楚、西楚保留并存行；三国仍为五行。政权分段和君主任期分别分层，真实重叠不能被压平。

条带空间先给短名；仅细节密度且宽度／高度足够时再显示年份。按钮 `title` 和 `aria-label` 保留完整称谓、任职性质、日期与身份说明，并指向点击详情；详情继续提供完整生平、人物档案、纪年和来源。短称不是新实体，也不替代原称谓。

## 密集事件随行高展开（2026-10-20）

- `events(records, {position, measure, top, bottom, focusedId, obstacles})`：只按像素空间分层，返回 `groups` 和候选 `lanes`；记录仍引用原事件，不修改日期、ID、关系或输入顺序。`bottom` 是按钮顶部的最大坐标，不是按钮底边；按钮高18px，层间距22px。
- 全局行高、单国行高与自适应行高共用此规则。优先在条带下方及条带旁的真实空白放置独立事件；同年事件可上下分层，不挪动对应的年份位置。空间不足的邻近事件才聚合；缩小行高后自动重新聚合。聚合提示保留全部成员标题及年份。
- `obstacles` 按实际君主按钮的边框与内边距下限计算。底部保留一层事件槽；极紧凑、多条带行会略增到物理防碰撞下限，不以压扁边框换取事件重叠。秦汉政权分段标签的区域不会用于事件。
- 聚焦事件优先预留独立位置；没有独立位置时仍保留在高亮聚合按钮中。所有符合当前筛选和密度的事件恰好出现一次；远景的关键事件筛选保持不变，行高本身不会绕过筛选。完整标题仍可从提示和详情读取，长标题不承诺无截断。
- 此规则仅调整网页排版，不改历史资料、分享字段、阅读存储或图形导出分页。

## 阶段 A：专题阅读默认值（2026-10-22）

[呈现核心](<../src/core/presentation.js>)的 `topic(data)` 返回独立的 `{order,coreIds,cursor,minorInfo}` 阅读策略；不改输入对象或原 `states` 排列，返回值的修改不污染后续调用。正式专题以 `datasetId` 隔离，周朝以 `timeline.topic` 识别；未知/示例专题回退资料原配置。Core/Minor 仅表示本专题的阅读层级，不是历史正统性、国家等级或事实判断。同一 ID 在不同卷可有不同层级，隋唐的武周不能与清卷的吴周混同。

| 专题 | 默认核心与顺序（同组接续不合并实体） | 默认参考年 |
|---|---|---|
| 夏商 | 夏 → 商 → 周 → 其余；保留夏商接续，默认全部 | 前1600 |
| 周朝 | 周王室 → 齐 → 晋 → 秦 → 楚 → 燕 → 鲁 → 吴 → 越 → 韩 → 赵 → 魏；其余六国折叠 | 前770 |
| 秦汉 | 秦 → 西汉 → 新 → 玄汉 → 东汉接续在前；默认全部 | 前140 |
| 三国 | 曹魏 → 蜀汉 → 孙吴 → 东汉末 → 西晋；默认全部 | 公元229 |
| 魏晋南北朝 | 两晋、南朝四朝、北朝五朝的两个分支、前秦；隋与其余十六国默认折叠 | 公元383 |
| 隋唐 | 隋朝独立；唐朝含武周共用另一行；其余含吐蕃折叠 | 公元618 |
| 五代十国 | 后梁 → 后唐 → 后晋 → 后汉 → 后周 → 北宋主行；十国及辽折叠 | 公元923 |
| 辽金宋 | 北宋 → 南宋共用首行；之后辽、金、西夏；大理、西辽、蒙古/元折叠 | 公元960 |
| 元朝 | 大蒙古国/元 → 南宋 → 金 → 明；其余折叠 | 公元1271 |
| 明朝 | 明含南明主行 → 后金/清；其余折叠 | 公元1368 |
| 清朝 | 后金/清 → 明；南明及其余折叠 | 公元1644 |

- 初始化及“恢复默认顺序”使用同一策略，用户明确保存的顺序、固定行和选择继续生效；普通渲染不强制排序。
- 工具栏和“选择政权”弹窗使用原政权 ID 的 X/Y 口径（包含固定项），不是合并后的泳道数。例如隋唐核心是 3 个政权、2 条泳道，辽金宋是 5 个政权、4 条泳道。
- 弹窗提供“主要（默认） / 全部 / 自定义”；勾选仅在应用后提交，取消不改画布。底部可展开尚未选中的 N 个次要政权；收起仅移除非固定的次要项，不恢复用户已取消的核心项。固定项始终可见。次要项显示身份简注及原始起讫；不以常识替换资料中的年代。
- 武周 `wu-zhou` 与唐 `tang` 共用“唐朝”视觉行，隋 `sui` 不在此组。武周皇帝任期以特殊底色、鎏金描边和“武周 · 武则天”标识；点击仍打开原任期，保留 690—705 年改国号为大周的完整说明。唐存续区间不挖空，690/705 年交接重叠仍分层，不冒充精确月份。
- 首次无恢复状态时，光标与初始视窗定位高光年；滚动居中受合法时间轴边界夹紧。公元日期通过 `1 - year` 转成 BCE 轴，绝不直接取负或产生公元零年。分享链接优先于阅读恢复，阅读恢复优先于默认；筛选、缩放、窗口重排不得反复跳回默认。
- 所有原始资料、人物/政权/任期 ID、日期、出处、同年对照和导出身份保留。周朝编译投影继续逐字节兼容；本阶段仅调整前端默认展示。保持零第三方运行时依赖，发布产物只能由 `node build.mjs` 生成，不直接编辑。

## 身份边界与取舍

| 路径 | 约定 |
|---|---|
| 筛选 | 只保留选中的政权；不因为同组而自动选择其他成员 |
| 固定 | 固定某成员时整条视觉主行置顶，但固定集合仍只存该成员 ID |
| 排序／单国行高 | 原国家顺序与设置保留；组位置取首成员，组高满足成员最大设置与防碰撞下限 |
| 搜索／定位 | 原完整名称与新增短标签均可查；定位使用政权对应的真实视觉行偏移 |
| 同年对照 | 仍按原政权和实际即位口径；上下文任职不冒充在位皇帝 |
| 分享／阅读／组合 | 继续保存政权 ID 和任期详情 ID，不存视觉分组键 |
| JSON 导出 | 原政权、任期、称谓、日期、关系和来源完整保留；附加筛选后的 presentation 元数据 |
| 图形导出 | 国家分行保留原身份；条带使用同一短标签，完整称谓与任职说明仍在文字索引中 |
| 周朝 | 原始投影逐字节兼容；没有组定义时保持原国家行和短名规则 |

## 备选方案

- **采用：附加显示适配。** 改动局限在投影与呈现，保留既有查询／持久化／导出边界；代价是显示映射需要随新增任期维护，缺少显式标注会在构建时报错。
- **不采用：改名、合并政权或裁剪日期。** 实现表面简单，但会丢失完整称谓、身份和同年重叠，且破坏旧链接与同年对照。
- **暂不采用：整体改造历史模型或统一所有专题全集。** 不是本次问题所需，会放大共享 ID、上下文身份与迁移风险。

## 验证

- [阶段 A 回归](<../tests/phase-a.test.cjs>)覆盖 11 专题两种宽度的默认排序、核心集合、光标与居中、空/示例投影回退、武周同唐行与身份保留、弹窗预设与取消、固定/自定义选择、展开收起、排序重置和阅读恢复。
- [呈现回归](<../tests/presentation.test.cjs>)覆盖接续共行、三国并行、重叠、短名／年份层次、完整详情、筛选／固定／排序、搜索定位、分享、阅读及两种导出身份。
- [密集事件回归](<../tests/dense-events.test.cjs>)覆盖像素分层、同年事件、宽度碰撞、条带避让、不足空间聚合、聚焦预留、输入不变性，以及三个专题两种宽度的全局／单行行高、类别／搜索筛选和详情操作。
- [真实 Chrome 验收脚本](<../tests/browser-presentation.mjs>)无第三方依赖，使用本机 Chrome/CDP；分别支持本地离线产物与原站 HTTPS：

```sh
node build.mjs
node build.mjs --check
node --test tests/*.test.mjs tests/*.test.cjs
node tests/browser-presentation.mjs
node tests/browser-presentation.mjs https://chrunge.github.io/Zhou-Dynasty-Timeline/
node tests/verify-release.mjs
```

真实 Chrome 1200×900、390×900 各三个专题，共六个场景：默认实际时间线、短名与放大后的年份、可访问完整提示、点击详情与生平、同名不同任期搜索、秦汉固定／筛选／排序、同年对照、JSON 下载、三国实际图片 PDF 生成、阅读保存恢复和分享编解码。截图发现的秦汉长国家名挤压已用独立短标签修正，验收额外检查组成员标签未被裁切，以及行高36→160时事件数量增加、筛选后成员无遗漏／重复、实际CSS矩形不与君主或同层事件重叠。

阶段 A 本地验收（2026-10-22）：`node build.mjs --check` 通过；`node --test` 共 486 项全部通过。Chrome 155 的 `file://` 加载、网络离线模拟共 11 专题 × 1200/390px = 22 个场景通过，包含三种预设、取消/应用、底部展开收起、默认高光年、分组与武周详情、标签边界、事件防碰撞、阅读及导出。只有批准的隋唐分组和武周 `display.label` 改变了该卷展示投影散列，其余六个既有专题散列不变，原始史料没有修改。

限制：自动化与截图抽查不等于实体手机触控、完整人工无障碍或打印验收；没有打开历史来源链接。本轮未提交、推送或部署线上站点。后续阶段 B/C/D 尚待用户确认，不属于此次阶段 A 实施与验收。


</details>

| 2026-10-22 | 文档整理 | 架构图覆盖传记生成、补充与引用校验、出处、运行时活动投影、状态和导出；8 份过时独立文档完整归档，docs 从16份减为8份；当前说明及92个本地链接核对通过 | 当前说明与操作历史分离，保留历史审计证据；538 项测试与构建检查通过 | `b53b330` |

## 2026-10-22 遗留问题收尾与 Pages 部署恢复

| 日期 | 操作 | 原因与结果 | 提交哈希 |
|---|---|---|---|
| 2026-10-22 | 合并、推送并恢复 Pages 发布；保存线上验收记录 | 资料引用、窄屏入口修复、架构图及文档整理完成后发布；以下记录说明中断与恢复事实 | `01559bfa09ad517b3014fefa57dc590417b60558` |

- 合并提交已推送至 master。[原运行 #39803177191](https://github.com/Chrunge/Zhou-Dynasty-Timeline/actions/runs/39803177191) 的构建、538 项 Node 测试、22 个 Chromium 人物入口场景及产物上传成功。Codex 过早将依赖安装耗时判断为停滞，主动取消运行，打断后续 Pages 作业；此次取消不是系统自动取消，也不是代码检查失败。
- 原运行取消后，运行状态与已结束作业状态不一致，GitHub 拒绝重试单个作业。在相同提交手动触发[恢复运行 #39807285779](https://github.com/Chrunge/Zhou-Dynasty-Timeline/actions/runs/39807285779)，完整保留构建与测试。github-pages 环境要求所有者审批；依据用户已有部署授权，通过现有仓库登录身份批准本次发布，没有修改环境保护规则。
- 恢复运行的构建与 Pages 作业均成功。远端重新通过538 项 Node 测试及11专题 ×390/1200px 共22个人物入口场景。GitHub 记录运行于2026-10-22 15:45:29 UTC结束，发布提交为上述合并提交。
- 线上核验于2026-10-22 15:48:55 UTC完成：根入口返回200；release.json 与本地发布清单逐字节一致；全部41个资源的SHA-256与本地 dist 一致，HTML资源版本参数正确。releaseId 为 `65720eb2d2d829f640f36283c2f62b13ee11165aeae334d9e1bd3f5d6613934f`。
- 线上实际点击检查5项通过：375、390、680、681px 展开年份后仍可打开人物画廊；390px 魏晋专题中司马懿的专题外章节保留叙述，点击不改变当前年份或政权选择。本地验收文件位于忽略目录 .validation/display-live-release.json、.validation/live-follow-up.json 和 .validation/live-year-editor-390.png；不作为仓库发布资源。
- 资料中的7项明确跨专题引用及2项未单列事件状态予以保留，诊断 issues 为空；未声称新增事件或完成外部史实校勘。当前架构说明见 [ARCHITECTURE](ARCHITECTURE.md)，退役文档全文已归档在本历史文件，docs 保留8份当前说明与历史文件。
- 本条记录仅补充部署证据，不改变发布资源；记录提交使用 [skip ci]，避免仅保存部署记录再次触发同一发布流程。生产资源对应合并提交，后续记录提交不宣称运行过新的CI。


## 2026-10-23 显示与首屏优化

| 日期 | 条目 | 做了什么与验证 | 提交哈希 |
|---|---|---|---|
| 2026-10-23 | 显示修正 | 分组左列预留标题、名称与年代高度；宋辽金显示命名统一；旧默认排序迁移并标记新保存记录；540项测试、22个实际入口场景和34项布局检查通过。原件与兼容投影未修改 | `ce8582d` |

首次较宽范围的排版尝试影响了单政权紧凑行高与独立阅读模型，已完整撤回；最终修正限于分组左列，排序迁移通过依赖注入连接，不依赖额外全局模块。未重写既有兼容样本来放行回归。


## 2026-10-23 文档归并原文

以下五份独立文档退役，全文保存在本节；当前规则以架构说明与资料维护约定为准。历史正文中的相对链接表示归档当时的路径。

<details id="archive-presentation-contract-20261023">
<summary>PRESENTATION-CONTRACT.md（归档原文）</summary>

# 接续泳道、专题核心政权与君主短标签

## 决策与契约

在[生产显示适配](<../lib/production-display.mjs>)中，按**任期 ID**显式标注，不修改原始资料、`name`、`role`、人物、任期或政权日期。投影新增：

```js
// 任期及 states[].rulers[]，同一自然人的不同身份仍是不同记录。
display: { shortTitle: '汉武帝', personalName: '刘彻' }
// 名号/职位过多时：{ shortTitle: '', personalName: '曹操' }
// 政权短标签；完整 name 仍用于详情、可访问名称和提示。
display: { shortName: '玄汉' }
presentation: {
  version: 1,
  rowGroups: [{
    id: 'qin-han-succession', name: '秦汉接续',
    stateIds: ['qin', 'western-han', 'xin', 'gengshi-han', 'eastern-han'],
    note: '接续共行；原日期、同年重叠保留，重叠分层。'
  }]
}
```

[呈现核心](<../src/core/presentation.js>)提供纯适配接口：

- `rulerLabel(r)`：优先显式 `display.label`（武周专用“武周 · 武则天”），否则短名号＋姓名；空名号只显示姓名；无 display 的周朝资料回退原 `name`。未知姓名不推测补全。
- `pack(records, from, to, laneKey='displayLane')`：返回带显示 lane 的克隆记录，保留原 lane 下限；年级区间端点相等也算重叠，不裁掉年份或伪造月日。
- `rows(states, presentation, pins)`：仅对**已经筛选出来**的政权进行视觉分组；第一位成员决定组的位置。分组键 `group:…` 只用于 DOM，不是国家、人物或任期 ID。

[网页时间线](<../src/ui/timeline.js>)将秦 → 西汉 → 新 → 玄汉 → 东汉放在一条主行，轴内展示各政权分段与日期提示，国家／年代位置列出各成员。卫、张楚、西楚保留并存行；三国仍为五行。政权分段和君主任期分别分层，真实重叠不能被压平。

条带空间先给短名；仅细节密度且宽度／高度足够时再显示年份。按钮 `title` 和 `aria-label` 保留完整称谓、任职性质、日期与身份说明，并指向点击详情；详情继续提供完整生平、人物档案、纪年和来源。短称不是新实体，也不替代原称谓。

## 密集事件随行高展开（2026-10-20）

- `events(records, {position, measure, top, bottom, focusedId, obstacles})`：只按像素空间分层，返回 `groups` 和候选 `lanes`；记录仍引用原事件，不修改日期、ID、关系或输入顺序。`bottom` 是按钮顶部的最大坐标，不是按钮底边；按钮高18px，层间距22px。
- 全局行高、单国行高与自适应行高共用此规则。优先在条带下方及条带旁的真实空白放置独立事件；同年事件可上下分层，不挪动对应的年份位置。空间不足的邻近事件才聚合；缩小行高后自动重新聚合。聚合提示保留全部成员标题及年份。
- `obstacles` 按实际君主按钮的边框与内边距下限计算。底部保留一层事件槽；极紧凑、多条带行会略增到物理防碰撞下限，不以压扁边框换取事件重叠。秦汉政权分段标签的区域不会用于事件。
- 聚焦事件优先预留独立位置；没有独立位置时仍保留在高亮聚合按钮中。所有符合当前筛选和密度的事件恰好出现一次；远景的关键事件筛选保持不变，行高本身不会绕过筛选。完整标题仍可从提示和详情读取，长标题不承诺无截断。
- 此规则仅调整网页排版，不改历史资料、分享字段、阅读存储或图形导出分页。

## 阶段 A：专题阅读默认值（2026-10-22）

[呈现核心](<../src/core/presentation.js>)的 `topic(data)` 返回独立的 `{order,coreIds,cursor,minorInfo}` 阅读策略；不改输入对象或原 `states` 排列，返回值的修改不污染后续调用。正式专题以 `datasetId` 隔离，周朝以 `timeline.topic` 识别；未知/示例专题回退资料原配置。Core/Minor 仅表示本专题的阅读层级，不是历史正统性、国家等级或事实判断。同一 ID 在不同卷可有不同层级，隋唐的武周不能与清卷的吴周混同。

| 专题 | 默认核心与顺序（同组接续不合并实体） | 默认参考年 |
|---|---|---|
| 夏商 | 夏 → 商 → 周 → 其余；保留夏商接续，默认全部 | 前1600 |
| 周朝 | 周王室 → 齐 → 晋 → 秦 → 楚 → 燕 → 鲁 → 吴 → 越 → 韩 → 赵 → 魏；其余六国折叠 | 前770 |
| 秦汉 | 秦 → 西汉 → 新 → 玄汉 → 东汉接续在前；默认全部 | 前140 |
| 三国 | 曹魏 → 蜀汉 → 孙吴 → 东汉末 → 西晋；默认全部 | 公元229 |
| 魏晋南北朝 | 两晋、南朝四朝、北朝五朝的两个分支、前秦；隋与其余十六国默认折叠 | 公元383 |
| 隋唐 | 隋朝独立；唐朝含武周共用另一行；其余含吐蕃折叠 | 公元618 |
| 五代十国 | 后梁 → 后唐 → 后晋 → 后汉 → 后周 → 北宋主行；十国及辽折叠 | 公元923 |
| 宋辽金 | 北宋 → 南宋共用首行；之后辽、金、西夏；大理、西辽、蒙古/元折叠 | 公元960 |
| 元朝 | 大蒙古国/元 → 南宋 → 金 → 明；其余折叠 | 公元1271 |
| 明朝 | 明含南明主行 → 后金/清；其余折叠 | 公元1368 |
| 清朝 | 后金/清 → 明；南明及其余折叠 | 公元1644 |

- 初始化及“恢复默认顺序”使用同一策略，用户明确保存的顺序、固定行和选择继续生效；普通渲染不强制排序。
- 工具栏和“选择政权”弹窗使用原政权 ID 的 X/Y 口径（包含固定项），不是合并后的泳道数。例如隋唐核心是 3 个政权、2 条泳道，宋辽金是 5 个政权、4 条泳道。
- 弹窗提供“主要（默认） / 全部 / 自定义”；勾选仅在应用后提交，取消不改画布。底部可展开尚未选中的 N 个次要政权；收起仅移除非固定的次要项，不恢复用户已取消的核心项。固定项始终可见。次要项显示身份简注及原始起讫；不以常识替换资料中的年代。
- 武周 `wu-zhou` 与唐 `tang` 共用“唐朝”视觉行，隋 `sui` 不在此组。武周皇帝任期以特殊底色、鎏金描边和“武周 · 武则天”标识；点击仍打开原任期，保留 690—705 年改国号为大周的完整说明。唐存续区间不挖空，690/705 年交接重叠仍分层，不冒充精确月份。
- 首次无恢复状态时，光标与初始视窗定位高光年；滚动居中受合法时间轴边界夹紧。公元日期通过 `1 - year` 转成 BCE 轴，绝不直接取负或产生公元零年。分享链接优先于阅读恢复，阅读恢复优先于默认；筛选、缩放、窗口重排不得反复跳回默认。
- 所有原始资料、人物/政权/任期 ID、日期、出处、同年对照和导出身份保留。周朝原件编译投影保持兼容，传记在后续构建阶段补充；前端默认展示不修改原件。保持零第三方运行时依赖，发布产物只能由 `node build.mjs` 生成，不直接编辑。

## 身份边界与取舍

| 路径 | 约定 |
|---|---|
| 筛选 | 只保留选中的政权；不因为同组而自动选择其他成员 |
| 固定 | 固定某成员时整条视觉主行置顶，但固定集合仍只存该成员 ID |
| 排序／单国行高 | 原国家顺序与设置保留；组位置取首成员，组高满足成员最大设置与防碰撞下限 |
| 搜索／定位 | 原完整名称与新增短标签均可查；定位使用政权对应的真实视觉行偏移 |
| 同年对照 | 仍按原政权和实际即位口径；上下文任职不冒充在位皇帝 |
| 分享／阅读／组合 | 继续保存政权 ID 和任期详情 ID，不存视觉分组键 |
| JSON 导出 | 原政权、任期、称谓、日期、关系和来源完整保留；附加筛选后的 presentation 元数据 |
| 图形导出 | 国家分行保留原身份；条带使用同一短标签，完整称谓与任职说明仍在文字索引中 |
| 周朝 | 原件投影保持兼容；没有组定义时保持原国家行和短名规则 |

## 验证

- [专题默认回归](<../tests/phase-a.test.cjs>)覆盖 11 专题两种宽度的默认排序、核心集合、光标与居中、空/示例投影回退、武周同唐行与身份保留、弹窗预设与取消、固定/自定义选择、展开收起、排序重置和阅读恢复。
- [呈现回归](<../tests/presentation.test.cjs>)覆盖接续共行、三国并行、重叠、短名／年份层次、完整详情、筛选／固定／排序、搜索定位、分享、阅读及两种导出身份。
- [密集事件回归](<../tests/dense-events.test.cjs>)覆盖像素分层、同年事件、宽度碰撞、条带避让、不足空间聚合、聚焦预留、输入不变性，以及三个专题两种宽度的全局／单行行高、类别／搜索筛选和详情操作。
- [真实 Chrome 验收脚本](<../tests/browser-presentation.mjs>)无第三方依赖，使用本机 Chrome/CDP；分别支持本地离线产物与原站 HTTPS：

```sh
node build.mjs
node build.mjs --check
node --test tests/*.test.mjs tests/*.test.cjs
node tests/browser-presentation.mjs
node tests/browser-presentation.mjs https://chrunge.github.io/Zhou-Dynasty-Timeline/
node tests/verify-release.mjs
```

真实浏览器脚本覆盖实际时间线、标签与详情、筛选／固定／排序、同年对照、JSON 与图页、阅读恢复及分享。脚本支持本地产物与原站地址；结果保存在 .validation/。自动化与截图不替代真实设备、读屏或打印检查；历史场景数量与发布记录见 [HISTORY](HISTORY.md)。


</details>

<details id="archive-dynasty-display-20261023">
<summary>DYNASTY-DISPLAY.md（归档原文）</summary>

# 四专题纯展示注解

## 契约与边界

- 模块：[dynasty-display.mjs](../lib/dynasty-display.mjs)，唯一导出 `annotateDynastyDisplay(data,id)`。
- `id` 为 `wei-jin-nan-bei`、`sui-tang`、`liao-jin-song` 或 `ming`。其他专题原样返回，不接管原有展示模块。
- `data` 必须是调用方拥有的、可变的 `compileAtlas` **projection**，具有 `tenures` 与 `states[].rulers`；不是原始 authoring JSON。函数原地添加注解并返回同一 projection。它不读取文件、不联网、不校验或修订史实。
- 调用位置是生产规范化和 `compileAtlas` 之后：[生产入口](../lib/production.mjs) 按专题 ID 调用 `annotateDynastyDisplay`。本模块不承担导入、规范化、日期转换或构建工作。
- 所有任期使用**显式任期 ID**查表，对 `tenures` 和 `states[].rulers` 的独立记录副本分别添加 `display: {shortTitle,personalName}`。两处值相等，但对象不共享。原有其他 `display` 字段保留。
- 不按姓名匹配或覆盖，不按 `personId` 合并任期，不从原名称猜标题。发现未登记任期 ID 时，在写任何注解之前抛出 `Missing explicit dynasty tenure display: <id>`；新增资料必须先逐 ID 审阅标签。
- 添加 `presentation: {version:1,rowGroups:[{id,name,stateIds,note}]}`，保留既有其他 presentation 字段。每次调用复制分组及其 `stateIds`，调用方修改不会污染下一次投影。
- 只添加上述展示属性；原名称、角色、起讫、纪年、人物 ID、任期 ID、政权 ID、人物详情、关系和来源均不改。日期重叠照旧，禁止为了视觉接续裁剪、平移或补造区间。

```js
import {annotateDynastyDisplay} from '../lib/dynasty-display.mjs';

const projection = compileAtlas(prepareProduction(input,id));
return annotateDynastyDisplay(projection,id);
```

这不是函数式不可变 API；应如生产入口一样，先由编译器从原数据生成新 projection。原数据可保持深冻结。

## 标签取舍

原始名称和人物详情始终保留，条带由现有 `Presentation.rulerLabel` 将短标题与人名拼接，不承担详情改写。当前四份正式资料共 **224 个专题内任期**（99 / 36 / 58 / 31），共享任期跨专题去重后为 **222 个显式绑定**。

- 明确的原始帝号/王号可缩短为已有称谓，不额外判定历史正统性，也不创造原资料没有的庙谥。
- 复位：李显、李旦分别以各自前后两个任期 ID 标为“唐中宗（初任）/唐中宗（复位）”“唐睿宗（初任）/唐睿宗（复位）”。括号是原任期先后标记，不是新史称。
- 明英宗两任分别用原名称已有的“正统帝”“天顺帝”，保留同一个朱祁镇人物 ID 和两个独立任期 ID。
- 武则天的唐临朝任期保留“武太后”，武周皇帝任期仍保留 `shortTitle: '圣神皇帝'`，另显式添加 `display.label: '武周 · 武则天'` 用于条带。人物均为原资料明确存在的“武则天”。不能将临朝记录标成唐皇帝，也不能以同一人物为由覆盖两条任期；特殊标签不是更改原始帝号或政权身份。
- 高欢、宇文泰执政任期不套用人物名称中追尊的北齐/北周帝号；`shortTitle` 留空，只显示人名。冯太后临朝同样留空标题、显示原人物名“冯太后”，完整“临朝称制”身份仍在原名称、角色及详情中。
- 原资料中多个职务/名号难以压成单一短称的记录（如张轨、张骏、吕光、也先、俺答汗等）采用空 `shortTitle`。张献忠原名称中的“大顺帝”容易与独立的大顺政权混淆，也留空标题、保留姓名及完整原称。这表示不代替史料做选择，不是身份缺失。
- 普通姓名与原资料明确的简名直接绑定；元宏/拓跋宏、拓跋廓/元廓等异名保留于完整原记录。无正则剥名或运行时按姓名兜底。

## 展示行设计

| 专题 | 共用展示行 | 必须保持独立的并存实体 |
| --- | --- | --- |
| 魏晋南北朝 | 两晋：`western-jin → eastern-jin`；南朝：`liu-song → southern-qi → southern-liang-dynasty → southern-chen`；北朝一支：`northern-wei → eastern-wei → northern-qi`；北朝另一支：`western-wei → northern-zhou → sui` | 十六国全数独立；两晋、南朝、北朝两分支相互独立 |
| 隋唐 | 唐朝主行：`tang + wu-zhou`（武周 690—705 年特殊条带） | 隋朝独立；南陈、隋末群雄、吐蕃、安史燕、黄巢齐均独立 |
| 宋辽金 | `northern-song → southern-song` | 辽、西辽、金、西夏、大理、蒙古/元均独立 |
| 明 | `ming → southern-ming`（原南明实体已经包含明郑） | 北元、后金/清、大顺、大西均独立 |

**共行不等于实体合并，也不宣称唯一继承或唯一正统。** 北魏只在一条展示行出现；它分裂后的东西两个分支不能同时塞进一个“大北朝”组合，否则既误导并存关系，也增加层数。当前选择将北魏放在东支之前，并明确注明不表示东魏为唯一继承者。两晋与南朝不再联成一条超大组合。

武周并入唐朝视觉行，以“武周 · 武则天”标签、特殊底色及鎏金描边呈现。隋朝不与唐共行，因此默认为隋、唐两条泳道。`wu-zhou` 政权与武周皇帝任期仍是独立原始实体，详情保留 690—705 年改国号为大周与复唐的说明。唐原政权存续区间不拆分、不挖空，690—705 年唐/武周的原始重叠完整保留，690/705 年的闭区间交接也不能压平。辽和西辽在 1124—1125 年重叠，不能为了相近名称强行拼作无重叠接续。南明内部弘光、隆武、鲁王监国、永历、明郑各任期仍按原数据分别存在，真实并立仍分层。

`Presentation.pack` 使用首尾年均计入的区间口径，同一年交接也视为重叠。组合不是“强制单层”；原区间分层后仍保持可点击任期和政权 ID。当前资料的预算为：

| 专题 | 展示行数（原政权数） | 单个组合最大政权层数 | 单个组合最大任期层数 |
| --- | ---: | ---: | ---: |
| 魏晋南北朝 | 20（28） | 2 | 3 |
| 隋唐 | 9（10） | 2 | 3 |
| 宋辽金 | 7（8） | 2 | 2 |
| 明 | 5（6） | 2 | 3 |

这是现有原始区间在整专题范围、无额外人为 lane 下的计算结果，不是裁剪日期的硬限制；资料变动应先审阅分组与层数回归。

## 默认核心集合

排序、Core/Minor 与高光年属于[前端专题策略](<../src/core/presentation.js>)，不回写此注解模块或原始资料，完整默认规则见[呈现契约](<PRESENTATION-CONTRACT.md>)。

| 专题 | 默认选中的原政权 | 默认视觉行数 / 展开全部行数 |
|---|---|---|
| 魏晋南北朝 | 两晋、南朝四朝、北朝五朝、前秦（12 个，不含隋） | 5 / 20 |
| 隋唐 | 隋、唐、武周（3 个；吐蕃为次要） | 2 / 9 |
| 宋辽金 | 北宋、南宋、辽、金、西夏（5 个） | 4 / 7 |
| 明 | 明、南明、后金/清（3 个） | 2 / 5 |

全部展开的行数预算为9：10个政权中唐与武周合为一条视觉行。默认计数仍按原实体；筛选、固定、分享和阅读继续使用原 ID。

## 筛选、详情、导出保持实体身份

- `rowGroups` 仅供现有 `Presentation.rows` 生成展示行，不生成新政权记录。
- 组内 `members` 始终是传入的原政权对象；筛选到南宋不应自动引入北宋，固定南宋仍使用 `southern-song`，只将其所在展示行置顶。
- 排序遵从输入政权顺序；详细信息、检索、同年对照、人物关联、来源查询继续使用原政权/任期 ID。
- 导出仍取原 `states`/`tenures`，不得用 `group:<id>` 替换实体 ID。显示分组不是历史实体，不能进入实体选择列表或成为资料关系端点。
- 此模块不修改筛选、详情、检索或导出服务；测试校验它提供的输入不破坏现有显示契约。

## 验证

测试：[dynasty-display.test.mjs](../tests/dynasty-display.test.mjs)。

```text
node --test tests/dynasty-display.test.mjs
```

测试覆盖四专题全任期、两种记录副本、原数据冻结/无损保留、生产编译集成、复位/临朝身份、未登记 ID 的原子失败、重复调用确定性、分组对象隔离、各类并立实体和原始日期重叠分层、20/9/7/5 行数及组合层数预算、筛选/固定/排序/导出原身份。还逐一校验非空称谓能在原任期 name/role 或人物原文找到明确文本依据；“初任/复位”后缀另以原任期描述校验。离线使用仓库中的四份正式 JSON，不依赖下载目录，不联网、不 build。


</details>

<details id="archive-expansion-display-20261023">
<summary>EXPANSION-DISPLAY.md（归档原文）</summary>

# 夏商、五代十国、元、清：纯展示注解

## 集成契约

模块 [expansion-display.mjs](../lib/expansion-display.mjs) 导出：

```js
annotateExpansionDisplay(data, id)
```

- `id` 仅支持 `xia-shang`、`five-dynasties`、`yuan`、`qing`；其他 ID 直接返回原对象、不访问内部集合。
- `data` 是调用方持有的 `compileAtlas` **投影**，不是原始 Schema 2 JSON。函数为该投影增加展示字段并返回同一对象；不能向它传入原始稿件以代替生产准备步骤。
- 每条 `data.tenures` 和 `data.states[].rulers` 都按明确任期 ID 绑定 `display: {shortTitle, personalName}`。两处采用独立对象，保留原有无关 display 字段。
- 四卷全部 41 个政权条目（6/17/11/7）按专题内明确政权 ID 绑定 `display.shortName`，同时覆盖 `data.states` 与 `data.polities`；不从名称正则裁切。两套集合各自创建独立记录外壳，并深拷贝既有 display 元数据，连输入两投影同对象/同数组的情况也不共享 display 或其中嵌套对象；其他原字段值不变。
- 所有任期与两套政权投影的 ID 都在任何写入前先校验。未知任期抛出 `Missing explicit expansion tenure display: <ID>`，未知政权抛出 `Missing explicit expansion polity display: <ID>`；即使是另一专题已知政权 ID，也不能作为当前专题回退。不以姓名或 `personId` 猜测，也不留下半份注解。
- 新增 `data.presentation = {...existing, version: 1, rowGroups: [...]}`。组与 `stateIds` 数组每次重建，不跨投影共享可变对象。重复调用幂等。
- 不改变原名称、日期、ID、来源、异说 `alternatives`、角色、任期顺序、政权或关系；不创建、删除、合并任何历史实体。所有原字段仍供详情和导出使用。

生产入口 [lib/production.mjs](../lib/production.mjs) 的调用顺序示意如下；本模块不修改生产入口或构建：

```js
const prepared = prepareExpansionProduction(input, id);
const projection = compileAtlas(prepared);
return annotateExpansionDisplay(projection, id);
```

`prepareExpansionProduction` 属于独立 intake 技术适配，在展示模块之外；本模块不绕过基本数据校验，也不修订稿件的年代学判断。

## 接续行与规模

| 专题 | 原政权 | 原任期 | 全量展示行 | 接续策略 |
| --- | ---: | ---: | ---: | --- |
| 夏商 | 6 | 53 | 5 | 夏 → 商共行；有穷/寒浞、古蜀、鬼方/羌方、周另行 |
| 五代十国 | 17 | 59 | 11 | 后梁 → 后唐 → 后晋 → 后汉 → 后周 → 北宋主行；杨吴 → 南唐一行；其余十国及辽独行 |
| 元 | 11 | 25 | 11 | 原政权各自一行，不将宋、金、西夏、大理与蒙古/元拼成接续链；元末群雄并列 |
| 清 | 7 | 19 | 6 | 明 → 南明共行；后金/清、大顺、吴周、准噶尔、太平天国独行 |

五代主链虽含六个实体，但仅明确接续的短跨度链，不吸收并立政权。当前四卷分组行的政权区间最多 2 层、任期最多 3 层；不以机械拼组压缩更多行。前蜀和后蜀不因同一地域名称而自动合成直接接续。

所有同年端点仍按原 inclusive 年精度分层，例如夏商前1600年、五代主链交接年和明/南明1644年。不裁剪“重叠年份”，不把展示行误当唯一合法政权。

`Presentation.rows` 接收的是已经筛选后的 `states`。分组只组合现有成员，固定组内某一政权只置顶该行，不能带回被筛出的成员。详情、筛选、关系定位和导出继续使用原 `state.id`、`tenure.id`、`personId` 与 `polityId`，不使用组 ID 代替实体 ID。

## 手机政权短名

所有短名都是当前卷原名称中存在的明确字符串，以 1—3 汉字为主；“太平天国”保留 4 字完整政权名，避免“太平”含混。短名仅用于紧凑展示，原始 `name` 不变；完整 title、aria、详情由已有 UI 保留，不改 UI。

| 专题 | 明确 ID → 短名 |
| --- | --- |
| 夏商 | `xia`→夏；`youqiong-han`→有穷；`shang`→商；`ancient-shu`→古蜀；`guifang-qiang`→鬼方；`zhou`→周 |
| 五代十国 | `later-liang`→后梁；`later-tang`→后唐；`later-jin`→后晋；`later-han`→后汉；`later-zhou`→后周；`wu-yang`→杨吴；`wuyue`→吴越；`former-shu`→前蜀；`ma-chu`→马楚；`min`→闽；`southern-han`→南汉；`jingnan`→荆南；`later-shu`→后蜀；`southern-tang`→南唐；`northern-han`→北汉；`liao`→辽；`northern-song`→北宋 |
| 元 | `mongol-yuan`→元；`western-xia`→西夏；`jin-jurchen`→金；`dali`→大理；`southern-song`→南宋；`tianwan-xu`→徐宋；`zhang-zhou`→张周；`red-turban-song`→韩宋；`chen-han`→陈汉；`ming-xia`→明夏；`ming`→明 |
| 清 | `later-jin-qing`→清；`ming`→明；`dashun`→大顺；`southern-ming`→南明；`wu-zhou`→吴周；`dzungar`→准噶尔；`taiping`→太平天国 |

“有穷”“鬼方”等只是原聚合实体的紧凑短称，不删除寒浞、羌方或更改实体构成；“元”“清”“明”也不意味着按改国号年份拆分或抹去此前身份。分组、日期和筛选身份均保持不变。

## 短标签取舍

- 夏、商、有穷/寒浞的 `shortTitle` 留空，`personalName` 使用当前原件可见的主称，例如禹、予、文丁、帝辛；并非断言这些均为现代意义的个人本名，不补推姓氏或帝号。别名、世次、传统纪年、考证与完整名称都留在原字段。
- 周方邦诸任期只取当前夏商卷已有的周太王、王季、周文王、周武王及其原载人名。`zhou-r0` 绑定的是本卷的姬发，不从周卷抓取别称或延长日期。
- 五代、十国按当前卷已有称谓选择；杨行密、杨渥、杨隆演分别使用吴王、弘农郡王、吴国王，避免将后追庙号误读为当时已称皇帝。马希声、马希崇、高保勖、高继冲只显示姓名；原任职保留详情。
- 元文宗 `yuan-tenure-wenzong-1` 与 `yuan-tenure-wenzong-2` 分别标注“元文宗（初任）”“元文宗（复辟）”。不能因同一 `personId` 覆盖或合并两任；中间明宗及天顺帝等重叠继续分层。
- 拖雷明确显示“监国 拖雷”；乃马真后和海迷失后显示“称制皇后”，不是皇帝。后妃 `personalName` 保守使用稿件已有主称，不从外部猜测私人姓名。
- 元卷朱元璋任期横跨吴国公/吴王/皇帝，张士诚、吴三桂和噶尔丹也有复合身份，均留空短标题而保留人名及完整详情。徐寿辉、陈友谅无可靠附加短帝号，同样只显示姓名。
- 清朝十二位君主任期按当前卷已有汗号、庙号或年号短称。多尔衮摄政、两宫垂帘、载沣摄政等原名称和人物资料均保留；原件并没有独立摄政任期，因此不制造新任期，也不把摄政者伪标为皇帝。
- 太平天国原任期使用原载“天王 洪秀全”，不改作皇帝。

## 跨卷同 ID 不是全局合并许可

注解只在当前专题投影内部使用；绝不全局按 ID 或中文名称合并实体：

- 五代 `later-liang` 是后梁（907—923），不是魏晋卷相同 ID 的后凉（386—403）。
- 清卷 `wu-zhou` 是吴周（1673—1681），不是隋唐卷相同 ID 的武周（690—705）。
- 夏商卷 `zhou` 与 `zhou-r0` 仅保留该卷原载范围（前1150—1046、前1050—1046）；不因周卷有同 ID 而扩展、补齐或重排。

## 测试

[expansion-display.test.mjs](../tests/expansion-display.test.mjs) 同时测试独立投影夹具及真实 `prepareExpansionProduction → compileAtlas → annotateExpansionDisplay` 路径。

```sh
node --test tests/expansion-display.test.mjs
```

覆盖全部 156 条任期及其 ruler 副本、全部 41 个政权双投影的显式短名/原文支持、投影别名引用及嵌套 display 元数据独立性、冻结原稿不变性、全部日期与异说完整性、5/11/11/6 行、交接年和真实并存分层、分组规模、复位与监国身份、共享 ID 当前卷称谓、筛选与固定成员、详情/导出实体身份、幂等性、任一政权集合的未知 ID 写前原子失败和未知专题 no-op。测试不联网验证史实；构建与发布流程见[部署说明](DEPLOYMENT.md)。


</details>

<details id="archive-time-domain-20261023">
<summary>TIME-DOMAIN-MIGRATION.md（归档原文）</summary>

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


</details>

<details id="archive-compatibility-baseline-20261023">
<summary>COMPATIBILITY-BASELINE.md（归档原文）</summary>

# 周朝固定兼容基线

## 来源与运行

- [测试](../tests/zhou-baseline.test.cjs)和[固定输入与预期](../tests/fixtures/zhou-baseline.json)保护周朝既有查询、阅读、分享和导出契约。
- 测试运行只读取上述 JSON，不生成、更新或从当前实现推导 expected；不要用新版输出覆盖 fixture 来消除回归。
- 使用既有[浏览器边界辅助器](../tests/helpers/browser.cjs)，加载当前构建产物，无需浏览器或第三方依赖。

```powershell
node tests/zhou-baseline.test.cjs
# 正常允许子进程的环境也可用：
node --test tests/zhou-baseline.test.cjs
```


## 固定覆盖

1. **旧查询**：13 个固定查询的稳定 key、标题与命中原因；包含同名齐桓公、简繁、别名、空白、人物与简介分离、无结果、所选国家范围。
2. **同年口径**：24 组查询分别固定国家存在、实际即位君主、条带君主、事件与中断信息。覆盖秦孝文王/庄襄王/秦王政的继承与元年差异、晋悼公前573/572年、齐威王前356/355年，以及燕/陈/蔡中断与复国前后边界。
3. **秦前221年阶段边界**：秦王政条带前246—221、实际继位前247、前221称帝而非去世/退位、前210去世；国家在前221存在、前220不在周朝阶段范围。
4. **分享 v1**：两个直接保存的、含完整视图与详情的代表 hash（旧人名 `person:商鞅`、长平之战 `event:e91`），固定解析结果、视图、钉选/排序、详情文字与规范化 key；同时验证编码/解析往返。不从当前 encoder 生成输入链接。
5. **旧阅读记录**：保存了旧版 `zhou-reading-v4` / `zhou-visits-v4` / 布局与钉选记录；人物访问使用旧名 key，验证迁移为稳定 ID、根视图、详情滚动318、关闭返回，以及 1200/390 两种宽度下的实际恢复数值。记录时间使用固定值，不比较当前时刻。
6. **JSON 和图页**：齐前355、秦前260—221、晋前580—570、蔡/陈前535—529四组。固定选定元数据、君主与事件关键字段、日期争议、原典与现代来源、图页条带/lane、事件 E 编号、完整文字/来源索引及 Canvas 实际绘制文字。额外走真实 JSON 下载入口，验证文件名、MIME 和 Blob 内容。
7. **隔离**：排版与 Canvas 绘制不得改变 JSON/plan；修改一次导出的国家、君主、事件、来源、纪年节点来源以及异说及其来源，不得污染原资料或后续导出；恢复不修改调用者的旧记录对象。

## 比较口径

- 只固定挑选的稳定字段；对象新增元数据字段兼容，原有字段缺失、数值变化以及数组成员/顺序变化仍失败。
- 导出日期尾部归一化为 `<DATE>`；数据更新时间、标题、实际年份、来源编号、出处与异说正文仍固定。刻意不固定像素截图、PDF/ZIP 二进制与运行时间。
- 这组基线只保护周朝 BCE 坐标与内容不变。运行时 `Zhou.Time` 和跨公元 `CE y -> 1-y` 的能力由独立测试验证，不能反向改写本 fixture。
- 边界辅助器不是完整浏览器：Canvas 通过绘制命令/文字验证，不宣称完成真实字体、像素布局或设备视觉验收。


</details>


| 2026-10-23 | 首屏瘦身 | 传记补充移至构建模块，公共脚本从787025字节减至252567字节（gzip从207800减至77500）；540项测试通过，11专题固定投影和原件保持；旧维护命令转调统一构建 | `4277766` |


## 2026-10-23 文档归并与发布前验收

| 日期 | 操作 | 原因与验证 | 提交哈希 |
|---|---|---|---|
| 2026-10-23 | 展开全部政权的分组附注边界修正 | 统一附注边距，使实际高度符合成员预算；默认与全部展开均纳入浏览器回归 | `ce654ff` |
| 2026-10-23 | 当前文档归并 | docs从8份减至3份；五份退役全文追加归档且既有历史前缀逐字节保持；当前展示规则集中架构，日期/关系集中资料说明；5份当前文档的38个本地链接与锚点通过 | `f17b71c` |

发布前验收：540项Node回归、22个人物入口场景、56项默认/展开及响应式分组布局检查、22个完整Chrome展示场景通过。完整场景含筛选、搜索、同年对照、阅读恢复、分享编解码、JSON及图片PDF生成；本机真实设备触控和打印未在本轮人工验收。

原件JSON和周朝发布数据散列与基线一致；十一专题有效投影及七专题原件投影的固定样本保持，未重算预期。首屏公共脚本gzip减少约62.7%，不将文件体积减少等同于端到端加载耗时同比下降。未进一步改造兼容数据的传输结构，也未变更托管服务或新增依赖。

本地证据位于忽略目录 .validation/final-unit.tap、.validation/figures/results.json、.validation/display-local-results.json 与 .validation/startup-slim.json。发布产物releaseId为 `d7c20d1e9179bdd02c3de89bcc07e3d622eacd196c7f3c41a6e8320532623d0b`；此处记录发布前状态，线上结果以后续实际验收记录为准。


## 2026-10-23 显示、首屏与文档优化线上交付

| 日期 | 操作 | 验证与结果 | 提交哈希 |
|---|---|---|---|
| 2026-10-23 | 主改动合并与发布 | [运行39816656217](https://github.com/Chrunge/Zhou-Dynasty-Timeline/actions/runs/39816656217)的构建和Pages均成功 | `4dc4dffd8d9aef2fb49ab96c0e12f1c7dda2d4c2` |
| 2026-10-23 | 跨专题详情名称统一 | 详情链接和外部背景同样使用宋辽金显示映射，原URL、ID和资料保留；[最终运行39817375649](https://github.com/Chrunge/Zhou-Dynasty-Timeline/actions/runs/39817375649)的构建和Pages成功，541项Node回归及Chromium入口/布局套件通过 | `a3aa0c48cf16b22368dab8baa7f70f5275121fa3` |

两次工作流按既有并发规则依次完成，没有取消正常运行；依据用户部署授权，使用环境允许的仓库身份批准github-pages发布，未修改保护设置。

线上资源核验于2026-10-23T00:07:51.584Z完成：根入口200，release.json与本地逐字节一致，全部41个资源SHA-256及HTML版本参数匹配。最终releaseId为 `b90d5c0ad9e47596be94abadc4d3080318b3ee3b41c6a21cd971f2c7de360e6d`。

线上浏览器核验于2026-10-23T00:08:16.160Z完成，Chrome 155.0.8059.85共8项检查通过：当前脚本没有传记总集；秦汉、五代十国、宋辽金在375/1200px的默认与全部展开左列均不裁切或覆盖，宋默认第一行，五代北宋详情的跨专题链接显示宋辽金并实际跳转至正确专题与详情。

最终app.js为252636字节，gzip为77535字节，较基线787025/207800字节分别减少约67.9%/62.7%。线上本次压缩传输77285字节；桌面冷启动单次抽测首字节447ms、DOM就绪1011ms、加载1012ms。网络等待也有变化，此样本不代表用户设备速度或仅由代码带来的耗时改善。

首次线上核验命令因自动审批服务返回额度限制未执行，用户要求继续后已补齐。本地最终证据为 .validation/display-live-release.json 和 .validation/optimized-live.json；文件不进入发布目录。当前说明只保留架构、部署和历史三份docs文件，原资料及兼容投影保持。

本记录提交仅保存真实验收证据，使用 [skip ci] 避免为记录再次发布相同资源；生产资源对应上表最终代码提交，未宣称记录提交运行了新CI。


## 2026-10-23 第一批归档与维护手册

| 日期 | 条目 | 做了什么 | 原因与验证 | 提交哈希 |
|---|---|---|---|---|
| 2026-10-23 | G01 | 将.validation、scratch、Microsoft归档到arichive；保存恢复/清理说明及本地逐文件清单，压缩包与清单忽略提交 | 10441个文件、5069个目录条目，原914283144字节，四包626014035字节；ZIP条目、迁移前源文件和迁移后暂存内容逐项SHA-256一致后移走原临时目录；541项测试和构建检查前后均通过 | `1195351` |

源码、正式数据、固定测试样本、dist、node_modules、backups和.openai保持；归档包由用户后续手动决定清理。Git只保存归档README，未纳入ZIP或逐文件清单。

<details id="archive-deployment-20261023">
<summary>DEPLOYMENT.md（整合前完整原文）</summary>

# GitHub Pages 部署

线上地址：[历史时间线](https://chrunge.github.io/Zhou-Dynasty-Timeline/)。个人博客使用域名根路径，时间线使用项目子路径，两者独立部署，无需复制源码到博客。

## 工作流

[site.yml](../.github/workflows/site.yml) 使用 Node.js 22，发布分支为 master，上传目录为 dist。

| 阶段 | 行为 |
|---|---|
| 检查 | PR、master 推送和手动运行检查已提交生成物，运行全部 Node 测试并构建 |
| 浏览器 | 安装锁定的开发依赖与 Chromium，运行真实人物入口与分组左列边界回归，覆盖手机、桌面及关键响应式宽度 |
| 可选 PNG | 手动 social_png 开启时安装中文字体、暂存 PNG 并由构建入口发布 |
| 上传 | 检查全部成功后仅上传 dist |
| 部署 | 仅 master 推送或 master 手动运行部署；PR 和其他分支不部署 |

检查作业只有 contents:read；部署作业使用 pages:write、id-token:write 和 github-pages 环境。工作流按引用分组控制并发，不取消正在执行的部署。开发依赖不进入发布目录。

## 仓库设置

仓库 Settings → Pages → Build and deployment → Source 选择 GitHub Actions。账户、组织和 github-pages 环境策略须允许对应部署，环境分支限制与 master 一致。若 github-pages 设置了所需审批人，检查通过后由具备权限的身份批准该次发布；等待审批不表示构建失败。

## 本地准备与发布

按[维护与检查](../README.md#维护与检查)验证源码和生成物，将它们一起提交。合并到 master 并推送后，工作流自动执行；检查失败不会部署。运行状态见 [Actions](https://github.com/Chrunge/Zhou-Dynasty-Timeline/actions)，线上产物可与 [release.json](../dist/release.json) 的 releaseId 和资源散列核对。

页面、数据、代码和样式必须作为同一 dist 发布。资源版本参数由构建维护，相同源码生成相同入口；不要手动改 dist 或只复制某个脚本。

## 可选PNG社交图

默认使用 SVG。需要 PNG 时，可在 master 手动运行中开启 social_png；本地流程为：

~~~sh
npm ci
npx playwright install chromium
node build.mjs
node tools/render-social-previews.mjs
node build.mjs --social-png-dir=.validation/social-png
node build.mjs --check --social-png-dir=.validation/social-png
~~~

本机已有 Chrome 时可设置 SOCIAL_CHROMIUM_CHANNEL=chrome，或用 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH 指定兼容浏览器。渲染离线运行，中文字体影响结果；PNG 不要求跨操作系统字节一致。构建检查 PNG 头部、1200×630尺寸、原 SVG 与 PNG 散列，拒绝陈旧输入。普通检查使用默认 SVG，PNG 模式须携带相同参数。

## 排障

| 现象 | 检查方式 |
|---|---|
| dist 缺失或过期 | 重新构建并提交生成物 |
| 引用校验失败 | 修正稳定 ID、显式专题作用域或有依据的未收录声明 |
| 浏览器验收失败 | 查看具体入口与 .validation/figures/ 报告，不使用强制点击掩盖遮挡 |
| Pages 权限错误 | 检查来源、Actions 权限、组织策略和环境限制 |
| 部署被跳过 | 确认推送或手动运行的分支为 master |

原 Sites 配置 .openai/hosting.json 不参与 Pages 工作流。部署与验收历史见 [HISTORY](HISTORY.md)。


</details>
