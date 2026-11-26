export interface Scenario { name: string; input: string; output: string }
export interface WorkflowStep { title: string; description: string }
export interface Skill {
  name: string; title: string; version: string; description: string;
  navigation_path: string[]; category_paths: string[]; database: string;
  entry: string; overview: string; image: string;
  details: { purpose: string; scenarios: Scenario[]; workflow: WorkflowStep[]; principles: string[]; example: string };
}
export interface Prompt {
  name: string; description: string; navigation_path: string[];
  agent: string; system: string; shell: string; tags: string[]; featured_tags: string[];
  entry: string; overview: string; outline_labels: string[];
}
export interface Catalog { skills: Skill[]; prompts: Prompt[] }
