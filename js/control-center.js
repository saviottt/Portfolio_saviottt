/**
 * control-center.js – macOS Control Center Popup
 * ================================================
 * Tiles: WiFi, Bluetooth, Dark Mode, Do Not Disturb
 * Sliders: Brightness, Volume
 */

window.ControlCenter = {
  panel:  null,
  state: {
    wifi:       true,
    bluetooth:  true,
    darkMode:   true,
    dnd:        false,
    brightness: 80,
    volume:     60,
  },

  init() {
    this.panel = document.getElementById('control-center');
    if (!this.panel) return;
    this._render();
  },

  // ─── Show/Hide ────────────────────────────────────────────────────────────
  show() {
    this._render();
    this.panel?.classList.add('visible');
    // Click / touch outside to close
    setTimeout(() => {
      document.addEventListener('click', this._closeOutside, { once: true, capture: true });
      document.addEventListener('touchstart', this._closeOutside, { once: true, capture: true });
    }, 50);
  },

  hide() {
    this.panel?.classList.remove('visible');
    document.removeEventListener('click', this._closeOutside, { capture: true });
    document.removeEventListener('touchstart', this._closeOutside, { capture: true });
  },

  toggle() {
    if (this.panel?.classList.contains('visible')) this.hide();
    else this.show();
  },

  _closeOutside(e) {
    const cc = document.getElementById('control-center');
    const ccBtn = document.getElementById('cc-btn');
    if (cc && !cc.contains(e.target) && (!ccBtn || !ccBtn.contains(e.target))) {
      window.ControlCenter.hide();
    }
  },

  // ─── Render ───────────────────────────────────────────────────────────────
  _render() {
    if (!this.panel) return;
    const s = this.state;

    this.panel.innerHTML = `
      <div style="font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-tertiary);margin-bottom:12px;">Control Center</div>

      <!-- Row 1: WiFi, Bluetooth -->
      <div class="cc-row">
        <div class="cc-tile ${s.wifi ? 'active' : ''}" data-cc="wifi">
          <div class="cc-tile-icon">📶</div>
          <div class="cc-tile-label">Wi-Fi</div>
          <div class="cc-tile-sub">${s.wifi ? 'Connected' : 'Off'}</div>
        </div>
        <div class="cc-tile ${s.bluetooth ? 'active' : ''}" data-cc="bluetooth">
          <div class="cc-tile-icon">🔵</div>
          <div class="cc-tile-label">Bluetooth</div>
          <div class="cc-tile-sub">${s.bluetooth ? 'On' : 'Off'}</div>
        </div>
      </div>

      <!-- Row 2: Dark Mode, Do Not Disturb -->
      <div class="cc-row">
        <div class="cc-tile ${s.darkMode ? 'active' : ''}" data-cc="darkMode">
          <div class="cc-tile-icon">${s.darkMode ? '🌙' : '☀️'}</div>
          <div class="cc-tile-label">Dark Mode</div>
          <div class="cc-tile-sub">${s.darkMode ? 'On' : 'Off'}</div>
        </div>
        <div class="cc-tile ${s.dnd ? 'active' : ''}" data-cc="dnd">
          <div class="cc-tile-icon">🔕</div>
          <div class="cc-tile-label">Focus</div>
          <div class="cc-tile-sub">${s.dnd ? 'On' : 'Off'}</div>
        </div>
      </div>

      <!-- Brightness -->
      <div class="cc-slider-row">
        <div class="cc-slider-label">
          <span>☀️</span> Display Brightness
        </div>
        <input type="range" class="cc-slider" min="10" max="100" value="${s.brightness}" data-cc-slider="brightness" />
      </div>

      <!-- Volume -->
      <div class="cc-slider-row">
        <div class="cc-slider-label">
          <span>🔊</span> Volume
        </div>
        <input type="range" class="cc-slider" min="0" max="100" value="${s.volume}" data-cc-slider="volume" />
      </div>

      <!-- Wallpaper quick switch -->
      <div style="font-size:11px;font-weight:600;color:var(--text-secondary);margin:8px 0 6px;">Wallpaper</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;">
        ${(window.CONFIG?.wallpapers || []).map((w, i) => `
          <div
            style="width:44px;height:30px;border-radius:6px;cursor:pointer;border:2px solid transparent;background:${w.css};background-size:cover;transition:all 0.15s;flex-shrink:0;"
            data-wp="${i}"
            title="${w.name}"
            onclick="window.Desktop?.setWallpaper(${i}); this.closest('[id=control-center]').querySelectorAll('[data-wp]').forEach(x=>x.style.borderColor='transparent'); this.style.borderColor='var(--accent-blue)';"
          ></div>
        `).join('')}
      </div>
    `;

    // Tile toggles
    this.panel.querySelectorAll('[data-cc]').forEach(tile => {
      tile.addEventListener('click', () => {
        const key = tile.dataset.cc;
        s[key] = !s[key];

        // Apply dark mode
        if (key === 'darkMode') {
          document.documentElement.dataset.theme = s.darkMode ? 'dark' : 'light';
          window.Menubar?.updateThemeIcon();
        }

        this._render();
      });
    });

    // Sliders
    this.panel.querySelectorAll('[data-cc-slider]').forEach(slider => {
      slider.addEventListener('input', () => {
        const key = slider.dataset.ccSlider;
        s[key] = parseInt(slider.value);
        // Could apply brightness filter to wallpaper or body here
      });
    });
  },
};
