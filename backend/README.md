# VioAI API

NestJS 11 + TypeScript + PostgreSQL (TypeORM) üzerine kurulu, dış kullanıma açık REST API.

## Çalıştırma

```bash
bun install
cp .env.example .env
bun run migration:run
bun run seed
bun run start:dev
```

| Komut | Açıklama |
| --- | --- |
| `bun run start:dev` | Watch modunda geliştirme sunucusu |
| `bun run build` | Üretim derlemesi (`dist/`) |
| `bun run typecheck` | Tip kontrolü |
| `bun run migration:generate src/database/migrations/<Ad>` | Entity değişikliklerinden migration üretir |
| `bun run migration:run` / `migration:revert` | Migration uygular / geri alır |
| `bun run seed` | `viofun-catalog.json` içindeki gerçek Viofun kataloğunu yükler (idempotent: mevcut kayıtları günceller) |

## Modüler yapı

```
src/
├── common/          Guard, decorator, filter, DTO, enum, util, base entity
├── config/          Ortam değişkeni yükleme ve doğrulama
├── database/        TypeORM DataSource, migration'lar, seed
└── modules/
    ├── users/       Kullanıcı CRUD, profil, şifre değiştirme
    ├── auth/        Kayıt, giriş, access/refresh token, çıkış
    ├── api-keys/    Harici uygulamalar için kapsamlı (scoped) API anahtarları
    ├── categories/  Ürün kategorileri
    ├── products/    Viofun bilet ve aktiviteleri
    ├── ai/          OpenRouter istemcisi, rota üretimi, ürün eşleştirme
    ├── routes/      Rota üretimi ve yönetimi
    ├── route-stops/ Rota durakları, ürün ekleme/çıkarma, sıralama
    └── admin/       Yönetim paneli istatistikleri
```

## API sürümleme

URI tabanlı sürümleme kullanılır: `/{API_PREFIX}/v{n}/...` → varsayılan `/api/v1/...`
Sağlık kontrolü sürümden bağımsızdır: `GET /api/health`

Swagger arayüzü: `GET /api/docs`

## Kimlik doğrulama

İki yöntem desteklenir ve global bir guard tarafından değerlendirilir:

**1. JWT (son kullanıcılar)**

```http
Authorization: Bearer <accessToken>
```

- `POST /api/v1/auth/register` · `POST /api/v1/auth/login` → `accessToken` + `refreshToken`
- `POST /api/v1/auth/refresh` → token yenileme (refresh token hash'lenmiş olarak saklanır)
- `POST /api/v1/auth/logout` → refresh token'ı geçersiz kılar
- Rol tabanlı yetkilendirme `@Roles(UserRole.ADMIN)` ile yapılır.
- **Sisteme kayıt olan ilk kullanıcı otomatik olarak `admin` rolünü alır**; sonraki kayıtlar `user` olur. Yöneticiler `PATCH /api/v1/users/:id` ile başka kullanıcılara admin yetkisi verebilir.

**2. API Key (harici uygulamalar)**

```http
x-api-key: vio_<prefix>.<secret>
```

- Anahtarlar `bcrypt` ile hash'lenerek saklanır; ham değer yalnızca oluşturma anında bir kez döner.
- Her anahtar bir yetki (scope) kümesine sahiptir. Bir endpoint API key ile ancak `@RequireScopes(...)` ile işaretlenmişse ve anahtar gerekli scope'lara sahipse kullanılabilir.
- Kullanılabilir scope'lar: `products:read`, `products:write`, `categories:read`, `routes:read`, `routes:generate`, `ai:suggest`

Örnek:

```bash
curl -H "x-api-key: $VIOAI_KEY" \
  "http://localhost:3000/api/v1/products?city=%C4%B0stanbul&limit=5"
```

## Öne çıkan endpoint'ler

| Method | Yol | Erişim |
| --- | --- | --- |
| `GET` | `/api/v1/products` | Herkese açık / `products:read` |
| `GET` | `/api/v1/products/cities` | Herkese açık / `products:read` |
| `POST` | `/api/v1/products` | Admin / `products:write` |
| `PATCH` | `/api/v1/products/:id/ai-recommendable` | Admin / `products:write` |
| `GET` | `/api/v1/categories` | Herkese açık / `categories:read` |
| `POST` | `/api/v1/routes/generate` | JWT / `routes:generate` |
| `GET` | `/api/v1/routes/:id` | Sahibi veya admin / `routes:read` |
| `POST` | `/api/v1/routes/:id/stops/products` | Rota sahibi |
| `PATCH` | `/api/v1/routes/:id/stops/:stopId/inclusion` | Rota sahibi |
| `POST` | `/api/v1/ai/suggestions` | JWT / `ai:suggest` |
| `GET` | `/api/v1/admin/stats` | Admin |
| `GET/POST` | `/api/v1/api-keys` | Admin |

## Ortam değişkenleri

`.env.example` dosyasına bakın. `JWT_ACCESS_SECRET` ve `JWT_REFRESH_SECRET` en az 32 karakter olmalıdır; uygulama açılışta ortam değişkenlerini doğrular ve eksik/geçersiz değerde başlamaz.

`OPENROUTER_API_KEY` tanımlı değilse AI uçları `503` ile açık bir hata mesajı döner; diğer tüm uçlar çalışmaya devam eder.

## Güvenlik

- `helmet`, yapılandırılabilir CORS ve `@nestjs/throttler` ile hız sınırlama (giriş ve rota üretimi için daha sıkı limitler)
- Global `ValidationPipe` (`whitelist` + `forbidNonWhitelisted`) ile katı istek doğrulama
- `ClassSerializerInterceptor` ile `passwordHash`, `refreshTokenHash`, `keyHash` alanlarının yanıtlardan çıkarılması
- Merkezî exception filter; veritabanı hatalarını (unique/foreign key) anlamlı HTTP yanıtlarına dönüştürür
