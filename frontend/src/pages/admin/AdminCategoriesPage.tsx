import { useState } from 'react'
import { FolderTree, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout'
import { Badge, Button, Card, CardBody, EmptyState, ErrorState, SkeletonList } from '@/components/ui'
import { CategoryFormModal, ConfirmDialog } from '@/components/admin'
import { useCategories, useDeleteCategory } from '@/hooks/use-categories'
import { getApiErrorMessage } from '@/lib/api-client'
import type { Category } from '@/types'

export const AdminCategoriesPage = () => {
  const { data, isPending, isError, error, refetch } = useCategories()
  const deleteCategory = useDeleteCategory()
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)

  const openCreate = () => {
    setEditingCategory(null)
    setIsFormOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingCategory) return

    try {
      await deleteCategory.mutateAsync(deletingCategory.id)
      toast.success('Kategori silindi')
      setDeletingCategory(null)
    } catch (mutationError) {
      toast.error(getApiErrorMessage(mutationError, 'Kategori silinemedi'))
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Yönetim"
        title="Kategoriler"
        description="Ürünlerin gruplandığı kategorileri yönetin."
        action={
          <Button leftIcon={<Plus className="size-4" />} onClick={openCreate}>
            Yeni kategori
          </Button>
        }
      />

      {isPending && <SkeletonList count={4} />}
      {isError && <ErrorState error={error} onRetry={() => void refetch()} />}

      {data && data.length === 0 && (
        <EmptyState
          icon={<FolderTree className="size-6" />}
          title="Henüz kategori yok"
          description="İlk kategoriyi oluşturarak ürünlerinizi gruplandırmaya başlayın."
          action={<Button onClick={openCreate}>Kategori oluştur</Button>}
        />
      )}

      {data && data.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((category) => (
            <Card key={category.id}>
              <CardBody>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-3 shrink-0 rounded-full"
                        style={{ backgroundColor: category.color ?? '#C2C2D4' }}
                        aria-hidden
                      />
                      <h3 className="truncate text-base font-bold text-ink-900">{category.name}</h3>
                    </div>
                    <p className="mt-0.5 text-xs text-ink-400">/{category.slug}</p>
                  </div>
                  <Badge tone={category.isActive ? 'success' : 'neutral'}>
                    {category.isActive ? 'Aktif' : 'Pasif'}
                  </Badge>
                </div>

                {category.description && (
                  <p className="mt-3 line-clamp-2 text-sm text-ink-500">{category.description}</p>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3">
                  <span className="text-xs text-ink-400">Sıra: {category.sortOrder}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Düzenle"
                      onClick={() => {
                        setEditingCategory(category)
                        setIsFormOpen(true)
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Sil"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => setDeletingCategory(category)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <CategoryFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        category={editingCategory}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingCategory)}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDelete}
        isLoading={deleteCategory.isPending}
        title="Kategoriyi sil"
        message={`"${deletingCategory?.name ?? ''}" silinecek. Bu kategoriye bağlı ürün varsa işlem reddedilir.`}
      />
    </>
  )
}
