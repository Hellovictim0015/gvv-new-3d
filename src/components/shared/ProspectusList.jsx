"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Download, Eye, FileText } from 'lucide-react';

// Admin-managed prospectus files (admin → Prospectus). Newest is featured.
export default function ProspectusList() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/prospectus', { cache: 'no-store' })
      .then((res) => res.json())
      .then((result) => {
        if (cancelled) return;
        if (result.success) setItems(result.data || []);
        else setError(result.error || 'Failed to load');
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) return <p className="text-center text-slate-400">Loading...</p>;
  if (error) return <p className="text-center text-red-400">Could not load prospectus: {error}</p>;
  if (items.length === 0) {
    return (
      <p className="text-center text-base text-blue-200/50">
        Details will be published here soon. For any query, please{' '}
        <Link href="/contact" className="text-[#FACC15] underline underline-offset-4 hover:text-white">
          contact the school
        </Link>
        .
      </p>
    );
  }

  const [featured, ...older] = items;

  return (
    <div className="space-y-12">
      <article className="mx-auto flex max-w-4xl flex-col overflow-hidden rounded-3xl border border-[#1E2B7A] bg-[#0B113A] shadow-[0_0_30px_rgba(30,58,138,0.35)] md:flex-row">
        <div className="flex shrink-0 items-center justify-center bg-gradient-to-br from-[#0a1445] to-[#1E2B7A]/60 p-6 md:w-72">
          {featured.cover_image_url ? (
            <img
              src={featured.cover_image_url}
              alt={featured.title}
              className="max-h-80 w-auto rounded-lg object-contain shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
            />
          ) : (
            <BookOpen className="h-24 w-24 text-[#FACC15]/80" />
          )}
        </div>
        <div className="flex flex-1 flex-col justify-center p-6 md:p-10">
          {featured.session_year && (
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#EED165]">Session {featured.session_year}</p>
          )}
          <h2 className="text-2xl font-black text-white md:text-3xl">{featured.title}</h2>
          {featured.description && (
            <p className="mt-4 whitespace-pre-line leading-relaxed text-blue-100/70">{featured.description}</p>
          )}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={featured.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-full border border-blue-500/60 px-6 py-3 text-sm font-bold text-blue-100 transition-colors hover:bg-blue-500/20"
            >
              <Eye size={16} /> View Prospectus
            </a>
            <a
              href={featured.pdf_url}
              download
              className="flex items-center justify-center gap-2 rounded-full bg-[#FACC15] px-6 py-3 text-sm font-bold text-[#020617] transition-colors hover:bg-[#EAB308]"
            >
              <Download size={16} /> Download PDF
            </a>
          </div>
        </div>
      </article>

      {older.length > 0 && (
        <section className="mx-auto max-w-4xl">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-blue-400">Previous Editions</h3>
          <div className="divide-y divide-[#1E2B7A]/70 overflow-hidden rounded-2xl border border-[#1E2B7A] bg-[#0B113A]/90">
            {older.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                <FileText className="h-5 w-5 shrink-0 text-[#FACC15]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{item.title}</p>
                  {item.session_year && <p className="text-xs text-blue-300/70">Session {item.session_year}</p>}
                </div>
                <a
                  href={item.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-blue-500/50 px-4 py-1.5 text-xs font-bold text-blue-100 hover:bg-blue-500/20"
                >
                  <Download size={13} /> PDF
                </a>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
