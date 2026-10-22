'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { boot, attachStudy } = require('./helpers/browser.cjs');

const root = path.resolve(__dirname, '..');
const masterDataPath = path.join(root, 'data', '中国历代非君主人物传记全书.json');
const masterData = JSON.parse(fs.readFileSync(masterDataPath, 'utf8'));

test('传记总集规范与 57 位传主（26位核心）元数据完整性', () => {
  assert(Array.isArray(masterData.dynasties), 'dynasties 必须为数组');
  const allFigures = masterData.dynasties.flatMap(d => d.figures);
  const uniqueMap = new Map(allFigures.map(f => [f.id, f]));
  const figures = Array.from(uniqueMap.values());

  assert.equal(figures.length, 57, '全书收录不重复传主总数必须为 57 位');

  const core26 = figures.filter(f => f.biographyPlan && f.biographyPlan.isCore26);
  assert.equal(core26.length, 26, '核心精选版必须为 26 位');

  const motifs = new Set(['铁血变法与破局者', '文人挂帅与定鼎孤臣', '时代风暴中的文史巨擘', '绝境逆旅与隐忍权谋者']);
  const seenIds = new Set();

  for (const f of figures) {
    assert(f.id, `人物 ${f.name} 缺少 id`);
    assert(!seenIds.has(f.id), `人物 ID ${f.id} 重复`);
    seenIds.add(f.id);

    assert(f.name, `人物 ID ${f.id} 缺少姓名`);
    assert(f.role, `人物 ${f.name} 缺少官职角色`);
    assert(f.summary, `人物 ${f.name} 缺少生平纪略`);

    const bp = f.biographyPlan;
    assert(bp, `人物 ${f.name} 必须包含 biographyPlan`);
    assert(typeof bp.isCore26 === 'boolean', `人物 ${f.name} isCore26 必须为布尔值`);
    assert(bp.selectionTier, `人物 ${f.name} 缺少 selectionTier`);
    assert(bp.volume, `人物 ${f.name} 缺少 volume 卷名`);
    assert(motifs.has(bp.motifCategory), `人物 ${f.name} motifCategory "${bp.motifCategory}" 不在四大母题内`);
    assert(bp.characterTag, `人物 ${f.name} 缺少 characterTag`);
    assert(bp.lifespan, `人物 ${f.name} 缺少 lifespan`);
    assert(bp.crossRegimeSpan, `人物 ${f.name} 缺少 crossRegimeSpan`);
    assert(bp.coreHighlights, `人物 ${f.name} 缺少 coreHighlights`);

    assert(Array.isArray(bp.chapters), `人物 ${f.name} chapters 必须为数组`);
    assert(bp.chapters.length >= 4 && bp.chapters.length <= 5, `人物 ${f.name} 章节数应为 4 至 5 章，当前为 ${bp.chapters.length}`);

    for (const ch of bp.chapters) {
      assert(ch.chapterNo >= 1, `章节序号不合法`);
      assert(ch.title, `章节缺少标题`);
      assert(ch.polityId, `章节缺少关联政权`);
      assert(ch.kindLabel, `章节缺少类型标签`);
      assert(ch.summary, `章节缺少内容梗概`);
    }

    if (f.stageActivities && f.stageActivities.length) {
      assert.equal(f.stageActivities.length, bp.chapters.length, `人物 ${f.name} 的 stageActivities 数量应与 chapters 章节数一致`);
    }
  }
});

test('四大传记母题及核心 26 人动态筛选器逻辑', () => {
  const app = attachStudy(boot());
  const { run, el } = app;
  const D = app.ctx.window.ZHOU_DATA;
  const Bio = app.ctx.Zhou.Biography;
  assert(Bio, 'Zhou.Biography 引擎必须已挂载');

  const allResult = Bio.getMatchingEntities('all', D);
  assert(allResult.active);
  assert(allResult.personIds.size >= 10, 'all 母题应筛选出当前朝代所有传记人物');

  const coreResult = Bio.getMatchingEntities('core26', D);
  assert(coreResult.active);
  assert(coreResult.personIds.size > 0);
  for (const pid of coreResult.personIds) {
    const p = D.people.find(x => x.id === pid);
    assert(p.biographyPlan.isCore26, `人物 ${p.name} 必须为 isCore26`);
  }

  const motifReform = Bio.getMatchingEntities('铁血变法与破局者', D);
  assert(motifReform.active);
  for (const pid of motifReform.personIds) {
    const p = D.people.find(x => x.id === pid);
    assert.equal(p.biographyPlan.motifCategory, '铁血变法与破局者');
  }

  // 验证时间轴渲染时母题筛选的高亮实体联动
  run("setMotif('铁血变法与破局者')");
  assert.equal(run('appState.conditions.motif'), '铁血变法与破局者');

  const chartHtml = el('#chart').innerHTML;
  assert(chartHtml.includes('motifMatch') || chartHtml.includes('class="bar'), '时间轴应正常渲染');

  // 切回全部或无筛选
  run("setMotif('none')");
  assert.equal(run('appState.conditions.motif'), 'none');
});

test('「左图右传」沉浸式传记档案视图抽屉与分章联动', () => {
  const app = attachStudy(boot());
  const { run, el, action } = app;
  const D = app.ctx.window.ZHOU_DATA;

  // 打开战国变法先驱：商鞅
  action('person', '商鞅');
  assert.equal(run('currentDetailKey'), 'person:person-033');

  const bodyHtml = el('#detailBody').innerHTML;

  // 1. 顶部铭牌区
  assert(bodyHtml.includes('bioHeraldry'), '应渲染 bioHeraldry 顶部铭牌区');
  assert(bodyHtml.includes('bioBadge goldBadge'), '应展示金色人物标签徽章');
  assert(bodyHtml.includes('bioBadge motifBadge'), '应展示母题分类标签');
  assert(bodyHtml.includes('bioLifespan'), '应展示生卒享年');
  assert(bodyHtml.includes('bioMonarchChain'), '应展示历仕君主徽章链');
  assert(bodyHtml.includes('data-action="focusRuler"'), '君主徽章应具备 focusRuler 交互');

  // 2. 核心看点导读框
  assert(bodyHtml.includes('bioQuoteCard'), '应渲染古籍引文风格导读框');
  assert(bodyHtml.includes('【核心戏剧冲突与历史高潮】'), '应包含核心戏剧冲突');
  assert(bodyHtml.includes('【历仕帝王与跨政权轨迹】'), '应包含历仕帝王轨迹');

  // 3. 分章叙事流
  assert(bodyHtml.includes('bioChapterFlow'), '应渲染分章时间轴叙事流');
  assert(bodyHtml.includes('第 1 章'), '应包含第 1 章');
  assert(bodyHtml.includes('第 5 章'), '应包含第 5 章');
  assert(bodyHtml.includes('data-action="bioChapter"'), '各章应具备联动时间轴 action');

  // 测试点击第 2 章（前356年 第一次变法）联动
  action('bioChapter', '356:qin:2');
  assert.equal(run('cursor'), 356, '点击第 2 章卡片后，左侧时间轴 Cursor 应平滑移动至前356年');
  assert(run('selected.has("qin")'), '点击卡片后所属政权应进入高亮选中集合');

  // 测试点击历仕君主徽章（秦孝公 qin-r29）联动
  action('focusRuler', 'qin-r29');
  assert.equal(run('cursor'), 361, '点击秦孝公徽章应将时间轴 Cursor 联动至孝公元年（前361年）');
});

test('人物跨政权/跨国迁徙轨迹高亮（吴起、伍子胥）', () => {
  const app = attachStudy(boot());
  const { run, el, action } = app;
  const Bio = app.ctx.Zhou.Biography;

  // 1. 吴起（鲁 -> 魏 -> 楚）
  action('person', '吴起');
  assert.equal(run('appState.session.activePersonId'), 'person-051');

  const pWu = run("historyService.person('person-051')");
  const layouts = run('appState.session.rowLayouts');
  const labelW = run('labelWidth()');
  const xFn = y => run('x(' + y + ')');

  const ptsWu = Bio.getTrajectoryPoints(pWu, layouts, xFn, labelW);
  assert(ptsWu.length >= 3, '吴起应具备至少 3 个有效时空坐标点');
  for (let i = 0; i < ptsWu.length; i++) {
    assert(Number.isFinite(ptsWu[i].x), `第 ${i + 1} 阶段 x 坐标必须有效`);
    assert(Number.isFinite(ptsWu[i].y), `第 ${i + 1} 阶段 y 坐标必须有效`);
  }

  const svgPathWu = Bio.buildTrajectoryPath(ptsWu);
  assert(svgPathWu.startsWith('M '), 'SVG 轨迹必须以 M 起始');
  assert(svgPathWu.includes('C '), '多阶段轨迹必须使用三次贝塞尔曲线 C 连接');

  // 2. 检查 DOM 中轨迹层与序号徽章渲染
  const chartHtml = el('#chart').innerHTML;
  assert(chartHtml.includes('trajectoryLayer'), '页面主时间轴必须渲染 trajectoryLayer 轨迹层');
  assert(chartHtml.includes('trajectoryPath'), '必须渲染平滑虚线轨迹');
  assert(chartHtml.includes('trajectoryNum'), '必须渲染阶段序号徽章（如 ①、② 等）');

  // 3. 伍子胥（楚 -> 宋 -> 郑 -> 吴）
  action('person', '伍子胥');
  assert.equal(run('appState.session.activePersonId'), 'person-105');
  const pWuZiXu = run("historyService.person('person-105')");
  const ptsWuZiXu = Bio.getTrajectoryPoints(pWuZiXu, layouts, xFn, labelW);
  assert(ptsWuZiXu.length >= 3, '伍子胥应具备跨政权活动节点');
});

test('11 朝代数据集人物传记双引擎全量挂载与富化验证', () => {
  const catalog = [
    { id: 'xia-shang', file: 'xia-shang.json' },
    { id: 'zhou', file: 'atlas.json' },
    { id: 'qin-han', file: 'qin-han.json' },
    { id: 'three-kingdoms', file: 'three-kingdoms.json' },
    { id: 'wei-jin-nan-bei', file: 'wei-jin-nan-bei.json' },
    { id: 'sui-tang', file: 'sui-tang.json' },
    { id: 'five-dynasties', file: 'five-dynasties.json' },
    { id: 'liao-jin-song', file: 'liao-jin-song.json' },
    { id: 'yuan', file: 'yuan.json' },
    { id: 'ming', file: 'ming.json' },
    { id: 'qing', file: 'qing.json' }
  ];

  // 加载编译后的 Biography 核心库
  const bioCode = fs.readFileSync(path.join(root, 'src', 'core', 'biography.js'), 'utf8');
  const ctx = { globalThis: {}, console, Set, Array, Object, Map, Number, String, Boolean };
  ctx.globalThis = ctx;
  vm.runInNewContext(fs.readFileSync(path.join(root,'src/core/biography-data.js'),'utf8'),ctx);
  vm.runInNewContext(bioCode, ctx);
  const Bio = ctx.Zhou.Biography;
  assert(Bio, '独立上下文内应成功加载 Zhou.Biography');

  let totalCoveredFigures = 0;

  for (const cat of catalog) {
    const raw = JSON.parse(fs.readFileSync(path.join(root, 'data', cat.file), 'utf8'));
    // 富化数据集
    Bio.enrichDataset(raw);

    const withPlan = (raw.people || []).filter(p => p.biographyPlan);
    assert(withPlan.length > 0, `专题 ${cat.id} (${cat.file}) 经 enrichDataset 后应包含传记人物`);
    totalCoveredFigures += withPlan.length;

    // 验证四大母题与核心26人在各朝代能正常检索
    for (const m of ['all', 'core26', '铁血变法与破局者', '文人挂帅与定鼎孤臣', '时代风暴中的文史巨擘', '绝境逆旅与隐忍权谋者']) {
      const match = Bio.getMatchingEntities(m, raw);
      assert(match.active);
      assert(match.personIds && typeof match.personIds.has === 'function');
      assert(match.tenureIds && typeof match.tenureIds.has === 'function');
      assert(match.eventIds && typeof match.eventIds.has === 'function');
      assert(match.stateIds && typeof match.stateIds.has === 'function');
    }
  }

  assert(totalCoveredFigures >= 57, '11 个朝代累计覆盖的传主人次必须至少达到 57 位');
});
