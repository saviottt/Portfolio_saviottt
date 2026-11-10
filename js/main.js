/**
 * main.js – Bootstrap
 * ====================
 * Initializes all modules in dependency order and wires global
 * keyboard shortcuts (Cmd+Space → Spotlight, Escape → close overlays).
 */

document.addEventListener('DOMContentLoaded', () => {
  // ─── Initialize all modules ──────────────────────────────────────────────
  window.Menubar?.init();
  window.Desktop?.init();
  window.Dock?.init();
  window.Notifications?.init();
  window.Spotlight?.init();
  window.Launchpad?.init();
  window.ControlCenter?.init();

  // ─── Global Keyboard Shortcuts ───────────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    // Cmd+Space (Mac) or Ctrl+Space → Spotlight
    if ((e.metaKey || e.ctrlKey) && e.code === 'Space') {
      e.preventDefault();
      window.Spotlight?.toggle();
      return;
    }

    // Escape → close topmost overlay
    if (e.key === 'Escape') {
      if (window.Launchpad?.overlay?.classList.contains('visible')) {
        window.Launchpad.hide(); return;
      }
      if (window.Spotlight?.overlay?.classList.contains('visible')) {
        window.Spotlight.hide(); return;
      }
      if (document.getElementById('control-center')?.classList.contains('visible')) {
        window.ControlCenter.hide(); return;
      }
    }

    // Cmd+W → close focused window
    if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
      e.preventDefault();
      if (window.WM?.activeId) window.WM.close(window.WM.activeId);
    }

    // Cmd+M → minimize focused window
    if ((e.metaKey || e.ctrlKey) && e.key === 'm') {
      e.preventDefault();
      if (window.WM?.activeId) window.WM.minimize(window.WM.activeId);
    }

    // Cmd+H → hide / minimize all
    if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
      e.preventDefault();
      if (window.WM?.activeId) window.WM.minimize(window.WM.activeId);
    }

    // F1 → Launchpad
    if (e.key === 'F1') {
      e.preventDefault();
      window.Launchpad?.toggle();
    }
  });

  // ─── Boot notification ───────────────────────────────────────────────────
  setTimeout(() => {
    window.Notifications?.push(
      'Welcome to Savio OS',
      'Click dock icons to open apps. Try Cmd+Space for Spotlight.',
      '👋'
    );
  }, 800);

  setTimeout(() => {
    window.Notifications?.push(
      'Terminal Ready',
      'Open Terminal and type "help" to see available commands.',
      '⬛'
    );
  }, 3500);

  // ─── Set initial theme ───────────────────────────────────────────────────
  document.documentElement.dataset.theme = 'dark';

  console.log(
    '%c🖥️  Savio OS  %c Loaded Successfully ',
    'background:#0a84ff;color:#fff;font-weight:700;font-size:14px;padding:4px 8px;border-radius:4px 0 0 4px;',
    'background:#30d158;color:#fff;font-weight:700;font-size:14px;padding:4px 8px;border-radius:0 4px 4px 0;'
  );
});
