// Partner logos are uploaded from Admin → Site Images ("Knowledge Partner
// Logo 1–8"); empty slots are skipped. Until at least one logo exists the
// section shows placeholder tiles marking where the logos will go.
const PLACEHOLDER_COUNT = 4;

const tileClass =
  'flex h-24 w-40 md:h-28 md:w-48 items-center justify-center rounded-xl p-4 shadow-lg';

export default function KnowledgePartners({ logos }: { logos: string[] }) {
  return (
    <section className="w-full py-20 px-4 md:px-8 flex flex-col items-center font-sans">
      <h2 className="text-white text-3xl md:text-4xl font-bold tracking-wide mb-12 text-center">
        Knowledge Partners
      </h2>
      <div className="w-full max-w-6xl flex flex-wrap items-center justify-center gap-4 md:gap-6">
        {logos.length > 0
          ? logos.map((src, i) => (
              <div
                key={src}
                className={`${tileClass} bg-white transition-transform duration-300 hover:-translate-y-1`}
              >
                <img src={src} alt={`Knowledge partner ${i + 1}`} loading="lazy" className="max-h-full max-w-full object-contain" />
              </div>
            ))
          : Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => (
              <div
                key={i}
                aria-hidden
                className={`${tileClass} border-2 border-dashed border-white/20 bg-white/5 text-xs font-semibold uppercase tracking-widest text-white/30`}
              >
                Partner Logo
              </div>
            ))}
      </div>
    </section>
  );
}
