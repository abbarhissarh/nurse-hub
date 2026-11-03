import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CartLink from "./CartLink";

export default async function Header() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const links = [["Home", "/"], ["Shop", "/shop"], ["Categories", "/#categories"], ["About Us", "/about"], ["Contact", "/contact"]];
  const account = user
    ? [["My Account", "/account"], ["My Library", "/library"], ["Orders", "/orders"]]
    : [["Login / Register", "/login"]];
  return (
    <header className="sticky top-0 z-30 bg-navy text-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-extrabold">Nurse<span className="text-teal-300">Hub</span></Link>
        <div className="flex items-center gap-4">
          <nav className="hidden items-center gap-6 text-sm md:flex" aria-label="Main">
            {[...links, ...account].map(([l, h]) => <Link key={h} href={h} className="hover:underline">{l}</Link>)}
            {user && <form action="/auth/logout" method="post"><button className="hover:underline">Logout</button></form>}
          </nav>
          <CartLink />
          <details className="relative md:hidden">
            <summary className="cursor-pointer list-none rounded-lg px-3 py-2 text-lg" aria-label="Menu">☰</summary>
            <div className="absolute right-0 mt-2 flex w-56 flex-col gap-3 rounded-xl bg-navy p-4 shadow-xl">
              {[...links, ...account].map(([l, h]) => <Link key={h} href={h}>{l}</Link>)}
              {user && <form action="/auth/logout" method="post"><button>Logout</button></form>}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
