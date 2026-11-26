import { Tooltip } from 'antd';
import { Icon } from './Icon';
import { REPOSITORY } from '../lib/catalog';

export function Header({ page }: { page: 'skills' | 'prompts' }) {
  return <header className="site-header"><div className="header-inner">
    <a className="brand" href="./" aria-label="Skills Hub 首页"><span className="brand-mark"><Icon name="skills-hub" /></span><span>Skills Hub</span></a>
    <nav aria-label="主导航">
      <a href="./#catalog" className={page === 'skills' ? 'nav-active' : ''} aria-current={page === 'skills' ? 'page' : undefined}><Icon name="folder" />Skills</a>
      <a href="prompts.html" className={page === 'prompts' ? 'nav-active' : ''} aria-current={page === 'prompts' ? 'page' : undefined}><Icon name="prompt" />全局提示词</a>
      <span className="repository-entry"><span className="repository-label"><Icon name="github" />GitHub</span><Tooltip title="打开 GitHub 仓库（新标签页）"><a className="repository-link" href={REPOSITORY} target="_blank" rel="noopener noreferrer" aria-label="在新标签页打开 GitHub 仓库"><Icon name="share" /></a></Tooltip></span>
    </nav>
  </div></header>;
}
