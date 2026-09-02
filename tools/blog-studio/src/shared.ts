export interface StudioConfig {
  repoPath: string;
  branch: string;
  productionUrl: string;
}

export interface StudioPost {
  filename: string;
  title: string;
  slug: string;
  date: string;
  category: string;
  series: string;
  tags: string[];
  description: string;
  content: string;
  draft: boolean;
}

export interface EnvironmentStatus {
  validRepo: boolean;
  git: boolean;
  vercel: boolean;
  message?: string;
}

export interface PublishResult {
  ok: boolean;
  commit?: string;
  url?: string;
  logs: string[];
  error?: string;
}
