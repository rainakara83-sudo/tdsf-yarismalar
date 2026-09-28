-- TDSF Yarışmalar şeması

-- Ülkeler
create table if not exists public.ulkeler (
  id uuid primary key default gen_random_uuid(),
  ad text unique not null,
  kod text,
  sira int default 0,
  created_at timestamptz default now()
);

-- Dallar
create table if not exists public.dallar (
  id uuid primary key default gen_random_uuid(),
  ad text unique not null,
  sira int default 0,
  created_at timestamptz default now()
);

-- Yaş grupları
create table if not exists public.yas_gruplari (
  id uuid primary key default gen_random_uuid(),
  ad text unique not null,
  sira int default 0,
  created_at timestamptz default now()
);

-- Yarışma durum enum
do $$ begin
  create type public.yarisma_durum as enum ('taslak', 'yayinda', 'iptal');
exception when duplicate_object then null; end $$;

-- Yarışmalar
create table if not exists public.yarismalar (
  id uuid primary key default gen_random_uuid(),
  ad text not null,
  baslangic_tarihi date,
  bitis_tarihi date,
  ulke_id uuid references public.ulkeler(id) on delete set null,
  sehir text,
  salon text,
  organizator text,
  organizasyon text,
  kayit_son_tarihi date,
  kayit_linki text,
  program_linki text,
  sonuc_linki text,
  tr_katilim_var_mi boolean default false,
  notlar text,
  durum public.yarisma_durum default 'taslak',
  son_guncelleme timestamptz default now(),
  kaynak text,
  dis_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Yarışma-Dal köprüsü
create table if not exists public.yarisma_dallar (
  yarisma_id uuid references public.yarismalar(id) on delete cascade,
  dal_id uuid references public.dallar(id) on delete cascade,
  primary key (yarisma_id, dal_id)
);

-- Yarışma-Yaş Grubu köprüsü
create table if not exists public.yarisma_yas_gruplari (
  yarisma_id uuid references public.yarismalar(id) on delete cascade,
  yas_grubu_id uuid references public.yas_gruplari(id) on delete cascade,
  primary key (yarisma_id, yas_grubu_id)
);

-- İndeksler
create index if not exists idx_yarismalar_durum on public.yarismalar (durum);
create index if not exists idx_yarismalar_baslangic on public.yarismalar (baslangic_tarihi);
create index if not exists idx_yarismalar_ulke_id on public.yarismalar (ulke_id);
