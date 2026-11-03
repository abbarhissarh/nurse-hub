import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { naira } from "@/lib/format";
import { togglePublish, deleteProduct } from "../actions";
import ConfirmButton from "@/components/ConfirmButton";

export default async function Products({ searchParams }: { searchParams: { error?: string } }) {
  await requireAdmin();
  const { data } = await createClient().from("products").select("id,title,status,price,discount_price,file_storage_key,is_featured,categories(name)").order("created_at", { ascending: false });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-3xl font-extrabold">Products</h1><Link href="/admin/products/new" className="btn">Add product</Link></div>
      {searchParams.error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-700">{searchParams.error}</p>}
      <ul className="space-y-3">
        {data?.map((p: any) => (
          <li key={p.id} className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
            <div><b>{p.title}</b> {p.is_featured && <span className="text-xs text-teal">Featured</span>}
              <p className="text-sm text-muted">{p.categories?.name ?? "No category"} · {naira(p.discount_price ?? p.price)} · {p.status} · {p.file_storage_key ? "File uploaded" : "No file"}</p></div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/admin/products/${p.id}`} className="btn-alt">Edit</Link>
              <form action={togglePublish}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="to" value={p.status === "published" ? "draft" : "published"} /><button className="btn-alt">{p.status === "published" ? "Unpublish" : "Publish"}</button></form>
              <form action={deleteProduct}><input type="hidden" name="id" value={p.id} /><ConfirmButton message="Delete this product permanently?" className="btn-alt text-red-600">Delete</ConfirmButton></form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
