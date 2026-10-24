import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageShell from '@/components/landing/PageShell';
import EventList from '@/components/shared/EventList';
import { EVENT_PAGES } from '@/lib/infoPages';

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(EVENT_PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = EVENT_PAGES[(await params).slug];
  return page ? { title: `${page.title} | Garima Vidhya Vihar`, description: page.intro } : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = EVENT_PAGES[slug];
  if (!page) notFound();
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
        <EventList category={slug} />
      </div>
    </PageShell>
  );
}
