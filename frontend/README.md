# VioAI Frontend

React 19 + TypeScript (strict) + Vite, paket yöneticisi olarak **Bun** kullanır.

## Çalıştırma

```bash
bun install
cp .env.example .env
bun run dev
```

| Komut | Açıklama |
| --- | --- |
| `bun run dev` | Geliştirme sunucusu (`http://localhost:5173`) |
| `bun run build` | Tip kontrolü + üretim derlemesi |
| `bun run preview` | Üretim derlemesini yerelde sunar |
| `bun run lint` | oxlint |

## Ortam değişkenleri

```
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_NAME=VioAI
```

API adresleri ve gizli değerler koda gömülmez; tümü `import.meta.env` üzerinden okunur.

## Klasör yapısı

```
src/
├── app/           Uygulama kökü ve router
├── components/
│   ├── ui/        Tasarım sistemi bileşenleri (Button, Input, Modal, Badge…)
│   ├── layout/    AppLayout, Header, BottomNav, AdminLayout, PageContainer
│   ├── common/    ProtectedRoute, ErrorBoundary
│   ├── map/       Leaflet harita bileşenleri (lazy yüklenir)
│   ├── product/   Ürün kartı, filtreler
│   ├── route/     Rota kartı, durak kartı, gün seçici, öneri kartı
│   └── admin/     Yönetim formları ve onay diyalogları
├── context/       Auth context ve provider
├── hooks/         TanStack Query hook'ları ve yardımcı hook'lar
├── lib/           API istemcisi, token deposu, query client, env, cn
├── pages/         Sayfa bileşenleri (admin sayfaları lazy yüklenir)
├── services/      Backend endpoint'lerini saran servis katmanı
├── types/         Backend sözleşmesini yansıtan tipler
└── utils/         Biçimlendirme ve etiket yardımcıları
```

## Veri katmanı

- `lib/api-client.ts` — Axios örneği; her isteğe access token ekler, `401` alındığında refresh token ile **tek seferlik** yenileme yapar, başarısız olursa oturumu temizleyip `vioai:unauthorized` olayını yayınlar.
- `services/*` — Endpoint'leri tipli fonksiyonlara sarar; bileşenler doğrudan `axios` kullanmaz.
- `hooks/use-*.ts` — TanStack Query sorgu/mutation'ları; `hooks/query-keys.ts` ile merkezî anahtar yönetimi.

## Erişim modeli

Ana sayfa, aktivite listesi ve aktivite detayı giriş gerektirmez. Rota oluşturma, rotalar ve profil `ProtectedRoute` ile korunur; misafir kullanıcı bu bölümleri navigasyonda kilit ikonuyla görür, tıkladığında giriş sayfasına yönlendirilir ve giriş sonrası hedef sayfaya geri döner. Yönetim paneli ayrıca `requireAdmin` kontrolünden geçer.

## Navigasyon

- **Mobil:** ekranın altında sabit `BottomNav` (`md:hidden`) — uygulama hissi verir, `safe-area` desteklidir.
- **Masaüstü:** üstte yapışkan `Header` içinde yatay navigasyon ve kullanıcı menüsü; bottom bar masaüstünde hiçbir koşulda gösterilmez.

## Tasarım sistemi

Tailwind CSS v4 `@theme` token'ları `src/index.css` içinde tanımlıdır: marka (violet), vurgu (coral), nötr (ink) renk skalaları, yumuşak gölgeler, yuvarlatma ölçeği ve `Plus Jakarta Sans` tipografisi. Bileşenler bu token'ları kullanır; sabit renk değerleri bileşenlere dağıtılmaz.
