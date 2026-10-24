import InfoPage from '@/components/shared/InfoPage';
import { MANDATORY_DISCLOSURES_PAGE } from '@/lib/infoPages';

export const metadata = {
  title: `${MANDATORY_DISCLOSURES_PAGE.title} | Garima Vidhya Vihar`,
  description: MANDATORY_DISCLOSURES_PAGE.intro,
};

// Disclosure documents are added from admin → Page Content.
export default function MandatoryDisclosuresPage() {
  return (
    <InfoPage
      page={MANDATORY_DISCLOSURES_PAGE}
      pageKey="/mandatory-disclosures"
      emptyNote={
        <p className="mt-3">
          In the meantime, see our{' '}
          <a href="/about/affiliation" className="text-[#FACC15] underline underline-offset-4 hover:text-white">
            CBSE Affiliation
          </a>{' '}
          page for affiliation code, school code and status.
        </p>
      }
    />
  );
}
