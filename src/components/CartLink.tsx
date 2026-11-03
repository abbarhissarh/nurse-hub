"use client";
import Link from "next/link";
import { useCart } from "./CartProvider";

export default function CartLink() {
  const { items } = useCart();
  return (
    <Link href="/cart" aria-label={`Cart, ${items.length} items`} className="relative rounded-lg px-2 py-1 text-lg">
      🛒<span className="ml-1 rounded-full bg-teal px-1.5 text-xs font-bold">{items.length}</span>
    </Link>
  );
}
