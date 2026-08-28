# VioAI

VioAI, **Viofun** için geliştirilen yapay zekâ destekli kişiselleştirilmiş seyahat rotası ve aktivite öneri platformudur.

Kullanıcı; şehir, seyahat süresi, bütçe, kişi sayısı, ilgi alanları ve ulaşım tercihini girer. Yapay zekâ gün gün planlanmış bir gezi rotası üretir. VioAI'ın temel farkı, üretilen rotayı Viofun ürün kataloğuyla eşleştirerek **konum, bütçe, ilgi alanı ve rota uyumluluğuna göre** seçilen 1-2 Viofun aktivitesini rotanın doğru noktalarına yerleştirmesidir.

## Mimari

```
VioAI/
├── backend/          NestJS + TypeScript + PostgreSQL (TypeORM) REST API
├── frontend/         React + TypeScript + Vite (Bun) SPA
├── docker-compose.yml
└── .env.example
```

| Katman | Teknoloji |
| --- | --- |
| Frontend | React 19, TypeScript (strict), Vite, Tailwind CSS v4, TanStack Query, React Router, React Hook Form + Zod, Leaflet, Framer Motion |
| Backend | NestJS 11, TypeScript (strict), TypeORM, PostgreSQL 17, JWT + API Key auth, Swagger, Throttler |
| AI | OpenRouter Chat Completions API |
| Paket yöneticisi | **Bun** (npm/yarn/pnpm kullanılmaz) |

## Hızlı başlangıç

### 1. Veritabanını başlatın

```bash
cp .env.example .env
docker compose up -d postgres
```

### 2. Backend

```bash
cd backend
cp .env.example .env          # JWT secret'larını ve OPENROUTER_API_KEY'i doldurun
bun install
bun run migration:run
bun run seed                  # gerçek Viofun kataloğu (24 kategori, 199 ürün)
bun run start:dev
```

API: `http://localhost:3000/api/v1` · Swagger: `http://localhost:3000/api/docs`

### 3. Frontend

```bash
cd frontend
cp .env.example .env
bun install
bun run dev
```

Uygulama: `http://localhost:5173`

### Tümünü Docker ile çalıştırma

```bash
docker compose up -d          # postgres + backend (development target, hot reload)
```

## Katalog verisi

Ürün kataloğu **Viofun'ın kendi genel verisinden** alınmıştır: `backend/src/database/seeds/viofun-catalog.json` (kaynak ve çekilme tarihi dosyanın içinde). **24 kategori, 199 aktif ürün, 24 il.**

Ürün adı, açıklama, kategori, şehir/ilçe/adres, koordinat, etiketler, görsel ve **viofun.com bilet bağlantısı** doğrudan Viofun verisinden gelir. İki alan Viofun tarafından yayınlanmadığı için türetilmiştir:

- **Süre:** kategori bazlı makul varsayılan (müze 90 dk, tekne turu 360 dk gibi).
- **Konum (6 üründe):** çok duraklı turlar ve şehir kartları için il merkezi koordinatı kullanılır; bu kayıtlar `isAiRecommendable = false` işaretlenir ve rotalara otomatik yerleştirilmez.

Fiyatlar Viofun'da sezonluk ve çok para birimlidir; içe aktarım **bugün geçerli yetişkin tarifesini** TRY → EUR → USD önceliğiyle alır ve para birimini ürünle birlikte saklar. Rota bütçesiyle farklı para birimindeki ürünlerde bütçe sinyali karşılaştırılamadığı için skorlamadan çıkarılır ve kalan sinyaller orantılı olarak yeniden ölçeklenir — uydurma kur dönüşümü yapılmaz.

## Erişim modeli

**Giriş yapmadan** ana sayfa, aktivite listesi ve aktivite detayları gezilebilir. Rota oluşturma, rotalar ve profil sayfaları hesap gerektirir; navigasyonda bu bölümler kilit ikonuyla işaretlenir ve giriş sonrası kullanıcı kaldığı sayfaya döner.

## Yönetici hesabı

Sistemde önceden tanımlı bir yönetici yoktur. **Sisteme kayıt olan ilk kullanıcı otomatik olarak `admin` rolünü alır.** Sonraki kayıtlar normal kullanıcı olur.

Yönetici, üstteki **Yönetim** menüsünden (mobilde profil menüsünden) panele girer ve **Yönetim → Kullanıcılar** ekranından dilediği kullanıcıya admin yetkisi verebilir veya geri alabilir. Yönetici kendi rolünü ve aktiflik durumunu değiştiremez; bu, sistemde yönetici kalmaması riskini önler.

## AI rota üretimi nasıl çalışır?

1. **Rota üretimi** — Kullanıcı tercihleri OpenRouter üzerinden LLM'e gönderilir. Model yalnızca gerçek, herkese açık mekânlardan oluşan gün gün bir plan üretir; bilet/tur ürünü uydurması açıkça yasaklanmıştır.
2. **Ürün eşleştirme** — `ProductMatcherService`, AI önerilebilir olarak işaretlenmiş Viofun ürünlerini rotayla skorlar:

   | Sinyal | Ağırlık |
   | --- | --- |
   | Rotadaki en yakın durağa mesafe | 35 |
   | Kullanıcının ilgi alanlarıyla örtüşme | 25 |
   | Rota temasıyla örtüşme | 20 |
   | Kalan bütçeye uygunluk | 15 |
   | Puan ve popülerlik | 5 |

   Skoru eşiğin altında kalan, bütçeyi aşan veya 15 km'den uzak ürünler elenir. Kalanlardan kategori ve gün çeşitliliği gözetilerek **en fazla 2** ürün seçilir.
3. **Yerleştirme** — Seçilen ürün, en yakın durağın hemen ardına, o durağın bitiş saatine geçiş payı eklenerek yerleştirilir. Kullanıcıya ürünün **neden önerildiği** açıklanır ve kullanıcı ürünü rotadan çıkarabilir veya yeni ürün ekleyebilir.

## Dokümantasyon

- [`backend/README.md`](./backend/README.md) — API yapısı, modüller, kimlik doğrulama, API key sistemi
- [`frontend/README.md`](./frontend/README.md) — klasör yapısı, tasarım sistemi, veri katmanı
