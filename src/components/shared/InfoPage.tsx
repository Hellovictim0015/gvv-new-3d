import PageShell from '@/components/landing/PageShell';
import PageEntries from '@/components/shared/PageEntries';
import type { InfoPageDef } from '@/lib/infoPages';

// `pageKey` is the page's route — its body comes from admin → Page Content.
// `emptyNote` is extra text shown under the placeholder while no entries exist.
export default function InfoPage({
  page,
  pageKey,
  emptyNote,
}: {
  page: InfoPageDef;
  pageKey: string;
  emptyNote?: React.ReactNode;
}) {
  return (
    <PageShell>
      <section className="relative px-6 pb-12 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/25 via-transparent to-transparent pointer-events-none z-0" />
        <div className="relative z-10 mx-auto max-w-3xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-[#EED165]">{page.section}</p>
          <h1 className="mb-6 bg-gradient-to-b from-blue-300 via-blue-500 to-blue-900 bg-clip-text text-4xl font-black tracking-tight text-transparent md:text-6xl">
            {page.title}
          </h1>
          <p className="mx-auto text-lg leading-relaxed text-blue-200/70">{page.intro}</p>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <PageEntries pageKey={pageKey} emptyNote={emptyNote} />
      </div>
    </PageShell>
  );
}
