import { useMemo, useState } from 'react'
import { Pencil, Plus, Search, Sparkles, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout'
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Input,
  Pagination,
  Select,
  SkeletonList,
  Switch,
} from '@/components/ui'
import { ConfirmDialog, ProductFormModal } from '@/components/admin'
import { useCategories } from '@/hooks/use-categories'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useDeleteProduct, useProducts, useToggleProductAi } from '@/hooks/use-products'
import { getApiErrorMessage } from '@/lib/api-client'
import { formatCurrency } from '@/utils/format'
import type { Product, ProductQuery } from '@/types'

export const AdminProductsPage = () => {
  const [query, setQuery] = useState<ProductQuery>({ page: 1, limit: 12 })
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

  const debouncedSearch = useDebouncedValue(query.search ?? '', 400)
  const effectiveQuery = useMemo<ProductQuery>(
    () => ({ ...query, search: debouncedSearch || undefined }),
    [query, debouncedSearch],
  )

  const { data, isPending, isError, error, refetch } = useProducts(effectiveQuery)
  const { data: categories } = useCategories()
  const toggleAi = useToggleProductAi()
  const deleteProduct = useDeleteProduct()

  const openCreate = () => {
    setEditingProduct(null)
    setIsFormOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditingProduct(product)
    setIsFormOpen(true)
  }

  const handleToggleAi = async (product: Product) => {
    try {
      await toggleAi.mutateAsync({ id: product.id, isAiRecommendable: !product.isAiRecommendable })
    } catch (mutationError) {
      toast.error(getApiErrorMessage(mutationError, 'Güncellenemedi'))
    }
  }

  const handleDelete = async () => {
    if (!deletingProduct) return

    try {
      await deleteProduct.mutateAsync(deletingProduct.id)
      toast.success('Ürün silindi')
      setDeletingProduct(null)
    } catch (mutationError) {
      toast.error(getApiErrorMessage(mutationError, 'Ürün silinemedi'))
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Yönetim"
        title="Ürünler"
        description="Viofun bilet ve aktivitelerini yönetin, AI önerilebilirliğini belirleyin."
        action={
          <Button leftIcon={<Plus className="size-4" />} onClick={openCreate}>
            Yeni ürün
          </Button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_200px]">
        <Input
          value={query.search ?? ''}
          onChange={(event) => setQuery((current) => ({ ...current, search: event.target.value, page: 1 }))}
          placeholder="Ürün ara…"
          leftIcon={<Search className="size-4" />}
          aria-label="Ürün ara"
        />
        <Select
          value={query.categoryId ?? ''}
          onChange={(event) =>
            setQuery((current) => ({ ...current, categoryId: event.target.value || undefined, page: 1 }))
          }
          aria-label="Kategori filtresi"
        >
          <option value="">Tüm kategoriler</option>
          {categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </div>

      {isPending && <SkeletonList count={5} />}
      {isError && <ErrorState error={error} onRetry={() => void refetch()} />}

      {data && data.items.length === 0 && (
        <EmptyState
          icon={<Plus className="size-6" />}
          title="Ürün bulunamadı"
          description="Filtreleri değiştirin veya yeni bir ürün ekleyin."
          action={<Button onClick={openCreate}>Yeni ürün</Button>}
        />
      )}

      {data && data.items.length > 0 && (
        <>
          <div className="surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr className="border-b border-ink-100 bg-ink-50/60 text-left text-xs font-bold tracking-wide text-ink-500 uppercase">
                    <th className="px-4 py-3">Ürün</th>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3">Şehir</th>
                    <th className="px-4 py-3">Fiyat</th>
                    <th className="px-4 py-3">Durum</th>
                    <th className="px-4 py-3">AI</th>
                    <th className="px-4 py-3 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((product) => (
                    <tr key={product.id} className="border-b border-ink-100 last:border-0 hover:bg-ink-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="size-10 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                            {product.imageUrl && (
                              <img
                                src={product.imageUrl}
                                alt=""
                                loading="lazy"
                                className="size-full object-cover"
                              />
                            )}
                          </span>
                          <span className="line-clamp-2 max-w-56 font-semibold text-ink-900">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-500">{product.category?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-ink-500">{product.city}</td>
                      <td className="px-4 py-3 font-semibold text-ink-800">
                        {formatCurrency(product.price, product.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={product.isActive ? 'success' : 'danger'}>
                          {product.isActive ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={product.isAiRecommendable}
                            onChange={() => handleToggleAi(product)}
                            disabled={toggleAi.isPending}
                            label="AI önerebilir"
                          />
                          {product.isAiRecommendable && <Sparkles className="size-3.5 text-brand-500" />}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Düzenle"
                            onClick={() => openEdit(product)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Sil"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => setDeletingProduct(product)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            className="mt-6"
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            onPageChange={(page) => setQuery((current) => ({ ...current, page }))}
          />
        </>
      )}

      <ProductFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} product={editingProduct} />

      <ConfirmDialog
        isOpen={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDelete}
        isLoading={deleteProduct.isPending}
        title="Ürünü sil"
        message={`"${deletingProduct?.name ?? ''}" kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
      />
    </>
  )
}
