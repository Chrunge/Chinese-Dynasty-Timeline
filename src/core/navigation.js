(function (Zhou) {
  'use strict';
  // Frames are opaque to the navigation model; only the browser adapter knows DOM.
  Zhou.createNavigation = () => ({
    frames: [], pending: null, key: null,
    prepare(frame) { if (!this.pending) this.pending = frame; },
    enter(key) { this.frames.push(this.pending); this.pending = null; this.key = key; },
    back() { this.pending = null; const frame = this.frames.pop(); this.key = frame?.detail?.key || null; return frame; },
    reset() { this.frames = []; this.pending = null; this.key = null; },
    root() { return this.frames[0]; }
  });
})(globalThis.Zhou ||= {});
