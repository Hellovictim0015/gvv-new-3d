// Asset URLs for the home 3D island. Kept in their own tiny module so Hero can
// emit <link rel="preload"> tags for them without importing SchoolModelBanner
// (which would drag three.js into the main bundle).
//
// The GLB/HDR files are served with `Cache-Control: immutable` (next.config.ts),
// so whenever one is re-exported it MUST get a new filename (bump the -vN suffix),
// or browsers and Cloudflare keep serving the old file for up to a year.

// Desktop: full textures; the over-dense flower bed simplified and the hidden
// robot removed (~7MB, was ~9.8MB).
export const MODEL_URL = '/models/school-v2.glb';
// Phones: same treatment on top of 512px textures (~3.9MB, was ~5.3MB).
export const MOBILE_MODEL_URL = '/models/school-mobile-v2.glb';
// 512×256 is plenty for soft sunset lighting/reflections (~0.37MB, was 1.3MB at 1k).
export const HDR_URL = '/hdri/venice_sunset_512.hdr';
// Self-hosted Draco decoder (used by useGLTF for the compressed meshes).
export const DRACO_PATH = '/draco/';

export const DESKTOP_QUERY = '(min-width: 768px)';
export const MOBILE_QUERY = '(max-width: 767.98px)';
