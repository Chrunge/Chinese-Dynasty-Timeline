# GitHub Pages 部署

站点工作流位于 `.github/workflows/site.yml`。2026年10月18日已通过 GitHub Actions 成功部署至 [周朝时间线](https://chrunge.github.io/Zhou-Dynasty-Timeline/)。实际部署结果以仓库 Actions 和 `github-pages` 环境中的最新记录为准。

## 已执行的发布步骤

1. 确认时间线仓库启用 Pages，发布分支为 `master`。
2. 本地运行全部46项自动检查及 `node build.mjs --check`。
3. 将源码、测试、发布目录和 `.github/workflows/site.yml` 同步到时间线仓库，保留既有历史资料及备份。
4. 推送触发 Actions，依次校验生成物、测试、构建、上传 `dist/`、部署 Pages。
5. 在线检查页面、事件搜索、详情定位和分享入口。后续更新继续走相同工作流。

首次成功发布记录：[Actions #39086309694](https://github.com/Chrunge/Zhou-Dynasty-Timeline/actions/runs/39086309694)。后续修复与发布记录见 [Actions 列表](https://github.com/Chrunge/Zhou-Dynasty-Timeline/actions)。

脚本和样式引用附带由文件内容计算的版本参数；更新资源后自动变更参数，避免浏览器沿用旧版本。`dist/index.html` 由构建生成，勿手工编辑这些参数。

## 仓库设置

将项目文件提交到实际的 GitHub 仓库后，在仓库的 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。仓库必须已启用 GitHub Pages，且账户或组织策略允许 Actions 和 Pages 部署。

工作流以 `master` 为发布分支。如果仓库使用其他默认分支，需要同步修改工作流的 `push.branches`、部署条件中的分支名，以及 `github-pages` 环境的分支限制。手动运行时也必须选择 `master` 才会部署。

部署作业使用 `github-pages` 环境。如果该环境设置了审批或部署分支限制，须满足相应规则。部署成功后的站点地址会显示在该环境和部署作业中。

## 检查和发布顺序

Pull request、向 `master` 推送，以及手动触发都会运行以下步骤，使用 Node.js 22：

1. 先运行 `node build.mjs --check`，检查已提交的 `dist/` 是否与源码和资料源一致。此步骤不会生成或修复发布文件。
2. 运行 `node --test tests/*.test.mjs tests/*.test.cjs`。
3. 检查和测试成功后，运行 `node build.mjs`。
4. 使用官方 `actions/upload-pages-artifact` 上传 **仅 `dist/` 目录**。

只有向 `master` 推送，或在 `master` 上手动运行工作流，才会继续使用官方 `actions/deploy-pages` 部署。Pull request 以及其他分支上的手动运行只检查和构建，不部署。

工作流按引用分组控制并发，且不会取消正在执行的部署。Pull request 的检查不会挤占 `master` 的待部署任务。检查作业只具有读取仓库内容的权限；部署作业仅请求 `pages: write` 和 `id-token: write`，用于发布与身份验证。工作流使用官方 Actions 的主版本标签。

## 修改后的本地检查

修改源码或资料后，在项目根目录运行：

```sh
node build.mjs
node build.mjs --check
node --test tests/*.test.mjs tests/*.test.cjs
```

将源码、资料和生成的 `dist/` 一起提交。若遗漏更新 `dist/`，CI 会在第一项检查失败；工作流不会先生成文件来掩盖已提交产物过期的问题。

此项目不需要安装额外的 npm 依赖。Pages 发布内容来自 `dist/`，源码、测试、资料源和文档不会随站点产物上传。

## 排查部署失败

- `dist/... 缺失或已过期`：在本地重新运行 `node build.mjs`，并提交更新后的 `dist/`。
- 测试失败：修复测试报告中的问题后再推送；失败的检查不会触发部署。
- Pages 未启用或权限受限：确认 Pages 的 Source 为 **GitHub Actions**，并检查仓库、组织及 `github-pages` 环境的策略。
- 部署作业被跳过：确认触发来自 `master` 的推送，或手动运行时选择了 `master`。

Pages 来源配置是仓库设置，不由本工作流修改。新仓库仍须先完成设置；本项目已经启用并部署。
