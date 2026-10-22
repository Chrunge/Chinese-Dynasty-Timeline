# GitHub Pages 部署

线上地址：[历史时间线](https://chrunge.github.io/Zhou-Dynasty-Timeline/)。个人博客使用域名根路径，时间线使用项目子路径，两者独立部署，无需复制源码到博客。

## 工作流

[site.yml](../.github/workflows/site.yml) 使用 Node.js 22，发布分支为 master，上传目录为 dist。

| 阶段 | 行为 |
|---|---|
| 检查 | PR、master 推送和手动运行检查已提交生成物，运行全部 Node 测试并构建 |
| 浏览器 | 安装锁定的开发依赖与 Chromium，运行真实人物入口回归；含手机年份浮层展开后打开画廊 |
| 可选 PNG | 手动 social_png 开启时安装中文字体、暂存 PNG 并由构建入口发布 |
| 上传 | 检查全部成功后仅上传 dist |
| 部署 | 仅 master 推送或 master 手动运行部署；PR 和其他分支不部署 |

检查作业只有 contents:read；部署作业使用 pages:write、id-token:write 和 github-pages 环境。工作流按引用分组控制并发，不取消正在执行的部署。开发依赖不进入发布目录。

## 仓库设置

仓库 Settings → Pages → Build and deployment → Source 选择 GitHub Actions。账户、组织和 github-pages 环境策略须允许对应部署，环境分支限制与 master 一致。

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
| 传记生成数据过期 | 运行传记数据生成工具，再构建 |
| 引用校验失败 | 修正稳定 ID、显式专题作用域或有依据的未收录声明 |
| 浏览器验收失败 | 查看具体入口与 .validation/figures/ 报告，不使用强制点击掩盖遮挡 |
| Pages 权限错误 | 检查来源、Actions 权限、组织策略和环境限制 |
| 部署被跳过 | 确认推送或手动运行的分支为 master |

原 Sites 配置 .openai/hosting.json 不参与 Pages 工作流。部署与验收历史见 [HISTORY](HISTORY.md)。
