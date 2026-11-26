import brand from '../../assets/icons/skills-hub.svg';
import prompt from '../../assets/icons/prompt.svg';
import skills from '../../assets/icons/skills.svg';
import github from '../../assets/icons/github-mark.svg';
import share from '../../assets/icons/showcase-jump.svg';

const paths = {
  hierarchy: '<rect x="9" y="2" width="6" height="5" rx="1"/><rect x="1" y="17" width="6" height="5" rx="1"/><rect x="9" y="17" width="6" height="5" rx="1"/><rect x="17" y="17" width="6" height="5" rx="1"/><path d="M12 7v10M4 17v-5h16v5"/>',
  branches: '<circle cx="6" cy="5" r="2"/><circle cx="18" cy="9" r="2"/><circle cx="18" cy="19" r="2"/><path d="M6 7v10a2 2 0 0 0 2 2h8M6 9h10"/>',
  directory: '<path d="M3 5h6l2 3h10v12H3z"/><path d="M7 12h10M7 16h7"/>',
  folder: '<path d="M20 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2Z"/>',
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
  table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10M3 15h18"/>',
  book: '<path d="M12 5C9 3 5 3 2 4v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1v15"/>',
  terminal: '<path d="m4 5 7 7-7 7M13 19h7"/>',
  external: '<path d="M14 3h7v7M21 3l-10 10M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/>',
  expand: '<path d="M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5"/>',
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
} as const;

export type IconName = keyof typeof paths | 'skills-hub' | 'skills' | 'prompt' | 'github' | 'share';
export function Icon({ name }: { name: IconName }) {
  switch (name) {
    case 'skills-hub': return <img className="icon brand-icon" src={brand} alt="" />;
    case 'skills': return <img className="icon skills-icon" src={skills} alt="" />;
    case 'prompt': return <img className="icon prompt-icon" src={prompt} alt="" />;
    case 'github': return <img className="icon github-mark" src={github} alt="" />;
    case 'share': return <img className="icon share-icon" src={share} alt="" />;
    default: return <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: paths[name] }} />;
  }
}
