-- TDSF seed verileri

-- Ülkeler (34)
insert into public.ulkeler (ad, kod, sira) values
  ('Türkiye', 'TR', 1),
  ('Almanya', 'DE', 2),
  ('İtalya', 'IT', 3),
  ('İngiltere', 'GB', 4),
  ('Fransa', 'FR', 5),
  ('İspanya', 'ES', 6),
  ('Polonya', 'PL', 7),
  ('Avusturya', 'AT', 8),
  ('Hollanda', 'NL', 9),
  ('Belçika', 'BE', 10),
  ('Danimarka', 'DK', 11),
  ('İsveç', 'SE', 12),
  ('Norveç', 'NO', 13),
  ('Finlandiya', 'FI', 14),
  ('Çekya', 'CZ', 15),
  ('Slovakya', 'SK', 16),
  ('Macaristan', 'HU', 17),
  ('Romanya', 'RO', 18),
  ('Bulgaristan', 'BG', 19),
  ('Yunanistan', 'GR', 20),
  ('Hırvatistan', 'HR', 21),
  ('Slovenya', 'SI', 22),
  ('İsviçre', 'CH', 23),
  ('Lüksemburg', 'LU', 24),
  ('Portekiz', 'PT', 25),
  ('ABD', 'US', 26),
  ('Kanada', 'CA', 27),
  ('Japonya', 'JP', 28),
  ('Çin', 'CN', 29),
  ('Güney Kore', 'KR', 30),
  ('Brezilya', 'BR', 31),
  ('Arjantin', 'AR', 32),
  ('Avustralya', 'AU', 33),
  ('Rusya', 'RU', 34)
on conflict (ad) do nothing;

-- Dallar (ilk taslak)
insert into public.dallar (ad, sira) values
  ('Standart', 1),
  ('Latin', 2),
  ('10 Dans', 3),
  ('Show Dans', 4),
  ('Smooth', 5),
  ('Rhythm', 6),
  ('Formation', 7),
  ('Salsa', 8),
  ('Bachata', 9),
  ('Tango Argentino', 10),
  ('Tango Salon', 11),
  ('Vals', 12),
  ('Quickstep', 13)
on conflict (ad) do nothing;

-- Yaş grupları
insert into public.yas_gruplari (ad, sira) values
  ('Çocuk (6-11)', 1),
  ('Genç (12-15)', 2),
  ('Junior (16-18)', 3),
  ('Youth (19-21)', 4),
  ('Amatör (16-34)', 5),
  ('Pro (16-34)', 6),
  ('Senior I (35+)', 7),
  ('Senior II (45+)', 8),
  ('Senior III (55+)', 9),
  ('Senior IV (65+)', 10)
on conflict (ad) do nothing;

-- 4 örnek yarışma

-- 1) Blackpool Dance Festival 2025 — İngiltere
insert into public.yarismalar (
  ad, baslangic_tarihi, bitis_tarihi, ulke_id, sehir, organizator, organizasyon,
  durum, tr_katilim_var_mi
)
select
  'Blackpool Dance Festival 2025',
  '2025-08-25'::date,
  '2025-08-30'::date,
  (select id from public.ulkeler where ad = 'İngiltere'),
  'Blackpool',
  'Blackpool Dance Committee',
  'WDSF',
  'yayinda',
  true
where not exists (
  select 1 from public.yarismalar where ad = 'Blackpool Dance Festival 2025'
);

-- 2) WDSF Dünya Şampiyonası 2025 — Almanya
insert into public.yarismalar (
  ad, baslangic_tarihi, bitis_tarihi, ulke_id, sehir, organizator, organizasyon,
  durum, tr_katilim_var_mi
)
select
  'WDSF Dünya Şampiyonası 2025',
  '2025-10-10'::date,
  '2025-10-12'::date,
  (select id from public.ulkeler where ad = 'Almanya'),
  'Bremen',
  'WDSF',
  'WDSF',
  'yayinda',
  true
where not exists (
  select 1 from public.yarismalar where ad = 'WDSF Dünya Şampiyonası 2025'
);

-- 3) Türkiye Ulusal Şampiyonası 2025 — Türkiye
insert into public.yarismalar (
  ad, baslangic_tarihi, bitis_tarihi, ulke_id, sehir, organizator, organizasyon,
  durum, tr_katilim_var_mi
)
select
  'Türkiye Ulusal Şampiyonası 2025',
  '2025-05-15'::date,
  '2025-05-17'::date,
  (select id from public.ulkeler where ad = 'Türkiye'),
  'Ankara',
  'TDSF',
  'TDSF',
  'yayinda',
  true
where not exists (
  select 1 from public.yarismalar where ad = 'Türkiye Ulusal Şampiyonası 2025'
);

-- 4) ESN Dance Bursa 2026 — taslak
insert into public.yarismalar (
  ad, baslangic_tarihi, bitis_tarihi, ulke_id, sehir, organizator, organizasyon,
  durum, tr_katilim_var_mi
)
select
  'ESN Dance Bursa 2026',
  '2026-02-20'::date,
  '2026-02-20'::date,
  (select id from public.ulkeler where ad = 'Türkiye'),
  'Bursa',
  'ESN',
  'ESN',
  'taslak',
  true
where not exists (
  select 1 from public.yarismalar where ad = 'ESN Dance Bursa 2026'
);

-- Yarışma-Dal ilişkileri
insert into public.yarisma_dallar (yarisma_id, dal_id)
select y.id, d.id
from public.yarismalar y, public.dallar d
where y.ad = 'Blackpool Dance Festival 2025' and d.ad in ('Standart', 'Latin')
on conflict do nothing;

insert into public.yarisma_dallar (yarisma_id, dal_id)
select y.id, d.id
from public.yarismalar y, public.dallar d
where y.ad = 'WDSF Dünya Şampiyonası 2025' and d.ad = '10 Dans'
on conflict do nothing;

insert into public.yarisma_dallar (yarisma_id, dal_id)
select y.id, d.id
from public.yarismalar y, public.dallar d
where y.ad = 'Türkiye Ulusal Şampiyonası 2025' and d.ad in ('Standart', 'Latin', 'Show Dans')
on conflict do nothing;

insert into public.yarisma_dallar (yarisma_id, dal_id)
select y.id, d.id
from public.yarismalar y, public.dallar d
where y.ad = 'ESN Dance Bursa 2026' and d.ad = 'Latin'
on conflict do nothing;

-- Yarışma-Yaş Grubu ilişkileri
insert into public.yarisma_yas_gruplari (yarisma_id, yas_grubu_id)
select y.id, yg.id
from public.yarismalar y, public.yas_gruplari yg
where y.ad = 'Blackpool Dance Festival 2025' and yg.ad in ('Amatör (16-34)', 'Pro (16-34)')
on conflict do nothing;

insert into public.yarisma_yas_gruplari (yarisma_id, yas_grubu_id)
select y.id, yg.id
from public.yarismalar y, public.yas_gruplari yg
where y.ad = 'WDSF Dünya Şampiyonası 2025' and yg.ad = 'Pro (16-34)'
on conflict do nothing;

insert into public.yarisma_yas_gruplari (yarisma_id, yas_grubu_id)
select y.id, yg.id
from public.yarismalar y, public.yas_gruplari yg
where y.ad = 'Türkiye Ulusal Şampiyonası 2025' and yg.ad in ('Junior (16-18)', 'Youth (19-21)', 'Amatör (16-34)')
on conflict do nothing;
