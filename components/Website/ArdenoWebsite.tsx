import React, { useEffect } from 'react';
import { Site } from './Site';
import { openContactSheet } from './ContactSheet';
import { trackUtmParams } from '../UI/trackUtm';
import { applySeoToDocument, type SeoRouteKey } from '../../seo';
import { findProject } from '../../data/portfolio';
import { ProjectsIndex, ProjectDetail, ProjectNotFound } from './Projects';
import './website.css';
import './navigation.css';
import './hero.css';
import './interactions.css';
import './brand.css';
import './footer.css';
import './contact.css';
import './built.css';
import './projects.css';
import './serviceVisual.css';
import './process.css';
import './builtMarquee.css';

export default function ArdenoWebsite({ pathname = window.location.pathname }: { pathname?: string }) {
  const path = pathname.replace(/\/+$/, '') || '/';
  const isProjects = path === '/projects';
  const isProjectDetail = path.startsWith('/projects/');
  const project = isProjectDetail ? findProject(path.slice('/projects/'.length)) : undefined;
  // Most callers pass this straight to onClick, so only strings count as an email or a message starter to prefill.
  // Every contact button pulls down the Let's talk sheet from the header (there is no contact page).
  const openContact = (email?: unknown, message?: unknown) => openContactSheet(typeof email === 'string' ? email : undefined, typeof message === 'string' ? message : undefined);

  useEffect(() => {
    trackUtmParams();
    const url = new URL(window.location.href);
    if (url.searchParams.has('design_lab') || url.searchParams.has('direction')) {
      url.searchParams.delete('design_lab'); url.searchParams.delete('direction');
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }
    if (window.location.hash) {
      window.requestAnimationFrame(() => document.getElementById(window.location.hash.slice(1))?.scrollIntoView());
    }
  }, []);

  useEffect(() => {
    applySeoToDocument((isProjects || isProjectDetail ? project ? `project-${project.id}` : 'projects' : 'home') as SeoRouteKey);
    if (isProjectDetail && !project) {
      document.title = 'Project not found | Ardeno Studio';
      document.querySelector('meta[name="robots"]')?.setAttribute('content', 'noindex, follow');
    }
  }, [path]);

  return <div className="ardeno-site"><div key={path}>
    {isProjects ? <ProjectsIndex onContact={openContact} /> : isProjectDetail ? project ? <ProjectDetail project={project} onContact={openContact} /> : <ProjectNotFound onContact={openContact} /> : <Site onContact={openContact} />}
  </div></div>;
}
