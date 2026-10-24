"use client";

import React, { useState, useEffect, useRef } from "react";
import { Clapperboard, Pencil, Trash2, VideoOff } from "lucide-react";

// Admin for the "Uniform In Action" reels on /uniform.
export default function UniformReels() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [title, setTitle] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [video, setVideo] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const load = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/uniform-reels", { cache: "no-store" });
      const result = await res.json();
      if (result.success) setItems(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setTitle("");
    setSortOrder("0");
    setEditingId(null);
    setVideo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEdit = (item) => {
    setTitle(item.title);
    setSortOrder(String(item.sort_order ?? 0));
    setEditingId(item.id);
    setVideo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingId && (!title || !video)) {
      alert("Please provide Title and Video.");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("sort_order", sortOrder);
      if (video) formData.append("video", video);

      const url = editingId ? `/api/uniform-reels/${editingId}` : "/api/uniform-reels";
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
    if (!window.confirm("Delete this reel?")) return;
    try {
      const res = await fetch(`/api/uniform-reels/${id}`, { method: "DELETE" });
      if (res.ok) load();
    } catch (err) {
      alert("Error deleting: " + err.message);
    }
  };

  if (isLoading) return <div className="p-8 text-slate-500 animate-pulse text-lg">Loading reels...</div>;
  if (error) return <div className="p-8 text-red-500 bg-red-50 rounded-xl border border-red-200">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
            <Clapperboard size={16} />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">{editingId ? "Edit Reel" : "Add New Reel"}</h3>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Shown in the &quot;Uniform In Action&quot; section of the Uniform page. Use vertical (9:16) MP4 videos, up to 60MB.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Reel Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Winter Uniform"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" required />
            </div>
            <div className="md:w-40">
              <label className="block text-sm font-medium text-slate-700 mb-1">Display Order</label>
              <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{editingId ? "Replace Video (Optional)" : "Upload Video"}</label>
            <input type="file" accept="video/mp4,video/webm,video/quicktime" ref={fileInputRef} onChange={(e) => setVideo(e.target.files[0])}
              className="w-full border border-slate-300 rounded-lg px-3 py-1.5 bg-white file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" required={!editingId} />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 shadow-sm shadow-indigo-900/10">
              {saving ? "Uploading..." : editingId ? "Update Reel" : "Add Reel"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="px-6 py-2 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Uniform Reels</h3>
          <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100">{items.length} Records</span>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            <VideoOff className="mx-auto mb-3 text-slate-300" size={32} />
            No reels yet. The section is hidden on the Uniform page until one is added.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                <div className="relative aspect-[9/16] bg-slate-900">
                  <video src={item.video_url} muted playsInline preload="metadata" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent flex items-end p-3">
                    <div>
                      <span className="text-white text-xs font-bold uppercase tracking-wide bg-white/20 backdrop-blur px-2 py-0.5 rounded-full mb-1 inline-block">
                        Order {item.sort_order}
                      </span>
                      <p className="text-white text-sm font-semibold leading-tight line-clamp-2">{item.title}</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button onClick={() => handleEdit(item)} className="w-9 h-9 rounded-full bg-white/90 text-indigo-600 flex items-center justify-center hover:bg-white">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="w-9 h-9 rounded-full bg-white/90 text-red-600 flex items-center justify-center hover:bg-white">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
