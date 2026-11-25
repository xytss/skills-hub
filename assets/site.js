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
const state = { skills: [], view: 'tree', currentSkill: null, selectedSkill: null, sequence: 0 };
const dialog = document.getElementById('skill-dialog');

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function icon(name) {
  if (name === 'share' || name === 'github') {
    const image = element('img', name === 'share' ? 'icon share-icon' : 'icon github-mark');
    image.src = name === 'share' ? 'assets/icons/showcase-jump.svg' : 'assets/icons/github-mark.svg';
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

function treeNode(name) {
  return { name, children: new Map(), skills: [], members: new Set() };
}

function buildTree(skills) {
  const root = treeNode('root');
  skills.forEach(skill => {
    const path = skill.navigation_path || skill.category_paths[0].split('/').slice(0, -1);
    skill.category_paths.forEach(categoryPath => {
      let category = root;
      const parts = categoryPath.split('/');
      const navigation = path.every((name, index) => parts[index] === name) ? parts.slice(0, path.length) : parts;
      navigation.forEach(name => {
        if (!category.children.has(name)) category.children.set(name, treeNode(name));
        category = category.children.get(name);
        category.members.add(skill.name);
      });
    });
    let current = root;
    path.forEach(name => {
      if (!current.children.has(name)) current.children.set(name, treeNode(name));
      current = current.children.get(name);
      current.members.add(skill.name);
    });
    current.skills.push(skill);
  });
  return root;
}

function skillItem(skill) {
  const li = element('li', 'skill-item');
  const button = element('button', 'skill-open');
  button.type = 'button';
  button.setAttribute('aria-haspopup', 'dialog');
  button.setAttribute('aria-label', `查看 ${skill.name} 详情`);
  button.append(icon('folder'), element('strong', '', skill.name));
  button.classList.toggle('is-selected', state.selectedSkill?.name === skill.name);
  button.addEventListener('click', () => { state.selectedSkill = skill; renderWorkspace(); openSkill(skill); });
  li.append(button);
  return li;
}

function renderBranch(branch) {
  const li = element('li');
  const hasChildren = branch.children.size > 0 || branch.skills.length > 0;
  const button = element(hasChildren ? 'button' : 'div', hasChildren ? 'tree-row' : 'tree-row leaf-row');
  if (hasChildren) button.type = 'button';
  const children = element('ul');
  children.id = `category-${++state.sequence}`;
  if (hasChildren) {
    button.setAttribute('aria-expanded', 'true');
    button.setAttribute('aria-controls', children.id);
  }
  const chevron = element('span', 'chevron');
  if (hasChildren) chevron.append(icon('chevron'));
  button.append(chevron, icon('folder'), element('span', '', branch.name));
  branch.skills.forEach(skill => children.append(skillItem(skill)));
  branch.children.forEach(child => children.append(renderBranch(child)));
  if (hasChildren) button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    children.hidden = expanded;
  });
  li.append(button);
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
  renderWorkspace();
}

function renderWorkspace() {
  const content = document.getElementById('skill-content');
  const skill = state.selectedSkill || state.skills[0];
  document.getElementById('workspace-title').textContent = skill.navigation_path.at(-1);
  content.replaceChildren();
  if (state.view === 'table') {
    const rows = state.skills.map(skill => {
      const button = element('button', '', skill.name);
      button.type = 'button';
      button.setAttribute('aria-haspopup', 'dialog');
      button.addEventListener('click', () => openSkill(skill));
      return [button, `v${skill.version}`, skill.navigation_path.at(-1), skill.database];
    });
    const wrap = element('div', 'table-scroll');
    wrap.append(dataTable(['Skill', '版本', '分类', '默认数据库'], rows));
    content.append(wrap);
  } else {
    const card = element('article', 'skill-card');
    const head = element('div', 'skill-card-head');
    const identity = element('div', 'skill-identity');
    const symbol = element('span', 'skill-symbol');
    symbol.append(icon('database'));
    const info = element('div', 'skill-info');
    const title = element('div', 'skill-title');
    title.append(element('h3', '', skill.name), element('span', 'badge badge-blue', `v${skill.version}`));
    info.append(title, element('p', '', skill.description));
    identity.append(symbol, info);
    const actions = element('div', 'skill-actions');
    const detail = element('button', 'primary-button', '查看详情');
    detail.type = 'button';
    detail.setAttribute('aria-haspopup', 'dialog');
    detail.addEventListener('click', () => openSkill(skill));
    actions.append(link('使用指南', fileUrl(skill.overview), 'file'), link('执行规范', fileUrl(skill.entry), 'file'), detail);
    head.append(identity, actions);
    const metadata = element('div', 'skill-metadata');
    [['默认数据库', skill.database, 'database'], ['适用任务', skill.details.scenarios.map(s => s.name).join('、'), 'file']].forEach(([label, value, name]) => {
      const row = element('p');
      row.append(icon(name), element('span', 'metadata-label', `${label}：`), element('span', '', value));
      metadata.append(row);
    });
    const tags = element('div', 'skill-categories');
    skill.category_paths.filter(path => path.startsWith(skill.navigation_path.join('/') + '/')).forEach(path => {
      const tag = element('div', 'category-tag');
      tag.append(icon('hierarchy'), element('span', '', path.split('/').at(-1)));
      tags.append(tag);
    });
    card.append(head, metadata, tags);
    content.append(card);
  }
  document.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === state.view)));
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
    if (index < skill.details.workflow.length - 1) { const arrow = element('span', 'workflow-arrow'); arrow.append(icon('arrow')); li.append(arrow); }
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
    ['执行规范', link(skill.entry, fileUrl(skill.entry))], ['许可证', 'MIT']
  ];
  wrap.append(dataTable(null, rows, 'spec-table'));
  return wrap;
}

function installCommand(agent, skill) {
  const name = skill.name;
  return [
    `git clone '${REPOSITORY}.git'`,
    `$skillRoot = Join-Path -Path ([Environment]::GetFolderPath('UserProfile')) -ChildPath '${agent.directory}'`,
    `New-Item -ItemType Directory -Path $skillRoot -Force | Out-Null`,
    `Copy-Item -LiteralPath './skills-hub/skills/${name}' -Destination $skillRoot -Recurse`
  ].join('\n');
}

function installWidget(skill, prefix) {
  const compact = prefix === 'page';
  const fragment = element('div', 'install-widget');
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
  controls.append(label, element('span', 'code-label', 'PowerShell · 用户级安装'));
  const codeBlock = element('div', 'code-block');
  const pre = element('pre');
  const code = element('code');
  pre.append(code);
  const copy = element('button', 'copy-button');
  copy.type = 'button';
  copy.setAttribute('aria-label', '复制安装命令');
  copy.append(icon('copy'));
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(code.textContent);
      copy.replaceChildren(icon('check'));
      copy.setAttribute('aria-label', '已复制安装命令');
      document.getElementById('announcement').textContent = '安装命令已复制';
      setTimeout(() => {
        copy.replaceChildren(icon('copy'));
        copy.setAttribute('aria-label', '复制安装命令');
      }, 1800);
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(code);
      selection.removeAllRanges();
      selection.addRange(range);
      document.getElementById('announcement').textContent = '请按 Ctrl+C 复制已选中的命令';
      copy.setAttribute('aria-label', '请按 Ctrl+C 复制已选中的命令');
    }
  });
  codeBlock.append(pre, copy);
  const path = element('p', 'install-path');
  const invocation = element('p', 'install-path');
  function update() {
    const agent = AGENTS[Number(select.value)];
    code.textContent = compact ? `git clone '${REPOSITORY}.git'` : installCommand(agent, skill);
    if (fullCode) fullCode.textContent = installCommand(agent, skill);
    path.replaceChildren(document.createTextNode('安装目录：'), element('code', '', `~/${agent.directory}/${skill.name}/`));
    invocation.replaceChildren(document.createTextNode('调用：'), element('code', '', agent.invocation.replaceAll('database-design', skill.name)));
  }
  let fullCode = null;
  let fullDetails = null;
  if (compact) {
    fullDetails = element('details', 'full-command');
    const summary = element('summary', '', '完整安装命令');
    const complete = element('pre');
    fullCode = element('code');
    complete.append(fullCode);
    fullDetails.append(summary, complete, path, invocation);
  }
  select.addEventListener('change', update);
  update();
  fragment.append(controls, codeBlock);
  if (compact) fragment.append(fullDetails); else fragment.append(path, invocation);
  return fragment;
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

function openSkill(skill) {
  state.currentSkill = skill;
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
    document.getElementById('skill-count').textContent = `${state.skills.length} 项 Skill`;
    document.getElementById('catalog-count').textContent = `${state.skills.length} 项`;
    renderCatalog();
    document.getElementById('page-install').replaceChildren(installWidget(state.skills[0], 'page'));
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
dialog.addEventListener('close', () => { document.body.style.overflow = ''; });
dialog.addEventListener('click', event => {
  const box = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
});
loadCatalog();
