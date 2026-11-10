/**
 * terminal.js – Interactive Terminal Emulator
 * ============================================
 * Full terminal with command history (↑/↓), blinking cursor,
 * colored output, and 10+ built-in commands.
 */

window.TerminalApp = {
  history:   [],   // command history
  histIndex: -1,   // current history navigation index
  instances: {},   // winId → { outputEl, inputEl }

  // ─── Render terminal into a window content element ─────────────────────
  render(el, winId) {
    el.innerHTML = `
      <div class="terminal-app" id="${winId}-term">
        <div class="terminal-output" id="${winId}-out"></div>
        <div class="terminal-input-row" id="${winId}-row">
          ${this._promptHTML()}
          <input
            class="terminal-input"
            id="${winId}-inp"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            placeholder=""
          />
        </div>
      </div>
    `;

    const outputEl = document.getElementById(`${winId}-out`);
    const inputEl  = document.getElementById(`${winId}-inp`);
    this.instances[winId] = { outputEl, inputEl };

    // Welcome banner
    this._print(winId, this._welcome(), 't-out');

    // Input events
    inputEl.addEventListener('keydown', (e) => this._onKey(e, winId));

    // Click anywhere in terminal → focus input
    el.querySelector('.terminal-app').addEventListener('click', () => inputEl.focus());

    // Auto-focus
    setTimeout(() => inputEl.focus(), 50);
  },

  // ─── Prompt HTML ─────────────────────────────────────────────────────────
  _promptHTML() {
    return `
      <span class="t-user">savio</span><span class="t-at">@</span><span class="t-host">savio-os</span><span class="t-sep">:</span><span class="t-dir">~</span><span class="t-sym">$ </span>
    `;
  },

  // ─── Print a line to terminal output ────────────────────────────────────
  _print(winId, html, cls = 't-out') {
    const { outputEl } = this.instances[winId] || {};
    if (!outputEl) return;
    const line = document.createElement('div');
    line.className = `terminal-line ${cls}`;
    line.innerHTML = html;
    outputEl.appendChild(line);
    outputEl.scrollTop = outputEl.scrollHeight;
  },

  // ─── Key handler ────────────────────────────────────────────────────────
  _onKey(e, winId) {
    const { inputEl } = this.instances[winId] || {};
    if (!inputEl) return;

    if (e.key === 'Enter') {
      const cmd = inputEl.value.trim();
      inputEl.value = '';
      this.histIndex = -1;

      // Echo the command
      this._print(winId, `${this._promptHTML()}<span class="t-cmd">${this._escape(cmd)}</span>`, '');

      if (cmd) {
        this.history.unshift(cmd);
        if (this.history.length > 100) this.history.pop();
        this._execute(winId, cmd);
      }
    }

    // History navigation
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.histIndex < this.history.length - 1) {
        this.histIndex++;
        inputEl.value = this.history[this.histIndex] || '';
      }
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.histIndex > 0) {
        this.histIndex--;
        inputEl.value = this.history[this.histIndex] || '';
      } else {
        this.histIndex = -1;
        inputEl.value = '';
      }
    }

    // Tab autocomplete
    if (e.key === 'Tab') {
      e.preventDefault();
      const cmds = Object.keys(this._commands());
      const partial = inputEl.value;
      const match = cmds.find(c => c.startsWith(partial));
      if (match) inputEl.value = match;
    }
  },

  // ─── Execute a command ───────────────────────────────────────────────────
  _execute(winId, raw) {
    const parts = raw.split(/\s+/);
    const cmd   = parts[0].toLowerCase();
    const args  = parts.slice(1);
    const commands = this._commands();

    if (commands[cmd]) {
      commands[cmd].call(this, winId, args);
    } else {
      this._print(winId, `<span class="t-err">zsh: command not found: ${this._escape(cmd)}</span>`, '');
      this._print(winId, `<span class="t-dim">Type <span class="t-info">help</span> for available commands.</span>`, '');
    }
  },

  // ─── Command definitions ─────────────────────────────────────────────────
  _commands() {
    const C = window.CONFIG;
    return {
      help: (winId) => {
        this._print(winId, `<span class="t-success t-bold">Available Commands</span>`, '');
        this._print(winId, `<span class="t-dim">─────────────────────────────────────────────</span>`, '');
        const cmds = [
          ['help',      'Show this help message'],
          ['about',     'Display info about Savio Thomas'],
          ['skills',    'List technical skills'],
          ['projects',  'Show all projects'],
          ['education', 'Display educational background'],
          ['contact',   'Show contact information'],
          ['github',    'Open GitHub profile'],
          ['clear',     'Clear the terminal'],
          ['date',      'Display current date and time'],
          ['whoami',    'Display current user'],
          ['ls',        'List directory contents'],
          ['pwd',       'Print working directory'],
          ['echo',      'Echo arguments to output'],
          ['history',   'Show command history'],
          ['neofetch',  'System information'],
        ];
        cmds.forEach(([name, desc]) => {
          this._print(winId, `  <span class="t-info">${name.padEnd(12)}</span><span class="t-dim">${desc}</span>`, '');
        });
        this._print(winId, '', '');
      },

      about: (winId) => {
        this._print(winId, ``, '');
        this._print(winId, `  <span class="t-success t-bold">Don Savio Thomas</span>`, '');
        this._print(winId, `  <span class="t-dim">──────────────────────────────────</span>`, '');
        this._print(winId, `  <span class="t-info">Role      </span><span class="t-out">Aspiring Software & DevOps Engineer</span>`, '');
        this._print(winId, `  <span class="t-info">College   </span><span class="t-out">VJCET – B.Tech Information Technology</span>`, '');
        this._print(winId, `  <span class="t-info">Location  </span><span class="t-out">Kerala, India</span>`, '');
        this._print(winId, `  <span class="t-info">Focus     </span><span class="t-out">Linux · Cloud · Automation · DevOps</span>`, '');
        this._print(winId, `  <span class="t-info">Status    </span><span class="t-success">Open to opportunities 🚀</span>`, '');
        this._print(winId, ``, '');
      },

      skills: (winId) => {
        this._print(winId, ``, '');
        this._print(winId, `  <span class="t-success t-bold">Technical Skills</span>`, '');
        this._print(winId, `  <span class="t-dim">──────────────────────────────────</span>`, '');
        Object.entries(C.skills).forEach(([cat, skills]) => {
          this._print(winId, `  <span class="t-info">${cat.padEnd(12)}</span><span class="t-out">${skills.join(' · ')}</span>`, '');
        });
        this._print(winId, ``, '');
      },

      projects: (winId) => {
        this._print(winId, ``, '');
        this._print(winId, `  <span class="t-success t-bold">Projects</span>`, '');
        this._print(winId, `  <span class="t-dim">──────────────────────────────────</span>`, '');
        C.projects.forEach((p, i) => {
          this._print(winId, ``, '');
          this._print(winId, `  <span class="t-warn">[${i+1}] ${p.icon} ${p.name}</span> <span class="t-dim">– ${p.subtitle}</span>`, '');
          this._print(winId, `      <span class="t-out">${p.description.slice(0, 90)}...</span>`, '');
          this._print(winId, `      <span class="t-info">Tech: </span><span class="t-dim">${p.tech.join(', ')}</span>`, '');
          this._print(winId, `      <span class="t-info">Repo: </span><span class="t-link" onclick="window.open('${p.github}','_blank')">${p.github}</span>`, '');
        });
        this._print(winId, ``, '');
      },

      education: (winId) => {
        this._print(winId, ``, '');
        this._print(winId, `  <span class="t-success t-bold">Education</span>`, '');
        this._print(winId, `  <span class="t-dim">──────────────────────────────────</span>`, '');
        C.education.forEach(e => {
          this._print(winId, ``, '');
          this._print(winId, `  <span class="t-warn">${e.icon}  ${e.degree}</span>`, '');
          this._print(winId, `     <span class="t-info">Institution: </span><span class="t-out">${e.institution}</span>`, '');
          this._print(winId, `     <span class="t-info">Year:        </span><span class="t-out">${e.year}</span>`, '');
          this._print(winId, `     <span class="t-info">Status:      </span><span class="t-${e.status==='Completed'?'success':'warn'}">${e.status}</span>`, '');
        });
        this._print(winId, ``, '');
      },

      contact: (winId) => {
        this._print(winId, ``, '');
        this._print(winId, `  <span class="t-success t-bold">Contact Information</span>`, '');
        this._print(winId, `  <span class="t-dim">──────────────────────────────────</span>`, '');
        this._print(winId, `  <span class="t-info">Email     </span><span class="t-link" onclick="window.open('${C.social.email}','_blank')">${C.personal.email}</span>`, '');
        this._print(winId, `  <span class="t-info">GitHub    </span><span class="t-link" onclick="window.open('${C.social.github}','_blank')">${C.social.github}</span>`, '');
        this._print(winId, `  <span class="t-info">LinkedIn  </span><span class="t-link" onclick="window.open('${C.social.linkedin}','_blank')">${C.social.linkedin}</span>`, '');
        this._print(winId, `  <span class="t-info">Instagram </span><span class="t-link" onclick="window.open('${C.social.instagram}','_blank')">${C.social.instagram}</span>`, '');
        this._print(winId, ``, '');
      },

      github: (winId) => {
        this._print(winId, `<span class="t-info">Opening GitHub profile...</span>`, '');
        setTimeout(() => window.open(C.social.github, '_blank'), 400);
      },

      clear: (winId) => {
        const { outputEl } = this.instances[winId] || {};
        if (outputEl) outputEl.innerHTML = '';
      },

      date: (winId) => {
        const now = new Date();
        this._print(winId, `<span class="t-out">${now.toLocaleString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit' })}</span>`, '');
      },

      whoami: (winId) => {
        this._print(winId, `<span class="t-success">savio</span>`, '');
      },

      ls: (winId, args) => {
        const items = [
          '📁 Projects/', '📁 Skills/', '📁 Documents/', '📁 Downloads/',
          '📄 README.md', '📄 resume.pdf', '🐍 portfolio.py', '📜 setup.sh'
        ];
        this._print(winId, items.join('  '), '');
      },

      pwd: (winId) => {
        this._print(winId, `<span class="t-out">/home/savio</span>`, '');
      },

      echo: (winId, args) => {
        this._print(winId, `<span class="t-out">${this._escape(args.join(' '))}</span>`, '');
      },

      history: (winId) => {
        this.history.slice(0, 20).forEach((cmd, i) => {
          this._print(winId, `  <span class="t-dim">${String(i+1).padStart(3)}  </span><span class="t-out">${this._escape(cmd)}</span>`, '');
        });
      },

      neofetch: (winId) => {
        const lines = [
          ``,
          `  <span style="color:#0a84ff;font-size:14px;">     ██████  ██████  ██   ██</span>`,
          `  <span style="color:#0a84ff;font-size:14px;">    ██      ██   ██ ██   ██  <span class="t-success t-bold">savio@savio-os</span></span>`,
          `  <span style="color:#0a84ff;font-size:14px;">     █████  ███████ ██   ██  <span class="t-dim">──────────────</span></span>`,
          `  <span style="color:#0a84ff;font-size:14px;">        ██  ██   ██  ██ ██   <span class="t-info">OS      </span><span class="t-out">Savio OS 1.0.0</span></span>`,
          `  <span style="color:#0a84ff;font-size:14px;">    ██████  ██   ██   ███    <span class="t-info">Shell   </span><span class="t-out">zsh 5.9</span></span>`,
          `                              <span class="t-info">Theme   </span><span class="t-out">macOS Sonoma Dark</span>`,
          `                              <span class="t-info">CPU     </span><span class="t-out">Apple M-series</span>`,
          `                              <span class="t-info">Memory  </span><span class="t-out">16 GB</span>`,
          `                              <span class="t-info">User    </span><span class="t-out">Don Savio Thomas</span>`,
          ``,
        ];
        lines.forEach(l => this._print(winId, l, ''));
      },
    };
  },

  // ─── Welcome banner ──────────────────────────────────────────────────────
  _welcome() {
    return `
      <span class="t-success t-bold">Welcome to Savio OS Terminal</span> <span class="t-dim">v1.0.0</span>
      <br><span class="t-dim">Type <span class="t-info">help</span> for available commands, <span class="t-info">about</span> to learn about me.</span>
    `;
  },

  // ─── Escape HTML ─────────────────────────────────────────────────────────
  _escape(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },
};
