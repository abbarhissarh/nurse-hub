"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { saveProduct } from "@/app/admin/actions";

const DOCS = ["pdf", "docx", "pptx", "xlsx", "zip"];
const IMGS = ["png", "jpg", "jpeg", "webp"];
const ext = (n: string) => (n.split(".").pop() || "").toLowerCase();

export default function ProductForm({ categories, initial }: { categories: { id: string; name: string }[]; initial?: any }) {
  const router = useRouter();
  const [v, setV] = useState({
    title: initial?.title ?? "", slug: initial?.slug ?? "", short_description: initial?.short_description ?? "", description: initial?.description ?? "",
    category_id: initial?.category_id ?? "", price: String(initial?.price ?? ""), discount_price: initial?.discount_price ? String(initial.discount_price) : "",
    tags: (initial?.tags ?? []).join(", "), download_limit: String(initial?.download_limit ?? 5), is_featured: !!initial?.is_featured, status: (initial?.status ?? "draft") as "draft" | "published",
  });
  const [file, setFile] = useState<{ key: string | null; type: string; size: number | null }>({ key: initial?.file_storage_key ?? null, type: initial?.file_type ?? "PDF", size: initial?.file_size ?? null });
  const [thumb, setThumb] = useState<string | null>(initial?.thumbnail_url ?? null);
  const [busy, setBusy] = useState(false); const [uploading, setUploading] = useState(""); const [err, setErr] = useState("");
  const set = (k: string, val: string | boolean) => setV((p) => ({ ...p, [k]: val }));

  async function up(bucket: "product-files" | "thumbnails", f: File) {
    const path = `${crypto.randomUUID()}.${ext(f.name)}`;
    const { error } = await createClient().storage.from(bucket).upload(path, f, { contentType: f.type || undefined });
    if (error) throw new Error(error.message);
    return path;
  }
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return; setErr("");
    if (!DOCS.includes(ext(f.name))) return setErr("Allowed file types: PDF, DOCX, PPTX, XLSX, ZIP.");
    if (f.size > 50 * 1024 * 1024) return setErr("File is over 50 MB (the free Supabase limit).");
    setUploading("Uploading file…");
    try { const key = await up("product-files", f); setFile({ key, type: ext(f.name).toUpperCase(), size: f.size }); } catch (x: any) { setErr(`Upload failed: ${x.message}`); }
    setUploading("");
  }
  async function onThumb(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return; setErr("");
    if (!IMGS.includes(ext(f.name))) return setErr("Thumbnail must be PNG, JPG or WEBP.");
    if (f.size > 2 * 1024 * 1024) return setErr("Thumbnail must be under 2 MB.");
    setUploading("Uploading image…");
    try { const key = await up("thumbnails", f); setThumb(createClient().storage.from("thumbnails").getPublicUrl(key).data.publicUrl); } catch (x: any) { setErr(`Upload failed: ${x.message}`); }
    setUploading("");
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setBusy(true);
    const res = await saveProduct({
      id: initial?.id, title: v.title, slug: v.slug, short_description: v.short_description, description: v.description, category_id: v.category_id,
      price: parseInt(v.price, 10), discount_price: v.discount_price ? parseInt(v.discount_price, 10) : null,
      file_storage_key: file.key, thumbnail_url: thumb, file_type: file.type, file_size: file.size, tags: v.tags,
      is_featured: v.is_featured, status: v.status, download_limit: parseInt(v.download_limit, 10),
    });
    setBusy(false);
    if (!res.ok) return setErr(res.error || "Could not save.");
    router.push("/admin/products"); router.refresh();
  }
  const L = "block text-sm font-semibold";
  return (
    <form onSubmit={submit} className="space-y-4">
      <label className={L}>Title<input className="input mt-1" value={v.title} onChange={(e) => set("title", e.target.value)} required /></label>
      <label className={L}>URL slug (optional)<input className="input mt-1" value={v.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto from title" /></label>
      <label className={L}>Short description<input className="input mt-1" value={v.short_description} onChange={(e) => set("short_description", e.target.value)} maxLength={300} /></label>
      <label className={L}>Full description<textarea className="input mt-1 min-h-28" value={v.description} onChange={(e) => set("description", e.target.value)} /></label>
      <label className={L}>Category<select className="input mt-1" value={v.category_id} onChange={(e) => set("category_id", e.target.value)}><option value="">None</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <div className="grid grid-cols-2 gap-3">
        <label className={L}>Price (₦)<input className="input mt-1" inputMode="numeric" value={v.price} onChange={(e) => set("price", e.target.value)} required /></label>
        <label className={L}>Discount price (₦)<input className="input mt-1" inputMode="numeric" value={v.discount_price} onChange={(e) => set("discount_price", e.target.value)} /></label>
      </div>
      <label className={L}>Tags (comma separated)<input className="input mt-1" value={v.tags} onChange={(e) => set("tags", e.target.value)} /></label>
      <label className={L}>Download limit (0 = unlimited)<input className="input mt-1" inputMode="numeric" value={v.download_limit} onChange={(e) => set("download_limit", e.target.value)} /></label>
      <div className="rounded-xl border border-slate-200 bg-white p-3"><p className={L}>Product file (PDF, DOCX, PPTX, XLSX, ZIP)</p>
        <p className="text-sm text-muted">{file.key ? `File uploaded: ${file.type}${file.size ? `, ${(file.size / 1048576).toFixed(1)} MB` : ""}` : "No file uploaded yet"}</p>
        <input type="file" onChange={onFile} className="mt-2" aria-label="Product file" /></div>
      <div className="rounded-xl border border-slate-200 bg-white p-3"><p className={L}>Thumbnail image (optional)</p>
        {thumb && /* eslint-disable-next-line @next/next/no-img-element */ <img src={thumb} alt="Thumbnail" className="my-2 h-24 rounded-lg" />}
        <input type="file" accept="image/*" onChange={onThumb} aria-label="Thumbnail" /></div>
      <label className="flex items-center gap-2"><input type="checkbox" checked={v.is_featured} onChange={(e) => set("is_featured", e.target.checked)} /> Featured on homepage</label>
      <label className={L}>Status<select className="input mt-1" value={v.status} onChange={(e) => set("status", e.target.value)}><option value="draft">Draft (hidden)</option><option value="published">Published (visible)</option></select></label>
      {uploading && <p className="text-sm text-teal">{uploading}</p>}
      {err && <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-700">{err}</p>}
      <button className="btn w-full" disabled={busy || !!uploading}>{busy ? "Saving…" : "Save product"}</button>
    </form>
  );
}
