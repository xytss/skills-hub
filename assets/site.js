'use strict';

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
  activeCategory: [], branches: new Map(), previewOpen: true, installMode: 'prompt', selectedAgent: Math.max(0, AGENTS.findIndex(agent => agent.name === savedAgent)), sequence: 0
};
let dialogReturnFocus = null;
const dialog = document.getElementById('skill-dialog');
const previewDrawer = document.getElementById('preview-drawer');
const previewPanel = document.getElementById('knowledge-preview');
const wideViewport = matchMedia('(min-width: 1440px)');
const smallViewport = matchMedia('(max-width: 1023px)');
let previewReturnFocus = null;

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
  document.querySelectorAll('[data-skill-name]').forEach(item => item.classList.toggle('is-selected', item.dataset.skillName === state.selectedSkill?.name));
}

function selectCategory(path) {
  state.activeCategory = path;
  const skills = filteredSkills();
  if (!skills.some(skill => skill.name === state.selectedSkill?.name)) state.selectedSkill = skills[0] || null;
  syncCatalogSelection();
  renderWorkspace();
  renderPageInstall();
  renderPreview();
  arrangePreview();
  if (smallViewport.matches) { toggleCatalog(false); document.getElementById('workspace-title').focus({ preventScroll: true }); }
}

function skillItem(skill) {
  const li = element('li', 'skill-item');
  const button = element('button', 'skill-open');
  button.type = 'button';
  button.dataset.skill = skill.name;
  button.setAttribute('aria-controls', 'knowledge-preview');
  button.setAttribute('aria-label', `预览 ${skill.name}`);
  button.append(icon('file'), element('strong', '', skill.name));
  button.addEventListener('click', () => showPreview(skill, button));
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
  card.dataset.skillName = skill.name;
  const head = element('div', 'skill-card-head');
  const identity = element('div', 'skill-identity');
  const symbol = element('span', 'skill-symbol');
  symbol.append(icon('database'));
  const info = element('div', 'skill-info');
  const title = element('div', 'skill-title');
  const heading = element('h3');
  const titleButton = element('button', 'skill-title-button', skill.name);
  titleButton.type = 'button';
  titleButton.setAttribute('aria-controls', 'knowledge-preview');
  titleButton.setAttribute('aria-label', `预览 ${skill.name}`);
  titleButton.addEventListener('click', () => showPreview(skill, titleButton));
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
  const detail = element('button', 'secondary-button', '展开详情');
  detail.type = 'button';
  detail.setAttribute('aria-haspopup', 'dialog');
  detail.addEventListener('click', () => openSkill(skill, detail));
  actions.append(detail);
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
      const title = element('div', 'table-skill');
      const button = element('button', '', skill.name);
      button.type = 'button';
      button.setAttribute('aria-label', `预览 ${skill.name}`);
      button.setAttribute('aria-controls', 'knowledge-preview');
      button.addEventListener('click', () => showPreview(skill, button));
      title.append(button, element('span', 'table-database', skill.database));
      const preview = element('button', 'table-preview', '预览');
      preview.type = 'button';
      preview.setAttribute('aria-label', `在侧栏预览 ${skill.name}`);
      preview.addEventListener('click', () => showPreview(skill, preview));
      return [title, skill.details.scenarios.map(item => item.name).join(' · '), element('span', 'badge badge-blue', `v${skill.version}`), preview];
    });
    const wrap = element('div', 'table-scroll');
    const table = dataTable(['Skill', '适用任务', '版本', '操作'], rows, 'catalog-table');
    table.querySelectorAll('tbody tr').forEach((row, index) => {
      row.classList.add('skill-table-row');
      row.dataset.skillName = skills[index].name;
    });
    wrap.append(table);
    content.append(wrap);
  } else skills.forEach(skill => content.append(skillCard(skill)));
  document.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === state.view)));
  syncCatalogSelection();
}

function renderPageInstall() {
  const skill = state.selectedSkill;
  const panel = document.getElementById('install');
  panel.hidden = !skill;
  if (!skill) return;
  document.getElementById('install-title').textContent = state.installMode === 'prompt' ? '安装提示词' : '手动安装';
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

function installationPrompt(agent, skill) {
  return [
    `请从 ${REPOSITORY} 安装 ${skill.name}。`,
    `阅读安装说明与 SKILL.md，按 ${agent.name} 的 Skill 规范配置。`,
    '检查已有版本，完成后返回安装位置、验证结果和调用方式。'
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
  const copy = element('button', 'copy-command-button primary-button');
  copy.type = 'button';
  function resetCopy() {
    const text = state.installMode === 'prompt' ? '复制安装提示词' : '复制安装命令';
    copy.setAttribute('aria-label', text);
    copy.replaceChildren(icon('copy'), element('span', '', text));
  }
  let resetTimer = null;
  controls.append(label, copy);
  const prompt = element('div', 'prompt-text');
  prompt.id = `${prefix}-install-prompt`;
  const caption = element('p', 'command-caption', 'PowerShell · 用户级安装');
  const codeBlock = element('div', 'code-block');
  codeBlock.id = `${prefix}-install-command`;
  const pre = element('pre');
  const code = element('code');
  pre.append(code);
  codeBlock.append(pre);
  copy.addEventListener('click', async () => {
    const manual = state.installMode === 'manual';
    const content = manual ? code : prompt;
    const text = content.textContent;
    const copiedAgent = AGENTS[state.selectedAgent].name;
    try {
      await navigator.clipboard.writeText(text);
      copy.replaceChildren(icon('check'), element('span', '', '已复制'));
      document.getElementById('announcement').textContent = `${copiedAgent} ${manual ? '安装命令' : '安装提示词'}已复制`;
      clearTimeout(resetTimer);
      resetTimer = setTimeout(resetCopy, 1800);
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(content);
      selection.removeAllRanges();
      selection.addRange(range);
      copy.replaceChildren(element('span', '', '请按 Ctrl+C 复制'));
      document.getElementById('announcement').textContent = '请按 Ctrl+C 复制已选中的内容';
    }
  });
  const path = element('p', 'install-path');
  const invocation = element('p', 'install-invocation');
  const mode = element('button', 'install-mode-button');
  mode.type = 'button';
  mode.setAttribute('aria-controls', `${prompt.id} ${codeBlock.id}`);
  mode.addEventListener('click', () => {
    state.installMode = state.installMode === 'prompt' ? 'manual' : 'prompt';
    syncAgentWidgets();
  });
  widget.updateAgent = () => {
    const agent = AGENTS[state.selectedAgent];
    const manual = state.installMode === 'manual';
    select.value = String(state.selectedAgent);
    prompt.textContent = installationPrompt(agent, skill);
    prompt.hidden = manual;
    code.textContent = installCommand(agent, skill);
    codeBlock.hidden = !manual;
    caption.hidden = !manual;
    path.hidden = !manual;
    invocation.hidden = !manual;
    path.replaceChildren(element('span', '', '安装目录'), element('code', '', `~/${agent.directory}/${skill.name}/`));
    invocation.replaceChildren(element('span', '', '调用'), element('code', '', agent.invocation.replaceAll('database-design', skill.name)));
    mode.replaceChildren(icon(manual ? 'message' : 'terminal'), document.createTextNode(manual ? '使用安装提示词' : '手动安装'));
    mode.setAttribute('aria-expanded', String(manual));
    if (prefix === 'page') document.getElementById('install-title').textContent = manual ? '手动安装' : '安装提示词';
    clearTimeout(resetTimer);
    resetCopy();
  };
  select.addEventListener('change', () => {
    state.selectedAgent = Number(select.value);
    try { localStorage.setItem('skills-hub.agent', AGENTS[state.selectedAgent].name); } catch {}
    syncAgentWidgets();
  });
  widget.updateAgent();
  widget.append(controls, prompt, caption, codeBlock, path, invocation, mode);
  return widget;
}

function updateBodyLock() {
  document.body.style.overflow = dialog.open || previewDrawer.open ? 'hidden' : '';
}

function toggleCatalog(open) {
  document.querySelector('.workspace').classList.toggle('catalog-expanded', open);
  document.getElementById('catalog-toggle').setAttribute('aria-expanded', String(open));
}

function renderPreview() {
  const skill = state.selectedSkill;
  if (!skill) { previewPanel.hidden = true; return; }
  document.getElementById('preview-title').textContent = skill.name;
  document.getElementById('preview-version').textContent = `v${skill.version}`;
  const content = document.getElementById('preview-content');
  const table = element('div', 'table-scroll');
  table.append(dataTable(['任务', '输入', '输出'], skill.details.scenarios.map(item => [item.name, item.input, item.output]), 'preview-table'));
  content.replaceChildren(
    section('用途', 'book', element('p', '', skill.details.purpose)),
    section('输入与输出', 'table', table),
    section('调用示例', 'message', element('blockquote', 'preview-example', skill.details.example))
  );
  content.scrollTop = 0;
  document.getElementById('preview-guide').href = fileUrl(skill.overview);
  document.getElementById('preview-source').href = fileUrl(skill.entry);
}

function restorePreviewFocus() {
  const origin = previewReturnFocus?.isConnected && previewReturnFocus.getClientRects().length ? previewReturnFocus : null;
  const selected = [...document.querySelectorAll('[data-skill-name]')].find(item => item.dataset.skillName === state.selectedSkill?.name);
  const fallback = selected?.querySelector('button') || document.querySelector('.skill-title-button, .table-preview');
  (origin || fallback)?.focus({ preventScroll: true });
}

function arrangePreview(requested = false) {
  const workspace = document.querySelector('.workspace');
  const visible = state.previewOpen && Boolean(state.selectedSkill);
  if (wideViewport.matches) {
    if (previewDrawer.open) previewDrawer.close();
    if (previewPanel.parentElement !== workspace) workspace.append(previewPanel);
    previewPanel.hidden = !visible;
    workspace.classList.toggle('preview-hidden', !visible);
  } else {
    if (previewPanel.parentElement !== previewDrawer) previewDrawer.append(previewPanel);
    previewPanel.hidden = !state.selectedSkill;
    workspace.classList.add('preview-hidden');
    if (!visible && previewDrawer.open) previewDrawer.close();
    if (requested && visible && !smallViewport.matches && !previewDrawer.open) previewDrawer.showModal();
  }
  updateBodyLock();
}

function showPreview(skill, trigger = document.activeElement) {
  previewReturnFocus = trigger;
  state.selectedSkill = skill;
  state.previewOpen = true;
  if (!filteredSkills().some(item => item.name === skill.name)) {
    state.activeCategory = skill.navigation_path;
    renderWorkspace();
  }
  syncCatalogSelection();
  renderPageInstall();
  renderPreview();
  if (smallViewport.matches) { arrangePreview(); openSkill(skill, trigger); }
  else arrangePreview(true);
}

function setNavSection(section) {
  document.querySelectorAll('.site-header nav a[href^="#"]').forEach(link => {
    const active = link.hash === `#${section === 'install' ? 'catalog' : section}`;
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
  renderPreview();
  arrangePreview();
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
  updateBodyLock();
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
    renderPreview();
    arrangePreview();
  } catch {
    const error = element('p', 'error', '目录加载失败，请重试。');
    const retry = element('button', 'retry-button', '重新加载');
    retry.type = 'button';
    retry.addEventListener('click', () => { content.replaceChildren(element('p', 'loading', '正在读取目录…')); loadCatalog(); });
    content.replaceChildren(error, retry);
    renderPageInstall();
    renderPreview();
    arrangePreview();
  }
}

hydrateIcons();
document.getElementById('catalog-toggle').addEventListener('click', () => toggleCatalog(document.getElementById('catalog-toggle').getAttribute('aria-expanded') !== 'true'));
document.getElementById('close-preview').addEventListener('click', () => {
  state.previewOpen = false;
  if (previewDrawer.open) previewDrawer.close();
  arrangePreview();
  restorePreviewFocus();
});
document.getElementById('expand-preview').addEventListener('click', event => {
  const trigger = previewDrawer.open ? previewReturnFocus : event.currentTarget;
  if (previewDrawer.open) previewDrawer.close();
  if (state.selectedSkill) openSkill(state.selectedSkill, trigger);
});
previewDrawer.addEventListener('cancel', () => { state.previewOpen = false; });
previewDrawer.addEventListener('close', () => {
  updateBodyLock();
  if (!dialog.open) restorePreviewFocus();
});
previewDrawer.addEventListener('click', event => {
  const box = previewDrawer.getBoundingClientRect();
  if (event.target === previewDrawer && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) { state.previewOpen = false; previewDrawer.close(); }
});
wideViewport.addEventListener('change', () => arrangePreview());
smallViewport.addEventListener('change', () => { if (smallViewport.matches && previewDrawer.open) previewDrawer.close(); arrangePreview(); });
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
  updateBodyLock();
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

const repositoryEntry = document.querySelector('.repository-entry');
const repositoryLink = repositoryEntry.querySelector('.repository-link');
repositoryLink.addEventListener('pointerenter', () => repositoryEntry.classList.remove('tooltip-dismissed'));
repositoryLink.addEventListener('focus', () => repositoryEntry.classList.remove('tooltip-dismissed'));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') repositoryEntry.classList.add('tooltip-dismissed');
});
