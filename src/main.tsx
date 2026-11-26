import { lazy, Suspense, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider, Spin } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import type { Catalog } from './types';
import { loadCatalog } from './lib/catalog';
import { createTheme } from './theme';
import { Header } from './components/Header';
import '../assets/fonts/chinese.css';
import '../assets/site.css';
import '../assets/prompts.css';
import './styles.css';

const SkillsPage = lazy(() => import('./pages/SkillsPage'));
const PromptsPage = lazy(() => import('./pages/PromptsPage'));
const isPrompts = location.pathname.endsWith('/prompts.html');
document.body.classList.toggle('prompts-page', isPrompts);

function App() {
  const [theme] = useState(createTheme);
  const [catalog, setCatalog] = useState<Catalog>();
  const [error, setError] = useState('');
  useEffect(() => { loadCatalog().then(setCatalog).catch(error => { console.error(error); setError(error.message); }); }, []);
  return <ConfigProvider locale={zhCN} theme={theme} steps={{
    classNames: { root: 'resource-steps' },
    styles: {
      itemIcon: { borderRadius: 5, background: 'var(--surface)', border: '1px solid var(--step-border)', color: 'var(--blue)' },
      itemTitle: { fontSize: 'var(--text-body)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-emphasis)' },
      itemContent: { fontSize: 'var(--text-xs)', color: 'var(--muted)' }
    }
  }}>
    <a className="skip-link" href={isPrompts ? '#prompt-title' : '#workspace-title'}>跳到主内容</a>
    <Header page={isPrompts ? 'prompts' : 'skills'} />
    {error ? <main className="page"><p role="alert">{error}</p></main> : <Suspense fallback={<div className="page-loading" aria-label="正在加载资源"><Spin /></div>}>{catalog ? isPrompts ? <PromptsPage prompts={catalog.prompts} /> : <SkillsPage skills={catalog.skills} /> : <div className="page-loading"><Spin /></div>}</Suspense>}
  </ConfigProvider>;
}
createRoot(document.getElementById('root')!).render(<App />);
