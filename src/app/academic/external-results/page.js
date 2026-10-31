"use client";
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Medal, FileText, Download, Eye } from 'lucide-react';
import PageShell from '@/components/landing/PageShell';

const ALL = 'All';

export default function ExternalResultsPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [year, setYear] = useState(ALL);

  // Results added via the admin panel: typed rows (entry_type=list) and uploaded PDFs (entry_type=pdf).
  useEffect(() => {
    let cancelled = false;
    fetch('/api/external-results', { cache: 'no-store' })
      .then((res) => res.json())
      .then((result) => {
        if (cancelled) return;
        if (result.success) setItems(result.data || []);
        else setError(result.error || 'Failed to load results');
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const years = useMemo(() => {
    const set = new Set(items.map((i) => i.session_year).filter(Boolean));
    return [ALL, ...Array.from(set).sort().reverse()];
  }, [items]);

  const visible = year === ALL ? items : items.filter((i) => i.session_year === year);
  const pdfs = visible.filter((i) => i.entry_type === 'pdf');

  // Group typed results by exam (+ year) so each exam shows as its own table.
  const groups = useMemo(() => {
    const map = new Map();
    for (const item of visible) {
      if (item.entry_type === 'pdf') continue;
      const key = `${item.exam_name}__${item.session_year || ''}`;
      if (!map.has(key)) map.set(key, { exam: item.exam_name, year: item.session_year, rows: [] });
      map.get(key).rows.push(item);
    }
    return Array.from(map.values());
  }, [visible]);

  const isEmpty = !isLoading && !error && items.length === 0;

  return (
    <PageShell>
      <section className="relative px-6 pb-10 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/25 via-transparent to-transparent pointer-events-none z-0" />
        <div className="relative z-10 mx-auto max-w-3xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-[#EED165]">Academics · Results</p>
          <h1 className="mb-6 bg-gradient-to-b from-blue-300 via-blue-500 to-blue-900 bg-clip-text text-4xl font-black tracking-tight text-transparent md:text-6xl">
            Results of External Examination
          </h1>
          <p className="mx-auto text-lg leading-relaxed text-blue-200/70">
            Results of Olympiads, competitive and other external examinations taken by our students.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        {isLoading && <p className="text-center text-slate-400">Loading results...</p>}
        {error && <p className="text-center text-red-400">Could not load results: {error}</p>}
        {isEmpty && (
          <p className="text-center text-blue-200/50">
            Results will be published here soon. For any query, please{' '}
            <Link href="/contact" className="text-[#FACC15] underline underline-offset-4 hover:text-white">
              contact the school
            </Link>
            .
          </p>
        )}

        {years.length > 2 && (
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {years.map((y) => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                  year === y
                    ? 'border-[#FACC15] bg-[#FACC15] text-[#020617]'
                    : 'border-[#1E2B7A] bg-[#0B113A] text-blue-200 hover:border-blue-500'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        )}

        {pdfs.length > 0 && (
          <section className="mb-14">
            <h2 className="mb-6 text-sm font-bold uppercase tracking-widest text-blue-400">Result Documents</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {pdfs.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col rounded-2xl border border-[#1E2B7A] bg-[#0B113A] p-6 shadow-[0_0_15px_rgba(30,58,138,0.2)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.45)]"
                >
                  <div className="mb-4 flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-blue-500/50">
                      <FileText className="h-6 w-6 text-[#FACC15]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold leading-snug text-white">{item.exam_name}</h3>
                      {item.session_year && <p className="mt-1 text-sm text-blue-300/70">Session {item.session_year}</p>}
                    </div>
                  </div>
                  <div className="mt-auto flex gap-2">
                    <a
                      href={item.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-1 items-center justify-center gap-2 rounded-full border border-blue-500/60 px-4 py-2 text-sm font-bold text-blue-100 transition-colors hover:bg-blue-500/20"
                    >
                      <Eye size={15} /> View
                    </a>
                    <a
                      href={item.pdf_url}
                      download
                      className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#FACC15] px-4 py-2 text-sm font-bold text-[#020617] transition-colors hover:bg-[#EAB308]"
                    >
                      <Download size={15} /> Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {groups.length > 0 && (
          <section className="space-y-8">
            {pdfs.length > 0 && (
              <h2 className="text-sm font-bold uppercase tracking-widest text-blue-400">Student Achievers</h2>
            )}
            {groups.map((group) => (
              <div
                key={`${group.exam}-${group.year || ''}`}
                className="overflow-hidden rounded-2xl border border-[#1E2B7A] bg-[#0B113A]/90 shadow-[0_0_15px_rgba(30,58,138,0.2)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2B7A] px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <Medal className="h-6 w-6 shrink-0 text-[#FACC15]" />
                    <h3 className="text-lg font-bold text-white sm:text-xl">{group.exam}</h3>
                  </div>
                  {group.year && (
                    <span className="rounded-full border border-blue-500/40 px-3 py-1 text-xs font-semibold text-blue-200">
                      {group.year}
                    </span>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] border-collapse text-left">
                    <thead>
                      <tr className="bg-[#0a1445]">
                        {['#', 'Student Name', 'Class', 'Result / Rank'].map((col) => (
                          <th key={col} className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-blue-300/80 sm:px-6">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E2B7A]/70">
                      {group.rows.map((row, i) => (
                        <tr key={row.id} className="transition-colors hover:bg-blue-500/5">
                          <td className="px-5 py-3 text-sm text-blue-300/60 sm:px-6">{i + 1}</td>
                          <td className="px-5 py-3 text-sm font-semibold text-white sm:px-6">{row.student_name}</td>
                          <td className="px-5 py-3 text-sm text-blue-100/80 sm:px-6">{row.class_name || '—'}</td>
                          <td className="px-5 py-3 text-sm font-semibold text-[#FACC15] sm:px-6">{row.result || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </PageShell>
  );
}
