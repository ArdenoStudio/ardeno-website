import React, { useEffect } from 'react';
import { Site } from './Site';
import { ContactPage } from './ContactPage';
import { prepareContactDraft } from './ContactForm';
import { requestPageNavigation } from './pageNavigation';
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

export default function ArdenoWebsite({ pathname = window.location.pathname }: { pathname?: string }) {
  const path = pathname.replace(/\/+$/, '') || '/';
  const isProjects = path === '/projects';
  const isProjectDetail = path.startsWith('/projects/');
  const project = isProjectDetail ? findProject(path.slice('/projects/'.length)) : undefined;
  // Most callers pass this straight to onClick, so only strings count as an email or a message starter to prefill.
  const openContact = (email?: unknown, message?: unknown) => {
    prepareContactDraft(typeof email === 'string' ? email : undefined, typeof message === 'string' ? message : undefined);
    if (path === '/contact') document.querySelector<HTMLInputElement>('#enquiry input[name="name"]')?.focus();
    else requestPageNavigation('/contact');
  };

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
    applySeoToDocument((path === '/contact' ? 'contact' : isProjects || isProjectDetail ? project ? `project-${project.id}` : 'projects' : 'home') as SeoRouteKey);
    if (isProjectDetail && !project) {
      document.title = 'Project not found | Ardeno Studio';
      document.querySelector('meta[name="robots"]')?.setAttribute('content', 'noindex, follow');
    }
  }, [path]);

  return <div className="ardeno-site"><div key={path}>
    {path === '/contact' ? <ContactPage onContact={openContact} /> : isProjects ? <ProjectsIndex onContact={openContact} /> : isProjectDetail ? project ? <ProjectDetail project={project} onContact={openContact} /> : <ProjectNotFound onContact={openContact} /> : <Site onContact={openContact} />}
  </div></div>;
}
