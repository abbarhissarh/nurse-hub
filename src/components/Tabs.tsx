"use client";
import { useState } from "react";

export default function Tabs({ tabs }: { tabs: { label: string; content: React.ReactNode }[] }) {
  const [i, setI] = useState(0);
  return (
    <div>
      <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-slate-200">
        {tabs.map((t, n) => (
          <button key={t.label} role="tab" aria-selected={n === i} onClick={() => setI(n)}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition ${n === i ? "border-teal text-teal" : "border-transparent text-muted hover:text-ink"}`}>{t.label}</button>
        ))}
      </div>
      <div role="tabpanel" className="pt-4">{tabs[i].content}</div>
    </div>
  );
}
