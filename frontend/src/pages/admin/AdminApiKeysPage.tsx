import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Ban, Copy, KeyRound, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout'
import {
  Badge,
  Button,
  Card,
  CardBody,
  Chip,
  EmptyState,
  ErrorState,
  Field,
  Input,
  Modal,
  SkeletonList,
  Textarea,
} from '@/components/ui'
import { ConfirmDialog } from '@/components/admin'
import { useApiKeys, useCreateApiKey, useDeleteApiKey, useRevokeApiKey } from '@/hooks/use-admin'
import { getApiErrorMessage } from '@/lib/api-client'
import { formatDateTime } from '@/utils/format'
import { ApiKeyScope, type ApiKey } from '@/types'

const scopeLabels: Record<ApiKeyScope, string> = {
  [ApiKeyScope.PRODUCTS_READ]: 'Ürünleri oku',
  [ApiKeyScope.PRODUCTS_WRITE]: 'Ürünleri yönet',
  [ApiKeyScope.CATEGORIES_READ]: 'Kategorileri oku',
  [ApiKeyScope.ROUTES_READ]: 'Rotaları oku',
  [ApiKeyScope.ROUTES_GENERATE]: 'Rota üret',
  [ApiKeyScope.AI_SUGGEST]: 'AI önerileri',
}

const schema = z.object({
  name: z.string().min(3, 'En az 3 karakter').max(120),
  description: z.string().max(500).optional(),
  scopes: z.array(z.nativeEnum(ApiKeyScope)).min(1, 'En az bir yetki seçiniz'),
  expiresAt: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export const AdminApiKeysPage = () => {
  const { data, isPending, isError, error, refetch } = useApiKeys()
  const createApiKey = useCreateApiKey()
  const revokeApiKey = useRevokeApiKey()
  const deleteApiKey = useDeleteApiKey()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [plainKey, setPlainKey] = useState<string | null>(null)
  const [deletingKey, setDeletingKey] = useState<ApiKey | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', scopes: [ApiKeyScope.PRODUCTS_READ], expiresAt: '' },
  })

  const selectedScopes = watch('scopes')

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await createApiKey.mutateAsync({
        name: values.name,
        description: values.description || undefined,
        scopes: values.scopes,
        expiresAt: values.expiresAt ? new Date(values.expiresAt).toISOString() : undefined,
      })
      setIsFormOpen(false)
      setPlainKey(result.plainKey)
      reset()
      toast.success('API anahtarı oluşturuldu')
    } catch (submitError) {
      toast.error(getApiErrorMessage(submitError, 'Anahtar oluşturulamadı'))
    }
  })

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      toast.success('Panoya kopyalandı')
    } catch {
      toast.error('Kopyalanamadı, anahtarı elle seçin')
    }
  }

  const handleRevoke = async (apiKey: ApiKey) => {
    try {
      await revokeApiKey.mutateAsync(apiKey.id)
      toast.success('Anahtar devre dışı bırakıldı')
    } catch (mutationError) {
      toast.error(getApiErrorMessage(mutationError, 'İşlem başarısız'))
    }
  }

  const handleDelete = async () => {
    if (!deletingKey) return

    try {
      await deleteApiKey.mutateAsync(deletingKey.id)
      toast.success('Anahtar silindi')
      setDeletingKey(null)
    } catch (mutationError) {
      toast.error(getApiErrorMessage(mutationError, 'Anahtar silinemedi'))
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Yönetim"
        title="API anahtarları"
        description="Harici uygulamaların VioAI API'sine kontrollü erişimini yönetin."
        action={
          <Button leftIcon={<Plus className="size-4" />} onClick={() => setIsFormOpen(true)}>
            Yeni anahtar
          </Button>
        }
      />

      {isPending && <SkeletonList count={3} />}
      {isError && <ErrorState error={error} onRetry={() => void refetch()} />}

      {data && data.length === 0 && (
        <EmptyState
          icon={<KeyRound className="size-6" />}
          title="Henüz API anahtarı yok"
          description="Harici bir uygulamanın API'ye erişmesi için anahtar oluşturun."
          action={<Button onClick={() => setIsFormOpen(true)}>Anahtar oluştur</Button>}
        />
      )}

      {data && data.length > 0 && (
        <div className="space-y-3">
          {data.map((apiKey) => (
            <Card key={apiKey.id}>
              <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-ink-900">{apiKey.name}</h3>
                    <Badge tone={apiKey.isActive ? 'success' : 'danger'}>
                      {apiKey.isActive ? 'Aktif' : 'Devre dışı'}
                    </Badge>
                  </div>

                  {apiKey.description && <p className="mt-1 text-sm text-ink-500">{apiKey.description}</p>}

                  <code className="mt-2 inline-block rounded-lg bg-ink-100 px-2.5 py-1 font-mono text-xs text-ink-700">
                    {apiKey.keyPrefix}.••••••••
                  </code>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {apiKey.scopes.map((scope) => (
                      <Badge key={scope} tone="brand">
                        {scopeLabels[scope] ?? scope}
                      </Badge>
                    ))}
                  </div>

                  <p className="mt-3 text-xs text-ink-400">
                    Oluşturma: {formatDateTime(apiKey.createdAt)} · Son kullanım:{' '}
                    {formatDateTime(apiKey.lastUsedAt)}
                    {apiKey.expiresAt ? ` · Bitiş: ${formatDateTime(apiKey.expiresAt)}` : ''}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  {apiKey.isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Ban className="size-3.5" />}
                      isLoading={revokeApiKey.isPending}
                      onClick={() => handleRevoke(apiKey)}
                    >
                      Devre dışı bırak
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Sil"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => setDeletingKey(apiKey)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Yeni API anahtarı"
        description="Anahtar yalnızca bir kez gösterilir."
        footer={
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setIsFormOpen(false)}>
              Vazgeç
            </Button>
            <Button fullWidth isLoading={createApiKey.isPending} onClick={onSubmit}>
              Oluştur
            </Button>
          </div>
        }
      >
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Field label="Uygulama adı" htmlFor="name" error={errors.name?.message} required>
            <Input id="name" placeholder="Viofun Mobil" hasError={Boolean(errors.name)} {...register('name')} />
          </Field>

          <Field label="Açıklama" htmlFor="description">
            <Textarea id="description" rows={2} {...register('description')} />
          </Field>

          <Field label="Yetkiler" error={errors.scopes?.message} required>
            <div className="flex flex-wrap gap-2">
              {Object.values(ApiKeyScope).map((scope) => {
                const selected = selectedScopes.includes(scope)

                return (
                  <Chip
                    key={scope}
                    selected={selected}
                    onClick={() =>
                      setValue(
                        'scopes',
                        selected
                          ? selectedScopes.filter((item) => item !== scope)
                          : [...selectedScopes, scope],
                        { shouldValidate: true },
                      )
                    }
                  >
                    {scopeLabels[scope]}
                  </Chip>
                )
              })}
            </div>
          </Field>

          <Field label="Bitiş tarihi" htmlFor="expiresAt" hint="Boş bırakılırsa süresiz">
            <Input id="expiresAt" type="date" {...register('expiresAt')} />
          </Field>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(plainKey)}
        onClose={() => setPlainKey(null)}
        title="API anahtarınız hazır"
        description="Bu anahtarı şimdi kopyalayın; tekrar gösterilmeyecek."
        size="sm"
        footer={
          <Button fullWidth onClick={() => setPlainKey(null)}>
            Kaydettim
          </Button>
        }
      >
        <div className="flex items-center gap-2 rounded-xl border border-ink-200 bg-ink-50 p-3">
          <code className="min-w-0 flex-1 font-mono text-xs break-all text-ink-800">{plainKey}</code>
          <Button
            variant="outline"
            size="icon"
            aria-label="Kopyala"
            onClick={() => plainKey && handleCopy(plainKey)}
          >
            <Copy className="size-4" />
          </Button>
        </div>
        <p className="mt-3 text-xs text-ink-500">
          İsteklerinizde <code className="font-mono">x-api-key</code> başlığı ile gönderin.
        </p>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deletingKey)}
        onClose={() => setDeletingKey(null)}
        onConfirm={handleDelete}
        isLoading={deleteApiKey.isPending}
        title="Anahtarı sil"
        message={`"${deletingKey?.name ?? ''}" anahtarı kalıcı olarak silinecek ve bu anahtarı kullanan uygulamalar erişimini kaybedecek.`}
      />
    </>
  )
}
