// Exam format + schedule for session 2026-27, as supplied by the school
// (image "EXAM FORMAT + SCHEDULE"). Rows are copied as given.

type Row = { component: string; max: string; weight: string };
type TermBlock = { term: string; rows: Row[]; note?: string };
type ClassGroup = { classes: string; subjects: string[]; optional?: string[]; terms: TermBlock[] };

const STANDARD_TERM = (term: string, mid: string, last: string): TermBlock => ({
  term,
  rows: [
    { component: mid, max: '25 Marks', weight: '05 Marks' },
    { component: 'MA', max: '05 Marks', weight: '05 Marks' },
    { component: 'SE', max: '05 Marks', weight: '05 Marks' },
    { component: 'PF', max: '05 Marks', weight: '05 Marks' },
    { component: last, max: '80 Marks', weight: '80 Marks' },
  ],
});

const SENIOR_ROWS: Row[] = [
  { component: 'PT - 1', max: '50 Marks', weight: '-' },
  { component: 'Half Yearly', max: '50/70/80 Marks', weight: '-' },
  { component: 'PT - 2', max: '50 Marks', weight: '-' },
  { component: 'Pre-Board', max: '50/70/80 Marks', weight: '-' },
  { component: 'Annual', max: '50/70/80 Marks', weight: '-' },
];

const GROUPS: ClassGroup[] = [
  {
    classes: 'Nursery to UKG',
    subjects: ['English (O + W)', 'Hindi (O + W)', 'Maths (O + W)'],
    terms: [
      {
        term: 'I Term · II Term · III Term',
        rows: [
          { component: 'Oral', max: '20', weight: '-' },
          { component: 'Written', max: '30', weight: '-' },
          { component: 'Total', max: '50', weight: '-' },
        ],
      },
    ],
  },
  {
    classes: 'I to V',
    subjects: ['English', 'Hindi', 'Maths', 'EVS', 'Computer', 'G.K. (Grade)'],
    terms: [STANDARD_TERM('I Term', 'PT (1)', 'Half Yearly'), STANDARD_TERM('II Term', 'PT (2)', 'Annual')],
  },
  {
    classes: 'VI to VIII',
    subjects: ['English', 'Hindi', 'Sanskrit', 'Maths', 'Science', 'Social Science', 'Computer', 'G.K. (Grade)'],
    terms: [STANDARD_TERM('I Term', 'PT (1)', 'Half Yearly'), STANDARD_TERM('II Term', 'PT (2)', 'Annual')],
  },
  {
    classes: 'IX to X',
    subjects: ['English', 'Hindi', 'Maths', 'Science', 'Social Science', 'IT', 'AI'],
    terms: [
      {
        term: 'I Term',
        note: 'Best 2 of PT-1, PT-2 and PT-3 → 05 Marks weightage',
        rows: [
          { component: 'PT - 1', max: '50 Marks', weight: '05 Marks (Best 2)' },
          { component: 'PT - 2', max: '80 Marks', weight: '' },
          { component: 'PT - 3', max: '50 Marks', weight: '' },
          { component: 'MA', max: '80 Marks', weight: '' },
          { component: 'SE', max: '05 Marks', weight: '05 Marks' },
          { component: 'PF', max: '05 Marks', weight: '05 Marks' },
          { component: 'Pre-Board', max: '05 Marks', weight: '05 Marks' },
          { component: 'Annual', max: '80 Marks', weight: '80 Marks' },
        ],
      },
    ],
  },
  {
    classes: 'XI to XII (PCM & PCB)',
    subjects: ['English', 'Physics', 'Chemistry', 'Biology', 'Maths', 'Physical Education'],
    optional: ['Computer Science', 'Artificial Intelligence', 'Entrepreneurship', 'Hindi'],
    terms: [{ term: 'I Term', rows: SENIOR_ROWS }],
  },
  {
    classes: 'XI to XII (Commerce)',
    subjects: ['English', 'Accountancy', 'Economics', 'Business Study', 'Physical Education'],
    optional: ['Informatics Practices', 'Artificial Intelligence', 'Entrepreneurship', 'Hindi', 'Applied Maths'],
    terms: [{ term: 'I Term', rows: SENIOR_ROWS }],
  },
];

function Subjects({ group }: { group: ClassGroup }) {
  return (
    <>
      <p className="leading-relaxed">{group.subjects.join(', ')}</p>
      {group.optional && (
        <p className="mt-1.5 leading-relaxed">
          <span className="font-semibold text-[#EED165]">Optional: </span>
          {group.optional.join(', ')}
        </p>
      )}
    </>
  );
}

const th = 'border border-white/15 px-3 py-3 text-xs font-bold uppercase tracking-wider text-white';
const td = 'border border-white/10 px-3 py-2 align-top';

export default function EvaluationContent() {
  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold italic text-white md:text-3xl">Exam Format + Schedule</h2>
        <p className="mt-1 font-semibold text-[#EED165]">Session 2026-27</p>
      </div>

      {/* Desktop / tablet: the table as in the school's sheet */}
      <div className="hidden overflow-x-auto rounded-2xl border border-blue-500/30 bg-[#0a1445]/70 shadow-xl md:block">
        <table className="w-full border-collapse text-sm text-blue-100/85">
          <thead className="bg-gradient-to-r from-[#1666b0] to-[#1d4fa3]">
            <tr>
              <th className={th}>S.No.</th>
              <th className={th}>Class</th>
              <th className={th}>Subject</th>
              <th className={th}>Term</th>
              <th className={th}>Component</th>
              <th className={th}>Max. Marks</th>
              <th className={th}>Weightage</th>
            </tr>
          </thead>
          <tbody>
            {GROUPS.map((group, gi) => {
              const span = group.terms.reduce((n, t) => n + t.rows.length, 0);
              return group.terms.flatMap((term, ti) =>
                term.rows.map((row, ri) => (
                  <tr key={`${gi}-${ti}-${ri}`} className={gi % 2 ? 'bg-white/[0.02]' : ''}>
                    {ti === 0 && ri === 0 && (
                      <>
                        <td rowSpan={span} className={`${td} text-center font-semibold text-white`}>{gi + 1}</td>
                        <td rowSpan={span} className={`${td} whitespace-nowrap font-semibold text-white`}>{group.classes}</td>
                        <td rowSpan={span} className={`${td} min-w-[220px]`}>
                          <Subjects group={group} />
                        </td>
                      </>
                    )}
                    {ri === 0 && (
                      <td rowSpan={term.rows.length} className={`${td} whitespace-nowrap font-medium text-white`}>
                        {term.term}
                      </td>
                    )}
                    <td className={td}>{row.component}</td>
                    <td className={`${td} whitespace-nowrap`}>{row.max}</td>
                    <td className={`${td} whitespace-nowrap`}>{row.weight}</td>
                  </tr>
                )),
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Phones: one card per class group */}
      <div className="space-y-5 md:hidden">
        {GROUPS.map((group) => (
          <div key={group.classes} className="overflow-hidden rounded-2xl border border-blue-500/30 bg-[#0a1445]/70">
            <div className="bg-gradient-to-r from-[#1666b0] to-[#1d4fa3] px-4 py-3 font-bold text-white">{group.classes}</div>
            <div className="border-b border-white/10 px-4 py-3 text-sm text-blue-100/85">
              <Subjects group={group} />
            </div>
            {group.terms.map((term) => (
              <div key={term.term} className="px-4 py-3">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#EED165]">{term.term}</p>
                <table className="w-full text-sm text-blue-100/85">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wider text-blue-300/70">
                      <th className="pb-1 font-semibold">Component</th>
                      <th className="pb-1 font-semibold">Max.</th>
                      <th className="pb-1 font-semibold">Weightage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {term.rows.map((row) => (
                      <tr key={row.component}>
                        <td className="py-1.5 pr-2 text-white">{row.component}</td>
                        <td className="py-1.5 pr-2">{row.max}</td>
                        <td className="py-1.5">{row.weight}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {term.note && <p className="mt-2 text-xs text-blue-300/80">{term.note}</p>}
              </div>
            ))}
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-blue-300/70">
        PT – Periodic Test · MA – Multiple Assessment · SE – Subject Enrichment · PF – Portfolio
      </p>
    </div>
  );
}
