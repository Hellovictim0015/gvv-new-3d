"use client";

import React, { useState, useEffect, useRef } from "react";
import { Medal, FileText, Pencil, Trash2, ExternalLink, ListPlus, Upload } from "lucide-react";

const EMPTY_FORM = { exam_name: "", student_name: "", class_name: "", result: "", session_year: "" };

const inputClass =
  "w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none";

export default function ExternalResults() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // "list" = type a result manually, "pdf" = upload a result PDF
  const [mode, setMode] = useState("list");
  const [form, setForm] = useState(EMPTY_FORM);
  const [pdf, setPdf] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const load = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/external-results", { cache: "no-store" });
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
    setForm(EMPTY_FORM);
    setPdf(null);
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const switchMode = (next) => {
    if (editingId) return; // entry type can't change while editing
    setMode(next);
    setPdf(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEdit = (item) => {
    setMode(item.entry_type === "pdf" ? "pdf" : "list");
    setForm({
      exam_name: item.exam_name || "",
      student_name: item.student_name || "",
      class_name: item.class_name || "",
      result: item.result || "",
      session_year: item.session_year || "",
    });
    setEditingId(item.id);
    setPdf(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === "pdf" && !editingId && !pdf) {
      alert("Please upload a PDF.");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("entry_type", mode);
      formData.append("exam_name", form.exam_name);
      formData.append("session_year", form.session_year);
      if (mode === "list") {
        formData.append("student_name", form.student_name);
        formData.append("class_name", form.class_name);
        formData.append("result", form.result);
      } else if (pdf) {
        formData.append("pdf", pdf);
      }

      const url = editingId ? `/api/external-results/${editingId}` : "/api/external-results";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, body: formData });
      const result = await res.json();

      if (res.ok && result.success) {
        // Keep exam name + year after adding a typed row, so several students
        // of the same exam can be entered one after another.
        if (!editingId && mode === "list") {
          setForm((f) => ({ ...EMPTY_FORM, exam_name: f.exam_name, session_year: f.session_year }));
        } else {
          resetForm();
        }
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
    if (!window.confirm("Are you sure you want to delete this result?")) return;
    try {
      const res = await fetch(`/api/external-results/${id}`, { method: "DELETE" });
      if (res.ok) load();
    } catch (err) {
      alert("Error deleting: " + err.message);
    }
  };

  if (isLoading) return <div className="p-8 text-slate-500 animate-pulse text-lg">Loading results...</div>;
  if (error) return <div className="p-8 text-red-500 bg-red-50 rounded-xl border border-red-200">Error: {error}</div>;

  const listItems = items.filter((i) => i.entry_type !== "pdf");
  const pdfItems = items.filter((i) => i.entry_type === "pdf");

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
              <Medal size={16} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">
              {editingId ? "Edit Result" : "Add External Exam Result"}
            </h3>
          </div>

          {/* Two options: type the result, or upload a PDF */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            <ModeButton active={mode === "list"} disabled={!!editingId && mode !== "list"} onClick={() => switchMode("list")} icon={ListPlus}>
              Type Result
            </ModeButton>
            <ModeButton active={mode === "pdf"} disabled={!!editingId && mode !== "pdf"} onClick={() => switchMode("pdf")} icon={Upload}>
              Upload PDF
            </ModeButton>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {mode === "pdf" ? "Title / Exam Name" : "Exam Name"}
              </label>
              <input type="text" value={form.exam_name} onChange={setField("exam_name")}
                placeholder={mode === "pdf" ? "e.g., SOF Olympiad Results 2025-26" : "e.g., IMO, NSO, NTSE"}
                className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Session / Year (Optional)</label>
              <input type="text" value={form.session_year} onChange={setField("session_year")}
                placeholder="e.g., 2025-26" className={inputClass} />
            </div>
          </div>

          {mode === "list" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Student Name</label>
                <input type="text" value={form.student_name} onChange={setField("student_name")}
                  placeholder="e.g., Aarav Sharma" className={inputClass} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Class (Optional)</label>
                <input type="text" value={form.class_name} onChange={setField("class_name")}
                  placeholder="e.g., VIII-A" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Result / Rank (Optional)</label>
                <input type="text" value={form.result} onChange={setField("result")}
                  placeholder="e.g., Gold Medal, Rank 12, 95%" className={inputClass} />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{editingId ? "New PDF (Optional)" : "Upload PDF"}</label>
              <input type="file" accept="application/pdf" ref={fileInputRef} onChange={(e) => setPdf(e.target.files[0])}
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 bg-white file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" required={!editingId} />
            </div>
          )}

          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="px-6 py-2 h-[42px] bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 whitespace-nowrap">
              {saving ? "Saving..." : editingId ? "Update" : mode === "pdf" ? "Upload Result PDF" : "Add to List"}
            </button>
            {(editingId || form.exam_name) && (
              <button type="button" onClick={resetForm} className="px-6 py-2 h-[42px] bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300">
                {editingId ? "Cancel" : "Clear"}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Typed results list */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Results List</h3>
          <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100">{listItems.length} Records</span>
        </div>
        {listItems.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-400">No typed results yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["Exam", "Year", "Student", "Class", "Result", ""].map((col) => (
                    <th key={col} className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 text-sm font-semibold text-indigo-700">{item.exam_name}</td>
                    <td className="px-6 py-3 text-sm text-slate-600">{item.session_year || "—"}</td>
                    <td className="px-6 py-3 text-sm text-slate-800">{item.student_name}</td>
                    <td className="px-6 py-3 text-sm text-slate-600">{item.class_name || "—"}</td>
                    <td className="px-6 py-3 text-sm text-slate-600">{item.result || "—"}</td>
                    <td className="px-6 py-3">
                      <RowActions onEdit={() => handleEdit(item)} onDelete={() => handleDelete(item.id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Uploaded PDFs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Result PDFs</h3>
          <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100">{pdfItems.length} Records</span>
        </div>
        {pdfItems.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-400">No result PDFs uploaded yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pdfItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <FileText size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-indigo-700 truncate">
                    {item.exam_name}
                    {item.session_year && <span className="ml-2 text-xs font-medium text-slate-500">({item.session_year})</span>}
                  </p>
                  <a href={item.pdf_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium mt-0.5">
                    View PDF <ExternalLink size={11} />
                  </a>
                </div>
                <RowActions onEdit={() => handleEdit(item)} onDelete={() => handleDelete(item.id)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ModeButton({ active, disabled, onClick, icon: Icon, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        active ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
      }`}
    >
      <Icon size={15} />
      {children}
    </button>
  );
}

function RowActions({ onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-1 shrink-0 justify-end">
      <button onClick={onEdit} className="w-8 h-8 rounded-lg text-indigo-600 hover:bg-indigo-50 flex items-center justify-center">
        <Pencil size={15} />
      </button>
      <button onClick={onDelete} className="w-8 h-8 rounded-lg text-red-600 hover:bg-red-50 flex items-center justify-center">
        <Trash2 size={15} />
      </button>
    </div>
  );
}
