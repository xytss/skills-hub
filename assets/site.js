'use strict';

const REPOSITORY = 'https://github.com/xytss/skills-hub';
const ICONS = {
  hierarchy: '<rect x="9" y="2" width="6" height="5" rx="1"/><rect x="1" y="17" width="6" height="5" rx="1"/><rect x="9" y="17" width="6" height="5" rx="1"/><rect x="17" y="17" width="6" height="5" rx="1"/><path d="M12 7v10M4 17v-5h16v5"/>',
  branches: '<circle cx="6" cy="5" r="2"/><circle cx="18" cy="9" r="2"/><circle cx="18" cy="19" r="2"/><path d="M6 7v10a2 2 0 0 0 2 2h8M6 9h10"/>',
  directory: '<path d="M3 5h6l2 3h10v12H3z"/><path d="M7 12h10M7 16h7"/>',
  folder: '<path d="M20 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2Z"/>',
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
  table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10M3 15h18"/>',
  book: '<path d="M12 5C9 3 5 3 2 4v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1v15"/>',
  terminal: '<path d="m4 5 7 7-7 7M13 19h7"/>',
  external: '<path d="M14 3h7v7M21 3l-10 10M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  arrow: '<path d="M3 12h18m-6-6 6 6-6 6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  code: '<path d="m7 7-5 5 5 5m10-10 5 5-5 5M14 3l-4 18"/>',
  copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  layers: '<path d="m12 3 10 6-10 6L2 9zM2 13l10 6 10-6M2 17l10 6 10-6"/>',
  shield: '<path d="m12 3 9 4v5c0 6-9 10-9 10S3 18 3 12V7z"/><path d="m8 12 3 3 5-6"/>',
  file: '<path d="M14 2H4v20h16V8zM14 2v6h6M8 12h8M8 16h6"/>',
  message: '<path d="M21 15a2 2 0 0 1-2 2H7l-5 4V5a2 2 0 0 1 2-2h15a2 2 0 0 1 2 2Z"/><path d="M7 8h.01M12 8h.01M17 8h.01"/>',
  workflow: '<rect x="3" y="3" width="7" height="5" rx="1"/><rect x="14" y="16" width="7" height="5" rx="1"/><path d="M6 8v10h8m-3-3 3 3-3 3M10 5h8v7"/>'
};
const AGENTS = [
  { name: 'Codex', symbol: 'Cx', directory: '.agents/skills', invocation: '$database-design', docs: 'https://learn.chatgpt.com/docs/build-skills' },
  { name: 'Claude Code', symbol: 'Cl', directory: '.claude/skills', invocation: '/database-design', docs: 'https://code.claude.com/docs/en/skills' },
  { name: 'Cursor', symbol: 'Cu', directory: '.cursor/skills', invocation: '/database-design', docs: 'https://cursor.com/docs/skills' },
  { name: 'Gemini CLI', symbol: 'Ge', directory: '.gemini/skills', invocation: '请使用 database-design', docs: 'https://geminicli.com/docs/cli/skills/' },
  { name: 'GitHub Copilot', symbol: 'Gh', directory: '.copilot/skills', invocation: '请使用 database-design', docs: 'https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills' }
];
let savedAgent = null;
try { savedAgent = localStorage.getItem('skills-hub.agent'); } catch {}
const state = {
  skills: [], view: 'cards', currentSkill: null, selectedSkill: null,
  activeCategory: [], branches: new Map(), selectedAgent: Math.max(0, AGENTS.findIndex(agent => agent.name === savedAgent)), sequence: 0
};
let dialogReturnFocus = null;
const dialog = document.getElementById('skill-dialog');

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function icon(name) {
  if (['share', 'github', 'skills-hub'].includes(name)) {
    const image = element('img', `icon ${name === 'share' ? 'share-icon' : name === 'github' ? 'github-mark' : 'brand-icon'}`);
    image.src = `assets/icons/${name === 'share' ? 'showcase-jump' : name === 'github' ? 'github-mark' : 'skills-hub'}.svg`;
    image.alt = '';
    return image;
  }
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = ICONS[name] || ICONS.file;
  return svg;
}

function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach(node => node.replaceChildren(icon(node.dataset.icon)));
}

function fileUrl(path) {
  return `${REPOSITORY}/blob/main/${path.split('/').map(encodeURIComponent).join('/')}`;
}

function link(text, href, iconName) {
  const node = element('a', '', text);
  node.href = href;
  node.target = '_blank';
  node.rel = 'noopener noreferrer';
  if (iconName) node.prepend(icon(iconName));
  return node;
}

function heading(title, iconName) {
  const node = element('h3', 'info-title', title);
  node.prepend(icon(iconName));
  return node;
}

function section(title, iconName, content) {
  const node = element('section', 'info-section');
  node.append(heading(title, iconName), content);
  return node;
}

function dataTable(headers, rows, className = '') {
  const table = element('table', `data-table ${className}`.trim());
  if (headers) {
    const tr = element('tr');
    headers.forEach(text => {
      const th = element('th', '', text);
      th.scope = 'col';
      tr.append(th);
    });
    const thead = element('thead');
    thead.append(tr);
    table.append(thead);
  }
  const body = element('tbody');
  rows.forEach(row => {
    const tr = element('tr');
    row.forEach((value, i) => {
      const cell = element(!headers && i === 0 ? 'th' : 'td');
      if (!headers && i === 0) cell.scope = 'row';
      if (value instanceof Node) cell.append(value); else cell.textContent = value;
      tr.append(cell);
    });
    body.append(tr);
  });
  table.append(body);
  return table;
}

function categoryKey(path) { return JSON.stringify(path); }

function treeNode(name, path = []) {
  return { name, path, children: new Map(), skills: [], members: new Set() };
}

function buildTree(skills) {
  const root = treeNode('root');
  state.branches = new Map();
  function register(path, skill) {
    let branch = root;
    path.forEach((name, index) => {
      const parts = path.slice(0, index + 1);
      if (!branch.children.has(name)) branch.children.set(name, treeNode(name, parts));
      branch = branch.children.get(name);
      branch.members.add(skill.name);
      state.branches.set(categoryKey(parts), branch);
    });
    return branch;
  }
  skills.forEach(skill => {
    const path = skill.navigation_path;
    skill.category_paths.forEach(categoryPath => {
      const parts = categoryPath.split('/');
      const isFacet = path.every((name, index) => parts[index] === name);
      register(isFacet ? path : parts, skill);
    });
    register(path, skill).skills.push(skill);
  });
  return root;
}

function filteredSkills() {
  if (!state.activeCategory.length) return state.skills;
  const branch = state.branches.get(categoryKey(state.activeCategory));
  return state.skills.filter(skill => branch?.members.has(skill.name));
}

function syncCatalogSelection() {
  document.querySelectorAll('.category-select').forEach(button => {
    const selected = button.dataset.category === categoryKey(state.activeCategory);
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  document.querySelectorAll('.skill-open').forEach(button => {
    const selected = button.dataset.skill === state.selectedSkill?.name;
    button.classList.toggle('is-selected', selected);
    if (selected) button.setAttribute('aria-current', 'true'); else button.removeAttribute('aria-current');
  });
}

function selectCategory(path) {
  state.activeCategory = path;
  const skills = filteredSkills();
  if (!skills.some(skill => skill.name === state.selectedSkill?.name)) state.selectedSkill = skills[0] || null;
  syncCatalogSelection();
  renderWorkspace();
  renderPageInstall();
}

function skillItem(skill) {
  const li = element('li', 'skill-item');
  const button = element('button', 'skill-open');
  button.type = 'button';
  button.dataset.skill = skill.name;
  button.setAttribute('aria-haspopup', 'dialog');
  button.setAttribute('aria-label', `查看 ${skill.name} 详情`);
  button.append(icon('file'), element('strong', '', skill.name));
  button.addEventListener('click', () => openSkill(skill, button));
  li.append(button);
  return li;
}

function renderBranch(branch) {
  const li = element('li');
  const hasChildren = branch.children.size > 0 || branch.skills.length > 0;
  const row = element('div', 'tree-row');
  const children = element('ul');
  children.id = `category-${++state.sequence}`;
  if (hasChildren) {
    const toggle = element('button', 'tree-toggle');
    toggle.type = 'button';
    toggle.setAttribute('aria-label', `折叠 ${branch.name}`);
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-controls', children.id);
    toggle.append(icon('chevron'));
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      toggle.setAttribute('aria-label', `${expanded ? '展开' : '折叠'} ${branch.name}`);
      children.hidden = expanded;
    });
    row.append(toggle);
  } else row.append(element('span', 'toggle-spacer'));
  const select = element('button', 'category-select');
  select.type = 'button';
  select.dataset.category = categoryKey(branch.path);
  select.setAttribute('aria-label', `选择分类 ${branch.name}`);
  select.append(icon('folder'), element('span', '', branch.name));
  select.addEventListener('click', () => selectCategory(branch.path));
  row.append(select);
  branch.skills.forEach(skill => children.append(skillItem(skill)));
  branch.children.forEach(child => children.append(renderBranch(child)));
  li.append(row);
  if (hasChildren) li.append(children);
  return li;
}

function renderCatalog() {
  const content = document.getElementById('catalog-content');
  content.replaceChildren();
  const tree = element('ul', 'tree');
  tree.setAttribute('aria-label', '按开发领域分类的 Skill 目录');
  buildTree(state.skills).children.forEach(branch => tree.append(renderBranch(branch)));
  content.append(tree);
  syncCatalogSelection();
  renderWorkspace();
}

function skillCard(skill) {
  const card = element('article', 'skill-card');
  const head = element('div', 'skill-card-head');
  const identity = element('div', 'skill-identity');
  const symbol = element('span', 'skill-symbol');
  symbol.append(icon('database'));
  const info = element('div', 'skill-info');
  const title = element('div', 'skill-title');
  const heading = element('h3');
  const titleButton = element('button', 'skill-title-button', skill.name);
  titleButton.type = 'button';
  titleButton.setAttribute('aria-haspopup', 'dialog');
  titleButton.addEventListener('click', () => openSkill(skill, titleButton));
  heading.append(titleButton);
  title.append(heading, element('span', 'badge badge-blue', `v${skill.version}`));
  info.append(title, element('p', '', skill.description));
  identity.append(symbol, info);
  head.append(identity);
  const metadata = element('div', 'skill-metadata');
  const database = element('span', 'metadata-item');
  database.append(icon('database'), element('span', '', skill.database));
  const agents = element('span', 'metadata-item', 'Codex · Claude Code · Cursor 等');
  agents.title = AGENTS.map(agent => agent.name).join('、');
  metadata.append(database, agents);
  const actions = element('div', 'skill-actions');
  const detail = element('button', 'secondary-button', '查看详情');
  detail.type = 'button';
  detail.setAttribute('aria-haspopup', 'dialog');
  detail.addEventListener('click', () => openSkill(skill, detail));
  const install = element('button', 'primary-button', '安装');
  install.type = 'button';
  install.setAttribute('aria-label', `安装 ${skill.name}`);
  install.addEventListener('click', () => {
    state.selectedSkill = skill;
    syncCatalogSelection();
    renderPageInstall();
    navigateTo('install');
    document.getElementById('page-agent').focus({ preventScroll: true });
  });
  actions.append(detail, install);
  card.append(head, metadata, actions);
  return card;
}

function renderWorkspace() {
  const content = document.getElementById('skill-content');
  const skills = filteredSkills();
  document.getElementById('workspace-title').textContent = state.activeCategory.at(-1) || '全部 Skill';
  document.getElementById('skill-count').textContent = `${skills.length} 项 Skill`;
  content.replaceChildren();
  if (!skills.length) content.append(element('p', 'empty-state', '此分类暂无 Skill。'));
  else if (state.view === 'table') {
    const rows = skills.map(skill => {
      const button = element('button', '', skill.name);
      button.type = 'button';
      button.setAttribute('aria-haspopup', 'dialog');
      button.addEventListener('click', () => openSkill(skill, button));
      return [button, `v${skill.version}`, skill.navigation_path.at(-1), skill.database];
    });
    const wrap = element('div', 'table-scroll');
    wrap.append(dataTable(['Skill', '版本', '分类', '默认数据库'], rows));
    content.append(wrap);
  } else skills.forEach(skill => content.append(skillCard(skill)));
  document.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === state.view)));
}

function renderPageInstall() {
  const skill = state.selectedSkill;
  const panel = document.getElementById('install');
  panel.hidden = !skill;
  if (!skill) return;
  document.getElementById('install-title').textContent = `安装 ${skill.name}`;
  document.getElementById('page-install').replaceChildren(installWidget(skill, 'page'));
}

function createOverview(skill) {
  const grid = element('div', 'overview-grid');
  const main = element('div', 'overview-main');
  const aside = element('div', 'overview-aside');
  main.append(section('用途', 'book', element('p', '', skill.details.purpose)));
  const scenarioWrap = element('div', 'table-scroll');
  scenarioWrap.append(dataTable(['任务', '输入', '输出'], skill.details.scenarios.map(s => [s.name, s.input, s.output]), 'scenario-table'));
  main.append(section('输入与输出', 'table', scenarioWrap));
  const example = element('blockquote', 'example');
  example.append(icon('message'), element('span', '', skill.details.example));
  main.append(section('调用示例', 'terminal', example));
  const tags = element('div', 'tags');
  const labels = [...new Set(skill.category_paths.filter(path => path.startsWith(skill.navigation_path.join('/') + '/')).map(path => path.split('/').at(-1)))];
  labels.forEach(label => tags.append(element('span', 'tag', label)));
  main.append(section('分类', 'branches', tags));
  const workflow = element('ol', 'workflow');
  skill.details.workflow.forEach((item, index) => {
    const li = element('li');
    li.append(element('h4', '', item.title), element('p', '', item.description));
    workflow.append(li);
  });
  aside.append(section('执行流程', 'workflow', workflow));
  const principles = element('ul', 'principles');
  skill.details.principles.forEach(text => {
    const li = element('li');
    li.append(icon('check'), element('span', '', text));
    principles.append(li);
  });
  aside.append(section('设计原则', 'shield', principles));
  grid.append(main, aside);
  return grid;
}

function createSpec(skill) {
  const wrap = element('div', 'table-scroll');
  const rows = [
    ['名称', skill.name], ['中文名称', skill.title], ['版本', `v${skill.version}`],
    ['默认数据库', skill.database], ['主要分类', skill.navigation_path.join(' · ')],
    ['适用场景', skill.details.scenarios.map(s => s.name).join('、')],
    ['输入材料', skill.details.scenarios.map(s => s.input).join('；')],
    ['输出内容', skill.details.scenarios.map(s => s.output).join('；')],
    ['使用指南', link(skill.overview, fileUrl(skill.overview))],
    ['SKILL.md', link(skill.entry, fileUrl(skill.entry))], ['许可证', 'MIT']
  ];
  wrap.append(dataTable(null, rows, 'spec-table'));
  return wrap;
}

function installCommand(agent, skill) {
  return [
    `if (-not (Test-Path -LiteralPath './skills-hub')) {`,
    `  git clone '${REPOSITORY}.git'`,
    `  if ($LASTEXITCODE -ne 0) { throw 'Git clone failed' }`,
    `}`,
    `$skillRoot = Join-Path -Path ([Environment]::GetFolderPath('UserProfile')) -ChildPath '${agent.directory}'`,
    `New-Item -ItemType Directory -Path $skillRoot -Force | Out-Null`,
    `Copy-Item -LiteralPath './skills-hub/skills/${skill.name}' -Destination $skillRoot -Recurse -Force`
  ].join('\n');
}

function syncAgentWidgets() {
  document.querySelectorAll('.install-widget').forEach(widget => widget.updateAgent());
}

function installWidget(skill, prefix) {
  const widget = element('div', 'install-widget');
  const controls = element('div', 'install-controls');
  const label = element('label', 'agent-select', 'AI Agent');
  const select = element('select');
  select.id = `${prefix}-agent`;
  label.htmlFor = select.id;
  AGENTS.forEach((agent, index) => {
    const option = element('option', '', agent.name);
    option.value = String(index);
    select.append(option);
  });
  label.append(select);
  const copy = element('button', 'copy-command-button');
  copy.type = 'button';
  copy.setAttribute('aria-label', '复制安装命令');
  function resetCopy() { copy.replaceChildren(icon('copy'), element('span', '', '复制安装命令')); }
  let resetTimer = null;
  resetCopy();
  controls.append(label, copy);
  const caption = element('p', 'command-caption', 'PowerShell · 用户级安装');
  const codeBlock = element('div', 'code-block');
  const pre = element('pre');
  const code = element('code');
  pre.append(code);
  codeBlock.append(pre);
  copy.addEventListener('click', async () => {
    try {
      const copiedAgent = AGENTS[state.selectedAgent].name;
      await navigator.clipboard.writeText(code.textContent);
      copy.replaceChildren(icon('check'), element('span', '', '已复制'));
      document.getElementById('announcement').textContent = `${copiedAgent} 安装命令已复制`;
      clearTimeout(resetTimer);
      resetTimer = setTimeout(resetCopy, 1800);
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(code);
      selection.removeAllRanges();
      selection.addRange(range);
      copy.replaceChildren(element('span', '', '请按 Ctrl+C 复制'));
      document.getElementById('announcement').textContent = '请按 Ctrl+C 复制已选中的命令';
    }
  });
  const path = element('p', 'install-path');
  const invocation = element('p', 'install-invocation');
  widget.updateAgent = () => {
    const agent = AGENTS[state.selectedAgent];
    select.value = String(state.selectedAgent);
    code.textContent = installCommand(agent, skill);
    path.replaceChildren(element('span', '', '安装目录'), element('code', '', `~/${agent.directory}/${skill.name}/`));
    invocation.replaceChildren(element('span', '', '调用'), element('code', '', agent.invocation.replaceAll('database-design', skill.name)));
    clearTimeout(resetTimer);
    resetCopy();
  };
  select.addEventListener('change', () => {
    state.selectedAgent = Number(select.value);
    try { localStorage.setItem('skills-hub.agent', AGENTS[state.selectedAgent].name); } catch {}
    syncAgentWidgets();
  });
  widget.updateAgent();
  widget.append(controls, caption, codeBlock, path, invocation);
  return widget;
}

function setNavSection(section) {
  document.querySelectorAll('.site-header nav a[href^="#"]').forEach(link => {
    const active = link.hash === `#${section}`;
    link.classList.toggle('nav-active', active);
    if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
  });
}

function navigateTo(section) {
  setNavSection(section);
  if (location.hash !== `#${section}`) history.pushState(null, '', `#${section}`);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById(section).scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
}

function setTab(name, focus = false) {
  document.querySelectorAll('[data-tab]').forEach(button => {
    const selected = button.dataset.tab === name;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
    document.getElementById(`panel-${button.dataset.tab}`).hidden = !selected;
    if (selected && focus) button.focus();
  });
  dialog.querySelector('.dialog-body').scrollTop = 0;
}

function openSkill(skill, trigger = document.activeElement) {
  dialogReturnFocus = trigger;
  state.currentSkill = skill;
  state.selectedSkill = skill;
  if (!filteredSkills().some(item => item.name === skill.name)) {
    state.activeCategory = skill.navigation_path;
    renderWorkspace();
  }
  syncCatalogSelection();
  renderPageInstall();
  document.getElementById('dialog-title').textContent = skill.name;
  document.getElementById('dialog-subtitle').textContent = skill.description;
  document.getElementById('dialog-version').textContent = `v${skill.version}`;
  document.getElementById('panel-overview').replaceChildren(createOverview(skill));
  document.getElementById('panel-spec').replaceChildren(createSpec(skill));
  document.getElementById('panel-install').replaceChildren(installWidget(skill, 'dialog'));
  document.getElementById('dialog-guide').href = fileUrl(skill.overview);
  document.getElementById('dialog-source').href = fileUrl(skill.entry);
  setTab('overview');
  if (!dialog.open) dialog.showModal();
  document.body.style.overflow = 'hidden';
}

async function loadCatalog() {
  const content = document.getElementById('catalog-content');
  try {
    const response = await fetch('./catalog.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error('Catalog request failed');
    const catalog = await response.json();
    if (!Array.isArray(catalog.skills) || catalog.skills.length === 0) throw new Error('Empty catalog');
    catalog.skills.forEach(skill => {
      if (!skill.name || !skill.version || !skill.details || !Array.isArray(skill.category_paths)) throw new Error('Invalid skill metadata');
    });
    state.skills = catalog.skills;
    state.selectedSkill = state.skills[0];
    state.activeCategory = state.skills[0].navigation_path;
    document.getElementById('skill-count').textContent = `${state.skills.length} 项 Skill`;
    document.getElementById('catalog-count').textContent = `${state.skills.length} 项`;
    renderCatalog();
    renderPageInstall();
  } catch {
    const error = element('p', 'error', '目录加载失败，请重试。');
    const retry = element('button', 'retry-button', '重新加载');
    retry.type = 'button';
    retry.addEventListener('click', () => { content.replaceChildren(element('p', 'loading', '正在读取目录…')); loadCatalog(); });
    content.replaceChildren(error, retry);
  }
}

hydrateIcons();
document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => {
  state.view = button.dataset.view;
  if (state.skills.length) renderWorkspace();
}));
document.querySelectorAll('[data-tab]').forEach(button => button.addEventListener('click', () => setTab(button.dataset.tab)));
document.querySelector('.dialog-tabs').addEventListener('keydown', event => {
  const tabs = [...document.querySelectorAll('[data-tab]')];
  const current = tabs.indexOf(document.activeElement);
  if (current < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  let next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
  setTab(tabs[next].dataset.tab, true);
});
document.getElementById('close-dialog').addEventListener('click', () => dialog.close());
document.getElementById('dialog-install').addEventListener('click', () => setTab('install', true));
dialog.addEventListener('close', () => {
  document.body.style.overflow = '';
  if (dialogReturnFocus?.isConnected) dialogReturnFocus.focus({ preventScroll: true });
});
dialog.addEventListener('click', event => {
  const box = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
});
document.querySelectorAll('.site-header nav a[href^="#"]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  navigateTo(link.hash.slice(1));
}));
window.addEventListener('hashchange', () => setNavSection(location.hash === '#install' ? 'install' : 'catalog'));
setNavSection(location.hash === '#install' ? 'install' : 'catalog');
loadCatalog();
