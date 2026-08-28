import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Lock, Sparkles, Ticket, Wand2 } from 'lucide-react'
import { PageContainer } from '@/components/layout'
import { cn } from '@/lib/cn'
import { Badge, Button } from '@/components/ui'
import { ProductCard, ProductCardSkeleton } from '@/components/product'
import { useProductCities, useProducts } from '@/hooks/use-products'
import { useAuth } from '@/hooks/use-auth'
import type { CityStat } from '@/types'

const HERO_PHOTO_ID = 'photo-1527838832700-5059252407fa'
const heroImageUrl = (width: number): string =>
  `https://images.unsplash.com/${HERO_PHOTO_ID}?auto=format&fit=crop&w=${width}&h=${Math.round(width * 0.5)}&q=62`

const FEATURED_CITY_COUNT = 5

const steps = [
  {
    icon: Wand2,
    title: 'Tercihlerinizi paylaşın',
    description: 'Şehir, süre, bütçe, kişi sayısı ve ilgi alanlarınızı birkaç adımda seçin.',
  },
  {
    icon: Sparkles,
    title: 'AI rotanızı kursun',
    description: 'Yapay zekâ gün gün planlanmış, coğrafi olarak tutarlı bir gezi rotası üretir.',
  },
  {
    icon: Ticket,
    title: 'Viofun aktiviteleri eklensin',
    description: 'Rotanıza uyan Viofun bilet ve aktiviteleri doğru noktalara yerleştirilir.',
  },
]

export const HomePage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { data: featured, isPending } = useProducts({ limit: 8, isActive: true, sortBy: 'popularityScore' })
  const { data: cities } = useProductCities()
  const totalActivityCount = cities?.reduce((total, city) => total + city.count, 0) ?? 0

  return (
    <>
      <section className="relative overflow-hidden bg-ink-900">
        <img
          src={heroImageUrl(1600)}
          srcSet={`${heroImageUrl(800)} 800w, ${heroImageUrl(1200)} 1200w, ${heroImageUrl(1600)} 1600w, ${heroImageUrl(2200)} 2200w`}
          sizes="100vw"
          alt=""
          aria-hidden
          fetchPriority="high"
          className="absolute inset-0 size-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900/95 via-ink-900/80 to-ink-900/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-transparent to-ink-900/30" />
        <div
          className="gradient-brand absolute inset-0 opacity-25 mix-blend-overlay"
          aria-hidden
        />

        <PageContainer size="wide" className="relative py-16 sm:py-24 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <Badge tone="brand" className="bg-white/15 text-white ring-white/30 backdrop-blur-sm">
              <Sparkles className="size-3.5" />
              Yapay zekâ destekli seyahat planlayıcı
            </Badge>

            <h1 className="mt-5 text-3xl leading-tight font-extrabold tracking-tight text-white sm:text-5xl">
              Şehri size göre planlayan rota, biletiyle birlikte gelsin.
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              VioAI, tercihlerinize göre gün gün bir gezi rotası oluşturur ve rotaya uyan Viofun
              aktivitelerini doğru zamana, doğru noktaya yerleştirir.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="bg-accent-500 text-white shadow-lift hover:bg-accent-600"
                rightIcon={<ArrowRight className="size-4" />}
                onClick={() => navigate('/rota-olustur')}
              >
                Rotamı oluştur
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 bg-white/10 text-white backdrop-blur-sm hover:border-white hover:bg-white/20"
                onClick={() => navigate('/aktiviteler')}
              >
                Aktiviteleri keşfet
              </Button>
            </div>

            {!isAuthenticated && (
              <p className="mt-4 flex items-center gap-1.5 text-sm text-white/75">
                <Lock className="size-3.5 shrink-0" />
                <span>
                  Aktiviteleri giriş yapmadan gezebilirsiniz. Rota oluşturmak için{' '}
                  <Link to="/kayit" className="font-semibold text-white underline underline-offset-4">
                    ücretsiz hesap oluşturun
                  </Link>
                  .
                </span>
              </p>
            )}
          </motion.div>
        </PageContainer>
      </section>

      <PageContainer size="wide">
        <section aria-labelledby="how-it-works" className="py-2">
          <h2 id="how-it-works" className="text-xl font-extrabold tracking-tight text-ink-900 sm:text-2xl">
            Nasıl çalışır?
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, description }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
                className="surface p-5"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-3.5 text-base font-bold text-ink-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {cities && cities.length > 0 && (
          <section aria-labelledby="cities" className="pt-12">
            <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
              <h2 id="cities" className="text-xl font-extrabold tracking-tight text-ink-900 sm:text-2xl">
                Viofun'ın bilet sattığı şehirler
              </h2>
              <p className="text-sm text-ink-500">
                <span className="font-bold text-ink-800">{cities.length}</span> şehir ·{' '}
                <span className="font-bold text-ink-800">{totalActivityCount}</span> aktivite
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {cities.slice(0, FEATURED_CITY_COUNT).map((city, index) => (
                <CityTile key={city.city} city={city} isLarge={index === 0} />
              ))}
            </div>

            {cities.length > FEATURED_CITY_COUNT && (
              <>
                <p className="mt-6 mb-3 text-xs font-bold tracking-widest text-ink-400 uppercase">
                  Diğer şehirler
                </p>
                <div className="relative">
                  <div className="scrollbar-none -mx-1 flex gap-3 overflow-x-auto px-1 pt-1 pb-3">
                    {cities.slice(FEATURED_CITY_COUNT).map((city) => (
                      <CityCard key={city.city} city={city} />
                    ))}
                  </div>
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-ink-50 via-ink-50/80 to-transparent"
                  />
                </div>
              </>
            )}
          </section>
        )}

        <section aria-labelledby="featured" className="pt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 id="featured" className="text-xl font-extrabold tracking-tight text-ink-900 sm:text-2xl">
                Öne çıkan Viofun aktiviteleri
              </h2>
              <p className="mt-1 text-sm text-ink-500">Rotanıza eklenebilecek en popüler deneyimler.</p>
            </div>
            <Link
              to="/aktiviteler"
              className="hidden shrink-0 text-sm font-semibold text-brand-600 hover:underline sm:block"
            >
              Tümünü gör
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {isPending
              ? Array.from({ length: 4 }, (_, index) => <ProductCardSkeleton key={index} />)
              : featured?.items.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>

          <div className="mt-6 sm:hidden">
            <Button variant="outline" fullWidth onClick={() => navigate('/aktiviteler')}>
              Tüm aktiviteleri gör
            </Button>
          </div>
        </section>
      </PageContainer>
    </>
  )
}

const CityTile = ({ city, isLarge }: { city: CityStat; isLarge: boolean }) => (
  <Link
    to={`/aktiviteler?city=${encodeURIComponent(city.city)}`}
    className={cn(
      'group relative overflow-hidden rounded-2xl bg-ink-800 shadow-soft transition-all duration-300 [transition-timing-function:var(--ease-out-soft)] hover:shadow-lift',
      isLarge ? 'col-span-2 aspect-[16/10] lg:row-span-2 lg:aspect-auto' : 'aspect-[4/3]',
    )}
  >
    {city.imageUrl ? (
      <img
        src={city.imageUrl}
        alt=""
        aria-hidden
        loading="lazy"
        className="size-full object-cover transition-transform duration-500 [transition-timing-function:var(--ease-out-soft)] group-hover:scale-110"
      />
    ) : (
      <div className="gradient-brand size-full" />
    )}

    <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/25 to-transparent" />

    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 sm:p-4">
      <div className="min-w-0">
        <p
          className={cn(
            'truncate font-extrabold text-white',
            isLarge ? 'text-xl sm:text-3xl' : 'text-sm sm:text-base',
          )}
        >
          {city.city}
        </p>
        <p className={cn('text-white/75', isLarge ? 'text-sm' : 'text-xs')}>{city.count} aktivite</p>
      </div>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
        <ArrowRight className="size-4" />
      </span>
    </div>
  </Link>
)

const CityCard = ({ city }: { city: CityStat }) => (
  <Link
    to={`/aktiviteler?city=${encodeURIComponent(city.city)}`}
    className="surface group w-40 shrink-0 overflow-hidden transition-all duration-300 [transition-timing-function:var(--ease-out-soft)] hover:-translate-y-1 hover:border-brand-300 hover:shadow-lift sm:w-44"
  >
    <div className="relative aspect-[16/10] overflow-hidden bg-ink-100">
      {city.imageUrl ? (
        <img
          src={city.imageUrl}
          alt=""
          aria-hidden
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 [transition-timing-function:var(--ease-out-soft)] group-hover:scale-110"
        />
      ) : (
        <div className="gradient-brand size-full" />
      )}
      <span className="absolute top-2 right-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-bold text-ink-700 backdrop-blur-sm">
        {city.count}
      </span>
    </div>

    <div className="flex items-center justify-between gap-2 px-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-ink-900 group-hover:text-brand-700">{city.city}</p>
        <p className="text-[11px] text-ink-400">{city.count} aktivite</p>
      </div>
      <ArrowRight className="size-4 shrink-0 text-ink-300 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-brand-500" />
    </div>
  </Link>
)
