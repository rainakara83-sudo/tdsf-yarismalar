-- TDSF RLS politikaları

alter table public.ulkeler enable row level security;
alter table public.dallar enable row level security;
alter table public.yas_gruplari enable row level security;
alter table public.yarismalar enable row level security;
alter table public.yarisma_dallar enable row level security;
alter table public.yarisma_yas_gruplari enable row level security;

-- ulkeler: herkes okur
drop policy if exists "ulkeler_select" on public.ulkeler;
create policy "ulkeler_select" on public.ulkeler for select using (true);

-- dallar: herkes okur
drop policy if exists "dallar_select" on public.dallar;
create policy "dallar_select" on public.dallar for select using (true);

-- yas_gruplari: herkes okur
drop policy if exists "yas_gruplari_select" on public.yas_gruplari;
create policy "yas_gruplari_select" on public.yas_gruplari for select using (true);

-- yarismalar: sadece yayinda olanları herkes görür
drop policy if exists "yarismalar_select" on public.yarismalar;
create policy "yarismalar_select" on public.yarismalar
  for select using (durum = 'yayinda');

drop policy if exists "yarismalar_insert" on public.yarismalar;
create policy "yarismalar_insert" on public.yarismalar
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "yarismalar_update" on public.yarismalar;
create policy "yarismalar_update" on public.yarismalar
  for update using (auth.role() = 'authenticated');

drop policy if exists "yarismalar_delete" on public.yarismalar;
create policy "yarismalar_delete" on public.yarismalar
  for delete using (auth.role() = 'authenticated');

-- yarisma_dallar: ilgili yarisma yayındaysa herkes görür
drop policy if exists "yarisma_dallar_select" on public.yarisma_dallar;
create policy "yarisma_dallar_select" on public.yarisma_dallar
  for select using (
    exists (
      select 1 from public.yarismalar y
      where y.id = yarisma_dallar.yarisma_id and y.durum = 'yayinda'
    )
  );

drop policy if exists "yarisma_dallar_insert" on public.yarisma_dallar;
create policy "yarisma_dallar_insert" on public.yarisma_dallar
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "yarisma_dallar_update" on public.yarisma_dallar;
create policy "yarisma_dallar_update" on public.yarisma_dallar
  for update using (auth.role() = 'authenticated');

drop policy if exists "yarisma_dallar_delete" on public.yarisma_dallar;
create policy "yarisma_dallar_delete" on public.yarisma_dallar
  for delete using (auth.role() = 'authenticated');

-- yarisma_yas_gruplari: ilgili yarisma yayındaysa herkes görür
drop policy if exists "yarisma_yas_gruplari_select" on public.yarisma_yas_gruplari;
create policy "yarisma_yas_gruplari_select" on public.yarisma_yas_gruplari
  for select using (
    exists (
      select 1 from public.yarismalar y
      where y.id = yarisma_yas_gruplari.yarisma_id and y.durum = 'yayinda'
    )
  );

drop policy if exists "yarisma_yas_gruplari_insert" on public.yarisma_yas_gruplari;
create policy "yarisma_yas_gruplari_insert" on public.yarisma_yas_gruplari
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "yarisma_yas_gruplari_update" on public.yarisma_yas_gruplari;
create policy "yarisma_yas_gruplari_update" on public.yarisma_yas_gruplari
  for update using (auth.role() = 'authenticated');

drop policy if exists "yarisma_yas_gruplari_delete" on public.yarisma_yas_gruplari;
create policy "yarisma_yas_gruplari_delete" on public.yarisma_yas_gruplari
  for delete using (auth.role() = 'authenticated');
