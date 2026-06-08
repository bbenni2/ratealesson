-- ════════════════════════════════════════════════════════════════
--  Rate a Lesson – Migration 0004
--  Auth: Profile-Tabelle, user_id in ratings, Fix 0.5-Stern INSERT
-- ════════════════════════════════════════════════════════════════
--
--  ⚠️  VOR DEM AUSFÜHREN einmalig im Supabase Dashboard:
--      Authentication → Providers → Email →
--        • „Confirm email"         DEAKTIVIEREN
--      (Die Adressen sind synthetisch @ral.internal –
--       echte Bestätigungs-E-Mails würden nie ankommen.)
--
--  Anwendung: SQL Editor → New query → einfügen → Run
-- ════════════════════════════════════════════════════════════════

-- ── 1) Profile-Tabelle ────────────────────────────────────────────
--  Jeder Auth-User bekommt genau einen Profil-Eintrag.
--  auth_email = synthetische E-Mail (username@ral.internal), fix beim
--  Signup gesetzt und nie mehr geändert – dient als stabiler Login-Key.
--  username = öffentlicher Anzeigename, änderbar.
create table if not exists public.profiles (
  id         uuid        primary key references auth.users(id) on delete cascade,
  username   text        unique not null,
  auth_email text        not null,
  created_at timestamptz not null default now()
);

comment on table public.profiles is
  'Ein Profil pro Auth-User. auth_email ist unveränderlich; username kann geändert werden.';

alter table public.profiles enable row level security;

-- Alle (inkl. anonym) dürfen lesen – nötig für den Sign-in-Lookup
create policy "profiles_select_anon"
  on public.profiles for select
  to anon, authenticated
  using (true);

-- Nur der eigene Account darf sein Profil einfügen (via Trigger)
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

-- Nur der eigene Account darf seinen Benutzernamen ändern
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using  (id = auth.uid())
  with check (id = auth.uid());

-- ── 2) Trigger: Profil automatisch beim Signup anlegen ───────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, auth_email)
  values (
    new.id,
    lower(coalesce(
      new.raw_user_meta_data->>'username',
      'user_' || left(new.id::text, 8)
    )),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── 3) user_id in ratings (nullable – alte Anon-Bewertungen bleiben) ─
alter table public.ratings
  add column if not exists user_id uuid
    references auth.users(id) on delete set null;

-- Authentifizierte Nutzer dürfen nur ihre eigenen Bewertungen bearbeiten
drop policy if exists "ratings_update_authenticated" on public.ratings;
create policy "ratings_update_authenticated"
  on public.ratings
  for update to authenticated
  using  (user_id = auth.uid())
  with check (stars >= 0.5 and stars <= 5.0);

-- ── 4) Bugfix: Halbe Sterne ≥ 0.5 auch beim INSERT erlauben ─────
--  Migration 0002 hat fälschlicherweise stars >= 1 erzwungen.
alter table public.ratings
  drop constraint if exists ratings_stars_half_check;

alter table public.ratings
  add constraint ratings_stars_half_check
  check (stars >= 0.5 and stars <= 5 and (stars * 2) = floor(stars * 2));

drop policy if exists "ratings_insert_all" on public.ratings;
create policy "ratings_insert_all"
  on public.ratings for insert
  to anon, authenticated
  with check (
    stars >= 0.5 and stars <= 5 and (stars * 2) = floor(stars * 2)
    and period between 1 and 12
    and char_length(coalesce(comment,     '')) <= 200
    and char_length(coalesce(nickname,    '')) <= 40
    and char_length(coalesce(course_code, '')) <= 40
    and char_length(class_code)                <= 10
  );
