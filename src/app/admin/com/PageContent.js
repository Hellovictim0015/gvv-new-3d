"use client";

import React, { useState, useEffect, useRef } from "react";
import { LayoutList, Pencil, Trash2, CalendarDays, ImageOff, FileText, ExternalLink } from "lucide-react";
import { CONTENT_PAGES } from "@/lib/infoPages";

// Every generic info page whose body is admin-managed (keyed by route).
const PAGES = Object.entries(CONTENT_PAGES).map(([key, page]) => ({ key, label: page.title, section: page.section }));
const ALL = "all";

const EMPTY_FORM = { page_key: PAGES[0].key, title: "", entry_date: "", description: "" };

const inputClass =
  "w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none";
const fileClass =
  "w-full border border-slate-300 rounded-lg px-3 py-1.5 bg-white file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100";

function pageLabel(key) {
  return PAGES.find((p) => p.key === key)?.label || key;
}

function formatDate(value) {
  if (!value) return "";
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function PageContent() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(ALL);

  const [form, setForm] = useState(EMPTY_FORM);
  const [image, setImage] = useState(null);
  const [pdf, setPdf] = useState(null);
  const [current, setCurrent] = useState({ image_url: null, pdf_url: null });
  const [removeImage, setRemoveImage] = useState(false);
  const [removePdf, setRemovePdf] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const imageInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  const load = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/page-entries", { cache: "no-store" });
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

  const clearFiles = () => {
    setImage(null);
    setPdf(null);
    setRemoveImage(false);
    setRemovePdf(false);
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (pdfInputRef.current) pdfInputRef.current.value = "";
  };

  const resetForm = () => {
    // Keep the chosen page so several entries for it can be added in a row.
    setForm((f) => ({ ...EMPTY_FORM, page_key: f.page_key }));
    setCurrent({ image_url: null, pdf_url: null });
    setEditingId(null);
    clearFiles();
  };

  const handleEdit = (item) => {
    setForm({
      page_key: item.page_key,
      title: item.title || "",
      entry_date: item.entry_date || "",
      description: item.description || "",
    });
    setCurrent({ image_url: item.image_url, pdf_url: item.pdf_url });
    setEditingId(item.id);
    clearFiles();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (image) formData.append("image", image);
      if (pdf) formData.append("pdf", pdf);
      if (removeImage) formData.append("remove_image", "1");
      if (removePdf) formData.append("remove_pdf", "1");

      const url = editingId ? `/api/page-entries/${editingId}` : "/api/page-entries";
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
      const res = await fetch(`/api/page-entries/${id}`, { method: "DELETE" });
      if (res.ok) load();
    } catch (err) {
      alert("Error deleting: " + err.message);
    }
  };

  if (isLoading) return <div className="p-8 text-slate-500 animate-pulse text-lg">Loading page content...</div>;
  if (error) return <div className="p-8 text-red-500 bg-red-50 rounded-xl border border-red-200">Error: {error}</div>;

  const visible = filter === ALL ? items : items.filter((i) => i.page_key === filter);
  const countFor = (key) => items.filter((i) => i.page_key === key).length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
            <LayoutList size={16} />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">{editingId ? "Edit Entry" : "Add Page Content"}</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Page</label>
              <select value={form.page_key} onChange={setField("page_key")} className={`${inputClass} bg-white`}>
                {PAGES.map((p) => (
                  <option key={p.key} value={p.key}>{p.label} — {p.section}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title / Heading</label>
              <input type="text" value={form.title} onChange={setField("title")}
                placeholder="e.g., Class X Syllabus, Mrs. Sharma" className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date (Optional)</label>
              <input type="date" value={form.entry_date} onChange={setField("entry_date")} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description / Details (Optional)</label>
            <textarea value={form.description} onChange={setField("description")} rows={4}
              placeholder="Text shown under the heading (new lines are kept)" className={inputClass} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {editingId && current.image_url ? "Replace Photo (Optional)" : "Photo (Optional)"}
              </label>
              <input type="file" accept="image/*" ref={imageInputRef} onChange={(e) => setImage(e.target.files[0])} className={fileClass} />
              {editingId && current.image_url && !image && (
                <label className="flex items-center gap-3 mt-2 text-sm text-slate-600">
                  <img src={current.image_url} alt="" className={`w-14 h-10 rounded object-cover border ${removeImage ? "opacity-30" : ""}`} />
                  <input type="checkbox" checked={removeImage} onChange={(e) => setRemoveImage(e.target.checked)} />
                  Remove photo
                </label>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {editingId && current.pdf_url ? "Replace PDF (Optional)" : "PDF (Optional)"}
              </label>
              <input type="file" accept="application/pdf" ref={pdfInputRef} onChange={(e) => setPdf(e.target.files[0])} className={fileClass} />
              {editingId && current.pdf_url && !pdf && (
                <label className="flex items-center gap-3 mt-2 text-sm text-slate-600">
                  <a href={current.pdf_url} target="_blank" rel="noopener noreferrer" className={`text-indigo-600 font-medium ${removePdf ? "line-through opacity-50" : ""}`}>Current PDF</a>
                  <input type="checkbox" checked={removePdf} onChange={(e) => setRemovePdf(e.target.checked)} />
                  Remove PDF
                </label>
              )}
            </div>
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
            <h3 className="text-lg font-semibold text-slate-800">Page Entries</h3>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100">{visible.length} Records</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[{ key: ALL, label: "All" }, ...PAGES].map((p) => (
              <button key={p.key} onClick={() => setFilter(p.key)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                  filter === p.key ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                }`}>
                {p.label} ({p.key === ALL ? items.length : countFor(p.key)})
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
                    {item.pdf_url ? <FileText size={16} /> : <ImageOff size={16} />}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-indigo-700 truncate">{item.title}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-xs text-slate-500">
                    <span className="font-semibold text-violet-600">{pageLabel(item.page_key)}</span>
                    {item.entry_date && (
                      <span className="inline-flex items-center gap-1"><CalendarDays size={11} /> {formatDate(item.entry_date)}</span>
                    )}
                    {item.pdf_url && (
                      <a href={item.pdf_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium">
                        View PDF <ExternalLink size={11} />
                      </a>
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
