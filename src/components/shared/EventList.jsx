"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, Sparkles } from 'lucide-react';

function formatDate(value) {
  if (!value) return '';
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Admin-managed entries for one "Events and Activities" page (see admin → Events & Activities).
export default function EventList({ category }) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/events?category=${encodeURIComponent(category)}`, { cache: 'no-store' })
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
  }, [category]);

  if (isLoading) return <p className="text-center text-slate-400">Loading...</p>;
  if (error) return <p className="text-center text-red-400">Could not load details: {error}</p>;
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

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <article
          key={item.id}
          className="group flex flex-col overflow-hidden rounded-2xl border border-[#1E2B7A] bg-[#0B113A] shadow-[0_0_15px_rgba(30,58,138,0.2)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.45)]"
        >
          {item.image_url ? (
            <div className="aspect-[16/10] overflow-hidden bg-[#0a1445]">
              <img
                src={item.image_url}
                alt={item.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ) : (
            <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-[#0a1445] to-[#1E2B7A]/60">
              <Sparkles className="h-10 w-10 text-[#FACC15]/70" />
            </div>
          )}
          <div className="flex flex-1 flex-col p-5">
            {item.event_date && (
              <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#EED165]">
                <CalendarDays size={13} /> {formatDate(item.event_date)}
              </p>
            )}
            <h3 className="text-lg font-bold leading-snug text-white">{item.title}</h3>
            {item.description && (
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-blue-100/70">{item.description}</p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
