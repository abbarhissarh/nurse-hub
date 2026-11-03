-- Secure, limited, logged downloads. Run in Supabase SQL Editor.
create or replace function public.claim_download(p_user uuid, p_product uuid, p_ip text)
returns text language plpgsql security definer set search_path = public as $$
declare e public.entitlements%rowtype; p public.products%rowtype;
begin
  select * into e from public.entitlements where user_id = p_user and product_id = p_product for update;
  if not found then return 'unavailable'; end if;
  if e.status <> 'active' then return 'disabled'; end if;
  select * into p from public.products where id = p_product;
  if not found or p.file_storage_key is null then return 'missing'; end if;
  if p.download_limit > 0 and e.download_count >= p.download_limit then return 'limit'; end if;
  update public.entitlements set download_count = download_count + 1 where id = e.id;
  insert into public.downloads (entitlement_id, user_id, product_id, ip_address) values (e.id, p_user, p_product, p_ip);
  return 'ok:' || p.file_storage_key;
end $$;
revoke all on function public.claim_download(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.claim_download(uuid, uuid, text) to service_role;
