-- Atomic, idempotent order fulfilment. Run in Supabase SQL Editor.
create or replace function public.fulfil_order(p_reference text, p_amount integer)
returns text language plpgsql security definer set search_path = public as $$
declare pay public.payments%rowtype; ord public.orders%rowtype;
begin
  select * into pay from public.payments where payment_reference = p_reference for update;
  if not found then return 'not_found'; end if;
  if pay.status = 'success' then return 'already_fulfilled'; end if;
  if pay.amount <> p_amount then return 'amount_mismatch'; end if;
  update public.payments set status = 'success', verified_at = now() where id = pay.id;
  update public.orders set payment_status = 'paid', order_status = 'completed', updated_at = now()
    where id = pay.order_id returning * into ord;
  insert into public.entitlements (user_id, product_id, order_id)
    select ord.user_id, oi.product_id, ord.id from public.order_items oi
    where oi.order_id = ord.id and oi.product_id is not null
    on conflict (user_id, product_id) do nothing;
  if ord.coupon_id is not null then
    update public.coupons set usage_count = usage_count + 1 where id = ord.coupon_id;
  end if;
  return 'fulfilled';
end $$;
revoke all on function public.fulfil_order(text, integer) from public, anon, authenticated;
grant execute on function public.fulfil_order(text, integer) to service_role;
