-- Migration: Allow anonymous users to update existing ratings.
-- The app is fully anonymous (no auth). The device stores the rating-ID in
-- localStorage so only the original author can trigger an edit in practice.
-- The WITH CHECK clause ensures star values stay within valid bounds.

create policy "ratings_update_anon"
  on public.ratings
  for update
  to anon
  using (true)
  with check (
    stars >= 0.5
    and stars <= 5.0
  );
