# GitHub Pages 部署

在线地址：[周朝时间线](https://chrunge.github.io/Zhou-Dynasty-Timeline/)。

仓库为 [Chrunge/Zhou-Dynasty-Timeline](https://github.com/Chrunge/Zhou-Dynasty-Timeline)，Pages发布来源是GitHub Actions，发布分支为 `master`，发布目录为 `dist/`。个人博客使用域名根路径，时间线使用项目子路径，两者独立部署，无需复制时间线源码到博客目录。

## 工作流

工作流位于 [site.yml](../.github/workflows/site.yml)，使用Node.js 22和官方Actions：

| 阶段 | 触发及行为 |
|---|---|
| 检查 | Pull request、master推送及手动运行均检查已提交生成物的一致性，运行全部测试，再构建 |
| 上传 | 检查成功后，仅上传dist目录作为Pages产物 |
| 部署 | 仅master推送或在master上手动运行时部署；PR及其他分支的手动运行不部署 |

检查作业只有读取仓库内容的权限；部署作业申请 `pages: write` 和 `id-token: write`，使用 `github-pages` 环境。工作流按引用分组控制并发，不取消正在执行的部署。

### 可选社交PNG产物

手动运行工作流时可开启 `social_png`，默认关闭。开启后才安装开发工具、Chromium及中文字体，在暂存目录渲染PNG，再由构建入口统一更新十一页元信息和发布清单；常规push／PR仍使用零依赖SVG成果。工作流先检查已提交的默认生成物，不用可选PNG掩盖过期源码。该配置尚未在本轮触发远端部署；本地隔离验证与完整命令见[阶段三说明](STAGE3-PUBLICATION.md#可选png社交图)。

## 仓库设置

在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。账户及组织策略须允许Actions和Pages，部署须满足 `github-pages` 环境的审批及分支限制。

工作流中的 `push.branches`、部署条件和环境分支限制须与发布分支一致。手动发布时选择 `master`。更改本地工作分支不会更改发布分支，也不会自动更新线上站点。

Pages来源配置属于仓库设置，工作流不代为修改。部署状态以[Actions列表](https://github.com/Chrunge/Zhou-Dynasty-Timeline/actions)和 `github-pages` 环境中的结果为准。

## 提交与发布

按[维护与检查](../README.md#维护与检查)运行本地命令，将源码、资料和生成的 `dist/` 一起提交。CI首先校验已提交产物，不能靠后续构建掩盖过期文件。

发布HTML引用的脚本和样式带内容散列参数；这些参数由构建维护。相同源码生成相同发布入口。源码、测试、资料源、文档和备份均不包含在Pages上传产物中。

## 排障

| 现象 | 检查方式 |
|---|---|
| dist文件缺失或过期 | 本地重新构建并提交生成物 |
| 测试失败 | 修复报告中的问题；失败的检查不会触发部署 |
| Pages权限错误 | 检查Pages来源、Actions权限、组织策略及环境限制 |
| 部署作业被跳过 | 检查是否由master推送，或手动运行时是否选择master |

原始Sites托管配置 `.openai/hosting.json` 保留在仓库中，不参与此Pages工作流。

## 发布历史

历次上线、发布检查与真实浏览器验收的提交、Actions 运行、散列和场景数量按时间归档在[操作历史](HISTORY.md)；记录中的数字与状态只表示当时情况。当前部署步骤以上文为准。

| 日期 | 记录 |
|---|---|
| 2026-10-19 | 正式资料上线与真实浏览器验收 |
| 2026-10-20 | 四专题（魏晋南北朝、隋唐、辽金宋、明）扩展发布检查 |
| 2026-10-20 | 夏商、五代十国、元、清扩展发布检查 |

上线前的生成物预检、上线后的原站核验命令及既有本地验收范围见[维护与检查](../README.md#维护与检查)、[阶段三说明](STAGE3-PUBLICATION.md)和[阶段四说明](STAGE4-ENTITIES.md)。
