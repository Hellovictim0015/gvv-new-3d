"use client";

import React, { useState, useEffect, useRef } from "react";
import { PartyPopper, Pencil, Trash2, CalendarDays, ImageOff } from "lucide-react";
import { EVENT_PAGES } from "@/lib/infoPages";

// One entry per "Events and Activities" menu page (/events/<slug>).
const CATEGORIES = Object.entries(EVENT_PAGES).map(([slug, page]) => ({ slug, label: page.title }));
const ALL = "all";

const EMPTY_FORM = { category: CATEGORIES[0].slug, title: "", event_date: "", description: "" };

const inputClass =
  "w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none";

function categoryLabel(slug) {
  return CATEGORIES.find((c) => c.slug === slug)?.label || slug;
}

function formatDate(value) {
  if (!value) return "";
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function Events() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(ALL);

  const [form, setForm] = useState(EMPTY_FORM);
  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const load = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/events", { cache: "no-store" });
      const result = await res.json();
      if (result.success) setItems(result.data || []);
      else setError(result.error);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const resetForm = () => {
    // Keep the chosen category so several entries of one page can be added in a row.
    setForm((f) => ({ ...EMPTY_FORM, category: f.category }));
    setImage(null);
    setCurrentImage(null);
    setRemoveImage(false);
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEdit = (item) => {
    setForm({
      category: item.category,
      title: item.title || "",
      event_date: item.event_date || "",
      description: item.description || "",
    });
    setCurrentImage(item.image_url);
    setRemoveImage(false);
    setImage(null);
    setEditingId(item.id);
    if (fileInputRef.current) fileInputRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (image) formData.append("image", image);
      if (removeImage) formData.append("remove_image", "1");

      const url = editingId ? `/api/events/${editingId}` : "/api/events";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, body: formData });
      const result = await res.json();

      if (res.ok && result.success) {
        resetForm();
        load();
      } else {
        alert("Error: " + (result.message || result.error));
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (res.ok) load();
    } catch (err) {
      alert("Error deleting: " + err.message);
    }
  };

  if (isLoading) return <div className="p-8 text-slate-500 animate-pulse text-lg">Loading events...</div>;
  if (error) return <div className="p-8 text-red-500 bg-red-50 rounded-xl border border-red-200">Error: {error}</div>;

  const visible = filter === ALL ? items : items.filter((i) => i.category === filter);
  const countFor = (slug) => items.filter((i) => i.category === slug).length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
            <PartyPopper size={16} />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">{editingId ? "Edit Entry" : "Add Event / Activity"}</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Page (Menu Item)</label>
              <select value={form.category} onChange={setField("category")} className={`${inputClass} bg-white`}>
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input type="text" value={form.title} onChange={setField("title")}
                placeholder="e.g., Annual Day 2026, Robotics Club" className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date (Optional)</label>
              <input type="date" value={form.event_date} onChange={setField("event_date")} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
            <textarea value={form.description} onChange={setField("description")} rows={3}
              placeholder="Short details about the event / activity" className={inputClass} />
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {editingId && currentImage ? "Replace Photo (Optional)" : "Photo (Optional)"}
              </label>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={(e) => setImage(e.target.files[0])}
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 bg-white file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
            </div>
            {editingId && currentImage && !image && (
              <label className="flex items-center gap-3 text-sm text-slate-600">
                <img src={currentImage} alt="" className={`w-14 h-10 rounded object-cover border ${removeImage ? "opacity-30" : ""}`} />
                <input type="checkbox" checked={removeImage} onChange={(e) => setRemoveImage(e.target.checked)} />
                Remove photo
              </label>
            )}
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="px-6 py-2 h-[42px] bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 whitespace-nowrap">
              {saving ? "Saving..." : editingId ? "Update" : "Add Entry"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="px-6 py-2 h-[42px] bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800">Events and Activities</h3>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100">{visible.length} Records</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[{ slug: ALL, label: "All" }, ...CATEGORIES].map((c) => (
              <button key={c.slug} onClick={() => setFilter(c.slug)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                  filter === c.slug ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                }`}>
                {c.label} ({c.slug === ALL ? items.length : countFor(c.slug)})
              </button>
            ))}
          </div>
        </div>
        {visible.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-400">No entries yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {visible.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                {item.image_url ? (
                  <img src={item.image_url} alt="" className="w-16 h-12 rounded-lg object-cover border border-slate-200 shrink-0" />
                ) : (
                  <div className="w-16 h-12 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                    <ImageOff size={16} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-indigo-700 truncate">{item.title}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-xs text-slate-500">
                    <span className="font-semibold text-pink-600">{categoryLabel(item.category)}</span>
                    {item.event_date && (
                      <span className="inline-flex items-center gap-1"><CalendarDays size={11} /> {formatDate(item.event_date)}</span>
                    )}
                  </div>
                  {item.description && <p className="text-xs text-slate-500 mt-1 line-clamp-1">{item.description}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleEdit(item)} className="w-8 h-8 rounded-lg text-indigo-600 hover:bg-indigo-50 flex items-center justify-center">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="w-8 h-8 rounded-lg text-red-600 hover:bg-red-50 flex items-center justify-center">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
