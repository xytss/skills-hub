import { unified } from 'unified';
import remarkParse from 'remark-parse';
import type { Root, RootContent, ListItem } from 'mdast';

export interface OutlineEntry { id: string; title: string; section: string; parents: string[]; children: OutlineEntry[] }
type TextNode = { type: string; value?: string; children?: TextNode[] };
function textOf(node: TextNode): string { return node.value ?? (node.children ?? []).map(textOf).join(''); }
export function slug(text: string) { return text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, ''); }

export function decoratePrompt(tree: Root, labels: string[]) {
  const outline: OutlineEntry[] = [];
  let section: OutlineEntry;
  function setId(node: RootContent | ListItem, id: string) { node.data = { ...node.data, hProperties: { ...node.data?.hProperties, id, tabIndex: -1 } }; }
  function walkItem(item: ListItem, parent: OutlineEntry) {
    let nestedParent = parent;
    const first = item.children[0];
    if (first.type === 'paragraph' && first.children[0].type === 'strong') {
      const title = textOf(first.children[0]).replace(/[:：]$/, '');
      const id = `${section.id}-${slug(title)}`;
      const entry: OutlineEntry = { id, title, section: section.id, parents: [...parent.parents, parent.id], children: [] };
      parent.children.push(entry); nestedParent = entry; setId(item, id);
    }
    item.children.forEach(child => { if (child.type === 'list') child.children.forEach(item => walkItem(item, nestedParent)); });
  }
  tree.children.forEach(node => {
    if (node.type === 'heading') {
      const id = slug(textOf(node)); setId(node, id);
      if (node.depth === 2) { section = { id, title: labels[outline.length], section: id, parents: [], children: [] }; outline.push(section); }
    } else if (node.type === 'list') node.children.forEach(item => walkItem(item, section));
  });
  return outline;
}

export function getPromptOutline(raw: string, labels: string[]) { return decoratePrompt(unified().use(remarkParse).parse(raw), labels); }
export function outlinePlugin(labels: string[]) { return () => (tree: Root) => { decoratePrompt(tree, labels); }; }
export function flattenOutline(entries: OutlineEntry[]): OutlineEntry[] { return entries.flatMap(entry => [entry, ...flattenOutline(entry.children)]); }
