import { requireAdmin } from "@/lib/admin";
import { getSettings } from "@/lib/settings";
import { saveSettings } from "./actions";

export default async function Content({ searchParams }: { searchParams: { error?: string; saved?: string } }) {
  await requireAdmin();
  const s = await getSettings();
  const L = "block text-sm font-semibold";
  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-3xl font-extrabold">Site content</h1>
      {searchParams.saved && <p role="status" className="rounded-xl bg-teal/10 p-3 text-teal">Saved. Your changes are live.</p>}
      {searchParams.error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-700">{searchParams.error}</p>}
      <form action={saveSettings} className="space-y-4">
        <fieldset className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4"><legend className="px-1 font-bold">Homepage</legend>
          <label className={L}>Heading<input name="hero_title" defaultValue={s.hero_title} className="input mt-1" /></label>
          <label className={L}>Supporting text<textarea name="hero_subtitle" defaultValue={s.hero_subtitle} className="input mt-1 min-h-20" /></label>
          <label className={L}>Announcement banner (leave empty to hide)<input name="announcement" defaultValue={s.announcement} className="input mt-1" /></label></fieldset>
        <fieldset className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4"><legend className="px-1 font-bold">About Us</legend>
          <label className={L}>About text (blank line = new paragraph)<textarea name="about_text" defaultValue={s.about_text} className="input mt-1 min-h-48" /></label></fieldset>
        <fieldset className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4"><legend className="px-1 font-bold">Contact and business</legend>
          <label className={L}>Business name<input name="business_name" defaultValue={s.business_name} className="input mt-1" /></label>
          <label className={L}>Support email<input name="support_email" defaultValue={s.support_email} className="input mt-1" /></label>
          <label className={L}>Phone<input name="phone" defaultValue={s.phone} className="input mt-1" /></label>
          <label className={L}>WhatsApp number<input name="whatsapp" defaultValue={s.whatsapp} className="input mt-1" /></label></fieldset>
        <fieldset className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4"><legend className="px-1 font-bold">Social links (start with https://)</legend>
          <label className={L}>Instagram<input name="instagram" defaultValue={s.instagram} className="input mt-1" /></label>
          <label className={L}>Facebook<input name="facebook" defaultValue={s.facebook} className="input mt-1" /></label>
          <label className={L}>TikTok<input name="tiktok" defaultValue={s.tiktok} className="input mt-1" /></label></fieldset>
        <button className="btn w-full">Save changes</button>
      </form>
    </div>
  );
}
