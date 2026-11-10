/**
 * applications.js – App Content Renderers
 * =========================================
 * Each function renders the HTML content of an application window.
 * Called by main.js in response to the 'app:render' custom event.
 */

// ─── App window size configs ─────────────────────────────────────────────────
window.APP_CONFIGS = {
  finder:   { title: 'Finder',   width: 820, height: 560 },
  about:    { title: 'About Me', width: 680, height: 620 },
  projects: { title: 'Projects', width: 760, height: 640 },
  terminal: { title: 'Terminal', width: 700, height: 460 },
  vscode:   { title: 'Visual Studio Code', width: 900, height: 600 },
  safari:   { title: 'Safari',   width: 820, height: 580 },
  resume:   { title: 'Resume',   width: 740, height: 680 },
  contact:  { title: 'Contact',  width: 540, height: 480 },
  github:   { title: 'GitHub',   width: 500, height: 400 },
};

// ─── Dispatch table: appId → render function ─────────────────────────────────
const RENDERERS = {
  finder:   renderFinder,
  about:    renderAbout,
  projects: renderProjects,
  terminal: renderTerminal,
  vscode:   renderVSCode,
  safari:   renderSafari,
  resume:   renderResume,
  contact:  renderContact,
  github:   renderGitHub,
  launchpad: () => { window.Launchpad?.toggle(); },
  trash:    renderTrash,
};

// Listen for app:render events from WindowManager
window.addEventListener('app:render', ({ detail: { id, appId, el } }) => {
  const contentEl = document.getElementById(`${id}-content`);
  if (!contentEl) return;

  const renderer = RENDERERS[appId];
  if (renderer) renderer(contentEl, id);
});

/* ════════════════════════════════════════════════════════════════════════════
   FINDER
   ════════════════════════════════════════════════════════════════════════════ */
function renderFinder(el, winId) {
  const C = window.CONFIG;
  const folders = [
    { name: 'Projects', icon: '📁', color: '#0a84ff', items: C.projects.map(p => ({ name: p.name, icon: '📄', type: 'project', data: p })) },
    { name: 'Skills',   icon: '📁', color: '#30d158', items: Object.entries(C.skills).map(([k,v]) => ({ name: k, icon: '📋', type: 'skill', data: v })) },
    { name: 'Education',icon: '📁', color: '#ffd60a', items: C.education.map(e => ({ name: e.degree, icon: '🎓', type: 'edu', data: e })) },
    { name: 'Personal', icon: '📁', color: '#ff9f0a', items: [{ name: 'Resume', icon: '📄', type: 'resume' }, { name: 'Portfolio', icon: '🌐', type: 'safari' }, { name: 'GitHub', icon: '🐙', type: 'github' }] },
  ];

  let currentFolder = null;
  let viewMode = 'grid';

  const render = () => {
    el.innerHTML = `
      <div class="finder-layout">
        <div class="finder-sidebar">
          <div class="finder-sidebar-section">
            <div class="finder-sidebar-label">Favorites</div>
            <div class="finder-sidebar-item ${currentFolder===null?'active':''}" data-home="true">
              <span class="fi-icon">🏠</span> Home
            </div>
            ${folders.map((f,i) => `
              <div class="finder-sidebar-item ${currentFolder?.name===f.name?'active':''}" data-fi="${i}">
                <span class="fi-icon">📁</span> ${f.name}
              </div>
            `).join('')}
          </div>
          <div class="finder-sidebar-section">
            <div class="finder-sidebar-label">Locations</div>
            <div class="finder-sidebar-item" data-loc="mac"><span class="fi-icon">💻</span> Savio's Mac</div>
            <div class="finder-sidebar-item" data-loc="github"><span class="fi-icon">🌐</span> GitHub</div>
          </div>
        </div>
        <div class="finder-content">
          <div class="finder-toolbar">
            <button class="toolbar-btn finder-back-btn" id="${winId}-back" title="Back to Home" style="font-size:14px;padding:3px 8px;cursor:pointer;">←</button>
            <div class="view-toggle">
              <div class="view-btn ${viewMode==='grid'?'active':''}" data-view="grid" title="Grid View">⊞</div>
              <div class="view-btn ${viewMode==='list'?'active':''}" data-view="list" title="List View">☰</div>
            </div>
            <input class="finder-search" placeholder="Search" id="${winId}-search" />
            <span style="color:var(--text-secondary);font-size:12px;cursor:pointer;" id="${winId}-path" title="Click to go Home">${currentFolder ? '/ ' + currentFolder.name : '/ Home'}</span>
          </div>
          <div id="${winId}-main" style="flex:1;overflow:auto;">
            ${renderFinderHome(folders, viewMode)}
          </div>
        </div>
      </div>
    `;

    // Sidebar clicks
    el.querySelectorAll('[data-fi]').forEach(item => {
      item.addEventListener('click', () => {
        currentFolder = folders[+item.dataset.fi];
        el.querySelectorAll('.finder-sidebar-item').forEach(x => x.classList.remove('active'));
        item.classList.add('active');
        updateFinderContent();
      });
    });

    el.querySelector('[data-home]')?.addEventListener('click', () => {
      currentFolder = null;
      el.querySelectorAll('.finder-sidebar-item').forEach(x => x.classList.remove('active'));
      el.querySelector('[data-home]')?.classList.add('active');
      updateFinderContent();
    });

    el.querySelector('[data-loc="mac"]')?.addEventListener('click', () => {
      currentFolder = null;
      updateFinderContent();
    });

    el.querySelector('[data-loc="github"]')?.addEventListener('click', () => {
      window.open(C.social.github, '_blank');
    });

    // Back button
    el.querySelector(`#${winId}-back`)?.addEventListener('click', () => {
      currentFolder = null;
      el.querySelectorAll('.finder-sidebar-item').forEach(x => x.classList.remove('active'));
      el.querySelector('[data-home]')?.classList.add('active');
      updateFinderContent();
    });

    // Breadcrumb path click
    el.querySelector(`#${winId}-path`)?.addEventListener('click', () => {
      currentFolder = null;
      updateFinderContent();
    });

    // View toggle
    el.querySelectorAll('[data-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        viewMode = btn.dataset.view;
        el.querySelectorAll('.view-btn').forEach(b => b.classList.toggle('active', b.dataset.view === viewMode));
        updateFinderContent();
      });
    });

    // Search
    const searchInput = el.querySelector(`#${winId}-search`);
    searchInput?.addEventListener('input', () => { updateFinderContent(searchInput.value); });
    
    bindItemEvents();
  };

  const bindItemEvents = () => {
    const main = el.querySelector(`#${winId}-main`);
    if (!main) return;

    // Double-click folder to open it in Finder
    main.querySelectorAll('[data-folder-name]').forEach(fEl => {
      fEl.addEventListener('dblclick', () => {
        const fName = fEl.dataset.folderName;
        const target = folders.find(f => f.name.toLowerCase() === fName.toLowerCase());
        if (target) {
          currentFolder = target;
          el.querySelectorAll('.finder-sidebar-item').forEach(x => x.classList.remove('active'));
          updateFinderContent();
        }
      });
    });

    // Double-click file to open associated app
    main.querySelectorAll('[data-file-type]').forEach(fEl => {
      fEl.addEventListener('dblclick', () => {
        const type = fEl.dataset.fileType;
        if (type === 'project') window.WM?.open('projects');
        else if (type === 'skill' || type === 'edu') window.WM?.open('about');
        else if (type === 'resume') window.WM?.open('resume');
        else if (type === 'safari') window.WM?.open('safari');
        else if (type === 'github') window.WM?.open('github');
      });
    });
  };

  const updateFinderContent = (query = '') => {
    const main = el.querySelector(`#${winId}-main`);
    const path = el.querySelector(`#${winId}-path`);
    if (!main) return;

    if (!currentFolder) {
      main.innerHTML = renderFinderHome(folders, viewMode, query);
      if (path) path.textContent = '/ Home';
    } else {
      const items = query
        ? currentFolder.items.filter(i => i.name.toLowerCase().includes(query.toLowerCase()))
        : currentFolder.items;
      if (path) path.textContent = `/ ${currentFolder.name}`;
      main.innerHTML = viewMode === 'grid' ? renderFinderGrid(items) : renderFinderList(items);
    }

    bindItemEvents();
  };

  render();
}

function renderFinderHome(folders, viewMode, query = '') {
  const filtered = query ? folders.filter(f => f.name.toLowerCase().includes(query.toLowerCase())) : folders;
  if (viewMode === 'list') {
    return `
      <div class="finder-list">
        <div class="finder-list-header">
          <div>Name</div><div>Items</div><div>Kind</div>
        </div>
        ${filtered.map(f => `
          <div class="finder-list-row" data-folder-name="${f.name}">
            <div class="finder-list-name"><span class="file-icon">📁</span>${f.name}</div>
            <div class="finder-list-size">${f.items.length} items</div>
            <div class="finder-list-date">Folder</div>
          </div>
        `).join('')}
      </div>`;
  }
  return `<div class="finder-grid">${filtered.map(f => `
    <div class="finder-file" data-folder-name="${f.name}" title="Double-click to open folder">
      <div class="finder-file-icon">📁</div>
      <div class="finder-file-name">${f.name}</div>
    </div>`).join('')}
  </div>`;
}

function renderFinderGrid(items) {
  return `<div class="finder-grid">${items.map(item => `
    <div class="finder-file" data-file-type="${item.type || 'generic'}" title="Double-click to open">
      <div class="finder-file-icon">${item.icon}</div>
      <div class="finder-file-name">${item.name}</div>
    </div>`).join('')}
  </div>`;
}

function renderFinderList(items) {
  return `
    <div class="finder-list">
      <div class="finder-list-header">
        <div>Name</div><div>Size</div><div>Kind</div>
      </div>
      ${items.map(item => `
        <div class="finder-list-row" data-file-type="${item.type || 'generic'}" title="Double-click to open">
          <div class="finder-list-name"><span class="file-icon">${item.icon}</span>${item.name}</div>
          <div class="finder-list-size">—</div>
          <div class="finder-list-date">${item.type ? item.type.toUpperCase() : 'Document'}</div>
        </div>`).join('')}
    </div>`;
}

/* ════════════════════════════════════════════════════════════════════════════
   ABOUT ME
   ════════════════════════════════════════════════════════════════════════════ */
function renderAbout(el) {
  const C = window.CONFIG;
  const p = C.personal;
  const interests = ['Linux', 'Cloud Computing', 'DevOps', 'Automation', 'Software Development', 'Open Source', 'AI/ML'];

  el.classList.add('scrollable');
  el.innerHTML = `
    <div class="about-app selectable">
      <div class="about-header">
        <div class="about-avatar">👨‍💻</div>
        <div>
          <div class="about-name">${p.name}</div>
          <div class="about-title">${p.title}</div>
          <div class="about-college">${p.degree} · ${p.college}</div>
        </div>
      </div>

      <div class="about-bio">${p.bio}</div>

      <div>
        <div class="about-section-title">Interests</div>
        <div class="about-interests">
          ${interests.map(i => `<span class="interest-tag">${i}</span>`).join('')}
        </div>
      </div>

      <div>
        <div class="about-section-title">Technical Skills</div>
        <div class="about-skills-grid">
          ${Object.entries(C.skills).map(([cat, skills]) => `
            <div class="skill-category">
              <div class="skill-cat-title">${cat}</div>
              <div class="skill-tags">
                ${skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div>
        <div class="about-section-title">Education</div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${C.education.map(e => `
            <div class="edu-item">
              <div class="edu-icon">${e.icon}</div>
              <div>
                <div class="edu-degree">${e.degree}</div>
                <div class="edu-institution">${e.institution}</div>
                <div class="edu-year">${e.year} · ${e.status}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

/* ════════════════════════════════════════════════════════════════════════════
   PROJECTS
   ════════════════════════════════════════════════════════════════════════════ */
function renderProjects(el) {
  const C = window.CONFIG;
  el.classList.add('scrollable');
  el.innerHTML = `
    <div class="projects-app selectable">
      <div>
        <div class="projects-header">🚀 Projects</div>
        <div class="projects-sub">A showcase of my work in AI, DevOps, and Software Engineering</div>
      </div>
      ${C.projects.map(p => `
        <div class="project-card">
          <div class="project-card-top">
            <div class="project-emoji" style="background:${p.color}22;border:1px solid ${p.color}44">
              ${p.icon}
            </div>
            <div>
              <div class="project-title">${p.name}</div>
              <div class="project-subtitle">${p.subtitle}</div>
              <span class="project-status ${p.status === 'Completed' ? 'status-completed' : 'status-progress'}">
                ${p.status === 'Completed' ? '✓' : '⏳'} ${p.status}
              </span>
            </div>
          </div>
          <div class="project-desc">${p.description}</div>
          <div class="project-tech">
            ${p.tech.map(t => `<span class="tech-badge">${t}</span>`).join('')}
          </div>
          <div class="project-links">
            <a class="proj-link github" href="${p.github}" target="_blank">
              🐙 View on GitHub
            </a>
            ${p.demo !== '#' ? `<a class="proj-link demo" href="${p.demo}" target="_blank">🌐 Live Demo</a>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/* ════════════════════════════════════════════════════════════════════════════
   TERMINAL  (delegated to terminal.js)
   ════════════════════════════════════════════════════════════════════════════ */
function renderTerminal(el, winId) {
  if (window.TerminalApp) {
    window.TerminalApp.render(el, winId);
  }
}

/* ════════════════════════════════════════════════════════════════════════════
   VS CODE
   ════════════════════════════════════════════════════════════════════════════ */
function renderVSCode(el) {
  const files = {
    'skills.py': generatePythonSkills(),
    'portfolio.js': generateJSPortfolio(),
    'Dockerfile': generateDockerfile(),
    'setup.sh': generateShellScript(),
    'README.md': generateReadme(),
  };

  const fileIcons = {
    'skills.py':     '🐍',
    'portfolio.js':  '🟡',
    'Dockerfile':    '🐳',
    'setup.sh':      '📜',
    'README.md':     '📝',
  };

  let activeFile = 'skills.py';

  const renderContent = () => {
    el.innerHTML = `
      <div class="vscode-app">
        <div class="vscode-activity">
          <div class="vscode-act-btn active" title="Explorer">📁</div>
          <div class="vscode-act-btn" title="Search">🔍</div>
          <div class="vscode-act-btn" title="Source Control">⎇</div>
          <div class="vscode-act-btn" title="Extensions">🧩</div>
        </div>
        <div class="vscode-explorer">
          <div class="vscode-explorer-title">Explorer</div>
          <div style="padding:0 0 4px 8px;font-size:11px;color:rgba(255,255,255,0.4);letter-spacing:0.04em;">📂 SAVIO-OS</div>
          ${Object.keys(files).map(f => `
            <div class="vscode-file ${f===activeFile?'active':''}" data-vf="${f}">
              <span class="vscode-file-icon">${fileIcons[f]||'📄'}</span>${f}
            </div>
          `).join('')}
        </div>
        <div class="vscode-editor-area">
          <div class="vscode-tabs" id="vscode-tabs">
            ${Object.keys(files).map(f => `
              <div class="vscode-tab ${f===activeFile?'active':''}" data-vt="${f}">
                ${fileIcons[f]||'📄'} ${f}
              </div>
            `).join('')}
          </div>
          <div class="vscode-code selectable" id="vscode-code-area">
            ${files[activeFile]}
          </div>
          <div class="vscode-statusbar">
            <span>⎇ main · ${activeFile}</span>
            <div class="vscode-statusbar-right">
              <span>Ln 1, Col 1</span>
              <span>UTF-8</span>
              <span>${activeFile.endsWith('.py') ? 'Python' : activeFile.endsWith('.js') ? 'JavaScript' : activeFile.endsWith('.sh') ? 'Shell' : 'Text'}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // File explorer clicks
    el.querySelectorAll('[data-vf]').forEach(item => {
      item.addEventListener('click', () => {
        activeFile = item.dataset.vf;
        el.querySelectorAll('.vscode-file').forEach(x => x.classList.toggle('active', x.dataset.vf === activeFile));
        el.querySelectorAll('.vscode-tab').forEach(x => x.classList.toggle('active', x.dataset.vt === activeFile));
        const codeArea = el.querySelector('#vscode-code-area');
        if (codeArea) codeArea.innerHTML = files[activeFile];
        const sb = el.querySelector('.vscode-statusbar');
        if (sb) sb.querySelector('span').textContent = `⎇ main · ${activeFile}`;
      });
    });

    // Tab clicks
    el.querySelectorAll('[data-vt]').forEach(tab => {
      tab.addEventListener('click', () => {
        activeFile = tab.dataset.vt;
        el.querySelectorAll('.vscode-tab').forEach(x => x.classList.toggle('active', x.dataset.vt === activeFile));
        el.querySelectorAll('.vscode-file').forEach(x => x.classList.toggle('active', x.dataset.vf === activeFile));
        const codeArea = el.querySelector('#vscode-code-area');
        if (codeArea) codeArea.innerHTML = files[activeFile];
      });
    });
  };

  renderContent();
}

function codeLine(num, html) {
  return `<div class="code-line"><span class="line-num">${num}</span><span class="code-text">${html}</span></div>`;
}

function generatePythonSkills() {
  const lines = [
    `<span class="cmt"># skills.py – Don Savio Thomas's Technical Profile</span>`,
    `<span class="cmt"># ═══════════════════════════════════════════════════</span>`,
    ``,
    `<span class="kw">from</span> <span class="cls">dataclasses</span> <span class="kw">import</span> dataclass`,
    `<span class="kw">from</span> <span class="cls">typing</span> <span class="kw">import</span> List, Dict`,
    ``,
    `<span class="dec">@dataclass</span>`,
    `<span class="kw">class</span> <span class="cls">Developer</span>:`,
    `    name: <span class="cls">str</span>`,
    `    role: <span class="cls">str</span>`,
    `    skills: Dict[<span class="cls">str</span>, List[<span class="cls">str</span>]]`,
    ``,
    `savio = <span class="cls">Developer</span>(`,
    `    name  = <span class="str">"Don Savio Thomas"</span>,`,
    `    role  = <span class="str">"Aspiring Software & DevOps Engineer"</span>,`,
    `    skills = {`,
    `        <span class="str">"Languages"</span>  : [<span class="str">"Python"</span>, <span class="str">"JavaScript"</span>, <span class="str">"Bash"</span>, <span class="str">"Go"</span>],`,
    `        <span class="str">"DevOps"</span>     : [<span class="str">"Docker"</span>, <span class="str">"Kubernetes"</span>, <span class="str">"Terraform"</span>],`,
    `        <span class="str">"Cloud"</span>      : [<span class="str">"AWS"</span>, <span class="str">"GCP"</span>, <span class="str">"Azure"</span>],`,
    `        <span class="str">"Frameworks"</span> : [<span class="str">"FastAPI"</span>, <span class="str">"Flask"</span>, <span class="str">"React"</span>],`,
    `    }`,
    `)`,
    ``,
    `<span class="kw">def</span> <span class="fn">get_expertise</span>(dev: <span class="cls">Developer</span>) -> <span class="cls">str</span>:`,
    `    <span class="str">"""Return a summary of developer expertise."""</span>`,
    `    total = <span class="cls">sum</span>(<span class="cls">len</span>(v) <span class="kw">for</span> v <span class="kw">in</span> dev.skills.values())`,
    `    <span class="kw">return</span> <span class="str">f"</span>{dev.name}<span class="str"> has </span>{total}<span class="str"> skills across </span>{<span class="cls">len</span>(dev.skills)}<span class="str"> domains"</span>`,
    ``,
    `<span class="kw">if</span> __name__ == <span class="str">"__main__"</span>:`,
    `    <span class="fn">print</span>(get_expertise(savio))`,
    `    <span class="cmt"># → Don Savio Thomas has 14 skills across 4 domains</span>`,
  ];
  return lines.map((l, i) => codeLine(i + 1, l)).join('');
}

function generateJSPortfolio() {
  const lines = [
    `<span class="cmt">// portfolio.js – Portfolio Configuration</span>`,
    `<span class="cmt">// ════════════════════════════════════════</span>`,
    ``,
    `<span class="kw">const</span> <span class="var">portfolio</span> = {`,
    `  <span class="var">developer</span>: <span class="str">"Don Savio Thomas"</span>,`,
    `  <span class="var">stack</span>: [<span class="str">"Python"</span>, <span class="str">"JavaScript"</span>, <span class="str">"Docker"</span>, <span class="str">"Linux"</span>],`,
    `  <span class="var">currentFocus</span>: <span class="str">"Cloud-Native Development"</span>,`,
    ``,
    `  <span class="var">projects</span>: [`,
    `    { <span class="var">name</span>: <span class="str">"NaviQ"</span>,      <span class="var">type</span>: <span class="str">"IoT/ML"</span> },`,
    `    { <span class="var">name</span>: <span class="str">"PulseShift"</span>, <span class="var">type</span>: <span class="str">"AI/NLP"</span> },`,
    `    { <span class="var">name</span>: <span class="str">"MedVision"</span>, <span class="var">type</span>: <span class="str">"Deep Learning"</span> },`,
    `    { <span class="var">name</span>: <span class="str">"Jarvis AI"</span>,  <span class="var">type</span>: <span class="str">"Voice AI"</span> },`,
    `  ],`,
    ``,
    `  <span class="fn">getStatus</span>: <span class="kw">function</span>() {`,
    `    <span class="kw">return</span> <span class="str">\`🚀 \${this.developer} · Open to opportunities\`</span>;`,
    `  }`,
    `};`,
    ``,
    `<span class="fn">console</span>.<span class="fn">log</span>(<span class="var">portfolio</span>.<span class="fn">getStatus</span>());`,
    `<span class="cmt">// → 🚀 Don Savio Thomas · Open to opportunities</span>`,
  ];
  return lines.map((l, i) => codeLine(i + 1, l)).join('');
}

function generateDockerfile() {
  const lines = [
    `<span class="cmt"># Dockerfile – Portfolio Dev Environment</span>`,
    `<span class="kw">FROM</span> <span class="str">python:3.12-slim</span>`,
    ``,
    `<span class="kw">LABEL</span> maintainer=<span class="str">"Don Savio Thomas"</span>`,
    `<span class="kw">LABEL</span> description=<span class="str">"Portfolio web server"</span>`,
    ``,
    `<span class="kw">WORKDIR</span> <span class="str">/app</span>`,
    ``,
    `<span class="cmt"># Install dependencies</span>`,
    `<span class="kw">COPY</span> requirements.txt .`,
    `<span class="kw">RUN</span> pip install --no-cache-dir -r requirements.txt`,
    ``,
    `<span class="cmt"># Copy application code</span>`,
    `<span class="kw">COPY</span> . .`,
    ``,
    `<span class="cmt"># Expose port and start server</span>`,
    `<span class="kw">EXPOSE</span> <span class="num">8000</span>`,
    ``,
    `<span class="kw">CMD</span> [<span class="str">"uvicorn"</span>, <span class="str">"main:app"</span>, <span class="str">"--host"</span>, <span class="str">"0.0.0.0"</span>, <span class="str">"--port"</span>, <span class="str">"8000"</span>]`,
  ];
  return lines.map((l, i) => codeLine(i + 1, l)).join('');
}

function generateShellScript() {
  const lines = [
    `<span class="cmt">#!/usr/bin/env bash</span>`,
    `<span class="cmt"># setup.sh – Development environment bootstrap</span>`,
    `<span class="kw">set</span> -euo pipefail`,
    ``,
    `<span class="fn">log</span>() { <span class="fn">echo</span> <span class="str">"[$(date +%H:%M:%S)] $*"</span>; }`,
    ``,
    `<span class="fn">log</span> <span class="str">"Setting up dev environment for Savio OS..."</span>`,
    ``,
    `<span class="cmt"># Update package lists</span>`,
    `<span class="fn">sudo</span> apt-get update -qq`,
    ``,
    `<span class="cmt"># Install core tools</span>`,
    `<span class="kw">for</span> pkg <span class="kw">in</span> git curl docker.io python3-pip nodejs; <span class="kw">do</span>`,
    `  <span class="fn">log</span> <span class="str">"Installing </span>$pkg<span class="str">..."</span>`,
    `  <span class="fn">sudo</span> apt-get install -y <span class="str">"$pkg"</span>`,
    `<span class="kw">done</span>`,
    ``,
    `<span class="cmt"># Clone portfolio</span>`,
    `<span class="fn">git</span> clone https://github.com/saviottt/portfolio`,
    ``,
    `<span class="fn">log</span> <span class="str">"✅ Setup complete!"</span>`,
  ];
  return lines.map((l, i) => codeLine(i + 1, l)).join('');
}

function generateReadme() {
  const lines = [
    `<span class="cmt"># 👋 Hi, I'm Don Savio Thomas</span>`,
    ``,
    `<span class="str">**B.Tech IT student at VJCET**</span>`,
    `Aspiring Software & DevOps Engineer`,
    ``,
    `<span class="cmt">## 🚀 Projects</span>`,
    ``,
    `| Project | Tech Stack | Status |`,
    `|---------|-----------|--------|`,
    `| NaviQ   | Python, BLE, ML | 🚧 |`,
    `| PulseShift | NLP, FastAPI | ✅ |`,
    `| MedVision AI | TensorFlow | ✅ |`,
    `| Jarvis AI | Whisper, LLM | 🚧 |`,
    ``,
    `<span class="cmt">## 💡 Skills</span>`,
    ``,
    `<span class="str">\`Python\` \`Docker\` \`Kubernetes\` \`AWS\` \`Linux\` \`Git\`</span>`,
    ``,
    `<span class="cmt">## 📫 Contact</span>`,
    ``,
    `GitHub: <span class="str">@saviottt</span>`,
    `LinkedIn: <span class="str">linkedin.com/in/saviottt</span>`,
  ];
  return lines.map((l, i) => codeLine(i + 1, l)).join('');
}

/* ════════════════════════════════════════════════════════════════════════════
   SAFARI
   ════════════════════════════════════════════════════════════════════════════ */
function renderSafari(el, winId) {
  const C = window.CONFIG;
  const favs = [
    { name: 'GitHub',    icon: '🐙', url: C.social.github, target: 'ext' },
    { name: 'LinkedIn',  icon: '💼', url: C.social.linkedin, target: 'ext' },
    { name: 'Projects',  icon: '🚀', action: 'projects' },
    { name: 'Resume',    icon: '📄', action: 'resume' },
    { name: 'Contact',   icon: '✉️', action: 'contact' },
    { name: 'Instagram', icon: '📸', url: C.social.instagram, target: 'ext' },
  ];

  const history = ['savio.dev/portfolio'];
  let histIdx = 0;

  const render = () => {
    const currentUrl = history[histIdx];
    el.innerHTML = `
      <div class="safari-app">
        <div class="safari-toolbar">
          <div class="safari-nav-btn ${histIdx === 0 ? 'disabled' : ''}" id="${winId}-safari-back" title="Back" style="${histIdx === 0 ? 'opacity:0.3;cursor:default;' : 'cursor:pointer;'}">←</div>
          <div class="safari-nav-btn ${histIdx >= history.length - 1 ? 'disabled' : ''}" id="${winId}-safari-fwd" title="Forward" style="${histIdx >= history.length - 1 ? 'opacity:0.3;cursor:default;' : 'cursor:pointer;'}">→</div>
          <div class="safari-nav-btn" id="${winId}-safari-reload" title="Reload" style="cursor:pointer;">↻</div>
          <div class="safari-address-bar">
            <span class="safari-lock">🔒</span>
            <input
              type="text"
              id="${winId}-safari-input"
              value="${currentUrl}"
              style="flex:1;background:none;border:none;outline:none;font-size:12px;color:var(--text-secondary);font-family:inherit;"
            />
          </div>
          <div class="safari-nav-btn" id="${winId}-safari-share" title="Share Page" style="cursor:pointer;">⬆</div>
        </div>
        <div class="safari-content" id="${winId}-safari-body">
          <div style="font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-tertiary);margin-bottom:12px;">FAVORITES</div>
          <div class="safari-favorites">
            ${favs.map(f => `
              <div class="safari-fav" data-fav-name="${f.name}" data-action="${f.action || ''}" data-url="${f.url || ''}" title="Open ${f.name}">
                <div class="safari-fav-icon">${f.icon}</div>
                <div class="safari-fav-name">${f.name}</div>
              </div>
            `).join('')}
          </div>

          <div style="font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-tertiary);margin-bottom:12px;">PORTFOLIO LINKS</div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${[
              { label: '📂 GitHub Repositories', url: C.social.github, sub: 'View all open-source projects' },
              { label: '💼 LinkedIn Profile',    url: C.social.linkedin, sub: 'Connect professionally' },
              { label: '📸 Instagram',           url: C.social.instagram, sub: 'Updates and life' },
              { label: '📧 Email Me',            url: `mailto:${C.personal.email}`, sub: C.personal.email },
            ].map(l => `
              <a href="${l.url}" target="_blank" style="display:flex;align-items:center;gap:14px;padding:12px 16px;background:var(--bg-glass);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);text-decoration:none;cursor:pointer;transition:background var(--transition-fast);"
                onmouseover="this.style.background='var(--bg-glass-hover)'"
                onmouseout="this.style.background='var(--bg-glass)'">
                <span style="font-size:22px;">${l.label.split(' ')[0]}</span>
                <div>
                  <div style="font-size:13px;font-weight:500;color:var(--text-primary);">${l.label.slice(l.label.indexOf(' ')+1)}</div>
                  <div style="font-size:11px;color:var(--text-secondary);margin-top:2px;">${l.sub}</div>
                </div>
              </a>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Back button
    el.querySelector(`#${winId}-safari-back`)?.addEventListener('click', () => {
      if (histIdx > 0) {
        histIdx--;
        render();
      }
    });

    // Forward button
    el.querySelector(`#${winId}-safari-fwd`)?.addEventListener('click', () => {
      if (histIdx < history.length - 1) {
        histIdx++;
        render();
      }
    });

    // Reload button
    el.querySelector(`#${winId}-safari-reload`)?.addEventListener('click', () => {
      const body = el.querySelector(`#${winId}-safari-body`);
      if (body) {
        body.style.opacity = '0.3';
        setTimeout(() => { body.style.opacity = '1'; }, 250);
        window.Notifications?.push('Safari', 'Page reloaded', '↻');
      }
    });

    // Share button
    el.querySelector(`#${winId}-safari-share`)?.addEventListener('click', () => {
      const url = window.location.href;
      navigator.clipboard?.writeText(url);
      window.Notifications?.push('Safari', 'Link copied to clipboard!', '🔗');
    });

    // Address input enter
    const addrInput = el.querySelector(`#${winId}-safari-input`);
    addrInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = addrInput.value.trim();
        if (val) {
          history.push(val);
          histIdx = history.length - 1;
          if (val.startsWith('http://') || val.startsWith('https://')) {
            window.open(val, '_blank');
          } else {
            window.Notifications?.push('Safari', `Navigated to ${val}`, '🌐');
          }
        }
      }
    });

    // Favorites click
    el.querySelectorAll('.safari-fav').forEach(fav => {
      fav.addEventListener('click', () => {
        const action = fav.dataset.action;
        const url = fav.dataset.url;
        if (action) {
          window.WM?.open(action);
        } else if (url && url !== '#') {
          window.open(url, '_blank');
        }
      });
    });
  };

  render();
}

/* ════════════════════════════════════════════════════════════════════════════
   RESUME
   ════════════════════════════════════════════════════════════════════════════ */
function renderResume(el) {
  const C = window.CONFIG;
  const p = C.personal;

  el.innerHTML = `
    <div class="resume-app">
      <div class="resume-toolbar">
        <span class="resume-toolbar-title">📄 ${C.resume.name}</span>
        <a class="resume-download" href="${C.resume.file}" download="${C.resume.name}">
          ⬇ Download PDF
        </a>
      </div>
      <div class="resume-preview">
        <div class="resume-page selectable">
          <div class="resume-name">${p.name}</div>
          <div class="resume-role">${p.title}</div>
          <div class="resume-contact-line">${p.email} · ${p.location} · github.com/saviottt · linkedin.com/in/saviottt</div>
          <div class="resume-divider"></div>

          <div class="resume-section-title">Education</div>
          <div class="resume-entry">
            <div class="resume-entry-title">${p.degree}</div>
            <div class="resume-entry-sub"><span>${p.college}</span><span>2022 – 2026</span></div>
            <div class="resume-entry-desc">Relevant courses: Data Structures, Operating Systems, Cloud Computing, Software Engineering, Computer Networks</div>
          </div>
          <div class="resume-divider"></div>

          <div class="resume-section-title">Projects</div>
          ${C.projects.slice(0,3).map(proj => `
            <div class="resume-entry">
              <div class="resume-entry-title">${proj.name} – ${proj.subtitle}</div>
              <div class="resume-entry-sub"><span>${proj.tech.join(', ')}</span><span>${proj.status}</span></div>
              <div class="resume-entry-desc">${proj.description}</div>
            </div>
          `).join('')}
          <div class="resume-divider"></div>

          <div class="resume-section-title">Technical Skills</div>
          <div class="resume-skills-grid">
            ${Object.entries(C.skills).slice(0,4).map(([k,v]) => `
              <div class="resume-skill-item"><strong>${k}:</strong> ${v.slice(0,4).join(', ')}</div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ════════════════════════════════════════════════════════════════════════════
   CONTACT
   ════════════════════════════════════════════════════════════════════════════ */
function renderContact(el) {
  const C = window.CONFIG;
  const links = [
    { icon: '📧', platform: 'Email',    handle: C.personal.email,   url: C.social.email },
    { icon: '🐙', platform: 'GitHub',   handle: '@saviottt',         url: C.social.github },
    { icon: '💼', platform: 'LinkedIn', handle: 'Don Savio Thomas',  url: C.social.linkedin },
    { icon: '📸', platform: 'Instagram',handle: '@saviottt',         url: C.social.instagram },
  ];

  el.innerHTML = `
    <div class="contact-app">
      <div class="contact-header">
        <div class="contact-title">👋 Get In Touch</div>
        <div class="contact-sub">I'm always open to exciting projects and opportunities.</div>
      </div>
      <div class="contact-links">
        ${links.map(l => `
          <a class="contact-card" href="${l.url}" target="_blank">
            <div class="contact-card-icon">${l.icon}</div>
            <div class="contact-card-info">
              <div class="contact-card-platform">${l.platform}</div>
              <div class="contact-card-handle">${l.handle}</div>
            </div>
          </a>
        `).join('')}
      </div>
      <div style="text-align:center;color:var(--text-secondary);font-size:12px;max-width:300px;line-height:1.6;">
        📍 Based in Kerala, India · Available for remote & hybrid roles
      </div>
    </div>
  `;
}

/* ════════════════════════════════════════════════════════════════════════════
   GITHUB
   ════════════════════════════════════════════════════════════════════════════ */
function renderGitHub(el) {
  const C = window.CONFIG;
  el.innerHTML = `
    <div class="github-app">
      <div class="github-logo">🐙</div>
      <div class="github-title">GitHub Profile</div>
      <div class="github-sub">Explore my repositories, contributions and open source work.</div>
      <a class="github-btn" href="${C.social.github}" target="_blank">
        Open GitHub ↗
      </a>
      <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:8px;">
        ${C.projects.map(p => `
          <a href="${p.github}" target="_blank" style="padding:5px 14px;background:var(--bg-glass);border:1px solid var(--border-normal);border-radius:var(--radius-full);font-size:12px;color:var(--text-secondary);text-decoration:none;cursor:pointer;transition:all var(--transition-fast);"
            onmouseover="this.style.color='var(--text-primary)'"
            onmouseout="this.style.color='var(--text-secondary)'">
            ${p.icon} ${p.name}
          </a>
        `).join('')}
      </div>
    </div>
  `;
}

/* ════════════════════════════════════════════════════════════════════════════
   TRASH
   ════════════════════════════════════════════════════════════════════════════ */
function renderTrash(el) {
  el.innerHTML = `
    <div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:32px;text-align:center;">
      <div style="font-size:72px;">🗑️</div>
      <div style="font-size:18px;font-weight:600;color:var(--text-primary);">Trash is Empty</div>
      <div style="font-size:13px;color:var(--text-secondary);max-width:260px;line-height:1.6;">
        Items you delete will be moved to Trash. Trash is currently empty.
      </div>
    </div>
  `;
}
