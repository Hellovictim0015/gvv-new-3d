"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Newspaper, Pencil, Trash2, ExternalLink, Search, Plus, ArrowLeft,
  Bold, Italic, Underline, Heading2, Heading3, List, ListOrdered, Quote, Link2, ImagePlus, Code2, Eraser,
} from "lucide-react";

// Local date (toISOString is UTC — a day behind in India before 5:30 am).
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

function formatDate(value) {
  if (!value) return "";
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const EMPTY_FORM = {
  title: "",
  slug: "",
  published_date: today(),
  is_published: true,
  excerpt: "",
  seo_title: "",
  meta_description: "",
  image_url: null,
};

const inputCls = "w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none";
const fileCls = "w-full border border-slate-300 rounded-lg px-3 py-1.5 bg-white file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100";

export default function Blogs() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  // null = list view; "new" or a post id = editor view
  const [editing, setEditing] = useState(null);

  const load = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/blogs", { cache: "no-store" });
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((b) => b.title.toLowerCase().includes(q) || b.slug.includes(q));
  }, [items, query]);

  const handleDelete = async (post) => {
    if (!window.confirm(`Delete "${post.title}"?\n\nIts page /${post.slug} will stop working.`)) return;
    try {
      const res = await fetch(`/api/blogs/${post.id}`, { method: "DELETE" });
      const result = await res.json();
      if (res.ok && result.success) load();
      else alert("Error: " + (result.message || result.error));
    } catch (err) {
      alert("Error deleting: " + err.message);
    }
  };

  if (editing !== null) {
    return (
      <BlogEditor
        id={editing === "new" ? null : editing}
        onClose={(changed) => {
          setEditing(null);
          if (changed) load();
        }}
      />
    );
  }

  if (isLoading) return <div className="p-8 text-slate-500 animate-pulse text-lg">Loading blogs...</div>;
  if (error) return <div className="p-8 text-red-500 bg-red-50 rounded-xl border border-red-200">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
            <Newspaper size={16} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Articles / Blogs</h3>
            <p className="text-xs text-slate-500">Each post is shown on the website at /its-url-slug and listed on /articles.</p>
          </div>
        </div>
        <button
          onClick={() => setEditing("new")}
          className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={16} /> Write New Blog
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or URL..."
              className={`${inputCls} pl-9`}
            />
          </div>
          <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100 self-start sm:self-auto">
            {items.length} Records
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No blogs found.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((post) => (
              <li key={post.id} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50">
                <div className="w-20 h-12 rounded-md bg-slate-100 overflow-hidden shrink-0">
                  {post.image && <img src={post.image} alt="" className="w-full h-full object-cover" loading="lazy" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800 truncate">{post.title}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {formatDate(post.date)} · /{post.slug}
                    {!post.isPublished && (
                      <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 font-semibold text-slate-600">Draft</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {post.isPublished && (
                    <a
                      href={`/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View on website"
                      className="w-8 h-8 rounded-lg text-slate-500 hover:bg-slate-100 flex items-center justify-center"
                    >
                      <ExternalLink size={15} />
                    </a>
                  )}
                  <button
                    onClick={() => setEditing(post.id)}
                    title="Edit"
                    className="w-8 h-8 rounded-lg text-indigo-600 hover:bg-indigo-50 flex items-center justify-center"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(post)}
                    title="Delete"
                    className="w-8 h-8 rounded-lg text-red-600 hover:bg-red-50 flex items-center justify-center"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function BlogEditor({ id, onClose }) {
  const isNew = id === null;
  const [form, setForm] = useState(EMPTY_FORM);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [cover, setCover] = useState(null);
  const [removeCover, setRemoveCover] = useState(false);
  const coverRef = useRef(null);

  useEffect(() => {
    if (isNew) return;
    (async () => {
      try {
        const res = await fetch(`/api/blogs/${id}`, { cache: "no-store" });
        const result = await res.json();
        if (!result.success) throw new Error(result.error);
        const b = result.data;
        setForm({
          title: b.title,
          slug: b.slug,
          published_date: String(b.published_date).slice(0, 10),
          is_published: Boolean(b.is_published),
          excerpt: b.excerpt || "",
          seo_title: b.seo_title || "",
          meta_description: b.meta_description || "",
          image_url: b.image_url,
        });
        setContent(b.content);
      } catch (err) {
        alert("Could not load blog: " + err.message);
        onClose(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const set = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "title" && !slugTouched) next.slug = slugify(value);
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const html = content.trim();
    if (!form.title.trim() || !html || html === "<br>") {
      alert("Please add a title and the blog content.");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("slug", form.slug || slugify(form.title));
      fd.append("published_date", form.published_date);
      fd.append("is_published", form.is_published ? "1" : "0");
      fd.append("excerpt", form.excerpt);
      fd.append("seo_title", form.seo_title);
      fd.append("meta_description", form.meta_description);
      fd.append("content", html);
      if (cover) fd.append("image", cover);
      if (removeCover && !cover) fd.append("remove_image", "1");

      const res = await fetch(isNew ? "/api/blogs" : `/api/blogs/${id}`, { method: isNew ? "POST" : "PUT", body: fd });
      const result = await res.json();
      if (res.ok && result.success) onClose(true);
      else alert("Error: " + (result.message || result.error));
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-500 animate-pulse text-lg">Loading blog...</div>;

  const coverPreview = cover ? URL.createObjectURL(cover) : removeCover ? null : form.image_url;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <button type="button" onClick={() => onClose(false)} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
          <ArrowLeft size={16} /> Back to all blogs
        </button>
        <div className="flex gap-2">
          <button type="button" onClick={() => onClose(false)} className="px-5 py-2 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 shadow-sm">
            {saving ? "Saving..." : isNew ? "Publish Blog" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input value={form.title} onChange={set("title")} required placeholder="e.g., 10 Study Tips for Board Exams" className={`${inputCls} text-lg font-semibold`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
              <RichEditor value={content} onChange={setContent} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Page URL</label>
              <div className="flex items-center rounded-lg border border-slate-300 focus-within:ring-2 focus-within:ring-indigo-500">
                <span className="pl-3 text-slate-400 text-sm">/</span>
                <input
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setForm((f) => ({ ...f, slug: e.target.value }));
                  }}
                  onBlur={() => setForm((f) => ({ ...f, slug: slugify(f.slug) }))}
                  placeholder="my-blog-post"
                  className="w-full rounded-lg px-1 py-2 focus:outline-none"
                />
              </div>
              {!isNew && (
                <p className="mt-1 text-xs text-amber-600">Changing the URL of an existing post breaks old links and its Google ranking.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Publish Date</label>
              <input type="date" value={form.published_date} onChange={set("published_date")} required className={inputCls} />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={form.is_published} onChange={set("is_published")} className="h-4 w-4 rounded border-slate-300 text-indigo-600" />
              Show on website (uncheck to keep as draft)
            </label>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-3">
            <label className="block text-sm font-medium text-slate-700">Cover Image</label>
            {coverPreview && <img src={coverPreview} alt="" className="w-full rounded-lg border border-slate-200 object-cover aspect-video" />}
            <input
              type="file"
              accept="image/*"
              ref={coverRef}
              onChange={(e) => {
                setCover(e.target.files[0] || null);
                setRemoveCover(false);
              }}
              className={fileCls}
            />
            {coverPreview && (
              <button
                type="button"
                onClick={() => {
                  setCover(null);
                  setRemoveCover(true);
                  if (coverRef.current) coverRef.current.value = "";
                }}
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                Remove cover image
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <p className="text-sm font-semibold text-slate-800">Summary & SEO <span className="font-normal text-slate-400">(optional)</span></p>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Short summary (shown on /articles)</label>
              <textarea value={form.excerpt} onChange={set("excerpt")} rows={3} placeholder="Left empty: taken from the start of the content" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">SEO title (Google)</label>
              <input value={form.seo_title} onChange={set("seo_title")} placeholder="Left empty: blog title" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Meta description (Google)</label>
              <textarea value={form.meta_description} onChange={set("meta_description")} rows={3} maxLength={300} placeholder="Left empty: short summary" className={inputCls} />
              <p className="mt-1 text-right text-[11px] text-slate-400">{form.meta_description.length}/160 recommended</p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

// Minimal rich-text editor: a contentEditable area + toolbar (no extra
// dependency). The server sanitises the HTML on save (cleanBlogHtml).
function RichEditor({ value, onChange }) {
  const areaRef = useRef(null);
  const imageInputRef = useRef(null);
  const [showHtml, setShowHtml] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Load the initial / switched-back HTML into the editable area.
  useEffect(() => {
    if (!showHtml && areaRef.current && areaRef.current.innerHTML !== value) {
      areaRef.current.innerHTML = value;
    }
  }, [showHtml, value]);

  const sync = () => onChange(areaRef.current?.innerHTML || "");

  const exec = (command, arg) => {
    areaRef.current?.focus();
    document.execCommand(command, false, arg);
    sync();
  };

  const toggleBlock = (tag) => {
    const current = document.queryCommandValue("formatBlock").toLowerCase();
    exec("formatBlock", current === tag ? "p" : tag);
  };

  const addLink = () => {
    const url = window.prompt("Link URL (e.g. https://... or /admission):");
    if (url) exec("createLink", url.trim());
  };

  const uploadImage = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/blogs/images", { method: "POST", body: fd });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || result.error);
      const alt = (window.prompt("Short description of the image (for Google / screen readers):") || "").replace(/"/g, "&quot;");
      exec("insertHTML", `<figure><img src="${result.url}" alt="${alt}"></figure><p><br></p>`);
    } catch (err) {
      alert("Image upload failed: " + err.message);
    } finally {
      setUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const tools = [
    { icon: Heading2, title: "Heading", run: () => toggleBlock("h2") },
    { icon: Heading3, title: "Sub-heading", run: () => toggleBlock("h3") },
    { icon: Bold, title: "Bold", run: () => exec("bold") },
    { icon: Italic, title: "Italic", run: () => exec("italic") },
    { icon: Underline, title: "Underline", run: () => exec("underline") },
    { icon: List, title: "Bullet list", run: () => exec("insertUnorderedList") },
    { icon: ListOrdered, title: "Numbered list", run: () => exec("insertOrderedList") },
    { icon: Quote, title: "Quote", run: () => toggleBlock("blockquote") },
    { icon: Link2, title: "Link", run: addLink },
    { icon: ImagePlus, title: "Insert image", run: () => imageInputRef.current?.click() },
    { icon: Eraser, title: "Clear formatting", run: () => exec("removeFormat") },
  ];

  return (
    <div className="rounded-lg border border-slate-300 focus-within:ring-2 focus-within:ring-indigo-500 overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
        {tools.map(({ icon: Icon, title, run }) => (
          <button
            key={title}
            type="button"
            title={title}
            disabled={showHtml}
            onMouseDown={(e) => e.preventDefault()} // keep the text selection
            onClick={run}
            className="w-8 h-8 rounded-md text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-40 flex items-center justify-center"
          >
            <Icon size={16} />
          </button>
        ))}
        <span className="ml-auto flex items-center gap-2">
          {uploading && <span className="text-xs text-slate-500">Uploading image...</span>}
          <button
            type="button"
            onClick={() => setShowHtml((v) => !v)}
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${showHtml ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-white"}`}
          >
            <Code2 size={14} /> HTML
          </button>
        </span>
        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(e.target.files[0])} />
      </div>
      {showHtml ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="block w-full min-h-[480px] p-4 font-mono text-xs text-slate-700 focus:outline-none"
        />
      ) : (
        <div
          ref={areaRef}
          contentEditable
          suppressContentEditableWarning
          onInput={sync}
          onBlur={sync}
          className="blog-editor min-h-[480px] max-h-[70vh] overflow-y-auto p-4 focus:outline-none"
        />
      )}
    </div>
  );
}
