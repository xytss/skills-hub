import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Flex, Tree, Typography } from 'antd';
import type { DataNode } from 'antd/es/tree';
import type { Key } from 'react';
import { Icon } from './Icon';

interface Resource { name: string; displayName?: string; navigation_path: string[]; category_paths?: string[] }
export interface CatalogNode extends DataNode { kind: 'category' | 'resource'; path: string[]; members: string[]; resource?: string; children?: CatalogNode[] }

const variantLabels: Record<string, string> = { '（图片版）': '（图片）', '（GPT-Vis 集成版）': '（GPT-Vis）', '（视觉设计版）': '（视觉）' };

function TreeLabel({ name, kind, current }: { name: string; kind: CatalogNode['kind']; current: boolean }) {
  const label = useRef<HTMLElement>(null);
  useLayoutEffect(() => { if (current) label.current!.scrollIntoView({ block: 'nearest' }); }, [current]);
  const parts = name.match(/^(.*?)(（[^（）]+）)$/u);
  const caption = parts ? parts[1] : name;
  const suffix = parts ? variantLabels[parts[2]] ?? parts[2] : '';
  return <Flex component="span" className="resource-tree-label" align="center" gap={8} ref={label} aria-current={current ? 'true' : undefined}>
    <Icon name={kind === 'category' ? 'folder' : 'file'} />
    <Typography.Text className="resource-tree-caption" aria-label={name} ellipsis={{ suffix, tooltip: { title: name, trigger: ['hover', 'focus'] } }}>{caption}</Typography.Text>
  </Flex>;
}

function makeTree(resources: Resource[], selected: string) {
  const root: CatalogNode = { key: 'root', title: '', kind: 'category', path: [], members: [], children: [] };
  function register(path: string[], name: string) {
    let current = root;
    path.forEach((title, index) => {
      const parts = path.slice(0, index + 1);
      const key = JSON.stringify(parts);
      let child = current.children!.find(node => node.key === key);
      if (!child) { child = { key, title: <TreeLabel name={title} kind="category" current={false} />, kind: 'category', path: parts, members: [], children: [], className: 'category-node' }; current.children!.push(child); }
      if (!child.members.includes(name)) child.members.push(name);
      current = child;
    });
    return current;
  }
  resources.forEach(resource => {
    resource.category_paths?.forEach(path => {
      const parts = path.split('/');
      register(resource.navigation_path.every((part, index) => parts[index] === part) ? resource.navigation_path : parts, resource.name);
    });
    const parent = register(resource.navigation_path, resource.name);
    parent.children!.push({ key: `resource:${resource.name}`, title: <TreeLabel name={resource.displayName ?? resource.name} kind="resource" current={resource.name === selected} />, kind: 'resource', path: resource.navigation_path, members: [resource.name], resource: resource.name, className: 'resource-node', isLeaf: true });
  });
  return root.children!;
}

export function ResourceTree({ resources, selected, category, onSelect }: { resources: Resource[]; selected: string; category: string[]; onSelect: (node: CatalogNode) => void }) {
  const tree = useMemo(() => makeTree(resources, selected), [resources, selected]);
  const selectedPath = resources.find(resource => resource.name === selected)!.navigation_path;
  const [expanded, setExpanded] = useState<Key[]>(() => {
    return [...new Set([...tree.map(node => node.key), ...category.map((_, index) => JSON.stringify(category.slice(0, index + 1))), ...selectedPath.map((_, index) => JSON.stringify(selectedPath.slice(0, index + 1)))])];
  });
  useEffect(() => { setExpanded(keys => [...new Set([...keys, ...category.map((_, index) => JSON.stringify(category.slice(0, index + 1))), ...selectedPath.map((_, index) => JSON.stringify(selectedPath.slice(0, index + 1)))])]); }, [category, selectedPath]);
  return <Tree className="resource-tree" classNames={{ item: 'resource-tree-item', itemTitle: 'resource-tree-title', itemSwitcher: 'resource-tree-switcher' }} aria-label="分类目录" treeData={tree} blockNode showLine={{ showLeafIcon: false }} switcherIcon={({ expanded }) => <span className="resource-tree-chevron" style={{ transform: expanded ? 'rotate(90deg)' : undefined }}><Icon name="chevron" /></span>} virtual={false} motion={null} multiple expandedKeys={expanded} onExpand={keys => setExpanded(keys)} selectedKeys={[JSON.stringify(category), `resource:${selected}`]} onSelect={(_, info) => onSelect(info.node as CatalogNode)} />;
}
