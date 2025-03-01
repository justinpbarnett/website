export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  technologies: string[];
  features: string[];
  github_url: string;
  live_url: string;
}

export type Projects = Project[]; 