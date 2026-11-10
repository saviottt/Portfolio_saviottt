/**
 * spotlight.js – Spotlight Search
 * ================================
 * Activated by Cmd+Space (or clicking menu bar icon).
 * Searches across apps, projects, contacts and skills in real-time.
 */

window.Spotlight = {
  overlay:  null,
  input:    null,
  results:  null,
  selected: -1,
  items:    [],   // flat searchable index

  init() {
    this.overlay = document.getElementById('spotlight-overlay');
    this.input   = document.getElementById('spotlight-input');
    this.results = document.getElementById('spotlight-results');
    if (!this.overlay) return;

    this._buildIndex();

    // Input handler
    this.input.addEventListener('input', () => this._search(this.input.value));

    // Keyboard navigation
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape')    { this.hide(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); this._moveSelection(1); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); this._moveSelection(-1); }
      if (e.key === 'Enter')     { this._activateSelected(); }
    });

    // Click / touch outside to close
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.hide();
    });
    this.overlay.addEventListener('touchstart', (e) => {
      if (e.target === this.overlay) this.hide();
    }, { passive: true });
  },

  // ─── Build searchable index ───────────────────────────────────────────────
  _buildIndex() {
    const C = window.CONFIG;
    this.items = [];

    // Apps
    C.dockApps.forEach(app => {
      this.items.push({
        category: 'Applications',
        icon: app.emoji,
        name: app.name,
        sub: 'Application',
        action: () => window.WM?.open(app.id),
      });
    });

    // Projects
    C.projects.forEach(p => {
      this.items.push({
        category: 'Projects',
        icon: p.icon,
        name: p.name,
        sub: p.subtitle,
        action: () => {
          window.WM?.open('projects');
        },
      });
    });

    // Skills
    Object.entries(C.skills).forEach(([cat, skills]) => {
      skills.forEach(skill => {
        this.items.push({
          category: 'Skills',
          icon: '💡',
          name: skill,
          sub: cat,
          action: () => window.WM?.open('about'),
        });
      });
    });

    // Social links
    const links = [
      { name: 'GitHub',   icon: '🐙', sub: 'Profile', action: () => window.open(C.social.github,   '_blank') },
      { name: 'LinkedIn', icon: '💼', sub: 'Profile', action: () => window.open(C.social.linkedin, '_blank') },
      { name: 'Email',    icon: '📧', sub: 'Contact', action: () => window.open(C.social.email,    '_blank') },
    ];
    links.forEach(l => this.items.push({ ...l, category: 'Links' }));
  },

  // ─── Show Spotlight ───────────────────────────────────────────────────────
  show() {
    if (!this.overlay) return;
    this.overlay.classList.add('visible');
    this.input.value = '';
    this._search('');
    this.selected = -1;
    setTimeout(() => this.input.focus(), 50);
  },

  // ─── Hide Spotlight ───────────────────────────────────────────────────────
  hide() {
    if (!this.overlay) return;
    this.overlay.classList.remove('visible');
    this.input.blur();
  },

  toggle() {
    if (this.overlay?.classList.contains('visible')) this.hide();
    else this.show();
  },

  // ─── Search ───────────────────────────────────────────────────────────────
  _search(query) {
    this.selected = -1;
    if (!query.trim()) {
      // Show default suggestions
      this._renderResults(this._defaultResults());
      return;
    }

    const q = query.toLowerCase();
    const matched = this.items.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.sub.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );

    this._renderResults(matched.slice(0, 12));
  },

  _defaultResults() {
    // Show top apps as default
    return this.items.filter(i => i.category === 'Applications').slice(0, 6);
  },

  // ─── Render results ───────────────────────────────────────────────────────
  _renderResults(items) {
    if (!this.results) return;

    if (!items.length) {
      this.results.innerHTML = `
        <div style="padding:20px;text-align:center;color:var(--text-secondary);font-size:13px;">
          No results found
        </div>`;
      return;
    }

    // Group by category
    const groups = {};
    items.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });

    this.results.innerHTML = Object.entries(groups).map(([cat, catItems]) => `
      <div class="spotlight-category">${cat}</div>
      ${catItems.map((item, i) => `
        <div class="spotlight-result" data-idx="${this.items.indexOf(item)}" data-action="${i}">
          <div class="spotlight-result-icon">${item.icon}</div>
          <div class="spotlight-result-info">
            <div class="spotlight-result-name">${item.name}</div>
            <div class="spotlight-result-sub">${item.sub}</div>
          </div>
        </div>
      `).join('')}
    `).join('');

    // Click handlers
    this.results.querySelectorAll('.spotlight-result').forEach((el) => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.idx);
        const item = this.items[idx];
        if (item) { item.action(); this.hide(); }
      });
    });
  },

  // ─── Keyboard selection ───────────────────────────────────────────────────
  _moveSelection(dir) {
    const rows = this.results.querySelectorAll('.spotlight-result');
    if (!rows.length) return;

    rows[this.selected]?.classList.remove('selected');
    this.selected = Math.max(0, Math.min(rows.length - 1, this.selected + dir));
    rows[this.selected]?.classList.add('selected');
    rows[this.selected]?.scrollIntoView({ block: 'nearest' });
  },

  _activateSelected() {
    const row = this.results.querySelectorAll('.spotlight-result')[this.selected];
    if (row) {
      row.click();
    } else if (this.input.value.trim()) {
      // If nothing selected, treat first result as default
      const first = this.results.querySelector('.spotlight-result');
      if (first) first.click();
    }
  },
};
