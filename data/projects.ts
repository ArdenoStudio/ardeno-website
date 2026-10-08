import projectData from "./projects.json";

export interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  tags: string[];
  description?: string;
  status?: string;
  problem?: string;
  solution?: string;
  outcome?: string;
  role?: string;
  url?: string;
  year?: string;
}

export const PROJECTS: Project[] = projectData;

export const HERO_FEATURED = PROJECTS.find((project) => project.id === "octane") ?? PROJECTS[0];
