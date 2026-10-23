# 本地归档与手动清理

本目录保存从项目工作区移出的临时内容。压缩包和逐文件清单保存在本机；只有本说明随Git保存，不进入网站发布目录。Git并不会备份被忽略的归档包，需要长期保留的包应另存一份。

## 当前归档

| 包（相对本目录） | 内容 | 文件数 | 原始/压缩体积（MiB） | 保留建议 |
|---|---|---:|---:|---|
| `2026-10-23/browser-temp.zip` | 测试浏览器的缓存、配置与本地测试状态 | 9872 | 826.81 / 567.55 | 可重建；确认报告齐备后优先清理 |
| `2026-10-23/validation-evidence.zip` | 截图、日志、性能和上线验收报告，以及可重建的预览图暂存 | 566 | 45.07 / 29.45 | 建议保留最近2—3个已验收版本或约90天 |
| `2026-10-23/one-off-scripts.zip` | 历史资料转换与修订的一次性脚本 | 2 | 0.04 / 0.01 | 手动核对后决定；脚本包含原始JSON写入操作 |
| `2026-10-23/tool-cache.zip` | PowerShell模块分析缓存 | 1 | 0.01 / 0.00 | 可重建，可优先清理 |

共10441个文件及5069个目录条目；原始约871.93MiB，压缩包共约597.01MiB。每个ZIP中的条目和原目录在迁移时逐文件按SHA-256核对。

原路径保存在ZIP条目中，例如 .validation/、scratch/ 和 Microsoft/。备份目录 backups/、旧Sites配置 .openai/、开发依赖 node_modules/ 均保持原位；源码、正式数据、固定测试样本与当前 dist 不在这些包中。

## 清单怎么读

本地 manifest.csv 是当前归档快照，可用表格工具打开。Kind为archive的行描述ZIP本身，file描述原文件，directory保留目录结构。SHA256用于确认压缩包或文件内容，Bytes是字节数，ModifiedUtc为原修改时间；Archive是相对本目录的ZIP位置，Entry是包内原相对路径。

Rebuildable=yes表示测试工具能够重新生成该类缓存，不表示需要恢复旧缓存。partial表示该包中有可重建产物，也有不能逐字重现的历史报告或人工脚本。删除某包后，清单仍可保留作为索引，它不自动反映手动清理状态。

## 核验压缩包

从项目根目录执行以下PowerShell命令，只读取文件：

~~~powershell
$archiveRoot = (Resolve-Path -LiteralPath '.\arichive').Path
$packages = Import-Csv -LiteralPath (Join-Path $archiveRoot 'manifest.csv') |
  Where-Object Kind -eq 'archive'
foreach ($package in $packages) {
  $packagePath = [IO.Path]::GetFullPath((Join-Path $archiveRoot $package.Archive))
  if (-not $packagePath.StartsWith($archiveRoot + [IO.Path]::DirectorySeparatorChar,
      [StringComparison]::OrdinalIgnoreCase)) { throw '归档路径超出目录' }
  if (-not (Test-Path -LiteralPath $packagePath)) {
    throw ('缺少压缩包：' + $package.Archive + '；如已手动清理，请仅核验仍保留的包')
  }
  if ((Get-FileHash -LiteralPath $packagePath -Algorithm SHA256).Hash -ne $package.SHA256) {
    throw ('校验失败：' + $package.Archive)
  }
  Write-Output ('通过：' + $package.Archive)
}
~~~

## 恢复所需内容

先核验所需包，再解压到本目录下一个空的审阅目录。例如：

~~~powershell
Expand-Archive -LiteralPath '.\arichive\2026-10-23\one-off-scripts.zip' -DestinationPath '.\arichive\restore-review'
~~~

在 restore-review 中核对原路径和内容，只复制确有需要的文件回工作区。已有同名审阅目录时换一个空目录，避免混合不同快照。scratch内两个脚本会写入data中的JSON，恢复文件后先检查其适用数据与目标，不自动运行。

普通开发无需恢复旧浏览器配置或PowerShell缓存。测试会重新创建 .validation/ 并生成新报告；依赖由锁文件安装，命令见[维护入口](../README.md#维护与检查)。

## 手动清理顺序

1. 确认需要保留的验收结果已经找到，压缩包可读取且校验通过。
2. 优先清理browser-temp.zip和tool-cache.zip，二者可重建。
3. 按最近2—3个已验收版本或约90天的建议筛选validation-evidence.zip；最终按自己的留存需求决定。
4. 一次性脚本核对用途后再决定，无法判断时继续保留。
5. 在资源管理器中将选中的包移入回收站，确认后再清空。manifest.csv和本说明可保留。

原始资料、唯一历史备份及Git历史不适用以上临时文件清理规则。具体整理、核验与提交过程统一记在[项目历史](../docs/HISTORY.md)，本说明只负责当前归档的用途、恢复与保留规则。
