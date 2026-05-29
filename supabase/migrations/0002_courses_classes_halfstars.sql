-- ============================================================
--  Rate a Lesson – Migration 0002
--  Kurse/Gruppen + Klassen + halbe Sterne + Kommentare-Sichtbarkeit
-- ============================================================
--
--  Anwendung: Supabase Dashboard -> SQL Editor -> New query
--             -> einfügen -> Run.
--
--  Diese Migration ist idempotent: Du kannst sie gefahrlos
--  ausführen, auch wenn 0001 schon gelaufen ist. Es gehen
--  KEINE bestehenden Bewertungen verloren.
-- ============================================================

-- 1) Klasse (7B jetzt, 8B nächstes Jahr). Trennt die Rating-Töpfe.
alter table public.ratings
  add column if not exists class_code text not null default '7B';

-- 2) Kurs-/Gruppen-Kennung.
--    NULL  = normale Stunde, die die ganze Klasse gemeinsam hat.
--    sonst = stabiler Code des Kurses/der Gruppe (z. B. "ITA-GS"),
--            damit alle, die denselben Kurs haben, dieselben
--            Bewertungen sehen – egal wann er in ihrem Plan liegt.
alter table public.ratings
  add column if not exists course_code text;

-- 3) Halbe Sterne erlauben: stars wird zu numeric (1.0 … 5.0 in 0.5-Schritten).
alter table public.ratings
  alter column stars type numeric(2, 1) using stars::numeric;

alter table public.ratings
  drop constraint if exists ratings_stars_check;

alter table public.ratings
  add constraint ratings_stars_half_check
  check (stars >= 1 and stars <= 5 and (stars * 2) = floor(stars * 2));

-- 4) Index für die häufige Abfrage (Klasse + Kurs + Stunde).
create index if not exists ratings_course_idx
  on public.ratings (class_code, course_code, lesson_date, period);

-- 5) Insert-Policy aktualisieren (halbe Sterne zulassen).
drop policy if exists "ratings_insert_all" on public.ratings;
create policy "ratings_insert_all"
  on public.ratings for insert
  to anon, authenticated
  with check (
    stars >= 1 and stars <= 5 and (stars * 2) = floor(stars * 2)
    and period between 1 and 12
    and char_length(coalesce(comment, '')) <= 200
    and char_length(coalesce(nickname, '')) <= 40
    and char_length(coalesce(course_code, '')) <= 40
    and char_length(class_code) <= 10
  );
