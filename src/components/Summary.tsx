"use client";
import { useEffect, useState } from "react";
import { useCart } from "./CartProvider";
import { naira } from "@/lib/format";

export type PricedView = {
  lines: { id: string; title: string; price: number }[];
  subtotal: number; discount: number; total: number; couponError: string | null; ownedCount: number;
};

// Fetches server-calculated prices for whatever is in the cart.
export function usePriced() {
  const { items, coupon, ready, remove } = useCart();
  const [priced, setPriced] = useState<PricedView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!ready) return;
    if (!items.length) { setPriced(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError("");
    fetch("/api/cart/price", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: items.map((i) => i.id), coupon }) })
      .then((r) => { if (!r.ok) throw new Error(); return r.json() as Promise<PricedView>; })
      .then((d) => {
        if (cancelled) return;
        setPriced(d); setLoading(false);
        const ok = new Set(d.lines.map((l) => l.id));
        items.forEach((i) => { if (!ok.has(i.id)) remove(i.id); });
      })
      .catch(() => { if (!cancelled) { setError("We couldn’t load your cart prices. Check your connection and refresh."); setLoading(false); } });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, coupon, ready]);
  return { priced, loading, error };
}

export function Totals({ p }: { p: PricedView }) {
  return (
    <div className="space-y-1 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex justify-between"><span>Subtotal</span><span>{naira(p.subtotal)}</span></div>
      {p.discount > 0 && <div className="flex justify-between text-teal"><span>Discount</span><span>−{naira(p.discount)}</span></div>}
      <div className="flex justify-between text-lg font-extrabold"><span>Total</span><span>{naira(p.total)}</span></div>
    </div>
  );
}
