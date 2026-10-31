import { DESKTOP_QUERY, MOBILE_POSTER_URL, POSTER_URL } from './schoolModelAssets';

// Still image of the 3D island, laid out exactly like the WebGL canvas (same
// box, height-driven size, centred) so the hand-off to the live model is
// seamless. No three.js here — Hero also renders it before the 3D chunk loads.
export default function SchoolPoster({ hidden = false }: { hidden?: boolean }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 bottom-4 top-0 overflow-hidden transition-opacity duration-700 ${
        hidden ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <picture>
        <source media={DESKTOP_QUERY} srcSet={POSTER_URL} />
        <img
          src={MOBILE_POSTER_URL}
          alt=""
          fetchPriority="high"
          decoding="async"
          className="absolute left-1/2 top-0 h-full w-auto max-w-none -translate-x-1/2"
        />
      </picture>
    </div>
  );
}
