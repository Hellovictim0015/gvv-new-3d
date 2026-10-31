import { CircleCheck } from 'lucide-react';

// Stream subjects for Grades XI and XII, as supplied by the school.
const STREAMS = [
  {
    name: 'Science Stream (PCM/PCB)',
    subjects: ['English Core', 'Physics', 'Chemistry', 'Math/Biology', 'Physical Education'],
  },
  {
    name: 'Commerce Stream',
    subjects: ['English Core', 'Accountancy', 'Business Studies', 'Economics', 'Physical Education'],
  },
  {
    name: 'Humanities',
    subjects: ['English Core', 'History', 'Political Science', 'Economics', 'Physical Education'],
  },
  {
    name: 'Optional Subjects',
    subjects: [
      'Hindi',
      'Math/Applied Mathematics',
      'Computer Science',
      'Informatics Practices',
      'Artificial Intelligence',
      'Entrepreneurship',
    ],
  },
];

export default function CoursesContent() {
  return (
    <div className="overflow-hidden rounded-2xl border border-blue-500/30 bg-[#0a1445]/70 shadow-xl backdrop-blur-sm">
      <div className="bg-gradient-to-r from-[#1666b0] to-[#1d4fa3] px-6 py-5 text-center">
        <h2 className="text-2xl font-bold text-white md:text-3xl">XI and XII</h2>
        <p className="mt-1 text-sm text-blue-100 md:text-base">Stream subjects for Grades 11th and 12th</p>
      </div>
      <div className="grid gap-px bg-blue-500/20 sm:grid-cols-2 lg:grid-cols-4">
        {STREAMS.map((stream) => (
          <div key={stream.name} className="bg-[#0a1445] p-6">
            <h3 className="mb-4 text-lg font-bold text-white">{stream.name}</h3>
            <ul className="space-y-3">
              {stream.subjects.map((subject) => (
                <li key={subject} className="flex items-start gap-2.5 text-blue-100/85">
                  <CircleCheck size={18} className="mt-0.5 shrink-0 text-[#F5C842]" />
                  <span>{subject}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
