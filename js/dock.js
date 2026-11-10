/**
 * dock.js – macOS Bottom Dock
 * ============================
 * Magnification effect, tooltips, running indicators, launch animation.
 */

window.Dock = {
  dockEl: null,
  items:  [],

  init() {
    this.dockEl = document.getElementById('dock');
    if (!this.dockEl) return;

    this._render();
    this._bindMagnification();
    this._bindLaunch();
  },

  // ─── Render dock icons ────────────────────────────────────────────────────
  _render() {
    if (!this.dockEl) return;
    const C = window.CONFIG;

    this.dockEl.innerHTML = C.dockApps.map((app, i) => {
      const isTrash  = app.id === 'trash';
      const isSep    = app.id === 'trash'; // separator before trash

      return `
        ${isSep ? '<div class="dock-separator"></div>' : ''}
        <div class="dock-item" data-app="${app.id}" data-name="${app.name}">
          <div class="dock-icon" id="dock-icon-${app.id}">
            ${this._getIcon(app)}
          </div>
          <div class="dock-indicator"></div>
          <div class="dock-tooltip">${app.name}</div>
        </div>
      `;
    }).join('');
  },

  // ─── Icon HTML (SVG-based for key apps, emoji fallback) ───────────────────
  _getIcon(app) {
    return `<img src="assets/icons/${app.id}.svg" alt="${app.name}" draggable="false" style="width:100%;height:100%;object-fit:contain;border-radius:22%;" onerror="this.onerror=null;this.parentElement.innerHTML='<span style=\\'font-size:36px;line-height:1;\\'>${app.emoji}</span>';" />`;
  },

  // ─── Magnification Effect ─────────────────────────────────────────────────
  _bindMagnification() {
    if (!this.dockEl) return;

    const MAG_FACTOR = 1.6;  // max scale multiplier
    const MAG_RANGE  = 100;  // px radius of magnification effect

    this.dockEl.addEventListener('mousemove', (e) => {
      const items = this.dockEl.querySelectorAll('.dock-item');
      items.forEach(item => {
        const rect  = item.querySelector('.dock-icon').getBoundingClientRect();
        const cx    = rect.left + rect.width / 2;
        const dist  = Math.abs(e.clientX - cx);
        const scale = dist < MAG_RANGE
          ? 1 + (MAG_FACTOR - 1) * Math.cos((dist / MAG_RANGE) * (Math.PI / 2))
          : 1;
        item.style.setProperty('--dock-scale', scale.toFixed(3));
      });
    });

    this.dockEl.addEventListener('mouseleave', () => {
      this.dockEl.querySelectorAll('.dock-item').forEach(item => {
        item.style.setProperty('--dock-scale', '1');
      });
    });
  },

  // ─── Launch on Click ─────────────────────────────────────────────────────
  _bindLaunch() {
    document.addEventListener('click', (e) => {
      const item = e.target.closest('.dock-item');
      if (!item || !this.dockEl.contains(item)) return;

      const appId = item.dataset.app;

      // Bounce animation
      item.classList.remove('bouncing');
      void item.offsetWidth;
      item.classList.add('bouncing');
      item.addEventListener('animationend', () => item.classList.remove('bouncing'), { once: true });

      // Special: launchpad
      if (appId === 'launchpad') {
        window.Launchpad?.toggle();
        return;
      }

      // Special: trash
      if (appId === 'trash') {
        window.WM?.open('trash');
        return;
      }

      // Open (or restore minimized) app window
      window.WM?.open(appId);
    });
  },
};

/**
 * notifications.js – Toast Notification System
 */
window.Notifications = {
  container: null,

  init() {
    this.container = document.getElementById('notification-center');
  },

  push(title, body, icon = '🔔') {
    if (!this.container) return;

    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.innerHTML = `
      <div class="notif-icon">${icon}</div>
      <div>
        <div class="notif-title">${title}</div>
        <div class="notif-body">${body}</div>
      </div>
    `;
    this.container.appendChild(toast);

    // Click to dismiss
    toast.addEventListener('click', () => this._dismiss(toast));

    // Auto-dismiss after 4s
    setTimeout(() => this._dismiss(toast), 4000);
  },

  _dismiss(toast) {
    toast.classList.add('hiding');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  },
};
