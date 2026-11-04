import Link from "next/link";

const TABS: [string, string][] = [["Privacy", "/privacy"], ["Terms", "/terms"], ["Refunds", "/refunds"], ["Disclaimer", "/disclaimer"]];
export type LegalSection = { h: string; p: string[] };

export default function Legal({ active, title, sections }: { active: string; title: string; sections: LegalSection[] }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <nav aria-label="Policies" className="mb-6 flex gap-1 overflow-x-auto border-b border-slate-200">
        {TABS.map(([l, h]) => <Link key={h} href={h} aria-current={h === active ? "page" : undefined}
          className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold ${h === active ? "border-teal text-teal" : "border-transparent text-muted"}`}>{l}</Link>)}
      </nav>
      <h1 className="text-3xl font-extrabold">{title}</h1>
      <p className="mt-1 text-sm text-muted">Last updated: November 2026</p>
      <div className="mt-6 space-y-6">
        {sections.map((s) => (
          <section key={s.h} className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-2 text-lg font-bold">{s.h}</h2>
            <div className="space-y-2 text-slate-700">{s.p.map((line, i) => line.startsWith("- ") ? <p key={i} className="pl-4">• {line.slice(2)}</p> : <p key={i}>{line}</p>)}</div>
          </section>
        ))}
      </div>
    </div>
  );
}
