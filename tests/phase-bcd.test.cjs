'use strict';
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm');
const {boot} = require('./helpers/browser.cjs');
const plain = value => JSON.parse(JSON.stringify(value));

const start = (id = 'zhou', width = 1200, store = {}) => {
  const app = boot(store, width, undefined, id === 'zhou' ? 'data.js' : `data-${id}.js`);
  return app;
};

test('阶段B：四模块主要工具栏与独立时期切换条', () => {
  const app = start('zhou', 1200);
  assert(app.el('#previousTopic'));
  assert(app.el('#nextTopic'));
  assert(app.el('#search'));
  assert(app.el('#quickClearSearch'));
  assert(app.el('#yearToggle'));
  assert(app.el('#previousYear'));
  assert(app.el('#nextYear'));
  assert(app.el('#timeSliceToggle'));
  assert(app.el('#figuresToggle'));
  assert(app.el('#filter'));
  assert(app.el('#advancedToggle'));
  assert(app.el('#exportCompare'));
  assert(app.el('#shareView'));
  
  const html = fs.readFileSync('src/index.html', 'utf8');
  assert.match(html, /id="resetZoom"[^>]*>全景<\/button>/);
  assert.match(html, /class="toolbar primaryToolbar"/);
  assert.match(html, /class="searchModule"/);
  assert.match(html, /class="timeModule"/);
  assert.match(html, /class="drawerModule"/);
  assert.match(html, /class="actionModule"/);
});

test('阶段B：年份胶囊前后切换、编辑展开与定位', () => {
  const app = start('zhou', 1200);
  const initial = app.run('cursor');
  app.el('#previousYear')['click']?.();
  assert.equal(app.run('cursor'), initial + 1);
  app.el('#nextYear')['click']?.();
  assert.equal(app.run('cursor'), initial);
  
  app.el('#yearToggle')['click']?.();
  assert.equal(app.el('#yearEditor').hidden, false);
  app.el('#yearEra').value = 'BCE';
  app.el('#year').value = '500';
  app.el('#jump').onsubmit({preventDefault(){}});
  assert.equal(app.run('cursor'), 500);
  assert.equal(app.el('#yearEditor').hidden, true);
});

test('阶段B：视图设置开关与偏好持久化（真实DOM契约）', () => {
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync('src/ui/experience.js', 'utf8'), ctx);
  
  const elements = {};
  const el = id => {
    if (!elements[id]) {
      elements[id] = {
        hidden: id === '#advancedSettings',
        attrs: {},
        setAttribute(k, v) { this.attrs[k] = String(v); },
        getAttribute(k) { return this.attrs[k] || null; },
        removeAttribute(k) { delete this.attrs[k]; },
        classList: { toggle(cls, active) { this[cls] = active; }, add() {}, remove() {} },
        focus() {},
        addEventListener(type, fn) { this[type] = fn; },
        removeEventListener() {}
      };
    }
    return elements[id];
  };
  const doc = {
    documentElement: { contains: () => true },
    querySelector: s => el(s),
    querySelectorAll: () => [],
    addEventListener(type, fn) { this[type] = fn; }
  };
  const store = {};
  const exp = ctx.Zhou.createInterfaceExperience({
    document: doc,
    window: { CustomEvent: function() {} },
    storage: {
      read(k, fb) { return store[k] ?? fb; },
      write(k, v) { store[k] = v; return true; }
    }
  });
  
  assert.equal(exp.active, true);
  assert.equal(el('#advancedSettings').hidden, true);
  
  // click toggle to open
  el('#advancedToggle').click();
  assert.equal(el('#advancedSettings').hidden, false);
  assert.equal(el('#advancedToggle').getAttribute('aria-expanded'), 'true');
  assert.equal(store['zhou-ui-v1'].advanced, true);
  
  // click toggle to close
  el('#advancedToggle').click();
  assert.equal(el('#advancedSettings').hidden, true);
  assert.equal(el('#advancedToggle').getAttribute('aria-expanded'), 'false');
  assert.equal(store['zhou-ui-v1'].advanced, false);
});

test('阶段C：本朝重点人物画廊构建、高亮与清除签', () => {
  const app = start('zhou', 1200);
  const count = app.run('topbar?.model?.count || 0');
  assert(count > 0);
  assert.equal(app.el('#figuresCount').textContent, String(count));
  
  // Highlight a person
  const person = app.run('topbar?.model?.people[0]');
  assert(person);
  app.run(`topbar.openPerson(${JSON.stringify(person.id)})`);
  assert(app.run('appState.session.figureHighlight'));
  assert.equal(app.el('#figureHighlight').hidden, false);
  assert(app.el('#figureHighlightText').textContent.includes(person.name));
  
  // Clear highlight
  app.el('#clearFigureHighlight')['click']?.();
  assert.equal(app.run('appState.session.figureHighlight'), null);
  assert.equal(app.el('#figureHighlight').hidden, true);
});

test('阶段D：11 专题品牌解析与标题徽章', () => {
  for (const topicId of ['xia-shang','zhou','qin-han','three-kingdoms','wei-jin-nan-bei','sui-tang','five-dynasties','liao-jin-song','yuan','ming','qing']) {
    const app = start(topicId, 1200);
    const brand = app.run('Zhou.Branding.resolve(D, D.datasetId || D.timeline?.topic)');
    assert(brand.logoChar);
    assert(brand.title);
    assert(brand.subtitle);
    assert(brand.slogan);
    assert(brand.intro.length <= 100);
    assert(app.el('#logoChar').textContent.length > 0);
    assert(app.el('#siteTitle').textContent.length > 0);
  }
});

test('阶段D：书房模式（随系统/宣纸/玄青）主题切换与持久化', () => {
  const app = start('zhou', 1200);
  assert(app.el('#themeMode'));
  
  app.run("topbar.setTheme('dark', true)");
  assert.equal(JSON.parse(app.store['zhou-theme-v1']), 'dark');
  
  app.run("topbar.setTheme('light', true)");
  assert.equal(JSON.parse(app.store['zhou-theme-v1']), 'light');
});

test('阶段D：资料状态徽章与说明弹窗入口', () => {
  const app = start('zhou', 1200);
  assert(app.el('#dataStatusToggle'));
  assert(app.el('#dataStatus'));
  assert(app.el('#reportDataError'));
  assert(app.el('#closeDataStatus'));
  app.el('#dataStatusToggle')['click']?.();
  assert.equal(app.el('#dataStatus').open, true);
  app.el('#closeDataStatus')['click']?.();
  assert.equal(app.el('#dataStatus').open, false);
});
