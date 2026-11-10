/**
 * window-manager.js – Window Lifecycle, Drag, Resize, Z-Index
 * =============================================================
 * Manages all application windows: open, close, minimize, maximize,
 * restore, drag, resize, and focus management.
 */

class WindowManager {
  constructor() {
    this.windows    = new Map();   // id -> { el, appId, minimized, maximized, ... }
    this.zCounter   = 200;         // z-index counter for focus stacking
    this.activeId   = null;        // currently focused window id
    this.dragState  = null;        // current drag operation
    this.resizeState = null;       // current resize operation

    this._bindGlobalListeners();
  }

  // ─── Open a window ──────────────────────────────────────────────────────
  open(appId, options = {}) {
    // If window exists and is minimized, restore it
    for (const [id, win] of this.windows) {
      if (win.appId === appId && win.minimized) {
        this.restore(id);
        return id;
      }
      // If already open, focus + shake
      if (win.appId === appId && !win.minimized) {
        this.focus(id);
        this._shake(win.el);
        return id;
      }
    }

    const id  = `win-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
    const cfg = window.APP_CONFIGS?.[appId] || {};

    const isMobile = window.innerWidth <= 768;
    // Defaults
    const w = isMobile ? window.innerWidth : (options.width  || cfg.width  || 800);
    const h = isMobile ? (window.innerHeight - 90) : (options.height || cfg.height || 560);
    const title = options.title || cfg.title || appId;

    // Cascade position (only on desktop)
    const offset = isMobile ? 0 : (this.windows.size % 8) * 24;
    const x = isMobile ? 0 : (options.x ?? Math.max(20, (window.innerWidth  - w) / 2 + offset));
    const y = isMobile ? 38 : (options.y ?? Math.max(28, (window.innerHeight - h) / 2 + offset - 40));

    // Build window element
    const el = this._buildWindow(id, appId, title, w, h, x, y);
    if (isMobile) el.classList.add('mobile-mode');
    document.body.appendChild(el);

    this.windows.set(id, { el, appId, minimized: false, maximized: isMobile, title });

    // Open animation
    requestAnimationFrame(() => {
      el.classList.add('window-opening');
      el.addEventListener('animationend', () => el.classList.remove('window-opening'), { once: true });
    });

    this.focus(id);
    this._updateDockIndicator(appId, true);
    this._updateMenuBar(title);

    // Notify application to render its content
    window.dispatchEvent(new CustomEvent('app:render', { detail: { id, appId, el } }));

    return id;
  }

  // ─── Close a window ─────────────────────────────────────────────────────
  close(id) {
    const win = this.windows.get(id);
    if (!win) return;

    win.el.classList.add('window-closing');
    win.el.addEventListener('animationend', () => {
      win.el.remove();
      this.windows.delete(id);
      this._checkDockIndicator(win.appId);
      this._focusNext();
    }, { once: true });
  }

  // ─── Minimize a window ──────────────────────────────────────────────────
  minimize(id) {
    const win = this.windows.get(id);
    if (!win || win.minimized) return;

    win.el.classList.add('window-minimizing');
    win.el.addEventListener('animationend', () => {
      win.el.classList.add('minimized');
      win.el.classList.remove('window-minimizing');
      win.minimized = true;
      this._focusNext();
      // Flash the dock icon
      this._flashDock(win.appId);
    }, { once: true });
  }

  // ─── Restore a minimized window ─────────────────────────────────────────
  restore(id) {
    const win = this.windows.get(id);
    if (!win || !win.minimized) return;

    win.el.classList.remove('minimized');
    win.minimized = false;

    win.el.classList.add('window-restoring');
    win.el.addEventListener('animationend', () => {
      win.el.classList.remove('window-restoring');
    }, { once: true });

    this.focus(id);
  }

  // ─── Toggle maximize ────────────────────────────────────────────────────
  maximize(id) {
    const win = this.windows.get(id);
    if (!win) return;

    if (win.maximized) {
      // Restore previous size
      const { px, py, pw, ph } = win.prevSize || {};
      if (px !== undefined) {
        win.el.style.left   = px + 'px';
        win.el.style.top    = py + 'px';
        win.el.style.width  = pw + 'px';
        win.el.style.height = ph + 'px';
      }
      win.el.classList.remove('maximized');
      win.maximized = false;
    } else {
      // Save current size
      win.prevSize = {
        px: parseInt(win.el.style.left),
        py: parseInt(win.el.style.top),
        pw: parseInt(win.el.style.width),
        ph: parseInt(win.el.style.height),
      };
      win.el.classList.add('maximized');
      win.maximized = true;
    }
  }

  // ─── Focus a window ─────────────────────────────────────────────────────
  focus(id) {
    if (this.activeId === id) return;

    // Unfocus previous
    if (this.activeId) {
      const prev = this.windows.get(this.activeId);
      if (prev) prev.el.classList.remove('focused');
    }

    const win = this.windows.get(id);
    if (!win) return;

    this.zCounter++;
    win.el.style.zIndex = this.zCounter;
    win.el.classList.add('focused');
    this.activeId = id;

    this._updateMenuBar(win.title);
  }

  // ─── Focus next available window ────────────────────────────────────────
  _focusNext() {
    // Find topmost non-minimized window
    let top = null, topZ = -1;
    for (const [id, win] of this.windows) {
      if (!win.minimized) {
        const z = parseInt(win.el.style.zIndex || 0);
        if (z > topZ) { topZ = z; top = id; }
      }
    }
    if (top) this.focus(top);
    else {
      this.activeId = null;
      this._updateMenuBar('Finder');
    }
  }

  // ─── Build window DOM ───────────────────────────────────────────────────
  _buildWindow(id, appId, title, w, h, x, y) {
    const el = document.createElement('div');
    el.className = 'window';
    el.id = id;
    el.style.cssText = `
      left: ${x}px; top: ${y}px;
      width: ${w}px; height: ${h}px;
      z-index: ${this.zCounter};
    `;

    el.innerHTML = `
      <div class="window-titlebar" data-id="${id}">
        <div class="window-controls">
          <div class="window-btn btn-close" data-action="close" data-id="${id}" title="Close">
            <span class="btn-icon">✕</span>
          </div>
          <div class="window-btn btn-minimize" data-action="minimize" data-id="${id}" title="Minimize">
            <span class="btn-icon">−</span>
          </div>
          <div class="window-btn btn-maximize" data-action="maximize" data-id="${id}" title="Zoom">
            <span class="btn-icon">+</span>
          </div>
        </div>
        <span class="window-title">${title}</span>
      </div>
      <div class="window-content" id="${id}-content"></div>
      <div class="resize-handle n"  data-resize="n"  data-id="${id}"></div>
      <div class="resize-handle s"  data-resize="s"  data-id="${id}"></div>
      <div class="resize-handle e"  data-resize="e"  data-id="${id}"></div>
      <div class="resize-handle w"  data-resize="w"  data-id="${id}"></div>
      <div class="resize-handle ne" data-resize="ne" data-id="${id}"></div>
      <div class="resize-handle nw" data-resize="nw" data-id="${id}"></div>
      <div class="resize-handle se" data-resize="se" data-id="${id}"></div>
      <div class="resize-handle sw" data-resize="sw" data-id="${id}"></div>
    `;

    return el;
  }

  // ─── Shake animation ────────────────────────────────────────────────────
  _shake(el) {
    el.classList.remove('window-shake');
    void el.offsetWidth; // reflow
    el.classList.add('window-shake');
    el.addEventListener('animationend', () => el.classList.remove('window-shake'), { once: true });
  }

  // ─── Update active app name in menu bar ─────────────────────────────────
  _updateMenuBar(title) {
    const el = document.getElementById('active-app-name');
    if (el) el.textContent = title;
  }

  // ─── Dock indicator ─────────────────────────────────────────────────────
  _updateDockIndicator(appId, running) {
    const item = document.querySelector(`.dock-item[data-app="${appId}"]`);
    if (!item) return;
    item.classList.toggle('running', running);
  }

  _checkDockIndicator(appId) {
    // Check if any windows for this app remain
    let hasWindow = false;
    for (const [, win] of this.windows) {
      if (win.appId === appId) { hasWindow = true; break; }
    }
    this._updateDockIndicator(appId, hasWindow);
  }

  _flashDock(appId) {
    const item = document.querySelector(`.dock-item[data-app="${appId}"]`);
    if (!item) return;
    item.classList.add('minimizing-target');
    item.addEventListener('animationend', () => item.classList.remove('minimizing-target'), { once: true });
  }

  // ─── Global mouse listeners for drag + resize ───────────────────────────
  _bindGlobalListeners() {
    document.addEventListener('mousedown', (e) => this._onMouseDown(e));
    document.addEventListener('mousemove', (e) => this._onMouseMove(e));
    document.addEventListener('mouseup',   (e) => this._onMouseUp(e));

    // Touch support for traffic lights & focus
    document.addEventListener('touchstart', (e) => {
      const btn = e.target.closest('[data-action]');
      if (btn) {
        e.stopPropagation();
        const action = btn.dataset.action;
        const id     = btn.dataset.id;
        if (action === 'close')    this.close(id);
        if (action === 'minimize') this.minimize(id);
        if (action === 'maximize') this.maximize(id);
        return;
      }
      const win = e.target.closest('.window');
      if (win) {
        this.focus(win.id);
      }
    }, { passive: true });
  }

  _onMouseDown(e) {
    // Traffic light buttons
    const btn = e.target.closest('[data-action]');
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      const action = btn.dataset.action;
      const id     = btn.dataset.id;
      if (action === 'close')    this.close(id);
      if (action === 'minimize') this.minimize(id);
      if (action === 'maximize') this.maximize(id);
      return;
    }

    // Titlebar drag
    const titlebar = e.target.closest('.window-titlebar');
    if (titlebar && e.button === 0) {
      const id = titlebar.dataset.id;
      const win = this.windows.get(id);
      if (!win || win.maximized) return;
      this.focus(id);
      e.preventDefault();
      this.dragState = {
        id,
        startX: e.clientX,
        startY: e.clientY,
        origLeft: parseInt(win.el.style.left),
        origTop:  parseInt(win.el.style.top),
      };
      win.el.style.cursor = 'grabbing';
      return;
    }

    // Resize handles
    const handle = e.target.closest('[data-resize]');
    if (handle && e.button === 0) {
      const id = handle.dataset.id;
      const win = this.windows.get(id);
      if (!win) return;
      this.focus(id);
      e.preventDefault();
      this.resizeState = {
        id,
        dir: handle.dataset.resize,
        startX: e.clientX,
        startY: e.clientY,
        origLeft:   parseInt(win.el.style.left),
        origTop:    parseInt(win.el.style.top),
        origWidth:  parseInt(win.el.style.width),
        origHeight: parseInt(win.el.style.height),
      };
      return;
    }

    // Click inside window → focus
    const win = e.target.closest('.window');
    if (win) {
      this.focus(win.id);
    }
  }

  _onMouseMove(e) {
    // Dragging
    if (this.dragState) {
      const { id, startX, startY, origLeft, origTop } = this.dragState;
      const win = this.windows.get(id);
      if (!win) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const newLeft = Math.max(0, origLeft + dx);
      const newTop  = Math.max(28, origTop  + dy);
      win.el.style.left = newLeft + 'px';
      win.el.style.top  = newTop  + 'px';
      return;
    }

    // Resizing
    if (this.resizeState) {
      const { id, dir, startX, startY, origLeft, origTop, origWidth, origHeight } = this.resizeState;
      const win = this.windows.get(id);
      if (!win) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const MIN_W = 400, MIN_H = 300;

      let newLeft = origLeft, newTop = origTop;
      let newW = origWidth, newH = origHeight;

      if (dir.includes('e'))  newW = Math.max(MIN_W, origWidth + dx);
      if (dir.includes('s'))  newH = Math.max(MIN_H, origHeight + dy);
      if (dir.includes('w'))  { newW = Math.max(MIN_W, origWidth - dx);  newLeft = origLeft + (origWidth - newW); }
      if (dir.includes('n'))  { newH = Math.max(MIN_H, origHeight - dy); newTop  = origTop  + (origHeight - newH); }

      win.el.style.left   = newLeft + 'px';
      win.el.style.top    = newTop  + 'px';
      win.el.style.width  = newW + 'px';
      win.el.style.height = newH + 'px';
    }
  }

  _onMouseUp(e) {
    if (this.dragState) {
      const win = this.windows.get(this.dragState.id);
      if (win) win.el.style.cursor = '';
      this.dragState = null;
    }
    this.resizeState = null;
  }
}

// Export singleton
window.WM = new WindowManager();
