'use client';
import { useRef, useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// iOS Safari resizes the viewport whenever its address bar shows/hides; by
// default that triggers a ScrollTrigger refresh mid-scroll, which re-measures
// the pin and makes the page jump. Ignore those height-only resizes.
ScrollTrigger.config({ ignoreMobileResize: true });

/**
 * A scroll-scrubbed, pinned, full-screen "video" section (every device).
 *
 * Plays a pre-extracted IMAGE SEQUENCE on a <canvas> instead of seeking a
 * <video>: iPhone Safari seeks video far too slowly (and won't buffer it ahead),
 * so the clip froze on one frame while scrolling. Drawing a decoded frame is
 * instant everywhere.
 *
 * Frames live in /public/frames/<name>/<width>/0001.webp … (extracted from the
 * source mp4 with ffmpeg: `-vf scale=<width>:-2 -c:v libwebp -quality 72`).
 * Phones load the 720px set and only every 2nd frame to keep decoded-image
 * memory low (iOS kills tabs that use too much); larger screens load 1280px,
 * every frame.
 */
export default function ScrubVideo({
  frames,
  frameCount,
  title = '',
  subtitle = '',
  objectFit = 'cover',
  className = '',
  pingPong = false,
  poster = '',
}) {
  const container = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]); // index → HTMLImageElement once decoded
  const indicesRef = useRef([]); // frame numbers (1-based) this device loads
  const progressRef = useRef(0);

  // Don't download the frames on initial page load — the section is usually
  // far down the page. Start once it's within ~2 viewports of the scroll
  // position. (Deterministic scroll check, NOT IntersectionObserver — that fired
  // during initial layout before the tall 3D hero set the page height.)
  const [shouldLoad, setShouldLoad] = useState(false);
  useEffect(() => {
    const el = container.current;
    if (!el || shouldLoad) return;
    const check = () => {
      if (window.scrollY <= 0) return;
      if (el.getBoundingClientRect().top < window.innerHeight * 2) {
        setShouldLoad(true);
        window.removeEventListener('scroll', check);
        window.removeEventListener('resize', check);
      }
    };
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    const t = setTimeout(check, 1200); // reload restored near this section
    return () => {
      clearTimeout(t);
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, [shouldLoad]);

  // Draw the frame for the current scroll progress (nearest loaded one).
  const draw = () => {
    const canvas = canvasRef.current;
    const indices = indicesRef.current;
    if (!canvas || !indices.length) return;
    const p = pingPong ? 1 - Math.abs(2 * progressRef.current - 1) : progressRef.current;
    const want = Math.round(p * (indices.length - 1));
    let img = null;
    for (let d = 0; d < indices.length && !img; d++) {
      img = imagesRef.current[want - d] || imagesRef.current[want + d] || null;
    }
    if (!img) return;

    const ctx = canvas.getContext('2d');
    const cw = canvas.width;
    const ch = canvas.height;
    const scale =
      objectFit === 'contain'
        ? Math.min(cw / img.naturalWidth, ch / img.naturalHeight)
        : Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  };

  // Size the canvas to the section in device pixels (capped at 2x).
  useEffect(() => {
    const canvas = canvasRef.current;
    const el = container.current;
    if (!canvas || !el) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(el.clientWidth * dpr);
      canvas.height = Math.round(el.clientHeight * dpr);
      draw();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load the frame sequence: first frame, then the rest in order.
  useEffect(() => {
    if (!shouldLoad) return;
    const small = window.matchMedia('(max-width: 900px)').matches;
    const width = small ? 720 : 1280;
    const step = small ? 2 : 1;
    const indices = [];
    for (let i = 1; i <= frameCount; i += step) indices.push(i);
    if (indices[indices.length - 1] !== frameCount) indices.push(frameCount);
    indicesRef.current = indices;
    imagesRef.current = new Array(indices.length).fill(null);

    let cancelled = false;
    const loadOne = (slot) =>
      new Promise((resolve) => {
        const img = new Image();
        img.src = `${frames}/${width}/${String(indices[slot]).padStart(4, '0')}.webp`;
        // decode() up front so drawing during scroll never stalls on decoding.
        (img.decode ? img.decode() : new Promise((r, j) => { img.onload = r; img.onerror = j; }))
          .then(() => {
            if (cancelled) return;
            imagesRef.current[slot] = img;
            draw();
          })
          .catch(() => {})
          .finally(resolve);
      });

    (async () => {
      await loadOne(0);
      // A few parallel lanes: fast enough to finish before the user arrives,
      // without flooding a phone's connection.
      let next = 1;
      const lane = async () => {
        while (!cancelled && next < indices.length) await loadOne(next++);
      };
      await Promise.all([lane(), lane(), lane(), lane()]);
    })();

    return () => {
      cancelled = true;
      imagesRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldLoad, frames, frameCount]);

  useGSAP(
    () => {
      const st = ScrollTrigger.create({
        trigger: container.current,
        start: 'top top',
        end: '+=300%',
        scrub: 0.5,
        pin: true,
        // A sibling above this section uses a negative margin (GarimaImpact's
        // torn-paper overlap), which shifts this section's page position. Recompute
        // the pin start/end on every refresh so a layout shift can't leave the pin
        // measured against stale geometry.
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          progressRef.current = self.progress;
          draw();
        },
      });
      return () => st.kill();
    },
    { scope: container },
  );

  return (
    <section
      ref={container}
      className={`relative flex h-[100svh] w-full items-center justify-center overflow-hidden bg-black bg-cover bg-center ${className}`}
      style={poster ? { backgroundImage: `url(${poster})` } : undefined}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
      {(title || subtitle) && (
        <div className="pointer-events-none absolute inset-x-0 bottom-10 z-10 px-6 text-center mix-blend-difference md:bottom-14">
          {title && (
            <h2 className="text-5xl font-black tracking-tighter text-white md:text-7xl lg:text-8xl">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="font-mono text-lg text-blue-300 md:text-2xl">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
