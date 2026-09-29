# TDSF Yarışmalar

Türkiye Dans Sporları Federasyonu yarışma listeleme sitesi. Next.js 16 + Supabase ile yayında olan dans yarışmalarını listeler, takvim görünümü sunar, detay sayfaları gösterir ve admin panelinden CRUD ile yarışma yönetimi sağlar.

## Özellikler

- **Anasayfa** (`/`): Ülke, dal, yaş grubu, durum filtreleriyle yarışma listesi
- **Takvim** (`/takvim`): Aylık görünümde yarışmalar (tıklanabilir)
- **Detay** (`/yarisma/[id]`): Tek yarışmanın tüm bilgileri, kayıt son tarihi uyarısı
- **Admin** (`/admin`): Email/şifre ile giriş, yarışma ekleme/düzenleme/silme/kopyalama, durum yönetimi (taslak/yayında/iptal)
- **RLS korumalı**: Anon kullanıcılar sadece `durum='yayinda'` olan yarışmaları görebilir

## Kurulum

```bash
npm install
cp .env.example .env.local
# .env.local içine Supabase URL ve publishable key'i yaz
```

## Supabase Veritabanı Kurulumu

Supabase projesinde SQL Editor'e sırayla şu dosyaları çalıştır:

1. `supabase/schema.sql` — 6 tablo (ulkeler, dallar, yas_gruplari, yarismalar, yarisma_dallar, yarisma_yas_gruplari) oluşturulur
2. `supabase/policies.sql` — Tüm tablolarda RLS etkinleştirilir, anon SELECT politikası yarışmalar için `durum='yayinda'` ile kısıtlanır, INSERT/UPDATE/DELETE yalnızca `auth.role()='authenticated'` için açılır
3. `supabase/seed.sql` — Örnek ülke/dal/yaş grubu/yarışma verileri

## Admin Kullanıcısı Ekleme

Supabase Dashboard → **Authentication** → **Users** → **Add user** → email/şifre ile admin oluştur. Bu kullanıcı `/admin/login` üzerinden giriş yapabilir.

## Geliştirme

```bash
npm run dev
# http://localhost:3000
```

## Yayın

### Vercel

1. Repo'yu Vercel'e bağla
2. **Environment Variables** kısmına ekle:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
3. Deploy

`proxy.ts` dosyası Next.js 16 ile birlikte `/admin/*` rotalarını korur, login olmayan kullanıcılar `/admin/login`'e yönlendirilir.

## Mimari Notlar

- **Next.js 16.3.6** App Router ile
- **TypeScript** her yerde
- **Supabase RLS**: Tüm 6 tabloda RLS aktif, `service_role` key kodda ASLA yok
- **Server Actions**: Tüm mutasyonlar server action üzerinden (otomatik CSRF korumalı)
- **Tailwind CSS** mobile-first responsive tasarım

## Proje Yapısı

```
src/
├── app/
│   ├── admin/                  # Admin paneli (proxy.ts korumalı)
│   │   ├── login/
│   │   ├── yarismalar/         # Liste, yeni, düzenle
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── takvim/                 # Takvim görünümü
│   ├── yarisma/[id]/           # Yarışma detay sayfası
│   ├── page.tsx                # Anasayfa (filtreler + liste)
│   └── layout.tsx
├── components/                 # Paylaşılan client componentler
├── lib/supabase/               # Server + client Supabase client'ları
└── proxy.ts                    # Next.js 16 proxy (eski middleware)
supabase/
├── schema.sql                  # Tablolar
├── policies.sql                # RLS politikaları
└── seed.sql                    # Örnek veriler
```