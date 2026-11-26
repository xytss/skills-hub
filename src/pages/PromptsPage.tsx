import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, ConfigProvider, Drawer, Flex, Modal, Steps, Table, Tabs, Tag, Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Prompt } from '../types';
import { assetUrl, fileUrl } from '../lib/catalog';
import { getPromptOutline, outlinePlugin, type OutlineEntry } from '../lib/promptDocument';
import { useMedia } from '../hooks/useMedia';
import { usePromptOutline } from '../hooks/usePromptOutline';
import { Icon } from '../components/Icon';
import { CopyButton } from '../components/CopyButton';
import { ResourceTree } from '../components/ResourceTree';

function PromptGuide({ prompt, onExpand }: { prompt: Prompt; onExpand?: () => void }) {
  return <aside className="panel prompt-guide" aria-labelledby="prompt-guide-title">
    <header className="panel-heading"><h2 id="prompt-guide-title">使用说明</h2>{onExpand && <Button type="text" className="icon-button" aria-label="展开使用说明" icon={<Icon name="external" />} onClick={onExpand} />}</header>
    <div className="preview-content">
      <section className="info-section"><h3 className="info-title">适用环境</h3><Table className="environment-table" size="small" pagination={false} showHeader={false} columns={[{ dataIndex: 'label', width: '36%' }, { dataIndex: 'value' }]} dataSource={[{ key: 'agent', label: '工具', value: prompt.agent }, { key: 'system', label: '系统', value: prompt.system }, { key: 'shell', label: '终端', value: prompt.shell }]} /></section>
      <section className="info-section"><h3 className="info-title">标签</h3><Flex wrap gap={6}>{prompt.tags.map(tag => <Tag className={prompt.featured_tags.includes(tag) ? 'feature-tag' : ''} key={tag}>{tag}</Tag>)}</Flex></section>
      <section className="info-section"><h3 className="info-title">使用方式</h3><Steps orientation="vertical" current={-1} size="small" items={[{ title: '复制全文', content: '获取完整提示词' }, { title: '配置全局指令', content: '粘贴到 Codex 的全局指令配置' }, { title: '按项目补充', content: '添加具体业务约定' }]} /></section>
    </div>
    <footer className="preview-footer"><a href={fileUrl(prompt.overview)} target="_blank" rel="noopener noreferrer"><Icon name="book" />使用指南<Icon name="external" /></a><a href={fileUrl(prompt.entry)} target="_blank" rel="noopener noreferrer"><Icon name="file" />提示词原文<Icon name="external" /></a></footer>
  </aside>;
}

function PromptContent({ prompt, prompts }: { prompt: Prompt; prompts: Prompt[] }) {
  const [raw, setRaw] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState('document');
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const small = useMedia('(max-width: 1023px)');
  const narrow = useMedia('(max-width: 1439px)');
  const compact = useMedia('(max-width: 600px)');
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch(assetUrl(prompt.entry), { signal: controller.signal }).then(response => { if (!response.ok) throw new Error(`提示词读取失败：HTTP ${response.status}`); return response.text(); }).then(setRaw).catch(error => { if (error.name !== 'AbortError') { console.error(error); setError(error.message); } });
    document.title = `${prompt.name} · 全局提示词 · Skills Hub`;
    return () => controller.abort();
  }, [prompt]);
  const entries = useMemo(() => raw ? getPromptOutline(raw, prompt.outline_labels) : [], [raw, prompt]);
  const plugins = useMemo(() => [remarkGfm, outlinePlugin(prompt.outline_labels)], [prompt]);
  const showDocument = useCallback(() => { setCatalogOpen(false); setTab('document'); }, []);
  const outline = usePromptOutline(entries, scrollRef, small, tab, showDocument);
  useEffect(() => {
    if (!raw) return;
    const followHash = () => { if (location.hash) outline.navigate(decodeURIComponent(location.hash.slice(1)), false); else (small ? window : scrollRef.current!).scrollTo({ top: 0 }); };
    followHash(); window.addEventListener('hashchange', followHash);
    return () => window.removeEventListener('hashchange', followHash);
  }, [raw, small]);
  const [download, setDownload] = useState('');
  useEffect(() => { if (!raw) return; const url = URL.createObjectURL(new Blob([raw], { type: 'text/markdown;charset=utf-8' })); setDownload(url); return () => URL.revokeObjectURL(url); }, [raw]);
  function outlineNode(entry: OutlineEntry): DataNode { return { key: entry.id, title: entry.title, children: entry.children.length ? entry.children.map(outlineNode) : undefined }; }
  const fileActions = <div className="prompt-file-actions"><a href={download || undefined} download={`${prompt.name}.md`}><Icon name="download" />下载文件</a><a href={fileUrl(prompt.entry)} target="_blank" rel="noopener noreferrer"><Icon name="external" />查看源码</a></div>;
  return <main className="page">
    <div className="prompt-mobile-controls"><Button id="prompt-catalog-toggle" icon={<Icon name="folder" />} aria-expanded={catalogOpen} aria-controls="prompt-navigation" onClick={() => setCatalogOpen(!catalogOpen)}>目录与大纲</Button><Button icon={<Icon name="book" />} onClick={() => setGuideOpen(true)}>使用说明</Button></div>
    <div className={`prompt-workspace${catalogOpen ? ' catalog-expanded' : ''}`}>
      <aside id="prompt-navigation" className="panel prompt-navigation" aria-label="提示词导航">
        <section className="prompt-categories"><header className="panel-heading"><h2>分类目录</h2></header><div className="prompt-catalog"><ResourceTree resources={prompts} selected={prompt.name} category={prompt.navigation_path} onSelect={node => { if (node.kind === 'resource') location.href = `?prompt=${encodeURIComponent(node.resource!)}`; }} /></div></section>
        <nav className="prompt-outline" aria-labelledby="outline-title"><h2 id="outline-title">大纲树</h2><ConfigProvider theme={{ components: { Tree: { nodeSelectedBg: 'transparent' } } }}><Tree className="outline-tree" aria-label="大纲树" treeData={entries.map(outlineNode)} virtual={false} blockNode switcherIcon={<Icon name="chevron" />} selectedKeys={[outline.active]} expandedKeys={outline.expanded} autoExpandParent={false} onExpand={keys => outline.setExpanded(keys.map(String))} onSelect={(_, info) => outline.navigate(String(info.node.key))} titleRender={node => <a href={`#${node.key}`} aria-current={outline.active === node.key ? 'location' : undefined} onClick={event => event.preventDefault()}>{node.title as string}</a>} /></ConfigProvider></nav>
      </aside>
      <section className="panel prompt-reader" aria-labelledby="prompt-title" aria-busy={!raw && !error}>
        <header className="prompt-header"><div className="prompt-heading-row"><div className="prompt-identity"><span className="skill-symbol"><Icon name="file" /></span><div><Flex className="prompt-title-row" align="center" gap={10} wrap><h1 id="prompt-title" tabIndex={-1}>{prompt.name}</h1><Tag className="resource-meta-tag" color="blue" variant="filled">v{prompt.version}</Tag></Flex><p>{prompt.agent} / {prompt.system} / {prompt.shell}</p></div></div><CopyButton text={raw} label="复制全文" disabled={!raw} /></div><p className="prompt-description">{prompt.description}</p></header>
        <Tabs className="reader-tabs" activeKey={tab} onChange={setTab} tabBarExtraContent={compact ? undefined : fileActions} renderTabBar={(props, DefaultTabBar) => <><DefaultTabBar {...props} />{compact && <div className="mobile-file-actions">{fileActions}</div>}</>} items={[
          { key: 'document', label: '正文', forceRender: true, children: <div className="prompt-scroll document-scroll" ref={scrollRef}><article className="prompt-document" id="panel-document">{error ? <p role="alert">{error}</p> : raw ? <Markdown remarkPlugins={plugins}>{raw}</Markdown> : <p className="loading">正在读取提示词…</p>}</article></div> },
          { key: 'markdown', label: '原始 Markdown', forceRender: true, children: <div className="prompt-scroll markdown-scroll"><pre className="prompt-markdown" id="prompt-markdown">{raw}</pre></div> }
        ]} />
      </section>
      {!narrow && <PromptGuide prompt={prompt} onExpand={() => setGuideOpen(true)} />}
    </div>
    {narrow ? <Drawer title="使用说明" placement="right" open={guideOpen} onClose={() => setGuideOpen(false)} size={440} className="resource-drawer prompt-guide-overlay"><PromptGuide prompt={prompt} /></Drawer> : <Modal open={guideOpen} onCancel={() => setGuideOpen(false)} footer={null} width={440} className="prompt-guide-overlay" title="使用说明"><PromptGuide prompt={prompt} /></Modal>}
  </main>;
}

export default function PromptsPage({ prompts }: { prompts: Prompt[] }) {
  const name = new URLSearchParams(location.search).get('prompt') || prompts[0].name;
  const prompt = prompts.find(item => item.name === name);
  return prompt ? <PromptContent prompt={prompt} prompts={prompts} /> : <main className="page"><p role="alert">提示词不存在：{name}</p></main>;
}
