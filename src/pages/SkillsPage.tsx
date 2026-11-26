import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Descriptions, Drawer, Flex, Modal, Segmented, Select, Steps, Table, Tabs, Tag, Tooltip } from 'antd';
import type { ReactNode } from 'react';
import type { Skill } from '../types';
import { REPOSITORY, fileUrl } from '../lib/catalog';
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

function ResourceLinks({ skill }: { skill: Skill }) {
  return <><a href={fileUrl(skill.overview)} target="_blank" rel="noopener noreferrer"><Icon name="book" />使用指南<Icon name="external" /></a><a href={fileUrl(skill.entry)} target="_blank" rel="noopener noreferrer"><Icon name="file" />SKILL.md<Icon name="external" /></a></>;
}
function Section({ title, children }: { title: string; children: ReactNode }) { return <section className="info-section"><h3 className="info-title">{title}</h3>{children}</section>; }
function Scenarios({ skill }: { skill: Skill }) {
  return <Table className="scenario-table" size="small" bordered pagination={false} rowKey="name" columns={[{ title: '任务', dataIndex: 'name', width: '22%' }, { title: '输入', dataIndex: 'input', width: '34%' }, { title: '输出', dataIndex: 'output' }]} dataSource={skill.details.scenarios} />;
}
function Preview({ skill, onExpand, onClose }: { skill: Skill; onExpand?: () => void; onClose?: () => void }) {
  return <aside className="panel preview-panel" aria-label={skill.name}>
    <header className="preview-heading"><span className="preview-symbol"><Icon name="database" /></span><div className="preview-identity"><h2>{skill.name}</h2><ResourceMetaTag>v{skill.version}</ResourceMetaTag></div><div className="preview-actions">{onExpand && <Tooltip title="展开知识卡片" trigger={['hover', 'focus']}><Button className="icon-button" type="text" aria-label="展开知识卡片" icon={<Icon name="expand" />} onClick={onExpand} /></Tooltip>}{onClose && <Tooltip title="关闭知识预览" trigger={['hover', 'focus']}><Button className="icon-button" type="text" aria-label="关闭知识预览" icon={<Icon name="close" />} onClick={onClose} /></Tooltip>}</div></header>
    <div className="preview-content"><Section title="用途"><p>{skill.details.purpose}</p></Section><Section title="输入与输出"><Scenarios skill={skill} /></Section><Section title="调用示例"><p className="preview-example">{skill.details.example}</p></Section></div>
    <footer className="preview-footer"><ResourceLinks skill={skill} /></footer>
  </aside>;
}

function InstallWidget({ skill, agentName, setAgent, mode, setMode }: { skill: Skill; agentName: string; setAgent: (name: string) => void; mode: string; setMode: (mode: string) => void }) {
  const agent = agents.find(item => item.name === agentName)!;
  const manual = mode === 'manual';
  const prompt = `请从 ${REPOSITORY} 安装 ${skill.name}。\n阅读安装说明与 SKILL.md，按 ${agent.name} 的 Skill 规范配置。\n检查已有版本，完成后返回安装位置、验证结果和调用方式。`;
  const command = [
    `if (-not (Test-Path -LiteralPath './skills-hub')) {`,
    `  git clone '${REPOSITORY}.git'`,
    `  if ($LASTEXITCODE -ne 0) { throw 'Git clone failed' }`,
    `}`,
    `$skillRoot = Join-Path -Path ([Environment]::GetFolderPath('UserProfile')) -ChildPath '${agent.directory}'`,
    `New-Item -ItemType Directory -Path $skillRoot -Force | Out-Null`,
    `Copy-Item -LiteralPath './skills-hub/skills/${skill.name}' -Destination $skillRoot -Recurse -Force`
  ].join('\n');
  return <div className="install-widget">
    <Flex className="install-controls" align="center" justify="space-between" gap={16} wrap><Flex align="center" gap={12}><span>AI Agent</span><Select aria-label="AI Agent" value={agentName} onChange={setAgent} options={agents.map(agent => ({ value: agent.name, label: agent.name }))} /></Flex><CopyButton text={manual ? command : prompt} label={manual ? '复制安装命令' : '复制安装提示词'} /></Flex>
    {manual ? <><p className="command-caption">PowerShell · 用户级安装</p><div className="code-block"><pre><code>{command}</code></pre></div><p className="install-path">安装目录 <code>~/{agent.directory}/{skill.name}/</code></p><p className="install-invocation">调用 <code>{agent.invocation.replaceAll('database-design', skill.name)}</code></p></> : <div className="prompt-text">{prompt}</div>}
    <Button type="link" className="install-mode-button" icon={<Icon name={manual ? 'message' : 'terminal'} />} aria-expanded={manual} onClick={() => setMode(manual ? 'prompt' : 'manual')}>{manual ? '使用安装提示词' : '手动安装'}</Button>
  </div>;
}

function Overview({ skill }: { skill: Skill }) {
  const tags = [...new Set(skill.category_paths.filter(path => path.startsWith(`${skill.navigation_path.join('/')}/`)).map(path => path.split('/').at(-1)!))];
  return <div className="overview-grid"><div className="overview-main"><Section title="用途"><p>{skill.details.purpose}</p></Section><Section title="输入与输出"><Scenarios skill={skill} /></Section><Section title="调用示例"><blockquote className="example"><Icon name="message" /><span>{skill.details.example}</span></blockquote></Section><Section title="分类"><Flex wrap gap={4}>{tags.map(tag => <Tag key={tag}>{tag}</Tag>)}</Flex></Section></div><div className="overview-aside"><Section title="执行流程"><Steps orientation="vertical" size="small" current={-1} items={skill.details.workflow.map(item => ({ title: item.title, content: item.description }))} /></Section><Section title="设计原则"><ul className="principles">{skill.details.principles.map(item => <li key={item}><Icon name="check" /><span>{item}</span></li>)}</ul></Section></div></div>;
}

function Specification({ skill }: { skill: Skill }) {
  const rows: [string, ReactNode][] = [['名称', skill.name], ['中文名称', skill.title], ['版本', `v${skill.version}`], ['默认数据库', skill.database], ['主要分类', skill.navigation_path.join(' · ')], ['适用场景', skill.details.scenarios.map(item => item.name).join('、')], ['输入材料', skill.details.scenarios.map(item => item.input).join('；')], ['输出内容', skill.details.scenarios.map(item => item.output).join('；')], ['使用指南', <a href={fileUrl(skill.overview)} target="_blank" rel="noopener noreferrer">{skill.overview}</a>], ['SKILL.md', <a href={fileUrl(skill.entry)} target="_blank" rel="noopener noreferrer">{skill.entry}</a>], ['许可证', 'MIT']];
  return <Descriptions className="resource-descriptions specification-descriptions" size="small" bordered column={1} colon={false} classNames={{ label: 'resource-field-label', content: 'resource-field-value' }} items={rows.map(([label, children]) => ({ key: label, label, children }))} />;
}

export default function SkillsPage({ skills }: { skills: Skill[] }) {
  const [selected, setSelected] = useState(skills[0]);
  const [category, setCategory] = useState(skills[0].navigation_path);
  const [members, setMembers] = useState(skills.map(skill => skill.name));
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
  const filtered = useMemo(() => skills.filter(skill => members.includes(skill.name)), [skills, members]);
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
  function selectCatalog(node: CatalogNode) {
    const select = () => {
      if (node.kind === 'resource') {
        if (small) document.getElementById('catalog-toggle')!.focus();
        preview(skills.find(skill => skill.name === node.resource)!); return;
      }
      setCategory(node.path); setMembers(node.members);
      if (!node.members.includes(selected.name)) setSelected(skills.find(skill => node.members.includes(skill.name))!);
      if (small) requestAnimationFrame(() => document.getElementById('workspace-title')!.focus());
    };
    if (small) { catalogAction.current = select; setCatalogOpen(false); }
    else select();
  }
  const installProps = { skill: selected, agentName: agent, setAgent: updateAgent, mode, setMode };
  const catalog = <section className="panel catalog-panel" id="catalog"><header className="panel-heading"><h2>分类目录</h2></header><div className="catalog-content"><ResourceTree resources={skills} selected={selected.name} category={category} onSelect={selectCatalog} /></div></section>;
  return <main className="page">
    <div className="page-heading"><Button id="catalog-toggle" icon={<Icon name="folder" />} aria-expanded={catalogOpen} aria-controls="catalog" onClick={() => setCatalogOpen(!catalogOpen)}>分类目录</Button></div>
    <div className={`workspace${previewOpen ? '' : ' preview-hidden'}`}>
      {!small && catalog}
      <div className="workspace-main">
        <section className="panel skills-panel" aria-labelledby="workspace-title"><header className="panel-heading"><div className="heading-group"><h1 id="workspace-title" tabIndex={-1}>{category.at(-1) || '全部 Skill'}</h1><ResourceMetaTag>{filtered.length} 项 Skill</ResourceMetaTag></div><Segmented aria-label="Skill 展示方式" value={view} onChange={updateView} options={[{ value: 'cards', label: '卡片', icon: <Icon name="layers" /> }, { value: 'table', label: '表格', icon: <Icon name="table" /> }]} /></header><div className="skill-content">
          {view === 'cards' ? filtered.map(skill => <article className="skill-card" key={skill.name}><div className="skill-card-head"><div className="skill-identity"><span className="skill-symbol"><Icon name="database" /></span><div className="skill-info"><div className="skill-title"><h3><Button type="text" className="skill-title-button" aria-label={`预览 ${skill.name}`} onClick={() => preview(skill)}>{skill.name}</Button></h3><ResourceMetaTag>v{skill.version}</ResourceMetaTag></div><p>{skill.description}</p></div></div></div><div className="skill-metadata"><span className="metadata-item"><Icon name="database" />{skill.database}</span><span>Codex · Claude Code · Cursor 等</span></div><div className="skill-actions"><Button onClick={() => openDetails(skill)}>展开详情</Button></div></article>) : <Table className="skills-table" size="small" pagination={false} rowKey="name" dataSource={filtered} rowClassName={skill => skill.name === selected.name ? 'is-selected' : ''} columns={[
            { title: 'Skill', dataIndex: 'name', width: '32%', render: (_, skill) => <div className="table-skill"><Button type="link" className="table-title-button" aria-label={`预览 ${skill.name}`} onClick={() => preview(skill)}>{skill.name}</Button><span className="table-database">{skill.database}</span></div> },
            { title: '适用任务', render: (_, skill) => skill.details.scenarios.map(item => item.name).join(' · ') }, { title: '版本', width: '16%', render: (_, skill) => <ResourceMetaTag>v{skill.version}</ResourceMetaTag> },
            { title: '操作', width: '18%', render: (_, skill) => <Button type="link" size="small" aria-label={`在侧栏预览 ${skill.name}`} onClick={() => preview(skill)}>预览</Button> }
          ]} />}
        </div></section>
        <section className="panel install-panel" id="install"><header className="install-heading"><h2>{mode === 'manual' ? '手动安装' : '安装提示词'}</h2><span className="install-target">{selected.name}<ResourceMetaTag>v{selected.version}</ResourceMetaTag></span></header><InstallWidget {...installProps} /></section>
      </div>
      {wide && previewOpen && <Preview skill={selected} onExpand={() => openDetails(selected)} onClose={() => setPreviewOpen(false)} />}
    </div>
    {small && <Drawer title="分类目录" placement="left" size={320} open={catalogOpen} onClose={() => setCatalogOpen(false)} focusable={{ focusTriggerAfterClose: !catalogAction.current }} afterOpenChange={open => { if (!open && catalogAction.current) { const action = catalogAction.current; catalogAction.current = null; action(); } }} className="resource-drawer skill-catalog-overlay">{catalog}</Drawer>}
    <Drawer title={selected.name} placement="right" size={520} open={!wide && !small && previewRequested} onClose={() => setPreviewRequested(false)} extra={<Button type="text" aria-label="展开知识卡片" icon={<Icon name="expand" />} onClick={() => openDetails(selected)}>展开详情</Button>} focusable={{ focusTriggerAfterClose: !pendingDetails.current }} afterOpenChange={open => { if (!open && pendingDetails.current) { pendingDetails.current = false; previewOpener.current!.focus(); setDetailsOpen(true); } }} className="resource-drawer skill-preview-overlay"><Preview skill={selected} /></Drawer>
    <Modal centered className="skill-details-modal" title={<Flex align="center" gap={16}><span className="dialog-icon"><Icon name="database" /></span><span>{selected.name}</span><ResourceMetaTag>v{selected.version}</ResourceMetaTag></Flex>} open={detailsOpen} onCancel={() => setDetailsOpen(false)} width={960} footer={<div className="resource-modal-footer"><ResourceLinks skill={selected} /><Button type="link" icon={<Icon name="download" />} onClick={() => setDetailTab('install')}>安装方式</Button></div>}>
      <p className="detail-description">{selected.description}</p><Tabs activeKey={detailTab} onChange={setDetailTab} items={[{ key: 'overview', label: '概览', children: <Overview skill={selected} /> }, { key: 'spec', label: '规格表', children: <Specification skill={selected} /> }, { key: 'install', label: '安装', children: <InstallWidget {...installProps} /> }]} />
    </Modal>
  </main>;
}
