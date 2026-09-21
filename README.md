# PatiAlan V0.1

Türkiye için **Private Pet Spaces** pazaryeri MVP'si. İlk pilot İstanbul'da doğrulanmış özel köpek alanlarının 30/60/90 dakikalık rezervasyonu üzerine kuruludur.

## Canlı pilot

Public pilot landing + ön kayıt:

https://cretwntzhnfzypujqlid.supabase.co/functions/v1/patialan-app

> Canlı pilot sayfasındaki alan kartları ürün deneyimini göstermek için örnektir. Ücretli rezervasyonlar gerçek alan doğrulaması ve ödeme entegrasyonu tamamlanmadan açılmayacaktır.

## Stack

- Next.js 16.3.5 App Router
- React 19.3.0
- Supabase Auth + Postgres + Storage + RLS
- @supabase/ssr 0.12.7
- @supabase/supabase-js 2.116.0
- Supabase Edge Function (public pilot)

## Backend durumu

- Ayrı PatiAlan Supabase projesi aktif
- RLS etkin
- Listing / dog / availability / booking / verification / review şemaları kurulu
- Çakışan rezervasyonlar veritabanı seviyesinde engelleniyor
- 10 dakikalık booking hold RPC aktif
- Listing ve verification media bucket politikaları kurulu
- Pilot ön kayıt tablosu doğrudan anon/authenticated erişimine kapalı
- Ön kayıt yazımı yalnız server-side Edge Function üzerinden yapılıyor

## CI

GitHub Actions her `main` push ve pull request için:

1. Node 22
2. `npm ci`
3. `npm run build`

çalıştırır. `package-lock.json` repoda tutulur.

## Not

Tam Next.js uygulaması bu repoda tutulmaktadır. Railway/Vercel ücretsiz kaynak kotası nedeniyle ilk public pilot Supabase Edge Function üzerinde servis edilmektedir; normal Next.js hosting slotu açıldığında aynı backend'e bağlanabilir.
