import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button, Field, Input, Modal, Select, Switch, Textarea } from '@/components/ui'
import { useCategories } from '@/hooks/use-categories'
import { useCreateProduct, useUpdateProduct } from '@/hooks/use-products'
import { getApiErrorMessage } from '@/lib/api-client'
import type { Product, ProductPayload } from '@/types'

const schema = z.object({
  name: z.string().min(3, 'En az 3 karakter').max(180),
  description: z.string().min(10, 'En az 10 karakter').max(5000),
  categoryId: z.string().uuid('Kategori seçiniz'),
  price: z.number().min(0),
  currency: z.string().length(3),
  city: z.string().min(2).max(120),
  district: z.string().max(120).optional(),
  address: z.string().max(300).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  durationMinutes: z.number().int().min(5).max(1440),
  tags: z.string().optional(),
  imageUrl: z.string().url('Geçerli bir URL giriniz').or(z.literal('')).optional(),
  bookingUrl: z.string().url('Geçerli bir URL giriniz').or(z.literal('')).optional(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().min(0),
  popularityScore: z.number().int().min(0).max(100),
  isActive: z.boolean(),
  isAiRecommendable: z.boolean(),
})

type FormValues = z.infer<typeof schema>

const emptyValues: FormValues = {
  name: '',
  description: '',
  categoryId: '',
  price: 0,
  currency: 'TRY',
  city: '',
  district: '',
  address: '',
  latitude: 41.0082,
  longitude: 28.9784,
  durationMinutes: 60,
  tags: '',
  imageUrl: '',
  bookingUrl: '',
  rating: 0,
  reviewCount: 0,
  popularityScore: 0,
  isActive: true,
  isAiRecommendable: true,
}

const toPayload = (values: FormValues): ProductPayload => ({
  name: values.name,
  description: values.description,
  categoryId: values.categoryId,
  price: values.price,
  currency: values.currency,
  city: values.city,
  district: values.district || undefined,
  address: values.address || undefined,
  latitude: values.latitude,
  longitude: values.longitude,
  durationMinutes: values.durationMinutes,
  tags: values.tags
    ? values.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [],
  imageUrl: values.imageUrl || undefined,
  bookingUrl: values.bookingUrl || undefined,
  rating: values.rating,
  reviewCount: values.reviewCount,
  popularityScore: values.popularityScore,
  isActive: values.isActive,
  isAiRecommendable: values.isAiRecommendable,
})

interface ProductFormModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
}

export const ProductFormModal = ({ isOpen, onClose, product }: ProductFormModalProps) => {
  const { data: categories } = useCategories()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: emptyValues })

  useEffect(() => {
    if (!isOpen) return

    reset(
      product
        ? {
            name: product.name,
            description: product.description,
            categoryId: product.categoryId,
            price: product.price,
            currency: product.currency,
            city: product.city,
            district: product.district ?? '',
            address: product.address ?? '',
            latitude: product.latitude,
            longitude: product.longitude,
            durationMinutes: product.durationMinutes,
            tags: product.tags.join(', '),
            imageUrl: product.imageUrl ?? '',
            bookingUrl: product.bookingUrl ?? '',
            rating: product.rating,
            reviewCount: product.reviewCount,
            popularityScore: product.popularityScore,
            isActive: product.isActive,
            isAiRecommendable: product.isAiRecommendable,
          }
        : emptyValues,
    )
  }, [isOpen, product, reset])

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (product) {
        await updateProduct.mutateAsync({ id: product.id, payload: toPayload(values) })
        toast.success('Ürün güncellendi')
      } else {
        await createProduct.mutateAsync(toPayload(values))
        toast.success('Ürün oluşturuldu')
      }
      onClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Ürün kaydedilemedi'))
    }
  })

  const isSaving = createProduct.isPending || updateProduct.isPending

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={product ? 'Ürünü düzenle' : 'Yeni ürün'}
      description="Viofun bilet ve aktivite bilgilerini yönetin."
      footer={
        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={onClose}>
            Vazgeç
          </Button>
          <Button fullWidth isLoading={isSaving} onClick={onSubmit}>
            {product ? 'Güncelle' : 'Oluştur'}
          </Button>
        </div>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field label="Ürün adı" htmlFor="name" error={errors.name?.message} required>
          <Input id="name" hasError={Boolean(errors.name)} {...register('name')} />
        </Field>

        <Field label="Açıklama" htmlFor="description" error={errors.description?.message} required>
          <Textarea id="description" rows={4} hasError={Boolean(errors.description)} {...register('description')} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kategori" htmlFor="categoryId" error={errors.categoryId?.message} required>
            <Select id="categoryId" hasError={Boolean(errors.categoryId)} {...register('categoryId')}>
              <option value="">Seçiniz</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid grid-cols-[1fr_100px] gap-3">
            <Field label="Fiyat" htmlFor="price" error={errors.price?.message} required>
              <Input id="price" type="number" step="0.01" min={0} {...register('price', { valueAsNumber: true })} />
            </Field>
            <Field label="Birim" htmlFor="currency">
              <Select id="currency" {...register('currency')}>
                <option value="TRY">TRY</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </Select>
            </Field>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Şehir" htmlFor="city" error={errors.city?.message} required>
            <Input id="city" hasError={Boolean(errors.city)} {...register('city')} />
          </Field>
          <Field label="İlçe" htmlFor="district">
            <Input id="district" {...register('district')} />
          </Field>
        </div>

        <Field label="Adres" htmlFor="address">
          <Input id="address" {...register('address')} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Enlem" htmlFor="latitude" error={errors.latitude?.message} required>
            <Input id="latitude" type="number" step="any" {...register('latitude', { valueAsNumber: true })} />
          </Field>
          <Field label="Boylam" htmlFor="longitude" error={errors.longitude?.message} required>
            <Input id="longitude" type="number" step="any" {...register('longitude', { valueAsNumber: true })} />
          </Field>
          <Field label="Süre (dk)" htmlFor="durationMinutes" error={errors.durationMinutes?.message}>
            <Input id="durationMinutes" type="number" min={5} max={1440} {...register('durationMinutes', { valueAsNumber: true })} />
          </Field>
        </div>

        <Field label="Etiketler" htmlFor="tags" hint="Virgülle ayırın: tarih, manzara, aile">
          <Input id="tags" {...register('tags')} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Görsel URL" htmlFor="imageUrl" error={errors.imageUrl?.message}>
            <Input id="imageUrl" placeholder="https://…" {...register('imageUrl')} />
          </Field>
          <Field label="Bilet URL" htmlFor="bookingUrl" error={errors.bookingUrl?.message}>
            <Input id="bookingUrl" placeholder="https://viofun.com/…" {...register('bookingUrl')} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Puan" htmlFor="rating" error={errors.rating?.message}>
            <Input id="rating" type="number" step="0.1" min={0} max={5} {...register('rating', { valueAsNumber: true })} />
          </Field>
          <Field label="Değerlendirme" htmlFor="reviewCount">
            <Input id="reviewCount" type="number" min={0} {...register('reviewCount', { valueAsNumber: true })} />
          </Field>
          <Field label="Popülerlik (0-100)" htmlFor="popularityScore">
            <Input id="popularityScore" type="number" min={0} max={100} {...register('popularityScore', { valueAsNumber: true })} />
          </Field>
        </div>

        <div className="grid gap-3 rounded-2xl bg-ink-50 p-4 sm:grid-cols-2">
          <label className="flex items-center justify-between gap-3 text-sm font-semibold text-ink-700">
            Satışta (aktif)
            <Switch
              checked={watch('isActive')}
              onChange={(checked) => setValue('isActive', checked)}
              label="Satışta"
            />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm font-semibold text-ink-700">
            AI önerebilir
            <Switch
              checked={watch('isAiRecommendable')}
              onChange={(checked) => setValue('isAiRecommendable', checked)}
              label="AI önerebilir"
            />
          </label>
        </div>
      </form>
    </Modal>
  )
}
