import type { Metadata } from 'next';
import PageShell from '@/components/landing/PageShell';
import ProspectusList from '@/components/shared/ProspectusList';
import { PROSPECTUS_PAGE } from '@/lib/infoPages';

export const metadata: Metadata = {
  title: `${PROSPECTUS_PAGE.title} | Garima Vidhya Vihar`,
  description: PROSPECTUS_PAGE.intro,
};

export default function Page() {
  return (
    <PageShell>
      <section className="relative px-6 pb-12 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/25 via-transparent to-transparent pointer-events-none z-0" />
        <div className="relative z-10 mx-auto max-w-3xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-[#EED165]">{PROSPECTUS_PAGE.section}</p>
          <h1 className="mb-6 bg-gradient-to-b from-blue-300 via-blue-500 to-blue-900 bg-clip-text text-4xl font-black tracking-tight text-transparent md:text-6xl">
            {PROSPECTUS_PAGE.title}
          </h1>
          <p className="mx-auto text-lg leading-relaxed text-blue-200/70">{PROSPECTUS_PAGE.intro}</p>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <ProspectusList />
      </div>
    </PageShell>
  );
}
