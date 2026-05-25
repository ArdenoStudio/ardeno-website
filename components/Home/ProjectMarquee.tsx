import React from "react";
import { PROJECTS } from "../../data/projects";

export const ProjectMarquee: React.FC = () => {
  const items = [...PROJECTS, ...PROJECTS];

  return (
    <section
      aria-label="Selected client projects"
      className="relative z-10 border-y border-white/[0.06] bg-[#060607] overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-28 z-10 bg-gradient-to-r from-[#060607] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-28 z-10 bg-gradient-to-l from-[#060607] to-transparent" />

      <div className="py-4 md:py-5 flex whitespace-nowrap">
        <div className="marquee-track flex items-center gap-3 md:gap-4 min-w-max px-4">
          {items.map((project, index) => (
            <a
              key={`${project.id}-${index}`}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.02] pl-1.5 pr-4 py-1.5 hover:border-[#E50914]/35 hover:bg-[#E50914]/[0.06] transition-all duration-300"
            >
              <span className="relative w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden shrink-0 border border-white/10">
                <img
                  src={project.image}
                  alt=""
                  width={40}
                  height={40}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                />
              </span>
              <span className="flex flex-col leading-tight">
                <span
                  className="text-[11px] md:text-[12px] text-white/90 group-hover:text-white transition-colors"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {project.title}
                </span>
                <span
                  className="text-[9px] md:text-[10px] tracking-[0.16em] uppercase text-zinc-500 group-hover:text-zinc-400 transition-colors"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {project.category}
                </span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
