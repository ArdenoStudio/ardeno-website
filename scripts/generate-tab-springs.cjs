// Usage: node scripts/generate-tab-springs.cjs
// Regenerates the spring easings (CSS linear()) used by the Let's talk tab in components/Website/navigation.css.
const fs = require('fs');
const file = require('path').join(__dirname, '..', 'components', 'Website', 'navigation.css');

// Step response of a damped spring over normalised time 0..1 (underdamped, zeta < 1).
function spring(zeta, omega, samples) {
  const wd = omega * Math.sqrt(1 - zeta * zeta);
  const pts = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const v = 1 - Math.exp(-zeta * omega * t) * (Math.cos(wd * t) + (zeta * omega / wd) * Math.sin(wd * t));
    pts.push(i === samples ? 1 : Math.round(v * 1000) / 1000);
  }
  return `linear(${pts.join(',')})`;
}

const drop = spring(0.55, 9.5, 36);   // lands with one soft overshoot
const swing = spring(0.17, 26, 110);  // pendulum: several decaying swings
const pull = spring(0.5, 11, 40);     // gentle bounce for hover and the compact bar
const soft = spring(0.8, 12, 40);     // barely overshoots; for underlines and fills
const snap = spring(0.42, 14, 60);    // lively click with a couple of wobbles; for the logo mark

const block = `/* Spring easings shared by the site (tab, hero buttons), plus the hanging-tab motion (desktop only): drops in and swings like a hanging tag, then springs down a little when pulled.
   Real damped-spring curves (CSS linear() easing); browsers without it fall back to a plain overshoot curve. */
:root{--spring-drop:cubic-bezier(.34,1.4,.64,1);--spring-swing:cubic-bezier(.34,1.4,.64,1);--spring-pull:cubic-bezier(.34,1.4,.64,1);--spring-soft:cubic-bezier(.3,1.05,.5,1);--spring-snap:cubic-bezier(.3,1.5,.5,1)}
@supports (animation-timing-function:linear(0,1)){:root{--spring-drop:${drop};--spring-swing:${swing};--spring-pull:${pull};--spring-soft:${soft};--spring-snap:${snap}}}
@keyframes tab-drop{from{translate:0 -100%}to{translate:0 0}}
@keyframes tab-swing{from{rotate:9deg}to{rotate:0deg}}
@media(min-width:761px){
.site-header .header-contact{position:relative;transform-origin:50% 0;animation:tab-drop 850ms var(--spring-drop) .3s backwards,tab-swing 1900ms var(--spring-swing) .55s backwards;transition:min-height 520ms var(--spring-pull),padding-bottom 520ms var(--spring-pull),transform 560ms var(--spring-pull)}
.site-header .header-contact::before{content:"";position:absolute;inset:auto 0 100%;height:24px;background:inherit}
.site-header .header-contact:is(:hover,:focus-visible){transform:translateY(8px)}
.site-header .header-contact svg{transition:transform 460ms var(--spring-pull)}
.site-header .header-contact:is(:hover,:focus-visible) svg{transform:translate(2px,-1px) rotate(45deg)}
}`;

let css = fs.readFileSync(file, 'utf8');
const start = css.indexOf('/* Spring easings shared by the site');
const end = css.indexOf('@media(prefers-reduced-motion:reduce){.site-header,');
if (start < 0 || end < 0 || end < start) throw new Error('markers not found');
css = css.slice(0, start) + block + '\n' + css.slice(end);
fs.writeFileSync(file, css);
console.log('rewrote block; drop pts', drop.length, 'swing chars', swing.length, 'pull chars', pull.length);
// Report the peaks so the motion can be sanity-checked.
const peak = (s) => Math.max(...s.slice(7, -1).split(',').map(Number));
console.log('drop peak', peak(drop), 'swing peak', peak(swing), 'pull peak', peak(pull));
