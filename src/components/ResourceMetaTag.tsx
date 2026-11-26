import type { ReactNode } from 'react';
import { Tag } from 'antd';

export function ResourceMetaTag({ children }: { children: ReactNode }) {
  return <Tag className="resource-meta-tag" variant="filled" styles={{ root: { color: 'var(--blue-strong)', backgroundColor: 'var(--resource-meta-bg)' } }}>{children}</Tag>;
}
