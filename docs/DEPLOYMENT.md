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

## 2026-10-19 正式资料发布交接（尚未上线）

- 本地完成秦汉、三国正式资料、三个入口及兼容适配。`node build.mjs --check` 通过，139项自动化测试通过；真实Chrome因当前会话权限阻止而未完成验收，详见[正式入库说明](<FORMAL-DATA-IMPORT.md>)。
- 待发布[清单](<../dist/release.json>)：`releaseId=3935bf31fc3fe2ce4af28c40e69a49859fc379e9f0fbd677201ebc66e52023c2`。
- 使用原远端进行 `git -c credential.interactive=false push --dry-run origin HEAD:master` 预检失败：`sh.exe: *** fatal error - couldn't create signal pipe, Win32 error 5`，继而 `fatal: unable to get password from user`。当前受限委派会话不可扩权，未改用绕过权限的认证路径。此结果不能证明用户没有凭证，仅说明既有凭证程序无法在此权限范围内运行。
- **未实际推送、未触发本次部署、未创建替代站点**。部署访问检查：原站根路径HTTP200，新秦汉入口、新三国入口及远端 `release.json` 均HTTP404。
- 检查时原仓库最新master工作流为[运行39130605997](https://github.com/Chrunge/Zhou-Dynasty-Timeline/actions/runs/39130605997)，`head_sha=f0d566b101471f6bf8ab5aca841e5fd8a2de7f1f`、`conclusion=success`；该成功属于旧提交，不是本次交付的部署证据。

后续须由主会话在允许既有Git凭证程序运行的授权范围内推送最终提交至同一远端master；等待该提交对应的Actions检查/部署全部成功，再访问原站两个新入口并比对线上清单的releaseId及资源散列。若远端有并发更新，应先审查整合，不强制推送。部署成功后更新本节，不得将本地构建成功等同于上线成功。
