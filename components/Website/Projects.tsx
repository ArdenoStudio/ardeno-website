import React, { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import type { Project } from '../../data/projects';
import { portfolio, projectPath, projectStatus } from '../../data/portfolio';
import { Footer, SiteHeader } from './Site';
import { ProjectCard } from './ProjectCard';
import { ChsBranding } from './ChsBranding';
import { useSiteInteractions, useSlidingIndicator } from './interactions';
import { cn } from './utils';

type PageProps = { onContact: (email?: string, message?: string) => void };
type Filter = 'All work' | 'Platforms' | 'Websites' | 'Concepts';
const FILTERS: Filter[] = ['All work', 'Platforms', 'Websites', 'Concepts'];
const matchesFilter = (project: Project, filter: Filter) => filter === 'All work'
  || (filter === 'Platforms' && project.status === 'Ardeno platform')
  || (filter === 'Websites' && project.status === 'Live website')
  || (filter === 'Concepts' && projectStatus(project) === 'Studio concept');

function PortfolioContact({ onContact }: PageProps) {
  return <section className="portfolio-contact" aria-labelledby="portfolio-contact-title">
    <div><span className="portfolio-eyebrow">Your next chapter</span><h2 id="portfolio-contact-title">A new idea belongs here, too.</h2></div>
    <button className="site-button" onClick={() => onContact()}>Let’s make it happen <ArrowUpRight size={20} aria-hidden="true" /></button>
  </section>;
}

export function ProjectsIndex({ onContact }: PageProps) {
  useSiteInteractions();
  const [filter, setFilter] = useState<Filter>(() => FILTERS.includes(window.history.state?.projectFilter) ? window.history.state.projectFilter : 'All work');
  const selectFilter = (value: Filter) => {
    setFilter(value);
    window.history.replaceState({ ...window.history.state, projectFilter: value }, '', window.location.href);
  };
  const filtersRef = useRef<HTMLDivElement>(null);
  useSlidingIndicator(filtersRef, '.is-active', [filter]);
  const visible = portfolio.filter(project => matchesFilter(project, filter));

  return <div className="site-shell portfolio-shell" id="top">
    <a className="site-skip-link" href="#page-content">Skip to projects</a>
    <SiteHeader onContact={onContact} />
    <main id="page-content" tabIndex={-1} className="projects-index">
      <section className="portfolio-hero" aria-labelledby="projects-title">
        <div className="portfolio-label"><span className="portfolio-eyebrow">The work archive</span><span className="portfolio-total tabular-nums">{String(portfolio.length).padStart(2, '0')} projects & counting <ArrowUpRight size={16} aria-hidden="true" /></span></div>
        <h1 id="projects-title" tabIndex={-1}>Made here.<br /><span>Out in the world.</span></h1>
        <div className="portfolio-hero-bottom"><a href="/#work" className="portfolio-back"><ArrowLeft size={16} aria-hidden="true" /><span className="ul">Back to selected work</span></a><p>Independent platforms. Real businesses. New possibilities.<br />A closer look at what we’ve been making.</p></div>
      </section>
      <section className="portfolio-collection" aria-label="Project collection">
        <div className="portfolio-toolbar">
          <div ref={filtersRef} className="work-filters portfolio-filters" role="group" aria-label="Filter projects">{FILTERS.map(value => <button key={value} onClick={() => selectFilter(value)} aria-pressed={filter === value} className={cn(filter === value && 'is-active')} aria-controls="all-projects-grid">{value}<span className="filter-count tabular-nums">{portfolio.filter(project => matchesFilter(project, value)).length}</span></button>)}<span className="filter-indicator" aria-hidden="true" /></div>
          <p className="portfolio-showing" role="status">Showing {visible.length} of {portfolio.length}</p>
        </div>
        <div id="all-projects-grid" className="project-grid portfolio-grid">{visible.map(project => <ProjectCard key={project.id} project={project} />)}</div>
      </section>
      <PortfolioContact onContact={onContact} />
    </main>
    <Footer onContact={onContact} />
  </div>;
}

export function ProjectDetail({ project, onContact }: PageProps & { project: Project }) {
  useSiteInteractions();
  const concept = projectStatus(project) === 'Studio concept';
  const scrollToBrand = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || window.location.hash !== '#brand-identity') return;
    event.preventDefault();
    document.getElementById('brand-identity')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  const index = portfolio.findIndex(item => item.id === project.id);
  const next = portfolio[(index + 1) % portfolio.length];
  const chapters = [
    { label: 'The challenge', value: project.problem },
    { label: 'Our approach', value: project.solution },
    { label: 'The result', value: project.outcome },
  ].filter((chapter): chapter is { label: string; value: string } => Boolean(chapter.value));

  return <div className={cn('site-shell portfolio-shell project-detail-page', `project-${project.id}`)} id="top">
    <a className="site-skip-link" href="#page-content">Skip to project details</a>
    <SiteHeader onContact={onContact} />
    <main id="page-content" tabIndex={-1}>
      <section className="project-case-hero" aria-labelledby="project-title">
        <div className="project-case-top"><a href="/projects" className="portfolio-back"><ArrowLeft size={16} aria-hidden="true" /><span className="ul">All projects</span></a><span className="portfolio-eyebrow tabular-nums">{String(index + 1).padStart(2, '0')} / {String(portfolio.length).padStart(2, '0')}</span></div>
        <div className="project-case-heading"><h1 id="project-title" tabIndex={-1}>{project.title}<span className="project-title-period" aria-hidden="true">.</span></h1>{project.description && <p>{project.description}</p>}</div>
        <dl className="project-case-meta">
          <div><dt>Sector</dt><dd>{project.category}</dd></div>
          <div><dt>Project type</dt><dd><span className="case-status-dot" aria-hidden="true" />{project.id === 'ceylon-hygiene' ? 'Website & brand identity' : projectStatus(project)}</dd></div>
          {project.year && <div><dt>Year</dt><dd className="tabular-nums">{project.year}</dd></div>}
          <div><dt>Focus</dt><dd>{project.tags.join(' · ')}</dd></div>
        </dl>
        {project.id === 'ceylon-hygiene' && <a className="work-all-link" href="#brand-identity" onClick={scrollToBrand}>Explore the brand identity<ArrowRight size={16} aria-hidden="true" /></a>}
      </section>
      <figure className="project-case-visual"><img src={project.image} alt={concept ? `${project.title} visual direction` : `${project.title} website overview`} width={1280} height={800} fetchPriority="high" decoding="async" />{concept && <figcaption>Studio concept · Visual direction</figcaption>}</figure>
      <section className="project-story" aria-label={`${project.title} project story`}>
        <div className="project-story-aside"><span className="portfolio-eyebrow">Behind the build</span><h2>The thinking.<br />The making.</h2>{project.role && <div className="project-role"><h3>Our role</h3><p>{project.role}</p></div>}{project.url && <a href={project.url} target="_blank" rel="noopener noreferrer" className="site-button">{concept ? 'Explore the concept' : project.status === 'Ardeno platform' ? 'Explore live platform' : 'Visit the live site'}<ArrowUpRight size={18} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>}</div>
        <div className="project-story-chapters">{chapters.map((chapter, chapterIndex) => <article className="project-chapter" key={chapter.label}><span className="chapter-number tabular-nums" aria-hidden="true">0{chapterIndex + 1}</span><div><h3>{chapter.label}</h3><p>{chapter.value}</p></div></article>)}</div>
      </section>
      {project.id === 'ceylon-hygiene' && <ChsBranding />}
      {next && <section className="project-next" aria-label="Next project"><div className="project-next-label"><span className="portfolio-eyebrow">Keep exploring</span><a href="/projects"><span className="ul">All projects</span><ArrowUpRight size={16} aria-hidden="true" /></a></div><a className="project-next-link" href={projectPath(next)}><div><span className="project-next-category">Next project · {next.category}</span><h2>{next.title}</h2></div><span className="project-next-arrow"><ArrowRight size={44} aria-hidden="true" /></span></a></section>}
      <PortfolioContact onContact={onContact} />
    </main>
    <Footer onContact={onContact} />
  </div>;
}

export function ProjectNotFound({ onContact }: PageProps) {
  useSiteInteractions();
  return <div className="site-shell portfolio-shell" id="top"><a className="site-skip-link" href="#page-content">Skip to content</a><SiteHeader onContact={onContact} /><main id="page-content" tabIndex={-1} className="portfolio-not-found"><span className="portfolio-eyebrow">404 · Project not found</span><h1 tabIndex={-1}>A little off course.</h1><p>This project link doesn’t lead anywhere. There’s plenty more to explore in the archive.</p><a className="site-button" href="/projects">Explore all projects<ArrowUpRight size={18} aria-hidden="true" /></a></main><Footer onContact={onContact} /></div>;
}
