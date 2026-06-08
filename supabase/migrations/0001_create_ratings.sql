-- ============================================================
--  Rate a Lesson – Datenbank-Migration
--  Tabelle: ratings  (Bewertungen)
-- ============================================================
--
-- Anwendung im Supabase Dashboard:
--   SQL Editor -> New query -> diesen Inhalt einfügen -> Run
--
-- Oder via Supabase CLI:
--   supabase db push
-- ============================================================

create extension if not exists "pgcrypto";

create table if not exists public.ratings (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),

  -- Identifiziert die konkrete Stunde an einem konkreten Tag.
  -- lesson_date = Datum der Stunde, period = Stundennummer (1..n)
  lesson_date  date    not null,
  period       int     not null check (period between 1 and 12),

  -- Snapshot des Fachs (damit Stats unabhängig vom Stundenplan bleiben)
  subject      text    not null,

  -- 1–5 Sterne
  stars        smallint not null check (stars between 1 and 5),

  -- Optionaler Kommentar (max. 200 Zeichen) + optionaler Spitzname
  comment      text    check (char_length(comment) <= 200),
  nickname     text    check (char_length(nickname) <= 40)
);

comment on table public.ratings is 'Anonyme Stundenbewertungen (1-5 Sterne).';

-- Schneller Zugriff auf die Bewertungen einer bestimmten Stunde
create index if not exists ratings_lesson_idx
  on public.ratings (lesson_date, period);

-- Schneller Zugriff für die History (nach Datum sortiert)
create index if not exists ratings_created_idx
  on public.ratings (created_at desc);

-- ============================================================
--  Row Level Security
--  App ist voll anonym -> jede:r darf lesen & einfügen,
--  aber NICHT verändern oder löschen.
-- ============================================================

alter table public.ratings enable row level security;

drop policy if exists "ratings_select_all" on public.ratings;
create policy "ratings_select_all"
  on public.ratings for select
  to anon, authenticated
  using (true);

drop policy if exists "ratings_insert_all" on public.ratings;
create policy "ratings_insert_all"
  on public.ratings for insert
  to anon, authenticated
  with check (
    stars between 1 and 5
    and period between 1 and 12
    and char_length(coalesce(comment, '')) <= 200
    and char_length(coalesce(nickname, '')) <= 40
  );

-- ============================================================
--  Realtime aktivieren (Live-Updates der Bewertungen)
--  Conditional: schlägt nicht fehl wenn Tabelle schon Mitglied ist.
-- ============================================================

do $$ begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename  = 'ratings'
  ) then
    execute 'alter publication supabase_realtime add table public.ratings';
  end if;
end $$;
