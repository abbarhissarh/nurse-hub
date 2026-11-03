"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { usePriced, Totals } from "./Summary";
import { naira } from "@/lib/format";

export default function CheckoutClient({ name, email }: { name: string; email: string }) {
  const { items, coupon, ready } = useCart();
  const { priced, loading, error } = usePriced();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function pay() {
    setErr(""); setBusy(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: items.map((i) => i.id), coupon }) });
      const data = await res.json();
      if (!res.ok || !data.url) { setErr(data.error || "Something went wrong. Please try again."); setBusy(false); return; }
      window.location.href = data.url;
    } catch { setErr("Network error. Please try again."); setBusy(false); }
  }

  if (!ready || (loading && !priced)) return <p className="p-8 text-muted">Loading checkout…</p>;
  if (!items.length || !priced || !priced.lines.length) {
    return <div className="mx-auto max-w-3xl px-4 py-8"><div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-muted">
      Nothing to check out. {priced && priced.ownedCount > 0 && "Some items are already in your library. "}<Link href="/shop" className="text-teal">Browse the shop</Link>.</div></div>;
  }
  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-8">
      <h1 className="text-3xl font-extrabold">Checkout</h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm text-muted">Buying as</p><p className="font-bold">{name}</p><p>{email}</p></div>
      <ul className="space-y-2">{priced.lines.map((l) => <li key={l.id} className="flex justify-between rounded-2xl border border-slate-200 bg-white p-4"><span>{l.title}</span><b>{naira(l.price)}</b></li>)}</ul>
      <Totals p={priced} />
      {(error || err) && <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-700">{error || err}</p>}
      <button className="btn w-full" disabled={busy} onClick={pay}>{busy ? "Redirecting to Paystack…" : `Pay ${naira(priced.total)} with Paystack`}</button>
      <p className="text-xs text-muted">You’ll pay on Paystack’s secure page. Your files unlock automatically once payment is verified.</p>
    </div>
  );
}
