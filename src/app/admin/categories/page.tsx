import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { addCategory, toggleCategory, deleteCategory } from "../actions";
import ConfirmButton from "@/components/ConfirmButton";

export default async function Categories({ searchParams }: { searchParams: { error?: string } }) {
  await requireAdmin();
  const { data } = await createClient().from("categories").select("id,name,slug,status").order("name");
  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-3xl font-extrabold">Categories</h1>
      {searchParams.error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-700">{searchParams.error}</p>}
      <form action={addCategory} className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
        <input name="name" className="input" placeholder="Category name" required aria-label="Category name" />
        <input name="description" className="input" placeholder="Short description" aria-label="Description" />
        <button className="btn">Add category</button>
      </form>
      <ul className="space-y-2">{data?.map((c: any) => (
        <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3">
          <span><b>{c.name}</b> <span className="text-sm text-muted">{c.status}</span></span>
          <span className="flex gap-2">
            <form action={toggleCategory}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="to" value={c.status === "active" ? "inactive" : "active"} /><button className="btn-alt">{c.status === "active" ? "Deactivate" : "Activate"}</button></form>
            <form action={deleteCategory}><input type="hidden" name="id" value={c.id} /><ConfirmButton message="Delete this category? Its products become uncategorised." className="btn-alt text-red-600">Delete</ConfirmButton></form>
          </span>
        </li>))}</ul>
    </div>
  );
}
