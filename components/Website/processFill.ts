import { useEffect, type RefObject } from 'react';

// "How we work" fills in as it is scrolled through (styles in process.css). Each .process-step gets --f, how much of its line is
// filled (0 to 1), and data-step: "active" while its line is filling and "done" once it is full; a step with any fill is reached.
// Side by side (desktop) the four lines fill one after another while the row's top moves from 85% to 40% of the screen. Stacked
// (800px and below) a rail runs down through the step numbers: it fills to a line at 60% of the screen, the way the founders page
// story lights its beats, and a step is reached when that line passes the middle of its number. Scroll-linked only, so it also
// runs under reduced motion (without the easing in between).
const STACKED = '(max-width: 800px)';

// `onFinish(y)` is called when the last step fills while the reader scrolls through (y: its tick, in viewport px). It fires once,
// and again only after the section has been scrolled back to empty; not when the page lands already past it (a reload or a link).
export function useProcessFill(gridRef: RefObject<HTMLElement | null>, onFinish?: (y: number) => void) {
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const steps = Array.from(grid.querySelectorAll<HTMLElement>('.process-step')) as HTMLElement[];
    const stacked = window.matchMedia(STACKED);
    const last: string[] = [];
    let frame = 0;
    let before = -1; // the overall fill on the previous update (-1 before the first)
    let armed = true;

    const set = (step: HTMLElement, i: number, f: number) => {
      const value = f.toFixed(3);
      if (last[i] === value) return;
      last[i] = value;
      step.style.setProperty('--f', value);
      step.dataset.step = f >= 1 ? 'done' : f > 0 ? 'active' : '';
    };

    // Called after each update with the overall fill (0 to 1).
    const finish = (overall: number) => {
      const end = steps[steps.length - 1];
      if (overall <= 0) armed = true;
      if (armed && onFinish && end?.dataset.step === 'done' && before > 0 && before < 1) {
        armed = false;
        const mark = (stacked.matches ? null : end.querySelector('.step-top svg')) ?? end.querySelector('.step-top > span') ?? end;
        const rect = mark.getBoundingClientRect();
        onFinish(rect.top + rect.height / 2);
      }
      before = overall;
    };

    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const box = grid.getBoundingClientRect();
      if (stacked.matches) {
        const tops = steps.map(step => {
          const rect = (step.querySelector('.step-top > span') ?? step).getBoundingClientRect();
          return rect.top + rect.height / 2;
        });
        const line = vh * 0.6;
        const railTop = tops[0] - box.top;
        const railLength = tops[tops.length - 1] - tops[0];
        grid.style.setProperty('--rail-top', `${railTop}px`);
        grid.style.setProperty('--rail-length', `${railLength}px`);
        const rail = Math.min(1, Math.max(0, (line - tops[0]) / railLength));
        grid.style.setProperty('--rail', rail.toFixed(3));
        steps.forEach((step, i) => {
          const next = tops[i + 1];
          set(step, i, line < tops[i] ? 0 : next === undefined ? 1 : Math.min(1, (line - tops[i]) / (next - tops[i])));
        });
        finish(rail);
      } else {
        const progress = Math.min(1, Math.max(0, (vh * 0.85 - box.top) / (vh * 0.45)));
        const reach = box.left + progress * box.width;
        steps.forEach((step, i) => {
          const rect = step.getBoundingClientRect();
          set(step, i, progress >= 1 ? 1 : Math.min(1, Math.max(0, (reach - rect.left) / rect.width)));
        });
        finish(progress);
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };

    // Only listen while the section is near the screen.
    let listening = false;
    const listen = (on: boolean) => {
      if (on === listening) return;
      listening = on;
      const method = on ? 'addEventListener' : 'removeEventListener';
      window[method]('scroll', schedule, { passive: true } as AddEventListenerOptions);
      window[method]('resize', schedule);
      if (on) schedule();
    };
    const view = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => listen(entry.isIntersecting), { rootMargin: '25% 0px' }) : null;
    if (view) view.observe(grid); else listen(true);
    stacked.addEventListener('change', schedule);
    update();

    return () => {
      view?.disconnect();
      listen(false);
      stacked.removeEventListener('change', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [gridRef, onFinish]);
}
