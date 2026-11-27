import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const readJson = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const [incoming, catalog] = await Promise.all([readJson('ant-skills.json'), readJson('catalog.json')]);

if (!Array.isArray(incoming)) throw new Error('ant-skills.json 必须是 Skill 数组');

const ids = new Set();
const sources = new Set();
const identities = new Set();
for (const skill of incoming) {
  for (const field of ['id', 'name', 'displayName', 'sourceRepo', 'sourceUrl', 'docsUrl', 'compatibleVersions', 'verifiedAt']) {
    if (typeof skill[field] !== 'string' || !skill[field].trim()) throw new Error(`Skill 缺少字段：${field}`);
  }
  if (ids.has(skill.id)) throw new Error(`重复 Skill id：${skill.id}`);
  ids.add(skill.id);
  if (!skill.sourceUrl.startsWith('https://') || new URL(skill.sourceUrl).protocol !== 'https:') throw new Error(`来源链接必须使用 HTTPS：${skill.id}`);
  if (!skill.sourceUrl.startsWith(`https://github.com/${skill.sourceRepo}/`)) throw new Error(`来源仓库与链接不一致：${skill.id}`);
  if (sources.has(skill.sourceUrl)) throw new Error(`重复来源链接：${skill.id}`);
  sources.add(skill.sourceUrl);
  const identity = `${skill.sourceRepo}:${skill.name}`;
  if (identities.has(identity)) throw new Error(`重复上游 Skill：${identity}`);
  identities.add(identity);
  if (!Array.isArray(skill.categoryPath) || skill.categoryPath.length !== 3 || skill.categoryPath[0] !== '前端开发' || skill.categoryPath.some(part => typeof part !== 'string' || !part.trim())) throw new Error(`必须使用前端开发下的三级分类：${skill.id}`);
  if (!Array.isArray(skill.tags) || skill.tags.some(tag => typeof tag !== 'string' || !tag.trim())) throw new Error(`标签格式错误：${skill.id}`);
  if (skill.skillVersion !== null && (typeof skill.skillVersion !== 'string' || !skill.skillVersion.trim())) throw new Error(`技能版本格式错误：${skill.id}`);
  if (!['official', 'community', 'project'].includes(skill.publisherType)) throw new Error(`技能来源类型错误：${skill.id}`);
  for (const url of [skill.docsUrl, skill.sourceRevision.pinnedSourceUrl, ...(skill.skillVersion === null ? [] : [skill.skillVersionSource])]) {
    if (typeof url !== 'string' || new URL(url).protocol !== 'https:') throw new Error(`核验链接必须使用 HTTPS：${skill.id}`);
  }
  for (const product of skill.productVersions) {
    if (!product.name || !product.label || !product.version || !['current', 'target', 'template'].includes(product.scope) || new URL(product.versionSourceUrl).protocol !== 'https:') throw new Error(`产品版本格式错误：${skill.id}`);
  }
  for (const [field, value] of Object.entries({ purpose: skill.detail.purpose, input: skill.detail.inputOutput.input, output: skill.detail.inputOutput.output, usageExample: skill.detail.usageExample, installPrompt: skill.detail.installPrompt })) {
    if (typeof value !== 'string' || !value.trim()) throw new Error(`详情字段缺失：${skill.id}.${field}`);
  }
}

const converted = incoming.map(skill => ({
  id: skill.id,
  name: skill.name,
  displayName: skill.displayName,
  title: skill.displayName,
  skillVersion: skill.skillVersion,
  skillVersionSource: skill.skillVersionSource,
  publisherType: skill.publisherType,
  compatibleVersions: skill.compatibleVersions,
  productVersions: skill.productVersions,
  sourceRevision: skill.sourceRevision,
  docsUrl: skill.docsUrl,
  verifiedAt: skill.verifiedAt,
  relatedSkills: skill.relatedSkills,
  description: skill.detail.purpose,
  navigation_path: skill.categoryPath,
  category_paths: [skill.categoryPath.join('/')],
  tags: skill.tags,
  sourceRepo: skill.sourceRepo,
  sourceUrl: skill.sourceUrl,
  installPrompt: skill.detail.installPrompt,
  entry: skill.sourceUrl,
  overview: skill.docsUrl,
  details: {
    purpose: skill.detail.purpose,
    scenarios: [{ name: skill.categoryPath[2], input: skill.detail.inputOutput.input, output: skill.detail.inputOutput.output }],
    workflow: [],
    principles: [],
    example: skill.detail.usageExample
  }
}));

catalog.skills = [...catalog.skills.filter(skill => !ids.has(skill.id)), ...converted];
const catalogIds = new Set();
const catalogSources = new Set();
for (const skill of catalog.skills) {
  if (!skill.id || catalogIds.has(skill.id)) throw new Error(`目录 id 缺失或重复：${skill.id}`);
  catalogIds.add(skill.id);
  if (!skill.sourceUrl.startsWith('https://')) throw new Error(`目录来源必须使用 HTTPS：${skill.id}`);
  if (catalogSources.has(skill.sourceUrl)) throw new Error(`目录来源重复：${skill.sourceUrl}`);
  catalogSources.add(skill.sourceUrl);
}
for (const skill of catalog.skills) {
  for (const related of skill.relatedSkills) {
    if (!catalogIds.has(related.id) || related.id === skill.id) throw new Error(`关联技能引用错误：${skill.id} → ${related.id}`);
  }
}
catalog.updated_on = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(new Date());
await writeFile(new URL('catalog.json', root), `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
console.log(`已同步 ${converted.length} 项前端 Skill，目录共 ${catalog.skills.length} 项；id、HTTPS 来源、重复项及三级分类校验通过。`);
