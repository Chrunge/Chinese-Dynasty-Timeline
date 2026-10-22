# schema 2 结构样例

这两个 JSON 是**可实际通过校验、编译和查询的小样例，不是完整史料**。默认构建使用 `data/` 下十一个专题的生产原件，不读取这两个样例。来源链接只提供待复核原典入口；`reviewStatus:pending`、`dating.reviewStatus:legacy` 及正文中的“待复核”不得解读为已经完成史实校勘。

- [三国并存](./three-kingdoms.json)：公元220—280年，曹魏、蜀汉、孙吴并行，3位人物、3段创始者任期、1条点事件。按公元230年查询可得三政权，270年只余样例中的孙吴；没有为演示跨公元而捏造三国的公元前日期。222年吴建元与229年称帝分别维护，未声称三国同年建立。
- [秦汉帝国](./qin-han.json)：图示前247年至公元220年，4个政权、4位人物、5段任期、2条事件及1段继承事件日期的活动。一个连续秦政权的存续数据约前890年至前206年，不因图示范围裁切；秦王阶段和秦帝国阶段共同引用该政权。一位嬴政同时连接秦王／皇帝两段任期，不复制人物。汉平帝任期前1年至公元6年展示跨公元，cursor 公元1年编译后为 `0`。西汉前206年汉王起点、前202年帝号节点分开；新朝单列，23—25年间并未虚构连续政权。东汉专门来源及所有年次仍待补核。

秦王政样例条带采用前247年实际承位口径，不冒充前246年元年口径；它不更改周朝已发布的任期及采用年表。帝国／统一的时期标签是阅读分组，不声称每一年都完成实际统一，也不自动补齐未收录君主、政权、事件。

## 实际运行

项目零依赖，Node 运行（从项目根目录）：

```sh
node --input-type=module -e "import fs from 'node:fs'; import {validateAtlas,compileAtlas} from './lib/atlas.mjs'; for(const name of ['three-kingdoms','qin-han']){const a=JSON.parse(fs.readFileSync('data/examples/'+name+'.json','utf8'));validateAtlas(a);const d=compileAtlas(a);console.log(name,d.polities.length,d.tenures.length,d.timeline);}"
node --test --test-isolation=none tests/domain-model.test.mjs
```

编译结果可直接交给现有 `Zhou.createHistory(data)`；查询入参采用输出的 `bce-axis`，例如公元230年为 `-229`。不需要浏览器时也可按独立实体查询：

```js
import {toAxis} from '../../lib/time.mjs';
const year = toAxis({era:'CE',year:230});
const contemporaries = data.polities.filter(p => p.start >= year && year >= p.end);
const terms = data.tenures.filter(t => t.personId === 'exqh-person-ying-zheng');
const thematicPeriods = data.periods.filter(p => p.polityIds.includes('exqh-polity-qin'));
```

模型字段、关系表及日期契约见[资料维护约定](../README.md#schema-2时期政权人物与任期)。事件可带可选 `endYear` 表示闭区间（起点不得晚于终点）；本样例仍只用点事件（直接日期或任期节点引用），不表示模型只支持点事件。

## ID 不是专题副本

`ex3k-`、`exqh-` 是独立演示文件的命名空间，不覆盖生产旧 `wei/jin/wu/han/liang`，也不授权按专题复制真实实体。将来生产迁移时：

1. 复用已有政权与人物 ID；多个时期只引用同一实体。
2. 同一人跨身份可显式维护多个任期，原有任期 ID 不重排、不复用；已有发布任期是否拆分须另行处理兼容，不由本样例自动迁移。
3. 真实政权存续据史料维护，时期和图示边界不能反向裁切其终点；秦延伸到秦亡需要复核事实并复用旧 `qin`，不能新建“帝国秦”覆盖它。
4. 缺少可靠人物连接的旧任期保持 `personId:null`；同名不猜测合并。关系与来源始终通过显式 ID 维护。
