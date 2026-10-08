import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { Project } from '../../data/projects';
import { projectPath, projectStatus } from '../../data/portfolio';
import { cn } from './utils';

export const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  const href = projectPath(project);
  const concept = projectStatus(project) === 'Studio concept';
  return <article className={cn('project-card', `project-${project.id}`)}>
    <a className="project-visual" href={href} aria-label={`View ${project.title} project details`}>
      <span className="project-status">{projectStatus(project)}</span>
      <img src={project.image} alt={concept ? `${project.title} visual direction` : `${project.title} website preview`} width={1280} height={800} loading="lazy" decoding="async" />
      <span className="project-open"><ArrowUpRight size={24} aria-hidden="true" /></span>
    </a>
    <div className="project-caption">
      <div><h3><a href={href}><span className="ul">{project.title}</span></a></h3><p>{project.category}</p></div>
      {project.year && <span className="project-year tabular-nums">{project.year}</span>}
    </div>
  </article>;
};
