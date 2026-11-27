export interface Scenario { name: string; input: string; output: string }
export interface WorkflowStep { title: string; description: string }
export interface ProductVersion {
  name: string; label: string; version: string; versionSourceUrl: string;
  scope: 'current' | 'target' | 'template';
}
export interface Skill {
  id: string; name: string; displayName: string; title: string; description: string;
  skillVersion: string | null; skillVersionSource: string | null;
  publisherType: 'official' | 'community' | 'project'; compatibleVersions: string;
  productVersions: ProductVersion[]; verifiedAt: string; docsUrl: string;
  sourceRevision: { commit: string; pinnedSourceUrl: string };
  relatedSkills: { id: string; reason: string }[];
  navigation_path: string[]; category_paths: string[]; tags: string[]; database?: string;
  sourceRepo: string; sourceUrl: string; installPrompt: string; license?: string;
  entry: string; overview: string; image?: string;
  details: { purpose: string; scenarios: Scenario[]; workflow: WorkflowStep[]; principles: string[]; example: string };
}
export interface Prompt {
  name: string; version: string; description: string; navigation_path: string[];
  agent: string; system: string; shell: string; tags: string[]; featured_tags: string[];
  entry: string; overview: string; outline_labels: string[];
}
export interface Catalog { skills: Skill[]; prompts: Prompt[] }
