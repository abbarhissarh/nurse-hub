import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import ProductForm from "@/components/ProductForm";

export default async function EditProduct({ params }: { params: { id: string } }) {
  await requireAdmin();
  const db = createClient();
  const [{ data: product }, { data: cats }] = await Promise.all([
    db.from("products").select("*").eq("id", params.id).maybeSingle(),
    db.from("categories").select("id,name").order("name"),
  ]);
  if (!product) notFound();
  return <div className="max-w-xl"><h1 className="mb-4 text-3xl font-extrabold">Edit product</h1><ProductForm categories={cats ?? []} initial={product} /></div>;
}
