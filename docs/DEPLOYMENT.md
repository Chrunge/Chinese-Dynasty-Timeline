# GitHub Pages 部署

站点工作流位于 `.github/workflows/site.yml`。2026年10月18日用户确认，Pages 的发布来源已设置为 GitHub Actions。实际部署结果以仓库 Actions 和 `github-pages` 环境中的最新记录为准。

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

此说明和工作流不会修改 GitHub 仓库设置；Pages 是否已启用、工作流是否已运行及站点是否可访问，需要在实际仓库中核实。
