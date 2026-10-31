// Asset URLs for the home 3D island. Kept in their own tiny module so Hero can
// emit <link rel="preload"> tags for them without importing SchoolModelBanner
// (which would drag three.js into the main bundle).
//
// The GLB/HDR files are served with `Cache-Control: immutable` (next.config.ts),
// so whenever one is re-exported it MUST get a new filename (bump the -vN suffix),
// or browsers and Cloudflare keep serving the old file for up to a year.

// Desktop: full textures, dense meshes simplified (~514k triangles, ~4.3MB;
// v2 was ~945k / 7MB).
export const MODEL_URL = '/models/school-v3.glb';
// Phones: 512px textures, simplified harder (~341k triangles, ~2MB; v2 was
// ~674k / 3.9MB).
export const MOBILE_MODEL_URL = '/models/school-mobile-v3.glb';
// 512×256 is plenty for soft sunset lighting/reflections (~0.37MB, was 1.3MB at 1k).
export const HDR_URL = '/hdri/venice_sunset_512.hdr';
// Self-hosted Draco decoder (used by useGLTF for the compressed meshes).
export const DRACO_PATH = '/draco/';

export const DESKTOP_QUERY = '(min-width: 768px)';
export const MOBILE_QUERY = '(max-width: 767.98px)';

// Still renders of each model in its resting pose (transparent WebP, captured
// from the live canvas at the same framing). Shown instantly while the GLB
// downloads, then cross-faded into the real 3D model. Re-capture them whenever
// the model, camera, `fit` or `offsetY` changes.
export const POSTER_URL = '/models/school-v3-poster.webp';
export const MOBILE_POSTER_URL = '/models/school-mobile-v3-poster.webp';
