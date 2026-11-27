import { useEffect, useMemo, useRef, useState } from 'react';
import { Breadcrumb, Button, Collapse, Descriptions, Drawer, Flex, Modal, Segmented, Select, Steps, Table, Tabs, Tag, Tooltip } from 'antd';
import type { ReactNode } from 'react';
import type { Skill } from '../types';
import { REPOSITORY } from '../lib/catalog';
import { useMedia } from '../hooks/useMedia';
import { Icon } from '../components/Icon';
import { CopyButton } from '../components/CopyButton';
import { ResourceTree, type CatalogNode } from '../components/ResourceTree';
import { ResourceMetaTag } from '../components/ResourceMetaTag';

const agents = [
  { name: 'Codex', directory: '.agents/skills', invocation: '$database-design' },
  { name: 'Claude Code', directory: '.claude/skills', invocation: '/database-design' },
  { name: 'Cursor', directory: '.cursor/skills', invocation: '/database-design' },
  { name: 'Gemini CLI', directory: '.gemini/skills', invocation: '请使用 database-design' },
  { name: 'GitHub Copilot', directory: '.copilot/skills', invocation: '请使用 database-design' }
];

const publisherLabels = { official: '官方', community: '社区', project: '本仓库' };

function productVersionLabel(skill: Skill) {
  const product = skill.productVersions[0];
  return product ? `${product.scope === 'target' ? '目标 ' : ''}${product.label} ${product.version}` : null;
}
function SkillVersionTag({ skill }: { skill: Skill }) {
  return skill.skillVersion
    ? <ResourceMetaTag>Skill v{skill.skillVersion}</ResourceMetaTag>
    : <Tag className="resource-meta-tag" variant="filled" styles={{ root: { color: 'var(--muted)', backgroundColor: 'var(--surface-code)' } }}>上游未标注</Tag>;
}
function SkillSymbol({ skill }: { skill: Skill }) { return <Icon name={skill.database ? 'database' : 'code'} />; }

function ResourceLinks({ skill }: { skill: Skill }) {
  if (skill.docsUrl === skill.sourceUrl) return <a href={skill.docsUrl} target="_blank" rel="noopener noreferrer"><Icon name="book" />Skill 与接口说明<Icon name="external" /></a>;
  return <><a href={skill.docsUrl} target="_blank" rel="noopener noreferrer"><Icon name="book" />官方文档<Icon name="external" /></a><a href={skill.sourceUrl} target="_blank" rel="noopener noreferrer"><Icon name="file" />Skill 原文<Icon name="external" /></a></>;
}
function Section({ title, children }: { title: string; children: ReactNode }) { return <section className="info-section"><h3 className="info-title">{title}</h3>{children}</section>; }
function versionRows(skill: Skill): [string, ReactNode][] {
  const productRows: [string, ReactNode][] = [];
  for (const scope of ['current', 'target', 'template'] as const) {
    const products = skill.productVersions.filter(product => product.scope === scope);
    if (products.length) productRows.push([scope === 'target' ? '目标版本' : scope === 'template' ? '模板版本' : '产品版本', <Flex vertical gap={4}>{products.map(product => <a key={product.name} href={product.versionSourceUrl} target="_blank" rel="noopener noreferrer">{product.label} {product.version}</a>)}</Flex>]);
  }
  return [
    ['Skill 版本', skill.skillVersion ? <a href={skill.skillVersionSource!} target="_blank" rel="noopener noreferrer">v{skill.skillVersion}</a> : <span className="version-status-text">上游未标注</span>],
    ['适用范围', skill.compatibleVersions],
    ...productRows,
    ['核验日期', skill.verifiedAt]
  ];
}
function VersionFacts({ skill }: { skill: Skill }) {
  return <Descriptions className="resource-descriptions version-descriptions" column={1} size="small" colon={false} classNames={{ label: 'resource-field-label', content: 'resource-field-value' }} items={versionRows(skill).map(([label, children], index) => ({ key: `${label}-${index}`, label, children }))} />;
}
function RelatedSkills({ skill, skills, onSelect }: { skill: Skill; skills: Skill[]; onSelect: (skill: Skill) => void }) {
  if (!skill.relatedSkills.length) return null;
  return <Section title="相关 Skill"><ul className="related-skills">{skill.relatedSkills.map(related => {
    const target = skills.find(item => item.id === related.id)!;
    return <li key={related.id}><Button type="link" className="related-skill-button" onClick={() => onSelect(target)} aria-label={`查看 ${target.displayName}`}>{target.displayName}</Button><p>{related.reason}</p></li>;
  })}</ul></Section>;
}
function Scenarios({ skill }: { skill: Skill }) {
  return <Table className="scenario-table" size="small" bordered pagination={false} rowKey="name" columns={[{ title: '任务', dataIndex: 'name', width: '22%' }, { title: '输入', dataIndex: 'input', width: '34%' }, { title: '输出', dataIndex: 'output' }]} dataSource={skill.details.scenarios} />;
}
function Preview({ skill, skills, onRelatedSelect, onExpand, onClose }: { skill: Skill; skills: Skill[]; onRelatedSelect: (skill: Skill) => void; onExpand?: () => void; onClose?: () => void }) {
  const [name, variant] = skill.displayName.split(/(?=（)/u);
  return <aside className="panel preview-panel" aria-label={skill.displayName}>
    <header className="preview-heading"><span className="preview-symbol"><SkillSymbol skill={skill} /></span><div className="preview-identity"><h2>{name}{variant && <span className="preview-name-variant">{variant}</span>}</h2><SkillVersionTag skill={skill} /></div><div className="preview-actions">{onExpand && <Tooltip title="展开知识卡片" trigger={['hover', 'focus']}><Button className="icon-button" type="text" aria-label="展开知识卡片" icon={<Icon name="expand" />} onClick={onExpand} /></Tooltip>}{onClose && <Tooltip title="关闭知识预览" trigger={['hover', 'focus']}><Button className="icon-button" type="text" aria-label="关闭知识预览" icon={<Icon name="close" />} onClick={onClose} /></Tooltip>}</div></header>
    <div className="preview-content"><Section title="用途"><p>{skill.details.purpose}</p></Section><Section title="版本信息"><VersionFacts skill={skill} /></Section><Section title="输入与输出"><Scenarios skill={skill} /></Section><Section title="调用示例"><p className="preview-example">{skill.details.example}</p></Section><RelatedSkills skill={skill} skills={skills} onSelect={onRelatedSelect} /></div>
    <footer className="preview-footer"><ResourceLinks skill={skill} /></footer>
  </aside>;
}

function InstallWidget({ skill, skills, agentName, setAgent, mode, setMode }: { skill: Skill; skills: Skill[]; agentName: string; setAgent: (name: string) => void; mode: string; setMode: (mode: string) => void }) {
  const agent = agents.find(item => item.name === agentName)!;
  const manual = mode === 'manual';
  const local = skill.sourceRepo === 'xytss/skills-hub';
  const directory = `~/${agent.directory}/${skill.name}/`;
  const conflicts = skills.filter(item => item.name === skill.name && item.id !== skill.id);
  const replacement = conflicts.length ? `此目录与 ${conflicts.map(item => `${item.displayName}（${item.sourceRepo}）`).join('、')} 共用。本次选择 ${skill.sourceRepo}；已有同名技能时，按 ${agent.name} 的安装规范更新为所选来源，保持 SKILL.md 与配套文件来自同一来源。` : '';
  const prompt = [
    `请从 ${skill.sourceUrl} 安装 ${skill.name}，按 ${agent.name} 的 Skill 规范配置。`,
    `来源仓库：${skill.sourceRepo}。`,
    `安装目录：${directory}`,
    replacement,
    local ? '阅读仓库安装说明与 SKILL.md。' : `上游安装指引：\n${skill.installPrompt}`,
    '检查已有安装与来源，保留 SKILL.md 与配套文件，完成后返回来源、安装位置、验证结果和调用方式。'
  ].filter(Boolean).join('\n');
  const command = local ? [
    `if (-not (Test-Path -LiteralPath './skills-hub')) {`,
    `  git clone '${REPOSITORY}.git'`,
    `  if ($LASTEXITCODE -ne 0) { throw 'Git clone failed' }`,
    `}`,
    `$skillRoot = Join-Path -Path ([Environment]::GetFolderPath('UserProfile')) -ChildPath '${agent.directory}'`,
    `New-Item -ItemType Directory -Path $skillRoot -Force | Out-Null`,
    `Copy-Item -LiteralPath './skills-hub/skills/${skill.name}' -Destination $skillRoot -Recurse -Force`
  ].join('\n') : skill.installPrompt;
  const manualText = local ? command : [command, `安装目录：${directory}`, replacement].filter(Boolean).join('\n\n');
  return <div className="install-widget">
    <Flex className="install-controls" align="center" justify="space-between" gap={16} wrap><Flex className="install-options" align="center" gap={16} wrap><Segmented aria-label="安装方式" value={mode} onChange={setMode} options={[{ value: 'prompt', label: '提示词安装' }, { value: 'manual', label: '手动安装' }]} /><Flex className="install-agent" align="center" gap={8}><span>AI Agent</span><Select aria-label="AI Agent" value={agentName} onChange={setAgent} options={agents.map(agent => ({ value: agent.name, label: agent.name }))} /></Flex></Flex><CopyButton text={manual ? manualText : prompt} label={manual ? local ? '复制安装命令' : '复制安装指引' : '复制安装提示词'} /></Flex>
    <Flex className="install-location" align="center" justify="space-between" gap={8} wrap><span>安装目录 <code>{directory}</code></span>{conflicts.length > 0 && <Tooltip title={replacement} trigger={['hover', 'focus']}><span tabIndex={0} className="install-conflict">替换同名技能</span></Tooltip>}</Flex>
    {manual ? <><p className="command-caption">{local ? 'PowerShell · 用户级安装' : `上游安装指引 · ${skill.sourceRepo}`}</p><div className="code-block"><pre><code>{manualText}</code></pre></div><p className="install-invocation">调用 <code>{agent.invocation.replaceAll('database-design', skill.name)}</code></p></> : <div className="prompt-text">{prompt}</div>}
  </div>;
}

function Overview({ skill, skills, onRelatedSelect }: { skill: Skill; skills: Skill[]; onRelatedSelect: (skill: Skill) => void }) {
  const tags = [...new Set(skill.category_paths.filter(path => path.startsWith(`${skill.navigation_path.join('/')}/`)).map(path => path.split('/').at(-1)!))];
  const hasAside = skill.details.workflow.length > 0 || skill.details.principles.length > 0;
  return <div className={`overview-grid${hasAside ? '' : ' overview-single'}`}><div className="overview-main"><Section title="用途"><p>{skill.details.purpose}</p></Section><Section title="输入与输出"><Scenarios skill={skill} /></Section><Section title="调用示例"><blockquote className="example"><Icon name="message" /><span>{skill.details.example}</span></blockquote></Section><Section title={tags.length ? '分类' : '标签'}><Flex wrap gap={4}>{(tags.length ? tags : skill.tags).map(tag => <Tag key={tag}>{tag}</Tag>)}</Flex></Section><RelatedSkills skill={skill} skills={skills} onSelect={onRelatedSelect} /></div>{hasAside && <div className="overview-aside">{skill.details.workflow.length > 0 && <Section title="执行流程"><Steps orientation="vertical" size="small" current={-1} iconRender={(_, { index, components }) => <components.Icon>{index + 1}</components.Icon>} items={skill.details.workflow.map(item => ({ title: item.title, content: item.description }))} /></Section>}{skill.details.principles.length > 0 && <Section title="设计原则"><ul className="principles">{skill.details.principles.map(item => <li key={item}><Icon name="check" /><span>{item}</span></li>)}</ul></Section>}</div>}</div>;
}

function Specification({ skill }: { skill: Skill }) {
  const documentRows: [string, ReactNode][] = skill.docsUrl === skill.sourceUrl
    ? [['Skill 与接口说明', <a href={skill.docsUrl} target="_blank" rel="noopener noreferrer">{skill.docsUrl}</a>]]
    : [['官方文档', <a href={skill.docsUrl} target="_blank" rel="noopener noreferrer">{skill.docsUrl}</a>], ['Skill 原文', <a href={skill.sourceUrl} target="_blank" rel="noopener noreferrer">{skill.sourceUrl}</a>]];
  const rows: [string, ReactNode][] = [['名称', skill.name], ['显示名称', skill.title], ['技能来源', publisherLabels[skill.publisherType]], ...versionRows(skill), ['上游仓库', <a href={`https://github.com/${skill.sourceRepo}`} target="_blank" rel="noopener noreferrer">{skill.sourceRepo}</a>], ['主要分类', skill.navigation_path.join(' · ')], ['适用场景', skill.details.scenarios.map(item => item.name).join('、')], ['输入材料', skill.details.scenarios.map(item => item.input).join('；')], ['输出内容', skill.details.scenarios.map(item => item.output).join('；')], ...documentRows];
  if (skill.database) rows.splice(3, 0, ['默认数据库', skill.database]);
  if (skill.license) rows.push(['许可证', skill.license]);
  return <Flex vertical gap={16}>
    <Descriptions className="resource-descriptions specification-descriptions" size="small" bordered column={1} colon={false} classNames={{ label: 'resource-field-label', content: 'resource-field-value' }} items={rows.map(([label, children], index) => ({ key: `${label}-${index}`, label, children }))} />
    <Collapse key={skill.id} ghost size="small" styles={{ header: { padding: 0 }, body: { padding: '12px 0 0' } }} items={[{ key: 'source', label: '来源详情', children: <Descriptions className="resource-descriptions specification-descriptions" size="small" bordered column={1} colon={false} classNames={{ label: 'resource-field-label', content: 'resource-field-value' }} items={[
      { key: 'snapshot', label: '源码快照', children: <a href={skill.sourceRevision.pinnedSourceUrl} target="_blank" rel="noopener noreferrer">查看核验时的原文</a> },
      { key: 'commit', label: '提交记录', children: <a href={`https://github.com/${skill.sourceRepo}/commit/${skill.sourceRevision.commit}`} target="_blank" rel="noopener noreferrer">查看对应提交</a> }
    ]} /> }]} />
  </Flex>;
}

export default function SkillsPage({ skills }: { skills: Skill[] }) {
  const [selected, setSelected] = useState(skills[0]);
  const [category, setCategory] = useState(skills[0].navigation_path);
  const [members, setMembers] = useState(() => skills.filter(skill => skill.navigation_path.join('/') === skills[0].navigation_path.join('/')).map(skill => skill.id));
  const [view, setView] = useState(() => localStorage.getItem('skills-hub.view') === 'table' ? 'table' : 'cards');
  const [previewOpen, setPreviewOpen] = useState(true);
  const [previewRequested, setPreviewRequested] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailTab, setDetailTab] = useState('overview');
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [mode, setMode] = useState('prompt');
  const [agent, setAgent] = useState(() => {
    const saved = localStorage.getItem('skills-hub.agent');
    return agents.find(item => item.name === saved)?.name || 'Codex';
  });
  const wide = useMedia('(min-width: 1440px)');
  const small = useMedia('(max-width: 1023px)');
  const catalogAction = useRef<(() => void) | null>(null);
  const pendingDetails = useRef(false);
  const previewOpener = useRef<HTMLElement | null>(null);
  const filtered = useMemo(() => skills.filter(skill => members.includes(skill.id)), [skills, members]);
  const treeResources = useMemo(() => skills.map(skill => ({ name: skill.id, displayName: skill.displayName, navigation_path: skill.navigation_path, category_paths: skill.category_paths })), [skills]);
  useEffect(() => { document.title = 'Skills Hub · Skill 资源库'; }, []);
  function updateAgent(name: string) { setAgent(name); localStorage.setItem('skills-hub.agent', name); }
  function updateView(value: string) { setView(value); localStorage.setItem('skills-hub.view', value); }
  function openDetails(skill: Skill) {
    setSelected(skill); setDetailTab('overview'); setPreviewRequested(false);
    if (!wide && !small && previewRequested) pendingDetails.current = true;
    else setDetailsOpen(true);
  }
  function preview(skill: Skill) {
    setSelected(skill); setPreviewOpen(true);
    if (small) openDetails(skill);
    else if (!wide) { previewOpener.current = document.activeElement as HTMLElement; setPreviewRequested(true); }
  }
  function selectRelated(skill: Skill) {
    setCategory(skill.navigation_path);
    setMembers(skills.filter(item => item.navigation_path.join('/') === skill.navigation_path.join('/')).map(item => item.id));
    setSelected(skill); setDetailTab('overview'); setPreviewOpen(true);
  }
  function selectCategory(path: string[]) {
    const matching = skills.filter(skill => path.every((part, index) => skill.navigation_path[index] === part)).map(skill => skill.id);
    setCategory(path); setMembers(matching);
    if (!matching.includes(selected.id)) setSelected(skills.find(skill => matching.includes(skill.id))!);
    requestAnimationFrame(() => document.getElementById('workspace-title')!.focus());
  }
  function selectCatalog(node: CatalogNode) {
    const select = () => {
      if (node.kind === 'resource') {
        if (small) document.getElementById('catalog-toggle')!.focus();
        setCategory(node.path);
        setMembers(skills.filter(skill => skill.navigation_path.join('/') === node.path.join('/')).map(skill => skill.id));
        preview(skills.find(skill => skill.id === node.resource)!); return;
      }
      setCategory(node.path); setMembers(node.members);
      if (!node.members.includes(selected.id)) setSelected(skills.find(skill => node.members.includes(skill.id))!);
      if (small) requestAnimationFrame(() => document.getElementById('workspace-title')!.focus());
    };
    if (small) { catalogAction.current = select; setCatalogOpen(false); }
    else select();
  }
  const installProps = { skill: selected, skills, agentName: agent, setAgent: updateAgent, mode, setMode };
  const previewProps = { skill: selected, skills, onRelatedSelect: selectRelated };
  const catalog = <section className="panel catalog-panel" id="catalog"><header className="panel-heading"><h2>分类目录</h2></header><div className="catalog-content"><ResourceTree resources={treeResources} selected={selected.id} category={category} onSelect={selectCatalog} /></div></section>;
  return <main className="page">
    <div className="page-heading"><Button id="catalog-toggle" icon={<Icon name="folder" />} aria-expanded={catalogOpen} aria-controls="catalog" onClick={() => setCatalogOpen(!catalogOpen)}>分类目录</Button></div>
    <div className={`workspace${previewOpen ? '' : ' preview-hidden'}`}>
      {!small && catalog}
      <div className="workspace-main">
        <section className="panel skills-panel" aria-labelledby="workspace-title"><header className="panel-heading"><div className="heading-group">{category.length > 1 && <><Breadcrumb className="skill-breadcrumb" aria-label="上级分类" items={category.slice(0, -1).map((part, index) => ({ title: <Button type="link" className="breadcrumb-button" onClick={() => selectCategory(category.slice(0, index + 1))}>{part}</Button> }))} /><span className="breadcrumb-separator" aria-hidden="true">/</span></>}<h1 id="workspace-title" tabIndex={-1}>{category.at(-1)}</h1><ResourceMetaTag>{filtered.length} 项 Skill</ResourceMetaTag></div><Segmented aria-label="Skill 展示方式" value={view} onChange={updateView} options={[{ value: 'cards', label: '卡片', icon: <Icon name="layers" /> }, { value: 'table', label: '表格', icon: <Icon name="table" /> }]} /></header><div className="skill-content">
          {view === 'cards' ? filtered.map(skill => <article className="skill-card" key={skill.id}><div className="skill-card-head"><div className="skill-identity"><span className="skill-symbol"><SkillSymbol skill={skill} /></span><div className="skill-info"><div className="skill-title"><h3><Button type="text" className="skill-title-button" aria-label={`预览 ${skill.displayName}`} onClick={() => preview(skill)}>{skill.displayName}</Button></h3><SkillVersionTag skill={skill} /></div><p>{skill.description}</p></div></div></div><div className="skill-metadata">{skill.database ? <span className="metadata-item"><Icon name="database" />{skill.database}</span> : <Flex className="skill-tags" wrap gap={4}><Tag>{publisherLabels[skill.publisherType]}</Tag>{skill.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}</Flex>}{skill.productVersions.length > 0 && <span className="skill-product-version">{productVersionLabel(skill)}</span>}</div><div className="skill-actions"><Button onClick={() => openDetails(skill)}>展开详情</Button></div></article>) : <Table className="skills-table" size="small" pagination={false} rowKey="id" dataSource={filtered} rowClassName={skill => skill.id === selected.id ? 'is-selected' : ''} columns={[
            { title: 'Skill', dataIndex: 'name', width: '38%', render: (_, skill) => <div className="table-skill"><Button type="link" className="table-title-button" aria-label={`预览 ${skill.displayName}`} onClick={() => preview(skill)}>{skill.displayName}</Button><span className="table-database">{publisherLabels[skill.publisherType]} · {skill.tags.join(' · ')}</span></div> },
            { title: 'Skill 版本', width: '22%', render: (_, skill) => <SkillVersionTag skill={skill} /> },
            { title: '关联版本', width: '28%', render: (_, skill) => productVersionLabel(skill) ?? '—' },
            { title: '操作', width: '12%', render: (_, skill) => <Button type="link" size="small" aria-label={`在侧栏预览 ${skill.displayName}`} onClick={() => preview(skill)}>预览</Button> }
          ]} />}
        </div></section>
        <section className="panel install-panel" id="install"><header className="install-heading"><h2>安装</h2><span className="install-target">{selected.displayName}<SkillVersionTag skill={selected} /></span></header><InstallWidget {...installProps} /></section>
      </div>
      {wide && previewOpen && <Preview {...previewProps} onExpand={() => openDetails(selected)} onClose={() => setPreviewOpen(false)} />}
    </div>
    {small && <Drawer title="分类目录" placement="left" size={320} open={catalogOpen} onClose={() => setCatalogOpen(false)} focusable={{ focusTriggerAfterClose: !catalogAction.current }} afterOpenChange={open => { if (!open && catalogAction.current) { const action = catalogAction.current; catalogAction.current = null; action(); } }} className="resource-drawer skill-catalog-overlay">{catalog}</Drawer>}
    <Drawer title={selected.displayName} placement="right" size={520} open={!wide && !small && previewRequested} onClose={() => setPreviewRequested(false)} extra={<Button type="text" aria-label="展开知识卡片" icon={<Icon name="expand" />} onClick={() => openDetails(selected)}>展开详情</Button>} focusable={{ focusTriggerAfterClose: !pendingDetails.current }} afterOpenChange={open => { if (!open && pendingDetails.current) { pendingDetails.current = false; previewOpener.current!.focus(); setDetailsOpen(true); } }} className="resource-drawer skill-preview-overlay"><Preview {...previewProps} /></Drawer>
    <Modal centered className="skill-details-modal" title={<Flex align="center" gap={16}><span className="dialog-icon"><SkillSymbol skill={selected} /></span><span>{selected.displayName}</span><SkillVersionTag skill={selected} /></Flex>} open={detailsOpen} onCancel={() => setDetailsOpen(false)} width={960} footer={<div className="resource-modal-footer"><ResourceLinks skill={selected} /><Button type="link" icon={<Icon name="download" />} onClick={() => setDetailTab('install')}>安装方式</Button></div>}>
      <p className="detail-description">{selected.description}</p><Tabs activeKey={detailTab} onChange={setDetailTab} items={[{ key: 'overview', label: '概览', children: <Overview {...previewProps} /> }, { key: 'spec', label: '规格表', children: <Specification skill={selected} /> }, { key: 'install', label: '安装', children: <InstallWidget {...installProps} /> }]} />
    </Modal>
  </main>;
}
