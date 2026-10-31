// Content for the menu pages that render through <InfoPage>. Each page's body
// is admin-managed: entries come from the `page_entries` table keyed by the
// page's route (see CONTENT_PAGES below and admin → Page Content).
// EVENT_PAGES also drive the admin "Events & Activities" categories
// (their items come from the `events` table).

export type InfoPageDef = {
  title: string;
  section: string;
  intro: string;
};

export const ACADEMIC_PAGES: Record<string, InfoPageDef> = {
  pedagogy: {
    title: 'Pedagogy',
    section: 'Academics · Curriculum',
    intro: 'Learning that evolves with every stage.',
  },
  syllabus: {
    title: 'Syllabus',
    section: 'Academics · Curriculum',
    intro: 'Class-wise CBSE syllabus for the current academic session.',
  },
  courses: {
    title: 'Courses Offered',
    section: 'Academics · Curriculum',
    intro: 'Stream subjects offered for Grades XI and XII.',
  },
  evaluation: {
    title: 'Evaluation Pattern',
    section: 'Academics · Assessment',
    intro: 'Our assessment scheme — periodic tests, term examinations and continuous evaluation, as per CBSE guidelines.',
  },
  'date-sheet': {
    title: 'Exam Date Sheet',
    section: 'Academics · Assessment',
    intro: 'Date sheets for the upcoming periodic tests and term examinations.',
  },
  'external-date-sheet': {
    title: 'External Exam Date Sheet',
    section: 'Academics · Assessment',
    intro: 'Date sheets for Olympiads, competitive and other external examinations.',
  },
  'board-results': {
    title: 'Results of Board Examination',
    section: 'Academics · Results',
    intro: 'CBSE Class X and Class XII board examination results of our students.',
  },
  // 'external-results' has its own admin-managed page: src/app/academic/external-results
};

export const EVENT_PAGES: Record<string, InfoPageDef> = {
  'school-events': {
    title: 'School Events',
    section: 'Events and Activities',
    intro: 'Annual functions, celebrations and special days across the school calendar.',
  },
  'inter-house': {
    title: 'Inter House Events',
    section: 'Events and Activities',
    intro: 'Competitions between our houses in sports, arts, debate and more.',
  },
  'inter-school': {
    title: 'Inter School Events',
    section: 'Events and Activities',
    intro: 'Competitions and events where our students represent Garima Vidya Vihar.',
  },
  clubs: {
    title: 'School Clubs',
    section: 'Events and Activities',
    intro: 'Clubs that let students explore interests beyond the classroom — robotics, science, literary, eco and more.',
  },
  tours: {
    title: 'Tours and Excursions',
    section: 'Events and Activities',
    intro: 'Educational tours, field trips and excursions organised for our students.',
  },
};

export const EDUCATORS_PAGE: InfoPageDef = {
  title: 'Our Educators',
  section: 'About Us',
  intro: 'Meet the teaching staff of Garima Vidya Vihar.',
};

export const PROSPECTUS_PAGE: InfoPageDef = {
  title: 'Prospectus',
  section: 'Admissions',
  intro: 'The Garima Vidya Vihar prospectus — everything parents need to know about the school, admissions and fees.',
};

export const MANDATORY_DISCLOSURES_PAGE: InfoPageDef = {
  title: 'Mandatory Disclosures',
  section: 'CBSE',
  intro:
    'CBSE-mandated disclosure documents for Garima Vidhya Vihar — affiliation details, infrastructure and academic records.',
};

// Every page whose body is admin-managed via `page_entries`, keyed by route.
// The admin "Page Content" dropdown lists these in this order.
// (Pedagogy and Courses Offered have fixed content — src/components/academic —
// so they are not admin-managed.)
export const STATIC_ACADEMIC_PAGES = new Set(['pedagogy', 'courses']);

export const CONTENT_PAGES: Record<string, InfoPageDef> = {
  ...Object.fromEntries(
    Object.entries(ACADEMIC_PAGES)
      .filter(([slug]) => !STATIC_ACADEMIC_PAGES.has(slug))
      .map(([slug, page]) => [`/academic/${slug}`, page]),
  ),
  '/about/educators': EDUCATORS_PAGE,
  '/mandatory-disclosures': MANDATORY_DISCLOSURES_PAGE,
};
