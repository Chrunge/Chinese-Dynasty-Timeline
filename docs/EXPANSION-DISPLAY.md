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
