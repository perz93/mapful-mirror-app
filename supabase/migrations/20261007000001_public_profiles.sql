-- Profil public des organisateurs et vendeurs.
-- La table profiles reste privée (elle contient l'e-mail) : on expose
-- seulement le nom, la photo, la bio et la date d'inscription.
alter table public.profiles add column if not exists bio text;

create or replace function public.get_public_profile(p_user_id uuid)
returns table (id uuid, full_name text, avatar_url text, bio text, created_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.full_name, p.avatar_url, p.bio, p.created_at
  from public.profiles p
  where p.id = p_user_id;
$$;

revoke all on function public.get_public_profile(uuid) from public;
grant execute on function public.get_public_profile(uuid) to anon, authenticated;
