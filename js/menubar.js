/**
 * menubar.js – Top Menu Bar Logic
 * =================================
 * Live clock, active-app name updates, menu dropdowns,
 * and right-click integration.
 */

window.Menubar = {
  clockInterval: null,

  init() {
    this._startClock();
    this._bindMenus();
    this._bindIndicators();
  },

  // ─── Live Clock ───────────────────────────────────────────────────────────
  _startClock() {
    const update = () => {
      const now = new Date();
      const dateEl  = document.getElementById('menubar-date');
      const clockEl = document.getElementById('menubar-clock');

      if (dateEl) {
        dateEl.textContent = now.toLocaleDateString('en-US', {
          weekday: 'short', month: 'short', day: 'numeric'
        });
      }
      if (clockEl) {
        clockEl.textContent = now.toLocaleTimeString('en-US', {
          hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
        });
      }
    };
    update();
    this.clockInterval = setInterval(update, 1000);
  },

  // ─── Dropdown Menus ───────────────────────────────────────────────────────
  _bindMenus() {
    // Toggle dropdown on click
    document.querySelectorAll('.menubar-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const isActive = item.classList.contains('active');
        // Close all
        document.querySelectorAll('.menubar-item').forEach(x => x.classList.remove('active'));
        if (!isActive) item.classList.add('active');
      });
    });

    // Close on outside click
    document.addEventListener('click', () => {
      document.querySelectorAll('.menubar-item').forEach(x => x.classList.remove('active'));
    });

    // Dropdown item actions
    document.querySelectorAll('.menu-dropdown-item[data-action]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.menubar-item').forEach(x => x.classList.remove('active'));
        this._handleMenuAction(item.dataset.action);
      });
    });
  },

  // ─── Menu action handler ──────────────────────────────────────────────────
  _handleMenuAction(action) {
    switch (action) {
      case 'about-mac':
        this._showAboutMac();
        break;
      case 'control-center':
        window.ControlCenter?.toggle();
        break;
      case 'launchpad':
        window.Launchpad?.toggle();
        break;
      case 'sleep':
      case 'lock':
        this._showLockScreen();
        break;
      case 'restart':
        this._simulateRestart();
        break;
      case 'dark-mode':
        this.toggleTheme();
        break;
      case 'quit':
        window.WM?.windows.forEach((_, id) => window.WM.close(id));
        break;
      case 'new-window':
        window.WM?.open('finder');
        break;
      case 'new-folder':
        window.Notifications?.push('Finder', 'New Folder created on Desktop', '📁');
        break;
      case 'spotlight':
        window.Spotlight?.show();
        break;
      case 'wallpaper':
        window.Desktop?.cycleWallpaper();
        break;
      case 'win-minimize':
        if (window.WM?.activeId) window.WM.minimize(window.WM.activeId);
        break;
      case 'win-zoom':
        if (window.WM?.activeId) window.WM.maximize(window.WM.activeId);
        break;
      case 'edit-undo':
      case 'edit-redo':
      case 'edit-selectall':
        window.Notifications?.push('Edit', 'Action processed in active application', '✏️');
        break;
      case 'help-contact':
        window.WM?.open('contact');
        break;
    }
  },

  // ─── Lock / Sleep Screen ──────────────────────────────────────────────────
  _showLockScreen() {
    const existing = document.getElementById('lock-screen');
    if (existing) return;

    const lock = document.createElement('div');
    lock.id = 'lock-screen';
    lock.style.cssText = `
      position:fixed;inset:0;z-index:999999;
      background:rgba(0,0,0,0.85);backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      color:#fff;cursor:pointer;animation:fadeIn 0.3s ease forwards;
    `;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false });
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    lock.innerHTML = `
      <div style="font-size:72px;font-weight:200;letter-spacing:-0.02em;margin-bottom:8px;">${timeStr}</div>
      <div style="font-size:18px;color:rgba(255,255,255,0.7);margin-bottom:48px;">${dateStr}</div>
      <div style="width:84px;height:84px;border-radius:50%;overflow:hidden;border:2px solid rgba(255,255,255,0.3);box-shadow:0 8px 24px rgba(0,0,0,0.5);margin-bottom:14px;background:#1e293b;">
        <img src="${window.CONFIG?.personal?.avatar || 'assets/images/avatar.svg'}" style="width:100%;height:100%;object-fit:cover;" onerror="this.outerHTML='<span style=\\'font-size:48px;display:flex;align-items:center;justify-content:center;height:100%;\\'>👨‍💻</span>';" />
      </div>
      <div style="font-size:16px;font-weight:600;margin-bottom:6px;">${window.CONFIG?.personal?.name || 'Don Savio Thomas'}</div>
      <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:20px;padding:8px 18px;background:rgba(255,255,255,0.1);border-radius:20px;border:1px solid rgba(255,255,255,0.15);">
        Click anywhere or press Enter to unlock
      </div>
    `;

    document.body.appendChild(lock);

    const unlock = () => {
      lock.style.transition = 'opacity 0.3s ease';
      lock.style.opacity = '0';
      setTimeout(() => lock.remove(), 300);
      document.removeEventListener('keydown', onKey);
    };

    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') unlock();
    };

    lock.addEventListener('click', unlock);
    document.addEventListener('keydown', onKey);
  },

  // ─── Simulate Restart ─────────────────────────────────────────────────────
  _simulateRestart() {
    const screen = document.createElement('div');
    screen.style.cssText = `
      position:fixed;inset:0;z-index:999999;
      background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;
      color:#fff;transition:opacity 0.5s ease;
    `;
    screen.innerHTML = `
      <svg width="60" height="74" viewBox="0 0 170 200" fill="#ffffff" style="margin-bottom:40px;">
        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.197-2.12-9.973-3.17-14.34-3.17-4.58 0-9.492 1.05-14.746 3.17-5.262 2.13-9.501 3.24-12.742 3.35-4.929.21-9.842-1.96-14.746-6.52-3.13-2.73-7.045-7.41-11.735-14.04-5.032-7.08-9.169-15.29-12.41-24.65-3.471-10.11-5.211-19.9-5.211-29.378 0-10.857 2.346-20.221 7.045-28.068 3.693-6.303 8.606-11.275 14.755-14.925 6.149-3.65 12.78-5.515 19.909-5.521 3.994 0 8.951 1.288 14.898 3.828 5.951 2.386 9.823 3.471 12.73 3.471 2.78 0 7.229-1.218 13.316-3.65 5.904-2.267 11.085-3.198 15.567-2.823 11.498.928 20.141 5.459 25.905 13.615-10.273 6.235-15.339 14.961-15.218 26.154.109 8.72 3.255 15.981 9.42 21.958 2.808 2.658 5.955 4.717 9.457 6.195-.759 2.198-1.559 4.304-2.407 6.433zM119.11 7.24c0 6.835-2.498 13.233-7.47 19.173-6.003 7.016-13.251 11.072-21.098 10.418-.099-.815-.158-1.671-.158-2.569 0-6.559 2.861-13.587 7.925-19.308 2.527-2.908 5.738-5.321 9.629-7.247 3.882-1.898 7.552-2.949 11.005-3.126.098.887.167 1.774.167 2.659z"/>
      </svg>
      <div style="width:160px;height:4px;background:rgba(255,255,255,0.2);border-radius:2px;overflow:hidden;">
        <div style="width:0%;height:100%;background:#ffffff;border-radius:2px;animation:progressFill 1.8s ease-in-out forwards;"></div>
      </div>
    `;
    document.body.appendChild(screen);
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  },

  // ─── About This Mac ───────────────────────────────────────────────────────
  _showAboutMac() {
    // Create a simple about-mac window
    const existing = document.getElementById('about-mac-modal');
    if (existing) { existing.remove(); return; }

    const modal = document.createElement('div');
    modal.id = 'about-mac-modal';
    modal.style.cssText = `
      position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
      z-index:99999;width:380px;
      background:rgba(44,44,46,0.96);backdrop-filter:blur(32px);-webkit-backdrop-filter:blur(32px);
      border:1px solid rgba(255,255,255,0.14);border-radius:18px;
      box-shadow:0 24px 72px rgba(0,0,0,0.6);overflow:hidden;
    `;
    modal.innerHTML = `
      <div style="padding:28px;text-align:center;">
        <div style="font-size:72px;margin-bottom:12px;">🖥️</div>
        <div style="font-size:20px;font-weight:700;color:#fff;margin-bottom:4px;">Savio OS</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.6);margin-bottom:4px;">Version 1.0.0</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.4);margin-bottom:20px;">macOS-inspired Portfolio</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;text-align:left;font-size:12px;margin-bottom:20px;background:rgba(255,255,255,0.05);border-radius:10px;padding:12px;">
          <span style="color:rgba(255,255,255,0.4);">Developer</span><span style="color:#fff;">Don Savio Thomas</span>
          <span style="color:rgba(255,255,255,0.4);">Browser</span><span style="color:#fff;">${navigator.userAgent.split(' ').slice(-1)[0]}</span>
          <span style="color:rgba(255,255,255,0.4);">Platform</span><span style="color:#fff;">Web · HTML5</span>
          <span style="color:rgba(255,255,255,0.4);">Memory</span><span style="color:#fff;">${navigator.deviceMemory || '?'} GB</span>
        </div>
        <button onclick="this.closest('#about-mac-modal').remove()"
          style="padding:8px 24px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;font-size:13px;font-family:inherit;cursor:pointer;">
          Close
        </button>
      </div>
    `;
    document.body.appendChild(modal);
    // Close on outside click
    setTimeout(() => {
      document.addEventListener('click', (e) => {
        if (!modal.contains(e.target)) modal.remove();
      }, { once: true });
    }, 100);
  },

  // ─── Indicator clicks ─────────────────────────────────────────────────────
  _bindIndicators() {
    // Control Center
    document.getElementById('cc-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      window.ControlCenter?.toggle();
    });

    // Spotlight via menu bar icon
    document.getElementById('spotlight-btn')?.addEventListener('click', () => {
      window.Spotlight?.show();
    });

    // Theme toggle
    document.getElementById('theme-btn')?.addEventListener('click', () => {
      this.toggleTheme();
    });

    // Notification center
    document.getElementById('notif-btn')?.addEventListener('click', () => {
      window.Notifications?.show();
    });
  },

  // ─── Dark / Light mode toggle ─────────────────────────────────────────────
  toggleTheme() {
    const html = document.documentElement;
    const isDark = html.dataset.theme !== 'light';
    html.dataset.theme = isDark ? 'light' : 'dark';
    this.updateThemeIcon();
  },

  updateThemeIcon() {
    const btn = document.getElementById('theme-btn');
    if (btn) {
      const isDark = document.documentElement.dataset.theme !== 'light';
      btn.textContent = isDark ? '☀️' : '🌙';
    }
  },
};
