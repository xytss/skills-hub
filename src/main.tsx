import { lazy, Suspense, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider, Spin } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import type { Catalog } from './types';
import { loadCatalog } from './lib/catalog';
import { theme } from './theme';
import { Header } from './components/Header';
import '../assets/fonts/fonts.css';
import '../assets/site.css';
import '../assets/prompts.css';
import './styles.css';

const SkillsPage = lazy(() => import('./pages/SkillsPage'));
const PromptsPage = lazy(() => import('./pages/PromptsPage'));
const isPrompts = location.pathname.endsWith('/prompts.html');
document.body.classList.toggle('prompts-page', isPrompts);

function App() {
  const [catalog, setCatalog] = useState<Catalog>();
  const [error, setError] = useState('');
  useEffect(() => { loadCatalog().then(setCatalog).catch(error => { console.error(error); setError(error.message); }); }, []);
  return <ConfigProvider locale={zhCN} theme={theme}>
    <a className="skip-link" href={isPrompts ? '#prompt-title' : '#catalog'}>跳到主内容</a>
    <Header page={isPrompts ? 'prompts' : 'skills'} />
    {error ? <main className="page"><p role="alert">{error}</p></main> : <Suspense fallback={<div className="page-loading" aria-label="正在加载资源"><Spin /></div>}>{catalog ? isPrompts ? <PromptsPage prompts={catalog.prompts} /> : <SkillsPage skills={catalog.skills} /> : <div className="page-loading"><Spin /></div>}</Suspense>}
  </ConfigProvider>;
}
createRoot(document.getElementById('root')!).render(<App />);
