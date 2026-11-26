import { useMemo, useState } from 'react';
import { Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import type { Key } from 'react';
import { Icon } from './Icon';

interface Resource { name: string; navigation_path: string[]; category_paths?: string[] }
export interface CatalogNode extends DataNode { kind: 'category' | 'resource'; path: string[]; members: string[]; resource?: string; children?: CatalogNode[] }

function makeTree(resources: Resource[]) {
  const root: CatalogNode = { key: 'root', title: '', kind: 'category', path: [], members: [], children: [] };
  function register(path: string[], name: string) {
    let current = root;
    path.forEach((title, index) => {
      const parts = path.slice(0, index + 1);
      const key = JSON.stringify(parts);
      let child = current.children!.find(node => node.key === key);
      if (!child) { child = { key, title, kind: 'category', path: parts, members: [], children: [], className: 'category-node', icon: <Icon name="folder" /> }; current.children!.push(child); }
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
    parent.children!.push({ key: `resource:${resource.name}`, title: resource.name, kind: 'resource', path: resource.navigation_path, members: [resource.name], resource: resource.name, className: 'resource-node', isLeaf: true, icon: <Icon name="file" /> });
  });
  return root.children!;
}

export function ResourceTree({ resources, selected, category, onSelect }: { resources: Resource[]; selected: string; category: string[]; onSelect: (node: CatalogNode) => void }) {
  const tree = useMemo(() => makeTree(resources), [resources]);
  const [expanded, setExpanded] = useState<Key[]>(() => {
    const keys: Key[] = [];
    function walk(nodes: CatalogNode[]) { nodes.forEach(node => { if (node.kind === 'category') keys.push(node.key); if (node.children) walk(node.children); }); }
    walk(tree); return keys;
  });
  return <Tree className="resource-tree" aria-label="分类目录" treeData={tree} blockNode showIcon showLine={{ showLeafIcon: false }} switcherIcon={<Icon name="chevron" />} virtual={false} multiple expandedKeys={expanded} onExpand={keys => setExpanded(keys)} selectedKeys={[JSON.stringify(category), `resource:${selected}`]} onSelect={(_, info) => onSelect(info.node as CatalogNode)} />;
}
