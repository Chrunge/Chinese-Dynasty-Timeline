# GitHub 导入说明

本项目从 Sites 导入到私有仓库 [Chrunge/Zhou-Dynasty-Timeline](https://github.com/Chrunge/Zhou-Dynasty-Timeline)，默认分支为 `master`。

## 导入内容

- 当前网站源码、历史数据、资料说明、生成脚本及测试文件，共 21 个原始文件。
- 8 个按原先顺序接入的 Site 历史版本。每个版本的 Git tree SHA 与原项目相同，因此文件内容、路径与权限均一致。
- 保留仓库最初的初始化提交 `b2db80a645103b9d090ac954f038888e5f2eca11`。
- 原始 Git 历史备份：`backups/sites-history.bundle`，包含原项目全部 8 个提交、原始提交 SHA、作者及日期。

当前原项目提交：`fd8742cdd4d7f26cf636fac47bd2f838ca0a5d92`。

## 版本对应

导入的提交接在仓库初始化提交之后，GitHub API 创建了新的提交元数据，因此其提交 SHA 与原项目不同。原始元数据同时记录在导入提交信息和 bundle 中。

| 原始提交 | GitHub 导入提交 |
| --- | --- |
| `4b87783813d36dc92405d63e1374a495bf946b53` | `2a9987615c58a28fe2513b71efc72e5ea91dbf4f` |
| `41109ef9b38c39f1adf04462fa4c69cc6302a21c` | `98e0a5527599228e1cf8aa690d8e080edba9ed9b` |
| `f9fc7f495141b85c3187e7d7ea2d3bba3030718e` | `62d0c01c5288690551f0a725678c5f457a65c134` |
| `e5d09b4b620592fe7545f3f260e285f0055eecac` | `2f525cb2985e86766db3f3c21c65bf6903935483` |
| `9886106643f6bf6da6d9a7ad1c59f32d15f0f681` | `b686587f822329f534ca38d06a2ae096f10889cc` |
| `72ca685e59808da823dc47fe5d3c243fe512b974` | `94fbbc22c91d60b0e14c259ab9250e2ddc5c76a9` |
| `fb7ede4728c94b9228fbf615f17c5bb13bec111c` | `e73d0ce75abe14b176d20afeddfd9471e14b1a7c` |
| `fd8742cdd4d7f26cf636fac47bd2f838ca0a5d92` | `b9c79002fbb2a07806029271a830ddca5d06998e` |

## 恢复原始历史

在本仓库的本地副本中执行：

```bash
git bundle verify backups/sites-history.bundle
git clone backups/sites-history.bundle ../zhou-original-history
```

恢复后的分支为 `main`，保留原始 8 个提交的完整历史。

备份 SHA-256：`36d67e23bef9a9999885d127c2cb113dc88ee8b702e444d1c9a1482f6da8565e`。

## 后续维护

本次是一次性完整导入，不会自动同步后续 Sites 修改。后续修改需要另行提交到本仓库。网站托管设置保留在 `.openai/hosting.json`；本次导入没有重新部署网站。
