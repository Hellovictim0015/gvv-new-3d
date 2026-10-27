// Single source of truth for the header menus and footer links.

export type NavLink = { label: string; href: string };
export type NavGroup = { title: string; links: NavLink[] };

export const admissionLinks: NavLink[] = [
  { label: 'Admission Process', href: '/process' },
  { label: 'Fee Structure', href: '/fees' },
  { label: 'GVV Uniform', href: '/uniform' },
  { label: 'Prospectus', href: '/admission/prospectus' },
];

export const academicGroups: NavGroup[] = [
  {
    title: 'Curriculum',
    links: [
      { label: 'Curriculum', href: '/academic/planner' },
      { label: 'Pedagogy', href: '/academic/pedagogy' },
      { label: 'Syllabus', href: '/academic/syllabus' },
      { label: 'Courses Offered', href: '/academic/courses' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Book List', href: '/academic/books' },
      { label: 'Academic Downloads', href: '/about/resources' },
    ],
  },
  {
    title: 'Examination',
    links: [
      { label: 'Evaluation Pattern', href: '/academic/evaluation' },
      { label: 'Exam Date Sheet', href: '/academic/date-sheet' },
    ],
  },
  {
    title: 'Results',
    links: [
      { label: 'Board Results', href: '/academic/board-results' },
      { label: 'Results of External Exams', href: '/academic/external-results' },
    ],
  },
];

export const eventLinks: NavLink[] = [
  { label: 'School Events', href: '/events/school-events' },
  { label: 'Inter House Events', href: '/events/inter-house' },
  { label: 'Inter School Events', href: '/events/inter-school' },
  { label: 'School Clubs', href: '/events/clubs' },
  { label: 'Tours and Excursions', href: '/events/tours' },
];

export const aboutLinks: NavLink[] = [
  { label: 'Vision and Mission', href: '/about/introduction' },
  { label: 'School Management', href: '/about/management' },
  { label: 'Infrastructure and Facilities', href: '/about/what-we-offer' },
  { label: 'Our Educators (Staff)', href: '/about/educators' },
  { label: 'Fee Structure', href: '/fees' },
  { label: 'Uniform', href: '/uniform' },
  { label: 'Achievements', href: '/about/achievements' },
  { label: 'Gallery', href: '/about/gallery-media' },
  { label: 'Beyond Academics', href: '/robotics' },
  { label: 'Mandatory Disclosure', href: '/mandatory-disclosures' },
];

// Footer: one "About Us" list, in the order the school asked for.
export const footerLinks: NavLink[] = [
  { label: 'Admissions', href: '/admission' },
  { label: 'Articles / Blogs', href: '/articles' },
  { label: 'Gallery', href: '/about/gallery-media' },
  { label: 'Book List', href: '/academic/books' },
  { label: 'Annual Report', href: '/about/report' },
  { label: 'Best School in Indore with Affordable Fee', href: '/fees' },
  { label: 'Committees and Staff', href: '/about/committees' },
  { label: 'Academic Calendar', href: '/academic/calendar' },
  { label: 'Uniform', href: '/uniform' },
  { label: 'TC / Mandatory Disclosure', href: '/mandatory-disclosures' },
];

// Footer "Know More": SEO keyword pages carried over from the old site, kept at
// their old URLs (content: src/data/seoLandingPages.json).
export const keywordLinks: NavLink[] = [
  { label: 'Best Senior Secondary School in Indore', href: '/best-senior-secondary-school-in-indore-3' },
  { label: 'Best CBSE School in Indore', href: '/garima-vidya-vihar-senior-secondary-school-best-cbse-school-in-indore' },
  { label: 'Best Primary School in Indore', href: '/best-primary-school-in-indore' },
  { label: 'Best School near Airport', href: '/best-school-near-airport' },
  { label: 'Best School in MP', href: '/best-school-in-mp' },
  { label: 'Best School in Indore', href: '/best-school-in-indore' },
];

// Footer bottom bar: policy pages carried over from the old site (needed for
// the online fee-payment gateway), served at their old URLs.
export const policyLinks: NavLink[] = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms and Conditions', href: '/terms-and-conditions' },
  { label: 'Refund & Cancellation Policy', href: '/refund-cancellation-policy' },
  { label: 'Shipping & Delivery Policy', href: '/shipping-and-delivery-policy' },
];
