import type { Catalog } from '../types';

export const REPOSITORY = 'https://github.com/xytss/skills-hub';
export const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`;
export const fileUrl = (path: string) => `${REPOSITORY}/blob/main/${path.split('/').map(encodeURIComponent).join('/')}`;

export async function loadCatalog(): Promise<Catalog> {
  const response = await fetch(assetUrl('catalog.json'), { cache: 'no-cache' });
  if (!response.ok) throw new Error(`目录读取失败：HTTP ${response.status}`);
  const catalog = await response.json() as Catalog;
  if (!Array.isArray(catalog.skills) || !Array.isArray(catalog.prompts)) throw new Error('目录格式错误');
  return catalog;
}
