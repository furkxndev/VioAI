import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button, Field, Input, Modal, Switch, Textarea } from '@/components/ui'
import { useCreateCategory, useUpdateCategory } from '@/hooks/use-categories'
import { getApiErrorMessage } from '@/lib/api-client'
import type { Category } from '@/types'

const schema = z.object({
  name: z.string().min(2, 'En az 2 karakter').max(120),
  slug: z.string().max(140).optional(),
  description: z.string().max(1000).optional(),
  icon: z.string().max(60).optional(),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Hex renk kodu giriniz')
    .or(z.literal(''))
    .optional(),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof schema>

const emptyValues: FormValues = {
  name: '',
  slug: '',
  description: '',
  icon: '',
  color: '',
  sortOrder: 0,
  isActive: true,
}

interface CategoryFormModalProps {
  isOpen: boolean
  onClose: () => void
  category: Category | null
}

export const CategoryFormModal = ({ isOpen, onClose, category }: CategoryFormModalProps) => {
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()

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
      category
        ? {
            name: category.name,
            slug: category.slug,
            description: category.description ?? '',
            icon: category.icon ?? '',
            color: category.color ?? '',
            sortOrder: category.sortOrder,
            isActive: category.isActive,
          }
        : emptyValues,
    )
  }, [isOpen, category, reset])

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      slug: values.slug || undefined,
      description: values.description || undefined,
      icon: values.icon || undefined,
      color: values.color || undefined,
      sortOrder: values.sortOrder,
      isActive: values.isActive,
    }

    try {
      if (category) {
        await updateCategory.mutateAsync({ id: category.id, payload })
        toast.success('Kategori güncellendi')
      } else {
        await createCategory.mutateAsync(payload)
        toast.success('Kategori oluşturuldu')
      }
      onClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Kategori kaydedilemedi'))
    }
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? 'Kategoriyi düzenle' : 'Yeni kategori'}
      footer={
        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={onClose}>
            Vazgeç
          </Button>
          <Button
            fullWidth
            isLoading={createCategory.isPending || updateCategory.isPending}
            onClick={onSubmit}
          >
            {category ? 'Güncelle' : 'Oluştur'}
          </Button>
        </div>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field label="Ad" htmlFor="name" error={errors.name?.message} required>
          <Input id="name" hasError={Boolean(errors.name)} {...register('name')} />
        </Field>

        <Field label="Kısa ad (slug)" htmlFor="slug" hint="Boş bırakılırsa isimden üretilir">
          <Input id="slug" {...register('slug')} />
        </Field>

        <Field label="Açıklama" htmlFor="description">
          <Textarea id="description" rows={3} {...register('description')} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="İkon" htmlFor="icon" hint="lucide adı">
            <Input id="icon" placeholder="landmark" {...register('icon')} />
          </Field>
          <Field label="Renk" htmlFor="color" error={errors.color?.message}>
            <Input id="color" placeholder="#7C3AED" {...register('color')} />
          </Field>
          <Field label="Sıra" htmlFor="sortOrder">
            <Input id="sortOrder" type="number" min={0} {...register('sortOrder', { valueAsNumber: true })} />
          </Field>
        </div>

        <label className="flex items-center justify-between gap-3 rounded-2xl bg-ink-50 p-4 text-sm font-semibold text-ink-700">
          Aktif
          <Switch checked={watch('isActive')} onChange={(checked) => setValue('isActive', checked)} label="Aktif" />
        </label>
      </form>
    </Modal>
  )
}
