import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import InfoPage from '@/components/shared/InfoPage';
import PedagogyContent from '@/components/academic/PedagogyContent';
import CoursesContent from '@/components/academic/CoursesContent';
import { ACADEMIC_PAGES } from '@/lib/infoPages';

export const dynamicParams = false;

// Pages with fixed content instead of admin → Page Content entries.
const STATIC_CONTENT: Record<string, React.ReactNode> = {
  pedagogy: <PedagogyContent />,
  courses: <CoursesContent />,
};

export function generateStaticParams() {
  return Object.keys(ACADEMIC_PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = ACADEMIC_PAGES[(await params).slug];
  return page ? { title: `${page.title} | Garima Vidhya Vihar`, description: page.intro } : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = ACADEMIC_PAGES[slug];
  if (!page) notFound();
  return <InfoPage page={page} pageKey={`/academic/${slug}`}>{STATIC_CONTENT[slug]}</InfoPage>;
}
