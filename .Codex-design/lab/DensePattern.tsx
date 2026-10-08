import React, { useId } from 'react';
// Repeat the standalone brand asset directly. The pitch removes its optical
// padding while keeping the complete, upright silhouette and internal cut.
function TinyMark({ x = 0, y = 0, asset, size }: { x?: number; y?: number; asset: string; size: number }) {
  return <image x={x} y={y} width={size} height={size} href={asset} />;
}
export function DensePattern({ className = '', stripe, width, height, spotlight, ripple, shape, colour = '#ff3301', tileSize = 20, aligned = false }: { className?: string; stripe?: 'even' | 'odd'; width?: number; height?: number; spotlight?: boolean; ripple?: boolean; shape?: boolean; colour?: string; tileSize?: number; aligned?: boolean }) {
  const id = useId().replace(/:/g, '');
  const pattern = `${id}-tile`, mask = `${id}-mask`;
  const asset = `/brand/ardeno-mark-${colour === '#f4f4f2' ? 'paper' : colour === '#20211f' ? 'ink' : 'signal'}.svg`;
  const pitch = tileSize * .945;
  const offset = aligned ? 0 : pitch / 2;
  return <svg className={`ml-dense-svg ${className}`} width="100%" height="100%" aria-hidden="true">
    <defs><pattern id={pattern} width={pitch} height={pitch * 2} patternUnits="userSpaceOnUse" patternTransform={stripe === 'odd' ? `translate(${offset} ${pitch})` : undefined}><TinyMark asset={asset} size={tileSize} />{!stripe && <><TinyMark x={offset} y={pitch} asset={asset} size={tileSize} /><TinyMark x={offset - pitch} y={pitch} asset={asset} size={tileSize} /></>}</pattern>
      {(spotlight || shape) && <mask id={mask} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%" style={{ maskType: 'alpha' }}>{shape ? <image href="/brand/ardeno-mark-paper.svg" width="100%" height="100%" /> : <circle className="ml-dense-ripple" cx={(width ?? 1000) / 2} cy={(height ?? 600) / 2} r={Math.hypot(width ?? 1000, height ?? 600) / 2} fill={ripple ? 'none' : 'white'} stroke={ripple ? 'white' : undefined} strokeWidth={ripple ? Math.min(width ?? 1000, height ?? 600) * .2 : undefined} style={{ transformOrigin: 'center', transformBox: 'fill-box' }} />}</mask>}
    </defs><rect width="100%" height="100%" fill={`url(#${pattern})`} mask={spotlight || shape ? `url(#${mask})` : undefined} />
  </svg>;
}
