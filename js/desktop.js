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

    // Click or tap to open
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.innerWidth <= 768;

    container.querySelectorAll('.desktop-icon').forEach(icon => {
      let clicks = 0;
      icon.addEventListener('click', () => {
        if (isTouchDevice) {
          // Single tap on mobile directly launches the app!
          window.WM?.open(icon.dataset.app);
          return;
        }

        // Desktop double-click
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

      // Drag desktop icons (mouse and touch)
      this._makeIconDraggable(icon);
    });

    // Click on empty desktop → deselect all
    document.getElementById('wallpaper')?.addEventListener('click', () => {
      document.querySelectorAll('.desktop-icon').forEach(x => x.classList.remove('selected'));
    });
  },

  // ─── Make a desktop icon draggable (Mouse + Touch) ───────────────────────
  _makeIconDraggable(icon) {
    let dragging = false, startX, startY, origLeft, origTop;

    const startDrag = (clientX, clientY) => {
      startX = clientX;
      startY = clientY;
      const rect = icon.getBoundingClientRect();
      origLeft = rect.left;
      origTop  = rect.top;
      dragging = false;
    };

    const moveDrag = (clientX, clientY) => {
      const dx = clientX - startX;
      const dy = clientY - startY;
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        dragging = true;
        icon.classList.add('dragging');
        icon.style.position = 'fixed';
        icon.style.left = (origLeft + dx) + 'px';
        icon.style.top  = (origTop  + dy) + 'px';
        icon.style.zIndex = '9999';
      }
    };

    const endDrag = () => {
      if (dragging) {
        icon.classList.remove('dragging');
      }
      dragging = false;
    };

    // Mouse handlers
    icon.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      startDrag(e.clientX, e.clientY);

      const onMove = (e) => moveDrag(e.clientX, e.clientY);
      const onUp = () => {
        endDrag();
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    // Touch handlers
    icon.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      startDrag(t.clientX, t.clientY);

      const onTouchMove = (e) => {
        if (e.touches.length === 1) {
          moveDrag(e.touches[0].clientX, e.touches[0].clientY);
        }
      };
      const onTouchEnd = () => {
        endDrag();
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
      };
      document.addEventListener('touchmove', onTouchMove, { passive: true });
      document.addEventListener('touchend', onTouchEnd);
    }, { passive: true });
  },

  // ─── Context Menu (Right-Click & Long-Press) ──────────────────────────────
  _bindContextMenu() {
    const menu = document.getElementById('context-menu');
    if (!menu) return;

    // Show on right-click on wallpaper / desktop canvas
    ['wallpaper', 'desktop-canvas'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;

      el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this._showContextMenu(e.clientX, e.clientY);
      });

      // Long-press (500ms) on touchscreens
      let pressTimer = null;
      el.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return;
        const t = e.touches[0];
        pressTimer = setTimeout(() => {
          this._showContextMenu(t.clientX, t.clientY);
        }, 500);
      }, { passive: true });

      el.addEventListener('touchmove', () => {
        if (pressTimer) clearTimeout(pressTimer);
      }, { passive: true });

      el.addEventListener('touchend', () => {
        if (pressTimer) clearTimeout(pressTimer);
      });
    });

    // Hide on click elsewhere
    document.addEventListener('click', () => menu.classList.remove('visible'));
    document.addEventListener('touchstart', (e) => {
      if (!menu.contains(e.target)) menu.classList.remove('visible');
    }, { passive: true });
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
