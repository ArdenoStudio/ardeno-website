import type React from 'react';

// Bursts a ring of short sparks from a click. Colours default to the clicked control's own background and text;
// pass CSS custom property names (e.g. '--accent') to draw from the site palette instead.
export function burstSparks(event: React.MouseEvent<HTMLElement>, tokens?: string[]) {
  burstSparksAt(event.currentTarget, event.clientX, event.clientY, tokens);
}

export function burstSparksAt(target: HTMLElement, clientX: number, clientY: number, tokens?: string[]) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const box = target.getBoundingClientRect();
  // Keyboard activation reports 0,0, so fall back to the middle of the control.
  const keyboard = clientX === 0 && clientY === 0;
  const x = keyboard ? box.left + box.width / 2 : clientX;
  const y = keyboard ? box.top + box.height / 2 : clientY;
  const style = getComputedStyle(target);
  const palette = (tokens ?? []).map(token => style.getPropertyValue(token).trim()).filter(Boolean);
  const colors = palette.length ? palette : [style.backgroundColor, style.color];
  const count = 12;

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const from = 10 + Math.random() * 4;
    const to = 50 + Math.random() * 34;
    const spark = document.createElement('span');
    spark.setAttribute('aria-hidden', 'true');
    Object.assign(spark.style, {
      position: 'fixed',
      left: `${x}px`,
      top: `${y}px`,
      width: '14px',
      height: '3px',
      borderRadius: '3px',
      background: colors[i % colors.length],
      pointerEvents: 'none',
      zIndex: '80',
      transformOrigin: '0 50%',
    });
    document.body.appendChild(spark);
    const animation = spark.animate(
      [
        { transform: `rotate(${angle}rad) translateX(${from}px) scaleX(1)`, opacity: 1 },
        { transform: `rotate(${angle}rad) translateX(${to}px) scaleX(.15)`, opacity: 0 },
      ],
      { duration: 600 + Math.random() * 200, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' },
    );
    animation.onfinish = () => spark.remove();
  }
}
