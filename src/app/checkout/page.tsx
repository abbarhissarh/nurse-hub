import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CheckoutClient from "@/components/CheckoutClient";

export const metadata = { title: "Checkout" };
export default async function Checkout() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/checkout");
  const { data: profile } = await supabase.from("profiles").select("full_name,email").eq("id", user.id).single();
  return <CheckoutClient name={profile?.full_name || "Customer"} email={profile?.email || user.email || ""} />;
}
