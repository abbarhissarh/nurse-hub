import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export const metadata = { title: "Admin" };
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const tabs = [["Overview", "/admin"], ["Products", "/admin/products"], ["Categories", "/admin/categories"], ["Orders", "/admin/orders"], ["Customers", "/admin/customers"], ["Coupons", "/admin/coupons"], ["Reports", "/admin/reports"]];
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <nav aria-label="Admin" className="mb-6 flex gap-2 overflow-x-auto border-b border-slate-200 pb-3">
        {tabs.map(([l, h]) => <Link key={h} href={h} className="whitespace-nowrap rounded-lg bg-navy px-3 py-1.5 text-sm font-semibold text-white">{l}</Link>)}
      </nav>
      {children}
    </div>
  );
}
