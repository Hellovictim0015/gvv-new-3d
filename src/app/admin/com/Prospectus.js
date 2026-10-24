"use client";

import React, { useState, useEffect, useRef } from "react";
import { BookMarked, FileText, Pencil, Trash2, ExternalLink, Star } from "lucide-react";

const EMPTY_FORM = { title: "", session_year: "", description: "" };

const inputClass =
  "w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none";
const fileClass =
  "w-full border border-slate-300 rounded-lg px-3 py-1.5 bg-white file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100";

export default function Prospectus() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [pdf, setPdf] = useState(null);
  const [cover, setCover] = useState(null);
  const [currentCover, setCurrentCover] = useState(null);
  const [removeCover, setRemoveCover] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const pdfInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const load = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/prospectus", { cache: "no-store" });
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
    setPdf(null);
    setCover(null);
    if (pdfInputRef.current) pdfInputRef.current.value = "";
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setCurrentCover(null);
    setRemoveCover(false);
    setEditingId(null);
    clearFiles();
  };

  const handleEdit = (item) => {
    setForm({
      title: item.title || "",
      session_year: item.session_year || "",
      description: item.description || "",
    });
    setCurrentCover(item.cover_image_url);
    setRemoveCover(false);
    setEditingId(item.id);
    clearFiles();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingId && !pdf) {
      alert("Please upload the prospectus PDF.");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (pdf) formData.append("pdf", pdf);
      if (cover) formData.append("cover", cover);
      if (removeCover) formData.append("remove_cover", "1");

      const url = editingId ? `/api/prospectus/${editingId}` : "/api/prospectus";
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
    if (!window.confirm("Are you sure you want to delete this prospectus?")) return;
    try {
      const res = await fetch(`/api/prospectus/${id}`, { method: "DELETE" });
      if (res.ok) load();
    } catch (err) {
      alert("Error deleting: " + err.message);
    }
  };

  if (isLoading) return <div className="p-8 text-slate-500 animate-pulse text-lg">Loading prospectus...</div>;
  if (error) return <div className="p-8 text-red-500 bg-red-50 rounded-xl border border-red-200">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
            <BookMarked size={16} />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">{editingId ? "Edit Prospectus" : "Add Prospectus"}</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input type="text" value={form.title} onChange={setField("title")}
                placeholder="e.g., School Prospectus" className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Session (Optional)</label>
              <input type="text" value={form.session_year} onChange={setField("session_year")}
                placeholder="e.g., 2026-27" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Short Description (Optional)</label>
            <textarea value={form.description} onChange={setField("description")} rows={3}
              placeholder="What parents will find inside — school overview, admissions, fees, facilities..." className={inputClass} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{editingId ? "New PDF (Optional)" : "Prospectus PDF"}</label>
              <input type="file" accept="application/pdf" ref={pdfInputRef} onChange={(e) => setPdf(e.target.files[0])}
                className={fileClass} required={!editingId} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {editingId && currentCover ? "Replace Cover Image (Optional)" : "Cover Image (Optional)"}
              </label>
              <input type="file" accept="image/*" ref={coverInputRef} onChange={(e) => setCover(e.target.files[0])}
                className={fileClass} />
              {editingId && currentCover && !cover && (
                <label className="flex items-center gap-3 mt-2 text-sm text-slate-600">
                  <img src={currentCover} alt="" className={`w-10 h-14 rounded object-cover border ${removeCover ? "opacity-30" : ""}`} />
                  <input type="checkbox" checked={removeCover} onChange={(e) => setRemoveCover(e.target.checked)} />
                  Remove cover
                </label>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="px-6 py-2 h-[42px] bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 whitespace-nowrap">
              {saving ? "Saving..." : editingId ? "Update" : "Add Prospectus"}
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
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Prospectus Files</h3>
            <p className="text-xs text-slate-500 mt-0.5">The newest one is featured on the website.</p>
          </div>
          <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100">{items.length} Records</span>
        </div>
        {items.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-400">No prospectus uploaded yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item, index) => (
              <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                {item.cover_image_url ? (
                  <img src={item.cover_image_url} alt="" className="w-10 h-14 rounded object-cover border border-slate-200 shrink-0" />
                ) : (
                  <div className="w-10 h-14 rounded bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    <FileText size={18} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-indigo-700 truncate flex items-center gap-2">
                    {item.title}
                    {item.session_year && <span className="text-xs font-medium text-slate-500">({item.session_year})</span>}
                    {index === 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        <Star size={10} /> Featured
                      </span>
                    )}
                  </p>
                  <a href={item.pdf_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium mt-0.5">
                    View PDF <ExternalLink size={11} />
                  </a>
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
