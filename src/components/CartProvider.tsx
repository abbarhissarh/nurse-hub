"use client";
import { createContext, useContext, useEffect, useState } from "react";

export type CartItem = { id: string; slug: string; title: string; price: number };
type Ctx = {
  items: CartItem[]; coupon: string; ready: boolean;
  add: (i: CartItem) => boolean; remove: (id: string) => void; clear: () => void; setCoupon: (c: string) => void;
};
const CartCtx = createContext<Ctx | null>(null);
export function useCart(): Ctx {
  const c = useContext(CartCtx);
  if (!c) throw new Error("CartProvider is missing");
  return c;
}

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState("");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("nh-cart");
      if (raw) { const p = JSON.parse(raw); setItems(Array.isArray(p.items) ? p.items : []); setCoupon(typeof p.coupon === "string" ? p.coupon : ""); }
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) { try { localStorage.setItem("nh-cart", JSON.stringify({ items, coupon })); } catch {} }
  }, [items, coupon, ready]);

  const add = (i: CartItem) => {
    if (items.some((x) => x.id === i.id)) return false;
    setItems((prev) => (prev.some((x) => x.id === i.id) ? prev : [...prev, i]));
    return true;
  };
  const remove = (id: string) => setItems((prev) => prev.filter((x) => x.id !== id));
  const clear = () => { setItems([]); setCoupon(""); };
  return <CartCtx.Provider value={{ items, coupon, ready, add, remove, clear, setCoupon }}>{children}</CartCtx.Provider>;
}
