"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { usePriced, Totals } from "@/components/Summary";
import { naira } from "@/lib/format";

export default function CartPage() {
  const { items, coupon, setCoupon, remove, ready } = useCart();
  const { priced, loading, error } = usePriced();
  const [code, setCode] = useState("");
  if (!ready) return <p className="p-8 text-muted">Loading your cart…</p>;
  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-8">
      <h1 className="text-3xl font-extrabold">Your cart</h1>
      {!items.length ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-muted">Your cart is empty. <Link href="/shop" className="text-teal">Browse the shop</Link>.</div>
      ) : (
        <>
          <ul className="space-y-2">
            {items.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                <div><Link href={`/product/${i.slug}`} className="font-bold">{i.title}</Link><p className="text-sm text-muted">Digital product · qty 1</p></div>
                <div className="text-right"><p className="font-bold">{naira(i.price)}</p><button onClick={() => remove(i.id)} className="text-sm text-red-600">Remove</button></div>
              </li>
            ))}
          </ul>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); setCoupon(code.trim().toUpperCase()); }}>
            <input value={code} onChange={(e) => setCode(e.target.value)} className="input" placeholder="Discount code" aria-label="Discount code" />
            <button className="btn-alt">Apply</button>
          </form>
          {coupon && priced?.couponError && <p role="alert" className="text-sm text-red-600">{priced.couponError}</p>}
          {coupon && priced && !priced.couponError && <p className="text-sm text-teal">Code {coupon} applied. <button className="underline" onClick={() => { setCoupon(""); setCode(""); }}>Remove</button></p>}
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
          {loading && !priced ? <p className="text-muted">Calculating…</p> : priced && <Totals p={priced} />}
          <Link href="/checkout" className={`btn w-full ${!priced || !priced.lines.length ? "pointer-events-none opacity-60" : ""}`}>Proceed to checkout</Link>
        </>
      )}
    </div>
  );
}
