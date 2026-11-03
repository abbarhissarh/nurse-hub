# Nurse Hub (Phase 1)

Next.js 14 + Supabase. Phase 1 includes: database + security rules, sign up / login / reset, shop, search, categories, product pages, account, library and orders pages.

## Run it
1. Install Node.js 20+.
2. `npm install`
3. Copy `.env.example` to `.env.local` and fill in your Supabase values.
4. Run the SQL files in `supabase/migrations` in order (see guide).
5. `npm run dev` then open http://localhost:3000

## Admin account
Sign up on the site, then in Supabase SQL Editor run:
`update public.profiles set role = 'admin' where email = 'you@example.com';`

## Testing before the admin dashboard exists
Products start as drafts, so the shop is empty. To see them while testing only:
`update public.products set status = 'published', file_storage_key = 'test/placeholder.pdf';`
Before real launch, set them back to `draft` and publish only after uploading genuine files.

## Phases
2: cart, checkout, Paystack, webhook, entitlements. 3: library downloads. 4: emails + SEO. 5: admin dashboard. 6: deploy.
