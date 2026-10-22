'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const figuresCorePath = path.join(root, 'src', 'core', 'figures.js');
const figuresUiPath = path.join(root, 'src', 'ui', 'figures.js');

const figuresCoreCode = fs.readFileSync(figuresCorePath, 'utf8');
const figuresUiCode = fs.readFileSync(figuresUiPath, 'utf8');

const plain = val => JSON.parse(JSON.stringify(val));

function setupEnvironment() {
  const sandbox = {
    globalThis: {},
    console,
    Array,
    Object,
    Set,
    Map,
    String,
    Number,
    Boolean
  };
  sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  vm.runInContext(figuresCoreCode, context);
  vm.runInContext(figuresUiCode, context);
  return context.globalThis.Zhou;
}

// Minimal robust DOM fixtures for UI factory testing
class MockEvents {
  constructor() {
    this.listeners = new Map();
  }
  addEventListener(type, fn) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(fn);
  }
  removeEventListener(type, fn) {
    this.listeners.get(type)?.delete(fn);
  }
  emit(type, values = {}) {
    const event = {
      type,
      prevented: false,
      stopped: false,
      preventDefault() { this.prevented = true; },
      stopPropagation() { this.stopped = true; },
      ...values
    };
    for (const fn of [...(this.listeners.get(type) || [])]) fn(event);
    return event;
  }
}

class MockElement extends MockEvents {
  constructor(tag, doc) {
    super();
    this.nodeType = 1;
    this.tagName = String(tag).toUpperCase();
    this.ownerDocument = doc;
    this.children = [];
    this.attributes = {};
    this.parentNode = null;
    this._innerHTML = '';
    this._textContent = '';
    this.hidden = false;
    const classSet = new Set();
    this.classList = {
      add: val => classSet.add(val),
      remove: val => classSet.delete(val),
      contains: val => classSet.has(val),
      values: classSet
    };
  }

  get id() { return this.attributes.id || ''; }
  set id(val) { this.attributes.id = String(val); }

  getAttribute(name) {
    return this.attributes[name] !== undefined ? this.attributes[name] : null;
  }

  setAttribute(name, val) {
    this.attributes[name] = String(val);
  }

  removeAttribute(name) {
    delete this.attributes[name];
  }

  get textContent() { return this._textContent; }
  set textContent(val) { this._textContent = String(val); }

  get innerHTML() { return this._innerHTML; }
  set innerHTML(val) { this._innerHTML = String(val); }

  appendChild(child) {
    this.children.push(child);
    child.parentNode = this;
    return child;
  }

  contains(child) {
    let cur = child;
    while (cur) {
      if (cur === this) return true;
      cur = cur.parentNode;
    }
    return false;
  }

  focus() {
    if (this.ownerDocument) {
      this.ownerDocument.activeElement = this;
    }
  }

  querySelector(selector) {
    if (selector.includes(',')) {
      for (const part of selector.split(',')) {
        const found = this.querySelector(part.trim());
        if (found) return found;
      }
      return null;
    }
    const matches = el => {
      if (!el || el.nodeType !== 1) return false;
      if (selector.startsWith('#')) return el.id === selector.slice(1);
      if (selector.startsWith('[') && selector.endsWith(']')) {
        const attr = selector.slice(1, -1).split('=')[0];
        return el.getAttribute(attr) != null;
      }
      return false;
    };
    const queue = [...this.children];
    while (queue.length) {
      const cur = queue.shift();
      if (matches(cur)) return cur;
      queue.push(...cur.children);
    }
    return null;
  }
}

function createDOMFixture() {
  const doc = new MockEvents();
  doc.activeElement = null;
  doc.createElement = tag => new MockElement(tag, doc);
  doc.dialogOpen = false;
  doc.querySelector = sel => {
    if (sel === 'dialog[open]' && doc.dialogOpen) {
      return doc.mockDialog;
    }
    return null;
  };

  const mockDialog = doc.createElement('dialog');
  mockDialog.setAttribute('open', 'true');
  doc.mockDialog = mockDialog;

  const container = doc.createElement('section');
  container.id = 'figuresGallery';

  const trigger = doc.createElement('button');
  trigger.id = 'figuresToggle';

  const countSpan = doc.createElement('span');
  countSpan.id = 'figuresCount';
  countSpan.setAttribute('data-figures-count', '0');
  trigger.appendChild(countSpan);

  return { doc, container, trigger, countSpan, mockDialog };
}

// ============================================================================
// PART 1: Core Model Unit Tests
// ============================================================================

test('Zhou.createFiguresModel: 隔离本卷名册与纯君主记录过滤', () => {
  const Zhou = setupEnvironment();

  const data = {
    timeline: { topic: 'zhou' },
    people: [
      {
        id: 'p-shang-yang',
        name: '商鞅',
        biographyPlan: {
          isCore26: true,
          motifCategory: '铁血变法与破局者'
        }
      },
      {
        id: 'p-wu-qi',
        name: '吴起',
        stageActivities: [
          { id: 'act-1', sequence: 1, label: '初出鲁国' }
        ]
      },
      {
        id: 'p-sun-bin',
        name: '孙膑',
        journey: [
          { id: 'j-1', label: '齐魏桂陵' }
        ]
      },
      // 纯君主或普通人物，仅含 role 与 summary，缺少传记/阶段/轨迹 -> 必须排除
      {
        id: 'p-monarch-zhou',
        name: '周武王',
        role: '君主',
        summary: '西周开国君主'
      },
      {
        id: 'p-ordinary',
        name: '普通史官',
        summary: '仅作编年记载'
      }
    ]
  };

  const model = Zhou.createFiguresModel(data);

  assert.equal(model.count, 3, '应当仅收录具传记规划/阶段活动/轨迹的3位重点人物');
  assert.deepEqual(plain(model.people.map(p => p.id)), ['p-shang-yang', 'p-wu-qi', 'p-sun-bin']);
  assert.equal(model.person('p-monarch-zhou'), null, '纯君主记录不能因summary被凑入重点名册');
  assert.equal(model.person('p-shang-yang').name, '商鞅');
});

test('Zhou.createFiguresModel: 稳定ID去重保持首条记录', () => {
  const Zhou = setupEnvironment();

  const data = {
    people: [
      {
        id: 'p-repeat',
        name: '申不害（初版）',
        biographyPlan: { isCore26: false, motifCategory: '铁血变法与破局者' }
      },
      {
        id: 'p-repeat',
        name: '申不害（重复版）',
        biographyPlan: { isCore26: true, motifCategory: '文人挂帅与定鼎孤臣' }
      }
    ]
  };

  const model = Zhou.createFiguresModel(data);
  assert.equal(model.count, 1, '去重后应只有1人');
  assert.equal(model.people[0].name, '申不害（初版）', '去重应稳定保留第一条记录');
});

test('Zhou.createFiguresModel: 输入不可变性 (Input Immutability)', () => {
  const Zhou = setupEnvironment();

  const rawPerson = Object.freeze({
    id: 'p-freeze',
    name: '李悝',
    biographyPlan: Object.freeze({
      isCore26: true,
      motifCategory: '铁血变法与破局者'
    })
  });

  const rawData = Object.freeze({
    people: Object.freeze([rawPerson]),
    states: Object.freeze([]),
    events: Object.freeze([]),
    rulers: Object.freeze([])
  });

  // Calling createFiguresModel must not mutate rawData or throw frozen object modification errors
  const model = Zhou.createFiguresModel(rawData);
  assert.equal(model.count, 1);
  assert.equal(model.person('p-freeze').name, '李悝');
});

test('Zhou.createFiguresModel: 四大母题分类与显示名映射及Intro文案', () => {
  const Zhou = setupEnvironment();

  const data = {
    people: [
      {
        id: 'p-1',
        name: '商鞅',
        biographyPlan: { isCore26: true, motifCategory: '铁血变法与破局者' }
      },
      {
        id: 'p-2',
        name: '吴起',
        biographyPlan: { isCore26: true, motifCategory: '文人挂帅与定鼎孤臣' }
      },
      {
        id: 'p-3',
        name: '屈原',
        biographyPlan: { isCore26: true, motifCategory: '时代风暴中的文史巨擘' }
      },
      {
        id: 'p-4',
        name: '百里奚',
        biographyPlan: { isCore26: true, motifCategory: '绝境逆旅与隐忍权谋者' }
      }
    ]
  };

  const model = Zhou.createFiguresModel(data);
  const groups = model.groups();

  assert.equal(groups.length, 4, '四大分类均有人物应全部返回');

  const g1 = groups.find(g => g.key === '铁血变法与破局者');
  assert.equal(g1.name, '铁血变法与破局者');
  assert.equal(g1.intro, '身处秩序困局，以铁腕法令革弊破局。');
  assert.equal(g1.count, 1);

  const g2 = groups.find(g => g.key === '文人挂帅与定鼎孤臣');
  assert.equal(g2.name, '文人挂帅与定鼎孤臣');
  assert.equal(g2.intro, '危难之际执掌枢机或挂帅三军，力挽狂澜。');
  assert.equal(g2.count, 1);

  const g3 = groups.find(g => g.key === '时代风暴中的文史巨擘');
  assert.equal(g3.key, '时代风暴中的文史巨擘', '第三类内部key兼容');
  assert.equal(g3.name, '时代风暴中的文史与科学巨擘', '第三类显示名改为文史与科学巨擘');
  assert.equal(g3.intro, '在乱世贬谪或实学探索中铸就文化与科学巅峰。');
  assert.equal(g3.count, 1);

  const g4 = groups.find(g => g.key === '绝境逆旅与隐忍权谋者');
  assert.equal(g4.name, '绝境逆旅与隐忍权谋者');
  assert.equal(g4.intro, '历经多朝更迭与权力漩涡，隐忍谋国或全身存民。');
  assert.equal(g4.count, 1);
});

test('Zhou.createFiguresModel: 0人数隐藏与核心筛选限定', () => {
  const Zhou = setupEnvironment();

  const data = {
    people: [
      {
        id: 'p-core',
        name: '商鞅',
        biographyPlan: { isCore26: true, motifCategory: '铁血变法与破局者' }
      },
      {
        id: 'p-non-core',
        name: '公孙衍',
        biographyPlan: { isCore26: false, motifCategory: '铁血变法与破局者' }
      }
    ]
  };

  const model = Zhou.createFiguresModel(data);

  // 全量筛选：只有“铁血变法与破局者”有人数，其他3类人数为0，必须隐藏
  const allGroups = model.groups({ coreOnly: false });
  assert.equal(allGroups.length, 1);
  assert.equal(allGroups[0].count, 2);

  // 仅看核心：
  const coreGroups = model.groups({ coreOnly: true });
  assert.equal(coreGroups.length, 1);
  assert.equal(coreGroups[0].count, 1);
  assert.equal(coreGroups[0].people[0].id, 'p-core');

  // 若核心筛选为空，groups 返回空数组，由 UI 显示“本专题未收录”
  const noCoreData = {
    people: [
      {
        id: 'p-only-ext',
        name: '某扩展人物',
        biographyPlan: { isCore26: false, motifCategory: '文人挂帅与定鼎孤臣' }
      }
    ]
  };
  const modelNoCore = Zhou.createFiguresModel(noCoreData);
  assert.deepEqual(plain(modelNoCore.groups({ coreOnly: true })), []);
});

test('Zhou.createFiguresModel: 未分类人物单列其他已收录人物，不凭空分到四类', () => {
  const Zhou = setupEnvironment();

  const data = {
    people: [
      {
        id: 'p-unclassified',
        name: '无母题人物',
        stageActivities: [{ id: 'sa-1', sequence: 1 }]
      }
    ]
  };

  const model = Zhou.createFiguresModel(data);
  const groups = model.groups();
  assert.equal(groups.length, 1);
  assert.equal(groups[0].key, 'other');
  assert.equal(groups[0].name, '其他已收录人物');
  assert.equal(groups[0].count, 1);
});

test('Zhou.createFiguresModel: entitiesForPerson 严格根据显式ID过滤无效实体', () => {
  const Zhou = setupEnvironment();

  const data = {
    states: [
      { id: 'state-qin', name: '秦国' },
      { id: 'state-wei', name: '魏国' }
    ],
    rulers: [
      { id: 'ruler-qin-xiaogong', name: '秦孝公' }
    ],
    events: [
      { id: 'event-shangyang-reform', name: '商鞅变法', participants: [{ id: 'p-shang-yang' }] }
    ],
    people: [
      {
        id: 'p-shang-yang',
        name: '商鞅',
        states: ['state-qin', 'non-existent-state'],
        servedMonarchs: [
          { tenureId: 'ruler-qin-xiaogong' },
          { tenureId: 'non-existent-tenure' }
        ],
        eventIds: ['event-shangyang-reform', 'non-existent-event'],
        biographyPlan: {
          isCore26: true,
          motifCategory: '铁血变法与破局者',
          chapters: [
            { chapterNo: 1, polityId: 'state-wei', eventId: 'event-shangyang-reform' }
          ]
        }
      }
    ]
  };

  const model = Zhou.createFiguresModel(data);

  // 无效ID返回 inactive 空集
  const unknown = model.entitiesForPerson('unknown-id');
  assert.equal(unknown.active, false);
  assert.equal(unknown.personIds.size, 0);
  assert.equal(unknown.stateIds.size, 0);
  assert.equal(unknown.tenureIds.size, 0);
  assert.equal(unknown.eventIds.size, 0);

  // 有效人物返回过滤后的真实实体
  const valid = model.entitiesForPerson('p-shang-yang');
  assert.equal(valid.active, true);
  assert(valid.personIds.has('p-shang-yang'));

  // stateIds 包含 state-qin 与 state-wei，排除了 non-existent-state
  assert.equal(valid.stateIds.has('state-qin'), true);
  assert.equal(valid.stateIds.has('state-wei'), true);
  assert.equal(valid.stateIds.has('non-existent-state'), false);

  // tenureIds 包含 ruler-qin-xiaogong，排除了 non-existent-tenure
  assert.equal(valid.tenureIds.has('ruler-qin-xiaogong'), true);
  assert.equal(valid.tenureIds.has('non-existent-tenure'), false);

  // eventIds 包含 event-shangyang-reform，排除了 non-existent-event
  assert.equal(valid.eventIds.has('event-shangyang-reform'), true);
  assert.equal(valid.eventIds.has('non-existent-event'), false);
});

test('Zhou.createFiguresModel: entitiesForCategory 及 coreOnly 实体恰好限定所选人数', () => {
  const Zhou = setupEnvironment();

  const data = {
    states: [{ id: 'qin' }, { id: 'chu' }],
    rulers: [
      { id: 'ruler-qin-1' },
      { id: 'ruler-chu-1' }
    ],
    events: [
      { id: 'event-qin-1', participants: [{ id: 'p-core' }] },
      { id: 'event-chu-1', participants: [{ id: 'p-non-core' }] }
    ],
    people: [
      {
        id: 'p-core',
        name: '核心变法者',
        states: ['qin'],
        servedMonarchs: [{ tenureId: 'ruler-qin-1' }],
        eventIds: ['event-qin-1'],
        biographyPlan: { isCore26: true, motifCategory: '铁血变法与破局者' }
      },
      {
        id: 'p-non-core',
        name: '扩展变法者',
        states: ['chu'],
        servedMonarchs: [{ tenureId: 'ruler-chu-1' }],
        eventIds: ['event-chu-1'],
        biographyPlan: { isCore26: false, motifCategory: '铁血变法与破局者' }
      }
    ]
  };

  const model = Zhou.createFiguresModel(data);

  // 全量分类实体
  const allCat = model.entitiesForCategory('铁血变法与破局者', { coreOnly: false });
  assert.equal(allCat.active, true);
  assert.equal(allCat.personIds.size, 2);
  assert.equal(allCat.stateIds.size, 2);
  assert.equal(allCat.tenureIds.size, 2);
  assert.equal(allCat.eventIds.size, 2);

  // coreOnly 分类实体：恰好限定于 core 人数
  const coreCat = model.entitiesForCategory('铁血变法与破局者', { coreOnly: true });
  assert.equal(coreCat.active, true);
  assert.equal(coreCat.personIds.size, 1);
  assert(coreCat.personIds.has('p-core'));
  assert(!coreCat.personIds.has('p-non-core'));

  // 实体集合只包含 core 对应实体
  assert(coreCat.stateIds.has('qin'));
  assert(!coreCat.stateIds.has('chu'));
  assert(coreCat.tenureIds.has('ruler-qin-1'));
  assert(!coreCat.tenureIds.has('ruler-chu-1'));
  assert(coreCat.eventIds.has('event-qin-1'));
  assert(!coreCat.eventIds.has('event-chu-1'));

  // 显示名兼容查询
  const displayNameCat = model.entitiesForCategory('时代风暴中的文史与科学巨擘');
  assert.equal(displayNameCat.active, false); // 该数据集没有该类人物
});

// ============================================================================
// PART 2: UI Gallery Component Unit Tests
// ============================================================================

test('Zhou.createFiguresGallery: 缺DOM桩安全降级', () => {
  const Zhou = setupEnvironment();

  // 空参数或缺失 container 调用
  const gallery = Zhou.createFiguresGallery({});
  assert.equal(typeof gallery.open, 'function');
  assert.equal(typeof gallery.close, 'function');
  assert.equal(typeof gallery.toggle, 'function');
  assert.equal(typeof gallery.refresh, 'function');
  assert.equal(typeof gallery.destroy, 'function');

  // 安全调用不抛错
  gallery.open();
  gallery.close();
  gallery.toggle();
  gallery.refresh();
  gallery.destroy();
});

test('Zhou.createFiguresGallery: 触发器aria及计数更新', () => {
  const Zhou = setupEnvironment();
  const { doc, container, trigger, countSpan } = createDOMFixture();

  const data = {
    people: [
      {
        id: 'p-1',
        name: '商鞅',
        biographyPlan: { isCore26: true, motifCategory: '铁血变法与破局者' }
      }
    ]
  };

  const gallery = Zhou.createFiguresGallery({
    data,
    container,
    trigger,
    document: doc
  });

  assert.equal(trigger.getAttribute('aria-controls'), 'figuresGallery');
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  assert.equal(trigger.getAttribute('aria-label'), '重点人物 (1人)');
  assert.equal(countSpan.textContent, '1');
  assert.equal(countSpan.getAttribute('data-figures-count'), '1');
  assert.equal(container.hidden, true);

  gallery.destroy();
});

test('Zhou.createFiguresGallery: 展开、折叠、toggle与状态同步', () => {
  const Zhou = setupEnvironment();
  const { doc, container, trigger } = createDOMFixture();

  const data = {
    people: [
      {
        id: 'p-1',
        name: '商鞅',
        biographyPlan: { isCore26: true, motifCategory: '铁血变法与破局者' }
      }
    ]
  };

  const gallery = Zhou.createFiguresGallery({
    data,
    container,
    trigger,
    document: doc
  });

  assert.equal(container.hidden, true);
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');

  gallery.open();
  assert.equal(container.hidden, false);
  assert.equal(trigger.getAttribute('aria-expanded'), 'true');
  assert(container.innerHTML.includes('本朝重点人物画廊'));

  gallery.close();
  assert.equal(container.hidden, true);
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');

  gallery.toggle();
  assert.equal(container.hidden, false);
  assert.equal(trigger.getAttribute('aria-expanded'), 'true');

  gallery.toggle();
  assert.equal(container.hidden, true);
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');

  gallery.destroy();
});

test('Zhou.createFiguresGallery: 标准提示与全部/核心两组切换', () => {
  const Zhou = setupEnvironment();
  const { doc, container, trigger } = createDOMFixture();

  const data = {
    people: [
      {
        id: 'p-core',
        name: '商鞅',
        biographyPlan: { isCore26: true, motifCategory: '铁血变法与破局者' }
      },
      {
        id: 'p-ext',
        name: '公孙衍',
        biographyPlan: { isCore26: false, motifCategory: '铁血变法与破局者' }
      }
    ]
  };

  const gallery = Zhou.createFiguresGallery({
    data,
    container,
    trigger,
    document: doc
  });

  gallery.open();

  // 1. 验证标准提示
  assert(container.innerHTML.includes('★ 精选自跨越多朝周期、身处历史暴风眼、命运极具戏剧张力的非君主代表人物'));

  // 2. 验证默认全部本朝人物（包含商鞅与公孙衍）
  assert(container.innerHTML.includes('商鞅'));
  assert(container.innerHTML.includes('公孙衍'));

  // 3. 点击“★ 仅看核心传主”
  container.emit('click', {
    target: {
      nodeType: 1,
      parentNode: container,
      getAttribute(name) {
        if (name === 'data-figures-action') return 'filter-core';
        return null;
      }
    }
  });

  // 切换为仅核心人物后，公孙衍不再显示
  assert(container.innerHTML.includes('商鞅'));
  assert(!container.innerHTML.includes('公孙衍'));

  // 4. 点击“全部本朝人物”切回
  container.emit('click', {
    target: {
      nodeType: 1,
      parentNode: container,
      getAttribute(name) {
        if (name === 'data-figures-action') return 'filter-all';
        return null;
      }
    }
  });

  assert(container.innerHTML.includes('公孙衍'));

  gallery.destroy();
});

test('Zhou.createFiguresGallery: 点击人名胶囊调用onPerson并关闭画廊', () => {
  const Zhou = setupEnvironment();
  const { doc, container, trigger } = createDOMFixture();

  let clickedPersonId = null;

  const data = {
    people: [
      {
        id: 'p-shang-yang',
        name: '商鞅',
        biographyPlan: { isCore26: true, motifCategory: '铁血变法与破局者' }
      }
    ]
  };

  const gallery = Zhou.createFiguresGallery({
    data,
    container,
    trigger,
    document: doc,
    onPerson(id) {
      clickedPersonId = id;
    }
  });

  gallery.open();
  assert.equal(container.hidden, false);

  // 模拟点击胶囊
  container.emit('click', {
    target: {
      nodeType: 1,
      parentNode: container,
      getAttribute(name) {
        if (name === 'data-figures-person-id') return 'p-shang-yang';
        return null;
      }
    }
  });

  assert.equal(clickedPersonId, 'p-shang-yang', '必须将人物ID传递给onPerson');
  assert.equal(container.hidden, true, '点击人物胶囊后必须关闭画廊');

  gallery.destroy();
});

test('Zhou.createFiguresGallery: 分类标题为原生button并调用onCategory', () => {
  const Zhou = setupEnvironment();
  const { doc, container, trigger } = createDOMFixture();

  let categoryEvent = null;

  const data = {
    people: [
      {
        id: 'p-shang-yang',
        name: '商鞅',
        biographyPlan: { isCore26: true, motifCategory: '铁血变法与破局者' }
      }
    ]
  };

  const gallery = Zhou.createFiguresGallery({
    data,
    container,
    trigger,
    document: doc,
    onCategory(key, payload) {
      categoryEvent = { key, ...payload };
    }
  });

  gallery.open();

  // 验证渲染中分类标题是原生 button
  assert(container.innerHTML.includes('<button type="button" class="figuresCategoryBtn"'));

  // 模拟点击分类按钮
  container.emit('click', {
    target: {
      nodeType: 1,
      parentNode: container,
      getAttribute(name) {
        if (name === 'data-figures-category') return '铁血变法与破局者';
        return null;
      }
    }
  });

  assert.equal(categoryEvent?.key, '铁血变法与破局者');
  assert.equal(categoryEvent?.label, '铁血变法与破局者');
  assert.equal(categoryEvent?.count, 1);
  assert(categoryEvent?.personIds.has('p-shang-yang'));

  gallery.destroy();
});

test('Zhou.createFiguresGallery: 清除按钮提供时调用onClear', () => {
  const Zhou = setupEnvironment();
  const { doc, container, trigger } = createDOMFixture();

  let cleared = false;

  const data = {
    people: [
      {
        id: 'p-1',
        name: '商鞅',
        biographyPlan: { isCore26: true, motifCategory: '铁血变法与破局者' }
      }
    ]
  };

  const gallery = Zhou.createFiguresGallery({
    data,
    container,
    trigger,
    document: doc,
    onClear() {
      cleared = true;
    }
  });

  gallery.open();
  assert(container.innerHTML.includes('data-figures-action="clear"'));

  container.emit('click', {
    target: {
      nodeType: 1,
      parentNode: container,
      getAttribute(name) {
        if (name === 'data-figures-action') return 'clear';
        return null;
      }
    }
  });

  assert.equal(cleared, true);

  gallery.destroy();
});

test('Zhou.createFiguresGallery: Escape键在面板或trigger关闭并回trigger，且不抢原生dialog的Esc', () => {
  const Zhou = setupEnvironment();
  const { doc, container, trigger, mockDialog } = createDOMFixture();

  const data = {
    people: [
      {
        id: 'p-1',
        name: '商鞅',
        biographyPlan: { isCore26: true, motifCategory: '铁血变法与破局者' }
      }
    ]
  };

  const gallery = Zhou.createFiguresGallery({
    data,
    container,
    trigger,
    document: doc
  });

  gallery.open();
  assert.equal(container.hidden, false);

  // 1. 当焦点在原生 dialog 内部时，按下 Escape 不应关闭画廊，不抢详情 Esc
  doc.dialogOpen = true;
  doc.activeElement = mockDialog;
  doc.emit('keydown', { key: 'Escape' });
  assert.equal(container.hidden, false, 'dialog 获得焦点时不应拦截 Esc');

  // 2. 当焦点在画廊内部时，按下 Escape 关闭画廊并将焦点返回 trigger
  doc.dialogOpen = false;
  doc.activeElement = container;
  doc.emit('keydown', { key: 'Escape' });
  assert.equal(container.hidden, true, '按下 Escape 应关闭画廊');
  assert.equal(doc.activeElement, trigger, '关闭后焦点应返回 trigger');

  gallery.destroy();
});

test('Zhou.createFiguresGallery: HTML特殊字符转义防止XSS', () => {
  const Zhou = setupEnvironment();
  const { doc, container, trigger } = createDOMFixture();

  const data = {
    people: [
      {
        id: 'xss-1',
        name: '<script>alert("xss")</script>',
        role: '"><img src=x onerror=alert(1)>',
        biographyPlan: {
          isCore26: true,
          motifCategory: '铁血变法与破局者'
        }
      }
    ]
  };

  const gallery = Zhou.createFiguresGallery({
    data,
    container,
    trigger,
    document: doc
  });

  gallery.open();

  assert(!container.innerHTML.includes('<script>alert("xss")</script>'));
  assert(container.innerHTML.includes('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'));
  assert(!container.innerHTML.includes('<img src=x onerror=alert(1)>'));

  gallery.destroy();
});

test('Zhou.createFiguresGallery: 销毁与事件解绑', () => {
  const Zhou = setupEnvironment();
  const { doc, container, trigger } = createDOMFixture();

  const data = {
    people: [
      {
        id: 'p-1',
        name: '商鞅',
        biographyPlan: { isCore26: true, motifCategory: '铁血变法与破局者' }
      }
    ]
  };

  const gallery = Zhou.createFiguresGallery({
    data,
    container,
    trigger,
    document: doc
  });

  gallery.open();
  assert.equal(container.hidden, false);

  gallery.destroy();
  assert.equal(container.hidden, true);
  assert.equal(container.innerHTML, '');

  // 销毁后调用 open 无效果
  gallery.open();
  assert.equal(container.hidden, true);
});

test('Zhou.createFiguresModel: 跨泳道活动、行迹journey与国君相臣关系推导', () => {
  const Zhou = setupEnvironment();

  const data = {
    states: [
      {
        id: 'state-lu',
        name: '鲁国',
        rulers: [
          {
            id: 'ruler-lu-mugong',
            name: '鲁穆公',
            ministers: [{ id: 'p-wu-qi' }]
          }
        ]
      },
      {
        id: 'state-wei',
        name: '魏国',
        rulers: [
          {
            id: 'ruler-wei-wenhou',
            name: '魏文侯',
            ministers: [{ id: 'p-wu-qi' }]
          }
        ]
      }
    ],
    events: [
      {
        id: 'event-hexie',
        name: '阴晋之战',
        participants: [{ id: 'p-wu-qi' }]
      }
    ],
    people: [
      {
        id: 'p-wu-qi',
        name: '吴起',
        journey: [
          { label: '初仕鲁国', state: 'state-lu' },
          { label: '西河之守', state: 'state-wei', event: 'event-hexie' }
        ],
        biographyPlan: {
          isCore26: true,
          motifCategory: '铁血变法与破局者'
        }
      }
    ]
  };

  const model = Zhou.createFiguresModel(data);
  const entities = model.entitiesForPerson('p-wu-qi');

  assert.equal(entities.active, true);
  assert(entities.stateIds.has('state-lu'));
  assert(entities.stateIds.has('state-wei'));
  assert(entities.tenureIds.has('ruler-lu-mugong'), '应通过 states.rulers.ministers 自动推导任期ID');
  assert(entities.tenureIds.has('ruler-wei-wenhou'), '应通过 states.rulers.ministers 自动推导任期ID');
  assert(entities.eventIds.has('event-hexie'), '应通过 journey 及 event.participants 关联推导事件');
});

test('Zhou.createFiguresGallery: 触发器点击toggle与trigger上按Escape关闭', () => {
  const Zhou = setupEnvironment();
  const { doc, container, trigger } = createDOMFixture();

  const data = {
    people: [
      {
        id: 'p-1',
        name: '商鞅',
        biographyPlan: { isCore26: true, motifCategory: '铁血变法与破局者' }
      }
    ]
  };

  const gallery = Zhou.createFiguresGallery({
    data,
    container,
    trigger,
    document: doc
  });

  // 点击触发器展开
  trigger.emit('click');
  assert.equal(container.hidden, false);
  assert.equal(trigger.getAttribute('aria-expanded'), 'true');

  // 在 trigger 上按 Escape 关闭
  doc.activeElement = trigger;
  trigger.emit('keydown', { key: 'Escape' });
  assert.equal(container.hidden, true);
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');

  // 再次点击触发器展开
  trigger.emit('click');
  assert.equal(container.hidden, false);

  // 再次点击触发器折叠
  trigger.emit('click');
  assert.equal(container.hidden, true);

  gallery.destroy();
});

test('CSS规范验证: 变量Fallback、figures前缀隔离、44px命中与无硬编码覆盖', () => {
  const cssPath = path.join(root, 'src', 'ui', 'figures.css');
  const css = fs.readFileSync(cssPath, 'utf8');

  // 1. 验证主题变量及其fallback
  assert(css.includes('--paper, #F7F5F0'));
  assert(css.includes('--panel, #ffffff') || css.includes('--panel, #fff'));
  assert(css.includes('--ink, #19343d'));
  assert(css.includes('--muted, #4e6268'));
  assert(css.includes('--line, #cbd7d5'));
  assert(css.includes('--gold, #806025'));

  // 2. 验证全部前缀隔离，不覆盖既有 .timeline 或 dialog
  assert(!css.includes('.timeline '));
  assert(!css.includes('dialog {'));
  assert(!css.includes(':root {'));

  // 3. 验证44px命中
  assert(css.includes('min-height: 44px;'));

  // 4. 验证清晰focus指示
  assert(css.includes(':focus-visible'));

  // 5. 验证可访问性媒体查询
  assert(css.includes('prefers-reduced-motion: reduce'));
  assert(css.includes('forced-colors: active'));

  // 6. 验证移动端响应式 (390px)
  assert(css.includes('@media (max-width: 600px)'));
});
