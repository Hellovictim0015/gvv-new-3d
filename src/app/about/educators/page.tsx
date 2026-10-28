import type { Metadata } from 'next';
import InfoPage from '@/components/shared/InfoPage';
import { EDUCATORS_PAGE } from '@/lib/infoPages';
import { getPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/about/educators');
}

export default function Page() {
  return <InfoPage page={EDUCATORS_PAGE} pageKey="/about/educators" />;
}
