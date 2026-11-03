"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart, CartItem } from "./CartProvider";

export default function AddToCart({ item }: { item: CartItem }) {
  const { items, add } = useCart();
  const router = useRouter();
  const inCart = items.some((i) => i.id === item.id);
  return (
    <div className="flex flex-wrap gap-3">
      {inCart ? <Link href="/cart" className="btn-alt">In cart. View cart</Link> : <button className="btn-alt" onClick={() => add(item)}>Add to Cart</button>}
      <button className="btn" onClick={() => { add(item); router.push("/checkout"); }}>Buy Now</button>
    </div>
  );
}
