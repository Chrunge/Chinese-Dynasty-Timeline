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
