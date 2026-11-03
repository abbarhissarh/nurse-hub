"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, audit } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
const KEY = /^[A-Za-z0-9._\-\/]{1,200}$/;
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const back = (path: string, error: string): never => redirect(`${path}?error=${encodeURIComponent(error)}`);
function refresh() { ["/admin", "/admin/products", "/shop", "/"].forEach((p) => revalidatePath(p)); }
function friendly(err: { code?: string; message?: string }) {
  if (err.code === "23514") return "A product can only be published after a file is uploaded.";
  if (err.code === "23505") return "That name, slug or code is already in use.";
  if (err.code === "23503") return "This item has been purchased or is in use. Unpublish or deactivate it instead.";
  return "Something went wrong. Please try again.";
}

export type ProductInput = {
  id?: string; title: string; slug: string; short_description: string; description: string; category_id: string;
  price: number; discount_price: number | null; file_storage_key: string | null; thumbnail_url: string | null;
  file_type: string; file_size: number | null; tags: string; is_featured: boolean; status: "draft" | "published"; download_limit: number;
};

export async function saveProduct(i: ProductInput): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireAdmin();
  const title = i.title.trim();
  if (title.length < 2) return { ok: false, error: "Enter a product title." };
  if (!Number.isInteger(i.price) || i.price < 0) return { ok: false, error: "Price must be a whole number of naira." };
  if (i.discount_price !== null && (!Number.isInteger(i.discount_price) || i.discount_price < 0 || i.discount_price >= i.price)) return { ok: false, error: "Discount price must be lower than the price." };
  if (!Number.isInteger(i.download_limit) || i.download_limit < 0) return { ok: false, error: "Download limit must be 0 or more (0 means unlimited)." };
  if (i.file_storage_key && !KEY.test(i.file_storage_key)) return { ok: false, error: "Invalid file reference." };
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  if (i.thumbnail_url && !i.thumbnail_url.startsWith(base)) return { ok: false, error: "Invalid thumbnail." };
  if (i.status === "published" && !i.file_storage_key) return { ok: false, error: "Upload a file before publishing." };

  const row = {
    title, slug: slugify(i.slug || title), short_description: i.short_description.trim().slice(0, 300), description: i.description.trim().slice(0, 10000),
    category_id: i.category_id || null, price: i.price, discount_price: i.discount_price, file_storage_key: i.file_storage_key || null,
    thumbnail_url: i.thumbnail_url || null, file_type: i.file_type || "PDF", file_size: i.file_size, is_featured: i.is_featured, status: i.status,
    download_limit: i.download_limit, tags: i.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 15), updated_at: new Date().toISOString(),
  };
  const db = createAdminClient();
  const { error } = i.id ? await db.from("products").update(row).eq("id", i.id) : await db.from("products").insert(row);
  if (error) return { ok: false, error: friendly(error) };
  await audit(admin.id, i.id ? "product.update" : "product.create", { title, status: i.status });
  refresh();
  return { ok: true };
}

export async function togglePublish(f: FormData) {
  const admin = await requireAdmin();
  const id = str(f, "id"), to = str(f, "to") === "published" ? "published" : "draft";
  const { error } = await createAdminClient().from("products").update({ status: to, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) back("/admin/products", friendly(error));
  await audit(admin.id, `product.${to}`, { id });
  refresh(); redirect("/admin/products");
}

export async function deleteProduct(f: FormData) {
  const admin = await requireAdmin();
  const id = str(f, "id");
  const { error } = await createAdminClient().from("products").delete().eq("id", id);
  if (error) back("/admin/products", friendly(error));
  await audit(admin.id, "product.delete", { id });
  refresh(); redirect("/admin/products");
}

export async function addCategory(f: FormData) {
  const admin = await requireAdmin();
  const name = str(f, "name");
  if (name.length < 2) back("/admin/categories", "Enter a category name.");
  const { error } = await createAdminClient().from("categories").insert({ name, slug: slugify(name), description: str(f, "description").slice(0, 300) });
  if (error) back("/admin/categories", friendly(error));
  await audit(admin.id, "category.create", { name });
  refresh(); revalidatePath("/admin/categories"); redirect("/admin/categories");
}

export async function toggleCategory(f: FormData) {
  const admin = await requireAdmin();
  const id = str(f, "id"), to = str(f, "to") === "active" ? "active" : "inactive";
  await createAdminClient().from("categories").update({ status: to }).eq("id", id);
  await audit(admin.id, `category.${to}`, { id });
  refresh(); revalidatePath("/admin/categories"); redirect("/admin/categories");
}

export async function deleteCategory(f: FormData) {
  const admin = await requireAdmin();
  const id = str(f, "id");
  await createAdminClient().from("categories").delete().eq("id", id);
  await audit(admin.id, "category.delete", { id });
  refresh(); revalidatePath("/admin/categories"); redirect("/admin/categories");
}

export async function addCoupon(f: FormData) {
  const admin = await requireAdmin();
  const code = str(f, "code").toUpperCase().replace(/[^A-Z0-9_-]/g, "");
  const type = str(f, "type") === "fixed" ? "fixed" : "percent";
  const value = parseInt(str(f, "value"), 10);
  if (code.length < 3) back("/admin/coupons", "Code must be at least 3 letters or numbers.");
  if (!Number.isInteger(value) || value <= 0 || (type === "percent" && value > 100)) back("/admin/coupons", "Enter a valid discount amount.");
  const limit = str(f, "limit") ? parseInt(str(f, "limit"), 10) : null;
  const { error } = await createAdminClient().from("coupons").insert({
    code, discount_type: type, discount_value: value, usage_limit: limit && limit > 0 ? limit : null,
    start_date: str(f, "start") || null, expiry_date: str(f, "expiry") || null,
  });
  if (error) back("/admin/coupons", friendly(error));
  await audit(admin.id, "coupon.create", { code });
  revalidatePath("/admin/coupons"); redirect("/admin/coupons");
}

export async function toggleCoupon(f: FormData) {
  const admin = await requireAdmin();
  const id = str(f, "id"), to = str(f, "to") === "active" ? "active" : "inactive";
  await createAdminClient().from("coupons").update({ status: to }).eq("id", id);
  await audit(admin.id, `coupon.${to}`, { id });
  revalidatePath("/admin/coupons"); redirect("/admin/coupons");
}
