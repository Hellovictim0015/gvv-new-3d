"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, Download, Eye } from 'lucide-react';

function formatDate(value) {
  if (!value) return '';
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function PdfButtons({ url }) {
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-full border border-blue-500/60 px-4 py-2 text-sm font-bold text-blue-100 transition-colors hover:bg-blue-500/20"
      >
        <Eye size={15} /> View
      </a>
      <a
        href={url}
        download
        className="flex items-center gap-2 rounded-full bg-[#FACC15] px-4 py-2 text-sm font-bold text-[#020617] transition-colors hover:bg-[#EAB308]"
      >
        <Download size={15} /> Download PDF
      </a>
    </div>
  );
}

function EntryText({ item }) {
  return (
    <>
      {item.entry_date && (
        <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#EED165]">
          <CalendarDays size={13} /> {formatDate(item.entry_date)}
        </p>
      )}
      <h3 className="text-lg font-bold leading-snug text-white md:text-xl">{item.title}</h3>
      {item.description && (
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-blue-100/70 md:text-base">{item.description}</p>
      )}
      {item.pdf_url && <PdfButtons url={item.pdf_url} />}
    </>
  );
}

const cardClass =
  'rounded-2xl border border-[#1E2B7A] bg-[#0B113A] shadow-[0_0_15px_rgba(30,58,138,0.2)]';

// Admin-managed body of an <InfoPage> (admin → Page Content). Text/PDF entries
// render as full-width panels; entries with a photo render as a card grid.
export default function PageEntries({ pageKey, emptyNote }) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/page-entries?page=${encodeURIComponent(pageKey)}`, { cache: 'no-store' })
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
  }, [pageKey]);

  if (isLoading) return <p className="text-center text-slate-400">Loading...</p>;
  if (error) return <p className="text-center text-red-400">Could not load details: {error}</p>;
  if (items.length === 0) {
    return (
      <div className="text-center text-base text-blue-200/50">
        <p>
          Details will be published here soon. For any query, please{' '}
          <Link href="/contact" className="text-[#FACC15] underline underline-offset-4 hover:text-white">
            contact the school
          </Link>
          .
        </p>
        {emptyNote}
      </div>
    );
  }

  const textItems = items.filter((i) => !i.image_url);
  const photoItems = items.filter((i) => i.image_url);

  return (
    <div className="space-y-10">
      {textItems.length > 0 && (
        <div className="mx-auto max-w-4xl space-y-5">
          {textItems.map((item) => (
            <article key={item.id} className={`${cardClass} p-6 md:p-8`}>
              <EntryText item={item} />
            </article>
          ))}
        </div>
      )}

      {photoItems.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {photoItems.map((item) => (
            <article
              key={item.id}
              className={`${cardClass} group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.45)]`}
            >
              {/* Full image at its own aspect ratio (result posters etc. are tall
                  and must not be cropped); click opens it full size. */}
              <a
                href={item.image_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-[#0a1445]"
                title="Open full image"
              >
                <img
                  src={item.image_url}
                  alt={item.title}
                  loading="lazy"
                  className="block h-auto w-full"
                />
              </a>
              <div className="flex flex-1 flex-col p-5">
                <EntryText item={item} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
