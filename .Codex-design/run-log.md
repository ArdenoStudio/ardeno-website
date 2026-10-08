# Ardeno monogram exploration — 8 October 2026

Five first-entry concepts, using the original A path and current brand palette. Preview only; loader-free normal startup remains active. Development URL: http://127.0.0.1:3000/?design_lab=loaders

Research: Codrops repetition and layer reveals; Motion stagger and physical springs; web.dev guidance to animate transforms and opacity. No LV marks or ornamental symbols have been reused.

Playback controls: replay, pause, timeline scrubbing, speed and full-screen review. Reduced motion displays a still instead of playing. FeedbackOverlay supports click-to-comment and clipboard export for the chat.

Verified: TypeScript and production build passed. Browser checks covered all five scenes, spring transforms, replay/pause/speed/skip, full-screen focus and Escape, a 375px mobile layout, reduced-motion stills, and saving/removing feedback notes. Screenshot evidence is in output/website/loader-motion-lab.jpg and loader-variants.jpg. Fixed timeline updates after seeking backwards and replaying.

Pending: user comparison and selection. After choosing/finalising or cancelling, remove the temporary .Codex-design lab and its development-only App entry. Preserve the existing site and unrelated user changes.

## Refinement rounds

- Dense interlocking repeats initially merged the A silhouettes. User rejected them. Replaced with the original standalone SVG assets, upright and intact.
- Researched Apple HIG motion/loading, WWDC23 springs, and the R–K portfolio creator’s reveal process. See research-round-3.md. Refined F–J around a clear large A and quieter textures; I contains tiny As inside the real large A silhouette.
- User liked the background of J Studio veil and asked for background variants, explicitly keeping the same colour. Added K–O: Original weave, Aligned rows, Passing light, Quiet centre and Fine grain. All use Ink #20211f and Paper #f4f4f2, the same large A and 1.1s entrance. No warm tint or different foreground colours.
- Comparison starts paused at 550ms so backgrounds are immediately inspectable. Replay/fullscreen plays the entrance. Previous F–J remain behind the comparison toggle.
- Browser verification: all five backgrounds resolve to rgb(32,33,31), share /brand/ardeno-mark-paper.svg, and show the expected layout/density differences. Passing light’s animated mask, replay/pause/skip, full-screen/Escape and return to the comparison still verified. A fresh load has no runtime errors. A 375px mobile layout fits without overflow and uses a 150px focal mark; reduced motion remains paused at 550ms. Native browser screenshot evidence: output/website/loader-background-variants.jpg.
- Final TypeScript and production build checks passed. The development lab is absent from the generated production JS/CSS, confirmed by searching its unique names and classes. Normal site startup is still loader-free.

## Wordmark and background motion — round 5

- Removed the large central A from K–O, including card previews. Only the original paper Ardeno wordmark, small studio text, and the micro-A texture remain. Removed the previous-study toggle from the current comparison UI.
- Added five 1.5s treatments in the same ink/paper palette: Depth reveal, Silk current, Light cascade, Centre ripple, and Layered lift. The geometry is the original upright A asset, rendered efficiently through SVG patterns. Movement uses transforms/opacity, spring settlement, two light passes or one expanding pulse, and a short fade into the ready page.
- Choosing a direction plays it immediately; initial comparison remains paused at 550ms. Fullscreen returns to that still and restores keyboard focus to its trigger. Reduced motion pauses playback.
- Browser checks covered all five at 300ms: expected physical transforms, ink rgb(32,33,31), no central A elements, and the original wordmark. Replay/pause/speed, timeline, skip, fullscreen/Escape, focus return and reduced-motion state passed. The 375px layout fits without page overflow; the wordmark remains centred and readable. TypeScript and production build passed, and the lab remains excluded from production assets.
- Screenshot evidence: output/website/loader-wordmark-motion.jpg. Preview only; pending user comparison and selection.
