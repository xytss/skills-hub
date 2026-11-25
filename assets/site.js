'use strict';

const REPOSITORY = 'https://github.com/xytss/skills-hub';
const ICONS = {
  branches: '<circle cx="6" cy="5" r="2"/><circle cx="18" cy="9" r="2"/><circle cx="18" cy="19" r="2"/><path d="M6 7v10a2 2 0 0 0 2 2h8M6 9h10"/>',
  directory: '<path d="M3 5h6l2 3h10v12H3z"/><path d="M7 12h10M7 16h7"/>',
  folder: '<path d="M3 5h6l2 3h10v12H3z"/>',
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
  table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10M3 15h18"/>',
  book: '<path d="M12 5C9 3 5 3 2 4v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1v15"/>',
  terminal: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M13 15h4"/>',
  github: '<path d="M9 20c-5 1-5-2-7-2m14 4v-4a4 4 0 0 0-1-3c4 0 7-2 7-6a5 5 0 0 0-1-3 5 5 0 0 0 0-4s-2-1-5 2a15 15 0 0 0-8 0C5 1 3 2 3 2a5 5 0 0 0 0 4 5 5 0 0 0-1 3c0 4 3 6 7 6a4 4 0 0 0-1 3v4"/>',
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
  workflow: '<rect x="3" y="3" width="7" height="5" rx="1"/><rect x="14" y="16" width="7" height="5" rx="1"/><path d="M6 8v10h8m-3-3 3 3-3 3M10 5h8v7"/>'
};
const AGENTS = [
  { name: 'Codex', symbol: 'Cx', directory: '.agents/skills', invocation: '$database-design', docs: 'https://learn.chatgpt.com/docs/build-skills' },
  { name: 'Claude Code', symbol: 'Cl', directory: '.claude/skills', invocation: '/database-design', docs: 'https://code.claude.com/docs/en/skills' },
  { name: 'Cursor', symbol: 'Cu', directory: '.cursor/skills', invocation: '/database-design', docs: 'https://cursor.com/docs/skills' },
  { name: 'Gemini CLI', symbol: 'Ge', directory: '.gemini/skills', invocation: '请使用 database-design', docs: 'https://geminicli.com/docs/cli/skills/' },
  { name: 'GitHub Copilot', symbol: 'Gh', directory: '.copilot/skills', invocation: '请使用 database-design', docs: 'https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills' }
];
const state = { skills: [], view: 'tree', currentSkill: null, sequence: 0 };
const dialog = document.getElementById('skill-dialog');

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function icon(name) {
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
    skill.category_paths.forEach(categoryPath => {
      let category = root;
      categoryPath.split('/').forEach(name => {
        if (!category.children.has(name)) category.children.set(name, treeNode(name));
        category = category.children.get(name);
        category.members.add(skill.name);
      });
    });
    const path = skill.navigation_path || skill.category_paths[0].split('/').slice(0, -1);
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
  const arrow = element('span', 'open-arrow');
  arrow.append(icon('chevron'));
  button.append(icon('database'), element('strong', '', skill.name), element('span', 'badge badge-blue', `v${skill.version}`), arrow);
  button.addEventListener('click', () => openSkill(skill));
  const preview = element('div', 'skill-preview');
  preview.append(element('p', 'skill-description', skill.description));
  const table = dataTable(null, [['适用任务', skill.details.scenarios.map(scenario => scenario.name).join('、')], ['默认数据库', skill.database]], 'mini-table');
  const links = element('div', 'skill-links');
  links.append(link('使用指南', fileUrl(skill.overview), 'book'), link('执行规范', fileUrl(skill.entry), 'code'));
  preview.append(table, links);
  li.append(button, preview);
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
  const count = element('span', 'branch-count', String(branch.members.size));
  count.setAttribute('aria-label', `${branch.members.size} 项 Skill`);
  count.title = `${branch.members.size} 项 Skill`;
  button.append(chevron, icon(hasChildren ? 'folder' : 'layers'), element('span', '', branch.name), count);
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
  if (state.view === 'tree') {
    const tree = element('ul', 'tree');
    tree.setAttribute('aria-label', '按开发领域分类的 Skill 目录');
    buildTree(state.skills).children.forEach(branch => tree.append(renderBranch(branch)));
    content.append(tree);
  } else {
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
  main.append(section('调用示例', 'terminal', element('blockquote', 'example', skill.details.example)));
  const tags = element('div', 'tags');
  const labels = [...new Set(skill.category_paths.map(path => path.split('/').at(-1)))];
  labels.forEach(label => tags.append(element('span', 'tag', label)));
  main.append(section('分类', 'branches', tags));
  const workflow = element('ol', 'workflow');
  skill.details.workflow.forEach(item => {
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
    code.textContent = installCommand(agent, skill);
    path.replaceChildren(document.createTextNode('安装目录：'), element('code', '', `~/${agent.directory}/${skill.name}/`));
    invocation.replaceChildren(document.createTextNode('调用：'), element('code', '', agent.invocation.replaceAll('database-design', skill.name)));
  }
  select.addEventListener('change', update);
  update();
  fragment.append(controls, codeBlock, path, invocation);
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
    document.getElementById('skill-count').textContent = `Skills ${state.skills.length}`;
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
AGENTS.forEach(agent => {
  const li = element('li');
  const anchor = link(agent.name, agent.docs);
  anchor.prepend(element('span', 'agent-symbol', agent.symbol));
  anchor.append(icon('external'));
  li.append(anchor);
  document.getElementById('agent-list').append(li);
});
document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => {
  state.view = button.dataset.view;
  if (state.skills.length) renderCatalog();
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
