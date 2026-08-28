import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, type FieldPath, type FieldPathValue } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bike,
  BookOpen,
  Building2,
  Bus,
  CalendarDays,
  Camera,
  Car,
  Check,
  Coffee,
  Compass,
  Crown,
  Gauge,
  Gem,
  Landmark,
  Loader2,
  Mountain,
  Palette,
  PiggyBank,
  Sailboat,
  ScrollText,
  Search,
  Shuffle,
  Sparkles,
  Trees,
  Users,
  Wallet,
  Waves,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { toast } from 'sonner'
import { PageContainer } from '@/components/layout'
import { Badge, Button, CounterCard, Input, OptionCard, Select, Textarea } from '@/components/ui'
import { useGenerateRoute } from '@/hooks/use-routes'
import { useProductCities } from '@/hooks/use-products'
import { useAiStatus } from '@/hooks/use-ai'
import { getApiErrorMessage } from '@/lib/api-client'
import { cn } from '@/lib/cn'
import { TransportMode, TravelPace, type CityStat } from '@/types'
import { formatCurrency } from '@/utils/format'
import { interestOptions, transportModeLabels, travelPaceLabels } from '@/utils/labels'

const schema = z.object({
  city: z.string().min(2, 'Şehir gerekli').max(120),
  days: z.number().int().min(1, 'En az 1 gün').max(14, 'En fazla 14 gün'),
  startDate: z.string().optional(),
  travelers: z.number().int().min(1, 'En az 1 kişi').max(20, 'En fazla 20 kişi'),
  budget: z.number().min(0, 'Bütçe negatif olamaz'),
  currency: z.string().length(3),
  interests: z.array(z.string()).max(12),
  transportMode: z.nativeEnum(TransportMode),
  pace: z.nativeEnum(TravelPace),
  notes: z.string().max(500).optional(),
})

type FormValues = z.infer<typeof schema>

const stepFields: Record<number, (keyof FormValues)[]> = {
  0: ['city', 'days', 'startDate'],
  1: ['travelers', 'budget', 'currency'],
  2: ['interests', 'transportMode', 'pace', 'notes'],
}

const steps = [
  { title: 'Nereye ve ne kadar?', hint: 'Şehir ve süre' },
  { title: 'Kimlerle ve ne bütçeyle?', hint: 'Kişi ve bütçe' },
  { title: 'Nelerden hoşlanırsınız?', hint: 'İlgi ve tempo' },
] as const

const VISIBLE_CITY_LIMIT = 8

const budgetTiers = [
  { value: 3000, title: 'Ekonomik', description: 'Ücretsiz mekânlar ve uygun bilet fiyatları', icon: PiggyBank },
  { value: 8000, title: 'Dengeli', description: 'Bilet ve yeme-içme dengeli dağılsın', icon: Wallet },
  { value: 15000, title: 'Konforlu', description: 'Rehberli turlar ve premium aktiviteler', icon: Gem },
  { value: 30000, title: 'Lüks', description: 'Balon, özel tekne ve VIP deneyimler', icon: Crown },
] as const

const interestIcons: Record<string, LucideIcon> = {
  kültür: BookOpen,
  sanat: Palette,
  müze: Landmark,
  tarih: ScrollText,
  'antik kent': Building2,
  macera: Compass,
  adrenalin: Zap,
  doğa: Trees,
  deniz: Waves,
  'tekne turu': Sailboat,
  fotoğraf: Camera,
  manzara: Mountain,
}

const transportIcons: Record<TransportMode, LucideIcon> = {
  [TransportMode.WALKING]: Compass,
  [TransportMode.PUBLIC_TRANSPORT]: Bus,
  [TransportMode.CAR]: Car,
  [TransportMode.BIKE]: Bike,
  [TransportMode.MIXED]: Shuffle,
}

const paceOptions = [
  { value: TravelPace.RELAXED, description: 'Günde 3-4 durak, bol mola', icon: Coffee },
  { value: TravelPace.BALANCED, description: 'Günde 4-5 durak, dengeli ritim', icon: Gauge },
  { value: TravelPace.INTENSE, description: 'Günde 6-7 durak, dolu program', icon: Zap },
] as const

const capitalize = (value: string): string =>
  value.charAt(0).toLocaleUpperCase('tr-TR') + value.slice(1)

export const GenerateRoutePage = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [showAllCities, setShowAllCities] = useState(false)
  const generateRoute = useGenerateRoute()
  const { data: cities } = useProductCities()
  const { data: aiStatus } = useAiStatus()

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      city: '',
      days: 3,
      travelers: 2,
      budget: 8000,
      currency: 'TRY',
      interests: [],
      transportMode: TransportMode.MIXED,
      pace: TravelPace.BALANCED,
      notes: '',
    },
  })

  const values = watch()

  const cityQuery = values.city.trim().toLocaleLowerCase('tr-TR')
  const matchedCities = (cities ?? []).filter((city) =>
    city.city.toLocaleLowerCase('tr-TR').includes(cityQuery),
  )
  const isBrowsingAll = showAllCities || cityQuery.length > 0
  const visibleCities = isBrowsingAll ? matchedCities : matchedCities.slice(0, VISIBLE_CITY_LIMIT)

  const setField = <K extends FieldPath<FormValues>>(field: K, value: FieldPathValue<FormValues, K>) =>
    setValue(field, value, { shouldValidate: true })

  const toggleInterest = (interest: string) =>
    setField(
      'interests',
      values.interests.includes(interest)
        ? values.interests.filter((item) => item !== interest)
        : [...values.interests, interest],
    )

  const goNext = async () => {
    const isValid = await trigger(stepFields[step])
    if (isValid) setStep((current) => Math.min(current + 1, steps.length - 1))
  }

  const goToStep = async (target: number) => {
    if (target === step) return
    if (target < step) {
      setStep(target)
      return
    }

    const isValid = await trigger(stepFields[step])
    if (isValid) setStep(target)
  }

  const onSubmit = handleSubmit(async (formValues) => {
    try {
      const route = await generateRoute.mutateAsync({
        ...formValues,
        startDate: formValues.startDate || undefined,
        notes: formValues.notes || undefined,
      })
      toast.success('Rotanız hazır!')
      navigate(`/rotalarim/${route.id}`)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Rota oluşturulamadı'))
    }
  })

  if (generateRoute.isPending) {
    return <GeneratingState city={values.city} days={values.days} />
  }

  const recap = [
    values.city || 'Şehir seçilmedi',
    `${values.days} gün`,
    ...(step >= 1 ? [`${values.travelers} kişi`, formatCurrency(values.budget, values.currency)] : []),
  ].join(' · ')

  return (
    <PageContainer>
      <div className="mb-7 max-w-2xl">
        <Badge tone="brand">
          <Sparkles className="size-3.5" />
          VioAI rota sihirbazı
        </Badge>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
          Gezinizi birkaç seçimle planlayalım
        </h1>
        <p className="mt-2 leading-relaxed text-ink-500">
          Tercihlerinizi seçin; yapay zekâ gün gün bir rota kursun ve rotaya uyan Viofun aktivitelerini
          doğru noktalara yerleştirsin.
        </p>
      </div>

      {aiStatus && !aiStatus.configured && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            <span className="font-bold">AI servisi henüz yapılandırılmadı.</span> Rota üretimi için
            sunucuda <code className="font-mono text-xs">OPENROUTER_API_KEY</code> tanımlanmalı.
          </p>
        </div>
      )}

      <Stepper current={step} onSelect={goToStep} />

      <form onSubmit={onSubmit} noValidate>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 space-y-9"
          >
            {step === 0 && (
              <>
                <section>
                  <SectionHeading
                    title="Hangi şehri gezeceksiniz?"
                    description="Viofun'ın bilet sattığı şehirlerden seçin ya da dilediğiniz şehri yazın."
                    error={errors.city?.message}
                  />

                  <Input
                    aria-label="Şehir"
                    placeholder="Şehir ara veya yaz…"
                    leftIcon={<Search className="size-4" />}
                    hasError={Boolean(errors.city)}
                    className="max-w-md"
                    {...register('city')}
                  />

                  {visibleCities.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {visibleCities.map((city) => (
                        <CityChoiceCard
                          key={city.city}
                          city={city}
                          selected={values.city === city.city}
                          onSelect={() => setField('city', city.city)}
                        />
                      ))}
                    </div>
                  )}

                  {!isBrowsingAll && matchedCities.length > VISIBLE_CITY_LIMIT && (
                    <button
                      type="button"
                      onClick={() => setShowAllCities(true)}
                      className="mt-4 text-sm font-semibold text-brand-600 hover:underline"
                    >
                      {matchedCities.length} şehrin tümünü göster
                    </button>
                  )}
                </section>

                <section>
                  <SectionHeading title="Ne kadar kalacaksınız?" error={errors.days?.message} />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <CounterCard
                      label="Gün sayısı"
                      icon={<CalendarDays className="size-4" />}
                      value={values.days}
                      suffix="gün"
                      min={1}
                      max={14}
                      presets={[2, 3, 5, 7]}
                      onChange={(value) => setField('days', value)}
                    />

                    <div className="rounded-2xl border-2 border-ink-200 bg-white p-5">
                      <p className="flex items-center gap-2 text-sm font-semibold text-ink-500">
                        <CalendarDays className="size-4" />
                        Başlangıç tarihi
                      </p>
                      <Input type="date" className="mt-4" aria-label="Başlangıç tarihi" {...register('startDate')} />
                      <p className="mt-2.5 text-xs text-ink-400">
                        İsteğe bağlı — mevsime uygun öneriler almanızı sağlar.
                      </p>
                    </div>
                  </div>
                </section>
              </>
            )}

            {step === 1 && (
              <>
                <section>
                  <SectionHeading title="Kaç kişi seyahat ediyorsunuz?" error={errors.travelers?.message} />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <CounterCard
                      label="Kişi sayısı"
                      icon={<Users className="size-4" />}
                      value={values.travelers}
                      suffix="kişi"
                      min={1}
                      max={20}
                      presets={[1, 2, 4, 6]}
                      onChange={(value) => setField('travelers', value)}
                    />

                    <div className="flex flex-col justify-center rounded-2xl border-2 border-dashed border-ink-200 bg-white/60 p-5">
                      <p className="text-sm leading-relaxed text-ink-500">
                        Kişi sayısı, önerilecek Viofun aktivitelerinin toplam maliyetini hesaplarken
                        kullanılır. Bütçenizi aşan aktiviteler rotanıza eklenmez.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <SectionHeading
                    title="Bütçeniz ne kadar?"
                    description="Konaklama hariç; aktivite, yeme-içme ve şehir içi ulaşım için toplam tutar."
                    error={errors.budget?.message}
                  />

                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {budgetTiers.map((tier) => (
                      <OptionCard
                        key={tier.value}
                        selected={values.budget === tier.value}
                        onClick={() => setField('budget', tier.value)}
                        icon={<tier.icon className="size-5" />}
                        title={tier.title}
                        description={tier.description}
                        meta={formatCurrency(tier.value, values.currency)}
                      />
                    ))}
                  </div>

                  <div className="mt-4 grid max-w-md gap-3 sm:grid-cols-[1fr_130px]">
                    <Input
                      type="number"
                      min={0}
                      step={500}
                      aria-label="Toplam bütçe"
                      leftIcon={<Wallet className="size-4" />}
                      hasError={Boolean(errors.budget)}
                      {...register('budget', { valueAsNumber: true })}
                    />
                    <Select aria-label="Para birimi" {...register('currency')}>
                      <option value="TRY">TRY</option>
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                    </Select>
                  </div>
                </section>
              </>
            )}

            {step === 2 && (
              <>
                <section>
                  <SectionHeading
                    title="Nelerden hoşlanırsınız?"
                    description="Birden fazla seçebilirsiniz — rota ve aktivite önerilerini şekillendirir."
                  />

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {interestOptions.map((interest) => {
                      const Icon = interestIcons[interest] ?? Sparkles

                      return (
                        <OptionCard
                          key={interest}
                          selected={values.interests.includes(interest)}
                          onClick={() => toggleInterest(interest)}
                          icon={<Icon className="size-5" />}
                          title={capitalize(interest)}
                        />
                      )
                    })}
                  </div>
                </section>

                <section>
                  <SectionHeading title="Nasıl dolaşacaksınız?" />

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {Object.values(TransportMode).map((mode) => {
                      const Icon = transportIcons[mode]

                      return (
                        <OptionCard
                          key={mode}
                          selected={values.transportMode === mode}
                          onClick={() => setField('transportMode', mode)}
                          icon={<Icon className="size-5" />}
                          title={transportModeLabels[mode]}
                        />
                      )
                    })}
                  </div>
                </section>

                <section>
                  <SectionHeading title="Gezi temponuz nasıl olsun?" />

                  <div className="grid gap-3 sm:grid-cols-3">
                    {paceOptions.map((option) => (
                      <OptionCard
                        key={option.value}
                        selected={values.pace === option.value}
                        onClick={() => setField('pace', option.value)}
                        icon={<option.icon className="size-5" />}
                        title={travelPaceLabels[option.value]}
                        description={option.description}
                      />
                    ))}
                  </div>
                </section>

                <section>
                  <SectionHeading
                    title="Eklemek istediğiniz bir şey var mı?"
                    description="Örn. çocukla seyahat, vejetaryen mekânlar, erken kalkmak istemiyoruz."
                  />

                  <div className="rounded-2xl border-2 border-ink-200 bg-white p-4">
                    <Textarea
                      rows={3}
                      aria-label="Ek notlar"
                      placeholder="İsteğe bağlı"
                      className="border-0 p-0 focus:ring-0"
                      {...register('notes')}
                    />
                  </div>
                </section>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="sticky bottom-24 z-20 mt-8 md:bottom-6">
          <div className="surface flex items-center gap-3 p-3 shadow-lift">
            {step > 0 && (
              <Button
                variant="outline"
                onClick={() => setStep((current) => current - 1)}
                leftIcon={<ArrowLeft className="size-4" />}
              >
                Geri
              </Button>
            )}

            <p className="hidden min-w-0 flex-1 truncate px-2 text-sm font-medium text-ink-400 sm:block">
              {recap}
            </p>

            {step < steps.length - 1 ? (
              <Button
                className="flex-1 sm:flex-none"
                size="lg"
                onClick={goNext}
                rightIcon={<ArrowRight className="size-4" />}
              >
                Devam et
              </Button>
            ) : (
              <Button
                type="submit"
                size="lg"
                className="flex-1 sm:flex-none"
                leftIcon={<Sparkles className="size-4" />}
                disabled={aiStatus ? !aiStatus.configured : false}
              >
                Rotamı oluştur
              </Button>
            )}
          </div>
        </div>
      </form>
    </PageContainer>
  )
}

const SectionHeading = ({
  title,
  description,
  error,
}: {
  title: string
  description?: string
  error?: string
}) => (
  <div className="mb-4">
    <h2 className="text-lg font-extrabold tracking-tight text-ink-900">{title}</h2>
    {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
    {error && <p className="mt-1.5 text-sm font-semibold text-red-600">{error}</p>}
  </div>
)

const CityChoiceCard = ({
  city,
  selected,
  onSelect,
}: {
  city: CityStat
  selected: boolean
  onSelect: () => void
}) => (
  <button
    type="button"
    onClick={onSelect}
    aria-pressed={selected}
    className={cn(
      'group relative overflow-hidden rounded-2xl border-2 text-left transition-all duration-300 [transition-timing-function:var(--ease-out-soft)]',
      selected ? 'border-brand-500 shadow-glow' : 'border-transparent hover:-translate-y-1 hover:shadow-lift',
    )}
  >
    <div className="relative aspect-[4/3] bg-ink-800">
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

      <div className="absolute inset-x-0 bottom-0 p-3">
        <p className="truncate text-sm font-bold text-white">{city.city}</p>
        <p className="text-[11px] text-white/70">{city.count} aktivite</p>
      </div>

      {selected && (
        <span className="absolute top-2.5 right-2.5 flex size-6 items-center justify-center rounded-full bg-brand-500 text-white shadow-lift">
          <Check className="size-3.5" strokeWidth={3} />
        </span>
      )}
    </div>
  </button>
)

const Stepper = ({ current, onSelect }: { current: number; onSelect: (step: number) => void }) => (
  <ol className="flex items-center gap-2 sm:gap-3">
    {steps.map((item, index) => {
      const isDone = index < current
      const isActive = index === current

      return (
        <li key={item.title} className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => onSelect(index)}
            disabled={index > current}
            aria-current={isActive ? 'step' : undefined}
            className="flex min-w-0 flex-1 items-center gap-2.5 text-left disabled:cursor-default"
          >
            <span
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold transition-all duration-300',
                isActive && 'gradient-brand text-white shadow-glow',
                isDone && 'bg-brand-100 text-brand-700',
                !isActive && !isDone && 'bg-ink-100 text-ink-400',
              )}
            >
              {isDone ? <Check className="size-4" strokeWidth={3} /> : index + 1}
            </span>
            <span className="hidden min-w-0 sm:block">
              <span
                className={cn(
                  'block truncate text-sm font-bold transition-colors',
                  isActive ? 'text-ink-900' : 'text-ink-400',
                )}
              >
                {item.title}
              </span>
              <span className="block truncate text-xs text-ink-400">{item.hint}</span>
            </span>
          </button>

          {index < steps.length - 1 && (
            <span
              className={cn(
                'hidden h-0.5 w-6 shrink-0 rounded-full transition-colors duration-300 lg:block',
                isDone ? 'bg-brand-300' : 'bg-ink-200',
              )}
            />
          )}
        </li>
      )
    })}
  </ol>
)

const generatingSteps = [
  'Tercihleriniz analiz ediliyor',
  'Şehir için gün gün plan kuruluyor',
  'Viofun aktiviteleri rotayla eşleştiriliyor',
  'Harita ve zaman çizelgesi hazırlanıyor',
]

const GeneratingState = ({ city, days }: { city: string; days: number }) => (
  <PageContainer size="narrow" className="flex min-h-[70vh] flex-col items-center justify-center text-center">
    <div className="relative">
      <span className="gradient-brand absolute inset-0 animate-ping rounded-3xl opacity-20" />
      <span className="gradient-brand relative flex size-20 items-center justify-center rounded-3xl shadow-glow">
        <Loader2 className="size-9 animate-spin text-white" />
      </span>
    </div>

    <h1 className="mt-7 text-2xl font-extrabold tracking-tight text-ink-900">
      {city ? `${days} günlük ${city} rotanız hazırlanıyor` : 'Rotanız hazırlanıyor'}
    </h1>
    <p className="mt-2 text-sm text-ink-500">Bu işlem yaklaşık 20-40 saniye sürebilir, sayfadan ayrılmayın.</p>

    <ul className="mt-8 w-full max-w-sm space-y-2.5 text-left">
      {generatingSteps.map((label, index) => (
        <motion.li
          key={label}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.7, duration: 0.4 }}
          className="surface flex items-center gap-3 px-4 py-3 text-sm font-medium text-ink-600"
        >
          <Sparkles className="size-4 shrink-0 text-brand-500" />
          {label}
        </motion.li>
      ))}
    </ul>
  </PageContainer>
)
