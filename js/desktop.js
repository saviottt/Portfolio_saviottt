/**
 * desktop.js – Desktop Icons and Right-Click Context Menu
 * ========================================================
 * Manages desktop shortcuts (drag, double-click to launch),
 * selection box, wallpaper switching, and right-click context menu.
 */

window.Desktop = {
  currentWallpaper: 0,
  desktopIcons: [],

  init() {
    this._renderIcons();
    this._bindContextMenu();
    this._bindDesktopClick();
  },

  // ─── Render desktop shortcut icons ────────────────────────────────────────
  _renderIcons() {
    const container = document.getElementById('desktop-icons');
    if (!container) return;

    const C = window.CONFIG;
    // A curated set of shortcuts on the desktop
    const shortcuts = [
      { id: 'projects', emoji: '🚀', label: 'Projects' },
      { id: 'resume',   emoji: '📄', label: 'Resume.pdf' },
      { id: 'github',   emoji: '🐙', label: 'GitHub' },
      { id: 'terminal', emoji: '⬛', label: 'Terminal' },
    ];

    container.innerHTML = shortcuts.map(s => `
      <div class="desktop-icon" data-app="${s.id}" title="Double-click to open">
        <div class="desktop-icon-img">
          <img src="assets/icons/${s.id}.svg" alt="${s.label}" draggable="false" style="width:100%;height:100%;object-fit:contain;border-radius:22%;" onerror="this.onerror=null;this.parentElement.innerHTML='${s.emoji}';" />
        </div>
        <div class="desktop-icon-label">${s.label}</div>
      </div>
    `).join('');

    // Double-click to open
    container.querySelectorAll('.desktop-icon').forEach(icon => {
      let clicks = 0;
      icon.addEventListener('click', () => {
        clicks++;
        if (clicks === 1) {
          icon.classList.add('selected');
          setTimeout(() => { if (clicks === 1) clicks = 0; }, 400);
        }
        if (clicks >= 2) {
          clicks = 0;
          icon.classList.remove('selected');
          window.WM?.open(icon.dataset.app);
        }
      });

      // Drag desktop icons
      this._makeIconDraggable(icon);
    });

    // Click on empty desktop → deselect all
    document.getElementById('wallpaper')?.addEventListener('click', () => {
      document.querySelectorAll('.desktop-icon').forEach(x => x.classList.remove('selected'));
    });
  },

  // ─── Make a desktop icon draggable ───────────────────────────────────────
  _makeIconDraggable(icon) {
    let dragging = false, startX, startY, origLeft, origTop;

    icon.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      startX = e.clientX;
      startY = e.clientY;
      const rect = icon.getBoundingClientRect();
      origLeft = rect.left;
      origTop  = rect.top;
      dragging = false;

      const onMove = (e) => {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
          dragging = true;
          icon.classList.add('dragging');
          icon.style.position = 'fixed';
          icon.style.left = (origLeft + dx) + 'px';
          icon.style.top  = (origTop  + dy) + 'px';
          icon.style.zIndex = '9999';
        }
      };

      const onUp = () => {
        if (dragging) {
          icon.classList.remove('dragging');
        }
        dragging = false;
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  },

  // ─── Context Menu ─────────────────────────────────────────────────────────
  _bindContextMenu() {
    const menu = document.getElementById('context-menu');
    if (!menu) return;

    // Show on right-click on wallpaper / desktop canvas
    ['wallpaper', 'desktop-canvas'].forEach(id => {
      document.getElementById(id)?.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this._showContextMenu(e.clientX, e.clientY);
      });
    });

    // Hide on click elsewhere
    document.addEventListener('click', () => menu.classList.remove('visible'));
    document.addEventListener('contextmenu', () => menu.classList.remove('visible'));
  },

  _showContextMenu(x, y) {
    const menu = document.getElementById('context-menu');
    if (!menu) return;

    menu.classList.add('visible');

    // Position (keep in viewport)
    const W = window.innerWidth, H = window.innerHeight;
    const mw = menu.offsetWidth  || 200;
    const mh = menu.offsetHeight || 200;
    menu.style.left = Math.min(x, W - mw - 8) + 'px';
    menu.style.top  = Math.min(y, H - mh - 8) + 'px';

    // Wire actions
    menu.querySelectorAll('[data-action]').forEach(item => {
      item.onclick = (e) => {
        e.stopPropagation();
        menu.classList.remove('visible');
        this._handleContextAction(item.dataset.action);
      };
    });
  },

  _handleContextAction(action) {
    switch (action) {
      case 'new-folder':
        window.Notifications?.push('Finder', 'New Folder created on Desktop', '📁');
        break;
      case 'wallpaper':
        this.cycleWallpaper();
        break;
      case 'spotlight':
        window.Spotlight?.show();
        break;
      case 'about-mac':
        window.Menubar?._showAboutMac();
        break;
      case 'refresh':
        window.location.reload();
        break;
    }
  },

  _bindDesktopClick() {
    // Deselect desktop icons on wallpaper click
    document.getElementById('wallpaper')?.addEventListener('click', () => {
      document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
    });
  },

  // ─── Wallpaper switching ──────────────────────────────────────────────────
  setWallpaper(index) {
    const C = window.CONFIG;
    if (!C.wallpapers[index]) return;
    this.currentWallpaper = index;
    const wp = document.getElementById('wallpaper');
    if (wp) wp.style.background = C.wallpapers[index].css;
    window.Notifications?.push('Desktop', `Wallpaper changed to ${C.wallpapers[index].name}`, '🖼️');
  },

  cycleWallpaper() {
    const C = window.CONFIG;
    this.currentWallpaper = (this.currentWallpaper + 1) % C.wallpapers.length;
    this.setWallpaper(this.currentWallpaper);
  },
};
