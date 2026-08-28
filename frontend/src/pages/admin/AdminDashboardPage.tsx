import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bot,
  FolderTree,
  KeyRound,
  MapPinned,
  Route as RouteIcon,
  Sparkles,
  Ticket,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { PageHeader } from '@/components/layout'
import { StatCard } from '@/components/admin'
import { Badge, ErrorState, Skeleton } from '@/components/ui'
import { useAdminStats } from '@/hooks/use-admin'
import { useAiStatus } from '@/hooks/use-ai'
import { useProductCities } from '@/hooks/use-products'
import { cn } from '@/lib/cn'
import { formatNumber } from '@/utils/format'

const quickActions: { to: string; title: string; description: string; icon: LucideIcon }[] = [
  {
    to: '/admin/urunler',
    title: 'Ürünler',
    description: 'Bilet ve aktiviteleri ekleyin, AI önerilebilirliğini yönetin.',
    icon: Ticket,
  },
  {
    to: '/admin/kategoriler',
    title: 'Kategoriler',
    description: 'Ürün gruplarını düzenleyin, renk ve sıralamayı belirleyin.',
    icon: FolderTree,
  },
  {
    to: '/admin/kullanicilar',
    title: 'Kullanıcılar',
    description: 'Hesapları görüntüleyin, rol ve erişim yetkisi verin.',
    icon: Users,
  },
  {
    to: '/admin/api-anahtarlari',
    title: 'API anahtarları',
    description: 'Harici uygulamalar için kapsamlı erişim anahtarı üretin.',
    icon: KeyRound,
  },
]

const TOP_CITY_LIMIT = 6

export const AdminDashboardPage = () => {
  const { data, isPending, isError, error, refetch } = useAdminStats()
  const { data: aiStatus } = useAiStatus()
  const { data: cities } = useProductCities()

  if (isPending) {
    return (
      <>
        <PageHeader eyebrow="Yönetim" title="Genel bakış" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-40" />
          ))}
        </div>
        <Skeleton className="mt-6 h-24" />
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </>
    )
  }

  if (isError || !data) {
    return <ErrorState error={error} onRetry={() => void refetch()} />
  }

  const activeRatio = data.totalProducts > 0 ? (data.activeProducts / data.totalProducts) * 100 : 0
  const aiRatio = data.activeProducts > 0 ? (data.aiRecommendableProducts / data.activeProducts) * 100 : 0
  const maxCategoryCount = data.categoryBreakdown[0]?.count ?? 1
  const topCities = cities?.slice(0, TOP_CITY_LIMIT) ?? []

  return (
    <>
      <PageHeader
        eyebrow="Yönetim"
        title="Genel bakış"
        description="VioAI kataloğunun ve platformun güncel durumu."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Ticket className="size-5" />}
          label="Toplam ürün"
          value={formatNumber(data.totalProducts)}
          hint={`${formatNumber(data.activeProducts)} tanesi satışta`}
          progress={activeRatio}
          tone="brand"
        />
        <StatCard
          icon={<Sparkles className="size-5" />}
          label="AI önerilebilir ürün"
          value={formatNumber(data.aiRecommendableProducts)}
          hint={`Aktif ürünlerin %${Math.round(aiRatio)}'i rotalara eklenebilir`}
          progress={aiRatio}
          tone="accent"
        />
        <StatCard
          icon={<Users className="size-5" />}
          label="Kullanıcı"
          value={formatNumber(data.totalUsers)}
          hint={`${formatNumber(data.totalCategories)} kategori tanımlı`}
          tone="sky"
        />
        <StatCard
          icon={<RouteIcon className="size-5" />}
          label="Oluşturulan rota"
          value={formatNumber(data.totalRoutes)}
          hint="Yapay zekâ ile üretilen gezi planı"
          tone="emerald"
        />
      </div>

      <div
        className={cn(
          'mt-6 flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between',
          aiStatus?.configured
            ? 'border-ink-200 bg-white shadow-soft'
            : 'border-amber-200 bg-amber-50',
        )}
      >
        <div className="flex items-start gap-3.5">
          <span
            className={cn(
              'flex size-11 shrink-0 items-center justify-center rounded-xl',
              aiStatus?.configured ? 'gradient-brand text-white shadow-glow' : 'bg-amber-500 text-white',
            )}
          >
            <Bot className="size-5" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-ink-900">AI servisi</h2>
              <Badge tone={aiStatus?.configured ? 'success' : 'warning'}>
                {aiStatus?.configured ? 'Bağlı' : 'Yapılandırılmadı'}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-ink-500">
              {aiStatus?.configured
                ? `Rota üretimi ${aiStatus.provider} üzerinden çalışıyor.`
                : 'Rota üretimi için sunucuda OPENROUTER_API_KEY tanımlanmalı.'}
            </p>
          </div>
        </div>

        {aiStatus?.model && (
          <code className="shrink-0 rounded-lg bg-ink-100 px-3 py-1.5 font-mono text-xs text-ink-700">
            {aiStatus.model}
          </code>
        )}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="surface p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-ink-900">Katalog dağılımı</h2>
            <Link
              to="/admin/kategoriler"
              className="text-sm font-semibold text-brand-600 hover:underline"
            >
              Kategoriler
            </Link>
          </div>

          {data.categoryBreakdown.length === 0 ? (
            <p className="mt-4 text-sm text-ink-500">Henüz aktif ürün yok.</p>
          ) : (
            <ul className="mt-4 space-y-3.5">
              {data.categoryBreakdown.map((category) => (
                <li key={category.categoryId}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        aria-hidden
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: category.color ?? '#C2C2D4' }}
                      />
                      <span className="truncate font-semibold text-ink-800">{category.name}</span>
                    </span>
                    <span className="shrink-0 font-bold text-ink-500 tabular-nums">{category.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.max((category.count / maxCategoryCount) * 100, 6)}%`,
                        backgroundColor: category.color ?? '#6D4AFF',
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="surface p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-ink-900">En çok ürün bulunan şehirler</h2>
            <Link to="/admin/urunler" className="text-sm font-semibold text-brand-600 hover:underline">
              Ürünler
            </Link>
          </div>

          {topCities.length === 0 ? (
            <p className="mt-4 text-sm text-ink-500">Henüz ürün eklenmemiş.</p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {topCities.map((city, index) => (
                <li
                  key={city.city}
                  className="flex items-center gap-3 rounded-xl border border-ink-100 p-2 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
                >
                  <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                    {city.imageUrl && (
                      <img src={city.imageUrl} alt="" aria-hidden loading="lazy" className="size-full object-cover" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-ink-900">{city.city}</span>
                    <span className="block text-xs text-ink-400">{city.count} aktivite</span>
                  </span>
                  <span className="shrink-0 rounded-lg bg-ink-100 px-2 py-1 text-xs font-bold text-ink-500 tabular-nums">
                    #{index + 1}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {cities && cities.length > TOP_CITY_LIMIT && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-400">
              <MapPinned className="size-3.5" />
              Katalog toplam {cities.length} şehri kapsıyor.
            </p>
          )}
        </section>
      </div>

      <section className="mt-6">
        <h2 className="mb-4 text-base font-bold text-ink-900">Hızlı işlemler</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map(({ to, title, description, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="surface group flex flex-col p-5 transition-all duration-300 [transition-timing-function:var(--ease-out-soft)] hover:-translate-y-1 hover:border-brand-300 hover:shadow-lift"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-500 group-hover:text-white">
                <Icon className="size-5" />
              </span>
              <span className="mt-3.5 text-sm font-bold text-ink-900">{title}</span>
              <span className="mt-1 flex-1 text-xs leading-relaxed text-ink-400">{description}</span>
              <span className="mt-3 flex items-center gap-1 text-xs font-bold text-brand-600">
                Yönet
                <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
