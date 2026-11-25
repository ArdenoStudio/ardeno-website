import { PROJECTS, type Project } from './projects';

const ORDER = ['octane', 'dinaya-lk', 'serendib-trading', 'ceylon-stories', 'propertylk', 'motormila', 'lankawa', 'koel-cse', 'ceylon-hygiene', 'wax-in-the-city'];

export const portfolio = ORDER.map(id => PROJECTS.find(project => project.id === id)).filter((project): project is Project => Boolean(project));
// Ceylon Hygiene Solutions leads Selected work as the board (BrandBoard.tsx), so it is not repeated in the grid.
const FEATURED_IDS = ['octane', 'koel-cse', 'dinaya-lk', 'serendib-trading'];
export const featuredProjects = FEATURED_IDS.map(id => portfolio.find(project => project.id === id)).filter((project): project is Project => Boolean(project));
export const projectSlug = (project: Project) => project.id;
export const projectPath = (project: Project) => `/projects/${projectSlug(project)}`;
export const findProject = (slug: string) => portfolio.find(project => projectSlug(project) === slug);
export const projectStatus = (project: Project) => project.status === 'Ardeno platform' ? 'Live platform' : project.status === 'Live website' ? 'Live website' : 'Studio concept';
