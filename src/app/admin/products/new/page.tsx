import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import ProductForm from "@/components/ProductForm";

export default async function NewProduct() {
  await requireAdmin();
  const { data } = await createClient().from("categories").select("id,name").order("name");
  return <div className="max-w-xl"><h1 className="mb-4 text-3xl font-extrabold">Add product</h1><ProductForm categories={data ?? []} /></div>;
}
