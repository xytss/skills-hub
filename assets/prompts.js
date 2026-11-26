'use strict';

const promptState = { prompts: [], current: null, raw: '', tab: 'document', targets: [], sections: [], activeSection: null, activeTarget: null, navigationTarget: null, downloadUrl: null, positions: { document: 0, markdown: 0 } };
const workspace = document.querySelector('.prompt-workspace');
const reader = document.querySelector('.prompt-reader');
const scrollRoot = document.getElementById('prompt-scroll');
const documentPanel = document.getElementById('panel-document');
const outlineContent = document.getElementById('outline-content');
const guide = document.getElementById('prompt-guide');
const guideDialog = document.getElementById('prompt-guide-dialog');
const smallViewport = matchMedia('(max-width: 1023px)');
let guideReturnFocus = null;
let scrollFrame = 0;
let copyFeedbackTimer = 0;

function slug(text) {
  return text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');
}

function appendInline(parent, text) {
  const tokens = /`([^`]+)`|\*\*([^*]+)\*\*/g;
  let offset = 0;
  for (const match of text.matchAll(tokens)) {
    parent.append(document.createTextNode(text.slice(offset, match.index)));
    if (match[1] !== undefined) parent.append(element('code', '', match[1]));
    else {
      const strong = element('strong');
      appendInline(strong, match[2]);
      parent.append(strong);
    }
    offset = match.index + match[0].length;
  }
  parent.append(document.createTextNode(text.slice(offset)));
}

function renderDocument(raw, labels) {
  documentPanel.replaceChildren();
  const sections = [];
  const targets = [];
  let currentSection = null;
  let lists = [];
  let ruleParents = [];
  let paragraph = null;
  for (const line of raw.replace(/\r\n/g, '\n').split('\n')) {
    if (!line.trim()) { paragraph = null; continue; }
    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      lists = [];
      ruleParents = [];
      paragraph = null;
      const node = element(`h${heading[1].length}`, '', heading[2]);
      node.id = slug(heading[2]);
      node.tabIndex = -1;
      documentPanel.append(node);
      if (heading[1].length === 2) {
        currentSection = { id: node.id, node, title: labels[sections.length], children: [] };
        sections.push(currentSection);
        targets.push(currentSection);
      }
      continue;
    }
    const bullet = /^(\s*)-\s+(.+)$/.exec(line);
    if (bullet) {
      paragraph = null;
      const depth = bullet[1].length / 2;
      lists.length = Math.min(lists.length, depth + 1);
      if (!lists[depth]) {
        const list = element('ul');
        (depth === 0 ? documentPanel : lists[depth - 1].lastElementChild).append(list);
        lists[depth] = list;
      }
      const item = element('li');
      appendInline(item, bullet[2]);
      lists[depth].append(item);
      const ruleTitle = /^\*\*([^*]+)\*\*/.exec(bullet[2]);
      if (ruleTitle) {
        const title = ruleTitle[1].replace(/[:：]$/, '');
        const id = `${currentSection.id}-${slug(title)}`;
        item.id = id;
        item.tabIndex = -1;
        const parent = depth === 0 ? currentSection : ruleParents[depth - 1];
        const rule = { id, title, node: item, section: currentSection, parent, children: [] };
        parent.children.push(rule);
        ruleParents[depth] = rule;
        ruleParents.length = depth + 1;
        targets.push(rule);
      }
      continue;
    }
    lists = [];
    if (!paragraph) { paragraph = element('p'); documentPanel.append(paragraph); }
    else paragraph.append(document.createTextNode(' '));
    appendInline(paragraph, line);
  }
  promptState.sections = sections;
  promptState.targets = targets;
}

function disclosure(title, children, expanded) {
  const toggle = element('button', 'tree-toggle');
  toggle.type = 'button';
  toggle.setAttribute('aria-controls', children.id);
  toggle.append(icon('chevron'));
  toggle.update = open => {
    children.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', `${open ? '折叠' : '展开'} ${title}`);
  };
  toggle.update(expanded);
  toggle.addEventListener('click', () => toggle.update(children.hidden));
  return toggle;
}

function renderOutline() {
  outlineContent.replaceChildren();
  const list = element('ul', 'outline-list');
  function branch(entry, expanded) {
    const item = element('li');
    const row = element('div', 'outline-row');
    if (entry.children.length) {
      const children = element('ul');
      children.id = `outline-children-${entry.id}`;
      entry.toggle = disclosure(entry.title, children, expanded);
      row.append(entry.toggle);
      entry.children.forEach(child => children.append(branch(child, false)));
      item.append(children);
    } else row.append(element('span', 'toggle-spacer'));
    const anchor = element('a', 'outline-link', entry.title);
    anchor.href = `#${entry.id}`;
    anchor.addEventListener('click', event => { event.preventDefault(); navigateToTarget(entry.id, true); });
    entry.link = anchor;
    row.append(anchor);
    item.prepend(row);
    return item;
  }
  promptState.sections.forEach((section, index) => list.append(branch(section, index === 0)));
  outlineContent.append(list);
}

function setActiveTarget(entry) {
  for (const target of promptState.targets) {
    if (target === entry) target.link.setAttribute('aria-current', 'location');
    else target.link.removeAttribute('aria-current');
  }
  const section = entry.section || entry;
  if (section !== promptState.activeSection) {
    promptState.sections.forEach(item => item.toggle.update(item === section));
    promptState.activeSection = section;
  }
  if (entry !== promptState.activeTarget) {
    let parent = entry.parent;
    while (parent) { parent.toggle.update(true); parent = parent.parent; }
    promptState.activeTarget = entry;
  }
}

function syncOutline() {
  if (promptState.tab !== 'document' || !promptState.targets.length) return;
  if (promptState.navigationTarget) { setActiveTarget(promptState.navigationTarget); return; }
  const top = smallViewport.matches ? 20 : scrollRoot.getBoundingClientRect().top + 20;
  let active = promptState.targets[0];
  for (const entry of promptState.targets) {
    if (entry.node.getBoundingClientRect().top <= top + 4) active = entry;
    else break;
  }
  setActiveTarget(active);
}

function queueOutlineSync() {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => { scrollFrame = 0; syncOutline(); });
}

function setPromptTab(tab, focus = false) {
  promptState.navigationTarget = null;
  const root = smallViewport.matches ? window : scrollRoot;
  promptState.positions[promptState.tab] = smallViewport.matches ? window.scrollY : scrollRoot.scrollTop;
  promptState.tab = tab;
  document.querySelectorAll('[data-prompt-tab]').forEach(button => {
    const selected = button.dataset.promptTab === tab;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
    document.getElementById(button.getAttribute('aria-controls')).hidden = !selected;
    if (selected && focus) button.focus();
  });
  root.scrollTo({ top: promptState.positions[tab], behavior: 'instant' });
  queueOutlineSync();
}

function navigateToTarget(id, updateHistory) {
  const entry = promptState.targets.find(target => target.id === id);
  if (!entry) return;
  if (promptState.tab !== 'document') setPromptTab('document');
  workspace.classList.remove('catalog-expanded');
  document.getElementById('prompt-catalog-toggle').setAttribute('aria-expanded', 'false');
  const root = smallViewport.matches ? window : scrollRoot;
  const top = entry.node.getBoundingClientRect().top + (smallViewport.matches ? window.scrollY - 20 : scrollRoot.scrollTop - scrollRoot.getBoundingClientRect().top - 20);
  promptState.navigationTarget = entry;
  root.scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  setActiveTarget(entry);
  if (updateHistory) history.pushState(null, '', `?prompt=${encodeURIComponent(promptState.current.name)}#${encodeURIComponent(id)}`);
  entry.node.focus({ preventScroll: true });
}

function renderCatalog() {
  const root = { children: new Map(), prompts: [] };
  promptState.prompts.forEach(prompt => {
    let current = root;
    prompt.navigation_path.forEach(name => {
      if (!current.children.has(name)) current.children.set(name, { name, children: new Map(), prompts: [] });
      current = current.children.get(name);
    });
    current.prompts.push(prompt);
  });
  let sequence = 0;
  function branch(data) {
    const item = element('li');
    const row = element('div', 'tree-row');
    const children = element('ul');
    children.id = `prompt-category-${++sequence}`;
    const toggle = disclosure(data.name, children, true);
    const label = element('button', 'category-select');
    label.type = 'button';
    if (data.prompts.some(prompt => prompt.name === promptState.current.name)) label.classList.add('is-active');
    label.append(icon('folder'), element('span', '', data.name));
    label.addEventListener('click', () => toggle.update(children.hidden));
    row.append(toggle, label);
    data.children.forEach(child => children.append(branch(child)));
    data.prompts.forEach(prompt => {
      const leaf = element('li');
      const anchor = element('a', `skill-open${prompt.name === promptState.current.name ? ' is-selected' : ''}`);
      anchor.href = `?prompt=${encodeURIComponent(prompt.name)}`;
      if (prompt.name === promptState.current.name) anchor.setAttribute('aria-current', 'page');
      anchor.append(icon('prompt'), element('strong', '', prompt.name));
      leaf.append(anchor);
      children.append(leaf);
    });
    item.append(row, children);
    return item;
  }
  const tree = element('ul', 'tree');
  tree.setAttribute('aria-label', '按领域分类的提示词目录');
  root.children.forEach(data => tree.append(branch(data)));
  document.getElementById('prompt-catalog').replaceChildren(tree);
}

function renderMetadata(prompt) {
  document.title = `${prompt.name} · 全局提示词 · Skills Hub`;
  document.getElementById('prompt-title').textContent = prompt.name;
  document.getElementById('prompt-environment').textContent = `${prompt.agent} / ${prompt.system} / ${prompt.shell}`;
  document.getElementById('prompt-description').textContent = prompt.description;
  const rows = [['工具', prompt.agent], ['系统', prompt.system], ['终端', prompt.shell]].map(([label, value]) => {
    const row = element('tr');
    const heading = element('th', '', label);
    heading.scope = 'row';
    row.append(heading, element('td', '', value));
    return row;
  });
  document.getElementById('guide-environment').replaceChildren(...rows);
  document.getElementById('prompt-tags').replaceChildren(...prompt.tags.map(tag => element('span', `prompt-tag${prompt.featured_tags.includes(tag) ? ' is-feature' : ''}`, tag)));
  document.getElementById('prompt-source').href = fileUrl(prompt.entry);
  document.getElementById('prompt-original-link').href = fileUrl(prompt.entry);
  document.getElementById('prompt-guide-link').href = fileUrl(prompt.overview);
}

async function loadPrompt() {
  const response = await fetch('./catalog.json');
  if (!response.ok) throw new Error(`目录读取失败：HTTP ${response.status}`);
  const catalog = await response.json();
  promptState.prompts = catalog.prompts;
  const name = new URLSearchParams(location.search).get('prompt') || promptState.prompts[0].name;
  const prompt = promptState.prompts.find(item => item.name === name);
  if (!prompt) throw new Error(`提示词不存在：${name}`);
  const source = await fetch(prompt.entry);
  if (!source.ok) throw new Error(`提示词读取失败：HTTP ${source.status}`);
  promptState.current = prompt;
  promptState.raw = await source.text();
  renderMetadata(prompt);
  renderCatalog();
  renderDocument(promptState.raw, prompt.outline_labels);
  renderOutline();
  document.getElementById('prompt-markdown').textContent = promptState.raw;
  promptState.downloadUrl = URL.createObjectURL(new Blob([promptState.raw], { type: 'text/markdown;charset=utf-8' }));
  const download = document.getElementById('download-prompt');
  download.href = promptState.downloadUrl;
  download.download = `${prompt.name}.md`;
  document.getElementById('copy-prompt').disabled = false;
  reader.setAttribute('aria-busy', 'false');
  if (location.hash) navigateToTarget(decodeURIComponent(location.hash.slice(1)), false);
  else syncOutline();
}

hydrateIcons();
document.querySelectorAll('[data-prompt-tab]').forEach(button => button.addEventListener('click', () => setPromptTab(button.dataset.promptTab)));
document.querySelector('.prompt-tabs').addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const tabs = [...document.querySelectorAll('[data-prompt-tab]')];
  const current = tabs.indexOf(document.activeElement);
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (current + 1) % tabs.length;
  setPromptTab(tabs[next].dataset.promptTab, true);
});
document.getElementById('copy-prompt').addEventListener('click', async event => {
  const button = event.currentTarget;
  const label = button.lastElementChild;
  clearTimeout(copyFeedbackTimer);
  try {
    await navigator.clipboard.writeText(promptState.raw);
    button.firstElementChild.replaceChildren(icon('check'));
    label.textContent = '已复制';
    document.getElementById('announcement').textContent = '已复制完整提示词';
  } catch (error) {
    label.textContent = '复制失败';
    document.getElementById('announcement').textContent = `复制失败：${error.message}`;
    console.error(error);
  }
  copyFeedbackTimer = setTimeout(() => { button.firstElementChild.replaceChildren(icon('copy')); label.textContent = '复制全文'; }, 2000);
});
document.getElementById('prompt-catalog-toggle').addEventListener('click', event => {
  const open = workspace.classList.toggle('catalog-expanded');
  event.currentTarget.setAttribute('aria-expanded', String(open));
});
function openGuide(event) {
  guideReturnFocus = event.currentTarget;
  guideDialog.append(guide);
  guideDialog.showModal();
  document.getElementById('close-prompt-guide').focus();
}
document.getElementById('prompt-guide-toggle').addEventListener('click', openGuide);
document.getElementById('expand-prompt-guide').addEventListener('click', openGuide);
document.getElementById('close-prompt-guide').addEventListener('click', () => guideDialog.close());
guideDialog.addEventListener('close', () => { workspace.append(guide); guideReturnFocus.focus(); });
guideDialog.addEventListener('click', event => { if (event.target === guideDialog) { const box = guideDialog.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) guideDialog.close(); } });
scrollRoot.addEventListener('scroll', queueOutlineSync, { passive: true });
window.addEventListener('scroll', queueOutlineSync, { passive: true });
function releaseNavigationTarget() { promptState.navigationTarget = null; }
function finishNavigation() {
  if (!promptState.navigationTarget) return;
  cancelAnimationFrame(scrollFrame);
  scrollFrame = 0;
  setActiveTarget(promptState.navigationTarget);
  releaseNavigationTarget();
}
scrollRoot.addEventListener('scrollend', finishNavigation);
window.addEventListener('scrollend', finishNavigation);
document.addEventListener('wheel', releaseNavigationTarget, { passive: true });
document.addEventListener('touchstart', releaseNavigationTarget, { passive: true });
scrollRoot.addEventListener('pointerdown', releaseNavigationTarget);
document.addEventListener('keydown', event => { if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) releaseNavigationTarget(); });
window.addEventListener('resize', queueOutlineSync);
window.addEventListener('hashchange', () => {
  if (location.hash) navigateToTarget(decodeURIComponent(location.hash.slice(1)), false);
  else (smallViewport.matches ? window : scrollRoot).scrollTo({ top: 0, behavior: 'instant' });
});
window.addEventListener('pagehide', event => { if (!event.persisted && promptState.downloadUrl) URL.revokeObjectURL(promptState.downloadUrl); });
const repositoryEntry = document.querySelector('.repository-entry');
const repositoryLink = repositoryEntry.querySelector('.repository-link');
repositoryLink.addEventListener('pointerenter', () => repositoryEntry.classList.remove('tooltip-dismissed'));
repositoryLink.addEventListener('focus', () => repositoryEntry.classList.remove('tooltip-dismissed'));
document.addEventListener('keydown', event => { if (event.key === 'Escape') repositoryEntry.classList.add('tooltip-dismissed'); });
loadPrompt().catch(error => {
  reader.setAttribute('aria-busy', 'false');
  documentPanel.replaceChildren(element('p', 'error', error.message));
  document.getElementById('prompt-catalog').replaceChildren(element('p', 'error', '提示词加载失败'));
  document.getElementById('announcement').textContent = error.message;
  console.error(error);
});
