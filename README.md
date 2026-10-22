# 周代列国 · 历史对照图

纯静态中文历史资料库，提供夏商、周朝、秦汉、三国、魏晋南北朝、隋唐、五代十国、辽金宋、元朝、明朝、清朝十一个专题入口，支持同年对照、搜索、详情、阅读恢复、分享和导出。旧专题范围、链接和存储兼容；专题窗口不裁切实体本身的历史起讫。

在线访问：[周朝时间线](https://chrunge.github.io/Zhou-Dynasty-Timeline/)。个人博客使用域名根路径，时间线使用独立的项目子路径。离线使用时，直接打开 `dist/index.html`；独立复制或部署时使用完整的 `dist/` 目录。

## 使用

- 首屏工具栏分为搜索、时间（年份与缩放）、政权与视图入口、导出／分享四个模块，专题切换条独立于工具栏。重点人物、选择政权与视图设置集中在第三模块，展开状态自动保存；行高、视窗、密度、研究组合、阅读与帮助保留在视图设置面板内。
- 首次访问有三步引导，可用Tab／Enter操作、Esc或“跳过”退出；完成后不重复提示，可在高级帮助中重看。
- 拖动、滚动和缩放时间轴，使用时代按钮或年份输入定位。触屏支持单指惯性拖动、双指中心缩放；金色参考线有独立44px拖动热区，可用左右键逐年调整。密集条目触控时先选择项目，不放大历史条带几何；768px以下详情有35／60／90%三档底部抽屉。
- 五类事件以不同SVG图标配合原类别色区分；关键事件优先显示原标题短标签，悬停／键盘聚焦显示跨政权引导。起点“未定年世系”胶囊进入原序链条，不给先公补定年。
- “同年天下速览”列出当前专题全部存续政权、采用元年计算的年次、当年事件及明确系于当年的人物活动；不把分散事迹推成连续活跃期。纪年详情可用键盘对比采用区间／原异说并跳到史源；Alt+Y聚焦参考线，Alt+E打开导出。
- 按国家筛选、排序或固定国家行；支持全局及单国行高、视窗高度、自适应行高和展开对比。行高增加时，密集事件会优先利用条带旁的空白分层展开，空间仍不足才折叠；缩小行高后自动恢复聚合。
- 搜索国家、君主、人物或事件，支持常用简繁体、别称、全站／当前国家范围；“同时搜索简介”控制是否检索正文。未定位君主只显示资料，不生成虚构时间点。
- 点击条目查看生平、原典来源、纪年异说及相关内容。详情返回按钮或Esc逐级返回，关闭详情恢复进入前的阅读视图；主动定位保留目标年份。
- 使用内置组合，或保存、导入、导出自己的对照组合。布局、组合、阅读位置及最近50条浏览记录保存在当前浏览器。
- “分享当前对照”和“分享此详情”复制包含筛选、顺序、固定行、缩放、参考年、搜索及详情的链接；另可复制“摘要＋链接”。跨设备使用在线链接；离线文件链接需要接收方能够访问相应文件。详情底部“资料纠错”预填专题、原始ID、名称及参考年，需自行补充来源并提交，不自动修改资料。
- 导出当前显示国家及指定时间范围的JSON、A4横向图片PDF或PNG／ZIP。图页附君主、事件、图例、纪年与异说来源索引；异说说明和引用编号随文字索引分页，PDF页面中的文字不可选中。

内容密度可自动切换或手动设置：低于2.4px／年显示兴亡与关键事件，2.4—7px／年显示常规内容，更高缩放下在空间允许时显示详细年份。点击事件会联动相关国家、当年君主及已收录参与人物；在位不等于直接参与事件。

秦汉的秦、西汉、新、玄汉、东汉共用接续主行；魏晋的两晋、南朝及北朝两条接续支系分别共行；唐与武周、两宋、明与南明分别接续分组，隋独立成行。并存政权独立显示，所有真实同年重叠分层，原实体、日期与身份不合并。新增专题君主条带优先短名号＋姓名，名号复杂时只显示姓名；完整称谓、任职、生平与来源保留在提示和详情。筛选、固定、排序、分享、阅读和导出始终保留原政权／任期身份，详见[原显示契约](<docs/PRESENTATION-CONTRACT.md>)与[四专题展示分组](<docs/DYNASTY-DISPLAY.md>)。

浏览器提供原生WebMCP API时，周朝页面保留 `compare_zhou_year`，新增专题注册 `compare_history_year` 工具；其他浏览器正常使用网页功能。

## 资料与采用口径

周朝资料包含18行国家与王室、465个君主区间、80项未定位君主、116位独立人物、105条事件、62段活动及62项来源。129个在位区间有专门生平简介，78个区间关联人物，12位人物有结构化活动轨迹，20条事件有明确参与人物。

`data/atlas.json` 是周朝发布资料的唯一编辑入口；`lib/atlas.mjs` 校验资料并生成浏览器投影。既有schema 1继续使用公元前正整数；新schema 2用 `{era:"BCE"|"CE",year:正整数}` 编写日期。运行时统一转换为 `bce-axis` 坐标：前1年=1、公元1年=0、公元2年=-1，不存在历史上的公元0年；未知日期仍为 `null`。采用年表起点与实际即位分开记录，未核实结局不从条带端点推算。纪年区分较确定、推定、存在异说，并注明校核状态。资料为精选，西周早期及部分战国纪年仍有待考事项。

秦前221年统一是诸侯国阶段结束，不是秦王政统治结束。国家中断、复国、残余政权及相关人物经历分别维护，人物活动不自动改变事件涉及国家。

## 跨时期资料结构

时期是专题窗口，不是政权实体：`periods` 引用共享 `polities`；`tenures` 通过 `personId` 连接自然人，同一人物可有多段任期，不按姓名自动合并。现有国家／君主ID继续保留，旧接口仍可读取 `states/rulers` 兼容投影。

正式资料为 [秦汉](<data/qin-han.json>) 和 [三国](<data/three-kingdoms.json>)，逐字节保存用户提供的原文件，不以结构样例替代。秦汉包含8个政权、78个人物、74段任期、32条事件；三国包含5个政权、51个人物、17段任期、23条事件（跨专题共享ID不能直接相加作为独立实体总数）。[结构样例](<data/examples/README.md>) 仍仅供演示，不参与生产构建。

新增正式资料：[魏晋南北朝](<data/wei-jin-nan-bei.json>)、[隋唐](<data/sui-tang.json>)、[辽金宋](<data/liao-jin-song.json>)、[明朝](<data/ming.json>)，均逐字节保留原件。对应政权／任期／人物／事件数量为28／99／140／21、10／36／67／16、8／58／97／12、6／31／54／9。跨卷共享ID保留原名，各卷描述或来源差异不互相覆盖；构建生成[统一出处索引](<dist/corpus.json>)，按类型与稳定ID列出所有原始位置及字段差异，不按姓名猜测合并。

新增正式原件：[夏商](<data/xia-shang.json>)、[五代十国](<data/five-dynasties.json>)、[元朝](<data/yuan.json>)、[清朝](<data/qing.json>)，政权／任期／人物／事件分别为6／53／67／13、17／59／69／7、11／25／39／8、7／19／39／9。夏商的夏→商、五代主线与杨吴→南唐、清卷明→南明接续共行，其他并存政权各自保留；元监国、称制及复位任期不合并，完整称谓和资料不因短标签省略。详见[新增四卷入库](<docs/EXPANSION-INTAKE.md>)与[展示契约](<docs/EXPANSION-DISPLAY.md>)。

夏商18条争议纪年未列足独立异说，投影明确按legacy继承并保留sourceDating；不编造第二观点。跨卷有两处不同政权复用ID（后凉／后梁、武周／吴周），索引显式标记dataset作用域，各卷查询、链接和存储严格隔离，不误并为同一实体。

新专题入口：[夏商](https://chrunge.github.io/Zhou-Dynasty-Timeline/xia-shang.html)、[五代十国](https://chrunge.github.io/Zhou-Dynasty-Timeline/five-dynasties.html)、[元朝](https://chrunge.github.io/Zhou-Dynasty-Timeline/yuan.html)、[清朝](https://chrunge.github.io/Zhou-Dynasty-Timeline/qing.html)。此前专题入口为原站根路径、[秦汉](https://chrunge.github.io/Zhou-Dynasty-Timeline/qin-han.html)、[三国](https://chrunge.github.io/Zhou-Dynasty-Timeline/three-kingdoms.html)、[魏晋南北朝](https://chrunge.github.io/Zhou-Dynasty-Timeline/wei-jin-nan-bei.html)、[隋唐](https://chrunge.github.io/Zhou-Dynasty-Timeline/sui-tang.html)、[辽金宋](https://chrunge.github.io/Zhou-Dynasty-Timeline/liao-jin-song.html)、[明朝](https://chrunge.github.io/Zhou-Dynasty-Timeline/ming.html)。全部共用同一套应用；布局、组合和阅读状态按专题隔离，周朝保留原存储键。来源声明沿用用户输入，**本次没有联网核对史实**；原件中的“已校核”不代表本次入库背书。原文件散列、结构注释与限制见[原正式入库说明](<docs/FORMAL-DATA-IMPORT.md>)及[四专题入库记录](<docs/DYNASTY-INTAKE.md>)，发布证据见[部署记录](<docs/DEPLOYMENT.md>)。

## 维护与检查

需要Node.js 22或更高版本，无需安装第三方依赖。在项目根目录执行：

```sh
node build.mjs
node build.mjs --check
node --test tests/*.test.mjs tests/*.test.cjs
# 受限环境不能创建测试子进程时（Node 22+）：
node --test --test-isolation=none tests/*.test.mjs tests/*.test.cjs
```

编辑前端使用 `src/`；十一专题原件及适配说明见[资料目录约定](<data/README.md>)、[生产目录](<lib/production.mjs>)和上述入库记录。`dist/` 全部由构建生成，不直接修改；统一生成导航、数据脚本、出处索引与发布清单。构建为发布HTML添加资源内容版本参数，`--check` 只校验，不写文件。

安装了Chrome的Windows环境可运行 `node tests/browser-presentation.mjs`，以真实浏览器验收十一页×两种宽度；传入原站HTTPS根地址可验收线上版本。浏览器只访问被测页面和资源，不打开历史来源链接。截图与执行报告位于忽略提交的 `.validation/`。

P0交互回归另提供 [Playwright脚本](<tests/browser-p0.mjs>)。安装开发依赖 `npm ci` 后，在已安装Chrome的环境执行 `node tests/browser-p0.mjs`：离线覆盖十一专题×375／390／768／1200／1440px、键盘引导与刷新、44px控件、实际触控与三档抽屉、存储拒绝。可用 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` 指定Chrome兼容浏览器；依赖只用于开发测试，发布目录不包含Playwright或node_modules。交付与限制见 [P0界面说明](<docs/P0-INTERFACE.md>)。

P1语义与无障碍验收见 [阶段说明](<docs/P1-SEMANTICS.md>)。安装开发依赖后运行 `node tests/browser-p1.mjs`（离线十一专题、axe默认全部启用规则且不覆盖规则配置、全键盘链）和 `node tests/lighthouse-p1.mjs`（临时回环服务上的Accessibility审计）；原始报告和额外WCAG 2.2图元尺寸提示均保留，不以自动分数声称完整标准认证。开发工具不进入发布包。

阶段三增加十一专题独立SEO元信息、禁用脚本可读的完整年表、SVG社交图及可选PNG构建；分享摘要、导出范围说明和Issue Form纠错均不修改史料。执行 `node tests/browser-publication.mjs` 验收十一专题的无脚本阅读、复制、JSON下载与反馈链接；PNG模式、限制与本地结果见 [阶段三说明](<docs/STAGE3-PUBLICATION.md>)。本轮没有自动提交或部署。

阶段四支持可选 `endYear` 区间事件、按真实共享ID生成的跨卷详情链接及14px短祚微槽。闭区间查询、同年看板与导出共用日期口径，缺终点仍按旧单点处理；不向正式原件补造跨年记录。安装开发依赖后运行 `node tests/browser-stage4.mjs`；模型与展示边界见 [阶段四说明](<docs/STAGE4-ENTITIES.md>)。本轮没有自动提交或部署。

受限Windows环境如出现父目录realpath的EPERM，可为Node命令添加 `--preserve-symlinks --preserve-symlinks-main`。自动化测试覆盖资料校验、查询、组合、导航、渲染、分享及导出；DOM桩检查不替代真实浏览器排版、触控或打印验收。

兼容命令 `sync-data.mjs`、`enrich-context.mjs`、`enrich-people.mjs` 均转调统一构建，不另外补写历史资料。

## 文档

- [架构与模块边界](docs/ARCHITECTURE.md)：数据流、接口、状态、阅读恢复、分享与导出。
- [部署说明](docs/DEPLOYMENT.md)：Pages配置、工作流和排障。
- [资料模型与维护约定](data/README.md)：字段、关联、纪年及来源约束。
- [操作历史](docs/HISTORY.md)：版本、导入、发布、资料校核及清理记录。
