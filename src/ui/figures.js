(function (Zhou) {
  'use strict';

  function escapeHTML(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(str) {
    return escapeHTML(str);
  }

  function createFiguresGallery(options = {}) {
    const {
      data,
      model,
      container,
      trigger,
      document: docOption,
      onPerson,
      onCategory,
      onClear
    } = options;

    const doc = docOption || (typeof window !== 'undefined' ? window.document : null) || globalThis.document;
    const galleryModel = model || (Zhou.createFiguresModel ? Zhou.createFiguresModel(data) : null);

    // Missing DOM stub safe no-op
    if (!container || typeof container !== 'object' || container.nodeType !== 1) {
      return {
        open() {},
        close() {},
        toggle() {},
        refresh() {},
        destroy() {},
        model: galleryModel
      };
    }

    let isOpen = false;
    let coreOnly = false;
    let destroyed = false;
    const disposers = [];

    function listen(target, type, listener, opts) {
      if (!target || typeof target.addEventListener !== 'function') return;
      target.addEventListener(type, listener, opts);
      disposers.push(() => {
        try {
          target.removeEventListener(type, listener, opts);
        } catch (_) {}
      });
    }

    const containerId = container.id || 'figuresGallery';
    container.classList.add('figuresGallery');
    container.setAttribute('aria-label', '本朝重点人物画廊');
    container.hidden = true;

    function updateTrigger() {
      if (!trigger || typeof trigger.setAttribute !== 'function') return;
      const count = galleryModel ? galleryModel.count : 0;
      trigger.setAttribute('aria-controls', containerId);
      trigger.setAttribute('aria-expanded', String(isOpen));
      trigger.setAttribute('aria-label', `重点人物 (${count}人)`);

      const countSpan = trigger.querySelector?.('#figuresCount, [data-figures-count]');
      if (countSpan) {
        countSpan.textContent = String(count);
        countSpan.setAttribute('data-figures-count', String(count));
      }
    }

    function render() {
      if (destroyed || !container) return;

      const groups = galleryModel ? galleryModel.groups({ coreOnly }) : [];
      const hasClear = typeof onClear === 'function';

      let cardsHtml = '';
      if (!groups || groups.length === 0) {
        cardsHtml = '<div class="figuresEmpty">本专题未收录</div>';
      } else {
        cardsHtml = '<div class="figuresCardGrid">' + groups.map(group => {
          const pillsHtml = (group.people || []).map(p => {
            const isCore = Boolean(p.biographyPlan?.isCore26 === true);
            const label = (isCore ? '★ ' : '') + p.name;
            const role = p.role || p.name;
            return `<button type="button" class="figuresPersonPill${isCore ? ' isCore' : ''}" data-figures-person-id="${escapeAttr(p.id)}" title="${escapeAttr(role)}">${escapeHTML(label)}</button>`;
          }).join('');

          return `<article class="figuresCard" data-category="${escapeAttr(group.key)}">` +
            `<div class="figuresCardHead">` +
              `<button type="button" class="figuresCategoryBtn" data-figures-category="${escapeAttr(group.key)}" title="筛选此类人物">` +
                `<span class="figuresCategoryIcon" aria-hidden="true">${escapeHTML(group.icon || '')}</span>` +
                `<span class="figuresCategoryName">${escapeHTML(group.name)}</span>` +
                `<span class="figuresCategoryCount">本朝${group.count}人</span>` +
              `</button>` +
            `</div>` +
            `<p class="figuresCardIntro">${escapeHTML(group.intro)}</p>` +
            `<div class="figuresPills" role="group" aria-label="人物姓名">${pillsHtml}</div>` +
          `</article>`;
        }).join('') + '</div>';
      }

      const html =
        `<div class="figuresGalleryHead">` +
          `<h3 class="figuresGalleryTitle">本朝重点人物画廊</h3>` +
          `<div class="figuresHeadActions">` +
            (hasClear ? `<button type="button" class="figuresClearBtn" data-figures-action="clear">清除人物筛选</button>` : '') +
            `<button type="button" class="figuresCloseBtn" data-figures-action="close" aria-label="关闭人物画廊">×</button>` +
          `</div>` +
        `</div>` +
        `<div class="figuresNotice" role="note">★ 精选自跨越多朝周期、身处历史暴风眼、命运极具戏剧张力的非君主代表人物</div>` +
        `<div class="figuresFilterBar" role="group" aria-label="人物筛选模式">` +
          `<button type="button" class="figuresFilterBtn figuresBtnAll${!coreOnly ? ' active' : ''}" data-figures-action="filter-all" aria-pressed="${!coreOnly}">全部本朝人物</button>` +
          `<button type="button" class="figuresFilterBtn figuresBtnCore${coreOnly ? ' active' : ''}" data-figures-action="filter-core" aria-pressed="${coreOnly}">★ 仅看核心传主</button>` +
        `</div>` +
        cardsHtml;

      container.innerHTML = html;
    }

    function open() {
      if (destroyed) return;
      isOpen = true;
      container.hidden = false;
      updateTrigger();
      render();
    }

    function close() {
      if (destroyed) return;
      isOpen = false;
      container.hidden = true;
      updateTrigger();
    }

    function toggle() {
      if (isOpen) close();
      else open();
    }

    function refresh() {
      if (destroyed) return;
      updateTrigger();
      if (isOpen) render();
    }

    function destroy() {
      destroyed = true;
      for (const dispose of disposers) dispose();
      disposers.length = 0;
      if (container) {
        container.innerHTML = '';
        container.hidden = true;
      }
      if (trigger) {
        trigger.setAttribute('aria-expanded', 'false');
      }
    }

    // Trigger click
    if (trigger) {
      listen(trigger, 'click', (e) => {
        if (destroyed) return;
        e.preventDefault();
        toggle();
      });
    }

    // Delegation on container
    listen(container, 'click', (event) => {
      if (destroyed) return;

      // Find action or target by traversing upwards if needed
      let target = event.target;
      while (target && target !== container) {
        const action = target.getAttribute?.('data-figures-action');
        if (action === 'close') {
          event.preventDefault();
          close();
          return;
        }
        if (action === 'clear') {
          event.preventDefault();
          if (typeof onClear === 'function') onClear();
          return;
        }
        if (action === 'filter-all') {
          event.preventDefault();
          if (coreOnly) {
            coreOnly = false;
            render();
          }
          return;
        }
        if (action === 'filter-core') {
          event.preventDefault();
          if (!coreOnly) {
            coreOnly = true;
            render();
          }
          return;
        }

        const personId = target.getAttribute?.('data-figures-person-id');
        if (personId) {
          event.preventDefault();
          if (typeof onPerson === 'function') onPerson(personId);
          close();
          return;
        }

        const categoryKey = target.getAttribute?.('data-figures-category');
        if (categoryKey) {
          event.preventDefault();
          const groups = galleryModel ? galleryModel.groups({ coreOnly }) : [];
          const group = groups.find(g => g.key === categoryKey);
          const personIds = group ? new Set(group.people.map(p => p.id)) : new Set();
          const label = group ? group.name : categoryKey;
          const count = group ? group.count : 0;
          if (typeof onCategory === 'function') {
            onCategory(categoryKey, { coreOnly, personIds, label, count });
          }
          return;
        }

        target = target.parentNode;
      }
    });

    // Escape key handling
    function handleKeyDown(event) {
      if (destroyed || !isOpen) return;
      if (event.key === 'Escape' || event.key === 'Esc' || event.keyCode === 27) {
        const activeEl = doc?.activeElement;

        // Check if an open native modal dialog is focused; do not steal Escape from it
        const openDialog = doc?.querySelector?.('dialog[open]');
        if (openDialog && openDialog !== container) {
          if (openDialog.contains?.(activeEl) || activeEl === openDialog) {
            return;
          }
        }

        const inGallery = container.contains?.(activeEl) || activeEl === container;
        const inTrigger = trigger && (trigger.contains?.(activeEl) || activeEl === trigger);

        if (inGallery || inTrigger) {
          event.preventDefault();
          if (typeof event.stopPropagation === 'function') event.stopPropagation();
          close();
          try {
            trigger?.focus?.();
          } catch (_) {}
        }
      }
    }

    if (doc) {
      listen(doc, 'keydown', handleKeyDown);
    }
    if (trigger) {
      listen(trigger, 'keydown', handleKeyDown);
    }

    // Initial trigger sync
    updateTrigger();

    return {
      open,
      close,
      toggle,
      refresh,
      destroy,
      model: galleryModel
    };
  }

  Zhou.createFiguresGallery = createFiguresGallery;
})(globalThis.Zhou = globalThis.Zhou || {});
