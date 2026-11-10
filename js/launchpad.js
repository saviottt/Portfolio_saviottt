/**
 * launchpad.js – Fullscreen Application Launcher
 * ===============================================
 * Grid of all apps. Click to open. Search to filter.
 * Escape or click background to close.
 */

window.Launchpad = {
  overlay: null,
  grid:    null,
  search:  null,
  allApps: [],

  init() {
    this.overlay = document.getElementById('launchpad-overlay');
    this.grid    = document.getElementById('launchpad-grid');
    this.search  = document.getElementById('launchpad-search');
    if (!this.overlay) return;

    // Build app list from config
    const C = window.CONFIG;
    this.allApps = C.dockApps.filter(a => a.id !== 'trash');

    this._renderGrid(this.allApps);

    // Search
    this.search.addEventListener('input', () => {
      const q = this.search.value.toLowerCase();
      const filtered = q
        ? this.allApps.filter(a => a.name.toLowerCase().includes(q))
        : this.allApps;
      this._renderGrid(filtered);
    });

    // Click outside grid to close
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.hide();
    });
  },

  // ─── Show Launchpad ───────────────────────────────────────────────────────
  show() {
    if (!this.overlay) return;
    this.overlay.classList.add('visible');
    if (this.search) {
      this.search.value = '';
      this._renderGrid(this.allApps);
      setTimeout(() => this.search.focus(), 100);
    }
  },

  // ─── Hide Launchpad ───────────────────────────────────────────────────────
  hide() {
    this.overlay?.classList.remove('visible');
  },

  toggle() {
    if (this.overlay?.classList.contains('visible')) this.hide();
    else this.show();
  },

  // ─── Render icon grid ─────────────────────────────────────────────────────
  _renderGrid(apps) {
    if (!this.grid) return;
    this.grid.innerHTML = apps.map(app => `
      <div class="launchpad-icon" data-app="${app.id}">
        <div class="launchpad-icon-img">
          <img src="assets/icons/${app.id}.svg" alt="${app.name}" draggable="false" style="width:100%;height:100%;object-fit:contain;border-radius:22%;" onerror="this.onerror=null;this.parentElement.innerHTML='${app.emoji}';" />
        </div>
        <div class="launchpad-icon-label">${app.name}</div>
      </div>
    `).join('');

    // Click handlers
    this.grid.querySelectorAll('.launchpad-icon').forEach(icon => {
      icon.addEventListener('click', () => {
        const appId = icon.dataset.app;
        this.hide();
        if (appId === 'launchpad') return;
        setTimeout(() => window.WM?.open(appId), 200);
      });
    });
  },
};
