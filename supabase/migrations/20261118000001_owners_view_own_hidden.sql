-- Le propriétaire voit ses événements et annonces masqués (sinon « Masquer » échouait :
-- la ligne masquée devenait invisible pour lui et la mise à jour était refusée)
create policy "Owners can view own events" on public.events for select using ((select auth.uid()) = user_id);
create policy "Owners can view own listings" on public.marketplace_listings for select using ((select auth.uid()) = user_id);
