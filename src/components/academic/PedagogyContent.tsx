import { Blocks, FlaskConical, Lightbulb, Search } from 'lucide-react';

// Content supplied by the school (Pedagogy.docx).
const STAGES = [
  {
    stage: 'Foundation Stage',
    approach: 'Activity-Based Learning',
    tagline: 'Learn through Play.',
    text: 'Play, stories, music, movement, and hands-on activities build foundational literacy, numeracy, social skills, and a love for learning.',
    icon: Blocks,
  },
  {
    stage: 'Preparatory Stage',
    approach: 'Inquiry-Based Learning',
    tagline: 'Ask. Explore. Discover.',
    text: 'Children learn by asking questions, observing, investigating, and discovering connections between concepts and the world around them.',
    icon: Search,
  },
  {
    stage: 'Middle Stage',
    approach: 'Experiential Learning',
    tagline: 'Learn by Doing.',
    text: 'Projects, experiments, collaborative tasks, and real-life applications help students connect concepts with practice and develop problem-solving skills.',
    icon: FlaskConical,
  },
  {
    stage: 'Secondary Stage',
    approach: 'Competency-Based Learning',
    tagline: 'Think. Apply. Excel.',
    text: 'Conceptual understanding, critical analysis, research, interdisciplinary learning, and authentic assessments prepare students to apply knowledge independently and make informed decisions.',
    icon: Lightbulb,
  },
];

export default function PedagogyContent() {
  return (
    <div className="space-y-12">
      <p className="mx-auto max-w-3xl text-center text-lg leading-relaxed text-blue-100/80">
        At Garima Vidya Vihar (GVV), we believe that meaningful learning happens when children actively engage,
        explore, experience, and apply knowledge. Aligned with the vision of NEP 2020 and NCF, our pedagogy evolves
        with each developmental stage, nurturing curiosity, critical thinking, creativity, and lifelong learning.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        {STAGES.map(({ stage, approach, tagline, text, icon: Icon }, i) => (
          <div
            key={stage}
            className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-[#0a1445]/70 p-6 shadow-xl backdrop-blur-sm md:p-8"
          >
            <span className="absolute right-5 top-4 text-5xl font-black text-white/5">0{i + 1}</span>
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5C842]/15 text-[#F5C842]">
              <Icon size={24} />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#EED165]">{stage}</p>
            <h3 className="mt-1 text-xl font-bold text-white md:text-2xl">{approach}</h3>
            <p className="mt-2 font-semibold text-blue-300">{tagline}</p>
            <p className="mt-3 leading-relaxed text-blue-100/75">{text}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#F5C842]/30 bg-gradient-to-br from-[#121c5c] to-[#0a1445] p-6 text-center md:p-10">
        <h3 className="mb-4 text-2xl font-bold text-white md:text-3xl">Our Commitment</h3>
        <p className="mx-auto max-w-3xl text-lg leading-relaxed text-blue-100/80">
          At GVV, we move beyond rote learning to create learning experiences that are purposeful, engaging,
          inclusive, and future-ready — empowering every learner to think independently, act confidently, and grow
          continuously.
        </p>
      </div>
    </div>
  );
}
